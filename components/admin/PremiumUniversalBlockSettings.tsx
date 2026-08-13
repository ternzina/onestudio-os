"use client";

import RichTextEditor from "@/components/admin/RichTextEditor";
import BlockCompositionEditor from "@/components/admin/BlockCompositionEditor";
import SiteEditorMediaField from "@/components/admin/SiteEditorMediaField";
import { editorCompactFieldClass } from "@/components/admin/EditorChrome";
import { defaultPublicSiteColumnCards, publicSiteBlockColumnCards, publicSiteCustomBlockVisualCapabilities } from "@/lib/public-site/custom-block-registry";
import type { EditorInspectorField, EditorInspectorPlacedField, OneStudioInspectorGroup } from "@/lib/public-site/editor-spec";
import type { AdminMessage, AdminMessageValues } from "@/lib/i18n/admin";
import type { PublicSiteColumnCard, PublicSiteCustomBlock } from "@/lib/public-site/types";
import { buildBlockLayoutInspectorFields, buildMediaLayoutInspectorFields } from "@/lib/public-site/media-layout-inspector";
import { boundedPublicEmbedHeight, PUBLIC_SITE_HTML_SOURCE_MAX_LENGTH } from "@/lib/public-site/safe-html";

type Translate = (message: AdminMessage, values?: AdminMessageValues) => string;

type SettingsOptions = {
  block: PublicSiteCustomBlock;
  disabled: boolean;
  onChange: (block: PublicSiteCustomBlock, historyField?: string) => void;
  onChooseImage: (target: { cardIndex?: number; listIndex?: number; field?: "media_url" | "video_poster_url"; label: string }) => void;
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
  groups.push({ id: "layout-composition", card: true, fields: [{
    id: "block-composition",
    type: "composition",
    editor: <BlockCompositionEditor block={block} disabled={disabled} t={t} onChange={(key, value) => onChange({ ...block, [key]: value }, String(key))} />,
  }] });

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
  if (block.kind === "html_embed") groups.push({ id: "embed", card: true, fields: [
    { id: "html-source", type: "textarea", label: "HTML", rows: 8, value: block.html_source ?? "", disabled, onChange: value => patch("html_source", value.slice(0, PUBLIC_SITE_HTML_SOURCE_MAX_LENGTH)) },
    { id: "embed-url", type: "url", label: t("Embed URL"), value: block.embed_url ?? "", disabled, onChange: value => patch("embed_url", value.slice(0, 2048)) },
    { id: "embed-title", type: "text", label: t("Embed title"), value: block.embed_title ?? "", disabled, onChange: value => patch("embed_title", value.slice(0, 160)) },
    { id: "embed-height", type: "number", label: t("Embed height"), value: block.embed_height ?? 420, disabled, onChange: value => patch("embed_height", boundedPublicEmbedHeight(Number(value))) },
  ] });
  if (block.kind === "spacer") groups.push({ id: "spacer", card: true, fields: [
    { id: "spacer-size", type: "select", label: t("Spacing size"), value: block.spacer_size ?? "normal", disabled, onChange: value => patch("spacer_size", value === "compact" || value === "airy" ? value : "normal"), options: options(t, [["compact", "Compact"], ["normal", "Normal"], ["airy", "Airy"]]) },
    { id: "divider", type: "toggle", label: t("Show divider line"), checked: block.show_divider === true, disabled, onChange: value => patch("show_divider", value) },
  ] });
  groups.push({ id: "typography", card: true, fields: [{ id: "title-typography", type: "typography", forFieldId: "title", title: t("Block title"), description: t("Limited Site Editor 2.6 settings"), value: block.title_typography, disabled, onChange: value => patch("title_typography", value) }] });

  if (block.kind === "cta" || block.kind === "media_text" || block.preset_id === "pricing") groups.push({ id: "actions-content", card: true, fields: [
    {
      id: "button-action",
      type: "action",
      label: t("Button"),
      text: block.button_label,
      href: block.button_url,
      disabled,
      destinations: [
        { value: "#contact", label: t("Contact") },
        { value: "#services", label: t("Services") },
        { value: "#portfolio", label: t("Portfolio") },
      ],
      appearance: {
        size: block.button_size ?? "large",
        backgroundColor: block.button_background ?? "#202229",
        textColor: block.button_text_color ?? "#f5f0e6",
        onSizeChange: value => patch("button_size", value),
        onBackgroundColorChange: value => patch("button_background", value),
        onTextColorChange: value => patch("button_text_color", value),
      },
      onTextChange: value => patch("button_label", value),
      onHrefChange: value => patch("button_url", value),
    },
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
    { id: "poster-url", type: "media", label: t("Poster URL"), value: block.video_poster_url ?? "", disabled, onChange: value => patch("video_poster_url", value), onChoose: () => onChooseImage({ field: "video_poster_url", label: t("Poster URL") }) },
  );
  if (block.kind === "media_text") media.push(
    { id: "media-url", type: "media", label: t("Image URL"), value: block.media_url ?? "", disabled, onChange: value => patch("media_url", value), onChoose: () => onChooseImage({ field: "media_url", label: t("Block image") }) },
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
  const placement = (id: string): OneStudioInspectorGroup => id === "typography" ? "typography" : id === "media" ? "media" : id.startsWith("layout-") ? "layout" : "content";
  return groups.flatMap(group => group.fields.map(field => ({ ...field, group: placement(group.id) } as EditorInspectorPlacedField)));
}

/** Compatibility name for callers/tests from the shared-editor transition. */
export const buildPremiumUniversalInspectorGroups = buildPremiumUniversalInspectorFields;

function PremiumColumnCardsWidget({ block, disabled, onChange, onChooseImage, t }: SettingsOptions) {
  const cards = publicSiteBlockColumnCards(block);
  while (cards.length < 3) cards.push(defaultPublicSiteColumnCards(block.id)[cards.length]);
  const updateCard = (index: number, changes: Partial<PublicSiteColumnCard>, field: string) => onChange({ ...block, cards: cards.map((card, cardIndex) => cardIndex === index ? { ...card, ...changes } : card) }, `card-${index}-${field}`);
  const count = block.columns_count ?? 3;
  const moveCard = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= count) return;
    const next = [...cards];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange({ ...block, cards: next }, `card-${index}-order`);
  };
  return <div data-premium-column-cards-widget className="grid gap-3">{cards.slice(0, count).map((card, index) => <section key={card.id} className="grid gap-3 border-t border-black/8 pt-3 first:border-0 first:pt-0"><div className="flex items-center justify-between gap-2"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#9a742e]">{t("Card {count}", { count: index + 1 })}</p><span className="flex gap-1"><button type="button" aria-label={`${t("Move up")} · ${index + 1}`} disabled={disabled || index === 0} onClick={() => moveCard(index, -1)} className="grid h-7 w-7 place-items-center rounded-lg border border-black/10 text-xs disabled:opacity-25">↑</button><button type="button" aria-label={`${t("Move down")} · ${index + 1}`} disabled={disabled || index === count - 1} onClick={() => moveCard(index, 1)} className="grid h-7 w-7 place-items-center rounded-lg border border-black/10 text-xs disabled:opacity-25">↓</button></span></div><label className="text-xs font-semibold text-[#4f4b45]">{t("Heading")}<input className={editorCompactFieldClass} value={card.title} disabled={disabled} onChange={event => updateCard(index, { title: event.target.value }, "title")} /></label><RichTextEditor label={t("Description")} value={card.text} disabled={disabled} onChange={value => updateCard(index, { text: value }, "text")} /><label className="text-xs font-semibold text-[#4f4b45]">{t("Card content")}<select className={editorCompactFieldClass} value={card.media_type} disabled={disabled} onChange={event => updateCard(index, { media_type: event.target.value === "image" ? "image" : "none" }, "media-type")}><option value="none">{t("Text only")}</option><option value="image">{t("Image and text")}</option></select></label>{card.media_type === "image" ? <SiteEditorMediaField label={t("Image for card {count}", { count: index + 1 })} value={card.media_url ?? ""} disabled={disabled} onChange={value => updateCard(index, { media_url: value }, "media-url")} onChoose={() => onChooseImage({ cardIndex: index, field: "media_url", label: t("Image for card {count}", { count: index + 1 }) })} /> : null}</section>)}</div>;
}

export default buildPremiumUniversalInspectorFields;
