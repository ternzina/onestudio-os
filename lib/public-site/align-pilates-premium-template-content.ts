import type { PublicSiteContent, PublicSiteTypography } from "./types.ts";
import type { AlignPilatesNativeSectionId } from "./align-pilates-premium-template-contract.ts";
import { replaceTemplateContentPreservingEditorState } from "./template-native-section-state.ts";

export const ALIGN_PILATES_TEMPLATE_KEY = "align-pilates-studio" as const;
export type AlignPilatesItem = Record<string, string>;
export type AlignPilatesContent = {
  version: 1;
  headingTypography: Partial<Record<AlignPilatesNativeSectionId, PublicSiteTypography>>;
  brand: string;
  brandNote: string;
  navigation: AlignPilatesItem[];
  promo: string;
  headerCta: AlignPilatesItem;
  hero: AlignPilatesItem;
  formatsPresentation: AlignPilatesItem;
  formats: AlignPilatesItem[];
  benefits: AlignPilatesItem[];
  benefitsTitle: string;
  schedulePresentation: AlignPilatesItem;
  scheduleFilters: AlignPilatesItem[];
  schedule: AlignPilatesItem[];
  trainersPresentation: AlignPilatesItem;
  trainers: AlignPilatesItem[];
  trial: AlignPilatesItem;
  membershipsPresentation: AlignPilatesItem;
  memberships: AlignPilatesItem[];
  studioPresentation: AlignPilatesItem;
  studio: AlignPilatesItem[];
  testimonial: AlignPilatesItem;
  faqPresentation: AlignPilatesItem;
  faq: AlignPilatesItem[];
  contacts: AlignPilatesItem;
  footer: AlignPilatesItem;
};

const root = "/templates/align-pilates";

export const DEFAULT_ALIGN_PILATES_CONTENT: AlignPilatesContent = {
  version: 1,
  headingTypography: {},
  brand: "ALIGN",
  brandNote: "PILATES STUDIO",
  promo: "Первое занятие на реформере со скидкой 30%",
  navigation: [
    { label: "Занятия", href: "#classes" }, { label: "Расписание", href: "#schedule" },
    { label: "Тренеры", href: "#trainers" }, { label: "Абонементы", href: "#plans" },
    { label: "О студии", href: "#studio" }, { label: "Контакты", href: "#contacts" },
  ],
  headerCta: { label: "Записаться", href: "#trial" },
  hero: {
    eyebrow: "СИЛА · БАЛАНС · ДВИЖЕНИЕ", title: "Тело, в котором\nлегко жить",
    text: "Пилатес на реформерах и матах для силы, гибкости и бережного возвращения к себе.",
    primaryLabel: "Попробовать занятие", primaryUrl: "#trial", secondaryLabel: "Посмотреть расписание", secondaryUrl: "#schedule",
    note: "Группы до 6 человек · персональное внимание · можно начать с нуля", image: `${root}/hero.webp`,
    alt: "Занятие пилатесом на реформерах", badgeNumber: "6", badgeText: "мест в группе",
  },
  formatsPresentation: { title: "Найдите свой формат", text: "От первого знакомства до персональной практики", cta: "Подробнее" },
  formats: [
    { title: "Reformer Start", text: "Знакомство с тренажёром и основами", meta: "50 минут · от 650 ₴", image: `${root}/format-reformer-start.webp`, alt: "Базовое занятие на реформере" },
    { title: "Reformer Flow", text: "Сила, контроль и плавное движение", meta: "50 минут · от 700 ₴", image: `${root}/format-reformer-flow.webp`, alt: "Динамичное занятие на реформере" },
    { title: "Mat Pilates", text: "Работа с весом собственного тела", meta: "50 минут · от 550 ₴", image: `${root}/format-mat.webp`, alt: "Занятие пилатесом на мате" },
    { title: "Personal", text: "Индивидуальная программа с тренером", meta: "50 минут · от 1 200 ₴", image: `${root}/format-personal.webp`, alt: "Персональное занятие пилатесом" },
  ],
  benefitsTitle: "Не про идеальную форму. Про хорошее самочувствие.",
  benefits: [{ icon: "⌁", label: "Сильный центр" }, { icon: "↟", label: "Здоровая осанка" }, { icon: "✦", label: "Гибкость" }, { icon: "≈", label: "Меньше напряжения" }],
  schedulePresentation: { eyebrow: "РАСПИСАНИЕ", title: "Выберите своё время", cta: "Всё расписание" },
  scheduleFilters: [{ label: "Все занятия" }, { label: "Reformer" }, { label: "Mat" }, { label: "Для начинающих" }],
  schedule: [
    { time: "Пн · 09:00", className: "Reformer Start", trainer: "Елена Мартин", availability: "2 места", state: "ok" },
    { time: "Пн · 18:30", className: "Reformer Flow", trainer: "Анна Рай", availability: "Лист ожидания", state: "wait" },
    { time: "Вт · 10:00", className: "Mat Pilates", trainer: "Ольга Лис", availability: "4 места", state: "ok" },
    { time: "Ср · 19:00", className: "Reformer Start", trainer: "Елена Мартин", availability: "1 место", state: "ok" },
  ],
  trainersPresentation: { title: "Тренеры, которые видят вас" },
  trainers: [
    { name: "Елена Мартин", role: "Reformer Pilates", image: `${root}/trainer-elena.webp`, alt: "Тренер Елена Мартин" },
    { name: "Анна Рай", role: "Pilates Flow", image: `${root}/trainer-anna.webp`, alt: "Тренер Анна Рай" },
    { name: "Ольга Лис", role: "Mat & Mobility", image: `${root}/trainer-olga.webp`, alt: "Тренер Ольга Лис" },
  ],
  trial: { eyebrow: "ПЕРВОЕ ЗАНЯТИЕ", title: "Начните в удобном темпе", formatLabel: "Формат", formatPlaceholder: "Выберите формат", levelLabel: "Уровень", levelPlaceholder: "Выберите уровень", dateLabel: "Дата", timeLabel: "Время", submit: "Записаться на пробное", note: "Подтверждение и напоминание придут на email" },
  membershipsPresentation: { title: "Регулярность, которая работает", popular: "Популярно", termPrefix: "Срок действия", cta: "Выбрать" },
  memberships: [{ name: "4 занятия", price: "2 400 ₴", term: "30 дней" }, { name: "8 занятий", price: "4 400 ₴", term: "60 дней" }, { name: "Unlimited", price: "6 900 ₴", term: "30 дней" }],
  studioPresentation: { title: "Пространство ALIGN", text: "Свет, дерево, воздух и всё необходимое для спокойной практики" },
  studio: Array.from({ length: 5 }, (_, index) => ({ image: `${root}/studio-${index + 1}.webp`, alt: `Интерьер студии ALIGN ${index + 1}` })),
  testimonial: { title: "После занятия", quote: "Я пришла из-за боли в спине, а осталась ради ощущения силы и спокойствия после каждой тренировки.", author: "Дарья, 34 года" },
  faqPresentation: { title: "Перед первым визитом" },
  faq: [{ question: "Что взять с собой?", answer: "Удобную форму, носки с нескользящей стопой и воду. Всё остальное уже есть в студии." }, { question: "Можно ли без опыта?", answer: "Да. Для первого визита мы рекомендуем Reformer Start или персональное занятие." }, { question: "Как выбрать уровень?", answer: "Расскажите о своём опыте при записи, и администратор подберёт подходящий формат." }],
  contacts: { eyebrow: "КОНТАКТЫ", title: "Встретимся на реформере", hours: "Ежедневно: 07:00–21:00", address: "ул. Баланса, 8 · Киев", cta: "Построить маршрут", image: `${root}/map.webp`, alt: "Схема расположения ALIGN Pilates Studio" },
  footer: { text: "Движение без спешки. Сильное тело, спокойная голова и практика, к которой хочется возвращаться.", cta: "Записаться на первое занятие", visit: "Визит", address: "ул. Баланса, 8 · Киев", hours: "Ежедневно · 07:00–21:00", email: "hello@align-pilates.studio", phone: "+380 44 123 45 67", social: "Мы на связи", copyright: "© 2026 ALIGN Pilates Studio", privacy: "Политика конфиденциальности", rules: "Правила студии" },
};

export function createAlignPilatesEnglishContent(): AlignPilatesContent {
  const value = structuredClone(DEFAULT_ALIGN_PILATES_CONTENT);
  value.promo = "30% off your first reformer class";
  value.navigation = [{ label: "Classes", href: "#classes" }, { label: "Schedule", href: "#schedule" }, { label: "Trainers", href: "#trainers" }, { label: "Memberships", href: "#plans" }, { label: "Studio", href: "#studio" }, { label: "Contact", href: "#contacts" }];
  value.headerCta = { label: "Book now", href: "#trial" };
  value.hero = { ...value.hero, eyebrow: "STRENGTH · BALANCE · MOVEMENT", title: "A body that feels\nlike home", text: "Reformer and mat Pilates for strength, mobility and a gentle return to yourself.", primaryLabel: "Try a class", secondaryLabel: "View the schedule", note: "Groups of up to 6 · personal attention · beginners welcome", alt: "Pilates class on reformers", badgeText: "places per class" };
  value.formatsPresentation = { title: "Find your format", text: "From your first introduction to a personal practice", cta: "Learn more" };
  value.formats = value.formats.map((item, i) => ({ ...item, text: ["Meet the reformer and learn the foundations", "Strength, control and fluid movement", "Work with your own body weight", "A programme tailored to you"][i], meta: ["50 min · from ₴650", "50 min · from ₴700", "50 min · from ₴550", "50 min · from ₴1,200"][i], alt: ["Introductory reformer Pilates class", "Dynamic reformer Pilates class", "Mat Pilates class", "Personal Pilates session"][i] }));
  value.benefitsTitle = "Not about a perfect shape. About feeling good.";
  value.benefits = [{ icon: "⌁", label: "A stronger core" }, { icon: "↟", label: "Healthy posture" }, { icon: "✦", label: "Flexibility" }, { icon: "≈", label: "Less tension" }];
  value.schedulePresentation = { eyebrow: "SCHEDULE", title: "Choose your time", cta: "Full schedule" };
  value.scheduleFilters = [{ label: "All classes" }, { label: "Reformer" }, { label: "Mat" }, { label: "Beginners" }];
  value.schedule = value.schedule.map((item, i) => ({ ...item, time: ["Mon · 09:00", "Mon · 18:30", "Tue · 10:00", "Wed · 19:00"][i], trainer: ["Elena Martin", "Anna Ray", "Olga Lis", "Elena Martin"][i], availability: ["2 places", "Waitlist", "4 places", "1 place"][i] }));
  value.trainersPresentation.title = "Trainers who truly see you";
  value.trainers = value.trainers.map((item, i) => ({ ...item, name: ["Elena Martin", "Anna Ray", "Olga Lis"][i], alt: `ALIGN Pilates trainer ${["Elena Martin", "Anna Ray", "Olga Lis"][i]}` }));
  value.trial = { eyebrow: "YOUR FIRST CLASS", title: "Start at your own pace", formatLabel: "Format", formatPlaceholder: "Choose a format", levelLabel: "Level", levelPlaceholder: "Choose a level", dateLabel: "Date", timeLabel: "Time", submit: "Book a trial class", note: "Confirmation and a reminder will arrive by email" };
  value.membershipsPresentation = { title: "Consistency that works", popular: "Popular", termPrefix: "Valid for", cta: "Choose" };
  value.memberships = [{ name: "4 classes", price: "₴2,400", term: "30 days" }, { name: "8 classes", price: "₴4,400", term: "60 days" }, { name: "Unlimited", price: "₴6,900", term: "30 days" }];
  value.studioPresentation = { title: "The ALIGN space", text: "Light, wood, air and everything you need for a calm practice" };
  value.studio = value.studio.map((item, i) => ({ ...item, alt: `ALIGN Pilates Studio interior ${i + 1}` }));
  value.testimonial = { title: "After class", quote: "I came because of back pain and stayed for the feeling of strength and calm after every session.", author: "Daria, 34" };
  value.faqPresentation.title = "Before your first visit";
  value.faq = [{ question: "What should I bring?", answer: "Comfortable clothes, grip socks and water. Everything else is waiting for you at the studio." }, { question: "Can I start without experience?", answer: "Yes. We recommend Reformer Start or a personal session for your first visit." }, { question: "How do I choose my level?", answer: "Tell us about your experience when booking and our team will suggest the right format." }];
  value.contacts = { ...value.contacts, eyebrow: "CONTACT", title: "Meet us at the reformer", hours: "Daily: 07:00–21:00", address: "8 Balansu Street · Kyiv", cta: "Get directions", alt: "Map showing ALIGN Pilates Studio" };
  value.footer = { text: "Unhurried movement. A strong body, a calm mind and a practice worth returning to.", cta: "Book your first class", visit: "Visit", address: "8 Balansu Street · Kyiv", hours: "Daily · 07:00–21:00", email: value.footer.email, phone: value.footer.phone, social: "Stay connected", copyright: value.footer.copyright, privacy: "Privacy policy", rules: "Studio rules" };
  return value;
}

const clone = <T>(value: T): T => structuredClone(value);
const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const merge = <T>(fallback: T, value: unknown): T => {
  if (Array.isArray(fallback)) return (Array.isArray(value) ? value : fallback).map(clone) as T;
  if (isObject(fallback)) {
    const source = isObject(value) ? value : {};
    return Object.fromEntries(Object.entries(fallback).map(([key, item]) => [key, merge(item, source[key])])) as T;
  }
  return (typeof value === typeof fallback ? value : fallback) as T;
};

export function resolveAlignPilatesContent(content: PublicSiteContent): AlignPilatesContent {
  const locale = content.template_content?.[`${ALIGN_PILATES_TEMPLATE_KEY}:locale`] === "en" ? "en" : "ru";
  const fallback = locale === "en" ? createAlignPilatesEnglishContent() : DEFAULT_ALIGN_PILATES_CONTENT;
  return merge(fallback, content.template_content?.[ALIGN_PILATES_TEMPLATE_KEY]);
}

export function withAlignPilatesContent(content: PublicSiteContent, value: AlignPilatesContent, preserve = true): PublicSiteContent {
  return replaceTemplateContentPreservingEditorState(content, ALIGN_PILATES_TEMPLATE_KEY, value, preserve);
}
