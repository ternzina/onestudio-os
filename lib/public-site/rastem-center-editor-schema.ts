import type { EditorInspectorPlacedField } from "./editor-spec.ts";
import type { PremiumTemplateEditorMediaTarget } from "./premium-template-editor-adapter.ts";
import { DEFAULT_RASTEM_CENTER_CONTENT, type RastemCenterContent } from "./rastem-center-premium-template-content.ts";
import type { RastemCenterNativeSectionId } from "./rastem-center-premium-template-contract.ts";

type FieldKind = "text" | "textarea" | "richText" | "action" | "media";
type Spec = { id: string; label: string; path: string; kind?: FieldKind; hrefPath?: string };
const field = (id: string, label: string, path: string, kind: FieldKind = "text"): Spec => ({ id, label, path, kind });
const action = (id: string, label: string, path: string, hrefPath: string): Spec => ({ id, label, path, hrefPath, kind: "action" });
const itemFields = (path: string, count: number, fields: readonly [string, string, FieldKind?][]) => Array.from({ length: count }, (_, index) => fields.map(([key, label, kind]) => field(`${path}-${index}-${key}`, `${label} · ${index + 1}`, `${path}.${index}.${key}`, kind))).flat();
const scalarFields = (path: string, count: number, label: string, kind: FieldKind = "text") => Array.from({ length: count }, (_, index) => field(`${path}-${index}`, `${label} · ${index + 1}`, `${path}.${index}`, kind));

export const RASTEM_CENTER_EDITOR_SPECS: Record<RastemCenterNativeSectionId, Spec[]> = {
  hero: [field("promo", "Промо-полоса", "promo"), field("brand", "Бренд", "brand"), field("brand-note", "Подпись бренда", "brandNote"), ...itemFields("navigation", 6, [["label", "Навигация"], ["href", "Ссылка"]]), field("eyebrow", "Надзаголовок", "hero.eyebrow"), field("title", "Заголовок", "hero.title", "textarea"), field("text", "Описание", "hero.text", "richText"), action("primary", "Основная кнопка", "hero.primaryLabel", "hero.primaryUrl"), action("secondary", "Вторая кнопка", "hero.secondaryLabel", "hero.secondaryUrl"), ...scalarFields("hero.facts", 3, "Преимущество"), field("hero-image", "Изображение обложки", "hero.image", "media"), field("hero-image-alt", "Alt-текст обложки", "hero.imageAlt")],
  ages: [field("eyebrow", "Надзаголовок", "ages.eyebrow"), field("title", "Заголовок", "ages.title", "textarea"), field("text", "Описание", "ages.text", "richText"), ...itemFields("ages.items", 4, [["label", "Возраст"], ["note", "Описание", "richText"], ["image", "Изображение", "media"]])],
  programs: [field("eyebrow", "Надзаголовок", "programs.eyebrow"), field("title", "Заголовок", "programs.title", "textarea"), field("text", "Описание", "programs.text", "richText"), ...itemFields("programs.items", 6, [["title", "Название", "textarea"], ["note", "Описание", "richText"], ["image", "Изображение", "media"]])],
  schedule: [field("eyebrow", "Надзаголовок", "schedule.eyebrow"), field("title", "Заголовок", "schedule.title", "textarea"), field("text", "Описание", "schedule.text", "richText"), ...scalarFields("schedule.filters", 5, "Фильтр"), ...itemFields("schedule.items", 4, [["day", "День"], ["time", "Время"], ["title", "Занятие", "textarea"], ["age", "Возраст"], ["seats", "Места"]]), action("schedule-cta", "Кнопка расписания", "schedule.buttonLabel", "schedule.buttonUrl")],
  teachers: [field("eyebrow", "Надзаголовок", "teachers.eyebrow"), field("title", "Заголовок", "teachers.title", "textarea"), field("text", "Описание", "teachers.text", "richText"), ...itemFields("teachers.items", 3, [["name", "Имя"], ["role", "Специализация"], ["image", "Фото", "media"]])],
  trial: [field("eyebrow", "Надзаголовок", "trial.eyebrow"), field("title", "Заголовок", "trial.title", "textarea"), field("text", "Описание", "trial.text", "richText"), field("button", "Кнопка", "trial.buttonLabel"), field("note", "Примечание", "trial.note", "richText"), ...scalarFields("trial.ages", 4, "Возраст"), ...scalarFields("trial.programs", 4, "Программа"), ...scalarFields("trial.times", 3, "Время")],
  benefits: [field("eyebrow", "Надзаголовок", "benefits.eyebrow"), field("title", "Заголовок", "benefits.title", "textarea"), field("text", "Описание", "benefits.text", "richText"), ...itemFields("benefits.items", 4, [["title", "Название"], ["text", "Описание", "richText"]])],
  memberships: [field("eyebrow", "Надзаголовок", "memberships.eyebrow"), field("title", "Заголовок", "memberships.title", "textarea"), field("text", "Описание", "memberships.text", "richText"), ...itemFields("memberships.items", 3, [["title", "Название"], ["text", "Описание", "richText"], ["price", "Цена"]])],
  parents: [field("eyebrow", "Надзаголовок", "parents.eyebrow"), field("title", "Заголовок", "parents.title", "textarea"), field("text", "Описание", "parents.text", "richText"), action("parents-link", "Ссылка для родителей", "parents.linkLabel", "parents.linkUrl"), field("phone-title", "Заголовок mockup", "parents.phoneTitle"), field("phone-class", "Название занятия", "parents.phoneClass"), field("phone-time", "Время занятия", "parents.phoneTime"), field("phone-note", "Комментарий педагога", "parents.phoneNote", "textarea"), field("phone-next", "Следующее занятие", "parents.phoneNext", "textarea")],
  gallery: [field("eyebrow", "Надзаголовок", "gallery.eyebrow"), field("title", "Заголовок", "gallery.title", "textarea"), field("text", "Описание", "gallery.text", "richText"), ...scalarFields("gallery.images", 6, "Фото", "media")],
  testimonials: [field("eyebrow", "Надзаголовок", "testimonials.eyebrow"), field("title", "Заголовок", "testimonials.title", "textarea"), field("text", "Описание", "testimonials.text", "richText"), ...itemFields("testimonials.items", 3, [["quote", "Отзыв", "richText"], ["author", "Автор"], ["age", "Группа"]])],
  faq: [field("eyebrow", "Надзаголовок", "faq.eyebrow"), field("title", "Заголовок", "faq.title", "textarea"), field("text", "Описание", "faq.text", "richText"), ...itemFields("faq.items", 4, [["question", "Вопрос", "textarea"], ["answer", "Ответ", "richText"]])],
  contact: [field("eyebrow", "Надзаголовок", "contact.eyebrow"), field("title", "Заголовок", "contact.title", "textarea"), field("text", "Описание", "contact.text", "richText"), field("hours-label", "Метка часов", "contact.hoursLabel"), field("hours", "Часы работы" , "contact.hours"), field("address-label", "Метка адреса", "contact.addressLabel"), field("address", "Адрес", "contact.address"), field("phone", "Телефон", "contact.phone"), field("email", "Email", "contact.email"), action("contact-cta", "Кнопка контактов", "contact.buttonLabel", "contact.buttonUrl")],
  footer: [field("brand", "Бренд", "brand"), field("brand-note", "Подпись бренда", "brandNote"), field("description", "Описание", "footer.description", "richText"), field("address", "Адрес", "footer.address"), field("navigation-label", "Заголовок навигации", "footer.navigationLabel"), ...itemFields("footer.navigation", 4, [["label", "Навигация"], ["href", "Ссылка"]]), field("parent-label", "Заголовок для родителей", "footer.parentLabel"), ...itemFields("footer.parentLinks", 3, [["label", "Ссылка родителям"], ["href", "Ссылка"]]), field("phone", "Телефон", "footer.phone"), field("email", "Email", "footer.email"), action("footer-cta", "Кнопка подвала", "footer.ctaLabel", "footer.ctaUrl"), field("credit", "Подпись OneStudio", "footer.credit", "richText")],
};

const get = (root: unknown, path: string): unknown => path.split(".").reduce<unknown>((value, key) => value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined, root);
const set = (root: RastemCenterContent, path: string, value: string) => { const next = structuredClone(root) as unknown as Record<string, unknown>; const keys = path.split("."); let target = next; for (const key of keys.slice(0, -1)) target = target[key] as Record<string, unknown>; target[keys[keys.length - 1]] = value; return next as unknown as RastemCenterContent; };

export function buildRastemCenterInspectorFields(content: RastemCenterContent, section: RastemCenterNativeSectionId, disabled: boolean, onChange: (next: RastemCenterContent, group: string) => void, onChooseMedia?: (target: PremiumTemplateEditorMediaTarget) => void): EditorInspectorPlacedField[] {
  const fields = RASTEM_CENTER_EDITOR_SPECS[section].map((spec) => {
    const value = String(get(content, spec.path) ?? "");
    const originalValue = String(get(DEFAULT_RASTEM_CENTER_CONTENT, spec.path) ?? "");
    const update = (next: string) => onChange(set(content, spec.path, next), `rastem:${section}:${spec.id}`);
    if (spec.kind === "media") return { id: spec.id, group: "media" as const, type: "media" as const, label: spec.label, value, originalValue, disabled, onChange: update, onChoose: () => onChooseMedia?.({ kind: "template-content", templateKey: "rastem-center", path: spec.path, label: spec.label }) };
    if (spec.kind === "action" && spec.hrefPath) return { id: spec.id, group: "content" as const, type: "action" as const, label: spec.label, text: value, href: String(get(content, spec.hrefPath) ?? ""), originalText: originalValue, originalHref: String(get(DEFAULT_RASTEM_CENTER_CONTENT, spec.hrefPath) ?? ""), disabled, onTextChange: update, onHrefChange: (next: string) => onChange(set(content, spec.hrefPath!, next), `rastem:${section}:${spec.id}`) };
    if (spec.kind === "richText") return { id: spec.id, group: "content" as const, type: "richText" as const, label: spec.label, value, originalValue, disabled, onChange: update };
    if (spec.kind === "textarea") return { id: spec.id, group: "content" as const, type: "textarea" as const, label: spec.label, rows: 3, value, originalValue, disabled, onChange: update };
    return { id: spec.id, group: "content" as const, type: "text" as const, label: spec.label, value, originalValue, disabled, onChange: update };
  }) as EditorInspectorPlacedField[];
  if (section !== "footer") fields.push({ id: `rastem-${section}-heading-typography`, group: "typography", type: "typography", forFieldId: "title", title: "Оформление заголовка", description: "Главный заголовок выбранного раздела", value: content.headingTypography[section], disabled, onChange: (value) => onChange({ ...content, headingTypography: { ...content.headingTypography, [section]: value } }, `rastem:${section}:heading-typography`) });
  return fields;
}

export function resetRastemCenterSection(content: RastemCenterContent, section: RastemCenterNativeSectionId): RastemCenterContent {
  let next = structuredClone(content);
  for (const spec of RASTEM_CENTER_EDITOR_SPECS[section]) {
    next = set(next, spec.path, String(get(DEFAULT_RASTEM_CENTER_CONTENT, spec.path) ?? ""));
    if (spec.hrefPath) next = set(next, spec.hrefPath, String(get(DEFAULT_RASTEM_CENTER_CONTENT, spec.hrefPath) ?? ""));
  }
  const headingTypography = { ...next.headingTypography }; delete headingTypography[section];
  return { ...next, headingTypography };
}
