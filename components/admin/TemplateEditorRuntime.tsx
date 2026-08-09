"use client";

import Link from "next/link";
import { forwardRef, useState, type HTMLAttributes, type ReactNode } from "react";
import EditorBlockLibrary from "@/components/admin/EditorBlockLibrary";
import SharedEditorNavigator from "@/components/admin/SharedEditorNavigator";
import SharedEditorInspector from "@/components/admin/SharedEditorInspector";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import type { TemplateEditorSpec } from "@/lib/public-site/editor-spec";
import {
  TEMPLATE_EDITOR_CANVAS_CLASS,
  TEMPLATE_EDITOR_COLUMNS_CLASS,
  TEMPLATE_EDITOR_NAVIGATOR_CLASS,
  TEMPLATE_EDITOR_SETTINGS_CLASS,
} from "@/components/admin/template-editor-layout";

export function OneStudioEditorWorkspace({ children }: { children: ReactNode }) {
  return <div data-onestudio-editor-workspace className={`relative grid min-w-0 overflow-hidden ${TEMPLATE_EDITOR_COLUMNS_CLASS}`}>{children}</div>;
}
export function OneStudioEditorToolbar({ children }: { children: ReactNode }) {
  return <div data-onestudio-editor-toolbar className="sticky top-0 z-40 border-b border-black/10 bg-white/95 shadow-sm backdrop-blur">{children}</div>;
}
function EditorNavigatorFrame({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return <aside id={id} data-template-editor-navigator className={`min-w-0 overflow-y-auto overscroll-contain border-r border-black/10 bg-[#f7f6f3] p-4 [scrollbar-gutter:stable] ${className}`}>{children}</aside>;
}
const EditorCanvasFrame = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function EditorCanvasFrame({ children, className = "", ...props }, ref) {
  return <div ref={ref} data-template-editor-canvas className={`min-w-0 overflow-y-auto overflow-x-hidden overscroll-contain bg-[#dcdcd8] [scrollbar-gutter:stable] ${className}`} {...props}>{children}</div>;
});
function EditorSettingsFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <aside data-template-editor-settings className={`min-w-0 overflow-y-auto overscroll-contain border-l border-black/10 bg-white p-4 [scrollbar-gutter:stable] ${className}`}>{children}</aside>;
}

function CommandAction({ action }: { action: { label: string; disabled?: boolean; tone?: "default" | "accent" | "quiet"; onClick: () => void } }) {
  return <button type="button" disabled={action.disabled} onClick={action.onClick} className={action.tone === "accent" ? "rounded-xl bg-[#9d3151] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40" : "rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold disabled:opacity-40"}>{action.label}</button>;
}

export function OneStudioEditorCommandBar({ spec, onBlocks, onSettings }: { spec: TemplateEditorSpec; onBlocks: () => void; onSettings: () => void }) {
  const { t } = useAdminI18n();
  return <div data-onestudio-editor-command-bar className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
    <div className="flex min-w-0 flex-wrap items-center gap-2"><span className="text-xs text-[#716d65]">{spec.draftLabel}</span><span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b877e]">{spec.commandModel.pageLabel}</span>{spec.commandModel.pages.filter(page => !page.hidden).map(page => <button key={page.id} type="button" aria-pressed={page.selected} disabled={page.disabled} onClick={page.onSelect} className={`rounded-xl border px-4 py-2 text-xs font-semibold ${page.selected ? "border-black/10 bg-[#f6f5f2]" : "border-transparent text-[#4f4b45]"}`}>{page.label}</button>)}{spec.commandModel.addPage ? <CommandAction action={spec.commandModel.addPage} /> : <span className="h-9 w-24" aria-hidden="true" />}<CommandAction action={spec.commandModel.design} /><CommandAction action={spec.commandModel.seo} />{spec.commandModel.auxiliaryAction ? <CommandAction action={spec.commandModel.auxiliaryAction} /> : null}</div>
    <div className="flex flex-wrap items-center gap-2"><Link href={spec.previewHref} target="_blank" rel="noreferrer" className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold">{t("Preview")} ↗</Link><div className="flex rounded-xl bg-[#efeee9] p-1" aria-label={t("Preview device")}>{([["desktop","Desktop"],["tablet","Tablet"],["mobile","Phone"]] as const).map(([value,label]) => <button type="button" key={value} aria-pressed={spec.device === value} onClick={() => spec.onDeviceChange(value)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${spec.device === value ? "bg-white shadow-sm" : "text-[#4f4b45]"}`}>{t(label)}</button>)}</div><button type="button" aria-label={t("Undo")} onClick={spec.onUndo} disabled={!spec.canUndo || spec.saving} className="rounded-xl border border-black/10 bg-white px-3 py-2 disabled:opacity-35">↶</button><button type="button" aria-label={t("Redo")} onClick={spec.onRedo} disabled={!spec.canRedo || spec.saving} className="rounded-xl border border-black/10 bg-white px-3 py-2 disabled:opacity-35">↷</button><button type="button" onClick={spec.onSave} disabled={spec.saving} className="rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold disabled:opacity-50">{t("Save")}</button><button type="button" onClick={spec.onPublish} disabled={spec.saving} className="rounded-xl bg-[#17191f] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{t("Publish")}</button><button type="button" onClick={onBlocks} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold">{t("Blocks")}</button>{spec.commandModel.contextualAction ? <CommandAction action={spec.commandModel.contextualAction} /> : null}<button type="button" onClick={onSettings} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold">{t("Settings")}</button></div>
  </div>;
}

export default function OneStudioSiteEditor({ canvasRef, canvasProps, ...spec }: TemplateEditorSpec) {
  const { t } = useAdminI18n();
  const [compactPanel, setCompactPanel] = useState<"navigator" | "settings" | null>(null);
  return <section id="site-builder-canvas" data-template-editor-runtime data-template-key={spec.templateKey} className="relative mt-8 w-full scroll-mt-24 overflow-hidden rounded-[28px] border border-black/10 bg-[#e9e8e4] text-[#17191f] shadow-[0_26px_90px_rgba(25,27,32,0.12)]">
    <OneStudioEditorToolbar>
      <div className="flex min-w-0 flex-wrap items-center gap-2 px-4 pt-3">
        <strong className="text-sm">OneStudio Site Editor</strong>
        <span className="text-xs text-[#716d65]">{t("Design")}: {spec.designName}</span>
        {spec.templateTier ? <span className="rounded-full bg-[#3e263e] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#fef9ef]">{spec.templateTier}</span> : null}
        <button type="button" aria-pressed={spec.editingEnabled} onClick={() => spec.onEditingChange(!spec.editingEnabled)} className={`rounded-xl px-3 py-2 text-xs font-semibold ${spec.editingEnabled ? "bg-emerald-100 text-emerald-800" : "border border-black/10 bg-white"}`}>{spec.editingEnabled ? t("Editing on") : t("Edit")}</button>
        <span className="text-xs text-[#716d65]">{spec.draftLabel}</span>
      </div>
      <OneStudioEditorCommandBar spec={spec} onBlocks={() => setCompactPanel(current => current === "navigator" ? null : "navigator")} onSettings={() => setCompactPanel(current => current === "settings" ? null : "settings")} />
    </OneStudioEditorToolbar>
    <div className="template-editor-compact-controls items-center gap-2 border-b border-black/10 bg-white/90 p-3">
      <button type="button" aria-expanded={compactPanel === "navigator"} onClick={() => setCompactPanel(current => current === "navigator" ? null : "navigator")} className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold">{t("Blocks")}</button>
      <button type="button" aria-expanded={compactPanel === "settings"} onClick={() => setCompactPanel(current => current === "settings" ? null : "settings")} className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold">{t("Settings")}</button>
    </div>
    <div data-compact-panel={compactPanel ?? "canvas"}>
      <OneStudioEditorWorkspace>
        <EditorNavigatorFrame id="site-editor-blocks-panel" className={TEMPLATE_EDITOR_NAVIGATOR_CLASS}><SharedEditorNavigator model={spec.navigatorModel} /></EditorNavigatorFrame>
        <EditorCanvasFrame ref={canvasRef} className={TEMPLATE_EDITOR_CANVAS_CLASS} {...canvasProps}>{spec.canvas}</EditorCanvasFrame>
        <EditorSettingsFrame className={TEMPLATE_EDITOR_SETTINGS_CLASS}><SharedEditorInspector model={spec.inspectorModel} /></EditorSettingsFrame>
      </OneStudioEditorWorkspace>
    </div>
    <EditorBlockLibrary open={spec.libraryOpen} onClose={spec.onLibraryClose} templateItems={spec.templateLibraryItems} universalItems={spec.universalLibraryItems} />
  </section>;
}

export { OneStudioSiteEditor as TemplateEditorRuntime };
