import type { EditorInspectorPlacedField } from "./editor-spec.ts";
import type { PremiumTemplateEditorMediaTarget } from "./premium-template-editor-adapter.ts";
import type { LumeaContent, LumeaItem } from "./lumea-premium-template-content.ts";
import { DEFAULT_LUMEA_CONTENT } from "./lumea-premium-template-content.ts";
import type { LumeaNativeSectionId } from "./lumea-premium-template-contract.ts";

type FieldKind = "text" | "textarea" | "richText" | "url";
type FieldSpec = {
  id: string;
  label: string;
  path: string;
  kind?: FieldKind;
  group?: EditorInspectorPlacedField["group"];
};

const field = (
  id: string,
  label: string,
  path: string,
  kind: FieldKind = "text",
  group: EditorInspectorPlacedField["group"] = "content",
): FieldSpec => ({ id, label, path, kind, group });

const headings = (path: string) => [
  field("eyebrow", "Метка раздела", `${path}.eyebrow`),
  field("title", "Заголовок раздела", `${path}.title`, "textarea"),
];

const itemFields = (
  prefix: string,
  items: LumeaItem[],
  fields: Array<[string, string, FieldKind?]>,
): FieldSpec[] =>
  items.flatMap((_, index) =>
    fields.map(([key, label, kind]) =>
      field(
        `${prefix}-${index}-${key}`,
        `${label} · ${index + 1}`,
        `${prefix}.${index}.${key}`,
        kind ?? "text",
        key === "image" || key === "alt" ? "media" : "content",
      ),
    ),
  );

const headingSections = new Set<LumeaNativeSectionId>([
  "hero",
  "services",
  "booking",
  "experts",
  "gallery",
  "reviews",
  "contact",
]);

export const LUMEA_EDITOR_SPECS: Record<LumeaNativeSectionId, FieldSpec[]> = {
  hero: [
    field("brand", "Название", "brand"),
    field("announcement", "Верхняя плашка", "announcement.text"),
    field("subbrand", "Подпись логотипа", "header.subbrand"),
    field("header-cta", "Кнопка в шапке", "header.cta"),
    ...itemFields("navigation", DEFAULT_LUMEA_CONTENT.navigation, [
      ["label", "Навигация · подпись"],
      ["href", "Навигация · ссылка", "url"],
    ]),
    field("eyebrow", "Надзаголовок", "hero.eyebrow"),
    field("title", "Заголовок", "hero.title", "textarea"),
    field("text", "Описание", "hero.text", "richText"),
    field("primary", "Главная кнопка", "hero.primaryLabel"),
    field("primary-url", "Ссылка главной кнопки", "hero.primaryUrl", "url"),
    field("secondary", "Вторая кнопка", "hero.secondaryLabel"),
    field("secondary-url", "Ссылка второй кнопки", "hero.secondaryUrl", "url"),
    field("rating", "Рейтинг", "hero.rating"),
    field("image", "Изображение Hero", "hero.image", "url", "media"),
    field("alt", "Alt Hero", "hero.alt", "text", "media"),
  ],
  services: [
    ...headings("servicesPresentation"),
    ...itemFields("services", DEFAULT_LUMEA_CONTENT.services, [
      ["name", "Название"],
      ["price", "Цена"],
      ["cta", "CTA"],
      ["image", "Изображение", "url"],
      ["alt", "Alt-текст"],
    ]),
  ],
  booking: [
    ...headings("booking"),
    field("text", "Пояснение", "booking.text", "richText"),
    field("service-label", "Поле · услуга", "booking.serviceLabel"),
    field("master-label", "Поле · мастер", "booking.masterLabel"),
    field("date-label", "Поле · дата", "booking.dateLabel"),
    field("time-label", "Поле · время", "booking.timeLabel"),
    field("submit", "Кнопка", "booking.submit"),
    field("note", "Подпись", "booking.note", "textarea"),
    field("image", "Фото интерьера", "booking.image", "url", "media"),
    field("alt", "Alt интерьера", "booking.alt", "text", "media"),
  ],
  experts: [
    ...headings("expertsPresentation"),
    ...itemFields("experts", DEFAULT_LUMEA_CONTENT.experts, [
      ["name", "Имя"],
      ["role", "Специализация"],
      ["image", "Портрет", "url"],
      ["alt", "Alt-текст"],
    ]),
  ],
  gallery: [
    ...headings("galleryPresentation"),
    ...itemFields("gallery", DEFAULT_LUMEA_CONTENT.gallery, [
      ["image", "Изображение", "url"],
      ["alt", "Alt-текст"],
    ]),
  ],
  reviews: [
    ...headings("reviewsPresentation"),
    ...itemFields("reviews", DEFAULT_LUMEA_CONTENT.reviews, [
      ["rating", "Рейтинг"],
      ["quote", "Отзыв", "richText"],
      ["author", "Автор"],
    ]),
  ],
  contact: [
    ...headings("contact"),
    field("hours", "Часы работы", "contact.hours"),
    field("address", "Адрес", "contact.address"),
    field("phone", "Телефон", "contact.phone"),
    field("cta", "Кнопка маршрута", "contact.cta"),
    field("facade", "Фото фасада", "contact.facadeImage", "url", "media"),
    field("facade-alt", "Alt фасада", "contact.facadeAlt", "text", "media"),
    field("map", "Подпись карты", "contact.mapLabel"),
  ],
  footer: [
    field("subbrand", "Подпись бренда", "footer.subbrand"),
    field("instagram", "Instagram", "footer.instagram"),
    field("facebook", "Facebook", "footer.facebook"),
    field("telegram", "Telegram", "footer.telegram"),
    field("note", "Подпись OneStudio OS", "footer.note", "textarea"),
    field("copyright", "Копирайт", "footer.copyright"),
  ],
};

const at = (root: unknown, path: string) =>
  path.split(".").reduce<unknown>((value, key) => {
    if (!value || typeof value !== "object") return undefined;
    return (value as Record<string, unknown>)[key];
  }, root);

export function setLumeaPath(content: LumeaContent, path: string, value: string): LumeaContent {
  const next = structuredClone(content) as unknown as Record<string, unknown>;
  const keys = path.split(".");
  let target = next;
  for (const key of keys.slice(0, -1)) target = target[key] as Record<string, unknown>;
  target[keys.at(-1)!] = value;
  return next as unknown as LumeaContent;
}

export function buildLumeaInspectorFields(
  content: LumeaContent,
  section: LumeaNativeSectionId,
  disabled: boolean,
  onChange: (next: LumeaContent, group: string) => void,
  onChooseMedia?: (target: PremiumTemplateEditorMediaTarget) => void,
): EditorInspectorPlacedField[] {
  const fields = LUMEA_EDITOR_SPECS[section].flatMap((spec) => {
    const value = String(at(content, spec.path) ?? "");
    const originalValue = String(at(DEFAULT_LUMEA_CONTENT, spec.path) ?? "");
    const update = (next: string) =>
      onChange(setLumeaPath(content, spec.path, next), `lumea:${section}:${spec.id}`);
    const base =
      spec.kind === "richText"
        ? { id: spec.id, group: spec.group!, type: "richText" as const, label: spec.label, value, originalValue, disabled, onChange: update }
        : spec.kind === "textarea"
          ? { id: spec.id, group: spec.group!, type: "textarea" as const, label: spec.label, rows: 3, value, originalValue, disabled, onChange: update }
          : { id: spec.id, group: spec.group!, type: spec.kind === "url" ? ("url" as const) : ("text" as const), label: spec.label, value, ...(spec.kind === "url" ? {} : { originalValue }), disabled, onChange: update };
    if (spec.group !== "media" || spec.kind !== "url" || !onChooseMedia) return [base];
    return [{
      id: spec.id,
      group: "media",
      type: "media",
      label: spec.label,
      value,
      originalValue,
      disabled,
      onChange: update,
      onChoose: () => onChooseMedia({
        kind: "template-content",
        templateKey: "lumea-beauty",
        path: spec.path,
        label: spec.label,
      }),
    } as EditorInspectorPlacedField];
  });
  if (headingSections.has(section)) {
    fields.push({
      id: `lumea-${section}-heading-typography`,
      group: "typography",
      type: "typography",
      forFieldId: "title",
      title: "Оформление заголовка",
      description: "Главный заголовок выбранного раздела",
      value: content.headingTypography[section],
      disabled,
      onChange: (value) => onChange(
        { ...content, headingTypography: { ...content.headingTypography, [section]: value } },
        `lumea:${section}:heading-typography`,
      ),
    });
  }
  return fields;
}

export function resetLumeaSection(content: LumeaContent, section: LumeaNativeSectionId) {
  let next = structuredClone(content);
  for (const spec of LUMEA_EDITOR_SPECS[section]) {
    next = setLumeaPath(next, spec.path, String(at(DEFAULT_LUMEA_CONTENT, spec.path) ?? ""));
  }
  if (headingSections.has(section)) {
    const headingTypography = { ...next.headingTypography };
    delete headingTypography[section];
    next = { ...next, headingTypography };
  }
  return next;
}

