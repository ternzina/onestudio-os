"use client";

import type { DragEvent, ReactNode } from "react";

export const editorCompactFieldClass = "mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#9a742e] disabled:opacity-50";

export function EditorToggle({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-center justify-between rounded-xl border border-black/8 bg-[#faf9f6] p-3 text-xs font-semibold">{label}<input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} /></label>;
}

export function EditorInspectorActions({ children }: { children: ReactNode }) {
  return <div data-editor-inspector-actions className="grid gap-2 border-t border-black/8 pt-4">{children}</div>;
}

export function EditorBlockRow({ index, label, selected, visible, locked, draggable, disabled, onSelect, onDragStart, onDragEnd, onDragOver, onDrop, actions }: {
  index: number; label: string; selected: boolean; visible: boolean; locked: boolean; draggable: boolean; disabled: boolean;
  onSelect: () => void; onDragStart?: () => void; onDragEnd?: () => void; onDragOver?: (event: DragEvent) => void; onDrop?: () => void; actions?: ReactNode;
}) {
  return <div data-editor-block-row data-selected={String(selected)} data-visible={String(visible)} data-locked={String(locked)} draggable={draggable && !disabled} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver} onDrop={onDrop} className={`group flex items-center gap-1 rounded-xl p-1 ${selected ? "bg-[#17191f] text-white" : "hover:bg-black/5"} ${visible ? "" : "opacity-55"}`}>
    <span className={draggable ? "cursor-grab px-1 text-[11px] opacity-45" : "px-1 text-[11px] opacity-45"} aria-hidden="true">{draggable ? "⠿" : "◆"}</span>
    <button type="button" aria-current={selected ? "true" : undefined} onClick={onSelect} className="min-w-0 flex-1 px-1 py-2 text-left text-xs font-semibold"><span className="mr-2 text-[9px] opacity-50">{String(index + 1).padStart(2, "0")}</span><span className="break-words">{label}</span></button>
    {actions}
  </div>;
}
