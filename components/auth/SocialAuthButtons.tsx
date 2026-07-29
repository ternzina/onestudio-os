"use client";

import { useState } from "react";
import type { Provider } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type SocialAuthButtonsProps = {
  nextPath?: string;
};

function safeNextPath(value?: string) {
  return value === "/launch" || value?.startsWith("/admin") ? value : "/admin";
}

export default function SocialAuthButtons({
  nextPath = "/admin",
}: SocialAuthButtonsProps) {
  const [pendingProvider, setPendingProvider] = useState<Provider | null>(null);
  const [message, setMessage] = useState("");

  async function signIn(provider: "google" | "apple") {
    setMessage("");
    setPendingProvider(provider);

    const next = safeNextPath(nextPath);
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", next);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      setMessage(error.message || "Не удалось открыть вход.");
      setPendingProvider(null);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => void signIn("google")}
        disabled={pendingProvider !== null}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-white/14 bg-white px-5 py-3.5 text-sm font-semibold text-[#0b0d12] transition hover:bg-[#f3f3f3] disabled:opacity-60"
      >
        <span aria-hidden="true" className="text-base font-bold text-[#4285f4]">G</span>
        {pendingProvider === "google" ? "Открываем Google…" : "Продолжить с Google"}
      </button>
      <button
        type="button"
        onClick={() => void signIn("apple")}
        disabled={pendingProvider !== null}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-white/18 bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-black/80 disabled:opacity-60"
      >
        <span aria-hidden="true" className="text-lg leading-none">●</span>
        {pendingProvider === "apple" ? "Открываем Apple…" : "Продолжить с Apple"}
      </button>
      {message ? (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {message}
        </div>
      ) : null}
    </div>
  );
}
