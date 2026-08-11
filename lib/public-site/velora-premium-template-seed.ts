import type { PublicSiteContent } from "./types.ts";
import {
  DEFAULT_VELORA_CONTENT,
  VELORA_TEMPLATE_KEY,
  withVeloraContent,
} from "./velora-premium-template-content.ts";
import { VELORA_PREMIUM_TEMPLATE_CONTRACT } from "./velora-premium-template-contract.ts";
export const VELORA_NATIVE_LAYOUT_ORDER =
  VELORA_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(
    ({ id }) => `native:${VELORA_TEMPLATE_KEY}:${id}`,
  );
export function createVeloraPremiumTemplateSeed(): PublicSiteContent {
  const base = {
    template_id: VELORA_TEMPLATE_KEY,
    brand_name: "VELORA",
    theme_dark: "#07101E",
    theme_accent: "#D6B56E",
    theme_surface: "#F6F0E5",
    hero_eyebrow: "VELORA · EVENT HOUSE · WARSZAWA",
    hero_title: DEFAULT_VELORA_CONTENT.hero.title,
    hero_text: DEFAULT_VELORA_CONTENT.hero.text,
    about_title: "Dom dla wydarzeń",
    about_text: "Trzy przestrzenie, autorska kuchnia i jeden zespół.",
    services_title: "Przestrzenie",
    portfolio_title: "Galeria",
    contact_title: DEFAULT_VELORA_CONTENT.contact.title,
    booking_label: "Sprawdź termin",
    services_label: "Sale",
    portfolio_label: "Galeria",
    about_label: "O VELORA",
    contact_label: "Kontakt",
    show_services: true,
    show_portfolio: true,
    show_about: true,
    show_contact: true,
    seo_title: "VELORA — premium event venue w Warszawie",
    seo_description:
      "Wesela, prywatne kolacje i wydarzenia firmowe w trzech filmowych przestrzeniach VELORA.",
    seo_image_url: "/templates/velora/hero.webp",
    seo_keywords: "event venue, wesele, sala Warszawa, prywatne wydarzenia",
    layout_order: [...VELORA_NATIVE_LAYOUT_ORDER],
    custom_blocks: [],
    pages: [
      {
        id: "velora-venues",
        type: "custom" as const,
        slug: "venues",
        nav_label: "Przestrzenie",
        eyebrow: "TRZY PRZESTRZENIE",
        title: "Wybierz architekturę swojego wieczoru",
        intro: "Porównaj skalę, atmosferę i zaplecze każdej sali.",
        is_visible: true,
        show_in_navigation: true,
        show_booking_cta: true,
        seo_title: "Przestrzenie VELORA — Grand Hall, Garden Room i Atelier",
        seo_description:
          "Trzy sale VELORA: pojemność, układ, plan deszczowy i dostępność.",
        seo_image_url: "/templates/velora/grand-hall.webp",
        blocks: [],
      },
      {
        id: "velora-packages",
        type: "custom" as const,
        slug: "packages",
        nav_label: "Pakiety",
        eyebrow: "TRZY POZIOMY OPIEKI",
        title: "Piękna baza albo pełna reżyseria",
        intro: "Wybierz skalę oprawy i ilość czasu, którą chcesz odzyskać.",
        is_visible: true,
        show_in_navigation: true,
        show_booking_cta: true,
        seo_title: "Pakiety wydarzeń VELORA — Essential, Signature, Iconic",
        seo_description:
          "Trzy poziomy oprawy wydarzenia z możliwością pełnej personalizacji.",
        seo_image_url: "/templates/velora/dinner.webp",
        blocks: [],
      },
    ],
  } as PublicSiteContent;
  return withVeloraContent(base, DEFAULT_VELORA_CONTENT, false);
}
