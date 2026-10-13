import assert from "node:assert/strict";
import test from "node:test";
import { createDemoMetadata, LOCALIZED_DEMOS, LOCALIZED_DEMO_PATHS } from "../lib/seo/demo-metadata.ts";
import { createDemoPageMetadata, demoPagePaths, resolveDemoPage } from "../lib/seo/demo-pages.ts";
import { publicDemoPaths } from "../lib/seo/demo-sitemap.ts";
import { createCanonicalVowDemoSite, vowDemoBasePath } from "../lib/public-site/vow-demo.ts";
import { createCanonicalGlossDemoSite, GLOSS_DEMO_BASE_PATH } from "../lib/public-site/gloss-demo.ts";
import { createCanonicalVeloraDemoSite, veloraDemoBasePath } from "../lib/public-site/velora-demo.ts";

test("each translated demo has its own indexable canonical and reciprocal language alternates", () => {
  const canonicals = new Set<string>();
  const titles = new Set<string>();
  for (const slug of Object.keys(LOCALIZED_DEMOS) as (keyof typeof LOCALIZED_DEMOS)[]) {
    for (const locale of ["ru", "en"] as const) {
      const metadata = createDemoMetadata(slug, locale);
      const expected = `/demos/${slug}${locale === "en" ? "/en" : ""}`;
      assert.equal(metadata.alternates?.canonical, expected);
      assert.deepEqual(metadata.robots, { index: true, follow: true });
      assert.equal(metadata.alternates?.languages?.ru, `/demos/${slug}`);
      assert.equal(metadata.alternates?.languages?.en, `/demos/${slug}/en`);
      assert.equal(metadata.openGraph?.url, expected);
      assert.ok(LOCALIZED_DEMO_PATHS.includes(expected));
      assert.match(String(metadata.description), /OneStudio OS/);
      canonicals.add(expected);
      titles.add(String(metadata.title));
    }
  }
  assert.equal(canonicals.size, 16);
  assert.equal(titles.size, 16);
  assert.equal(new Set(LOCALIZED_DEMO_PATHS).size, 16);
});

test("linked VOW and GLOSS pages resolve with self-canonicals and are submitted in the public sitemap inventory", () => {
  const paths = publicDemoPaths();
  for (const locale of ["ru", "en"] as const) {
    const site = createCanonicalVowDemoSite(locale);
    for (const slug of ["films", "packages"]) {
      const page = resolveDemoPage(site, [slug]);
      assert.ok(page);
      assert.equal(resolveDemoPage(site, ["p", slug]), page);
      assert.equal(resolveDemoPage(site, ["p", slug, "extra"]), undefined);
      const metadata = createDemoPageMetadata(site, page, vowDemoBasePath(locale), { ru: vowDemoBasePath("ru"), en: vowDemoBasePath("en") });
      assert.equal(metadata.alternates?.canonical, `${vowDemoBasePath(locale)}/${slug}`);
      assert.equal(metadata.alternates?.languages?.en, `${vowDemoBasePath("en")}/${slug}`);
      assert.equal(metadata.alternates?.languages?.ru, `${vowDemoBasePath("ru")}/${slug}`);
      assert.deepEqual(metadata.robots, { index: true, follow: true });
      assert.ok(paths.includes(String(metadata.alternates?.canonical)));
    }
    for (const path of demoPagePaths(createCanonicalVeloraDemoSite(locale), veloraDemoBasePath(locale))) assert.ok(paths.includes(path));
  }
  const gloss = createCanonicalGlossDemoSite();
  const portfolio = resolveDemoPage(gloss, ["portfolio"]);
  assert.equal(portfolio?.type, "portfolio");
  assert.ok(portfolio);
  assert.ok(gloss.portfolio.length > 0);
  assert.equal(createDemoPageMetadata(gloss, portfolio, GLOSS_DEMO_BASE_PATH).alternates?.canonical, `${GLOSS_DEMO_BASE_PATH}/portfolio`);
  assert.ok(paths.includes(`${GLOSS_DEMO_BASE_PATH}/portfolio`));
  assert.ok(!paths.includes("/demos/cashpath"));
  assert.ok(!paths.includes("/demos/premium-kids-center"));
  assert.equal(paths.length, new Set(paths).size);
});

test("hidden and noindex demo content never enters the public sitemap", () => {
  const site = createCanonicalVowDemoSite();
  site.content.pages![0].is_visible = false;
  site.content.pages![1].seo_no_index = true;
  assert.equal(resolveDemoPage(site, ["films"]), undefined);
  assert.equal(resolveDemoPage(site, ["missing"]), undefined);
  assert.deepEqual(demoPagePaths(site, vowDemoBasePath("ru")), []);
  const page = resolveDemoPage(site, ["packages"]);
  assert.ok(page);
  assert.deepEqual(createDemoPageMetadata(site, page, vowDemoBasePath("ru")).robots, { index: false, follow: true });
  const privateSite = createCanonicalGlossDemoSite();
  privateSite.content.seo_no_index = true;
  assert.deepEqual(demoPagePaths(privateSite, GLOSS_DEMO_BASE_PATH), []);
});
