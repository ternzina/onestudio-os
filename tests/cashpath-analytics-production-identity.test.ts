import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CASH_PATH_BUSINESS_SLUG,
  isAllowedCashPathAnalyticsEvent,
  isCashPathBusinessSlug,
  isCashPathRequestLabel,
} from "../lib/public-site/cashpath-analytics.ts";

const identity = "cashpath-909c00c9";
const analyticsIdentity = readFileSync("lib/public-site/cashpath-analytics.ts", "utf8");
const tracker = readFileSync("components/public/PublicSiteAnalyticsTracker.tsx", "utf8");
const analyticsRoute = readFileSync("app/api/public/analytics/route.ts", "utf8");
const report = readFileSync("docs/cashpath/geo-v1-anonymous-report.sql", "utf8");
const migration = readFileSync("supabase/migrations/20261013090000_cashpath_leadsgate_form_ready_event.sql", "utf8");

test("verified CashPath identity owns request CTA and form-ready events only", () => {
  assert.equal(CASH_PATH_BUSINESS_SLUG, identity);
  assert.equal(isCashPathBusinessSlug(identity), true);
  assert.equal(isCashPathBusinessSlug("cashpath"), false);
  assert.equal(isCashPathBusinessSlug("bembi"), false);
  assert.equal(isAllowedCashPathAnalyticsEvent("leadsgate_form_ready", identity), true);
  assert.equal(isAllowedCashPathAnalyticsEvent("leadsgate_form_ready", "cashpath"), false);
  assert.equal(isAllowedCashPathAnalyticsEvent("leadsgate_form_ready", "bembi"), false);
  assert.equal(isAllowedCashPathAnalyticsEvent("page_view", "bembi"), true);
  assert.equal(isCashPathRequestLabel("Start Your Request →"), true);
  assert.equal(isCashPathRequestLabel("Start Your Request"), true);
  assert.equal(isCashPathRequestLabel("Submit application"), false);
});

test("CashPath request analytics use the verified production tenant identity", () => {
  assert.match(analyticsIdentity, new RegExp(identity));
  assert.match(tracker, /isCashPathBusinessSlug/);
  assert.match(analyticsRoute, /isAllowedCashPathAnalyticsEvent/);
  assert.match(report, new RegExp(`b\\.slug\\s*=\\s*'${identity}'`));
  assert.doesNotMatch(tracker, /businessSlug\s*===\s*["']cashpath["']/);
  assert.doesNotMatch(analyticsRoute, /businessSlug\s*!==\s*["']cashpath["']/);
});

test("form-ready observation is reinstalled when client navigation changes pages", () => {
  const formReadyEffect = tracker.match(
    /useEffect\(\(\)\s*=>\s*\{[\s\S]*?leadsgate_form_ready[\s\S]*?\},\s*\[([^\]]+)\]\);/,
  );

  assert.ok(formReadyEffect, "form-ready effect exists");
  assert.match(formReadyEffect[1], /businessSlug/);
  assert.match(formReadyEffect[1], /pathname/);
});

test("anonymous request tracking does not send form values or provider payloads", () => {
  assert.match(tracker, /data-public-custom-block-id=["']cashpath-request["']/);
  assert.match(tracker, /#_lg_form_/);
  assert.doesNotMatch(tracker, /\.value|FormData|localStorage|providerPayload/i);
  assert.match(report, /leadsgate_form_ready/);
  assert.match(report, /public\.site_analytics_events/);
  assert.doesNotMatch(report, /leadsgate_leads|payouts|email|phone/i);
});

test("the rollout migration adds only the anonymous form-ready event to the analytics constraint", () => {
  assert.match(migration, /site_analytics_events_event_name_check/);
  assert.match(migration, /'leadsgate_form_ready'/);
  assert.match(migration, /'page_view'[\s\S]*'cta_click'[\s\S]*'form_submit'/);
  assert.doesNotMatch(migration, /leadsgate_leads|payouts|alter table public\.businesses/i);
});
