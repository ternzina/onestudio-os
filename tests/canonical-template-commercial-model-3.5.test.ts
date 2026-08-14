import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  getCustomerTemplateChoices,
  getEditorTemplateChoices,
  getPublicDemoTemplateChoices,
  getTemplateCatalogRecord,
  groupTemplatesByAccess,
} from "../lib/public-site/template-catalog.ts";
import { getSiteTemplateDefinition, isExecutableSiteTemplate, isPublicRenderableSiteTemplate } from "../lib/public-site/template-registry.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("BEMBI is a legacy existing-client runtime, not a sellable template", async () => {
  const bembi = getTemplateCatalogRecord("premium-kids-center");
  assert.ok(bembi);
  assert.equal(bembi.access, "premium");
  assert.equal(bembi.library.visible, false);
  assert.equal(bembi.gallery.visible, false);
  assert.equal(bembi.capabilities.customerCreatable, false);
  assert.equal(bembi.capabilities.editorSelectable, false);
  assert.equal(bembi.capabilities.editorSupported, true);
  assert.equal(bembi.capabilities.previewRenderable, true);
  assert.equal(bembi.capabilities.publicRenderable, true);
  assert.equal(getCustomerTemplateChoices().some(item => item.key === bembi.key), false);
  assert.equal(getEditorTemplateChoices().some(item => item.key === bembi.key), false);
  assert.equal(getPublicDemoTemplateChoices().some(item => item.key === bembi.key), false);
  assert.equal(isExecutableSiteTemplate(bembi.key), true);
  assert.equal(isPublicRenderableSiteTemplate(bembi.key), true);
  assert.equal(getSiteTemplateDefinition(bembi.key)?.runtime.legacy, true);

  const [admin, editor, publicRuntime, demoCollection] = await Promise.all([
    read("../app/admin/site/page.tsx"),
    read("../components/admin/PremiumTemplateEditor.tsx"),
    read("../components/public/PublicSiteTemplateRuntime.tsx"),
    read("../lib/demo-catalog.ts"),
  ]);
  assert.match(admin, /draft\.template_id === "premium-kids-center" \? <PremiumTemplateEditor/);
  assert.match(editor, /templateKey: "premium-kids-center"/);
  assert.match(publicRuntime, /templateKey === "premium-kids-center"/);
  assert.doesNotMatch(demoCollection, /BEMBI_DEMO|protected-template/);
});

test("access metadata alone groups current and future templates", () => {
  const future = [
    { key: "future-standard-looking-name", access: "free" as const },
    { key: "future-free-looking-name", access: "premium" as const },
  ];
  const groups = groupTemplatesByAccess(future);
  assert.deepEqual(groups.free.map(item => item.key), ["future-standard-looking-name"]);
  assert.deepEqual(groups.premium.map(item => item.key), ["future-free-looking-name"]);

  assert.equal(getTemplateCatalogRecord("vow-films")?.access, "free");
  assert.equal(getTemplateCatalogRecord("gloss-nail-studio")?.access, "free");
  assert.equal(getTemplateCatalogRecord("lumea-beauty")?.access, "free");
  assert.equal(getTemplateCatalogRecord("premium-studio")?.access, "premium");
  assert.equal(getTemplateCatalogRecord("velora-event-venue")?.access, "premium");
});

test("customer UIs use catalog selectors and contain no key-based commercial lists", async () => {
  const sources = await Promise.all([
    read("../app/new-site/CanonicalSiteCreationWizard.tsx"),
    read("../app/demos/page.tsx"),
    read("../components/admin/OneStudioSystemDialogs.tsx"),
  ]);
  for (const source of sources) {
    assert.match(source, /groupTemplatesByAccess|getCustomerTemplateGroups/);
    assert.doesNotMatch(source, /const\s+(?:free|premium)(?:Templates)?\s*=\s*\[/i);
    assert.doesNotMatch(source, /(?:access|tier)\s*=.*(?:vow-films|velora-event-venue|premium-kids-center)/);
  }
});

test("editor canvas resolves package renderers through the common runtime registry", async () => {
  const canvas = await read("../lib/public-site/premium-template-editor-canvas-registry.tsx");
  assert.match(canvas, /getPremiumTemplatePublicRuntime\(templateKey\)/);
  assert.doesNotMatch(canvas, /new Map<string, PremiumTemplateEditorCanvasRenderer>|templateKey ===/);
});
