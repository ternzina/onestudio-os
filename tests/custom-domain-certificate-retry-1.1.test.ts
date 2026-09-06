import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("certificate retry is server-only, bounded, and covers the verified domain pair", async () => {
  const [server, route, migration] = await Promise.all([
    readFile(new URL("../lib/server/vercel-domains.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/client/domains/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../supabase/migrations/20260906030000_custom_domain_certificate_retry_1_1.sql", import.meta.url), "utf8"),
  ]);
  assert.match(server, /\/v8\/certs\?teamId=/);
  assert.match(server, /JSON\.stringify\(\{ cns \}\)/);
  assert.match(route, /CERTIFICATE_GRACE_MS/);
  assert.match(route, /CERTIFICATE_RETRY_COOLDOWN_MS/);
  assert.match(route, /MAX_CERTIFICATE_RETRIES = 2/);
  assert.match(route, /result\.vercelVerified && result\.dnsConfigured && !result\.sslReady/);
  assert.match(route, /issueVercelCertificate\(\[result\.domain, .*result\.redirectDomain/s);
  assert.match(migration, /certificate_retry_at/);
  assert.match(migration, /certificate_retry_count/);
});
