import { EN_GUIDE_ARTICLES } from "../guides/content/en/articles.ts";
import { EN_GUIDE_ARTICLES_2026_09_12 } from "../guides/content/en/articles-2026-09-12.ts";
import { GUIDE_CATEGORY_ORDER, type GuideArticle, type GuideArticleSummary } from "../guides/types.ts";
export * from "../guides/types.ts";

export const GUIDE_CONTENT_LOCALE = "en" as const;
export const GUIDE_ARTICLES = [...EN_GUIDE_ARTICLES, ...EN_GUIDE_ARTICLES_2026_09_12];

type GuideArticleSource = Pick<GuideArticle, "slug" | "path" | "title" | "publishedAt" | "category" | "excerpt" | "topics" | "primaryCategory">;

export function getGuideArticle(slug: string) { return GUIDE_ARTICLES.find((article) => article.slug === slug); }

export function sortGuideArticles<T extends Pick<GuideArticleSource, "publishedAt" | "slug">>(
  articles: readonly T[],
) {
  return [...articles].sort(
    (left, right) =>
      right.publishedAt.localeCompare(left.publishedAt) ||
      left.slug.localeCompare(right.slug),
  );
}

export function getGuideArticleSummaries(
  articles: readonly GuideArticleSource[] = GUIDE_ARTICLES,
): GuideArticleSummary[] {
  return sortGuideArticles(
    articles.map(({ slug, path, title, publishedAt, category, excerpt, primaryCategory, topics }) => ({
      slug,
      path,
      title,
      publishedAt,
      category,
      excerpt,
      primaryCategory,
      topics: topics?.length ? topics : [primaryCategory],
    })),
  );
}

/** Editorial taxonomy is fixed, including categories with no published guides. */
export function getGuideCategories() {
  return GUIDE_CATEGORY_ORDER;
}

export function getLatestGuideArticles(limit = 3) {
  return getGuideArticleSummaries().slice(0, Math.max(0, limit));
}
