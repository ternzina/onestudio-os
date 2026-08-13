import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("3.2.7 wraps rather than bypasses the Rich Heading save pipeline", async () => {
  const migration = await read("../supabase/migrations/20260813090000_premium_native_action_persistence_3_2_7.sql");
  const richHeading = await read("../supabase/migrations/20260812013000_site_editor_rich_heading_3_1_2.sql");

  assert.match(richHeading, /save_public_site_draft_v_rich_heading_3_1_2/);
  assert.match(migration, /rename to save_public_site_draft_v_native_action_styles_3_2_7/);
  assert.match(migration, /v_saved := public\.save_public_site_draft_v_native_action_styles_3_2_7\(/);
  assert.match(migration, /v_saved := coalesce\(v_saved, '\{\}'::jsonb\) - 'native_action_styles'/);
  assert.doesNotMatch(migration, /v_previous->'native_action_styles'/);
});

test("3.2.7 defensively validates one bounded shared map", async () => {
  const migration = await read("../supabase/migrations/20260813090000_premium_native_action_persistence_3_2_7.sql");

  assert.match(migration, /limit 128/);
  assert.match(migration, /octet_length\(p_value::text\) <= 262144/);
  assert.match(migration, /\^\[a-z0-9\].*:\[a-z0-9\].*:\[a-z0-9\].*\$/);
  assert.match(migration, /in \('small', 'medium', 'large'\)/);
  assert.match(migration, /\^#\[0-9a-f\]\{6\}\$/);
  assert.match(migration, /jsonb_typeof\(source\.value\) = 'object'/);
  assert.match(migration, /where normalized_style <> '\{\}'::jsonb/);
});

test("Save and Publish guard native action style round trips, including clear semantics", async () => {
  const page = await read("../app/admin/site/page.tsx");

  assert.match(page, /function nativeActionStylesRoundTripMatches/);
  assert.match(page, /saved\?\.native_action_styles \?\? \{\}/);
  assert.match(page, /draft\.native_action_styles \?\? \{\}/);
  assert.equal(
    page.match(/nativeActionStylesRoundTripMatches\(draftToSave, (?:savedDraftContent|publishedContent)\)/g)?.length,
    2,
  );
  assert.match(page, /сервер изменил оформление кнопок Premium/);
});

test("BEMBI keeps its compatible template_content native_buttons path", async () => {
  const [editor, content, migration] = await Promise.all([
    read("../components/admin/PremiumTemplateEditor.tsx"),
    read("../lib/public-site/premium-kids-content.ts"),
    read("../supabase/migrations/20260813090000_premium_native_action_persistence_3_2_7.sql"),
  ]);

  assert.match(editor, /props\.native_buttons/);
  assert.match(content, /native_buttons\?: PremiumKidsNativeButtons/);
  assert.doesNotMatch(migration, /premium-kids-center|BEMBI|native_buttons/);
});
