import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createPrivatePageMetadata } from "../app/_seo/site.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("canonical platform sitemap covers public marketing surface once", async () => {
  const [platform, sitemap] = await Promise.all([read("../app/_seo/platform.ts"), read("../app/sitemap.ts")]);
  for (const path of ["/", "/features", "/demos", "/components", "/pricing", "/website", "/about", "/faq", "/blog", "/contact"]) {
    assert.match(platform, new RegExp(`\"${path.replace("/", "\\/")}\"`));
  }
  assert.match(sitemap, /\.\.\.platformMarketingEntries\(\)/);
  assert.match(sitemap, /new Set\(/);
  assert.doesNotMatch(sitemap, /url: SITE_URL\.toString\(\)/);
  assert.doesNotMatch(sitemap.slice(sitemap.indexOf("function platformMarketingEntries"), sitemap.indexOf("function validDate")), /new Date\(\)/);
});

test("sitemap uses canonical demo catalogs and excludes new-site", async () => {
  const sitemap = await read("../app/sitemap.ts");
  assert.match(sitemap, /getPublicDemoTemplateChoices/);
  assert.match(sitemap, /gallery\.previewRoute/);
  assert.match(sitemap, /DEMOS\.map/);
  assert.doesNotMatch(sitemap, /[\"']\/new-site(?:[\"']|\/)/);
});

test("new-site is private and technical/custom sitemap branches remain", async () => {
  const [page, robots, sitemap] = await Promise.all([read("../app/new-site/page.tsx"), read("../app/robots.ts"), read("../app/sitemap.ts")]);
  assert.deepEqual(createPrivatePageMetadata("/new-site", "Create your OneStudio site").robots, { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } });
  assert.match(page, /createPrivatePageMetadata\("\/new-site"/);
  assert.doesNotMatch(robots, /new-site/);
  assert.match(sitemap, /isTechnicalPlatformHostname\(hostname\).*return \[\]/s);
  assert.match(sitemap, /customDomainEntries\(origin, resolution\.business_slug\)/);
});
