"use client";

import { useRef, useState } from "react";
import HomeExperience from "@/app/demos/premium-kids-center/HomeExperience";
import RichTextEditor from "@/components/admin/RichTextEditor";
import TemplateEditorShell, { type TemplateEditorDevice, type TemplateEditorSection } from "@/components/admin/TemplateEditorShell";
import TemplatePreviewViewport, { type TemplatePreviewViewportHandle } from "@/components/admin/TemplatePreviewViewport";
import TypographyControls from "@/components/admin/TypographyControls";
import MediaLibraryPicker from "@/components/admin/MediaLibraryPicker";
import PremiumUniversalBlockSettings from "@/components/admin/PremiumUniversalBlockSettings";
import PremiumDelimitedListEditor from "@/components/admin/PremiumDelimitedListEditor";
import { EditorBlockRow, EditorInspectorActions, EditorToggle, editorCompactFieldClass } from "@/components/admin/EditorChrome";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import type { AdminMessage } from "@/lib/i18n/admin";
import { PREMIUM_UNIVERSAL_BLOCK_LIBRARY } from "@/lib/public-site/custom-block-registry";
import {
  PREMIUM_KIDS_BLOCK_REGISTRY,
  addPremiumKidsBlock,
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
import type { PublicSiteContent, PublicSiteCustomBlock, PublicSiteData, PublicSiteMediaPosition, PublicSiteTypography } from "@/lib/public-site/types";

const inputClass = editorCompactFieldClass;
type Field = [PremiumKidsEditableKey, AdminMessage, "input" | "text" | "lines"];

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
  text: [], media_text: [], columns: [],
};

function newBlockId(type: PremiumKidsBlockType) {
  return `bembi-${type}-${crypto.randomUUID()}`;
}

export default function PremiumTemplateEditor({ businessId, businessSlug, businessName, locale, draft, disabled, saving, hasUnsavedChanges, device, canUndo, canRedo, onChange, onDeviceChange, onUndo, onRedo, onSave, onPublish }: {
  businessId: string; businessSlug: string; businessName: string; locale: string; draft: PublicSiteContent; disabled: boolean; saving: boolean; hasUnsavedChanges: boolean; device: TemplateEditorDevice; canUndo: boolean; canRedo: boolean;
  onChange: (draft: PublicSiteContent, historyGroup?: string) => void; onDeviceChange: (device: TemplateEditorDevice) => void; onUndo: () => void; onRedo: () => void; onSave: () => void; onPublish: () => void;
}) {
  const { t } = useAdminI18n();
  const premium = resolvePremiumKidsContent(draft);
  const [selected, setSelected] = useState(premium.blocks.find(block => block.type === "hero")?.id ?? premium.blocks[0].id);
  const [editingEnabled, setEditingEnabled] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [mediaTarget, setMediaTarget] = useState<{ cardIndex?: number; label: string } | null>(null);
  const viewportRef = useRef<TemplatePreviewViewportHandle>(null);
  const selectedBlock = premium.blocks.find(block => block.id === selected) ?? premium.blocks[0];
  const definition = getPremiumKidsBlockDefinition(selectedBlock.type);
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
  function selectBlock(id: string) {
    setSelected(id);
    requestAnimationFrame(() => requestAnimationFrame(() => viewportRef.current?.scrollTo(`[data-premium-block-id="${id}"]`)));
  }
  function move(sourceId: string, targetId: string) { const next = movePremiumKidsBlock(premium, sourceId, targetId); if (next !== premium) commit(next); }
  function moveBy(blockId: string, direction: -1 | 1) { const index = premium.blocks.findIndex(block => block.id === blockId); const target = premium.blocks[index + direction]; if (target) move(blockId, target.id); }
  function duplicate(block: PremiumKidsBlock) { const id = newBlockId(block.type); const next = duplicatePremiumKidsBlock(premium, block.id, id); if (next !== premium) { commit(next); selectBlock(id); } }
  function add(type: PremiumKidsBlockType, mediaPosition?: PublicSiteMediaPosition) { const id = newBlockId(type); const next = addPremiumKidsBlock(premium, type, id, mediaPosition, selectedBlock.id); if (next !== premium) { commit(next); setShowLibrary(false); selectBlock(id); } }
  function updateUniversal(nextBlock: PublicSiteCustomBlock, historyField = "content") { const blocks = premium.blocks.map(block => block.id === selected ? { ...block, props: { ...block.props, universal_block: nextBlock } } : block); commit(replacePremiumKidsBlocks(premium, blocks), `premium-universal:${selected}:${historyField}`); }
  function selectMedia(url: string) { const universal = selectedBlock.props.universal_block; if (!universal || !mediaTarget) return; if (mediaTarget.cardIndex === undefined) updateUniversal({ ...universal, media_url: url }, "media-url"); else { const cards = [...(universal.cards ?? [])]; const card = cards[mediaTarget.cardIndex]; if (card) cards[mediaTarget.cardIndex] = { ...card, media_type: "image", media_url: url }; updateUniversal({ ...universal, cards }, `card-${mediaTarget.cardIndex}-media-url`); } setMediaTarget(null); }
  function remove(block: PremiumKidsBlock) { if (!window.confirm(t("Delete block confirmation", { name: t(getPremiumKidsBlockDefinition(block.type).label as AdminMessage) }))) return; const next = deletePremiumKidsBlock(premium, block.id); if (next !== premium) { const index = premium.blocks.findIndex(item => item.id === block.id); commit(next); if (selected === block.id) setSelected(next.blocks[Math.min(index, next.blocks.length - 1)].id); } }
  function reset(block: PremiumKidsBlock) { if (window.confirm(t("Reset BEMBI block confirmation"))) commit(resetPremiumKidsBlock(premium, block.id)); }
  function restoreOriginal() { if (window.confirm(t("Restore BEMBI draft confirmation"))) { const next = restoreOriginalPremiumKidsContent(); commit(next); setSelected(next.blocks.find(block => block.type === "hero")!.id); } }
  function setVisible(block: PremiumKidsBlock, visible: boolean) { commit(setPremiumKidsBlockVisibility(premium, block.id, visible)); }

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

  return <><TemplateEditorShell templateName="BEMBI Premium" draftLabel={`Черновик${hasUnsavedChanges ? " · не сохранён" : " · сохранён"}`} previewHref={`/site-preview/premium-kids-center/${businessSlug}`} sections={sections} selectedSection={selected} device={device} editingEnabled={editingEnabled} saving={saving || disabled} canUndo={canUndo} canRedo={canRedo} onSelectSection={selectBlock} onDeviceChange={onDeviceChange} onEditingChange={setEditingEnabled} onUndo={onUndo} onRedo={onRedo} onSave={onSave} onPublish={onPublish}
    toolbarActions={<button type="button" disabled={controlsDisabled} onClick={restoreOriginal} className="rounded-xl border border-[#9a742e]/30 bg-[#fffaf0] px-3 py-2 text-xs font-semibold text-[#76551d] disabled:opacity-40">{t("Restore original BEMBI")}</button>}
    renderSection={(section, index) => { const block = premium.blocks[index]; const capabilities = getPremiumKidsBlockDefinition(block.type).capabilities; const active = selected === block.id; return <EditorBlockRow key={block.id} index={index} label={section.label} selected={active} visible={block.visible} locked={!capabilities.reorder} draggable={capabilities.reorder} disabled={controlsDisabled} onSelect={() => selectBlock(block.id)} onDragStart={() => setDraggedId(block.id)} onDragEnd={() => setDraggedId(null)} onDragOver={event => { if (capabilities.reorder) event.preventDefault(); }} onDrop={() => { if (draggedId) move(draggedId, block.id); setDraggedId(null); }} actions={<>
      {capabilities.visibility ? <button type="button" disabled={controlsDisabled} onClick={() => setVisible(block, !block.visible)} aria-label={block.visible ? t("Hide block") : t("Reveal block")} title={block.visible ? t("Hide block") : t("Reveal block")} className="px-1 text-xs disabled:opacity-35">{block.visible ? "◉" : "○"}</button> : null}
      {capabilities.duplicate ? <button type="button" disabled={controlsDisabled} onClick={() => duplicate(block)} aria-label={t("Duplicate block")} title={t("Duplicate block")} className="px-1 text-[11px] disabled:opacity-35">⧉</button> : null}
      {capabilities.delete ? <button type="button" disabled={controlsDisabled} onClick={() => remove(block)} aria-label={t("Delete block")} title={t("Delete block")} className="px-1 text-xs text-red-500 disabled:opacity-35">×</button> : null}
      {capabilities.reorder ? <span className="flex flex-col"><button type="button" disabled={controlsDisabled || index <= 2} onClick={() => moveBy(block.id, -1)} aria-label={t("Move block up")} className="h-3 text-[9px] disabled:opacity-20">▲</button><button type="button" disabled={controlsDisabled || index >= premium.blocks.length - 2} onClick={() => moveBy(block.id, 1)} aria-label={t("Move block down")} className="h-3 text-[9px] disabled:opacity-20">▼</button></span> : null}
    </>} />; }}
    navigator={<div className="mt-4"><button type="button" disabled={controlsDisabled} onClick={() => setShowLibrary(value => !value)} className="w-full rounded-xl border border-dashed border-[#9a742e]/50 bg-[#fffaf0] px-3 py-2.5 text-xs font-semibold text-[#76551d] disabled:opacity-40">{t("+ Add block")}</button>{showLibrary ? <div className="mt-2 grid gap-3 rounded-xl border border-black/8 bg-white p-2"><div><p className="px-2 py-1 text-[9px] font-bold uppercase tracking-[.14em] text-[#9a742e]">{t("Template sections")}</p>{PREMIUM_KIDS_BLOCK_REGISTRY.filter(item => item.capabilities.add && !isPremiumKidsUniversalBlockType(item.type)).map(item => <button type="button" key={item.type} onClick={() => add(item.type)} className="block w-full rounded-lg px-2 py-2 text-left text-xs hover:bg-black/5"><b className="block">{t(item.label as AdminMessage)}</b><span className="text-[10px] text-[#716d65]">{t(item.description as AdminMessage)}</span></button>)}</div><div className="border-t border-black/8 pt-2"><p className="px-2 py-1 text-[9px] font-bold uppercase tracking-[.14em] text-[#1746d1]">{t("Universal blocks")}</p>{PREMIUM_UNIVERSAL_BLOCK_LIBRARY.map(item => <button type="button" key={item.id} onClick={() => add(item.kind as PremiumKidsBlockType, item.mediaPosition)} className="block w-full rounded-lg px-2 py-2 text-left text-xs hover:bg-[#eef2ff]"><b className="block">{t(item.label as AdminMessage)}</b><span className="text-[10px] text-[#716d65]">{t(item.description as AdminMessage)}</span></button>)}</div></div> : null}<p className="mt-3 text-[10px] leading-5 text-[#716d65]">◆ {t("Required block")} · ⠿ {t("Reorderable block")}<br />{t("Hidden blocks remain available for editing.")}</p></div>}
    canvas={<TemplatePreviewViewport ref={viewportRef} title={`BEMBI Premium · ${device}`} width={width} scale={zoom}><HomeExperience basePath={`/site-preview/premium-kids-center/${businessSlug}`} site={site} /></TemplatePreviewViewport>}
    inspector={<><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{t("Block settings")}</p><h3 className="mt-2 text-xl font-semibold">{selectedSection.label}</h3><p className="mt-1 text-xs leading-5 text-[#716d65]">{t(definition.description as AdminMessage)}</p><div className="mt-5 grid gap-4">
      {definition.capabilities.visibility ? <EditorToggle label={t("Show this block")} checked={selectedBlock.visible} disabled={controlsDisabled} onChange={visible => setVisible(selectedBlock, visible)} /> : <p className="rounded-xl border border-black/8 bg-[#faf9f6] p-3 text-[11px] leading-5 text-[#716d65]">{t("Required BEMBI block notice")}</p>}
      {selectedBlock.props.universal_block ? <PremiumUniversalBlockSettings block={selectedBlock.props.universal_block} disabled={controlsDisabled} onChange={updateUniversal} onChooseImage={setMediaTarget} /> : <>{fields[selectedBlock.type].filter(([key]) => !["faq", "reviews", "teachers"].includes(key)).map(([key, label, kind]) => { const raw = selectedBlock.props[key]; const value = Array.isArray(raw) ? raw.join("\n") : raw ?? ""; return <label key={key} className="text-xs font-semibold text-[#4f4b45]">{t(label)}{kind === "input" ? <input className={inputClass} value={value} disabled={controlsDisabled} onChange={event => update(key, event.target.value)} /> : kind === "text" && ["hero_description", "intro_description", "programs_description", "schedule_description", "footer_description"].includes(key) ? <RichTextEditor value={value} disabled={controlsDisabled} onChange={next => update(key, next)} /> : <textarea className={inputClass} rows={kind === "lines" ? 6 : 3} value={value} disabled={controlsDisabled} onChange={event => update(key, event.target.value)} />}</label>; })}{selectedBlock.type === "faq" ? <PremiumDelimitedListEditor values={(selectedBlock.props.faq as string[]) ?? []} primaryLabel="Question" secondaryLabel="Answer" disabled={controlsDisabled} onChange={values => updateList("faq", values)} /> : selectedBlock.type === "reviews" ? <PremiumDelimitedListEditor values={(selectedBlock.props.reviews as string[]) ?? []} primaryLabel="Review text" secondaryLabel="Author" splitFromEnd disabled={controlsDisabled} onChange={values => updateList("reviews", values)} /> : selectedBlock.type === "teachers" ? <PremiumDelimitedListEditor values={(selectedBlock.props.teachers as string[]) ?? []} primaryLabel="Person name" secondaryLabel="Role" disabled={controlsDisabled} onChange={values => updateList("teachers", values)} /> : null}{definition.capabilities.typography ? <TypographyControls title={t("Section title")} description={t("Limited Site Editor 2.6 settings")} value={selectedBlock.props.heading_typography} disabled={controlsDisabled} onChange={updateTypography} /> : null}</>}
      <EditorInspectorActions>{definition.capabilities.duplicate ? <button type="button" disabled={controlsDisabled} onClick={() => duplicate(selectedBlock)} className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold disabled:opacity-40">{t("Duplicate block")}</button> : null}{definition.capabilities.reset ? <button type="button" disabled={controlsDisabled} onClick={() => reset(selectedBlock)} className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold disabled:opacity-40">{t("Reset block")}</button> : null}{definition.capabilities.delete ? <button type="button" disabled={controlsDisabled} onClick={() => remove(selectedBlock)} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-40">{t("Delete block")}</button> : null}</EditorInspectorActions>
    </div></>}
  /><MediaLibraryPicker open={Boolean(mediaTarget)} businessId={businessId} title={mediaTarget?.label ?? "Выбрать изображение"} onSelect={selectMedia} onClose={() => setMediaTarget(null)} /></>;
}
