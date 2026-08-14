import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { TEMPLATE_CATALOG, TEMPLATE_KEYS } from "../lib/public-site/template-catalog.ts";
import { resolveCreationContract } from "../lib/public-site/template-creation.ts";
import { BLANK_BASE_SEED, createTemplateSeed } from "../lib/public-site/template-seeds.ts";
import { getActiveEditorDesigns, isPublicRenderableSiteTemplate } from "../lib/public-site/template-registry.ts";
import { selectExecutableTemplate } from "../lib/public-site/template-selection.ts";

test("one canonical catalog owns all executable customer designs", () => {
  assert.deepEqual(TEMPLATE_CATALOG.map(item => item.key), [...TEMPLATE_KEYS]);
  assert.deepEqual(TEMPLATE_KEYS, ["standard", "gloss-nail-studio", "premium-kids-center", "lumea-beauty", "premium-studio", "velora-event-venue", "vow-films"]);
  for (const item of TEMPLATE_CATALOG) {
    assert.equal(item.capabilities.previewRenderable, true);
    assert.equal(item.capabilities.publicRenderable, true);
    assert.equal(item.capabilities.customPages, true);
    assert.equal(item.capabilities.editorSupported, true);
    assert.equal(getActiveEditorDesigns().some(choice => choice.key === item.key), item.capabilities.editorSelectable);
    assert.equal(isPublicRenderableSiteTemplate(item.key), true);
  }
});

test("blank creation is neutral, complete, unpublished by contract, and independent of demo_slug", () => {
  const result = resolveCreationContract({ creation_mode: "blank" });
  assert.equal(result.template_key, "standard");
  assert.deepEqual(result.seed, BLANK_BASE_SEED);
  assert.equal(result.seed.pages?.length, 0);
  assert.equal("demo_slug" in result, false);
  assert.equal("published_content" in result.seed, false);
});

test("template installation is complete while existing-site switching preserves content", () => {
  const gloss = createTemplateSeed("gloss-nail-studio");
  assert.equal(gloss.brand_name, "GLOSS");
  assert.match(gloss.hero_image_url ?? "", /gloss-hero/);
  assert.ok((gloss.pages ?? []).some(page => page.type === "portfolio"));
  assert.ok((gloss.section_order ?? []).includes("membership"));
  const existing = { ...BLANK_BASE_SEED, hero_title: "Customer title", template_content: { keep: { value: true } } };
  const noir = selectExecutableTemplate(existing, "premium-studio");
  assert.equal(noir.hero_title, "Customer title");
  assert.deepEqual(noir.template_content?.keep, { value: true });
  assert.ok(noir.template_content?.["premium-studio"]);
});

test("BEMBI and NOIR seeds contain editable template namespaces", () => {
  const bembi = createTemplateSeed("premium-kids-center");
  const noir = createTemplateSeed("premium-studio");
  assert.ok((bembi.template_content?.["premium-kids-center"] as { blocks?: unknown[] }).blocks?.length);
  assert.equal((noir.template_content?.["premium-studio"] as { version?: number }).version, 1);
});

test("gallery, editor, Preview and public runtime derive or dispatch all canonical designs", async () => {
  const [dialog, preview, runtime, premiumRuntime, noirRuntime, demoCatalog, editor] = await Promise.all([
    readFile(new URL("../components/admin/OneStudioSystemDialogs.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/site-preview/[templateKey]/[businessSlug]/[[...templatePath]]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/public/PublicSiteTemplateRuntime.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/public-site/premium-template-runtime-registry.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/public-site/noir-premium-template-runtime-adapter.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/demo-catalog.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/site/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(dialog, /designGroups\[access\]\.map/);
  assert.match(preview, /getSiteTemplateDefinition/);
  assert.match(runtime, /getPremiumTemplatePublicRuntime/);
  assert.match(premiumRuntime, /NOIR_PREMIUM_TEMPLATE_RUNTIME_ADAPTER/);
  assert.match(noirRuntime, /import\("@\/app\/demos\/premium-studio\/PremiumStudioExperience"\)/);
  assert.match(noirRuntime, /publicHomeRenderer: NoirHome/);
  assert.match(demoCatalog, /createPremiumPackageDemos\(PREMIUM_TEMPLATE_PACKAGE_MANIFESTS\)/);
  assert.match(editor, /OneStudio Site Editor|TemplateEditorRuntime/);
});

test("new-site chooser exposes catalog groups without legacy BEMBI", async () => {
  const source = await readFile(new URL("../app/new-site/CanonicalSiteCreationWizard.tsx", import.meta.url), "utf8");
  assert.match(source, /Создать с нуля/);
  assert.match(source, /getCustomerTemplateGroups/);
  assert.match(source, /creation_mode: mode/);
});
