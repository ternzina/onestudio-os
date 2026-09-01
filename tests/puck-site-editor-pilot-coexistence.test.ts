import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  PUCK_PRODUCTION_MANIFEST,
} from "../lib/puck-site-editor/registry-manifest.ts";
import {
  PUCK_PRODUCTION_RUNTIME_EXCLUSIONS,
} from "../lib/puck-site-editor/runtime-exclusions.ts";
import {
  PRODUCT_LIBRARY_CATEGORY_ORDER,
} from "../lib/puck-site-editor/product-library.ts";

const root = path.resolve(import.meta.dirname, "..");
const ids = new Set(PUCK_PRODUCTION_MANIFEST.map((entry) => entry.id));

test("pilot library exposes the complete approved production set without blocked sources", () => {
  assert.equal(PUCK_PRODUCTION_MANIFEST.length, 280);
  for (const required of [
    "RB_batch10_hero_7",
    "RB_social_proof_3",
    "RB_batch2_social_proof_4",
    "RB_batch5_magic_transform",
  ]) assert.equal(ids.has(required), true, required);
  assert.equal(ids.has("reactbits.hero-24"), false);
  assert.equal([...ids].some((id) => /ballpit/i.test(id)), false);
  for (const entry of PUCK_PRODUCTION_MANIFEST) {
    assert.equal(entry.label.startsWith("React Bits "), false, entry.id);
    assert.equal(PRODUCT_LIBRARY_CATEGORY_ORDER.includes(entry.taxonomy), true, entry.id);
  }
  for (const blocked of PUCK_PRODUCTION_RUNTIME_EXCLUSIONS) {
    assert.equal(ids.has(blocked.id), false, blocked.id);
  }
});

test("pilot uses local scoped persistence and production renderer without changing the current Site Editor", () => {
  const editor = fs.readFileSync(path.join(root, "components/puck-site-editor/pilot-editor.tsx"), "utf8");
  const library = fs.readFileSync(path.join(root, "components/puck-site-editor/product-library-drawer.tsx"), "utf8");
  const preview = fs.readFileSync(path.join(root, "components/puck-site-editor/pilot-public-preview.tsx"), "utf8");
  const store = fs.readFileSync(path.join(root, "lib/puck-site-editor/client-local-store.ts"), "utf8");
  const currentEditor = fs.readFileSync(path.join(root, "app/admin/site/page.tsx"), "utf8");

  assert.doesNotMatch(editor, /components\/editor-lab/);
  assert.match(editor, /plugins=\{plugins\}/);
  assert.match(editor, /label: "Библиотека"/);
  assert.match(editor, /"plugin-blocks": "Блоки"/);
  assert.match(editor, /"plugin-outline": "Структура"/);
  assert.match(library, /<Drawer\.Item name=\{entry\.id\} label=\{entry\.label\} \/>/);
  assert.match(library, /type: "insert"/);
  assert.doesNotMatch(library, /drawer: PuckPilotProductLibrary/);
  assert.match(editor, /writeLocalPuckDocument\("draft"/);
  assert.match(editor, /writeLocalPuckDocument\("published"/);
  assert.match(preview, /PuckPublicRenderer/);
  assert.match(store, /businessId.*locale.*pageId/s);
  assert.match(store, /onestudio:puck-pilot:.*:v1:/);
  assert.doesNotMatch(currentEditor, /puck-pilot/);
});

test("admin sidebar defers browser-only preference until after hydration", () => {
  const sidebar = fs.readFileSync(path.join(root, "components/admin/AdminSidebar.tsx"), "utf8");
  assert.match(sidebar, /const \[mounted, setMounted\] = useState\(false\)/);
  assert.match(sidebar, /setCollapsed\(stored === "true"\)/);
  assert.match(sidebar, /if \(!mounted\) return/);
  assert.match(sidebar, /mounted && collapsed \? "-translate-x-full" : "translate-x-0"/);
  assert.doesNotMatch(sidebar, /suppressHydrationWarning/);
});

test("admin pilot remains flag-gated and retains separate editor and public preview routes", () => {
  const route = fs.readFileSync(path.join(root, "app/admin/site/puck-pilot/page.tsx"), "utf8");
  const preview = fs.readFileSync(path.join(root, "app/admin/site/puck-pilot/preview/page.tsx"), "utf8");
  assert.match(route, /isPuckSiteEditorPilotEnabled/);
  assert.match(route, /list_my_businesses/);
  assert.match(route, /PuckPilotEditor/);
  assert.match(preview, /isPuckSiteEditorPilotEnabled/);
  assert.match(preview, /PuckPilotPublicPreview/);
});
