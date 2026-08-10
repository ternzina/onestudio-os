import type { EditorInspectorPlacedField } from "./editor-spec.ts";
import type { GlossEditorSectionId } from "./gloss-premium-template-contract.ts";
import type { PublicSiteContent, PublicSiteTypography } from "./types.ts";

type Group = EditorInspectorPlacedField["group"];
type FieldKind = "text" | "textarea" | "richText" | "url" | "number" | "color" | "toggle" | "select" | "typography";
type FieldSpec = {
  id: string;
  label: string;
  path: string;
  kind?: FieldKind;
  group?: Group;
  rows?: number;
  options?: readonly { value: string; label: string }[];
};

const field = (
  id: string,
  label: string,
  path: string,
  kind: FieldKind = "text",
  group: Group = "content",
  options?: FieldSpec["options"],
  rows?: number,
): FieldSpec => ({ id, label, path, kind, group, options, rows });

const sectionPresentation = (section: GlossEditorSectionId): FieldSpec[] => [
  field("section-layout", "Композиция раздела", `system_section_settings.${section}.layout`, "select", "layout", [
    { value: "default", label: "Обычная" }, { value: "panel", label: "Внутри панели" },
  ]),
  field("section-width", "Ширина содержимого", `system_section_settings.${section}.content_width`, "select", "layout", [
    { value: "full", label: "На всю ширину" }, { value: "wide", label: "Широкая" }, { value: "medium", label: "Средняя" }, { value: "narrow", label: "Узкая" },
  ]),
  field("section-align", "Выравнивание текста", `system_section_settings.${section}.text_align`, "select", "layout", [
    { value: "left", label: "Слева" }, { value: "center", label: "По центру" }, { value: "right", label: "Справа" },
  ]),
  field("section-padding-top", "Отступ сверху", `system_section_settings.${section}.padding_top`, "select", "layout", [
    { value: "none", label: "Без отступа" }, { value: "compact", label: "Небольшой" }, { value: "normal", label: "Обычный" }, { value: "airy", label: "Большой" },
  ]),
  field("section-padding-bottom", "Отступ снизу", `system_section_settings.${section}.padding_bottom`, "select", "layout", [
    { value: "none", label: "Без отступа" }, { value: "compact", label: "Небольшой" }, { value: "normal", label: "Обычный" }, { value: "airy", label: "Большой" },
  ]),
  field("section-height", "Минимальная высота", `system_section_settings.${section}.section_height`, "select", "layout", [
    { value: "auto", label: "По содержимому" }, { value: "compact", label: "Компактная" }, { value: "medium", label: "Средняя" }, { value: "tall", label: "Высокая" }, { value: "screen", label: "На высоту экрана" },
  ]),
  field("heading-typography", "Оформление заголовка", `system_section_settings.${section}.heading_typography`, "typography", "typography"),
  field("background-mode", "Фон раздела", `system_section_settings.${section}.background_mode`, "select", "media", [
    { value: "theme", label: "Из шаблона" }, { value: "color", label: "Свой цвет" }, { value: "image", label: "Изображение" }, { value: "transparent", label: "Прозрачный" },
  ]),
  field("section-background", "Фоновое изображение раздела", `system_section_settings.${section}.background_image_url`, "url", "media"),
  field("background-position", "Положение фонового изображения", `system_section_settings.${section}.background_position`, "select", "media", [
    { value: "top", label: "Сверху" }, { value: "center", label: "По центру" }, { value: "bottom", label: "Снизу" },
  ]),
  field("background-overlay", "Затемнение фона", `system_section_settings.${section}.background_overlay`, "select", "media", [
    { value: "none", label: "Без затемнения" }, { value: "soft", label: "Мягкое" }, { value: "strong", label: "Сильное" },
  ]),
  field("animation", "Анимация появления", `system_section_settings.${section}.animation`, "select", "layout", [
    { value: "none", label: "Без анимации" }, { value: "fade", label: "Мягкое появление" }, { value: "rise", label: "Появление снизу" }, { value: "scale", label: "Лёгкое увеличение" },
  ]),
  field("animate-mobile", "Анимация на телефоне", `system_section_settings.${section}.animate_on_mobile`, "toggle", "layout"),
  field("hide-desktop", "Скрыть на компьютерах", `system_section_settings.${section}.hide_on_desktop`, "toggle", "layout"),
  field("hide-tablet", "Скрыть на планшетах", `system_section_settings.${section}.hide_on_tablet`, "toggle", "layout"),
  field("hide-mobile", "Скрыть на телефонах", `system_section_settings.${section}.hide_on_mobile`, "toggle", "layout"),
  field("color-mode", "Цвета раздела", `section_colors.${section}.mode`, "select", "layout", [{ value: "theme", label: "Палитра сайта" }, { value: "custom", label: "Свои цвета" }]),
  field("background-color", "Цвет фона раздела", `section_colors.${section}.background`, "color", "layout"),
  field("text-color", "Цвет текста раздела", `section_colors.${section}.text`, "color", "layout"),
  field("accent-color", "Акцентный цвет раздела", `section_colors.${section}.accent`, "color", "layout"),
];

const specs: Record<GlossEditorSectionId, FieldSpec[]> = {
  hero: [
    field("announcement-visible", "Показывать строку объявления", "show_announcement", "toggle"),
    field("announcement-text", "Текст объявления", "announcement_text"),
    field("header-sticky", "Закрепить шапку", "header_sticky", "toggle", "layout"),
    field("logo-size", "Размер логотипа", "header_logo_size", "select", "layout", [
      { value: "small", label: "Маленький" }, { value: "medium", label: "Средний" }, { value: "large", label: "Большой" },
    ]),
    field("logo-position", "Положение логотипа", "header_logo_position", "select", "layout", [
      { value: "left", label: "Слева" }, { value: "center", label: "По центру" },
    ]),
    field("layout", "Композиция обложки", "hero_layout", "select", "layout", [
      { value: "split", label: "Изображение рядом с текстом" }, { value: "cover", label: "Изображение как фон" }, { value: "text", label: "Только текст" },
    ]),
    field("image-fit", "Заполнение изображения", "hero_image_fit", "select", "media", [
      { value: "cover", label: "Заполнить с обрезкой" }, { value: "contain", label: "Показать целиком" },
    ]),
    field("image-placement", "Сторона изображения", "hero_image_placement", "select", "media", [
      { value: "right", label: "Справа" }, { value: "left", label: "Слева" },
    ]),
    field("eyebrow", "Надзаголовок", "hero_eyebrow"),
    field("title", "Главный заголовок", "hero_title", "textarea"),
    field("text", "Вводный текст", "hero_text", "richText"),
    field("primary-label", "Текст основной кнопки", "hero_primary_label"),
    field("primary-url", "Ссылка основной кнопки", "hero_primary_url", "url"),
    field("secondary-visible", "Показывать вторую кнопку", "show_hero_secondary", "toggle"),
    field("secondary-label", "Текст второй кнопки", "hero_secondary_label"),
    field("secondary-url", "Ссылка второй кнопки", "hero_secondary_url", "url"),
    field("image", "Изображение обложки", "hero_image_url", "url", "media"),
  ],
  services: [
    field("label", "Метка раздела", "services_label"), field("title", "Заголовок", "services_title", "textarea"), field("button", "Текст кнопки", "services_button_label"),
    field("layout", "Макет услуг", "services_layout", "select", "layout", [{ value: "cards", label: "Карточки" }, { value: "list", label: "Компактный список" }]),
    field("columns", "Количество колонок", "services_columns", "select", "layout", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]),
    field("descriptions", "Показывать описание", "services_show_description", "toggle", "layout"), field("prices", "Показывать цену", "services_show_price", "toggle", "layout"), field("duration", "Показывать длительность", "services_show_duration", "toggle", "layout"),
    field("images", "Изображения услуг · одно на строку", "service_image_urls", "textarea", "media", undefined, 7),
    field("card-images", "Изображения карточек · ключ | ссылка", "service_card_images", "textarea", "media", undefined, 7),
  ],
  portfolio: [
    field("label", "Метка раздела", "portfolio_label"), field("title", "Заголовок", "portfolio_title", "textarea"), field("popular", "Подпись популярных работ", "popular_title"), field("filters", "Подписи фильтров", "work_filters", "textarea"),
    field("layout", "Макет портфолио", "portfolio_layout", "select", "layout", [{ value: "grid", label: "Сетка" }, { value: "masonry", label: "Мозаика" }]),
    field("columns", "Количество колонок", "portfolio_columns", "select", "layout", [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]),
    field("aspect", "Пропорции карточек", "portfolio_card_aspect", "select", "layout", [{ value: "auto", label: "Автоматически" }, { value: "square", label: "Квадрат" }, { value: "landscape", label: "Альбомные" }, { value: "portrait", label: "Портретные" }]),
    field("limit", "Работ на главной", "portfolio_home_limit", "number", "layout"), field("show-filters", "Показывать фильтры", "portfolio_show_filters", "toggle", "layout"), field("lightbox", "Открывать изображения в галерее", "portfolio_lightbox", "toggle", "layout"), field("show-category", "Показывать категорию", "portfolio_show_category", "toggle", "layout"), field("show-title", "Показывать название работы", "portfolio_show_title", "toggle", "layout"), field("show-description", "Показывать описание работы", "portfolio_show_description", "toggle", "layout"),
  ],
  team: [field("label", "Метка раздела", "team_label"), field("title", "Заголовок", "team_title", "textarea"), field("items", "Мастера · имя · роль · описание", "team_items", "textarea", "content", undefined, 8), field("images", "Фотографии мастеров · одна на строку", "team_image_urls", "textarea", "media", undefined, 7)],
  booking: [field("label", "Метка раздела", "booking_label"), field("title", "Заголовок", "booking_title", "textarea"), field("text", "Текст", "booking_text", "richText")],
  membership: [field("label", "Метка раздела", "membership_label"), field("title", "Заголовок", "membership_title", "textarea"), field("text", "Вводный текст клуба", "membership_text", "richText"), field("items", "Уровни клуба · название · условие · описание · кнопка · ссылка", "membership_items", "textarea", "content", undefined, 9), field("image", "Основное изображение клуба", "membership_image_url", "url", "media"), field("images", "Изображения уровней · одно на строку", "membership_image_urls", "textarea", "media", undefined, 7)],
  safety: [field("label", "Метка раздела", "safety_label"), field("title", "Заголовок", "safety_title", "textarea"), field("items", "Карточки безопасности · заголовок · текст", "safety_items", "textarea", "content", undefined, 7)],
  reviews: [field("label", "Метка раздела", "reviews_label"), field("title", "Заголовок", "reviews_title", "textarea"), field("items", "Отзывы · текст · автор · подпись", "reviews_items", "textarea", "content", undefined, 7), field("reviews", "Отзывы · текст | автор | оценка | источник | ссылка", "reviews", "textarea", "content", undefined, 7)],
  gift: [field("label", "Метка раздела", "gift_label"), field("title", "Заголовок", "gift_title", "textarea"), field("text", "Вводный текст", "gift_text", "richText"), field("items", "Сертификаты · название · сумма · описание · кнопка · ссылка", "gift_items", "textarea", "content", undefined, 9), field("image", "Основное изображение сертификата", "gift_image_url", "url", "media"), field("images", "Изображения сертификатов · одно на строку", "gift_image_urls", "textarea", "media", undefined, 7)],
  faq: [field("label", "Метка раздела", "faq_label"), field("title", "Заголовок", "faq_title", "textarea"), field("items", "Вопросы и ответы · вопрос | ответ", "faq_items", "textarea", "content", undefined, 9)],
  about: [field("label", "Метка раздела", "about_label"), field("title", "Заголовок", "about_title", "textarea"), field("text", "Текст о студии", "about_text", "richText"), field("facts", "Факты · значение · подпись", "about_facts", "textarea", "content", undefined, 7), field("button", "Текст кнопки", "about_button_label"), field("button-url", "Ссылка кнопки", "about_button_url", "url"), field("image", "Изображение о студии", "about_image_url", "url", "media")],
  contact: [field("label", "Метка раздела", "contact_label"), field("title", "Заголовок", "contact_title", "textarea"), field("email", "Email для посетителей", "contact_email"), field("phone", "Телефон для посетителей", "contact_phone"), field("hours", "Часы работы", "contact_hours", "textarea"), field("address", "Адрес на сайте", "contact_address", "textarea"), field("map", "Адрес для поиска на карте", "map_query", "textarea"), field("note", "Подсказка посетителю", "contact_note", "richText"), field("route", "Текст кнопки маршрута", "contact_route_label"), field("footer", "Короткий текст в подвале", "footer_note", "richText")],
};

for (const section of Object.keys(specs) as GlossEditorSectionId[]) specs[section].push(...sectionPresentation(section));

export const GLOSS_EDITOR_EDITABLE_PATHS = Object.fromEntries(
  (Object.keys(specs) as GlossEditorSectionId[]).map(section => [section, specs[section].map(({ path }) => path)]),
) as Record<GlossEditorSectionId, string[]>;

function atPath(root: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined, root);
}

function setPath(content: PublicSiteContent, path: string, value: unknown): PublicSiteContent {
  const next = structuredClone(content) as unknown as Record<string, unknown>;
  const keys = path.split(".");
  let target = next;
  for (const key of keys.slice(0, -1)) {
    const current = target[key];
    target[key] = current && typeof current === "object" && !Array.isArray(current) ? { ...(current as Record<string, unknown>) } : {};
    target = target[key] as Record<string, unknown>;
  }
  target[keys.at(-1)!] = value;
  return next as unknown as PublicSiteContent;
}

function encodeValue(value: unknown, path: string) {
  if (Array.isArray(value)) {
    if (path === "reviews") return value.map(item => {
      const review = item as Record<string, unknown>;
      return [review.text ?? "", review.author ?? "", review.rating ?? 5, review.source ?? "", review.source_url ?? ""].join(" | ");
    }).join("\n");
    return value.map(item => String(item ?? "")).join("\n");
  }
  if (path === "service_card_images" && value && typeof value === "object") return Object.entries(value as Record<string, unknown>).map(([key, url]) => `${key} | ${String(url ?? "")}`).join("\n");
  return String(value ?? "");
}

function decodeValue(content: PublicSiteContent, spec: FieldSpec, value: string | boolean): unknown {
  const current = atPath(content, spec.path);
  if (spec.kind === "toggle") return Boolean(value);
  if (spec.kind === "number") return Number(value) || 0;
  if (typeof current === "number") return Number(value) || 0;
  if (Array.isArray(current)) {
    if (spec.path === "reviews") return String(value).split("\n").map(line => line.trim()).filter(Boolean).map((line, index) => {
      const [text = "", author = "", rating = "5", source = "", source_url = ""] = line.split("|").map(cell => cell.trim());
      return { ...((current[index] as Record<string, unknown> | undefined) ?? {}), id: (current[index] as Record<string, unknown> | undefined)?.id ?? `review-${index + 1}`, text, author, rating: Number(rating) || 5, source, source_url };
    });
    return String(value).split("\n").map(item => item.trim()).filter(Boolean);
  }
  if (spec.path === "service_card_images") return Object.fromEntries(String(value).split("\n").map(line => line.trim()).filter(Boolean).map(line => {
    const [key, ...url] = line.split("|");
    return [key.trim(), url.join("|").trim()];
  }).filter(([key]) => key));
  return String(value);
}

const customPaths = new Set([
  "hero_image_url",
  "team_items", "team_image_urls", "membership_items", "membership_image_url", "membership_image_urls",
  "gift_items", "gift_image_url", "gift_image_urls", "safety_items", "reviews", "reviews_items", "faq_items",
  "about_facts", "about_image_url", "service_image_urls", "service_card_images",
]);

export function buildGlossInspectorFields(content: PublicSiteContent, sectionId: GlossEditorSectionId, disabled: boolean, onChange: (content: PublicSiteContent, historyGroup: string) => void): EditorInspectorPlacedField[] {
  const fields: EditorInspectorPlacedField[] = specs[sectionId].filter(spec => !customPaths.has(spec.path) && !spec.path.endsWith(".background_image_url")).map(spec => {
    const current = atPath(content, spec.path);
    const update = (value: string | boolean) => onChange(setPath(content, spec.path, decodeValue(content, spec, value)), `gloss:${sectionId}:${spec.id}`);
    if (spec.kind === "toggle") return { id: `gloss-${sectionId}-${spec.id}`, group: spec.group ?? "content", type: "toggle", label: spec.label, checked: current === true, disabled, onChange: update };
    if (spec.kind === "select") return { id: `gloss-${sectionId}-${spec.id}`, group: spec.group ?? "content", type: "select", label: spec.label, value: String(current ?? spec.options?.[0]?.value ?? ""), options: spec.options ?? [], disabled, onChange: update };
    if (spec.kind === "typography") return { id: `gloss-${sectionId}-${spec.id}`, group: spec.group ?? "typography", type: "typography", title: spec.label, description: "Заголовок выбранного раздела", value: current && typeof current === "object" ? current as PublicSiteTypography : undefined, disabled, onChange: value => onChange(setPath(content, spec.path, value), `gloss:${sectionId}:${spec.id}`) } as EditorInspectorPlacedField;
    if (spec.kind === "richText") return { id: `gloss-${sectionId}-${spec.id}`, group: spec.group ?? "content", type: "richText", label: spec.label, value: String(current ?? ""), disabled, onChange: update };
    const value = encodeValue(current, spec.path);
    if (spec.kind === "textarea") return { id: `gloss-${sectionId}-${spec.id}`, group: spec.group ?? "content", type: "textarea", label: spec.label, value, rows: spec.rows ?? 3, disabled, onChange: update };
    return { id: `gloss-${sectionId}-${spec.id}`, group: spec.group ?? "content", type: spec.kind === "url" ? "url" : spec.kind === "number" ? "number" : spec.kind === "color" ? "color" : "text", label: spec.label, value, disabled, onChange: update };
  }) as EditorInspectorPlacedField[];
  return fields;
}

export function resetGlossInspectorSection(content: PublicSiteContent, defaults: PublicSiteContent, sectionId: GlossEditorSectionId) {
  return specs[sectionId].reduce(
    (next, spec) => setPath(next, spec.path, structuredClone(atPath(defaults, spec.path))),
    content,
  );
}
