import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { translateAdmin } from "../lib/i18n/admin.ts";
import {
  normalizePublicSiteCompositionOrder,
  publicSiteBlockCompositionCapabilities,
  publicSiteBlockCompositionStyle,
  publicSiteCompositionItemStyle,
  resolvePublicSiteBlockComposition,
} from "../lib/public-site/block-composition.ts";
import { createPublicSiteCustomBlock } from "../lib/public-site/custom-block-registry.ts";
import type { PublicSiteCustomBlock } from "../lib/public-site/types.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("legacy universal blocks remain on the pre-3.0 renderer contract", () => {
  const legacy = createPublicSiteCustomBlock("media_text", "legacy-split");
  const composition = resolvePublicSiteBlockComposition(legacy);

  assert.equal(legacy.composition_enabled, undefined);
  assert.equal(composition.enabled, false);
  assert.deepEqual(publicSiteBlockCompositionStyle(legacy), {});
  assert.equal(publicSiteCompositionItemStyle(legacy, "title"), undefined);
});

test("opt-in composition resolves bounded desktop and mobile layout tokens", () => {
  const block: PublicSiteCustomBlock = {
    ...createPublicSiteCustomBlock("columns", "composed-columns"),
    composition_enabled: true,
    composition_layout: "stack" as const,
    composition_columns: 4 as const,
    composition_gap: "airy" as const,
    composition_align: "center" as const,
    composition_text_align: "right" as const,
    composition_card_layout: "horizontal" as const,
    composition_order: ["cards", "title"],
    composition_mobile_layout: "grid" as const,
    composition_mobile_columns: 2 as const,
    composition_mobile_gap: "compact" as const,
    composition_mobile_card_layout: "vertical" as const,
    composition_mobile_order: ["title", "text", "cards"],
  };
  const composition = resolvePublicSiteBlockComposition(block);
  const style = publicSiteBlockCompositionStyle(block);

  assert.equal(composition.enabled, true);
  assert.deepEqual(composition.order, ["cards", "title", "eyebrow", "text"]);
  assert.deepEqual(composition.mobileOrder, ["title", "text", "cards", "eyebrow"]);
  assert.equal(style["--os-composition-columns"], "4");
  assert.equal(style["--os-composition-mobile-columns"], "2");
  assert.equal(style["--os-composition-gap"], "clamp(28px, 5vw, 56px)");
  assert.equal(publicSiteCompositionItemStyle(block, "cards")?.["--os-composition-order"], "1");
  assert.equal(publicSiteCompositionItemStyle(block, "cards")?.["--os-composition-mobile-order"], "3");
});

test("composition capabilities and order normalization stay kind-aware", () => {
  assert.deepEqual(publicSiteBlockCompositionCapabilities("media_text").layouts, ["split", "stack"]);
  assert.equal(publicSiteBlockCompositionCapabilities("columns").cards, true);
  assert.deepEqual(
    normalizePublicSiteCompositionOrder("cta", ["action", "title", "action", "media"]),
    ["action", "title", "eyebrow", "text"],
  );
});

test("Standard, Premium, preview, public runtime and persistence share Block Composition 3.0", async () => {
  const [editor, inspector, premium, runtime, globals, migration] = await Promise.all([
    read("../app/admin/site/page.tsx"),
    read("../components/admin/BlockCompositionEditor.tsx"),
    read("../app/demos/premium-kids-center/PremiumUniversalBlock.tsx"),
    read("../components/public/PublicCustomBlock.tsx"),
    read("../app/globals.css"),
    read("../supabase/migrations/20260811235500_site_editor_block_composition_3_0.sql"),
  ]);

  assert.match(editor, /<BlockCompositionEditor/);
  assert.match(editor, /resolvePublicSiteBlockComposition/);
  assert.match(inspector, /data-block-composition-order/);
  assert.match(inspector, /composition_mobile_order/);
  assert.match(premium, /os-block-composition/);
  assert.match(runtime, /data-os-composition-card/);
  assert.match(globals, /--os-composition-mobile-columns/);
  assert.match(migration, /normalize_public_site_block_composition/);
  assert.match(migration, /normalize_public_site_custom_blocks_v30_base/);
  assert.equal(translateAdmin("ru", "Block composition"), "Композиция блока");
  assert.equal(translateAdmin("en", "Block composition"), "Block composition");
});
