import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  createPublicSiteCustomBlock,
  PUBLIC_SITE_CUSTOM_BLOCK_REGISTRY,
} from "../lib/public-site/custom-block-registry.ts";
import {
  createPublicSiteCoreBlockPreset,
  PUBLIC_SITE_CORE_BLOCK_LIBRARY,
} from "../lib/public-site/core-block-library.ts";

const TEMPLATE_MEDIA_PREFIXES = [
  "/templates/gloss/",
  "/templates/align-pilates/",
  "/templates/velora/",
  "/templates/ritmo-dance-studio/",
  "/images/demos/premium-kids-center/",
  "/images/demos/premium-studio/",
] as const;

const TEMPLATE_IDENTIFIERS = [
  "gloss-nail-studio",
  "premium-kids-center",
  "align-pilates-studio",
  "ritmo-dance-studio",
  "velora-event-venue",
  "lumea-beauty",
  "premium-studio",
] as const;

function assertTemplateNeutral(value: unknown, label: string) {
  const serialized = JSON.stringify(value).toLowerCase();
  for (const prefix of TEMPLATE_MEDIA_PREFIXES) {
    assert.equal(serialized.includes(prefix), false, `${label} contains template media ${prefix}`);
  }
  for (const identifier of TEMPLATE_IDENTIFIERS) {
    assert.equal(serialized.includes(identifier), false, `${label} contains template identity ${identifier}`);
  }
}

test("universal media blocks start with neutral empty media", () => {
  const mediaText = createPublicSiteCustomBlock("media_text", "media-text-test");
  const slider = createPublicSiteCustomBlock("slider", "slider-test");
  const collage = createPublicSiteCustomBlock("collage", "collage-test");

  assert.equal(mediaText.media_url, undefined);
  assert.deepEqual(slider.media_urls, []);
  assert.deepEqual(collage.media_urls, []);
  assertTemplateNeutral(mediaText, "media_text default");
  assertTemplateNeutral(slider, "slider default");
  assertTemplateNeutral(collage, "collage default");
});

test("every universal factory kind and core preset is template-neutral", () => {
  for (const definition of PUBLIC_SITE_CUSTOM_BLOCK_REGISTRY) {
    assertTemplateNeutral(
      createPublicSiteCustomBlock(definition.kind, `kind-${definition.kind}`),
      `${definition.kind} factory default`,
    );
  }

  for (const preset of PUBLIC_SITE_CORE_BLOCK_LIBRARY) {
    assertTemplateNeutral(
      createPublicSiteCoreBlockPreset(preset.id, `preset-${preset.id}`),
      `${preset.id} core preset`,
    );
  }

  const about = createPublicSiteCoreBlockPreset("about", "about-test");
  const contact = createPublicSiteCoreBlockPreset("contact", "contact-test");
  assert.equal(about.media_url, undefined);
  assert.equal(contact.media_url, undefined);
  assert.equal(contact.media_type, "image");
});

test("shared editor source has no template-owned GLOSS media fallback or action identity", async () => {
  const source = await readFile(
    new URL("../app/admin/site/page.tsx", import.meta.url),
    "utf8",
  );

  for (const forbiddenName of [
    "glossMasterImages",
    "glossServiceImages",
    "glossMembershipImage",
    "glossGiftImage",
  ]) {
    assert.equal(source.includes(forbiddenName), false, `${forbiddenName} remains in shared editor source`);
  }
  assert.equal(source.includes("/templates/gloss/"), false);
  assert.doesNotMatch(
    source,
    /premiumNativeActionKey\(\s*["']gloss-nail-studio["']\s*,/,
  );
});
