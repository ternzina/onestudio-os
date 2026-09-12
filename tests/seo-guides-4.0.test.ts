import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  GUIDE_ARTICLES,
  GUIDE_CATEGORY_ORDER,
  getGuideArticle,
  getGuideArticleSummaries,
  getGuideCategories,
  sortGuideArticles,
  type GuideSection,
} from "../lib/seo/guide-articles.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("Guide registry remains the single scalable source of canonical articles", () => {
  assert.ok(GUIDE_ARTICLES.length >= 3);
  assert.equal(new Set(GUIDE_ARTICLES.map((article) => article.slug)).size, GUIDE_ARTICLES.length);
  assert.equal(new Set(GUIDE_ARTICLES.map((article) => article.title)).size, GUIDE_ARTICLES.length);

  for (const article of GUIDE_ARTICLES) {
    assert.equal(article.path, `/guides/${article.slug}`);
    assert.match(article.publishedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.doesNotMatch(article.title, /\|\s*OneStudio OS/);
    assert.equal(getGuideArticle(article.slug), article);
  }

  const summaries = getGuideArticleSummaries();
  assert.equal(summaries.length, GUIDE_ARTICLES.length);
  assert.deepEqual(
    Object.keys(summaries[0]).sort(),
    ["category", "excerpt", "path", "primaryCategory", "publishedAt", "slug", "title", "topics"],
  );
  assert.deepEqual(getGuideCategories(), GUIDE_CATEGORY_ORDER);
  for (const article of summaries) assert.ok(GUIDE_CATEGORY_ORDER.includes(article.primaryCategory));
});

test("Guide ordering is stable and a fourth article does not break the index model", () => {
  const summaries = getGuideArticleSummaries();
  const fourth = {
    ...summaries[0],
    slug: "a-fourth-journal-article",
    path: "/guides/a-fourth-journal-article",
    title: "A fourth Guide article",
  };
  const expanded = getGuideArticleSummaries([...summaries, fourth]);

  assert.equal(expanded.length, summaries.length + 1);
  assert.deepEqual(
    sortGuideArticles([
      { slug: "later", publishedAt: "2026-09-09" },
      { slug: "z-tie", publishedAt: "2026-09-08" },
      { slug: "a-tie", publishedAt: "2026-09-08" },
    ]).map((article) => article.slug),
    ["later", "a-tie", "z-tie"],
  );
});

test("Guide routes use database summaries and full repository data for articles", async () => {
  const [index, client, articleRoute, redirects] = await Promise.all([
    read("../app/guides/page.tsx"),
    read("../app/guides/GuidesPageClient.tsx"),
    read("../app/guides/[slug]/page.tsx"),
    read("../next.config.ts"),
  ]);

  assert.match(index, /listPublishedGuideArticleSummaries/);
  assert.match(index, /GUIDE_CATEGORY_ORDER/);
  assert.doesNotMatch(client, /GUIDE_ARTICLES|BlogPreview|\.sections/);
  assert.match(client, /PAGE_SIZE/);
  assert.match(client, /article\.publishedAt/);
  assert.match(articleRoute, /getPublishedGuideArticle/);
  assert.match(articleRoute, /dynamic = "force-dynamic"/);
  assert.doesNotMatch(articleRoute, /dynamicParams\s*=\s*false|generateStaticParams/);
  assert.match(articleRoute, /canonical: new URL\(article\.path, SITE_URL\)/);
  assert.match(articleRoute, /datePublished: article\.publishedAt/);
  assert.match(articleRoute, /"@type": "Article"/);
  assert.doesNotMatch(articleRoute, /"@type": "FAQPage"/);
  assert.doesNotMatch(articleRoute, /"@type": "QAPage"/);
  assert.match(articleRoute, /article\.faq\.map/);
  assert.match(articleRoute, /section\.numberedList/);
  assert.match(articleRoute, /section\.table/);
  assert.match(articleRoute, /section\.subsections/);
  assert.match(articleRoute, /section\.template/);
  assert.doesNotMatch(articleRoute, /\/en\/blog|\/ru\/blog|hreflang|—/);

  assert.match(redirects, /source: "\/blog"[\s\S]*destination: "\/journal"[\s\S]*statusCode: 301/);

  assert.ok(GUIDE_ARTICLES.some((article) => article.sections.some((section) => ((section as GuideSection).subsections?.length ?? 0) > 0)));
  assert.ok(GUIDE_ARTICLES.some((article) => article.sections.some((section) => ((section as GuideSection).numberedList?.length ?? 0) > 0)));
  assert.ok(GUIDE_ARTICLES.some((article) => article.sections.some((section) => ((section as GuideSection).table?.rows.length ?? 0) > 0)));
  assert.ok(GUIDE_ARTICLES.some((article) => article.sections.some((section) => ((section as GuideSection).template?.content.length ?? 0) > 0)));
});

test("sitemap and IndexNow discover every Guide article without a manual article list", async () => {
  const [platform, sitemap, indexNow] = await Promise.all([
    read("../app/_seo/platform.ts"),
    read("../app/sitemap.ts"),
    read("../scripts/platform-indexnow-release.mjs"),
  ]);

  assert.match(platform, /"\/guides"/);
  assert.match(platform, /"\/journal"/);
  assert.doesNotMatch(platform, /"\/blog(?:\/|")/);
  for (const article of GUIDE_ARTICLES) assert.doesNotMatch(platform, new RegExp(article.slug));
  assert.match(sitemap, /listPublishedGuideSitemapEntries/);
  assert.match(sitemap, /guideEntries\.map\(\(article\)/);
  assert.match(sitemap, /article\.path/);
  assert.match(sitemap, /article\.publishedAt/);
  assert.doesNotMatch(sitemap, /\/blog/);
  assert.match(indexNow, /\/guides/);
  assert.match(indexNow, /lib\/seo\/guide-articles\.ts/);
  assert.match(indexNow, /articles-2026-09-12\.ts/);
  assert.doesNotMatch(indexNow, /\/blog/);
});

test("homepage uses Guides while navigation keeps both Journal and Guides", async () => {
  const [page, homeClient, preview, header, footer, translations, commonEn, commonRu] = await Promise.all([
    read("../app/page.tsx"),
    read("../app/HomePageClient.tsx"),
    read("../components/marketing/OneStudioGuidesPreview.tsx"),
    read("../components/marketing/MarketingHeader.tsx"),
    read("../components/marketing/OneStudioFooter.tsx"),
    read("../lib/i18n/index.ts"),
    read("../lib/i18n/locales/en/common.ts"),
    read("../lib/i18n/locales/ru/common.ts"),
  ]);

  assert.match(page, /listPublishedGuideArticleSummaries/);
  assert.match(page, /guideArticles\.slice\(0, 3\)/);
  assert.match(homeClient, /OneStudioGuidesPreview/);
  assert.match(preview, /articles\.slice\(0, 3\)/);
  assert.match(preview, /article\.publishedAt/);
  assert.match(preview, /href="\/guides"/);
  for (const article of GUIDE_ARTICLES) assert.doesNotMatch(preview, new RegExp(article.slug));
  assert.match(header, /href: "\/journal"/);
  assert.match(footer, /href: "\/journal"/);
  assert.match(header, /href: "\/guides"/);
  assert.match(footer, /href: "\/guides"/);
  assert.doesNotMatch(`${header}\n${footer}`, /href: "\/blog"/);
  assert.match(`${header}\n${footer}`, /footer\.links\.journal/);
  assert.doesNotMatch(translations, /locales\/.+\/blog|\bblog:/);
  assert.match(commonEn, /journal: "Journal"/);
  assert.match(commonRu, /journal: "Журнал"/);
});

test("existing Guide articles retain their useful internal links", () => {
  const bySlug = new Map(GUIDE_ARTICLES.map((article) => [article.slug, article]));
  assert.match(bySlug.get("how-online-booking-works-for-service-businesses")!.sections.flatMap((section) => section.paragraphs).join(" "), /\/features\/online-booking/);
  assert.match(bySlug.get("website-builder-with-crm-guide")!.sections.flatMap((section) => section.paragraphs).join(" "), /\/features\/crm/);
  assert.match(bySlug.get("beauty-salon-website-booking-guide")!.sections.flatMap((section) => section.paragraphs).join(" "), /\/solutions\/beauty-salon-website/);
});

test("first expanded Guides batch is registered with its approved primary categories", () => {
  const expectedBatch = [
    ["client-notes-examples-service-business", "CRM"],
    ["appointment-booking-form-template", "Booking"],
    ["client-database-template-service-business", "CRM"],
    ["appointment-reschedule-message-templates", "Booking"],
    ["client-reactivation-message-templates", "Marketing"],
  ] as const;
  for (const [slug, primaryCategory] of expectedBatch) {
    const article = getGuideArticle(slug);
    assert.ok(article, `missing ${slug}`);
    assert.equal(article.primaryCategory, primaryCategory);
    assert.equal(article.path, `/guides/${slug}`);
    assert.ok(article.sections.length >= 3);
  }
});

test("website copy, confirmation and mini-session Guides batch is registered", () => {
  const expectedBatch = [
    ["service-business-about-us-page-template", "Websites"],
    ["photography-mini-session-booking", "Booking"],
    ["booking-confirmation-page-checklist", "Booking"],
    ["service-business-homepage-copy-template", "Websites"],
    ["service-business-faq-page-template", "Websites"],
  ] as const;

  for (const [slug, primaryCategory] of expectedBatch) {
    const article = getGuideArticle(slug);
    assert.ok(article, `missing ${slug}`);
    assert.equal(article.primaryCategory, primaryCategory);
    assert.equal(article.path, `/guides/${slug}`);
    assert.ok(article.sections.length >= 3);
  }
});
