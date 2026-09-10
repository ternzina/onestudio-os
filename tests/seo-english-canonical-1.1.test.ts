import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("platform defaults to English while shared tenant default remains Russian", async () => {
  const [config, request, context, locale] = await Promise.all([read("../lib/i18n/config.ts"), read("../lib/seo/request.ts"), read("../lib/public-site/request-context.ts"), read("../lib/i18n/use-locale.ts")]);
  assert.match(config, /platformMarketingLocale[^\n]*= "en"/);
  assert.match(config, /defaultLocale[^\n]*= "ru"/);
  assert.match(request, /PLATFORM_MARKETING_LOCALE[^\n]*= "en"/);
  assert.match(context, /classifyHostname\(host\) === "tenant" \? requestHtmlLang\(headerStore\) : PLATFORM_MARKETING_LOCALE/);
  assert.match(locale, /useLocale\(initialLocale: Locale = platformMarketingLocale\)/);
  assert.match(locale, /localStorage\.(getItem|setItem)/);
});

test("marketing pages use English translations and self-referencing canonicals", async () => {
  const paths = ["features", "components", "pricing", "website", "about", "faq", "journal", "contact"];
  for (const path of paths) {
    const source = await read(`../app/${path}/page.tsx`);
    assert.match(source, /platformMarketingLocale/);
    assert.match(source, new RegExp(`canonical: \\"/${path}\\"`));
    assert.doesNotMatch(source, /canonical: [\"']\/[\"']/);
  }
  assert.match(await read("../app/_seo/platform.ts"), /locale: "en_US"/);
});
