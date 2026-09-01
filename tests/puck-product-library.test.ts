import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  buildProductLibraryCategories,
  cleanReactBitsDisplayName,
  createProductLibraryMetadata,
  matchesProductLibrarySearch,
  PRODUCT_LIBRARY_CATEGORY_ORDER,
  withProductLibraryMetadata,
} from "../lib/puck-site-editor/product-library.ts";
import { PUCK_PRODUCTION_MANIFEST } from "../lib/puck-site-editor/registry-manifest.ts";

const hero = {
  type: "RB_batch8_hero_18",
  displayName: "React Bits Hero 18",
  catalogKey: "pro-block:hero-18",
  sourceKind: "pro-block" as const,
  category: "React Bits Fast Batch 8",
  tags: ["React Bits Fast Batch 8", "Marketing Block"],
};

test("product display metadata removes only the visible React Bits prefix", () => {
  assert.equal(cleanReactBitsDisplayName("React Bits Hero 18"), "Hero 18");
  assert.equal(cleanReactBitsDisplayName("Glow Cursor"), "Glow Cursor");
  const product = withProductLibraryMetadata(hero);
  assert.equal(product.displayName, "Hero 18");
  assert.equal(product.category, "Hero");
  assert.equal(product.sourceTier, "PRO");
  assert.equal(product.type, hero.type);
  assert.equal(product.catalogKey, hero.catalogKey);
  assert.equal(product.devProvenance.category, "React Bits Fast Batch 8");
});

test("semantic taxonomy does not expose batch or control provenance", () => {
  const blocks = [
    withProductLibraryMetadata(hero),
    withProductLibraryMetadata({
      type: "RB_free_glow_cursor",
      displayName: "React Bits Glow Cursor",
      catalogKey: "current-free:glow-cursor",
      sourceKind: "component" as const,
      category: "React Bits Free Showcase",
      tags: ["React Bits Free Showcase", "FREE"],
      sourceTier: "FREE" as const,
    }),
    withProductLibraryMetadata({
      type: "RB_control6_card_2",
      displayName: "React Bits Card 2",
      catalogKey: "control-6:card-2",
      sourceKind: "component" as const,
      category: "React Bits Control 6",
      tags: ["React Bits Control 6", "Application UI"],
    }),
  ];
  const categories = Object.values(buildProductLibraryCategories(blocks));
  assert.deepEqual(categories.map((category) => category.title), ["Hero", "Cards", "Cursor / Pointer"]);
  assert.equal(categories.every((category) => category.defaultExpanded === false), true);
  assert.equal(categories.some((category) => /batch|control/i.test(category.title)), false);
});

test("search covers clean names, semantic categories and official slug aliases", () => {
  const glow = createProductLibraryMetadata({
    type: "RB_free_glow_cursor",
    displayName: "React Bits Glow Cursor",
    catalogKey: "current-free:glow-cursor",
    sourceKind: "component",
    sourceTier: "FREE",
  });
  const splash = createProductLibraryMetadata({
    type: "RB_free_splash_cursor",
    displayName: "Splash Cursor",
    catalogKey: "current-free:splash-cursor",
    sourceKind: "component",
    sourceTier: "FREE",
  });
  assert.equal(matchesProductLibrarySearch(glow, "glow"), true);
  assert.equal(matchesProductLibrarySearch(glow, "cursor"), true);
  assert.equal(matchesProductLibrarySearch(glow, "pointer"), true);
  assert.equal(matchesProductLibrarySearch(splash, "cursor"), true);
  assert.equal(matchesProductLibrarySearch(glow, "Fast Batch"), false);
});

test("production manifest labels and ids remain product-safe and stable", () => {
  assert.equal(PUCK_PRODUCTION_MANIFEST.every((entry) => !/^React Bits\s/i.test(entry.label)), true);
  assert.equal(PUCK_PRODUCTION_MANIFEST.every((entry) => !/Fast Batch|Control \d/i.test(entry.taxonomy)), true);
  assert.equal(PUCK_PRODUCTION_MANIFEST.every((entry) => /^[A-Za-z0-9_.-]+$/.test(entry.id)), true);
  assert.deepEqual(new Set(PUCK_PRODUCTION_MANIFEST.map((entry) => entry.sourceTier)), new Set(["PRO", "FREE"]));
  assert.equal(PUCK_PRODUCTION_MANIFEST.every((entry) => PRODUCT_LIBRARY_CATEGORY_ORDER.includes(entry.taxonomy)), true);
  assert.deepEqual(
    PUCK_PRODUCTION_MANIFEST.slice(0, 8).map((entry) => [entry.label, entry.taxonomy]),
    [
      ["Navigation 12", "Navigation"],
      ["Hero 14", "Hero"],
      ["CTA 9", "CTA"],
      ["Pricing 3", "Pricing"],
      ["Social Proof 10", "Social Proof / Testimonials"],
      ["Scheduling 3", "Scheduling"],
      ["Contact 6", "Contact"],
      ["Glow Cursor", "Cursor / Pointer"],
    ],
  );
  for (const entry of PUCK_PRODUCTION_MANIFEST) {
    const metadata = createProductLibraryMetadata({
      type: entry.id,
      displayName: entry.label,
      catalogKey: entry.catalogKey,
      sourceKind: entry.catalogKey.startsWith("pro-block:") ? "pro-block" : "component",
      category: entry.taxonomy,
      sourceTier: entry.sourceTier,
    });
    assert.equal(metadata.category, entry.taxonomy);
    assert.equal(metadata.sourceTier, entry.sourceTier);
  }
});

test("production pilot library uses shared product taxonomy, search and collapsed categories", () => {
  const root = path.resolve(import.meta.dirname, "..");
  const editorConfig = fs.readFileSync(path.join(root, "components/puck-site-editor/editor-config.tsx"), "utf8");
  const pilotEditor = fs.readFileSync(path.join(root, "components/puck-site-editor/pilot-editor.tsx"), "utf8");
  const drawer = fs.readFileSync(path.join(root, "components/puck-site-editor/product-library-drawer.tsx"), "utf8");
  assert.match(editorConfig, /PRODUCT_LIBRARY_CATEGORY_ORDER/);
  assert.match(editorConfig, /defaultExpanded: false/);
  assert.match(pilotEditor, /PUCK_PRODUCTION_EDITOR_OVERRIDES/);
  assert.match(drawer, /matchesProductLibrarySearch/);
  assert.match(drawer, /collapsedCategories/);
  assert.match(drawer, /productLibrary\.sourceTier|entry\.sourceTier/);
});

test("Puck V3 product layer builds components from semantic display metadata", () => {
  const root = path.resolve(import.meta.dirname, "..");
  const registry = fs.readFileSync(path.join(root, "components/editor-lab/puck-v3/poc-registry.tsx"), "utf8");
  const library = fs.readFileSync(path.join(root, "components/editor-lab/puck-v3/puck-lab-v3.tsx"), "utf8");
  assert.match(registry, /withProductLibraryMetadata/);
  assert.match(registry, /buildProductLibraryCategories/);
  assert.doesNotMatch(registry, /\.\.\.fastBatch\d+Categories/);
  assert.doesNotMatch(registry, /\.\.\.control\d+Categories/);
  assert.match(library, /matchesProductLibrarySearch/);
  assert.match(library, /productLibrary\.sourceTier/);
  assert.doesNotMatch(library, /const libraryGroupOrder = \["React Bits Fast Batch/);
});
