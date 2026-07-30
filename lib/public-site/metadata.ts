import type { Metadata } from "next";
import { SITE_URL } from "@/app/_seo/site";
import type { PublicSiteData, PublicSitePage } from "./types";

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

function absoluteMediaUrl(value?: string | null) {
  if (!value) return undefined;
  try {
    return new URL(value, SITE_URL).toString();
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

export function createPublicSiteMetadata(
  site: PublicSiteData,
  requestedLocale?: string | null,
): Metadata {
  const path = publicSitePath(
    site.business.slug,
    requestedLocale &&
      requestedLocale !== site.business.primary_locale
      ? requestedLocale
      : null,
  );
  const url = new URL(path, SITE_URL);
  const title = site.content.seo_title || site.business.name;
  const description =
    site.content.seo_description ||
    site.content.site_summary ||
    site.content.hero_text;
  const image = absoluteMediaUrl(
    site.content.seo_image_url ||
      site.content.hero_image_url ||
      site.portfolio.find((project) => project.image_url)?.image_url,
  );
  const languageAlternates = Object.fromEntries(
    site.available_locales.map((locale) => [
      locale,
      new URL(
        publicSitePath(
          site.business.slug,
          locale === site.business.primary_locale ? null : locale,
        ),
        SITE_URL,
      ).toString(),
    ]),
  );

  return {
    title: { absolute: title },
    description,
    keywords: keywordList(site.content.seo_keywords),
    icons: site.content.favicon_url
      ? { icon: absoluteMediaUrl(site.content.favicon_url) }
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
): Metadata {
  const localized =
    requestedLocale &&
    requestedLocale !== site.business.primary_locale
      ? requestedLocale
      : null;
  const pagePath = page.type === "portfolio"
    ? publicSitePagePath(site.business.slug, page.slug, localized)
    : publicCustomPagePath(site.business.slug, page.slug, localized);
  const url = new URL(pagePath, SITE_URL);
  const title =
    page.seo_title ||
    `${page.nav_label} — ${site.content.brand_name || site.business.name}`;
  const description = page.seo_description || page.intro;
  const image = absoluteMediaUrl(
    page.seo_image_url ||
      site.content.seo_image_url ||
      site.portfolio.find((project) => project.image_url)?.image_url,
  );
  const languageAlternates = Object.fromEntries(
    site.available_locales.map((locale) => {
      const localePath = page.type === "portfolio"
        ? publicSitePagePath(
            site.business.slug,
            page.slug,
            locale === site.business.primary_locale ? null : locale,
          )
        : publicCustomPagePath(
            site.business.slug,
            page.slug,
            locale === site.business.primary_locale ? null : locale,
          );
      return [locale, new URL(localePath, SITE_URL).toString()];
    }),
  );

  return {
    title: { absolute: title },
    description,
    keywords: keywordList(site.content.seo_keywords),
    icons: site.content.favicon_url
      ? { icon: absoluteMediaUrl(site.content.favicon_url) }
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
