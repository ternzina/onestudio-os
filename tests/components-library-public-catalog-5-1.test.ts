import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const catalog = readFileSync("lib/public-component-catalog.ts", "utf8");
const page = readFileSync("app/components/ComponentsPageClient.tsx", "utf8");
const preview = readFileSync("app/components/PublicComponentPreview.tsx", "utf8");

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
  assert.match(preview, /Suspense/);
  assert.match(preview, /IntersectionObserver/);
  assert.match(preview, /PreviewErrorBoundary/);
  assert.match(preview, /PUCK_PRODUCTION_COMPONENTS_BY_CATALOG_KEY/);
  assert.match(preview, /previewMode === "fallback"/);
});
