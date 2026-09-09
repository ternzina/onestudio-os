import assert from "node:assert/strict";
import {
  readFileSync,
} from "node:fs";
import test from "node:test";

const migration =
  readFileSync(
    "supabase/migrations/20260909151000_site_analytics_funnel_1_3.sql",
    "utf8",
  );

const funnel =
  readFileSync(
    "app/admin/analytics/SiteAnalyticsFunnelPanel.tsx",
    "utf8",
  );

const traffic =
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
  "conversion events can link to canonical bookings",
  () => {
    assert.match(
      migration,
      /booking_id uuid/,
    );

    assert.match(
      migration,
      /references public\.bookings\(id\)/,
    );

    assert.match(
      migration,
      /on delete set null/,
    );
  },
);

test(
  "funnel RPC remains tenant-authorized",
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
      /grant execute[\s\S]*to authenticated/,
    );
  },
);

test(
  "funnel compares equal current and previous periods",
  () => {
    assert.match(
      migration,
      /v_previous_start/,
    );

    assert.match(
      migration,
      /v_previous_end/,
    );

    assert.match(
      migration,
      /'current'/,
    );

    assert.match(
      migration,
      /'previous'/,
    );

    assert.match(
      migration,
      /distinct event\.session_id/,
    );
  },
);

test(
  "paid stage comes from canonical booking state",
  () => {
    assert.match(
      migration,
      /booking\.payment_status\s*=\s*'paid'/,
    );

    assert.doesNotMatch(
      migration,
      /event\.event_name\s*=\s*'payment_succeeded'/,
    );
  },
);

test(
  "admin renders funnel and conversion comparison",
  () => {
    assert.match(
      funnel,
      /get_admin_site_funnel_analytics/,
    );

    assert.match(
      funnel,
      /Воронка продаж/,
    );

    assert.match(
      funnel,
      /Конверсия в бронь/,
    );

    assert.match(
      funnel,
      /Конверсия в оплату/,
    );

    assert.match(
      funnel,
      /предыдущим периодом/,
    );

    assert.match(
      manager,
      /SiteAnalyticsFunnelPanel/,
    );

    assert.match(
      page,
      /Аналитика 1\.3/,
    );
  },
);

test(
  "traffic cards compare against previous equal period",
  () => {
    assert.match(
      traffic,
      /previousData/,
    );

    assert.match(
      traffic,
      /previousStartDate/,
    );

    assert.match(
      traffic,
      /previousEndDate/,
    );

    assert.match(
      traffic,
      /changeLabel/,
    );

    assert.match(
      traffic,
      /pointChangeLabel/,
    );
  },
);
