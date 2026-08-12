import type { PublicSiteContent } from "./types.ts";
import {
  localizedLumeaContent,
  LUMEA_TEMPLATE_KEY,
  withLumeaContent,
} from "./lumea-premium-template-content.ts";
import { LUMEA_PREMIUM_TEMPLATE_CONTRACT } from "./lumea-premium-template-contract.ts";

export const LUMEA_NATIVE_LAYOUT_ORDER =
  LUMEA_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(
    ({ id }) => `native:${LUMEA_TEMPLATE_KEY}:${id}`,
  );

export function createLumeaPremiumTemplateSeed(locale = "ru"): PublicSiteContent {
  const english = locale.toLowerCase().startsWith("en");
  const template = localizedLumeaContent(locale);
  const base = {
    template_id: LUMEA_TEMPLATE_KEY,
    brand_name: "LUMÉA",
    theme_dark: "#5A2D17",
    theme_accent: "#87573E",
    theme_surface: "#FBF8F4",
    hero_eyebrow: template.hero.eyebrow,
    hero_title: template.hero.title,
    hero_text: template.hero.text,
    hero_primary_label: template.hero.primaryLabel,
    hero_primary_url: "#booking",
    hero_secondary_label: template.hero.secondaryLabel,
    hero_secondary_url: "#services",
    show_hero_secondary: true,
    about_title: english ? "The LUMÉA atmosphere" : "Атмосфера LUMÉA",
    about_text: english
      ? "A calm beauty studio built around care, craft and warm light."
      : "Спокойное пространство, где забота, мастерство и тёплый свет работают вместе.",
    services_title: template.servicesPresentation.title,
    portfolio_title: template.galleryPresentation.title,
    contact_title: template.contact.title,
    booking_label: template.booking.submit,
    services_label: english ? "Services" : "Услуги",
    portfolio_label: english ? "Gallery" : "Галерея",
    about_label: english ? "About" : "О салоне",
    contact_label: english ? "Contact" : "Контакты",
    show_services: true,
    show_portfolio: true,
    show_about: true,
    show_contact: true,
    show_team: true,
    show_reviews: true,
    show_booking: true,
    announcement_text: template.announcement.text,
    contact_hours: template.contact.hours,
    contact_address: template.contact.address,
    contact_phone: template.contact.phone,
    map_query: template.contact.address,
    contact_route_label: template.contact.cta,
    footer_note: template.footer.note,
    seo_title: english
      ? "LUMÉA Beauty Studio"
      : "LUMÉA Beauty Studio — салон красоты",
    seo_description: english
      ? "Beauty salon for hair, nails, skincare, brows and lashes with convenient online booking."
      : "Премиальный салон красоты: волосы, маникюр, косметология, брови и ресницы. Онлайн-запись к мастерам LUMÉA.",
    seo_image_url: template.hero.image,
    seo_keywords: english
      ? "beauty studio, hair, nails, skincare, brows, lashes"
      : "салон красоты, волосы, маникюр, косметология, брови, ресницы",
    layout_order: [...LUMEA_NATIVE_LAYOUT_ORDER],
    custom_blocks: [],
    pages: [],
  } as PublicSiteContent;
  return withLumeaContent(base, template, false);
}
