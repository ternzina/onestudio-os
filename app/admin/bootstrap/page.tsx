"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminLanguageSwitcher from "@/components/i18n/AdminLanguageSwitcher";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";

const currencies = ["EUR", "USD", "GBP", "PLN", "UAH", "CAD", "AUD"];

export default function AdminBootstrapPage() {
  const router = useRouter();
  const { t } = useAdminI18n();
  const detectedTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  const detectedLocale = useMemo(() => {
    if (typeof navigator === "undefined") return "ru";
    const browserLocale = navigator.language.toLowerCase().split("-")[0] || "ru";
    return browserLocale === "en" ? "en" : "ru";
  }, []);

  const [name, setName] = useState(() => t("My workspace"));
  const [timezone, setTimezone] = useState(detectedTimezone);
  const [locale, setLocale] = useState(detectedLocale);
  const [currency, setCurrency] = useState("EUR");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTimezone(detectedTimezone);
    setLocale(detectedLocale);
  }, [detectedLocale, detectedTimezone]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);

    const { error } = await supabase.rpc("bootstrap_first_workspace", {
      p_name: name.trim(),
      p_timezone: timezone.trim(),
      p_locale: locale.trim().toLowerCase(),
      p_currency: currency.trim().toUpperCase(),
    });

    if (error) {
      const readableMessages: Record<string, string> = {
        workspace_name_invalid: t("Enter a workspace name from 2 to 120 characters."),
        workspace_timezone_invalid: t("Choose a valid IANA timezone, for example Europe/Kyiv."),
        workspace_locale_invalid: t("Use a language code such as en, uk, pl or de."),
        workspace_currency_invalid: t("Use a three-letter currency code such as EUR or UAH."),
        bootstrap_already_completed: t("The first owner has already been created."),
        account_already_has_workspace: t("This account already belongs to a workspace."),
      };

      setMessage(readableMessages[error.message] || error.message || t("Could not finish setup."));
      setSubmitting(false);
      return;
    }

    router.replace("/admin/workspace");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen bg-[#0b0d12] px-5 py-10 text-[#f7f5ef] sm:px-8 sm:py-16">
      <div className="absolute right-6 top-6"><AdminLanguageSwitcher theme="dark" /></div>
      <section className="mx-auto w-full max-w-3xl rounded-[36px] border border-white/10 bg-white/[0.06] p-7 shadow-2xl sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">{t("Admin Access & Bootstrap 1.0")}</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">{t("Create the first workspace.")}</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
          {t("This one-time step connects your owner account to the stable OneStudio workspace. No client, booking or media data is created here.")}
        </p>

        <form onSubmit={handleSubmit} className="mt-10 grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">{t("Workspace name")}</span>
            <input required minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3.5 outline-none focus:border-[#d8b36a]" />
          </label>

          <label>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">{t("Timezone")}</span>
            <input required value={timezone} onChange={(event) => setTimezone(event.target.value)} placeholder="Europe/Kyiv" className="mt-2 w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3.5 outline-none focus:border-[#d8b36a]" />
          </label>

          <label>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">{t("Default language")}</span>
            <input required minLength={2} maxLength={6} value={locale} onChange={(event) => setLocale(event.target.value)} placeholder="ru" className="mt-2 w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3.5 lowercase outline-none focus:border-[#d8b36a]" />
          </label>

          <label>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">{t("Currency")}</span>
            <input required list="bootstrap-currencies" minLength={3} maxLength={3} value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} className="mt-2 w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3.5 uppercase outline-none focus:border-[#d8b36a]" />
            <datalist id="bootstrap-currencies">
              {currencies.map((item) => <option key={item} value={item} />)}
            </datalist>
          </label>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm leading-6 text-white/55">
            {t("Stable workspace slug:")} <strong className="text-white">main</strong>
          </div>

          {message ? <div className="sm:col-span-2 rounded-2xl border border-red-300/15 bg-red-500/10 px-4 py-3 text-sm text-red-100">{message}</div> : null}

          <div className="sm:col-span-2 mt-2 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-white/45">{t("The first successful setup closes public owner registration automatically.")}</p>
            <button type="submit" disabled={submitting} className="rounded-full bg-[#f7f5ef] px-7 py-3.5 text-sm font-semibold text-[#0b0d12] disabled:opacity-60">
              {submitting ? t("Creating workspace...") : t("Finish setup")}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
