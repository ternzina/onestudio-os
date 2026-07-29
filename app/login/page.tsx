"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
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
  if (typeof window === "undefined") return "/admin";
  const value = new URLSearchParams(window.location.search).get("next");
  return value?.startsWith("/admin") || value === "/launch" ? value : "/admin";
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
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
      router.replace(readSafeNextPath());
      router.refresh();
      return;
    }

    if (readSafeNextPath() === "/launch") {
      router.replace("/launch");
      router.refresh();
      return;
    }

    setMessage(t("This account has no workspace access yet."));
    setIsSubmitting(false);
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
      setMessage(error?.message || t("Could not sign in."));
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
    <main className="flex min-h-screen items-center justify-center bg-[#0b0d12] px-5 py-12 text-[#f7f5ef]">
      <section className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-xl sm:p-9">
        <div className="absolute right-6 top-6"><AdminLanguageSwitcher theme="dark" /></div>
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">
          OneStudio OS
        </Link>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em]">{t("Sign in")}</h1>
        <p className="mt-3 text-sm leading-6 text-[#b9b5ab]">
          {t("Enter the protected administration area for your workspace.")}
        </p>

        <div className="mt-8">
          <SocialAuthButtons nextPath={readSafeNextPath()} />
        </div>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-white/35">
          <span className="h-px flex-1 bg-white/10" />
          <span>или по email</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#b9b5ab]">{t("Email")}</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 outline-none transition focus:border-[#d8b36a]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#b9b5ab]">{t("Password")}</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 outline-none transition focus:border-[#d8b36a]"
            />
          </label>

          {message ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-[#e7e2d7]">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-[#f7f5ef] px-5 py-3.5 text-sm font-semibold text-[#0b0d12] transition hover:bg-white disabled:opacity-60"
          >
            {isSubmitting ? t("Signing in...") : t("Sign in")}
          </button>
        </form>

        <button
          type="button"
          onClick={handlePasswordReset}
          disabled={isResetting}
          className="mt-4 w-full text-sm text-[#d8b36a] disabled:opacity-60"
        >
          {isResetting ? t("Sending...") : t("Forgot password?")}
        </button>

        {bootstrapOpen ? (
          <p className="mt-7 text-center text-sm text-[#b9b5ab]">
            {t("First installation?")} {" "}
            <Link href="/register" className="font-semibold text-[#f7f5ef]">
              {t("Create the owner account")}
            </Link>
          </p>
        ) : null}
      </section>
    </main>
  );
}
