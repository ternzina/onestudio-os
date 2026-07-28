import type { Metadata } from "next";
import { SITE_URL } from "@/app/_seo/site";
import type { PublicSiteData } from "./types";

export function publicSitePath(
  businessSlug: string,
  locale?: string | null,
) {
  return locale
    ? `/site/${encodeURIComponent(businessSlug)}/${encodeURIComponent(locale)}`
    : `/site/${encodeURIComponent(businessSlug)}`;
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
    site.content.seo_description || site.content.hero_text;
  const image = site.portfolio.find((project) => project.image_url)?.image_url;
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
    robots: { index: true, follow: true },
  };
}
