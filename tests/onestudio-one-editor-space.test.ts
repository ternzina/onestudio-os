import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("OneStudio fixes inspector taxonomy and adapters only place fields", async () => {
  const [spec, inspector, base, premium] = await Promise.all([
    readFile(new URL("../lib/public-site/editor-spec.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/admin/SharedEditorInspector.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/site/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/admin/PremiumTemplateEditor.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(spec, /ONESTUDIO_INSPECTOR_GROUPS = \["content", "typography", "media", "layout"\]/);
  assert.match(spec, /fields: readonly EditorInspectorPlacedField\[\]/);
  assert.match(inspector, /ONESTUDIO_INSPECTOR_GROUPS\.map/);
  assert.match(inspector, /Содержимое и оформление/);
  assert.doesNotMatch(premium, /id: "visibility", title: "Видимость"/);
  assert.doesNotMatch(base, /groups: \[\{ id: "content"/);
});

test("command geometry and Design/SEO actions are system-rendered", async () => {
  const [runtime, page, premium, dialogs] = await Promise.all([
    readFile(new URL("../components/admin/TemplateEditorRuntime.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/site/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/admin/PremiumTemplateEditor.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/admin/OneStudioSystemDialogs.tsx", import.meta.url), "utf8"),
  ]);
  for (const marker of ["data-onestudio-editor-command-bar", "commandModel.design", "commandModel.seo", "commandModel.addPage"]) assert.match(runtime, new RegExp(marker.replaceAll(".", "\\.")));
  for (const adapter of [page, premium]) {
    assert.match(adapter, /onClick: onOpenDesign/);
    assert.match(adapter, /onClick: onOpenSeo/);
  }
  assert.match(page, /<OneStudioDesignDialog/);
  assert.match(page, /<OneStudioSeoDialog/);
  assert.equal((dialogs.match(/function OneStudioDesignDialog/g) ?? []).length, 1);
  assert.equal((dialogs.match(/function OneStudioSeoDialog/g) ?? []).length, 1);
  assert.doesNotMatch(premium, /designOpen|seoOpen|role="dialog"|aria-modal/);
  assert.doesNotMatch(page.slice(page.indexOf("function VisualBuilder")), /templatesOpen|seoOpen/);
});

test("future templates inherit pages and editor structure without page creation code", async () => {
  const spec = await readFile(new URL("../lib/public-site/editor-spec.ts", import.meta.url), "utf8");
  assert.match(spec, /OneStudio owns placement, geometry, and styling/);
  assert.match(spec, /Future-template invariant/);
  assert.match(spec, /new design never needs a new shell[\s\S]*modal implementation/i);
  assert.match(spec, /commandModel: EditorCommandModel/);
});
