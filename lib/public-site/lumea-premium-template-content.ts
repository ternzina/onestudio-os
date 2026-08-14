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

const pexels = (id: string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1800`;

export const DEFAULT_LUMEA_CONTENT: LumeaContent = {
  version: 1,
  headingTypography: {},
  brand: "LUMÉA",
  navigation: [
    { label: "Уход", href: "#services" },
    { label: "Команда", href: "#experts" },
    { label: "Пространство", href: "#gallery" },
    { label: "Отзывы", href: "#reviews" },
    { label: "Контакты", href: "#contact" },
  ],
  announcement: {
    text: "Диагностика кожи и волос — комплимент к первому визиту",
  },
  header: {
    subbrand: "SKIN · HAIR · BEAUTY",
    cta: "Выбрать визит",
    menu: "Меню",
    close: "Закрыть",
  },
  hero: {
    eyebrow: "SKIN · HAIR · BROWS · RITUALS",
    title: "Салон, который начинается с вас",
    text: "Не собираем красоту по шаблону. Сначала слушаем, потом подбираем уход, форму, цвет и ритуал под ваш ритм.",
    primaryLabel: "Подобрать визит",
    primaryUrl: "#booking",
    secondaryLabel: "Исследовать уход",
    secondaryUrl: "#services",
    rating: "4,9 / 5 · 1 200+ визитов с возвращением",
    image: pexels("14996839"),
    alt: "Мягкий facial-массаж в тёплой атмосфере beauty studio",
  },
  servicesPresentation: {
    eyebrow: "SIGNATURE CARE",
    title: "Не прайс-лист. Четыре маршрута ухода.",
  },
  services: [
    {
      name: "Hair Atelier",
      price: "от 1 400 ₴",
      cta: "Волосы · цвет · форма",
      image: pexels("36553502"),
      alt: "Стилист работает с волосами клиентки в спокойном салоне",
    },
    {
      name: "Skin Rituals",
      price: "от 1 600 ₴",
      cta: "Уход · сияние · восстановление",
      image: pexels("3985332"),
      alt: "Профессиональный уход за кожей лица",
    },
    {
      name: "Brows & Lashes",
      price: "от 700 ₴",
      cta: "Архитектура · ламинирование · взгляд",
      image: pexels("29588096"),
      alt: "Деликатное оформление бровей",
    },
    {
      name: "Slow Beauty",
      price: "от 1 100 ₴",
      cta: "Ритуалы · массаж · reset",
      image: pexels("8834078"),
      alt: "Расслабляющий уход за волосами в салоне",
    },
  ],
  booking: {
    eyebrow: "PERSONAL APPOINTMENT",
    title: "Начните не с услуги, а с запроса",
    text: "Выберите направление и дату. На следующем шаге покажем подходящих специалистов и свободное время.",
    serviceLabel: "Направление",
    servicePlaceholder: "Выберите направление",
    masterLabel: "Специалист",
    masterPlaceholder: "Подберём на следующем шаге",
    dateLabel: "Дата",
    timeLabel: "Время",
    timePlaceholder: "Покажем после выбора даты",
    submit: "Продолжить",
    note: "Запись занимает меньше двух минут",
    image: pexels("7750104"),
    alt: "Светлое просторное пространство beauty studio",
  },
  expertsPresentation: {
    eyebrow: "THE PEOPLE",
    title: "Три эксперта. Один принцип — не переделывать вас.",
  },
  experts: [
    {
      name: "Анна Коваль",
      role: "Hair architect · color",
      image: pexels("33867522"),
      alt: "Анна Коваль, стилист LUMÉA",
    },
    {
      name: "София Марченко",
      role: "Skin therapist · facial",
      image: pexels("33867544"),
      alt: "София Марченко, skin therapist LUMÉA",
    },
    {
      name: "Елена Бондарь",
      role: "Brow & beauty artist",
      image: pexels("33867543"),
      alt: "Елена Бондарь, brow and beauty artist LUMÉA",
    },
  ],
  galleryPresentation: {
    eyebrow: "THE SPACE",
    title: "Тишина, свет и немного времени только для себя",
  },
  gallery: [
    {
      image: pexels("13068357"),
      alt: "Современная зона beauty studio LUMÉA",
    },
    {
      image: pexels("20263237"),
      alt: "Работа стилистов с цветом волос",
    },
    {
      image: pexels("3985332"),
      alt: "Профессиональный skin care",
    },
    {
      image: pexels("29588096"),
      alt: "Оформление бровей",
    },
    {
      image: pexels("8834078"),
      alt: "Уход за волосами в салоне",
    },
  ],
  reviewsPresentation: {
    eyebrow: "CLIENT NOTES",
    title: "Возвращаются не за трендом. За ощущением себя.",
  },
  reviews: [
    {
      rating: "★★★★★",
      quote: "Я впервые ушла из салона без ощущения, что из меня сделали другого человека. Цвет, кожа, форма — всё очень моё.",
      author: "Ирина С.",
    },
    {
      rating: "★★★★★",
      quote: "Здесь задают вопросы до процедуры, а не после. Для меня это главный признак хорошего сервиса.",
      author: "Ольга М.",
    },
    {
      rating: "★★★★★",
      quote: "Прихожу на facial, но каждый раз половина эффекта — от самого пространства. Очень спокойно.",
      author: "Наталья К.",
    },
  ],
  contact: {
    eyebrow: "VISIT LUMÉA",
    title: "Город снаружи. Пауза внутри.",
    hours: "Пн–Вс · 09:00–20:00",
    address: "ул. Центральная, 18",
    phone: "+38 (067) 123-45-67",
    cta: "Построить маршрут",
    facadeImage: pexels("13068357"),
    facadeAlt: "Современный интерьер LUMÉA Beauty Studio",
    mapLabel: "LUMÉA · центр города",
  },
  footer: {
    subbrand: "SKIN · HAIR · BEAUTY",
    instagram: "Instagram",
    facebook: "Facebook",
    telegram: "Telegram",
    note: "Website + booking + management · OneStudio OS",
    copyright: "© 2026 LUMÉA Beauty Studio",
  },
};

export const LUMEA_EN_CONTENT: LumeaContent = {
  ...structuredClone(DEFAULT_LUMEA_CONTENT),
  headingTypography: {},
  navigation: [
    { label: "Care", href: "#services" },
    { label: "Team", href: "#experts" },
    { label: "Space", href: "#gallery" },
    { label: "Reviews", href: "#reviews" },
    { label: "Contact", href: "#contact" },
  ],
  announcement: {
    text: "Skin & hair consultation — our welcome gift for your first visit",
  },
  header: {
    ...DEFAULT_LUMEA_CONTENT.header,
    cta: "Choose a visit",
    menu: "Menu",
    close: "Close",
  },
  hero: {
    ...DEFAULT_LUMEA_CONTENT.hero,
    eyebrow: "SKIN · HAIR · BROWS · RITUALS",
    title: "A studio that starts with you",
    text: "No copy-paste beauty. We listen first, then shape care, colour, form and ritual around your rhythm.",
    primaryLabel: "Find my visit",
    secondaryLabel: "Explore care",
    rating: "4.9 / 5 · 1,200+ returning visits",
    alt: "Gentle facial massage in a warm beauty studio",
  },
  servicesPresentation: {
    eyebrow: "SIGNATURE CARE",
    title: "Not a price list. Four paths of care.",
  },
  services: [
    {
      ...DEFAULT_LUMEA_CONTENT.services[0],
      cta: "Hair · colour · shape",
      alt: "Stylist working with a client's hair in a calm salon",
    },
    {
      ...DEFAULT_LUMEA_CONTENT.services[1],
      cta: "Care · glow · recovery",
      alt: "Professional facial skin treatment",
    },
    {
      ...DEFAULT_LUMEA_CONTENT.services[2],
      cta: "Architecture · lift · expression",
      alt: "Gentle professional eyebrow shaping",
    },
    {
      ...DEFAULT_LUMEA_CONTENT.services[3],
      cta: "Rituals · massage · reset",
      alt: "Relaxing hair care ritual in a salon",
    },
  ],
  booking: {
    ...DEFAULT_LUMEA_CONTENT.booking,
    eyebrow: "PERSONAL APPOINTMENT",
    title: "Start with what you need, not a service name",
    text: "Choose a direction and date. We will show the right experts and available times on the next step.",
    serviceLabel: "Direction",
    servicePlaceholder: "Choose a direction",
    masterLabel: "Expert",
    masterPlaceholder: "Matched on the next step",
    dateLabel: "Date",
    timeLabel: "Time",
    timePlaceholder: "Shown after the date",
    submit: "Continue",
    note: "Booking takes less than two minutes",
    alt: "Bright spacious LUMÉA beauty studio",
  },
  expertsPresentation: {
    eyebrow: "THE PEOPLE",
    title: "Three experts. One rule — never turn you into someone else.",
  },
  experts: [
    {
      ...DEFAULT_LUMEA_CONTENT.experts[0],
      name: "Anna Koval",
      role: "Hair architect · color",
      alt: "Anna Koval, LUMÉA stylist",
    },
    {
      ...DEFAULT_LUMEA_CONTENT.experts[1],
      name: "Sofiia Marchenko",
      role: "Skin therapist · facial",
      alt: "Sofiia Marchenko, LUMÉA skin therapist",
    },
    {
      ...DEFAULT_LUMEA_CONTENT.experts[2],
      name: "Olena Bondar",
      role: "Brow & beauty artist",
      alt: "Olena Bondar, LUMÉA brow and beauty artist",
    },
  ],
  galleryPresentation: {
    eyebrow: "THE SPACE",
    title: "Quiet, light, and a little time that is only yours",
  },
  gallery: DEFAULT_LUMEA_CONTENT.gallery.map((item, index) => ({
    ...item,
    alt: `LUMÉA beauty studio atmosphere ${index + 1}`,
  })),
  reviewsPresentation: {
    eyebrow: "CLIENT NOTES",
    title: "They return for the feeling, not the trend.",
  },
  reviews: [
    {
      rating: "★★★★★",
      quote: "For the first time I left a salon without feeling transformed into somebody else. Everything still felt unmistakably me.",
      author: "Iryna S.",
    },
    {
      rating: "★★★★★",
      quote: "They ask questions before the treatment, not after. That tells me everything about the level of care.",
      author: "Olha M.",
    },
    {
      rating: "★★★★★",
      quote: "I come for facials, but half the effect is the space itself. It is genuinely calm here.",
      author: "Natalia K.",
    },
  ],
  contact: {
    ...DEFAULT_LUMEA_CONTENT.contact,
    eyebrow: "VISIT LUMÉA",
    title: "The city outside. A pause inside.",
    hours: "Mon–Sun · 09:00–20:00",
    address: "18 Tsentralna Street",
    cta: "Get directions",
    facadeAlt: "Modern LUMÉA Beauty Studio interior",
    mapLabel: "LUMÉA · city centre",
  },
  footer: {
    ...DEFAULT_LUMEA_CONTENT.footer,
    note: "Website + booking + management · OneStudio OS",
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

