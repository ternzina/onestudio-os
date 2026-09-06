import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
test("CashPath portfolio copy is complete for every Website locale", async () => {
  const cards = await readFile(new URL("../lib/site-content.ts", import.meta.url), "utf8");
  assert.match(cards, /key: "cashpath", name: "CashPath", url: "https:\/\/cashpath\.org\//);
  for (const locale of ["en", "ru", "uk", "pl", "de", "es", "fr", "pt"]) {
    const source = await readFile(new URL(`../lib/i18n/locales/${locale}/website.ts`, import.meta.url), "utf8");
    assert.match(source, /cashpath:\s*\{\s*projectType:.*cta:.*description:.*alt:/s, `${locale} contains full CashPath portfolio copy`);
  }
});

test("CashPath seed supplies branded SEO, page SEO, and stable LeadsGate defaults", async () => {
  const seed = await readFile(new URL("../lib/public-site/cashpath-premium-template-seed.ts", import.meta.url), "utf8");
  assert.match(seed, /favicon_url: "\/templates\/cashpath\/favicon\.svg"/);
  assert.match(seed, /seo_image_url: "\/templates\/cashpath\/hero-woman-wide-v2\.png"/);
  assert.match(seed, /seo_title: "CashPath \| Explore Personal Loan Options Online"/);
  for (const keyword of ["personal loan options", "online personal loan options", "personal loans online", "installment loan options", "loan request online", "compare loan offers", "emergency expense loan options", "personal loan marketplace"]) assert.match(seed, new RegExp(keyword));
  assert.equal((seed.match(/page\("/g) ?? []).length, 11);
  assert.equal((seed.match(/seoTitle: string, seoDescription: string/g) ?? []).length, 1);
  assert.match(seed, /leadsgate_aid: "4848"/);
  assert.match(seed, /leadsgate_template: "wallet-lines"/);
});

test("CashPath stays out of the public demo collection while its direct runtime is registered", async () => {
  const source = await readFile(new URL("../lib/public-site/premium-template-package-source.mjs", import.meta.url), "utf8");
  assert.match(source, /templateKey: "cashpath"[\s\S]*?collectionVisible: false[\s\S]*?route: "\/demos\/cashpath"/);
});

test("CashPath tenant 404 is branded, noindex, and avoids platform wording", async () => {
  const source = await readFile(new URL("../app/site/[businessSlug]/not-found.tsx", import.meta.url), "utf8");
  const branded = await readFile(new URL("../components/public/cashpath/CashPathNotFound.tsx", import.meta.url), "utf8");
  assert.match(source, /resolvePublicSiteDomain/);
  assert.match(source, /template_id === "cashpath"/);
  assert.match(source, /index: false, follow: false/);
  assert.match(branded, /CashPath/);
  assert.match(branded, /This path doesn/);
  assert.doesNotMatch(branded, /OneStudio|onestudioos\.com|Vercel|Supabase/);
});

test("shared custom-domain robots and sitemap retain the resolved domain origin", async () => {
  const robots = await readFile(new URL("../app/robots.ts", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  assert.match(robots, /new URL\("\/sitemap\.xml", origin\)/);
  assert.match(robots, /host: origin/);
  assert.match(sitemap, /customDomainEntries\(origin, resolution\.business_slug\)/);
  assert.match(sitemap, /cleanPublicPagePath/);
});

test("CashPath reveals respect reduced motion without changing LeadsGate mounting", async () => {
  const source = await readFile(new URL("../components/public/cashpath/CashPathSite.tsx", import.meta.url), "utf8");
  assert.match(source, /useReducedMotion/);
  assert.match(source, /initial=\{reducedMotion \? false/);
  assert.match(source, /distance: isMobile \? 40 : 64/);
  assert.match(source, /duration: isMobile \? 0\.8 : 1/);
  assert.match(source, /viewport=\{\{ once: true, amount: 0\.32 \}\}/);
  assert.match(source, /index \* 0\.1/);
  assert.match(source, /<CashPathReveal \{\.\.\.reveal\}><section id="request"/);
  assert.match(source, /leadsgate_form/);
  assert.match(source, /preview=\{site\.business\.id === "cashpath-demo"\}/);
});

test("CashPath has branded custom pages, a safe idempotent missing-page merge, and reachable site settings", async () => {
  const adapter = await readFile(new URL("../lib/public-site/cashpath-premium-template-custom-page-runtime-adapter.ts", import.meta.url), "utf8");
  const renderer = await readFile(new URL("../components/public/cashpath/CashPathCustomPage.tsx", import.meta.url), "utf8");
  const merge = await readFile(new URL("../lib/public-site/cashpath-pages.ts", import.meta.url), "utf8");
  const editor = await readFile(new URL("../app/admin/site/page.tsx", import.meta.url), "utf8");
  assert.match(adapter, /CashPathCustomPage/);
  assert.doesNotMatch(adapter, /PublicCustomPage/);
  assert.doesNotMatch(renderer, /OneStudio|Создано|Главная|Вернуться|Онлайн-запись/);
  assert.match(merge, /content\.template_id !== "cashpath"/);
  assert.match(merge, /!existing\.some\(\(current\) => current\.slug === page\.slug\)/);
  assert.match(merge, /terms-of-use.*e-consent.*advertiser-disclosure.*do-not-sell-share.*disclaimer/s);
  assert.match(editor, /Add missing CashPath pages/);
  assert.match(editor, /mergeMissingCashPathPages/);
  assert.match(editor, /label: "Настройки сайта"/);
  assert.match(editor, /setSiteSettingsOpen\(true\)/);
});

test("public-site page persistence uses a 200-page technical guardrail without truncation", async () => {
  const migration = await readFile(new URL("../supabase/migrations/20260906100000_public_site_page_seo_persistence_fix_1_0.sql", import.meta.url), "utf8");
  const editor = await readFile(new URL("../app/admin/site/page.tsx", import.meta.url), "utf8");
  assert.match(migration, /> 200/);
  assert.match(migration, /public_site_page_limit_exceeded/);
  assert.doesNotMatch(migration, /custom_count >= (?:32|200)/);
  assert.match(editor, /Сайт содержит слишком много страниц для одного сохранения\. Ничего не удалено\./);
});

test("terminal Site Settings wrapper preserves generic settings without bypassing the premium save chain", async () => {
  const migration = await readFile(new URL("../supabase/migrations/20260907010000_public_site_settings_terminal_persistence_1_1.sql", import.meta.url), "utf8");
  assert.match(migration, /rename to save_public_site_draft_v_site_settings_terminal_1_1/);
  assert.match(migration, /v_saved := public\.save_public_site_draft_v_site_settings_terminal_1_1\(/);
  assert.match(migration, /v_saved := coalesce\(v_saved, '\{\}'::jsonb\) \|\| jsonb_build_object\(/);
  for (const field of ["site_summary", "seo_keywords", "favicon_url", "show_social_icons", "social_links", "google_analytics_id", "meta_pixel_id"]) {
    assert.match(migration, new RegExp(`'${field}'`), `${field} is terminally persisted`);
    assert.match(migration, new RegExp(`v_source \\? '${field}'`), `${field} distinguishes absent from explicit clear`);
  }
  assert.match(migration, /normalize_public_site_media_url/);
  assert.match(migration, /normalize_public_site_social_links/);
  assert.match(migration, /\^G-\[A-Z0-9\]\{4,20\}\$/);
  assert.match(migration, /\^\[0-9\]\{5,32\}\$/);
  assert.match(migration, /update public\.public_site_locales[\s\S]*draft_content = v_saved/s);
});

test("CashPath settings, sparse pages, and publish contract retain meaningful saved content", async () => {
  const seed = await readFile(new URL("../lib/public-site/cashpath-premium-template-seed.ts", import.meta.url), "utf8");
  const migration = await readFile(new URL("../supabase/migrations/20260907010000_public_site_settings_terminal_persistence_1_1.sql", import.meta.url), "utf8");
  const publish = await readFile(new URL("../supabase/migrations/20260731191000_public_site_logo_draft_publish_hotfix.sql", import.meta.url), "utf8");
  const editor = await readFile(new URL("../app/admin/site/page.tsx", import.meta.url), "utf8");
  assert.match(seed, /seo_keywords: "personal loan options, online personal loan options/);
  assert.match(seed, /favicon_url: "\/templates\/cashpath\/favicon\.svg"/);
  assert.match(seed, /leadsgate_aid: "4848"/);
  assert.match(seed, /leadsgate_template: "wallet-lines"/);
  assert.match(migration, /when v_source \? 'favicon_url' then v_source->>'favicon_url'/);
  assert.match(migration, /when v_source \? 'social_links' then v_source->'social_links'/);
  assert.match(migration, /when v_source \? 'show_social_icons'/);
  assert.match(publish, /set published_content = draft_content/);
  assert.match(editor, /function normalizedPage\(/);
  assert.match(editor, /function normalizedPageBlock\(/);
  assert.match(editor, /function normalizedSocialLinks\(/);
  assert.match(editor, /seo_no_index: source\.seo_no_index === true/);
  assert.match(editor, /show_in_navigation: source\.show_in_navigation !== false/);
  assert.match(editor, /\(saved\?\.pages \?\? \[\]\)\.map\(normalizedPage\)/);
  assert.doesNotMatch(editor, /stableJsonSignature\(saved\?\.pages \?\? \[\]\) === stableJsonSignature\(draft\.pages \?\? \[\]\)/);
});
