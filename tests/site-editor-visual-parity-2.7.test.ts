import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("Premium capability contract preserves shared universal visual controls", async () => {
  const source = await read("../lib/public-site/custom-block-registry.ts");
  assert.match(source, /runtime === "standard" \|\| runtime === "premium"/);
  assert.match(source, /kind === "slider" \|\| kind === "video" \|\| kind === "media_text" \|\| kind === "collage"/);
  assert.match(source, /mediaSizing: supported && mediaSizing/);
  assert.match(source, /kind === "media_text" \|\| kind === "collage"/);
});

test("shared visual tokens contain every Site Editor 2.7 token group", async () => {
  const source = await read("../lib/public-site/visual-tokens.ts");
  for (const token of ["blockContentWidth", "blockSpacing", "blockSectionHeight", "blockMediaWidth", "blockMediaAspect", "blockMediaHeight", "blockMediaFit"]) assert.match(source, new RegExp(`export const ${token}`));
});

test("Standard and GLOSS Hero use the shared runtime helpers", async () => {
  for (const file of ["../components/public/PublicBusinessSite.tsx", "../components/public/GlossBusinessSite.tsx"]) {
    const source = await read(file);
    assert.match(source, /publicSystemSectionAnimation\(content, "hero"\)/);
    assert.match(source, /publicSystemSectionClass\(content, "hero"/);
    assert.match(source, /publicSystemSectionContentClass\(content, "hero"/);
    assert.match(source, /publicSystemSectionStyle\(content, "hero"/);
  }
});

test("sparse Hero layout overrides remain guarded by raw stored settings", async () => {
  const source = await read("../lib/public-site/system-sections.ts");
  assert.match(source, /rawSettings\.padding_top/);
  assert.match(source, /rawSettings\.padding_bottom/);
  assert.match(source, /rawSettings\.section_height/);
  assert.match(source, /const alignment = !rawSettings\.text_align/);
  assert.match(source, /replace\(\/\["\\\\\]\/g, "\\\\\$&"\)/);
});

test("editor panes retain independent scrolling and reachable settings", async () => {
  const runtime = await read("../components/admin/TemplateEditorRuntime.tsx");
  const premium = await read("../app/globals.css");
  assert.match(runtime, /TEMPLATE_EDITOR_SETTINGS_CLASS/);
  assert.match(runtime, /EditorSettingsFrame[\s\S]*overflow-y-auto overscroll-contain/);
  assert.match(premium, /template-editor-settings \{ display: block; order: initial; max-height: calc\(100vh - 110px\); overflow-y: auto; \}/);
});
