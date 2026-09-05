import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  mapParentPointerToIframe,
} from "../components/puck-site-editor/scaled-iframe-interactions.ts";
import {
  PUCK_PRODUCTION_MANIFEST,
  PUCK_PRODUCTION_MANIFEST_BY_ID,
} from "../lib/puck-site-editor/registry-manifest.ts";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

test("scaled iframe mapping subtracts frame origin and uses both transform axes", () => {
  assert.deepEqual(
    mapParentPointerToIframe(
      { clientX: 350, clientY: 220 },
      { left: 100, top: 20 },
      { x: 0.5, y: 0.25 },
    ),
    { clientX: 500, clientY: 800 },
  );
});

test("click-like retargeting preserves the proven scaled iframe coordinate conversion", () => {
  const interactions = read("components/puck-site-editor/scaled-iframe-interactions.ts");
  assert.match(interactions, /const frame = view\?\.frameElement as HTMLElement \| null/);
  assert.match(interactions, /const frameRect = frame\.getBoundingClientRect\(\)/);
  assert.match(interactions, /const scaleX = frame\.offsetWidth > 0/);
  assert.match(interactions, /const scaleY = frame\.offsetHeight > 0/);
  assert.match(interactions, /const clientX = event\.clientX \/ scaleX/);
  assert.match(interactions, /const clientY = event\.clientY \/ scaleY/);
  assert.match(interactions, /const eventTypes = \["pointerdown", "pointerup", "click"\] as const/);
  assert.doesNotMatch(interactions, /eventTypes = \[[\s\S]*pointermove/);
  assert.doesNotMatch(interactions, /eventTypes = \[[\s\S]*pointerenter/);
  assert.doesNotMatch(interactions, /eventTypes = \[[\s\S]*mousemove/);
});

test("full-surface presentation metadata is consumed by the single production host", () => {
  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  assert.match(renderer, /const fallbackHeight = entry\.definiteHeight/);
  assert.match(renderer, /const shouldRenderHost = Boolean\(spec \|\| fallbackHeight \|\| presentationGeometry \|\| isWrapperTarget\)/);
  assert.match(renderer, /presentationContract\?\.technicalRuntime/);
  assert.match(renderer, /runtimeMode !== "public" && presentationContract\?\.editorPresentationDefault/);
  assert.match(renderer, /runtimeMode === "library-preview" && isFullSurface/);
  assert.match(renderer, /style\.height = fallbackHeight/);
  assert.match(renderer, /style\.minHeight = fallbackHeight/);
  assert.doesNotMatch(renderer, /runtimeFamily === "full-surface" \? 480/);

  for (const id of ["RB_frame_border", "RB_light_droplets", "RB_lightspeed"]) {
    const entry = PUCK_PRODUCTION_MANIFEST_BY_ID.get(id);
    assert.ok(entry, id);
    assert.equal(entry.presentationContract?.geometry.kind, "fullSurface", id);
    assert.equal(entry.presentationContract?.sourceGeometry?.definiteParent?.required, true, id);
    assert.equal(entry.presentationContract?.editorPresentationDefault, undefined, id);
    assert.equal(entry.presentationContract?.technicalRuntime?.height.value, 480, id);
    if (id === "RB_frame_border") {
      assert.deepEqual(entry.presentationContract?.geometry.aspectRatio, {
        value: 1.64,
        provenance: "editorPresentationDefault",
      });
    } else {
      assert.equal(entry.presentationContract?.geometry.aspectRatio, undefined, id);
    }
  }
});

test("intrinsic flow and marketing entries do not inherit animated full-surface sizing", () => {
  const textScatter = PUCK_PRODUCTION_MANIFEST.find((entry) => entry.catalogKey === "control-6:text-scatter-tw")!;
  const marketing = PUCK_PRODUCTION_MANIFEST.find((entry) => entry.catalogKey === "pro-block:cta-9")!;
  assert.equal(textScatter.host?.profile, "flow");
  assert.equal(textScatter.runtimeFamily, null);
  assert.equal(marketing.sourceKind, "pro-block");
  assert.equal(marketing.host?.profile, "section");
  assert.equal(marketing.runtimeFamily, null);
});

test("the source renders directly through the single production host", () => {
  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  const css = read("components/puck-site-editor/public-renderer.module.css");
  assert.match(renderer, /<ProductionSourceHost entry=\{entry\} backgroundRouting=\{backgroundRouting\} runtimeMode=\{effectiveRuntimeMode\}>/);
  assert.match(renderer, /data-production-host-profile=/);
  assert.doesNotMatch(renderer, /data-production-source-boundary|styles\.sourceBoundary/);
  assert.doesNotMatch(css, /\.sourceBoundary/);
  assert.doesNotMatch(renderer, /__r3f|MutationObserver|ResizeObserver|state\.setSize/);
  assert.doesNotMatch(renderer, /RB_frame_border|component:frame-border|Dot Shift/);
});

test("production preview taxonomy remains generic and complete", () => {
  assert.equal(PUCK_PRODUCTION_MANIFEST.length, 280);
  assert.equal(
    PUCK_PRODUCTION_MANIFEST.filter((entry) => entry.host?.profile === "canvas").length > 0,
    true,
  );
  assert.equal(
    PUCK_PRODUCTION_MANIFEST.filter((entry) => entry.host?.profile === "section").length > 0,
    true,
  );
  assert.equal(
    PUCK_PRODUCTION_MANIFEST.filter((entry) => entry.host?.profile === "flow").length > 0,
    true,
  );
  for (const file of [
    "components/puck-site-editor/public-renderer.tsx",
    "components/puck-site-editor/production-editor-ux.tsx",
    "components/puck-site-editor/product-library-drawer.tsx",
  ]) {
    assert.doesNotMatch(read(file), /reactbits\.glow-cursor|RB_batch10_cursor_wave|text_scatter|Text Scatter/i, file);
  }
});

test("production public renderer owns theme scope outside component content", () => {
  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  const ux = read("components/puck-site-editor/production-editor-ux.tsx");
  assert.match(renderer, /data-puck-preview-theme=\{theme\}/);
  assert.match(renderer, /theme === "dark" \? "dark" : "light"/);
  assert.match(ux, /document\.documentElement/);
  assert.match(ux, /root\.classList\.toggle\("dark", isDark\)/);
  assert.doesNotMatch(ux, /component\.props|PuckDocument|localStorage/);
});

test("production canvas and Library preview roots receive theme synchronously", () => {
  const ux = read("components/puck-site-editor/production-editor-ux.tsx");
  const drawer = read("components/puck-site-editor/product-library-drawer.tsx");
  assert.match(ux, /data-puck-preview-theme=\{isDark \? "dark" : "light"\}/);
  assert.match(ux, /className=\{`\$\{styles\.editableRoot\} \$\{isDark \? `\$\{styles\.editableRootDark\} dark` : ""\}`\}/);
  assert.match(ux, /useLayoutEffect\(\(\) =>/);
  assert.match(drawer, /className=\{`\$\{styles\.preview\} \$\{isDark \? `\$\{styles\.darkPreview\} dark` : ""\}`\}/);
});

test("generic production surface remains transparent and loading geometry follows presentation metadata", () => {
  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  const drawer = read("components/puck-site-editor/product-library-drawer.tsx");
  assert.match(renderer, /"--puck-block-background": "transparent"/);
  assert.doesNotMatch(renderer, /"--puck-block-background": String\(props\.backgroundColor/);
  assert.match(renderer, /entry\.presentationContract\?\.geometry\.minHeight\?\.value/);
  assert.doesNotMatch(renderer, /runtimeFamily === "full-surface" \? 480/);
  assert.match(renderer, /data-production-component-loading style=\{\{ minHeight: loadingHeight \}\}/);
  assert.match(drawer, /Keep the current live source visible while the replacement lazy source\s*\/\/\s*resolves/);
  const showPreview = drawer.slice(drawer.indexOf("const showPreview"), drawer.indexOf("const toggleCategory"));
  assert.doesNotMatch(showPreview, /setActiveId\(null\);/);
});

test("Glow Cursor keeps its native movement stream on the official source root", () => {
  const interactions = read("components/puck-site-editor/scaled-iframe-interactions.ts");
  const glowCursor = read("components/react-bits/GlowCursor.tsx");
  assert.match(glowCursor, /container\.addEventListener\('pointermove', updatePointer\)/);
  assert.match(glowCursor, /container\.addEventListener\('pointerenter', updatePointer\)/);
  assert.match(interactions, /const eventTypes = \["pointerdown", "pointerup", "click"\] as const/);
  assert.doesNotMatch(interactions, /addEventListener\("pointermove"/);
  assert.doesNotMatch(interactions, /addEventListener\("pointerenter"/);
});
