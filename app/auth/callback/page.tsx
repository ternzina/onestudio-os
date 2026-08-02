"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function safeNextPath(value: string | null) {
  return value === "/launch" || value === "/dashboard" || value?.startsWith("/admin")
    ? value
    : "/dashboard";
}

function loginErrorUrl(next: string) {
  const url = new URL("/login", window.location.origin);
  url.searchParams.set("error", "oauth_callback");
  url.searchParams.set("next", next);
  return `${url.pathname}${url.search}`;
}

export default function AuthCallbackPage() {
  const [failed, setFailed] = useState(false);
  const [message, setMessage] = useState("Подтверждаем email…");

  useEffect(() => {
    let active = true;

    async function completeAuthentication() {
      const search = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const next = safeNextPath(search.get("next"));
      const code = search.get("code");
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const authError =
        search.get("error_description") ||
        search.get("error") ||
        hash.get("error_description") ||
        hash.get("error");

      if (authError) {
        if (!active) return;
        setFailed(true);
        setMessage("Ссылка подтверждения недействительна или уже истекла.");
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      let errorMessage: string | null = null;

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        errorMessage = error?.message || null;
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        errorMessage = error?.message || null;
      } else {
        const { data, error } = await supabase.auth.getSession();
        errorMessage = error?.message || null;

        if (!data.session && !errorMessage) {
          errorMessage = "Сессия подтверждения не найдена.";
        }
      }

      if (!active) return;

      if (errorMessage) {
        setFailed(true);
        setMessage("Не удалось завершить подтверждение email.");
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // Remove tokens and the one-time code from browser history before leaving.
      window.history.replaceState(
        {},
        document.title,
        `${window.location.pathname}?next=${encodeURIComponent(next)}`,
      );

      // A full navigation guarantees that Server Components and Proxy read the
      // fresh Supabase cookies created by setSession/exchangeCodeForSession.
      window.location.replace(next);
    }

    void completeAuthentication();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0d12] px-5 py-12 text-[#f7f5ef]">
      <section className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">
          OneStudio OS
        </p>
        <h1 className="mt-5 text-3xl font-semibold tracking-[-0.05em]">
          {failed ? "Не удалось подтвердить email" : "Завершаем регистрацию"}
        </h1>
        <p className="mt-4 text-sm leading-6 text-white/60">{message}</p>
        {failed ? (
          <Link
            href={loginErrorUrl("/dashboard")}
            className="mt-7 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0b0d12]"
          >
            Вернуться ко входу
          </Link>
        ) : null}
      </section>
    </main>
  );
}
