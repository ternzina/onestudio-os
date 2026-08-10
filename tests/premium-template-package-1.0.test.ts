import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PREMIUM_DEMOS, createPremiumPackageDemos } from "../lib/demo-catalog.ts";
import { createPremiumTemplateCustomPageRuntimeResolver } from "../lib/public-site/premium-template-custom-page-runtime-adapter.ts";
import { getPremiumTemplateCustomPageRuntime } from "../lib/public-site/premium-template-custom-page-runtime-registry.ts";
import { getPremiumTemplateEditorAdapter } from "../lib/public-site/premium-template-editor-registry.ts";
import { PREMIUM_TEMPLATE_PACKAGE_MANIFESTS, getPremiumTemplatePackage } from "../lib/public-site/premium-template-package-catalog.ts";
import { createPremiumTemplateManifestLookup, definePremiumTemplateManifest } from "../lib/public-site/premium-template-package.ts";
import { getPremiumTemplateDefinition } from "../lib/public-site/premium-template-registry.ts";
import { createPremiumTemplateRuntimeResolver } from "../lib/public-site/premium-template-runtime-adapter.ts";
import { getPremiumTemplatePublicRuntime } from "../lib/public-site/premium-template-runtime-registry.ts";
import { TEMPLATE_CATALOG, TEMPLATE_KEYS, getCustomerTemplateChoices, getEditorTemplateChoices } from "../lib/public-site/template-catalog.ts";
import { createTemplateSeed } from "../lib/public-site/template-seeds.ts";

const KEYS = ["gloss-nail-studio", "premium-studio"] as const;
const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("manifests are the canonical serializable package identity and include complete demo metadata", () => {
  assert.deepEqual(PREMIUM_TEMPLATE_PACKAGE_MANIFESTS.map(({ templateKey }) => templateKey), KEYS);
  assert.equal(JSON.parse(JSON.stringify(PREMIUM_TEMPLATE_PACKAGE_MANIFESTS)).length, 2);
  for (const manifest of PREMIUM_TEMPLATE_PACKAGE_MANIFESTS) {
    assert.equal(Object.values(manifest).some((value) => typeof value === "function"), false);
    assert.ok(manifest.preview.title.ru && manifest.preview.title.en);
    assert.ok(manifest.preview.description.ru && manifest.preview.description.en);
    assert.ok(manifest.preview.alt.ru && manifest.preview.alt.en);
    assert.ok(manifest.preview.route && manifest.preview.image);
  }
  assert.equal(getPremiumTemplatePackage("premium-kids-center"), undefined);
});

test("real NOIR and GLOSS capability resolvers return matching, isolated bindings", () => {
  for (const key of KEYS) {
    assert.equal(getPremiumTemplateDefinition(key)?.templateKey, key);
    assert.deepEqual(getPremiumTemplateDefinition(key)?.nativeSections.map(({ id }) => id), getPremiumTemplatePackage(key)?.nativeSectionIds);
    assert.equal(getPremiumTemplateEditorAdapter(key)?.templateKey, key);
    assert.equal(getPremiumTemplatePublicRuntime(key)?.templateKey, key);
    assert.equal(getPremiumTemplateCustomPageRuntime(key)?.templateKey, key);
    assert.equal(createTemplateSeed(key).template_id, key);
    assert.ok(TEMPLATE_KEYS.includes(key));
    assert.ok(TEMPLATE_CATALOG.some((item) => item.key === key));
    assert.ok(getCustomerTemplateChoices().some((item) => item.key === key));
    assert.ok(getEditorTemplateChoices().some((item) => item.key === key));
  }
  assert.notEqual(getPremiumTemplateEditorAdapter(KEYS[0]), getPremiumTemplateEditorAdapter(KEYS[1]));
});

test("a synthetic third manifest automatically feeds generic lookup and demo consumers", () => {
  const third = definePremiumTemplateManifest({
    ...PREMIUM_TEMPLATE_PACKAGE_MANIFESTS[0], templateKey: "aurora-wellness", name: "AURORA",
    aliases: ["aurora"], category: "wellness", library: { tier: "standard", visible: true, order: 40 },
    preview: { ...PREMIUM_TEMPLATE_PACKAGE_MANIFESTS[0].preview, group: "wellness", order: 40,
      route: "/demos/aurora-wellness", image: "/templates/aurora/hero.webp",
      title: { ru: "Студия AURORA", en: "AURORA studio" },
      description: { ru: "Собственное описание AURORA.", en: "AURORA's own description." },
      alt: { ru: "Превью AURORA", en: "AURORA preview" } },
  });
  const manifests = [...PREMIUM_TEMPLATE_PACKAGE_MANIFESTS, third] as const;
  assert.equal(createPremiumTemplateManifestLookup(manifests)(third.templateKey), third);
  const demo = createPremiumPackageDemos(manifests).find(({ slug }) => slug === third.templateKey)!;
  assert.deepEqual({ group: demo.group, title: demo.title, description: demo.description, href: demo.href, image: demo.previewImage }, {
    group: "wellness", title: third.preview.title, description: third.preview.description,
    href: third.preview.route, image: third.preview.image,
  });

  const definition = { templateKey: third.templateKey, nativeSections: [], defaultLayout: [], customPages: { supported: true } } as never;
  const editor = { templateKey: third.templateKey, contract: definition };
  const home = { templateKey: third.templateKey, definition, publicHomeRenderer: (() => null) } as never;
  const page = { templateKey: third.templateKey, definition, customPageRenderer: (() => null) } as never;
  assert.equal(createPremiumTemplateRuntimeResolver([home], () => definition)(third.templateKey), home);
  assert.equal(createPremiumTemplateCustomPageRuntimeResolver([page], () => definition)(third.templateKey), page);
  assert.equal(editor.templateKey, third.templateKey);
  const seed = { template_id: third.templateKey, template_content: { [third.templateKey]: { own: true } } };
  assert.equal(seed.template_id, third.templateKey);
});

test("unknown identities fail closed and never inherit seed/editor/runtime", () => {
  for (const key of [undefined, null, "future-premium", "premium-kids-center"] as const) {
    assert.equal(getPremiumTemplatePackage(key), undefined);
    assert.equal(getPremiumTemplateDefinition(key), undefined);
    assert.equal(getPremiumTemplateEditorAdapter(key), undefined);
    assert.equal(getPremiumTemplatePublicRuntime(key), undefined);
    assert.equal(getPremiumTemplateCustomPageRuntime(key), undefined);
  }
  assert.throws(() => createTemplateSeed("future-premium"), /No seed registered/);
});

test("legacy drafts normalize and JSON reload without namespace, custom block or layout loss", () => {
  for (const key of KEYS) {
    const adapter = getPremiumTemplateEditorAdapter(key)!;
    const draft = createTemplateSeed(key);
    const value = { ...draft, custom_blocks: [{ id: "kept", kind: "text" as const, eyebrow: "", title: "Keep", text: "Payload", items: "", button_label: "", button_url: "", tone: "light" as const, is_visible: true }], layout_order: [...(draft.layout_order ?? []), "custom:kept"] };
    const normalized = { ...value, layout_order: adapter.normalizeLayout(value.layout_order, ["kept"]) };
    assert.deepEqual(JSON.parse(JSON.stringify(normalized)), normalized);
    assert.equal(normalized.template_id, key);
    if (draft.template_content) assert.deepEqual(normalized.template_content, draft.template_content);
  }
});

test("manifest, public and editor import graphs keep capability boundaries", async () => {
  const manifest = await read("../lib/public-site/premium-template-package-catalog.ts");
  const publicHome = await read("../lib/public-site/premium-template-runtime-registry.ts");
  const publicPage = await read("../lib/public-site/premium-template-custom-page-runtime-registry.ts");
  const editor = await read("../lib/public-site/premium-template-editor-registry.ts");
  for (const forbidden of [/next\/dynamic/, /from ["']react["']/, /editor-adapter/, /editor-schema/, /components\/public/, /premium-studio-content/, /templates\.ts/]) assert.doesNotMatch(manifest, forbidden);
  for (const source of [publicHome, publicPage]) {
    assert.match(source, /dynamic/);
    assert.doesNotMatch(source, /editor-adapter|editor-schema|components\/admin/);
  }
  assert.doesNotMatch(editor, /components\/public|PremiumStudioExperience|PublicCustomPage|NoirCustomPage|next\/dynamic/);
});

test("demo collection is manifest-driven while BEMBI remains outside the package registry", async () => {
  const gloss = PREMIUM_DEMOS.find(({ slug }) => slug === "gloss-nail-studio")!;
  const noir = PREMIUM_DEMOS.find(({ slug }) => slug === "premium-studio")!;
  const bembi = PREMIUM_DEMOS.find(({ slug }) => slug === "premium-kids-center")!;
  assert.equal(gloss.collection, "premium-template-package");
  assert.equal(gloss.group, "beauty");
  assert.equal(noir.group, "studio");
  assert.equal(bembi.collection, "protected-template");
  assert.equal(getPremiumTemplatePackage(bembi.slug), undefined);
  assert.doesNotMatch(await read("../lib/demo-catalog.ts"), /item\.key\s*===\s*["']premium-studio/);
});
