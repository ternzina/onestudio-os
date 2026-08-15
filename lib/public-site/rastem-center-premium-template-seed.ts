import type { PublicSiteContent } from "./types.ts";
import { RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT } from "./rastem-center-premium-template-contract.ts";
import { createRastemCenterEnglishContent, DEFAULT_RASTEM_CENTER_CONTENT, RASTEM_CENTER_TEMPLATE_KEY, withRastemCenterContent } from "./rastem-center-premium-template-content.ts";

export const RASTEM_CENTER_NATIVE_LAYOUT_ORDER = RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(({ id }) => `native:${RASTEM_CENTER_TEMPLATE_KEY}:${id}`);
export function createRastemCenterPremiumTemplateSeed(locale = "ru"): PublicSiteContent {
  const english = locale.toLowerCase().startsWith("en");
  const value = english ? createRastemCenterEnglishContent() : DEFAULT_RASTEM_CENTER_CONTENT;
  const base = { template_id: RASTEM_CENTER_TEMPLATE_KEY, template_content: { [`${RASTEM_CENTER_TEMPLATE_KEY}:locale`]: english ? "en" : "ru" }, brand_name: "РАСТЁМ — Детский развивающий центр", theme_dark: "#263238", theme_accent: "#F2B84B", theme_surface: "#FFF9EF", hero_eyebrow: value.hero.eyebrow, hero_title: value.hero.title, hero_text: value.hero.text, about_title: value.parents.title, about_text: value.parents.text, services_title: value.programs.title, portfolio_title: value.teachers.title, contact_title: value.contact.title, booking_label: value.trial.buttonLabel, services_label: english ? "Programs" : "Программы", portfolio_label: english ? "Teachers" : "Педагоги", about_label: english ? "For parents" : "Для родителей", contact_label: english ? "Contact" : "Контакты", show_services: true, show_portfolio: true, show_about: true, show_contact: true, seo_title: english ? "RASTEM — Children's discovery center" : "РАСТЁМ — Детский развивающий центр", seo_description: english ? "A children's discovery center for learning, creativity and confidence." : "Детский развивающий центр для учёбы, творчества и уверенности.", layout_order: [...RASTEM_CENTER_NATIVE_LAYOUT_ORDER], custom_blocks: [], pages: [] } as PublicSiteContent;
  return withRastemCenterContent(base, value, false);
}
