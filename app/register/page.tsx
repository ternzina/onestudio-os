"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState, type ReactNode } from "react";
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

function registrationNextPath(selfService: boolean, bootstrapOpen: boolean) {
  if (selfService) return "/launch";
  if (bootstrapOpen) return "/admin/bootstrap";
  return "/dashboard";
}

function FeatureRow({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm leading-6 text-white/62">
      <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#d8b36a]/12 text-[11px] font-bold text-[#d8b36a]">
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
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
  const [showPassword, setShowPassword] = useState(false);

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

      // Never place a second registration form over an existing session.
      // A saved configurator must belong to the account that is already signed in.
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
    const nextPath = registrationNextPath(selfService, bootstrapOpen);

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
        : selfService
          ? "Письмо отправлено. После подтверждения мы создадим выбранный демо-сайт."
          : "Письмо отправлено. После подтверждения откроется ваш личный кабинет.",
    );
    setSubmitting(false);
  }

  async function resendConfirmation() {
    if (!confirmationEmail) return;

    setResending(true);
    setMessage("");
    const nextPath = registrationNextPath(selfService, bootstrapOpen);
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
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b10] text-[#f7f5ef]">
        <div className="absolute right-5 top-5 sm:right-8 sm:top-7">
          <AdminLanguageSwitcher theme="dark" />
        </div>
        <div className="flex items-center gap-3 text-sm text-white/55">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#d8b36a]" />
          {t("Checking installation status...")}
        </div>
      </main>
    );
  }

  const nextPath = registrationNextPath(selfService, bootstrapOpen);
  const directClientRegistration = !selfService && !bootstrapOpen;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b10] text-[#f7f5ef]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-[16%] h-[520px] w-[520px] rounded-full bg-[#0ea5e9]/11 blur-[145px]" />
        <div className="absolute right-[-170px] top-[-120px] h-[540px] w-[540px] rounded-full bg-[#d8b36a]/15 blur-[145px]" />
        <div className="absolute bottom-[-220px] left-[42%] h-[520px] w-[520px] rounded-full bg-[#7c3aed]/13 blur-[155px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.024)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.024)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_86%)]" />
      </div>

      <div className="absolute right-5 top-5 z-20 sm:right-8 sm:top-7">
        <AdminLanguageSwitcher theme="dark" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1320px] items-center gap-8 px-5 py-24 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 xl:gap-16">
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

          <div className="mt-14 max-w-[520px]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">
              {selfService ? "Ваш проект почти готов" : "Новый рабочий кабинет"}
            </p>
            <h2 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-white xl:text-6xl">
              {selfService
                ? "Сохраните выбранный дизайн за своим аккаунтом."
                : "Начните с аккаунта, а сайт выберете в удобном темпе."}
            </h2>
            <p className="mt-7 text-base leading-8 text-white/58">
              OneStudio OS объединяет сайт, календарь, бронирования, клиентов и материалы в одном спокойном рабочем пространстве.
            </p>

            <ul className="mt-9 space-y-4">
              <FeatureRow>Один аккаунт управляет всеми вашими сайтами.</FeatureRow>
              <FeatureRow>До трёх активных сайтов в одном рабочем пространстве.</FeatureRow>
              <FeatureRow>Google Calendar, CRM и бронирования подключаются к каждому бизнесу отдельно.</FeatureRow>
            </ul>

            <div className="mt-12 rounded-[30px] border border-white/9 bg-white/[0.045] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/38">Следующий шаг</p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {selfService ? "Подтвердить email и создать демо" : "Подтвердить email и открыть кабинет"}
                  </p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-lg text-[#0b0d12]">→</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[620px]">
          <div className="rounded-[36px] border border-white/12 bg-[#11151d]/88 p-5 shadow-[0_42px_130px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-8 lg:p-9">
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
                {confirmationPending
                  ? "Остался один шаг"
                  : selfService
                    ? "Создание проекта"
                    : bootstrapOpen
                      ? "Первая установка"
                      : "Регистрация"}
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                {confirmationPending
                  ? "Подтвердите email"
                  : selfService
                    ? "Создайте свой проект"
                    : bootstrapOpen
                      ? t("Create the first owner")
                      : "Создайте аккаунт"}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/55">
                {confirmationPending
                  ? "Мы не создаём сайт и не открываем кабинет, пока адрес не подтверждён."
                  : selfService
                    ? "Настройки демо уже сохранены в этом браузере. После подтверждения они станут вашим сайтом."
                    : bootstrapOpen
                      ? t("This one-time account becomes the installation owner. The setup door closes after the workspace is created.")
                      : "Зарегистрируйтесь напрямую. После подтверждения email откроется личный кабинет, где можно выбрать демо и создать сайт."}
              </p>
            </div>

            {confirmationPending ? (
              <div className="mt-8 space-y-4">
                <div className="rounded-[24px] border border-[#d8b36a]/25 bg-[#d8b36a]/8 p-5">
                  <div className="flex items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#d8b36a]/14 text-xl text-[#d8b36a]">✉</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d8b36a]">Письмо отправлено</p>
                      <p className="mt-2 break-all text-sm font-semibold text-white">{confirmationEmail}</p>
                      <p className="mt-2 text-xs leading-5 text-white/46">Ссылка подтверждения действует ограниченное время.</p>
                    </div>
                  </div>
                </div>

                {message ? (
                  <div role="status" className="rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm leading-6 text-[#eee8dc]">
                    {message}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={resendConfirmation}
                  disabled={resending}
                  className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-[#f7f5ef] px-5 text-sm font-semibold text-[#0b0d12] transition hover:bg-white hover:shadow-[0_16px_45px_rgba(255,255,255,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resending ? "Отправляем письмо…" : "Отправить письмо ещё раз"}
                </button>

                <Link
                  href={`/login?next=${encodeURIComponent(nextPath)}`}
                  className="flex h-[52px] w-full items-center justify-center rounded-2xl border border-white/12 bg-white/[0.035] px-5 text-sm font-semibold text-white transition hover:border-white/22 hover:bg-white/[0.065]"
                >
                  Уже подтвердили? Войти
                </Link>

                <button
                  type="button"
                  onClick={resetConfirmation}
                  className="w-full px-5 py-2 text-sm font-semibold text-white/42 transition hover:text-white/75"
                >
                  Использовать другой email
                </button>
              </div>
            ) : (
              <>
                <div className="mt-8">
                  <SocialAuthButtons nextPath={nextPath} />
                </div>

                <div className="my-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.17em] text-white/28">
                  <span className="h-px flex-1 bg-white/10" />
                  <span>или по email</span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="mb-2 block text-xs font-semibold text-white/62">{t("Your name")}</span>
                      <input
                        required
                        minLength={2}
                        maxLength={100}
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Как к вам обращаться"
                        className="h-[52px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-[15px] text-white outline-none transition placeholder:text-white/22 hover:border-white/18 focus:border-[#d8b36a]/75 focus:bg-black/28 focus:ring-4 focus:ring-[#d8b36a]/8"
                      />
                    </label>

                    <label className="block sm:col-span-2">
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
                      <span className="mb-2 block text-xs font-semibold text-white/62">{t("Password")}</span>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={8}
                          autoComplete="new-password"
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

                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold text-white/62">{t("Repeat password")}</span>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Повторите пароль"
                        className="h-[52px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-[15px] text-white outline-none transition placeholder:text-white/22 hover:border-white/18 focus:border-[#d8b36a]/75 focus:bg-black/28 focus:ring-4 focus:ring-[#d8b36a]/8"
                      />
                    </label>
                  </div>

                  {message ? (
                    <div role="status" className="rounded-2xl border border-[#d8b36a]/20 bg-[#d8b36a]/8 px-4 py-3 text-sm leading-6 text-[#f2eadb]">
                      {message}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="group relative flex h-[52px] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#f7f5ef] px-5 text-sm font-semibold text-[#0b0d12] transition hover:bg-white hover:shadow-[0_16px_45px_rgba(255,255,255,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span>
                      {submitting
                        ? t("Creating account...")
                        : selfService
                          ? "Создать проект"
                          : bootstrapOpen
                            ? t("Create owner account")
                            : "Зарегистрироваться"}
                    </span>
                    <span className="absolute right-5 transition-transform group-hover:translate-x-1">→</span>
                  </button>
                </form>

                <div className="mt-7 rounded-[24px] border border-white/8 bg-white/[0.035] px-5 py-4 text-center">
                  <p className="text-sm text-white/52">
                    Уже есть аккаунт?{" "}
                    <Link
                      href={`/login?next=${encodeURIComponent(nextPath)}`}
                      className="font-semibold text-white underline decoration-[#d8b36a]/55 underline-offset-4 transition hover:text-[#efd08f]"
                    >
                      Войти
                    </Link>
                  </p>
                  {directClientRegistration ? (
                    <p className="mt-2 text-xs text-white/34">
                      Демо можно выбрать после входа в личный кабинет.
                    </p>
                  ) : null}
                </div>
              </>
            )}
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-white/28">
            Создавая аккаунт, вы соглашаетесь с условиями использования и политикой конфиденциальности.
          </p>
        </section>
      </div>
    </main>
  );
}
