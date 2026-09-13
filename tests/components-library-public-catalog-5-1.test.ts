import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const catalog = readFileSync("lib/public-component-catalog.ts", "utf8");
const page = readFileSync("app/components/ComponentsPageClient.tsx", "utf8");
const preview = readFileSync("app/components/PublicComponentPreview.tsx", "utf8");
const sharedPreview = readFileSync(
  "components/marketing/SharedComponentVisualPreview.tsx",
  "utf8",
);
const motionShowcase = readFileSync(
  "components/marketing/OneStudioMotionShowcase.tsx",
  "utf8",
);
const autonomousRegistry = readFileSync(
  "components/marketing/catalog/generated-block-registry.tsx",
  "utf8",
);

test("public catalog is derived from the production Puck manifest", () => {
  assert.match(catalog, /PUCK_PRODUCTION_MANIFEST/);
  assert.match(catalog, /officialSlug\.replace/);
  assert.match(catalog, /publicComponentCatalog/);
  assert.doesNotMatch(catalog, /componentCatalogFamilySpecs/);
});

test("components page consumes the unified catalog rather than the marketing showcase catalog", () => {
  assert.match(page, /publicComponentCatalog/);
  assert.match(page, /PublicComponentPreview/);
  assert.doesNotMatch(page, /componentCatalogFamilies/);
  assert.doesNotMatch(page, /OneStudioMotionShowcase/);
});

test("registry previews are lazy and failure-isolated", () => {
  assert.match(preview, /SharedComponentVisualPreview/);
  assert.match(sharedPreview, /IntersectionObserver/);
  assert.match(sharedPreview, /PreviewBoundary/);
  assert.match(preview, /PUCK_PRODUCTION_COMPONENTS_BY_CATALOG_KEY/);
  assert.match(preview, /previewMode === "fallback"/);
});

test("home and public catalog share the same visual runtime", () => {
  assert.match(motionShowcase, /SharedComponentVisualPreview/);
  assert.match(preview, /SharedComponentVisualPreview/);
  assert.match(sharedPreview, /fit\?: "native" \| "contain"/);
  assert.match(preview, /fit="contain"/);
});

test("ordinary production blocks use recovered visual fixtures before the generic fallback", () => {
  const autonomousSources = [...autonomousRegistry.matchAll(/sourceFile: "([^"]+)"/g)];

  assert.ok(autonomousSources.length >= 250, "expected the autonomous visual-preview source map");
  assert.match(preview, /autonomousPreviewBySource/);
  assert.match(preview, /autonomousPreview\?\.getProps\(\) \?\? variant\.defaults/);
  assert.match(preview, /previewKey=\{variant\.id\}/);
  assert.doesNotMatch(preview, /<LazySource \{\.\.\.variant\.defaults\} \/>/);
});
