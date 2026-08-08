import type { Metadata } from "next";
import { SITE_URL } from "../../app/_seo/site.ts";
import type { PublicSiteData, PublicSitePage } from "./types";

export type PublicMetadataOptions = {
  origin?: string | URL | null;
  cleanUrls?: boolean;
};

export function publicSitePath(
  businessSlug: string,
  locale?: string | null,
) {
  return locale
    ? `/site/${encodeURIComponent(businessSlug)}/${encodeURIComponent(locale)}`
    : `/site/${encodeURIComponent(businessSlug)}`;
}

export function publicSitePagePath(
  businessSlug: string,
  pageSlug: string,
  locale?: string | null,
) {
  return `${publicSitePath(businessSlug, locale)}/${encodeURIComponent(pageSlug)}`;
}

export function publicCustomPagePath(
  businessSlug: string,
  pageSlug: string,
  locale?: string | null,
) {
  return `${publicSitePath(businessSlug, locale)}/p/${encodeURIComponent(pageSlug)}`;
}

export function cleanPublicSitePath(locale?: string | null) {
  return locale ? `/${encodeURIComponent(locale)}` : "/";
}

export function cleanPublicPagePath(
  pageSlug: string,
  locale?: string | null,
  custom = false,
) {
  const prefix = locale ? `/${encodeURIComponent(locale)}` : "";
  return custom
    ? `${prefix}/p/${encodeURIComponent(pageSlug)}`
    : `${prefix}/${encodeURIComponent(pageSlug)}`;
}

function metadataOrigin(options?: PublicMetadataOptions) {
  return options?.origin || SITE_URL;
}

function absoluteMediaUrl(
  value?: string | null,
  origin: string | URL = SITE_URL,
) {
  if (!value) return undefined;
  try {
    return new URL(value, origin).toString();
  } catch {
    return undefined;
  }
}

function keywordList(value?: string) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 24);
}

function siteMetadataPath(
  site: PublicSiteData,
  locale: string | null,
  cleanUrls: boolean,
) {
  return cleanUrls
    ? cleanPublicSitePath(locale)
    : publicSitePath(site.business.slug, locale);
}

function pageMetadataPath(
  site: PublicSiteData,
  page: PublicSitePage,
  locale: string | null,
  cleanUrls: boolean,
) {
  if (cleanUrls) {
    return cleanPublicPagePath(page.slug, locale, page.type === "custom");
  }

  return page.type === "portfolio"
    ? publicSitePagePath(site.business.slug, page.slug, locale)
    : publicCustomPagePath(site.business.slug, page.slug, locale);
}

export function createPublicSiteMetadata(
  site: PublicSiteData,
  requestedLocale?: string | null,
  options?: PublicMetadataOptions,
): Metadata {
  const localized =
    requestedLocale && requestedLocale !== site.business.primary_locale
      ? requestedLocale
      : null;
  const origin = metadataOrigin(options);
  const path = siteMetadataPath(site, localized, options?.cleanUrls === true);
  const url = new URL(path, origin);
  const title = site.content.seo_title || site.business.name;
  const description =
    site.content.seo_description ||
    site.content.site_summary ||
    site.content.hero_text;
  const image = absoluteMediaUrl(
    site.content.seo_image_url ||
      site.content.hero_image_url ||
      site.portfolio.find((project) => project.image_url)?.image_url,
    origin,
  );
  const languageAlternates = Object.fromEntries(
    site.available_locales.map((locale) => [
      locale,
      new URL(
        siteMetadataPath(
          site,
          locale === site.business.primary_locale ? null : locale,
          options?.cleanUrls === true,
        ),
        origin,
      ).toString(),
    ]),
  );

  return {
    title: { absolute: title },
    description,
    keywords: keywordList(site.content.seo_keywords),
    icons: site.content.favicon_url
      ? { icon: absoluteMediaUrl(site.content.favicon_url, origin) }
      : undefined,
    alternates: {
      canonical: url,
      languages: languageAlternates,
    },
    openGraph: {
      type: "website",
      url,
      siteName: site.company.display_name || site.business.name,
      title,
      description,
      locale: site.business.locale.replace("-", "_"),
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: {
      index: site.content.seo_no_index !== true,
      follow: site.content.seo_no_index !== true,
    },
  };
}

export function createPublicPageMetadata(
  site: PublicSiteData,
  page: PublicSitePage,
  requestedLocale?: string | null,
  options?: PublicMetadataOptions,
): Metadata {
  const localized =
    requestedLocale && requestedLocale !== site.business.primary_locale
      ? requestedLocale
      : null;
  const origin = metadataOrigin(options);
  const pagePath = pageMetadataPath(
    site,
    page,
    localized,
    options?.cleanUrls === true,
  );
  const url = new URL(pagePath, origin);
  const title =
    page.seo_title ||
    `${page.nav_label} — ${site.content.brand_name || site.business.name}`;
  const description = page.seo_description || page.intro;
  const image = absoluteMediaUrl(
    page.seo_image_url ||
      site.content.seo_image_url ||
      site.portfolio.find((project) => project.image_url)?.image_url,
    origin,
  );
  const languageAlternates = Object.fromEntries(
    site.available_locales.map((locale) => [
      locale,
      new URL(
        pageMetadataPath(
          site,
          page,
          locale === site.business.primary_locale ? null : locale,
          options?.cleanUrls === true,
        ),
        origin,
      ).toString(),
    ]),
  );

  return {
    title: { absolute: title },
    description,
    keywords: keywordList(site.content.seo_keywords),
    icons: site.content.favicon_url
      ? { icon: absoluteMediaUrl(site.content.favicon_url, origin) }
      : undefined,
    alternates: {
      canonical: url,
      languages: languageAlternates,
    },
    openGraph: {
      type: "website",
      url,
      siteName: site.company.display_name || site.business.name,
      title,
      description,
      locale: site.business.locale.replace("-", "_"),
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: {
      index: page.seo_no_index !== true,
      follow: page.seo_no_index !== true,
    },
  };
}
