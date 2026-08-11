import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolveCreationContract } from "../lib/public-site/template-creation.ts";
import { resolveVeloraContent } from "../lib/public-site/velora-premium-template-content.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("VELORA creation contract carries distinct Russian and English seeds", () => {
  const creation = resolveCreationContract({
    creation_mode: "template",
    template_key: "velora-event-venue",
    locales: ["ru", "en"],
  });

  assert.equal(creation.template_key, "velora-event-venue");
  assert.equal(creation.seed.template_id, "velora-event-venue");
  assert.deepEqual(Object.keys(creation.localizedSeeds), ["ru", "en"]);
  assert.equal(
    resolveVeloraContent(creation.localizedSeeds.ru).hero.title,
    "Вечер, который останется с вами навсегда.",
  );
  assert.equal(
    resolveVeloraContent(creation.localizedSeeds.en).hero.title,
    "An evening that stays with you forever.",
  );
  assert.notDeepEqual(creation.localizedSeeds.ru, creation.localizedSeeds.en);
});

test("site wizard submits locale seeds through the canonical RPC", async () => {
  const wizard = await read("../app/new-site/CanonicalSiteCreationWizard.tsx");
  assert.match(wizard, /locales: requestedLocales/);
  assert.match(wizard, /template_seeds: creation\.localizedSeeds/);
  assert.equal((wizard.match(/\.rpc\("create_template_workspace"/g) ?? []).length, 1);
});

test("forward migration admits VELORA and stores the matching locale seed", async () => {
  const migration = await read(
    "../supabase/migrations/20260811190000_velora_template_creation_release_1_0.sql",
  );
  assert.match(migration, /'velora-event-venue'/);
  assert.match(migration, /p_request -> 'template_seeds'/);
  assert.match(migration, /v_locale_seeds -> site_locale\.locale/);
  assert.match(migration, /coalesce\(v_locale_seeds -> site_locale\.locale, v_seed\)/);
  assert.match(migration, /grant execute on function public\.create_template_workspace\(jsonb\) to authenticated, service_role/);
});
