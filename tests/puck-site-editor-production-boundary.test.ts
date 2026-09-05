import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { createPuckPilotFixture } from "../lib/puck-site-editor/pilot-fixture.ts";
import { puckDataToDocument, puckDocumentToData } from "../lib/puck-site-editor/data-adapter.ts";
import { validatePuckDocument } from "../lib/puck-site-editor/document.ts";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

test("pilot fixture covers the representative production taxonomy", () => {
  const document = createPuckPilotFixture("en");
  assert.equal(document.content.length, 25);
  assert.equal(validatePuckDocument(document).ok, true);
  const ids = new Set(document.content.map((component) => component.type));
  for (const baselineId of [
      "reactbits.navigation-12",
      "reactbits.hero-14",
      "reactbits.cta-9",
      "reactbits.pricing-3",
      "reactbits.social-proof-10",
      "reactbits.scheduling-3",
      "reactbits.contact-6",
      "reactbits.glow-cursor",
  ]) assert.equal(ids.has(baselineId), true, baselineId);
});

test("editor data adapter round-trips responsive and media props", () => {
  const document = createPuckPilotFixture("ru");
  const hero = document.content.find((component) => component.type === "reactbits.hero-14")!;
  hero.props.mediaUrl = "/pilot/hero.webp";
  hero.props.mobileWidth = "narrow";
  hero.props.mobileHidden = false;
  const restored = puckDataToDocument(puckDocumentToData(document), { pageId: "pilot-home", locale: "ru" });
  assert.deepEqual(restored, document);
});

test("production renderer and registry have no editor-lab dependency", () => {
  for (const file of [
    "components/puck-site-editor/production-registry.tsx",
    "components/puck-site-editor/public-renderer.tsx",
    "components/puck-site-editor/editor-config.tsx",
    "components/puck-site-editor/production-editor-ux.tsx",
    "components/puck-site-editor/production-interaction-firewall.ts",
    "components/puck-site-editor/production-runtime-frame.tsx",
    "components/puck-site-editor/production-color-field.ts",
    "components/puck-site-editor/production-editor-locale.ts",
    "components/puck-site-editor/production-preview-fit.tsx",
    "components/puck-site-editor/production-preview-fit.module.css",
    "components/puck-site-editor/production-component-sources.tsx",
    "lib/puck-site-editor/preview-fit.ts",
    "lib/puck-site-editor/document.ts",
    "lib/puck-site-editor/registry-manifest.ts",
    "lib/puck-site-editor/generated-registry-data.ts",
  ]) {
    assert.doesNotMatch(read(file), /editor-lab/i, file);
  }
});

test("Hero 6 production rendering resolves through the adapted source", () => {
  assert.match(
    read("components/puck-site-editor/production-component-sources.tsx"),
    /"pro-block:hero-6": lazyComponent\(\(\) => import\("@\/components\/puck-site-editor\/adapted\/hero-6"\), \["AdaptedHero6","Hero6"\]\)/,
  );
});

test("legacy lab imports promoted adapters through the production boundary", () => {
  assert.match(read("components/editor-lab/adapted/hero/hero-14.tsx"), /components\/puck-site-editor\/adapted\/hero-14/);
  assert.match(read("components/editor-lab/adapted/navigation-12.tsx"), /components\/puck-site-editor\/adapted\/navigation-12/);
});

test("production interaction mode uses the shared iframe retargeting contract", () => {
  const editorConfig = read("components/puck-site-editor/editor-config.tsx");
  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  const drawer = read("components/puck-site-editor/product-library-drawer.tsx");
  const editorUx = read("components/puck-site-editor/production-editor-ux.tsx");

  assert.match(editorUx, /useScaledIframeInteractionRetargeting/);
  assert.match(editorConfig, /root: \{ render: ProductionPuckCanvasRoot \}/);
  assert.match(drawer, /Interact with page/);
  assert.match(drawer, /Edit layout/);
  assert.match(renderer, /data-production-component=/);
  assert.doesNotMatch(renderer, /data-puck-component=/);
});
