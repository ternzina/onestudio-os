import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("shared editor reserves Add block for library insertion and Duplicate block for clone handlers", async () => {
  const [siteEditor, premiumEditor, navigator, translations] = await Promise.all([
    read("../app/admin/site/page.tsx"),
    read("../components/admin/PremiumTemplateEditor.tsx"),
    read("../components/admin/SharedEditorNavigator.tsx"),
    read("../lib/i18n/admin.ts"),
  ]);

  assert.match(siteEditor, /addBlock:.*label: t\("\+ Add block"\).*setLibraryOpen\(true\)/);
  assert.match(siteEditor, /id: "duplicate", label: t\("Duplicate block"\).*duplicateCustomBlock/);
  assert.match(siteEditor, /contextualAction: \{ id: "duplicate", label: `⧉ \$\{t\("Duplicate block"\)\}`.*duplicateCustomBlock/);
  assert.match(premiumEditor, /addBlock: \{ label: t\("\+ Add block"\).*setShowLibrary\(true\)/);
  assert.match(premiumEditor, /id: "duplicate", label: t\("Duplicate block"\).*duplicate\(selectedBlock\)/);
  assert.match(navigator, /onClick=\{section\.onDuplicate\} aria-label=\{t\("Duplicate block"\)\}/);
  assert.match(translations, /"\+ Add block": "\+ Добавить блок"/);
  assert.match(translations, /"Duplicate block": "Дублировать блок"/);
});

test("shared custom block preview exposes the canonical scroll identity", async () => {
  const [customBlock, reveal] = await Promise.all([
    read("../components/public/PublicCustomBlock.tsx"),
    read("../components/public/PublicReveal.tsx"),
  ]);

  assert.match(customBlock, /data-editor-anchor=\{`custom:\$\{block\.id\}`\}/);
  assert.match(customBlock, /editorAnchor=\{`custom:\$\{block\.id\}`\}/);
  assert.match(reveal, /data-editor-anchor=\{editorAnchor\}/);
});
