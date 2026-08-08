import { resolvePremiumKidsContent } from "./premium-kids-content.ts";
import type { PublicSiteData } from "./types.ts";

export function resolvePublicSiteBrand(site: PublicSiteData) {
  const fallback = site.company.display_name || site.business.name;

  if (site.content.template_id === "premium-kids-center") {
    return resolvePremiumKidsContent(site.content, { brandFallback: fallback }).brand_name || fallback;
  }

  return site.content.brand_name || fallback;
}
