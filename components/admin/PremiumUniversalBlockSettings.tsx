"use client";

import RichTextEditor from "@/components/admin/RichTextEditor";
import { editorCompactFieldClass } from "@/components/admin/EditorChrome";
import { defaultPublicSiteColumnCards, publicSiteBlockColumnCards, publicSiteCustomBlockVisualCapabilities } from "@/lib/public-site/custom-block-registry";
import type { EditorInspectorField, EditorInspectorPlacedField, OneStudioInspectorGroup } from "@/lib/public-site/editor-spec";
import type { AdminMessage, AdminMessageValues } from "@/lib/i18n/admin";
import type { PublicSiteColumnCard, PublicSiteCustomBlock } from "@/lib/public-site/types";
import { buildBlockLayoutInspectorFields, buildMediaLayoutInspectorFields } from "@/lib/public-site/media-layout-inspector";

type Translate = (message: AdminMessage, values?: AdminMessageValues) => string;

type SettingsOptions = {
  block: PublicSiteCustomBlock;
  disabled: boolean;
  onChange: (block: PublicSiteCustomBlock, historyField?: string) => void;
  onChooseImage: (target: { cardIndex?: number; listIndex?: number; label: string }) => void;
  t: Translate;
};

const options = (t: Translate, values: readonly (readonly [string, AdminMessage])[]) => values.map(([value, label]) => ({ value, label: t(label) }));

/** Builds shared inspector groups; this module never renders a Premium-specific inspector shell. */
export function buildPremiumUniversalInspectorFields({ block, disabled, onChange, onChooseImage, t }: SettingsOptions): EditorInspectorPlacedField[] {
  const patch = <Key extends keyof PublicSiteCustomBlock>(key: Key, value: PublicSiteCustomBlock[Key]) => onChange({ ...block, [key]: value }, String(key));
  const visual = publicSiteCustomBlockVisualCapabilities(block.kind, "premium");
  const groups: { id: string; title?: string; card?: boolean; fields: EditorInspectorField[] }[] = [];
  const appearance: EditorInspectorField[] = visual.layout || visual.spacing || visual.sectionHeight || visual.animation
    ? buildBlockLayoutInspectorFields({ value: block, disabled, t, idPrefix: "universal-layout", onChange: (key, value) => onChange({ ...block, [key]: value }, String(key)) })
    : [];
  if (appearance.length) groups.push({ id: "layout-spacing", fields: appearance, card: true });

  if (visual.colors) groups.push({ id: "appearance-colors", card: true, fields: [
    { id: "background", type: "color", label: t("Background"), value: block.colors?.background ?? "#f5f0e6", disabled, onChange: background => patch("colors", { ...block.colors, mode: "custom", background }) },
    { id: "text-color", type: "color", label: t("Text color"), value: block.colors?.text ?? "#202229", disabled, onChange: text => patch("colors", { ...block.colors, mode: "custom", text }) },
    { id: "accent", type: "color", label: t("Accent"), value: block.colors?.accent ?? "#f09a68", disabled, onChange: accent => patch("colors", { ...block.colors, mode: "custom", accent }) },
    { id: "theme-colors", type: "button", tone: "quiet", label: t("Use template colors"), disabled: disabled || block.colors?.mode !== "custom", onClick: () => patch("colors", { ...block.colors, mode: "theme" }) },
  ] });

  groups.push({ id: "content", card: true, fields: [
    { id: "eyebrow", type: "text", label: t("Eyebrow"), value: block.eyebrow, disabled, onChange: value => patch("eyebrow", value) },
    { id: "title", type: "textarea", label: t("Heading"), rows: 3, value: block.title, disabled, onChange: value => patch("title", value) },
    { id: "text", type: "richText", label: block.kind === "columns" ? t("Intro text") : t("Text"), value: block.text, disabled, onChange: value => patch("text", value) },
    ...(block.kind === "features" ? [{ id: "items", type: "textarea" as const, label: t("Advantages (title · description)"), rows: 6, value: block.items, disabled, onChange: (value: string) => patch("items", value) }] : []),
  ] });
  groups.push({ id: "typography", card: true, fields: [{ id: "title-typography", type: "typography", title: t("Block title"), description: t("Limited Site Editor 2.6 settings"), value: block.title_typography, disabled, onChange: value => patch("title_typography", value) }] });

  if (block.kind === "cta" || block.kind === "media_text") groups.push({ id: "actions-content", card: true, fields: [
    { id: "button-label", type: "text", label: t("Button text"), value: block.button_label, disabled, onChange: value => patch("button_label", value) },
    { id: "button-url", type: "url", label: t("Button link"), value: block.button_url, disabled, onChange: value => patch("button_url", value) },
  ] });

  const media: EditorInspectorField[] = [];
  if (block.kind === "slider" || block.kind === "collage") media.push({
    id: "media-list",
    type: "mediaList",
    items: block.media_urls ?? [],
    disabled,
    minItems: 2,
    maxItems: block.kind === "collage" ? 8 : 12,
    onChange: items => patch("media_urls", items),
    onChoose: (listIndex, label) => onChooseImage({ listIndex, label }),
  });
  if (block.kind === "slider") media.push({ id: "interval", type: "number", label: t("Interval, seconds"), value: block.slide_interval_seconds ?? 4, disabled, onChange: value => patch("slide_interval_seconds", Math.max(2, Number(value) || 2)) });
  if (block.kind === "video") media.push(
    { id: "video-url", type: "url", label: t("Video URL"), value: block.video_url ?? "", disabled, onChange: value => patch("video_url", value) },
    { id: "poster-url", type: "url", label: t("Poster URL"), value: block.video_poster_url ?? "", disabled, onChange: value => patch("video_poster_url", value) },
  );
  if (block.kind === "media_text") media.push(
    { id: "media-url", type: "url", label: t("Image URL"), value: block.media_url ?? "", disabled, onChange: value => patch("media_url", value) },
    { id: "choose-media", type: "button", label: t("Choose from media"), disabled, onClick: () => onChooseImage({ label: t("Block image") }) },
    { id: "media-alt", type: "text", label: t("Alternative text"), value: block.media_alt ?? "", disabled, onChange: value => patch("media_alt", value.slice(0, 180)) },
  );
  if (visual.mediaSizing) media.push(...buildMediaLayoutInspectorFields({
    value: block,
    disabled,
    t,
    idPrefix: "universal-media",
    capabilities: {
      size: block.kind !== "columns",
      aspect: block.kind !== "columns",
      height: block.kind !== "columns",
      fit: true,
      frame: block.kind !== "columns",
      radius: visual.mediaSurface,
      focalPoint: visual.mediaFocalPoint,
      opacity: visual.mediaSurface,
      overlay: visual.mediaSurface,
      placement: visual.mediaPosition ? (block.kind === "collage" ? "align" : "split") : undefined,
      responsive: visual.responsiveMedia,
      multiMedia: visual.multiMediaLayout,
    },
    onChange: (key, value) => onChange({ ...block, [key]: value }, String(key)),
  }));
  if (media.length) groups.push({ id: "media", card: true, fields: media });

  if (block.kind === "columns") groups.push({ id: "columns", card: true, fields: [
    { id: "columns-count", type: "select", label: t("Number of columns"), value: String(block.columns_count ?? 3), disabled, onChange: value => patch("columns_count", value === "2" ? 2 : 3), options: options(t, [["2", "Two columns"], ["3", "Three columns"]]) },
    { id: "column-cards", type: "custom", customContent: <PremiumColumnCardsWidget block={block} disabled={disabled} onChange={onChange} onChooseImage={onChooseImage} t={t} /> },
  ] });
  const placement = (id: string): OneStudioInspectorGroup => id === "typography" ? "typography" : id === "media" ? "media" : id === "layout-spacing" ? "layout" : "content";
  return groups.flatMap(group => group.fields.map(field => ({ ...field, group: placement(group.id) } as EditorInspectorPlacedField)));
}

/** Compatibility name for callers/tests from the shared-editor transition. */
export const buildPremiumUniversalInspectorGroups = buildPremiumUniversalInspectorFields;

function PremiumColumnCardsWidget({ block, disabled, onChange, onChooseImage, t }: SettingsOptions) {
  const cards = publicSiteBlockColumnCards(block);
  while (cards.length < 3) cards.push(defaultPublicSiteColumnCards(block.id)[cards.length]);
  const updateCard = (index: number, changes: Partial<PublicSiteColumnCard>, field: string) => onChange({ ...block, cards: cards.map((card, cardIndex) => cardIndex === index ? { ...card, ...changes } : card) }, `card-${index}-${field}`);
  return <div data-premium-column-cards-widget className="grid gap-3">{cards.slice(0, block.columns_count ?? 3).map((card, index) => <section key={card.id} className="grid gap-3 border-t border-black/8 pt-3 first:border-0 first:pt-0"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#9a742e]">{t("Card {count}", { count: index + 1 })}</p><label className="text-xs font-semibold text-[#4f4b45]">{t("Heading")}<input className={editorCompactFieldClass} value={card.title} disabled={disabled} onChange={event => updateCard(index, { title: event.target.value }, "title")} /></label><RichTextEditor label={t("Description")} value={card.text} disabled={disabled} onChange={value => updateCard(index, { text: value }, "text")} /><label className="text-xs font-semibold text-[#4f4b45]">{t("Card content")}<select className={editorCompactFieldClass} value={card.media_type} disabled={disabled} onChange={event => updateCard(index, { media_type: event.target.value === "image" ? "image" : "none" }, "media-type")}><option value="none">{t("Text only")}</option><option value="image">{t("Image and text")}</option></select></label>{card.media_type === "image" ? <><label className="text-xs font-semibold text-[#4f4b45]">{t("Image URL")}<input className={editorCompactFieldClass} value={card.media_url ?? ""} disabled={disabled} onChange={event => updateCard(index, { media_url: event.target.value }, "media-url")} /></label><button type="button" disabled={disabled} onClick={() => onChooseImage({ cardIndex: index, label: t("Image for card {count}", { count: index + 1 }) })} className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold disabled:opacity-40">{t("Choose from media")}</button></> : null}</section>)}</div>;
}

export default buildPremiumUniversalInspectorFields;
