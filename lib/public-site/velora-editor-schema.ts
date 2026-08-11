import type { EditorInspectorPlacedField } from "./editor-spec.ts";
import {
  markFixedEditorActionFields,
  pairEditorActionFields,
} from "./editor-actions.ts";
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

const headingSections = new Set<VeloraNativeSectionId>([
  "hero", "availability", "venues", "formats", "transformation", "story", "packages", "included", "gallery", "catering", "decor", "coordinator", "planner", "reviews", "faq",
]);

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
  transformation: [
    ...headings("transformation"),
    field("text", "Пояснение", "transformation.text", "richText"),
    field("before-label", "Подпись до", "transformation.beforeLabel"),
    field(
      "before-image",
      "Фото до",
      "transformation.beforeImage",
      "url",
      "media",
    ),
    field(
      "before-alt",
      "Alt фото до",
      "transformation.beforeAlt",
      "text",
      "media",
    ),
    field("after-label", "Подпись после", "transformation.afterLabel"),
    field(
      "after-image",
      "Фото после",
      "transformation.afterImage",
      "url",
      "media",
    ),
    field(
      "after-alt",
      "Alt фото после",
      "transformation.afterAlt",
      "text",
      "media",
    ),
  ],
  story: [
    ...headings("storyPresentation"),
    field("text", "Пояснение", "storyPresentation.text", "richText"),
    ...itemFields("story", DEFAULT_VELORA_CONTENT.story, [
      ["number", "Номер"],
      ["title", "Этап"],
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
      ["result", "Результат"],
      ["price", "Цена"],
      ["for", "Вместимость"],
      ["includes", "Состав", "richText"],
      ["decor", "Декор"],
      ["menu", "Меню"],
      ["image", "Изображение", "url"],
      ["alt", "Alt-текст"],
      ["cta", "CTA"],
    ]),
  ],
  included: [
    ...headings("includedPresentation"),
    field("text", "Пояснение", "includedPresentation.text", "richText"),
    ...itemFields("included", DEFAULT_VELORA_CONTENT.included, [
      ["number", "Номер"],
      ["title", "Состав"],
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
    field("text", "Пояснение", "cateringPresentation.text", "richText"),
    field(
      "image",
      "Изображение меню",
      "cateringPresentation.image",
      "url",
      "media",
    ),
    field(
      "alt",
      "Alt изображения меню",
      "cateringPresentation.alt",
      "text",
      "media",
    ),
    field("cta", "CTA меню", "cateringPresentation.cta"),
    ...itemFields("catering", DEFAULT_VELORA_CONTENT.catering, [
      ["title", "Название"],
      ["text", "Описание", "richText"],
      ["meta", "Цена"],
    ]),
  ],
  decor: [
    ...headings("decor"),
    field("text", "Описание", "decor.text", "richText"),
    field("image", "Фото декора", "decor.image", "url", "media"),
    field("alt", "Alt фото декора", "decor.alt", "text", "media"),
  ],
  coordinator: [
    ...headings("coordinator"),
    field("text", "Описание", "coordinator.text", "richText"),
    field("promise", "Обещание", "coordinator.promise"),
    field("image", "Фото команды", "coordinator.image", "url", "media"),
    field("alt", "Alt фото команды", "coordinator.alt", "text", "media"),
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
    field(
      "disclaimer",
      "Пометка demo",
      "reviewsPresentation.disclaimer",
      "textarea",
    ),
    ...itemFields("reviews", DEFAULT_VELORA_CONTENT.reviews, [
      ["quote", "Цитата", "richText"],
      ["author", "Автор"],
      ["meta", "Событие"],
      ["task", "Задача"],
      ["image", "Изображение", "url"],
      ["alt", "Alt-текст"],
    ]),
  ],
  faq: [
    ...headings("faqPresentation"),
    ...itemFields("faq", DEFAULT_VELORA_CONTENT.faq, [
      ["question", "Вопрос"],
      ["answer", "Ответ", "richText"],
    ]),
  ],
  footer: [
    field("note", "Подпись", "footer.note"),
    field("tagline", "Фраза в футере", "footer.tagline", "textarea"),
    field("cta", "Кнопка в футере", "footer.cta"),
    field("navigation-label", "Заголовок навигации", "footer.navigationLabel"),
    field("contact-label", "Заголовок контактов", "footer.contactLabel"),
    field("language-label", "Подпись языков", "footer.languageLabel"),
    field("top-label", "Ссылка наверх", "footer.topLabel"),
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
  const fields = VELORA_EDITOR_SPECS[section].flatMap((spec) => {
    const value = String(at(content, spec.path) ?? "");
    const originalValue = String(at(DEFAULT_VELORA_CONTENT, spec.path) ?? "");
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
            originalValue,
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
              originalValue,
              disabled,
              onChange: update,
            }
          : {
              id: spec.id,
              group: spec.group!,
              type: spec.kind === "url" ? ("url" as const) : ("text" as const),
              label: spec.label,
              value,
              originalValue,
              disabled,
              onChange: update,
            };
    if (spec.group !== "media" || spec.kind !== "url" || !onChooseMedia) return [base];
    return [{
      id: spec.id,
      group: "media",
      type: "media",
      label: spec.label,
      value,
      originalValue: String(at(DEFAULT_VELORA_CONTENT, spec.path) ?? ""),
      disabled,
      onChange: update,
      onChoose: () => onChooseMedia({
        kind: "template-content",
        templateKey: "velora-event-venue",
        path: spec.path,
        label: spec.label,
      }),
    } as EditorInspectorPlacedField];
  });
  let result = fields as EditorInspectorPlacedField[];
  if (section === "hero") result = pairEditorActionFields(result, [
    {
      id: "velora-hero-primary-action",
      label: "Главная кнопка",
      textFieldId: "primary",
      hrefFieldId: "primary-url",
      destinations: [
        { value: "#availability", label: "Проверка даты" },
        { value: "#venues", label: "Залы" },
        { value: "#packages", label: "Пакеты" },
      ],
    },
    {
      id: "velora-hero-secondary-action",
      label: "Вторая кнопка",
      textFieldId: "secondary",
      hrefFieldId: "secondary-url",
      destinations: [
        { value: "#venues", label: "Залы" },
        { value: "#main-story", label: "История" },
        { value: "#gallery", label: "Галерея" },
      ],
    },
  ]);
  if (section === "hero") result = markFixedEditorActionFields(result, [{
    fieldId: "header-cta",
    destinationHint: "Проверка даты",
  }]);
  if (section === "footer") result = markFixedEditorActionFields(result, [{
    fieldId: "cta",
    destinationHint: "Проверка даты",
  }]);
  if (headingSections.has(section)) result.push({
    id: `velora-${section}-heading-typography`,
    group: "typography",
    type: "typography",
    forFieldId: "title",
    title: "Оформление заголовка",
    description: "Главный заголовок выбранного раздела",
    value: content.headingTypography[section],
    disabled,
    onChange: (value) => onChange({ ...content, headingTypography: { ...content.headingTypography, [section]: value } }, `velora:${section}:heading-typography`),
  });
  return result;
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
  if (headingSections.has(section)) {
    const headingTypography = { ...next.headingTypography };
    delete headingTypography[section];
    next = { ...next, headingTypography };
  }
  return next;
}
