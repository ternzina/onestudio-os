export type DemoGroup = "studio" | "beauty" | "wellness" | "education" | "events";

export type DemoPalette = {
  name: string;
  accent: string;
  dark: string;
  surface: string;
};

export type DemoDefinition = {
  slug: string;
  group: DemoGroup;
  name: string;
  businessName: string;
  title: { ru: string; en: string };
  description: { ru: string; en: string };
  promise: { ru: string; en: string };
  action: { ru: string; en: string };
  modules: string[];
  palettes: DemoPalette[];
  defaultLanguages: string[];
  currency: string;
};

export const DEMOS: readonly DemoDefinition[] = [
  {
    slug: "frame-house",
    group: "studio",
    name: "Frame House",
    businessName: "Frame House Studio",
    title: { ru: "Фотостудия", en: "Photo studio" },
    description: {
      ru: "Аренда залов, фотосессии, календарь и портфолио в одной системе.",
      en: "Studio rental, photo sessions, calendar and portfolio in one system.",
    },
    promise: { ru: "Пространство для ваших историй", en: "A space for your stories" },
    action: { ru: "Проверить свободное время", en: "Check availability" },
    modules: ["Сайт", "Аренда", "Фотосессии", "Календарь", "Оплата", "Портфолио"],
    palettes: [
      { name: "Editorial", accent: "#d9b78f", dark: "#28201c", surface: "#f5efe8" },
      { name: "Nordic", accent: "#a8c5c8", dark: "#233235", surface: "#edf3f2" },
      { name: "Mono", accent: "#d7d3cc", dark: "#171717", surface: "#f4f2ed" },
    ],
    defaultLanguages: ["Русский", "English"],
    currency: "EUR",
  },
  {
    slug: "lumiere",
    group: "beauty",
    name: "Lumière",
    businessName: "Lumière Beauty",
    title: { ru: "Салон красоты", en: "Beauty salon" },
    description: {
      ru: "Услуги, мастера, онлайн-запись, сертификаты и повторные визиты.",
      en: "Services, specialists, online booking, gift cards and return visits.",
    },
    promise: { ru: "Красота в вашем ритме", en: "Beauty at your pace" },
    action: { ru: "Записаться", en: "Book a visit" },
    modules: ["Сайт", "Услуги", "Мастера", "Онлайн-запись", "Сертификаты", "CRM"],
    palettes: [
      { name: "Rose", accent: "#e8b6a8", dark: "#552f3a", surface: "#fbf1ed" },
      { name: "Champagne", accent: "#d7bd88", dark: "#423a2d", surface: "#f7f2e8" },
      { name: "Berry", accent: "#d6a6bb", dark: "#3e2433", surface: "#f8edf3" },
    ],
    defaultLanguages: ["Русский", "English"],
    currency: "EUR",
  },
  {
    slug: "north-flow",
    group: "wellness",
    name: "North Flow",
    businessName: "North Flow Pilates",
    title: { ru: "Студия пилатеса", en: "Pilates studio" },
    description: {
      ru: "Направления, тренеры, абонементы, группы и расписание занятий.",
      en: "Programs, instructors, memberships, groups and class schedule.",
    },
    promise: { ru: "Сильное тело. Спокойный ум.", en: "Strong body. Quiet mind." },
    action: { ru: "Выбрать занятие", en: "Choose a class" },
    modules: ["Сайт", "Расписание", "Тренеры", "Группы", "Абонементы", "Оплата"],
    palettes: [
      { name: "Sky", accent: "#b5d4e5", dark: "#203b50", surface: "#eef5f7" },
      { name: "Sage", accent: "#b8cdb7", dark: "#2d4437", surface: "#eff4ee" },
      { name: "Sand", accent: "#d9c5a6", dark: "#4a3d31", surface: "#f6f1e9" },
    ],
    defaultLanguages: ["Русский", "English"],
    currency: "EUR",
  },
  {
    slug: "bloom-room",
    group: "events",
    name: "Bloom Room",
    businessName: "Bloom Room Atelier",
    title: { ru: "Цветочная мастерская", en: "Flower atelier" },
    description: {
      ru: "Букеты, доставка, мастер-классы, события и подарочные сертификаты.",
      en: "Bouquets, delivery, workshops, events and gift certificates.",
    },
    promise: { ru: "Цветы, которые говорят за вас", en: "Flowers that speak for you" },
    action: { ru: "Выбрать букет", en: "Choose flowers" },
    modules: ["Сайт", "Каталог", "Доставка", "Мастер-классы", "Оплата", "Сертификаты"],
    palettes: [
      { name: "Botanical", accent: "#d7c6a0", dark: "#344334", surface: "#f4f1e8" },
      { name: "Peony", accent: "#e5b7bd", dark: "#54353c", surface: "#fbf0f1" },
      { name: "Olive", accent: "#c6c58d", dark: "#3d432d", surface: "#f4f4e8" },
    ],
    defaultLanguages: ["Русский", "English"],
    currency: "EUR",
  },
  {
    slug: "little-orbit",
    group: "education",
    name: "Little Orbit",
    businessName: "Little Orbit Club",
    title: { ru: "Детский центр", en: "Children’s center" },
    description: {
      ru: "Программы, возрастные группы, преподаватели, пробные занятия и абонементы.",
      en: "Programs, age groups, teachers, trial classes and memberships.",
    },
    promise: { ru: "Место для больших открытий", en: "A place for big discoveries" },
    action: { ru: "Выбрать программу", en: "Choose a program" },
    modules: ["Сайт", "Программы", "Группы", "Расписание", "Абонементы", "CRM"],
    palettes: [
      { name: "Sun", accent: "#edc37f", dark: "#68493b", surface: "#fff6e6" },
      { name: "Play", accent: "#8bc7c5", dark: "#294e50", surface: "#eef8f6" },
      { name: "Berry", accent: "#d7a8be", dark: "#533247", surface: "#fbf0f5" },
    ],
    defaultLanguages: ["Русский", "English"],
    currency: "EUR",
  },
  {
    slug: "black-ink",
    group: "beauty",
    name: "Black Ink",
    businessName: "Black Ink Studio",
    title: { ru: "Тату-студия", en: "Tattoo studio" },
    description: {
      ru: "Мастера, стили, портфолио, консультации и бронирование сеансов.",
      en: "Artists, styles, portfolio, consultations and session booking.",
    },
    promise: { ru: "Идея становится частью вас", en: "Make the idea part of you" },
    action: { ru: "Выбрать мастера", en: "Choose an artist" },
    modules: ["Сайт", "Мастера", "Портфолио", "Консультации", "Запись", "Депозиты"],
    palettes: [
      { name: "Ink", accent: "#b9b5ae", dark: "#202020", surface: "#efede9" },
      { name: "Steel", accent: "#9eabb2", dark: "#222a2f", surface: "#edf0f1" },
      { name: "Wine", accent: "#b88e91", dark: "#382628", surface: "#f2ecec" },
    ],
    defaultLanguages: ["Русский", "English"],
    currency: "EUR",
  },
  {
    slug: "vow-films",
    group: "events",
    name: "Vow Films",
    businessName: "Vow Films",
    title: { ru: "Свадебная видеосъёмка", en: "Wedding films" },
    description: {
      ru: "Пакеты, проверка даты, портфолио, договоры, платежи и готовые галереи.",
      en: "Packages, date checks, portfolio, contracts, payments and client galleries.",
    },
    promise: { ru: "Ваш день. В движении и свете.", en: "Your day, in motion and light" },
    action: { ru: "Проверить дату", en: "Check the date" },
    modules: ["Сайт", "Портфолио", "Проверка даты", "Пакеты", "Договоры", "Галереи"],
    palettes: [
      { name: "Dusk", accent: "#c6cdea", dark: "#28344f", surface: "#f0f2fa" },
      { name: "Pearl", accent: "#d8cfbf", dark: "#403a34", surface: "#f8f5ef" },
      { name: "Forest", accent: "#aebca9", dark: "#303d31", surface: "#f0f3ed" },
    ],
    defaultLanguages: ["Русский", "English"],
    currency: "EUR",
  },
  {
    slug: "paw-club",
    group: "wellness",
    name: "Paw Club",
    businessName: "Paw Club Grooming",
    title: { ru: "Груминг-салон", en: "Grooming salon" },
    description: {
      ru: "Услуги по породам, мастера, карточки питомцев и напоминания о визите.",
      en: "Breed-based services, groomers, pet profiles and visit reminders.",
    },
    promise: { ru: "Забота, которую видно", en: "Care you can see" },
    action: { ru: "Записать питомца", en: "Book your pet" },
    modules: ["Сайт", "Услуги", "Мастера", "Карточки питомцев", "Запись", "Напоминания"],
    palettes: [
      { name: "Aqua", accent: "#9fd8cf", dark: "#23504c", surface: "#eef9f6" },
      { name: "Apricot", accent: "#edbd91", dark: "#59402e", surface: "#fcf4eb" },
      { name: "Lilac", accent: "#c9b8df", dark: "#413553", surface: "#f5f0fa" },
    ],
    defaultLanguages: ["Русский", "English"],
    currency: "EUR",
  },
] as const;

export function getDemo(slug: string) {
  return DEMOS.find((demo) => demo.slug === slug);
}
