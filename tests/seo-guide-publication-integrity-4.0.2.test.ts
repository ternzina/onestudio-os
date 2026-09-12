import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { SITE_URL } from "../app/_seo/site.ts";
import { DEMOS, PREMIUM_DEMOS } from "../lib/demo-catalog.ts";
import {
  GUIDE_ARTICLES,
  GUIDE_CATEGORY_ORDER,
  type GuideArticle,
} from "../lib/seo/guide-articles.ts";
import { FEATURE_PATHS } from "../lib/seo/features.ts";
import { SOLUTION_PATHS } from "../lib/seo/solutions.ts";

const platformSource = readFileSync(
  new URL("../app/_seo/platform.ts", import.meta.url),
  "utf8",
);

const platformMarker = 'export const PLATFORM_MARKETING_PATHS = [';
const platformStart = platformSource.indexOf(platformMarker);
const platformEnd = platformSource.indexOf("] as const;", platformStart);

assert.ok(
  platformStart >= 0 && platformEnd > platformStart,
  "PLATFORM_MARKETING_PATHS block not found",
);

const platformBlock = platformSource.slice(
  platformStart + platformMarker.length,
  platformEnd,
);

const PLATFORM_MARKETING_PATHS = [
  ...platformBlock.matchAll(/"([^"]+)"/g),
].map((match) => match[1]!);

const EXPLICIT_RESOLVABLE_PATHS = ["/new-site", "/privacy", "/terms"] as const;

function normalizePath(path: string) {
  if (path === "/") return path;
  return path.replace(/\/+$/, "");
}

const RESOLVABLE_INTERNAL_PATHS = new Set(
  [
    ...PLATFORM_MARKETING_PATHS,
    ...FEATURE_PATHS,
    ...SOLUTION_PATHS,
    ...GUIDE_ARTICLES.map((article) => article.path),
    ...DEMOS.map((demo) => `/demos/${demo.slug}`),
    ...PREMIUM_DEMOS.map((demo) => demo.href),
    ...EXPLICIT_RESOLVABLE_PATHS,
  ].map(normalizePath),
);

function renderedInlineStrings(article: GuideArticle) {
  const values: string[] = [];

  for (const section of article.sections) {
    values.push(...section.paragraphs);
    values.push(...(section.checklist ?? []));
    values.push(...(section.list ?? []));
    values.push(...(section.numberedList ?? []));

    for (const subsection of section.subsections ?? []) {
      values.push(...(subsection.paragraphs ?? []));
      values.push(...(subsection.list ?? []));
      values.push(...(subsection.numberedList ?? []));
    }

    if (section.table) {
      values.push(...section.table.headers);
      for (const row of section.table.rows) values.push(...row);
    }
  }

  return values;
}

function inlineHrefs(value: string) {
  const hrefs: string[] = [];
  const pattern = /\[\[[^|\]]+\|([^\]]+)\]\]/g;

  for (const match of value.matchAll(pattern)) hrefs.push(match[1]);
  return hrefs;
}

function articleHrefs(article: GuideArticle) {
  return [
    ...article.relatedLinks.map((link) => link.href),
    ...article.sections.flatMap((section) => (section.links ?? []).map((link) => link.href)),
    ...renderedInlineStrings(article).flatMap(inlineHrefs),
  ];
}

function internalPathFromHref(href: string, slug: string) {
  assert.equal(href, href.trim(), `${slug}: link href must not contain surrounding whitespace: ${JSON.stringify(href)}`);
  assert.ok(href.length > 0, `${slug}: link href must not be empty`);

  if (href.startsWith("/")) {
    assert.ok(!href.startsWith("//"), `${slug}: protocol-relative links are not allowed: ${href}`);
    return normalizePath(new URL(href, SITE_URL).pathname);
  }

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    assert.fail(`${slug}: link must be root-relative or an absolute external URL: ${href}`);
  }

  assert.ok(
    ["http:", "https:", "mailto:"].includes(url.protocol),
    `${slug}: unsupported link protocol ${url.protocol} in ${href}`,
  );

  if (url.hostname === SITE_URL.hostname || url.hostname === `www.${SITE_URL.hostname}`) {
    assert.fail(`${slug}: same-origin OneStudio links must be root-relative: ${href}`);
  }

  return null;
}

function assertPublishedDate(article: GuideArticle) {
  assert.match(article.publishedAt, /^\d{4}-\d{2}-\d{2}$/, `${article.slug}: publishedAt must be YYYY-MM-DD`);

  const parsed = new Date(`${article.publishedAt}T00:00:00.000Z`);
  assert.ok(!Number.isNaN(parsed.getTime()), `${article.slug}: publishedAt is not a real calendar date`);
  assert.equal(
    parsed.toISOString().slice(0, 10),
    article.publishedAt,
    `${article.slug}: publishedAt is not a real calendar date`,
  );

  const today = new Date().toISOString().slice(0, 10);
  assert.ok(article.publishedAt <= today, `${article.slug}: publishedAt cannot be in the future (${article.publishedAt})`);
}

test("Guide publication metadata stays canonical, distinct, and publishable", () => {
  const uniqueFields = {
    slug: GUIDE_ARTICLES.map((article) => article.slug),
    path: GUIDE_ARTICLES.map((article) => article.path),
    title: GUIDE_ARTICLES.map((article) => article.title.trim().toLowerCase()),
    h1: GUIDE_ARTICLES.map((article) => article.h1.trim().toLowerCase()),
    description: GUIDE_ARTICLES.map((article) => article.description.trim().toLowerCase()),
    searchIntent: GUIDE_ARTICLES.map((article) => article.searchIntent.trim().toLowerCase()),
  };

  for (const [field, values] of Object.entries(uniqueFields)) {
    assert.equal(new Set(values).size, values.length, `Guide ${field} values must be unique`);
  }

  for (const article of GUIDE_ARTICLES) {
    assert.match(article.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${article.slug}: slug must be lowercase kebab-case`);
    assert.equal(article.path, `/guides/${article.slug}`);
    assert.doesNotMatch(article.path, /\/blog(?:\/|$)|\/help(?:\/|$)/);
    assert.doesNotMatch(article.title, /\|\s*OneStudio OS/i);
    assert.ok(article.h1.trim().length > 0, `${article.slug}: h1 must not be empty`);
    assert.ok(article.description.trim().length > 0, `${article.slug}: description must not be empty`);
    assert.ok(article.excerpt.trim().length > 0, `${article.slug}: excerpt must not be empty`);
    assert.ok(article.searchIntent.trim().length > 0, `${article.slug}: searchIntent must not be empty`);
    assertPublishedDate(article);

    assert.ok(GUIDE_CATEGORY_ORDER.includes(article.primaryCategory), `${article.slug}: invalid primaryCategory`);
    assert.ok(article.topics?.length, `${article.slug}: topics are required for publication`);
    assert.ok(
      (article.topics as readonly string[] | undefined)?.includes(article.primaryCategory),
      `${article.slug}: topics must include primaryCategory`,
    );
    assert.equal(new Set(article.topics).size, article.topics!.length, `${article.slug}: topics must not repeat`);
    for (const topic of article.topics!) {
      assert.ok(GUIDE_CATEGORY_ORDER.includes(topic), `${article.slug}: invalid topic ${topic}`);
    }

    assert.ok(article.sections.length > 0, `${article.slug}: at least one content section is required`);
    assert.equal(
      new Set(article.sections.map((section) => section.title.trim().toLowerCase())).size,
      article.sections.length,
      `${article.slug}: section titles must be unique`,
    );
    for (const section of article.sections) {
      assert.ok(section.title.trim().length > 0, `${article.slug}: section title must not be empty`);
      assert.ok(section.paragraphs.length > 0, `${article.slug}/${section.title}: paragraphs are required`);
      for (const paragraph of section.paragraphs) {
        assert.ok(paragraph.trim().length > 0, `${article.slug}/${section.title}: paragraph must not be empty`);
      }
    }

    assert.ok(article.relatedLinks.length > 0, `${article.slug}: at least one related internal link is required`);
  }
});

test("Guide links resolve against the current canonical OneStudio publication graph", () => {
  for (const article of GUIDE_ARTICLES) {
    const hrefs = articleHrefs(article);
    assert.ok(hrefs.length > 0, `${article.slug}: no links were found`);

    for (const href of hrefs) {
      const internalPath = internalPathFromHref(href, article.slug);
      if (!internalPath) continue;

      assert.doesNotMatch(internalPath, /^\/(?:blog|help)(?:\/|$)/, `${article.slug}: retired/unpublished path ${internalPath}`);
      assert.ok(
        RESOLVABLE_INTERNAL_PATHS.has(internalPath),
        `${article.slug}: unresolved same-origin link ${internalPath}. Add the route in the same branch or link only to an existing canonical path.`,
      );
    }
  }
});
