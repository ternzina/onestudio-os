import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, test } from "node:test";
import { createPublicSiteMetadata } from "../lib/public-site/metadata.ts";
import { createPremiumPublicRouteMetadata, resolvePremiumPublicRoute } from "../lib/public-site/premium-route-metadata.ts";
import { platformManifest, tenantManifest, tenantSiteManifest } from "../lib/seo/manifest.ts";
import { classifyHostname, localeFromTenantPath, requestHtmlLang } from "../lib/seo/request.ts";
import type { PublicSiteData } from "../lib/public-site/types.ts";

function site(template = "standard"): PublicSiteData {
  return {
    business: { id: "test-id", slug: "north-star", name: "North Star", locale: "uk", primary_locale: "uk", currency: "UAH", timezone: "Europe/Kiev" },
    content: {
      template_id: template, template_content: template === "premium-kids-center" ? { "premium-kids-center": { brand_name: "North Star Kids" } } : undefined,
      brand_name: template === "premium-kids-center" ? "GLOSS" : "North Star", seo_title: "North Star", seo_description: "Independent tenant site",
      seo_image_url: template === "premium-kids-center" ? "/templates/gloss/leak.webp" : "/tenant-social.webp", favicon_url: "/tenant-icon.png",
      hero_eyebrow: "Learn", hero_title: "North Star", hero_text: "Independent tenant site", about_title: "About", about_text: "About",
      services_title: "Services", portfolio_title: "Portfolio", contact_title: "Contact", booking_label: "Book", services_label: "Services",
      portfolio_label: "Portfolio", about_label: "About", contact_label: "Contact", show_services: true, show_portfolio: true, show_about: true, show_contact: true,
    },
    company: { display_name: "North Star LLC" }, services: [], portfolio: [], capabilities: { booking: false, catalog: false, portfolio: false },
    available_locales: ["uk", "pl"], published_at: "2026-08-08T00:00:00.000Z",
  };
}

describe("tenant metadata isolation", () => {
  test("Standard metadata contains tenant identity and no platform identity fields", () => {
    const metadata = createPublicSiteMetadata(site(), "uk", { origin: "https://tenant.example", cleanUrls: true });
    const json = JSON.stringify(metadata);
    assert.doesNotMatch(json, /OneStudio|applicationName|authors|creator|publisher/);
    assert.match(json, /tenant-social|tenant-icon|North Star/);
    assert.equal(String(metadata.alternates?.canonical), "https://tenant.example/");
  });

  test("Premium metadata keeps active-template identity and suppresses inactive images", () => {
    const tenant = site("premium-kids-center");
    const route = resolvePremiumPublicRoute(tenant, ["tasks"]);
    assert.ok(route);
    const metadata = createPremiumPublicRouteMetadata(tenant, route, "uk", { origin: "https://tenant.example", cleanUrls: true });
    const json = JSON.stringify(metadata);
    assert.match(json, /North Star Kids/);
    assert.doesNotMatch(json, /GLOSS|templates\/gloss|OneStudio/i);
    assert.equal(metadata.openGraph?.images, undefined);
    assert.equal(metadata.twitter?.images, undefined);
  });

  test("root source gates platform schema and has no file-based branded asset conventions", async () => {
    const [layout, rootOg, rootTwitter, rootIcon] = await Promise.all([
      readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/opengraph-image.tsx", import.meta.url), "utf8").catch(() => ""),
      readFile(new URL("../app/twitter-image.tsx", import.meta.url), "utf8").catch(() => ""),
      readFile(new URL("../app/icon.svg", import.meta.url), "utf8").catch(() => ""),
    ]);
    assert.match(layout, /!tenantRoute/);
    assert.equal(rootOg + rootTwitter + rootIcon, "");
  });
});

describe("manifest isolation", () => {
  test("platform manifest retains OneStudio", () => assert.match(JSON.stringify(platformManifest()), /OneStudio OS/));
  test("tenant manifest uses active Premium identity despite stale global presentation data", () => {
    const tenant = site("premium-kids-center");
    tenant.content.template_content = {
      "premium-kids-center": { brand_name: "Northern Star Kids" },
    };
    const manifest = tenantSiteManifest(tenant);
    const json = JSON.stringify(manifest);

    assert.equal(manifest.name, "Northern Star Kids");
    assert.equal(manifest.lang, "uk");
    assert.equal(manifest.start_url, "/");
    assert.deepEqual(manifest.icons, [{ src: "/tenant-icon.png", sizes: "any" }]);
    assert.doesNotMatch(json, /GLOSS|OneStudio/i);
  });

  test("tenant manifest falls back from missing active Premium brand to company identity", () => {
    const tenant = site("premium-kids-center");
    tenant.content.template_content = { "premium-kids-center": { brand_name: "" } };
    const manifest = tenantSiteManifest(tenant);

    assert.equal(manifest.name, "North Star LLC");
    assert.doesNotMatch(JSON.stringify(manifest), /GLOSS|OneStudio/i);
  });

  for (const template of ["standard", "gloss-nail-studio"]) {
    test(`${template} tenant manifest preserves global tenant identity`, () => {
      const tenant = site(template);
      const manifest = tenantSiteManifest(tenant);

      assert.equal(manifest.name, "North Star");
      assert.equal(manifest.lang, "uk");
      assert.deepEqual(manifest.icons, [{ src: "/tenant-icon.png", sizes: "any" }]);
      assert.doesNotMatch(JSON.stringify(manifest), /OneStudio/i);
    });
  }

  test("tenant manifest primitive retains locale and tenant-only favicon behavior", () => {
    const manifest = tenantManifest({ name: "North Star", locale: "uk", favicon: "/tenant-icon.png" });
    assert.equal(manifest.name, "North Star");
    assert.equal(manifest.lang, "uk");
    assert.equal(manifest.start_url, "/");
    assert.deepEqual(manifest.icons, [{ src: "/tenant-icon.png", sizes: "any" }]);
    assert.doesNotMatch(JSON.stringify(manifest), /OneStudio/);
  });
});

describe("host and html lang isolation", () => {
  test("classifies canonical, technical, localhost and tenant hosts", () => {
    assert.equal(classifyHostname("onestudioos.com"), "canonical-platform");
    assert.equal(classifyHostname("preview.vercel.app"), "technical-platform");
    assert.equal(classifyHostname("localhost:3000"), "localhost");
    assert.equal(classifyHostname("tenant.example"), "tenant");
  });
  test("robots and sitemap explicitly suppress technical Vercel hosts", async () => {
    const [robots, sitemap] = await Promise.all([
      readFile(new URL("../app/robots.ts", import.meta.url), "utf8"),
      readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
    ]);
    assert.match(robots, /isTechnicalPlatformHostname\(hostname\).*disallow: "\/"/s);
    assert.match(robots, /isCanonicalPlatformHostname\(hostname\)/);
    assert.match(sitemap, /isTechnicalPlatformHostname\(hostname\).*return \[\]/s);
  });
  test("resolves platform, primary, localized and fallback lang", () => {
    const headers = (values: Record<string, string>) => ({ get: (name: string) => values[name] ?? null });
    assert.equal(requestHtmlLang(headers({})), "ru");
    assert.equal(requestHtmlLang(headers({ "x-onestudio-primary-locale": "uk" })), "uk");
    assert.equal(requestHtmlLang(headers({ "x-onestudio-primary-locale": "uk", "x-onestudio-request-locale": "pl" })), "pl");
    assert.equal(requestHtmlLang(headers({ "x-onestudio-request-locale": "../bad" })), "ru");
    assert.equal(localeFromTenantPath("/site/north-star/pl/articles", false), "pl");
    assert.equal(localeFromTenantPath("/pl/articles", true), "pl");
  });
});

describe("explicit platform route metadata", () => {
  test("demos and configure sources declare canonical/index and noindex respectively", async () => {
    const [demos, detail, configure] = await Promise.all([
      readFile(new URL("../app/demos/layout.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/demos/[demoSlug]/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/configure/[demoSlug]/page.tsx", import.meta.url), "utf8"),
    ]);
    assert.match(demos, /path: "\/demos"/);
    assert.match(detail, /canonical: `\/demos\/\$\{demo.slug\}`/);
    assert.match(detail, /index: true, follow: true/);
    assert.match(configure, /index: false, follow: false, nocache: true/);
    assert.match(configure, /canonical: `\/configure\/\$\{demo.slug\}`/);
    assert.doesNotMatch(configure, /canonical: ["'`]\/["'`]/);
  });
});
