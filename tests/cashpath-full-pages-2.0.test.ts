import assert from "node:assert/strict";
import test from "node:test";
import { createCashPathPremiumTemplateSeed } from "../lib/public-site/cashpath-premium-template-seed.ts";
import { needsCashPathFullPageUpgrade, upgradeCashPathFullPages } from "../lib/public-site/cashpath-page-content-upgrade.ts";

test("CashPath seed has eleven substantive information pages", () => {
  const content = createCashPathPremiumTemplateSeed();
  assert.equal(content.pages?.length, 11);
  for (const page of content.pages ?? []) assert.ok((page.blocks?.length ?? 0) >= 4, `${page.slug} needs multiple sections`);
  assert.ok((content.pages?.find((page) => page.slug === "faq")?.blocks?.length ?? 0) >= 10);
  assert.equal(content.custom_blocks?.find((block) => block.id === "cashpath-request")?.leadsgate_aid, "4848");
});

test("only untouched legacy placeholders are upgraded", () => {
  const seed = createCashPathPremiumTemplateSeed();
  const legacy = { ...seed, pages: (seed.pages ?? []).map((page) => ({ ...page, blocks: [{ id: `${page.slug}-content`, kind: "text" as const, title: "", text: page.slug === "about" ? "CashPath is an online service that helps consumers submit a request that may be connected with participating providers. CashPath is not a lender and does not make credit decisions. Any offer and its terms come from the provider." : page.blocks?.[0]?.text ?? "", items: "", eyebrow: "", button_label: "", button_url: "", tone: "light" as const, is_visible: true }] })) };
  assert.equal(needsCashPathFullPageUpgrade(legacy), true);
  const upgraded = upgradeCashPathFullPages(legacy);
  assert.equal(upgraded.pages?.find((page) => page.slug === "about")?.blocks?.length, 5);
  assert.equal(upgraded.custom_blocks?.[0]?.leadsgate_aid, "4848");
  assert.equal(upgradeCashPathFullPages(upgraded), upgraded);
});
