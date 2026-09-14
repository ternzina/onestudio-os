import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const showcase = readFileSync(
  "components/marketing/OneStudioMotionShowcase.tsx",
  "utf8",
);

test("Scroll Mask is present as a public component family", () => {
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

  assert.ok(variantIds.length >= 58);
  assert.ok(familyIds.length >= 33);
  assert.ok(variantIds.includes("scroll-mask"));
  assert.ok(familyIds.includes("scroll-mask"));
});

test("Scroll Mask catalog preview uses local demo media", () => {
  const start = showcase.indexOf('id: "scroll-mask"');
  const end = showcase.indexOf("\n  },", start);
  const block = showcase.slice(start, end);

  assert.match(block, /circleGalleryImages\[/);
  assert.doesNotMatch(block, /https?:\/\//);
});

test("Scroll Mask preview uses a compact scroll runway", () => {
  const start = showcase.indexOf('id: "scroll-mask"');
  const end = showcase.indexOf("\n  },", start);
  const block = showcase.slice(start, end);

  assert.match(block, /scrollLength: 0\.25/);
  assert.match(block, /variant: "iris"/);
  assert.match(block, /settle: 0\.28/);
});
