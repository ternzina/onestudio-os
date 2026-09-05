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
    fullSurface.every((item) => item.presentationContract?.sourceGeometry?.definiteParent.required === true),
    true,
  );
  assert.match(
    rendererCss,
    /\.surface :global\(\[data-production-presentation-geometry="fullSurface"\] canvas\)\s*\{[\s\S]*width: 100%;[\s\S]*height: 100%;/,
  );
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
  assert.match(read("components/puck-site-editor/editor-config.tsx"), /runtimeMode="authoring"/);
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
    assert.equal(item.presentationContract, undefined, id);
    assert.deepEqual(resolvePuckProductionPresentationStyle(undefined, "public"), {}, id);
  }
});

test("authoring/public parity and clean-room scope are explicit", () => {
  execFileSync("git", ["diff", "--quiet", "HEAD", "--", "components/react-bits/frame-border.tsx"], { cwd: root });
  execFileSync("git", ["diff", "--quiet", "HEAD", "--", "components/react-bits/text-scatter.tsx"], { cwd: root });

  const changedFiles = execFileSync("git", ["diff", "--name-only", "HEAD"], { cwd: root, encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(Boolean);
  assert.deepEqual(changedFiles, [
    "components/puck-site-editor/editor-config.tsx",
    "components/puck-site-editor/public-renderer.module.css",
    "components/puck-site-editor/public-renderer.tsx",
    "lib/puck-site-editor/presentation-runtime.ts",
    "lib/puck-site-editor/registry-manifest.ts",
    "tests/puck-confirmed-fixes.test.ts",
  ]);
});
