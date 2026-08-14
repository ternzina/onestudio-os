import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");
const migrationPath =
  "../supabase/migrations/20260814170000_package_template_legacy_demo_isolation.sql";

test("package template identity no longer comes from legacy_demo_slug", async () => {
  const migration = await read(migrationPath);

  assert.match(migration, /drop column legacy_demo_slug/);
  assert.match(migration, /v_bootstrap_demo constant text := ''lumiere''/);
  assert.match(migration, /replace\(v_definition, v_registry_lookup, ''\)/);
  assert.match(migration, /set demo_slug = null, business_type = v_business_type/);
  assert.doesNotMatch(migration, /if v_template\s*=|case v_template/);
});

test("shared bootstrap cannot replace canonical template identity or locale seeds", async () => {
  const [isolation, canonical] = await Promise.all([
    read(migrationPath),
    read("../supabase/migrations/20260814090000_site_template_registry_creation_validation_1_0.sql"),
  ]);

  assert.match(canonical, /is_registered_site_template\(v_template, p_request -> 'template_seed' ->> 'template_id'\)/);
  assert.match(canonical, /locale_seed\.seed ->> 'template_id'/);
  assert.match(canonical, /draft_content = coalesce\(v_locale_seeds -> site_locale\.locale, v_seed\)/);
  assert.match(canonical, /\|\| jsonb_build_object\('template_id', v_template\)/);
  assert.match(isolation, /template_key\/seed_template_id and validated locale template_seeds are authoritative/);
});

test("GLOSS, LUMEA, and future packages share no template-specific bootstrap branch", async () => {
  const [isolation, registry] = await Promise.all([
    read(migrationPath),
    read("../supabase/migrations/20260814090000_site_template_registry_creation_validation_1_0.sql"),
  ]);

  assert.match(registry, /\('gloss-nail-studio', 'gloss-nail-studio'/);
  assert.match(registry, /\('lumea-beauty', 'lumea-beauty'/);
  assert.match(registry, /site_template_registry_seed_matches_key/);
  assert.doesNotMatch(isolation, /gloss-nail-studio|lumea-beauty/);
});
