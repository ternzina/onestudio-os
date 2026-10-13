import { CASH_PATH_GUIDES, type CashPathGuide } from "./cashpath-guides.generated.ts";
import type { PublicSiteContent, PublicSitePage } from "./types.ts";

/** Guides whose reviewed copy is managed in the CashPath guide source files. */
export const CASH_PATH_GEO_V1_GUIDE_SLUGS = new Set([
  "how-to-compare-personal-loan-offers",
  "apr-vs-interest-rate",
  "personal-loan-agreement-checklist",
  "how-much-personal-loan-payment-can-i-afford",
  "personal-loan-hardship-payment-assistance",
  "someone-took-out-personal-loan-in-my-name",
  "personal-loan-payoff-amount-vs-current-balance",
  "how-to-stop-automatic-loan-payments-without-canceling-debt",
  "what-fees-can-personal-loans-include",
  "what-is-apr-on-a-personal-loan",
]);

const clone = (page: PublicSitePage): PublicSitePage => ({
  ...page,
  blocks: page.blocks?.map((block) => ({ ...block })),
});

export function cashPathGuideForSlug(slug: string): CashPathGuide | undefined {
  return CASH_PATH_GUIDES.find((guide) => guide.slug === slug);
}

/** Uses the reviewed source copy for the ten published GEO v1 guides only. */
export function publishedCashPathGuidePage(
  content: PublicSiteContent,
  page: PublicSitePage,
): PublicSitePage {
  if (content.template_id !== "cashpath" || !CASH_PATH_GEO_V1_GUIDE_SLUGS.has(page.slug)) {
    return page;
  }

  const source = cashPathGuideForSlug(page.slug);
  if (!source) return page;
  const sourceBlocks = source.blocks ?? [];
  const persistedBlocks = page.blocks ?? [];
  const sourceBlockIds = new Set(sourceBlocks.map((block) => block.id));
  const persistedBlocksById = new Map(persistedBlocks.map((block) => [block.id, block]));
  const reviewedBlocks = sourceBlocks.map((block) => {
    const persisted = persistedBlocksById.get(block.id);
    return persisted?.is_visible === undefined
      ? block
      : { ...block, is_visible: persisted.is_visible };
  });
  const additionalPersistedBlocks = persistedBlocks.filter(
    (block) => !sourceBlockIds.has(block.id),
  );

  return {
    ...page,
    eyebrow: source.eyebrow,
    title: source.title,
    intro: source.intro,
    seo_title: source.seo_title,
    seo_description: source.seo_description,
    blocks: [...reviewedBlocks, ...additionalPersistedBlocks],
  };
}

/** Returns guides that are absent by slug; existing customer pages always win. */
export function missingCashPathGuides(
  content: PublicSiteContent,
): PublicSitePage[] {
  if (content.template_id !== "cashpath") return [];
  const existingSlugs = new Set((content.pages ?? []).map((page) => page.slug));
  return CASH_PATH_GUIDES.filter((guide) => !existingSlugs.has(guide.slug));
}

/** Guides may be linked publicly only when their installed page is public too. */
export function eligibleCashPathGuideLinks(
  content: PublicSiteContent,
): CashPathGuide[] {
  if (content.template_id !== "cashpath") return [];
  const pagesBySlug = new Map((content.pages ?? []).map((page) => [page.slug, page]));
  return CASH_PATH_GUIDES.filter((guide) => {
    const page = pagesBySlug.get(guide.slug);
    return page?.type === "custom" && page.is_visible !== false && page.seo_no_index !== true;
  });
}

/**
 * Deterministic, server-safe related-guide selection. Same-category guides
 * come first; registry order supplies a stable fallback for sparse categories.
 */
export function relatedCashPathGuides(
  content: PublicSiteContent,
  currentSlug: string,
  limit = 5,
): CashPathGuide[] {
  const eligible = eligibleCashPathGuideLinks(content);
  const current = eligible.find((guide) => guide.slug === currentSlug);
  if (!current) return [];

  const sameCategory = eligible.filter(
    (guide) => guide.slug !== currentSlug && guide.category === current.category,
  );
  const fallback = eligible.filter(
    (guide) => guide.slug !== currentSlug && guide.category !== current.category,
  );
  return [...sameCategory, ...fallback].slice(0, limit);
}

/** Draft-only, append-only installer for newly introduced CashPath guides. */
export function installMissingCashPathGuides(
  content: PublicSiteContent,
): PublicSiteContent {
  const missing = missingCashPathGuides(content);
  if (!missing.length) return content;
  return {
    ...content,
    pages: [...(content.pages ?? []), ...missing.map(clone)],
  };
}
