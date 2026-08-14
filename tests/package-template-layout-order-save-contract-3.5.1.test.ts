import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { canonicalizePremiumTemplateLayoutForSave } from "../lib/public-site/premium-template-editor-adapter.ts";
import { getPremiumTemplateEditorAdapter } from "../lib/public-site/premium-template-editor-registry.ts";
import { createTemplateSeed } from "../lib/public-site/template-seeds.ts";

const PACKAGE_KEYS = [
  "gloss-nail-studio",
  "premium-studio",
  "velora-event-venue",
  "vow-films",
  "lumea-beauty",
] as const;

const STANDARD_TOKEN = /^section:(services|portfolio|booking|team|reviews|membership|gift|faq|safety|about|contact)$/;
const CUSTOM_TOKEN = /^custom:[A-Za-z0-9][A-Za-z0-9._-]{0,159}$/;
const NOIR_TOKEN = /^noir:(hero|manifest|light|services|portfolio|retouch|film|team|process|equipment|tour|reviews|faq|contact|footer)$/;
const NATIVE_TOKEN = /^native:([a-z][a-z0-9]*(?:-[a-z0-9]+)*):([a-z][a-z0-9]*(?:-[a-z0-9]+)*)$/;

function simulateServerNormalization(tokens: unknown, templateId: string) {
  if (!Array.isArray(tokens)) return [];
  const normalizedTemplate = templateId.trim().toLowerCase();
  return tokens.filter((token, index): token is string => {
    if (typeof token !== "string" || tokens.indexOf(token) !== index) return false;
    const native = NATIVE_TOKEN.exec(token);
    return STANDARD_TOKEN.test(token)
      || CUSTOM_TOKEN.test(token)
      || (normalizedTemplate === "premium-studio" && NOIR_TOKEN.test(token))
      || native?.[1] === normalizedTemplate;
  }).slice(0, 96);
}

test("every package seed has an exact canonical client/server round trip", () => {
  for (const key of PACKAGE_KEYS) {
    const seed = createTemplateSeed(key);
    const adapter = getPremiumTemplateEditorAdapter(key)!;
    const canonical = canonicalizePremiumTemplateLayoutForSave(seed, adapter).layout_order!;
    assert.deepEqual(simulateServerNormalization(canonical, key), canonical, key);
  }
});

test("canonical package layouts retain every registered native section", () => {
  const expectedCounts = new Map<string, number>([
    ["velora-event-venue", 17], ["vow-films", 13], ["lumea-beauty", 8],
  ]);
  for (const key of PACKAGE_KEYS) {
    const adapter = getPremiumTemplateEditorAdapter(key)!;
    const canonical = canonicalizePremiumTemplateLayoutForSave(createTemplateSeed(key), adapter).layout_order!;
    assert.equal(canonical.length, adapter.contract.nativeSections.length, key);
    if (expectedCounts.has(key)) assert.equal(canonical.length, expectedCounts.get(key), key);
  }
});

test("custom position, duplicates, foreign native tokens, and malformed tokens follow one contract", () => {
  const key = "vow-films";
  const adapter = getPremiumTemplateEditorAdapter(key)!;
  const seed = createTemplateSeed(key);
  const native = adapter.normalizeLayout(seed.layout_order ?? [], []);
  const raw = [native[0], native[1], "custom:kept", native[2], native[1], "native:lumea-beauty:hero", "native:vow-films:bad_id", "custom:bad:id"];
  const content = canonicalizePremiumTemplateLayoutForSave({
    ...seed,
    custom_blocks: [{ id: "kept", kind: "text", eyebrow: "", title: "Keep", text: "", items: "", button_label: "", button_url: "", tone: "light", is_visible: true }],
    layout_order: raw,
  }, adapter);
  const canonical = content.layout_order!;
  assert.equal(canonical.indexOf("custom:kept"), 2);
  assert.equal(canonical.filter((token) => token === native[1]).length, 1);
  assert.equal(canonical.some((token) => token.startsWith("native:lumea-beauty:")), false);
  assert.equal(canonical.includes("native:vow-films:bad_id"), false);
  assert.equal(canonical.includes("custom:bad:id"), false);
  assert.deepEqual(simulateServerNormalization(canonical, key), canonical);
});

test("future canonical template tokens require no save-code or SQL allowlist change", async () => {
  const future = ["native:aurora-wellness:hero", "custom:future-card", "native:aurora-wellness:footer"];
  assert.deepEqual(simulateServerNormalization(future, "aurora-wellness"), future);
  assert.deepEqual(simulateServerNormalization(future, "another-template"), ["custom:future-card"]);
  const [page, migration] = await Promise.all([
    readFile(new URL("../app/admin/site/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../supabase/migrations/20260814160000_package_template_layout_order_save_contract_3_5_1.sql", import.meta.url), "utf8"),
  ]);
  assert.match(page, /getPremiumTemplateEditorAdapter\(content\.template_id\)/);
  assert.doesNotMatch(page, /templateId === ["'](?:vow-films|velora-event-venue|lumea-beauty)["']/);
  assert.match(migration, /split_part\(item, ':', 2\).*lower\(trim\(coalesce\(p_template_id/s);
  assert.match(migration, /normalize_public_site_layout_order_v3[\s\S]*normalize_public_site_layout_order_v2\(p_value, p_template_id\)/);
});
