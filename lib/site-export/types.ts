export type ExportWarning = {
  code: string;
  message: string;
  blocksStatic: boolean;
};

export type ExportBlock = {
  id: string;
  title: string;
  bodyHtml: string;
};

export type ExportLink = {
  slug: string;
  title: string;
  path: string;
};

export type ExportPage = {
  slug: string;
  path: string;
  kind: "custom" | "portfolio";
  title: string;
  navLabel: string;
  eyebrow: string;
  introHtml: string;
  seoTitle: string;
  seoDescription: string;
  noIndex: boolean;
  categoryName?: string;
  categorySlug?: string;
  blocks: ExportBlock[];
  toc: Array<{ id: string; label: string }>;
  related: ExportLink[];
  worksheetCallout: boolean;
};

export type GuideCard = {
  slug: string;
  title: string;
  navLabel: string;
  description: string;
  categoryName: string;
  categorySlug: string;
  path: string;
};

export type ExportCategory = {
  slug: string;
  name: string;
  title: string;
  seoTitle: string;
  description: string;
  intro: string;
};

export type ExportAsset = {
  archivePath: string;
  bytes: Buffer;
};

export type SiteSnapshot = {
  templateId: string;
  brandName: string;
  businessSlug: string;
  canonicalOrigin: string;
  locale: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  noIndex: boolean;
  faviconPath: string;
  heroImagePath: string;
  hero: { eyebrow: string; title: string; text: string };
  form: { aid: string; template: "wallet-lines" } | null;
  pages: ExportPage[];
  guides: GuideCard[];
  categories: ExportCategory[];
  includeGuides: boolean;
  includeWorksheet: boolean;
  homeHtml: string;
  assets: ExportAsset[];
  warnings: ExportWarning[];
  redirects: Array<{ source: string; destination: string; statusCode: 301 }>;
  usingDraft: boolean;
};

export type ExportFile = {
  path: string;
  body: Buffer | string;
};

export type ExportFormat = "static" | "next";
