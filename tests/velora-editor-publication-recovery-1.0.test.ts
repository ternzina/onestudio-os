import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createTemplateSeed } from "../lib/public-site/template-seeds.ts";
import { VELORA_PREMIUM_TEMPLATE_CONTRACT } from "../lib/public-site/velora-premium-template-contract.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");
const KEY = "velora-event-venue";

test("new-site opens the exact workspace returned by the creation RPC", async () => {
  const wizard = await read("../app/new-site/CanonicalSiteCreationWizard.tsx");
  assert.match(wizard, /business_id\?: string/);
  assert.match(
    wizard,
    /`\/admin\/site\?business=\$\{encodeURIComponent\(result\.business_id\)\}`/,
  );
  assert.doesNotMatch(wizard, /router\.replace\("\/admin\/site"\)/);
});

test("VELORA editor canvas renders the released VELORA runtime, not the generic site", async () => {
  const [registry, editor, velora] = await Promise.all([
    read("../lib/public-site/premium-template-editor-canvas-registry.tsx"),
    read("../app/admin/site/page.tsx"),
    read("../components/public/velora/VeloraSite.tsx"),
  ]);
  assert.match(registry, /import\("@\/components\/public\/velora\/VeloraSite"\)/);
  assert.match(registry, /\["velora-event-venue", VeloraEditorCanvasRenderer\]/);
  assert.match(editor, /<PremiumTemplateEditorCanvas[\s\S]*site=\{premiumEditorPreviewSite\}/);
  assert.match(velora, /data-editor-anchor=\{sectionId\}/);
  assert.match(velora, /data-editor-anchor=\{token\}/);
});

test("VELORA save migration accepts every canonical native token and no invented section", async () => {
  const migration = await read(
    "../supabase/migrations/20260811210000_velora_editor_layout_order_persistence_1_0.sql",
  );
  const seed = createTemplateSeed(KEY);
  const expectedTokens = VELORA_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(
    ({ id }) => `native:${KEY}:${id}`,
  );
  assert.deepEqual(seed.layout_order, expectedTokens);
  for (const token of expectedTokens) {
    assert.ok(migration.includes(token.split(":").at(-1)!), token);
  }
  assert.match(migration, /lower\(trim\(coalesce\(p_template_id, ''\)\)\) = 'velora-event-venue'/);
  assert.match(migration, /\^native:velora-event-venue:\(hero\|facts[\s\S]*availability\|footer\)\$/);
  assert.doesNotMatch(migration, /native:velora-event-venue:\([^\n]*invented/);
});

test("save wrapper preserves the prior pipeline and normalizes through VELORA v3", async () => {
  const savePipeline = await read(
    "../supabase/migrations/20260811210000_velora_editor_layout_order_persistence_1_0.sql",
  );
  assert.match(savePipeline, /to_regprocedure\([\s\S]*save_public_site_draft_v_velora_layout_1_0/);
  assert.match(savePipeline, /public\.save_public_site_draft_v_velora_layout_1_0\(/);
  assert.match(
    savePipeline,
    /public\.normalize_public_site_layout_order_v3\([\s\S]*v_layout_source,[\s\S]*v_template_id[\s\S]*\)/,
  );
});
