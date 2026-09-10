import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  JOURNAL_ARTICLES,
  JOURNAL_CATEGORY_ORDER,
  getJournalArticle,
  getJournalArticleSummaries,
  getJournalCategories,
  sortJournalArticles,
} from "../lib/seo/journal-articles.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("Journal registry remains the single scalable source of canonical articles", () => {
  assert.ok(JOURNAL_ARTICLES.length >= 3);
  assert.equal(new Set(JOURNAL_ARTICLES.map((article) => article.slug)).size, JOURNAL_ARTICLES.length);
  assert.equal(new Set(JOURNAL_ARTICLES.map((article) => article.title)).size, JOURNAL_ARTICLES.length);

  for (const article of JOURNAL_ARTICLES) {
    assert.equal(article.path, `/journal/${article.slug}`);
    assert.match(article.publishedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.doesNotMatch(article.title, /\|\s*OneStudio OS/);
    assert.equal(getJournalArticle(article.slug), article);
  }

  const summaries = getJournalArticleSummaries();
  assert.equal(summaries.length, JOURNAL_ARTICLES.length);
  assert.deepEqual(
    Object.keys(summaries[0]).sort(),
    ["category", "excerpt", "path", "publishedAt", "slug", "title", "topics"],
  );
  assert.deepEqual(getJournalCategories(summaries), JOURNAL_CATEGORY_ORDER);
});

test("Journal ordering is stable and a fourth article does not break the index model", () => {
  const summaries = getJournalArticleSummaries();
  const fourth = {
    ...summaries[0],
    slug: "a-fourth-journal-article",
    path: "/journal/a-fourth-journal-article",
    title: "A fourth Journal article",
  };
  const expanded = getJournalArticleSummaries([...summaries, fourth]);

  assert.equal(expanded.length, summaries.length + 1);
  assert.deepEqual(
    sortJournalArticles([
      { slug: "later", publishedAt: "2026-09-09" },
      { slug: "z-tie", publishedAt: "2026-09-08" },
      { slug: "a-tie", publishedAt: "2026-09-08" },
    ]).map((article) => article.slug),
    ["later", "a-tie", "z-tie"],
  );
});

test("Journal routes use summaries for the index and full registry data for articles", async () => {
  const [index, client, articleRoute, redirects] = await Promise.all([
    read("../app/journal/page.tsx"),
    read("../app/journal/JournalPageClient.tsx"),
    read("../app/journal/[slug]/page.tsx"),
    read("../next.config.ts"),
  ]);

  assert.match(index, /getJournalArticleSummaries/);
  assert.match(index, /getJournalCategories/);
  assert.doesNotMatch(client, /JOURNAL_ARTICLES|BlogPreview|\.sections/);
  assert.match(client, /PAGE_SIZE/);
  assert.match(client, /article\.publishedAt/);
  assert.match(articleRoute, /JOURNAL_ARTICLES\.map/);
  assert.match(articleRoute, /getJournalArticle/);
  assert.match(articleRoute, /canonical: new URL\(article\.path, SITE_URL\)/);
  assert.match(articleRoute, /datePublished: article\.publishedAt/);
  assert.match(articleRoute, /section\.numberedList/);
  assert.match(articleRoute, /section\.table/);
  assert.match(articleRoute, /section\.subsections/);
  assert.match(articleRoute, /section\.template/);
  assert.doesNotMatch(articleRoute, /\/en\/blog|\/ru\/blog|hreflang|—/);

  assert.match(redirects, /source: "\/blog"[\s\S]*destination: "\/journal"[\s\S]*statusCode: 301/);
  assert.match(redirects, /source: "\/blog\/:slug"[\s\S]*destination: "\/journal\/:slug"[\s\S]*statusCode: 301/);

  assert.ok(JOURNAL_ARTICLES.some((article) => article.sections.some((section) => "subsections" in section && section.subsections.length > 0)));
  assert.ok(JOURNAL_ARTICLES.some((article) => article.sections.some((section) => "numberedList" in section && section.numberedList.length > 0)));
  assert.ok(JOURNAL_ARTICLES.some((article) => article.sections.some((section) => "table" in section && section.table.rows.length > 0)));
  assert.ok(JOURNAL_ARTICLES.some((article) => article.sections.some((section) => "template" in section && section.template.content.length > 0)));
});

test("sitemap and IndexNow discover every Journal article without a manual article list", async () => {
  const [platform, sitemap, indexNow] = await Promise.all([
    read("../app/_seo/platform.ts"),
    read("../app/sitemap.ts"),
    read("../scripts/platform-indexnow-release.mjs"),
  ]);

  assert.match(platform, /"\/journal"/);
  assert.doesNotMatch(platform, /"\/blog(?:\/|")/);
  for (const article of JOURNAL_ARTICLES) assert.doesNotMatch(platform, new RegExp(article.slug));
  assert.match(sitemap, /import \{ JOURNAL_ARTICLES \}/);
  assert.match(sitemap, /JOURNAL_ARTICLES\.map\(\(article\)/);
  assert.match(sitemap, /article\.path/);
  assert.match(sitemap, /article\.publishedAt/);
  assert.doesNotMatch(sitemap, /\/blog/);
  assert.match(indexNow, /\/journal/);
  assert.match(indexNow, /lib\/seo\/journal-articles\.ts/);
  assert.doesNotMatch(indexNow, /\/blog/);
});

test("homepage preview is registry-driven, capped at three, and navigation uses Journal", async () => {
  const [page, homeClient, preview, header, footer, translations, commonEn, commonRu] = await Promise.all([
    read("../app/page.tsx"),
    read("../app/HomePageClient.tsx"),
    read("../components/marketing/OneStudioJournalPreview.tsx"),
    read("../components/marketing/MarketingHeader.tsx"),
    read("../components/marketing/OneStudioFooter.tsx"),
    read("../lib/i18n/index.ts"),
    read("../lib/i18n/locales/en/common.ts"),
    read("../lib/i18n/locales/ru/common.ts"),
  ]);

  assert.match(page, /getLatestJournalArticles\(3\)/);
  assert.match(homeClient, /OneStudioJournalPreview/);
  assert.match(preview, /articles\.slice\(0, 3\)/);
  assert.match(preview, /article\.publishedAt/);
  assert.match(preview, /href="\/journal"/);
  for (const article of JOURNAL_ARTICLES) assert.doesNotMatch(preview, new RegExp(article.slug));
  assert.match(header, /href: "\/journal"/);
  assert.match(footer, /href: "\/journal"/);
  assert.doesNotMatch(`${header}\n${footer}`, /href: "\/blog"/);
  assert.match(`${header}\n${footer}`, /footer\.links\.journal/);
  assert.doesNotMatch(translations, /locales\/.+\/blog|\bblog:/);
  assert.match(commonEn, /journal: "Journal"/);
  assert.match(commonRu, /journal: "Журнал"/);
});

test("existing Journal articles retain their useful internal links", () => {
  const bySlug = new Map(JOURNAL_ARTICLES.map((article) => [article.slug, article]));
  assert.match(bySlug.get("how-online-booking-works-for-service-businesses")!.sections.flatMap((section) => section.paragraphs).join(" "), /\/features\/online-booking/);
  assert.match(bySlug.get("website-builder-with-crm-guide")!.sections.flatMap((section) => section.paragraphs).join(" "), /\/features\/crm/);
  assert.match(bySlug.get("beauty-salon-website-booking-guide")!.sections.flatMap((section) => section.paragraphs).join(" "), /\/solutions\/beauty-salon-website/);
});
