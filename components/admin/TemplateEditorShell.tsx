"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export type TemplateEditorDevice = "desktop" | "tablet" | "mobile";
export type TemplateEditorSection = {
  id: string;
  label: string;
  description: string;
  capabilities: { visibility: boolean; reorder: boolean; duplicate: boolean; typography: boolean; delete?: boolean; reset?: boolean };
};

export default function TemplateEditorShell({ templateName, draftLabel, previewHref, sections, selectedSection, device, editingEnabled, saving, canUndo, canRedo, onSelectSection, onDeviceChange, onEditingChange, onUndo, onRedo, onSave, onPublish, navigator, renderSection, toolbarActions, canvas, inspector }: {
  templateName: string; draftLabel: string; previewHref: string;
  sections: readonly TemplateEditorSection[]; selectedSection: string; device: TemplateEditorDevice;
  editingEnabled: boolean; saving: boolean; canUndo: boolean; canRedo: boolean;
  onSelectSection: (id: string) => void; onDeviceChange: (device: TemplateEditorDevice) => void;
  onEditingChange: (enabled: boolean) => void; onUndo: () => void; onRedo: () => void;
  onSave: () => void; onPublish: () => void;
  navigator?: ReactNode; renderSection?: (section: TemplateEditorSection, index: number) => ReactNode; toolbarActions?: ReactNode; canvas: ReactNode; inspector: ReactNode;
}) {
  return <section id="site-builder-canvas" className="relative mt-8 scroll-mt-24 overflow-hidden rounded-[28px] border border-black/10 bg-[#e9e8e4] text-[#17191f] shadow-[0_26px_90px_rgba(25,27,32,0.12)]">
    <div className="sticky top-0 z-40 flex flex-col gap-3 border-b border-black/10 bg-white/95 px-4 py-3 shadow-sm backdrop-blur xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#3e263e] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#fef9ef]">Premium</span><strong className="text-sm">{templateName}</strong><button type="button" aria-pressed={editingEnabled} onClick={() => onEditingChange(!editingEnabled)} className={`rounded-xl px-4 py-2 text-xs font-semibold ${editingEnabled ? "bg-emerald-100 text-emerald-800" : "border border-black/10 bg-white"}`}>{editingEnabled ? "Редактирование включено" : "Редактировать"}</button><span className="text-xs text-[#716d65]">{draftLabel}</span></div>
      <div className="flex flex-wrap items-center gap-2">
        <Link href={previewHref} target="_blank" rel="noreferrer" className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold">Предпросмотр ↗</Link>
        <div className="flex rounded-xl bg-[#efeee9] p-1" aria-label="Устройство предпросмотра">{([['desktop','Desktop'],['tablet','Tablet'],['mobile','Phone']] as const).map(([value,label]) => <button type="button" key={value} aria-pressed={device === value} onClick={() => onDeviceChange(value)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${device === value ? "bg-white shadow-sm" : "text-[#4f4b45]"}`}>{label}</button>)}</div>
        <button type="button" aria-label="Отменить" title="Отменить" onClick={onUndo} disabled={!canUndo || saving} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm disabled:opacity-35">↶</button><button type="button" aria-label="Повторить" title="Повторить" onClick={onRedo} disabled={!canRedo || saving} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm disabled:opacity-35">↷</button>
        {toolbarActions}
        <button type="button" onClick={onSave} disabled={saving} className="rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold disabled:opacity-50">Сохранить</button><button type="button" onClick={onPublish} disabled={saving} className="rounded-xl bg-[#17191f] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Опубликовать</button>
      </div>
    </div>
    <div data-template-editor-columns className="grid min-h-[760px] min-w-0 grid-cols-1 xl:grid-cols-[minmax(190px,230px)_minmax(0,1fr)_minmax(290px,330px)]">
      <aside data-template-editor-navigator className="min-w-0 border-b border-black/10 bg-white/80 p-4 xl:max-h-[calc(100vh-110px)] xl:overflow-y-auto xl:border-r xl:border-b-0"><p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b877e]">Секции страницы</p><nav className="space-y-1">{sections.map((section,index) => renderSection ? renderSection(section, index) : <button type="button" key={section.id} aria-current={selectedSection === section.id ? "true" : undefined} onClick={() => onSelectSection(section.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold ${selectedSection === section.id ? "bg-[#17191f] text-white" : "hover:bg-black/5"}`}><span className="text-[10px] opacity-55">{String(index + 1).padStart(2,"0")}</span><span>{section.label}</span></button>)}</nav>{navigator}</aside>
      <div data-template-editor-canvas className="min-w-0 overflow-hidden bg-[#d8d7d3] p-4">{canvas}</div>
      <aside data-template-editor-settings className="min-w-0 border-t border-black/10 bg-white p-4 xl:max-h-[calc(100vh-110px)] xl:overflow-y-auto xl:border-t-0 xl:border-l"><div>{inspector}</div></aside>
    </div>
  </section>;
}
