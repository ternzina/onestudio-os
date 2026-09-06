import { createCashPathPremiumTemplateSeed } from "./cashpath-premium-template-seed";
import type { PublicSiteContent, PublicSitePage } from "./types";

export const CASH_PATH_PAGE_SLUGS = ["about", "contact", "faq", "rates-fees", "responsible-lending", "privacy-policy", "terms-of-use", "e-consent", "advertiser-disclosure", "do-not-sell-share", "disclaimer"] as const;

export function mergeMissingCashPathPages(content: PublicSiteContent): PublicSiteContent {
  if (content.template_id !== "cashpath") return content;
  const existing = content.pages ?? [];
  const canonical = createCashPathPremiumTemplateSeed().pages ?? [];
  const missing = canonical.filter((page) => !existing.some((current) => current.slug === page.slug));
  return missing.length ? { ...content, pages: [...existing, ...missing.map((page) => ({ ...page, blocks: [...(page.blocks ?? [])] } as PublicSitePage))] } : content;
}

export function missingCashPathPages(content: PublicSiteContent) {
  if (content.template_id !== "cashpath") return [];
  const slugs = new Set((content.pages ?? []).map((page) => page.slug));
  return CASH_PATH_PAGE_SLUGS.filter((slug) => !slugs.has(slug));
}
