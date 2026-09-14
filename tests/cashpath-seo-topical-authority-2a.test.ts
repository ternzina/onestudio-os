import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CASH_PATH_GUIDE_CATEGORY_REGISTRY,
  cashPathGuideCategoryPath,
  getCashPathGuideCategory,
} from "../lib/public-site/cashpath-guide-categories.ts";
import { CASH_PATH_GUIDES } from "../lib/public-site/cashpath-guides.generated.ts";
import {
  eligibleCashPathGuideLinks,
  relatedCashPathGuides,
} from "../lib/public-site/cashpath-guides.ts";

const allPublished = {
  template_id: "cashpath",
  pages: CASH_PATH_GUIDES.map((guide) => ({
    ...guide,
    type: "custom" as const,
    is_visible: true,
    seo_no_index: false,
  })),
} as any;

test("CashPath category registry maps each of the 89 guides exactly once", () => {
  assert.equal(CASH_PATH_GUIDE_CATEGORY_REGISTRY.length, 7);
  assert.equal(new Set(CASH_PATH_GUIDE_CATEGORY_REGISTRY.map((item) => item.slug)).size, 7);
  assert.equal(CASH_PATH_GUIDES.length, 89);
  for (const guide of CASH_PATH_GUIDES) assert.ok(getCashPathGuideCategory(guide.category));
  const counts = Object.fromEntries(CASH_PATH_GUIDE_CATEGORY_REGISTRY.map((category) => [
    category.name,
    CASH_PATH_GUIDES.filter((guide) => guide.category === category.name).length,
  ]));
  assert.deepEqual(counts, {
    "Loan Basics": 14,
    "Credit & Approval": 17,
    "Compare Borrowing Options": 15,
    "Debt & Repayment": 14,
    "Life & Emergency Expenses": 13,
    "Home, Auto & Major Purchases": 8,
    "Rights & Safety": 8,
  });
});

test("only published, visible, indexable registered guides are eligible for CashPath hubs", () => {
  assert.equal(eligibleCashPathGuideLinks(allPublished).length, 89);
  const hidden = { ...allPublished, pages: allPublished.pages.map((page: any, index: number) => index === 0 ? { ...page, is_visible: false } : page) };
  const noIndex = { ...allPublished, pages: allPublished.pages.map((page: any, index: number) => index === 1 ? { ...page, seo_no_index: true } : page) };
  const draftOnly = { ...allPublished, pages: allPublished.pages.slice(1) };
  assert.equal(eligibleCashPathGuideLinks(hidden).length, 88);
  assert.equal(eligibleCashPathGuideLinks(noIndex).length, 88);
  assert.equal(eligibleCashPathGuideLinks(draftOnly).length, 88);
});

test("every eligible guide receives deterministic related links without self-links or duplicates", () => {
  for (const guide of CASH_PATH_GUIDES) {
    const related = relatedCashPathGuides(allPublished, guide.slug);
    assert.ok(related.length >= 4 && related.length <= 6);
    assert.equal(related.some((item) => item.slug === guide.slug), false);
    assert.equal(new Set(related.map((item) => item.slug)).size, related.length);
    assert.deepEqual(relatedCashPathGuides(allPublished, guide.slug), related);
  }
});

test("CashPath public SEO routes use clean category, canonical, breadcrumb, and sitemap paths", () => {
  const library = readFileSync(new URL("../components/public/cashpath/CashPathGuidesHub.tsx", import.meta.url), "utf8");
  const categoryHub = readFileSync(new URL("../components/public/cashpath/CashPathGuideCategoryHub.tsx", import.meta.url), "utf8");
  const customPage = readFileSync(new URL("../components/public/cashpath/CashPathCustomPage.tsx", import.meta.url), "utf8");
  const categoryPage = readFileSync(new URL("../app/site/[businessSlug]/p/guides/[categorySlug]/page.tsx", import.meta.url), "utf8");
  const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  assert.match(library, /Start here/);
  assert.match(library, /CASH_PATH_GUIDE_CATEGORY_REGISTRY/);
  assert.match(categoryHub, /CashPathBreadcrumbs/);
  assert.match(customPage, /Related guides/);
  assert.match(customPage, /Browse all guides/);
  assert.match(customPage, /Browse \{category\.name\}/);
  assert.match(categoryPage, /cashPathGuideCategoryPath/);
  assert.match(categoryPage, /https:\/\/cashpath\.org/);
  assert.match(sitemap, /CASH_PATH_GUIDE_CATEGORY_REGISTRY/);
  assert.match(sitemap, /uniqueSitemapEntries/);
  assert.doesNotMatch(`${library}\n${categoryHub}\n${customPage}\n${categoryPage}\n${sitemap}`, /\/site\/cashpath-/);
  for (const category of CASH_PATH_GUIDE_CATEGORY_REGISTRY) {
    assert.equal(cashPathGuideCategoryPath(category.slug), `/p/guides/${category.slug}`);
  }
});
