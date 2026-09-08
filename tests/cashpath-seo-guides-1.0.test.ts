import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  CASH_PATH_GUIDES,
  CASH_PATH_GUIDES_SOURCE_SHA256,
} from "../lib/public-site/cashpath-guides.generated.ts";
import {
  installMissingCashPathGuides,
  missingCashPathGuides,
} from "../lib/public-site/cashpath-guides.ts";
import type { PublicSiteContent } from "../lib/public-site/types.ts";

const slug = "what-is-apr-on-a-personal-loan";
const apr = () => {
  const guide = CASH_PATH_GUIDES.find((candidate) => candidate.slug === slug);
  assert.ok(guide, "APR guide must exist");
  return guide;
};

test("CashPath guide generator is current and emits the complete APR guide", () => {
  execFileSync("node", ["scripts/generate-cashpath-guides.mjs", "--check"], {
    cwd: new URL("..", import.meta.url),
    stdio: "pipe",
  });
  const guide = apr();
  assert.equal(CASH_PATH_GUIDES.length, 1);
  assert.equal(guide.nav_label, "What Is APR?");
  assert.equal(guide.title, "What Is APR on a Personal Loan?");
  assert.equal(guide.seo_title, "What Is APR on a Personal Loan? | CashPath");
  assert.equal(
    guide.seo_description,
    "Learn what APR means on a personal loan, how it differs from the interest rate, which fees can affect costs, and how to compare loan offers.",
  );
  assert.equal(guide.section_count, 10);
  assert.ok(
    guide.plain_text_word_count >= 1200 && guide.plain_text_word_count <= 1600,
  );
  assert.match(CASH_PATH_GUIDES_SOURCE_SHA256, /^[a-f0-9]{64}$/);
});

test("APR guide preserves headings, rich text, sources, and crawlable internal links", () => {
  const guide = apr();
  assert.deepEqual(
    (guide.blocks ?? []).map((block) => block.title),
    [
      "What APR means in plain English",
      "APR vs. interest rate: what is the difference?",
      "Which fees can affect the cost of a personal loan?",
      "How APR helps you compare loan offers",
      "Why the loan term still matters",
      "Where can you find the APR?",
      "Questions to ask before accepting a loan offer",
      "Is the lowest APR always the best choice?",
      "The bottom line",
      "Sources and further reading",
    ],
  );
  const serialized = JSON.stringify(guide);
  assert.match(serialized, /\\"type\\":\\"strong\\"/);
  assert.match(serialized, /\\"type\\":\\"em\\"/);
  for (const href of ["/p/rates-fees", "/p/responsible-lending", "/p/faq"])
    assert.match(serialized, new RegExp(href));
  assert.match(
    serialized,
    /what-is-the-difference-between-a-loan-interest-rate-and-the-apr-en-733/,
  );
  assert.match(serialized, /do-personal-installment-loans-have-fees-en-2120/);
  assert.match(serialized, /CashPath is not a lender/);
  assert.doesNotMatch(
    serialized,
    /guaranteed approval|guaranteed funding|funding within|APR of \d+%/i,
  );
});

test("missing-guide installer is CashPath-only, append-only, and idempotent", () => {
  const existing = {
    id: "edited",
    type: "custom" as const,
    slug: "about",
    nav_label: "About",
    eyebrow: "",
    title: "Edited",
    intro: "Edited",
    show_in_navigation: false,
    show_booking_cta: false,
  };
  const cashpath = {
    template_id: "cashpath",
    seo_title: "CashPath",
    seo_description: "",
    pages: [existing],
    custom_blocks: [
      {
        id: "cashpath-request",
        kind: "leadsgate_form",
        eyebrow: "",
        title: "",
        text: "keep",
        items: "",
        button_label: "",
        button_url: "",
        tone: "light",
        leadsgate_aid: "4848",
        leadsgate_template: "wallet-lines",
      },
    ],
    layout_order: ["custom:cashpath-request"],
  } as PublicSiteContent;
  assert.equal(missingCashPathGuides(cashpath).length, 1);
  const installed = installMissingCashPathGuides(cashpath);
  assert.equal(installed.pages?.length, 2);
  assert.equal(installed.pages?.[0], existing);
  assert.equal(installed.custom_blocks, cashpath.custom_blocks);
  assert.equal(installed.layout_order, cashpath.layout_order);
  const installedGuide = installed.pages?.find((page) => page.slug === slug);
  assert.equal(installedGuide?.seo_no_index, false);
  assert.equal(installMissingCashPathGuides(installed), installed);
  const other = { ...cashpath, template_id: "other" };
  assert.equal(installMissingCashPathGuides(other), other);
});

test("CashPath footers discover only a visible and indexable installed guide", async () => {
  const [home, customPage] = await Promise.all([
    readFile(
      new URL(
        "../components/public/cashpath/CashPathSite.tsx",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../components/public/cashpath/CashPathCustomPage.tsx",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);
  for (const source of [home, customPage]) {
    assert.match(
      source,
      /candidate\.slug === "what-is-apr-on-a-personal-loan"/,
    );
    assert.match(source, /candidate\.is_visible !== false/);
    assert.match(source, /candidate\.seo_no_index !== true/);
    assert.match(source, /What Is APR\?/);
  }
});
