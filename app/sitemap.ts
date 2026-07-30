import type { MetadataRoute } from "next";
import { SITE_URL } from "./_seo/site";
import { getPublicSite, listPublicSitePaths } from "@/lib/public-site/data";
import {
  publicCustomPagePath,
  publicSitePagePath,
  publicSitePath,
} from "@/lib/public-site/metadata";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicSites = await listPublicSitePaths();
  const workspacePages: MetadataRoute.Sitemap = (
    await Promise.all(
      publicSites.map(async (entry) => {
        const locale = entry.is_primary ? null : entry.locale;
        const site = await getPublicSite(entry.business_slug, locale);
        if (!site || site.content.seo_no_index === true) return [];
        const lastModified = new Date(entry.updated_at);
        const home: MetadataRoute.Sitemap[number] = {
          url: new URL(
            publicSitePath(entry.business_slug, locale),
            SITE_URL,
          ).toString(),
          lastModified,
          changeFrequency: "weekly",
          priority: entry.is_primary ? 0.9 : 0.8,
        };
        const pages: MetadataRoute.Sitemap = (site.content.pages ?? [])
          .filter(
            (page) =>
              page.is_visible !== false && page.seo_no_index !== true,
          )
          .map((page) => ({
            url: new URL(
              page.type === "portfolio"
                ? publicSitePagePath(entry.business_slug, page.slug, locale)
                : publicCustomPagePath(entry.business_slug, page.slug, locale),
              SITE_URL,
            ).toString(),
            lastModified,
            changeFrequency: "weekly",
            priority: entry.is_primary ? 0.75 : 0.65,
          }));
        return [home, ...pages];
      }),
    )
  ).flat();

  return [
    {
      url: SITE_URL.toString(),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...workspacePages,
  ];
}
