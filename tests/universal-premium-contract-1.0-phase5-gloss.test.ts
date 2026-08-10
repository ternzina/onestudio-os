import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { canonicalGlossTokenToLegacy, LEGACY_GLOSS_NATIVE_LAYOUT_ORDER, legacyGlossTokenToCanonical, moveLegacyGlossCompositionItem, normalizeLegacyGlossComposition } from "../lib/public-site/gloss-premium-template-compat.ts";
import { GLOSS_PREMIUM_TEMPLATE_CONTRACT } from "../lib/public-site/gloss-premium-template-contract.ts";
import { GLOSS_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "../lib/public-site/gloss-premium-template-editor-adapter.ts";
import { getPremiumTemplateEditorAdapter } from "../lib/public-site/premium-template-editor-registry.ts";
import { validatePremiumTemplateContract } from "../lib/public-site/premium-template-contract.ts";
import { getPremiumTemplateDefinition, PREMIUM_TEMPLATE_DEFINITIONS } from "../lib/public-site/premium-template-registry.ts";
import { TEMPLATE_CATALOG } from "../lib/public-site/template-catalog.ts";
import { createTemplateSeed } from "../lib/public-site/template-seeds.ts";
import { GLOSS_TEMPLATE } from "../lib/public-site/templates.ts";
import type { PublicSiteCustomBlock } from "../lib/public-site/types.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");
const nativeIds = ["services", "portfolio", "team", "booking", "membership", "safety", "reviews", "gift", "faq", "about", "contact"];

test("GLOSS 1.0 contract preserves native identity, order, anchors and capabilities", () => {
  assert.equal(GLOSS_PREMIUM_TEMPLATE_CONTRACT.contractVersion, "1.0");
  assert.deepEqual(GLOSS_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(({ id }) => id), nativeIds);
  assert.deepEqual(GLOSS_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(({ anchor }) => anchor), nativeIds);
  assert.deepEqual(GLOSS_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(({ defaultOrder }) => defaultOrder), nativeIds.map((_, index) => index));
  assert.ok(GLOSS_PREMIUM_TEMPLATE_CONTRACT.nativeSections.every((section) => !("pinning" in section)), "GLOSS keeps its existing unpinned body order");
  assert.deepEqual(nativeIds, GLOSS_TEMPLATE.sectionOrder);
  assert.deepEqual(validatePremiumTemplateContract(GLOSS_PREMIUM_TEMPLATE_CONTRACT), []);
  assert.equal(GLOSS_PREMIUM_TEMPLATE_CONTRACT.customPages.supported, true);
});

test("canonical and existing legacy GLOSS layout identities normalize without persistence migration", () => {
  assert.equal(legacyGlossTokenToCanonical("section:membership"), "native:gloss-nail-studio:membership");
  assert.equal(legacyGlossTokenToCanonical("membership"), "native:gloss-nail-studio:membership");
  assert.equal(canonicalGlossTokenToLegacy("native:gloss-nail-studio:membership"), "section:membership");
  assert.equal(canonicalGlossTokenToLegacy("native:premium-studio:membership"), null);
  const normalized = normalizeLegacyGlossComposition(["section:team", "custom:kept", "membership", "section:team", "unknown"], ["kept", "added"]);
  assert.ok(normalized.every((token) => token.startsWith("section:") || token.startsWith("custom:")));
  assert.deepEqual(normalized.filter((token) => token.startsWith("section:")).sort(), [...LEGACY_GLOSS_NATIVE_LAYOUT_ORDER].sort());
  assert.ok(normalized.indexOf("custom:kept") < normalized.indexOf("section:membership"));
  assert.ok(normalized.includes("custom:added"));
});

test("custom blocks retain data and placement through the GLOSS adapter", () => {
  const old = createTemplateSeed("gloss-nail-studio");
  const block: PublicSiteCustomBlock = {
    id: "phase5", kind: "text", eyebrow: "", title: "Keep me", text: "Payload",
    items: "", button_label: "", button_url: "", tone: "light", is_visible: true,
  };
  const inserted = GLOSS_PREMIUM_TEMPLATE_EDITOR_ADAPTER.insertCustomBlock(old, block);
  assert.deepEqual(inserted.custom_blocks?.at(-1), block);
  assert.ok(inserted.layout_order?.includes("custom:phase5"));
  const fromIndex = inserted.layout_order!.indexOf("custom:phase5");
  const moved = moveLegacyGlossCompositionItem({ tokens: inserted.layout_order!, customBlockIds: ["phase5"], fromIndex, toIndex: 1 });
  assert.equal(moved[1], "custom:phase5");
  assert.deepEqual(inserted.custom_blocks?.at(-1), block);
});

test("old drafts stay compatible and GLOSS is registered exactly once", () => {
  const old = createTemplateSeed("gloss-nail-studio");
  assert.deepEqual(old.section_order, GLOSS_TEMPLATE.sectionOrder);
  assert.ok(old.layout_order?.every((token) => token.startsWith("section:") || token.startsWith("custom:")));
  assert.deepEqual(GLOSS_PREMIUM_TEMPLATE_EDITOR_ADAPTER.normalizeLayout(old.layout_order ?? [], []), old.layout_order);
  assert.equal(PREMIUM_TEMPLATE_DEFINITIONS.filter(({ templateKey }) => templateKey === "gloss-nail-studio").length, 1);
  assert.equal(getPremiumTemplateDefinition("gloss-nail-studio"), GLOSS_PREMIUM_TEMPLATE_CONTRACT);
  assert.equal(getPremiumTemplateEditorAdapter("gloss-nail-studio"), GLOSS_PREMIUM_TEMPLATE_EDITOR_ADAPTER);
  assert.equal(TEMPLATE_CATALOG.filter(({ key }) => key === "gloss-nail-studio").length, 1);
});

test("gallery, Preview, public home and custom pages resolve GLOSS through registries", async () => {
  const [homeRegistry, pageRegistry, homeRuntime, pageRuntime, demo] = await Promise.all([
    read("../lib/public-site/premium-template-runtime-registry.tsx"), read("../lib/public-site/premium-template-custom-page-runtime-registry.tsx"),
    read("../components/public/PublicSiteTemplateRuntime.tsx"), read("../components/public/PublicCustomPageRuntime.tsx"),
    read("../app/demos/gloss-nail-studio/[[...templatePath]]/page.tsx"),
  ]);
  assert.match(homeRegistry, /GLOSS_PREMIUM_TEMPLATE_RUNTIME_ADAPTER/);
  assert.match(pageRegistry, /GLOSS_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER/);
  assert.match(homeRuntime, /getPremiumTemplatePublicRuntime\(templateKey\)/);
  assert.match(pageRuntime, /getPremiumTemplateCustomPageRuntime\(templateKey\)/);
  assert.match(demo, /PublicSiteTemplateRuntime/);
  assert.equal(TEMPLATE_CATALOG.find(({ key }) => key === "gloss-nail-studio")?.gallery.previewRoute, "/demos/gloss-nail-studio");
});

test("generic orchestration contains no direct GLOSS renderer imports or branches", async () => {
  for (const path of ["../components/public/PublicSiteTemplateRuntime.tsx", "../components/public/PublicCustomPageRuntime.tsx", "../components/public/PublicCustomPage.tsx", "../app/admin/site/page.tsx"]) {
    const source = await read(path);
    assert.doesNotMatch(source, /templateKey\s*===\s*["'][^"']*gloss|template_id\s*===\s*["'][^"']*gloss|GlossBusinessSite/);
  }
});

test("NOIR still works, BEMBI stays separate, and unknown premium identities never become GLOSS", async () => {
  assert.equal(getPremiumTemplateDefinition("premium-studio")?.templateKey, "premium-studio");
  assert.equal(getPremiumTemplateEditorAdapter("premium-studio")?.templateKey, "premium-studio");
  assert.equal(getPremiumTemplateDefinition("premium-kids-center"), undefined);
  assert.equal(getPremiumTemplateDefinition("future-premium"), undefined);
  assert.equal(getPremiumTemplateEditorAdapter("future-premium"), undefined);
  const [homeRuntime, pageRuntime] = await Promise.all([read("../components/public/PublicSiteTemplateRuntime.tsx"), read("../components/public/PublicCustomPageRuntime.tsx")]);
  assert.match(homeRuntime, /templateKey === "premium-kids-center"/);
  assert.match(pageRuntime, /templateKey === "premium-kids-center"/);
  assert.doesNotMatch(homeRuntime, /future-premium|GlossBusinessSite/);
});
