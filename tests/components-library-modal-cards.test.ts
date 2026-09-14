import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const showcase = readFileSync(
  "components/marketing/OneStudioMotionShowcase.tsx",
  "utf8",
);
const modal = readFileSync(
  "components/react-bits/modal-cards.tsx",
  "utf8",
);

test("Modal Cards is the thirty-second public component family", () => {
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

  const catalog = showcase.slice(catalogStart, catalogEnd);
  const families = showcase.slice(familyStart, familyEnd);

  const variantIds = [...catalog.matchAll(/\n    id: "([^"]+)"/g)].map(
    (match) => match[1],
  );
  const familyIds = [...families.matchAll(/\{\s*id: "([^"]+)"/g)].map(
    (match) => match[1],
  );

  assert.ok(variantIds.length >= 57);
  assert.ok(familyIds.length >= 32);
  assert.ok(variantIds.includes("modal-cards"));
  assert.ok(familyIds.includes("modal-cards"));
});

test("Modal Cards preview does not steal the outer library scroll lock", () => {
  assert.match(modal, /lockBodyScroll\?: boolean/);
  assert.match(showcase, /lockBodyScroll: false/);
  assert.match(showcase, /closeOnEscape: false/);
});

test("Modal Cards uses local demo media in the public catalog", () => {
  const start = showcase.indexOf('id: "modal-cards"');
  const end = showcase.indexOf("\n  },", start);
  const block = showcase.slice(start, end);

  assert.match(block, /circleGalleryImages\[/);
  assert.doesNotMatch(block, /https?:\/\//);
});
