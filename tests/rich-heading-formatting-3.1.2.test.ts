import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
  encodeRichText,
  normalizeRichTextFontSize,
  richHeadingFontSizeScale,
  richTextPlainText,
} from "../lib/public-site/rich-text.ts";
import { NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "../lib/public-site/noir-premium-template-editor-adapter.ts";
import { createNoirPremiumTemplateSeed } from "../lib/public-site/noir-premium-template-seed.ts";
import type { EditorInspectorPlacedField } from "../lib/public-site/editor-spec.ts";
import type { PublicSiteContent } from "../lib/public-site/types.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

function headingField(fields: readonly EditorInspectorPlacedField[], id: string) {
  const field = fields.find((item) => item.id === id);
  assert.ok(field && (field.type === "text" || field.type === "textarea" || field.type === "richText"));
  return field;
}

const richHeading = encodeRichText({
  version: 1,
  root: {
    type: "root",
    children: [{
      type: "p",
      children: [
        { type: "text", text: "One" },
        { type: "span", color: "#9d3151", fontSize: 72, children: [{ type: "text", text: "S" }] },
        { type: "text", text: "tudio" },
      ],
    }],
  },
});

test("heading rich text keeps one-letter formatting and heading-scale sizes", () => {
  assert.equal(richTextPlainText(richHeading), "OneStudio");
  assert.equal(normalizeRichTextFontSize(72), 72);
  assert.equal(normalizeRichTextFontSize(160), 160);
  assert.equal(normalizeRichTextFontSize(161), undefined);
  assert.equal(richHeadingFontSizeScale(16), 1);
  assert.equal(richHeadingFontSizeScale(32), 2);
  assert.equal(richHeadingFontSizeScale(12), 0.75);
});

test("shared inspector upgrades every typography-paired title to the heading editor", async () => {
  const [inspector, field, editor] = await Promise.all([
    read("../components/admin/SharedEditorInspector.tsx"),
    read("../components/admin/SiteEditorTextField.tsx"),
    read("../components/admin/RichTextEditor.tsx"),
  ]);
  assert.match(inspector, /field\.type === "typography" && field\.forFieldId/);
  assert.match(inspector, /headingRichText=\{headingFieldIds\.has\(field\.id\)\}/);
  assert.match(field, /variant=\{headingRichText \? "heading" : "body"\}/);
  assert.match(editor, /contentEditable=\{!disabled\}/);
  assert.match(editor, /onMouseDown=\{saveSelection\}/);
  assert.match(editor, /HEADING_SIZE_OPTIONS/);
  assert.match(editor, /\{size\}px/);
  assert.doesNotMatch(editor, /Math\.round\(\(size \/ RICH_HEADING_FONT_SIZE_BASE_PX\) \* 100\)/);
});

test("NOIR array-backed hero title round-trips a rich document as one value", () => {
  const seed = createNoirPremiumTemplateSeed();
  let changed: PublicSiteContent | undefined;
  const fields = NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER.buildInspectorFields({
    content: seed,
    sectionId: "hero",
    disabled: false,
    onChange(next) { changed = next; },
  });
  headingField(fields, "hero-lines").onChange(richHeading);
  assert.ok(changed);
  const nextFields = NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER.buildInspectorFields({
    content: changed,
    sectionId: "hero",
    disabled: false,
    onChange() {},
  });
  assert.equal(headingField(nextFields, "hero-lines").value, richHeading);
});

test("public runtimes use the semantic rich-heading renderer while plain titles stay compatible", async () => {
  const renderer = await read("../components/public/PublicRichHeading.tsx");
  assert.match(renderer, /decodeRichText\(value\)/);
  assert.match(renderer, /normalizeRichTextColor/);
  assert.match(renderer, /normalizeRichTextFontFamily/);
  assert.match(renderer, /richHeadingFontSizeScale/);
  assert.match(renderer, /fontSize: `\$\{fontSizeScale \/ inheritedFontSizeScale\}em`/);
  assert.match(renderer, /renderNode\(child, `\$\{key\}-\$\{index\}`, fontSizeScale\)/);
  assert.match(renderer, /emphasizeAfterFirst/);
  assert.match(renderer, /italicizeLast/);
  assert.doesNotMatch(renderer, /dangerouslySetInnerHTML/);

  for (const path of [
    "../components/public/PublicBusinessSite.tsx",
    "../components/public/GlossBusinessSite.tsx",
    "../app/demos/premium-kids-center/PremiumMotion.tsx",
    "../app/demos/premium-studio/PremiumStudioExperience.tsx",
    "../components/public/velora/VeloraInteractions.tsx",
  ]) {
    assert.match(await read(path), /PublicRichHeading/);
  }
});

test("draft migration restores only bounded validated rich headings", async () => {
  const migration = await read("../supabase/migrations/20260812013000_site_editor_rich_heading_3_1_2.sql");
  assert.match(migration, /octet_length\(p_value\) > 16384/);
  assert.match(migration, /normalize_public_site_rich_heading/);
  assert.match(migration, /merge_public_site_rich_block_titles/);
  assert.match(migration, /merge_public_site_rich_page_titles/);
  assert.match(migration, /save_public_site_draft_v_rich_heading_3_1_2/);
});
