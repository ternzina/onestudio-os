"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { loginPathForReturnPath } from "@/lib/auth/return-path";
import {
  getCustomerTemplateChoices,
  getTemplateCatalogRecord,
  type TemplateCreationMode,
  type TemplateKey,
} from "@/lib/public-site/template-catalog";
import { resolveCreationContract } from "@/lib/public-site/template-creation";
import { supabase } from "@/lib/supabase";

type BusinessType = "photo_studio" | "beauty_salon" | "school" | "venue" | "creative_service" | "other";
type ServiceKind = "appointment" | "rental" | "class" | "event" | "membership" | "other";
type ResourceKind = "staff" | "space" | "equipment" | "seat" | "asset" | "other";
type PricingModel = "fixed" | "per_hour" | "per_person" | "free" | "quote";
type OptionalModule = "media" | "portfolio" | "payments" | "notifications" | "documents" | "analytics";

type FormState = {
  business_name: string; business_type: BusinessType; timezone: string; locale: string;
  currency: string; country_code: string; email: string; phone: string; address: string;
  service_title: string; service_kind: ServiceKind; pricing_model: PricingModel; price: string;
  duration_minutes: string; service_capacity: string; resource_name: string;
  resource_kind: ResourceKind; resource_capacity: string; open_time: string; close_time: string;
  work_days: number[]; enabled_modules: OptionalModule[];
};

const templates = getCustomerTemplateChoices();
const optionalModules: readonly OptionalModule[] = ["media", "portfolio", "payments", "notifications", "documents", "analytics"];
const requiredModules = ["core", "catalog", "scheduling", "crm"] as const;
type RequiredModule = (typeof requiredModules)[number];
const requiredModuleLabels: Readonly<Record<RequiredModule, string>> = {
  core: "Основа системы",
  catalog: "Каталог услуг",
  scheduling: "Расписание",
  crm: "Клиенты / CRM",
};
const optionalModuleLabels: Readonly<Record<OptionalModule, string>> = {
  media: "Медиатека",
  portfolio: "Портфолио",
  payments: "Платежи",
  notifications: "Уведомления",
  documents: "Документы",
  analytics: "Аналитика",
};
const stages = ["Сайт / дизайн", "Бизнес", "Контакты", "Предложение и ресурс", "Модули", "Проверка"];
const businessTypes: ReadonlyArray<{ value: BusinessType; label: string }> = [
  { value: "photo_studio", label: "Фотостудия" },
  { value: "beauty_salon", label: "Салон красоты" },
  { value: "school", label: "Школа / занятия" },
  { value: "venue", label: "Площадка / мероприятия" },
  { value: "creative_service", label: "Творческие услуги" },
  { value: "other", label: "Другой бизнес" },
];
const serviceKinds: ReadonlyArray<{ value: ServiceKind; label: string }> = [
  { value: "appointment", label: "Запись по времени" },
  { value: "rental", label: "Аренда" },
  { value: "class", label: "Занятие / курс" },
  { value: "event", label: "Мероприятие" },
  { value: "membership", label: "Абонемент" },
  { value: "other", label: "Другое" },
];
const pricingModels: ReadonlyArray<{ value: PricingModel; label: string }> = [
  { value: "fixed", label: "Фиксированная цена" },
  { value: "per_hour", label: "За час" },
  { value: "per_person", label: "За человека" },
  { value: "free", label: "Бесплатно" },
  { value: "quote", label: "Цена по запросу" },
];
const resourceKinds: ReadonlyArray<{ value: ResourceKind; label: string }> = [
  { value: "staff", label: "Сотрудник / мастер" },
  { value: "space", label: "Помещение / зал" },
  { value: "equipment", label: "Оборудование" },
  { value: "seat", label: "Место" },
  { value: "asset", label: "Другой ресурс" },
  { value: "other", label: "Другое" },
];

function initialForm(): FormState {
  let timezone = "Europe/Kyiv";
  try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || timezone; } catch {}
  return {
    business_name: "Новый проект", business_type: "other", timezone, locale: "ru", currency: "EUR",
    country_code: "UA", email: "", phone: "", address: "", service_title: "Основная услуга",
    service_kind: "appointment", pricing_model: "fixed", price: "0", duration_minutes: "60",
    service_capacity: "1", resource_name: "Основной ресурс", resource_kind: "other",
    resource_capacity: "1", open_time: "09:00", close_time: "18:00", work_days: [1, 2, 3, 4, 5],
    enabled_modules: [...optionalModules],
  };
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return <label className={`grid gap-2 text-sm text-white/65 ${wide ? "sm:col-span-2" : ""}`}><span>{label}</span>{children}</label>;
}

const inputClass = "rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#d8b36a]";

export default function CanonicalSiteCreationWizard({ initialMode, initialTemplateKey }: { initialMode: TemplateCreationMode | null; initialTemplateKey: TemplateKey | null }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState(initialMode);
  const [templateKey, setTemplateKey] = useState(initialTemplateKey);
  const [form, setForm] = useState<FormState>(initialForm);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email?.trim().toLowerCase();
      if (email) setForm(current => current.email ? current : { ...current, email });
    });
  }, []);

  const hasSelectedFoundation = mode !== null && templateKey !== null;
  const selectedTemplate = getTemplateCatalogRecord(templateKey);
  const enabledCount = useMemo(() => {
    const expanded = new Set<string>([...requiredModules, ...form.enabled_modules]);
    if (expanded.has("portfolio")) expanded.add("media");
    if (expanded.has("notifications")) expanded.add("payments");
    if (expanded.has("documents")) { expanded.add("payments"); expanded.add("notifications"); }
    return expanded.size;
  }, [form.enabled_modules]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) { setForm(current => ({ ...current, [key]: value })); setMessage(""); }
  function chooseTemplate(nextMode: TemplateCreationMode, nextKey: TemplateKey) { setMode(nextMode); setTemplateKey(nextKey); setMessage(""); }
  function toggleDay(day: number) { update("work_days", form.work_days.includes(day) ? form.work_days.filter(value => value !== day) : [...form.work_days, day].sort()); }
  function toggleModule(module: OptionalModule) { update("enabled_modules", form.enabled_modules.includes(module) ? form.enabled_modules.filter(value => value !== module) : [...form.enabled_modules, module]); }

  function validate(currentStep = step) {
    if (currentStep === 1 && (form.business_name.trim().length < 2 || !/^[a-z]{2,3}(-[a-z]{2})?$/.test(form.locale) || !/^[A-Z]{3}$/.test(form.currency) || !/^[A-Z]{2}$/.test(form.country_code))) return "Проверьте название, язык, валюту и страну.";
    if (currentStep === 2 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Введите корректный email бизнеса.";
    if (currentStep === 3 && (!form.service_title.trim() || !form.resource_name.trim() || Number(form.duration_minutes) < 15 || Number(form.service_capacity) < 1 || Number(form.resource_capacity) < 1 || Number(form.price) < 0 || form.open_time >= form.close_time || form.work_days.length === 0)) return "Проверьте предложение, ресурс, цену, длительность и рабочие часы.";
    return "";
  }

  function next(event: MouseEvent<HTMLButtonElement>) { event.preventDefault(); if (step === 0 && !hasSelectedFoundation) return; const error = validate(); if (error) return setMessage(error); setStep(value => Math.min(value + 1, stages.length - 1)); setMessage(""); }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    if (step !== stages.length - 1 || !(submitter instanceof HTMLButtonElement) || submitter.dataset.action !== "create-site") return;
    setMessage("");
    if (!mode || !templateKey) return;
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      const intent = `/new-site?template=${encodeURIComponent(templateKey)}&mode=${mode}`;
      router.push(loginPathForReturnPath(intent));
      return;
    }
    setSubmitting(true);
    const creation = resolveCreationContract({ creation_mode: mode, template_key: templateKey });
    const enabledModules = [...requiredModules, ...form.enabled_modules];
    const { data, error } = await supabase.rpc("create_template_workspace", { p_request: {
      launch_id: window.crypto.randomUUID(), creation_mode: creation.creation_mode, template_key: creation.template_key,
      template_seed: creation.seed, business_name: form.business_name.trim(),
      business_type: form.business_type, timezone: form.timezone.trim(), locale: form.locale.trim().toLowerCase(),
      locales: [form.locale.trim().toLowerCase(), form.locale.trim().toLowerCase() === "ru" ? "en" : "ru"],
      primary_locale: form.locale.trim().toLowerCase(), currency: form.currency.trim().toUpperCase(),
      country_code: form.country_code.trim().toUpperCase(), email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(), address: form.address.trim(), service_title: form.service_title.trim(),
      service_kind: form.service_kind, pricing_model: form.pricing_model, price_minor: Math.round(Number(form.price) * 100),
      duration_minutes: Number(form.duration_minutes), service_capacity: Number(form.service_capacity),
      resource_name: form.resource_name.trim(), resource_kind: form.resource_kind,
      resource_capacity: Number(form.resource_capacity), open_time: form.open_time, close_time: form.close_time,
      work_days: form.work_days, enabled_modules: enabledModules,
    }});
    if (error) { setMessage(error.message.includes("workspace_limit_reached") ? "У вас уже 3 активных сайта. Архивируйте рабочий сайт или удалите пустой." : error.message || "Не удалось создать сайт."); setSubmitting(false); return; }
    const result = (Array.isArray(data) ? data[0] : data) as { business_slug?: string } | null;
    if (result?.business_slug) window.localStorage.setItem("onestudio:last-created-business-slug", result.business_slug);
    router.replace("/admin/site"); router.refresh();
  }

  return <main className="min-h-screen bg-[#0b0d12] px-5 py-10 text-white"><section className="mx-auto max-w-6xl rounded-[34px] border border-white/10 bg-white/[.04] p-6 sm:p-10">
    <p className="text-xs font-bold uppercase tracking-[.24em] text-[#d8b36a]">OneStudio OS · единое создание сайта</p>
    <div className="mt-4 flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-4xl font-semibold tracking-[-.06em] sm:text-6xl">Новый сайт</h1><p className="mt-3 text-sm text-white/55">Один процесс создаёт дизайн, бизнес и рабочее пространство.</p></div><p className="text-sm text-[#d8b36a]">Шаг {step + 1} из {stages.length} · {stages[step]}</p></div>
    <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-6">{stages.map((label, index) => <button key={label} type="button" onClick={() => index < step && setStep(index)} disabled={index >= step} className={`rounded-full px-2 py-2 text-[10px] ${index === step ? "bg-white text-black" : index < step ? "bg-[#d8b36a]/20 text-[#e7ca92]" : "bg-white/5 text-white/30"}`}>{label}</button>)}</div>
    <form onSubmit={submit} className="mt-8">
      {step === 0 ? <div className="space-y-6"><article className={`rounded-[26px] border p-6 ${mode === "blank" && templateKey === "standard" ? "border-[#d8b36a] bg-[#d8b36a]/10 shadow-[0_0_0_1px_rgba(216,179,106,.2)]" : "border-white/10 bg-white/5"}`}><span className="text-xs uppercase tracking-[.2em] text-[#d8b36a]">Создать с нуля</span><strong className="mt-2 block text-2xl">Base OneStudio</strong><p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">Нейтральная основа без готового бизнес-дизайна.<br />Все блоки, страницы и оформление можно собрать в редакторе.</p><button type="button" onClick={() => chooseTemplate("blank", "standard")} aria-pressed={mode === "blank" && templateKey === "standard"} className={`mt-5 rounded-full px-4 py-2 text-xs font-semibold ${mode === "blank" && templateKey === "standard" ? "bg-[#d8b36a] text-black" : "bg-white text-black"}`}>{mode === "blank" && templateKey === "standard" ? "✓ Выбрано" : "Начать с нуля"}</button></article><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{templates.map(item => { const selected = templateKey === item.key && mode === "template"; return <article key={item.key} className={`overflow-hidden rounded-[26px] border ${selected ? "border-[#d8b36a] bg-[#d8b36a]/5 shadow-[0_0_0_1px_rgba(216,179,106,.2)]" : "border-white/10"}`}><div className="relative aspect-[4/3] bg-white/5">{item.gallery.previewImage ? <Image src={item.gallery.previewImage} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" /> : null}</div><div className="p-5"><h2 className="text-xl font-semibold">{item.name}</h2><p className="mt-2 min-h-16 text-sm leading-6 text-white/55">{item.gallery.description}</p><div className="mt-5 flex flex-wrap gap-2">{item.gallery.previewRoute ? <Link href={item.gallery.previewRoute} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-4 py-2 text-xs">Посмотреть демо</Link> : null}<button type="button" onClick={() => chooseTemplate("template", item.key)} aria-pressed={selected} className={`rounded-full px-4 py-2 text-xs font-semibold text-black ${selected ? "bg-[#d8b36a]" : "bg-white"}`}>{selected ? "✓ Выбрано" : "Выбрать шаблон"}</button></div></div></article>; })}</div>{hasSelectedFoundation ? <div role="status" className="rounded-2xl border border-[#d8b36a]/40 bg-[#d8b36a]/10 px-5 py-4 text-sm shadow-[0_12px_36px_rgba(0,0,0,.16)]"><p className="font-semibold text-[#e7ca92]">✓ Основа сайта выбрана</p><p className="mt-1 text-white/70">Нажмите «Продолжить», чтобы перейти к настройке бизнеса.</p></div> : null}</div> : null}
      {step === 1 ? <div className="grid gap-5 sm:grid-cols-2"><Field label="Название проекта" wide><input className={inputClass} value={form.business_name} onChange={e => update("business_name", e.target.value)} /></Field><Field label="Тип бизнеса"><select className={inputClass} value={form.business_type} onChange={e => update("business_type", e.target.value as BusinessType)}>{businessTypes.map(item => <option className="bg-[#111318]" key={item.value} value={item.value}>{item.label}</option>)}</select></Field><Field label="Часовой пояс"><input className={inputClass} value={form.timezone} onChange={e => update("timezone", e.target.value)} /></Field><Field label="Язык"><input className={inputClass} value={form.locale} onChange={e => update("locale", e.target.value.toLowerCase())} /></Field><Field label="Валюта"><input className={inputClass} value={form.currency} onChange={e => update("currency", e.target.value.toUpperCase())} /></Field><Field label="Страна"><input className={inputClass} value={form.country_code} onChange={e => update("country_code", e.target.value.toUpperCase())} /></Field></div> : null}
      {step === 2 ? <div className="grid gap-5 sm:grid-cols-2"><Field label="Email" wide><input type="email" className={inputClass} value={form.email} onChange={e => update("email", e.target.value)} /></Field><Field label="Телефон"><input className={inputClass} value={form.phone} onChange={e => update("phone", e.target.value)} /></Field><Field label="Адрес"><input className={inputClass} value={form.address} onChange={e => update("address", e.target.value)} /></Field></div> : null}
      {step === 3 ? <div><p className="mb-5 text-sm leading-6 text-white/55">Добавьте первую услугу и ресурс. Остальные можно будет создать позже в рабочем пространстве.</p><div className="grid gap-5 sm:grid-cols-2"><Field label="Первая услуга"><input className={inputClass} value={form.service_title} onChange={e => update("service_title", e.target.value)} /></Field><Field label="Тип услуги"><select className={inputClass} value={form.service_kind} onChange={e => update("service_kind", e.target.value as ServiceKind)}>{serviceKinds.map(item => <option className="bg-[#111318]" key={item.value} value={item.value}>{item.label}</option>)}</select></Field><Field label="Цена"><input type="number" min="0" step="0.01" className={inputClass} value={form.price} onChange={e => update("price", e.target.value)} /></Field><Field label="Модель цены"><select className={inputClass} value={form.pricing_model} onChange={e => update("pricing_model", e.target.value as PricingModel)}>{pricingModels.map(item => <option className="bg-[#111318]" key={item.value} value={item.value}>{item.label}</option>)}</select></Field><Field label="Длительность, мин"><input type="number" min="15" className={inputClass} value={form.duration_minutes} onChange={e => update("duration_minutes", e.target.value)} /></Field><Field label="Вместимость услуги"><input type="number" min="1" className={inputClass} value={form.service_capacity} onChange={e => update("service_capacity", e.target.value)} /></Field><Field label="Ресурс"><input className={inputClass} value={form.resource_name} onChange={e => update("resource_name", e.target.value)} /></Field><Field label="Тип ресурса"><select className={inputClass} value={form.resource_kind} onChange={e => update("resource_kind", e.target.value as ResourceKind)}>{resourceKinds.map(item => <option className="bg-[#111318]" key={item.value} value={item.value}>{item.label}</option>)}</select></Field><Field label="Вместимость ресурса"><input type="number" min="1" className={inputClass} value={form.resource_capacity} onChange={e => update("resource_capacity", e.target.value)} /></Field><Field label="Рабочие часы"><div className="flex gap-2"><input type="time" className={inputClass} value={form.open_time} onChange={e => update("open_time", e.target.value)} /><input type="time" className={inputClass} value={form.close_time} onChange={e => update("close_time", e.target.value)} /></div></Field><Field label="Рабочие дни" wide><div className="flex flex-wrap gap-2">{[0,1,2,3,4,5,6].map(day => <button type="button" key={day} onClick={() => toggleDay(day)} className={`rounded-full px-4 py-2 ${form.work_days.includes(day) ? "bg-white text-black" : "bg-white/5"}`}>{["Вс","Пн","Вт","Ср","Чт","Пт","Сб"][day]}</button>)}</div></Field></div></div> : null}
      {step === 4 ? <div><p className="text-white/70">Основные модули включены автоматически.<br />Дополнительные можно отключить сейчас или изменить позже в настройках.</p><p className="mt-2 text-sm text-white/45">Сейчас будет включено: {enabledCount}</p><div className="mt-5"><p className="text-xs font-semibold uppercase tracking-[.16em] text-white/40">Включены автоматически</p><div className="mt-3 flex flex-wrap gap-2">{requiredModules.map(module => <span key={module} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/65">{requiredModuleLabels[module]}</span>)}</div></div><div className="mt-6"><p className="text-xs font-semibold uppercase tracking-[.16em] text-white/40">Дополнительные модули</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{optionalModules.map(module => <button type="button" key={module} onClick={() => toggleModule(module)} className={`rounded-2xl border p-4 text-left ${form.enabled_modules.includes(module) ? "border-[#d8b36a] bg-[#d8b36a]/10" : "border-white/10"}`}>{optionalModuleLabels[module]}</button>)}</div></div></div> : null}
      {step === 5 ? <div className="rounded-[26px] border border-white/10 bg-white/5 p-6"><h2 className="text-2xl font-semibold">Проверка перед созданием</h2><dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-white/40">Сайт</dt><dd>{selectedTemplate?.name}</dd></div><div><dt className="text-white/40">Проект</dt><dd>{form.business_name}</dd></div><div><dt className="text-white/40">Контакты</dt><dd>{form.email}</dd></div><div><dt className="text-white/40">Первая услуга / ресурс</dt><dd>{form.service_title} / {form.resource_name}</dd></div></dl><p className="mt-5 text-sm leading-6 text-white/55">Будет создан ровно один неопубликованный сайт и одно рабочее пространство. Повтор одной операции защищён идентификатором запуска.</p></div> : null}
      {message ? <div className="mt-6 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100"><p>{message}</p>{step === stages.length - 1 ? <button type="button" onClick={() => setStep(0)} className="mt-3 font-semibold underline">Вернуться к созданию сайта</button> : null}</div> : null}
      <div className="mt-8 flex justify-between gap-3">{step > 0 ? <button type="button" onClick={() => setStep(value => value - 1)} className="rounded-full border border-white/20 px-5 py-3">Назад</button> : <span />}{step < stages.length - 1 ? <button key="continue" type="button" onClick={next} disabled={step === 0 && !hasSelectedFoundation} className="rounded-full bg-white px-6 py-3 font-semibold text-black transition disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30">Продолжить</button> : <button key="create-site" type="submit" data-action="create-site" disabled={submitting} className="rounded-full bg-[#d8b36a] px-6 py-3 font-semibold text-black disabled:opacity-50">{submitting ? "Создаём…" : "Создать сайт"}</button>}</div>
    </form>
  </section></main>;
}
