import type {
  PublicSiteContent,
  PublicSitePage,
  PublicSiteSection,
} from "./types";
import {
  resolvePublicSiteLayoutOrder,
} from "./layout";

export type SiteTemplateService = {
  slug: string;
  title: string;
  description: string;
  priceMinor: number;
  durationMinutes: number;
};

export type SiteTemplateProject = {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

export type SiteTemplate = {
  id: string;
  name: string;
  category: string;
  description: string;
  preview: { accent: string; dark: string; surface: string };
  logoUrl?: string;
  content: Partial<PublicSiteContent>;
  sectionOrder: PublicSiteSection[];
  services: SiteTemplateService[];
  portfolio: SiteTemplateProject[];
};

export const GLOSS_PORTFOLIO_PAGE: PublicSitePage = {
  id: "portfolio",
  type: "portfolio",
  slug: "portfolio",
  nav_label: "Портфолио",
  eyebrow: "GLOSS · SELECTED WORKS",
  title: "Ногти как маленькие произведения искусства",
  intro:
    "Френч, глубокие оттенки, деликатные линии и дизайны, созданные под ваш стиль. Откройте работу и выберите идею для следующего визита.",
  is_visible: true,
  show_in_navigation: true,
  show_booking_cta: true,
  seo_title: "Портфолио маникюра GLOSS",
  seo_description:
    "Френч, глубокие оттенки, деликатные линии и авторские дизайны ногтей GLOSS.",
  seo_image_url: "/templates/gloss/gloss-gallery-1.webp",
  seo_no_index: false,
};

export const GLOSS_TEMPLATE: SiteTemplate = {
  id: "gloss-nail-studio",
  name: "GLOSS",
  category: "Маникюрный салон",
  description: "Готовый сайт с услугами, мастерами, отзывами, клубом, сертификатами и FAQ.",
  preview: {
    accent: "#9d3151",
    dark: "#321722",
    surface: "#fff7f5",
  },
  logoUrl: "",
  sectionOrder: [
    "services",
    "portfolio",
    "team",
    "booking",
    "membership",
    "safety",
    "reviews",
    "gift",
    "faq",
    "about",
    "contact",
  ],
  services: [
    {
      slug: "gloss-signature-manicure",
      title: "Маникюр с покрытием",
      description: "Снятие, бережный маникюр, выравнивание и однотонное покрытие.",
      priceMinor: 4500,
      durationMinutes: 90,
    },
    {
      slug: "gloss-clean-manicure",
      title: "Маникюр без покрытия",
      description: "Идеальная форма, обработка кутикулы и уход за кожей рук.",
      priceMinor: 2800,
      durationMinutes: 60,
    },
    {
      slug: "gloss-strengthening",
      title: "Укрепление ногтей",
      description: "Укрепление гелем с архитектурой и покрытием выбранного оттенка.",
      priceMinor: 5500,
      durationMinutes: 120,
    },
    {
      slug: "gloss-pedicure",
      title: "Педикюр с покрытием",
      description: "Полный уход, обработка стоп и стойкое покрытие.",
      priceMinor: 5200,
      durationMinutes: 90,
    },
    {
      slug: "gloss-nail-art",
      title: "Nail art",
      description: "Френч, минималистичные линии и дизайн по вашему референсу.",
      priceMinor: 800,
      durationMinutes: 30,
    },
    {
      slug: "gloss-spa-care",
      title: "SPA-уход для рук",
      description: "Мягкий пилинг, маска и расслабляющий массаж.",
      priceMinor: 1800,
      durationMinutes: 30,
    },
  ],
  portfolio: [
    {
      slug: "gloss-milky-french",
      title: "Молочный френч",
      description: "Тонкая вишнёвая линия и естественная форма.",
      imageUrl: "/templates/gloss/gloss-gallery-1.webp",
      imageAlt: "Молочный маникюр с тонким вишнёвым френчем",
    },
    {
      slug: "gloss-cherry-detail",
      title: "Cherry detail",
      description: "Глубокий оттенок вишни с деликатным золотым акцентом.",
      imageUrl: "/templates/gloss/gloss-gallery-2.webp",
      imageAlt: "Вишнёвый маникюр с молочным и золотым акцентом",
    },
    {
      slug: "gloss-signature-red",
      title: "Signature red",
      description: "Безупречное глянцевое покрытие в фирменной палитре GLOSS.",
      imageUrl: "/templates/gloss/gloss-hero.webp",
      imageAlt: "Глянцевый маникюр глубокого вишнёвого цвета",
    },
    {
      slug: "gloss-burgundy-french",
      title: "Burgundy micro french",
      description: "Молочная база и тонкая вишнёвая линия по свободному краю.",
      imageUrl: "/templates/gloss/gloss-gallery-3.webp",
      imageAlt: "Молочный маникюр с тонким бордовым френчем",
    },
    {
      slug: "gloss-cherry-gold",
      title: "Cherry & gold",
      description: "Глубокий вишнёвый оттенок с деликатным золотым акцентом.",
      imageUrl: "/templates/gloss/gloss-gallery-4.webp",
      imageAlt: "Вишнёвый маникюр с золотым акцентом",
    },
    {
      slug: "gloss-minimal-lines",
      title: "Fine lines",
      description: "Воздушная нюдовая база, винные линии и маленькая жемчужина.",
      imageUrl: "/templates/gloss/gloss-gallery-5.webp",
      imageAlt: "Нюдовый маникюр с бордовыми линиями и жемчужиной",
    },
    {
      slug: "gloss-champagne-glaze",
      title: "Champagne glaze",
      description: "Мягкое жемчужное сияние и один выразительный полумесяц.",
      imageUrl: "/templates/gloss/gloss-gallery-6.webp",
      imageAlt: "Маникюр с эффектом шампанского и бордовым акцентом",
    },
    {
      slug: "gloss-botanical",
      title: "Burgundy botanica",
      description: "Тонкая ручная роспись на полупрозрачной розовой основе.",
      imageUrl: "/templates/gloss/gloss-gallery-7.webp",
      imageAlt: "Розовый маникюр с бордовым ботаническим рисунком",
    },
    {
      slug: "gloss-ivory-berry",
      title: "Ivory & berry",
      description: "Сливочный и ягодный оттенки с тонкой золотой линией.",
      imageUrl: "/templates/gloss/gloss-gallery-8.webp",
      imageAlt: "Сливочно-ягодный маникюр с золотой линией",
    },
    {
      slug: "gloss-cherry-micro-french",
      title: "Cherry micro french",
      description: "Глубокий вишнёвый глянец и тонкая линия на нюдовой базе.",
      imageUrl: "/templates/gloss/gloss-gallery-9.webp",
      imageAlt: "Вишнёвый маникюр с нюдовым микрофренчем",
    },
  ],
  content: {
    template_id: "gloss-nail-studio",
    theme_accent: "#9d3151",
    theme_dark: "#321722",
    theme_surface: "#fff7f5",
    brand_name: "GLOSS",
    show_hero: true,
    announcement_text: "Первое посещение — дизайн двух ногтей в подарок",
    show_announcement: true,
    hero_image_url: "/templates/gloss/gloss-hero.webp",
    service_image_urls: [
      "/templates/gloss/gloss-gallery-4.webp",
      "/templates/gloss/gloss-gallery-1.webp",
      "/templates/gloss/gloss-gallery-3.webp",
      "/templates/gloss/gloss-gallery-8.webp",
    ],
    team_image_urls: [
      "/templates/gloss/gloss-master-anna.webp",
      "/templates/gloss/gloss-master-maria.webp",
      "/templates/gloss/gloss-master-elena.webp",
    ],
    membership_image_url: "/templates/gloss/gloss-club.webp",
    membership_image_urls: [
      "/templates/gloss/gloss-club.webp",
      "/templates/gloss/gloss-club.webp",
      "/templates/gloss/gloss-club.webp",
    ],
    gift_image_url: "/templates/gloss/gloss-gift.webp",
    gift_image_urls: [
      "/templates/gloss/gloss-gift.webp",
      "/templates/gloss/gloss-gift.webp",
      "/templates/gloss/gloss-gift.webp",
    ],
    hero_eyebrow: "МАНИКЮР · ПЕДИКЮР · ДИЗАЙН",
    hero_title: "Детали, которые меняют настроение",
    hero_text:
      "Бережный маникюр, стойкое покрытие и дизайн, который подходит именно вам.",
    booking_label: "Записаться онлайн",
    services_label: "Услуги",
    services_title: "Выберите уход",
    portfolio_label: "Дизайны",
    portfolio_title: "Найдите свой следующий цвет",
    popular_title: "Чаще выбирают",
    work_filters: "Все\nМинимализм\nFrench\nЯркие\nNail Art\nКороткие",
    team_label: "Мастера",
    team_title: "Ваши мастера",
    team_items:
      "Анна Лак · Маникюр и минимализм\nМария Глосс · Nail Art\nЕлена Френч · Маникюр и педикюр",
    reviews_label: "Отзывы",
    reviews_title: "После GLOSS",
    reviews_items:
      "Наконец-то нашла место, где тонкие ногти не перепиливают, а покрытие действительно держится. — Екатерина\nОчень аккуратно и спокойно. Маникюр идеальный даже через три недели. — Алина\nКрасивый салон, приятная команда и безупречная чистота. — Виктория",
    reviews: [
      {
        id: "review-ekaterina",
        author: "Екатерина",
        text: "Наконец-то нашла место, где тонкие ногти не перепиливают, а покрытие действительно держится.",
        rating: 5,
        source: "Google",
      },
      {
        id: "review-alina",
        author: "Алина",
        text: "Очень аккуратно и спокойно. Маникюр идеальный даже через три недели.",
        rating: 5,
        source: "Instagram",
      },
      {
        id: "review-victoria",
        author: "Виктория",
        text: "Красивый салон, приятная команда и безупречная чистота.",
        rating: 5,
        source: "Google",
      },
    ],
    membership_label: "GLOSS CLUB",
    membership_title: "Каждый пятый визит — особенный",
    membership_text:
      "Выберите формат участия, который подходит именно вам. Условия и преимущества можно менять в редакторе.",
    membership_items:
      "GLOSS START · После первого визита · История оттенков и сохранённые любимые дизайны · Вступить · #contact\n"
      + "GLOSS CLUB · После трёх визитов · Персональные предложения и приоритетная запись · Вступить · #contact\n"
      + "GLOSS VIP · После пяти визитов · Скидка 30% на каждый пятый визит и особые подарки · Вступить · #contact",
    gift_label: "Сертификаты",
    gift_title: "Подарите немного GLOSS",
    gift_text:
      "Электронный сертификат на услугу или любую сумму. Отправим получателю в выбранный день.",
    gift_items:
      "Сертификат 50 · 50 · Небольшой подарок для приятного знакомства с салоном · Выбрать · #contact\n"
      + "Сертификат 100 · 100 · Универсальный сертификат на услуги или уход · Выбрать · #contact\n"
      + "Своя сумма · Любая сумма · Выберите номинал, который подходит именно вам · Заказать · #contact",
    booking_title: "Красивые руки — в удобное время",
    booking_text:
      "Выберите услугу, мастера и дату. Свободные окна обновляются автоматически.",
    show_booking: true,
    safety_label: "ЗАБОТА В ДЕТАЛЯХ",
    safety_title: "Красиво и безопасно",
    safety_items:
      "✦ · Стерилизация · Полный цикл обработки инструментов\n◌ · Одноразовые материалы · Для вашего комфорта и безопасности\n◇ · Премиальные покрытия · Стойкость и насыщенный цвет",
    show_safety: true,
    faq_label: "Вопросы",
    faq_title: "Перед первым визитом",
    faq_items:
      "Как подготовиться к визиту? | Ничего специально делать не нужно — мастер позаботится обо всём.\nМожно прийти со своим дизайном? | Да, покажите референс при записи или мастеру перед процедурой.\nКак отменить запись? | Перенести или отменить визит можно не позднее чем за 24 часа.",
    pages: [{ ...GLOSS_PORTFOLIO_PAGE }],
    custom_blocks: [],
    about_label: "О салоне",
    about_title: "GLOSS — пространство красивых деталей",
    about_text:
      "Мы создали спокойное место, где профессиональный уход сочетается с вниманием к вашему стилю и комфорту.",
    about_image_url: "/templates/gloss/gloss-gallery-4.webp",
    about_facts:
      "5+ лет · опыта и внимательной работы\n1000+ · красивых визитов\n4.9 · средняя оценка клиентов",
    about_button_label: "Записаться",
    about_button_url: "#booking",
    contact_label: "Контакты",
    contact_title: "Будем рады видеть вас",
    contact_hours: "Ежедневно: 09:00–21:00",
    contact_address: "ул. Вишнёвая, 11",
    map_query: "ул. Вишнёвая, 11",
    show_services: true,
    show_portfolio: true,
    show_team: true,
    show_reviews: true,
    show_membership: true,
    show_gift: true,
    show_faq: true,
    show_about: true,
    show_contact: true,
    seo_title: "GLOSS — маникюрный салон",
    seo_description:
      "Маникюр, уход, дизайны, подарочные сертификаты и удобная онлайн-запись.",
    site_summary:
      "Маникюрный салон GLOSS: уход, дизайн ногтей, подарочные сертификаты и онлайн-запись.",
    seo_keywords:
      "маникюр, педикюр, nail art, дизайн ногтей, маникюрный салон",
    seo_image_url: "/templates/gloss/gloss-hero.webp",
    show_social_icons: true,
    social_links: [],
    seo_no_index: false,
  },
};

export const SITE_TEMPLATES: readonly SiteTemplate[] = [GLOSS_TEMPLATE];

export function applySiteTemplate(
  current: PublicSiteContent,
  template: SiteTemplate,
): PublicSiteContent {
  const next = {
    ...current,
    ...template.content,
    section_order: [...template.sectionOrder],
  };
  return {
    ...next,
    layout_order: resolvePublicSiteLayoutOrder(next),
  };
}
