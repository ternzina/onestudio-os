import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "../supabase/config.ts";
import { supportedLocales, type Locale } from "../i18n/config.ts";
import {
  GUIDE_ARTICLES,
  GUIDE_CONTENT_LOCALE,
} from "../seo/guide-articles.ts";
import {
  GUIDE_CATEGORY_ORDER,
  type GuideArticle,
  type GuideArticleSummary,
  type GuideCategory,
  type GuideLink,
  type GuideSection,
  type GuideSubsection,
  type GuideTable,
  type GuideTemplateBlock,
} from "./types.ts";

/**
 * Server-only data access layer for platform Guides.
 *
 * This module is imported only by Server Components. It deliberately creates
 * a publishable-key client without auth cookies so public pages always use the
 * anon RLS path and can never receive admin drafts.
 */

const PARENT_TABLE = "platform_guide_articles";
const LOCALE_TABLE = "platform_guide_article_locales";
const GUIDE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const INLINE_LINK_PATTERN = /\[\[([^|]+)\|([^\]]+)\]\]/g;

type QueryResult<T> = {
  data: T | null;
  error: { message?: string } | null;
};

type QueryBuilder = PromiseLike<QueryResult<unknown>> & {
  select(columns?: string): QueryBuilder;
  eq(column: string, value: string): QueryBuilder;
  in(column: string, values: string[]): QueryBuilder;
  lte(column: string, value: string): QueryBuilder;
  order(column: string, options?: { ascending?: boolean }): QueryBuilder;
  limit(count: number): QueryBuilder;
};

export type GuideRepositoryClient = {
  from(table: string): QueryBuilder;
};

type RawParentRow = {
  id?: unknown;
  canonical_slug?: unknown;
  primary_category?: unknown;
  topics?: unknown;
  publication_status?: unknown;
  published_at?: unknown;
};

type RawLocaleRow = {
  article_id?: unknown;
  locale?: unknown;
  slug?: unknown;
  translation_status?: unknown;
  category?: unknown;
  title?: unknown;
  h1?: unknown;
  description?: unknown;
  excerpt?: unknown;
  search_intent?: unknown;
  sections?: unknown;
  related_links?: unknown;
  faq?: unknown;
};

type NormalizedParent = {
  id: string;
  canonicalSlug: string;
  primaryCategory: GuideCategory;
  topics: GuideCategory[];
  publishedAt: string;
};

function createPublicGuideClient(): GuideRepositoryClient {
  const { url, key } = getSupabaseConfig();
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  }) as unknown as GuideRepositoryClient;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function safeGuideText(value: unknown): string | null {
  const text = nonEmptyString(value);
  if (!text) return null;
  for (const match of text.matchAll(INLINE_LINK_PATTERN)) {
    if (!nonEmptyString(match[1]) || !safeGuideHref(match[2])) return null;
  }
  return text;
}

function slugString(value: unknown): string | null {
  const string = nonEmptyString(value);
  return string && GUIDE_SLUG_PATTERN.test(string) ? string : null;
}

function guideCategory(value: unknown): GuideCategory | null {
  return typeof value === "string" && GUIDE_CATEGORY_ORDER.includes(value as GuideCategory)
    ? (value as GuideCategory)
    : null;
}

function guideCategoryArray(value: unknown): GuideCategory[] | null {
  if (!Array.isArray(value)) return null;
  const categories = value.map(guideCategory);
  return categories.every((category): category is GuideCategory => Boolean(category))
    ? categories
    : null;
}

function dateOnly(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : value;
}

function safeGuideHref(value: unknown): string | null {
  const href = nonEmptyString(value);
  if (!href || !href.startsWith("/") || href.startsWith("//")) return null;
  return href;
}

function normalizeLink(value: unknown): GuideLink | null {
  if (!isRecord(value)) return null;
  const label = nonEmptyString(value.label);
  const href = safeGuideHref(value.href);
  return label && href ? { label, href } : null;
}

function normalizeLinks(value: unknown): GuideLink[] | null {
  if (!Array.isArray(value)) return null;
  const links = value.map(normalizeLink);
  return links.every((link): link is GuideLink => Boolean(link)) ? links : null;
}

function stringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const strings = value.map(safeGuideText);
  return strings.every((item): item is string => Boolean(item)) ? strings : null;
}

function normalizeTable(value: unknown): GuideTable | null {
  if (!isRecord(value)) return null;
  const headers = stringArray(value.headers);
  const rows = Array.isArray(value.rows)
    ? value.rows.map(stringArray)
    : null;
  if (!headers?.length || !rows || !rows.every((row): row is string[] => Boolean(row))) return null;

  const caption = value.caption === undefined ? undefined : nonEmptyString(value.caption);
  if (value.caption !== undefined && !caption) return null;
  return { ...(caption ? { caption } : {}), headers, rows };
}

function normalizeTemplate(value: unknown): GuideTemplateBlock | null {
  if (!isRecord(value)) return null;
  const content = nonEmptyString(value.content);
  if (!content) return null;
  const label = value.label === undefined ? undefined : nonEmptyString(value.label);
  if (value.label !== undefined && !label) return null;
  return { ...(label ? { label } : {}), content };
}

function normalizeSubsection(value: unknown): GuideSubsection | null {
  if (!isRecord(value)) return null;
  const title = safeGuideText(value.title);
  if (!title) return null;

  const paragraphs = value.paragraphs === undefined ? undefined : stringArray(value.paragraphs);
  const list = value.list === undefined ? undefined : stringArray(value.list);
  const numberedList = value.numberedList === undefined ? undefined : stringArray(value.numberedList);
  if (
    (value.paragraphs !== undefined && !paragraphs) ||
    (value.list !== undefined && !list) ||
    (value.numberedList !== undefined && !numberedList)
  ) return null;

  return {
    title,
    ...(paragraphs ? { paragraphs } : {}),
    ...(list ? { list } : {}),
    ...(numberedList ? { numberedList } : {}),
  };
}

function normalizeSection(value: unknown): GuideSection | null {
  if (!isRecord(value)) return null;
  const title = safeGuideText(value.title);
  const paragraphs = stringArray(value.paragraphs);
  if (!title || !paragraphs) return null;

  const checklist = value.checklist === undefined ? undefined : stringArray(value.checklist);
  const list = value.list === undefined ? undefined : stringArray(value.list);
  const numberedList = value.numberedList === undefined ? undefined : stringArray(value.numberedList);
  const subsectionItems = value.subsections === undefined
    ? undefined
    : Array.isArray(value.subsections)
      ? value.subsections.map(normalizeSubsection)
      : null;
  const table = value.table === undefined ? undefined : normalizeTable(value.table);
  const links = value.links === undefined ? undefined : normalizeLinks(value.links);
  const template = value.template === undefined ? undefined : normalizeTemplate(value.template);
  if (
    (value.checklist !== undefined && !checklist) ||
    (value.list !== undefined && !list) ||
    (value.numberedList !== undefined && !numberedList) ||
    (value.subsections !== undefined && (!subsectionItems || !subsectionItems.every((item): item is GuideSubsection => Boolean(item)))) ||
    (value.table !== undefined && !table) ||
    (value.links !== undefined && !links) ||
    (value.template !== undefined && !template)
  ) return null;

  const subsections = subsectionItems?.filter(
    (item): item is GuideSubsection => Boolean(item),
  );

  return {
    title,
    paragraphs,
    ...(checklist ? { checklist } : {}),
    ...(list ? { list } : {}),
    ...(numberedList ? { numberedList } : {}),
    ...(subsections ? { subsections } : {}),
    ...(table ? { table } : {}),
    ...(links ? { links } : {}),
    ...(template ? { template } : {}),
  };
}

function normalizeSections(value: unknown): GuideSection[] | null {
  if (!Array.isArray(value) || !value.length) return null;
  const sections = value.map(normalizeSection);
  return sections.every((section): section is GuideSection => Boolean(section)) ? sections : null;
}

function normalizeFaq(value: unknown): Array<{ question: string; answer: string }> | undefined | null {
  if (value === null || value === undefined) return undefined;
  if (!Array.isArray(value)) return null;
  const faq = value.map((item) => {
    if (!isRecord(item)) return null;
    const question = nonEmptyString(item.question);
    const answer = nonEmptyString(item.answer);
    return question && answer ? { question, answer } : null;
  });
  return faq.every((item): item is { question: string; answer: string } => Boolean(item)) ? faq : null;
}

function normalizeParent(value: RawParentRow): NormalizedParent | null {
  const id = nonEmptyString(value.id);
  const canonicalSlug = slugString(value.canonical_slug);
  const primaryCategory = guideCategory(value.primary_category);
  const topics = guideCategoryArray(value.topics);
  const publishedAt = dateOnly(value.published_at);
  if (
    value.publication_status !== "published" ||
    !id ||
    !canonicalSlug ||
    !primaryCategory ||
    !topics ||
    !publishedAt ||
    publishedAt > todayUtc()
  ) return null;
  return { id, canonicalSlug, primaryCategory, topics, publishedAt };
}

function normalizeArticle(parent: NormalizedParent, value: RawLocaleRow): GuideArticle | null {
  const articleId = nonEmptyString(value.article_id);
  const locale = nonEmptyString(value.locale);
  const slug = slugString(value.slug);
  const translationStatus = value.translation_status;
  const category = safeGuideText(value.category);
  const title = safeGuideText(value.title);
  const h1 = safeGuideText(value.h1);
  const description = safeGuideText(value.description);
  const excerpt = safeGuideText(value.excerpt);
  const searchIntent = safeGuideText(value.search_intent);
  const sections = normalizeSections(value.sections);
  const relatedLinks = normalizeLinks(value.related_links);
  const faq = normalizeFaq(value.faq);
  const supportedLocale = typeof locale === "string" && supportedLocales.includes(locale as Locale);
  if (
    articleId !== parent.id ||
    !supportedLocale ||
    translationStatus !== "published" ||
    !slug ||
    !category ||
    !title ||
    !h1 ||
    !description ||
    !excerpt ||
    !searchIntent ||
    !sections ||
    !relatedLinks ||
    faq === null
  ) return null;

  return {
    slug,
    path: `/guides/${slug}`,
    title,
    h1,
    description,
    publishedAt: parent.publishedAt,
    category,
    excerpt,
    searchIntent,
    primaryCategory: parent.primaryCategory,
    topics: parent.topics.length ? parent.topics : [parent.primaryCategory],
    sections,
    relatedLinks,
    ...(faq ? { faq } : {}),
  };
}

function sortPublishedArticles(articles: readonly GuideArticle[]): GuideArticle[] {
  return [...articles].sort(
    (left, right) =>
      right.publishedAt.localeCompare(left.publishedAt) ||
      left.slug.localeCompare(right.slug),
  );
}

function summarize(articles: readonly GuideArticle[]): GuideArticleSummary[] {
  return sortPublishedArticles(articles).map((article) => ({
    slug: article.slug,
    path: article.path,
    title: article.title,
    publishedAt: article.publishedAt,
    category: article.category,
    excerpt: article.excerpt,
    primaryCategory: article.primaryCategory,
    topics: article.topics?.length ? article.topics : [article.primaryCategory],
  }));
}

function fallbackArticles(locale: Locale): GuideArticle[] {
  // Migration safety net: remove this static fallback after confirmed DB cutover.
  return locale === GUIDE_CONTENT_LOCALE ? [...GUIDE_ARTICLES] : [];
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

async function readRows<T>(query: QueryBuilder): Promise<T[]> {
  const result = await query;
  if (result.error) throw new Error(result.error.message || "Guide CMS query failed");
  return Array.isArray(result.data) ? (result.data as T[]) : [];
}

export function createGuideRepository(client?: GuideRepositoryClient) {
  async function listPublishedGuideArticles(locale: Locale): Promise<GuideArticle[]> {
    try {
      const dbClient = client ?? createPublicGuideClient();
      const parents = (await readRows<RawParentRow>(
        dbClient
          .from(PARENT_TABLE)
          .select("id,canonical_slug,primary_category,topics,publication_status,published_at")
          .eq("publication_status", "published")
          .lte("published_at", todayUtc())
          .order("published_at", { ascending: false })
          .order("canonical_slug", { ascending: true }),
      ))
        .map(normalizeParent)
        .filter((parent): parent is NormalizedParent => Boolean(parent));

      if (!parents.length) return [];

      const locales = await readRows<RawLocaleRow>(
        dbClient
          .from(LOCALE_TABLE)
          .select("article_id,locale,slug,category,title,h1,description,excerpt,search_intent,sections,related_links,faq,translation_status")
          .eq("locale", locale)
          .eq("translation_status", "published")
          .in("article_id", parents.map((parent) => parent.id))
          .order("slug", { ascending: true }),
      );
      const localeByArticle = new Map<string, RawLocaleRow>();
      locales.forEach((row) => {
        const articleId = nonEmptyString(row.article_id);
        if (articleId && !localeByArticle.has(articleId)) localeByArticle.set(articleId, row);
      });

      return sortPublishedArticles(
        parents
          .map((parent) => {
            const localeRow = localeByArticle.get(parent.id);
            return localeRow ? normalizeArticle(parent, localeRow) : null;
          })
          .filter((article): article is GuideArticle => Boolean(article)),
      );
    } catch {
      return fallbackArticles(locale);
    }
  }

  async function listPublishedGuideArticleSummaries(locale: Locale): Promise<GuideArticleSummary[]> {
    return summarize(await listPublishedGuideArticles(locale));
  }

  async function getPublishedGuideArticle(slug: string, locale: Locale): Promise<GuideArticle | undefined> {
    try {
      const dbClient = client ?? createPublicGuideClient();
      const localeRows = await readRows<RawLocaleRow>(
        dbClient
          .from(LOCALE_TABLE)
          .select("article_id,locale,slug,category,title,h1,description,excerpt,search_intent,sections,related_links,faq,translation_status")
          .eq("locale", locale)
          .eq("slug", slug)
          .eq("translation_status", "published")
          .limit(1),
      );
      const localeRow = localeRows[0];
      const articleId = localeRow ? nonEmptyString(localeRow.article_id) : null;
      if (!localeRow || !articleId) return undefined;

      const parents = await readRows<RawParentRow>(
        dbClient
          .from(PARENT_TABLE)
          .select("id,canonical_slug,primary_category,topics,publication_status,published_at")
          .eq("id", articleId)
          .eq("publication_status", "published")
          .lte("published_at", todayUtc())
          .limit(1),
      );
      const parent = parents.map(normalizeParent).find((candidate): candidate is NormalizedParent => Boolean(candidate));
      return parent ? normalizeArticle(parent, localeRow) ?? undefined : undefined;
    } catch {
      return fallbackArticles(locale).find((article) => article.slug === slug);
    }
  }

  async function listPublishedGuideSitemapEntries(locale: Locale) {
    return (await listPublishedGuideArticles(locale)).map(({ path, publishedAt }) => ({
      path,
      publishedAt,
    }));
  }

  return {
    listPublishedGuideArticles,
    listPublishedGuideArticleSummaries,
    getPublishedGuideArticle,
    listPublishedGuideSitemapEntries,
  };
}

export async function listPublishedGuideArticles(locale: Locale) {
  return createGuideRepository().listPublishedGuideArticles(locale);
}

export async function listPublishedGuideArticleSummaries(locale: Locale) {
  return createGuideRepository().listPublishedGuideArticleSummaries(locale);
}

export async function getPublishedGuideArticle(slug: string, locale: Locale) {
  return createGuideRepository().getPublishedGuideArticle(slug, locale);
}

export async function listPublishedGuideSitemapEntries(locale: Locale) {
  return createGuideRepository().listPublishedGuideSitemapEntries(locale);
}
