import type { EditorInspectorPlacedField } from "./editor-spec.ts";
import type { PremiumTemplateEditorMediaTarget } from "./premium-template-editor-adapter.ts";
import type { VowContent, VowItem } from "./vow-premium-template-content.ts";
import { DEFAULT_VOW_CONTENT } from "./vow-premium-template-content.ts";
import type { VowNativeSectionId } from "./vow-premium-template-contract.ts";

type FieldKind = "text" | "textarea" | "richText" | "url" | "action";
type FieldSpec = {
  id: string;
  label: string;
  path: string;
  kind?: FieldKind;
  hrefPath?: string;
  group?: EditorInspectorPlacedField["group"];
};

const field = (
  id: string,
  label: string,
  path: string,
  kind: FieldKind = "text",
  group: EditorInspectorPlacedField["group"] = "content",
): FieldSpec => ({ id, label, path, kind, group });
const action = (
  id: string,
  label: string,
  textPath: string,
  hrefPath: string,
): FieldSpec => ({ id, label, path: textPath, hrefPath, kind: "action", group: "content" });
const headings = (path: string) => [
  field("eyebrow", "Метка раздела", `${path}.eyebrow`),
  field("title", "Заголовок раздела", `${path}.title`, "textarea"),
];
const itemFields = (
  prefix: string,
  items: VowItem[],
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

const headingSections = new Set<VowNativeSectionId>([
  "hero",
  "manifesto",
  "films",
  "story",
  "experience",
  "process",
  "packages",
  "gallery",
  "reviews",
  "availability",
  "faq",
  "contact",
]);

export const VOW_EDITOR_SPECS: Record<VowNativeSectionId, FieldSpec[]> = {
  hero: [
    field("brand", "Название", "brand"),
    field("header-eyebrow", "Подпись бренда", "header.eyebrow"),
    field("header-cta", "CTA в шапке", "header.availabilityLabel"),
    ...itemFields("navigation", DEFAULT_VOW_CONTENT.navigation, [
      ["label", "Навигация · подпись"],
      ["href", "Навигация · ссылка", "url"],
    ]),
    field("eyebrow", "Надзаголовок", "hero.eyebrow"),
    field("title", "Главный заголовок", "hero.title", "textarea"),
    field("text", "Вводный текст", "hero.text", "richText"),
    action("primary-action", "Главная кнопка", "hero.primaryLabel", "hero.primaryUrl"),
    action("secondary-action", "Вторая кнопка", "hero.secondaryLabel", "hero.secondaryUrl"),
    field("image", "Изображение обложки", "hero.image", "url", "media"),
    field("alt", "Alt-текст обложки", "hero.alt", "text", "media"),
    field("play", "Подпись showreel", "hero.playLabel"),
  ],
  manifesto: [
    ...headings("manifesto"),
    field("text", "Текст", "manifesto.text", "richText"),
    field("quote", "Ключевая фраза", "manifesto.quote", "textarea"),
  ],
  films: [
    ...headings("filmsPresentation"),
    field("text", "Вводный текст", "filmsPresentation.text", "richText"),
    field("page-label", "Ссылка на все фильмы", "filmsPresentation.pageLabel"),
    ...itemFields("films", DEFAULT_VOW_CONTENT.films, [
      ["names", "Имена"],
      ["location", "Локация"],
      ["year", "Год"],
      ["caption", "Описание", "richText"],
      ["cta", "CTA"],
      ["image", "Изображение", "url"],
      ["alt", "Alt-текст"],
      ["position", "Фокус изображения"],
    ]),
  ],
  story: [
    ...headings("story"),
    field("text", "Описание", "story.text", "richText"),
    field("note", "Короткая подпись", "story.note"),
    field("image", "Изображение", "story.image", "url", "media"),
    field("alt", "Alt-текст", "story.alt", "text", "media"),
  ],
  experience: [
    ...headings("experiencePresentation"),
    field("text", "Вводный текст", "experiencePresentation.text", "richText"),
    ...itemFields("experience", DEFAULT_VOW_CONTENT.experience, [
      ["number", "Номер"],
      ["title", "Этап"],
      ["text", "Описание", "richText"],
    ]),
  ],
  process: [
    ...headings("processPresentation"),
    ...itemFields("process", DEFAULT_VOW_CONTENT.process, [
      ["number", "Номер"],
      ["title", "Этап"],
      ["text", "Описание", "richText"],
    ]),
  ],
  packages: [
    ...headings("packagesPresentation"),
    field("text", "Пояснение", "packagesPresentation.text", "richText"),
    field("page-label", "Ссылка на сравнение", "packagesPresentation.pageLabel"),
    ...itemFields("packages", DEFAULT_VOW_CONTENT.packages, [
      ["name", "Название"],
      ["price", "Цена"],
      ["length", "Длина фильма"],
      ["hours", "Время съёмки"],
      ["includes", "Что включено", "richText"],
      ["note", "Примечание"],
      ["cta", "CTA"],
    ]),
  ],
  gallery: [
    ...headings("galleryPresentation"),
    field("text", "Пояснение", "galleryPresentation.text", "richText"),
    ...itemFields("gallery", DEFAULT_VOW_CONTENT.gallery, [
      ["title", "Название"],
      ["meta", "Локация / год"],
      ["image", "Изображение", "url"],
      ["alt", "Alt-текст"],
      ["position", "Фокус изображения"],
    ]),
  ],
  reviews: [
    ...headings("reviewsPresentation"),
    field("disclaimer", "Пометка demo", "reviewsPresentation.disclaimer", "textarea"),
    ...itemFields("reviews", DEFAULT_VOW_CONTENT.reviews, [
      ["quote", "Цитата", "richText"],
      ["author", "Автор"],
      ["meta", "Локация"],
    ]),
  ],
  availability: [
    ...headings("availability"),
    field("text", "Пояснение", "availability.text", "richText"),
    ...[
      "dateLabel",
      "cityLabel",
      "packageLabel",
      "packagePlaceholder",
      "nameLabel",
      "emailLabel",
      "phoneLabel",
      "messageLabel",
      "submit",
      "pending",
      "idle",
      "success",
      "error",
      "ariaLabel",
      "subject",
    ].map((key) => field(key, `Форма · ${key}`, `availability.${key}`, key === "idle" || key === "success" || key === "error" ? "textarea" : "text")),
  ],
  faq: [
    ...headings("faqPresentation"),
    ...itemFields("faq", DEFAULT_VOW_CONTENT.faq, [
      ["question", "Вопрос"],
      ["answer", "Ответ", "richText"],
    ]),
  ],
  contact: [
    ...headings("contact"),
    field("text", "Текст", "contact.text", "richText"),
    field("cta", "CTA", "contact.cta"),
    field("secondary", "Контакт", "contact.secondary"),
    field("image", "Фоновое изображение", "contact.image", "url", "media"),
    field("alt", "Alt-текст", "contact.alt", "text", "media"),
  ],
  footer: [
    field("note", "Подпись", "footer.note"),
    field("tagline", "Фраза", "footer.tagline", "textarea"),
    field("top", "Наверх", "footer.topLabel"),
    field("copyright", "Копирайт", "footer.copyright"),
    field("home", "Страница · главная", "customPages.homeLabel"),
    field("films", "Страница · фильмы", "customPages.filmsLabel"),
    field("packages", "Страница · пакеты", "customPages.packagesLabel"),
  ],
};

const at = (root: unknown, path: string) =>
  path.split(".").reduce<unknown>((value, key) => {
    if (!value || typeof value !== "object") return undefined;
    return (value as Record<string, unknown>)[key];
  }, root);

export function setVowPath(content: VowContent, path: string, value: string): VowContent {
  const next = structuredClone(content) as unknown as Record<string, unknown>;
  const keys = path.split(".");
  let target = next;
  for (const key of keys.slice(0, -1)) target = target[key] as Record<string, unknown>;
  target[keys.at(-1)!] = value;
  return next as unknown as VowContent;
}

export function buildVowInspectorFields(
  content: VowContent,
  section: VowNativeSectionId,
  disabled: boolean,
  onChange: (next: VowContent, group: string) => void,
  onChooseMedia?: (target: PremiumTemplateEditorMediaTarget) => void,
): EditorInspectorPlacedField[] {
  const fields = VOW_EDITOR_SPECS[section].flatMap((spec) => {
    const value = String(at(content, spec.path) ?? "");
    const originalValue = String(at(DEFAULT_VOW_CONTENT, spec.path) ?? "");
    const update = (next: string) => onChange(setVowPath(content, spec.path, next), `vow:${section}:${spec.id}`);
    if (spec.kind === "action" && spec.hrefPath) {
      const href = String(at(content, spec.hrefPath) ?? "");
      const originalHref = String(at(DEFAULT_VOW_CONTENT, spec.hrefPath) ?? "");
      return [{
        id: spec.id,
        group: spec.group!,
        type: "action" as const,
        label: spec.label,
        text: value,
        href,
        originalText: originalValue,
        originalHref,
        disabled,
        onTextChange: update,
        onHrefChange: (next: string) =>
          onChange(
            setVowPath(content, spec.hrefPath!, next),
            `vow:${section}:${spec.id}`,
          ),
      }];
    }
    const base = spec.kind === "richText"
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
      onChoose: () => onChooseMedia({ kind: "template-content", templateKey: "vow-films", path: spec.path, label: spec.label }),
    } as EditorInspectorPlacedField];
  });
  if (headingSections.has(section)) {
    fields.push({
      id: `vow-${section}-heading-typography`,
      group: "typography",
      type: "typography",
      forFieldId: "title",
      title: "Оформление заголовка",
      description: "Главный заголовок выбранного раздела",
      value: content.headingTypography[section],
      disabled,
      onChange: (value) => onChange({ ...content, headingTypography: { ...content.headingTypography, [section]: value } }, `vow:${section}:heading-typography`),
    });
  }
  return fields;
}

export function resetVowSection(content: VowContent, section: VowNativeSectionId) {
  let next = structuredClone(content);
  for (const spec of VOW_EDITOR_SPECS[section]) {
    next = setVowPath(next, spec.path, String(at(DEFAULT_VOW_CONTENT, spec.path) ?? ""));
    if (spec.hrefPath) {
      next = setVowPath(
        next,
        spec.hrefPath,
        String(at(DEFAULT_VOW_CONTENT, spec.hrefPath) ?? ""),
      );
    }
  }
  if (headingSections.has(section)) {
    const headingTypography = { ...next.headingTypography };
    delete headingTypography[section];
    next = { ...next, headingTypography };
  }
  return next;
}
