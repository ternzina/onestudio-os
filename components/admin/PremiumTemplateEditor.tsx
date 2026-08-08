"use client";

import Link from "next/link";
import HomeExperience from "@/app/demos/premium-kids-center/HomeExperience";
import {
  resolvePremiumKidsContent,
  withPremiumKidsContent,
  type PremiumKidsContent,
} from "@/lib/public-site/premium-kids-content";
import type { PublicSiteContent, PublicSiteData } from "@/lib/public-site/types";

const fieldClass = "mt-2 w-full rounded-xl border border-[#3e263e]/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#e07e67]";

type Props = {
  businessId: string;
  businessSlug: string;
  businessName: string;
  locale: string;
  draft: PublicSiteContent;
  disabled: boolean;
  saving: boolean;
  hasUnsavedChanges: boolean;
  onChange: (draft: PublicSiteContent) => void;
  onSave: () => void;
  onPublish: () => void;
};

const groups: Array<{ title: string; fields: Array<[keyof PremiumKidsContent, string, "input" | "textarea" | "lines"]> }> = [
  { title: "Бренд и hero", fields: [["brand_name", "Название сайта", "input"], ["brand_tagline", "Подпись бренда", "input"], ["hero_eyebrow", "Hero eyebrow", "input"], ["hero_title", "Hero title", "textarea"], ["hero_description", "Hero description", "textarea"], ["primary_cta_label", "Primary CTA", "input"], ["secondary_cta_label", "Secondary CTA", "input"]] },
  { title: "Позиционирование", fields: [["intro_eyebrow", "Eyebrow", "input"], ["intro_title", "Заголовок", "textarea"], ["intro_description", "Описание", "textarea"]] },
  { title: "Программы и возраст", fields: [["programs_title", "Заголовок программ", "textarea"], ["programs_description", "Описание", "textarea"], ["age_groups", "Возрастные группы — одна строка на группу", "lines"]] },
  { title: "Подход и расписание", fields: [["approach_title", "Подход", "textarea"], ["approach_items", "Принципы — один на строку", "lines"], ["schedule_title", "Расписание", "textarea"], ["schedule_description", "Описание расписания", "textarea"]] },
  { title: "Команда и галерея", fields: [["teachers_title", "Заголовок команды", "textarea"], ["teachers", "Педагоги — один на строку", "lines"], ["gallery_title", "Заголовок галереи", "textarea"], ["gallery_captions", "Подписи галереи — одна на строку", "lines"]] },
  { title: "Отзывы и FAQ", fields: [["reviews_title", "Заголовок отзывов", "textarea"], ["reviews", "Отзывы — один на строку, автор после ·", "lines"], ["faq_title", "Заголовок FAQ", "textarea"], ["faq", "Вопрос и ответ через ·, один на строку", "lines"]] },
  { title: "Финальный CTA и контакты", fields: [["final_cta_eyebrow", "Eyebrow", "input"], ["final_cta_title", "Заголовок", "textarea"], ["final_cta_label", "CTA", "input"], ["footer_description", "Описание в footer", "textarea"], ["contact_email", "Email", "input"], ["contact_phone", "Телефон", "input"], ["contact_address", "Адрес", "textarea"]] },
];

export default function PremiumTemplateEditor(props: Props) {
  const premium = resolvePremiumKidsContent(props.draft);
  const previewSite: PublicSiteData = {
    business: { id: props.businessId, slug: props.businessSlug, name: props.businessName, locale: props.locale, primary_locale: props.locale, currency: "PLN", timezone: "Europe/Warsaw" },
    content: props.draft,
    company: {}, services: [], portfolio: [],
    capabilities: { booking: true, catalog: true, portfolio: true },
    available_locales: [props.locale], published_at: null,
  };

  function update(key: keyof PremiumKidsContent, value: string) {
    const next = { ...premium, [key]: Array.isArray(premium[key]) ? value.split("\n").map((item) => item.trim()).filter(Boolean) : value } as PremiumKidsContent;
    props.onChange(withPremiumKidsContent(props.draft, next));
  }

  return <section id="site-builder-canvas" data-template-editor="premium-kids-center" className="mt-8 overflow-hidden rounded-[28px] border border-[#3e263e]/15 bg-[#fef9ef] text-[#3e263e] shadow-[0_26px_90px_rgba(62,38,62,0.12)]">
    <header className="flex flex-col gap-4 border-b border-[#3e263e]/12 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e07e67]">Premium template editor</p><h2 className="mt-2 text-2xl font-semibold">BEMBI Premium</h2><p className="mt-1 text-sm text-[#3e263e]/60">Редактируется черновик{props.hasUnsavedChanges ? " · есть несохранённые изменения" : ""}</p></div>
      <div className="flex flex-wrap gap-2"><Link href={`/site-preview/premium-kids-center/${props.businessSlug}`} target="_blank" rel="noreferrer" className="rounded-xl border border-[#3e263e]/15 px-4 py-2.5 text-xs font-bold">Предпросмотр ↗</Link><button type="button" disabled={props.disabled || props.saving} onClick={props.onSave} className="rounded-xl border border-[#3e263e]/15 bg-white px-4 py-2.5 text-xs font-bold disabled:opacity-50">Сохранить</button><button type="button" disabled={props.disabled || props.saving} onClick={props.onPublish} className="rounded-xl bg-[#e07e67] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">Опубликовать</button></div>
    </header>
    <div className="grid gap-5 p-4 xl:grid-cols-[400px_minmax(0,1fr)] sm:p-5">
      <div className="max-h-[820px] space-y-3 overflow-y-auto pr-1">{groups.map((group) => <details key={group.title} open={group.title === "Бренд и hero"} className="rounded-2xl border border-[#3e263e]/10 bg-white"><summary className="cursor-pointer px-4 py-3 text-sm font-semibold">{group.title}</summary><div className="grid gap-4 border-t border-[#3e263e]/8 p-4">{group.fields.map(([key, label, kind]) => <label key={key} className="text-xs font-semibold text-[#3e263e]/70">{label}{kind === "input" ? <input className={fieldClass} value={premium[key] as string} disabled={props.disabled} onChange={(event) => update(key, event.target.value)} /> : <textarea className={fieldClass} rows={kind === "lines" ? 6 : 3} value={kind === "lines" ? (premium[key] as string[]).join("\n") : premium[key] as string} disabled={props.disabled} onChange={(event) => update(key, event.target.value)} />}</label>)}</div></details>)}</div>
      <aside className="min-w-0"><p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#3e263e]/55">Premium draft · live preview</p><div className="h-[820px] overflow-auto rounded-2xl border border-[#3e263e]/12 bg-white"><div className="w-[1280px] origin-top-left scale-[0.58]"><HomeExperience basePath={`/site-preview/premium-kids-center/${props.businessSlug}`} site={previewSite} /></div></div></aside>
    </div>
  </section>;
}
