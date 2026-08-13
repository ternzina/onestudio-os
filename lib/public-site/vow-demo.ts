import type { PublicSiteData } from "./types.ts";
import { createVowPremiumTemplateSeed } from "./vow-premium-template-seed.ts";

export type VowDemoLocale = "ru" | "en";
export const VOW_DEMO_BASE_PATH = "/demos/vow-films";

export function vowDemoBasePath(locale: VowDemoLocale) {
  return locale === "en" ? `${VOW_DEMO_BASE_PATH}/en` : VOW_DEMO_BASE_PATH;
}

export function createCanonicalVowDemoSite(locale: VowDemoLocale = "ru"): PublicSiteData {
  const content = createVowPremiumTemplateSeed(locale);
  return {
    business: {
      id: `vow-demo-${locale}`,
      slug: "vow-films",
      name: "VOW FILMS",
      locale,
      primary_locale: "ru",
      currency: "EUR",
      timezone: "Europe/Kyiv",
    },
    content,
    company: {
      display_name: "VOW FILMS",
      email: "hello@vowfilms.demo",
      phone: "+380 67 555 14 14",
      address: locale === "en" ? "Europe · destination weddings" : "Европа · destination weddings",
    },
    services: [],
    portfolio: [],
    capabilities: { booking: true, catalog: true, portfolio: true },
    available_locales: ["ru", "en"],
    published_at: "2026-08-12T00:00:00.000Z",
  };
}
