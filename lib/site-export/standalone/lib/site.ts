import site from "../data/site.json";

export type ExportedSite = {
  templateId: string;
  brandName: string;
  canonicalOrigin: string;
  locale: string;
  seoTitle: string;
  seoDescription: string;
  noIndex: boolean;
  faviconPath: string;
  heroImagePath: string;
  hero: { eyebrow: string; title: string; text: string };
  form: { aid: string; template: "wallet-lines" } | null;
  homeHtml: string;
};

export function readSite(): ExportedSite {
  return site as ExportedSite;
}

export function absoluteUrl(pagePath: string): string {
  const origin = readSite().canonicalOrigin;
  return pagePath === "/" ? origin : `${origin}${pagePath}`;
}
