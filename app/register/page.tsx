"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminLanguageSwitcher from "@/components/i18n/AdminLanguageSwitcher";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useAdminI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(true);
  const [bootstrapOpen, setBootstrapOpen] = useState(false);
  const [selfService, setSelfService] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fromConfigurator = new URLSearchParams(window.location.search).get("source") === "configurator"
      && Boolean(window.localStorage.getItem("onestudio-config:pending"));
    setSelfService(fromConfigurator);
    void supabase.rpc("admin_bootstrap_available").then(({ data, error }) => {
      setBootstrapOpen(!error && data === true);
      setChecking(false);
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage(t("Passwords do not match."));
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: name.trim(),
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    if (data.session) {
      router.replace(selfService ? "/launch" : "/admin/bootstrap");
      router.refresh();
      return;
    }

    setMessage(selfService
      ? "Подтвердите email, затем войдите — ваша настройка сохранена в этом браузере."
      : t("Confirm your email, then sign in to finish the first workspace setup."));
    setSubmitting(false);
  }

  if (checking) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[#0b0d12] text-[#f7f5ef]">
        <div className="absolute right-6 top-6"><AdminLanguageSwitcher theme="dark" /></div>
        <p className="text-sm text-white/60">{t("Checking installation status...")}</p>
      </main>
    );
  }

  if (!bootstrapOpen && !selfService) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[#0b0d12] px-5 text-[#f7f5ef]">
        <div className="absolute right-6 top-6"><AdminLanguageSwitcher theme="dark" /></div>
        <section className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.06] p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">OneStudio OS</p>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.05em]">{t("Owner account already exists")}</h1>
          <p className="mt-4 text-sm leading-6 text-white/60">
            {t("Public first-owner registration closes automatically after installation setup.")}
          </p>
          <Link href="/login" className="mt-7 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0b0d12]">
            {t("Go to sign in")}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0d12] px-5 py-12 text-[#f7f5ef]">
      <section className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.06] p-7 shadow-2xl sm:p-9">
        <div className="absolute right-6 top-6"><AdminLanguageSwitcher theme="dark" /></div>
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">
          OneStudio OS
        </Link>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em]">
          {selfService ? "Создайте свой проект" : t("Create the first owner")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#b9b5ab]">
          {selfService
            ? "После регистрации мы создадим отдельный сайт и админку по выбранной конфигурации."
            : t("This one-time account becomes the installation owner. The setup door closes after the workspace is created.")}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#b9b5ab]">{t("Your name")}</span>
            <input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 outline-none focus:border-[#d8b36a]" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#b9b5ab]">{t("Email")}</span>
            <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 outline-none focus:border-[#d8b36a]" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#b9b5ab]">{t("Password")}</span>
            <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 outline-none focus:border-[#d8b36a]" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#b9b5ab]">{t("Repeat password")}</span>
            <input type="password" required minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 outline-none focus:border-[#d8b36a]" />
          </label>

          {message ? <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-[#e7e2d7]">{message}</div> : null}

          <button type="submit" disabled={submitting} className="w-full rounded-full bg-[#f7f5ef] px-5 py-3.5 text-sm font-semibold text-[#0b0d12] disabled:opacity-60">
            {submitting ? t("Creating account...") : (selfService ? "Продолжить" : t("Create owner account"))}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-[#b9b5ab]">
          {t("Already created it?")} {" "}<Link href="/login" className="font-semibold text-white">{t("Sign in")}</Link>
        </p>
      </section>
    </main>
  );
}
