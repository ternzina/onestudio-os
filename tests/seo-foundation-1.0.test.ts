import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createPrivatePageMetadata } from "../app/_seo/site.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("canonical platform sitemap covers the public marketing surface once", async () => {
  const [platform, sitemap] = await Promise.all([
    read("../app/_seo/platform.ts"),
    read("../app/sitemap.ts"),
  ]);
  const requiredPaths = [
    "/",
    "/features",
    "/demos",
    "/components",
    "/pricing",
    "/website",
    "/about",
    "/faq",
    "/blog",
    "/contact",
  ];

  for (const path of requiredPaths) assert.match(platform, new RegExp(`"${path.replace("/", "\\/")}"`));
  assert.match(sitemap, /\.\.\.platformMarketingEntries\(\)/);
  assert.match(sitemap, /new Set\(paths\)/);
  assert.doesNotMatch(sitemap, /url: SITE_URL\.toString\(\)/);
  const marketingSection = sitemap.slice(
    sitemap.indexOf("function platformMarketingEntries"),
    sitemap.indexOf("function validDate"),
  );
  assert.doesNotMatch(marketingSection, /new Date\(\)/);
});

test("sitemap includes public demos from canonical catalogs and excludes private routes", async () => {
  const sitemap = await read("../app/sitemap.ts");
  assert.match(sitemap, /getPublicDemoTemplateChoices/);
  assert.match(sitemap, /gallery\.previewRoute/);
  assert.match(sitemap, /DEMOS\.map/);
  for (const route of ["/new-site", "/configure", "/admin", "/dashboard", "/api", "/login", "/register", "/reset-password", "/auth", "/token"]) {
    assert.doesNotMatch(sitemap, new RegExp(`['\"]${route.replace("/", "\\/")}(?:['\"]|/)`));
  }
});

test("technical hosts remain empty and custom-domain sitemap behavior is preserved", async () => {
  const sitemap = await read("../app/sitemap.ts");
  assert.match(sitemap, /isTechnicalPlatformHostname\(hostname\)\) return \[\]/);
  assert.match(sitemap, /customDomainEntries\(origin, resolution\.business_slug\)/);
  assert.match(sitemap, /cleanPublicPagePath/);
  assert.match(sitemap, /publicSitePath\(entry\.business_slug, locale\)/);
  assert.match(sitemap, /lastModified,\n\s+changeFrequency/);
});

test("new-site metadata is noindex and Googlebot receives equivalent restrictions", () => {
  const metadata = createPrivatePageMetadata("/new-site", "Create your OneStudio site");
  assert.deepEqual(metadata.robots, {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  });
});

test("new-site exports private metadata without changing robots policy", async () => {
  const [page, robots] = await Promise.all([
    read("../app/new-site/page.tsx"),
    read("../app/robots.ts"),
  ]);
  assert.match(page, /createPrivatePageMetadata\("\/new-site"/);
  assert.doesNotMatch(robots, /new-site/);
});
