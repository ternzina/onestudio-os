"use client";

import Link from "next/link";
import { useState } from "react";
import MediaLibraryPicker from "@/components/admin/MediaLibraryPicker";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import type { PublicSiteContent, PublicSitePage } from "@/lib/public-site/types";
import type { SiteTemplateDefinition } from "@/lib/public-site/template-registry";
import { groupTemplatesByAccess, templateAccessLabel } from "@/lib/public-site/template-catalog";
import { buildSitePreviewHref } from "@/lib/public-site/preview-contract";
import { richTextPlainText } from "@/lib/public-site/rich-text";

type DesignDialogProps = {
  open: boolean;
  activeTemplateKey: string;
  activeDesigns: readonly SiteTemplateDefinition[];
  businessSlug: string;
  locale: string;
  canConfigure: boolean;
  saving: boolean;
  savingTemplateKey: string;
  savedTemplateKey: string;
  onSelectDesign: (templateKey: string) => Promise<void>;
  onClose: () => void;
};

export function OneStudioDesignDialog({ open, activeTemplateKey, activeDesigns, businessSlug, locale, canConfigure, saving, savingTemplateKey, savedTemplateKey, onSelectDesign, onClose }: DesignDialogProps) {
  const { t } = useAdminI18n();
  if (!open) return null;
  const designGroups = groupTemplatesByAccess(activeDesigns);

  return <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#17191f]/55 p-4 backdrop-blur-[3px]" role="dialog" aria-modal="true" aria-label={t("Site templates")} onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <div className="max-h-[calc(100dvh-2rem)] w-full max-w-4xl overflow-auto rounded-[30px] bg-[#f8f7f3] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.4)] sm:p-8">
      <div className="flex items-start justify-between gap-5">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9d3151]">{t("Site design")}</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{t("Choose site design")}</h2><p className="mt-3 text-sm text-[#716d65]">{t("The template fills the page with editable blocks, texts and colors.")}</p></div>
        <button type="button" onClick={onClose} className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold" aria-label={t("Close")}>×</button>
      </div>
      <div className="mt-7 space-y-7">
        {(["free", "premium"] as const).map(access => designGroups[access].length ? <section key={access} aria-labelledby={`design-group-${access}`}><div className="mb-3 flex items-baseline justify-between gap-4"><h3 id={`design-group-${access}`} className="text-lg font-semibold">{access === "free" ? "FREE" : "PREMIUM"}</h3><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b877e]">{templateAccessLabel(access, locale.startsWith("ru") ? "ru" : "en")}</span></div><div className="grid gap-4 md:grid-cols-2">{designGroups[access].map((template) => {
          const selected = activeTemplateKey === template.key;
          const previewHref = buildSitePreviewHref({ templateKey: template.key, businessSlug, locale });
          return <article key={template.key} className={`rounded-[22px] border bg-white p-5 ${selected ? "border-[#9d3151] ring-2 ring-[#9d3151]/10" : "border-black/8"}`}>
            <div className="flex items-center justify-between gap-3"><div><p className="font-semibold">{template.name}</p><p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#8b877e]">{template.category}</p></div><span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${template.access === "premium" ? "bg-[#3e263e] text-[#fef9ef]" : "bg-[#efeee9] text-[#4f4b45]"}`}>{templateAccessLabel(template.access, locale.startsWith("ru") ? "ru" : "en")}</span></div>
            <p className="mt-4 text-sm leading-6 text-[#716d65]">{template.gallery.description}</p>
            <div className="mt-5 flex gap-2"><button type="button" disabled={selected || !canConfigure || saving} onClick={() => void onSelectDesign(template.key).then(onClose)} className="flex-1 rounded-xl bg-[#17191f] px-4 py-3 text-xs font-semibold text-white disabled:opacity-40">{selected ? t("Selected") : t("Choose design")}</button>{template.capabilities.previewRenderable ? <Link href={previewHref} target="_blank" rel="noreferrer" className="rounded-xl border border-black/15 px-4 py-3 text-xs font-semibold">Предпросмотр ↗</Link> : null}</div>
            {selected ? <p className="mt-3 text-xs font-semibold text-emerald-700">{savingTemplateKey === template.key ? "Сохраняем в черновик…" : savedTemplateKey === template.key ? "Сохранено в черновик" : "Выбрано в черновике"}</p> : null}
          </article>;
        })}</div></section> : null)}
      </div>
    </div>
  </div>;
}

type SeoImageTarget = { kind: "site"; label: string } | { kind: "page"; pageId: string; label: string };
type SeoDialogProps = {
  open: boolean;
  businessId: string;
  draft: PublicSiteContent;
  canConfigure: boolean;
  saving: boolean;
  onChange: (draft: PublicSiteContent, historyGroup?: string) => void;
  onSave: () => void;
  onClose: () => void;
};

function SeoField({ label, value, disabled, multiline = false, onChange }: { label: string; value: string; disabled: boolean; multiline?: boolean; onChange: (value: string) => void }) {
  return <label className="grid gap-2 text-xs font-semibold text-[#4f4b45]"><span>{label}</span>{multiline ? <textarea rows={4} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-normal text-[#17191f] disabled:opacity-50" /> : <input value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-normal text-[#17191f] disabled:opacity-50" />}</label>;
}

export function OneStudioSeoDialog({ open, businessId, draft, canConfigure, saving, onChange, onSave, onClose }: SeoDialogProps) {
  const { t } = useAdminI18n();
  const [imageTarget, setImageTarget] = useState<SeoImageTarget | null>(null);
  if (!open) return null;
  const updateSite = <Key extends keyof PublicSiteContent>(key: Key, value: PublicSiteContent[Key]) => onChange({ ...draft, [key]: value }, `seo:site:${String(key)}`);
  const updatePage = <Key extends keyof PublicSitePage>(pageId: string, key: Key, value: PublicSitePage[Key]) => onChange({ ...draft, pages: (draft.pages ?? []).map((page) => page.id === pageId ? { ...page, [key]: value } : page) }, `seo:page:${pageId}:${String(key)}`);
  const selectImage = (url: string) => { if (!imageTarget) return; if (imageTarget.kind === "site") updateSite("seo_image_url", url); else updatePage(imageTarget.pageId, "seo_image_url", url); setImageTarget(null); };

  return <><div className="fixed inset-0 z-[105] flex items-center justify-center overflow-y-auto bg-[#17191f]/55 p-4 backdrop-blur-[3px]" role="dialog" aria-modal="true" aria-label={t("SEO pages")} onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <div className="max-h-[calc(100dvh-2rem)] w-full max-w-4xl overflow-auto rounded-[30px] bg-[#f8f7f3] p-5 shadow-[0_35px_120px_rgba(0,0,0,0.4)] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9d3151]">{t("Search and sharing")}</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{t("SEO pages")}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#716d65]">{t("Set a separate search title, description and sharing image for every public page.")}</p></div><button type="button" onClick={onClose} className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold" aria-label={t("Close")}>×</button></div>
      <section className="mt-7 rounded-[24px] border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">{t("SEO infrastructure")}</p><h3 className="mt-2 text-lg font-semibold text-emerald-950">{t("Ready for published pages")}</h3></div><div className="flex flex-wrap gap-2 text-[10px] font-semibold"><span className="rounded-full bg-white px-3 py-1.5 text-emerald-800">{t("Custom 404 page")}</span><Link href="/robots.txt" target="_blank" className="rounded-full bg-white px-3 py-1.5 text-emerald-800">{t("Robots directives")}</Link><Link href="/sitemap.xml" target="_blank" className="rounded-full bg-white px-3 py-1.5 text-emerald-800">{t("Automatic sitemap")}</Link></div></div><p className="mt-3 text-xs leading-6 text-emerald-900/70">{t("Hidden and no-index pages are excluded from the sitemap.")}</p></section>
      <div className="mt-4 grid gap-4">
        <article className="rounded-[24px] border border-black/8 bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d3151]">{t("Home page")}</p><h3 className="mt-2 text-xl font-semibold">{richTextPlainText(draft.hero_title)}</h3></div><span className="rounded-full bg-[#f2eee8] px-3 py-1.5 text-[10px] font-semibold">/</span></div><div className="mt-5 grid gap-4 lg:grid-cols-2"><SeoField label={t("SEO title")} value={draft.seo_title} disabled={!canConfigure} onChange={(value) => updateSite("seo_title", value.slice(0, 70))} /><SeoField label={t("SEO description")} value={draft.seo_description} disabled={!canConfigure} multiline onChange={(value) => updateSite("seo_description", value.slice(0, 170))} /></div><div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.8fr]"><div className="grid gap-2"><SeoField label={t("SEO sharing image")} value={draft.seo_image_url ?? ""} disabled={!canConfigure} onChange={(value) => updateSite("seo_image_url", value)} /><button type="button" disabled={!canConfigure} onClick={() => setImageTarget({ kind: "site", label: t("SEO sharing image") })} className="justify-self-start rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold disabled:opacity-40">{t("Choose image")}</button></div><label className="flex items-center justify-between gap-4 rounded-xl border border-black/10 p-4 text-xs font-semibold">{t("Hide this page from search engines")}<input type="checkbox" checked={draft.seo_no_index === true} disabled={!canConfigure} onChange={(event) => updateSite("seo_no_index", event.target.checked)} /></label></div></article>
        {(draft.pages ?? []).map((page) => <details key={page.id} className="group rounded-[24px] border border-black/8 bg-white"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 sm:px-6"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d3151]">{page.type === "portfolio" ? t("Portfolio") : t("Custom page")}</p><h3 className="mt-2 text-lg font-semibold">{page.nav_label}</h3></div><div className="flex items-center gap-3"><span className="max-w-44 truncate rounded-full bg-[#f2eee8] px-3 py-1.5 text-[10px] font-semibold">/{page.type === "custom" ? "p/" : ""}{page.slug}</span><span className="text-lg transition group-open:rotate-45">+</span></div></summary><div className="grid gap-4 border-t border-black/8 p-5 sm:p-6"><div className="grid gap-4 lg:grid-cols-2"><SeoField label={t("SEO title")} value={page.seo_title ?? ""} disabled={!canConfigure} onChange={(value) => updatePage(page.id, "seo_title", value.slice(0, 70))} /><SeoField label={t("SEO description")} value={page.seo_description ?? ""} disabled={!canConfigure} multiline onChange={(value) => updatePage(page.id, "seo_description", value.slice(0, 170))} /></div><div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]"><div className="grid gap-2"><SeoField label={t("SEO sharing image")} value={page.seo_image_url ?? ""} disabled={!canConfigure} onChange={(value) => updatePage(page.id, "seo_image_url", value)} /><button type="button" disabled={!canConfigure} onClick={() => setImageTarget({ kind: "page", pageId: page.id, label: `${t("SEO sharing image")} · ${page.nav_label}` })} className="justify-self-start rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold disabled:opacity-40">{t("Choose image")}</button></div><label className="flex items-center justify-between gap-4 rounded-xl border border-black/10 p-4 text-xs font-semibold">{t("Hide this page from search engines")}<input type="checkbox" checked={page.seo_no_index === true} disabled={!canConfigure} onChange={(event) => updatePage(page.id, "seo_no_index", event.target.checked)} /></label></div></div></details>)}
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-black/10 bg-white px-5 py-3 text-xs font-semibold">{t("Close")}</button><button type="button" onClick={() => { onClose(); onSave(); }} disabled={saving || !canConfigure} className="rounded-xl bg-[#17191f] px-5 py-3 text-xs font-semibold text-white disabled:opacity-40">{saving ? t("Saving…") : t("Save SEO")}</button></div>
    </div>
  </div><MediaLibraryPicker open={Boolean(imageTarget)} businessId={businessId} title={imageTarget?.label ?? t("Choose image")} onSelect={selectImage} onClose={() => setImageTarget(null)} /></>;
}
