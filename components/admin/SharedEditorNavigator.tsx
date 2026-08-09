"use client";

import type { DragEvent } from "react";
import type { EditorNavigatorModel, EditorSectionRecord } from "@/lib/public-site/editor-spec";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";

export function SharedEditorNavigatorRow({ section }: { section: EditorSectionRecord }) {
  const { t } = useAdminI18n();
  const draggable = Boolean(section.capabilities.reorder && !section.locked && !section.disabled);
  const actionClass = "rounded-md px-1 text-[11px] transition hover:bg-white/15 disabled:opacity-25";
  const preventRowSelection = (event: React.MouseEvent) => event.stopPropagation();
  return <div data-shared-editor-navigator-row data-selected={String(section.selected)} data-visible={String(section.visible)} data-locked={String(Boolean(section.locked))} draggable={draggable} onDragStart={section.onDragStart} onDragEnd={section.onDragEnd} onDragOver={(event: DragEvent) => { if (!draggable) return; event.preventDefault(); section.onDragOver?.(); }} onDrop={() => section.onDrop?.()} className={`group flex min-h-11 items-center gap-1 rounded-xl p-1 ${section.selected ? "bg-[#17191f] text-white" : "text-[#292722] hover:bg-black/5"} ${section.visible ? "" : "opacity-55"}`}>
    <span className={`px-1 text-[11px] opacity-45 ${draggable ? "cursor-grab" : ""}`} aria-hidden="true">{draggable ? "⠿" : "◆"}</span>
    <button type="button" disabled={section.disabled || section.capabilities.select === false} aria-current={section.selected ? "true" : undefined} onClick={section.onSelect} className="min-w-0 flex-1 px-1 py-2 text-left text-xs font-semibold disabled:cursor-default"><span data-editor-row-index className="mr-2 text-[9px] opacity-50">{String(section.index + 1).padStart(2, "0")}</span><span className="break-words">{section.label}</span></button>
    <div data-editor-row-actions className={`shrink-0 items-center ${section.selected ? "flex" : "hidden group-hover:flex group-focus-within:flex"}`} onClick={preventRowSelection}>
      {section.capabilities.visibility && section.onVisibilityChange ? <button type="button" disabled={section.disabled} onClick={() => section.onVisibilityChange?.(!section.visible)} aria-label={section.visible ? t("Hide block") : t("Reveal block")} title={section.visible ? t("Hide block") : t("Reveal block")} className={actionClass}>{section.visible ? "◉" : "○"}</button> : null}
      {section.capabilities.duplicate && section.onDuplicate ? <button type="button" disabled={section.disabled} onClick={section.onDuplicate} aria-label={t("Duplicate block")} title={t("Duplicate block")} className={actionClass}>⧉</button> : null}
      {section.capabilities.delete && section.onDelete ? <button type="button" disabled={section.disabled} onClick={section.onDelete} aria-label={t("Delete block")} title={t("Delete block")} className={`${actionClass} text-red-500`}>×</button> : null}
      {section.capabilities.move && section.onMove ? <span className="flex flex-col"><button type="button" disabled={section.disabled || section.canMoveUp === false} onClick={() => section.onMove?.(-1)} aria-label={t("Move block up")} className="h-3 text-[9px] disabled:opacity-20">▲</button><button type="button" disabled={section.disabled || section.canMoveDown === false} onClick={() => section.onMove?.(1)} aria-label={t("Move block down")} className="h-3 text-[9px] disabled:opacity-20">▼</button></span> : null}
    </div>
  </div>;
}

export default function SharedEditorNavigator({ model }: { model: EditorNavigatorModel }) {
  const { t } = useAdminI18n();
  return <div data-shared-editor-navigator>
    <div className="flex items-center justify-between gap-2"><p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b877e]">{model.heading}</p>{model.onCollapse ? <button type="button" onClick={model.onCollapse} className="rounded-lg border border-black/15 bg-white px-2 py-1.5 text-[10px] font-bold text-[#17191f] shadow-sm transition hover:bg-[#eeece6]" aria-label={t("Collapse blocks")}>{t("Collapse")} ←</button> : null}</div>
    <nav className="mt-3 grid gap-1">{model.sections.length ? model.sections.map(section => <SharedEditorNavigatorRow key={section.key} section={section} />) : <p className="px-2 py-4 text-xs text-[#716d65]">{model.emptyState}</p>}</nav>
    {model.addBlock ? <button type="button" disabled={model.addBlock.disabled} onClick={model.addBlock.onClick} className="mt-4 w-full rounded-xl border border-dashed border-[#9a742e]/45 bg-[#fbf7ee] px-3 py-3 text-xs font-semibold text-[#4f3a12] transition hover:border-[#9a742e] disabled:opacity-40">{model.addBlock.label}</button> : null}
    {model.footerNotice ? <div className="mt-3 px-2 text-[11px] leading-5 text-[#8b877e]">{model.footerNotice}</div> : null}
  </div>;
}
