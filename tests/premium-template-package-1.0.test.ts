import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getPremiumTemplateEditorAdapter } from "../lib/public-site/premium-template-editor-registry.ts";
import { getPremiumTemplatePackage, PREMIUM_TEMPLATE_PACKAGES } from "../lib/public-site/premium-template-package-catalog.ts";
import { getPremiumTemplateDefinition } from "../lib/public-site/premium-template-registry.ts";
import { TEMPLATE_CATALOG } from "../lib/public-site/template-catalog.ts";
import { createTemplateSeed } from "../lib/public-site/template-seeds.ts";

const KEYS = ["gloss-nail-studio", "premium-studio"] as const;
const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("NOIR and GLOSS are unique, coherent Premium Template Package 1.0 entries", () => {
  assert.deepEqual(PREMIUM_TEMPLATE_PACKAGES.map(({ manifest }) => manifest.templateKey), KEYS);
  assert.equal(new Set(PREMIUM_TEMPLATE_PACKAGES.map(({ manifest }) => manifest.templateKey)).size, PREMIUM_TEMPLATE_PACKAGES.length);
  for (const entry of PREMIUM_TEMPLATE_PACKAGES) {
    const { manifest, bindings } = entry;
    assert.equal(manifest.packageVersion, "1.0");
    assert.equal(bindings.contract.templateKey, manifest.templateKey);
    assert.equal(bindings.editor.templateKey, manifest.templateKey);
    assert.equal(bindings.publicHome.templateKey, manifest.templateKey);
    assert.equal(bindings.customPage.templateKey, manifest.templateKey);
    assert.deepEqual(bindings.contract.nativeSections.map(({ id }) => id), manifest.nativeSectionIds);
  }
  assert.equal(getPremiumTemplatePackage("premium-kids-center"), undefined);
});

test("one package entry supplies every consumer and catalog order stays stable", () => {
  assert.deepEqual(TEMPLATE_CATALOG.map(({ key }) => key), ["standard", "gloss-nail-studio", "premium-kids-center", "premium-studio"]);
  for (const key of KEYS) {
    const entry = getPremiumTemplatePackage(key)!;
    const catalog = TEMPLATE_CATALOG.find((item) => item.key === key)!;
    assert.equal(catalog.name, entry.manifest.name);
    assert.equal(catalog.gallery.previewRoute, entry.manifest.preview.route);
    assert.equal(getPremiumTemplateDefinition(key), entry.bindings.contract);
    assert.equal(getPremiumTemplateEditorAdapter(key), entry.bindings.editor);
    assert.equal(entry.bindings.publicHome.templateKey, key);
    assert.equal(entry.bindings.customPage.templateKey, key);
  }
});

test("unknown identities fail closed and adapters never cross", () => {
  for (const key of [undefined, null, "future-premium", "premium-kids-center"] as const) {
    assert.equal(getPremiumTemplatePackage(key), undefined);
    assert.equal(getPremiumTemplateDefinition(key), undefined);
    assert.equal(getPremiumTemplateEditorAdapter(key), undefined);
  }
  assert.notEqual(getPremiumTemplateEditorAdapter("premium-studio"), getPremiumTemplateEditorAdapter("gloss-nail-studio"));
});

test("legacy drafts normalize and JSON save/reload without content or layout loss", () => {
  for (const key of KEYS) {
    const adapter = getPremiumTemplateEditorAdapter(key)!;
    const draft = createTemplateSeed(key);
    const withLegacyData = { ...draft, custom_blocks: [{ id: "kept", kind: "text" as const, eyebrow: "", title: "Keep", text: "Payload", items: "", button_label: "", button_url: "", tone: "light" as const, is_visible: true }], layout_order: [...(draft.layout_order ?? []), "custom:kept"] };
    const normalized = { ...withLegacyData, layout_order: adapter.normalizeLayout(withLegacyData.layout_order, ["kept"]) };
    const reloaded = JSON.parse(JSON.stringify(normalized));
    assert.deepEqual(reloaded.custom_blocks, normalized.custom_blocks);
    assert.deepEqual(reloaded.layout_order, normalized.layout_order);
    assert.equal(reloaded.template_id, key);
  }
});

test("registries are derived wrappers and generic orchestration has no NOIR/GLOSS branches", async () => {
  const catalog = await read("../lib/public-site/premium-template-package-catalog.ts");
  assert.match(catalog, /PREMIUM_TEMPLATE_PACKAGES = \[GLOSS_PACKAGE, NOIR_PACKAGE\]/);
  for (const path of ["../lib/public-site/premium-template-registry.ts", "../lib/public-site/premium-template-editor-registry.ts", "../lib/public-site/premium-template-runtime-registry.tsx", "../lib/public-site/premium-template-custom-page-runtime-registry.tsx"]) {
    const source = await read(path);
    assert.match(source, /PREMIUM_TEMPLATE_PACKAGES/);
    assert.doesNotMatch(source, /\[\s*GLOSS_|\[\s*NOIR_/);
  }
  for (const path of ["../components/public/PublicSiteTemplateRuntime.tsx", "../components/public/PublicCustomPageRuntime.tsx", "../app/admin/site/page.tsx"]) {
    const source = await read(path);
    assert.doesNotMatch(source, /template(?:Key|_id)\s*===\s*["'](?:gloss-nail-studio|premium-studio)/);
  }
  assert.doesNotMatch(catalog, /premium-kids-center|BEMBI/);
});
