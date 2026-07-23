"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("Checking recovery link...");
  const [hasSession, setHasSession] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setHasSession(Boolean(data.session));
      setMessage(data.session ? "" : "The recovery link is missing, invalid or expired.");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setHasSession(Boolean(session));
      if (session) setMessage("");
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Use at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);
    setMessage(error ? error.message : "Password updated. You can now sign in.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0d12] px-5 py-12 text-[#f7f5ef]">
      <section className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-xl sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">OneStudio OS</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em]">Reset password</h1>

        {hasSession ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              type="password"
              required
              minLength={8}
              placeholder="New password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 outline-none transition focus:border-[#d8b36a]"
            />
            <input
              type="password"
              required
              minLength={8}
              placeholder="Repeat password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 outline-none transition focus:border-[#d8b36a]"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-[#f7f5ef] px-5 py-3.5 text-sm font-semibold text-[#0b0d12] disabled:opacity-60"
            >
              {isSubmitting ? "Updating..." : "Update password"}
            </button>
          </form>
        ) : null}

        {message && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-[#e7e2d7]">
            {message}
          </div>
        )}

        <Link href="/login" className="mt-7 inline-flex text-sm font-semibold text-[#d8b36a]">
          Return to sign in
        </Link>
      </section>
    </main>
  );
}
