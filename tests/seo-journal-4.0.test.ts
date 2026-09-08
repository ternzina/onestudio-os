import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JOURNAL_ARTICLES } from "../lib/seo/journal-articles.ts";

test("SEO Journal 4.0 exposes exactly three canonical English articles", async () => {
  assert.deepEqual(JOURNAL_ARTICLES.map((article) => article.slug), ["how-online-booking-works-for-service-businesses", "website-builder-with-crm-guide", "beauty-salon-website-booking-guide"]);
  assert.equal(new Set(JOURNAL_ARTICLES.map((article) => article.title)).size, 3);
  for (const article of JOURNAL_ARTICLES) { assert.doesNotMatch(article.title, /\|\s*OneStudio OS/); assert.equal(article.path, `/blog/${article.slug}`); }
  const [route, blog, platform] = await Promise.all([readFile(new URL("../app/blog/[slug]/page.tsx", import.meta.url), "utf8"), readFile(new URL("../app/blog/BlogPageClient.tsx", import.meta.url), "utf8"), readFile(new URL("../app/_seo/platform.ts", import.meta.url), "utf8")]);
  assert.match(route, /generateStaticParams/); assert.match(route, /canonical/); assert.match(route, /index: true, follow: true/);
  assert.match(blog, /JOURNAL_ARTICLES/);
  for (const article of JOURNAL_ARTICLES) { assert.equal((platform.match(new RegExp(article.path.replaceAll("/", "\\/"), "g")) ?? []).length, 1); }
  assert.doesNotMatch(route, /\/en\/blog|\/ru\/blog|hreflang|—/);
  assert.match(JOURNAL_ARTICLES[0].sections.flatMap((section) => section.paragraphs).join(" "), /\/features\/online-booking/);
  assert.match(JOURNAL_ARTICLES[1].sections.flatMap((section) => section.paragraphs).join(" "), /\/features\/crm/);
  assert.match(JOURNAL_ARTICLES[2].sections.flatMap((section) => section.paragraphs).join(" "), /\/solutions\/beauty-salon-website/);
});
