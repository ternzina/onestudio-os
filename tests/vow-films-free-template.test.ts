import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { PREMIUM_DEMOS } from "../lib/demo-catalog.ts";
import { createCanonicalVowDemoSite } from "../lib/public-site/vow-demo.ts";
import { VOW_EDITOR_SPECS } from "../lib/public-site/vow-editor-schema.ts";
import { resolveVowContent } from "../lib/public-site/vow-premium-template-content.ts";
import { VOW_PREMIUM_TEMPLATE_CONTRACT } from "../lib/public-site/vow-premium-template-contract.ts";
import { VOW_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "../lib/public-site/vow-premium-template-editor-adapter.ts";
import { createVowPremiumTemplateSeed } from "../lib/public-site/vow-premium-template-seed.ts";
import { getPremiumTemplateCustomPageRuntime } from "../lib/public-site/premium-template-custom-page-runtime-registry.ts";
import { getPremiumTemplateEditorAdapter } from "../lib/public-site/premium-template-editor-registry.ts";
import { getPremiumTemplatePackage } from "../lib/public-site/premium-template-package-catalog.ts";
import { getPremiumTemplateDefinition } from "../lib/public-site/premium-template-registry.ts";
import { getPremiumTemplatePublicRuntime } from "../lib/public-site/premium-template-runtime-registry.ts";
import { VOW_PREMIUM_TEMPLATE_RUNTIME_ADAPTER } from "../lib/public-site/vow-premium-template-runtime-adapter.ts";
import { getPremiumTemplateSeedFactory } from "../lib/public-site/premium-template-seed-registry.ts";
import { resolveCreationContract } from "../lib/public-site/template-creation.ts";
import {
  getCustomerTemplateChoices,
  getTemplateCatalogRecord,
  newSitePathForTemplate,
  TEMPLATE_CATALOG,
} from "../lib/public-site/template-catalog.ts";
import { createTemplateSeed } from "../lib/public-site/template-seeds.ts";
import { PREMIUM_TEMPLATE_PACKAGE_SOURCE } from "../lib/public-site/premium-template-package-source.mjs";
import { renderPremiumTemplatePackageFiles } from "../scripts/premium-template-package-generator.mjs";

const key = "vow-films";
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const vowFiles = [
  "components/public/vow/Vow.module.css",
  "components/public/vow/VowSite.tsx",
  "components/public/vow/VowInteractions.tsx",
  "components/public/vow/VowCustomPage.tsx",
  "lib/public-site/vow-demo.ts",
  "lib/public-site/vow-editor-schema.ts",
  "lib/public-site/vow-premium-template-content.ts",
  "lib/public-site/vow-premium-template-contract.ts",
  "lib/public-site/vow-premium-template-editor-adapter.ts",
  "lib/public-site/vow-premium-template-runtime-adapter.ts",
  "lib/public-site/vow-premium-template-custom-page-runtime-adapter.ts",
  "lib/public-site/vow-premium-template-seed.ts",
] as const;

test("VOW is a visible, customer-creatable free catalog template", () => {
  assert.equal(TEMPLATE_CATALOG.filter((item) => item.key === key).length, 1);
  const vow = getTemplateCatalogRecord(key);
  assert.equal(vow?.access, "free");
  assert.equal(vow?.tier, "standard");
  assert.equal(vow?.gallery.visible, true);
  assert.equal(vow?.gallery.previewRoute, "/demos/vow-films");
  assert.equal(vow?.gallery.previewImage, "/images/demos/vow-films.webp");
  assert.equal(vow?.capabilities.customerCreatable, true);
  assert.equal(vow?.capabilities.editorSelectable, true);
  assert.equal(getCustomerTemplateChoices().some((item) => item.key === key), true);
  assert.equal(PREMIUM_DEMOS.some((item) => item.slug === key), true);
  assert.equal(newSitePathForTemplate(key), "/new-site?template=vow-films&mode=template");
});

test("VOW resolves the full real-site creation and runtime registry chain", () => {
  const creation = resolveCreationContract({
    creation_mode: "template",
    template_key: key,
    locales: ["ru", "en"],
  });
  assert.equal(creation.template_key, key);
  assert.equal(creation.seed.template_id, key);
  assert.equal(creation.localizedSeeds.ru.template_id, key);
  assert.equal(creation.localizedSeeds.en.template_id, key);
  assert.equal(createTemplateSeed(key).template_id, key);
  assert.equal(getPremiumTemplateSeedFactory(key), createVowPremiumTemplateSeed);
  assert.equal(getPremiumTemplateDefinition(key), VOW_PREMIUM_TEMPLATE_CONTRACT);
  assert.equal(
    getPremiumTemplateEditorAdapter(key)?.templateKey,
    VOW_PREMIUM_TEMPLATE_EDITOR_ADAPTER.templateKey,
  );
  assert.equal(getPremiumTemplateEditorAdapter(key)?.templateKey, VOW_PREMIUM_TEMPLATE_EDITOR_ADAPTER.templateKey);
  assert.equal(getPremiumTemplateEditorAdapter(key)?.restoreLabel, VOW_PREMIUM_TEMPLATE_EDITOR_ADAPTER.restoreLabel);
  assert.equal(getPremiumTemplatePublicRuntime(key)?.templateKey, VOW_PREMIUM_TEMPLATE_RUNTIME_ADAPTER.templateKey);
  assert.equal(getPremiumTemplateEditorAdapter("premium-kids-center"), undefined);
  assert.equal(getPremiumTemplatePublicRuntime("premium-kids-center"), undefined);
  assert.equal(getPremiumTemplateCustomPageRuntime(key)?.templateKey, key);
});

test("VOW has distinct RU and EN seeds, locales and custom pages", () => {
  const ru = createVowPremiumTemplateSeed("ru");
  const en = createVowPremiumTemplateSeed("en");
  assert.equal(ru.template_id, key);
  assert.equal(en.template_id, key);
  assert.notDeepEqual(ru.template_content?.[key], en.template_content?.[key]);
  assert.notEqual(resolveVowContent(ru).hero.title, resolveVowContent(en).hero.title);
  assert.deepEqual(ru.pages?.map((page) => page.slug), ["films", "packages"]);
  assert.deepEqual(en.pages?.map((page) => page.slug), ["films", "packages"]);
  const demo = createCanonicalVowDemoSite("ru");
  assert.equal(demo.business.primary_locale, "ru");
  assert.deepEqual(demo.available_locales, ["ru", "en"]);
});

test("VOW contract exposes exactly the 13 required native sections", () => {
  assert.deepEqual(
    VOW_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(({ id }) => id),
    ["hero", "manifesto", "films", "story", "experience", "process", "packages", "gallery", "reviews", "availability", "faq", "contact", "footer"],
  );
  assert.deepEqual(
    getPremiumTemplatePackage(key)?.nativeSectionIds,
    VOW_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(({ id }) => id),
  );
});

test("VOW editor preview composes all 13 canonical native sections through the public runtime", () => {
  const seed = createVowPremiumTemplateSeed("ru");
  const adapter = getPremiumTemplateEditorAdapter(key);
  const runtime = getPremiumTemplatePublicRuntime(key);
  const nativeIds = VOW_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(({ id }) => id);
  const expected = nativeIds.map((id) => `native:${key}:${id}`);

  assert.equal(adapter?.templateKey, VOW_PREMIUM_TEMPLATE_EDITOR_ADAPTER.templateKey);
  assert.equal(adapter?.restoreLabel, VOW_PREMIUM_TEMPLATE_EDITOR_ADAPTER.restoreLabel);
  assert.equal(runtime?.templateKey, VOW_PREMIUM_TEMPLATE_RUNTIME_ADAPTER.templateKey);
  assert.deepEqual(seed.layout_order, expected);
  assert.deepEqual(
    adapter?.normalizeLayout(seed.layout_order ?? [], []).filter((token) => token.startsWith(`native:${key}:`)),
    expected,
  );

  const canvasSource = readFileSync(
    resolve(rootDir, "lib/public-site/premium-template-editor-canvas-registry.tsx"),
    "utf8",
  );
  const editorSource = readFileSync(resolve(rootDir, "app/admin/site/page.tsx"), "utf8");
  const vowSource = readFileSync(resolve(rootDir, "components/public/vow/VowSite.tsx"), "utf8");
  assert.match(canvasSource, /getPremiumTemplatePublicRuntime\(templateKey\)/);
  assert.match(canvasSource, /runtime\.publicHomeRenderer/);
  assert.match(editorSource, /getPremiumTemplateEditorCanvasRenderer\(draft\.template_id\)/);
  assert.match(editorSource, /<PremiumTemplateEditorCanvas templateKey=\{draft\.template_id\}/);
  assert.match(vowSource, /site\.content\.layout_order/);
  assert.match(vowSource, /data-editor-anchor=\{sectionId\}/);
  assert.match(vowSource, /data-editor-anchor=\{token\}/);
});

test("VOW uses shared rich text, action, media and typography inspector fields", () => {
  const content = createVowPremiumTemplateSeed("ru");
  const build = (sectionId: (typeof VOW_PREMIUM_TEMPLATE_CONTRACT.nativeSections)[number]["id"]) =>
    VOW_PREMIUM_TEMPLATE_EDITOR_ADAPTER.buildInspectorFields({
      content,
      sectionId,
      disabled: false,
      onChange: () => undefined,
      onChooseMedia: () => undefined,
    });
  const allFields = VOW_PREMIUM_TEMPLATE_CONTRACT.nativeSections.flatMap(({ id }) => build(id));
  assert.ok(allFields.some((field) => field.type === "richText"));
  assert.ok(allFields.some((field) => field.type === "action"));
  assert.ok(allFields.some((field) => field.type === "typography"));
  const mediaSections = ["hero", "films", "story", "gallery", "contact"] as const;
  for (const section of mediaSections) {
    assert.ok(build(section).some((field) => field.type === "media"), `${section} media target`);
  }
  assert.ok(VOW_EDITOR_SPECS.hero.some((field) => field.path === "hero.title"));
  assert.ok(VOW_EDITOR_SPECS.manifesto.some((field) => field.path === "manifesto.text"));
});

test("VOW owns its asset and has no cross-template implementation dependency", () => {
  assert.equal(existsSync(resolve(rootDir, "public/images/demos/vow-films.webp")), true);
  const implementation = vowFiles
    .map((path) => readFileSync(resolve(rootDir, path), "utf8"))
    .join("\n");
  assert.match(implementation, /\/images\/demos\/vow-films\.webp/);
  assert.doesNotMatch(
    implementation,
    /\/templates\/gloss\/|gloss-|lumea-|velora-|premium-kids|BEMBI|GLOSS|LUMEA|VELORA/i,
  );
  assert.doesNotMatch(
    implementation,
    /from\s+["'][^"']*(?:gloss|lumea|velora|premium-kids)[^"']*["']/i,
  );
  const packageSource = readFileSync(
    resolve(rootDir, "lib/public-site/premium-template-package-source.mjs"),
    "utf8",
  );
  const vowPackage = packageSource.slice(
    packageSource.indexOf('templateKey: "vow-films"'),
    packageSource.indexOf('templateKey: "lumea-beauty"'),
  );
  assert.match(vowPackage, /access: "free"/);
  assert.doesNotMatch(vowPackage, /\/templates\/(?:gloss|lumea|velora)|premium-kids/i);
});

test("VOW optional catch-all demo route is canonical and rejects extra paths", () => {
  const route = readFileSync(
    resolve(rootDir, "app/demos/vow-films/[[...templatePath]]/page.tsx"),
    "utf8",
  );
  assert.match(route, /createCanonicalVowDemoSite/);
  assert.match(route, /vowDemoBasePath/);
  assert.match(route, /PublicSiteTemplateRuntime/);
  assert.match(route, /newSitePathForTemplate\("vow-films"\)/);
  assert.match(route, /path\.length === 1 && path\[0\] === "en"/);
  assert.match(route, /if \(!locale\) notFound\(\)/);
  assert.equal(existsSync(resolve(rootDir, "app/demos/vow-films/page.tsx")), false);
  assert.equal(existsSync(resolve(rootDir, "app/demos/vow-films/[...templatePath]/page.tsx")), false);
});

test("generated VOW package registries are current", () => {
  const generated = renderPremiumTemplatePackageFiles(PREMIUM_TEMPLATE_PACKAGE_SOURCE, {
    rootDir,
    outputDir: resolve(rootDir, "lib/public-site"),
  });
  for (const [name, expected] of generated) {
    assert.equal(readFileSync(resolve(rootDir, "lib/public-site", name), "utf8"), expected, `${name} is stale`);
  }
});
