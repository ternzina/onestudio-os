"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminLanguageSwitcher from "@/components/i18n/AdminLanguageSwitcher";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";

type AccessState = "bootstrap_required" | "ready" | "denied" | "signed_out";

type AccessRow = {
  access_state: AccessState;
};

function readSafeNextPath() {
  if (typeof window === "undefined") return "/dashboard";

  const value = new URLSearchParams(window.location.search).get("next");

  return value?.startsWith("/admin") || value === "/launch" || value === "/dashboard"
    ? value
    : "/dashboard";
}

function friendlyAuthMessage(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Неверный email или пароль. Проверьте данные или восстановите пароль.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Email ещё не подтверждён. Откройте письмо от OneStudio OS или зарегистрируйтесь повторно.";
  }

  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Слишком много попыток подряд. Подождите несколько минут и повторите вход.";
  }

  return value;
}

function FeatureMark({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-medium text-white/70 backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-[#d8b36a] shadow-[0_0_18px_rgba(216,179,106,0.9)]" />
      {children}
    </span>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { t } = useAdminI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [bootstrapOpen, setBootstrapOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [nextPath, setNextPath] = useState("/dashboard");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(readSafeNextPath());

    if (params.get("error") === "admin_access") {
      setMessage(t("This account has no workspace access yet."));
    } else if (params.get("error") === "oauth_callback") {
      setMessage("Не удалось завершить вход. Попробуйте ещё раз.");
    }

    void supabase
      .rpc("admin_bootstrap_available")
      .then(({ data }) => setBootstrapOpen(data === true));
  }, [t]);

  async function routeAfterSignIn() {
    const { data, error } = await supabase.rpc("get_admin_access_state");
    const access = !error && Array.isArray(data)
      ? (data[0] as AccessRow | undefined)
      : undefined;

    if (access?.access_state === "bootstrap_required") {
      router.replace("/admin/bootstrap");
      router.refresh();
      return;
    }

    if (access?.access_state === "ready") {
      router.replace(nextPath);
      router.refresh();
      return;
    }

    if (nextPath === "/launch") {
      router.replace("/launch");
      router.refresh();
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data.user) {
      setMessage(friendlyAuthMessage(error?.message || t("Could not sign in.")));
      setIsSubmitting(false);
      return;
    }

    await routeAfterSignIn();
  }

  async function handlePasswordReset() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setMessage(t("Enter your email first."));
      return;
    }

    setMessage("");
    setIsResetting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const result = (await response.json()) as { message?: string };
      setMessage(result.message || t("Check your inbox."));
    } catch {
      setMessage(t("Password recovery is temporarily unavailable."));
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b10] text-[#f7f5ef]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-28 h-[440px] w-[440px] rounded-full bg-[#4338ca]/18 blur-[120px]" />
        <div className="absolute right-[-180px] top-[8%] h-[520px] w-[520px] rounded-full bg-[#d8b36a]/14 blur-[140px]" />
        <div className="absolute bottom-[-220px] left-[38%] h-[500px] w-[500px] rounded-full bg-[#0ea5e9]/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      </div>

      <div className="absolute right-5 top-5 z-20 sm:right-8 sm:top-7">
        <AdminLanguageSwitcher theme="dark" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1280px] items-center gap-8 px-5 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 xl:gap-16">
        <section className="hidden lg:block">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] text-white"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[#d8b36a]/35 bg-[#d8b36a]/10 text-[#d8b36a] shadow-[0_0_40px_rgba(216,179,106,0.12)]">
              OS
            </span>
            OneStudio OS
          </Link>

          <div className="mt-14 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">
              Ваш бизнес. Один центр управления.
            </p>
            <h2 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-white xl:text-6xl">
              Вернитесь туда, где всё уже собрано.
            </h2>
            <p className="mt-7 max-w-lg text-base leading-8 text-white/58">
              Сайты, бронирования, клиенты, календарь и материалы работают как одна система, а не как ящик с проводами.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <FeatureMark>До 3 сайтов</FeatureMark>
              <FeatureMark>Google Calendar</FeatureMark>
              <FeatureMark>CRM и бронирования</FeatureMark>
            </div>
          </div>

          <div className="mt-14 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["Сайт", "Редактор и публикация"],
              ["Календарь", "Свободные даты"],
              ["Клиенты", "История и контакты"],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-[26px] border border-white/9 bg-white/[0.045] p-5 backdrop-blur-xl"
              >
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-2 text-xs leading-5 text-white/45">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[520px]">
          <div className="rounded-[34px] border border-white/12 bg-[#11151d]/88 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
            <div className="lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-white"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#d8b36a]/35 bg-[#d8b36a]/10 text-[11px] text-[#d8b36a]">
                  OS
                </span>
                OneStudio OS
              </Link>
            </div>

            <div className="mt-4 sm:mt-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b36a]">
                Личный кабинет
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                {t("Sign in")}
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/55">
                Войдите, чтобы продолжить работу с сайтами, бронированиями и клиентами.
              </p>
            </div>

            <div className="mt-8">
              <SocialAuthButtons nextPath={nextPath} />
            </div>

            <div className="my-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.17em] text-white/28">
              <span className="h-px flex-1 bg-white/10" />
              <span>или по email</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-white/62">{t("Email")}</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="h-[52px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-[15px] text-white outline-none transition placeholder:text-white/22 hover:border-white/18 focus:border-[#d8b36a]/75 focus:bg-black/28 focus:ring-4 focus:ring-[#d8b36a]/8"
                />
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-white/62">{t("Password")}</span>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={isResetting}
                    className="text-xs font-semibold text-[#d8b36a] transition hover:text-[#efd08f] disabled:opacity-50"
                  >
                    {isResetting ? t("Sending...") : t("Forgot password?")}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Минимум 8 символов"
                    className="h-[52px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 pr-24 text-[15px] text-white outline-none transition placeholder:text-white/22 hover:border-white/18 focus:border-[#d8b36a]/75 focus:bg-black/28 focus:ring-4 focus:ring-[#d8b36a]/8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-0 px-4 text-xs font-semibold text-white/42 transition hover:text-white/75"
                  >
                    {showPassword ? "Скрыть" : "Показать"}
                  </button>
                </div>
              </label>

              {message ? (
                <div
                  role="status"
                  className="rounded-2xl border border-[#d8b36a]/20 bg-[#d8b36a]/8 px-4 py-3 text-sm leading-6 text-[#f2eadb]"
                >
                  {message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex h-[52px] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#f7f5ef] px-5 text-sm font-semibold text-[#0b0d12] transition hover:bg-white hover:shadow-[0_16px_45px_rgba(255,255,255,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{isSubmitting ? t("Signing in...") : t("Sign in")}</span>
                <span className="absolute right-5 transition-transform group-hover:translate-x-1">→</span>
              </button>
            </form>

            <div className="mt-7 rounded-[24px] border border-white/8 bg-white/[0.035] px-5 py-4 text-center">
              <p className="text-sm text-white/52">
                Нет аккаунта?{" "}
                <Link
                  href={nextPath === "/launch" ? "/register?source=configurator" : "/register"}
                  className="font-semibold text-white underline decoration-[#d8b36a]/55 underline-offset-4 transition hover:text-[#efd08f]"
                >
                  Зарегистрироваться
                </Link>
              </p>
              {bootstrapOpen ? (
                <p className="mt-2 text-xs text-white/34">
                  Первая установка также создаётся через страницу регистрации.
                </p>
              ) : null}
            </div>
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-white/28">
            Продолжая, вы соглашаетесь с условиями использования и политикой конфиденциальности.
          </p>
        </section>
      </div>
    </main>
  );
}
