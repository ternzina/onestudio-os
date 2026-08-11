import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  setImmutableDeepPath,
  setTemplateContentPath,
} from "../lib/public-site/immutable-deep-path.ts";
import {
  buildVeloraAvailabilityHref,
  parseVeloraAvailabilitySelection,
} from "../lib/public-site/velora-availability-selection.ts";

test("template media paths immutably create hero objects and venue/gallery arrays", () => {
  const empty = {};
  const hero = setImmutableDeepPath(empty, "hero.image", "/hero.jpg") as {
    hero: { image: string };
  };
  assert.deepEqual(hero, { hero: { image: "/hero.jpg" } });
  assert.deepEqual(empty, {});

  const partial = { venues: [{ name: "Existing" }], untouched: true };
  const venue = setImmutableDeepPath(
    partial,
    "venues.0.image",
    "/venue.jpg",
  ) as { venues: Array<Record<string, unknown>>; untouched: boolean };
  assert.ok(Array.isArray(venue.venues));
  assert.deepEqual(venue.venues[0], {
    name: "Existing",
    image: "/venue.jpg",
  });
  assert.equal(venue.untouched, true);
  assert.notEqual(venue, partial);
  assert.notEqual(venue.venues, partial.venues);
  assert.deepEqual(partial, { venues: [{ name: "Existing" }], untouched: true });

  const gallery = setImmutableDeepPath({}, "gallery.4.image", "/gallery.jpg") as {
    gallery: Array<unknown>;
  };
  assert.ok(Array.isArray(gallery.gallery));
  assert.equal(gallery.gallery.length, 5);
  assert.deepEqual(gallery.gallery[4], { image: "/gallery.jpg" });
});

test("template media updates preserve every other template_content namespace", () => {
  const templateContent = {
    "gloss-nail-studio": { hero: { title: "GLOSS" } },
    "premium-studio": { hero: { title: "NOIR" } },
  };
  const updated = setTemplateContentPath(
    templateContent,
    "velora-event-venue",
    "venues.0.image",
    "/venue.jpg",
  );
  assert.strictEqual(
    updated["gloss-nail-studio"],
    templateContent["gloss-nail-studio"],
  );
  assert.strictEqual(updated["premium-studio"], templateContent["premium-studio"]);
  assert.deepEqual(updated["velora-event-venue"], {
    venues: [{ image: "/venue.jpg" }],
  });
  assert.equal(templateContent["velora-event-venue" as keyof typeof templateContent], undefined);
});

test("template media paths reject prototype-pollution segments", () => {
  for (const path of [
    "__proto__.polluted",
    "hero.constructor.polluted",
    "gallery.prototype.polluted",
  ]) {
    assert.throws(() => setImmutableDeepPath({}, path, true), /Unsafe/);
  }
  assert.equal(({} as { polluted?: boolean }).polluted, undefined);
  assert.throws(
    () => setTemplateContentPath({}, "__proto__", "hero.image", "bad"),
    /Unsafe/,
  );
});

test("availability href and parser select only normalized venue/package names", () => {
  const venueHref = buildVeloraAvailabilityHref(
    "/demos/velora-event-venue",
    "venue",
    "Белый зал & сад",
  );
  assert.equal(
    venueHref,
    "/demos/velora-event-venue?venue=%D0%91%D0%B5%D0%BB%D1%8B%D0%B9+%D0%B7%D0%B0%D0%BB+%26+%D1%81%D0%B0%D0%B4#availability",
  );
  assert.deepEqual(
    parseVeloraAvailabilitySelection(
      venueHref.slice(venueHref.indexOf("?"), venueHref.indexOf("#")),
      ["Белый зал & сад"],
      ["Премиум"],
    ),
    { venue: "Белый зал & сад", packageName: "" },
  );

  const packageHref = buildVeloraAvailabilityHref("/site", "packageName", "Всё включено");
  assert.deepEqual(
    parseVeloraAvailabilitySelection(
      new URL(packageHref, "https://example.test").searchParams,
      ["Белый зал"],
      ["Всё включено"],
    ),
    { venue: "", packageName: "Всё включено" },
  );
  assert.deepEqual(
    parseVeloraAvailabilitySelection("?venue=unknown&package=invalid", ["Белый зал"], ["Премиум"]),
    { venue: "", packageName: "" },
  );
});

test("VELORA root never masks horizontal overflow", async () => {
  const css = await readFile(
    new URL("../components/public/velora/Velora.module.css", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    css,
    /\.site\s*\{[^}]*overflow-x\s*:\s*(?:hidden|clip)/is,
  );
  assert.doesNotMatch(css, /(?:html|body|:global\([^)]*\))[^{}]*\{[^}]*overflow-x\s*:\s*(?:hidden|clip)/is);
});
