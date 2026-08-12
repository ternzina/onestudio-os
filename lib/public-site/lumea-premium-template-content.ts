import type { PublicSiteContent, PublicSiteTypography } from "./types.ts";
import type { LumeaNativeSectionId } from "./lumea-premium-template-contract.ts";
import { replaceTemplateContentPreservingEditorState } from "./template-native-section-state.ts";

export const LUMEA_TEMPLATE_KEY = "lumea-beauty" as const;
export type LumeaItem = Record<string, string>;
export type LumeaContent = {
  version: 1;
  headingTypography: Partial<Record<LumeaNativeSectionId, PublicSiteTypography>>;
  brand: string;
  navigation: LumeaItem[];
  announcement: LumeaItem;
  header: LumeaItem;
  hero: LumeaItem;
  servicesPresentation: LumeaItem;
  services: LumeaItem[];
  booking: LumeaItem;
  expertsPresentation: LumeaItem;
  experts: LumeaItem[];
  galleryPresentation: LumeaItem;
  gallery: LumeaItem[];
  reviewsPresentation: LumeaItem;
  reviews: LumeaItem[];
  contact: LumeaItem;
  footer: LumeaItem;
};

const gloss = (name: string) => `/templates/gloss/${name}.webp`;

export const DEFAULT_LUMEA_CONTENT: LumeaContent = {
  version: 1,
  headingTypography: {},
  brand: "LUMÉA",
  navigation: [
    { label: "Услуги", href: "#services" },
    { label: "Мастера", href: "#experts" },
    { label: "О салоне", href: "#gallery" },
    { label: "Отзывы", href: "#reviews" },
    { label: "Контакты", href: "#contact" },
  ],
  announcement: { text: "Первое посещение — скидка 15%" },
  header: {
    subbrand: "BEAUTY STUDIO",
    cta: "Записаться",
    menu: "Меню",
    close: "Закрыть",
  },
  hero: {
    eyebrow: "САЛОН КРАСОТЫ В ЦЕНТРЕ ГОРОДА",
    title: "Красота, в которой вы остаётесь собой",
    text: "Бережный уход, сильные мастера и пространство, куда хочется возвращаться.",
    primaryLabel: "Записаться онлайн",
    primaryUrl: "#booking",
    secondaryLabel: "Посмотреть услуги",
    secondaryUrl: "#services",
    rating: "★ 4,9 рейтинг · 1 200+ довольных клиентов",
    image: gloss("gloss-hero"),
    alt: "Клиентка салона красоты во время бережной процедуры ухода",
  },
  servicesPresentation: {
    eyebrow: "УСЛУГИ",
    title: "Выберите свою процедуру",
  },
  services: [
    {
      name: "Уход за волосами",
      price: "от 1 200 ₴",
      cta: "Подробнее",
      image: gloss("gloss-gallery-1"),
      alt: "Профессиональный уход за волосами",
    },
    {
      name: "Маникюр и педикюр",
      price: "от 800 ₴",
      cta: "Подробнее",
      image: gloss("gloss-gallery-2"),
      alt: "Аккуратный маникюр в салоне LUMÉA",
    },
    {
      name: "Косметология",
      price: "от 1 500 ₴",
      cta: "Подробнее",
      image: gloss("gloss-gallery-3"),
      alt: "Косметологическая процедура для лица",
    },
    {
      name: "Брови и ресницы",
      price: "от 600 ₴",
      cta: "Подробнее",
      image: gloss("gloss-gallery-4"),
      alt: "Оформление бровей и ресниц",
    },
  ],
  booking: {
    eyebrow: "ОНЛАЙН-ЗАПИСЬ",
    title: "Удобное время — за пару минут",
    text: "Выберите услугу и дату. Свободное время и мастера покажем на следующем шаге.",
    serviceLabel: "Услуга",
    servicePlaceholder: "Выберите услугу",
    masterLabel: "Мастер",
    masterPlaceholder: "Выберете на следующем шаге",
    dateLabel: "Дата",
    timeLabel: "Время",
    timePlaceholder: "Выберете после даты",
    submit: "Продолжить запись",
    note: "Подтверждение придёт на email и в мессенджер",
    image: gloss("gloss-gallery-5"),
    alt: "Тёплый светлый интерьер салона красоты LUMÉA",
  },
  expertsPresentation: {
    eyebrow: "КОМАНДА",
    title: "Мастера, которым доверяют",
  },
  experts: [
    {
      name: "Анна Коваль",
      role: "Стилист-колорист",
      image: gloss("gloss-master-anna"),
      alt: "Анна Коваль, стилист-колорист LUMÉA",
    },
    {
      name: "Мария Левченко",
      role: "Nail-мастер",
      image: gloss("gloss-master-maria"),
      alt: "Мария Левченко, nail-мастер LUMÉA",
    },
    {
      name: "Елена Бондарь",
      role: "Косметолог",
      image: gloss("gloss-master-elena"),
      alt: "Елена Бондарь, косметолог LUMÉA",
    },
  ],
  galleryPresentation: {
    eyebrow: "ПРОСТРАНСТВО",
    title: "Атмосфера LUMÉA",
  },
  gallery: [5, 6, 7, 8, 9].map((index) => ({
    image: gloss(`gloss-gallery-${index}`),
    alt: `Деталь интерьера и атмосферы LUMÉA ${index - 4}`,
  })),
  reviewsPresentation: {
    eyebrow: "ОТЗЫВЫ",
    title: "Нас рекомендуют",
  },
  reviews: [
    {
      rating: "★★★★★",
      quote: "Здесь всегда спокойно, красиво и очень заботливо. Наконец-то я нашла своих мастеров.",
      author: "Ирина С.",
    },
    {
      rating: "★★★★★",
      quote: "Прихожу за цветом и остаюсь ради ощущения, что обо мне действительно помнят.",
      author: "Ольга М.",
    },
    {
      rating: "★★★★★",
      quote: "Очень деликатная косметология, понятные рекомендации и никакой суеты.",
      author: "Наталья К.",
    },
  ],
  contact: {
    eyebrow: "КОНТАКТЫ",
    title: "Ждём вас",
    hours: "Пн–Вс: 09:00–20:00",
    address: "ул. Центральная, 18",
    phone: "+38 (067) 123-45-67",
    cta: "Построить маршрут",
    facadeImage: "/images/demos/bloom-room.webp",
    facadeAlt: "Фасад и тёплый вход в салон LUMÉA",
    mapLabel: "LUMÉA · центр города",
  },
  footer: {
    subbrand: "BEAUTY STUDIO",
    instagram: "Instagram",
    facebook: "Facebook",
    telegram: "Telegram",
    note: "Сайт и система управления созданы на OneStudio OS",
    copyright: "© 2026 LUMÉA Beauty Studio",
  },
};

export const LUMEA_EN_CONTENT: LumeaContent = {
  ...structuredClone(DEFAULT_LUMEA_CONTENT),
  headingTypography: {},
  navigation: [
    { label: "Services", href: "#services" },
    { label: "Experts", href: "#experts" },
    { label: "About", href: "#gallery" },
    { label: "Reviews", href: "#reviews" },
    { label: "Contact", href: "#contact" },
  ],
  announcement: { text: "First visit — 15% off" },
  header: { ...DEFAULT_LUMEA_CONTENT.header, cta: "Book now", menu: "Menu", close: "Close" },
  hero: {
    ...DEFAULT_LUMEA_CONTENT.hero,
    eyebrow: "BEAUTY STUDIO IN THE HEART OF THE CITY",
    title: "Beauty that still feels like you",
    text: "Thoughtful care, skilled experts and a space you will want to return to.",
    primaryLabel: "Book online",
    secondaryLabel: "Explore services",
    rating: "★ 4.9 rating · 1,200+ happy clients",
    alt: "Beauty studio client during a gentle skincare treatment",
  },
  servicesPresentation: { eyebrow: "SERVICES", title: "Choose your treatment" },
  services: [
    { ...DEFAULT_LUMEA_CONTENT.services[0], name: "Hair care", price: "from ₴1,200", cta: "Details", alt: "Professional hair care" },
    { ...DEFAULT_LUMEA_CONTENT.services[1], name: "Manicure & pedicure", price: "from ₴800", cta: "Details", alt: "Manicure at LUMÉA" },
    { ...DEFAULT_LUMEA_CONTENT.services[2], name: "Skincare", price: "from ₴1,500", cta: "Details", alt: "Facial skincare treatment" },
    { ...DEFAULT_LUMEA_CONTENT.services[3], name: "Brows & lashes", price: "from ₴600", cta: "Details", alt: "Brows and lashes treatment" },
  ],
  booking: {
    ...DEFAULT_LUMEA_CONTENT.booking,
    eyebrow: "ONLINE BOOKING",
    title: "A convenient time in just a few minutes",
    text: "Choose a service and date. Available times and experts appear on the next step.",
    serviceLabel: "Service",
    servicePlaceholder: "Choose a service",
    masterLabel: "Expert",
    masterPlaceholder: "Choose on the next step",
    dateLabel: "Date",
    timeLabel: "Time",
    timePlaceholder: "Choose after the date",
    submit: "Continue booking",
    note: "Confirmation will arrive by email and messenger",
    alt: "Warm bright LUMÉA beauty studio interior",
  },
  expertsPresentation: { eyebrow: "TEAM", title: "Experts you can trust" },
  experts: [
    { ...DEFAULT_LUMEA_CONTENT.experts[0], name: "Anna Koval", role: "Hair stylist & colorist", alt: "Anna Koval, LUMÉA hair stylist and colorist" },
    { ...DEFAULT_LUMEA_CONTENT.experts[1], name: "Maria Levchenko", role: "Nail artist", alt: "Maria Levchenko, LUMÉA nail artist" },
    { ...DEFAULT_LUMEA_CONTENT.experts[2], name: "Olena Bondar", role: "Esthetician", alt: "Olena Bondar, LUMÉA esthetician" },
  ],
  galleryPresentation: { eyebrow: "THE SPACE", title: "The LUMÉA atmosphere" },
  gallery: DEFAULT_LUMEA_CONTENT.gallery.map((item, index) => ({ ...item, alt: `LUMÉA interior and atmosphere ${index + 1}` })),
  reviewsPresentation: { eyebrow: "REVIEWS", title: "Recommended by our clients" },
  reviews: [
    { rating: "★★★★★", quote: "It always feels calm, beautiful and genuinely caring here. I finally found my people.", author: "Iryna S." },
    { rating: "★★★★★", quote: "I come for the colour and stay for the feeling that the team truly remembers me.", author: "Olha M." },
    { rating: "★★★★★", quote: "Gentle skincare, clear recommendations and never any rush.", author: "Natalia K." },
  ],
  contact: {
    ...DEFAULT_LUMEA_CONTENT.contact,
    eyebrow: "CONTACT",
    title: "Come and see us",
    hours: "Mon–Sun: 09:00–20:00",
    address: "18 Tsentralna Street",
    cta: "Get directions",
    facadeAlt: "Warm entrance to LUMÉA Beauty Studio",
    mapLabel: "LUMÉA · city centre",
  },
  footer: {
    ...DEFAULT_LUMEA_CONTENT.footer,
    note: "Website and management system powered by OneStudio OS",
  },
};

const clone = <T>(value: T): T => structuredClone(value);
const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));
const text = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value : fallback;
const mergeObject = (fallback: LumeaItem, value: unknown): LumeaItem =>
  !isObject(value)
    ? clone(fallback)
    : Object.fromEntries(
        Object.entries(fallback).map(([key, defaultValue]) => [key, text(value[key], defaultValue)]),
      );
const mergeItems = (fallback: LumeaItem[], value: unknown): LumeaItem[] =>
  !Array.isArray(value)
    ? clone(fallback)
    : fallback.map((item, index) => mergeObject(item, value[index]));

export function isSafeLumeaImageSrc(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const src = value.trim();
  return src.startsWith("/") || /^https:\/\//i.test(src);
}

const objectKeys = [
  "announcement",
  "header",
  "hero",
  "servicesPresentation",
  "booking",
  "expertsPresentation",
  "galleryPresentation",
  "reviewsPresentation",
  "contact",
  "footer",
] as const;
const listKeys = ["navigation", "services", "experts", "gallery", "reviews"] as const;

export function resolveLumeaContent(content?: PublicSiteContent): LumeaContent {
  const defaults = clone(DEFAULT_LUMEA_CONTENT);
  const raw = content?.template_content?.[LUMEA_TEMPLATE_KEY];
  if (!isObject(raw)) return defaults;
  const source = raw as Partial<LumeaContent>;
  const result: LumeaContent = {
    ...defaults,
    brand: text(source.brand, defaults.brand),
    headingTypography: isObject(source.headingTypography)
      ? (source.headingTypography as Partial<Record<LumeaNativeSectionId, PublicSiteTypography>>)
      : {},
  };
  for (const key of objectKeys) result[key] = mergeObject(defaults[key], source[key]);
  for (const key of listKeys) result[key] = mergeItems(defaults[key], source[key]);

  const objectImages: Array<["hero" | "booking" | "contact", string]> = [
    ["hero", "image"],
    ["booking", "image"],
    ["contact", "facadeImage"],
  ];
  for (const [key, field] of objectImages) {
    if (!isSafeLumeaImageSrc(result[key][field])) result[key][field] = defaults[key][field];
  }
  for (const key of ["services", "experts", "gallery"] as const) {
    result[key] = result[key].map((item, index) => ({
      ...item,
      image: isSafeLumeaImageSrc(item.image) ? item.image : defaults[key][index].image,
    }));
  }
  return result;
}

export function withLumeaContent(
  content: PublicSiteContent,
  value: LumeaContent,
  preserveEditorState = true,
) {
  return replaceTemplateContentPreservingEditorState(
    content,
    LUMEA_TEMPLATE_KEY,
    clone(value) as unknown as Record<string, unknown>,
    preserveEditorState,
  );
}

export function localizedLumeaContent(locale: string) {
  return clone(locale.toLowerCase().startsWith("en") ? LUMEA_EN_CONTENT : DEFAULT_LUMEA_CONTENT);
}
