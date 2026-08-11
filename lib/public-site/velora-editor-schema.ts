import type { EditorInspectorPlacedField } from "./editor-spec.ts";
import type { PremiumTemplateEditorMediaTarget } from "./premium-template-editor-adapter.ts";
import type {
  VeloraContent,
  VeloraItem,
} from "./velora-premium-template-content.ts";
import { DEFAULT_VELORA_CONTENT } from "./velora-premium-template-content.ts";
import type { VeloraNativeSectionId } from "./velora-premium-template-contract.ts";

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
  items: VeloraItem[],
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

export const VELORA_EDITOR_SPECS: Record<VeloraNativeSectionId, FieldSpec[]> = {
  hero: [
    field("brand", "Название", "brand"),
    field(
      "header-venues",
      "Ссылка на страницу залов",
      "header.venuesPageLabel",
    ),
    field("header-cta", "CTA в шапке", "header.availabilityLabel"),
    ...itemFields("navigation", DEFAULT_VELORA_CONTENT.navigation, [
      ["label", "Навигация · подпись"],
      ["href", "Навигация · ссылка", "url"],
    ]),
    field("eyebrow", "Надзаголовок", "hero.eyebrow"),
    field("title", "Заголовок", "hero.title", "textarea"),
    field("text", "Вводный текст", "hero.text", "richText"),
    field("primary", "Главная кнопка", "hero.primaryLabel"),
    field("primary-url", "Ссылка главной кнопки", "hero.primaryUrl", "url"),
    field("secondary", "Вторая кнопка", "hero.secondaryLabel"),
    field("secondary-url", "Ссылка второй кнопки", "hero.secondaryUrl", "url"),
    field("image", "Изображение обложки", "hero.image", "url", "media"),
    field("alt", "Alt-текст обложки", "hero.alt", "text", "media"),
    field("traits", "Характеристики", "hero.traits"),
  ],
  availability: [
    ...headings("availability"),
    field("text", "Пояснение", "availability.text", "richText"),
    ...[
      "dateLabel",
      "formatLabel",
      "formatPlaceholder",
      "guestsLabel",
      "guestsPlaceholder",
      "venueLabel",
      "venuePlaceholder",
      "packageLabel",
      "packagePlaceholder",
      "nameLabel",
      "emailLabel",
      "phoneLabel",
      "submit",
      "pending",
      "idle",
      "success",
      "error",
      "ariaLabel",
      "subject",
    ].map((key) =>
      field(
        key,
        `Форма · ${key}`,
        `availability.${key}`,
        key === "success" || key === "error" || key === "idle"
          ? "textarea"
          : "text",
      ),
    ),
  ],
  venues: [
    ...headings("venuesPresentation"),
    field("page-label", "Ссылка на сравнение", "venuesPresentation.pageLabel"),
    ...itemFields("venues", DEFAULT_VELORA_CONTENT.venues, [
      ["name", "Название"],
      ["capacity", "Вместимость"],
      ["area", "Площадь"],
      ["features", "Описание", "richText"],
      ["image", "Изображение", "url"],
      ["alt", "Alt-текст"],
      ["cta", "CTA"],
    ]),
  ],
  formats: [
    ...headings("formatsPresentation"),
    ...itemFields("formats", DEFAULT_VELORA_CONTENT.formats, [
      ["number", "Номер"],
      ["title", "Название"],
      ["text", "Описание", "richText"],
    ]),
  ],
  packages: [
    ...headings("packagesPresentation"),
    field(
      "page-label",
      "Ссылка на сравнение",
      "packagesPresentation.pageLabel",
    ),
    ...itemFields("packages", DEFAULT_VELORA_CONTENT.packages, [
      ["name", "Название"],
      ["price", "Цена"],
      ["for", "Вместимость"],
      ["includes", "Состав", "richText"],
      ["cta", "CTA"],
    ]),
  ],
  gallery: [
    ...headings("galleryPresentation"),
    field("dialog", "Название диалога", "galleryPresentation.dialogLabel"),
    field("open", "Действие открытия", "galleryPresentation.openLabel"),
    field("close", "Действие закрытия", "galleryPresentation.closeLabel"),
    ...itemFields("gallery", DEFAULT_VELORA_CONTENT.gallery, [
      ["image", "Изображение", "url"],
      ["alt", "Alt-текст"],
    ]),
  ],
  catering: [
    ...headings("cateringPresentation"),
    ...itemFields("catering", DEFAULT_VELORA_CONTENT.catering, [
      ["title", "Название"],
      ["text", "Описание", "richText"],
      ["meta", "Цена"],
    ]),
  ],
  planner: [
    ...headings("plannerPresentation"),
    field("text", "Вводный текст", "plannerPresentation.text", "richText"),
    ...itemFields("planner", DEFAULT_VELORA_CONTENT.planner, [
      ["number", "Номер"],
      ["title", "Название"],
      ["text", "Описание", "richText"],
    ]),
  ],
  facts: itemFields("facts", DEFAULT_VELORA_CONTENT.facts, [
    ["value", "Значение"],
    ["label", "Подпись"],
  ]),
  reviews: [
    ...headings("reviewsPresentation"),
    ...itemFields("reviews", DEFAULT_VELORA_CONTENT.reviews, [
      ["quote", "Цитата", "richText"],
      ["author", "Автор"],
      ["meta", "Событие"],
    ]),
  ],
  faq: [
    ...headings("faqPresentation"),
    ...itemFields("faq", DEFAULT_VELORA_CONTENT.faq, [
      ["question", "Вопрос"],
      ["answer", "Ответ", "richText"],
    ]),
  ],
  contact: [
    ...headings("contact"),
    field("text", "Вводный текст", "contact.text", "richText"),
    ...["address", "phone", "email", "hours", "map", "mapAria", "cta"].map(
      (key) => field(key, `Контакт · ${key}`, `contact.${key}`),
    ),
  ],
  footer: [
    field("note", "Подпись", "footer.note"),
    field("copyright", "Копирайт", "footer.copyright"),
    field("home", "Страница · главная", "customPages.homeLabel"),
    field("venues", "Страница · залы", "customPages.venuesLabel"),
    field("packages", "Страница · пакеты", "customPages.packagesLabel"),
    field("area", "Страница · площадь", "customPages.areaLabel"),
    field("format", "Страница · формат", "customPages.formatLabel"),
    field("request", "Страница · CTA", "customPages.requestLabel"),
  ],
};

const at = (root: unknown, path: string) =>
  path.split(".").reduce<unknown>((value, key) => {
    if (!value || typeof value !== "object") return undefined;
    return (value as Record<string, unknown>)[key];
  }, root);

export function setVeloraPath(
  content: VeloraContent,
  path: string,
  value: string,
): VeloraContent {
  const next = structuredClone(content) as unknown as Record<string, unknown>;
  const keys = path.split(".");
  let target = next;
  for (const key of keys.slice(0, -1))
    target = target[key] as Record<string, unknown>;
  target[keys.at(-1)!] = value;
  return next as unknown as VeloraContent;
}

export function buildVeloraInspectorFields(
  content: VeloraContent,
  section: VeloraNativeSectionId,
  disabled: boolean,
  onChange: (next: VeloraContent, group: string) => void,
  onChooseMedia?: (target: PremiumTemplateEditorMediaTarget) => void,
): EditorInspectorPlacedField[] {
  return VELORA_EDITOR_SPECS[section].flatMap((spec) => {
    const value = String(at(content, spec.path) ?? "");
    const update = (next: string) =>
      onChange(
        setVeloraPath(content, spec.path, next),
        `velora:${section}:${spec.id}`,
      );
    const base =
      spec.kind === "richText"
        ? {
            id: spec.id,
            group: spec.group!,
            type: "richText" as const,
            label: spec.label,
            value,
            disabled,
            onChange: update,
          }
        : spec.kind === "textarea"
          ? {
              id: spec.id,
              group: spec.group!,
              type: "textarea" as const,
              label: spec.label,
              rows: 3,
              value,
              disabled,
              onChange: update,
            }
          : {
              id: spec.id,
              group: spec.group!,
              type: spec.kind === "url" ? ("url" as const) : ("text" as const),
              label: spec.label,
              value,
              disabled,
              onChange: update,
            };
    if (spec.group !== "media" || spec.kind !== "url" || !onChooseMedia)
      return [base];
    return [
      base,
      {
        id: `${spec.id}-picker`,
        group: "media",
        type: "button",
        label: `Выбрать: ${spec.label}`,
        disabled,
        onClick: () =>
          onChooseMedia({
            kind: "template-content",
            templateKey: "velora-event-venue",
            path: spec.path,
            label: spec.label,
          }),
      } as EditorInspectorPlacedField,
    ];
  });
}

export function resetVeloraSection(
  content: VeloraContent,
  section: VeloraNativeSectionId,
) {
  let next = structuredClone(content);
  for (const spec of VELORA_EDITOR_SPECS[section])
    next = setVeloraPath(
      next,
      spec.path,
      String(at(DEFAULT_VELORA_CONTENT, spec.path) ?? ""),
    );
  return next;
}
