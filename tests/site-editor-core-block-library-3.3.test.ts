import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PUBLIC_SITE_CORE_BLOCK_LIBRARY, createPublicSiteCoreBlockPreset } from "../lib/public-site/core-block-library.ts";
import { boundedPublicEmbedHeight, PUBLIC_SITE_HTML_SOURCE_MAX_LENGTH, safePublicEmbedUrl, sanitizePublicSiteHtml } from "../lib/public-site/safe-html.ts";
import { translateAdminText } from "../lib/i18n/admin.ts";
import { clonePublicSiteCustomBlock } from "../lib/public-site/custom-block-registry.ts";

const required = ["about","services","team","pricing","contact","portfolio","gallery","reviews","faq","text","text-media","cards","video","cta","html-embed","spacer-divider"];

test("Core Block Library exposes every categorized RU/EN label and description", () => {
  assert.deepEqual(PUBLIC_SITE_CORE_BLOCK_LIBRARY.map(item => item.id), required);
  for (const item of PUBLIC_SITE_CORE_BLOCK_LIBRARY) {
    assert.ok(item.category && item.label && item.description);
    assert.equal(translateAdminText("en", item.label), item.label);
    assert.notEqual(translateAdminText("ru", item.label), item.label);
    assert.equal(translateAdminText("en", item.description), item.description);
    assert.notEqual(translateAdminText("ru", item.description), item.description);
  }
});

test("semantic presets create useful content on shared primitives", () => {
  const about = createPublicSiteCoreBlockPreset("about", "about-1");
  assert.equal(about.kind, "media_text"); assert.ok(about.text); assert.equal(about.media_url, undefined); assert.ok(about.title_typography === undefined);
  for (const id of ["services","team","reviews","faq","pricing","cards"] as const) assert.ok((createPublicSiteCoreBlockPreset(id, id).cards?.length ?? 0) >= 3);
  for (const id of ["portfolio","gallery"] as const) assert.deepEqual(createPublicSiteCoreBlockPreset(id, id).media_urls, []);
  const pricing = createPublicSiteCoreBlockPreset("pricing", "price"); assert.ok(pricing.button_label && pricing.button_url);
  const contact = createPublicSiteCoreBlockPreset("contact", "contact"); assert.ok(contact.text && contact.button_url);
  const cta = createPublicSiteCoreBlockPreset("cta", "cta"); assert.equal(cta.kind, "cta"); assert.ok(cta.button_label && cta.button_url);
  assert.equal(createPublicSiteCoreBlockPreset("text", "text").kind, "text");
  assert.equal(createPublicSiteCoreBlockPreset("text-media", "media").kind, "media_text");
  assert.equal(createPublicSiteCoreBlockPreset("video", "video").kind, "video");
  const spacer = createPublicSiteCoreBlockPreset("spacer-divider", "space"); assert.equal(spacer.kind, "spacer"); assert.equal(spacer.spacer_size, "normal");
});

test("safe HTML and embed contract strips executable content and bounds input", () => {
  const safe = sanitizePublicSiteHtml('<h2>Hello</h2><p><a href="https://example.com">Link</a></p>');
  assert.match(safe, /<h2>Hello<\/h2>/); assert.match(safe, /https:\/\/example.com/);
  const hostile = sanitizePublicSiteHtml('<script>alert(1)</script><img src="javascript:alert(1)" onerror="alert(2)"><form><input></form><svg onload="x"></svg>');
  assert.doesNotMatch(hostile, /<script|javascript:|onerror|<form|<svg/i);
  assert.ok(sanitizePublicSiteHtml("x".repeat(PUBLIC_SITE_HTML_SOURCE_MAX_LENGTH + 20)).length <= PUBLIC_SITE_HTML_SOURCE_MAX_LENGTH);
  assert.equal(safePublicEmbedUrl("javascript:alert(1)"), ""); assert.equal(safePublicEmbedUrl("http://example.com"), "");
  assert.match(safePublicEmbedUrl("https://example.com/widget"), /^https:/);
  assert.equal(boundedPublicEmbedHeight(1), 180); assert.equal(boundedPublicEmbedHeight(9999), 900);
});

test("presets remain serializable and compatible with shared lifecycle helpers", () => {
  const source = createPublicSiteCoreBlockPreset("team", "team-source");
  const copy = clonePublicSiteCustomBlock(source, "team-copy");
  assert.equal(copy.preset_id, "team"); assert.notEqual(copy.cards?.[0].id, source.cards?.[0].id);
  assert.deepEqual(JSON.parse(JSON.stringify(copy)), copy);
});

test("one shared inspector/runtime contract covers new advanced kinds and premium adapters", async () => {
  const [standard, premium, runtime, bembi, gloss, noir, velora, migration] = await Promise.all([
    readFile(new URL("../app/admin/site/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/admin/PremiumUniversalBlockSettings.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/public/PublicCustomBlock.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/public-site/premium-kids-content.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/public-site/gloss-premium-template-editor-adapter.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/public-site/noir-premium-template-editor-adapter.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/public-site/velora-premium-template-editor-adapter.ts", import.meta.url), "utf8"),
    readFile(new URL("../supabase/migrations/20260813160000_site_editor_core_block_library_3_3.sql", import.meta.url), "utf8"),
  ]);
  assert.match(standard, /SiteEditorActionField/); assert.match(standard, /TypographyControls/); assert.match(standard, /BlockCompositionEditor/); assert.match(standard, /SiteEditorMediaField/);
  assert.match(premium, /EditorInspectorPlacedField/); assert.match(runtime, /sanitizePublicSiteHtml/); assert.match(runtime, /sandbox=/);
  for (const adapter of [gloss,noir,velora]) assert.match(adapter, /custom_blocks/);
  assert.match(bembi, /html_embed/); assert.match(migration, /normalize_public_site_custom_blocks_v33_base/); assert.doesNotMatch(migration, /native_action_styles\s*:=/);
});
