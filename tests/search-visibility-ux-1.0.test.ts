import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { activePublicDomain, publicSiteOrigin, sitemapEligiblePageCount } from "../lib/public-site/search-visibility.ts";

test("search visibility helpers resolve active custom domains and sitemap eligibility", () => {
  const domain = { domain: "tenant.example", status: "active", vercel_verified: true, dns_configured: true, ssl_ready: true } as any;
  assert.equal(activePublicDomain(domain), "tenant.example");
  assert.equal(publicSiteOrigin(domain), "https://tenant.example");
  assert.equal(sitemapEligiblePageCount({ seo_no_index: false, pages: [{ is_visible: true, seo_no_index: false }, { is_visible: false }, { is_visible: true, seo_no_index: true }] } as any), 2);
  assert.equal(sitemapEligiblePageCount({ seo_no_index: true, pages: [{ is_visible: true }] } as any), 0);
});

test("editor shares one positive indexing field, warns before hidden custom-domain publishing, and uses tenant URLs", async () => {
  const [page, dialog] = await Promise.all([
    readFile(new URL("../app/admin/site/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/admin/OneStudioSystemDialogs.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(page, /Разрешить поисковым системам индексировать сайт/);
  assert.match(page, /seo_no_index: !event\.target\.checked/);
  assert.match(page, /hasActiveCustomDomain && draft\?\.seo_no_index === true/);
  assert.match(page, /Опубликовать скрытым/);
  assert.match(page, /api\/client\/domains\?businessId=/);
  assert.match(dialog, /Разрешить индексацию главной страницы и сайта/);
  assert.match(dialog, /new URL\("\/sitemap\.xml", publicOrigin\)/);
  assert.match(dialog, /new URL\("\/robots\.txt", publicOrigin\)/);
  assert.doesNotMatch(`${page}\n${dialog}`, /cashpath\.org/);
});
