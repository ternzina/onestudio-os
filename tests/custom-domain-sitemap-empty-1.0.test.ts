import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("sitemaps load the explicit published SEO locale for platform and custom domains", async () => {
  const sitemap = await readFile(
    new URL("../app/sitemap.ts", import.meta.url),
    "utf8",
  );

  const explicitLocaleCalls = sitemap.match(
    /getFreshPublicSite\(entry\.business_slug, locale\)/g,
  );

  assert.equal(explicitLocaleCalls?.length, 2);
  assert.match(
    sitemap,
    /const locale = entry\.locale;\s*const pathLocale = entry\.is_primary \? null : locale;[\s\S]*?getFreshPublicSite\(entry\.business_slug, locale\)/,
  );
  assert.doesNotMatch(sitemap, /entry\.is_primary \? null : entry\.locale/);
});

test("sitemaps use the uncached published-site fetch while normal public rendering remains cached", async () => {
  const data = await readFile(
    new URL("../lib/public-site/data.ts", import.meta.url),
    "utf8",
  );
  const sitemap = await readFile(
    new URL("../app/sitemap.ts", import.meta.url),
    "utf8",
  );

  assert.match(data, /export const getPublicSite = cache\(fetchPublicSite\)/);
  assert.match(data, /export const getFreshPublicSite = fetchPublicSite/);
  assert.match(sitemap, /getFreshPublicSite/);
  assert.match(sitemap, /entry\.seo_no_index === true/);
  assert.doesNotMatch(sitemap, /console\.info\("custom_domain_sitemap_entry"/);
});

test("custom-domain sitemap keeps the resolved origin and clean public page paths", async () => {
  const sitemap = await readFile(
    new URL("../app/sitemap.ts", import.meta.url),
    "utf8",
  );
  const robots = await readFile(
    new URL("../app/robots.ts", import.meta.url),
    "utf8",
  );

  assert.match(sitemap, /customDomainEntries\(origin, resolution\.business_slug\)/);
  assert.match(sitemap, /cleanPublicSitePath\(pathLocale\), origin/);
  assert.match(sitemap, /cleanPublicPagePath\(/);
  assert.match(robots, /new URL\("\/sitemap\.xml", origin\)/);
});

test("published SEO-path registry exposes locale-level sitemap indexability", async () => {
  const migration = await readFile(
    new URL(
      "../supabase/migrations/20260907190000_public_site_sitemap_indexability_1_0.sql",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(migration, /seo_no_index boolean/);
  assert.match(
    migration,
    /coalesce\(\(locale_data\.published_content->>'seo_no_index'\)::boolean, false\)/,
  );
  assert.match(migration, /drop function if exists public\.list_public_site_seo_paths\(text\)/);
});
