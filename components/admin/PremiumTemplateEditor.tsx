"use client";

import { useRef, useState } from "react";
import HomeExperience from "@/app/demos/premium-kids-center/HomeExperience";
import RichTextEditor from "@/components/admin/RichTextEditor";
import TemplateEditorShell, { type TemplateEditorDevice, type TemplateEditorSection } from "@/components/admin/TemplateEditorShell";
import TemplatePreviewViewport, { type TemplatePreviewViewportHandle } from "@/components/admin/TemplatePreviewViewport";
import TypographyControls from "@/components/admin/TypographyControls";
import MediaLibraryPicker from "@/components/admin/MediaLibraryPicker";
import PremiumUniversalBlockSettings from "@/components/admin/PremiumUniversalBlockSettings";
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

const inputClass = "mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#9a742e] disabled:opacity-50";
type Field = [PremiumKidsEditableKey, string, "input" | "text" | "lines"];

const fields: Record<PremiumKidsBlockType, Field[]> = {
  header: [["brand_name", "Название сайта", "input"], ["brand_tagline", "Подпись бренда", "input"]],
  hero: [["hero_eyebrow", "Eyebrow", "input"], ["hero_title", "Заголовок", "text"], ["hero_description", "Описание", "text"], ["primary_cta_label", "Основная кнопка", "input"], ["secondary_cta_label", "Вторая кнопка", "input"]],
  intro: [["intro_eyebrow", "Eyebrow", "input"], ["intro_title", "Заголовок", "text"], ["intro_description", "Описание", "text"], ["age_groups", "Возрастные группы — одна на строку", "lines"]],
  programs: [["programs_title", "Заголовок", "text"], ["programs_description", "Описание", "text"]],
  approach: [["approach_title", "Заголовок", "text"], ["approach_items", "Принципы — один на строку", "lines"]],
  schedule: [["schedule_title", "Заголовок", "text"], ["schedule_description", "Описание", "text"]],
  teachers: [["teachers_title", "Заголовок", "text"], ["teachers", "Преподаватели — один на строку", "lines"]],
  gallery: [["gallery_title", "Заголовок", "text"], ["gallery_captions", "Подписи — одна на строку", "lines"]],
  reviews: [["reviews_title", "Заголовок", "text"], ["reviews", "Отзывы — один на строку, автор после ·", "lines"]],
  faq: [["faq_title", "Заголовок", "text"], ["faq", "Вопрос и ответ через ·", "lines"]],
  final: [["final_cta_eyebrow", "Eyebrow", "input"], ["final_cta_title", "Заголовок", "text"], ["final_cta_label", "Кнопка", "input"]],
  footer: [["footer_description", "Описание", "text"], ["contact_email", "Email", "input"], ["contact_phone", "Телефон", "input"], ["contact_address", "Адрес", "text"]],
  text: [], media_text: [], columns: [],
};

function newBlockId(type: PremiumKidsBlockType) {
  return `bembi-${type}-${crypto.randomUUID()}`;
}

export default function PremiumTemplateEditor({ businessId, businessSlug, businessName, locale, draft, disabled, saving, hasUnsavedChanges, device, canUndo, canRedo, onChange, onDeviceChange, onUndo, onRedo, onSave, onPublish }: {
  businessId: string; businessSlug: string; businessName: string; locale: string; draft: PublicSiteContent; disabled: boolean; saving: boolean; hasUnsavedChanges: boolean; device: TemplateEditorDevice; canUndo: boolean; canRedo: boolean;
  onChange: (draft: PublicSiteContent, historyGroup?: string) => void; onDeviceChange: (device: TemplateEditorDevice) => void; onUndo: () => void; onRedo: () => void; onSave: () => void; onPublish: () => void;
}) {
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
  function updateTypography(value: PublicSiteTypography | undefined) {
    const blocks = premium.blocks.map(block => block.id === selected ? { ...block, props: { ...block.props, heading_typography: value } } : block);
    commit(replacePremiumKidsBlocks(premium, blocks), `premium-typography:${selected}`);
  }
  function selectBlock(id: string) {
    setSelected(id);
    requestAnimationFrame(() => viewportRef.current?.scrollTo(`[data-premium-block-id="${id}"]`));
  }
  function move(sourceId: string, targetId: string) { const next = movePremiumKidsBlock(premium, sourceId, targetId); if (next !== premium) commit(next); }
  function moveBy(blockId: string, direction: -1 | 1) { const index = premium.blocks.findIndex(block => block.id === blockId); const target = premium.blocks[index + direction]; if (target) move(blockId, target.id); }
  function duplicate(block: PremiumKidsBlock) { const id = newBlockId(block.type); const next = duplicatePremiumKidsBlock(premium, block.id, id); if (next !== premium) { commit(next); selectBlock(id); } }
  function add(type: PremiumKidsBlockType, mediaPosition?: PublicSiteMediaPosition) { const id = newBlockId(type); const next = addPremiumKidsBlock(premium, type, id, mediaPosition); if (next !== premium) { commit(next); setShowLibrary(false); selectBlock(id); } }
  function updateUniversal(nextBlock: PublicSiteCustomBlock, historyField = "content") { const blocks = premium.blocks.map(block => block.id === selected ? { ...block, props: { ...block.props, universal_block: nextBlock } } : block); commit(replacePremiumKidsBlocks(premium, blocks), `premium-universal:${selected}:${historyField}`); }
  function selectMedia(url: string) { const universal = selectedBlock.props.universal_block; if (!universal || !mediaTarget) return; if (mediaTarget.cardIndex === undefined) updateUniversal({ ...universal, media_url: url }, "media-url"); else { const cards = [...(universal.cards ?? [])]; const card = cards[mediaTarget.cardIndex]; if (card) cards[mediaTarget.cardIndex] = { ...card, media_type: "image", media_url: url }; updateUniversal({ ...universal, cards }, `card-${mediaTarget.cardIndex}-media-url`); } setMediaTarget(null); }
  function remove(block: PremiumKidsBlock) { if (!window.confirm(`Удалить блок «${getPremiumKidsBlockDefinition(block.type).label}» из черновика? Действие можно отменить.`)) return; const next = deletePremiumKidsBlock(premium, block.id); if (next !== premium) { const index = premium.blocks.findIndex(item => item.id === block.id); commit(next); setSelected(next.blocks[Math.min(index, next.blocks.length - 1)].id); } }
  function reset(block: PremiumKidsBlock) { if (window.confirm("Вернуть содержимое этого блока к исходному BEMBI? Изменится только черновик.")) commit(resetPremiumKidsBlock(premium, block.id)); }
  function restoreOriginal() { if (window.confirm("Вернуть весь черновик к исходному шаблону BEMBI? Опубликованный сайт не изменится.")) { const next = restoreOriginalPremiumKidsContent(); commit(next); setSelected(next.blocks.find(block => block.type === "hero")!.id); } }
  function setVisible(block: PremiumKidsBlock, visible: boolean) { commit(setPremiumKidsBlockVisibility(premium, block.id, visible)); }

  const typeCounts = new Map<PremiumKidsBlockType, number>();
  const typeTotals = new Map<PremiumKidsBlockType, number>();
  for (const block of premium.blocks) typeTotals.set(block.type, (typeTotals.get(block.type) ?? 0) + 1);
  const sections: TemplateEditorSection[] = premium.blocks.map(block => {
    const itemDefinition = getPremiumKidsBlockDefinition(block.type);
    const count = (typeCounts.get(block.type) ?? 0) + 1;
    typeCounts.set(block.type, count);
    const total = typeTotals.get(block.type) ?? 1;
    return { id: block.id, label: `${itemDefinition.label}${total > 1 ? ` · ${count}` : ""}${block.visible ? "" : " · скрыт"}`, description: itemDefinition.description, capabilities: itemDefinition.capabilities };
  });
  const selectedSection = sections.find(section => section.id === selected) ?? sections[0];
  const width = device === "mobile" ? 390 : device === "tablet" ? 768 : 1280;
  const zoom = device === "mobile" ? 0.82 : device === "tablet" ? 0.68 : 0.56;
  const controlsDisabled = disabled || !editingEnabled;

  return <><TemplateEditorShell templateName="BEMBI Premium" draftLabel={`Черновик${hasUnsavedChanges ? " · не сохранён" : " · сохранён"}`} previewHref={`/site-preview/premium-kids-center/${businessSlug}`} sections={sections} selectedSection={selected} device={device} editingEnabled={editingEnabled} saving={saving || disabled} canUndo={canUndo} canRedo={canRedo} onSelectSection={selectBlock} onDeviceChange={onDeviceChange} onEditingChange={setEditingEnabled} onUndo={onUndo} onRedo={onRedo} onSave={onSave} onPublish={onPublish}
    toolbarActions={<button type="button" disabled={controlsDisabled} onClick={restoreOriginal} className="rounded-xl border border-[#9a742e]/30 bg-[#fffaf0] px-3 py-2 text-xs font-semibold text-[#76551d] disabled:opacity-40">Вернуть исходный BEMBI</button>}
    renderSection={(section, index) => { const block = premium.blocks[index]; const capabilities = getPremiumKidsBlockDefinition(block.type).capabilities; const active = selected === block.id; return <div key={block.id} draggable={capabilities.reorder && !controlsDisabled} onDragStart={() => setDraggedId(block.id)} onDragEnd={() => setDraggedId(null)} onDragOver={event => { if (capabilities.reorder) event.preventDefault(); }} onDrop={() => { if (draggedId) move(draggedId, block.id); setDraggedId(null); }} className={`group flex items-center gap-1 rounded-xl p-1 ${active ? "bg-[#17191f] text-white" : "hover:bg-black/5"} ${block.visible ? "" : "opacity-55"}`}>
      <span className="cursor-grab px-1 text-[11px] opacity-45" title={capabilities.reorder ? "Перетащить" : "Позиция закреплена"}>{capabilities.reorder ? "⠿" : "◆"}</span>
      <button type="button" aria-current={active ? "true" : undefined} onClick={() => selectBlock(block.id)} className="min-w-0 flex-1 px-1 py-2 text-left text-xs font-semibold"><span className="mr-2 text-[9px] opacity-50">{String(index + 1).padStart(2, "0")}</span><span className="break-words">{section.label}</span></button>
      {capabilities.visibility ? <button type="button" disabled={controlsDisabled} onClick={() => setVisible(block, !block.visible)} aria-label={block.visible ? "Скрыть блок" : "Показать блок"} title={block.visible ? "Скрыть" : "Показать"} className="px-1 text-xs disabled:opacity-35">{block.visible ? "◉" : "○"}</button> : null}
      {capabilities.reorder ? <span className="flex flex-col"><button type="button" disabled={controlsDisabled || index <= 2} onClick={() => moveBy(block.id, -1)} aria-label="Переместить выше" className="h-3 text-[9px] disabled:opacity-20">▲</button><button type="button" disabled={controlsDisabled || index >= premium.blocks.length - 2} onClick={() => moveBy(block.id, 1)} aria-label="Переместить ниже" className="h-3 text-[9px] disabled:opacity-20">▼</button></span> : null}
    </div>; }}
    navigator={<div className="mt-4"><button type="button" disabled={controlsDisabled} onClick={() => setShowLibrary(value => !value)} className="w-full rounded-xl border border-dashed border-[#9a742e]/50 bg-[#fffaf0] px-3 py-2.5 text-xs font-semibold text-[#76551d] disabled:opacity-40">+ Добавить блок</button>{showLibrary ? <div className="mt-2 grid gap-3 rounded-xl border border-black/8 bg-white p-2"><div><p className="px-2 py-1 text-[9px] font-bold uppercase tracking-[.14em] text-[#9a742e]">Секции BEMBI</p>{PREMIUM_KIDS_BLOCK_REGISTRY.filter(item => item.capabilities.add && !isPremiumKidsUniversalBlockType(item.type)).map(item => <button type="button" key={item.type} onClick={() => add(item.type)} className="block w-full rounded-lg px-2 py-2 text-left text-xs hover:bg-black/5"><b className="block">{item.label}</b><span className="text-[10px] text-[#716d65]">{item.description}</span></button>)}</div><div className="border-t border-black/8 pt-2"><p className="px-2 py-1 text-[9px] font-bold uppercase tracking-[.14em] text-[#1746d1]">Универсальные блоки</p>{PREMIUM_UNIVERSAL_BLOCK_LIBRARY.map(item => <button type="button" key={item.id} onClick={() => add(item.kind as PremiumKidsBlockType, item.mediaPosition)} className="block w-full rounded-lg px-2 py-2 text-left text-xs hover:bg-[#eef2ff]"><b className="block">{item.label}</b><span className="text-[10px] text-[#716d65]">{item.description}</span></button>)}</div></div> : null}<p className="mt-3 text-[10px] leading-5 text-[#716d65]">◆ обязательный блок · ⠿ можно перемещать<br />Скрытые блоки остаются доступны для редактирования.</p></div>}
    canvas={<TemplatePreviewViewport ref={viewportRef} title={`BEMBI Premium · ${device}`} width={width} scale={zoom}><HomeExperience basePath={`/site-preview/premium-kids-center/${businessSlug}`} site={site} /></TemplatePreviewViewport>}
    inspector={<><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a742e]">Настройки блока</p><h3 className="mt-2 text-xl font-semibold">{selectedSection.label}</h3><p className="mt-1 text-xs leading-5 text-[#716d65]">{definition.description}</p><div className="mt-5 grid gap-4">
      {definition.capabilities.visibility ? <label className="flex items-center justify-between rounded-xl border border-black/8 bg-[#faf9f6] p-3 text-xs font-semibold">Показывать блок<input type="checkbox" checked={selectedBlock.visible} disabled={controlsDisabled} onChange={event => setVisible(selectedBlock, event.target.checked)} /></label> : <p className="rounded-xl border border-black/8 bg-[#faf9f6] p-3 text-[11px] leading-5 text-[#716d65]">Обязательный структурный блок BEMBI: его нельзя удалить, скрыть, дублировать или переместить.</p>}
      {selectedBlock.props.universal_block ? <PremiumUniversalBlockSettings block={selectedBlock.props.universal_block} disabled={controlsDisabled} onChange={updateUniversal} onChooseImage={setMediaTarget} /> : <>{fields[selectedBlock.type].map(([key, label, kind]) => { const raw = selectedBlock.props[key]; const value = Array.isArray(raw) ? raw.join("\n") : raw ?? ""; return <label key={key} className="text-xs font-semibold text-[#4f4b45]">{label}{kind === "input" ? <input className={inputClass} value={value} disabled={controlsDisabled} onChange={event => update(key, event.target.value)} /> : kind === "text" && ["hero_description", "intro_description", "programs_description", "schedule_description", "footer_description"].includes(key) ? <RichTextEditor value={value} disabled={controlsDisabled} onChange={next => update(key, next)} /> : <textarea className={inputClass} rows={kind === "lines" ? 6 : 3} value={value} disabled={controlsDisabled} onChange={event => update(key, event.target.value)} />}</label>; })}{definition.capabilities.typography ? <TypographyControls title="Заголовок секции" description="Ограниченные настройки Site Editor 2.6" value={selectedBlock.props.heading_typography} disabled={controlsDisabled} onChange={updateTypography} /> : null}</>}
      <div className="grid gap-2 border-t border-black/8 pt-4">{definition.capabilities.duplicate ? <button type="button" disabled={controlsDisabled} onClick={() => duplicate(selectedBlock)} className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold disabled:opacity-40">Дублировать блок</button> : null}{definition.capabilities.reset ? <button type="button" disabled={controlsDisabled} onClick={() => reset(selectedBlock)} className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold disabled:opacity-40">Вернуть блок к исходному</button> : null}{definition.capabilities.delete ? <button type="button" disabled={controlsDisabled} onClick={() => remove(selectedBlock)} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-40">Удалить блок</button> : null}</div>
    </div></>}
  /><MediaLibraryPicker open={Boolean(mediaTarget)} businessId={businessId} title={mediaTarget?.label ?? "Выбрать изображение"} onSelect={selectMedia} onClose={() => setMediaTarget(null)} /></>;
}
