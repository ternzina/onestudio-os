import assert from "node:assert/strict";
import {
  readFileSync,
} from "node:fs";
import test from "node:test";

const migration =
  readFileSync(
    "supabase/migrations/20260909131000_site_analytics_dashboard_1_2.sql",
    "utf8",
  );

const panel =
  readFileSync(
    "app/admin/analytics/SiteAnalyticsPanel.tsx",
    "utf8",
  );

const manager =
  readFileSync(
    "app/admin/analytics/AnalyticsManager.tsx",
    "utf8",
  );

const page =
  readFileSync(
    "app/admin/analytics/page.tsx",
    "utf8",
  );

test(
  "site analytics dashboard is tenant-safe",
  () => {
    assert.match(
      migration,
      /can_view_business/,
    );

    assert.match(
      migration,
      /security definer/,
    );

    assert.match(
      migration,
      /p_business_id/,
    );
  },
);

test(
  "technical and test traffic are excluded",
  () => {
    assert.match(
      migration,
      /is_technical_host = false/,
    );

    assert.match(
      migration,
      /onestudio_test/,
    );
  },
);

test(
  "dashboard aggregates traffic dimensions",
  () => {
    assert.match(
      migration,
      /count\(distinct session_id\)/,
    );

    assert.match(
      migration,
      /traffic_source/,
    );

    assert.match(
      migration,
      /device_class/,
    );

    assert.match(
      migration,
      /country_code/,
    );

    assert.match(
      migration,
      /city/,
    );
  },
);

test(
  "admin analytics renders website traffic",
  () => {
    assert.match(
      panel,
      /get_admin_site_analytics/,
    );

    assert.match(
      panel,
      /Просмотры страниц/,
    );

    assert.match(
      panel,
      /Источники трафика/,
    );

    assert.match(
      panel,
      /Устройства/,
    );

    assert.match(
      manager,
      /SiteAnalyticsPanel/,
    );

    assert.match(
      page,
      /Аналитика 1\.[23]/,
    );
  },
);

test(
  "dashboard does not claim durable unique visitors",
  () => {
    assert.doesNotMatch(
      panel,
      /Уникальные посетители|Unique visitors/,
    );
  },
);
