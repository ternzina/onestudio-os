import type { PublicSiteContent, PublicSiteTypography } from "./types.ts";
import type { RitmoDanceStudioNativeSectionId } from "./ritmo-dance-studio-premium-template-contract.ts";
import { replaceTemplateContentPreservingEditorState } from "./template-native-section-state.ts";

export const RITMO_DANCE_STUDIO_TEMPLATE_KEY = "ritmo-dance-studio" as const;
export type RitmoItem = Record<string, string>;
export type RitmoGallery = { eyebrow: string; title: string; imageAlt: string; images: string[] };
export type RitmoDanceStudioContent = {
  version: 1;
  headingTypography: Partial<Record<RitmoDanceStudioNativeSectionId, PublicSiteTypography>>;
  promo: string; brand: string; brandNote: string; menuLabel: string;
  navigation: RitmoItem[]; headerCta: RitmoItem; hero: RitmoItem;
  directionsPresentation: RitmoItem; directions: RitmoItem[];
  schedulePresentation: RitmoItem; schedule: RitmoItem[];
  coachesPresentation: RitmoItem; coaches: RitmoItem[];
  trial: RitmoItem; membershipsPresentation: RitmoItem; memberships: RitmoItem[];
  gallery: RitmoGallery; contact: RitmoItem; footer: RitmoItem;
};

export const DEFAULT_RITMO_DANCE_STUDIO_CONTENT: RitmoDanceStudioContent = {
  version: 1, headingTypography: {}, promo: "Пробный урок бесплатно до конца месяца", brand: "RITMO", brandNote: "DANCE STUDIO", menuLabel: "Меню",
  navigation: [{ label: "Направления", href: "#directions" }, { label: "Расписание", href: "#schedule" }, { label: "Тренеры", href: "#coaches" }, { label: "Абонементы", href: "#prices" }, { label: "Контакты", href: "#contact" }],
  headerCta: { label: "На пробный", href: "#trial" },
  hero: { eyebrow: "ТАНЕЦ · ДВИЖЕНИЕ · СВОБОДА", title: "Двигайся\nгромче", text: "Танцевальная студия для взрослых, где можно начать с нуля, раскрыться и стать частью сильного сообщества.", primaryLabel: "Попробовать бесплатно", primaryUrl: "#trial", secondaryLabel: "Смотреть шоу-рил", secondaryUrl: "#gallery", statOne: "8 направлений", statTwo: "11 тренеров", statThree: "7/7 занятия каждый день", stageLabel: "RITMO", stageSub: "dance studio", showreel: "Showreel · 01:28", image: "/templates/ritmo-dance-studio/hero.jpg", imageAlt: "Яркий постер танцовщицы RITMO" },
  directionsPresentation: { title: "Выбери своё направление", text: "Не нужно уметь танцевать, чтобы начать." },
  directions: [{ name: "Contemporary", note: "Свобода движения и эмоций", tag: "С нуля", tone: "violet", image: "/templates/ritmo-dance-studio/contemporary.jpg" }, { name: "Hip-Hop", note: "Ритм, энергия и свой стиль", tag: "Любой уровень", tone: "cyan", image: "/templates/ritmo-dance-studio/hiphop.jpg" }, { name: "High Heels", note: "Уверенность и пластика", tag: "18+", tone: "rose", image: "/templates/ritmo-dance-studio/heels.jpg" }, { name: "Latina", note: "Сальса, бачата и яркие эмоции", tag: "Любой уровень", tone: "coral", image: "/templates/ritmo-dance-studio/latina.jpg" }, { name: "Stretching", note: "Гибкость, сила и восстановление", tag: "С нуля", tone: "sand", image: "/templates/ritmo-dance-studio/stretching.jpg" }],
  schedulePresentation: { eyebrow: "РАСПИСАНИЕ", title: "Твоя неделя\nв RITMO", all: "Все", beginner: "Начинающим", advanced: "Продолжающим", cta: "Открыть всё расписание", ctaUrl: "#trial", seats: "места" },
  schedule: [{ day: "Пн", time: "18:30", title: "Contemporary Start", coach: "Анна Лис", level: "beginner", seats: "4" }, { day: "Вт", time: "19:00", title: "Hip-Hop Basic", coach: "Макс Рэй", level: "beginner", seats: "2" }, { day: "Ср", time: "20:00", title: "High Heels", coach: "София Марк", level: "advanced", seats: "6" }, { day: "Чт", time: "18:00", title: "Latina Solo", coach: "Диана Круз", level: "advanced", seats: "4" }],
  coachesPresentation: { title: "Люди, которые зажигают", text: "Сильные педагоги без пафоса и дистанции." },
  coaches: [{ name: "Анна Лис", role: "Contemporary", image: "/templates/ritmo-dance-studio/coach-anna.jpg" }, { name: "Макс Рэй", role: "Hip-Hop", image: "/templates/ritmo-dance-studio/coach-max.jpg" }, { name: "София Марк", role: "High Heels", image: "/templates/ritmo-dance-studio/coach-sofia.jpg" }, { name: "Диана Круз", role: "Latina", image: "/templates/ritmo-dance-studio/coach-diana.jpg" }],
  trial: { eyebrow: "ПРОБНЫЙ УРОК", title: "Первый шаг — просто прийти", successTitle: "Место почти твоё ✦", successLabel: "Заявка принята.", successText: "В настоящем сайте здесь подключается OneStudio OS: клиент, выбранное направление и время попадают в бронирование.", again: "Записать ещё одного", direction: "Направление", level: "Уровень", beginner: "С нуля", experienced: "Есть опыт", advanced: "Продвинутый", date: "Дата", time: "Время", submit: "Записаться бесплатно", note: "✦ Подтверждение и напоминание придут на email", image: "/templates/ritmo-dance-studio/trial.jpg", imageAlt: "Танцевальная группа RITMO" },
  membershipsPresentation: { eyebrow: "АБОНЕМЕНТЫ", title: "Танцуй в своём темпе", text: "Без скрытых условий. Заморозка включена, первое занятие бесплатно.", cta: "Выбрать", ctaUrl: "#trial" },
  memberships: [{ name: "Start", note: "4 занятия", price: "1 290 ₴" }, { name: "Move", note: "8 занятий", price: "2 290 ₴" }, { name: "Unlimited", note: "Безлимит на месяц", price: "3 590 ₴" }],
  gallery: { eyebrow: "ЖИЗНЬ СТУДИИ", title: "Мы в движении", imageAlt: "Жизнь танцевальной студии RITMO", images: Array.from({ length: 6 }, (_, index) => `/templates/ritmo-dance-studio/gallery-${index + 1}.jpg`) },
  contact: { eyebrow: "RITMO ВНЕ ЗАЛА", quote: "«Я пришла одна и очень боялась. Через месяц уже вышла на сцену вместе с группой.»", person: "Мария К.", role: "Contemporary", image: "/templates/ritmo-dance-studio/testimonial.jpg", imageAlt: "Мария, ученица RITMO", placeEyebrow: "ВСТРЕТИМСЯ В ЗАЛЕ", title: "Каждый день\n09:00–22:00", address: "ул. Ритма, 7 · центр города", cta: "Построить маршрут", ctaUrl: "#trial" },
  footer: { phone: "+38 (099) 123-45-67", email: "hello@ritmo.demo", credit: "Сайт и система управления созданы на", directions: "Направления", schedule: "Расписание", coaches: "Тренеры", memberships: "Абонементы", events: "События", contacts: "Контакты" },
};

export function createRitmoDanceStudioEnglishContent(): RitmoDanceStudioContent {
  const v = structuredClone(DEFAULT_RITMO_DANCE_STUDIO_CONTENT);
  v.promo = "Free trial class until the end of the month"; v.menuLabel = "Menu";
  v.navigation = [{ label: "Classes", href: "#directions" }, { label: "Schedule", href: "#schedule" }, { label: "Instructors", href: "#coaches" }, { label: "Memberships", href: "#prices" }, { label: "Contact", href: "#contact" }]; v.headerCta.label = "Book a trial";
  Object.assign(v.hero, { eyebrow: "DANCE · MOVEMENT · FREEDOM", title: "Move\nlouder", text: "A dance studio for adults where you can start from scratch, open up and become part of a strong community.", primaryLabel: "Try a class free", secondaryLabel: "Watch showreel", statOne: "8 styles", statTwo: "11 instructors", statThree: "7/7 classes every day", figureAlt: "Stylised dancing figure" });
  v.directionsPresentation = { title: "Find your style", text: "You do not need to know how to dance to begin." }; v.directions = v.directions.map((x, i) => ({ ...x, note: ["Freedom of movement and emotion", "Rhythm, energy and your own style", "Confidence and fluidity", "Salsa, bachata and vivid emotion", "Flexibility, strength and recovery"][i], tag: i === 2 ? "18+" : i === 0 || i === 4 ? "Beginner" : "All levels" }));
  Object.assign(v.schedulePresentation, { title: "Your week\nat RITMO", all: "All", beginner: "Beginners", advanced: "Experienced", cta: "View full schedule", seats: "spots" }); v.schedule = v.schedule.map((x, i) => ({ ...x, day: ["Mon", "Tue", "Wed", "Thu"][i] }));
  v.coachesPresentation = { title: "The people who light it up", text: "Strong teachers, without ego or distance." };
  Object.assign(v.trial, { title: "The first step is simply showing up", successTitle: "Your spot is almost yours ✦", successLabel: "Request received.", successText: "On a live site, OneStudio OS sends the client, chosen style and time into booking.", again: "Book another", direction: "Style", level: "Level", beginner: "Beginner", experienced: "Some experience", advanced: "Advanced", date: "Date", time: "Time", submit: "Book a free class", note: "✦ Confirmation and a reminder will arrive by email", figureAlt: "Stylised dance group" });
  v.membershipsPresentation = { eyebrow: "MEMBERSHIPS", title: "Dance at your own pace", text: "No hidden terms. Freezing is included and your first class is free.", cta: "Choose", ctaUrl: "#trial" }; v.memberships[0].note = "4 classes"; v.memberships[1].note = "8 classes"; v.memberships[2].note = "Unlimited for one month";
  v.gallery = { ...v.gallery, eyebrow: "STUDIO LIFE", title: "Always in motion" }; v.contact = { ...v.contact, eyebrow: "RITMO BEYOND THE FLOOR", quote: "“I came alone and was terrified. A month later I was already on stage with my group.”", person: "Maria K.", role: "Contemporary", placeEyebrow: "MEET US IN THE STUDIO", title: "Every day\n09:00–22:00", address: "7 Rhythm Street · city centre", cta: "Get directions", ctaUrl: "#trial" };
  v.footer = { ...v.footer, credit: "Website and management system by", directions: "Classes", schedule: "Schedule", coaches: "Instructors", memberships: "Memberships", events: "Events", contacts: "Contact" }; return v;
}

export function resolveRitmoDanceStudioContent(content: PublicSiteContent): RitmoDanceStudioContent { const stored = content.template_content?.[RITMO_DANCE_STUDIO_TEMPLATE_KEY]; return stored && typeof stored === "object" ? stored as RitmoDanceStudioContent : DEFAULT_RITMO_DANCE_STUDIO_CONTENT; }
export function withRitmoDanceStudioContent(content: PublicSiteContent, value: RitmoDanceStudioContent, preserve = true): PublicSiteContent { const next = replaceTemplateContentPreservingEditorState(content, RITMO_DANCE_STUDIO_TEMPLATE_KEY, value as unknown as Record<string, unknown>, preserve); return { ...next, template_content: { ...(next.template_content ?? {}), [`${RITMO_DANCE_STUDIO_TEMPLATE_KEY}:locale`]: content.template_content?.[`${RITMO_DANCE_STUDIO_TEMPLATE_KEY}:locale`] ?? "ru" } }; }
