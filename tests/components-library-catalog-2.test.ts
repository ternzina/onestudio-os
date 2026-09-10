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

const newIds = [
  "floating-lines",
  "magic-rings",
  "strands",
  "glow-cursor",
  "particle-text",
  "card-spread",
  "bending-marquee",
] as const;

test("full public catalog grows to twelve while the homepage stays curated to five", () => {
  const catalog = showcase.match(
    /export const componentCatalogItems:[\s\S]*?= \[([\s\S]*?)\n\];\n\nconst HOME_SHOWCASE_IDS/,
  );
  assert.ok(catalog);

  const catalogIds = [...catalog[1].matchAll(/\n    id: "([^"]+)"/g)].map(
    (match) => match[1],
  );

  assert.ok(catalogIds.length >= 12);

  for (const id of newIds) {
    assert.ok(catalogIds.includes(id), `missing catalog item ${id}`);
  }

  const home = showcase.match(
    /const HOME_SHOWCASE_IDS = \[([\s\S]*?)\] as const satisfies/,
  );
  assert.ok(home);

  const homeIds = [...home[1].matchAll(/"([^"]+)"/g)].map(
    (match) => match[1],
  );

  assert.deepEqual(homeIds, [
    "gallery",
    "motion",
    "waitlist",
    "hero",
    "social-proof",
  ]);
});

test("new library categories are exposed by the public filter", () => {
  assert.match(page, /id: "backgrounds"/);
  assert.match(page, /id: "typography"/);
  assert.match(page, /id: "interactive"/);
});

test("all public locales include every new category and component", () => {
  const locales = ["ru", "en", "uk", "pl", "de", "es", "fr", "pt"];

  for (const locale of locales) {
    const source = readFileSync(
      `lib/i18n/locales/${locale}/components.ts`,
      "utf8",
    );

    for (const category of ["backgrounds", "typography", "interactive"]) {
      assert.ok(source.includes(`${category}:`), `${locale} missing ${category}`);
    }

    for (const id of newIds) {
      assert.ok(
        source.includes(`${id}:`) || source.includes(`"${id}":`),
        `${locale} missing ${id}`,
      );
    }
  }
});
