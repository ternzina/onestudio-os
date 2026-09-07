import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { CASH_PATH_FINAL_SEO_PAGES } from "../lib/public-site/cashpath-final-seo-content.generated.ts";

test("page block capacity migration keeps the terminal validator and rejects only above 64", async () => {
  const migration = await readFile(new URL("../supabase/migrations/20260907180000_public_site_page_block_capacity_1_0.sql", import.meta.url), "utf8");
  assert.match(migration, /rename to normalize_public_site_custom_blocks_v_page_block_capacity_1_0/);
  assert.match(migration, /jsonb_array_length\(p_blocks\) > 64/);
  assert.match(migration, /public_site_block_limit_exceeded/);
  assert.match(migration, /normalize_public_site_custom_blocks_v_page_block_capacity_1_0\([\s\S]*jsonb_build_array\(v_normalized_item\)/);
  assert.match(migration, /v_seen_ids/);
  assert.match(migration, /v_output_count/);
  assert.doesNotMatch(migration, /exit when v_item_count >= 12/);
});

test("CashPath final pages fit the generic 64-block guardrail without losing rich content", () => {
  assert.deepEqual(
    CASH_PATH_FINAL_SEO_PAGES.map((page) => [page.slug, page.blocks.length]),
    [["about", 7], ["faq", 15], ["rates-fees", 9], ["responsible-lending", 9], ["contact", 6], ["privacy-policy", 16], ["terms-of-use", 18], ["e-consent", 11], ["advertiser-disclosure", 8], ["do-not-sell-share", 10], ["disclaimer", 11]],
  );
  const serialized = JSON.stringify(CASH_PATH_FINAL_SEO_PAGES);
  assert.match(serialized, /\\"type\\":\\"p\\"/);
  assert.match(serialized, /\\"type\\":\\"strong\\"/);
  assert.match(serialized, /\\"type\\":\\"em\\"/);
  assert.match(serialized, /\\"href\\":\\"\/p\//);
  assert.match(serialized, /https:\/\/www\.consumerfinance\.gov\//);
  assert.match(serialized, /https:\/\/consumer\.ftc\.gov\//);
});
