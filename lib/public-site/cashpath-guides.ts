import { CASH_PATH_GUIDES, type CashPathGuide } from "./cashpath-guides.generated.ts";
import type { PublicSiteContent, PublicSitePage } from "./types.ts";

const clone = (page: PublicSitePage): PublicSitePage => ({
  ...page,
  blocks: page.blocks?.map((block) => ({ ...block })),
});

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
