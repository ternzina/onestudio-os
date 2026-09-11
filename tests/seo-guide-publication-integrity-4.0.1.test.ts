import assert from "node:assert/strict";
import test from "node:test";
import { GUIDE_ARTICLES, GUIDE_CATEGORY_ORDER } from "../lib/seo/guide-articles.ts";
import type { GuideArticle } from "../lib/guides/types.ts";

const today = new Date().toISOString().slice(0, 10);
const unique = (values: readonly string[], name: string) => assert.equal(new Set(values).size, values.length, `duplicate Guide ${name}`);
const inlineHrefs = (value: string) => [...value.matchAll(/\[\[[^|\]]+\|([^\]]+)\]\]/g)].map((match) => match[1]);

function articleStrings(article: GuideArticle) {
  return [
    article.title, article.h1, article.description, article.excerpt, article.searchIntent,
    ...article.sections.flatMap((section) => [
      section.title, ...section.paragraphs, ...(section.checklist ?? []), ...(section.list ?? []), ...(section.numberedList ?? []),
      ...(section.subsections?.flatMap((subsection) => [subsection.title, ...(subsection.paragraphs ?? []), ...(subsection.list ?? []), ...(subsection.numberedList ?? [])]) ?? []),
      ...(section.table ? [section.table.caption ?? "", ...section.table.headers, ...section.table.rows.flat()] : []),
      ...(section.template ? [section.template.label ?? "", section.template.content] : []),
    ]),
    ...(article.faq?.flatMap((item) => [item.question, item.answer]) ?? []),
  ];
}

test("Guide publication integrity: identities, taxonomy, dates and public content", () => {
  unique(GUIDE_ARTICLES.map((article) => article.slug), "slug");
  unique(GUIDE_ARTICLES.map((article) => article.path), "path");
  unique(GUIDE_ARTICLES.map((article) => article.title), "title");
  unique(GUIDE_ARTICLES.map((article) => article.h1), "H1");
  unique(GUIDE_ARTICLES.map((article) => article.description), "description");
  unique(GUIDE_ARTICLES.map((article) => article.searchIntent.trim().toLowerCase()), "search intent");

  for (const article of GUIDE_ARTICLES as readonly GuideArticle[]) {
    assert.match(article.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(article.path, `/guides/${article.slug}`);
    assert.equal(article.path.includes("/blog"), false);
    assert.equal(article.path.includes("/help"), false);
    assert.ok(article.h1.trim() && article.description.trim() && article.excerpt.trim() && article.searchIntent.trim());
    assert.ok((GUIDE_CATEGORY_ORDER as readonly string[]).includes(article.primaryCategory));
    assert.ok(article.topics?.includes(article.primaryCategory));
    assert.ok(article.topics && new Set(article.topics).size === article.topics.length);
    assert.ok(article.sections.length > 0 && article.relatedLinks.length > 0);
    unique(article.sections.map((section) => section.title), `${article.slug} section title`);
    for (const section of article.sections) assert.ok(section.paragraphs.some((paragraph) => paragraph.trim()));
    assert.match(article.publishedAt, /^\d{4}-\d{2}-\d{2}$/);
    const parsed = new Date(`${article.publishedAt}T00:00:00.000Z`);
    assert.equal(parsed.toISOString().slice(0, 10), article.publishedAt, `${article.slug} has an invalid date`);
    assert.ok(article.publishedAt <= today, `${article.slug} has a future publication date`);
    const publicCopy = articleStrings(article).join("\n");
    if (article.publishedAt === "2026-09-11") {
      assert.doesNotMatch(publicCopy, /Research notes - not for publication|Fresh SERP checks|Semrush API|QA PASS|Ready to Publish/i);
    }
    assert.doesNotMatch(publicCopy, /\/blog\/|\/help\//);
  }
});

test("Guide publication integrity: every emitted same-origin link resolves", () => {
  // The platform routes Guide content is allowed to emit. Guide paths are dynamic
  // because the canonical registry is itself the source of published Guide routes.
  const routes = new Set<string>([
    "/", "/features", "/features/online-booking", "/features/crm", "/solutions", "/solutions/beauty-salon-website", "/solutions/pet-grooming-website", "/solutions/pilates-studio-website", "/pricing",
    "/demos", "/demos/lumea-beauty", "/new-site", "/privacy", "/terms",
    ...GUIDE_ARTICLES.map((article) => article.path),
  ]);
  for (const article of GUIDE_ARTICLES as readonly GuideArticle[]) {
    const links = [
      ...articleStrings(article).flatMap(inlineHrefs),
      ...article.sections.flatMap((section) => section.links?.map((link) => link.href) ?? []),
      ...article.relatedLinks.map((link) => link.href),
    ];
    for (const href of links) {
      assert.equal(href.startsWith("//"), false, `${article.slug} has protocol-relative link ${href}`);
      if (/^(https?:|mailto:)/.test(href)) {
        assert.equal(href.startsWith("https://onestudioos.com/"), false, `${article.slug} must use root-relative internal links`);
        continue;
      }
      assert.ok(href.startsWith("/"), `${article.slug} has malformed internal link ${href}`);
      assert.equal(href.startsWith("/blog") || href.startsWith("/help"), false, `${article.slug} leaks retired route ${href}`);
      assert.ok(routes.has(href), `${article.slug} links to unresolved route ${href}`);
    }
  }
});

test("batch one records preserve approved claim and compliance boundaries", () => {
  const bySlug = new Map<string, GuideArticle>((GUIDE_ARTICLES as readonly GuideArticle[]).map((article) => [article.slug, article]));
  const expected = [
    ["client-notes-examples-service-business", "CRM"], ["appointment-booking-form-template", "Booking"],
    ["client-database-template-service-business", "CRM"], ["appointment-reschedule-message-templates", "Booking"],
    ["client-reactivation-message-templates", "Marketing"],
  ] as const;
  for (const [slug, category] of expected) {
    const article = bySlug.get(slug);
    assert.ok(article, `missing ${slug}`);
    assert.equal(article.primaryCategory, category);
    assert.equal(article.path, `/guides/${slug}`);
    assert.ok(article.sections.length >= 3);
  }
  const booking = articleStrings(bySlug.get("appointment-booking-form-template")!).join(" ");
  assert.doesNotMatch(booking, /OneStudio .*arbitrary custom-field builder/i);
  const reschedule = articleStrings(bySlug.get("appointment-reschedule-message-templates")!).join(" ");
  assert.doesNotMatch(reschedule, /OneStudio automatically sends reschedule/i);
  const reactivation = articleStrings(bySlug.get("client-reactivation-message-templates")!).join(" ");
  assert.match(reactivation, /opt.?out|permission/i);
  assert.doesNotMatch(reactivation, /OneStudio (?:automatically runs|has) .*?(?:win-back|lapsed-client)/i);
});
