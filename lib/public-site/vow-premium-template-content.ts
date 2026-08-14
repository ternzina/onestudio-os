import type { PublicSiteContent, PublicSiteTypography } from "./types.ts";
import type { VowNativeSectionId } from "./vow-premium-template-contract.ts";
import { replaceTemplateContentPreservingEditorState } from "./template-native-section-state.ts";

export const VOW_TEMPLATE_KEY = "vow-films" as const;
export type VowItem = Record<string, string>;
export type VowContent = {
  version: 1;
  headingTypography: Partial<Record<VowNativeSectionId, PublicSiteTypography>>;
  brand: string;
  muted: string;
  elevated: string;
  border: string;
  warm: string;
  overlay: string;
  buttonForeground: string;
  navigation: VowItem[];
  header: VowItem;
  hero: VowItem;
  manifesto: VowItem;
  filmsPresentation: VowItem;
  films: VowItem[];
  story: VowItem;
  experiencePresentation: VowItem;
  experience: VowItem[];
  processPresentation: VowItem;
  process: VowItem[];
  packagesPresentation: VowItem;
  packages: VowItem[];
  galleryPresentation: VowItem;
  gallery: VowItem[];
  reviewsPresentation: VowItem;
  reviews: VowItem[];
  availability: VowItem;
  faqPresentation: VowItem;
  faq: VowItem[];
  contact: VowItem;
  footer: VowItem;
  customPages: VowItem;
};

const image = "/images/demos/vow-films.webp";

export const DEFAULT_VOW_CONTENT: VowContent = {
  version: 1,
  headingTypography: {},
  brand: "VOW FILMS",
  muted: "#AEB2B6",
  elevated: "#111B2A",
  border: "#A98D55",
  warm: "#E5C993",
  overlay: "#04080F",
  buttonForeground: "#09111D",
  navigation: [
    { label: "Фильмы", href: "#films" },
    { label: "Подход", href: "#experience" },
    { label: "Пакеты", href: "#packages" },
    { label: "Отзывы", href: "#reviews" },
  ],
  header: {
    eyebrow: "WEDDINGS & CELEBRATIONS",
    availabilityLabel: "Узнать, свободна ли дата",
  },
  hero: {
    eyebrow: "СВАДЕБНЫЕ ФИЛЬМЫ · EUROPE",
    title: "Ваш день. Ваша история. Ваш фильм.",
    text: "Снимаем свадьбы как живое кино: без постановочной суеты, с вниманием к голосам, взглядам и тому свету, который бывает только однажды.",
    primaryLabel: "Смотреть фильмы",
    primaryUrl: "#films",
    secondaryLabel: "Обсудить съёмку",
    secondaryUrl: "#availability",
    image,
    alt: "Кинематографичный кадр свадебной пары на закате",
    playLabel: "Showreel · 01:42",
    scrollLabel: "Листайте историю",
  },
  manifesto: {
    eyebrow: "VOW / 01",
    title: "Не отчёт о свадьбе. Фильм, в который хочется возвращаться.",
    text: "Мы оставляем в монтаже не только красивые кадры. Смех друзей перед церемонией, дрожь в голосе, шум города, паузы между словами. Именно они делают историю вашей.",
    quote: "Через годы важнее всего будет не помнить, как всё выглядело, а снова почувствовать, как это было.",
  },
  filmsPresentation: {
    eyebrow: "ИСТОРИИ, КОТОРЫЕ ОСТАЮТСЯ",
    title: "Три дня. Три разных ритма. Ни одного одинакового фильма.",
    text: "Каждая история строится вокруг пары, места и атмосферы дня, а не вокруг готового сценария.",
    pageLabel: "Смотреть все премьеры",
  },
  films: [
    { names: "Anna & Mark", location: "Lake Como · Italy", year: "2026", caption: "Тихое утро у воды, церемония в саду и длинный ужин при свечах.", cta: "Смотреть фильм", image, alt: "Свадебная история Anna и Mark у озера", position: "center 38%" },
    { names: "Mia & Daniel", location: "Provence · France", year: "2026", caption: "Тёплый ветер, семейный дом и праздник, который закончился уже после рассвета.", cta: "Смотреть фильм", image, alt: "Свадебная история Mia и Daniel во Франции", position: "center 56%" },
    { names: "Olivia & Leo", location: "Lisbon · Portugal", year: "2025", caption: "Город, океан и очень личная церемония без лишнего протокола.", cta: "Смотреть фильм", image, alt: "Свадебная история Olivia и Leo в Лиссабоне", position: "center 72%" },
  ],
  story: {
    eyebrow: "ПОЧЕМУ VOW",
    title: "Мы снимаем близко, но не мешаем жить вашему дню.",
    text: "Большую часть времени вы почти не замечаете камеры. Мы заранее изучаем расписание, свет и людей, чтобы в день свадьбы не превращать чувства в съёмочную площадку.",
    note: "Небольшая команда · discreet cameras · живой звук · монтаж вручную",
    image,
    alt: "Невеста и жених в естественном моменте свадебного дня",
  },
  experiencePresentation: {
    eyebrow: "THE EXPERIENCE",
    title: "Спокойствие до свадьбы. Присутствие в день. Предвкушение после.",
    text: "Работа начинается задолго до кнопки REC и заканчивается красивой премьерой, а не ссылкой на папку.",
  },
  experience: [
    { number: "01", title: "До свадьбы", text: "Короткий созвон, тайминг, важные люди, музыка и то, чего вы точно не хотите видеть в своём фильме." },
    { number: "02", title: "В день свадьбы", text: "Мы работаем тихо и быстро, ловим настоящее и не просим повторять эмоцию второй раз." },
    { number: "03", title: "После свадьбы", text: "Собираем голос, музыку и визуальный ритм в фильм, а затем устраиваем вашу маленькую премьеру." },
  ],
  processPresentation: {
    eyebrow: "ОТ ЗНАКОМСТВА ДО ПРЕМЬЕРЫ",
    title: "Понятный процесс без бесконечной переписки.",
  },
  process: [
    { number: "01", title: "Проверяем дату", text: "Вы оставляете дату и город. Мы отвечаем с доступностью и подходящим форматом." },
    { number: "02", title: "Знакомимся", text: "30 минут разговора о вас, атмосфере дня и том, что для вас действительно важно." },
    { number: "03", title: "Снимаем", text: "Приходим заранее, работаем по плану, но оставляем достаточно воздуха для настоящего." },
    { number: "04", title: "Премьера", text: "Вы получаете фильм в приватной онлайн-галерее и версию для близких." },
  ],
  packagesPresentation: {
    eyebrow: "ВЫБЕРИТЕ ФОРМАТ ФИЛЬМА",
    title: "От короткой истории до полного кинематографического архива дня.",
    text: "Пакеты задают объём, а не стиль. Каждый фильм остаётся индивидуальным.",
    pageLabel: "Сравнить пакеты",
  },
  packages: [
    { name: "Light", price: "900 €", length: "5–7 минут", hours: "до 6 часов", includes: "1 filmmaker · ceremony audio · online premiere", note: "Для камерной свадьбы или церемонии", cta: "Выбрать Light" },
    { name: "Story", price: "1 500 €", length: "10–14 минут", hours: "до 10 часов", includes: "2 filmmakers · drone where allowed · vows & speeches · teaser", note: "Самый популярный формат", cta: "Выбрать Story" },
    { name: "Cinema", price: "2 400 €", length: "18–25 минут", hours: "полный день", includes: "2 filmmakers · full ceremony & speeches · teaser · vertical edits", note: "Максимум деталей и живого звука", cta: "Выбрать Cinema" },
  ],
  galleryPresentation: {
    eyebrow: "ПОСЛЕДНИЕ ПРЕМЬЕРЫ",
    title: "Кадры, в которых слышно продолжение.",
    text: "Небольшая подборка из свежих историй VOW FILMS.",
  },
  gallery: [
    { title: "Before the vows", meta: "Lake Como · 2026", image, alt: "Утро перед свадебной церемонией", position: "center 28%" },
    { title: "Golden hour", meta: "Provence · 2026", image, alt: "Свадебная пара в золотом вечернем свете", position: "center 45%" },
    { title: "After dinner", meta: "Lisbon · 2025", image, alt: "Вечерний свадебный праздник", position: "center 64%" },
    { title: "Just married", meta: "Kyiv · 2026", image, alt: "Молодожёны после церемонии", position: "center 78%" },
  ],
  reviewsPresentation: {
    eyebrow: "ПОСЛЕ ПРЕМЬЕРЫ",
    title: "Самый любимый момент часто оказывается тем, которого вы даже не заметили.",
    disclaimer: "Имена и истории ниже — демонстрационный контент шаблона VOW FILMS.",
  },
  reviews: [
    { quote: "Мы включили фильм в пятницу вечером и через десять минут снова были там. Я вообще не помнила, как папа смотрел на меня перед церемонией.", author: "Anna & Mark · demo story", meta: "Lake Como" },
    { quote: "Никакой свадебной клиповости. Получилось очень про нас: спокойно, смешно и красиво ровно настолько, насколько был красив сам день.", author: "Mia & Daniel · demo story", meta: "Provence" },
    { quote: "Больше всего ценим звук. Голоса родителей и тосты друзей сделали фильм почти физическим воспоминанием.", author: "Olivia & Leo · demo story", meta: "Lisbon" },
  ],
  availability: {
    eyebrow: "ВАША ДАТА",
    title: "Расскажите о вашем событии.",
    text: "Проверим календарь и в течение одного рабочего дня пришлём доступность и два подходящих варианта съёмки.",
    dateLabel: "Дата",
    cityLabel: "Город / страна",
    packageLabel: "Формат",
    packagePlaceholder: "Выберите пакет",
    nameLabel: "Ваше имя",
    emailLabel: "E-mail",
    phoneLabel: "Телефон",
    messageLabel: "Что важно знать о свадьбе?",
    submit: "Проверить дату",
    pending: "Отправляем…",
    idle: "Запрос не бронирует дату и ни к чему не обязывает.",
    success: "Спасибо. Мы получили вашу историю и скоро вернёмся с доступностью.",
    error: "Не получилось отправить запрос. Попробуйте ещё раз или напишите нам напрямую.",
    ariaLabel: "Форма проверки даты VOW FILMS",
    subject: "Проверка даты VOW FILMS",
  },
  faqPresentation: {
    eyebrow: "ВОПРОСЫ ДО БРОНИРОВАНИЯ",
    title: "Всё важное — до того, как вы скажете «да» ещё раз.",
  },
  faq: [
    { question: "Вы снимаете только в Украине?", answer: "Нет. VOW FILMS — международный demo-бренд: шаблон рассчитан на съёмки по Европе и destination weddings." },
    { question: "Нужно ли позировать для видео?", answer: "Почти никогда. Мы можем мягко направить вас во время короткой прогулки, но большая часть фильма строится на настоящих событиях дня." },
    { question: "Когда будет готов фильм?", answer: "В демонстрационном процессе полная премьера запланирована в течение 8–12 недель, teaser — раньше." },
    { question: "Можно ли выбрать музыку?", answer: "Да. Мы обсуждаем направление заранее и используем лицензированную музыку, которая поддерживает ваш ритм, а не диктует его." },
    { question: "Как закрепляется дата?", answer: "После согласования пакета дата фиксируется договором и предоплатой. Сам запрос через форму дату не блокирует." },
  ],
  contact: {
    eyebrow: "READY WHEN YOU ARE",
    title: "Давайте создадим фильм, который будет старше ваших воспоминаний о деталях.",
    text: "Начнём с даты и короткого разговора. Всё остальное выстроим вокруг вас.",
    cta: "Проверить дату",
    secondary: "hello@vowfilms.demo",
    image,
    alt: "Свадебная пара у воды в вечернем свете",
  },
  footer: {
    note: "WEDDING FILMS · EUROPE",
    tagline: "Ваш день. В движении, голосах и свете.",
    topLabel: "Наверх",
    copyright: "© 2026 VOW FILMS · вымышленный демонстрационный бренд",
  },
  customPages: {
    homeLabel: "Главная",
    filmsLabel: "Фильмы",
    packagesLabel: "Пакеты",
    backLabel: "Назад к VOW FILMS",
  },
};

export function createVowEnglishContent(): VowContent {
  const value = structuredClone(DEFAULT_VOW_CONTENT);
  value.navigation = [
    { label: "Films", href: "#films" },
    { label: "Approach", href: "#experience" },
    { label: "Collections", href: "#packages" },
    { label: "Stories", href: "#reviews" },
  ];
  value.header = { eyebrow: "WEDDINGS & CELEBRATIONS", availabilityLabel: "Check your date" };
  value.hero = { ...value.hero, eyebrow: "WEDDING FILMS · EUROPE", title: "Your day. Your story. Your film.", text: "We film weddings as living cinema: quietly, attentively, holding on to voices, glances and the light that only happens once.", primaryLabel: "Watch films", secondaryLabel: "Tell us your story", alt: "Cinematic wedding couple at sunset", playLabel: "Showreel · 01:42", scrollLabel: "Enter the story" };
  value.manifesto = { eyebrow: "VOW / 01", title: "Not a wedding report. A film you will want to return to.", text: "We keep more than beautiful frames: the laughter before the ceremony, a trembling voice, city noise and the pauses between words. Those details make the story yours.", quote: "Years later, the most valuable thing is not remembering how it looked, but feeling how it felt." };
  value.filmsPresentation = { eyebrow: "STORIES THAT STAY", title: "Three days. Three rhythms. No two films alike.", text: "Every story grows from the couple, the place and the atmosphere instead of a preset formula.", pageLabel: "See all premieres" };
  value.films = value.films.map((item, index) => ({ ...item, caption: ["A quiet morning by the lake, a garden ceremony and a candlelit dinner.", "Warm wind, a family house and a party that slipped past sunrise.", "City, ocean and a deeply personal ceremony without unnecessary protocol."][index], cta: "Watch film" }));
  value.story = { ...value.story, eyebrow: "WHY VOW", title: "We film close, without getting in the way of your day.", text: "Most of the time you barely notice the cameras. We learn the timeline, light and important people in advance so the wedding never turns into a film set.", note: "Small crew · discreet cameras · live sound · hand-crafted edit", alt: "Wedding couple in a natural moment" };
  value.experiencePresentation = { eyebrow: "THE EXPERIENCE", title: "Calm before. Presence during. Anticipation after.", text: "The work starts long before REC and ends with a beautiful premiere, not a folder link." };
  value.experience = [
    { number: "01", title: "Before the wedding", text: "A short call, the timeline, your people, music and the things you definitely do not want in the film." },
    { number: "02", title: "On the wedding day", text: "We work quietly and quickly, catching what is real without asking anyone to repeat an emotion." },
    { number: "03", title: "After the wedding", text: "We shape voices, music and visual rhythm into a film, then prepare your private premiere." },
  ];
  value.processPresentation = { eyebrow: "FROM HELLO TO PREMIERE", title: "A clear process without endless messages." };
  value.process = [
    { number: "01", title: "Check the date", text: "Send your date and location. We reply with availability and the best-fit collection." },
    { number: "02", title: "Meet", text: "Thirty minutes about you, the mood of the day and what genuinely matters." },
    { number: "03", title: "Film", text: "We arrive early, follow the plan and leave enough space for real life." },
    { number: "04", title: "Premiere", text: "Your film arrives in a private online gallery with a version made for sharing." },
  ];
  value.packagesPresentation = { eyebrow: "CHOOSE YOUR FILM", title: "From a short story to a full cinematic archive of the day.", text: "Collections define the scope, never the style. Every film remains personal.", pageLabel: "Compare collections" };
  value.packages = [
    { ...value.packages[0], length: "5–7 minutes", hours: "up to 6 hours", note: "For an intimate wedding or ceremony", cta: "Choose Light" },
    { ...value.packages[1], length: "10–14 minutes", hours: "up to 10 hours", note: "Our most popular collection", cta: "Choose Story" },
    { ...value.packages[2], length: "18–25 minutes", hours: "full day", note: "Maximum detail and live sound", cta: "Choose Cinema" },
  ];
  value.galleryPresentation = { eyebrow: "LATEST PREMIERES", title: "Frames that still have a sound after them.", text: "A small selection from recent VOW FILMS stories." };
  value.reviewsPresentation = { eyebrow: "AFTER THE PREMIERE", title: "The favourite moment is often the one you never noticed on the day.", disclaimer: "Names and stories below are fictional demo content for VOW FILMS." };
  value.reviews = [
    { quote: "We pressed play on Friday night and ten minutes later we were there again. I had no memory of the way my dad looked at me before the ceremony.", author: "Anna & Mark · demo story", meta: "Lake Como" },
    { quote: "Nothing felt like a wedding music video. It felt like us: calm, funny and only as polished as the day itself.", author: "Mia & Daniel · demo story", meta: "Provence" },
    { quote: "The sound became everything. Our parents' voices and our friends' speeches turned the film into a physical memory.", author: "Olivia & Leo · demo story", meta: "Lisbon" },
  ];
  value.availability = { eyebrow: "YOUR DATE", title: "Tell us about your celebration.", text: "We will check the calendar and return within one working day with availability and two suitable filming options.", dateLabel: "Date", cityLabel: "City / country", packageLabel: "Collection", packagePlaceholder: "Choose a collection", nameLabel: "Your name", emailLabel: "E-mail", phoneLabel: "Phone", messageLabel: "What should we know about the wedding?", submit: "Check the date", pending: "Sending…", idle: "This enquiry does not reserve the date and comes with no obligation.", success: "Thank you. We have your story and will return with availability shortly.", error: "We could not send the enquiry. Please try again or write to us directly.", ariaLabel: "VOW FILMS date enquiry form", subject: "VOW FILMS date enquiry" };
  value.faqPresentation = { eyebrow: "BEFORE YOU BOOK", title: "Everything worth knowing before you say yes one more time." };
  value.faq = [
    { question: "Do you only film in Ukraine?", answer: "No. VOW FILMS is an international demo brand designed for European and destination weddings." },
    { question: "Do we have to pose for video?", answer: "Almost never. We can give gentle direction for a short portrait walk, but most of the film is built from real moments." },
    { question: "When will the film be ready?", answer: "The demo workflow plans a full premiere in 8–12 weeks, with a teaser delivered earlier." },
    { question: "Can we choose the music?", answer: "Yes. We discuss direction in advance and use licensed music that supports your rhythm rather than dictating it." },
    { question: "How is the date secured?", answer: "Once the collection is agreed, the date is secured with a contract and retainer. The enquiry itself does not hold the date." },
  ];
  value.contact = { ...value.contact, eyebrow: "READY WHEN YOU ARE", title: "Let us make a film that outlives the details you will eventually forget.", text: "Start with the date and a short conversation. We will build everything else around you.", cta: "Check your date", alt: "Wedding couple by the water in evening light" };
  value.footer = { note: "WEDDING FILMS · EUROPE", tagline: "Your day, in motion, voices and light.", topLabel: "Back to top", copyright: "© 2026 VOW FILMS · fictional demonstration brand" };
  value.customPages = { homeLabel: "Home", filmsLabel: "Films", packagesLabel: "Collections", backLabel: "Back to VOW FILMS" };
  return value;
}

const clone = <T>(value: T): T => structuredClone(value);
const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));
const text = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value : fallback;
const mergeObject = (fallback: VowItem, value: unknown): VowItem =>
  !isObject(value)
    ? clone(fallback)
    : Object.fromEntries(
        Object.entries(fallback).map(([key, defaultValue]) => [key, text(value[key], defaultValue)]),
      );
const mergeItems = (fallback: VowItem[], value: unknown): VowItem[] =>
  !Array.isArray(value)
    ? clone(fallback)
    : fallback.map((item, index) => mergeObject(item, value[index]));

export function isSafeVowImageSrc(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const src = value.trim();
  return src.startsWith("/") || /^https:\/\//i.test(src);
}

const objectKeys = [
  "header",
  "hero",
  "manifesto",
  "filmsPresentation",
  "story",
  "experiencePresentation",
  "processPresentation",
  "packagesPresentation",
  "galleryPresentation",
  "reviewsPresentation",
  "availability",
  "faqPresentation",
  "contact",
  "footer",
  "customPages",
] as const;
const listKeys = ["navigation", "films", "experience", "process", "packages", "gallery", "reviews", "faq"] as const;
const imageSlots: Array<[keyof VowContent, string]> = [
  ["hero", "image"],
  ["story", "image"],
  ["contact", "image"],
];

export function resolveVowContent(content?: PublicSiteContent): VowContent {
  const locale = content?.template_content?.[`${VOW_TEMPLATE_KEY}:locale`];
  const defaults = locale === "en" ? createVowEnglishContent() : clone(DEFAULT_VOW_CONTENT);
  const raw = content?.template_content?.[VOW_TEMPLATE_KEY];
  if (!isObject(raw)) return defaults;
  const source = raw as Partial<VowContent>;
  const result = {
    ...defaults,
    brand: text(source.brand, defaults.brand),
    muted: text(source.muted, defaults.muted),
    elevated: text(source.elevated, defaults.elevated),
    border: text(source.border, defaults.border),
    warm: text(source.warm, defaults.warm),
    overlay: text(source.overlay, defaults.overlay),
    buttonForeground: text(source.buttonForeground, defaults.buttonForeground),
    headingTypography: isObject(source.headingTypography)
      ? source.headingTypography as Partial<Record<VowNativeSectionId, PublicSiteTypography>>
      : {},
  };
  for (const key of objectKeys) result[key] = mergeObject(defaults[key], source[key]);
  for (const key of listKeys) result[key] = mergeItems(defaults[key], source[key]);
  for (const [key, field] of imageSlots) {
    const item = result[key] as VowItem;
    const fallback = defaults[key] as VowItem;
    item[field] = isSafeVowImageSrc(item[field]) ? item[field] : fallback[field];
  }
  for (const key of ["films", "gallery"] as const) {
    result[key] = result[key].map((item, index) => ({
      ...item,
      image: isSafeVowImageSrc(item.image) ? item.image : defaults[key][index].image,
    }));
  }
  return result;
}

export function withVowContent(
  content: PublicSiteContent,
  value: VowContent,
  preserveEditorState = true,
) {
  const next = replaceTemplateContentPreservingEditorState(
    content,
    VOW_TEMPLATE_KEY,
    clone(value) as unknown as Record<string, unknown>,
    preserveEditorState,
  );
  return {
    ...next,
    template_content: {
      ...(next.template_content ?? {}),
      [`${VOW_TEMPLATE_KEY}:locale`]: content.template_content?.[`${VOW_TEMPLATE_KEY}:locale`] ?? "ru",
    },
  };
}
