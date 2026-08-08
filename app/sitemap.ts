import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE_URL } from "./_seo/site";
import { isCanonicalPlatformHostname, isTechnicalPlatformHostname } from "@/lib/domains/normalize";
import {
  getPublicSite,
  listPublicSiteSeoPaths,
  type PublicSiteSeoPath,
} from "@/lib/public-site/data";
import {
  requestHostname,
  requestOrigin,
  resolvePublicSiteDomain,
} from "@/lib/public-site/domain-resolution";
import {
  cleanPublicPagePath,
  cleanPublicSitePath,
  publicCustomPagePath,
  publicSitePagePath,
  publicSitePath,
} from "@/lib/public-site/metadata";
import { premiumPublicSitemapPaths } from "@/lib/public-site/premium-route-metadata";

export const dynamic = "force-dynamic";

function validDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

async function platformWorkspaceEntries(
  entries: PublicSiteSeoPath[],
): Promise<MetadataRoute.Sitemap> {
  return (
    await Promise.all(
      entries
        .filter((entry) => !entry.custom_domain)
        .map(async (entry) => {
          const locale = entry.is_primary ? null : entry.locale;
          const site = await getPublicSite(entry.business_slug, locale);

          if (!site || site.content.seo_no_index === true) return [];

          const lastModified = validDate(entry.updated_at);
          const home: MetadataRoute.Sitemap[number] = {
            url: new URL(
              publicSitePath(entry.business_slug, locale),
              SITE_URL,
            ).toString(),
            lastModified,
            changeFrequency: "weekly",
            priority: entry.is_primary ? 0.9 : 0.8,
          };

          const pages: MetadataRoute.Sitemap = (
            site.content.pages ?? []
          )
            .filter(
              (page) =>
                page.is_visible !== false &&
                page.seo_no_index !== true,
            )
            .map((page) => ({
              url: new URL(
                page.type === "portfolio"
                  ? publicSitePagePath(
                      entry.business_slug,
                      page.slug,
                      locale,
                    )
                  : publicCustomPagePath(
                      entry.business_slug,
                      page.slug,
                      locale,
                    ),
                SITE_URL,
              ).toString(),
              lastModified,
              changeFrequency: "weekly" as const,
              priority: entry.is_primary ? 0.75 : 0.65,
            }));

          const premiumPages: MetadataRoute.Sitemap = premiumPublicSitemapPaths(
            site,
            site.business.locale,
            false,
          ).map((path) => ({
            url: new URL(path, SITE_URL).toString(),
            lastModified,
            changeFrequency: "weekly" as const,
            priority: entry.is_primary ? 0.75 : 0.65,
          }));

          return [home, ...pages, ...premiumPages];
        }),
    )
  ).flat();
}

async function customDomainEntries(
  origin: string,
  businessSlug: string,
): Promise<MetadataRoute.Sitemap> {
  const entries = await listPublicSiteSeoPaths(businessSlug);

  return (
    await Promise.all(
      entries.map(async (entry) => {
        const locale = entry.is_primary ? null : entry.locale;
        const site = await getPublicSite(entry.business_slug, locale);

        if (!site || site.content.seo_no_index === true) return [];

        const lastModified = validDate(entry.updated_at);
        const home: MetadataRoute.Sitemap[number] = {
          url: new URL(cleanPublicSitePath(locale), origin).toString(),
          lastModified,
          changeFrequency: "weekly",
          priority: entry.is_primary ? 1 : 0.9,
        };

        const pages: MetadataRoute.Sitemap = (
          site.content.pages ?? []
        )
          .filter(
            (page) =>
              page.is_visible !== false &&
              page.seo_no_index !== true,
          )
          .map((page) => ({
            url: new URL(
              cleanPublicPagePath(
                page.slug,
                locale,
                page.type === "custom",
              ),
              origin,
            ).toString(),
            lastModified,
            changeFrequency: "weekly" as const,
            priority: entry.is_primary ? 0.8 : 0.7,
          }));

        const premiumPages: MetadataRoute.Sitemap = premiumPublicSitemapPaths(
          site,
          site.business.locale,
          true,
        ).map((path) => ({
          url: new URL(path, origin).toString(),
          lastModified,
          changeFrequency: "weekly" as const,
          priority: entry.is_primary ? 0.8 : 0.7,
        }));

        return [home, ...pages, ...premiumPages];
      }),
    )
  ).flat();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headerStore = await headers();
  const hostname = requestHostname(headerStore);

  if (hostname && isTechnicalPlatformHostname(hostname)) return [];

  if (hostname && !isCanonicalPlatformHostname(hostname) && hostname !== "localhost" && hostname !== "127.0.0.1") {
    const [origin, resolution] = await Promise.all([
      Promise.resolve(requestOrigin(headerStore)),
      resolvePublicSiteDomain(hostname),
    ]);

    if (!origin || !resolution) return [];
    return customDomainEntries(origin, resolution.business_slug);
  }

  const publicSites = await listPublicSiteSeoPaths();
  const workspacePages = await platformWorkspaceEntries(publicSites);

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
