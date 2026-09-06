import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("custom domain resolver distinguishes canonical and redirect hosts without exposing inactive records", async () => {
  const migration = await read("../supabase/migrations/20260906020000_custom_domain_flow_1_0.sql");
  assert.match(migration, /canonical_domain text/);
  assert.match(migration, /is_redirect boolean/);
  assert.match(migration, /d\.domain = .*or d\.redirect_domain =/s);
  assert.match(migration, /d\.status = 'active'/);
  assert.match(migration, /d\.ssl_ready = true/);
});

test("redirect hosts use a stored canonical target and preserve the request path and query", async () => {
  const routing = await read("../lib/public-site/domain-routing.ts");
  assert.match(routing, /resolution\.is_redirect/);
  assert.match(routing, /https:\/\/\$\{resolution\.canonical_domain\}/);
  assert.match(routing, /request\.nextUrl\.pathname \+ request\.nextUrl\.search/);
  assert.match(routing, /,\s*308/);
});

test("pending domain state is refreshed only through the authenticated domain endpoint with bounded polling", async () => {
  const [route, manager, dashboard] = await Promise.all([
    read("../app/api/client/domains/route.ts"),
    read("../components/dashboard/ClientDomainManager.tsx"),
    read("../app/dashboard/page.tsx"),
  ]);
  assert.match(route, /PENDING_DOMAIN_REFRESH_MS = 60_000/);
  assert.match(route, /refreshPendingDomainIfDue/);
  assert.match(route, /inspectVercelDomain\(/);
  assert.match(manager, /window\.setInterval\(\(\) => void load\(\), 30_000\)/);
  assert.match(dashboard, /Проверить настройку/);
  assert.match(dashboard, /настройка DNS и HTTPS продолжается автоматически/);
});
