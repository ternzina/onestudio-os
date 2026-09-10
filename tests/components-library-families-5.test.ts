import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const showcase = readFileSync(
  "components/marketing/OneStudioMotionShowcase.tsx",
  "utf8",
);
const page = readFileSync(
  "app/components/ComponentsPageClient.tsx",
  "utf8",
);
const styles = readFileSync(
  "app/components/page.module.css",
  "utf8",
);

function catalogSource() {
  const start = showcase.indexOf(
    "export const componentCatalogItems: readonly ComponentCatalogItem[] = [",
  );
  const end = showcase.indexOf("export type ComponentCatalogFamily", start);

  assert.ok(start >= 0);
  assert.ok(end > start);

  return showcase.slice(start, end);
}

function familySource() {
  const start = showcase.indexOf("const componentCatalogFamilySpecs = [");
  const end = showcase.indexOf("] as const satisfies", start);

  assert.ok(start >= 0);
  assert.ok(end > start);

  return showcase.slice(start, end);
}

test("fifty variants are grouped into twenty-five families", () => {
  const variantIds = [
    ...catalogSource().matchAll(/\n    id: "([^"]+)"/g),
  ].map((match) => match[1]);

  const families = familySource();

  const familyIds = [
    ...families.matchAll(/\{\s*id: "([^"]+)"/g),
  ].map((match) => match[1]);

  const assigned = [
    ...families.matchAll(/itemIds:\s*\[([\s\S]*?)\]/g),
  ].flatMap((match) =>
    [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]),
  );

  assert.equal(variantIds.length, 50);
  assert.equal(new Set(variantIds).size, 50);
  assert.equal(familyIds.length, 25);
  assert.equal(new Set(familyIds).size, 25);
  assert.equal(assigned.length, 50);
  assert.equal(new Set(assigned).size, 50);
  assert.deepEqual(new Set(assigned), new Set(variantIds));
});

test("public grid renders families and modal switches variants", () => {
  assert.match(page, /componentCatalogFamilies/);
  assert.match(page, /filteredFamilies\.map/);
  assert.match(page, /openFamily\(family\)/);
  assert.match(page, /activeFamily\.items\.map/);
  assert.match(page, /setActiveItem\(variant\)/);
  assert.doesNotMatch(page, /filteredItems\.map/);
});

test("component and variant totals are shown separately", () => {
  assert.match(page, /componentsCountLabel/);
  assert.match(page, /variantsCountLabel/);
  assert.match(page, /filteredVariantCount/);
});

test("variant UI is present", () => {
  assert.match(styles, /\.variantRail/);
  assert.match(styles, /\.variantButtons/);
  assert.match(styles, /\.variantButtonActive/);
  assert.match(styles, /\.variantBadge/);
});

test("all public locales contain family/variant labels", () => {
  for (const locale of ["ru", "en", "uk", "pl", "de", "es", "fr", "pt"]) {
    const source = readFileSync(
      `lib/i18n/locales/${locale}/components.ts`,
      "utf8",
    );

    assert.match(source, /componentsCountLabel:/);
    assert.match(source, /variantsCountLabel:/);
    assert.match(source, /variantsHeading:/);
  }
});
