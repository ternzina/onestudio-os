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
  assert.equal(document.content.length, 8);
  assert.equal(validatePuckDocument(document).ok, true);
  assert.deepEqual(
    new Set(document.content.map((component) => component.type)),
    new Set([
      "reactbits.navigation-12",
      "reactbits.hero-14",
      "reactbits.cta-9",
      "reactbits.pricing-3",
      "reactbits.social-proof-10",
      "reactbits.scheduling-3",
      "reactbits.contact-6",
      "reactbits.glow-cursor",
    ]),
  );
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
    "lib/puck-site-editor/document.ts",
    "lib/puck-site-editor/registry-manifest.ts",
  ]) {
    assert.doesNotMatch(read(file), /editor-lab|Fast Batch|Control [0-9]/i, file);
  }
});

test("legacy lab imports promoted adapters through the production boundary", () => {
  assert.match(read("components/editor-lab/adapted/hero/hero-14.tsx"), /components\/puck-site-editor\/adapted\/hero-14/);
  assert.match(read("components/editor-lab/adapted/navigation-12.tsx"), /components\/puck-site-editor\/adapted\/navigation-12/);
});
