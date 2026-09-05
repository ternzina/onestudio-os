import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  calculateProductionPreviewFit,
  resolveProductionPreviewSceneSize,
} from "../lib/puck-site-editor/preview-fit.ts";
import {
  PUCK_PRODUCTION_MANIFEST_BY_ID,
} from "../lib/puck-site-editor/registry-manifest.ts";
import {
  PUCK_PRODUCTION_AUTHORING_UI,
  PUCK_PRODUCTION_AUTHORING_VIEWPORT_HEIGHT,
} from "../lib/puck-site-editor/authoring-viewport.ts";
import { resolvePuckMainLogicalViewportWidth } from "../lib/puck-site-editor/main-responsive-geometry.ts";
import {
  resolvePuckProductionAuthoringStage,
  resolvePuckProductionPresentationStyle,
} from "../lib/puck-site-editor/presentation-runtime.ts";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const entry = (id: string) => {
  const found = PUCK_PRODUCTION_MANIFEST_BY_ID.get(id);
  assert.ok(found, id);
  return found;
};

const representatives = [
  { id: "RB_batch2_bending_marquee", source: "components/react-bits/bending-marquee.tsx", runtimeRisk: "resize-observer" },
  { id: "RB_batch2_card_spread", source: "components/react-bits/card-spread.tsx", runtimeRisk: "resize-observer" },
  { id: "RB_batch2_tilted_tiles", source: "components/react-bits/tilted-tiles.tsx", runtimeRisk: "dom" },
] as const;

test("DOM/motion representatives share the same definite full-surface stage contract", () => {
  for (const representative of representatives) {
    const item = entry(representative.id);
    assert.deepEqual(item.host, {
      profile: "canvas",
      width: "full",
      height: "technical-definite",
      technicalHeight: { value: 520, provenance: "puck-technical" },
      runtimeRisk: representative.runtimeRisk,
    }, representative.id);
    assert.deepEqual(item.presentationContract?.sourceGeometry, {
      width: { value: "100%", provenance: "source" },
      height: { value: "100%", provenance: "source" },
      definiteParent: { required: true, provenance: "source" },
    }, representative.id);
    assert.equal(item.presentationContract?.geometry.kind, "fullSurface", representative.id);
    assert.equal(item.presentationContract?.technicalRuntime?.height.value, 520, representative.id);
    assert.equal(item.presentationContract?.overflow, "clip", representative.id);
    assert.equal(item.presentationContract?.rootLayout, undefined, representative.id);
    execFileSync("git", ["diff", "--quiet", "HEAD", "--", representative.source], { cwd: root });
  }
});

test("source roots keep their own measurement, containing-block, and transform semantics", () => {
  const bending = read("components/react-bits/bending-marquee.tsx");
  assert.match(bending, /relative flex h-full w-full items-center justify-center overflow-hidden/);
  assert.match(bending, /new ResizeObserver/);
  assert.match(bending, /rect\.width/);
  assert.match(bending, /rect\.height/);
  assert.match(bending, /transformStyle: "preserve-3d"/);
  assert.match(bending, /transformOrigin: facet\.origin/);
  assert.doesNotMatch(bending, /getBoundingClientRect/);
  assert.match(bending, /panelHeight = 520/);

  const cards = read("components/react-bits/card-spread.tsx");
  assert.match(cards, /relative flex h-full w-full items-center justify-center overflow-hidden/);
  assert.match(cards, /new ResizeObserver/);
  assert.match(cards, /useEffect/);
  assert.doesNotMatch(cards, /useLayoutEffect/);
  assert.doesNotMatch(cards, /ownerDocument\.defaultView\?\.ResizeObserver/);
  assert.doesNotMatch(cards, /const initial = node\.getBoundingClientRect\(\)/);
  assert.match(cards, /width\s*\/\s*geometry\.frame\.width/);
  assert.match(cards, /height\s*\/\s*geometry\.frame\.height/);
  assert.match(cards, /className="absolute"/);
  assert.match(cards, /transformOrigin: `50% \$\{orbit\}px`/);
  assert.match(cards, /cardWidth = 168/);
  assert.match(cards, /cardHeight = 252/);

  const tiles = read("components/react-bits/tilted-tiles.tsx");
  assert.match(tiles, /className=\{cn\("relative overflow-hidden"/);
  assert.match(tiles, /new ResizeObserver/);
  assert.match(tiles, /node\.clientWidth/);
  assert.match(tiles, /node\.clientHeight/);
  assert.match(tiles, /className="absolute left-1\/2 top-1\/2 grid"/);
  assert.match(tiles, /transformTemplate=\{composeTransform\}/);
  assert.match(tiles, /getBoundingClientRect/);
  assert.match(tiles, /width = "100%"/);
  assert.match(tiles, /height = "100%"/);
  assert.match(tiles, /width: `\$\{planeWidth\}%`/);
  assert.match(tiles, /height: `\$\{planeHeight\}%`/);
});

test("Card Spread main uses the selected logical Puck width, not the Library scene width", () => {
  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  const config = read("components/puck-site-editor/editor-config.tsx");
  const cards = read("components/react-bits/card-spread.tsx");
  const widths = [1280, 768, 390];

  for (const width of widths) {
    assert.equal(resolvePuckMainLogicalViewportWidth(width), width);
    const centersAtZoom = [0.5, 1, 2].map(() => resolvePuckMainLogicalViewportWidth(width)! / 2);
    assert.deepEqual(centersAtZoom, [width / 2, width / 2, width / 2]);
  }
  assert.equal(resolvePuckMainLogicalViewportWidth("100%"), undefined);
  assert.match(config, /state\.appState\.ui\.viewports\.current\.width/);
  assert.match(config, /mainViewportWidth=\{viewportWidth\}/);
  assert.match(renderer, /mainLogicalViewportWidth = effectiveRuntimeMode !== "library-preview" && isFullSurface/);
  assert.match(renderer, /width: mainLogicalViewportWidth/);
  assert.match(renderer, /marginInline: mainLogicalViewportWidth === undefined \? undefined : 0/);
  assert.match(cards, /className=\{cn\(\n        "relative flex h-full w-full items-center justify-center overflow-hidden"/);
  assert.match(cards, /width\s*\/\s*geometry\.frame\.width/);
  assert.doesNotMatch(cards, /innerWidth|authoredWidth|translateX\(/);
});

test("MINI and MAIN use the same logical motion stage while MINI only scales the scene", () => {
  for (const representative of representatives) {
    const item = entry(representative.id);
    assert.deepEqual(resolvePuckProductionAuthoringStage(item.presentationContract), {
      width: PUCK_PRODUCTION_AUTHORING_UI.current.width,
      height: PUCK_PRODUCTION_AUTHORING_VIEWPORT_HEIGHT,
    }, representative.id);
    const scene = resolveProductionPreviewSceneSize({
      availableWidth: 598,
      availableHeight: 390,
      sourceWidth: 1440,
      sourceHeight: 900,
      measuredSceneHeight: 390,
      presentation: item.presentationContract,
    });
    assert.deepEqual(scene, {
      width: PUCK_PRODUCTION_AUTHORING_UI.current.width,
      height: PUCK_PRODUCTION_AUTHORING_VIEWPORT_HEIGHT,
    }, representative.id);
    const fit = calculateProductionPreviewFit({
      availableWidth: 598,
      availableHeight: 390,
      sceneWidth: scene.width,
      sceneHeight: scene.height,
    });
    assert.equal(fit.width, PUCK_PRODUCTION_AUTHORING_UI.current.width, representative.id);
    assert.equal(fit.height, PUCK_PRODUCTION_AUTHORING_VIEWPORT_HEIGHT, representative.id);
    assert.equal(fit.width * fit.scale <= 598, true, representative.id);
    assert.equal(fit.height * fit.scale <= 390, true, representative.id);
  }

  const tilted = entry("RB_batch2_tilted_tiles");
  assert.equal(tilted.presentationContract?.editorPresentationDefault, undefined);
  assert.equal(tilted.presentationContract?.technicalRuntime?.height.value, 520);

  const scrollStack = entry("RB_batch4_scroll_stack");
  assert.deepEqual(resolveProductionPreviewSceneSize({
    availableWidth: 598,
    availableHeight: 390,
    sourceWidth: 1440,
    sourceHeight: 900,
    measuredSceneHeight: 800,
    presentation: scrollStack.presentationContract,
  }), { width: 1440, height: 900 });

  const textScatter = entry("RB_control6_text_scatter");
  assert.deepEqual(resolveProductionPreviewSceneSize({
    availableWidth: 598,
    availableHeight: 390,
    sourceWidth: 1440,
    sourceHeight: 900,
    measuredSceneHeight: 390,
    presentation: textScatter.presentationContract,
  }), { width: 1440, height: 400 });
});

test("shared authoring stage precedence separates visual geometry from technical runtime", () => {
  const generic = entry("RB_batch2_bending_marquee");
  assert.deepEqual(resolvePuckProductionPresentationStyle(generic.presentationContract, "authoring"), {
    height: PUCK_PRODUCTION_AUTHORING_VIEWPORT_HEIGHT,
    minHeight: PUCK_PRODUCTION_AUTHORING_VIEWPORT_HEIGHT,
    overflow: "hidden",
  });
  assert.deepEqual(resolvePuckProductionPresentationStyle(generic.presentationContract, "public"), {
    height: 520,
    minHeight: 520,
    overflow: "hidden",
  });

  const explicit = {
    target: "componentRoot",
    overflow: "clip",
    provenance: "source",
    technicalRuntime: { height: { value: 520, provenance: "technicalRuntime" } },
    editorPresentationDefault: {
      width: { value: 1440, provenance: "editorPresentationDefault" },
      height: { value: 600, provenance: "editorPresentationDefault" },
    },
    geometry: { kind: "fullSurface" },
  } as const;
  assert.deepEqual(resolvePuckProductionAuthoringStage(explicit), { width: 1440, height: 600 });
  assert.deepEqual(resolveProductionPreviewSceneSize({
    availableWidth: 598,
    availableHeight: 390,
    sourceWidth: 390,
    sourceHeight: 390,
    measuredSceneHeight: 390,
    presentation: explicit,
  }), { width: 1440, height: 600 });

  const frame = entry("RB_frame_border");
  const frameStage = resolvePuckProductionAuthoringStage(frame.presentationContract);
  assert.ok(frameStage);
  assert.equal(frameStage.width, 1280);
  assert.equal(frameStage.height, 1280 / 1.64);
  assert.deepEqual(resolvePuckProductionPresentationStyle(frame.presentationContract, "authoring"), {
    aspectRatio: 1.64,
    overflow: "hidden",
  });

  const lightspeed = entry("RB_lightspeed");
  const flicker = entry("RB_batch5_flicker");
  for (const control of [lightspeed, flicker]) {
    assert.equal(control.presentationContract?.geometry.kind, "fullSurface", control.id);
    assert.equal(control.presentationContract?.technicalRuntime?.height.value, 480, control.id);
    assert.deepEqual(resolvePuckProductionAuthoringStage(control.presentationContract), {
      width: PUCK_PRODUCTION_AUTHORING_UI.current.width,
      height: PUCK_PRODUCTION_AUTHORING_VIEWPORT_HEIGHT,
    }, control.id);
    assert.deepEqual(resolvePuckProductionPresentationStyle(control.presentationContract, "public"), {
      height: 480,
      minHeight: 480,
      overflow: "hidden",
    }, control.id);
  }
});

test("shared preview fitting stays outside MAIN and public source rendering", () => {
  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  const drawer = read("components/puck-site-editor/product-library-drawer.tsx");
  const preview = read("components/puck-site-editor/production-preview-fit.tsx");

  assert.doesNotMatch(renderer, /ProductionPreviewViewport|calculateProductionPreviewFit|zoom\s*:/);
  assert.match(renderer, /position: "relative"/);
  assert.match(renderer, /presentationContract\?\.technicalRuntime && runtimeMode === "public"/);
  assert.match(drawer, /<ProductionPreviewViewport presentation=\{entry\.presentationContract\}>/);
  assert.match(preview, /resolvePuckProductionAuthoringStage\(presentation\) !== undefined/);
  assert.match(preview, /scene\.style\.height = `\$\{sceneSize\.height\}px`/);
});
