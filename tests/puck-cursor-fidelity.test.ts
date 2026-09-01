import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("free cursor metadata preserves the official visual defaults", () => {
  const registry = read("components/editor-lab/reactbits-free-showcase/puck-free-showcase-registry.tsx");

  for (const expected of [
    /defaultValue: "#67E8F9"/,
    /defaultValue: "#A78BFA"/,
    /prop: "trailLength"[^\n]+defaultValue: 40/,
    /prop: "trailWidth"[^\n]+defaultValue: 8/,
    /prop: "followSpeed"[^\n]+defaultValue: 0\.16/,
    /prop: "opacity"[^\n]+defaultValue: 1/,
    /prop: "pulseSpeed"[^\n]+defaultValue: 1\.1/,
    /prop: "idleFade"[^\n]+defaultValue: true/,
    /prop: "blendMode"[^\n]+defaultValue: "screen"/,
    /prop: "enabled"[^\n]+defaultValue: true/,
    /prop: "COLOR"[^\n]+defaultValue: "#ff0000"/,
    /prop: "RAINBOW_MODE"[^\n]+defaultValue: true/,
    /prop: "TRANSPARENT"[^\n]+defaultValue: true/,
    /prop: "SHADING"[^\n]+defaultValue: true/,
  ]) {
    assert.match(registry, expected);
  }
});

test("canvas fidelity uses a provenance-backed demo surface", () => {
  const host = read("components/editor-lab/puck/reactbits-host.tsx");
  const registry = read("components/editor-lab/reactbits-free-showcase/puck-free-showcase-registry.tsx");
  const direct = read("components/editor-lab/reactbits-free-showcase/reactbits-free-showcase-preview.tsx");

  assert.match(host, /surfaceBackground\?:/);
  assert.match(host, /"official-source" \| "official-demo"/);
  assert.match(host, /style\.backgroundColor = spec\.surfaceBackground\.value/);
  assert.match(registry, /surfaceBackground: \{ value: "#000000", provenance: "official-demo" \}/);
  assert.match(direct, /surfaceBackground: \{ value: "#000000", provenance: "official-demo" as const \}/);
});

test("Interact mode maximizes the responsive canvas and restores editor sidebars", () => {
  const editor = read("components/editor-lab/puck-v3/puck-lab-v3.tsx");

  assert.match(editor, /editSidebarsRef\.current = \{ leftSideBarVisible, rightSideBarVisible \}/);
  assert.match(editor, /previewMode: "interactive",\s+leftSideBarVisible: false,\s+rightSideBarVisible: false/);
  assert.match(editor, /previewMode: "edit",\s+\.\.\.editSidebarsRef\.current/);
});
