import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");
const migrationPath =
  "../supabase/migrations/20260814090000_site_template_registry_creation_validation_1_0.sql";

test("template creation validation is registry-driven and seed-consistent", async () => {
  const migration = await read(migrationPath);
  assert.match(migration, /create table if not exists public\.site_template_registry/);
  assert.match(migration, /site_template_registry_seed_matches_key/);
  assert.match(migration, /is_registered_site_template\(v_template, p_request -> 'template_seed' ->> 'template_id'\)/);
  assert.match(migration, /locale_seed\.seed ->> 'template_id'/);
  assert.doesNotMatch(migration, /v_template not in\s*\(/);
  assert.doesNotMatch(migration, /if v_template\s*=\s*'lumea-beauty'/);
});

test("registry migration includes all currently supported canonical templates", async () => {
  const migration = await read(migrationPath);
  for (const key of [
    "standard",
    "gloss-nail-studio",
    "premium-kids-center",
    "premium-studio",
    "velora-event-venue",
    "lumea-beauty",
  ]) {
    assert.match(migration, new RegExp(`\\('${key}', '${key}'`));
  }
  assert.match(migration, /is_customer_creatable = true/);
  assert.match(migration, /is_active = true/);
  assert.match(migration, /raise exception 'template_key_invalid'/);
});

test("registry remains private and the canonical RPC keeps its security contract", async () => {
  const migration = await read(migrationPath);
  assert.match(migration, /security definer[\s\S]*set search_path = public/);
  assert.match(migration, /revoke all on table public\.site_template_registry from public, anon, authenticated/);
  assert.match(migration, /revoke all on function public\.create_template_workspace\(jsonb\) from public, anon, authenticated/);
  assert.match(migration, /grant execute on function public\.create_template_workspace\(jsonb\) to authenticated, service_role/);
  assert.match(migration, /pg_advisory_xact_lock/);
});
