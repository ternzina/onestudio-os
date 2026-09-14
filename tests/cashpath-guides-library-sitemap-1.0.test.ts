import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("CashPath adds its code-backed Guides hub to clean public sitemaps", () => {
  const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  assert.match(sitemap, /template_id === "cashpath"/);
  assert.match(sitemap, /cleanPublicPagePath\("guides", pathLocale, true\)/);
  assert.match(sitemap, /publicCustomPagePath\(entry\.business_slug, "guides", pathLocale\)/);
  assert.doesNotMatch(sitemap, /\/site\/cashpath-/);
});
