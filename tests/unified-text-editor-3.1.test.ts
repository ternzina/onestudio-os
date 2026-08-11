import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { SITE_EDITOR_FONT_OPTIONS } from "../lib/public-site/site-editor-fonts.ts";
import { normalizeTypography, publicTypographyStyle } from "../lib/public-site/typography.ts";
import { NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "../lib/public-site/noir-premium-template-editor-adapter.ts";
import { createNoirPremiumTemplateSeed } from "../lib/public-site/noir-premium-template-seed.ts";
import { GLOSS_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "../lib/public-site/gloss-premium-template-editor-adapter.ts";
import { createGlossPremiumTemplateSeed } from "../lib/public-site/gloss-premium-template-seed.ts";
import { PREMIUM_KIDS_BLOCK_REGISTRY } from "../lib/public-site/premium-kids-content.ts";
import { VELORA_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "../lib/public-site/velora-premium-template-editor-adapter.ts";
import { createVeloraPremiumTemplateSeed } from "../lib/public-site/velora-premium-template-seed.ts";
import type { EditorInspectorPlacedField } from "../lib/public-site/editor-spec.ts";
import type { PublicSiteContent } from "../lib/public-site/types.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");
const textField = (fields: readonly EditorInspectorPlacedField[], id: string) => {
  const field = fields.find(item => item.id === id);
  assert.ok(field && (field.type === "text" || field.type === "textarea" || field.type === "richText"), `${id} must use the shared text contract`);
  return field;
};

test("rich text and headings use one twenty-font allow-list", async () => {
  assert.equal(SITE_EDITOR_FONT_OPTIONS.length, 20);
  assert.equal(new Set(SITE_EDITOR_FONT_OPTIONS.map(option => option.value)).size, 20);
  const [rich, heading] = await Promise.all([
    read("../components/admin/RichTextEditor.tsx"),
    read("../components/admin/TypographyControls.tsx"),
  ]);
  assert.match(rich, /SITE_EDITOR_FONT_OPTIONS/);
  assert.match(heading, /SITE_EDITOR_FONT_OPTIONS/);
  assert.deepEqual(normalizeTypography({ font_family: "Brush Script MT" }), { font_family: "Brush Script MT" });
  assert.equal(publicTypographyStyle({ font_family: "Georgia" }).fontFamily, 'Georgia, "Times New Roman", serif');
  assert.deepEqual(normalizeTypography({ font_family: "url(javascript:bad)" as never }), {});
});

test("the shared inspector owns demo and manually assembled text UI", async () => {
  const [spec, inspector, universal, bembi] = await Promise.all([
    read("../lib/public-site/editor-spec.ts"),
    read("../components/admin/SharedEditorInspector.tsx"),
    read("../components/admin/PremiumUniversalBlockSettings.tsx"),
    read("../components/admin/PremiumTemplateEditor.tsx"),
  ]);
  assert.match(spec, /originalValue\?: string/);
  assert.match(inspector, /SiteEditorTextField/);
  assert.match(universal, /type: "richText"/);
  assert.match(bembi, /originalValue/);
});

test("GLOSS and every editable BEMBI native heading opt into the shared contract", () => {
  const glossFields = GLOSS_PREMIUM_TEMPLATE_EDITOR_ADAPTER.buildInspectorFields({
    content: createGlossPremiumTemplateSeed(),
    sectionId: "hero",
    disabled: false,
    onChange() {},
  });
  assert.ok(glossFields.some(field => field.type === "typography"));
  assert.equal(textField(glossFields, "gloss-hero-title").value, textField(glossFields, "gloss-hero-title").originalValue);

  const editableNative = PREMIUM_KIDS_BLOCK_REGISTRY.filter(definition =>
    ["intro", "approach", "schedule", "teachers", "gallery", "reviews", "faq", "programs", "final"].includes(definition.type),
  );
  assert.equal(editableNative.length, 9);
  assert.ok(editableNative.every(definition => definition.capabilities.typography));
});

test("NOIR restores one demo text and stores sparse native heading typography", () => {
  const seed = createNoirPremiumTemplateSeed();
  let changed: PublicSiteContent | undefined;
  const fields = NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER.buildInspectorFields({
    content: seed,
    sectionId: "hero",
    disabled: false,
    onChange(next) { changed = next; },
  });
  const title = textField(fields, "hero-lines");
  assert.equal(title.value, title.originalValue);
  title.onChange("Новый\nзаголовок");
  assert.ok(changed);
  title.onChange(title.originalValue!);
  assert.equal(textField(NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER.buildInspectorFields({ content: changed!, sectionId: "hero", disabled: false, onChange() {} }), "hero-lines").value, title.originalValue);
  const typography = fields.find(field => field.type === "typography");
  assert.ok(typography && typography.type === "typography");
  typography.onChange({ font_family: "Impact", font_size: 72 });
  assert.ok(changed?.template_content?.["premium-studio"]);
});

test("VELORA demo fields expose originals and use the same heading typography field", () => {
  const fields = VELORA_PREMIUM_TEMPLATE_EDITOR_ADAPTER.buildInspectorFields({
    content: createVeloraPremiumTemplateSeed(),
    sectionId: "hero",
    disabled: false,
    onChange() {},
  });
  const title = textField(fields, "title");
  assert.equal(title.value, title.originalValue);
  assert.ok(fields.some(field => field.type === "typography"));
});
