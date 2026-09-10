import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { common } from "../lib/i18n/locales/en/common.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");
const establishedTitles = {
  about: "About OneStudio",
  journal: "Journal",
  contact: "Contact",
  demos: "Templates",
  faq: "FAQ",
  features: "Features",
  components: "Components",
  pricing: "Pricing",
  website: "Turnkey website",
} as const;

test("SEO Marketing Title Brand Fix 4.0.1 applies one global brand suffix", async () => {
  const [platform, sitemap, indexnow, customDomain, tenantSeo] = await Promise.all([
    read("../app/_seo/platform.ts"),
    read("../app/sitemap.ts"),
    read("../lib/public-site/indexnow.ts"),
    read("../lib/public-site/metadata.ts"),
    read("../lib/public-site/premium-route-metadata.ts"),
  ]);

  assert.match(platform, /template: "%s \| OneStudio OS"/);
  for (const [key, title] of Object.entries(establishedTitles)) {
    assert.equal(common.metadata[key as keyof typeof establishedTitles].title, title);
    assert.doesNotMatch(title, /(?: -| \|) OneStudio(?: OS)?$/);
    assert.equal(`${title} | OneStudio OS`.match(/OneStudio OS/g)?.length, 1);
  }
  assert.equal(common.metadata.about.title, "About OneStudio");
  assert.equal(common.metadata.privacy.title, "Privacy Policy");
  assert.equal(common.metadata.terms.title, "Terms of Service");
  assert.match(sitemap, /PLATFORM_MARKETING_PATHS|platformMarketingEntries/);
  assert.match(indexnow, /submitIndexNow/);
  assert.match(customDomain, /canonical/);
  assert.match(tenantSeo, /canonical/);
  assert.doesNotMatch(JSON.stringify(establishedTitles), /\u2014/);
});
