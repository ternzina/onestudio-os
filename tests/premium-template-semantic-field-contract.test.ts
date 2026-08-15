import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "../lib/public-site/bloom-floral-studio-premium-template-editor-adapter.ts";
import { createBloomFloralStudioPremiumTemplateSeed } from "../lib/public-site/bloom-floral-studio-premium-template-seed.ts";
import { resolveBloomFloralStudioContent } from "../lib/public-site/bloom-floral-studio-premium-template-content.ts";
import { resolvePremiumTemplatePlainText } from "../lib/public-site/premium-template-field-contract.ts";
import { decodeRichText, encodeRichText, type RichTextDocument } from "../lib/public-site/rich-text.ts";
import type { PublicSiteContent } from "../lib/public-site/types.ts";

const documentValue = (text: string): RichTextDocument => ({
  version: 1,
  root: { type: "root", children: [{ type: "p", children: [{ type: "text", text }] }] },
});

function assertPublicText(value: string, text: string) {
  const output = resolvePremiumTemplatePlainText(value);
  assert.match(output, new RegExp(text));
  assert.doesNotMatch(output, /__osrt1__|"version":1|"root"/);
}

test("semantic contract accepts only supported rich-text storage representations", () => {
  const canonical = encodeRichText(documentValue("Canonical text"));
  const raw = JSON.stringify(documentValue("Raw v1 text"));
  const accidental = JSON.stringify(encodeRichText(documentValue("Once encoded text")));

  assertPublicText("Normal plain string", "Normal plain string");
  assertPublicText(canonical, "Canonical text");
  assertPublicText(raw, "Raw v1 text");
  assertPublicText(accidental, "Once encoded text");
  assert.equal(resolvePremiumTemplatePlainText(canonical), "Canonical text");

  for (const unsupported of ["{malformed", JSON.stringify({ version: 1, root: { type: "root", children: [{ type: "script", children: [] }] } }), JSON.stringify({ arbitrary: "json" })]) {
    assert.equal(decodeRichText(unsupported), null);
    assert.equal(resolvePremiumTemplatePlainText(unsupported), unsupported);
  }
});

test("editor callback persists canonical body and heading values through reload and public semantic output", async () => {
  let content = createBloomFloralStudioPremiumTemplateSeed();
  const fields = BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_EDITOR_ADAPTER.buildInspectorFields({
    content,
    sectionId: "hero",
    disabled: false,
    onChange: (next: PublicSiteContent) => { content = next; },
  });
  const body = fields.find((field) => field.id === "text");
  const heading = fields.find((field) => field.id === "title");
  assert.equal(body?.semantic, "richText");
  assert.equal(heading?.semantic, "heading");
  assert.equal(fields.find((field) => field.id === "image")?.semantic, "media");
  assert.equal(fields.find((field) => field.type === "action")?.semantic, "action");
  if (body?.type !== "richText" || heading?.type !== "textarea") throw new Error("Expected semantic text fields");

  body.onChange(encodeRichText(documentValue("Visible body copy")));
  const reloadedBody = JSON.parse(JSON.stringify(content));
  const headingAfterBody = BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_EDITOR_ADAPTER.buildInspectorFields({
    content: reloadedBody,
    sectionId: "hero",
    disabled: false,
    onChange: (next: PublicSiteContent) => { content = next; },
  }).find((field) => field.id === "title");
  if (headingAfterBody?.type !== "textarea") throw new Error("Expected heading field");
  headingAfterBody.onChange(encodeRichText(documentValue("Visible heading")));

  const resolved = resolveBloomFloralStudioContent(JSON.parse(JSON.stringify(content)));
  assertPublicText(resolved.hero.text, "Visible body copy");
  assertPublicText(resolved.hero.title, "Visible heading");

  const runtime = await readFile(new URL("../components/public/bloom-floral-studio/BloomFloralStudioSite.tsx", import.meta.url), "utf8");
  assert.match(runtime, /PublicRichText value=\{c\.hero\.text\}/);
  assert.match(runtime, /PublicRichHeading value=\{c\.hero\.title\}/);
});
