import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("LeadsGate form normalizer restores the safe provider contract after legacy normalization", async () => {
  const migration = await readFile(new URL("../supabase/migrations/20260907020000_leadsgate_form_persistence_1_0.sql", import.meta.url), "utf8");
  assert.match(migration, /rename to normalize_public_site_custom_blocks_v_leadsgate_form_1_0/);
  assert.match(migration, /normalize_public_site_custom_blocks_v_leadsgate_form_1_0\(p_blocks\)/);
  assert.match(migration, /source\.block->>'kind' = 'leadsgate_form'/);
  assert.match(migration, /source\.block->>'leadsgate_aid'.*\^\[0-9\]\{1,12\}\$/s);
  assert.match(migration, /source\.block->>'leadsgate_template' = 'wallet-lines'/);
  assert.match(migration, /'kind', 'leadsgate_form'/);
  assert.match(migration, /'leadsgate_aid', source\.block->>'leadsgate_aid'/);
  assert.match(migration, /'leadsgate_template', 'wallet-lines'/);
  assert.match(migration, /join source using \(ordinality\)/);
  assert.doesNotMatch(migration, /actionInit\.js|track\.js|<script/i);
});

test("CashPath LeadsGate regression fixture and unrelated block boundaries stay explicit", async () => {
  const seed = await readFile(new URL("../lib/public-site/cashpath-premium-template-seed.ts", import.meta.url), "utf8");
  const migration = await readFile(new URL("../supabase/migrations/20260907020000_leadsgate_form_persistence_1_0.sql", import.meta.url), "utf8");
  assert.match(seed, /id: "cashpath-request", kind: "leadsgate_form"/);
  assert.match(seed, /leadsgate_aid: "4848"/);
  assert.match(seed, /leadsgate_template: "wallet-lines"/);
  assert.match(migration, /when source\.block->>'kind' = 'leadsgate_form'/);
  assert.match(migration, /else '\{\}'::jsonb/);
  assert.doesNotMatch(migration, /leadsgate_aid'.*else.*source\.block/s);
});

test("editor rejects a returned LeadsGate conversion before it reloads the draft", async () => {
  const editor = await readFile(new URL("../app/admin/site/page.tsx", import.meta.url), "utf8");
  assert.match(editor, /function leadsgateFormsRoundTripMatches\(/);
  assert.match(editor, /id: block\.id,[\s\S]*aid: block\.leadsgate_aid \?\? "",[\s\S]*template: block\.leadsgate_template \?\? ""/);
  assert.match(editor, /if \(!leadsgateFormsRoundTripMatches\(draftToSave, savedDraftContent\)\) \{[\s\S]*Форма заявки не была сохранена сервером[\s\S]*return false;/);
  assert.match(editor, /if \(!leadsgateFormsRoundTripMatches\(draftToSave, publishedContent\)\) \{[\s\S]*Публикация не подтверждена: сервер не сохранил форму заявки[\s\S]*return false;/);
  const saveGuard = editor.indexOf("Форма заявки не была сохранена сервером");
  const reload = editor.indexOf("await loadEditor(selectedLocale, { silent: true });");
  assert.ok(saveGuard >= 0 && reload > saveGuard, "the failed round-trip guard runs before editor reload");
});
