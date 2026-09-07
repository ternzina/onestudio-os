import assert from "node:assert/strict";
import test from "node:test";
import {
  CASH_PATH_LEADSGATE_AID,
  CASH_PATH_LEADSGATE_TEMPLATE,
  CASH_PATH_REQUEST_BLOCK_ID,
  needsCashPathRequestFormRepair,
  repairCashPathRequestForm,
} from "../lib/public-site/cashpath-form-repair.ts";
import type { PublicSiteContent } from "../lib/public-site/types.ts";

function legacyCashPathDraft(): PublicSiteContent {
  return {
    template_id: "cashpath",
    hero_eyebrow: "PERSONAL LOAN OPTIONS",
    hero_title: "Find a clearer path",
    hero_text: "CashPath is not a lender.",
    about_title: "About",
    about_text: "About CashPath",
    services_title: "How it works",
    portfolio_title: "Options",
    contact_title: "Contact",
    booking_label: "Request",
    services_label: "How it works",
    portfolio_label: "Options",
    about_label: "About",
    contact_label: "Contact",
    show_services: false,
    show_portfolio: false,
    show_about: false,
    show_contact: false,
    seo_title: "CashPath",
    seo_description: "Description",
    seo_keywords: "personal loan options",
    favicon_url: "/templates/cashpath/favicon.svg",
    template_content: { cashpath: { locale: "en" } },
    native_action_styles: { "cashpath:hero:request": { size: "large" } },
    pages: Array.from({ length: 11 }, (_, index) => ({
      id: `page-${index + 1}`,
      type: "custom" as const,
      slug: `page-${index + 1}`,
      nav_label: `Page ${index + 1}`,
      eyebrow: "CASHPATH",
      title: `Page ${index + 1}`,
      intro: "Content",
      show_in_navigation: false,
      show_booking_cta: false,
    })),
    custom_blocks: [
      { id: "before", kind: "text", eyebrow: "", title: "Before", text: "Untouched", items: "", button_label: "", button_url: "", tone: "light", is_visible: true },
      { id: CASH_PATH_REQUEST_BLOCK_ID, kind: "text", eyebrow: "REQUEST OPTIONS", title: "Start your request", text: "Keep this presentation copy.", items: "", button_label: "", button_url: "", tone: "light", is_visible: true },
      { id: "after", kind: "text", eyebrow: "", title: "After", text: "Untouched", items: "", button_label: "", button_url: "", tone: "light", is_visible: true },
    ],
    layout_order: ["native:cashpath:hero", "custom:cashpath-request", "custom:after", "native:cashpath:footer"],
  };
}

test("repairs only the legacy CashPath request block and preserves its draft context", () => {
  const draft = legacyCashPathDraft();
  const before = structuredClone(draft);
  const repaired = repairCashPathRequestForm(draft);
  const repairedBlock = repaired.custom_blocks?.[1];

  assert.equal(needsCashPathRequestFormRepair(draft), true);
  assert.equal(repairedBlock?.id, CASH_PATH_REQUEST_BLOCK_ID);
  assert.equal(repairedBlock?.kind, "leadsgate_form");
  assert.equal(repairedBlock?.leadsgate_aid, CASH_PATH_LEADSGATE_AID);
  assert.equal(repairedBlock?.leadsgate_template, CASH_PATH_LEADSGATE_TEMPLATE);
  assert.equal(repaired.custom_blocks?.findIndex((block) => block.id === CASH_PATH_REQUEST_BLOCK_ID), 1);
  assert.equal(repairedBlock?.title, before.custom_blocks?.[1].title);
  assert.equal(repairedBlock?.text, before.custom_blocks?.[1].text);
  assert.deepEqual(repaired.layout_order, before.layout_order);
  assert.deepEqual(repaired.custom_blocks?.[0], before.custom_blocks?.[0]);
  assert.deepEqual(repaired.custom_blocks?.[2], before.custom_blocks?.[2]);
  assert.deepEqual(repaired.pages, before.pages);
  assert.equal(repaired.seo_title, before.seo_title);
  assert.equal(repaired.seo_description, before.seo_description);
  assert.equal(repaired.seo_keywords, before.seo_keywords);
  assert.equal(repaired.favicon_url, before.favicon_url);
  assert.deepEqual(repaired.template_content, before.template_content);
  assert.deepEqual(repaired.native_action_styles, before.native_action_styles);
});

test("is idempotent and leaves already-correct, missing, and non-CashPath drafts unchanged", () => {
  const repaired = repairCashPathRequestForm(legacyCashPathDraft());
  assert.equal(needsCashPathRequestFormRepair(repaired), false);
  assert.strictEqual(repairCashPathRequestForm(repaired), repaired);

  const missing = { ...legacyCashPathDraft(), custom_blocks: [] };
  assert.equal(needsCashPathRequestFormRepair(missing), false);
  assert.strictEqual(repairCashPathRequestForm(missing), missing);

  const nonCashPath = { ...legacyCashPathDraft(), template_id: "premium-studio" };
  assert.equal(needsCashPathRequestFormRepair(nonCashPath), false);
  assert.strictEqual(repairCashPathRequestForm(nonCashPath), nonCashPath);
});
