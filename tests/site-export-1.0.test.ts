import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildSiteExport } from "../lib/site-export/assemble.ts";
import { assertCanonicalOrigin } from "../lib/site-export/snapshot.ts";
import { createCashPathPremiumTemplateSeed } from "../lib/public-site/cashpath-premium-template-seed.ts";
import { cashPathPublicHomeSite } from "../lib/public-site/cashpath-public-payload.ts";
import type { PublicSiteData } from "../lib/public-site/types.ts";

function siteFrom(content: PublicSiteData["content"], extras: Partial<PublicSiteData> = {}): PublicSiteData {
  return {
    business: { id: "biz", slug: "example", name: "Example", locale: "en", primary_locale: "en", currency: "USD", timezone: "UTC" },
    content,
    company: { display_name: "Example" },
    services: [],
    portfolio: [],
    capabilities: { booking: false, catalog: false, portfolio: false },
    available_locales: ["en"],
    published_at: null,
    ...extras,
  };
}

test("canonical origin rejects platform and preview hosts", () => {
  assert.equal(assertCanonicalOrigin("https://cashpath.org/"), "https://cashpath.org");
  assert.throws(() => assertCanonicalOrigin("https://onestudioos.com"), /OneStudio OS/);
  assert.throws(() => assertCanonicalOrigin("https://demo.vercel.app"), /Vercel/);
  assert.throws(() => assertCanonicalOrigin("http://cashpath.org"), /https/);
});

test("export strips secret-like fields and warns about studio booking", async () => {
  const content = {
    template_id: "generic",
    brand_name: "Example",
    hero_title: "Hello",
    hero_text: "A public sentence",
    seo_title: "Example",
    seo_description: "Description",
    show_booking: true,
    service_role: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature",
    pages: [{ id: "about", type: "custom", slug: "about", nav_label: "About", title: "About", intro: "Intro", is_visible: true, show_in_navigation: true, show_booking_cta: false, blocks: [] }],
  } as unknown as PublicSiteData["content"];
  const exported = await buildSiteExport(siteFrom(content), "static", {
    canonicalOrigin: "https://example.com",
    projectRoot: process.cwd(),
  });
  const joined = exported.files.map((file) => Buffer.isBuffer(file.body) ? "" : file.body).join("\n");
  assert.equal(joined.includes("eyJhbGciOiJIUzI1Ni"), false);
  assert.equal(joined.includes("supabase.co"), false);
  assert.equal(exported.snapshot.warnings.some((item) => item.code === "booking_omitted" && item.blocksStatic), true);
  assert.match(joined, /https:\/\/example\.com\/p\/about/);
});

test("CashPath export keeps URLs, SEO, guides, and drops the shared article corpus from the homepage", async () => {
  const content = createCashPathPremiumTemplateSeed();
  (content as { service_role?: string }).service_role = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature";
  const exported = await buildSiteExport(siteFrom(content, {
    business: { id: "cashpath-909c00c9", slug: "cashpath-909c00c9", name: "CashPath", locale: "en", primary_locale: "en", currency: "USD", timezone: "America/New_York" },
    company: { display_name: "CashPath", email: "contact@cashpath.org" },
  }), "next", { canonicalOrigin: "https://cashpath.org", projectRoot: process.cwd() });
  const text = (filePath: string) => {
    const file = exported.files.find((item) => item.path === filePath);
    assert.ok(file, filePath);
    return Buffer.isBuffer(file.body) ? file.body.toString("utf8") : file.body;
  };
  const home = text("data/site.json");
  assert.equal(home.includes("Appliance Financing"), false);
  assert.match(home, /"aid":"4848"/);
  assert.equal(home.includes("eyJhbGciOiJIUzI1Ni"), false);
  const about = text("data/pages/about.json");
  assert.match(about, /CashPath/);
  assert.equal(about.includes("supabase"), false);
  const guideFiles = exported.files.filter((file) => file.path.startsWith("data/pages/") && file.path.endsWith(".json"));
  assert.ok(guideFiles.length >= 89);
  const sitemap = text("data/sitemap.json");
  assert.match(sitemap, /https:\/\/cashpath\.org\/p\/guides/);
  assert.match(sitemap, /https:\/\/cashpath\.org\/p\/loan-comparison-worksheet/);
  assert.equal(sitemap.includes("onestudioos.com"), false);
  const form = text("components/LeadsGateForm.tsx");
  assert.match(form, /apichannels\.com\/form\/applicationInit\.js/);
  assert.match(form, /className="short-form"/);
  assert.doesNotMatch(form, /onestudio|supabase|\/api\/public/);
  assert.match(text("components/HomePage.tsx"), /form-kicker/);
  assert.match(text("app/globals.css"), /\.short-form button,\[data-short-form\] button\{[^}]*background:#187c6a/);
  assert.match(text("app/globals.css"), /grid-template-columns:1fr 1fr/);
  assert.match(home, /REQUEST OPTIONS/);
  assert.match(home, /Start your request/);
  const notes = text("EXPORT-NOTES.md");
  assert.match(notes, /DNS/);
  assert.match(text(".env.example"), /LEADSGATE_AID=/);
  assert.equal(exported.files.some((file) => file.path === ".env"), false);
});

test("CashPath public home payload omits guide bodies", () => {
  const content = createCashPathPremiumTemplateSeed();
  const full = siteFrom(content);
  const slim = cashPathPublicHomeSite(full);
  assert.equal(slim.content.pages?.length, 0);
  assert.ok((full.content.pages?.length ?? 0) > 80);
  assert.equal(JSON.stringify(slim).includes("Appliance Financing"), false);
});

test("published SEO replaces the repository seed and private company email stays out", async () => {
  const content = createCashPathPremiumTemplateSeed();
  const about = content.pages?.find((page) => page.slug === "about");
  assert.ok(about);
  about.seo_description = "Published description that is not the seed.";
  about.seo_title = `${"Published title ".repeat(6)}end`.slice(0, 70);
  const exported = await buildSiteExport(siteFrom(content, {
    company: { display_name: "CashPath", email: "hidden-person@example.com", phone: "+1-555-0100" },
  }), "next", { canonicalOrigin: "https://cashpath.org", projectRoot: process.cwd() });
  const text = (filePath: string) => {
    const file = exported.files.find((item) => item.path === filePath);
    assert.ok(file, filePath);
    return Buffer.isBuffer(file.body) ? file.body.toString("utf8") : file.body;
  };
  const aboutFile = text("data/pages/about.json");
  assert.match(aboutFile, /Published title/);
  assert.doesNotMatch(aboutFile, /Online Personal Loan Request Service/);
  assert.match(aboutFile, /Published description that is not the seed/);
  const joined = exported.files.map((file) => Buffer.isBuffer(file.body) ? "" : file.body).join("\n");
  assert.equal(joined.includes("hidden-person@example.com"), false);
  assert.equal(joined.includes("555-0100"), false);
  assert.equal(exported.snapshot.warnings.some((item) => item.code === "seo_title_clipped"), true);
  assert.match(text("data/site.json"), /seoKeywords/);
  assert.match(text("app/page.tsx"), /socialMetadata/);
});

test("guide categories do not import the guide corpus", () => {
  const source = readFileSync("lib/public-site/cashpath-guide-categories.ts", "utf8");
  assert.doesNotMatch(source, /cashpath-guides\.generated/);
  const sitemap = readFileSync("app/sitemap.ts", "utf8");
  assert.match(sitemap, /cashpath-guide-categories/);
  assert.doesNotMatch(sitemap, /cashpath-guides\.generated/);
});
