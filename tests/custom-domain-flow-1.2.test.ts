import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("unapplied resolver migration replaces the exact old signature before changing OUT columns", async () => {
  const migration = await readFile(new URL("../supabase/migrations/20260906020000_custom_domain_flow_1_0.sql", import.meta.url), "utf8");
  assert.match(migration, /drop function if exists public\.resolve_public_site_domain\(text\)/);
  assert.match(migration, /create function public\.resolve_public_site_domain\(p_domain text\)/);
  assert.match(migration, /grant execute on function public\.resolve_public_site_domain\(text\)/);
});

test("a verified active canonical domain survives a transient HTTPS companion failure", async () => {
  const route = await readFile(new URL("../app/api/client/domains/route.ts", import.meta.url), "utf8");
  assert.match(route, /current\?\.status === "active"/);
  assert.match(route, /current\.ssl_ready/);
  assert.match(route, /result\.vercelVerified &&\s*!result\.sslReady/);
  assert.match(route, /last_error: result\.lastError/);
});
