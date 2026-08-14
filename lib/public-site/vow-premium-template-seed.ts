import type { PublicSiteContent } from "./types.ts";
import {
  createVowEnglishContent,
  DEFAULT_VOW_CONTENT,
  VOW_TEMPLATE_KEY,
  withVowContent,
} from "./vow-premium-template-content.ts";
import { VOW_PREMIUM_TEMPLATE_CONTRACT } from "./vow-premium-template-contract.ts";

export const VOW_NATIVE_LAYOUT_ORDER = VOW_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(
  ({ id }) => `native:${VOW_TEMPLATE_KEY}:${id}`,
);

export function createVowPremiumTemplateSeed(locale = "ru"): PublicSiteContent {
  const english = locale.toLowerCase().startsWith("en");
  const value = english ? createVowEnglishContent() : DEFAULT_VOW_CONTENT;
  const base = {
    template_id: VOW_TEMPLATE_KEY,
    template_content: { [`${VOW_TEMPLATE_KEY}:locale`]: english ? "en" : "ru" },
    brand_name: value.brand,
    theme_dark: "#07111F",
    theme_accent: "#CDB078",
    theme_surface: "#F7F2E9",
    hero_eyebrow: value.hero.eyebrow,
    hero_title: value.hero.title,
    hero_text: value.hero.text,
    about_title: value.manifesto.title,
    about_text: value.manifesto.text,
    services_title: value.packagesPresentation.title,
    portfolio_title: value.galleryPresentation.title,
    contact_title: value.contact.title,
    booking_label: value.availability.submit,
    services_label: english ? "Collections" : "Пакеты",
    portfolio_label: english ? "Films" : "Фильмы",
    about_label: english ? "Approach" : "Подход",
    contact_label: english ? "Contact" : "Контакты",
    show_services: true,
    show_portfolio: true,
    show_about: true,
    show_contact: true,
    seo_title: english
      ? "VOW FILMS — cinematic wedding films across Europe"
      : "VOW FILMS — кинематографичные свадебные фильмы в Европе",
    seo_description: english
      ? "Editorial wedding films built from real voices, atmosphere and the quiet moments in between."
      : "Свадебные фильмы из живых голосов, атмосферы и тихих моментов, которые обычно остаются за кадром.",
    seo_image_url: "/images/demos/vow-films.webp",
    seo_keywords: english
      ? "wedding filmmaker, wedding video, Europe wedding film, destination wedding"
      : "свадебный видеограф, свадебный фильм, видеосъёмка свадьбы, свадьба Европа",
    layout_order: [...VOW_NATIVE_LAYOUT_ORDER],
    custom_blocks: [],
    pages: [
      {
        id: "vow-films-page",
        type: "custom" as const,
        slug: "films",
        nav_label: english ? "Films" : "Фильмы",
        eyebrow: english ? "VOW PREMIERES" : "ПРЕМЬЕРЫ VOW",
        title: english ? "Stories made to be replayed." : "Истории, которые хочется пересматривать.",
        intro: english
          ? "A closer look at recent VOW FILMS stories."
          : "Больше историй VOW FILMS в одном кинематографичном пространстве.",
        is_visible: true,
        show_in_navigation: true,
        show_booking_cta: true,
        seo_title: english ? "Wedding films — VOW FILMS" : "Свадебные фильмы — VOW FILMS",
        seo_description: english
          ? "Recent wedding film stories by VOW FILMS."
          : "Недавние свадебные истории VOW FILMS.",
        seo_image_url: "/images/demos/vow-films.webp",
        blocks: [],
      },
      {
        id: "vow-packages-page",
        type: "custom" as const,
        slug: "packages",
        nav_label: english ? "Collections" : "Пакеты",
        eyebrow: english ? "VOW COLLECTIONS" : "КОЛЛЕКЦИИ VOW",
        title: english ? "Choose how much of the day you want to keep." : "Выберите, сколько вашего дня останется в фильме.",
        intro: english
          ? "Three starting points, all shaped around your celebration."
          : "Три отправные точки, каждая настраивается вокруг вашего события.",
        is_visible: true,
        show_in_navigation: true,
        show_booking_cta: true,
        seo_title: english ? "Wedding film collections — VOW FILMS" : "Пакеты свадебной съёмки — VOW FILMS",
        seo_description: english
          ? "Light, Story and Cinema wedding film collections."
          : "Пакеты Light, Story и Cinema для свадебных фильмов VOW FILMS.",
        seo_image_url: "/images/demos/vow-films.webp",
        blocks: [],
      },
    ],
  } as PublicSiteContent;

  return withVowContent(base, value, false);
}
