import type { PublicSiteData } from "./types.ts";
import { createVeloraPremiumTemplateSeed } from "./velora-premium-template-seed.ts";

export type VeloraDemoLocale = "ru" | "en";
export const VELORA_DEMO_BASE_PATH = "/demos/velora-event-venue";

export function veloraDemoBasePath(locale: VeloraDemoLocale) {
  return locale === "en" ? `${VELORA_DEMO_BASE_PATH}/en` : VELORA_DEMO_BASE_PATH;
}

export function createCanonicalVeloraDemoSite(
  locale: VeloraDemoLocale = "ru",
): PublicSiteData {
  const content = createVeloraPremiumTemplateSeed(locale);
  return {
    business: {
      id: `velora-demo-${locale}`,
      slug: "velora-house",
      name: "VELORA HOUSE",
      locale,
      primary_locale: "ru",
      currency: "EUR",
      timezone: "Europe/Kyiv",
    },
    content,
    company: {
      display_name: "VELORA HOUSE",
      email: "events@velora.house",
      phone: "+380 44 555 24 24",
      address:
        locale === "en"
          ? "24 Velyka Zhytomyrska Street · Kyiv"
          : "ул. Большая Житомирская, 24 · Киев",
    },
    services: [],
    portfolio: [],
    capabilities: { booking: true, catalog: true, portfolio: true },
    available_locales: ["ru", "en"],
    published_at: "2026-08-11T00:00:00.000Z",
  };
}
