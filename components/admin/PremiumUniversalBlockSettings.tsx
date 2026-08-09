"use client";

import RichTextEditor from "@/components/admin/RichTextEditor";
import { editorCompactFieldClass } from "@/components/admin/EditorChrome";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import { defaultPublicSiteColumnCards, publicSiteBlockColumnCards, publicSiteCustomBlockVisualCapabilities } from "@/lib/public-site/custom-block-registry";
import type { EditorInspectorField, EditorInspectorPlacedField, OneStudioInspectorGroup } from "@/lib/public-site/editor-spec";
import type { PublicSiteColumnCard, PublicSiteCustomBlock } from "@/lib/public-site/types";

type SettingsOptions = {
  block: PublicSiteCustomBlock;
  disabled: boolean;
  onChange: (block: PublicSiteCustomBlock, historyField?: string) => void;
  onChooseImage: (target: { cardIndex?: number; label: string }) => void;
};

const options = (values: readonly (readonly [string, string])[]) => values.map(([value, label]) => ({ value, label }));

/** Builds shared inspector groups; this module never renders a Premium-specific inspector shell. */
export function buildPremiumUniversalInspectorFields({ block, disabled, onChange, onChooseImage }: SettingsOptions): EditorInspectorPlacedField[] {
  const patch = <Key extends keyof PublicSiteCustomBlock>(key: Key, value: PublicSiteCustomBlock[Key]) => onChange({ ...block, [key]: value }, String(key));
  const visual = publicSiteCustomBlockVisualCapabilities(block.kind, "premium");
  const groups: { id: string; title?: string; card?: boolean; fields: EditorInspectorField[] }[] = [];
  const appearance: EditorInspectorField[] = [];
  if (visual.layout) appearance.push({ id: "content-width", type: "select", label: "Ширина содержимого", value: block.content_width ?? "wide", disabled, onChange: value => patch("content_width", value as NonNullable<PublicSiteCustomBlock["content_width"]>), options: options([["full", "На всю ширину"], ["wide", "Широкая"], ["medium", "Средняя"], ["narrow", "Узкая"]]) });
  if (visual.spacing) appearance.push(
    { id: "padding-top", type: "select", label: "Отступ сверху", value: block.padding_top ?? "normal", disabled, onChange: value => patch("padding_top", value as NonNullable<PublicSiteCustomBlock["padding_top"]>), options: options([["none", "Нет"], ["compact", "Малый"], ["normal", "Обычный"], ["airy", "Большой"]]) },
    { id: "padding-bottom", type: "select", label: "Отступ снизу", value: block.padding_bottom ?? "normal", disabled, onChange: value => patch("padding_bottom", value as NonNullable<PublicSiteCustomBlock["padding_bottom"]>), options: options([["none", "Нет"], ["compact", "Малый"], ["normal", "Обычный"], ["airy", "Большой"]]) },
  );
  if (visual.sectionHeight) appearance.push({ id: "section-height", type: "select", label: "Минимальная высота", value: block.section_height ?? "auto", disabled, onChange: value => patch("section_height", value as NonNullable<PublicSiteCustomBlock["section_height"]>), options: options([["auto", "По содержимому"], ["compact", "Невысокая"], ["medium", "Средняя"], ["tall", "Высокая"], ["screen", "Почти экран"]]) });
  if (visual.animation) {
    appearance.push({ id: "animation", type: "select", label: "Анимация", value: block.animation ?? "none", disabled, onChange: value => patch("animation", value as NonNullable<PublicSiteCustomBlock["animation"]>), options: options([["none", "Нет"], ["fade", "Появление"], ["rise", "Снизу"], ["scale", "Увеличение"]]) });
    if (block.animation && block.animation !== "none") appearance.push({ id: "animate-mobile", type: "toggle", label: "Анимация на телефоне", checked: block.animate_on_mobile !== false, disabled, onChange: value => patch("animate_on_mobile", value) });
  }
  if (appearance.length) groups.push({ id: "layout-spacing", title: "Размеры и анимация", fields: appearance, card: true });

  if (visual.colors) groups.push({ id: "appearance-colors", title: "Цвета", card: true, fields: [
    { id: "background", type: "color", label: "Фон", value: block.colors?.background ?? "#f5f0e6", disabled, onChange: background => patch("colors", { ...block.colors, mode: "custom", background }) },
    { id: "text-color", type: "color", label: "Текст", value: block.colors?.text ?? "#202229", disabled, onChange: text => patch("colors", { ...block.colors, mode: "custom", text }) },
    { id: "accent", type: "color", label: "Акцент", value: block.colors?.accent ?? "#f09a68", disabled, onChange: accent => patch("colors", { ...block.colors, mode: "custom", accent }) },
    { id: "theme-colors", type: "button", tone: "quiet", label: "Использовать цвета шаблона", disabled: disabled || block.colors?.mode !== "custom", onClick: () => patch("colors", { ...block.colors, mode: "theme" }) },
  ] });

  groups.push({ id: "content", title: "Содержимое", card: true, fields: [
    { id: "eyebrow", type: "text", label: "Eyebrow", value: block.eyebrow, disabled, onChange: value => patch("eyebrow", value) },
    { id: "title", type: "textarea", label: "Заголовок", rows: 3, value: block.title, disabled, onChange: value => patch("title", value) },
    { id: "text", type: "richText", label: block.kind === "columns" ? "Вводный текст" : "Текст", value: block.text, disabled, onChange: value => patch("text", value) },
    ...(block.kind === "features" ? [{ id: "items", type: "textarea" as const, label: "Преимущества (заголовок · описание)", rows: 6, value: block.items, disabled, onChange: (value: string) => patch("items", value) }] : []),
  ] });
  groups.push({ id: "typography", title: "Типографика", card: true, fields: [{ id: "title-typography", type: "typography", title: "Заголовок блока", description: "Ограниченные настройки Site Editor 2.6", value: block.title_typography, disabled, onChange: value => patch("title_typography", value) }] });

  if (block.kind === "cta" || block.kind === "media_text") groups.push({ id: "actions-content", title: "Кнопка", card: true, fields: [
    { id: "button-label", type: "text", label: "Текст кнопки", value: block.button_label, disabled, onChange: value => patch("button_label", value) },
    { id: "button-url", type: "url", label: "Ссылка кнопки", value: block.button_url, disabled, onChange: value => patch("button_url", value) },
  ] });

  const media: EditorInspectorField[] = [];
  if (block.kind === "slider" || block.kind === "collage") media.push({ id: "media-urls", type: "textarea", label: "URL изображений (по одному в строке)", rows: 6, value: (block.media_urls ?? []).join("\n"), disabled, onChange: value => patch("media_urls", value.split("\n").map(item => item.trim()).filter(Boolean)) });
  if (block.kind === "slider") media.push({ id: "interval", type: "number", label: "Интервал, секунд", value: block.slide_interval_seconds ?? 4, disabled, onChange: value => patch("slide_interval_seconds", Math.max(2, Number(value) || 2)) });
  if (block.kind === "video") media.push(
    { id: "video-url", type: "url", label: "URL видео", value: block.video_url ?? "", disabled, onChange: value => patch("video_url", value) },
    { id: "poster-url", type: "url", label: "URL обложки", value: block.video_poster_url ?? "", disabled, onChange: value => patch("video_poster_url", value) },
  );
  if (block.kind === "media_text") media.push(
    { id: "media-position", type: "select", label: "Расположение изображения", value: block.media_position ?? "right", disabled, onChange: value => patch("media_position", value === "left" ? "left" : "right"), options: options([["right", "Текст + изображение"], ["left", "Изображение + текст"]]) },
    { id: "media-url", type: "url", label: "URL изображения", value: block.media_url ?? "", disabled, onChange: value => patch("media_url", value) },
    { id: "choose-media", type: "button", label: "Выбрать из медиатеки", disabled, onClick: () => onChooseImage({ label: "Изображение блока" }) },
    { id: "media-alt", type: "text", label: "Альтернативный текст", value: block.media_alt ?? "", disabled, onChange: value => patch("media_alt", value.slice(0, 180)) },
  );
  if (visual.mediaSizing) media.push(
    { id: "media-size", type: "select", label: "Размер медиа", value: block.media_size ?? "wide", disabled, onChange: value => patch("media_size", value as NonNullable<PublicSiteCustomBlock["media_size"]>), options: options([["full", "Полный"], ["wide", "Большой"], ["medium", "Средний"], ["compact", "Малый"]]) },
    { id: "media-aspect", type: "select", label: "Пропорции", value: block.media_aspect ?? "landscape", disabled, onChange: value => patch("media_aspect", value as NonNullable<PublicSiteCustomBlock["media_aspect"]>), options: options([["landscape", "16:9"], ["classic", "4:3"], ["square", "1:1"], ["portrait", "4:5"]]) },
    { id: "media-height", type: "select", label: "Высота медиа", value: block.media_height ?? "auto", disabled, onChange: value => patch("media_height", value as NonNullable<PublicSiteCustomBlock["media_height"]>), options: options([["auto", "По пропорциям"], ["compact", "Низкая"], ["medium", "Средняя"], ["tall", "Высокая"]]) },
    { id: "media-fit", type: "select", label: "Заполнение", value: block.media_fit ?? "cover", disabled, onChange: value => patch("media_fit", value as NonNullable<PublicSiteCustomBlock["media_fit"]>), options: options([["cover", "Заполнить"], ["contain", "Целиком"]]) },
    { id: "media-frame", type: "select", label: "Рамка", value: block.media_frame ?? "line", disabled, onChange: value => patch("media_frame", value as NonNullable<PublicSiteCustomBlock["media_frame"]>), options: options([["none", "Нет"], ["line", "Линия"], ["card", "Карточка"]]) },
  );
  if (media.length) groups.push({ id: "media", title: "Медиа", card: true, fields: media });

  if (block.kind === "columns") groups.push({ id: "columns", title: "Колонки", card: true, fields: [
    { id: "columns-count", type: "select", label: "Количество колонок", value: String(block.columns_count ?? 3), disabled, onChange: value => patch("columns_count", value === "2" ? 2 : 3), options: options([["2", "Две колонки"], ["3", "Три колонки"]]) },
    { id: "column-cards", type: "custom", customContent: <PremiumColumnCardsWidget block={block} disabled={disabled} onChange={onChange} onChooseImage={onChooseImage} /> },
  ] });
  const placement = (id: string): OneStudioInspectorGroup => id === "typography" ? "typography" : id === "media" ? "media" : id === "layout-spacing" ? "layout" : "content";
  return groups.flatMap(group => group.fields.map(field => ({ ...field, group: placement(group.id) } as EditorInspectorPlacedField)));
}

/** Compatibility name for callers/tests from the shared-editor transition. */
export const buildPremiumUniversalInspectorGroups = buildPremiumUniversalInspectorFields;

function PremiumColumnCardsWidget({ block, disabled, onChange, onChooseImage }: SettingsOptions) {
  const { t } = useAdminI18n();
  const cards = publicSiteBlockColumnCards(block);
  while (cards.length < 3) cards.push(defaultPublicSiteColumnCards(block.id)[cards.length]);
  const updateCard = (index: number, changes: Partial<PublicSiteColumnCard>, field: string) => onChange({ ...block, cards: cards.map((card, cardIndex) => cardIndex === index ? { ...card, ...changes } : card) }, `card-${index}-${field}`);
  return <div data-premium-column-cards-widget className="grid gap-3">{cards.slice(0, block.columns_count ?? 3).map((card, index) => <section key={card.id} className="grid gap-3 border-t border-black/8 pt-3 first:border-0 first:pt-0"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#9a742e]">Карточка {index + 1}</p><label className="text-xs font-semibold text-[#4f4b45]">Заголовок<input className={editorCompactFieldClass} value={card.title} disabled={disabled} onChange={event => updateCard(index, { title: event.target.value }, "title")} /></label><RichTextEditor label="Описание" value={card.text} disabled={disabled} onChange={value => updateCard(index, { text: value }, "text")} /><label className="text-xs font-semibold text-[#4f4b45]">Содержимое карточки<select className={editorCompactFieldClass} value={card.media_type} disabled={disabled} onChange={event => updateCard(index, { media_type: event.target.value === "image" ? "image" : "none" }, "media-type")}><option value="none">Только текст</option><option value="image">Изображение и текст</option></select></label>{card.media_type === "image" ? <><label className="text-xs font-semibold text-[#4f4b45]">URL изображения<input className={editorCompactFieldClass} value={card.media_url ?? ""} disabled={disabled} onChange={event => updateCard(index, { media_url: event.target.value }, "media-url")} /></label><button type="button" disabled={disabled} onClick={() => onChooseImage({ cardIndex: index, label: `Изображение карточки ${index + 1}` })} className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold disabled:opacity-40">{t("Choose from media")}</button></> : null}</section>)}</div>;
}

export default buildPremiumUniversalInspectorFields;
