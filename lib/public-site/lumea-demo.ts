import type { PublicSiteData, PublicSiteService } from "./types.ts";
import { createLumeaPremiumTemplateSeed } from "./lumea-premium-template-seed.ts";

export type LumeaDemoLocale = "ru" | "en";
export const LUMEA_DEMO_BASE_PATH = "/demos/lumea-beauty";

export function lumeaDemoBasePath(locale: LumeaDemoLocale) {
  return locale === "en" ? `${LUMEA_DEMO_BASE_PATH}/en` : LUMEA_DEMO_BASE_PATH;
}

function demoServices(locale: LumeaDemoLocale): PublicSiteService[] {
  const english = locale === "en";
  return [
    ["hair-care", english ? "Hair care" : "Уход за волосами", 120000, 90],
    ["nails", english ? "Manicure & pedicure" : "Маникюр и педикюр", 80000, 75],
    ["skincare", english ? "Skincare" : "Косметология", 150000, 60],
    ["brows-lashes", english ? "Brows & lashes" : "Брови и ресницы", 60000, 45],
  ].map(([slug, title, price, duration], index) => ({
    id: `lumea-demo-service-${index + 1}`,
    slug: String(slug),
    kind: "appointment",
    title: String(title),
    description: "LUMÉA Beauty Studio",
    pricing_model: "fixed" as const,
    price_minor: Number(price),
    currency: "UAH",
    duration_min_minutes: Number(duration),
    duration_max_minutes: Number(duration),
    capacity: 1,
    requires_confirmation: false,
  }));
}

export function createCanonicalLumeaDemoSite(
  locale: LumeaDemoLocale = "ru",
): PublicSiteData {
  return {
    business: {
      id: `lumea-demo-${locale}`,
      slug: "lumea-beauty",
      name: "LUMÉA Beauty Studio",
      locale,
      primary_locale: "ru",
      currency: "UAH",
      timezone: "Europe/Kyiv",
    },
    content: createLumeaPremiumTemplateSeed(locale),
    company: {
      display_name: "LUMÉA Beauty Studio",
      phone: "+38 (067) 123-45-67",
      address: locale === "en" ? "18 Tsentralna Street" : "ул. Центральная, 18",
    },
    services: demoServices(locale),
    portfolio: [],
    capabilities: { booking: true, catalog: true, portfolio: true },
    available_locales: ["ru", "en"],
    published_at: "2026-08-12T00:00:00.000Z",
  };
}
