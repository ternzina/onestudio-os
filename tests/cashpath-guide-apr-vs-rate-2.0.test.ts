import assert from "node:assert/strict";
import test from "node:test";
import { CASH_PATH_GUIDES } from "../lib/public-site/cashpath-guides.generated.ts";
import { installMissingCashPathGuides, missingCashPathGuides } from "../lib/public-site/cashpath-guides.ts";
import type { PublicSiteContent } from "../lib/public-site/types.ts";

const firstSlug = "what-is-apr-on-a-personal-loan";
const secondSlug = "apr-vs-interest-rate";

function guide(slug: string) {
  const value = CASH_PATH_GUIDES.find((candidate) => candidate.slug === slug);
  assert.ok(value, `missing guide ${slug}`);
  return value;
}

test("APR versus interest-rate guide is distinct, complete, and indexable", () => {
  assert.equal(CASH_PATH_GUIDES.length, 2);
  assert.deepEqual(CASH_PATH_GUIDES.map((item) => item.slug), [firstSlug, secondSlug]);
  assert.equal(new Set(CASH_PATH_GUIDES.map((item) => item.slug)).size, 2);
  assert.ok(guide(firstSlug));
  const second = guide(secondSlug);
  assert.equal(second.title, "APR vs. Interest Rate: What’s the Difference?");
  assert.equal(second.seo_title, "APR vs. Interest Rate on a Personal Loan | CashPath");
  assert.equal(second.seo_description, "Learn how APR differs from a personal loan interest rate, why fees matter, and which numbers to compare before accepting an offer.");
  assert.equal(second.is_visible, true);
  assert.equal(second.seo_no_index, false);
  assert.ok(second.plain_text_word_count >= 1300 && second.plain_text_word_count <= 1600);
  assert.ok(second.section_count >= 10);
  const text = JSON.stringify(second);
  for (const href of ["/p/what-is-apr-on-a-personal-loan", "/p/rates-fees", "/p/responsible-lending", "/p/faq"]) assert.match(text, new RegExp(href));
  for (const source of [
    "what-is-the-difference-between-a-loan-interest-rate-and-the-apr-en-733",
    "what-is-a-personal-installment-loan-en-2114",
    "do-personal-installment-loans-have-fees-en-2120",
  ]) assert.match(text, new RegExp(source));
  assert.match(text, /CashPath is not a lender/);
  assert.doesNotMatch(text, /APR of \d+%|guaranteed approval|guaranteed funding|all fees are included in APR/i);
});

test("installer appends only the second guide when Guide #1 already exists", () => {
  const first = guide(firstSlug);
  const pages = [{ ...first, blocks: first.blocks?.map((block) => ({ ...block })) }];
  const content = {
    template_id: "cashpath",
    seo_title: "CashPath",
    seo_description: "",
    pages,
    custom_blocks: [{ id: "cashpath-request", kind: "leadsgate_form", eyebrow: "", title: "", text: "", items: "", button_label: "", button_url: "", tone: "light", leadsgate_aid: "4848", leadsgate_template: "wallet-lines" }],
  } as unknown as PublicSiteContent;
  assert.deepEqual(missingCashPathGuides(content).map((page) => page.slug), [secondSlug]);
  const installed = installMissingCashPathGuides(content);
  assert.equal(installed.pages?.[0], pages[0]);
  assert.deepEqual(installed.pages?.map((page) => page.slug), [firstSlug, secondSlug]);
  assert.equal(installed.custom_blocks, content.custom_blocks);
  assert.equal(installMissingCashPathGuides(installed), installed);
});
