import assert from "node:assert/strict";
import test from "node:test";
import {
  updateProductionEditorArrayItem,
  updateProductionEditorField,
  resetProductionEditorBlock,
} from "../lib/puck-site-editor/builder-properties.ts";
import {
  PUCK_PRODUCTION_MANIFEST,
  PUCK_PRODUCTION_MANIFEST_BY_ID,
} from "../lib/puck-site-editor/registry-manifest.ts";
import { validateComponentEditorContract, type ProductionEditorValue } from "../lib/puck-site-editor/builder-contract.ts";

const selected = {
  hero: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch12_hero_18")!,
  cta: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch11_cta_10")!,
  navigation: PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_batch11_navigation_9")!,
};

test("Batch 1 keeps the production registry count and persisted identities", () => {
  assert.equal(PUCK_PRODUCTION_MANIFEST.length, 280);
  assert.equal(selected.hero.catalogKey, "pro-block:hero-18");
  assert.equal(selected.cta.catalogKey, "pro-block:cta-10");
  assert.equal(selected.navigation.catalogKey, "pro-block:navigation-9");
  assert.equal(selected.hero.rendererSource, "@/components/puck-site-editor/adapted-library/hero-18");
  assert.equal(selected.cta.rendererSource, "@/components/puck-site-editor/adapted-library/cta/cta-10");
  assert.equal(selected.navigation.rendererSource, "@/components/puck-site-editor/adapted-library/navigation-9");
});

test("Batch 1 contracts expose only genuine component content, media, actions, and navigation data", () => {
  for (const entry of Object.values(selected)) {
    assert.ok(entry.editorContract);
    assert.deepEqual(validateComponentEditorContract(entry.editorContract), []);
    assert.deepEqual(entry.editorContract.defaultProps, Object.fromEntries(
      Object.keys(entry.editorContract.defaultProps).map((key) => [key, entry.defaults[key]]),
    ));
  }

  assert.deepEqual(selected.hero.editorContract!.fields.map((field) => [field.key, field.group]), [
    ["heading", "CONTENT"],
    ["description", "CONTENT"],
    ["primaryButtonLabel", "ACTIONS"],
    ["loop", "MOTION"],
  ]);
  assert.deepEqual(selected.cta.editorContract!.fields.map((field) => [field.key, field.group]), [
    ["heading", "CONTENT"],
    ["description", "CONTENT"],
    ["emailPlaceholder", "CONTENT"],
    ["buttonLabel", "ACTIONS"],
    ["mediaUrl", "MEDIA"],
  ]);
  assert.deepEqual(selected.navigation.editorContract!.arrays[0].itemFields.map((field) => [field.key, field.group]), [
    ["label", "CONTENT"],
    ["href", "ACTIONS"],
  ]);
});

test("Batch 1 fields update, serialize, reload, and reset through shared Builder helpers", () => {
  const heroContract = selected.hero.editorContract!;
  const heroDefaults = selected.hero.defaults as Readonly<Record<string, ProductionEditorValue>>;
  const heroEdited = updateProductionEditorField(heroDefaults, heroContract, "heading", "Edited\nHero");
  assert.equal(heroEdited.heading, "Edited\nHero");
  assert.deepEqual(resetProductionEditorBlock(heroEdited, heroContract), selected.hero.defaults);

  const ctaContract = selected.cta.editorContract!;
  const ctaDefaults = selected.cta.defaults as Readonly<Record<string, ProductionEditorValue>>;
  const ctaEdited = updateProductionEditorField(ctaDefaults, ctaContract, "mediaUrl", "/media/cta-10.webp");
  assert.equal(ctaEdited.mediaUrl, "/media/cta-10.webp");
  assert.deepEqual(resetProductionEditorBlock(ctaEdited, ctaContract), selected.cta.defaults);

  const navigationContract = selected.navigation.editorContract!;
  const navigationDefaults = selected.navigation.defaults as Readonly<Record<string, ProductionEditorValue>>;
  const navigationEdited = updateProductionEditorArrayItem(
    navigationDefaults,
    navigationContract,
    "links",
    0,
    "href",
    "/products",
  );
  assert.equal((navigationEdited.links as readonly { href: string }[])[0].href, "/products");
  assert.deepEqual(resetProductionEditorBlock(navigationEdited, navigationContract), selected.navigation.defaults);
});
