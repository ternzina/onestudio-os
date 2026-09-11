export const GUIDE_CATEGORY_ORDER = [
  "Business",
  "Websites",
  "Booking",
  "CRM",
  "Marketing",
  "SEO",
] as const;

export type GuideCategory = (typeof GUIDE_CATEGORY_ORDER)[number];
export type GuideLink = { label: string; href: string };
export type GuideTable = {
  caption?: string;
  headers: readonly string[];
  rows: readonly (readonly string[])[];
};
export type GuideSubsection = {
  title: string;
  paragraphs?: readonly string[];
  list?: readonly string[];
  numberedList?: readonly string[];
};
export type GuideTemplateBlock = {
  label?: string;
  content: string;
};
export type GuideSection = {
  title: string;
  paragraphs: readonly string[];
  checklist?: readonly string[];
  list?: readonly string[];
  numberedList?: readonly string[];
  subsections?: readonly GuideSubsection[];
  table?: GuideTable;
  links?: readonly GuideLink[];
  template?: GuideTemplateBlock;
};
export type GuideArticle = {
  slug: string; path: string; title: string; h1: string; description: string;
  publishedAt: string; category: string; excerpt: string; searchIntent: string;
  primaryCategory: GuideCategory;
  topics?: readonly GuideCategory[];
  sections: readonly GuideSection[]; relatedLinks: readonly GuideLink[];
  faq?: readonly { question: string; answer: string }[];
};

export type GuideArticleSummary = Pick<
  GuideArticle,
  "slug" | "path" | "title" | "publishedAt" | "category" | "excerpt" | "primaryCategory"
> & { topics: readonly GuideCategory[] };
