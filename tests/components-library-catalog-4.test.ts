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
  "vortex",
  "flicker",
  "page-flip",
  "glitch-text",
] as const;

test("library 4 grows the public catalog to twenty while homepage stays curated", () => {
  const catalog = showcase.match(
    /export const componentCatalogItems:[\s\S]*?= \[([\s\S]*?)\n\];\n\nconst HOME_SHOWCASE_IDS/,
  );
  assert.ok(catalog);

  const catalogIds = [...catalog[1].matchAll(/\n    id: "([^"]+)"/g)].map(
    (match) => match[1],
  );

  assert.equal(catalogIds.length, 20);
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

test("library 4 uses explicit lazy loaders for all four additions", () => {
  for (const loader of [
    "loadVortex",
    "loadFlicker",
    "loadPageFlip",
    "loadGlitchText",
  ]) {
    assert.match(showcase, new RegExp(`preload: ${loader}`));
  }
});

test("library 4 selected additions avoid raw WebGL dependencies", () => {
  const selectedSources = [
    "components/react-bits/vortex.tsx",
    "components/react-bits/flicker.tsx",
    "components/react-bits/page-flip.tsx",
    "components/react-bits/glitch-text.tsx",
  ].map((path) => readFileSync(path, "utf8"));

  for (const source of selectedSources) {
    assert.doesNotMatch(source, /WebGLRenderer/);
    assert.doesNotMatch(source, /@react-three\/fiber/);
  }

  const vortex = selectedSources[0];
  const flicker = selectedSources[1];

  assert.match(vortex, /getContext\("2d"\)/);
  assert.match(vortex, /cancelAnimationFrame\(frameId\)/);
  assert.match(vortex, /resizeObs\.disconnect\(\)/);

  assert.match(flicker, /getContext\("2d"\)/);
  assert.match(flicker, /cancelAnimationFrame\(animationFrameId\)/);
  assert.match(flicker, /resizeObserver\.disconnect\(\)/);
});

test("catalog cards open a large live preview without editor integration", () => {
  assert.match(page, /setActiveItem\(item\)/);
  assert.match(page, /role="dialog"/);
  assert.match(page, /aria-modal="true"/);
  assert.match(page, /event\.key === "Escape"/);
  assert.match(page, /document\.body\.style\.overflow = "hidden"/);
  assert.match(page, /ComponentCatalogPreview item=\{activeItem\}/);
  assert.doesNotMatch(page, /\/editor/);
});

test("all public locales include library 4 labels and preview controls", () => {
  const locales = ["ru", "en", "uk", "pl", "de", "es", "fr", "pt"];

  for (const locale of locales) {
    const source = readFileSync(
      `lib/i18n/locales/${locale}/components.ts`,
      "utf8",
    );

    assert.match(source, /openPreview:/);
    assert.match(source, /closePreview:/);

    for (const id of newIds) {
      assert.ok(source.includes(`"${id}":`), `${locale} missing ${id}`);
    }
  }
});
