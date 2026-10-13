import assert from "node:assert/strict";
import test from "node:test";
import { CASH_PATH_GUIDES } from "../lib/public-site/cashpath-guides.generated.ts";
import {
  CASH_PATH_GEO_V1_GUIDE_SLUGS,
  publishedCashPathGuidePage,
} from "../lib/public-site/cashpath-guides.ts";
import type { PublicSiteContent, PublicSitePage } from "../lib/public-site/types.ts";

const cashpathContent = (template_id = "cashpath") =>
  ({ template_id } as PublicSiteContent);

test("GEO v1 overlays exactly the ten requested published CashPath guides", () => {
  assert.equal(CASH_PATH_GEO_V1_GUIDE_SLUGS.size, 10);
  for (const slug of CASH_PATH_GEO_V1_GUIDE_SLUGS) {
    const source = CASH_PATH_GUIDES.find((guide) => guide.slug === slug);
    assert.ok(source, `reviewed source exists for ${slug}`);
    const stored = {
      ...source,
      title: "older persisted title",
      intro: "older persisted intro",
      seo_title: "older persisted SEO title",
      seo_description: "older persisted SEO description",
      blocks: [],
      is_visible: true,
      seo_no_index: false,
    } as PublicSitePage;

    const resolved = publishedCashPathGuidePage(cashpathContent(), stored);
    assert.equal(resolved.title, source.title);
    assert.equal(resolved.intro, source.intro);
    assert.equal(resolved.seo_title, source.seo_title);
    assert.equal(resolved.seo_description, source.seo_description);
    assert.deepEqual(resolved.blocks, source.blocks);
    assert.equal(resolved.id, stored.id);
    assert.equal(resolved.is_visible, true);
    assert.equal(resolved.seo_no_index, false);
  }
});

test("GEO v1 leaves other tenants and non-target CashPath pages untouched", () => {
  const page = CASH_PATH_GUIDES.find((guide) => guide.slug === "how-to-compare-personal-loan-offers")!;
  assert.equal(publishedCashPathGuidePage(cashpathContent("bembi"), page), page);
  const about = { ...page, slug: "about", title: "Persisted About" };
  assert.equal(publishedCashPathGuidePage(cashpathContent(), about), about);
});

test("GEO v1 keeps stored visibility controls and page blocks outside the reviewed source", () => {
  const source = CASH_PATH_GUIDES.find((guide) => guide.slug === "how-to-compare-personal-loan-offers")!;
  const firstBlock = source.blocks![0];
  const stored = {
    ...source,
    blocks: [
      { ...firstBlock, is_visible: false },
      {
        id: "editor-added-callout",
        kind: "text",
        eyebrow: "",
        title: "Editor-added callout",
        text: "Keep this page-specific addition.",
        items: "",
        button_label: "",
        button_url: "",
        tone: "light",
        is_visible: true,
      },
    ],
  } as PublicSitePage;
  const resolved = publishedCashPathGuidePage(cashpathContent(), stored);
  assert.equal(resolved.blocks?.[0].id, firstBlock.id);
  assert.equal(resolved.blocks?.[0].is_visible, false);
  assert.equal(resolved.blocks?.at(-1)?.id, "editor-added-callout");
});
