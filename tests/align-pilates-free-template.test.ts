import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { PREMIUM_DEMOS } from "../lib/demo-catalog.ts";
import { createCanonicalAlignPilatesDemoSite } from "../lib/public-site/align-pilates-demo.ts";
import { ALIGN_PILATES_EDITOR_SPECS } from "../lib/public-site/align-pilates-editor-schema.ts";
import { resolveAlignPilatesContent } from "../lib/public-site/align-pilates-premium-template-content.ts";
import { ALIGN_PILATES_PREMIUM_TEMPLATE_CONTRACT } from "../lib/public-site/align-pilates-premium-template-contract.ts";
import { ALIGN_PILATES_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "../lib/public-site/align-pilates-premium-template-editor-adapter.ts";
import { ALIGN_PILATES_PREMIUM_TEMPLATE_RUNTIME_ADAPTER } from "../lib/public-site/align-pilates-premium-template-runtime-adapter.ts";
import { createAlignPilatesPremiumTemplateSeed } from "../lib/public-site/align-pilates-premium-template-seed.ts";
import { getPremiumTemplateCustomPageRuntime } from "../lib/public-site/premium-template-custom-page-runtime-registry.ts";
import { getPremiumTemplateEditorAdapter } from "../lib/public-site/premium-template-editor-registry.ts";
import { getPremiumTemplatePackage } from "../lib/public-site/premium-template-package-catalog.ts";
import { getPremiumTemplateDefinition } from "../lib/public-site/premium-template-registry.ts";
import { getPremiumTemplatePublicRuntime } from "../lib/public-site/premium-template-runtime-registry.ts";
import { getPremiumTemplateSeedFactory } from "../lib/public-site/premium-template-seed-registry.ts";
import { resolveCreationContract } from "../lib/public-site/template-creation.ts";
import { getCustomerTemplateChoices, getTemplateCatalogRecord, newSitePathForTemplate, TEMPLATE_CATALOG } from "../lib/public-site/template-catalog.ts";
import { createTemplateSeed } from "../lib/public-site/template-seeds.ts";

const key = "align-pilates-studio";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assets = ["hero.webp", "format-reformer-start.webp", "format-reformer-flow.webp", "format-mat.webp", "format-personal.webp", "trainer-elena.webp", "trainer-anna.webp", "trainer-olga.webp", "studio-1.webp", "studio-2.webp", "studio-3.webp", "studio-4.webp", "studio-5.webp", "map.webp"];

test("ALIGN is a visible, customer-creatable free template", () => {
  assert.equal(TEMPLATE_CATALOG.filter((item) => item.key === key).length, 1);
  const item = getTemplateCatalogRecord(key);
  assert.equal(item?.access, "free"); assert.equal(item?.tier, "standard"); assert.equal(item?.gallery.visible, true);
  assert.equal(item?.gallery.previewRoute, "/demos/align-pilates-studio"); assert.equal(item?.gallery.previewImage, "/templates/align-pilates/hero.webp");
  assert.equal(item?.capabilities.customerCreatable, true); assert.equal(getCustomerTemplateChoices().some((choice) => choice.key === key), true);
  assert.equal(PREMIUM_DEMOS.some((demo) => demo.slug === key), true); assert.equal(newSitePathForTemplate(key), `/new-site?template=${key}&mode=template`);
});

test("ALIGN resolves the canonical creation, editor and runtime chain", () => {
  const creation = resolveCreationContract({ creation_mode: "template", template_key: key, locales: ["ru", "en"] });
  assert.equal(creation.template_key, key); assert.equal(creation.seed.template_id, key); assert.equal(creation.localizedSeeds.en.template_id, key);
  assert.equal(createTemplateSeed(key).template_id, key); assert.equal(getPremiumTemplateSeedFactory(key), createAlignPilatesPremiumTemplateSeed);
  assert.equal(getPremiumTemplateDefinition(key), ALIGN_PILATES_PREMIUM_TEMPLATE_CONTRACT);
  assert.equal(getPremiumTemplateEditorAdapter(key)?.templateKey, ALIGN_PILATES_PREMIUM_TEMPLATE_EDITOR_ADAPTER.templateKey);
  assert.equal(getPremiumTemplatePublicRuntime(key)?.templateKey, ALIGN_PILATES_PREMIUM_TEMPLATE_RUNTIME_ADAPTER.templateKey);
  assert.equal(getPremiumTemplateCustomPageRuntime(key)?.templateKey, key);
});

test("ALIGN RU and EN share design and assets but have localized content", () => {
  const ru = createAlignPilatesPremiumTemplateSeed("ru"); const en = createAlignPilatesPremiumTemplateSeed("en");
  assert.notEqual(resolveAlignPilatesContent(ru).hero.title, resolveAlignPilatesContent(en).hero.title);
  assert.equal(resolveAlignPilatesContent(ru).hero.image, resolveAlignPilatesContent(en).hero.image);
  assert.deepEqual(createCanonicalAlignPilatesDemoSite("en").available_locales, ["ru", "en"]);
});

test("ALIGN native sections use shared media, action and typography controls", () => {
  const content = createAlignPilatesPremiumTemplateSeed("ru");
  const all = ALIGN_PILATES_PREMIUM_TEMPLATE_CONTRACT.nativeSections.flatMap(({ id }) => ALIGN_PILATES_PREMIUM_TEMPLATE_EDITOR_ADAPTER.buildInspectorFields({ content, sectionId: id, disabled: false, onChange: () => undefined, onChooseMedia: () => undefined }));
  assert.ok(all.some((field) => field.type === "media")); assert.ok(all.some((field) => field.type === "action")); assert.ok(all.some((field) => field.type === "richText")); assert.ok(all.some((field) => field.type === "typography"));
  for (const section of ["hero", "formats", "trainers", "studio", "contacts"] as const) assert.ok(ALIGN_PILATES_PREMIUM_TEMPLATE_EDITOR_ADAPTER.buildInspectorFields({ content, sectionId: section, disabled: false, onChange: () => undefined, onChooseMedia: () => undefined }).some((field) => field.type === "media"));
  assert.ok(ALIGN_PILATES_EDITOR_SPECS.hero.some((field) => field.path === "hero.image"));
});

test("ALIGN owns exactly its restored photographic WebP namespace", () => {
  const declared = getPremiumTemplatePackage(key)?.assets ?? [];
  assert.deepEqual(declared, assets.map((name) => `/templates/align-pilates/${name}`));
  for (const name of assets) { const path = resolve(root, "public/templates/align-pilates", name); assert.equal(existsSync(path), true, name); assert.equal(readFileSync(path).subarray(0, 4).toString(), "RIFF", name); }
});

test("ALIGN layout round trip retains canonical native tokens", () => {
  const seed = createAlignPilatesPremiumTemplateSeed("ru"); const expected = ALIGN_PILATES_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(({ id }) => `native:${key}:${id}`);
  assert.deepEqual(seed.layout_order, expected); assert.deepEqual(ALIGN_PILATES_PREMIUM_TEMPLATE_EDITOR_ADAPTER.normalizeLayout(seed.layout_order ?? [], []), expected);
});

test("ALIGN migration registers canonical identity without legacy demo slug", () => {
  const sql = readFileSync(resolve(root, "supabase/migrations/20260814180000_align_pilates_template_registry.sql"), "utf8");
  assert.match(sql, /'align-pilates-studio',[\s\S]*'align-pilates-studio',[\s\S]*true,[\s\S]*true/); assert.doesNotMatch(sql, /legacy_demo_slug/);
});
