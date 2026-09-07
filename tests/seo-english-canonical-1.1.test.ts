import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("canonical platform defaults to English without changing shared locale defaults", async () => {
  const [config, request, context, locale] = await Promise.all([
    read("../lib/i18n/config.ts"), read("../lib/seo/request.ts"),
    read("../lib/public-site/request-context.ts"), read("../lib/i18n/use-locale.ts"),
  ]);
  assert.match(config, /platformMarketingLocale[^\n]*= "en"/);
  assert.match(config, /defaultLocale[^\n]*= "ru"/);
  assert.match(request, /PLATFORM_MARKETING_LOCALE[^\n]*= "en"/);
  assert.match(request, /onestudioos\.com/);
  assert.match(context, /classifyHostname\(host\) === "tenant" \? requestHtmlLang\(headerStore\) : PLATFORM_MARKETING_LOCALE/);
  assert.match(locale, /useLocale\(initialLocale: Locale = platformMarketingLocale\)/);
  assert.match(locale, /localStorage\.getItem\(localeStorageKey\)/);
  assert.match(locale, /localStorage\.setItem\(localeStorageKey, nextLocale\)/);
});

test("platform metadata, HTML language, and route canonicals are English and self-referencing", async () => {
  const [platform, layout, translations, demosLayout, ...pages] = await Promise.all([
    read("../app/_seo/platform.ts"), read("../app/layout.tsx"), read("../lib/i18n/index.ts"), read("../app/demos/layout.tsx"),
    ...["features", "components", "pricing", "website", "about", "faq", "blog", "contact"].map((route) => read(`../app/${route}/page.tsx`)),
  ]);
  assert.match(platform, /locale: "en_US"/);
  assert.match(platform, /inLanguage: \["en", "ru"\]/);
  assert.match(layout, /<html lang=\{lang\}/);
  assert.match(translations, /en:/);
  assert.match(demosLayout, /path: "\/demos"/);
  assert.doesNotMatch(demosLayout, /path: "\/"/);
  for (const [route, source] of pages.entries()) {
    const name = ["features", "components", "pricing", "website", "about", "faq", "blog", "contact"][route];
    assert.match(source, new RegExp(`canonical: "\\/${name}"`));
    assert.doesNotMatch(source, /canonical: "\/"/);
  }
});

test("marketing URL model has no language routes or hreflang and preserves tenant SEO isolation", async () => {
  const [platform, layout, metadata, sitemap, tenantRequest] = await Promise.all([
    read("../app/_seo/platform.ts"), read("../app/layout.tsx"), read("../lib/public-site/metadata.ts"),
    read("../app/sitemap.ts"), read("../tests/tenant-seo-isolation.test.ts"),
  ]);
  assert.doesNotMatch(platform, /hreflang|languages/);
  assert.doesNotMatch(layout, /['"]\/(?:ru|en)(?:['"]|\/)/);
  assert.doesNotMatch(metadata, /platformMarketingLocale|PLATFORM_MARKETING_LOCALE/);
  assert.match(tenantRequest, /custom-domain|tenant/);
  assert.match(sitemap, /platformMarketingEntries/);
  assert.match(sitemap, /isTechnicalPlatformHostname\(hostname\)\) return \[\]/);
});
