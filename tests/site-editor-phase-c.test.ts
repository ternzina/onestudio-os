import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, test } from "node:test";
import {
  getActiveEditorDesigns,
  getSiteTemplateDefinition,
  isExecutableSiteTemplate,
  isPublicRenderableSiteTemplate,
  resolveSiteTemplateKey,
} from "../lib/public-site/template-registry.ts";
import { selectExecutableTemplate } from "../lib/public-site/template-selection.ts";
import type { PublicSiteContent } from "../lib/public-site/types.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

describe("OneStudio editor design contract", () => {
  test("legacy BEMBI remains executable but is not an active editor design", () => {
    assert.deepEqual(getActiveEditorDesigns().map((design) => design.key), ["standard", "align-pilates-studio", "ritmo-dance-studio", "pawhaus-grooming-studio", "gloss-nail-studio", "lumea-beauty", "premium-studio", "velora-event-venue", "vow-films"]);
    assert.equal(isExecutableSiteTemplate("standard"), true);
    assert.equal(isExecutableSiteTemplate("premium-kids-center"), true);
    assert.equal(isExecutableSiteTemplate("gloss-nail-studio"), true);
    assert.equal(isExecutableSiteTemplate("premium-studio"), true);
    assert.equal(isExecutableSiteTemplate("lumea-beauty"), true);
    assert.equal(isExecutableSiteTemplate("vow-films"), true);
    assert.equal(isExecutableSiteTemplate("align-pilates-studio"), true);
  });

  test("GLOSS is selectable, previewable, public-renderable, and not legacy", () => {
    assert.equal(isPublicRenderableSiteTemplate("gloss-nail-studio"), true);
    assert.deepEqual(getSiteTemplateDefinition("gloss-nail-studio")?.runtime, {
      editorSelectable: true,
      previewSelectable: true,
      publicRenderable: true,
      legacy: false,
    });
  });

  test("missing design resolves to Base while unknown registered adapters fail clearly", () => {
    assert.equal(resolveSiteTemplateKey(), "standard");
    assert.throws(() => resolveSiteTemplateKey("legacy-unknown"), /No canonical template adapter/);
    const draft = selectExecutableTemplate({ brand_name: "Studio" } as PublicSiteContent, "standard");
    assert.equal(draft.template_id, "standard");
  });
});

test("active GLOSS remains connected to the public renderer", async () => {
  const publicRuntime = await read("../components/public/PublicSiteTemplateRuntime.tsx");
  assert.match(publicRuntime, /getPremiumTemplatePublicRuntime\(templateKey\)/);
  assert.doesNotMatch(publicRuntime, /templateKey === "gloss-nail-studio"|GlossBusinessSite/);
});

test("one canonical runtime owns product chrome and all active adapters mount it", async () => {
  const runtime = await read("../components/admin/TemplateEditorRuntime.tsx");
  const base = await read("../app/admin/site/page.tsx");
  const bembi = await read("../components/admin/PremiumTemplateEditor.tsx");
  assert.match(runtime, /OneStudio Site Editor/);
  for (const owned of ["OneStudioEditorToolbar", "OneStudioEditorCommandBar", "OneStudioEditorWorkspace", "EditorNavigatorFrame", "EditorCanvasFrame", "EditorSettingsFrame", "EditorBlockLibrary"]) assert.match(runtime, new RegExp(`<${owned}`));
  assert.match(base, /<TemplateEditorRuntime/);
  assert.match(base, /SITE_TEMPLATE_REGISTRY\.find\(item => item\.key === draft\.template_id\)\?\.name/);
  assert.match(bembi, /<TemplateEditorRuntime/);
  assert.doesNotMatch(runtime, /LegacyRuntimeProps|"children" in spec/);
  for (const owned of ["OneStudioEditorToolbar", "OneStudioEditorCommandBar", "OneStudioEditorWorkspace", "EditorNavigatorFrame", "EditorCanvasFrame", "EditorSettingsFrame", "EditorBlockLibrary"]) assert.doesNotMatch(base, new RegExp(`<${owned}`));
  assert.doesNotMatch(bembi, /TemplateEditorShell/);
  assert.doesNotMatch(bembi, /<EditorBlockLibrary/);
  assert.doesNotMatch(runtime, />Premium<\/span>/);
});

test("chooser uses design language and includes every active design", async () => {
  const [page, dialogs] = await Promise.all([
    read("../app/admin/site/page.tsx"),
    read("../components/admin/OneStudioSystemDialogs.tsx"),
  ]);
  assert.match(page, /activeDesigns=\{getActiveEditorDesigns\(\)\}/);
  assert.match(dialogs, /groupTemplatesByAccess\(activeDesigns\)/);
  assert.match(dialogs, /designGroups\[access\]\.map/);
  assert.match(dialogs, /t\("Site design"\)/);
  assert.match(dialogs, /\{template\.name\}/);
  assert.doesNotMatch(dialogs, /SITE_TEMPLATES\.map/);
});
