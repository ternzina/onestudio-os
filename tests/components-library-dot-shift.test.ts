import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const showcase = readFileSync(
  "components/marketing/OneStudioMotionShowcase.tsx",
  "utf8",
);
const source = readFileSync(
  "components/react-bits/dot-shift.tsx",
  "utf8",
);

test("Dot Shift is present as a public component family", () => {
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

  assert.equal(variantIds.length, 59);
  assert.equal(familyIds.length, 34);
  assert.ok(variantIds.includes("dot-shift"));
  assert.ok(familyIds.includes("dot-shift"));
});

test("Dot Shift is lazy client-side and caps preview DPR", () => {
  const start = showcase.indexOf('id: "dot-shift"');
  const end = showcase.indexOf("\n  },", start);
  const block = showcase.slice(start, end);

  assert.match(showcase, /const DynamicDotShift = dynamic\(/);
  assert.match(showcase, /ssr: false/);
  assert.match(source, /dpr\?: number \| \[number, number\]/);
  assert.match(source, /dpr=\{dpr\}/);
  assert.match(block, /dpr: \[1, 1\.25\]/);
  assert.match(block, /min-h-\[260px\]/);
});
