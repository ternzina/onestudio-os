import type { ClientDomainRecord } from "@/lib/domains/types";
import type { PublicSiteContent } from "./types";

const PLATFORM_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://onestudioos.com";

export function activePublicDomain(domain: ClientDomainRecord | null) {
  return domain?.status === "active" && domain.vercel_verified && domain.dns_configured && domain.ssl_ready
    ? domain.domain
    : null;
}

export function publicSiteOrigin(domain: ClientDomainRecord | null) {
  return activePublicDomain(domain) ? `https://${activePublicDomain(domain)}` : PLATFORM_ORIGIN;
}

export function sitemapEligiblePageCount(content: PublicSiteContent) {
  if (content.seo_no_index === true) return 0;
  return 1 + (content.pages ?? []).filter((page) => page.is_visible !== false && page.seo_no_index !== true).length;
}
