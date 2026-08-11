import type { Metadata } from "next";
import {
  createCanonicalVeloraDemoSite,
  VELORA_DEMO_BASE_PATH,
} from "./velora-demo.ts";

export function resolveVeloraDemoSlug(path: string[]) {
  if (path.length === 1) return path[0];
  if (path.length === 2 && path[0] === "p") return path[1];
  return undefined;
}

export function resolveVeloraDemoMetadata(path: string[]): Metadata | null {
  const site = createCanonicalVeloraDemoSite();
  const slug = resolveVeloraDemoSlug(path);
  const page = slug
    ? site.content.pages?.find(
        (item) =>
          item.type === "custom" &&
          item.slug === slug &&
          item.is_visible !== false,
      )
    : undefined;
  if (path.length && !page) return null;
  const title = page?.seo_title || site.content.seo_title || site.business.name;
  const description =
    page?.seo_description || site.content.seo_description || "";
  const image = page?.seo_image_url || site.content.seo_image_url;
  const canonical = page
    ? `${VELORA_DEMO_BASE_PATH}/${page.slug}`
    : VELORA_DEMO_BASE_PATH;
  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "ru_UA",
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
