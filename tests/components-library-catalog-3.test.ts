import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const showcase = readFileSync(
  "components/marketing/OneStudioMotionShowcase.tsx",
  "utf8",
);

const newIds = [
  "blur-highlight",
  "circle-stack",
  "click-stack",
  "text-cube",
] as const;

test("library 3 grows the public catalog to sixteen but keeps five homepage demos", () => {
  const catalog = showcase.match(
    /export const componentCatalogItems:[\s\S]*?= \[([\s\S]*?)\n\];\n\nconst HOME_SHOWCASE_IDS/,
  );
  assert.ok(catalog);

  const catalogIds = [...catalog[1].matchAll(/\n    id: "([^"]+)"/g)].map(
    (match) => match[1],
  );

  assert.ok(catalogIds.length >= 16);
  assert.ok(!catalogIds.includes("splash-cursor"));

  for (const id of newIds) {
    assert.ok(catalogIds.includes(id), `missing ${id}`);
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

test("all library 3 components keep explicit lazy loaders", () => {
  for (const loader of [
    "loadBlurHighlight",
    "loadCircleStack",
    "loadClickStack",
    "loadTextCube",
  ]) {
    assert.match(showcase, new RegExp(`preload: ${loader}`));
  }

  assert.doesNotMatch(showcase, /loadSplashCursor/);
});

test("all public locales include the four library 3 item labels", () => {
  const locales = ["ru", "en", "uk", "pl", "de", "es", "fr", "pt"];

  for (const locale of locales) {
    const source = readFileSync(
      `lib/i18n/locales/${locale}/components.ts`,
      "utf8",
    );

    assert.ok(!source.includes('"splash-cursor":'));

    for (const id of newIds) {
      assert.ok(source.includes(`"${id}":`), `${locale} missing ${id}`);
    }
  }
});
