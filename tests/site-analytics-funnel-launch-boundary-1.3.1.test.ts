import assert from "node:assert/strict";
import {
  readFileSync,
} from "node:fs";
import test from "node:test";

const route =
  readFileSync(
    "app/api/public/analytics/route.ts",
    "utf8",
  );

const migration =
  readFileSync(
    "supabase/migrations/20260910044000_site_analytics_funnel_launch_boundary_1_3_1.sql",
    "utf8",
  );

test(
  "new analytics events carry the funnel contract",
  () => {
    assert.match(
      route,
      /funnel_contract:\s*"1"/,
    );
  },
);

test(
  "funnel excludes pre-contract historical traffic",
  () => {
    assert.match(
      migration,
      /metadata[\s\S]*funnel_contract/,
    );

    assert.match(
      migration,
      /= '1'/,
    );

    assert.match(
      migration,
      /can_view_business/,
    );

    assert.match(
      migration,
      /booking\.payment_status\s*=\s*'paid'/,
    );
  },
);
