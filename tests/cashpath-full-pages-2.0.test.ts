import assert from "node:assert/strict";
import test from "node:test";
import { CASH_PATH_LEGACY_INTROS, createCashPathPremiumTemplateSeed } from "../lib/public-site/cashpath-premium-template-seed.ts";
import { needsCashPathFullPageUpgrade, upgradeCashPathFullPages } from "../lib/public-site/cashpath-page-content-upgrade.ts";
import { readFile } from "node:fs/promises";

test("CashPath seed has eleven substantive information pages", () => {
  const content = createCashPathPremiumTemplateSeed();
  assert.equal(content.pages?.length, 11);
  for (const page of content.pages ?? []) assert.ok((page.blocks?.length ?? 0) >= 4, `${page.slug} needs multiple sections`);
  assert.ok((content.pages?.find((page) => page.slug === "faq")?.blocks?.length ?? 0) >= 10);
  assert.equal(content.custom_blocks?.find((block) => block.id === "cashpath-request")?.leadsgate_aid, "4848");
});

test("only untouched legacy placeholders are upgraded", () => {
  const seed = createCashPathPremiumTemplateSeed();
  const legacy = { ...seed, pages: (seed.pages ?? []).map((page) => ({ ...page, intro: CASH_PATH_LEGACY_INTROS[page.slug], blocks: [{ id: `${page.slug}-content`, kind: "text" as const, title: "", text: CASH_PATH_LEGACY_INTROS[page.slug], items: "", eyebrow: "", button_label: "", button_url: "", tone: "light" as const, is_visible: true }] })) };
  assert.equal(needsCashPathFullPageUpgrade(legacy), true);
  const upgraded = upgradeCashPathFullPages(legacy);
  assert.equal(upgraded.pages?.find((page) => page.slug === "about")?.blocks?.length, 5);
  assert.equal(upgraded.custom_blocks?.[0]?.leadsgate_aid, "4848");
  assert.equal(upgradeCashPathFullPages(upgraded), upgraded);
});

test("edited page intros and request copy remain untouched", () => {
  const seed = createCashPathPremiumTemplateSeed();
  const legacyAbout = { ...seed.pages![0], intro: "Edited intro", blocks: [{ id: "about-content", kind: "text" as const, title: "", text: CASH_PATH_LEGACY_INTROS.about, items: "", eyebrow: "", button_label: "", button_url: "", tone: "light" as const, is_visible: true }] };
  const content = { ...seed, pages: [legacyAbout], custom_blocks: [{ ...seed.custom_blocks![0], text: "Custom request copy" }] };
  assert.equal(needsCashPathFullPageUpgrade(content), false);
  assert.equal(upgradeCashPathFullPages(content), content);
});

test("exact legacy request copy upgrades without changing provider config", () => {
  const seed = createCashPathPremiumTemplateSeed();
  const legacy = { ...seed, custom_blocks: [{ ...seed.custom_blocks![0], text: "Complete the secure provider form to explore available options. You are not required to accept an offer." }] };
  const upgraded = upgradeCashPathFullPages(legacy);
  assert.equal(upgraded.custom_blocks![0].text, "Choose an amount and enter your details to continue securely.");
  assert.equal(upgraded.custom_blocks![0].leadsgate_aid, "4848");
  assert.equal(upgraded.custom_blocks![0].leadsgate_template, "wallet-lines");
});

test("article renderer safely handles rich headings and keeps every footer link", async () => {
  const source = await readFile(new URL("../components/public/cashpath/CashPathCustomPage.tsx", import.meta.url), "utf8");
  assert.match(source, /<PublicRichHeading value=\{block\.title\}/);
  assert.match(source, /richTextPlainText\(block\.title\)/);
  for (const slug of ["about", "contact", "faq", "rates-fees", "responsible-lending", "privacy-policy", "terms-of-use", "e-consent", "advertiser-disclosure", "do-not-sell-share", "disclaimer"]) assert.match(source, new RegExp(`"${slug}"`));
});
