import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { PREMIUM_DEMOS } from "../lib/demo-catalog.ts";
import { createCanonicalLumeaDemoSite } from "../lib/public-site/lumea-demo.ts";
import { resolveLumeaContent } from "../lib/public-site/lumea-premium-template-content.ts";
import { LUMEA_PREMIUM_TEMPLATE_CONTRACT } from "../lib/public-site/lumea-premium-template-contract.ts";
import { LUMEA_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "../lib/public-site/lumea-premium-template-editor-adapter.ts";
import { createLumeaPremiumTemplateSeed } from "../lib/public-site/lumea-premium-template-seed.ts";
import { getPremiumTemplateCustomPageRuntime } from "../lib/public-site/premium-template-custom-page-runtime-registry.ts";
import { getPremiumTemplateEditorAdapter, PREMIUM_TEMPLATE_EDITOR_ADAPTERS } from "../lib/public-site/premium-template-editor-registry.ts";
import { getPremiumTemplateDefinition, PREMIUM_TEMPLATE_DEFINITIONS } from "../lib/public-site/premium-template-registry.ts";
import { getPremiumTemplatePublicRuntime, PREMIUM_TEMPLATE_RUNTIME_ADAPTERS } from "../lib/public-site/premium-template-runtime-registry.ts";
import { getPremiumTemplateSeedFactory } from "../lib/public-site/premium-template-seed-registry.ts";
import { resolveCreationContract } from "../lib/public-site/template-creation.ts";
import { getCustomerTemplateChoices, getTemplateCatalogRecord, TEMPLATE_CATALOG } from "../lib/public-site/template-catalog.ts";
import { createTemplateSeed } from "../lib/public-site/template-seeds.ts";

const key = "lumea-beauty";

test("LUMEA exists exactly once in the canonical catalog and is explicitly free", () => {
  assert.equal(TEMPLATE_CATALOG.filter((item) => item.key === key).length, 1);
  const lumea = getTemplateCatalogRecord(key);
  assert.equal(lumea?.name, "LUMEA Beauty");
  assert.equal(lumea?.category, "beauty");
  assert.equal(lumea?.access, "free");
  assert.equal(lumea?.tier, "standard");
  assert.deepEqual(lumea?.capabilities, {
    customerCreatable: true, createFromScratch: false, editorSelectable: true,
    editorSupported: true, previewRenderable: true, publicRenderable: true, customPages: true,
  });
  assert.equal(lumea?.contentNamespace, true);
});

test("LUMEA derives into /demos and /new-site customer choices", () => {
  assert.equal(PREMIUM_DEMOS.filter((demo) => demo.slug === key).length, 1);
  assert.equal(PREMIUM_DEMOS.find((demo) => demo.slug === key)?.href, "/demos/lumea-beauty");
  assert.equal(getCustomerTemplateChoices().filter((item) => item.key === key).length, 1);
  const demosPage = readFileSync(new URL("../app/demos/page.tsx", import.meta.url), "utf8");
  const chooser = readFileSync(new URL("../app/new-site/CanonicalSiteCreationWizard.tsx", import.meta.url), "utf8");
  assert.match(demosPage, /getPublicDemoTemplateChoices/);
  assert.match(chooser, /getCustomerTemplateGroups/);
  assert.doesNotMatch(chooser, /lumea-beauty/);
});

test("LUMEA creation resolves its localized namespaced seed", () => {
  const creation = resolveCreationContract({ creation_mode: "template", template_key: key, locales: ["ru", "en"] });
  const seed = createTemplateSeed(key);
  assert.equal(creation.template_key, key);
  assert.equal(creation.seed.template_id, key);
  assert.equal(seed.template_id, key);
  assert.ok(creation.seed.template_content?.[key]);
  assert.deepEqual(seed.layout_order, LUMEA_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(({ id }) => `native:${key}:${id}`));
  assert.equal(seed.layout_order?.length, 8);
  assert.equal(resolveLumeaContent(creation.localizedSeeds.en).hero.title, "A studio that starts with you");
  assert.equal(resolveLumeaContent(creation.localizedSeeds.ru).hero.title, "Салон, который начинается с вас");
});

test("LUMEA editor, public runtime and custom-page runtime resolve", () => {
  assert.equal(LUMEA_PREMIUM_TEMPLATE_CONTRACT.templateKey, key);
  assert.equal(getPremiumTemplateDefinition(key)?.templateKey, key);
  const editor = getPremiumTemplateEditorAdapter(key);
  assert.equal(editor?.templateKey, LUMEA_PREMIUM_TEMPLATE_EDITOR_ADAPTER.templateKey);
  assert.equal(editor?.contract.templateKey, key);
  assert.equal(editor?.restoreLabel, "Вернуть исходный LUMÉA");
  assert.equal(getPremiumTemplatePublicRuntime(key)?.templateKey, key);
  assert.equal(getPremiumTemplateSeedFactory(key), createLumeaPremiumTemplateSeed);
  assert.equal(getPremiumTemplateCustomPageRuntime(key)?.templateKey, key);
  const fields = LUMEA_PREMIUM_TEMPLATE_EDITOR_ADAPTER.buildInspectorFields({
    content: createLumeaPremiumTemplateSeed("ru"), sectionId: "hero", disabled: false,
    onChange: () => undefined, onChooseMedia: () => undefined,
  });
  assert.ok(fields.some((field) => field.type === "media"));
  assert.ok(fields.some((field) => field.type === "typography"));
});

test("technical premium filenames never infer LUMEA access", () => {
  const source = readFileSync(new URL("../lib/public-site/premium-template-package-source.mjs", import.meta.url), "utf8");
  const content = readFileSync(new URL("../lib/public-site/lumea-premium-template-content.ts", import.meta.url), "utf8");
  const seed = readFileSync(new URL("../lib/public-site/lumea-premium-template-seed.ts", import.meta.url), "utf8");
  assert.match(source, /templateKey: "lumea-beauty"[\s\S]*?access: "free"/);
  assert.match(source, /lumea-premium-template-seed\.ts/);
  const lumeaPackage = source.slice(source.indexOf('templateKey: "lumea-beauty"'));
  assert.doesNotMatch(lumeaPackage, /\/templates\/gloss\/|gloss-(?:hero|gallery|master)/i);
  assert.match(lumeaPackage, /\/images\/demos\/lumiere\.webp/);
  for (const direction of ["Hair Atelier", "Skin Rituals", "Brows & Lashes", "Slow Beauty"]) {
    assert.match(content, new RegExp(direction.replace(/[&]/g, "\\&")));
  }
  assert.doesNotMatch(`${content}\n${seed}`, /manicure|pedicure|маникюр|педикюр|nail[ -]?(?:artist|master|studio|care|s)?/i);
  assert.equal(getTemplateCatalogRecord(key)?.access, "free");
});

test("LUMEA package owns its implementation and contains no GLOSS fallback", () => {
  const root = resolve(import.meta.dirname, "..");
  const implementationFiles = [
    "lib/public-site/lumea-demo.ts",
    "lib/public-site/lumea-editor-schema.ts",
    "lib/public-site/lumea-premium-template-content.ts",
    "lib/public-site/lumea-premium-template-contract.ts",
    "lib/public-site/lumea-premium-template-custom-page-runtime-adapter.ts",
    "lib/public-site/lumea-premium-template-editor-adapter.ts",
    "lib/public-site/lumea-premium-template-runtime-adapter.ts",
    "lib/public-site/lumea-premium-template-seed.ts",
    "components/public/lumea/LumeaBooking.tsx",
    "components/public/lumea/LumeaCustomPage.tsx",
    "components/public/lumea/LumeaSite.tsx",
    "app/demos/lumea-beauty/[[...templatePath]]/page.tsx",
  ];
  const implementation = implementationFiles.map((file) => readFileSync(resolve(root, file), "utf8")).join("\n");
  assert.doesNotMatch(implementation, /from\s+["'][^"']*gloss[^"']*["']|import\(["'][^"']*gloss[^"']*["']\)/i);

  const created = createTemplateSeed(key);
  const serialized = JSON.stringify(created);
  assert.doesNotMatch(serialized, /gloss-nail-studio|GLOSS|manicure|pedicure|маникюр|педикюр|nail[ -]?(?:artist|master|studio|care|s)?/i);
  assert.deepEqual(Object.keys(created.template_content ?? {}), [key]);
});

test("GLOSS and LUMEA are independent package templates", () => {
  const glossKey = "gloss-nail-studio";
  const gloss = createTemplateSeed(glossKey);
  const lumea = createTemplateSeed(key);
  assert.notEqual(getPremiumTemplateSeedFactory(key), getPremiumTemplateSeedFactory(glossKey));
  assert.notEqual(getPremiumTemplateEditorAdapter(key), getPremiumTemplateEditorAdapter(glossKey));
  assert.notEqual(getPremiumTemplatePublicRuntime(key), getPremiumTemplatePublicRuntime(glossKey));
  assert.equal(gloss.template_id, glossKey);
  assert.equal(lumea.template_id, key);
  assert.equal(gloss.template_content?.[key], undefined);
  assert.equal(lumea.template_content?.[glossKey], undefined);
});

test("legacy Lumiere demo can only create canonical LUMEA, never GLOSS", () => {
  const legacyDemo = readFileSync(new URL("../app/demos/[demoSlug]/DemoShowcaseClient.tsx", import.meta.url), "utf8");
  const legacyConfigure = readFileSync(new URL("../app/configure/[demoSlug]/page.tsx", import.meta.url), "utf8");
  const canonicalDemo = readFileSync(new URL("../lib/public-site/lumea-demo.ts", import.meta.url), "utf8");
  assert.match(legacyDemo, /demo\.slug === "lumiere" \? "lumea-beauty" : "standard"/);
  assert.doesNotMatch(legacyDemo, /lumiere" \? "gloss-nail-studio"/);
  assert.match(legacyConfigure, /demo\.slug === "lumiere" \? "lumea-beauty" : "standard"/);
  assert.doesNotMatch(legacyConfigure, /lumiere" \? "gloss-nail-studio"/);
  assert.match(canonicalDemo, /createLumeaPremiumTemplateSeed\(locale\)/);
  assert.match(canonicalDemo, /slug: "lumea-beauty"/);
  assert.equal(createCanonicalLumeaDemoSite().content.template_id, createTemplateSeed(key).template_id);
});

test("existing access tiers and registry entries remain intact", () => {
  assert.equal(getTemplateCatalogRecord("gloss-nail-studio")?.access, "free");
  assert.equal(getTemplateCatalogRecord("premium-kids-center")?.access, "premium");
  assert.equal(getTemplateCatalogRecord("premium-studio")?.access, "premium");
  assert.equal(getTemplateCatalogRecord("velora-event-venue")?.access, "premium");
  for (const existing of ["gloss-nail-studio", "premium-studio", "velora-event-venue"]) {
    assert.ok(PREMIUM_TEMPLATE_DEFINITIONS.some((item) => item.templateKey === existing));
    assert.ok(PREMIUM_TEMPLATE_EDITOR_ADAPTERS.some((item) => item.templateKey === existing));
    assert.ok(PREMIUM_TEMPLATE_RUNTIME_ADAPTERS.some((item) => item.templateKey === existing));
  }
});

test("the canonical LUMEA demo remains bookable", () => {
  const demo = createCanonicalLumeaDemoSite("ru");
  assert.equal(demo.services.length, 4);
  assert.equal(demo.capabilities.booking, true);
  assert.equal(demo.business.currency, "UAH");
});
