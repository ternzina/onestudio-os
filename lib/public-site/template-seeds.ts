import { restoreOriginalPremiumKidsContent } from "./premium-kids-content.ts";
import { getPremiumTemplatePackage } from "./premium-template-package-catalog.ts";
import { getPremiumTemplateSeedFactory } from "./premium-template-seed-registry.ts";
import type { PublicSiteContent } from "./types.ts";

export const BLANK_BASE_SEED: PublicSiteContent = {
  template_id: "standard", brand_name: "Новый сайт", hero_eyebrow: "Добро пожаловать", hero_title: "Новый сайт", hero_text: "Добавьте текст о вашем проекте.",
  about_title: "О нас", about_text: "Расскажите о себе и своей работе.", services_title: "Услуги", portfolio_title: "Проекты", contact_title: "Контакты",
  booking_label: "Связаться", services_label: "Услуги", portfolio_label: "Проекты", about_label: "О нас", contact_label: "Контакты",
  show_hero: true, show_announcement: false, show_services: false, show_portfolio: false, show_about: true, show_contact: true,
  pages: [], custom_blocks: [], section_order: ["about", "contact"], layout_order: ["section:about", "section:contact"],
  seo_title: "Новый сайт", seo_description: "Новый сайт на OneStudio.",
};

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }

export function createTemplateSeed(templateKey: string): PublicSiteContent {
  if (templateKey === "standard") return clone(BLANK_BASE_SEED);
  if (templateKey === "premium-kids-center") return { ...clone(BLANK_BASE_SEED), template_id: templateKey, brand_name: "BEMBI", template_content: { [templateKey]: restoreOriginalPremiumKidsContent() } };
  const premiumPackage = getPremiumTemplatePackage(templateKey);
  const seedFactory = getPremiumTemplateSeedFactory(templateKey);
  if (premiumPackage && seedFactory) return { ...clone(BLANK_BASE_SEED), ...seedFactory(), template_id: templateKey };
  throw new Error(`No seed registered for canonical template: ${templateKey}`);
}
