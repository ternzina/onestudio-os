import type { PublicSiteContent } from "./types.ts";
import type { PublicSiteTypography } from "./types.ts";
import { replaceTemplateContentPreservingEditorState } from "./template-native-section-state.ts";
import type { BlacklineTattooNativeSectionId } from "./blackline-tattoo-premium-template-contract.ts";
import { richTextPlainText } from "./rich-text.ts";
export const BLACKLINE_TATTOO_TEMPLATE_KEY = "blackline-tattoo" as const;
const asset = (name: string) => `/templates/blackline-tattoo/${name}`;
type Item = { title: string; text: string; meta?: string; image?: string };
type Presentation = { title: string; text: string };
export type BlacklineTattooContent = { version: 1; headingTypography: Partial<Record<BlacklineTattooNativeSectionId, PublicSiteTypography>>; brand: string; brandNote: string; announcement: string; navigation: Item[]; headerCta: Item; hero: Item & { eyebrow: string; primaryLabel: string; primaryHref: string; secondaryLabel: string; secondaryHref: string; trust: string[]; image: string }; stylesPresentation: Presentation; styles: Item[]; artistsPresentation: Presentation; artists: (Item & { ctaLabel: string; ctaHref: string })[]; portfolio: { title: string; text: string; items: (Item & { category: string })[] }; consultation: Item & { image: string; ctaLabel: string; ctaHref: string; fields: string[]; success: string }; processPresentation: Presentation; process: Item[]; safety: Item & { items: string[] }; care: Item & { groups: { title: string; text: string }[] }; testimonialsPresentation: Presentation; testimonials: Item[]; faqPresentation: Presentation; faq: Item[]; contact: Item & { address: string; hours: string; phone: string; email: string; ctaLabel: string; ctaHref: string; image: string }; footer: { title: string; text: string; navigation: Item[]; address: string; phone: string; email: string; ctaLabel: string; ctaHref: string; copyright: string; credit: string } };
export const DEFAULT_BLACKLINE_TATTOO_CONTENT: BlacklineTattooContent = {
  version: 1, headingTypography: {}, brand: "BLACKLINE", brandNote: "TATTOO COLLECTIVE", announcement: "Консультация и разработка идеи · бесплатно",
  navigation: [{ title: "Работы", text: "#portfolio" }, { title: "Мастера", text: "#artists" }, { title: "Стили", text: "#styles" }, { title: "Процесс", text: "#process" }, { title: "Безопасность", text: "#safety" }, { title: "FAQ", text: "#faq" }, { title: "Контакты", text: "#contact" }], headerCta: { title: "Обсудить татуировку", text: "#consultation" },
  hero: { eyebrow: "TATTOO · ART · INDIVIDUALITY", title: "Твоя история. Одной линией.", text: "Создаём авторские татуировки, которые остаются актуальными дольше любых трендов.", primaryLabel: "Выбрать мастера", primaryHref: "#artists", secondaryLabel: "Смотреть работы", secondaryHref: "#portfolio", trust: ["Индивидуальный эскиз", "стерильность", "сопровождение после сеанса"], image: asset("black-ink.webp") },
  stylesPresentation: { title: "Найди свой стиль", text: "Выберите язык, на котором мастер расскажет вашу историю." }, styles: [{ title: "Fine Line", text: "Тонкие линии · деликатная графика", image: asset("black-ink.webp") }, { title: "Blackwork", text: "Графика · контраст · плотный чёрный", image: asset("noir-frame-campaign.webp") }, { title: "Realism", text: "Портреты · фактура · точные детали", image: asset("noir-frame-portrait.webp") }, { title: "Minimal", text: "Чистая идея · воздух · без лишнего", image: asset("noir-frame-campaign-alt.webp") }],
  artistsPresentation: { title: "Мастера BLACKLINE", text: "Четыре разных почерка. Один принцип: идея должна подходить человеку, а не ленте трендов." }, artists: [{ title: "Алекс Ворон", text: "Blackwork · Graphic", image: asset("noir-frame-portrait.webp"), ctaLabel: "Портфолио", ctaHref: "#consultation" }, { title: "Мира Лейн", text: "Fine Line · Botanica", image: asset("noir-frame-portrait-alt.webp"), ctaLabel: "Портфолио", ctaHref: "#consultation" }, { title: "Дан Марк", text: "Realism · Dark", image: asset("noir-frame-campaign.webp"), ctaLabel: "Портфолио", ctaHref: "#consultation" }, { title: "Ника Рэй", text: "Minimal · Lettering", image: asset("noir-frame-campaign-alt.webp"), ctaLabel: "Портфолио", ctaHref: "#consultation" }],
  portfolio: { title: "Последние работы", text: "Не выбирайте татуировку из каталога. Выберите язык, на котором мастер расскажет вашу историю.", items: [{ title: "Blackwork", text: "Blackwork", category: "Blackwork", image: asset("black-ink.webp") }, { title: "Fine Line", text: "Fine Line", category: "Fine Line", image: asset("noir-frame-portrait-alt.webp") }, { title: "Realism", text: "Realism", category: "Realism", image: asset("noir-frame-campaign.webp") }, { title: "Minimal", text: "Minimal", category: "Minimal", image: asset("noir-frame-booking.webp") }, { title: "Blackwork", text: "Blackwork", category: "Blackwork", image: asset("noir-frame-light-night.webp") }, { title: "Fine Line", text: "Fine Line", category: "Fine Line", image: asset("noir-frame-portrait.webp") }, { title: "Realism", text: "Realism", category: "Realism", image: asset("noir-frame-light-dusk.webp") }, { title: "Minimal", text: "Minimal", category: "Minimal", image: asset("noir-frame-campaign-alt.webp") }] },
  consultation: { title: "Расскажи, что хочешь сохранить", text: "Можно прийти с готовой идеей, несколькими референсами или одной фразой. Мы поможем собрать направление.", image: asset("noir-frame-booking.webp"), ctaLabel: "Отправить мастеру", ctaHref: "#consultation", fields: ["Имя", "Зона татуировки", "Размер", "Стиль", "Желаемая дата", "Опиши свою идею"], success: "Заявка принята в демо." },
  processPresentation: { title: "От идеи до готовой работы", text: "Спокойный и понятный путь от первой мысли до готовой татуировки." }, process: [{ title: "Знакомимся", text: "Обсуждаем идею, место, размер и характер будущей работы." }, { title: "Создаём эскиз", text: "Мастер собирает индивидуальный эскиз и согласовывает детали." }, { title: "Татуируем", text: "Работаем спокойно, стерильно и без спешки. Перерывы всегда возможны." }, { title: "Остаёмся на связи", text: "После сеанса отправляем памятку и отвечаем на вопросы по заживлению." }],
  safety: { title: "Спокойно, стерильно, внимательно", text: "Безопасность процедуры — часть хорошего сервиса, без медицинских обещаний.", items: ["Одноразовые расходные материалы", "Стерильное рабочее место", "Безопасность процедуры без медицинских обещаний", "Инструкции по уходу", "Сопровождение после сеанса"] },
  care: { title: "Дата закрепляется после предоплаты", text: "После согласования эскиза и мастера фиксируется дата.", groups: [{ title: "Подготовка", text: "Выспаться, поесть за 1–2 часа и прийти в удобной одежде." }, { title: "Уход после сеанса", text: "Персональные рекомендации мастера доступны после визита." }, { title: "Остаёмся на связи", text: "Если возникают вопросы по заживлению, остаёмся на связи." }] },
  testimonialsPresentation: { title: "Что говорят клиенты", text: "Истории людей, для которых татуировка стала своей." }, testimonials: [{ title: "Игорь · Москва · Blackwork", text: "«Мастер услышал не только идею, но и то, что я не смог сформулировать. Получилось очень моё.»" }],
  faqPresentation: { title: "Перед первым сеансом", text: "Ответы на частые вопросы перед консультацией и записью." }, faq: [{ title: "Сколько стоит татуировка?", text: "Стоимость зависит от размера, детализации, зоны и времени мастера. После короткой консультации мы называем диапазон и фиксируем условия до бронирования." }, { title: "Можно прийти со своим эскизом?", text: "Да. Мы можем сохранить вашу идею, доработать композицию или создать новый авторский эскиз на основе референсов." }, { title: "Как подготовиться к сеансу?", text: "Накануне лучше выспаться, не употреблять алкоголь, поесть за 1–2 часа до визита и прийти в удобной одежде, открывающей нужную зону." }, { title: "Что входит в предоплату?", text: "Предоплата закрепляет дату и работу мастера над эскизом. Финальные условия возврата и переноса всегда указываются до оплаты." }],
  contact: { title: "Заходи познакомиться", text: "Напишите нам — ответим на вопросы и подберём время для консультации.", address: "ул. Чёрная, 21", hours: "Ежедневно · 11:00–21:00", phone: "+00 000 000 00 00", email: "hello@blackline.demo", ctaLabel: "Записаться на консультацию", ctaHref: "#consultation", image: asset("noir-frame-light-dusk.webp") },
  footer: { title: "BLACKLINE", text: "Авторские татуировки одной линией.", navigation: [{ title: "Работы", text: "#portfolio" }, { title: "Мастера", text: "#artists" }, { title: "Стили", text: "#styles" }, { title: "Процесс", text: "#process" }, { title: "Безопасность", text: "#safety" }, { title: "FAQ", text: "#faq" }, { title: "Контакты", text: "#contact" }], address: "ул. Чёрная, 21", phone: "+00 000 000 00 00", email: "hello@blackline.demo", ctaLabel: "Обсудить татуировку", ctaHref: "#consultation", copyright: "© BLACKLINE Tattoo Collective", credit: "Сайт и система управления созданы на OneStudio OS" },
};
export function createBlacklineTattooEnglishContent(): BlacklineTattooContent { const v = structuredClone(DEFAULT_BLACKLINE_TATTOO_CONTENT); v.announcement = "Free consultation and idea development"; v.navigation = [{ title: "Works", text: "#portfolio" }, { title: "Artists", text: "#artists" }, { title: "Styles", text: "#styles" }, { title: "Process", text: "#process" }, { title: "Aftercare", text: "#care" }, { title: "Contact", text: "#contact" }]; v.headerCta = { ...v.headerCta, title: "Discuss your tattoo", text: "#consultation" }; v.hero = { ...v.hero, title: "Your story. In one line.", text: "We create authored tattoos that stay relevant longer than any trend.", primaryLabel: "Choose an artist", secondaryLabel: "View the work", trust: ["Custom sketch", "sterility", "after-session support"] }; v.stylesPresentation = { title: "Find your style", text: "Choose the language your artist will use to tell your story." }; v.styles = v.styles.map((x, i) => ({
  ...x,
  text: [
    "Fine lines · delicate graphics",
    "Graphic forms · contrast · dense black",
    "Portraits · texture · precise details",
    "Clean idea · breathing room · nothing extra",
  ][i] ?? x.text,
})); v.artistsPresentation = { title: "BLACKLINE artists", text: "Four distinct signatures. One principle: the idea should fit the person, not the trend feed." }; v.artists = v.artists.map((x, i) => ({ ...x, title: ["Alex Voron", "Mira Lane", "Dan Mark", "Nika Ray"][i], text: ["Blackwork · Graphic", "Fine Line · Botanica", "Realism · Dark", "Minimal · Lettering"][i], ctaLabel: "Portfolio" })); v.portfolio = { ...v.portfolio, title: "Selected work", text: "Do not choose a tattoo from a catalogue. Choose the language your artist will use to tell your story.", items: v.portfolio.items.map((x) => ({ ...x })) }; v.consultation = { ...v.consultation, title: "Tell us what you want to keep", text: "Bring a finished idea, a few references or one sentence. We will help shape the direction.", fields: ["Name", "Tattoo placement", "Size", "Style", "Preferred date", "Describe your idea"], ctaLabel: "Send to the artist", success: "Request received in demo." }; v.processPresentation = { title: "From idea to finished work", text: "A calm and clear path from the first thought to the finished tattoo." }; v.process = [{ title: "We meet", text: "We discuss the idea, placement, size and character of the future piece." }, { title: "We sketch", text: "Your artist builds a custom sketch and aligns the details with you." }, { title: "We tattoo", text: "We work calmly, hygienically and without rushing. Breaks are always possible." }, { title: "We stay in touch", text: "After the session we send aftercare notes and answer healing questions." }]; v.safety = { ...v.safety, title: "Calm, sterile, attentive", text: "Procedure safety is part of good service, without medical promises.", items: ["Single-use supplies", "A sterile workstation", "Procedure safety without medical promises", "Aftercare instructions", "Support after the session"] }; v.care = { ...v.care, title: "Your date is secured with a deposit", text: "Once the sketch and artist are approved, we lock in your date.", groups: [{ title: "Preparation", text: "Sleep well, eat 1–2 hours before and wear comfortable clothing." }, { title: "Aftercare", text: "Your artist's personal recommendations remain available after the visit." }, { title: "Stay in touch", text: "If questions come up during healing, we stay in touch." }] }; v.testimonialsPresentation = { title: "What clients say", text: "Stories from people whose tattoo became their own." }; v.testimonials = [{ title: "Igor · Moscow · Blackwork", text: "The artist heard not only the idea, but also what I could not put into words. It feels completely mine." }]; v.faqPresentation = { title: "Before your first session", text: "Answers to common questions before consultation and booking." }; v.faq = [{ title: "How much does a tattoo cost?", text: "It depends on size, detail, placement and the artist's time. After a short consultation we give a range and confirm the terms before booking." }, { title: "Can I bring my own sketch?", text: "Yes. We can keep your idea, refine the composition or create a new authored sketch from references." }, { title: "How should I prepare for a session?", text: "Sleep well the night before, avoid alcohol, eat 1–2 hours before and wear clothing that gives access to the placement." }, { title: "What does the deposit cover?", text: "The deposit secures the date and the artist's sketch work. Final transfer and cancellation terms are always stated before payment." }]; v.contact = { ...v.contact, title: "Come say hello", text: "Write to us with your questions and we will find a time for a consultation.", address: "21 Chernaya Street", hours: "Every day · 11:00–21:00", ctaLabel: "Book a consultation" }; v.footer = { ...v.footer, text: "Authored tattoos in one line.", navigation: v.navigation, address: "21 Chernaya Street", ctaLabel: "Discuss your tattoo", copyright: "© BLACKLINE Tattoo Collective", credit: "Website and management system by OneStudio OS" }; return v; }
function isBlacklineRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeBlacklineStoredValue(fallback: unknown, stored: unknown): unknown {
  if (Array.isArray(fallback)) {
    if (!Array.isArray(stored)) return structuredClone(fallback);
    return stored.map((value, index) =>
      index < fallback.length
        ? mergeBlacklineStoredValue(fallback[index], value)
        : value
    );
  }

  if (isBlacklineRecord(fallback)) {
    const source = isBlacklineRecord(stored) ? stored : {};
    const merged: Record<string, unknown> = {};

    for (const [key, fallbackValue] of Object.entries(fallback)) {
      merged[key] = mergeBlacklineStoredValue(fallbackValue, source[key]);
    }

    for (const [key, value] of Object.entries(source)) {
      if (!(key in merged)) merged[key] = value;
    }

    return merged;
  }

  return stored === undefined ? fallback : stored;
}

const BLACKLINE_PLAIN_TITLE_PATHS = [
  "hero.title",
  "stylesPresentation.title",
  "artistsPresentation.title",
  "portfolio.title",
  "consultation.title",
  "processPresentation.title",
  "safety.title",
  "care.title",
  "testimonialsPresentation.title",
  "faqPresentation.title",
  "contact.title",
  "footer.title",
] as const;

function normalizeBlacklinePlainTitles(value: BlacklineTattooContent): BlacklineTattooContent {
  const next = structuredClone(value);
  for (const path of BLACKLINE_PLAIN_TITLE_PATHS) {
    const keys = path.split(".");
    let target = next as unknown as Record<string, unknown>;
    for (const key of keys.slice(0, -1)) target = target[key] as Record<string, unknown>;
    const key = keys.at(-1)!;
    if (typeof target[key] === "string") target[key] = richTextPlainText(target[key] as string);
  }
  return next;
}

export function resolveBlacklineTattooContent(content: PublicSiteContent): BlacklineTattooContent {
  const stored = content.template_content?.[BLACKLINE_TATTOO_TEMPLATE_KEY];

  if (!isBlacklineRecord(stored)) {
    return DEFAULT_BLACKLINE_TATTOO_CONTENT;
  }

  return normalizeBlacklinePlainTitles(mergeBlacklineStoredValue(
    DEFAULT_BLACKLINE_TATTOO_CONTENT,
    stored,
  ) as BlacklineTattooContent);
}
export function withBlacklineTattooContent(content: PublicSiteContent, value: BlacklineTattooContent, preserve = true): PublicSiteContent { return replaceTemplateContentPreservingEditorState(content, BLACKLINE_TATTOO_TEMPLATE_KEY, value as unknown as Record<string, unknown>, preserve); }
