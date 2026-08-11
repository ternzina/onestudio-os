import type {
  PublicSiteMediaAspect,
  PublicSiteMediaFit,
  PublicSiteMediaHeight,
  PublicSiteMediaLayoutSettings,
  PublicSiteMediaSize,
} from "./types.ts";

export type PremiumKidsNativeMedia = PublicSiteMediaLayoutSettings & {
  urls?: Record<string, string>;
};

export type PremiumKidsNativeMediaSlot = {
  id: string;
  label: string;
  defaultUrl: string;
  alt: string;
};

const root = "/images/demos/premium-kids-center";
const slot = (id: string, label: string, file: string, alt: string): PremiumKidsNativeMediaSlot => ({
  id,
  label,
  defaultUrl: `${root}/${file}`,
  alt,
});

const slotsByBlock = {
  hero: [
    slot("hero", "Главное изображение", "hero-platform.webp", "Дети вместе с педагогом создают геометрический город"),
  ],
  intro: [
    slot("interest-math", "Интересы · Математика", "math-manipulatives.webp", "Математические материалы"),
    slot("interest-reading", "Интересы · Чтение", "reading-story.webp", "Ребёнок читает историю"),
    slot("interest-creative", "Интересы · Творчество", "creative-studio.webp", "Творческая студия"),
    slot("interest-science", "Интересы · Эксперименты", "science-prism.webp", "Научный эксперимент"),
    slot("interest-world", "Интересы · Окружающий мир", "collaboration.webp", "Совместное исследование"),
    slot("interest-logic", "Интересы · Логика", "math-manipulatives.webp", "Логическая задача"),
    slot("interest-music", "Интересы · Музыка", "music-motion.webp", "Музыка и движение"),
    slot("interest-school", "Интересы · Подготовка к школе", "home-learning.webp", "Домашняя практика"),
    slot("task-add-100", "Задание · Сложение", "article-math.webp", "Задание по сложению"),
    slot("task-patterns", "Задание · Закономерности", "math-manipulatives.webp", "Математические закономерности"),
    slot("task-syllables", "Задание · Чтение по слогам", "reading-story.webp", "Чтение по слогам"),
    slot("task-space", "Задание · Форма и пространство", "collaboration.webp", "Изучение формы и пространства"),
    slot("workbook-cover", "Рабочая тетрадь", "workbook-cover.webp", "Обложка рабочей тетради"),
    slot("experiment-cloud", "Эксперимент · Облако", "science-prism.webp", "Эксперимент с облаком"),
    slot("experiment-rainbow", "Эксперимент · Радуга", "science-prism.webp", "Эксперимент со светом"),
    slot("experiment-bridge", "Эксперимент · Мост", "collaboration.webp", "Бумажный мост"),
    slot("experiment-music", "Эксперимент · Музыка", "music-motion.webp", "Рисование музыки"),
    slot("article-add-subtract-within-100", "Журнал · Математика", "article-math.webp", "Статья о математике"),
    slot("article-interest-without-pressure", "Журнал · Интерес без давления", "home-learning.webp", "Семейное обучение"),
    slot("article-reading-ritual", "Журнал · Семейное чтение", "reading-story.webp", "Семейное чтение"),
    slot("article-questions-science", "Журнал · Эксперименты", "science-prism.webp", "Научный вопрос"),
    slot("article-creative-mistakes", "Журнал · Творчество", "creative-studio.webp", "Творческий процесс"),
    slot("article-school-balance", "Журнал · Баланс", "collaboration.webp", "Совместная работа"),
  ],
  approach: [
    slot("approach", "Изображение пространства", "studio-interior.webp", "Светлый интерьер образовательной студии"),
  ],
  teachers: [
    slot("teacher-0", "Преподаватель 1", "teacher-elena.webp", "Преподаватель Елена"),
    slot("teacher-1", "Преподаватель 2", "teacher-jan.webp", "Преподаватель Ян"),
    slot("teacher-2", "Преподаватель 3", "creative-studio.webp", "Преподаватель Марта"),
    slot("teacher-3", "Преподаватель 4", "music-motion.webp", "Преподаватель Оливия"),
    slot("teacher-4", "Преподаватель 5", "reading-story.webp", "Преподаватель Адам"),
  ],
  gallery: [
    slot("gallery-0", "Галерея 1", "creative-studio.webp", "Творческое занятие"),
    slot("gallery-1", "Галерея 2", "science-prism.webp", "Научный эксперимент"),
    slot("gallery-2", "Галерея 3", "collaboration.webp", "Совместный проект"),
    slot("gallery-3", "Галерея 4", "music-motion.webp", "Музыка и движение"),
    slot("gallery-4", "Галерея 5", "studio-interior.webp", "Интерьер студии"),
  ],
  programs: [
    slot("programs", "Изображение программ", "studio-interior.webp", "Образовательная студия"),
  ],
} as const satisfies Record<string, readonly PremiumKidsNativeMediaSlot[]>;

const mediaSizes = new Set<PublicSiteMediaSize>(["full", "wide", "medium", "compact"]);
const mediaFits = new Set<PublicSiteMediaFit>(["cover", "contain"]);
const mediaAspects = new Set<PublicSiteMediaAspect>(["landscape", "classic", "square", "portrait"]);
const mediaHeights = new Set<PublicSiteMediaHeight>(["auto", "compact", "medium", "tall"]);

export function getPremiumKidsNativeMediaSlots(blockType: string): readonly PremiumKidsNativeMediaSlot[] {
  return slotsByBlock[blockType as keyof typeof slotsByBlock] ?? [];
}

export function premiumKidsNativeMediaUrl(
  media: PremiumKidsNativeMedia | undefined,
  slotId: string,
  fallback: string,
) {
  const override = media?.urls?.[slotId];
  return typeof override === "string" && override.trim() ? override : fallback;
}

const boundedPercent = (value: unknown) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.min(100, Math.max(0, value));
};

const isSafeMediaUrl = (value: string) => value.startsWith("/") || /^https?:\/\//i.test(value);

export function normalizePremiumKidsNativeMedia(
  value: unknown,
  blockType: string,
): PremiumKidsNativeMedia | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const source = value as Record<string, unknown>;
  const result: PremiumKidsNativeMedia = {};
  const allowedSlots = new Set(getPremiumKidsNativeMediaSlots(blockType).map((item) => item.id));
  if (source.urls && typeof source.urls === "object" && !Array.isArray(source.urls)) {
    const urls: Record<string, string> = {};
    for (const [key, rawUrl] of Object.entries(source.urls)) {
      if (allowedSlots.has(key) && typeof rawUrl === "string" && rawUrl.trim().length <= 2048 && isSafeMediaUrl(rawUrl.trim())) urls[key] = rawUrl.trim();
    }
    if (Object.keys(urls).length) result.urls = urls;
  }
  if (mediaSizes.has(source.media_size as PublicSiteMediaSize)) result.media_size = source.media_size as PublicSiteMediaSize;
  if (mediaFits.has(source.media_fit as PublicSiteMediaFit)) result.media_fit = source.media_fit as PublicSiteMediaFit;
  if (mediaFits.has(source.media_mobile_fit as PublicSiteMediaFit)) result.media_mobile_fit = source.media_mobile_fit as PublicSiteMediaFit;
  if (mediaAspects.has(source.media_aspect as PublicSiteMediaAspect)) result.media_aspect = source.media_aspect as PublicSiteMediaAspect;
  if (mediaAspects.has(source.media_mobile_aspect as PublicSiteMediaAspect)) result.media_mobile_aspect = source.media_mobile_aspect as PublicSiteMediaAspect;
  if (mediaHeights.has(source.media_height as PublicSiteMediaHeight)) result.media_height = source.media_height as PublicSiteMediaHeight;
  if (mediaHeights.has(source.media_mobile_height as PublicSiteMediaHeight)) result.media_mobile_height = source.media_mobile_height as PublicSiteMediaHeight;
  for (const key of ["media_focal_x", "media_focal_y", "media_mobile_focal_x", "media_mobile_focal_y", "media_opacity"] as const) {
    const normalized = boundedPercent(source[key]);
    if (normalized !== undefined) result[key] = normalized;
  }
  return Object.keys(result).length ? result : undefined;
}

export function hasPremiumKidsNativeMediaLayout(media: PremiumKidsNativeMedia | undefined) {
  return Boolean(media && Object.keys(media).some((key) => key !== "urls"));
}
