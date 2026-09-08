import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  PUCK_PRODUCTION_MANIFEST,
  PUCK_PRODUCTION_MANIFEST_BY_ID,
} from "../lib/puck-site-editor/registry-manifest.ts";
import {
  resolvePuckRuntimeRealm,
  shouldUseIframeNativeRuntime,
} from "../lib/puck-site-editor/runtime-realm.ts";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

test("intrinsic flow/content stays intrinsic without a main contain scale", () => {
  const textScatter = PUCK_PRODUCTION_MANIFEST.find((entry) => entry.catalogKey === "control-6:text-scatter-tw")!;
  const blurHighlight = PUCK_PRODUCTION_MANIFEST.find((entry) => entry.catalogKey === "control-3:blur-highlight")!;
  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  const rendererCss = read("components/puck-site-editor/public-renderer.module.css");
  assert.equal(textScatter.host?.profile, "flow");
  assert.equal(textScatter.host?.width, "content");
  assert.equal(textScatter.host?.height, "intrinsic");
  assert.equal(blurHighlight.host?.profile, "flow");
  assert.equal(blurHighlight.host?.width, "content");
  assert.equal(blurHighlight.host?.height, "intrinsic");
  assert.match(renderer, /data-production-content-rail="true"/);
  assert.doesNotMatch(renderer, /data-production-editor-layout-stage|flowContentBoundary|zoom\s*:/);
  assert.doesNotMatch(rendererCss, /editorFlowContentStage|flowContentBoundary|min-height:\s*400px/);
  assert.equal(textScatter.presentationContract?.geometry.kind, "minHeight");
  assert.equal(textScatter.presentationContract?.geometry.minHeight?.value, 400);
  assert.deepEqual(textScatter.presentationContract?.rootLayout, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });
  assert.equal(blurHighlight.presentationContract?.geometry.kind, "intrinsic");
  assert.equal(blurHighlight.presentationContract?.rootLayout, undefined);
});

test("Text Scatter has no ID-specific layout path and Blur Highlight does not inherit its min-height", () => {
  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  const css = read("components/puck-site-editor/public-renderer.module.css");
  assert.doesNotMatch(renderer, /RB_control6_text_scatter|control-6:text-scatter-tw|Text Scatter/);
  assert.doesNotMatch(css, /RB_control6_text_scatter|control-6:text-scatter-tw|Text Scatter/);
  const textScatter = PUCK_PRODUCTION_MANIFEST.find((entry) => entry.catalogKey === "control-6:text-scatter-tw")!;
  const blurHighlight = PUCK_PRODUCTION_MANIFEST.find((entry) => entry.catalogKey === "control-3:blur-highlight")!;
  assert.equal(textScatter.host?.profile, blurHighlight.host?.profile);
  assert.equal(textScatter.host?.width, blurHighlight.host?.width);
  assert.equal(textScatter.host?.height, blurHighlight.host?.height);
  assert.notEqual(textScatter.presentationContract, blurHighlight.presentationContract);
  assert.equal(textScatter.presentationContract?.geometry.minHeight?.value, 400);
  assert.deepEqual(textScatter.presentationContract?.rootLayout, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });
  assert.equal(blurHighlight.presentationContract?.geometry.kind, "intrinsic");
  assert.equal(blurHighlight.presentationContract?.geometry.minHeight, undefined);
  assert.equal(blurHighlight.presentationContract?.rootLayout, undefined);
});

test("Splash Cursor classification is backed by its official browser-global source", () => {
  const source = read("components/react-bits/SplashCursor.tsx");
  const entry = PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_free_splash_cursor");
  assert.ok(entry);
  assert.equal(resolvePuckRuntimeRealm(entry), "iframeNative");
  assert.match(source, /window\.devicePixelRatio/);
  assert.match(source, /requestAnimationFrame\(updateFrame\)/);
  assert.match(source, /window\.addEventListener\('mousemove'/);
  assert.match(source, /document\.body\.addEventListener\('mousemove'/);
  assert.match(source, /document\.body\.addEventListener\('touchstart'/);
  assert.match(source, /getContext\('webgl2',/);
  assert.match(source, /className="fixed top-0 left-0 z-50 pointer-events-none w-full h-full"/);
  assert.doesNotMatch(source, /ownerDocument|createPortal|appendChild|document\.body\.append/);
});

test("Splash Cursor defaults match the official source and are not used as visual compensation", () => {
  const source = read("components/react-bits/SplashCursor.tsx");
  const entry = PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_free_splash_cursor")!;
  assert.equal(entry.defaults.COLOR, "#ff0000");
  assert.equal(entry.defaults.RAINBOW_MODE, true);
  assert.equal(entry.defaults.TRANSPARENT, true);
  assert.equal(entry.defaults.SHADING, true);
  assert.match(source, /SPLAT_FORCE = 6000/);
  assert.match(source, /TRANSPARENT = true/);
  assert.match(source, /RAINBOW_MODE = true/);
  assert.match(source, /COLOR = '#ff0000'/);
  assert.match(source, /return \{ r: r \* 0\.15, g: g \* 0\.15, b: b \* 0\.15 \}/);
  assert.doesNotMatch(read("components/puck-site-editor/public-renderer.tsx"), /SPLAT_FORCE|COLOR_UPDATE_SPEED|opacity|brightness/);
});

test("Magic Rings independently maps to the same browser-realm capability", () => {
  const source = read("components/react-bits/MagicRings.tsx");
  const entry = PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_free_magic_rings");
  assert.ok(entry);
  assert.equal(resolvePuckRuntimeRealm(entry), "iframeNative");
  assert.match(source, /new THREE\.WebGLRenderer/);
  assert.match(source, /mount\.appendChild\(renderer\.domElement\)/);
  assert.match(source, /window\.devicePixelRatio/);
  assert.match(source, /document\.hidden/);
  assert.match(source, /requestAnimationFrame\(animate\)/);
  assert.match(source, /cancelAnimationFrame\(frameId\)/);
  assert.match(source, /window\.addEventListener\('resize'/);
});

test("iframe-native route keeps owner DOM, globals, and RAF in one iframe realm", () => {
  const route = read("app/puck-runtime/page.tsx");
  const frame = read("components/puck-site-editor/production-runtime-frame.tsx");
  assert.match(route, /ownerDocument\.defaultView/);
  assert.match(route, /ownerWindow === globalWindow/);
  assert.match(route, /ownerDocument === globalDocument/);
  assert.match(route, /rafWindow === globalWindow\?\.requestAnimationFrame/);
  assert.match(route, /<Render config=\{PUCK_PRODUCTION_EDITOR_CONFIG\} data=\{data\} \/>/);
  assert.match(frame, /src=\{PUCK_PRODUCTION_RUNTIME_ROUTE\}/);
  assert.match(frame, /target\.postMessage/);
  assert.match(frame, /PUCK_PRODUCTION_RUNTIME_READY_MESSAGE/);
  assert.match(frame, /frame\?\.ownerDocument\.defaultView/);
  assert.match(frame, /event\.source !== target/);
  assert.match(frame, /runtimeMode,\n      \},/);
  assert.match(route, /event\.source === parent \|\| event\.source === window\.top/);
  assert.match(route, /event\.source === window\.top/);
  assert.match(route, /event\.origin !== window\.location\.origin/);
});

test("pointer events stay in the iframe runtime and are never retargeted into the parent", () => {
  const frame = read("components/puck-site-editor/production-runtime-frame.tsx");
  const route = read("app/puck-runtime/page.tsx");
  assert.match(frame, /data-puck-runtime-pointer-events=\{runtimeMode === "authoring" \? "disabled-authoring" : "contained"\}/);
  assert.match(frame, /style=\{\{ pointerEvents: runtimeMode === "authoring" \? "none" : "auto" \}\}/);
  assert.match(route, /data-puck-runtime-pointer-events="local"/);
  assert.doesNotMatch(frame, /dispatchEvent/);
  assert.doesNotMatch(route, /parent\.dispatchEvent/);
});

test("Library browser-heavy previews mount through the generic runtime frame", () => {
  const drawer = read("components/puck-site-editor/product-library-drawer.tsx");
  const frame = read("components/puck-site-editor/production-runtime-frame.tsx");
  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  const previewCss = read("components/puck-site-editor/product-library-drawer.module.css");
  assert.match(drawer, /runtimeMode="library-preview"/);
  assert.match(frame, /PUCK_PRODUCTION_RUNTIME_ROUTE = "\/puck-runtime"/);
  assert.match(renderer, /background=\{effectiveRuntimeMode !== "public"/);
  assert.match(previewCss, /\.previewStage\s*\{[\s\S]*background: #f8fafc/);
  assert.doesNotMatch(drawer, /document\.body\.append|appendChild/);
  assert.doesNotMatch(frame, /document\.body\.append|appendChild/);
});

test("Interact mode is read-only synchronization and does not mutate Puck document data", () => {
  const editor = read("components/puck-site-editor/editor-config.tsx");
  const frame = read("components/puck-site-editor/production-runtime-frame.tsx");
  const route = read("app/puck-runtime/page.tsx");
  assert.match(editor, /runtimeMode=\{puck\?\.dragRef \? "authoring" : "interactive"\}/);
  assert.match(editor, /inline: true/);
  assert.match(frame, /target\.postMessage\(/);
  assert.doesNotMatch(frame, /dispatch\(|setData\(|onChange/);
  assert.match(route, /setData\(event\.data\.data\)/);
  assert.doesNotMatch(route, /dispatch\(|localStorage|sessionStorage/);
});

test("iframe-native sources keep their realm across authoring, Interact, Library, and public surfaces", () => {
  const blurHighlight = PUCK_PRODUCTION_MANIFEST.find((entry) => entry.catalogKey === "control-3:blur-highlight")!;
  const splash = PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_free_splash_cursor")!;
  assert.equal(resolvePuckRuntimeRealm(blurHighlight), "portal");
  assert.equal(shouldUseIframeNativeRuntime(blurHighlight, "authoring"), false);
  assert.equal(shouldUseIframeNativeRuntime(splash, "authoring"), true);
  assert.equal(shouldUseIframeNativeRuntime(splash, "interactive"), true);
  assert.equal(shouldUseIframeNativeRuntime(splash, "library-preview"), true);
  assert.equal(shouldUseIframeNativeRuntime(splash, "public"), true);
});

test("Puck 0.23 keeps native authoring iframe defaults and the production config uses them", () => {
  const puckCore = read("node_modules/@puckeditor/core/dist/chunk-55V3NZVF.mjs");
  const editor = read("components/puck-site-editor/pilot-editor.tsx");
  assert.match(puckCore, /enabled: true,[\s\S]*waitForStyles: true,[\s\S]*syncHostStyles: true/);
  assert.match(editor, /<Puck\s+config=\{PUCK_PRODUCTION_EDITOR_CONFIG\}/);
  assert.doesNotMatch(editor, /iframe=\{\{\s*enabled:\s*false/);
});

test("runtime capability has no component-ID branch and production stays out of editor-lab", () => {
  for (const file of [
    "components/puck-site-editor/public-renderer.tsx",
    "components/puck-site-editor/production-runtime-frame.tsx",
    "app/puck-runtime/page.tsx",
    "lib/puck-site-editor/runtime-realm.ts",
  ]) {
    const source = read(file);
    assert.doesNotMatch(source, /RB_free_splash_cursor|RB_free_magic_rings|Splash Cursor|Magic Rings/);
    assert.doesNotMatch(source, /editor-lab/i);
  }
});

test("registry remains 280 and the official Text Scatter/Splash sources are zero-diff", () => {
  assert.equal(PUCK_PRODUCTION_MANIFEST.length, 280);
  assert.deepEqual(
    PUCK_PRODUCTION_MANIFEST.filter((entry) => entry.runtimeRealm).map((entry) => entry.catalogKey),
    ["current-free:magic-rings", "current-free:splash-cursor"],
  );
  for (const source of [
    "components/react-bits/text-scatter.tsx",
    "components/react-bits/SplashCursor.tsx",
    "components/react-bits/MagicRings.tsx",
  ]) execFileSync("git", ["diff", "--quiet", "HEAD", "--", source], { cwd: root });
});
