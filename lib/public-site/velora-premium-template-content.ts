import type { PublicSiteContent } from "./types.ts";
import { replaceTemplateContentPreservingEditorState } from "./template-native-section-state.ts";

export const VELORA_TEMPLATE_KEY = "velora-event-venue" as const;
export type VeloraItem = Record<string, string>;
export type VeloraContent = {
  version: 1;
  brand: string;
  plum: string;
  navigation: VeloraItem[];
  header: VeloraItem;
  hero: VeloraItem;
  availability: VeloraItem;
  venuesPresentation: VeloraItem;
  venues: VeloraItem[];
  formatsPresentation: VeloraItem;
  formats: VeloraItem[];
  packagesPresentation: VeloraItem;
  packages: VeloraItem[];
  galleryPresentation: VeloraItem;
  gallery: VeloraItem[];
  cateringPresentation: VeloraItem;
  catering: VeloraItem[];
  plannerPresentation: VeloraItem;
  planner: VeloraItem[];
  facts: VeloraItem[];
  reviewsPresentation: VeloraItem;
  reviews: VeloraItem[];
  faqPresentation: VeloraItem;
  faq: VeloraItem[];
  contact: VeloraItem;
  footer: VeloraItem;
  customPages: VeloraItem;
};

const asset = (name: string) => `/templates/velora/${name}.svg`;

export const DEFAULT_VELORA_CONTENT: VeloraContent = {
  version: 1,
  brand: "VELORA HOUSE",
  plum: "#6D4055",
  navigation: [
    { label: "Залы", href: "#venues" },
    { label: "Пакеты", href: "#packages" },
    { label: "Галерея", href: "#gallery" },
    { label: "Контакты", href: "#contact" },
  ],
  header: {
    venuesPageLabel: "Сравнить залы",
    availabilityLabel: "Проверить дату",
  },
  hero: {
    eyebrow: "PRIVATE EVENT HOUSE · KYIV",
    title: "События, которым нужен свой дом.",
    text: "Три выразительных пространства, авторская кухня и команда, которая собирает вечер как цельную историю.",
    primaryLabel: "Проверить дату",
    primaryUrl: "#availability",
    secondaryLabel: "Посмотреть залы",
    secondaryUrl: "#venues",
    image: asset("hero"),
    alt: "Вечерний зал VELORA HOUSE с мягким золотым светом",
    traits: "до 220 гостей · 3 зала · центр города",
  },
  availability: {
    eyebrow: "ВАША ДАТА",
    title: "Начнём с главного",
    text: "Укажите детали — координатор проверит дату и вернётся с подходящими залами в течение рабочего дня.",
    dateLabel: "Дата",
    formatLabel: "Тип события",
    formatPlaceholder: "Выберите формат",
    guestsLabel: "Количество гостей",
    guestsPlaceholder: "80",
    venueLabel: "Зал",
    venuePlaceholder: "Выберите зал",
    packageLabel: "Пакет",
    packagePlaceholder: "Выберите пакет",
    nameLabel: "Ваше имя",
    emailLabel: "Email",
    phoneLabel: "Телефон",
    submit: "Отправить заявку",
    pending: "Отправляем…",
    idle: "Заявка не фиксирует дату без подтверждения координатора.",
    success: "Спасибо. Координатор свяжется с вами в течение рабочего дня.",
    error:
      "Не удалось отправить заявку. Проверьте данные или свяжитесь с нами по телефону.",
    ariaLabel: "Проверить свободную дату",
    subject: "Проверка даты",
  },
  venuesPresentation: {
    eyebrow: "ПРОСТРАНСТВА",
    title: "Три зала. Три характера.",
    pageLabel: "Подробное сравнение залов",
  },
  venues: [
    {
      name: "Grand Hall",
      capacity: "80–220 гостей",
      area: "420 м²",
      features: "Сцена · панорамные окна · отдельный вход",
      image: asset("grand-hall"),
      alt: "Grand Hall с банкетной сервировкой",
      cta: "Выбрать Grand Hall",
    },
    {
      name: "Garden Hall",
      capacity: "40–110 гостей",
      area: "240 м²",
      features: "Терраса · живые растения · дневной свет",
      image: asset("garden-hall"),
      alt: "Garden Hall с зеленью и террасой",
      cta: "Выбрать Garden Hall",
    },
    {
      name: "Private Salon",
      capacity: "12–36 гостей",
      area: "96 м²",
      features: "Камин · библиотека · приватный бар",
      image: asset("private-salon"),
      alt: "Камерный Private Salon",
      cta: "Выбрать Private Salon",
    },
  ],
  formatsPresentation: {
    eyebrow: "ФОРМАТЫ",
    title: "Сценарий начинается с вас",
  },
  formats: [
    "Свадьбы",
    "Дни рождения",
    "Корпоративы",
    "Камерные ужины",
    "Презентации",
  ].map((title, index) => ({
    number: `0${index + 1}`,
    title,
    text: [
      "Церемония, ужин и танцы в единой драматургии.",
      "Личный сценарий — от семейного обеда до большой вечеринки.",
      "Командные вечера и приёмы с точным продакшеном.",
      "Chef’s table, свечи и приватность для самых близких.",
      "Свет, звук и архитектура для сильного первого впечатления.",
    ][index],
  })),
  packagesPresentation: {
    eyebrow: "ПАКЕТЫ",
    title: "Основа, которую можно сделать личной",
    pageLabel: "Сравнить всё включённое",
  },
  packages: [
    {
      name: "Essential",
      price: "от €3 900",
      for: "до 50 гостей",
      includes: "Зал 8 часов · базовая сервировка · координатор · звук",
      cta: "Запросить Essential",
    },
    {
      name: "Signature",
      price: "от €7 500",
      for: "до 100 гостей",
      includes: "Зал 12 часов · welcome-зона · свет · меню Signature · декор",
      cta: "Запросить Signature",
    },
    {
      name: "Grand Celebration",
      price: "от €13 900",
      for: "до 220 гостей",
      includes:
        "Эксклюзивный день · два зала · полная команда · персональное меню",
      cta: "Запросить Grand",
    },
  ],
  galleryPresentation: {
    eyebrow: "ГАЛЕРЕЯ",
    title: "Свет, детали, движение",
    dialogLabel: "Просмотр галереи",
    closeLabel: "Закрыть",
    openLabel: "Открыть",
  },
  gallery: [
    "gallery-ceremony",
    "gallery-dinner",
    "gallery-detail",
    "gallery-dance",
    "gallery-table",
    "gallery-night",
  ].map((name, index) => ({
    image: asset(name),
    alt: [
      "Церемония в Grand Hall",
      "Ужин при свечах",
      "Детали сервировки",
      "Танцевальный вечер",
      "Праздничный стол",
      "Ночной фасад VELORA HOUSE",
    ][index],
  })),
  cateringPresentation: {
    eyebrow: "КУХНЯ",
    title: "Меню следует за настроением вечера",
  },
  catering: [
    {
      title: "Seasonal",
      text: "Четыре курса и сезонные продукты",
      meta: "от €68 / гость",
    },
    {
      title: "Signature",
      text: "Шесть курсов от шефа VELORA",
      meta: "от €96 / гость",
    },
    {
      title: "Beverage atelier",
      text: "Вино, коктейльная карта и безалкогольные пары",
      meta: "индивидуально",
    },
    {
      title: "Cake & sweets",
      text: "Торт, dessert table и подача",
      meta: "от €12 / гость",
    },
  ],
  plannerPresentation: {
    eyebrow: "ПЛАНИРОВЩИК",
    title: "Спокойная подготовка, точный вечер",
    text: "Личный координатор объединит декор, кейтеринг и техническое оснащение в один понятный план.",
  },
  planner: [
    {
      number: "01",
      title: "Знакомство",
      text: "Дата, формат, гости и атмосфера.",
    },
    {
      number: "02",
      title: "Концепция",
      text: "Зал, меню, декор и технический план.",
    },
    {
      number: "03",
      title: "Подготовка",
      text: "Координатор ведёт подрядчиков и тайминг.",
    },
    {
      number: "04",
      title: "Событие",
      text: "Команда встречает гостей и держит ритм вечера.",
    },
  ],
  facts: [
    { value: "220", label: "гостей" },
    { value: "3", label: "зала" },
    { value: "640+", label: "событий" },
    { value: "11", label: "лет опыта" },
  ],
  reviewsPresentation: {
    eyebrow: "ОТЗЫВЫ",
    title: "Что остаётся после вечера",
  },
  reviews: [
    {
      quote:
        "VELORA услышала нас с первой встречи. В день свадьбы мы просто жили моментом.",
      author: "Анна и Марк",
      meta: "Свадьба · 96 гостей",
    },
    {
      quote: "Редкий баланс эстетики и безупречной операционной работы.",
      author: "Elena Kovalska",
      meta: "Brand dinner · 140 гостей",
    },
    {
      quote:
        "Private Salon оказался идеальным пространством для нашей семейной даты.",
      author: "Семья Левченко",
      meta: "Юбилей · 28 гостей",
    },
  ],
  faqPresentation: { eyebrow: "FAQ", title: "До первой встречи" },
  faq: [
    {
      question: "Можно ли провести церемонию на территории?",
      answer:
        "Да. Доступны Grand Hall, терраса Garden Hall и камерная церемония в Private Salon.",
    },
    {
      question: "Есть ли пробное меню?",
      answer:
        "Для подтверждённых событий проводим дегустацию и финальную настройку подачи.",
    },
    {
      question: "Можно пригласить своих подрядчиков?",
      answer:
        "Да. Координатор заранее согласует доступ, монтаж и технические требования.",
    },
    {
      question: "Как бронируется дата?",
      answer:
        "После предложения дата фиксируется договором и депозитом. Форма на сайте создаёт заявку, но не блокирует календарь автоматически.",
    },
  ],
  contact: {
    eyebrow: "КОНТАКТ",
    title: "Ваш вечер может начаться здесь.",
    text: "Приходите увидеть свет, почувствовать масштаб и выбрать пространство.",
    address: "вул. Велика Житомирська, 24 · Київ",
    phone: "+380 44 555 24 24",
    email: "events@velora.house",
    hours: "Ежедневно · 10:00–21:00",
    map: "VELORA HOUSE · карта появится после подключения адреса",
    mapAria: "Местоположение площадки",
    cta: "Проверить дату",
  },
  footer: { note: "Private events · Kyiv", copyright: "© 2026 VELORA HOUSE" },
  customPages: {
    homeLabel: "Главная",
    venuesLabel: "Залы",
    packagesLabel: "Пакеты",
    areaLabel: "Площадь",
    formatLabel: "Формат",
    requestLabel: "Запросить предложение",
  },
};

const clone = <T>(value: T): T => structuredClone(value);
const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));
const text = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value : fallback;
const mergeObject = (fallback: VeloraItem, value: unknown): VeloraItem => {
  if (!isObject(value)) return clone(fallback);
  return Object.fromEntries(
    Object.entries(fallback).map(([key, defaultValue]) => [
      key,
      text(value[key], defaultValue),
    ]),
  );
};
const mergeItems = (fallback: VeloraItem[], value: unknown): VeloraItem[] => {
  if (!Array.isArray(value)) return clone(fallback);
  return fallback.map((item, index) => mergeObject(item, value[index]));
};

export function isSafeVeloraImageSrc(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const src = value.trim();
  return src.startsWith("/") || /^https:\/\//i.test(src);
}

export function resolveVeloraContent(
  content?: PublicSiteContent,
): VeloraContent {
  const defaults = clone(DEFAULT_VELORA_CONTENT);
  const raw = content?.template_content?.[VELORA_TEMPLATE_KEY];
  if (!isObject(raw)) return defaults;
  const source = raw as Partial<VeloraContent>;
  const objectKeys = [
    "header",
    "hero",
    "availability",
    "venuesPresentation",
    "formatsPresentation",
    "packagesPresentation",
    "galleryPresentation",
    "cateringPresentation",
    "plannerPresentation",
    "reviewsPresentation",
    "faqPresentation",
    "contact",
    "footer",
    "customPages",
  ] as const;
  const listKeys = [
    "navigation",
    "venues",
    "formats",
    "packages",
    "gallery",
    "catering",
    "planner",
    "facts",
    "reviews",
    "faq",
  ] as const;
  const result = {
    ...defaults,
    brand: text(source.brand, defaults.brand),
    plum: text(source.plum, defaults.plum),
  };
  for (const key of objectKeys)
    result[key] = mergeObject(defaults[key], source[key]);
  for (const key of listKeys)
    result[key] = mergeItems(defaults[key], source[key]);
  result.hero.image = isSafeVeloraImageSrc(result.hero.image)
    ? result.hero.image
    : defaults.hero.image;
  result.venues = result.venues.map((item, index) => ({
    ...item,
    image: isSafeVeloraImageSrc(item.image)
      ? item.image
      : defaults.venues[index].image,
  }));
  result.gallery = result.gallery.map((item, index) => ({
    ...item,
    image: isSafeVeloraImageSrc(item.image)
      ? item.image
      : defaults.gallery[index].image,
  }));
  return result;
}

export function withVeloraContent(
  content: PublicSiteContent,
  value: VeloraContent,
  preserveEditorState = true,
) {
  return replaceTemplateContentPreservingEditorState(
    content,
    VELORA_TEMPLATE_KEY,
    clone(value) as unknown as Record<string, unknown>,
    preserveEditorState,
  );
}
