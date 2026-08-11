import type { PublicSiteData } from "./types.ts";
import { createVeloraEnglishContent } from "./velora-demo-locales.ts";
import {
  VELORA_TEMPLATE_KEY,
  withVeloraContent,
} from "./velora-premium-template-content.ts";
import { createVeloraPremiumTemplateSeed } from "./velora-premium-template-seed.ts";

export type VeloraDemoLocale = "ru" | "en";
export const VELORA_DEMO_BASE_PATH = "/demos/velora-event-venue";

export function veloraDemoBasePath(locale: VeloraDemoLocale) {
  return locale === "en" ? `${VELORA_DEMO_BASE_PATH}/en` : VELORA_DEMO_BASE_PATH;
}

export function createCanonicalVeloraDemoSite(
  locale: VeloraDemoLocale = "ru",
): PublicSiteData {
  let content = createVeloraPremiumTemplateSeed();
  if (locale === "en") {
    content = withVeloraContent(content, createVeloraEnglishContent(), false);
    content = {
      ...content,
      hero_eyebrow: "VELORA · EVENT HOUSE · KYIV",
      hero_title: "An evening that stays with you forever.",
      hero_text:
        "Light, flavour and space shaped by one team — from the first sketch to the final toast.",
      services_title: "Spaces",
      portfolio_title: "Gallery",
      booking_label: "Check your date",
      seo_title: "VELORA — a premium event venue in Kyiv",
      seo_description:
        "Weddings, private dinners and corporate events across three cinematic VELORA spaces.",
      seo_keywords: "event venue, wedding, Kyiv venue, private event",
      pages: content.pages?.map((page) =>
        page.id === "velora-venues"
          ? {
              ...page,
              nav_label: "Spaces",
              eyebrow: "THREE SPACES",
              title: "Choose the architecture of your evening",
              intro: "Compare the scale, mood and facilities of every room.",
              seo_title: "VELORA spaces — Grand Hall, Garden Room and Atelier",
              seo_description:
                "Three VELORA rooms with capacity, layout, rain plan and accessibility details.",
            }
          : page.id === "velora-packages"
            ? {
                ...page,
                nav_label: "Packages",
                eyebrow: "THREE LEVELS OF CARE",
                title: "A beautiful foundation or complete direction",
                intro:
                  "Choose the scale and how much planning time you want back.",
                seo_title:
                  "VELORA event packages — Essential, Signature and Iconic",
                seo_description:
                  "Three levels of event styling with complete personalisation.",
              }
            : page,
      ),
      template_id: VELORA_TEMPLATE_KEY,
    };
  }
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
