import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { PLATFORM_MARKETING_PATHS } from "./_seo/platform";
import { SITE_URL } from "./_seo/site";
import { DEMOS } from "@/lib/demo-catalog";
import { getPublicDemoTemplateChoices } from "@/lib/public-site/template-catalog";
import { isCanonicalPlatformHostname, isTechnicalPlatformHostname } from "@/lib/domains/normalize";
import {
  getFreshPublicSite,
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
import { listPublishedGuideSitemapEntries } from "@/lib/guides/repository";
import { platformMarketingLocale } from "@/lib/i18n/config";
import { SOLUTION_PATHS } from "@/lib/seo/solutions";

export const dynamic = "force-dynamic";

async function platformMarketingEntries(): Promise<MetadataRoute.Sitemap> {
  const catalogDemoPaths = getPublicDemoTemplateChoices()
    .map((template) => template.gallery.previewRoute)
    .filter((route): route is string => Boolean(route));
  const demoPaths = DEMOS.map((demo) => `/demos/${demo.slug}`);
  const guideEntries = await listPublishedGuideSitemapEntries(platformMarketingLocale);
  const articlePaths = new Set<string>(guideEntries.map((article) => article.path));
  const marketingEntries = [
    ...new Set([
      ...PLATFORM_MARKETING_PATHS,
      ...SOLUTION_PATHS,
      ...demoPaths,
      ...catalogDemoPaths,
      ...articlePaths,
    ]),
  ]
    .filter((path) => !articlePaths.has(path))
    .map((path) => ({ url: new URL(path, SITE_URL).toString() }));
  const guideSitemapEntries: MetadataRoute.Sitemap = guideEntries.map((article) => ({
    url: new URL(article.path, SITE_URL).toString(),
    lastModified: validDate(article.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...marketingEntries, ...guideSitemapEntries];
}

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
          // The SEO-path RPC has already selected a published locale. Always
          // load that locale explicitly: passing null can select legacy
          // settings content instead of the current published locale content.
          const locale = entry.locale;
          const pathLocale = entry.is_primary ? null : locale;
          const site = await getFreshPublicSite(entry.business_slug, locale);

          if (!site || entry.seo_no_index === true) return [];

          const lastModified = validDate(entry.updated_at);
          const home: MetadataRoute.Sitemap[number] = {
            url: new URL(
              publicSitePath(entry.business_slug, pathLocale),
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
                      pathLocale,
                    )
                  : publicCustomPagePath(
                      entry.business_slug,
                      page.slug,
                      pathLocale,
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
        // See platformWorkspaceEntries: the sitemap must render the exact
        // locale returned by the published SEO-path registry.
        const locale = entry.locale;
        const pathLocale = entry.is_primary ? null : locale;
        const site = await getFreshPublicSite(entry.business_slug, locale);

        if (!site || entry.seo_no_index === true) return [];

        const lastModified = validDate(entry.updated_at);
        const home: MetadataRoute.Sitemap[number] = {
          url: new URL(cleanPublicSitePath(pathLocale), origin).toString(),
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
                pathLocale,
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

  return [...await platformMarketingEntries(), ...workspacePages];
}
