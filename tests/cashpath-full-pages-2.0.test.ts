import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { CASH_PATH_FINAL_SEO_PAGES, CASH_PATH_FINAL_SEO_SOURCE_SHA256 } from "../lib/public-site/cashpath-final-seo-content.generated.ts";
import { CASH_PATH_GUIDES } from "../lib/public-site/cashpath-guides.generated.ts";
import { CASH_PATH_LEGACY_INTROS, createCashPathPremiumTemplateSeed } from "../lib/public-site/cashpath-premium-template-seed.ts";
import { needsCashPathFullPageUpgrade, upgradeCashPathFullPages } from "../lib/public-site/cashpath-page-content-upgrade.ts";

const expectedSlugs = ["about", "faq", "rates-fees", "responsible-lending", "contact", "privacy-policy", "terms-of-use", "e-consent", "advertiser-disclosure", "do-not-sell-share", "disclaimer"];
const oldRequestCopy = "Complete the secure provider form to explore available options. You are not required to accept an offer.";

function generatedPage(slug: string) {
  const page = CASH_PATH_FINAL_SEO_PAGES.find((candidate) => candidate.slug === slug);
  assert.ok(page, `missing generated ${slug} page`);
  return page;
}

function generatedText(slug: string) {
  const page = generatedPage(slug);
  return [page.intro, ...page.blocks.flatMap((block) => [block.title, block.text])].join(" ");
}

test("CashPath generated corpus is current, complete, and matches its canonical source", async () => {
  execFileSync("node", ["scripts/generate-cashpath-seo-content.mjs", "--check"], { cwd: new URL("..", import.meta.url), stdio: "pipe" });
  const source = await readFile(new URL("../docs/cashpath/cashpath-final-seo-content-2.2.md", import.meta.url));
  assert.equal(createHash("sha256").update(source).digest("hex"), CASH_PATH_FINAL_SEO_SOURCE_SHA256);
  assert.deepEqual(CASH_PATH_FINAL_SEO_PAGES.map((page) => page.slug), expectedSlugs);
  assert.equal(CASH_PATH_FINAL_SEO_PAGES.length, 11);
});

test("future CashPath tenants use every generated page and generated SEO metadata", () => {
  const seed = createCashPathPremiumTemplateSeed();
  assert.equal(seed.pages?.length, 13);
  for (const generated of CASH_PATH_FINAL_SEO_PAGES) {
    const page: NonNullable<typeof seed.pages>[number] | undefined = seed.pages?.find((candidate) => candidate.slug === generated.slug);
    assert.ok(page, `seed is missing ${generated.slug}`);
    assert.equal(page.title, generated.title);
    assert.equal(page.intro, generated.intro);
    assert.equal(page.seo_title, generated.seo_title);
    assert.equal(page.seo_description, generated.seo_description);
    assert.deepEqual(page.blocks, generated.blocks);
  }
  for (const guide of CASH_PATH_GUIDES) {
    const page = seed.pages?.find((candidate) => candidate.slug === guide.slug);
    assert.ok(page, `seed is missing guide ${guide.slug}`);
    assert.equal(page.title, guide.title);
    assert.equal(page.seo_title, guide.seo_title);
    assert.equal(page.seo_description, guide.seo_description);
  }
  const titles = CASH_PATH_FINAL_SEO_PAGES.map((page) => page.seo_title);
  const descriptions = CASH_PATH_FINAL_SEO_PAGES.map((page) => page.seo_description);
  assert.equal(new Set(titles).size, titles.length);
  assert.equal(new Set(descriptions).size, descriptions.length);
  assert.doesNotMatch(`${titles.join(" ")} ${descriptions.join(" ")}`, /LendingTree|Credible/i);
});

test("generated content retains required editorial coverage and rich-text links", () => {
  assert.ok(generatedPage("about").plain_text_word_count > 600);
  assert.equal(generatedPage("faq").section_count, 15);
  assert.match(generatedText("rates-fees"), /APR/);
  assert.match(generatedText("rates-fees"), /fees/i);
  assert.match(generatedText("rates-fees"), /total repayment/i);
  assert.match(generatedText("responsible-lending"), /FTC/i);
  assert.match(generatedText("privacy-policy"), /browser memory/i);
  assert.match(generatedText("privacy-policy"), /LeadsGate/i);
  assert.ok(generatedPage("terms-of-use").plain_text_word_count > 900);
  const serialized = JSON.stringify(CASH_PATH_FINAL_SEO_PAGES);
  assert.match(serialized, /\\"type\\":\\"strong\\"/);
  assert.match(serialized, /\\"type\\":\\"em\\"/);
  assert.match(serialized, /\\"href\\":\\"\/p\//);
  assert.match(serialized, /https:\/\/www\.consumerfinance\.gov\//);
  assert.match(serialized, /https:\/\/consumer\.ftc\.gov\//);
});

test("only exact untouched legacy placeholders receive the generated one-step upgrade", () => {
  const seed = createCashPathPremiumTemplateSeed();
  const legacy = {
    ...seed,
    pages: (seed.pages ?? []).filter((page) => expectedSlugs.includes(page.slug)).map((page) => ({
      ...page,
      seo_title: `Existing SEO ${page.slug}`,
      seo_description: `Existing description ${page.slug}`,
      seo_no_index: true,
      intro: CASH_PATH_LEGACY_INTROS[page.slug],
      blocks: [{ id: `${page.slug}-content`, kind: "text" as const, title: "", text: CASH_PATH_LEGACY_INTROS[page.slug], items: "", eyebrow: "", button_label: "", button_url: "", tone: "light" as const, is_visible: true }],
    })),
  };
  assert.equal(needsCashPathFullPageUpgrade(legacy), true);
  const upgraded = upgradeCashPathFullPages(legacy);
  for (const page of upgraded.pages ?? []) {
    const generated = generatedPage(page.slug);
    assert.equal(page.intro, generated.intro);
    assert.deepEqual(page.blocks, generated.blocks);
    assert.equal(page.seo_title, `Existing SEO ${page.slug}`);
    assert.equal(page.seo_description, `Existing description ${page.slug}`);
    assert.equal(page.seo_no_index, true);
  }
  assert.equal(upgradeCashPathFullPages(upgraded), upgraded);
});

test("edited legacy intro or body stays untouched", () => {
  const seed = createCashPathPremiumTemplateSeed();
  const base = seed.pages?.find((page) => page.slug === "about");
  assert.ok(base);
  const legacyBlock = { id: "about-content", kind: "text" as const, title: "", text: CASH_PATH_LEGACY_INTROS.about, items: "", eyebrow: "", button_label: "", button_url: "", tone: "light" as const, is_visible: true };
  const editedIntro = { ...seed, pages: [{ ...base, intro: "Manually edited intro", blocks: [legacyBlock] }] };
  const editedBody = { ...seed, pages: [{ ...base, intro: CASH_PATH_LEGACY_INTROS.about, blocks: [{ ...legacyBlock, text: "Manually edited body" }] }] };
  assert.equal(needsCashPathFullPageUpgrade(editedIntro), false);
  assert.equal(needsCashPathFullPageUpgrade(editedBody), false);
  assert.equal(upgradeCashPathFullPages(editedIntro), editedIntro);
  assert.equal(upgradeCashPathFullPages(editedBody), editedBody);
});

test("exact request-copy upgrade keeps the existing LeadsGate configuration", () => {
  const seed = createCashPathPremiumTemplateSeed();
  const legacy = { ...seed, custom_blocks: [{ ...seed.custom_blocks![0], text: oldRequestCopy }] };
  const upgraded = upgradeCashPathFullPages(legacy);
  const block = upgraded.custom_blocks![0];
  assert.equal(block.text, "Choose an amount and enter your details to continue securely.");
  assert.equal(block.id, "cashpath-request");
  assert.equal(block.kind, "leadsgate_form");
  assert.equal(block.leadsgate_aid, "4848");
  assert.equal(block.leadsgate_template, "wallet-lines");
});

test("article renderer keeps rich headings, safe TOC labels, and all footer links", async () => {
  const source = await readFile(new URL("../components/public/cashpath/CashPathCustomPage.tsx", import.meta.url), "utf8");
  assert.match(source, /<PublicRichHeading value=\{block\.title\}/);
  assert.match(source, /richTextPlainText\(block\.title\)/);
  for (const slug of expectedSlugs) assert.match(source, new RegExp(`\"${slug}\"`));
});
