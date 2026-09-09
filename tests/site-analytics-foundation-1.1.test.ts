import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260909050000_site_analytics_foundation_1_1.sql",
  "utf8",
);

const route = readFileSync(
  "app/api/public/analytics/route.ts",
  "utf8",
);

const tracker = readFileSync(
  "components/public/PublicSiteAnalyticsTracker.tsx",
  "utf8",
);

const neutralRoute = readFileSync(
  "app/api/public/site-event/route.ts",
  "utf8",
);

const layout = readFileSync(
  "app/site/[businessSlug]/layout.tsx",
  "utf8",
);

test("site analytics table is tenant-bound and private", () => {
  assert.match(
    migration,
    /business_id uuid not null/,
  );

  assert.match(
    migration,
    /enable row level security/,
  );

  assert.match(
    migration,
    /revoke all on table public\.site_analytics_events[\s\S]*anon, authenticated/,
  );

  assert.match(
    migration,
    /to service_role/,
  );
});

test("raw analytics does not store direct personal identity", () => {
  assert.doesNotMatch(
    migration,
    /\bemail\b\s+text|\bphone\b\s+text|\bclient_name\b/,
  );

  assert.match(
    route,
    /createHash\("sha256"\)/,
  );

  assert.match(
    route,
    /hashRateLimitValue/,
  );

  assert.doesNotMatch(
    route,
    /ip_address|raw_ip|client_ip/,
  );
});

test("gateway records privacy-safe traffic dimensions and protects storage", () => {
  assert.match(route, /x-vercel-ip-country/);
  assert.match(route, /x-vercel-ip-city/);
  assert.match(route, /is_technical_host/);
  assert.match(route, /utm_source/);
  assert.match(route, /referrer_host/);
  assert.match(route, /claim_booking_email_rate_limit/);
  assert.match(route, /isLikelyBot/);
});

test("tracker uses anonymous in-memory sessions without browser storage", () => {
  assert.match(
    tracker,
    /runtimeSessions/,
  );

  assert.doesNotMatch(
    tracker,
    /sessionStorage|localStorage|document\.cookie/,
  );

  assert.doesNotMatch(
    tracker,
    /mounted\.current/,
  );

  assert.doesNotMatch(
    tracker,
    /navigator\.doNotTrack|globalPrivacyControl/,
  );
});


test("browser delivery uses a neutral first-party endpoint", () => {
  assert.match(
    tracker,
    /\/api\/public\/site-event/,
  );

  assert.doesNotMatch(
    tracker,
    /\/api\/public\/analytics/,
  );

  assert.match(
    neutralRoute,
    /analyticsPost/,
  );
});

test("shared tenant layout installs analytics once for all site templates", () => {
  assert.match(
    layout,
    /PublicSiteAnalyticsTracker/,
  );

  assert.match(
    layout,
    /businessSlug/,
  );
});
