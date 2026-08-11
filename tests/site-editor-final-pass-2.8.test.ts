import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { translateAdmin } from "../lib/i18n/admin.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("shared inspector and universal block settings follow the Admin locale", async () => {
  assert.equal(translateAdmin("ru", "Content and appearance"), "Содержимое и оформление");
  assert.equal(translateAdmin("en", "Content and appearance"), "Content and appearance");
  assert.equal(translateAdmin("ru", "Media height"), "Высота медиа");
  assert.equal(translateAdmin("en", "Media height"), "Media height");

  const inspector = await read("../components/admin/SharedEditorInspector.tsx");
  const universal = await read("../components/admin/PremiumUniversalBlockSettings.tsx");
  for (const source of [inspector, universal]) assert.doesNotMatch(source, /[А-Яа-яЁё]/);
  assert.match(inspector, /content: t\("Content and appearance"\)/);
  assert.match(universal, /buildPremiumUniversalInspectorFields\(\{ block, disabled, onChange, onChooseImage, t \}/);
  assert.match(universal, /t\("Image for card \{count\}"/);
});

test("Standard and BEMBI navigator rows expose their implemented move actions", async () => {
  const standard = await read("../app/admin/site/page.tsx");
  const bembi = await read("../components/admin/PremiumTemplateEditor.tsx");

  assert.match(standard, /capabilities: \{ select: true, visibility: true, duplicate: true, delete: true, reorder: true, move: true \}/);
  assert.match(standard, /onMove: \(direction: -1 \| 1\) => movePageBlock\(block\.id, direction\)/);
  assert.match(standard, /onMove: \(direction: -1 \| 1\) => moveLayoutItem\(item, direction\)/);
  assert.match(bembi, /capabilities: \{ select: true, visibility: true, duplicate: true, delete: true, reorder: true, move: true \}/);
  assert.match(bembi, /onMove: \(direction: -1 \| 1\) => \{ const next = \[\.\.\.blocks\]/);
});

test("desktop panel state controls the unified workspace and compact controls stay separate", async () => {
  const runtime = await read("../components/admin/TemplateEditorRuntime.tsx");
  const globals = await read("../app/globals.css");
  const spec = await read("../lib/public-site/editor-spec.ts");

  assert.match(spec, /expanded\?: boolean/);
  assert.match(spec, /onExpandedChange\?: \(expanded: boolean\) => void/);
  assert.match(runtime, /data-template-editor-columns/);
  assert.match(runtime, /data-navigator-open=\{String\(navigatorOpen\)\}/);
  assert.match(runtime, /data-settings-open=\{String\(settingsOpen\)\}/);
  assert.match(runtime, /aria-controls="site-editor-blocks-panel"/);
  assert.match(runtime, /aria-controls="site-editor-settings-panel"/);
  assert.match(runtime, /onCollapse: \(\) => \{ setCompactPanel\(null\); setNavigatorOpen\(false\)/);
  assert.match(runtime, /onCollapse: \(\) => \{ setCompactPanel\(null\); setSettingsOpen\(false\)/);
  assert.match(runtime, /setNavigatorOpen\(false\)/);
  assert.match(runtime, /setSettingsOpen\(false\)/);
  assert.match(globals, /@media \(min-width: 1024px\)/);
  assert.match(globals, /data-navigator-open="false"/);
  assert.match(globals, /data-settings-open="false"/);
});

test("block library behaves as an accessible modal", async () => {
  const library = await read("../components/admin/EditorBlockLibrary.tsx");
  assert.match(library, /event\.key === "Escape"/);
  assert.match(library, /event\.key !== "Tab"/);
  assert.match(library, /document\.body\.style\.overflow = "hidden"/);
  assert.match(library, /previousActiveRef\.current\?\.focus\(\)/);
  assert.match(library, /role="dialog" aria-modal="true" aria-labelledby="editor-block-library-title"/);
});
