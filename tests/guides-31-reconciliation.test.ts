import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { GUIDE_ARTICLES } from "../lib/seo/guide-articles.ts";

const migration = readFileSync(
  new URL("../supabase/migrations/20260914111606_guides_31_reconciliation.sql", import.meta.url),
  "utf8",
);

test("published Guide fallback reconciles the canonical 31-record registry", () => {
  assert.equal(GUIDE_ARTICLES.length, 31);
  assert.equal(new Set(GUIDE_ARTICLES.map((article) => article.slug)).size, GUIDE_ARTICLES.length);
});

test("reconciliation seed contains only the 18 missing records and cannot overwrite", () => {
  const seedSlugs = [...migration.matchAll(/"canonical_slug":"([a-z0-9-]+)"/g)].map((match) => match[1]);
  assert.equal(seedSlugs.length, 18);
  assert.equal(new Set(seedSlugs).size, seedSlugs.length);
  assert.match(migration, /on conflict \(canonical_slug\) do nothing/i);
  assert.match(migration, /on conflict \(article_id, locale\) do nothing/i);
  assert.doesNotMatch(migration, /on conflict[\s\S]*do update/i);
});
