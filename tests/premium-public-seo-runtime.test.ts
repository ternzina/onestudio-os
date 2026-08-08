import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  createPremiumPublicRouteMetadata,
  premiumPublicSitemapPaths,
  resolvePremiumPublicRoute,
} from "../lib/public-site/premium-route-metadata.ts";
import type { PublicSiteData } from "../lib/public-site/types.ts";

function site(templateId = "premium-kids-center", locale = "uk"): PublicSiteData {
  return {
    business: {
      id: "test-business-id",
      slug: "northern-star-learning",
      name: "Northern Star Learning",
      locale,
      primary_locale: "uk",
      currency: "UAH",
      timezone: "Europe/Kiev",
    },
    content: {
      template_id: templateId,
      template_content: templateId === "premium-kids-center"
        ? { "premium-kids-center": { brand_name: "Northern Star Academy" } }
        : undefined,
      brand_name: "Northern Star Academy",
      seo_title: "Northern Star Academy",
      seo_description: "Learning together",
      seo_image_url: "/social.jpg",
      hero_eyebrow: "Learn",
      hero_title: "Learn together",
      hero_text: "A public learning site",
      about_title: "About",
      about_text: "About us",
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
    company: { display_name: "Northern Star Learning LLC" },
    services: [],
    portfolio: [],
    capabilities: { booking: false, catalog: false, portfolio: false },
    available_locales: ["uk", "pl"],
    published_at: "2026-08-08T00:00:00.000Z",
  };
}

describe("Premium public route recognition", () => {
  for (const path of ["tasks", "workbooks", "experiments", "articles"]) {
    test(`recognizes /${path} only for a capable Premium template`, () => {
      assert.ok(resolvePremiumPublicRoute(site(), [path]));
      assert.equal(resolvePremiumPublicRoute(site("standard"), [path]), null);
    });
  }

  test("recognizes the rendered article and rejects nonexistent or unrendered slugs", () => {
    assert.equal(
      resolvePremiumPublicRoute(site(), ["articles", "add-subtract-within-100"])?.kind,
      "article",
    );
    assert.equal(resolvePremiumPublicRoute(site(), ["articles", "missing"]), null);
    assert.equal(resolvePremiumPublicRoute(site(), ["articles", "reading-ritual"]), null);
  });
});

describe("Premium route metadata", () => {
  test("uses active Premium identity and never leaks inactive-template presentation metadata", () => {
    const currentSite = site();
    currentSite.content.brand_name = "GLOSS";
    currentSite.content.seo_image_url = "/templates/gloss/gloss-hero.webp";
    currentSite.content.hero_image_url = "/templates/gloss/gloss-gallery-1.webp";
    currentSite.content.template_content = {
      "premium-kids-center": { brand_name: "Northern Star Kids" },
    };
    const route = resolvePremiumPublicRoute(currentSite, ["tasks"]);
    assert.ok(route);

    const metadata = createPremiumPublicRouteMetadata(currentSite, route, "uk", {
      origin: "https://academy.example",
      cleanUrls: false,
    });
    const serialized = JSON.stringify(metadata);

    assert.doesNotMatch(serialized, /GLOSS|templates\/gloss/i);
    assert.match(serialized, /Northern Star Kids/);
    assert.equal(
      String(metadata.alternates?.canonical),
      "https://academy.example/site/northern-star-learning/tasks",
    );
    assert.equal(
      typeof metadata.robots === "object" && metadata.robots
        ? metadata.robots.index
        : undefined,
      true,
    );
    assert.equal(metadata.openGraph?.images, undefined);
    assert.equal(metadata.twitter?.images, undefined);
  });

  for (const path of ["tasks", "workbooks", "experiments", "articles"]) {
    test(`creates branded, indexable custom-domain metadata for /${path}`, () => {
      const currentSite = site();
      const route = resolvePremiumPublicRoute(currentSite, [path]);
      assert.ok(route);
      const metadata = createPremiumPublicRouteMetadata(currentSite, route, "uk", {
        origin: "https://academy.example",
        cleanUrls: true,
      });

      assert.match(String(metadata.title && (metadata.title as { absolute: string }).absolute), /Northern Star Academy/);
      assert.ok(metadata.description);
      assert.equal(String(metadata.alternates?.canonical), `https://academy.example/${path}`);
      assert.equal(
        typeof metadata.robots === "object" && metadata.robots
          ? metadata.robots.index
          : undefined,
        true,
      );
      assert.equal(metadata.openGraph?.url?.toString(), `https://academy.example/${path}`);
      assert.equal(metadata.openGraph?.locale, "uk");
      assert.equal(metadata.twitter?.title, metadata.openGraph?.title);
      assert.doesNotMatch(JSON.stringify(metadata), /bembi\.biz|BEMBI/i);
    });
  }

  test("uses article content, article image, locale prefix, and article Open Graph type", () => {
    const localizedSite = site("premium-kids-center", "pl");
    const route = resolvePremiumPublicRoute(localizedSite, ["articles", "add-subtract-within-100"]);
    assert.ok(route);
    const metadata = createPremiumPublicRouteMetadata(localizedSite, route, "pl", {
      origin: "https://academy.example",
      cleanUrls: true,
    });

    assert.match((metadata.title as { absolute: string }).absolute, /Как научить ребёнка/);
    assert.equal(
      String(metadata.alternates?.canonical),
      "https://academy.example/pl/articles/add-subtract-within-100",
    );
    assert.equal((metadata.openGraph as { type?: string } | undefined)?.type, "article");
    assert.equal(metadata.openGraph?.locale, "pl");
    const images = metadata.openGraph?.images;
    const image = Array.isArray(images) ? images[0] : images;
    assert.ok(image && typeof image === "object" && "url" in image);
    assert.match(String(image.url), /article-math\.webp/);
  });

  test("keeps workspace URLs and language alternates in the existing public URL model", () => {
    const currentSite = site();
    const route = resolvePremiumPublicRoute(currentSite, ["tasks"]);
    assert.ok(route);
    const metadata = createPremiumPublicRouteMetadata(currentSite, route, "uk", {
      origin: "https://platform.example",
      cleanUrls: false,
    });
    assert.equal(
      String(metadata.alternates?.canonical),
      "https://platform.example/site/northern-star-learning/tasks",
    );
    assert.equal(
      metadata.alternates?.languages?.pl,
      "https://platform.example/site/northern-star-learning/pl/tasks",
    );
  });
});

test("Premium sitemap paths contain only valid public routes and preserve Standard behavior", () => {
  assert.deepEqual(premiumPublicSitemapPaths(site("standard"), "uk", true), []);
  assert.deepEqual(premiumPublicSitemapPaths(site(), "uk", true), [
    "/tasks",
    "/workbooks",
    "/experiments",
    "/articles",
    "/articles/add-subtract-within-100",
  ]);
});
