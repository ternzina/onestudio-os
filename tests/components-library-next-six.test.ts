import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const showcase = readFileSync(
  "components/marketing/OneStudioMotionShowcase.tsx",
  "utf8",
);

const ids = [
  "glue-dots",
  "device",
  "gradient-carousel",
  "liquid-ascii",
  "magic-transform",
  "text-scatter",
] as const;

test("component library next adds six unique families", () => {
  const catalogStart = showcase.indexOf(
    "export const componentCatalogItems: readonly ComponentCatalogItem[] = [",
  );
  const catalogEnd = showcase.indexOf(
    "export type ComponentCatalogFamily",
    catalogStart,
  );
  const familyStart = showcase.indexOf(
    "const componentCatalogFamilySpecs = [",
  );
  const familyEnd = showcase.indexOf(
    "] as const satisfies",
    familyStart,
  );

  assert.ok(catalogStart >= 0);
  assert.ok(catalogEnd > catalogStart);
  assert.ok(familyStart >= 0);
  assert.ok(familyEnd > familyStart);

  const catalog = showcase.slice(catalogStart, catalogEnd);
  const families = showcase.slice(familyStart, familyEnd);

  const variantIds = [...catalog.matchAll(/\n    id: "([^"]+)"/g)].map(
    (match) => match[1],
  );
  const familyIds = [...families.matchAll(/\{\s*id: "([^"]+)"/g)].map(
    (match) => match[1],
  );

  assert.equal(variantIds.length, 56);
  assert.equal(familyIds.length, 31);

  for (const id of ids) {
    assert.ok(variantIds.includes(id), `missing catalog variant ${id}`);
    assert.ok(familyIds.includes(id), `missing family ${id}`);
  }
});

test("all six additions use explicit lazy loaders", () => {
  for (const loader of [
    "loadGlueDots",
    "loadDevice",
    "loadGradientCarousel",
    "loadLiquidAscii",
    "loadMagicTransform",
    "loadTextScatter",
  ]) {
    assert.match(showcase, new RegExp(`preload: ${loader}`));
  }
});

test("all public locales contain copy for the six additions", () => {
  for (const locale of ["ru", "en", "uk", "pl", "de", "es", "fr", "pt"]) {
    const source = readFileSync(
      `lib/i18n/locales/${locale}/components.ts`,
      "utf8",
    );

    for (const id of ids) {
      assert.ok(source.includes(`"${id}":`), `${locale} missing ${id}`);
    }
  }
});
