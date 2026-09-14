import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const migration = readFileSync(
  resolve("supabase/migrations/20260914174451_public_site_bulk_page_save_1_0.sql"),
  "utf8",
);
const bulkTest = readFileSync(
  resolve("supabase/tests/onestudio-public-site-bulk-page-save-1-0-tests.sql"),
  "utf8",
);

test("bulk draft save preserves the public RPC contract and isolates pages from the legacy chain", () => {
  assert.match(migration, /create or replace function public\.save_public_site_draft\(/);
  assert.match(migration, /p_business_id uuid,\s+p_locale text,\s+p_content jsonb,\s+p_make_primary boolean default false/s);
  assert.match(migration, /security definer/);
  assert.match(migration, /set search_path = public/);
  assert.match(migration, /v_page_source := case[\s\S]*v_source->'pages'/);
  assert.match(migration, /v_legacy_source := jsonb_set\(v_source, '\{pages\}', '\[\]'::jsonb, true\)/);
  assert.match(migration, /save_public_site_draft_v_site_settings_terminal_1_1\([\s\S]*v_legacy_source/);
  assert.match(migration, /v_pages := public\.normalize_public_site_pages\(v_page_source\)/);
  assert.match(migration, /merge_public_site_rich_page_titles\(v_pages, v_page_source\)/);
  assert.match(migration, /set draft_content = v_saved/);
  assert.doesNotMatch(migration, /statement_timeout\s*=/i);
});

test("bulk save regression fixture covers 100 pages, idempotency, and publish copy", () => {
  assert.match(bulkTest, /generate_series\(1, 100\)/);
  assert.match(bulkTest, /set local statement_timeout = '30s'/);
  assert.match(bulkTest, /jsonb_array_length\(draft_content->'pages'\)[\s\S]*100/);
  assert.match(bulkTest, /cashpath-bulk-guide-001/);
  assert.match(bulkTest, /cashpath-bulk-guide-050/);
  assert.match(bulkTest, /cashpath-bulk-guide-100/);
  assert.match(bulkTest, /a second bulk save is idempotent/);
  assert.match(bulkTest, /Publish copies exactly the 100 saved pages/);
});
