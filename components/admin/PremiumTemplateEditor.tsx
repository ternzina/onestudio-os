"use client";

import { useRef, useState } from "react";
import HomeExperience from "@/app/demos/premium-kids-center/HomeExperience";
import RichTextEditor from "@/components/admin/RichTextEditor";
import TemplateEditorShell, { type TemplateEditorDevice, type TemplateEditorSection } from "@/components/admin/TemplateEditorShell";
import TypographyControls from "@/components/admin/TypographyControls";
import { resolvePremiumKidsContent, withPremiumKidsContent, type PremiumKidsContent } from "@/lib/public-site/premium-kids-content";
import type { PublicSiteContent, PublicSiteData, PublicSiteTypography } from "@/lib/public-site/types";

const inputClass = "mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#9a742e] disabled:opacity-50";
const safeVisibility = new Set(["teachers", "gallery", "faq"]);
const sections: readonly TemplateEditorSection[] = [
  ["header", "Header / Brand", "Логотип, название и глобальная подпись"], ["hero", "Hero", "Первый экран и основные действия"], ["intro", "Intro", "Позиционирование и возрастной навигатор"], ["programs", "Programs", "Программы центра и возрастные группы"], ["approach", "Approach", "Принципы образовательного подхода"], ["schedule", "Schedule", "Заголовок и пояснение расписания"], ["teachers", "Teachers", "Команда и роли преподавателей"], ["gallery", "Gallery", "Галерея и подписи"], ["reviews", "Reviews", "Отзывы родителей"], ["faq", "FAQ", "Вопросы и ответы"], ["final", "Final CTA", "Финальный призыв к действию"], ["footer", "Footer", "Описание и контакты"],
].map(([id,label,description]) => ({ id, label, description, capabilities: { visibility: safeVisibility.has(id), reorder: false, duplicate: false, typography: id === "hero" } }));

const fields: Record<string, Array<[keyof PremiumKidsContent, string, "input" | "text" | "lines"]>> = {
  header: [["brand_name","Название сайта","input"],["brand_tagline","Подпись бренда","input"]],
  hero: [["hero_eyebrow","Eyebrow","input"],["hero_title","Заголовок","text"],["hero_description","Описание","text"],["primary_cta_label","Основная кнопка","input"],["secondary_cta_label","Вторая кнопка","input"]],
  intro: [["intro_eyebrow","Eyebrow","input"],["intro_title","Заголовок","text"],["intro_description","Описание","text"]],
  programs: [["programs_title","Заголовок","text"],["programs_description","Описание","text"],["age_groups","Возрастные группы — одна на строку","lines"]],
  approach: [["approach_title","Заголовок","text"],["approach_items","Принципы — один на строку","lines"]],
  schedule: [["schedule_title","Заголовок","text"],["schedule_description","Описание","text"]],
  teachers: [["teachers_title","Заголовок","text"],["teachers","Преподаватели — один на строку","lines"]],
  gallery: [["gallery_title","Заголовок","text"],["gallery_captions","Подписи — одна на строку","lines"]],
  reviews: [["reviews_title","Заголовок","text"],["reviews","Отзывы — один на строку, автор после ·","lines"]],
  faq: [["faq_title","Заголовок","text"],["faq","Вопрос и ответ через ·","lines"]],
  final: [["final_cta_eyebrow","Eyebrow","input"],["final_cta_title","Заголовок","text"],["final_cta_label","Кнопка","input"]],
  footer: [["footer_description","Описание","text"],["contact_email","Email","input"],["contact_phone","Телефон","input"],["contact_address","Адрес","text"]],
};

export default function PremiumTemplateEditor({ businessId, businessSlug, businessName, locale, draft, disabled, saving, hasUnsavedChanges, device, canUndo, canRedo, onChange, onDeviceChange, onUndo, onRedo, onSave, onPublish }: {
  businessId: string; businessSlug: string; businessName: string; locale: string; draft: PublicSiteContent; disabled: boolean; saving: boolean; hasUnsavedChanges: boolean; device: TemplateEditorDevice; canUndo: boolean; canRedo: boolean;
  onChange: (draft: PublicSiteContent) => void; onDeviceChange: (device: TemplateEditorDevice) => void; onUndo: () => void; onRedo: () => void; onSave: () => void; onPublish: () => void;
}) {
  const [selected, setSelected] = useState("hero");
  const [editingEnabled, setEditingEnabled] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const premium = resolvePremiumKidsContent(draft);
  const section = sections.find(item => item.id === selected) ?? sections[1];
  const site: PublicSiteData = { business: { id: businessId, slug: businessSlug, name: businessName, locale, primary_locale: locale, currency: "PLN", timezone: "Europe/Warsaw" }, content: draft, company: {}, services: [], portfolio: [], capabilities: { booking: true, catalog: true, portfolio: true }, available_locales: [locale], published_at: null };

  function commit(next: PremiumKidsContent) { onChange(withPremiumKidsContent(draft, next)); }
  function update(key: keyof PremiumKidsContent, value: string) { commit({ ...premium, [key]: Array.isArray(premium[key]) ? value.split("\n").map(item => item.trim()).filter(Boolean) : value } as PremiumKidsContent); }
  function updateTypography(value: PublicSiteTypography | undefined) { const next = { ...premium.heading_typography }; if (value) next[selected] = value; else delete next[selected]; commit({ ...premium, heading_typography: next }); }
  function selectSection(id: string) { setSelected(id); requestAnimationFrame(() => { const anchor = ({ header: "premium-header", hero: "top", intro: "programs", programs: "offline", teachers: "team", final: "trial", footer: "premium-footer" } as Record<string,string>)[id] ?? id; canvasRef.current?.querySelector<HTMLElement>(`#${anchor}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }); }
  function setVisible(visible: boolean) { const hidden = new Set(premium.hidden_sections); if (visible) hidden.delete(selected); else hidden.add(selected); commit({ ...premium, hidden_sections: [...hidden] }); }

  const width = device === "mobile" ? 390 : device === "tablet" ? 768 : 1280;
  const zoom = device === "mobile" ? 0.82 : device === "tablet" ? 0.68 : 0.56;
  return <TemplateEditorShell templateName="BEMBI Premium" draftLabel={`Черновик${hasUnsavedChanges ? " · не сохранён" : " · сохранён"}`} previewHref={`/site-preview/premium-kids-center/${businessSlug}`} sections={sections} selectedSection={selected} device={device} editingEnabled={editingEnabled} saving={saving || disabled} canUndo={canUndo} canRedo={canRedo} onSelectSection={selectSection} onDeviceChange={onDeviceChange} onEditingChange={setEditingEnabled} onUndo={onUndo} onRedo={onRedo} onSave={onSave} onPublish={onPublish}
    navigator={<div className="mt-5 rounded-xl border border-black/8 bg-[#faf9f6] p-3 text-[10px] leading-5 text-[#716d65]"><b className="block text-[#403d38]">Возможности шаблона</b>Перемещение: нет<br />Дублирование: нет<br />Видимость: для независимых секций</div>}
    canvas={<div ref={canvasRef} data-preview-device={device} className="mx-auto h-[720px] overflow-auto rounded-2xl border border-black/10 bg-white shadow-[0_20px_70px_rgba(0,0,0,.12)]" style={{ maxWidth: width * zoom + 2 }}><div style={{ width, zoom }}><HomeExperience basePath={`/site-preview/premium-kids-center/${businessSlug}`} site={site} /></div></div>}
    inspector={<><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a742e]">Настройки секции</p><h3 className="mt-2 text-xl font-semibold">{section.label}</h3><p className="mt-1 text-xs leading-5 text-[#716d65]">{section.description}</p><div className="mt-5 grid gap-4">{section.capabilities.visibility ? <label className="flex items-center justify-between rounded-xl border border-black/8 bg-[#faf9f6] p-3 text-xs font-semibold">Показывать секцию<input type="checkbox" checked={!premium.hidden_sections.includes(selected)} disabled={disabled || !editingEnabled} onChange={event => setVisible(event.target.checked)} /></label> : <p className="rounded-xl border border-black/8 bg-[#faf9f6] p-3 text-[11px] leading-5 text-[#716d65]">Позиция секции зафиксирована Premium-композицией. Перемещение и дублирование недоступны.</p>}{(fields[selected] ?? []).map(([key,label,kind]) => <label key={key} className="text-xs font-semibold text-[#4f4b45]">{label}{kind === "input" ? <input className={inputClass} value={premium[key] as string} disabled={disabled || !editingEnabled} onChange={event => update(key,event.target.value)} /> : kind === "text" && ["hero_description","intro_description","programs_description","schedule_description","footer_description"].includes(key) ? <RichTextEditor value={premium[key] as string} disabled={disabled || !editingEnabled} onChange={value => update(key,value)} /> : <textarea className={inputClass} rows={kind === "lines" ? 6 : 3} value={kind === "lines" ? (premium[key] as string[]).join("\n") : premium[key] as string} disabled={disabled || !editingEnabled} onChange={event => update(key,event.target.value)} />}</label>)}{section.capabilities.typography ? <TypographyControls title="Заголовок секции" description="Ограниченные настройки Site Editor 2.6" value={premium.heading_typography[selected]} disabled={disabled || !editingEnabled} onChange={updateTypography} /> : null}</div></>}
  />;
}
