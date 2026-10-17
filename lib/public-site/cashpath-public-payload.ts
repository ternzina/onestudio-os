import type { PublicSiteData } from "./types.ts";

/**
 * CashPath home is a client component. The published site object also carries
 * every guide body. Passing that object across the server/client boundary
 * makes the home response several megabytes and fails under load.
 * The home renderer only reads the hero, theme, and request form.
 */
export function cashPathPublicHomeSite(site: PublicSiteData): PublicSiteData {
  if (site.content.template_id !== "cashpath") return site;
  return {
    ...site,
    services: [],
    portfolio: [],
    content: {
      ...site.content,
      pages: [],
      template_content: undefined,
    },
  };
}
