import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { supportedLocales } from "../lib/i18n/config.ts";
import { GUIDE_ARTICLES } from "../lib/seo/guide-articles.ts";
import {
  createGuideRepository,
  type GuideRepositoryClient,
} from "../lib/guides/repository.ts";
import type { GuideArticle } from "../lib/guides/types.ts";

const migration = readFileSync(
  new URL("../supabase/migrations/20260912223108_guide_cms_i18n_1_0.sql", import.meta.url),
  "utf8",
);

function migrationSeed() {
  const match = migration.match(/\$guide_data\$(.*)\$guide_data\$::jsonb/s);
  assert.ok(match, "migration must contain the JSON Guide seed");
  return JSON.parse(match[1]);
}

test("Guide CMS migration defines separate platform tables, indexes, grants, and RLS", () => {
  assert.match(migration, /create table public\.platform_guide_articles/);
  assert.match(migration, /create table public\.platform_guide_article_locales/);
  assert.match(migration, /primary key \(article_id, locale\)/);
  assert.match(migration, /unique \(locale, slug\)/);
  assert.match(migration, /create index platform_guide_articles_publication_idx/);
  assert.match(migration, /create index platform_guide_article_locales_publication_idx/);
  assert.match(migration, /create index platform_guide_article_locales_slug_idx/);
  assert.match(migration, /alter table public\.platform_guide_articles enable row level security/);
  assert.match(migration, /alter table public\.platform_guide_article_locales enable row level security/);
  assert.match(migration, /revoke all on table public\.platform_guide_articles,[\s\S]*from anon, authenticated/);
  assert.doesNotMatch(migration, /grant (insert|update|delete|all)[^;]* to anon/);
  assert.match(migration, /grant select on table public\.platform_guide_articles,[\s\S]*to anon, authenticated/);
  assert.match(migration, /grant all on table public\.platform_guide_articles,[\s\S]*to service_role/);
  assert.match(migration, /create policy "Public reads published platform Guides"/);
  assert.match(migration, /create policy "Public reads published Guide translations"/);
  assert.match(migration, /publication_status = 'published'/);
  assert.match(migration, /translation_status = 'published'/);
  assert.match(migration, /published_at <= current_date/);
  assert.match(migration, /exists \([\s\S]*from public\.platform_guide_articles article/);
  assert.match(migration, /to authenticated[\s\S]*using \(public\.is_admin\(\)\)[\s\S]*with check \(public\.is_admin\(\)\)/);
  assert.match(migration, /for each row execute function public\.set_updated_at\(\)/);
  assert.doesNotMatch(migration, /create function public\.set_updated_at/);
  assert.doesNotMatch(migration, /auth\.role\(\)/);
});

test("Guide CMS migration seeds the exact 13 EN Guides and no fake translations", () => {
  const seed = migrationSeed();
  assert.equal(seed.length, 13);
  assert.deepEqual(new Set(seed.map((row: { locale: string }) => row.locale)), new Set(["en"]));
  assert.deepEqual(
    seed.map((row: Record<string, unknown>) => ({
      canonical_slug: row.canonical_slug,
      primary_category: row.primary_category,
      topics: row.topics,
      published_at: row.published_at,
      locale: row.locale,
      slug: row.slug,
      category: row.category,
      title: row.title,
      h1: row.h1,
      description: row.description,
      excerpt: row.excerpt,
      search_intent: row.search_intent,
      sections: row.sections,
      related_links: row.related_links,
      faq: row.faq,
    })),
    GUIDE_ARTICLES.map((article) => ({
      canonical_slug: article.slug,
      primary_category: article.primaryCategory,
      topics: article.topics,
      published_at: article.publishedAt,
      locale: "en",
      slug: article.slug,
      category: article.category,
      title: article.title,
      h1: article.h1,
      description: article.description,
      excerpt: article.excerpt,
      search_intent: article.searchIntent,
      sections: article.sections,
      related_links: article.relatedLinks,
      faq: (article as GuideArticle).faq ?? null,
    })),
  );
  assert.ok(seed.every((row: { publication_status: string }) => row.publication_status === "published"));
});

type FakeResult = { data: unknown[] | null; error: { message: string } | null };

function fakeQuery(result: FakeResult) {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  builder.select = chain;
  builder.eq = chain;
  builder.in = chain;
  builder.lte = chain;
  builder.order = chain;
  builder.limit = chain;
  builder.then = (resolve: (value: FakeResult) => unknown, reject?: (reason: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return builder;
}

function fakeClient(rows: Record<string, FakeResult>): GuideRepositoryClient {
  return {
    from(table) {
      return fakeQuery(rows[table] ?? { data: [], error: null }) as never;
    },
  };
}

const emptyResult = { data: [], error: null };

test("repository normalizes every seeded Guide without losing rich content", async () => {
  const parents = GUIDE_ARTICLES.map((article, index) => ({
    id: `parent-${index}`,
    canonical_slug: article.slug,
    primary_category: article.primaryCategory,
    topics: article.topics ?? [],
    publication_status: "published",
    published_at: article.publishedAt,
  }));
  const locales = GUIDE_ARTICLES.map((article, index) => ({
    article_id: `parent-${index}`,
    locale: "en",
    slug: article.slug,
    category: article.category,
    title: article.title,
    h1: article.h1,
    description: article.description,
    excerpt: article.excerpt,
    search_intent: article.searchIntent,
    sections: article.sections,
    related_links: article.relatedLinks,
    faq: (article as GuideArticle).faq ?? null,
    translation_status: "published",
  }));
  const repository = createGuideRepository(fakeClient({
    platform_guide_articles: { data: parents, error: null },
    platform_guide_article_locales: { data: locales, error: null },
  }));
  const normalized = await repository.listPublishedGuideArticles("en");
  assert.equal(normalized.length, 13);
  for (const article of GUIDE_ARTICLES as readonly GuideArticle[]) {
    const result = normalized.find((candidate) => candidate.slug === article.slug);
    assert.ok(result);
    assert.deepEqual(result.sections, article.sections);
    assert.deepEqual(result.relatedLinks, article.relatedLinks);
    assert.deepEqual(result.faq ?? null, article.faq ?? null);
  }
});

test("repository falls back to static EN content only when the DB query fails", async () => {
  const errorResult = { data: null, error: { message: "relation does not exist" } };
  const repository = createGuideRepository(fakeClient({
    platform_guide_articles: errorResult,
    platform_guide_article_locales: errorResult,
  }));

  assert.equal((await repository.listPublishedGuideArticles("en")).length, 13);
  assert.equal((await repository.getPublishedGuideArticle(GUIDE_ARTICLES[0].slug, "en"))?.slug, GUIDE_ARTICLES[0].slug);
  assert.deepEqual(await repository.listPublishedGuideArticles("ru"), []);
});

test("successful empty or incomplete DB results never fall back to static content", async () => {
  const emptyRepository = createGuideRepository(fakeClient({
    platform_guide_articles: emptyResult,
    platform_guide_article_locales: emptyResult,
  }));
  assert.deepEqual(await emptyRepository.listPublishedGuideArticles("en"), []);
  assert.equal(await emptyRepository.getPublishedGuideArticle(GUIDE_ARTICLES[0].slug, "en"), undefined);

  const parentOnlyRepository = createGuideRepository(fakeClient({
    platform_guide_articles: {
      data: [{
        id: "parent-1",
        canonical_slug: "db-only-guide",
        primary_category: "Business",
        topics: ["Business"],
        publication_status: "published",
        published_at: "2026-09-12",
      }],
      error: null,
    },
    platform_guide_article_locales: emptyResult,
  }));
  assert.deepEqual(await parentOnlyRepository.listPublishedGuideArticles("en"), []);
});

test("draft or unpublished database Guides do not render, while a new DB slug is accepted", async () => {
  const source = GUIDE_ARTICLES[0] as GuideArticle;
  const parent = {
    id: "parent-1",
    canonical_slug: "new-db-guide",
    primary_category: source.primaryCategory,
    topics: source.topics,
    publication_status: "published",
    published_at: source.publishedAt,
  };
  const locale = {
    article_id: "parent-1",
    locale: "en",
    slug: "new-db-guide",
    category: source.category,
    title: source.title,
    h1: source.h1,
    description: source.description,
    excerpt: source.excerpt,
    search_intent: source.searchIntent,
    sections: source.sections,
    related_links: source.relatedLinks,
    faq: source.faq ?? null,
    translation_status: "published",
  };
  const publishedRepository = createGuideRepository(fakeClient({
    platform_guide_articles: { data: [parent], error: null },
    platform_guide_article_locales: { data: [locale], error: null },
  }));
  assert.equal((await publishedRepository.getPublishedGuideArticle("new-db-guide", "en"))?.path, "/guides/new-db-guide");

  const draftRepository = createGuideRepository(fakeClient({
    platform_guide_articles: { data: [parent], error: null },
    platform_guide_article_locales: {
      data: [{ ...locale, translation_status: "draft" }],
      error: null,
    },
  }));
  assert.equal(await draftRepository.getPublishedGuideArticle("new-db-guide", "en"), undefined);

  const unpublishedRepository = createGuideRepository(fakeClient({
    platform_guide_articles: { data: [{ ...parent, publication_status: "archived" }], error: null },
    platform_guide_article_locales: { data: [locale], error: null },
  }));
  assert.equal(await unpublishedRepository.getPublishedGuideArticle("new-db-guide", "en"), undefined);

  const unsafeRepository = createGuideRepository(fakeClient({
    platform_guide_articles: { data: [parent], error: null },
    platform_guide_article_locales: {
      data: [{
        ...locale,
        sections: [
          { ...source.sections[0], paragraphs: ["[[unsafe|javascript:alert(1)]]"] },
          ...source.sections.slice(1),
        ],
      }],
      error: null,
    },
  }));
  assert.equal(await unsafeRepository.getPublishedGuideArticle("new-db-guide", "en"), undefined);
});

test("supported locales remain the existing eight and runtime consumers use the DB repository", () => {
  assert.deepEqual(supportedLocales, ["ru", "en", "uk", "pl", "de", "es", "fr", "pt"]);
  const files = [
    "../app/page.tsx",
    "../app/guides/page.tsx",
    "../app/guides/[slug]/page.tsx",
    "../app/sitemap.ts",
  ].map((file) => readFileSync(new URL(file, import.meta.url), "utf8"));
  for (const source of files) {
    assert.doesNotMatch(source, /GUIDE_ARTICLES|getGuideArticle|getGuideArticleSummaries|getLatestGuideArticles|GUIDE_CONTENT_LOCALE/);
  }
  assert.match(files[0], /listPublishedGuideArticleSummaries/);
  assert.match(files[1], /listPublishedGuideArticleSummaries/);
  assert.match(files[2], /getPublishedGuideArticle/);
  assert.match(files[2], /dynamic = "force-dynamic"/);
  assert.doesNotMatch(files[2], /dynamicParams\s*=\s*false|generateStaticParams/);
  assert.match(files[3], /listPublishedGuideSitemapEntries/);
  assert.match(files[3], /SOLUTION_PATHS/);
  assert.match(files[3], /customDomainEntries/);
});

test("Guide article keeps Article JSON-LD and does not emit FAQPage or QAPage schema", () => {
  const route = readFileSync(new URL("../app/guides/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(route, /"@type": "Article"/);
  assert.doesNotMatch(route, /FAQPage|QAPage/);
});
