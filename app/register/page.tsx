"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminLanguageSwitcher from "@/components/i18n/AdminLanguageSwitcher";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";

type AccessRow = {
  access_state?: "bootstrap_required" | "ready" | "denied" | "signed_out";
};

function authMessage(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Слишком много писем было запрошено подряд. Подождите несколько минут и повторите отправку.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Email ещё не подтверждён. Откройте письмо или отправьте его повторно.";
  }
  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return "Аккаунт с таким email уже существует. Войдите или восстановите пароль.";
  }

  return value;
}

function registrationNextPath(selfService: boolean) {
  return selfService ? "/launch" : "/admin/bootstrap";
}

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
  const [confirmationPending, setConfirmationPending] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let active = true;

    async function initialize() {
      const fromConfigurator =
        new URLSearchParams(window.location.search).get("source") === "configurator" &&
        Boolean(window.localStorage.getItem("onestudio-config:pending"));

      if (!active) return;
      setSelfService(fromConfigurator);

      const { data: authData } = await supabase.auth.getUser();
      if (!active) return;

      // Never show a second registration form on top of an existing session.
      // A saved configurator belongs to the account that is already signed in.
      if (authData.user) {
        if (fromConfigurator) {
          router.replace("/launch");
          router.refresh();
          return;
        }

        const { data: accessData } = await supabase.rpc("get_admin_access_state");
        const access = Array.isArray(accessData)
          ? (accessData[0] as AccessRow | undefined)
          : undefined;

        router.replace(
          access?.access_state === "bootstrap_required"
            ? "/admin/bootstrap"
            : "/dashboard",
        );
        router.refresh();
        return;
      }

      if (fromConfigurator) {
        setChecking(false);
        return;
      }

      const { data, error } = await supabase.rpc("admin_bootstrap_available");
      if (!active) return;
      setBootstrapOpen(!error && data === true);
      setChecking(false);
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage(t("Passwords do not match."));
      return;
    }

    setSubmitting(true);
    const normalizedEmail = email.trim().toLowerCase();
    const nextPath = registrationNextPath(selfService);

    // Protect against a stale authenticated session creating a new demo under
    // the wrong account while another email is being entered in the form.
    const { data: currentAuth } = await supabase.auth.getUser();
    if (currentAuth.user) {
      router.replace(selfService ? "/launch" : "/dashboard");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        data: {
          full_name: name.trim(),
        },
      },
    });

    if (error) {
      setMessage(authMessage(error.message));
      setSubmitting(false);
      return;
    }

    if (data.session) {
      router.replace(nextPath);
      router.refresh();
      return;
    }

    const existingOrHidden =
      Array.isArray(data.user?.identities) && data.user.identities.length === 0;

    setConfirmationEmail(normalizedEmail);
    setConfirmationPending(true);
    setMessage(
      existingOrHidden
        ? "Регистрация с этим email уже начиналась. Отправьте письмо повторно или перейдите ко входу."
        : "Письмо подтверждения отправлено. Откройте его, затем войдите в аккаунт.",
    );
    setSubmitting(false);
  }

  async function resendConfirmation() {
    if (!confirmationEmail) return;

    setResending(true);
    setMessage("");
    const nextPath = registrationNextPath(selfService);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: confirmationEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });

    if (error) {
      setMessage(authMessage(error.message));
    } else {
      setMessage("Новое письмо отправлено. Проверьте также папки «Спам» и «Промоакции».");
    }
    setResending(false);
  }

  function resetConfirmation() {
    setConfirmationPending(false);
    setConfirmationEmail("");
    setMessage("");
    setPassword("");
    setConfirmPassword("");
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

  const nextPath = registrationNextPath(selfService);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0d12] px-5 py-12 text-[#f7f5ef]">
      <section className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.06] p-7 shadow-2xl sm:p-9">
        <div className="absolute right-6 top-6"><AdminLanguageSwitcher theme="dark" /></div>
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">
          OneStudio OS
        </Link>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em]">
          {confirmationPending
            ? "Подтвердите email"
            : selfService
              ? "Создайте свой проект"
              : t("Create the first owner")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#b9b5ab]">
          {confirmationPending
            ? "До подтверждения адреса сайт не будет создан в чужом или случайно оставшемся аккаунте."
            : selfService
              ? "После регистрации мы создадим отдельный сайт и админку по выбранной конфигурации."
              : t("This one-time account becomes the installation owner. The setup door closes after the workspace is created.")}
        </p>

        {confirmationPending ? (
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-[#d8b36a]/30 bg-[#d8b36a]/10 px-4 py-4 text-sm leading-6 text-[#f1eadc]">
              <p className="text-xs uppercase tracking-[0.16em] text-[#d8b36a]">Email регистрации</p>
              <p className="mt-1 break-all font-semibold text-white">{confirmationEmail}</p>
            </div>

            {message ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-[#e7e2d7]">
                {message}
              </div>
            ) : null}

            <button
              type="button"
              onClick={resendConfirmation}
              disabled={resending}
              className="w-full rounded-full bg-[#f7f5ef] px-5 py-3.5 text-sm font-semibold text-[#0b0d12] disabled:opacity-60"
            >
              {resending ? "Отправляем письмо…" : "Отправить письмо ещё раз"}
            </button>

            <Link
              href={`/login?next=${encodeURIComponent(nextPath)}`}
              className="flex w-full items-center justify-center rounded-full border border-white/15 px-5 py-3.5 text-sm font-semibold text-white"
            >
              Уже подтвердили? Войти
            </Link>

            <button
              type="button"
              onClick={resetConfirmation}
              className="w-full px-5 py-2 text-sm font-semibold text-[#b9b5ab]"
            >
              Использовать другой email
            </button>
          </div>
        ) : (
          <>
            <div className="mt-8">
              <SocialAuthButtons nextPath={nextPath} />
            </div>

            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-white/35">
              <span className="h-px flex-1 bg-white/10" />
              <span>или по email</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
              {t("Already created it?")} {" "}<Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-white">{t("Sign in")}</Link>
            </p>
          </>
        )}
      </section>
    </main>
  );
}
