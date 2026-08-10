import type { PublicSiteContent } from "./types.ts";
import { replaceTemplateContentPreservingEditorState } from "./template-native-section-state.ts";

export const VELORA_TEMPLATE_KEY = "velora-event-venue" as const;
export type VeloraItem = Record<string, string>;
export type VeloraContent = {
  version: 1; brand: string; navigation: VeloraItem[];
  hero: VeloraItem; availability: VeloraItem; venues: VeloraItem[]; formats: VeloraItem[];
  packages: VeloraItem[]; gallery: VeloraItem[]; catering: VeloraItem[]; planner: VeloraItem[];
  facts: VeloraItem[]; reviews: VeloraItem[]; faq: VeloraItem[]; contact: VeloraItem; footer: VeloraItem;
};
const asset = (name: string) => `/templates/velora/${name}.svg`;
export const DEFAULT_VELORA_CONTENT: VeloraContent = {
  version: 1, brand: "VELORA HOUSE",
  navigation: [{ label: "Залы", href: "#venues" }, { label: "Пакеты", href: "#packages" }, { label: "Галерея", href: "#gallery" }, { label: "Контакты", href: "#contact" }],
  hero: { eyebrow: "PRIVATE EVENT HOUSE · KYIV", title: "События, которым нужен свой дом.", text: "Три выразительных пространства, авторская кухня и команда, которая собирает вечер как цельную историю.", primaryLabel: "Проверить дату", primaryUrl: "#availability", secondaryLabel: "Посмотреть залы", secondaryUrl: "#venues", image: asset("hero"), alt: "Вечерний зал VELORA HOUSE с мягким золотым светом", traits: "до 220 гостей · 3 зала · центр города" },
  availability: { eyebrow: "ВАША ДАТА", title: "Начнём с главного", text: "Укажите детали — координатор проверит дату и вернётся с подходящими залами в течение рабочего дня.", submit: "Отправить заявку" },
  venues: [
    { name: "Grand Hall", capacity: "80–220 гостей", area: "420 м²", features: "Сцена · панорамные окна · отдельный вход", image: asset("grand-hall"), alt: "Grand Hall с банкетной сервировкой", cta: "Выбрать Grand Hall" },
    { name: "Garden Hall", capacity: "40–110 гостей", area: "240 м²", features: "Терраса · живые растения · дневной свет", image: asset("garden-hall"), alt: "Garden Hall с зеленью и террасой", cta: "Выбрать Garden Hall" },
    { name: "Private Salon", capacity: "12–36 гостей", area: "96 м²", features: "Камин · библиотека · приватный бар", image: asset("private-salon"), alt: "Камерный Private Salon", cta: "Выбрать Private Salon" },
  ],
  formats: ["Свадьбы", "Дни рождения", "Корпоративы", "Камерные ужины", "Презентации"].map((title, index) => ({ number: `0${index + 1}`, title, text: ["Церемония, ужин и танцы в единой драматургии.", "Личный сценарий — от семейного обеда до большой вечеринки.", "Командные вечера и приёмы с точным продакшеном.", "Chef’s table, свечи и приватность для самых близких.", "Свет, звук и архитектура для сильного первого впечатления."][index] })),
  packages: [
    { name: "Essential", price: "от €3 900", for: "до 50 гостей", includes: "Зал 8 часов · базовая сервировка · координатор · звук", cta: "Запросить Essential" },
    { name: "Signature", price: "от €7 500", for: "до 100 гостей", includes: "Зал 12 часов · welcome-зона · свет · меню Signature · декор", cta: "Запросить Signature" },
    { name: "Grand Celebration", price: "от €13 900", for: "до 220 гостей", includes: "Эксклюзивный день · два зала · полная команда · персональное меню", cta: "Запросить Grand" },
  ],
  gallery: ["gallery-ceremony", "gallery-dinner", "gallery-detail", "gallery-dance", "gallery-table", "gallery-night"].map((name, index) => ({ image: asset(name), alt: ["Церемония в Grand Hall", "Ужин при свечах", "Детали сервировки", "Танцевальный вечер", "Праздничный стол", "Ночной фасад VELORA HOUSE"][index] })),
  catering: [
    { title: "Seasonal", text: "Четыре курса и сезонные продукты", meta: "от €68 / гость" }, { title: "Signature", text: "Шесть курсов от шефа VELORA", meta: "от €96 / гость" },
    { title: "Beverage atelier", text: "Вино, коктейльная карта и безалкогольные пары", meta: "индивидуально" }, { title: "Cake & sweets", text: "Торт, dessert table и подача", meta: "от €12 / гость" },
  ],
  planner: [
    { number: "01", title: "Знакомство", text: "Дата, формат, гости и атмосфера." }, { number: "02", title: "Концепция", text: "Зал, меню, декор и технический план." },
    { number: "03", title: "Подготовка", text: "Координатор ведёт подрядчиков и тайминг." }, { number: "04", title: "Событие", text: "Команда встречает гостей и держит ритм вечера." },
  ],
  facts: [{ value: "220", label: "гостей" }, { value: "3", label: "зала" }, { value: "640+", label: "событий" }, { value: "11", label: "лет опыта" }],
  reviews: [{ quote: "VELORA услышала нас с первой встречи. В день свадьбы мы просто жили моментом.", author: "Анна и Марк", meta: "Свадьба · 96 гостей" }, { quote: "Редкий баланс эстетики и безупречной операционной работы.", author: "Elena Kovalska", meta: "Brand dinner · 140 гостей" }, { quote: "Private Salon оказался идеальным пространством для нашей семейной даты.", author: "Семья Левченко", meta: "Юбилей · 28 гостей" }],
  faq: [{ question: "Можно ли провести церемонию на территории?", answer: "Да. Доступны Grand Hall, терраса Garden Hall и камерная церемония в Private Salon." }, { question: "Есть ли пробное меню?", answer: "Для подтверждённых событий проводим дегустацию и финальную настройку подачи." }, { question: "Можно пригласить своих подрядчиков?", answer: "Да. Координатор заранее согласует доступ, монтаж и технические требования." }, { question: "Как бронируется дата?", answer: "После предложения дата фиксируется договором и депозитом. Форма на сайте создаёт заявку, но не блокирует календарь автоматически." }],
  contact: { eyebrow: "КОНТАКТ", title: "Ваш вечер может начаться здесь.", text: "Приходите увидеть свет, почувствовать масштаб и выбрать пространство.", address: "вул. Велика Житомирська, 24 · Київ", phone: "+380 44 555 24 24", email: "events@velora.house", hours: "Ежедневно · 10:00–21:00", map: "VELORA HOUSE · карта появится после подключения адреса", cta: "Проверить дату" },
  footer: { note: "Private events · Kyiv", copyright: "© 2026 VELORA HOUSE" },
};
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const object = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
export function resolveVeloraContent(content?: PublicSiteContent): VeloraContent {
  const defaults = clone(DEFAULT_VELORA_CONTENT); const raw = content?.template_content?.[VELORA_TEMPLATE_KEY];
  if (!object(raw)) return defaults; const source = raw as Partial<VeloraContent>;
  return { ...defaults, ...source, version: 1, hero: { ...defaults.hero, ...(object(source.hero) ? source.hero : {}) }, availability: { ...defaults.availability, ...(object(source.availability) ? source.availability : {}) }, contact: { ...defaults.contact, ...(object(source.contact) ? source.contact : {}) }, footer: { ...defaults.footer, ...(object(source.footer) ? source.footer : {}) }, navigation: Array.isArray(source.navigation) ? source.navigation : defaults.navigation, venues: Array.isArray(source.venues) ? source.venues : defaults.venues, formats: Array.isArray(source.formats) ? source.formats : defaults.formats, packages: Array.isArray(source.packages) ? source.packages : defaults.packages, gallery: Array.isArray(source.gallery) ? source.gallery : defaults.gallery, catering: Array.isArray(source.catering) ? source.catering : defaults.catering, planner: Array.isArray(source.planner) ? source.planner : defaults.planner, facts: Array.isArray(source.facts) ? source.facts : defaults.facts, reviews: Array.isArray(source.reviews) ? source.reviews : defaults.reviews, faq: Array.isArray(source.faq) ? source.faq : defaults.faq };
}
export function withVeloraContent(content: PublicSiteContent, value: VeloraContent, preserveEditorState = true) { return replaceTemplateContentPreservingEditorState(content, VELORA_TEMPLATE_KEY, clone(value) as unknown as Record<string, unknown>, preserveEditorState); }
