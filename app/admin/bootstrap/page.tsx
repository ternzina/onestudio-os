"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AdminLanguageSwitcher from "@/components/i18n/AdminLanguageSwitcher";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import { supabase } from "@/lib/supabase";

type BusinessType =
  | "photo_studio"
  | "beauty_salon"
  | "school"
  | "venue"
  | "creative_service"
  | "other";
type ServiceKind = "appointment" | "rental" | "class" | "event" | "membership" | "other";
type ResourceKind = "staff" | "space" | "equipment" | "seat" | "asset" | "other";
type PricingModel = "fixed" | "per_hour" | "per_person" | "free" | "quote";
type OptionalModule = "media" | "portfolio" | "payments" | "notifications" | "documents" | "analytics";

type LaunchForm = {
  business_name: string;
  business_type: BusinessType;
  timezone: string;
  locale: string;
  currency: string;
  country_code: string;
  email: string;
  phone: string;
  address: string;
  service_title: string;
  service_kind: ServiceKind;
  pricing_model: PricingModel;
  price: string;
  duration_minutes: string;
  service_capacity: string;
  resource_name: string;
  resource_kind: ResourceKind;
  resource_capacity: string;
  open_time: string;
  close_time: string;
  work_days: number[];
  enabled_modules: OptionalModule[];
};

const currencies = ["EUR", "USD", "GBP", "PLN", "UAH", "CAD", "AUD"] as const;
const requiredModules = ["core", "catalog", "scheduling", "crm"] as const;
const optionalModules: readonly OptionalModule[] = [
  "media",
  "portfolio",
  "payments",
  "notifications",
  "documents",
  "analytics",
];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const localePattern = /^[a-z]{2,3}(-[a-z]{2})?$/;

const presets: Record<BusinessType, Pick<
  LaunchForm,
  "service_title" | "service_kind" | "service_capacity" | "resource_name" | "resource_kind" | "resource_capacity"
>> = {
  photo_studio: {
    service_title: "Portrait session",
    service_kind: "appointment",
    service_capacity: "6",
    resource_name: "Main studio",
    resource_kind: "space",
    resource_capacity: "12",
  },
  beauty_salon: {
    service_title: "Beauty appointment",
    service_kind: "appointment",
    service_capacity: "1",
    resource_name: "Specialist",
    resource_kind: "staff",
    resource_capacity: "1",
  },
  school: {
    service_title: "Group class",
    service_kind: "class",
    service_capacity: "12",
    resource_name: "Classroom",
    resource_kind: "space",
    resource_capacity: "12",
  },
  venue: {
    service_title: "Event package",
    service_kind: "event",
    service_capacity: "50",
    resource_name: "Main hall",
    resource_kind: "space",
    resource_capacity: "50",
  },
  creative_service: {
    service_title: "Creative session",
    service_kind: "appointment",
    service_capacity: "1",
    resource_name: "Specialist",
    resource_kind: "staff",
    resource_capacity: "1",
  },
  other: {
    service_title: "Main service",
    service_kind: "appointment",
    service_capacity: "1",
    resource_name: "Primary resource",
    resource_kind: "other",
    resource_capacity: "1",
  },
};

function detectedTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function detectedLocale() {
  if (typeof navigator === "undefined") return "ru";
  const browserLocale = navigator.language.toLowerCase().split("-")[0] || "ru";
  return browserLocale === "en" ? "en" : "ru";
}

function initialForm(): LaunchForm {
  const locale = detectedLocale();
  const defaultPreset = locale === "ru"
    ? { ...presets.other, service_title: "Основная услуга", resource_name: "Основной ресурс" }
    : presets.other;
  return {
    business_name: "",
    business_type: "other",
    timezone: detectedTimezone(),
    locale,
    currency: "EUR",
    country_code: "UA",
    email: "",
    phone: "",
    address: "",
    ...defaultPreset,
    pricing_model: "fixed",
    price: "0",
    duration_minutes: "60",
    open_time: "09:00",
    close_time: "18:00",
    work_days: [1, 2, 3, 4, 5],
    enabled_modules: [...optionalModules],
  };
}

export default function AdminBootstrapPage() {
  const router = useRouter();
  const { t } = useAdminI18n();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<LaunchForm>(initialForm);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const steps = [
    t("Business"),
    t("Contacts"),
    t("First offer"),
    t("Modules"),
  ];

  const businessTypeLabels: Record<BusinessType, string> = {
    photo_studio: t("Photo studio"),
    beauty_salon: t("Beauty salon"),
    school: t("School or classes"),
    venue: t("Event venue"),
    creative_service: t("Creative service"),
    other: t("Other business"),
  };
  const serviceKindLabels: Record<ServiceKind, string> = {
    appointment: t("Appointment"),
    rental: t("Rental"),
    class: t("Class"),
    event: t("Event"),
    membership: t("Membership"),
    other: t("Other"),
  };
  const resourceKindLabels: Record<ResourceKind, string> = {
    staff: t("Staff resource"),
    space: t("Space"),
    equipment: t("Equipment"),
    seat: t("Seat"),
    asset: t("Asset"),
    other: t("Other"),
  };
  const pricingLabels: Record<PricingModel, string> = {
    fixed: t("Fixed"),
    per_hour: t("Per hour"),
    per_person: t("Per person"),
    free: t("Free"),
    quote: t("Quote"),
  };
  const moduleLabels: Record<OptionalModule, { title: string; description: string }> = {
    media: { title: t("Media library"), description: t("Store reusable photos and videos.") },
    portfolio: { title: t("Portfolio"), description: t("Publish selected work and project categories.") },
    payments: { title: t("Payments"), description: t("Track balances, payments and refunds.") },
    notifications: { title: t("Email and reminders"), description: t("Prepare confirmations, reminders and delivery history.") },
    documents: { title: t("Documents"), description: t("Create templates, contracts and generated documents.") },
    analytics: { title: t("Analytics"), description: t("See bookings, clients, hours and money by period.") },
  };
  const localizedPresets: Record<BusinessType, Pick<
    LaunchForm,
    "service_title" | "service_kind" | "service_capacity" | "resource_name" | "resource_kind" | "resource_capacity"
  >> = {
    photo_studio: { ...presets.photo_studio, service_title: t("Portrait session"), resource_name: t("Main studio") },
    beauty_salon: { ...presets.beauty_salon, service_title: t("Beauty appointment"), resource_name: t("Specialist") },
    school: { ...presets.school, service_title: t("Group class"), resource_name: t("Classroom") },
    venue: { ...presets.venue, service_title: t("Event package"), resource_name: t("Main hall") },
    creative_service: { ...presets.creative_service, service_title: t("Creative session"), resource_name: t("Specialist") },
    other: { ...presets.other, service_title: t("Main service"), resource_name: t("Primary resource") },
  };
  const dayLabels = [
    t("Sunday"),
    t("Monday"),
    t("Tuesday"),
    t("Wednesday"),
    t("Thursday"),
    t("Friday"),
    t("Saturday"),
  ];

  const enabledCount = useMemo(() => {
    const expanded = new Set<string>([...requiredModules, ...form.enabled_modules]);
    if (expanded.has("portfolio")) expanded.add("media");
    if (expanded.has("notifications")) expanded.add("payments");
    if (expanded.has("documents")) {
      expanded.add("payments");
      expanded.add("notifications");
    }
    return expanded.size;
  }, [form.enabled_modules]);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email?.trim().toLowerCase();
      if (email) {
        setForm((current) => current.email ? current : { ...current, email });
      }
    });
  }, []);

  function update<K extends keyof LaunchForm>(key: K, value: LaunchForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function chooseBusinessType(value: BusinessType) {
    setForm((current) => ({
      ...current,
      business_type: value,
      ...localizedPresets[value],
    }));
    setMessage("");
  }

  function toggleWorkDay(day: number) {
    setForm((current) => ({
      ...current,
      work_days: current.work_days.includes(day)
        ? current.work_days.filter((item) => item !== day)
        : [...current.work_days, day].sort(),
    }));
    setMessage("");
  }

  function toggleModule(module: OptionalModule) {
    setForm((current) => ({
      ...current,
      enabled_modules: current.enabled_modules.includes(module)
        ? current.enabled_modules.filter((item) => item !== module)
        : [...current.enabled_modules, module],
    }));
    setMessage("");
  }

  function validateCurrentStep() {
    if (step === 0) {
      if (form.business_name.trim().length < 2 || form.business_name.trim().length > 120) {
        return t("Enter a workspace name from 2 to 120 characters.");
      }
      if (!localePattern.test(form.locale.trim().toLowerCase())) {
        return t("Use a language code such as en, uk, pl or de.");
      }
      if (!/^[A-Z]{3}$/.test(form.currency.trim().toUpperCase())) {
        return t("Use a three-letter currency code such as EUR or UAH.");
      }
      if (!/^[A-Z]{2}$/.test(form.country_code.trim().toUpperCase())) {
        return t("Use a two-letter country code such as UA or PL.");
      }
    }
    if (step === 1 && !emailPattern.test(form.email.trim())) {
      return t("Enter a valid business email.");
    }
    if (step === 2) {
      const duration = Number(form.duration_minutes);
      const serviceCapacity = Number(form.service_capacity);
      const resourceCapacity = Number(form.resource_capacity);
      const price = Number(form.price);
      if (!form.service_title.trim() || !form.resource_name.trim()) {
        return t("Name the first service and resource.");
      }
      if (!Number.isInteger(duration) || duration < 15 || duration > 1440) {
        return t("Duration must be between 15 and 1440 minutes.");
      }
      if (!Number.isInteger(serviceCapacity) || serviceCapacity < 1
        || !Number.isInteger(resourceCapacity) || resourceCapacity < 1) {
        return t("Capacity must be at least one.");
      }
      if (!Number.isFinite(price) || price < 0 || Math.round(price * 100) !== price * 100) {
        return t("Enter a valid price with no more than two decimal places.");
      }
      if (form.open_time >= form.close_time) {
        return t("Opening time must be earlier than closing time.");
      }
      if (form.work_days.length === 0) {
        return t("Choose at least one working day.");
      }
    }
    return "";
  }

  function goNext() {
    const error = validateCurrentStep();
    if (error) {
      setMessage(error);
      return;
    }
    setStep((current) => Math.min(current + 1, steps.length - 1));
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validateCurrentStep();
    if (error) {
      setMessage(error);
      return;
    }

    setSubmitting(true);
    setMessage("");

    const { error: launchError } = await supabase.rpc("launch_first_workspace", {
      p_setup: {
        business_name: form.business_name.trim(),
        business_type: form.business_type,
        timezone: form.timezone.trim(),
        locale: form.locale.trim().toLowerCase(),
        currency: form.currency.trim().toUpperCase(),
        country_code: form.country_code.trim().toUpperCase(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        service_title: form.service_title.trim(),
        service_kind: form.service_kind,
        pricing_model: form.pricing_model,
        price_minor: Math.round(Number(form.price) * 100),
        duration_minutes: Number(form.duration_minutes),
        service_capacity: Number(form.service_capacity),
        resource_name: form.resource_name.trim(),
        resource_kind: form.resource_kind,
        resource_capacity: Number(form.resource_capacity),
        open_time: form.open_time,
        close_time: form.close_time,
        work_days: form.work_days,
        enabled_modules: form.enabled_modules,
      },
    });

    if (launchError) {
      const readableMessages: Record<string, string> = {
        workspace_name_invalid: t("Enter a workspace name from 2 to 120 characters."),
        workspace_timezone_invalid: t("Choose a valid IANA timezone, for example Europe/Kyiv."),
        workspace_locale_invalid: t("Use a language code such as en, uk, pl or de."),
        workspace_currency_invalid: t("Use a three-letter currency code such as EUR or UAH."),
        country_code_invalid: t("Use a two-letter country code such as UA or PL."),
        business_email_invalid: t("Enter a valid business email."),
        work_days_invalid: t("Choose at least one working day."),
        bootstrap_already_completed: t("The first owner has already been created."),
        account_already_has_workspace: t("This account already belongs to a workspace."),
      };
      setMessage(readableMessages[launchError.message] || launchError.message || t("Could not finish setup."));
      setSubmitting(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen bg-[#0b0d12] px-5 py-8 text-[#f7f5ef] sm:px-8 sm:py-12">
      <div className="absolute right-6 top-6"><AdminLanguageSwitcher theme="dark" /></div>
      <section className="mx-auto w-full max-w-5xl rounded-[36px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">{t("Client Launch 1.0")}</p>
        <div className="mt-5 grid gap-7 lg:grid-cols-[1fr_0.7fr] lg:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">{t("Launch your workspace.")}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
              {t("Set up the business, first bookable offer and essential modules once. You can refine every detail later in the admin.")}
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">{t("Launch progress")}</p>
            <p className="mt-2 text-lg font-semibold">{t("Step {current} of {total}", { current: step + 1, total: steps.length })}</p>
            <p className="mt-1 text-sm text-[#d8b36a]">{steps[step]}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-4 gap-2">
          {steps.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => index < step && setStep(index)}
              disabled={index >= step}
              className={`rounded-full px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] transition sm:text-xs ${
                index === step
                  ? "bg-[#f7f5ef] text-[#0b0d12]"
                  : index < step
                    ? "bg-[#d8b36a]/20 text-[#e7ca92]"
                    : "bg-white/[0.06] text-white/35"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
          {step === 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t("Business name")} wide>
                <input required minLength={2} maxLength={120} autoFocus value={form.business_name} onChange={(event) => update("business_name", event.target.value)} className={inputClass} />
              </Field>
              <Field label={t("Business type")} wide>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(Object.keys(businessTypeLabels) as BusinessType[]).map((type) => (
                    <ChoiceButton key={type} selected={form.business_type === type} onClick={() => chooseBusinessType(type)}>{businessTypeLabels[type]}</ChoiceButton>
                  ))}
                </div>
              </Field>
              <Field label={t("Timezone")}>
                <input required value={form.timezone} onChange={(event) => update("timezone", event.target.value)} placeholder="Europe/Kyiv" className={inputClass} />
              </Field>
              <Field label={t("Default language")}>
                <input required minLength={2} maxLength={6} value={form.locale} onChange={(event) => update("locale", event.target.value.toLowerCase())} placeholder="ru" className={inputClass} />
              </Field>
              <Field label={t("Currency")}>
                <input required list="launch-currencies" minLength={3} maxLength={3} value={form.currency} onChange={(event) => update("currency", event.target.value.toUpperCase())} className={inputClass} />
                <datalist id="launch-currencies">{currencies.map((item) => <option key={item} value={item} />)}</datalist>
              </Field>
              <Field label={t("Country code")}>
                <input required minLength={2} maxLength={2} value={form.country_code} onChange={(event) => update("country_code", event.target.value.toUpperCase())} placeholder="UA" className={inputClass} />
              </Field>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t("Business email")} wide>
                <input required type="email" autoFocus value={form.email} onChange={(event) => update("email", event.target.value)} className={inputClass} />
              </Field>
              <Field label={t("Phone")}>
                <input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+380…" className={inputClass} />
              </Field>
              <Field label={t("Address")}>
                <input value={form.address} onChange={(event) => update("address", event.target.value)} className={inputClass} />
              </Field>
              <div className="sm:col-span-2 rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm leading-6 text-white/55">
                {t("These contacts become the canonical company details used by documents, email and future invoices.")}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-7">
              <section className="rounded-[28px] border border-white/10 bg-black/20 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d8b36a]">{t("First bookable offer")}</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label={t("Service name")} wide>
                    <input required autoFocus value={form.service_title} onChange={(event) => update("service_title", event.target.value)} className={inputClass} />
                  </Field>
                  <Field label={t("Service type")}>
                    <select value={form.service_kind} onChange={(event) => update("service_kind", event.target.value as ServiceKind)} className={inputClass}>
                      {(Object.keys(serviceKindLabels) as ServiceKind[]).map((kind) => <option key={kind} value={kind}>{serviceKindLabels[kind]}</option>)}
                    </select>
                  </Field>
                  <Field label={t("Pricing model")}>
                    <select value={form.pricing_model} onChange={(event) => update("pricing_model", event.target.value as PricingModel)} className={inputClass}>
                      {(Object.keys(pricingLabels) as PricingModel[]).map((model) => <option key={model} value={model}>{pricingLabels[model]}</option>)}
                    </select>
                  </Field>
                  <Field label={t("Price in {currency}", { currency: form.currency })}>
                    <input type="number" min={0} step="0.01" value={form.price} disabled={form.pricing_model === "free" || form.pricing_model === "quote"} onChange={(event) => update("price", event.target.value)} className={inputClass} />
                  </Field>
                  <Field label={t("Duration, minutes")}>
                    <input type="number" min={15} max={1440} step={15} value={form.duration_minutes} onChange={(event) => update("duration_minutes", event.target.value)} className={inputClass} />
                  </Field>
                  <Field label={t("Maximum guests")}>
                    <input type="number" min={1} value={form.service_capacity} onChange={(event) => update("service_capacity", event.target.value)} className={inputClass} />
                  </Field>
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-black/20 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d8b36a]">{t("Resource and working time")}</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label={t("Resource name")}>
                    <input required value={form.resource_name} onChange={(event) => update("resource_name", event.target.value)} className={inputClass} />
                  </Field>
                  <Field label={t("Resource type")}>
                    <select value={form.resource_kind} onChange={(event) => update("resource_kind", event.target.value as ResourceKind)} className={inputClass}>
                      {(Object.keys(resourceKindLabels) as ResourceKind[]).map((kind) => <option key={kind} value={kind}>{resourceKindLabels[kind]}</option>)}
                    </select>
                  </Field>
                  <Field label={t("Resource capacity")}>
                    <input type="number" min={1} value={form.resource_capacity} onChange={(event) => update("resource_capacity", event.target.value)} className={inputClass} />
                  </Field>
                  <Field label={t("Opens at")}>
                    <input type="time" value={form.open_time} onChange={(event) => update("open_time", event.target.value)} className={inputClass} />
                  </Field>
                  <Field label={t("Closes at")}>
                    <input type="time" value={form.close_time} onChange={(event) => update("close_time", event.target.value)} className={inputClass} />
                  </Field>
                  <Field label={t("Working days")} wide>
                    <div className="flex flex-wrap gap-2">
                      {dayLabels.map((label, day) => (
                        <ChoiceButton key={label} selected={form.work_days.includes(day)} onClick={() => toggleWorkDay(day)}>{label.slice(0, 3)}</ChoiceButton>
                      ))}
                    </div>
                  </Field>
                </div>
              </section>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-5">
              <div className="rounded-[24px] border border-[#d8b36a]/25 bg-[#d8b36a]/10 p-5">
                <p className="text-sm font-semibold">{t("Core operations are always included.")}</p>
                <p className="mt-2 text-sm leading-6 text-white/55">{t("Workspace, catalog, scheduling and CRM form the protected operating foundation.")}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {optionalModules.map((module) => {
                  const selected = form.enabled_modules.includes(module);
                  return (
                    <button
                      key={module}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleModule(module)}
                      className={`rounded-[24px] border p-5 text-left transition ${
                        selected ? "border-[#d8b36a]/50 bg-[#d8b36a]/12" : "border-white/10 bg-black/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">{moduleLabels[module].title}</p>
                          <p className="mt-2 text-sm leading-6 text-white/50">{moduleLabels[module].description}</p>
                        </div>
                        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${selected ? "border-[#d8b36a] bg-[#d8b36a] text-[#17191f]" : "border-white/25 text-transparent"}`}>✓</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm text-white/60">
                {t("{count} of 10 modules will be enabled.", { count: enabledCount })}{" "}
                {t("Required dependencies are added automatically.")}
              </div>
            </div>
          ) : null}

          {message ? <div className="mt-6 rounded-2xl border border-red-300/15 bg-red-500/10 px-4 py-3 text-sm text-red-100">{message}</div> : null}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0 || submitting}
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold disabled:opacity-30"
            >
              {t("Back")}
            </button>
            {step < steps.length - 1 ? (
              <button type="button" onClick={goNext} className="rounded-full bg-[#f7f5ef] px-7 py-3.5 text-sm font-semibold text-[#0b0d12]">
                {t("Continue")}
              </button>
            ) : (
              <button type="submit" disabled={submitting} className="rounded-full bg-[#f7f5ef] px-7 py-3.5 text-sm font-semibold text-[#0b0d12] disabled:opacity-60">
                {submitting ? t("Launching workspace...") : t("Launch workspace")}
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}

const inputClass = "mt-2 w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3.5 text-[#f7f5ef] outline-none transition focus:border-[#d8b36a] disabled:cursor-not-allowed disabled:opacity-45";

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <fieldset className={wide ? "sm:col-span-2" : ""}>
      <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">{label}</legend>
      {children}
    </fieldset>
  );
}

function ChoiceButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
        selected ? "border-[#d8b36a] bg-[#d8b36a]/15 text-[#f7f5ef]" : "border-white/10 bg-black/20 text-white/55"
      }`}
    >
      {children}
    </button>
  );
}
