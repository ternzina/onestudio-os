import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { SITE_URL } from "../app/_seo/site.ts";
import { createPublicSiteMetadata } from "../lib/public-site/metadata.ts";
import {
  classifyHostname,
  requestHtmlLang,
} from "../lib/seo/request.ts";
import type { PublicSiteData } from "../lib/public-site/types.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

function tenant(): PublicSiteData {
  return {
    business: {
      id: "host-invariant-tenant",
      slug: "north-star",
      name: "North Star",
      locale: "en",
      primary_locale: "en",
      currency: "USD",
      timezone: "UTC",
    },
    content: {
      template_id: "standard",
      brand_name: "North Star",
      seo_title: "North Star",
      seo_description: "Independent tenant site",
      hero_eyebrow: "Welcome",
      hero_title: "North Star",
      hero_text: "Independent tenant site",
      about_title: "About",
      about_text: "About",
      services_title: "Services",
      portfolio_title: "Portfolio",
      contact_title: "Contact",
      booking_label: "Book",
      services_label: "Services",
      portfolio_label: "Portfolio",
      about_label: "About",
      contact_label: "Contact",
      show_services: true,
      show_portfolio: true,
      show_about: true,
      show_contact: true,
    },
    company: { display_name: "North Star LLC" },
    services: [],
    portfolio: [],
    capabilities: { booking: false, catalog: false, portfolio: false },
    available_locales: ["en"],
    published_at: "2026-09-01T00:00:00.000Z",
  };
}

test("platform host invariants keep one canonical origin, including www", () => {
  assert.equal(SITE_URL.toString(), "https://onestudioos.com/");
  assert.equal(classifyHostname("onestudioos.com"), "canonical-platform");
  assert.equal(classifyHostname("www.onestudioos.com"), "canonical-platform");
  assert.equal(classifyHostname("www.onestudioos.com:443"), "canonical-platform");
});

test("technical Vercel hosts remain noindex and never receive a platform sitemap", async () => {
  const [layout, robots, sitemap] = await Promise.all([
    read("../app/layout.tsx"),
    read("../app/robots.ts"),
    read("../app/sitemap.ts"),
  ]);

  assert.equal(classifyHostname("onestudio-preview.vercel.app"), "technical-platform");
  assert.match(layout, /classifyHostname\(host\) === "technical-platform"/);
  assert.match(layout, /robots: \{ index: false, follow: false, nocache: true \}/);
  assert.match(robots, /isTechnicalPlatformHostname\(hostname\).*return \{ rules: \{ userAgent: "\*", disallow: "\/" \} \}/s);
  assert.match(sitemap, /isTechnicalPlatformHostname\(hostname\).*return \[\]/s);
});

test("hosted tenant metadata stays tenant-scoped while custom domains keep their own origin", () => {
  const hosted = createPublicSiteMetadata(tenant(), "en");
  assert.equal(String(hosted.alternates?.canonical), "https://onestudioos.com/site/north-star");
  assert.doesNotMatch(JSON.stringify(hosted), /OneStudio OS/);

  const customDomain = createPublicSiteMetadata(tenant(), "en", {
    origin: "https://northstar.example",
    cleanUrls: true,
  });
  assert.equal(String(customDomain.alternates?.canonical), "https://northstar.example/");
  assert.doesNotMatch(String(customDomain.alternates?.canonical), /onestudioos\.com/);
});

test("tenant request language remains separate from platform marketing language", () => {
  const headers = (values: Record<string, string>) => ({
    get: (name: string) => values[name] ?? null,
  });
  assert.equal(requestHtmlLang(headers({ "x-onestudio-primary-locale": "uk" })), "uk");
  assert.equal(requestHtmlLang(headers({})), "ru");
});
