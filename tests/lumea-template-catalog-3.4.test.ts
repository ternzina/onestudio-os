import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
import { resolveCreationContract } from "../lib/public-site/template-creation.ts";
import { getCustomerTemplateChoices, getTemplateCatalogRecord, TEMPLATE_CATALOG } from "../lib/public-site/template-catalog.ts";

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
    previewRenderable: true, publicRenderable: true, customPages: true,
  });
  assert.equal(lumea?.contentNamespace, true);
});

test("LUMEA derives into /demos and /new-site customer choices", () => {
  assert.equal(PREMIUM_DEMOS.filter((demo) => demo.slug === key).length, 1);
  assert.equal(PREMIUM_DEMOS.find((demo) => demo.slug === key)?.href, "/demos/lumea-beauty");
  assert.equal(getCustomerTemplateChoices().filter((item) => item.key === key).length, 1);
  const demosPage = readFileSync(new URL("../app/demos/page.tsx", import.meta.url), "utf8");
  const chooser = readFileSync(new URL("../app/new-site/CanonicalSiteCreationWizard.tsx", import.meta.url), "utf8");
  assert.match(demosPage, /getCustomerTemplateChoices/);
  assert.match(chooser, /getCustomerTemplateChoices/);
  assert.doesNotMatch(chooser, /lumea-beauty/);
});

test("LUMEA creation resolves its localized namespaced seed", () => {
  const creation = resolveCreationContract({ creation_mode: "template", template_key: key, locales: ["ru", "en"] });
  assert.equal(creation.template_key, key);
  assert.equal(creation.seed.template_id, key);
  assert.ok(creation.seed.template_content?.[key]);
  assert.equal(resolveLumeaContent(creation.localizedSeeds.en).hero.title, "A studio that starts with you");
  assert.equal(resolveLumeaContent(creation.localizedSeeds.ru).hero.title, "Салон, который начинается с вас");
});

test("LUMEA editor, public runtime and custom-page runtime resolve", () => {
  assert.equal(LUMEA_PREMIUM_TEMPLATE_CONTRACT.templateKey, key);
  assert.equal(getPremiumTemplateDefinition(key)?.templateKey, key);
  assert.equal(getPremiumTemplateEditorAdapter(key)?.templateKey, LUMEA_PREMIUM_TEMPLATE_EDITOR_ADAPTER.templateKey);
  assert.equal(getPremiumTemplatePublicRuntime(key)?.templateKey, key);
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
