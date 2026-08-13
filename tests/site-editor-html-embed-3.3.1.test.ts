import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createPublicSiteCustomBlock } from "../lib/public-site/custom-block-registry.ts";
import { sanitizePublicSiteHtml, sanitizePublicSiteInlineStyle } from "../lib/public-site/safe-html.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("HTML / Embed starter is visible and safe inline styles survive", () => {
  const block = createPublicSiteCustomBlock("html_embed", "starter");
  assert.match(block.html_source ?? "", /Ваш HTML-блок/);
  const safe = sanitizePublicSiteHtml(block.html_source);
  assert.match(safe, /color: #222/);
  assert.match(safe, /font-size: 28px/);
  assert.match(safe, /padding: 24px/);
  assert.match(safe, /border-radius: 16px/);
});

test("HTML sanitizer keeps formatting and removes executable or escaping payloads", () => {
  const safe = sanitizePublicSiteHtml('<style>p{color:red}</style><script>alert(1)</script><div onclick="x" style="color: red; font-size: 24px; padding: 12px; border-radius: 8px; background-image: url(https://evil.test/x); position: fixed; z-index: 9; top: 0; width: expression(x); height: javascript:alert(1)"><a href="javascript:alert(1)">safe</a></div>');
  assert.match(safe, /color: red/);
  assert.match(safe, /font-size: 24px/);
  assert.match(safe, /padding: 12px/);
  assert.match(safe, /border-radius: 8px/);
  assert.doesNotMatch(safe, /<style|<script|onclick|url\s*\(|position|z-index|top:|expression|javascript:/i);
});

test("inline style bounds and dangerous CSS rules are deterministic", () => {
  assert.equal(sanitizePublicSiteInlineStyle("font-size: 120px"), "font-size: 120px");
  assert.equal(sanitizePublicSiteInlineStyle("font-size: 120.01px"), "");
  assert.equal(sanitizePublicSiteInlineStyle("font-size: 10rem; line-height: 10em"), "font-size: 10rem; line-height: 10em");
  assert.equal(sanitizePublicSiteInlineStyle("font-size: 10.01rem; line-height: 101em; width: 101vw"), "");
  for (const value of ["url(x)", "expression(x)", "javascript:x", "data:x", "@import x", "red !important", "red/*x*/", "behavior:url(x)", "-moz-binding:url(x)", "position:fixed", "fixed; position: fixed", "broken"]) {
    assert.equal(sanitizePublicSiteInlineStyle(`width: ${value}`), "", value);
  }
});

test("HTML sanitizer handles quoted, single-quoted, and unquoted styles and secure attributes", () => {
  const safe = sanitizePublicSiteHtml(`<div style="color:red" data-x="drop"><span style='font-size:120px'></span><span style=color:red></span><span style=url(javascript:x)></span><a href="javascript:alert(1)" onclick="x">bad</a><a href="https://example.com/path">safe</a></div>`);
  assert.match(safe, /style="color: red"/);
  assert.match(safe, /style="font-size: 120px"/);
  assert.equal(safe.match(/style="color: red"/g)?.length, 2);
  assert.doesNotMatch(safe, /url\(|javascript:|onclick|data-x/i);
  assert.match(safe, /href="https:\/\/example\.com\/path"/);
});

test("Standard preview and every public template path use PublicCustomBlock", async () => {
  const [editor, runtime, standard, custom, gloss, bembi, noir, velora, veloraPage] = await Promise.all([
    read("../app/admin/site/page.tsx"), read("../components/public/PublicCustomBlock.tsx"), read("../components/public/PublicBusinessSite.tsx"),
    read("../components/public/PublicCustomPage.tsx"), read("../components/public/GlossBusinessSite.tsx"), read("../app/demos/premium-kids-center/PremiumUniversalBlock.tsx"),
    read("../app/demos/premium-studio/PremiumStudioExperience.tsx"), read("../components/public/velora/VeloraSite.tsx"), read("../components/public/velora/VeloraCustomPage.tsx"),
  ]);
  assert.match(editor, /block\.kind === "spacer" \|\| block\.kind === "html_embed"[\s\S]*return <PublicCustomBlock block=\{block\}/);
  assert.match(runtime, /if \(block\.kind === "html_embed"\)/);
  for (const source of [standard, custom, gloss, bembi, noir, velora, veloraPage]) assert.match(source, /PublicCustomBlock/);
});

test("HTML inspectors early-return only dedicated fields", async () => {
  const [standard, premium] = await Promise.all([read("../app/admin/site/page.tsx"), read("../components/admin/PremiumUniversalBlockSettings.tsx")]);
  const standardHtml = standard.slice(standard.indexOf('if (block.kind === "html_embed") return <SharedEditorFieldList'), standard.indexOf('if (block.kind === "spacer") return <>'));
  const premiumHtml = premium.slice(premium.indexOf('if (block.kind === "html_embed") return ['), premium.indexOf('const visual ='));
  for (const source of [standardHtml, premiumHtml]) {
    assert.match(source, /html_source|html-source/); assert.match(source, /embed_url|embed-url/); assert.match(source, /embed_title|embed-title/); assert.match(source, /embed_height|embed-height/);
    assert.doesNotMatch(source, /background|text-color|accent|eyebrow|title-typography|richText|button-action|media-list|block-composition/);
  }
  assert.match(standardHtml, /Show block on site/);
});

test("pending persistence wrapper preserves safe styles and Spacer fields", async () => {
  const migration = await read("../supabase/migrations/20260813173000_site_editor_spacer_divider_3_3_1.sql");
  assert.match(migration, /sanitize_public_site_inline_style_3_3_1/);
  for (const value of ["color", "font-size", "padding", "border-radius", "normalize_public_site_custom_blocks_v331_base", "divider_thickness", "divider_color_mode", "divider_custom_color"]) assert.match(migration, new RegExp(value));
  for (const value of ["url\\s\*", "javascript", "position", "!important", "script\\|style\\|iframe"]) assert.match(migration, new RegExp(value, "i"));
});
