"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name.trim(),
          full_name: name.trim(),
          phone: phone.trim(),
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    if (data.session) {
      router.replace("/dashboard");
      return;
    }

    setMessage("Account created. Check your email to confirm registration.");
    setIsSubmitting(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0d12] px-5 py-12 text-[#f7f5ef]">
      <section className="w-full max-w-lg rounded-[32px] border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-xl sm:p-9">
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">
          OneStudio OS
        </Link>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em]">Create account</h1>
        <p className="mt-3 text-sm leading-6 text-[#b9b5ab]">
          This neutral account flow can be adapted for every future business edition.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#b9b5ab]">Name</span>
            <input
              required
              minLength={2}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 outline-none transition focus:border-[#d8b36a]"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#b9b5ab]">Phone</span>
            <input
              required
              minLength={5}
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 outline-none transition focus:border-[#d8b36a]"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#b9b5ab]">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 outline-none transition focus:border-[#d8b36a]"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#b9b5ab]">Password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 outline-none transition focus:border-[#d8b36a]"
            />
          </label>

          {message && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-[#e7e2d7] sm:col-span-2">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-[#f7f5ef] px-5 py-3.5 text-sm font-semibold text-[#0b0d12] transition hover:bg-white disabled:opacity-60 sm:col-span-2"
          >
            {isSubmitting ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-[#b9b5ab]">
          Already registered? <Link href="/login" className="font-semibold text-[#f7f5ef]">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
