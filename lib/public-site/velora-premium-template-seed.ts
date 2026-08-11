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
    hero_eyebrow: "VELORA · EVENT HOUSE · КИЕВ",
    hero_title: DEFAULT_VELORA_CONTENT.hero.title,
    hero_text: DEFAULT_VELORA_CONTENT.hero.text,
    about_title: "Дом для событий",
    about_text: "Три пространства, авторская кухня и одна команда.",
    services_title: "Пространства",
    portfolio_title: "Галерея",
    contact_title: DEFAULT_VELORA_CONTENT.contact.title,
    booking_label: "Проверить дату",
    services_label: "Залы",
    portfolio_label: "Галерея",
    about_label: "О VELORA",
    contact_label: "Контакты",
    show_services: true,
    show_portfolio: true,
    show_about: true,
    show_contact: true,
    seo_title: "VELORA — премиальное пространство для событий в Киеве",
    seo_description:
      "Свадьбы, частные ужины и деловые события в трёх кинематографичных пространствах VELORA.",
    seo_image_url: "/templates/velora/hero-cinematic.webp",
    seo_keywords: "площадка для событий, свадьба, зал Киев, частные мероприятия",
    layout_order: [...VELORA_NATIVE_LAYOUT_ORDER],
    custom_blocks: [],
    pages: [
      {
        id: "velora-venues",
        type: "custom" as const,
        slug: "venues",
        nav_label: "Пространства",
        eyebrow: "ТРИ ПРОСТРАНСТВА",
        title: "Выберите архитектуру своего вечера",
        intro: "Сравните масштаб, атмосферу и возможности каждого зала.",
        is_visible: true,
        show_in_navigation: true,
        show_booking_cta: true,
        seo_title: "Пространства VELORA — Grand Hall, Garden Room и Atelier",
        seo_description:
          "Три зала VELORA: вместимость, планировка, погодный сценарий и доступность.",
        seo_image_url: "/templates/velora/grand-hall-cinematic.webp",
        blocks: [],
      },
      {
        id: "velora-packages",
        type: "custom" as const,
        slug: "packages",
        nav_label: "Пакеты",
        eyebrow: "ТРИ УРОВНЯ ЗАБОТЫ",
        title: "Красивое основание или полная режиссура",
        intro: "Выберите масштаб оформления и количество времени, которое хотите вернуть себе.",
        is_visible: true,
        show_in_navigation: true,
        show_booking_cta: true,
        seo_title: "Пакеты VELORA — Essential, Signature, Iconic",
        seo_description:
          "Три уровня оформления события с полной персонализацией.",
        seo_image_url: "/templates/velora/celebration-cinematic.webp",
        blocks: [],
      },
    ],
  } as PublicSiteContent;
  return withVeloraContent(base, DEFAULT_VELORA_CONTENT, false);
}
