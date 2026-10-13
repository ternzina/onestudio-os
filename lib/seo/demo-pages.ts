import type { Metadata } from "next";
import type { PublicSiteData, PublicSitePage } from "../public-site/types.ts";

export function visibleDemoPages(site: PublicSiteData) {
  return (site.content.pages ?? []).filter((page) => page.is_visible !== false);
}

export function resolveDemoPage(site: PublicSiteData, path: string[]) {
  const slug = path.length === 1 ? path[0]
    : path.length === 2 && path[0] === "p" ? path[1] : null;
  return slug ? visibleDemoPages(site).find((page) => page.slug === slug) : undefined;
}

export function demoPagePaths(site: PublicSiteData, basePath: string) {
  if (site.content.seo_no_index === true) return [];
  return visibleDemoPages(site)
    .filter((page) => page.seo_no_index !== true)
    .map((page) => `${basePath}/${page.slug}`);
}

export function createDemoPageMetadata(
  site: PublicSiteData,
  page: PublicSitePage,
  basePath: string,
  localizedBasePaths?: Record<string, string>,
): Metadata {
  const english = site.business.locale === "en";
  const title = `${page.seo_title || page.title} | ${english ? "Demo" : "Демо"}`;
  const description = page.seo_description || page.intro;
  const canonical = `${basePath}/${page.slug}`;
  const image = page.seo_image_url || site.content.seo_image_url;
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      ...(localizedBasePaths ? { languages: Object.fromEntries(
        Object.entries(localizedBasePaths).map(([locale, path]) => [locale, `${path}/${page.slug}`]),
      ) } : {}),
    },
    robots: { index: site.content.seo_no_index !== true && page.seo_no_index !== true, follow: true },
    openGraph: {
      title, description, url: canonical, type: "website",
      locale: english ? "en_US" : "ru_RU",
      ...(image ? { images: [{ url: image, alt: page.title }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description, ...(image ? { images: [image] } : {}) },
  };
}
