import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
import { PREMIUM_DEMOS, createPremiumPackageDemos } from "../lib/demo-catalog.ts";
import { getPremiumTemplateCustomPageRuntime } from "../lib/public-site/premium-template-custom-page-runtime-registry.ts";
import { getPremiumTemplateEditorAdapter } from "../lib/public-site/premium-template-editor-registry.ts";
import { PREMIUM_TEMPLATE_PACKAGE_MANIFESTS, getPremiumTemplatePackage } from "../lib/public-site/premium-template-package-catalog.ts";
import { getPremiumTemplateDefinition } from "../lib/public-site/premium-template-registry.ts";
import { getPremiumTemplatePublicRuntime } from "../lib/public-site/premium-template-runtime-registry.ts";
import { TEMPLATE_CATALOG, TEMPLATE_KEYS, createPremiumPackageTemplateCatalog, getCustomerTemplateChoices, getEditorTemplateChoices } from "../lib/public-site/template-catalog.ts";
import { createPremiumTemplateSeedResolver, createTemplateSeed } from "../lib/public-site/template-seeds.ts";
import { PREMIUM_TEMPLATE_PACKAGE_SOURCE } from "../lib/public-site/premium-template-package-source.mjs";
import { renderPremiumTemplatePackageFiles } from "../scripts/premium-template-package-generator.mjs";

const KEYS = ["ritmo-dance-studio", "align-pilates-studio", "gloss-nail-studio", "premium-studio", "velora-event-venue", "vow-films", "lumea-beauty"] as const;
const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("manifests are the canonical serializable package identity and include complete demo metadata", () => {
  assert.deepEqual(PREMIUM_TEMPLATE_PACKAGE_MANIFESTS.map(({ templateKey }) => templateKey), KEYS);
  assert.equal(JSON.parse(JSON.stringify(PREMIUM_TEMPLATE_PACKAGE_MANIFESTS)).length, KEYS.length);
  for (const manifest of PREMIUM_TEMPLATE_PACKAGE_MANIFESTS) {
    assert.equal(Object.values(manifest).some((value) => typeof value === "function"), false);
    assert.ok(manifest.preview.title.ru && manifest.preview.title.en);
    assert.ok(manifest.preview.description.ru && manifest.preview.description.en);
    assert.ok(manifest.preview.alt.ru && manifest.preview.alt.en);
    assert.ok(manifest.preview.route);
    assert.ok(manifest.preview.image || Number(manifest.assets.length) === 0);
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

test("one synthetic AURORA package registration feeds every production registry mechanism", async (context) => {
  const third = {
    manifest: {
      ...PREMIUM_TEMPLATE_PACKAGE_MANIFESTS[0], templateKey: "aurora-wellness", name: "AURORA",
    aliases: ["aurora"], category: "wellness", library: { tier: "standard", visible: true, order: 40 },
    preview: { ...PREMIUM_TEMPLATE_PACKAGE_MANIFESTS[0].preview, group: "wellness", order: 40,
      route: "/demos/aurora-wellness", image: "/templates/aurora/hero.webp",
      title: { ru: "Студия AURORA", en: "AURORA studio" },
      description: { ru: "Собственное описание AURORA.", en: "AURORA's own description." },
      alt: { ru: "Превью AURORA", en: "AURORA preview" } },
    },
    bindings: {
      seed: { module: "tests/fixtures/premium-template-package/aurora-seed.ts", export: "createAuroraPremiumTemplateSeed" },
      contract: { module: "tests/fixtures/premium-template-package/aurora-contract.ts", export: "AURORA_PREMIUM_TEMPLATE_CONTRACT" },
      editor: { module: "tests/fixtures/premium-template-package/aurora-editor-adapter.ts", export: "AURORA_PREMIUM_TEMPLATE_EDITOR_ADAPTER" },
      publicHome: { module: "tests/fixtures/premium-template-package/aurora-public-home-runtime.ts", export: "AURORA_PREMIUM_TEMPLATE_RUNTIME_ADAPTER" },
      customPage: { module: "tests/fixtures/premium-template-package/aurora-custom-page-runtime.ts", export: "AURORA_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER" },
    },
  };
  const packages = [...PREMIUM_TEMPLATE_PACKAGE_SOURCE, third];
  const outputDir = await mkdtemp(resolve(rootDir, ".aurora-package-"));
  context.after(() => rm(outputDir, { recursive: true, force: true }));
  for (const [name, content] of renderPremiumTemplatePackageFiles(packages, { rootDir, outputDir })) {
    await writeFile(resolve(outputDir, name), content);
  }
  const load = (name: string) => import(`${pathToFileURL(resolve(outputDir, name)).href}?fixture=aurora`);
  const [catalog, seeds, contracts, editors, homes, pages] = await Promise.all([
    load("premium-template-package-catalog.ts"), load("premium-template-seed-registry.ts"),
    load("premium-template-registry.ts"), load("premium-template-editor-registry.ts"),
    load("premium-template-runtime-registry.ts"), load("premium-template-custom-page-runtime-registry.ts"),
  ]);
  const manifest = catalog.getPremiumTemplatePackage(third.manifest.templateKey);
  assert.equal(manifest?.name, "AURORA");
  assert.deepEqual(catalog.PREMIUM_TEMPLATE_PACKAGE_MANIFESTS.map(({ templateKey }: { templateKey: string }) => templateKey), [...KEYS, third.manifest.templateKey]);
  assert.ok(catalog.PREMIUM_TEMPLATE_PACKAGE_MANIFESTS.some(({ templateKey }: { templateKey: string }) => templateKey === third.manifest.templateKey));
  const packageCatalog = createPremiumPackageTemplateCatalog(catalog.PREMIUM_TEMPLATE_PACKAGE_MANIFESTS);
  assert.ok(packageCatalog.some(({ key }) => key === third.manifest.templateKey));
  assert.ok(packageCatalog.filter(({ gallery, capabilities }) => gallery.visible && capabilities.customerCreatable).some(({ key }) => key === third.manifest.templateKey));
  assert.ok(packageCatalog.filter(({ capabilities }) => capabilities.editorSelectable).some(({ key }) => key === third.manifest.templateKey));
  const demo = createPremiumPackageDemos(catalog.PREMIUM_TEMPLATE_PACKAGE_MANIFESTS).find(({ slug }) => slug === third.manifest.templateKey)!;
  assert.deepEqual({ group: demo.group, title: demo.title, description: demo.description, href: demo.href, image: demo.previewImage }, {
    group: "wellness", title: third.manifest.preview.title, description: third.manifest.preview.description,
    href: third.manifest.preview.route, image: third.manifest.preview.image,
  });
  const seed = createPremiumTemplateSeedResolver(catalog.getPremiumTemplatePackage, seeds.getPremiumTemplateSeedFactory)(third.manifest.templateKey);
  assert.equal(seed.template_id, third.manifest.templateKey);
  assert.deepEqual(seed.template_content?.[third.manifest.templateKey], { fixture: "aurora" });
  assert.equal(contracts.getPremiumTemplateDefinition(third.manifest.templateKey)?.templateKey, third.manifest.templateKey);
  assert.equal(editors.getPremiumTemplateEditorAdapter(third.manifest.templateKey)?.templateKey, third.manifest.templateKey);
  assert.equal(homes.getPremiumTemplatePublicRuntime(third.manifest.templateKey)?.templateKey, third.manifest.templateKey);
  assert.equal(pages.getPremiumTemplateCustomPageRuntime(third.manifest.templateKey)?.templateKey, third.manifest.templateKey);
  assert.equal((editors.getPremiumTemplateEditorAdapter(third.manifest.templateKey) as { fixture?: string }).fixture, "aurora-editor");
  assert.equal((homes.getPremiumTemplatePublicRuntime(third.manifest.templateKey) as { fixture?: string }).fixture, "aurora-home");
  assert.equal((pages.getPremiumTemplateCustomPageRuntime(third.manifest.templateKey) as { fixture?: string }).fixture, "aurora-page");
  for (const lookup of [catalog.getPremiumTemplatePackage, contracts.getPremiumTemplateDefinition, editors.getPremiumTemplateEditorAdapter, homes.getPremiumTemplatePublicRuntime, pages.getPremiumTemplateCustomPageRuntime]) {
    assert.equal(lookup("unknown-package"), undefined);
    assert.equal(lookup("premium-kids-center"), undefined);
  }
  assert.notEqual(editors.getPremiumTemplateEditorAdapter(third.manifest.templateKey), editors.getPremiumTemplateEditorAdapter("gloss-nail-studio"));
  assert.notEqual(homes.getPremiumTemplatePublicRuntime(third.manifest.templateKey), homes.getPremiumTemplatePublicRuntime("premium-studio"));
  assert.notEqual(pages.getPremiumTemplateCustomPageRuntime(third.manifest.templateKey), pages.getPremiumTemplateCustomPageRuntime("gloss-nail-studio"));
});

test("checked-in capability registries are deterministic and current", async () => {
  const generated = renderPremiumTemplatePackageFiles(PREMIUM_TEMPLATE_PACKAGE_SOURCE, { rootDir, outputDir: resolve(rootDir, "lib/public-site") });
  for (const [name, expected] of generated) assert.equal(await read(`../lib/public-site/${name}`), expected, `${name} is stale`);
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

test("sellable demo collection is manifest-driven and excludes legacy BEMBI", async () => {
  const gloss = PREMIUM_DEMOS.find(({ slug }) => slug === "gloss-nail-studio")!;
  const noir = PREMIUM_DEMOS.find(({ slug }) => slug === "premium-studio")!;
  assert.equal(gloss.collection, "premium-template-package");
  assert.equal(gloss.group, "beauty");
  assert.equal(noir.group, "studio");
  assert.equal(PREMIUM_DEMOS.some(({ slug }) => slug === "premium-kids-center"), false);
  assert.equal(getPremiumTemplatePackage("premium-kids-center"), undefined);
  assert.doesNotMatch(await read("../lib/demo-catalog.ts"), /item\.key\s*===\s*["']premium-studio/);
});
