"use client";

import { useRef, useState } from "react";
import HomeExperience from "@/app/demos/premium-kids-center/HomeExperience";
import BembiCustomPage from "@/components/public/BembiCustomPage";
import TemplateEditorRuntime from "@/components/admin/TemplateEditorRuntime";
import type { EditorInspectorField, EditorInspectorModel, EditorInspectorPlacedField, EditorNavigatorModel, TemplateEditorDevice, TemplateEditorSection } from "@/lib/public-site/editor-spec";
import TemplatePreviewViewport, { type TemplatePreviewViewportHandle } from "@/components/admin/TemplatePreviewViewport";
import MediaLibraryPicker from "@/components/admin/MediaLibraryPicker";
import { buildPremiumUniversalInspectorGroups } from "@/components/admin/PremiumUniversalBlockSettings";
import PremiumDelimitedListEditor from "@/components/admin/PremiumDelimitedListEditor";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import type { AdminMessage } from "@/lib/i18n/admin";
import { PREMIUM_UNIVERSAL_BLOCK_LIBRARY } from "@/lib/public-site/custom-block-registry";
import {
  PREMIUM_KIDS_BLOCK_REGISTRY,
  addPremiumKidsBlock,
  createPremiumKidsDefaultBlock,
  deletePremiumKidsBlock,
  duplicatePremiumKidsBlock,
  getPremiumKidsBlockDefinition,
  isPremiumKidsUniversalBlockType,
  movePremiumKidsBlock,
  replacePremiumKidsBlocks,
  resetPremiumKidsBlock,
  resolvePremiumKidsContent,
  restoreOriginalPremiumKidsContent,
  setPremiumKidsBlockVisibility,
  withPremiumKidsContent,
  type PremiumKidsBlock,
  type PremiumKidsBlockType,
  type PremiumKidsContent,
  type PremiumKidsEditableKey,
} from "@/lib/public-site/premium-kids-content";
import type { PublicSiteContent, PublicSiteCustomBlock, PublicSiteData, PublicSiteMediaLayoutSettings, PublicSiteMediaPosition, PublicSiteTypography } from "@/lib/public-site/types";
import { buildSitePreviewHref } from "@/lib/public-site/preview-contract";
import { addOneStudioPage, createOneStudioPage, removeOneStudioPage, updateOneStudioPage } from "@/lib/public-site/one-studio-pages";
import { createPublicSiteCustomBlock } from "@/lib/public-site/custom-block-registry";
import { buildMediaLayoutInspectorFields } from "@/lib/public-site/media-layout-inspector";
import { richTextPlainText } from "@/lib/public-site/rich-text";
import { getPremiumKidsNativeMediaSlots, premiumKidsNativeMediaUrl, type PremiumKidsNativeMedia } from "@/lib/public-site/premium-kids-native-media";

type Field = [PremiumKidsEditableKey, AdminMessage, "input" | "text" | "lines"];
type MediaTarget =
  | { kind: "universal"; cardIndex?: number; listIndex?: number; field?: "media_url" | "video_poster_url"; label: string }
  | { kind: "native"; slotId: string; label: string };

const fields: Record<PremiumKidsBlockType, Field[]> = {
  header: [["brand_name", "Site name", "input"], ["brand_tagline", "Brand tagline", "input"]],
  hero: [["hero_eyebrow", "Eyebrow", "input"], ["hero_title", "Heading", "text"], ["hero_description", "Description", "text"], ["primary_cta_label", "Primary button", "input"], ["secondary_cta_label", "Secondary button", "input"]],
  intro: [["intro_eyebrow", "Eyebrow", "input"], ["intro_title", "Heading", "text"], ["intro_description", "Description", "text"], ["age_groups", "Age groups (one per line)", "lines"]],
  programs: [["programs_title", "Heading", "text"], ["programs_description", "Description", "text"]],
  approach: [["approach_title", "Heading", "text"], ["approach_items", "Principles (one per line)", "lines"]],
  schedule: [["schedule_title", "Heading", "text"], ["schedule_description", "Description", "text"]],
  teachers: [["teachers_title", "Heading", "text"], ["teachers", "Team members (one per line)", "lines"]],
  gallery: [["gallery_title", "Heading", "text"], ["gallery_captions", "Captions (one per line)", "lines"]],
  reviews: [["reviews_title", "Heading", "text"], ["reviews", "Reviews (one per line)", "lines"]],
  faq: [["faq_title", "Heading", "text"], ["faq", "Questions: question | answer", "lines"]],
  final: [["final_cta_eyebrow", "Eyebrow", "input"], ["final_cta_title", "Heading", "text"], ["final_cta_label", "Button", "input"]],
  footer: [["footer_description", "Description", "text"], ["contact_email", "Email", "input"], ["contact_phone", "Phone number", "input"], ["contact_address", "Address", "text"]],
  text: [], features: [], cta: [], media_text: [], columns: [], slider: [], collage: [], video: [],
};

function newBlockId(type: PremiumKidsBlockType) {
  return `bembi-${type}-${crypto.randomUUID()}`;
}

export default function PremiumTemplateEditor({ businessId, businessSlug, businessName, locale, draft, disabled, saving, hasUnsavedChanges, device, canUndo, canRedo, onChange, onDeviceChange, onUndo, onRedo, onSave, onPublish, onOpenDesign, onOpenSeo }: {
  businessId: string; businessSlug: string; businessName: string; locale: string; draft: PublicSiteContent; disabled: boolean; saving: boolean; hasUnsavedChanges: boolean; device: TemplateEditorDevice; canUndo: boolean; canRedo: boolean;
  onChange: (draft: PublicSiteContent, historyGroup?: string) => void; onDeviceChange: (device: TemplateEditorDevice) => void; onUndo: () => void; onRedo: () => void; onSave: () => void; onPublish: () => void;
  onOpenDesign: () => void; onOpenSeo: () => void;
}) {
  const { locale: adminLocale, t } = useAdminI18n();
  const premium = resolvePremiumKidsContent(draft);
  const [selected, setSelected] = useState(premium.blocks.find(block => block.type === "hero")?.id ?? premium.blocks[0].id);
  const [selectedPageId, setSelectedPageId] = useState("home");
  const [editingEnabled, setEditingEnabled] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [mediaTarget, setMediaTarget] = useState<MediaTarget | null>(null);
  const viewportRef = useRef<TemplatePreviewViewportHandle>(null);
  const selectedBlock = premium.blocks.find(block => block.id === selected) ?? premium.blocks[0];
  const pages = draft.pages ?? [];
  const activePage = selectedPageId === "home" ? null : pages.find(page => page.id === selectedPageId) ?? null;
  const selectedPageBlock = activePage?.blocks?.find(block => block.id === selected) ?? null;
  const definition = getPremiumKidsBlockDefinition(selectedBlock.type);
  const originalBlock = createPremiumKidsDefaultBlock(selectedBlock.type);
  const site: PublicSiteData = { business: { id: businessId, slug: businessSlug, name: businessName, locale, primary_locale: locale, currency: "PLN", timezone: "Europe/Warsaw" }, content: draft, company: {}, services: [], portfolio: [], capabilities: { booking: true, catalog: true, portfolio: true }, available_locales: [locale], published_at: null };

  function commit(next: PremiumKidsContent, historyGroup = "") { onChange(withPremiumKidsContent(draft, next), historyGroup); }
  function update(key: PremiumKidsEditableKey, value: string) {
    const current = selectedBlock.props[key];
    const parsed = Array.isArray(current) ? value.split("\n").map(item => item.trim()).filter(Boolean) : value;
    const blocks = premium.blocks.map(block => block.id === selected ? { ...block, props: { ...block.props, [key]: parsed } } : block);
    commit(replacePremiumKidsBlocks(premium, blocks), `premium-field:${selected}:${key}`);
  }
  function updateList(key: "faq" | "reviews" | "teachers", values: string[]) {
    const blocks = premium.blocks.map(block => block.id === selected ? { ...block, props: { ...block.props, [key]: values } } : block);
    commit(replacePremiumKidsBlocks(premium, blocks), `premium-field:${selected}:${key}`);
  }
  function updateTypography(value: PublicSiteTypography | undefined) {
    const blocks = premium.blocks.map(block => block.id === selected ? { ...block, props: { ...block.props, heading_typography: value } } : block);
    commit(replacePremiumKidsBlocks(premium, blocks), `premium-typography:${selected}`);
  }
  function updateNativeMedia(nextMedia: PremiumKidsNativeMedia | undefined, historyField: string) {
    const blocks = premium.blocks.map(block => block.id === selected ? { ...block, props: { ...block.props, native_media: nextMedia } } : block);
    commit(replacePremiumKidsBlocks(premium, blocks), `premium-native-media:${selected}:${historyField}`);
  }
  function updateNativeMediaUrl(slotId: string, url: string | undefined) {
    const current = selectedBlock.props.native_media ?? {};
    const urls = { ...(current.urls ?? {}) };
    if (url?.trim()) urls[slotId] = url.trim();
    else delete urls[slotId];
    updateNativeMedia({ ...current, urls: Object.keys(urls).length ? urls : undefined }, `url:${slotId}`);
  }
  function updateNativeMediaLayout(key: keyof PublicSiteMediaLayoutSettings | "media_position", value: unknown) {
    if (key === "media_position") return;
    const next = { ...(selectedBlock.props.native_media ?? {}) } as Record<string, unknown>;
    if (value === undefined) delete next[key];
    else next[key] = value;
    updateNativeMedia(next as PremiumKidsNativeMedia, String(key));
  }
  function selectBlock(id: string) {
    setSelected(id);
    requestAnimationFrame(() => requestAnimationFrame(() => viewportRef.current?.scrollTo(`[data-premium-block-id="${id}"]`)));
  }
  function move(sourceId: string, targetId: string) { const next = movePremiumKidsBlock(premium, sourceId, targetId); if (next !== premium) commit(next); }
  function moveBy(blockId: string, direction: -1 | 1) { const index = premium.blocks.findIndex(block => block.id === blockId); const target = premium.blocks[index + direction]; if (target) move(blockId, target.id); }
  function duplicate(block: PremiumKidsBlock) { const id = newBlockId(block.type); const next = duplicatePremiumKidsBlock(premium, block.id, id); if (next !== premium) { commit(next); selectBlock(id); } }
  function add(type: PremiumKidsBlockType, mediaPosition?: PublicSiteMediaPosition) { const id = newBlockId(type); const next = addPremiumKidsBlock(premium, type, id, mediaPosition, selectedBlock.id); if (next !== premium) { commit(next); setShowLibrary(false); selectBlock(id); } }
  function updateUniversal(nextBlock: PublicSiteCustomBlock, historyField = "content") { const blocks = premium.blocks.map(block => block.id === selected ? { ...block, props: { ...block.props, universal_block: nextBlock } } : block); commit(replacePremiumKidsBlocks(premium, blocks), `premium-universal:${selected}:${historyField}`); }
  function selectMedia(url: string) {
    if (!mediaTarget) return;
    if (mediaTarget.kind === "native") {
      updateNativeMediaUrl(mediaTarget.slotId, url);
      setMediaTarget(null);
      return;
    }
    const universal = selectedPageBlock ?? selectedBlock.props.universal_block;
    if (!universal) return;
    const save = (block: PublicSiteCustomBlock, field: string) => activePage ? updatePageBlock(block) : updateUniversal(block, field);
    if (mediaTarget.listIndex !== undefined) {
      const mediaUrls = [...(universal.media_urls ?? [])];
      while (mediaUrls.length <= mediaTarget.listIndex) mediaUrls.push("");
      mediaUrls[mediaTarget.listIndex] = url;
      save({ ...universal, media_urls: mediaUrls }, `media-urls-${mediaTarget.listIndex}`);
    } else if (mediaTarget.cardIndex === undefined) {
      const field = mediaTarget.field ?? "media_url";
      save({ ...universal, [field]: url }, field);
    }
    else {
      const cards = [...(universal.cards ?? [])];
      const card = cards[mediaTarget.cardIndex];
      if (card) cards[mediaTarget.cardIndex] = { ...card, media_type: "image", media_url: url };
      save({ ...universal, cards }, `card-${mediaTarget.cardIndex}-media-url`);
    }
    setMediaTarget(null);
  }
  function remove(block: PremiumKidsBlock) { if (!window.confirm(t("Delete block confirmation", { name: t(getPremiumKidsBlockDefinition(block.type).label as AdminMessage) }))) return; const next = deletePremiumKidsBlock(premium, block.id); if (next !== premium) { const index = premium.blocks.findIndex(item => item.id === block.id); commit(next); if (selected === block.id) setSelected(next.blocks[Math.min(index, next.blocks.length - 1)].id); } }
  function reset(block: PremiumKidsBlock) { if (window.confirm(t("Reset BEMBI block confirmation"))) commit(resetPremiumKidsBlock(premium, block.id)); }
  function restoreOriginal() { if (window.confirm(t("Restore BEMBI draft confirmation"))) { const next = restoreOriginalPremiumKidsContent(); commit(next); setSelected(next.blocks.find(block => block.type === "hero")!.id); } }
  function setVisible(block: PremiumKidsBlock, visible: boolean) { commit(setPremiumKidsBlockVisibility(premium, block.id, visible)); }
  function addPage() { const page = createOneStudioPage(draft); onChange(addOneStudioPage(draft, page), "system-page:add"); setSelectedPageId(page.id); setSelected(page.blocks?.[0]?.id ?? ""); setEditingEnabled(true); }
  function updatePage(patch: Parameters<typeof updateOneStudioPage>[2], group = "metadata") { if (activePage) onChange(updateOneStudioPage(draft, activePage.id, patch), `system-page:${activePage.id}:${group}`); }
  function deletePage() { if (!activePage || !window.confirm(t("Remove page"))) return; onChange(removeOneStudioPage(draft, activePage.id), `system-page:${activePage.id}:remove`); setSelectedPageId("home"); setSelected(premium.blocks.find(block => block.type === "hero")?.id ?? premium.blocks[0].id); }
  function addPageBlock(kind: PublicSiteCustomBlock["kind"]) { if (!activePage) return; const block = createPublicSiteCustomBlock(kind); updatePage({ blocks: [...(activePage.blocks ?? []), block] }, "add-block"); setSelected(block.id); setShowLibrary(false); }
  function updatePageBlock(block: PublicSiteCustomBlock) { if (!activePage) return; updatePage({ blocks: (activePage.blocks ?? []).map(item => item.id === block.id ? block : item) }, `block:${block.id}`); }
  function removePageBlock() { if (!activePage || !selectedPageBlock) return; updatePage({ blocks: (activePage.blocks ?? []).filter(item => item.id !== selectedPageBlock.id) }, `block:${selectedPageBlock.id}:remove`); setSelected(""); }

  const typeCounts = new Map<PremiumKidsBlockType, number>();
  const typeTotals = new Map<PremiumKidsBlockType, number>();
  for (const block of premium.blocks) typeTotals.set(block.type, (typeTotals.get(block.type) ?? 0) + 1);
  const sections: TemplateEditorSection[] = premium.blocks.map(block => {
    const itemDefinition = getPremiumKidsBlockDefinition(block.type);
    const count = (typeCounts.get(block.type) ?? 0) + 1;
    typeCounts.set(block.type, count);
    const total = typeTotals.get(block.type) ?? 1;
    return { id: block.id, label: `${t(itemDefinition.label as AdminMessage)}${total > 1 ? ` · ${count}` : ""}${block.visible ? "" : ` · ${t("Hidden")}`}`, description: t(itemDefinition.description as AdminMessage), capabilities: itemDefinition.capabilities };
  });
  const selectedSection = sections.find(section => section.id === selected) ?? sections[0];
  const width = device === "mobile" ? 390 : device === "tablet" ? 768 : 1280;
  const zoom = device === "mobile" ? 0.82 : device === "tablet" ? 0.68 : 0.56;
  const controlsDisabled = disabled || !editingEnabled;
  const previewHref = buildSitePreviewHref({ templateKey: "premium-kids-center", businessSlug, locale });
  const templateLibraryItems = PREMIUM_KIDS_BLOCK_REGISTRY.filter(item => item.capabilities.add && !isPremiumKidsUniversalBlockType(item.type)).map(item => ({ id: item.type, label: item.label, description: item.description, onAdd: () => add(item.type) }));
  const universalLibraryItems = PREMIUM_UNIVERSAL_BLOCK_LIBRARY.map(item => ({ id: item.id, label: item.label, description: item.description, onAdd: () => add(item.kind as PremiumKidsBlockType, item.mediaPosition) }));

  const homeNavigatorModel: EditorNavigatorModel = {
    heading: t("Page blocks"),
    sections: sections.map((section, index) => {
      const block = premium.blocks[index];
      const capabilities = getPremiumKidsBlockDefinition(block.type).capabilities;
      return {
        id: block.id, key: block.id, label: section.label, description: section.description, index,
        selected: selected === block.id, visible: block.visible, required: !capabilities.delete,
        locked: !capabilities.reorder, disabled: controlsDisabled,
        capabilities: { ...capabilities, select: true, move: capabilities.reorder },
        onSelect: () => selectBlock(block.id), onVisibilityChange: visible => setVisible(block, visible),
        onDuplicate: () => duplicate(block), onDelete: () => remove(block), onMove: direction => moveBy(block.id, direction),
        canMoveUp: index > 2, canMoveDown: index < premium.blocks.length - 2,
        onDragStart: () => setDraggedId(block.id), onDragEnd: () => setDraggedId(null),
        onDrop: () => { if (draggedId) move(draggedId, block.id); setDraggedId(null); },
      };
    }),
    addBlock: { label: t("+ Add block"), disabled: controlsDisabled, onClick: () => setShowLibrary(true) },
    footerNotice: <>◆ {t("Required block")} · ⠿ {t("Reorderable block")}<br />{t("Hidden blocks remain available for editing.")}</>,
  };
  const visibilityFields: EditorInspectorField[] = definition.capabilities.visibility
    ? [{ id: "visibility", type: "toggle", label: t("Show this block"), checked: selectedBlock.visible, disabled: controlsDisabled, onChange: visible => setVisible(selectedBlock, visible) }]
    : [{ id: "required", type: "notice", text: t("Required BEMBI block notice") }];
  // Transitional source-contract markers: id: "content", id: "typography". Actual outer groups are OneStudio-owned.
  const inspectorFields: EditorInspectorPlacedField[] = visibilityFields.map(field => ({ ...field, group: "content" } as EditorInspectorPlacedField));
  if (selectedBlock.props.universal_block) {
    inspectorFields.push(...buildPremiumUniversalInspectorGroups({ block: selectedBlock.props.universal_block, disabled: controlsDisabled, onChange: updateUniversal, onChooseImage: target => setMediaTarget({ kind: "universal", ...target }), t }));
  } else {
    const contentFields: EditorInspectorField[] = [];
    const headingFieldId = fields[selectedBlock.type].find(([, label]) => label === "Heading")?.[0];
    for (const [key, label, kind] of fields[selectedBlock.type].filter(([key]) => !["faq", "reviews", "teachers"].includes(key))) {
      const raw = selectedBlock.props[key];
      const value = Array.isArray(raw) ? raw.join("\n") : raw ?? "";
      const originalRaw = originalBlock.props[key];
      const originalValue = Array.isArray(originalRaw) ? originalRaw.join("\n") : originalRaw ?? "";
      const rich = kind === "text" && ["hero_description", "intro_description", "programs_description", "schedule_description", "footer_description"].includes(key);
      const fixedActionDestination = key === "primary_cta_label"
        ? t("Programs")
        : key === "secondary_cta_label"
          ? t("Task library")
          : key === "final_cta_label"
            ? t("Schedule")
            : null;
      if (fixedActionDestination) {
        contentFields.push({
          id: key,
          type: "action",
          label: t(label),
          text: value,
          originalText: originalValue,
          disabled: controlsDisabled,
          destinationHint: fixedActionDestination,
          onTextChange: next => update(key, next),
        });
        continue;
      }
      contentFields.push(rich
        ? { id: key, type: "richText", label: t(label), value, originalValue, disabled: controlsDisabled, onChange: next => update(key, next) }
        : kind === "input"
          ? { id: key, type: "text", label: t(label), value, originalValue, disabled: controlsDisabled, onChange: next => update(key, next) }
          : { id: key, type: "textarea", label: t(label), rows: kind === "lines" ? 6 : 3, value, originalValue, disabled: controlsDisabled, onChange: next => update(key, next) });
    }
    const structured = selectedBlock.type === "faq" ? <PremiumDelimitedListEditor values={(selectedBlock.props.faq as string[]) ?? []} primaryLabel="Question" secondaryLabel="Answer" disabled={controlsDisabled} onChange={values => updateList("faq", values)} /> : selectedBlock.type === "reviews" ? <PremiumDelimitedListEditor values={(selectedBlock.props.reviews as string[]) ?? []} primaryLabel="Review text" secondaryLabel="Author" splitFromEnd disabled={controlsDisabled} onChange={values => updateList("reviews", values)} /> : selectedBlock.type === "teachers" ? <PremiumDelimitedListEditor values={(selectedBlock.props.teachers as string[]) ?? []} primaryLabel="Person name" secondaryLabel="Role" disabled={controlsDisabled} onChange={values => updateList("teachers", values)} /> : null;
    if (structured) contentFields.push({ id: "structured-content", type: "custom", customContent: structured });
    if (contentFields.length) inspectorFields.push(...contentFields.map(field => ({ ...field, group: "content" } as EditorInspectorPlacedField)));
    if (definition.capabilities.typography) inspectorFields.push({ id: "typography-controls", group: "typography", type: "typography", forFieldId: headingFieldId, title: t("Section title"), description: t("Limited Site Editor 2.6 settings"), value: selectedBlock.props.heading_typography, disabled: controlsDisabled, onChange: updateTypography });
    const nativeMediaSlots = getPremiumKidsNativeMediaSlots(selectedBlock.type);
    if (nativeMediaSlots.length) {
      inspectorFields.push(...nativeMediaSlots.map((slot, index) => {
        const label = adminLocale === "ru" ? slot.label : t("Image {count}", { count: index + 1 });
        return {
          id: `premium-native-media-${slot.id}`,
          group: "media" as const,
          type: "media" as const,
          label,
          value: premiumKidsNativeMediaUrl(selectedBlock.props.native_media, slot.id, slot.defaultUrl),
          originalValue: slot.defaultUrl,
          disabled: controlsDisabled,
          onChange: (value: string) => updateNativeMediaUrl(slot.id, value === slot.defaultUrl ? undefined : value),
          onChoose: () => setMediaTarget({ kind: "native", slotId: slot.id, label }),
        };
      }));
      inspectorFields.push(...buildMediaLayoutInspectorFields({
        value: selectedBlock.props.native_media ?? {},
        disabled: controlsDisabled,
        t,
        idPrefix: "premium-native-media-layout",
        capabilities: { size: true, fit: true, focalPoint: true, opacity: true, responsive: true },
        onChange: (key, value) => updateNativeMediaLayout(key, value),
      }).map(field => ({ ...field, group: "media" } as EditorInspectorPlacedField)));
    }
  }
  const homeInspectorModel: EditorInspectorModel = {
    heading: t("Block settings"), title: selectedSection.label, description: t(definition.description as AdminMessage),
    fields: inspectorFields,
    actions: [
      ...(definition.capabilities.duplicate ? [{ id: "duplicate", label: t("Duplicate block"), disabled: controlsDisabled, onClick: () => duplicate(selectedBlock) }] : []),
      ...(definition.capabilities.reset ? [{ id: "reset", label: t("Reset block"), disabled: controlsDisabled, onClick: () => reset(selectedBlock) }] : []),
      ...(definition.capabilities.delete ? [{ id: "delete", label: t("Delete block"), tone: "danger" as const, disabled: controlsDisabled, onClick: () => remove(selectedBlock) }] : []),
    ],
  };

  const pageNavigatorModel: EditorNavigatorModel | null = activePage ? {
    heading: t("Page blocks"),
    sections: [
      { id: `${activePage.id}:intro`, key: `${activePage.id}:intro`, label: t("Page intro"), index: 0, selected: !selectedPageBlock, visible: true, locked: true, capabilities: { select: true }, onSelect: () => setSelected("") },
      ...(activePage.blocks ?? []).map((block, index, blocks) => ({ id: block.id, key: block.id, label: richTextPlainText(block.title) || t("Custom block"), index: index + 1, selected: selected === block.id, visible: block.is_visible !== false, disabled: controlsDisabled, canMoveUp: index > 0, canMoveDown: index < blocks.length - 1, capabilities: { select: true, visibility: true, duplicate: true, delete: true, reorder: true, move: true }, onSelect: () => setSelected(block.id), onVisibilityChange: (visible: boolean) => updatePageBlock({ ...block, is_visible: visible }), onDuplicate: () => { const copy = { ...block, id: `${block.kind}-${crypto.randomUUID()}` }; updatePage({ blocks: [...blocks.slice(0, index + 1), copy, ...blocks.slice(index + 1)] }, "duplicate-block"); setSelected(copy.id); }, onDelete: () => { updatePage({ blocks: blocks.filter(item => item.id !== block.id) }, "delete-block"); setSelected(""); }, onMove: (direction: -1 | 1) => { const next = [...blocks]; const target = index + direction; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; updatePage({ blocks: next }, "reorder-block"); } })),
    ],
    addBlock: { label: t("+ Add block"), disabled: controlsDisabled, onClick: () => setShowLibrary(true) },
    footerNotice: t("This is a separate public page with its own address and navigation item."),
  } : null;
  const pageInspectorModel: EditorInspectorModel | null = activePage ? {
    heading: t("Block settings"), title: richTextPlainText(selectedPageBlock?.title) || activePage.nav_label,
    fields: selectedPageBlock
      ? buildPremiumUniversalInspectorGroups({ block: selectedPageBlock, disabled: controlsDisabled, onChange: updatePageBlock, onChooseImage: target => setMediaTarget({ kind: "universal", ...target }), t })
      : [
          { id: "nav-label", group: "content", type: "text", label: t("Navigation label"), value: activePage.nav_label, disabled: controlsDisabled, onChange: value => updatePage({ nav_label: value }, "nav-label") },
          { id: "slug", group: "content", type: "url", label: t("Page address"), value: activePage.slug, disabled: controlsDisabled, onChange: value => updatePage({ slug: value }, "slug") },
          { id: "eyebrow", group: "content", type: "text", label: t("Eyebrow"), value: activePage.eyebrow, disabled: controlsDisabled, onChange: value => updatePage({ eyebrow: value }, "eyebrow") },
          { id: "title", group: "content", type: "textarea", label: t("Main title"), value: activePage.title, disabled: controlsDisabled, onChange: value => updatePage({ title: value }, "title") },
          { id: "intro", group: "content", type: "richText", label: t("Introduction"), value: activePage.intro, disabled: controlsDisabled, onChange: value => updatePage({ intro: value }, "intro") },
          { id: "visibility", group: "content", type: "toggle", label: t("Show page on site"), checked: activePage.is_visible !== false, disabled: controlsDisabled, onChange: value => updatePage({ is_visible: value }, "visibility") },
          { id: "navigation", group: "content", type: "toggle", label: t("Show in navigation"), checked: activePage.show_in_navigation, disabled: controlsDisabled, onChange: value => updatePage({ show_in_navigation: value }, "navigation") },
          { id: "title-typography", group: "typography", type: "typography", forFieldId: "title", title: t("Main title"), description: richTextPlainText(activePage.title), value: activePage.title_typography, disabled: controlsDisabled, onChange: value => updatePage({ title_typography: value }, "typography") },
        ],
    actions: selectedPageBlock ? [{ id: "delete", label: t("Remove block"), tone: "danger", disabled: controlsDisabled, onClick: removePageBlock }] : [{ id: "delete-page", label: t("Remove page"), tone: "danger", disabled: controlsDisabled, onClick: deletePage }],
  } : null;
  const pagePreviewHref = activePage ? `${previewHref}/p/${encodeURIComponent(activePage.slug)}` : previewHref;
  const pageUniversalItems = PREMIUM_UNIVERSAL_BLOCK_LIBRARY.map(item => ({ id: item.id, label: item.label, description: item.description, onAdd: () => addPageBlock(item.kind) }));
  const navigatorModel: EditorNavigatorModel = pageNavigatorModel ?? homeNavigatorModel;
  const inspectorModel: EditorInspectorModel = pageInspectorModel ?? homeInspectorModel;

  return <><TemplateEditorRuntime templateKey="premium-kids-center" designName="BEMBI" templateTier="Premium" draftLabel={`${t("Draft")} · ${hasUnsavedChanges ? t("Unsaved") : t("Saved")}`} previewHref={pagePreviewHref} device={device} editingEnabled={editingEnabled} saving={saving || disabled} canUndo={canUndo} canRedo={canRedo} onDeviceChange={onDeviceChange} onEditingChange={setEditingEnabled} onUndo={onUndo} onRedo={onRedo} onSave={onSave} onPublish={onPublish}
    libraryOpen={showLibrary} onLibraryClose={() => setShowLibrary(false)} templateLibraryItems={activePage ? [] : templateLibraryItems} universalLibraryItems={activePage ? pageUniversalItems : universalLibraryItems}
    commandModel={{ pageLabel: t("Page"), pages: [{ id: "home", label: t("Home"), selected: !activePage, onSelect: () => { setSelectedPageId("home"); setSelected(premium.blocks.find(block => block.type === "hero")?.id ?? premium.blocks[0].id); } }, ...pages.map(page => ({ id: page.id, label: `${page.nav_label}${page.is_visible === false ? ` · ${t("Hidden")}` : ""}`, selected: activePage?.id === page.id, onSelect: () => { setSelectedPageId(page.id); setSelected(""); } }))], addPage: { id: "add-page", label: t("+ Add page"), disabled: controlsDisabled, onClick: addPage }, design: { id: "design", label: t("Design"), tone: "accent", onClick: onOpenDesign }, seo: { id: "seo", label: t("SEO pages"), onClick: onOpenSeo }, auxiliaryAction: { id: "restore", label: t("Restore original BEMBI"), disabled: controlsDisabled, onClick: restoreOriginal } }}
    navigatorModel={navigatorModel}
    canvas={<TemplatePreviewViewport ref={viewportRef} title={`BEMBI Premium · ${device}`} width={width} scale={zoom}>{activePage ? <BembiCustomPage basePath={previewHref} site={site} page={activePage} /> : <HomeExperience basePath={previewHref} site={site} />}</TemplatePreviewViewport>}
    inspectorModel={inspectorModel}
  /><MediaLibraryPicker open={Boolean(mediaTarget)} businessId={businessId} title={mediaTarget?.label ?? t("Choose image")} onSelect={selectMedia} onClose={() => setMediaTarget(null)} /></>;
}
