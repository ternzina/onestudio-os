import {
  equipment,
  facts,
  faq,
  navigation,
  portfolio,
  processSteps,
  services,
  team,
  testimonials,
} from "../../app/demos/premium-studio/content.ts";
import type { PublicSiteContent } from "./types.ts";

export const PREMIUM_STUDIO_TEMPLATE_KEY = "premium-studio" as const;
export const PREMIUM_STUDIO_CONTENT_VERSION = 1 as const;

const brightBase = "/images/demos/premium-studio/bright";

type Scene = { word: string; time: string; caption: string; image: string };
type TourZone = { id: string; title: string; text: string };

export type PremiumStudioContent = {
  version: typeof PREMIUM_STUDIO_CONTENT_VERSION;
  brand: { first: string; second: string; location: string; email: string; monogram: string; period: string; marquee: string };
  hero: { eyebrow: string; lines: [string, string, string]; note: string; cta: string; image: string; folio: string };
  introduction: { eyebrow: string; title: string; text: string };
  navigation: Array<{ label: string; href: string }>;
  facts: Array<(typeof facts)[number]>;
  lightScene: { heading: string; imageAlt: string; scenes: Scene[] };
  servicesPresentation: { eyebrow: string; title: string; text: string; action: string };
  services: Array<Omit<(typeof services)[number], "meta"> & { meta: readonly string[] }>;
  portfolioPresentation: { eyebrow: string; title: string; text: string; projectAction: string; allProjectsAction: string };
  portfolio: Array<(typeof portfolio)[number]>;
  retouch: { eyebrow: string; title: string; text: string; beforeLabel: string; afterLabel: string; resetLabel: string; image: string; imageAlt: string };
  film: { eyebrow: string; title: string; hint: string };
  teamPresentation: { eyebrow: string; title: string; featureEyebrow: string; featureTitle: string; featureText: string; image: string; imageAlt: string };
  team: Array<(typeof team)[number]>;
  processPresentation: { eyebrow: string; title: string; text: string };
  process: Array<(typeof processSteps)[number]>;
  equipmentPresentation: { eyebrow: string; title: string; text: string; image: string; imageAlt: string };
  equipment: string[];
  tour: { eyebrow: string; title: string; text: string; fallbackCaption: string; loadingText: string; deferredText: string; image: string; imageAlt: string; zones: TourZone[] };
  reviewsPresentation: { eyebrow: string };
  testimonials: Array<(typeof testimonials)[number]>;
  faqPresentation: { eyebrow: string; title: string; text: string };
  faq: Array<(typeof faq)[number]>;
  emotional: { first: string; firstAccent: string; second: string; secondAccent: string; image: string };
  contact: { eyebrow: string; title: string; text: string; availabilityLabel: string; availabilityValue: string; cta: string; helper: string; image: string; folio: string };
  footer: { topLabel: string; demosLabel: string; copyrightYear: string };
};

export const DEFAULT_PREMIUM_STUDIO_CONTENT: PremiumStudioContent = {
  version: PREMIUM_STUDIO_CONTENT_VERSION,
  brand: { first: "NOIR", second: "FRAME", location: "Киев · Украина", email: "studio@example.com", monogram: "NF", period: "24—26", marquee: "NOIR FRAME · NOIR FRAME · NOIR FRAME ·" },
  hero: { eyebrow: "Фотостудия · Киев · 2026", lines: ["Свет", "решает", "всё."], note: "Пространство для тех, кто видит иначе.", cta: "Войти в свет", image: `${brightBase}/hero.webp`, folio: "№ 01" },
  introduction: { eyebrow: "Манифест / 01", title: "Мы не сдаём четыре стены. Мы ставим свет.", text: "Белая циклорама становится сценой. Утренний луч — соавтором. Тишина — частью кадра. Здесь изображение сначала чувствуют, и только потом снимают." },
  navigation: navigation.map(item => ({ ...item })),
  facts: facts.map(item => ({ ...item })),
  lightScene: {
    heading: "Один зал / четыре состояния",
    imageAlt: "Пространство студии NOIR FRAME в меняющемся естественном свете",
    scenes: [
      { word: "утро", time: "08:10", caption: "мягкий контур", image: `${brightBase}/scene-morning.webp` },
      { word: "полдень", time: "12:40", caption: "чистая геометрия", image: `${brightBase}/scene-noon.webp` },
      { word: "сумерки", time: "18:25", caption: "длинная тень", image: `${brightBase}/scene-dusk.webp` },
      { word: "ночь", time: "22:15", caption: "кобальтовая тишина", image: `${brightBase}/scene-night.webp` },
    ],
  },
  servicesPresentation: { eyebrow: "Форматы / 02", title: "Съёмочный\nномер.", text: "Выберите масштаб истории.\nОстальное соберём вокруг неё.", action: "Обсудить" },
  services: services.map(item => ({ ...item, meta: [...item.meta] })),
  portfolioPresentation: { eyebrow: "Избранное / 03", title: "Истории,\nоставшиеся в свете.", text: "Портреты, кампании и личные серии, созданные в NOIR FRAME.", projectAction: "Смотреть проект", allProjectsAction: "Всё портфолио" },
  portfolio: portfolio.map(item => ({ ...item })),
  retouch: { eyebrow: "Ретушь / интерактив", title: "От исходника\nдо финального света.", text: "Двигайте границу, чтобы увидеть деликатную работу с цветом, тоном и фактурой.", beforeLabel: "До обработки", afterLabel: "После обработки", resetLabel: "Вернуть 50%", image: portfolio[5].image, imageAlt: portfolio[5].alt },
  film: { eyebrow: "Контактная печать / 04", title: "Кадры между\nглавными кадрами.", hint: "Тяните плёнку · используйте колесо или стрелки" },
  teamPresentation: { eyebrow: "Мастера / 04", title: "Люди\nпо ту сторону камеры.", featureEyebrow: "Одна команда · разные взгляды", featureTitle: "Собираем съёмку целиком.", featureText: "Фотограф, арт-директор, стилист, визажист и продюсер работают как одна система, чтобы идея не потерялась между подготовкой и последним кадром.", image: `${brightBase}/team-group.webp`, imageAlt: "Команда фотографа, арт-директора и стилиста в светлой студии" },
  team: team.map(item => ({ ...item })),
  processPresentation: { eyebrow: "Процесс / 05", title: "От идеи\nдо серии.", text: "Вы всегда знаете, что происходит сейчас и какой шаг будет следующим." },
  process: processSteps.map(item => ({ ...item })),
  equipmentPresentation: { eyebrow: "Оснащение / 06", title: "Всё нужное.\nНичего лишнего.", text: "Пространство готово к работе команды любого масштаба — от личного портрета до кампании.", image: `${brightBase}/equipment.webp`, imageAlt: "Оснащённое пространство фотостудии NOIR FRAME" },
  equipment: [...equipment],
  tour: {
    eyebrow: "Пространство / интерактив", title: "Интерактивный\nтур по студии.", text: "Поверните макет и выберите активную точку. На мобильных показываем облегчённый обзор без тяжёлой графики.", fallbackCaption: "Циклорама · съёмочная зона · гримёрная · lounge", loadingText: "Готовим интерактивную сцену…", deferredText: "Интерактив загрузится при приближении", image: `${brightBase}/equipment.webp`, imageAlt: "Светлая студия NOIR FRAME с циклорамой и оборудованием",
    zones: [
      { id: "cyclorama", title: "Белая циклорама", text: "8 × 6 метров с мягким бесшовным переходом для fashion и предметных серий." },
      { id: "lights", title: "Съёмочная зона", text: "Импульсный и постоянный свет, флаги и мобильные стойки уже внутри пространства." },
      { id: "makeup", title: "Гримёрное место", text: "Два зеркала с точным светом, рейлы и отдельная зона подготовки образов." },
      { id: "lounge", title: "Зона ожидания", text: "Спокойный lounge для клиента и команды с обзором съёмочной площадки." },
    ],
  },
  reviewsPresentation: { eyebrow: "Говорят клиенты / 07" },
  testimonials: testimonials.map(item => ({ ...item })),
  faqPresentation: { eyebrow: "Вопросы / 08", title: "Перед\nсъёмкой.", text: "Если ответа нет здесь, напишите нам — ответим в течение рабочего дня." },
  faq: faq.map(item => ({ ...item })),
  emotional: { first: "Приходите", firstAccent: "с идеей.", second: "Уходите", secondAccent: "с историей.", image: `${brightBase}/emotional.webp` },
  contact: { eyebrow: "Бронирование / финал", title: "Ваша идея. Наш свет. Один день.", text: "Опишите задачу в нескольких строках. Мы ответим с форматом, командой и свободными датами.", availabilityLabel: "Ближайшее окно", availabilityValue: "14 / 08", cta: "Начать проект", helper: "Демо-интерфейс · откроется почтовый клиент", image: `${brightBase}/booking.webp`, folio: "03" },
  footer: { topLabel: "Наверх ↑", demosLabel: "Демо OneStudio OS", copyrightYear: "2026" },
};

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }

export function resolvePremiumStudioContent(content?: PublicSiteContent): PremiumStudioContent {
  const defaults = clone(DEFAULT_PREMIUM_STUDIO_CONTENT);
  const raw = content?.template_content?.[PREMIUM_STUDIO_TEMPLATE_KEY];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return defaults;
  const source = raw as Partial<PremiumStudioContent>;
  return {
    ...defaults,
    ...source,
    version: PREMIUM_STUDIO_CONTENT_VERSION,
    brand: { ...defaults.brand, ...source.brand },
    hero: { ...defaults.hero, ...source.hero },
    introduction: { ...defaults.introduction, ...source.introduction },
    lightScene: {
      ...defaults.lightScene,
      ...source.lightScene,
      scenes: defaults.lightScene.scenes.map((scene, index) => ({ ...scene, ...(source.lightScene?.scenes?.[index] ?? {}) })),
    },
    servicesPresentation: { ...defaults.servicesPresentation, ...source.servicesPresentation },
    portfolioPresentation: { ...defaults.portfolioPresentation, ...source.portfolioPresentation },
    retouch: { ...defaults.retouch, ...source.retouch },
    film: { ...defaults.film, ...source.film },
    teamPresentation: { ...defaults.teamPresentation, ...source.teamPresentation },
    processPresentation: { ...defaults.processPresentation, ...source.processPresentation },
    equipmentPresentation: { ...defaults.equipmentPresentation, ...source.equipmentPresentation },
    tour: { ...defaults.tour, ...source.tour, zones: source.tour?.zones?.length ? source.tour.zones : defaults.tour.zones },
    testimonials: source.testimonials?.length ? source.testimonials : defaults.testimonials,
    reviewsPresentation: { ...defaults.reviewsPresentation, ...source.reviewsPresentation },
    faqPresentation: { ...defaults.faqPresentation, ...source.faqPresentation },
    emotional: { ...defaults.emotional, ...source.emotional },
    contact: { ...defaults.contact, ...source.contact },
    footer: { ...defaults.footer, ...source.footer },
  };
}

export function withPremiumStudioContent(content: PublicSiteContent, premium: PremiumStudioContent): PublicSiteContent {
  return { ...content, template_content: { ...(content.template_content ?? {}), [PREMIUM_STUDIO_TEMPLATE_KEY]: clone(premium) } };
}

export function createPremiumStudioSeed() { return clone(DEFAULT_PREMIUM_STUDIO_CONTENT); }
