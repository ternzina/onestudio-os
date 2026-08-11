import type { Metadata } from "next";
import {
  createCanonicalVeloraDemoSite,
  type VeloraDemoLocale,
  VELORA_DEMO_BASE_PATH,
  veloraDemoBasePath,
} from "./velora-demo.ts";

export function resolveVeloraDemoPath(path: string[]) {
  const locale: VeloraDemoLocale = path[0] === "en" ? "en" : "ru";
  const rest = locale === "en" ? path.slice(1) : path;
  if (!rest.length) return { locale };
  if (rest.length === 1) return { locale, slug: rest[0] };
  if (rest.length === 2 && rest[0] === "p")
    return { locale, slug: rest[1] };
  return undefined;
}

export function resolveVeloraDemoSlug(path: string[]) {
  return resolveVeloraDemoPath(path)?.slug;
}

export function resolveVeloraDemoMetadata(path: string[]): Metadata | null {
  const resolved = resolveVeloraDemoPath(path);
  if (!resolved) return null;
  const site = createCanonicalVeloraDemoSite(resolved.locale);
  const slug = resolved.slug;
  const page = slug
    ? site.content.pages?.find(
        (item) =>
          item.type === "custom" &&
          item.slug === slug &&
          item.is_visible !== false,
      )
    : undefined;
  if (slug && !page) return null;
  const title = page?.seo_title || site.content.seo_title || site.business.name;
  const description =
    page?.seo_description || site.content.seo_description || "";
  const image = page?.seo_image_url || site.content.seo_image_url;
  const canonical = page
    ? `${veloraDemoBasePath(resolved.locale)}/${page.slug}`
    : veloraDemoBasePath(resolved.locale);
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ru: page
          ? `${VELORA_DEMO_BASE_PATH}/${page.slug}`
          : VELORA_DEMO_BASE_PATH,
        en: page
          ? `${VELORA_DEMO_BASE_PATH}/en/${page.slug}`
          : `${VELORA_DEMO_BASE_PATH}/en`,
      },
    },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: resolved.locale === "en" ? "en_GB" : "ru_UA",
      url: canonical,
      siteName: site.business.name,
      title,
      description,
      ...(image
        ? { images: [{ url: image, alt: page?.title || site.business.name }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
