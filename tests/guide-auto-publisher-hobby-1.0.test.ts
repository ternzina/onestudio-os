import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const route = readFileSync(
  resolve(root, "app/api/cron/guide-publisher/route.ts"),
  "utf8",
);
const vercel = JSON.parse(readFileSync(resolve(root, "vercel.json"), "utf8"));
const migrationName = readdirSync(resolve(root, "supabase/migrations"))
  .filter((name) => name.endsWith("_guide_auto_publisher_hobby_1_0.sql"))
  .sort()
  .at(-1);
assert.ok(migrationName);
const migration = readFileSync(
  resolve(root, "supabase/migrations", migrationName),
  "utf8",
);

test("Guide publisher cron is protected and backend-only", () => {
  assert.match(route, /CRON_SECRET/);
  assert.match(route, /SUPABASE_SECRET_KEY/);
  assert.match(route, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(route, /submitIndexNow/);
});

test("Guide publisher promotes only review rows", () => {
  assert.match(migration, /publication_status = 'review'/);
  assert.match(migration, /translation_status = 'review'/);
  assert.match(migration, /published_at = current_date/);
  assert.match(migration, /security invoker/);
  assert.doesNotMatch(migration, /security definer/i);
});

test("Cron RPCs are service-role-only", () => {
  assert.match(migration, /from public, anon, authenticated/);
  assert.match(migration, /to service_role/);
});

test("Hobby schedule runs no more than once daily", () => {
  const cron = vercel.crons.find(
    (item: { path?: string }) => item.path === "/api/cron/guide-publisher",
  );
  assert.deepEqual(cron, {
    path: "/api/cron/guide-publisher",
    schedule: "40 18 * * *",
  });
});
