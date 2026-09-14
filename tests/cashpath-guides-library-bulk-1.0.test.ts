import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CASH_PATH_GUIDES,
  CASH_PATH_GUIDE_CATEGORIES,
} from "../lib/public-site/cashpath-guides.generated.ts";
import {
  eligibleCashPathGuideLinks,
  installMissingCashPathGuides,
  missingCashPathGuides,
} from "../lib/public-site/cashpath-guides.ts";

test("bulk registry has 89 unique categorized guides and a 77-guide release gate", () => {
  assert.equal(CASH_PATH_GUIDES.length, 89);
  assert.equal(new Set(CASH_PATH_GUIDES.map((x) => x.slug)).size, 89);
  assert.equal(new Set(CASH_PATH_GUIDES.map((_, i) => i)).size, 89);
  for (const guide of CASH_PATH_GUIDES)
    assert.ok(CASH_PATH_GUIDE_CATEGORIES.includes(guide.category));
  const existing = CASH_PATH_GUIDES.slice(0, 12);
  const draft = { template_id: "cashpath", pages: existing } as any;
  assert.equal(missingCashPathGuides(draft).length, 77);
  const synced = installMissingCashPathGuides(draft);
  assert.equal(missingCashPathGuides(synced).length, 0);
  assert.equal(installMissingCashPathGuides(synced), synced);
});

test("CashPath hub and bounded footers preserve clean public guide links", () => {
  const hub = readFileSync(
    new URL(
      "../components/public/cashpath/CashPathGuidesHub.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const site = readFileSync(
    new URL("../components/public/cashpath/CashPathSite.tsx", import.meta.url),
    "utf8",
  );
  const page = readFileSync(
    new URL(
      "../components/public/cashpath/CashPathCustomPage.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(hub, /Personal Loan Guides &amp; Financial Education/);
  assert.match(hub, /not a lender/);
  assert.match(hub, /eligibleCashPathGuideLinks/);
  assert.match(hub, /\/p\/\$\{slug\}/);
  for (const source of [site, page]) {
    assert.match(source, /Guides/);
    assert.doesNotMatch(source, /guideLinks/);
  }
});

test("only eligible published guides enter the library data", () => {
  const guide = CASH_PATH_GUIDES[0];
  const content = {
    template_id: "cashpath",
    pages: [{ ...guide, is_visible: true, seo_no_index: false }],
  } as any;
  assert.equal(eligibleCashPathGuideLinks(content).length, 1);
  assert.equal(
    eligibleCashPathGuideLinks({
      ...content,
      pages: [{ ...guide, is_visible: false }],
    }).length,
    0,
  );
  assert.equal(
    eligibleCashPathGuideLinks({
      ...content,
      pages: [{ ...guide, seo_no_index: true }],
    }).length,
    0,
  );
});
