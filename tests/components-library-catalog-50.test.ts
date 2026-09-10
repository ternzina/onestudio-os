import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const showcase = readFileSync(
  "components/marketing/OneStudioMotionShowcase.tsx",
  "utf8",
);

const newIds = [
  "cursor-wave-neon",
  "cursor-wave-circles",
  "cursor-wave-squares",
  "cursor-wave-triangles",
  "cursor-wave-peach",
  "cursor-wave-minimal",
  "skewed-portrait",
  "skewed-wide",
  "skewed-loop",
  "skewed-minimal",
  "skewed-cinema",
  "tumble-square",
  "tumble-portrait",
  "tumble-loop",
  "tumble-soft",
  "tumble-bold",
  "rotating-orbit",
  "rotating-gallery",
  "rotating-compact",
  "rotating-slow",
  "credit-aurora",
  "credit-midnight",
  "credit-peach",
  "credit-forest",
  "vortex-gold",
  "vortex-blue",
  "flicker-mono",
  "flicker-rainbow",
  "page-flip-dark",
  "glitch-text-soft",
] as const;

test("public component catalog reaches fifty while homepage remains curated", () => {
  const catalog = showcase.match(
    /export const componentCatalogItems:[\s\S]*?= \[([\s\S]*?)\n\];/,
  );
  assert.ok(catalog);

  const catalogIds = [...catalog[1].matchAll(/\n    id: "([^"]+)"/g)].map(
    (match) => match[1],
  );

  assert.equal(catalogIds.length, 50);
  assert.equal(new Set(catalogIds).size, 50);
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

test("Library 50 adds only five new runtime component families", () => {
  for (const loader of [
    "loadCursorWave",
    "loadSkewedCarousel",
    "loadTumbleCarousel",
    "loadRotatingCards",
    "loadCreditCard",
  ]) {
    assert.match(showcase, new RegExp(`const ${loader} =`));
    assert.match(showcase, new RegExp(`preload: ${loader}`));
  }
});

test("new Library 50 source families avoid WebGL and react-three-fiber", () => {
  const sources = [
    "components/react-bits/cursor-wave.tsx",
    "components/react-bits/skewed-carousel.tsx",
    "components/react-bits/tumble-carousel.tsx",
    "components/react-bits/rotating-cards.tsx",
    "components/react-bits/credit-card.tsx",
  ].map((filePath) => readFileSync(filePath, "utf8"));

  for (const sourceText of sources) {
    assert.doesNotMatch(sourceText, /WebGLRenderer/);
    assert.doesNotMatch(sourceText, /@react-three\/fiber/);
  }

  assert.match(sources[0], /getContext\("2d"\)/);
  assert.match(sources[0], /cancelAnimationFrame\(rt\.raf\)/);
  assert.match(sources[1], /clearInterval\(tick\)/);
  assert.match(sources[2], /clearInterval\(tick\)/);
  assert.match(sources[3], /cancelAnimationFrame\(animationFrameId\)/);
});

test("Russian and English contain direct copy for all thirty new presets", () => {
  for (const locale of ["ru", "en"]) {
    const localeSource = readFileSync(
      `lib/i18n/locales/${locale}/components.ts`,
      "utf8",
    );

    for (const id of newIds) {
      assert.ok(localeSource.includes(`"${id}":`), `${locale} missing ${id}`);
    }
  }
});

test("secondary locales inherit English copy for future catalog additions", () => {
  for (const locale of ["uk", "pl", "de", "es", "fr", "pt"]) {
    const localeSource = readFileSync(
      `lib/i18n/locales/${locale}/components.ts`,
      "utf8",
    );
    assert.match(localeSource, /\.\.\.englishComponents\.items/);
  }
});
