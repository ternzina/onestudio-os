import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PREMIUM_UNIVERSAL_BLOCK_LIBRARY } from "../lib/public-site/custom-block-registry.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("TemplateEditorSpec structurally requires navigator and inspector models", async () => {
  const spec = await read("../lib/public-site/editor-spec.ts");
  assert.match(spec, /navigatorModel: EditorNavigatorModel/);
  assert.match(spec, /inspectorModel: EditorInspectorModel/);
  assert.doesNotMatch(spec, /navigator:\s*ReactNode/);
  assert.doesNotMatch(spec, /inspector:\s*ReactNode/);
});

test("runtime exclusively mounts the shared navigator and inspector", async () => {
  const runtime = await read("../components/admin/TemplateEditorRuntime.tsx");
  const base = await read("../app/admin/site/page.tsx");
  const bembi = await read("../components/admin/PremiumTemplateEditor.tsx");
  assert.match(runtime, /<SharedEditorNavigator model=\{navigatorModel\}/);
  assert.match(runtime, /<SharedEditorInspector model=\{inspectorModel\}/);
  for (const adapter of [base, bembi]) {
    assert.match(adapter, /navigatorModel=/);
    assert.match(adapter, /inspectorModel=/);
    assert.doesNotMatch(adapter, /navigator=\{/);
    assert.doesNotMatch(adapter, /inspector=\{/);
    assert.doesNotMatch(adapter, /<SharedEditorNavigator|<SharedEditorInspector/);
  }
  assert.match(base, /SITE_TEMPLATE_REGISTRY\.find\(item => item\.key === draft\.template_id\)\?\.name/);
});

test("templates cannot override OneStudio editor chrome or geometry", async () => {
  const spec = await read("../lib/public-site/editor-spec.ts");
  const base = await read("../app/admin/site/page.tsx");
  const bembi = await read("../components/admin/PremiumTemplateEditor.tsx");
  for (const escapeHatch of ["toolbarPrimaryExtension", "toolbarSecondaryExtension", "workspaceClassName", "workspaceStyle", "navigatorFrameClassName", "settingsFrameClassName", "canvasFrameClassName", "navigatorOverlay", "settingsOverlay"]) {
    assert.doesNotMatch(spec, new RegExp(escapeHatch));
    assert.doesNotMatch(base, new RegExp(escapeHatch));
    assert.doesNotMatch(bembi, new RegExp(escapeHatch));
  }
  assert.match(spec, /type OneStudioTemplateAdapter = TemplateEditorSpec/);
  assert.match(spec, /A new design never needs a new shell/);
});

test("one navigator owns row geometry, numbering, actions, and add-block UI", async () => {
  const navigator = await read("../components/admin/SharedEditorNavigator.tsx");
  const chrome = await read("../components/admin/EditorChrome.tsx");
  assert.match(navigator, /data-shared-editor-navigator-row/);
  assert.match(navigator, /data-editor-row-index/);
  assert.match(navigator, /String\(section\.index \+ 1\)\.padStart\(2, "0"\)/);
  assert.match(navigator, /data-editor-row-actions/);
  assert.match(navigator, /model\.addBlock/);
  assert.doesNotMatch(chrome, /EditorBlockRow/);
});

test("one inspector owns heading, groups, field rhythm, cards, and action footer", async () => {
  const inspector = await read("../components/admin/SharedEditorInspector.tsx");
  for (const marker of ["data-shared-editor-inspector", "data-editor-inspector-groups", "data-editor-inspector-group", "data-editor-inspector-actions"]) assert.match(inspector, new RegExp(marker));
  assert.match(inspector, /rounded-2xl border/);
  assert.match(inspector, /SharedEditorInspectorField/);
  for (const field of ["richText", "typography", "button"]) assert.match(inspector, new RegExp(`field\\.type === "${field}"`));
});

test("BEMBI is a model adapter with structured RichText and narrow complex fields", async () => {
  const bembi = await read("../components/admin/PremiumTemplateEditor.tsx");
  assert.match(bembi, /const navigatorModel: EditorNavigatorModel/);
  assert.match(bembi, /const inspectorModel: EditorInspectorModel/);
  assert.match(bembi, /type: "richText"/);
  assert.match(bembi, /const structured = selectedBlock\.type === "faq" \? <PremiumDelimitedListEditor/);
  assert.match(bembi, /type: "custom", customContent: structured/);
  assert.match(bembi, /buildPremiumUniversalInspectorGroups/);
  assert.match(bembi, /id: "visibility"/);
  assert.match(bembi, /id: "content"/);
  assert.match(bembi, /id: "typography"/);
  assert.doesNotMatch(bembi, /<PremiumUniversalBlockSettings/);
  assert.match(bembi, /<HomeExperience/);
  assert.doesNotMatch(bembi, /data-shared-editor-navigator-row|data-shared-editor-inspector/);
});

test("Premium universal settings are shared group models with one narrow complex widget", async () => {
  const premium = await read("../components/admin/PremiumUniversalBlockSettings.tsx");
  assert.match(premium, /buildPremiumUniversalInspectorGroups/);
  for (const group of ["layout-spacing", "appearance-colors", "content", "typography", "actions-content", "media", "columns"]) assert.match(premium, new RegExp(`id: "${group}"`));
  assert.match(premium, /type: "typography"/);
  assert.match(premium, /data-premium-column-cards-widget/);
  assert.equal((premium.match(/type: "custom"/g) ?? []).length, 1);
  assert.doesNotMatch(premium, /data-shared-editor-inspector|data-editor-inspector-actions|НАСТРОЙКИ БЛОКА/);
  assert.doesNotMatch(premium, /<fieldset|<legend/);
});

test("shared action footer owns normalized Base and BEMBI destructive actions", async () => {
  const base = await read("../app/admin/site/page.tsx");
  const bembi = await read("../components/admin/PremiumTemplateEditor.tsx");
  assert.match(base, /const inspectorActions: EditorInspectorAction\[\]/);
  assert.match(base, /actions: inspectorActions/);
  assert.match(bembi, /id: "duplicate"/);
  assert.match(bembi, /id: "reset"/);
  assert.match(bembi, /id: "delete"/);
  assert.doesNotMatch(base, /function MoveControls/);
  assert.doesNotMatch(base, /onClick=\{onDuplicate\}|onClick=\{onRemove\}/);
});

test("navigator boundary model disables first and last movable rows", async () => {
  const spec = await read("../lib/public-site/editor-spec.ts");
  const navigator = await read("../components/admin/SharedEditorNavigator.tsx");
  const base = await read("../app/admin/site/page.tsx");
  const bembi = await read("../components/admin/PremiumTemplateEditor.tsx");
  assert.match(spec, /canMoveUp\?: boolean/);
  assert.match(spec, /canMoveDown\?: boolean/);
  assert.match(navigator, /section\.canMoveUp === false/);
  assert.match(navigator, /section\.canMoveDown === false/);
  assert.doesNotMatch(navigator, /section\.index === section\.index \+ 1/);
  assert.match(base, /canMoveUp: index > 0, canMoveDown: index < layoutOrder\.length - 1/);
  assert.match(bembi, /canMoveUp: index > 2, canMoveDown: index < premium\.blocks\.length - 2/);
});

test("BEMBI protected edges and rich structured content remain intact", async () => {
  const bembi = await read("../components/admin/PremiumTemplateEditor.tsx");
  const content = await read("../lib/public-site/premium-kids-content.ts");
  assert.match(bembi, /locked: !capabilities\.reorder/);
  assert.match(bembi, /teacher|teachers/);
  assert.match(bembi, /review|reviews/);
  assert.match(bembi, /faq/);
  assert.match(bembi, /type: "richText"/);
  assert.match(content, /header[\s\S]*hero[\s\S]*footer/);
  assert.match(content, /parsePremiumDelimitedItem/);
  assert.match(content, /serializePremiumDelimitedItem/);
});

test("all eight universal blocks remain available", () => {
  assert.deepEqual([...new Set(PREMIUM_UNIVERSAL_BLOCK_LIBRARY.map(item => item.kind))].sort(), ["collage", "columns", "cta", "features", "media_text", "slider", "text", "video"]);
});
