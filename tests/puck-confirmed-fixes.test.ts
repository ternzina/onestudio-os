import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  PUCK_PRODUCTION_MANIFEST,
  PUCK_PRODUCTION_MANIFEST_BY_ID,
} from "../lib/puck-site-editor/registry-manifest.ts";
import { resolvePuckProductionPresentationStyle } from "../lib/puck-site-editor/presentation-runtime.ts";
import { resolvePuckEditorThemeProps } from "../lib/puck-site-editor/production-props.ts";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const entry = (id: string) => {
  const found = PUCK_PRODUCTION_MANIFEST_BY_ID.get(id);
  assert.ok(found, id);
  return found;
};

test("shared fullSurface canvas sizing keeps DPR buffers and restores CSS dimensions", () => {
  const rendererCss = read("components/puck-site-editor/public-renderer.module.css");
  const fullSurface = PUCK_PRODUCTION_MANIFEST.filter(
    (item) => item.presentationContract?.geometry.kind === "fullSurface",
  );

  assert.equal(fullSurface.length, 21);
  assert.equal(fullSurface.every((item) => item.sourceKind === "component"), true);
  assert.equal(fullSurface.every((item) => item.presentationContract?.overflow === "clip"), true);
  assert.equal(
    fullSurface.every((item) => item.presentationContract?.sourceGeometry?.definiteParent?.required === true),
    true,
  );
  assert.match(
    rendererCss,
    /\.surface\[data-puck-runtime-mode="library-preview"\]\[data-production-presentation-geometry="fullSurface"\] canvas\s*\{[\s\S]*width: 100% !important;[\s\S]*height: 100% !important;/,
  );
  assert.match(rendererCss, /library-preview.*fullSurface.*canvas/);
});

test("editor theme presentation is transient and user props win", () => {
  const resolved = resolvePuckEditorThemeProps(
    { color: "default", backgroundColor: "default" },
    { color: "user" },
    { provenance: "officialSource", props: { color: "theme", backgroundColor: "theme-bg" } },
  );
  assert.deepEqual(resolved, { color: "user", backgroundColor: "theme-bg" });
  assert.match(read("components/puck-site-editor/public-renderer.tsx"), /runtimeMode !== "public"/);
  assert.match(read("components/puck-site-editor/public-renderer.tsx"), /effectiveRuntimeMode !== "public"/);
});

test("Text Cube theme and Liquid Ascii logical measurement contracts are typed", () => {
  const textCube = entry("RB_batch10_text_cube");
  assert.deepEqual(textCube.presentationContract?.editorThemePresentation?.light?.props, { color: "#1a1a1a", backgroundColor: "#ffffff" });
  assert.deepEqual(textCube.presentationContract?.editorThemePresentation?.dark?.props, { color: "#ffffff", backgroundColor: "#000000" });
  assert.equal(entry("RB_batch10_liquid_ascii").presentationContract?.editorLogicalMeasurement, "authoring-stage");
  assert.match(read("components/react-bits/liquid-ascii.tsx"), /production-logical-measurement/);
});

test("Frame Border uses 1.64 only for authoring and keeps its public technical height", () => {
  const frame = entry("RB_frame_border");
  const contract = frame.presentationContract;
  assert.ok(contract);
  assert.deepEqual(contract.geometry.aspectRatio, {
    value: 1.64,
    provenance: "editorPresentationDefault",
  });
  assert.deepEqual(resolvePuckProductionPresentationStyle(contract, "public"), {
    height: 480,
    minHeight: 480,
    overflow: "hidden",
  });
  assert.deepEqual(resolvePuckProductionPresentationStyle(contract, "authoring"), {
    aspectRatio: 1.64,
    overflow: "hidden",
  });
  assert.match(read("components/puck-site-editor/public-renderer.tsx"), /runtimeMode = "public"/);
});

test("presentation rootLayout is typed and applied to Text Scatter", () => {
  const textScatter = entry("RB_control6_text_scatter");
  assert.deepEqual(textScatter.presentationContract?.rootLayout, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });
  assert.equal(textScatter.presentationContract?.geometry.minHeight?.value, 400);
  assert.deepEqual(
    resolvePuckProductionPresentationStyle(textScatter.presentationContract, "public"),
    {
      minHeight: 400,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  );
  assert.match(read("components/puck-site-editor/public-renderer.tsx"), /data-production-presentation-geometry=\{presentationContract\?\.geometry\.kind\}/);
});

test("Blur Highlight and Credit Card remain negative controls", () => {
  for (const id of ["RB_control3_blur_highlight", "RB_batch1_credit_card"]) {
    const item = entry(id);
    assert.ok(item.presentationContract, id);
  }
});

test("authoring/public parity and clean-room scope are explicit", () => {
  execFileSync("git", ["diff", "--quiet", "HEAD", "--", "components/react-bits/frame-border.tsx"], { cwd: root });
  execFileSync("git", ["diff", "--quiet", "HEAD", "--", "components/react-bits/text-scatter.tsx"], { cwd: root });

  for (const file of [
    "components/puck-site-editor/public-renderer.tsx",
    "components/puck-site-editor/product-library-drawer.tsx",
    "components/puck-site-editor/production-editor-ux.tsx",
  ]) assert.doesNotMatch(read(file), /editor-lab/i, file);
});
