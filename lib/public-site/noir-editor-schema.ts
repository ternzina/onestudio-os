import type { EditorInspectorPlacedField } from "./editor-spec.ts";
import { DEFAULT_PREMIUM_STUDIO_CONTENT, type PremiumStudioContent } from "./premium-studio-content.ts";
import { NOIR_PREMIUM_TEMPLATE_CONTRACT, type NoirNativeSectionId } from "./noir-premium-template-contract.ts";

export const NOIR_EDITOR_SECTIONS = NOIR_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(
  ({ id, label }) => [id, label] as const,
);

export type NoirEditorSection = NoirNativeSectionId;

type Group = EditorInspectorPlacedField["group"];
type FieldKind = "text" | "textarea" | "url";
type FieldSpec = { id: string; label: string; path: string; kind?: FieldKind; group?: Group; rows?: number };
type ListSpec = { id: string; label: string; path: string; keys: string[]; rows?: number; group?: Group };

const text = (id: string, label: string, path: string, kind: FieldKind = "text", group: Group = "content", rows?: number): FieldSpec => ({ id, label, path, kind, group, rows });
const list = (id: string, label: string, path: string, keys: string[], rows = 7, group: Group = "content"): ListSpec => ({ id, label, path, keys, rows, group });

const specs: Record<NoirEditorSection, Array<FieldSpec | ListSpec>> = {
  hero: [
    text("brand-first", "Название · первая часть", "brand.first"), text("brand-second", "Название · вторая часть", "brand.second"), text("brand-monogram", "Монограмма", "brand.monogram"), text("brand-period", "Период", "brand.period"), text("brand-marquee", "Бегущая строка", "brand.marquee"),
    text("hero-eyebrow", "Надзаголовок", "hero.eyebrow"), text("hero-lines", "Заголовок · строки через перенос", "hero.lines", "textarea", "content", 3),
    text("hero-note", "Пояснение", "hero.note", "textarea"), text("hero-cta", "Кнопка", "hero.cta"), text("hero-folio", "Номер обложки", "hero.folio"), text("hero-image", "Фоновое изображение", "hero.image", "url", "media"),
    list("navigation", "Навигация · подпись | ссылка", "navigation", ["label", "href"], 6),
  ],
  manifest: [
    text("intro-eyebrow", "Метка раздела", "introduction.eyebrow"), text("intro-title", "Заголовок", "introduction.title", "textarea"), text("intro-text", "Текст", "introduction.text", "textarea", "content", 5),
    list("facts", "Факты · значение | единица | подпись", "facts", ["value", "unit", "label"], 5),
  ],
  light: [
    text("light-heading", "Заголовок сцены", "lightScene.heading"), text("light-alt", "Описание изображения", "lightScene.imageAlt"),
    list("light-scenes", "Сцены · слово | время | подпись | изображение", "lightScene.scenes", ["word", "time", "caption", "image"], 7),
  ],
  services: [
    text("services-eyebrow", "Метка раздела", "servicesPresentation.eyebrow"), text("services-title", "Заголовок · строки через перенос", "servicesPresentation.title", "textarea"),
    text("services-text", "Пояснение", "servicesPresentation.text", "textarea"), text("services-action", "Подпись действия", "servicesPresentation.action"),
    list("services-list", "Пакеты · № | название | заметка | описание | мета через запятую | изображение | hover | alt", "services", ["number", "title", "note", "description", "meta", "image", "hoverImage", "imageAlt"], 10),
  ],
  portfolio: [
    text("portfolio-eyebrow", "Метка раздела", "portfolioPresentation.eyebrow"), text("portfolio-title", "Заголовок · строки через перенос", "portfolioPresentation.title", "textarea"),
    text("portfolio-text", "Пояснение", "portfolioPresentation.text", "textarea"), text("portfolio-open", "Действие карточки", "portfolioPresentation.projectAction"), text("portfolio-all", "Общее действие", "portfolioPresentation.allProjectsAction"),
    list("portfolio-list", "Проекты · название | категория | год | изображение | alt", "portfolio", ["title", "category", "year", "image", "alt"], 12),
  ],
  retouch: [
    text("retouch-eyebrow", "Метка раздела", "retouch.eyebrow"), text("retouch-title", "Заголовок · строки через перенос", "retouch.title", "textarea"), text("retouch-text", "Инструкция", "retouch.text", "textarea"),
    text("before-label", "Подпись до", "retouch.beforeLabel"), text("after-label", "Подпись после", "retouch.afterLabel"), text("reset-label", "Сброс сравнения", "retouch.resetLabel"),
    text("retouch-image", "Изображение сравнения", "retouch.image", "url", "media"), text("retouch-alt", "Описание изображения", "retouch.imageAlt", "text", "media"),
  ],
  film: [text("film-eyebrow", "Метка раздела", "film.eyebrow"), text("film-title", "Заголовок · строки через перенос", "film.title", "textarea"), text("film-hint", "Инструкция", "film.hint", "textarea")],
  team: [
    text("team-eyebrow", "Метка раздела", "teamPresentation.eyebrow"), text("team-title", "Заголовок · строки через перенос", "teamPresentation.title", "textarea"),
    text("team-feature-eyebrow", "Надзаголовок презентации", "teamPresentation.featureEyebrow"), text("team-feature-title", "Заголовок презентации", "teamPresentation.featureTitle"), text("team-feature-text", "Текст презентации", "teamPresentation.featureText", "textarea"),
    text("team-image", "Общее фото", "teamPresentation.image", "url", "media"), text("team-alt", "Описание общего фото", "teamPresentation.imageAlt", "text", "media"),
    list("team-list", "Команда · имя | роль | текст | изображение | alt", "team", ["name", "role", "text", "image", "alt"], 8),
  ],
  process: [
    text("process-eyebrow", "Метка раздела", "processPresentation.eyebrow"), text("process-title", "Заголовок · строки через перенос", "processPresentation.title", "textarea"), text("process-text", "Пояснение", "processPresentation.text", "textarea"),
    list("process-list", "Этапы · № | заголовок | текст", "process", ["number", "title", "text"], 7),
  ],
  equipment: [
    text("equipment-eyebrow", "Метка раздела", "equipmentPresentation.eyebrow"), text("equipment-title", "Заголовок · строки через перенос", "equipmentPresentation.title", "textarea"), text("equipment-text", "Пояснение", "equipmentPresentation.text", "textarea"),
    text("equipment-image", "Изображение", "equipmentPresentation.image", "url", "media"), text("equipment-alt", "Описание изображения", "equipmentPresentation.imageAlt", "text", "media"),
    text("equipment-list", "Оснащение · один пункт на строку", "equipment", "textarea", "content", 9),
  ],
  tour: [
    text("tour-eyebrow", "Метка раздела", "tour.eyebrow"), text("tour-title", "Заголовок · строки через перенос", "tour.title", "textarea"), text("tour-text", "Инструкция", "tour.text", "textarea"),
    text("tour-caption", "Подпись облегчённого обзора", "tour.fallbackCaption"), text("tour-loading", "Текст загрузки", "tour.loadingText"), text("tour-deferred", "Текст отложенной загрузки", "tour.deferredText"),
    text("tour-image", "Изображение облегчённого обзора", "tour.image", "url", "media"), text("tour-alt", "Описание изображения", "tour.imageAlt", "text", "media"),
    list("tour-zones", "Точки тура · id | заголовок | описание", "tour.zones", ["id", "title", "text"], 7),
  ],
  reviews: [text("reviews-eyebrow", "Метка раздела", "reviewsPresentation.eyebrow"), list("reviews-list", "Отзывы · цитата | автор | подпись", "testimonials", ["quote", "author", "meta"], 7)],
  faq: [
    text("faq-eyebrow", "Метка раздела", "faqPresentation.eyebrow"), text("faq-title", "Заголовок · строки через перенос", "faqPresentation.title", "textarea"), text("faq-text", "Пояснение", "faqPresentation.text", "textarea"),
    list("faq-list", "Вопросы · вопрос | ответ", "faq", ["question", "answer"], 9),
  ],
  contact: [
    text("emotional-first", "Приглашение · первая строка", "emotional.first"), text("emotional-first-accent", "Приглашение · первый акцент", "emotional.firstAccent"), text("emotional-second", "Приглашение · вторая строка", "emotional.second"), text("emotional-second-accent", "Приглашение · второй акцент", "emotional.secondAccent"), text("emotional-image", "Изображение приглашения", "emotional.image", "url", "media"),
    text("contact-eyebrow", "Метка бронирования", "contact.eyebrow"), text("contact-title", "Заголовок", "contact.title", "textarea"), text("contact-text", "Текст", "contact.text", "textarea"), text("availability-label", "Подпись доступности", "contact.availabilityLabel"), text("availability-value", "Ближайшая дата", "contact.availabilityValue"), text("contact-cta", "Кнопка", "contact.cta"), text("contact-helper", "Пояснение действия", "contact.helper"), text("contact-folio", "Номер финала", "contact.folio"), text("contact-image", "Фоновое изображение", "contact.image", "url", "media"),
  ],
  footer: [
    text("brand-location", "Локация", "brand.location"), text("brand-email", "Email", "brand.email"), text("footer-top", "Ссылка наверх", "footer.topLabel"), text("footer-demos", "Ссылка на демо", "footer.demosLabel"), text("copyright-year", "Год копирайта", "footer.copyrightYear"),
  ],
};

function atPath(root: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined, root);
}

function setPath(content: PremiumStudioContent, path: string, value: unknown): PremiumStudioContent {
  const next = structuredClone(content) as unknown as Record<string, unknown>;
  const keys = path.split(".");
  let target = next;
  for (const key of keys.slice(0, -1)) target = target[key] as Record<string, unknown>;
  target[keys.at(-1)!] = value;
  return next as unknown as PremiumStudioContent;
}

function encodeList(value: unknown, keys: string[]) {
  if (!Array.isArray(value)) return "";
  return value.map(item => keys.map(key => {
    const part = (item as Record<string, unknown>)[key];
    return Array.isArray(part) ? part.join(", ") : String(part ?? "");
  }).join(" | ")).join("\n");
}

function decodeList(value: string, keys: string[]) {
  return value.split("\n").map(line => line.trim()).filter(Boolean).map(line => {
    const cells = line.split("|").map(cell => cell.trim());
    return Object.fromEntries(keys.map((key, index) => [key, key === "meta" ? (cells[index] ?? "").split(",").map(item => item.trim()).filter(Boolean) : cells[index] ?? ""]));
  });
}

export function buildNoirInspectorFields(content: PremiumStudioContent, section: NoirEditorSection, disabled: boolean, onChange: (content: PremiumStudioContent, group: string) => void): EditorInspectorPlacedField[] {
  return specs[section].map(spec => {
    if ("keys" in spec) {
      return { id: spec.id, group: spec.group ?? "content", type: "textarea", label: spec.label, rows: spec.rows, disabled, value: encodeList(atPath(content, spec.path), spec.keys), onChange: value => onChange(setPath(content, spec.path, decodeList(value, spec.keys)), `noir:${section}:${spec.id}`) };
    }
    const raw = atPath(content, spec.path);
    const value = Array.isArray(raw) ? raw.join("\n") : String(raw ?? "");
    const update = (next: string) => onChange(setPath(content, spec.path, Array.isArray(raw) ? next.split("\n").map(item => item.trim()).filter(Boolean) : next), `noir:${section}:${spec.id}`);
    return spec.kind === "textarea"
      ? { id: spec.id, group: spec.group ?? "content", type: "textarea", label: spec.label, rows: spec.rows ?? 3, disabled, value, onChange: update }
      : { id: spec.id, group: spec.group ?? "content", type: spec.kind === "url" ? "url" : "text", label: spec.label, disabled, value, onChange: update };
  });
}


export function resetNoirInspectorSection(
  content: PremiumStudioContent,
  section: NoirEditorSection,
) {
  let next = structuredClone(content);
  for (const spec of specs[section]) {
    next = setPath(
      next,
      spec.path,
      structuredClone(atPath(DEFAULT_PREMIUM_STUDIO_CONTENT, spec.path)),
    );
  }
  return next;
}
