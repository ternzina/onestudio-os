"use client";

import { useEffect, useRef } from "react";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import { translateAdminText, type AdminMessage } from "@/lib/i18n/admin";

export type EditorBlockLibraryItem = {
  id: string;
  label: string;
  description: string;
  stateLabel?: string;
  onAdd: () => void;
};

function LibrarySection({ heading, items, universal = false }: { heading: string; items: readonly EditorBlockLibraryItem[]; universal?: boolean }) {
  const { locale, t } = useAdminI18n();
  if (!items.length) return null;
  return <section className="mt-6"><h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8b877e]">{t(heading as AdminMessage)}</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{items.map(item => <button key={item.id} type="button" onClick={item.onAdd} className={`group rounded-2xl border p-5 text-left text-[#17191f] transition hover:-translate-y-0.5 hover:shadow-lg ${universal ? "border-[#9d3151]/15 bg-[#fff8fa] hover:border-[#9d3151]/40" : "border-black/8 bg-white hover:border-[#9a742e]/40"}`}><div className="flex items-center justify-between gap-3"><span className="text-lg font-semibold">{translateAdminText(locale, item.label)}</span><span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${universal ? "bg-[#f5e5ea] text-[#8d2d4a]" : "bg-[#f4ead6] text-[#4f3a12]"}`}>{item.stateLabel ? translateAdminText(locale, item.stateLabel) : t("Add")}</span></div><p className="mt-3 text-xs leading-5 text-[#716d65]">{translateAdminText(locale, item.description)}</p></button>)}</div></section>;
}

export default function EditorBlockLibrary({ open, templateItems, universalItems, onClose }: { open: boolean; templateItems: readonly EditorBlockLibraryItem[]; universalItems: readonly EditorBlockLibraryItem[]; onClose: () => void }) {
  const { t } = useAdminI18n();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!open) return;
    previousActiveRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = requestAnimationFrame(() => closeButtonRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveRef.current?.focus();
    };
  }, [open]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#17191f]/45 p-4 backdrop-blur-[2px]" onMouseDown={event => { if (event.currentTarget === event.target) onClose(); }}><div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="editor-block-library-title" className="max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-auto rounded-[28px] bg-[#f8f7f3] p-5 shadow-[0_35px_120px_rgba(0,0,0,0.35)] sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a742e]">{t("Ready-made blocks")}</p><h2 id="editor-block-library-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{t("Block library")}</h2><p className="mt-2 text-sm leading-6 text-[#716d65]">{t("Add a block and then edit its content in the settings panel.")}</p></div><button ref={closeButtonRef} type="button" onClick={onClose} className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold" aria-label={t("Close")}>×</button></div><LibrarySection heading="Template sections" items={templateItems} /><LibrarySection heading="Universal blocks" items={universalItems} universal /></div></div>;
}
