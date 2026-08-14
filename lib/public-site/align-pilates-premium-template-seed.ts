import type { PublicSiteContent } from "./types.ts";
import { ALIGN_PILATES_PREMIUM_TEMPLATE_CONTRACT } from "./align-pilates-premium-template-contract.ts";
import { ALIGN_PILATES_TEMPLATE_KEY, createAlignPilatesEnglishContent, DEFAULT_ALIGN_PILATES_CONTENT, withAlignPilatesContent } from "./align-pilates-premium-template-content.ts";

export const ALIGN_PILATES_NATIVE_LAYOUT_ORDER = ALIGN_PILATES_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(({ id }) => `native:${ALIGN_PILATES_TEMPLATE_KEY}:${id}`);

export function createAlignPilatesPremiumTemplateSeed(locale = "ru"): PublicSiteContent {
  const english = locale.toLowerCase().startsWith("en");
  const value = english ? createAlignPilatesEnglishContent() : DEFAULT_ALIGN_PILATES_CONTENT;
  const base = {
    template_id: ALIGN_PILATES_TEMPLATE_KEY,
    template_content: { [`${ALIGN_PILATES_TEMPLATE_KEY}:locale`]: english ? "en" : "ru" },
    brand_name: "ALIGN Pilates Studio", theme_dark: "#3D3A34", theme_accent: "#6F2B2E", theme_surface: "#F7F4ED",
    hero_eyebrow: value.hero.eyebrow, hero_title: value.hero.title, hero_text: value.hero.text,
    about_title: value.studioPresentation.title, about_text: value.studioPresentation.text,
    services_title: value.formatsPresentation.title, portfolio_title: value.trainersPresentation.title,
    contact_title: value.contacts.title, booking_label: value.trial.submit,
    services_label: english ? "Classes" : "Занятия", portfolio_label: english ? "Studio" : "Студия",
    about_label: english ? "About" : "О студии", contact_label: english ? "Contact" : "Контакты",
    show_services: true, show_portfolio: true, show_about: true, show_contact: true,
    seo_title: english ? "ALIGN Pilates Studio — reformer and mat Pilates in Kyiv" : "ALIGN Pilates Studio — пилатес на реформерах и матах в Киеве",
    seo_description: english ? "Small-group reformer and mat Pilates for strength, mobility and calm." : "Пилатес на реформерах и матах в небольших группах для силы, гибкости и спокойствия.",
    seo_image_url: "/templates/align-pilates/hero.webp",
    layout_order: [...ALIGN_PILATES_NATIVE_LAYOUT_ORDER], custom_blocks: [], pages: [],
  } as PublicSiteContent;
  return withAlignPilatesContent(base, value, false);
}
