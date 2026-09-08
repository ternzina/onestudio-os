import assert from "node:assert/strict";
import test from "node:test";
import { CASH_PATH_GUIDES } from "../lib/public-site/cashpath-guides.generated.ts";
import { installMissingCashPathGuides, missingCashPathGuides } from "../lib/public-site/cashpath-guides.ts";
import { decodeRichText } from "../lib/public-site/rich-text.ts";
import type { PublicSiteContent } from "../lib/public-site/types.ts";

const guideOne = "what-is-apr-on-a-personal-loan";
const guideTwo = "apr-vs-interest-rate";
const guideThree = "how-to-compare-personal-loan-offers";

function guide(slug: string) {
  const value = CASH_PATH_GUIDES.find((candidate) => candidate.slug === slug);
  assert.ok(value, `missing guide ${slug}`);
  return value;
}

test("CashPath comparison guide has the complete registry, metadata, sources, links, and safe claims", () => {
  assert.equal(CASH_PATH_GUIDES.length, 4);
  assert.deepEqual(CASH_PATH_GUIDES.map((item) => item.slug), [guideOne, guideTwo, guideThree, "what-fees-can-personal-loans-include"]);
  assert.deepEqual(CASH_PATH_GUIDES.map((item) => item.id), [guideOne, guideTwo, guideThree, "what-fees-can-personal-loans-include"]);
  assert.equal(new Set(CASH_PATH_GUIDES.map((item) => item.slug)).size, 4);
  const third = guide(guideThree);
  assert.equal(third.nav_label, "Compare Loan Offers");
  assert.equal(third.title, "How to Compare Personal Loan Offers");
  assert.equal(third.seo_title, "How to Compare Personal Loan Offers | CashPath");
  assert.equal(third.seo_description, "Learn how to compare personal loan offers by reviewing APR, interest rate, fees, payment amount, loan term, and lender disclosures before deciding.");
  assert.equal(third.is_visible, true);
  assert.equal(third.seo_no_index, false);
  assert.ok(third.plain_text_word_count >= 1500 && third.plain_text_word_count <= 1750);
  assert.ok(third.section_count >= 12);
  const serialized = JSON.stringify(third);
  for (const href of ["/p/what-is-apr-on-a-personal-loan", "/p/apr-vs-interest-rate", "/p/rates-fees", "/p/responsible-lending", "/p/faq"]) assert.match(serialized, new RegExp(href));
  for (const source of [
    "what-is-a-personal-installment-loan-en-2114",
    "do-personal-installment-loans-have-fees-en-2120",
    "what-is-the-difference-between-a-loan-interest-rate-and-the-apr-en-733",
    "what-know-about-advance-fee-loans",
  ]) assert.match(serialized, new RegExp(source));
  assert.match(serialized, /CashPath is not a lender/);
  assert.doesNotMatch(serialized, /APR of \d+%|guaranteed approval|guaranteed funding|all fees are included in APR/i);
  assert.match(serialized, /There is no single metric that determines the best offer/);
  assert.match(serialized, /Not every upfront or application-related fee means fraud/);
  assert.match(serialized, /Do not assume every lender charges a prepayment penalty/);
});

test("CashPath comparison guide rich text decodes completely within persistence limits", () => {
  const third = guide(guideThree);
  assert.ok(third.intro.length > 1000);
  assert.ok(third.intro.length <= 20_000);
  assert.ok(decodeRichText(third.intro));
  for (const block of third.blocks ?? []) {
    assert.ok(block.text.length <= 40_000);
    assert.ok(decodeRichText(block.text), `malformed rich text in ${block.id}`);
  }
});

test("CashPath installer appends only Guide #3 when Guides #1 and #2 already exist", () => {
  const first = guide(guideOne);
  const second = guide(guideTwo);
  const firstCopy = { ...first, blocks: first.blocks?.map((block) => ({ ...block })) };
  const secondCopy = { ...second, blocks: second.blocks?.map((block) => ({ ...block })) };
  const content = {
    template_id: "cashpath",
    seo_title: "CashPath",
    seo_description: "unchanged",
    pages: [firstCopy, secondCopy, { id: "about", type: "custom", slug: "about", nav_label: "About", eyebrow: "", title: "About", intro: "unchanged", show_in_navigation: false, show_booking_cta: false }],
    custom_blocks: [{ id: "cashpath-request", kind: "leadsgate_form", eyebrow: "", title: "", text: "unchanged", items: "", button_label: "", button_url: "", tone: "light", leadsgate_aid: "4848", leadsgate_template: "wallet-lines" }],
    layout_order: ["native:cashpath:hero", "custom:cashpath-request"],
  } as unknown as PublicSiteContent;
  const beforeFirst = JSON.stringify(firstCopy);
  const beforeSecond = JSON.stringify(secondCopy);
  assert.deepEqual(missingCashPathGuides(content).map((page) => page.slug), [guideThree, "what-fees-can-personal-loans-include"]);
  const installed = installMissingCashPathGuides(content);
  assert.equal(JSON.stringify(installed.pages?.[0]), beforeFirst);
  assert.equal(JSON.stringify(installed.pages?.[1]), beforeSecond);
  assert.deepEqual(installed.pages?.map((page) => page.slug), [guideOne, guideTwo, "about", guideThree, "what-fees-can-personal-loans-include"]);
  assert.equal(installed.custom_blocks, content.custom_blocks);
  assert.equal(installed.layout_order, content.layout_order);
  assert.equal(installMissingCashPathGuides(installed), installed);
});

test("CashPath footer discovery stays registry-driven for visible, indexable guides", () => {
  const visible = CASH_PATH_GUIDES.filter((item) => item.is_visible !== false && item.seo_no_index !== true);
  assert.deepEqual(visible.map((item) => item.nav_label), ["What Is APR?", "APR vs. Interest Rate", "Compare Loan Offers", "Personal Loan Fees"]);
  assert.equal(visible.filter((item) => item.slug === guideThree).length, 1);
  assert.equal({ ...guide(guideThree), is_visible: false }.is_visible !== false, false);
  assert.equal({ ...guide(guideThree), seo_no_index: true }.seo_no_index !== true, false);
});
