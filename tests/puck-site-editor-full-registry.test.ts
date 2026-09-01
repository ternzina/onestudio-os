import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  PUCK_BLOCKED_REGISTRY_BACKLOG,
  PUCK_EXPANDED_REGISTRY_DATA,
} from "../lib/puck-site-editor/generated-registry-data.ts";
import {
  PUCK_PILOT_BASELINE_MANIFEST,
  PUCK_PRODUCTION_MANIFEST,
} from "../lib/puck-site-editor/registry-manifest.ts";
import { PUCK_PRODUCTION_RUNTIME_EXCLUSIONS } from "../lib/puck-site-editor/runtime-exclusions.ts";
import {
  createPuckDocument,
  validatePuckDocument,
} from "../lib/puck-site-editor/document.ts";
import { createPuckPilotFixture } from "../lib/puck-site-editor/pilot-fixture.ts";
import { puckDataToDocument, puckDocumentToData } from "../lib/puck-site-editor/data-adapter.ts";
import { PRODUCT_LIBRARY_CATEGORY_ORDER } from "../lib/puck-site-editor/product-library.ts";

const root = path.resolve(import.meta.dirname, "..");

test("production manifest covers every unique usable product-library source", () => {
  assert.equal(PUCK_EXPANDED_REGISTRY_DATA.length, 282);
  assert.equal(PUCK_PRODUCTION_RUNTIME_EXCLUSIONS.length, 2);
  assert.equal(PUCK_PRODUCTION_MANIFEST.length, 280);
  assert.equal(new Set(PUCK_PRODUCTION_MANIFEST.map((entry) => entry.id)).size, 280);
  assert.equal(new Set(PUCK_PRODUCTION_MANIFEST.map((entry) => entry.catalogKey)).size, 280);
  assert.equal(new Set(PUCK_PRODUCTION_MANIFEST.map((entry) => entry.physicalSource)).size, 280);
  assert.equal(PUCK_PRODUCTION_MANIFEST.some((entry) => entry.id === "RB_batch10_hero_7"), true);
  for (const exclusion of PUCK_PRODUCTION_RUNTIME_EXCLUSIONS) {
    assert.equal(PUCK_PRODUCTION_MANIFEST.some((entry) => entry.id === exclusion.id), false);
  }
});

test("every production entry has product taxonomy and provenance metadata", () => {
  for (const entry of PUCK_PRODUCTION_MANIFEST) {
    assert.equal(PRODUCT_LIBRARY_CATEGORY_ORDER.includes(entry.taxonomy), true, entry.id);
    assert.match(entry.label, /^(?!React Bits\b).+/i, entry.id);
    assert.match(entry.officialSlug, /^[a-z0-9][a-z0-9-]*$/i, entry.id);
    assert.match(entry.physicalSource, /^@\/components\/(?:blocks|react-bits)\//, entry.id);
    assert.equal(["FREE", "PRO"].includes(entry.sourceTier), true, entry.id);
    assert.equal(entry.sourceProvenance, "REGISTRY", entry.id);
  }
});

test("all production ids are accepted directly from the registry allow-list", () => {
  for (const [index, entry] of PUCK_PRODUCTION_MANIFEST.entries()) {
    const document = createPuckDocument({
      pageId: "full-registry",
      locale: "en",
      content: [{
        type: entry.id,
        props: { id: `registry-${index + 1}`, ...structuredClone(entry.defaults) },
      }],
    });
    assert.equal(validatePuckDocument(document).ok, true, entry.id);
    for (const legacyId of entry.legacyIds) {
      assert.equal(validatePuckDocument({
        ...document,
        content: [{ ...document.content[0], type: legacyId }],
      }).ok, true, legacyId);
    }
  }
});

test("blocked and unknown ids remain rejected", () => {
  const blockedEntries = [
    ...PUCK_BLOCKED_REGISTRY_BACKLOG,
    ...PUCK_PRODUCTION_RUNTIME_EXCLUSIONS,
  ];
  for (const [index, blocked] of blockedEntries.entries()) {
    const invalid = {
      ...createPuckPilotFixture("en"),
      content: [{ type: blocked.id, props: { id: `blocked-${index + 1}` } }],
    };
    assert.equal(validatePuckDocument(invalid).ok, false, blocked.id);
  }
  const unknown = {
    ...createPuckPilotFixture("en"),
    content: [{ type: "reactbits.unknown", props: { id: "unknown" } }],
  };
  assert.equal(validatePuckDocument(unknown).ok, false);
});

test("broad production document survives save, reload and publish simulation", () => {
  const original = createPuckPilotFixture("ru");
  assert.equal(original.content.length, 25);
  assert.ok(new Set(original.content.map((item) => item.type)).size >= 25);
  assert.ok(new Set(original.content.map((item) =>
    PUCK_PRODUCTION_MANIFEST.find((entry) => entry.id === item.type)?.taxonomy,
  )).size >= 15);
  const serialized = JSON.stringify(original);
  const reloaded = JSON.parse(serialized);
  const saved = puckDataToDocument(puckDocumentToData(reloaded), {
    pageId: original.metadata.pageId,
    locale: original.metadata.locale,
  });
  const published = puckDataToDocument(puckDocumentToData(saved), {
    pageId: saved.metadata.pageId,
    locale: saved.metadata.locale,
  });
  assert.deepEqual(published, original);
});

test("production renderer source map is complete and lazy", () => {
  const source = fs.readFileSync(
    path.join(root, "components/puck-site-editor/production-component-sources.tsx"),
    "utf8",
  );
  assert.doesNotMatch(source, /components\/editor-lab/);
  assert.match(source, /lazyComponent\(\(\) => import\(/);
  for (const entry of PUCK_PRODUCTION_MANIFEST) {
    assert.match(source, new RegExp(JSON.stringify(entry.catalogKey).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), entry.id);
  }
});

test("the established eight pilot ids are unchanged", () => {
  assert.deepEqual(
    PUCK_PILOT_BASELINE_MANIFEST.map((entry) => entry.id),
    [
      "reactbits.navigation-12",
      "reactbits.hero-14",
      "reactbits.cta-9",
      "reactbits.pricing-3",
      "reactbits.social-proof-10",
      "reactbits.scheduling-3",
      "reactbits.contact-6",
      "reactbits.glow-cursor",
    ],
  );
});
