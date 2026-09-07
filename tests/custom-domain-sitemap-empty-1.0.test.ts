import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("sitemaps load the explicit published SEO locale for platform and custom domains", async () => {
  const sitemap = await readFile(
    new URL("../app/sitemap.ts", import.meta.url),
    "utf8",
  );

  const explicitLocaleCalls = sitemap.match(
    /getPublicSite\(entry\.business_slug, locale\)/g,
  );

  assert.equal(explicitLocaleCalls?.length, 2);
  assert.match(
    sitemap,
    /const locale = entry\.locale;\s*const pathLocale = entry\.is_primary \? null : locale;[\s\S]*?getPublicSite\(entry\.business_slug, locale\)/,
  );
  assert.doesNotMatch(sitemap, /entry\.is_primary \? null : entry\.locale/);
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
