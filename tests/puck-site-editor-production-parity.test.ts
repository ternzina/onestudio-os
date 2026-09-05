import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { PUCK_PRODUCTION_MANIFEST } from "../lib/puck-site-editor/registry-manifest.ts";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

test("production owns the recovered canvas theme boundary without changing content data", () => {
  const ux = read("components/puck-site-editor/production-editor-ux.tsx");
  const pilot = read("components/puck-site-editor/pilot-editor.tsx");
  const styles = read("components/puck-site-editor/pilot-editor.module.css");
  const globals = read("app/globals.css");
  assert.match(ux, /createContext\(false\)/);
  assert.match(ux, /useState\(false\)/);
  assert.match(ux, /data-theme=\{isDark \? "dark" : "light"\}/);
  assert.match(ux, /data-production-editor-canvas/);
  assert.match(ux, /ProductionPuckCanvasRoot/);
  assert.doesNotMatch(ux, /setData|backgroundColor/);
  assert.match(pilot, /rootTheme/);
  assert.doesNotMatch(ux, /localStorage|sessionStorage/);
  assert.match(globals, /prefers-color-scheme:\s*dark/);
  assert.match(styles, /--puck-canvas-color-bg:\s*#fff/);
  assert.match(styles, /:global\(body\):has\(\.editableRoot\)\s*\{[\s\S]*background:\s*#fff/);
});

test("production owns the paired library cards and hover live preview boundary", () => {
  const drawer = read("components/puck-site-editor/product-library-drawer.tsx");
  const styles = read("components/puck-site-editor/product-library-drawer.module.css");
  assert.match(drawer, /function ProductionLibraryPreview/);
  assert.match(drawer, /setTimeout\(\(\) => \{/);
  assert.match(drawer, /onPointerEnter=\{\(\) => showPreview\(entry\.id\)\}/);
  assert.match(drawer, /data-preview-kind=\{entry\.sourceKind\}/);
  assert.match(drawer, /PuckProductionBlock component=\{component\}/);
  assert.match(drawer, /entry\.catalogKey\.startsWith\("pro-block:"\)/);
  assert.doesNotMatch(drawer, /styles\.tierBadge|<span>\{entry\.sourceTier\}/);
  assert.doesNotMatch(styles, /tierBadge|data-tier/);
  assert.match(styles, /\.libraryGrid\s*\{[\s\S]*grid-template-columns: repeat\(2,/);
  assert.match(styles, /\.preview\s*\{/);
});

test("production library keeps internal tier metadata without presenting tier badges", () => {
  assert.equal(PUCK_PRODUCTION_MANIFEST.length, 280);
  assert.equal(PUCK_PRODUCTION_MANIFEST.every((entry) => entry.sourceTier === "FREE" || entry.sourceTier === "PRO"), true);
  const drawer = read("components/puck-site-editor/product-library-drawer.tsx");
  assert.match(drawer, /sourceTier: entry\.sourceTier/);
  assert.doesNotMatch(drawer, /className=\{styles\.tierBadge\}/);
});

test("production preview contains intrinsic sources and direct-fills full-surface sources", () => {
  const drawer = read("components/puck-site-editor/product-library-drawer.tsx");
  const fit = read("components/puck-site-editor/production-preview-fit.tsx");
  const styles = read("components/puck-site-editor/product-library-drawer.module.css");
  assert.match(drawer, /<ProductionPreviewViewport presentation=\{entry\.presentationContract\}>/);
  assert.match(drawer, /entry\.presentationContract\?\.geometry\.kind === "fullSurface"/);
  assert.match(drawer, /data-production-preview-fill="direct"/);
  assert.match(fit, /presentation\?\.editorPresentationDefault\?\.width\.value/);
  assert.match(fit, /scene\.style\.height = `\$\{sceneHeight\}px`/);
  assert.match(fit, /data-production-preview-fit="canonical-contain"/);
  assert.match(fit, /scene\.scrollHeight/);
  assert.match(fit, /editorWindow\?\.innerWidth/);
  assert.match(styles, /\.previewMount\[data-preview-kind="component"\] > div \{[\s\S]*width: 100%;[\s\S]*min-width: 0;/);
  assert.match(styles, /\.previewMount\[data-production-preview-fill="direct"\] \{[\s\S]*height: 100%;/);
  assert.match(styles, /\.previewMount\[data-production-preview-fill="direct"\] > \* \{[\s\S]*min-height: 100%;/);
});

test("production parity code has no dependency on the experimental implementation", () => {
  for (const file of [
    "components/puck-site-editor/production-editor-ux.tsx",
    "components/puck-site-editor/product-library-drawer.tsx",
    "components/puck-site-editor/product-library-drawer.module.css",
    "components/puck-site-editor/production-preview-fit.tsx",
    "components/puck-site-editor/production-preview-fit.module.css",
    "components/puck-site-editor/production-color-field.ts",
    "components/puck-site-editor/production-editor-locale.ts",
    "components/puck-site-editor/pilot-editor.module.css",
    "lib/puck-site-editor/preview-fit.ts",
  ]) {
    assert.doesNotMatch(read(file), /editor-lab/i, file);
  }
});

test("the recovered preview is a live source render, not a regenerated screenshot thumbnail", () => {
  const drawer = read("components/puck-site-editor/product-library-drawer.tsx");
  assert.match(drawer, /data-preview-kind/);
  assert.match(drawer, /PuckProductionBlock/);
  assert.match(read("components/puck-site-editor/public-renderer.tsx"), /data-production-host-profile/);
  assert.doesNotMatch(read("components/puck-site-editor/public-renderer.tsx"), /data-production-source-boundary/);
  assert.doesNotMatch(drawer, /screenshot|html2canvas|toDataURL/);
});
