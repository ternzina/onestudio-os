import type { EditorInspectorPlacedField } from "./editor-spec.ts";
import type { VeloraContent } from "./velora-premium-template-content.ts";
import { DEFAULT_VELORA_CONTENT } from "./velora-premium-template-content.ts";
import type { VeloraNativeSectionId } from "./velora-premium-template-contract.ts";

type Spec = { id: string; label: string; path: keyof VeloraContent | `${keyof VeloraContent}.${string}`; keys?: string[]; media?: boolean; rows?: number };
const field = (id: string, label: string, path: Spec["path"], rows?: number): Spec => ({ id, label, path, rows });
const list = (id: string, label: string, path: keyof VeloraContent, keys: string[], rows = 8): Spec => ({ id, label, path, keys, rows });
export const VELORA_EDITOR_SPECS: Record<VeloraNativeSectionId, Spec[]> = {
  hero: [field("brand", "Название", "brand"), field("eyebrow", "Надзаголовок", "hero.eyebrow"), field("title", "Заголовок", "hero.title", 3), field("text", "Текст", "hero.text", 4), field("primary", "Главная кнопка", "hero.primaryLabel"), field("primary-url", "Ссылка главной кнопки", "hero.primaryUrl"), field("secondary", "Вторая кнопка", "hero.secondaryLabel"), field("secondary-url", "Ссылка второй кнопки", "hero.secondaryUrl"), { ...field("image", "Изображение", "hero.image"), media: true }, field("alt", "Alt-текст", "hero.alt"), field("traits", "Характеристики", "hero.traits"), list("navigation", "Навигация · подпись | ссылка", "navigation", ["label", "href"], 5)],
  availability: [field("eyebrow", "Метка", "availability.eyebrow"), field("title", "Заголовок", "availability.title"), field("text", "Пояснение", "availability.text", 4), field("submit", "Кнопка", "availability.submit")],
  venues: [list("venues", "Залы · название | вместимость | площадь | особенности | изображение | alt | CTA", "venues", ["name", "capacity", "area", "features", "image", "alt", "cta"], 10)],
  formats: [list("formats", "Форматы · № | название | описание", "formats", ["number", "title", "text"], 8)],
  packages: [list("packages", "Пакеты · название | цена | для кого | состав | CTA", "packages", ["name", "price", "for", "includes", "cta"], 9)],
  gallery: [list("gallery", "Галерея · изображение | alt", "gallery", ["image", "alt"], 10)],
  catering: [list("catering", "Меню · название | описание | цена", "catering", ["title", "text", "meta"], 8)],
  planner: [list("planner", "Этапы · № | название | описание", "planner", ["number", "title", "text"], 8)],
  facts: [list("facts", "Цифры · значение | подпись", "facts", ["value", "label"], 7)],
  reviews: [list("reviews", "Отзывы · цитата | автор | событие", "reviews", ["quote", "author", "meta"], 9)],
  faq: [list("faq", "FAQ · вопрос | ответ", "faq", ["question", "answer"], 10)],
  contact: [field("eyebrow", "Метка", "contact.eyebrow"), field("title", "Заголовок", "contact.title", 3), field("text", "Текст", "contact.text", 4), field("address", "Адрес", "contact.address"), field("phone", "Телефон", "contact.phone"), field("email", "Email", "contact.email"), field("hours", "Часы", "contact.hours"), field("map", "Подпись карты", "contact.map"), field("cta", "Кнопка", "contact.cta")],
  footer: [field("note", "Подпись", "footer.note"), field("copyright", "Копирайт", "footer.copyright")],
};
const at = (root: unknown, path: string) => path.split(".").reduce<unknown>((v, key) => v && typeof v === "object" ? (v as Record<string, unknown>)[key] : undefined, root);
const set = (content: VeloraContent, path: string, value: unknown) => { const next = structuredClone(content) as unknown as Record<string, unknown>; const keys = path.split("."); let target = next; for (const key of keys.slice(0, -1)) target = target[key] as Record<string, unknown>; target[keys.at(-1)!] = value; return next as unknown as VeloraContent; };
const encode = (value: unknown, keys: string[]) => Array.isArray(value) ? value.map(item => keys.map(key => String((item as Record<string, unknown>)[key] ?? "").replaceAll("|", "—")).join(" | ")).join("\n") : "";
const decode = (value: string, keys: string[]) => value.split("\n").map(line => line.trim()).filter(Boolean).map(line => Object.fromEntries(keys.map((key, index) => [key, line.split("|")[index]?.trim() ?? ""])));
export function buildVeloraInspectorFields(content: VeloraContent, section: VeloraNativeSectionId, disabled: boolean, onChange: (next: VeloraContent, group: string) => void): EditorInspectorPlacedField[] {
  return VELORA_EDITOR_SPECS[section].map(spec => { const raw = at(content, spec.path); const value = spec.keys ? encode(raw, spec.keys) : String(raw ?? ""); const update = (next: string) => onChange(set(content, spec.path, spec.keys ? decode(next, spec.keys) : next), `velora:${section}:${spec.id}`); return spec.rows ? { id: spec.id, group: spec.media ? "media" : "content", type: "textarea", label: spec.label, rows: spec.rows, disabled, value, onChange: update } : { id: spec.id, group: spec.media ? "media" : "content", type: spec.media ? "url" : "text", label: spec.label, disabled, value, onChange: update }; });
}
export function resetVeloraSection(content: VeloraContent, section: VeloraNativeSectionId) { let next = structuredClone(content); for (const spec of VELORA_EDITOR_SPECS[section]) next = set(next, spec.path, structuredClone(at(DEFAULT_VELORA_CONTENT, spec.path))); return next; }
