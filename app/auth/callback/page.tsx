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
  const [message, setMessage] = useState("Завершаем безопасный вход…");

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
        console.error("Supabase callback error:", authError);
        if (!active) return;
        setFailed(true);
        setMessage("Провайдер входа отклонил запрос или ссылка уже недействительна.");
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // @supabase/ssr initializes Auth automatically and can process the OAuth
      // callback before this effect runs. Always check for an existing session
      // first so that a one-time PKCE code is not exchanged twice.
      const initial = await supabase.auth.getSession();
      let session = initial.data.session;
      let errorMessage = initial.error?.message || null;

      if (!session && !errorMessage && code) {
        const exchanged = await supabase.auth.exchangeCodeForSession(code);
        session = exchanged.data.session;
        errorMessage = exchanged.error?.message || null;
      } else if (!session && !errorMessage && accessToken && refreshToken) {
        const restored = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        session = restored.data.session;
        errorMessage = restored.error?.message || null;
      }

      if (!active) return;

      if (!session || errorMessage) {
        console.error("Supabase session completion error:", errorMessage || "Session not found");
        setFailed(true);
        setMessage("Не удалось завершить вход. Повторите попытку через Google или email.");
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // Remove OAuth codes and tokens from browser history before leaving.
      window.history.replaceState(
        {},
        document.title,
        `${window.location.pathname}?next=${encodeURIComponent(next)}`,
      );

      // A full navigation makes Server Components and Proxy read the fresh
      // Supabase cookies written by the browser client.
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
          {failed ? "Не удалось завершить вход" : "Завершаем вход"}
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
