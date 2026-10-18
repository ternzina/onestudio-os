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
  assert.match(text("components/LeadsGateForm.tsx"), /className="short-form-action"/);
  assert.match(text("app/globals.css"), /\.short-form button,\[data-short-form\] button\{[^}]*background:#187c6a/);
  assert.match(text("app/globals.css"), /grid-template-columns:1fr 1fr/);
  assert.match(text("app/globals.css"), /\.site :is\(h1,h2,h3,p\)\{margin:0\}/);
  assert.match(text("app/globals.css"), /translateY\(64px\)/);
  assert.match(text("app/globals.css"), /translateY\(40px\)/);
  assert.match(text("app/globals.css"), /translateY\(28px\)/);
  assert.match(text("app/globals.css"), /cubic-bezier\(0\.16,1,0\.3,1\)/);
  assert.match(text("app/globals.css"), /animation-delay:\.1s/);
  assert.match(text("app/globals.css"), /prefers-reduced-motion: no-preference/);
  assert.match(text("components/HomePage.tsx"), /className="reveal"/);
  assert.match(text("components/HomePage.tsx"), /className="trust stagger"/);
  assert.match(text("components/HomePage.tsx"), /prefers-reduced-motion: reduce/);
  assert.match(text("components/HomePage.tsx"), /0\.32/);
  assert.match(home, /REQUEST OPTIONS/);
  assert.match(home, /Start your request/);
  assert.match(home, /"type":"image\/webp"/);
  assert.match(home, /hero-woman-wide-v2-640\.webp 640w/);
  assert.match(home, /hero-woman-wide-v2-1774\.webp 1774w/);
  assert.match(home, /"sizes":"100vw"/);
  assert.match(home, /hero-woman-wide-v2\.png/);
  assert.match(text("components/HomePage.tsx"), /fetchPriority="high"/);
  assert.match(text("components/HomePage.tsx"), /<source type=\{sources\.type\} srcSet=\{sources\.srcset\} sizes=\{sources\.sizes\} \/>/);
  assert.match(text("app/page.tsx"), /imageSrcSet=\{site\.heroSources\.srcset\}/);
  assert.match(text("app/page.tsx"), /fetchPriority="high"/);
  const png = exported.files.find((file) => file.path.endsWith("hero-woman-wide-v2.png"));
  const webp = exported.files.filter((file) => file.path.includes("hero-woman-wide-v2-") && file.path.endsWith(".webp"));
  assert.ok(png && Buffer.isBuffer(png.body));
  assert.equal(webp.length, 5);
  assert.ok(webp.every((file) => Buffer.isBuffer(file.body) && file.body.length > 0 && file.body.length < (png.body as Buffer).length));
  const notes = text("EXPORT-NOTES.md");
  assert.match(notes, /DNS/);
  assert.match(text(".env.example"), /LEADSGATE_AID=/);
  assert.equal(exported.files.some((file) => file.path === ".env"), false);
});

test("CashPath static export preloads the responsive hero", async () => {
  const content = createCashPathPremiumTemplateSeed();
  const exported = await buildSiteExport(siteFrom(content, {
    business: { id: "cashpath-909c00c9", slug: "cashpath-909c00c9", name: "CashPath", locale: "en", primary_locale: "en", currency: "USD", timezone: "America/New_York" },
    company: { display_name: "CashPath" },
  }), "static", { canonicalOrigin: "https://cashpath.org", projectRoot: process.cwd() });
  const text = (filePath: string) => {
    const file = exported.files.find((item) => item.path === filePath);
    assert.ok(file, filePath);
    return Buffer.isBuffer(file.body) ? file.body.toString("utf8") : file.body;
  };
  const home = text("index.html");
  assert.match(home, /<link rel="preload" as="image" imagesrcset="[^"]*hero-woman-wide-v2-640\.webp 640w[^"]*" imagesizes="100vw" type="image\/webp" fetchpriority="high">/);
  assert.match(home, /<picture><source type="image\/webp" srcset="[^"]*hero-woman-wide-v2-1774\.webp 1774w" sizes="100vw"><img src="\/media\/\d+-hero-woman-wide-v2\.png" alt="" width="1774" height="887" fetchpriority="high"><\/picture>/);
  assert.match(home, /property="og:image" content="https:\/\/cashpath\.org\/media\/\d+-hero-woman-wide-v2\.png"/);
  assert.match(home, /class="form-kicker"/);
  assert.match(text("assets/site.js"), /class="short-form"/);
  assert.match(text("assets/site.js"), /class="short-form-action"/);
  assert.match(text("assets/site.js"), /IntersectionObserver/);
  assert.match(text("assets/site.js"), /0\.32/);
  assert.match(text("assets/site.js"), /prefers-reduced-motion: reduce/);
  assert.match(text("index.html"), /class="reveal"/);
  assert.match(text("index.html"), /class="trust stagger"/);
  assert.match(text("assets/site.css"), /\.short-form button,\[data-short-form\] button\{[^}]*background:#187c6a/);
  assert.match(text("assets/site.css"), /translateY\(64px\)/);
  assert.match(text("assets/site.css"), /prefers-reduced-motion: no-preference/);
  assert.equal(exported.files.filter((file) => file.path.endsWith(".webp")).length, 5);
  const article = exported.files.find((file) => file.path === "p/about/index.html");
  assert.ok(article);
  const articleHtml = Buffer.isBuffer(article.body) ? article.body.toString("utf8") : article.body;
  assert.equal(articleHtml.includes("imagesrcset"), false);
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

test("exporter rebuilds a clipped SEO title from the page heading", async () => {
  const heading = "Appliance Financing: Compare a Personal Loan, Store Financing, BNPL, and Rent-to-Own";
  const clipped = "Appliance Financing: Personal Loan vs. Store Financing, BNPL, and Rent";
  assert.equal(clipped.length, 70);
  const prefixedHeading = "Personal Loan for Moving Expenses: Build the Relocation Budget Before You Borrow";
  const prefixed = prefixedHeading.slice(0, 70);
  const content = {
    template_id: "generic",
    brand_name: "Example",
    hero_title: "Hello",
    seo_title: "Example",
    seo_description: "Description",
    pages: [
      { id: "guide", type: "custom", slug: "appliance-guide", nav_label: "Appliance Financing", title: heading, intro: "Intro", seo_title: clipped, seo_description: "Description", is_visible: true, show_in_navigation: true, show_booking_cta: false, blocks: [] },
      { id: "payments", type: "custom", slug: "payments", nav_label: prefixedHeading.slice(0, 52), title: prefixedHeading, intro: "Intro", seo_title: prefixed, seo_description: "Description", is_visible: true, show_in_navigation: true, show_booking_cta: false, blocks: [] },
      { id: "about", type: "custom", slug: "about-example", nav_label: "About", title: "About", intro: "Intro", seo_title: `${"Published title ".repeat(6)}`.slice(0, 70), seo_description: "Description", is_visible: true, show_in_navigation: true, show_booking_cta: false, blocks: [] },
    ],
  } as unknown as PublicSiteData["content"];
  const exported = await buildSiteExport(siteFrom(content), "static", { canonicalOrigin: "https://example.com", projectRoot: process.cwd() });
  const text = (filePath: string) => {
    const file = exported.files.find((item) => item.path === filePath);
    assert.ok(file, filePath);
    return Buffer.isBuffer(file.body) ? file.body.toString("utf8") : file.body;
  };
  const appliance = text("p/appliance-guide/index.html");
  const restored = `${heading} | Example`;
  assert.match(appliance, new RegExp(`<title>${restored}</title>`));
  assert.match(appliance, new RegExp(`property="og:title" content="${restored}"`));
  assert.match(appliance, new RegExp(`<h1>${heading}</h1>`));
  assert.doesNotMatch(appliance, /BNPL, and Rent</);
  assert.equal(exported.snapshot.pages.find((page) => page.slug === "appliance-guide")?.navLabel, heading);
  const payments = text("p/payments/index.html");
  assert.match(payments, new RegExp(`<title>${prefixedHeading} \\| Example</title>`));
  assert.match(payments, new RegExp(`<h1>${prefixedHeading}</h1>`));
  assert.equal(exported.snapshot.pages.find((page) => page.slug === "payments")?.navLabel, prefixedHeading);
  const about = text("p/about-example/index.html");
  assert.match(about, /<title>Published title/);
  assert.match(about, /<h1>About<\/h1>/);
  assert.equal(exported.snapshot.warnings.some((item) => item.code === "seo_title_restored"), true);
  assert.equal(exported.snapshot.warnings.some((item) => item.code === "seo_title_clipped"), true);
});

test("guide categories do not import the guide corpus", () => {
  const source = readFileSync("lib/public-site/cashpath-guide-categories.ts", "utf8");
  assert.doesNotMatch(source, /cashpath-guides\.generated/);
  const sitemap = readFileSync("app/sitemap.ts", "utf8");
  assert.match(sitemap, /cashpath-guide-categories/);
  assert.doesNotMatch(sitemap, /cashpath-guides\.generated/);
});
