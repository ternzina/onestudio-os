import site from "../data/site.json";

export type ExportedSite = {
  templateId: string;
  brandName: string;
  canonicalOrigin: string;
  locale: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  noIndex: boolean;
  faviconPath: string;
  heroImagePath: string;
  shareImagePath: string;
  hero: { eyebrow: string; title: string; text: string };
  form: { aid: string; template: "wallet-lines"; eyebrow: string; title: string; text: string } | null;
  homeHtml: string;
};

export function readSite(): ExportedSite {
  return site as ExportedSite;
}

export function absoluteUrl(pagePath: string): string {
  const origin = readSite().canonicalOrigin;
  if (pagePath.startsWith("https://")) return pagePath;
  return pagePath === "/" ? origin : `${origin}${pagePath}`;
}

export function socialMetadata(input: { title: string; description: string; path: string; noIndex?: boolean }) {
  const site = readSite();
  const canonical = absoluteUrl(input.path);
  const image = site.shareImagePath ? absoluteUrl(site.shareImagePath) : "";
  const keywords = (site.seoKeywords || "").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 24);
  return {
    title: { absolute: input.title },
    description: input.description,
    keywords: keywords.length ? keywords : undefined,
    alternates: { canonical, languages: { [site.locale || "en"]: canonical } },
    openGraph: {
      type: "website" as const,
      url: canonical,
      siteName: site.brandName,
      title: input.title,
      description: input.description,
      locale: (site.locale || "en").replace("-", "_"),
      images: image ? [{ url: image, alt: input.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" as const : "summary" as const,
      title: input.title,
      description: input.description,
      images: image ? [image] : undefined,
    },
    robots: input.noIndex || site.noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
