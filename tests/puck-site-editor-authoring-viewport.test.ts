import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  PUCK_PRODUCTION_AUTHORING_UI,
  PUCK_PRODUCTION_AUTHORING_VIEWPORTS,
  PUCK_PRODUCTION_AUTHORING_VIEWPORT_HEIGHT,
} from "../lib/puck-site-editor/authoring-viewport.ts";
import {
  PUCK_PRODUCTION_MANIFEST_BY_ID,
  PUCK_PRODUCTION_MANIFEST,
} from "../lib/puck-site-editor/registry-manifest.ts";
import { resolvePuckRuntimeRealm } from "../lib/puck-site-editor/runtime-realm.ts";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

test("production Puck authoring uses one numeric viewport height for every option", () => {
  assert.equal(PUCK_PRODUCTION_AUTHORING_VIEWPORT_HEIGHT, 720);
  assert.deepEqual(PUCK_PRODUCTION_AUTHORING_VIEWPORTS, [
    { label: "Desktop", width: 1280, height: 720 },
    { label: "Tablet", width: 768, height: 720 },
    { label: "Mobile", width: 390, height: 720 },
  ]);
  assert.deepEqual(PUCK_PRODUCTION_AUTHORING_UI.current, {
    width: 1280,
    height: 720,
  });
  assert.equal(PUCK_PRODUCTION_AUTHORING_UI.options, PUCK_PRODUCTION_AUTHORING_VIEWPORTS);

  for (const file of [
    "components/puck-site-editor/pilot-editor.tsx",
    "components/puck-site-editor/production-puck-qa.tsx",
  ]) {
    const source = read(file);
    assert.match(source, /viewports: PUCK_PRODUCTION_AUTHORING_UI/);
    assert.doesNotMatch(source, /viewports:\s*\{[\s\S]*height:\s*["']auto["']/);
  }
});

test("viewport representatives keep source geometry and Magic Rings remains the iframe-native control", () => {
  for (const id of [
    "RB_batch2_circle_gallery",
    "RB_batch4_scroll_stack",
    "RB_batch11_scroll_mask",
    "RB_free_splash_cursor",
  ]) {
    const entry = PUCK_PRODUCTION_MANIFEST_BY_ID.get(id);
    assert.ok(entry, id);
    assert.equal(entry.presentationContract?.geometry.kind, "viewport", id);
    assert.deepEqual(entry.presentationContract?.geometry.viewportHeight, {
      value: "100vh",
      provenance: "source",
    }, id);
  }

  const splash = PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_free_splash_cursor");
  const magic = PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_free_magic_rings");
  assert.ok(splash);
  assert.ok(magic);
  assert.equal(resolvePuckRuntimeRealm(splash), "iframeNative");
  assert.equal(resolvePuckRuntimeRealm(magic), "iframeNative");
  assert.equal(magic.presentationContract?.geometry.kind, "fullSurface");
  assert.equal(magic.presentationContract?.technicalRuntime?.height.value, 480);
  assert.deepEqual(
    PUCK_PRODUCTION_MANIFEST.filter((entry) => entry.runtimeRealm).map((entry) => entry.catalogKey),
    ["current-free:magic-rings", "current-free:splash-cursor"],
  );
});
