import { readFileSync } from "node:fs";
import path from "node:path";
import index from "../data/index.json";

export type ExportedPage = {
  slug: string;
  path: string;
  title: string;
  navLabel: string;
  eyebrow: string;
  introHtml: string;
  seoTitle: string;
  seoDescription: string;
  noIndex: boolean;
  categoryName?: string;
  categorySlug?: string;
  blocks: Array<{ id: string; title: string; bodyHtml: string }>;
  toc: Array<{ id: string; label: string }>;
  related: Array<{ slug: string; title: string; path: string }>;
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

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function pageParams(): Array<{ slug: string }> {
  return index.pages;
}

export function readPage(slug: string): ExportedPage | null {
  if (!SAFE_SLUG.test(slug)) return null;
  try {
    return JSON.parse(readFileSync(path.join(process.cwd(), "data", "pages", `${slug}.json`), "utf8")) as ExportedPage;
  } catch {
    return null;
  }
}

export function readGuides(): GuideCard[] {
  return JSON.parse(readFileSync(path.join(process.cwd(), "data", "guides.json"), "utf8")) as GuideCard[];
}

export function readCategories(): ExportCategory[] {
  return JSON.parse(readFileSync(path.join(process.cwd(), "data", "categories.json"), "utf8")) as ExportCategory[];
}
