"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  context: { business: { slug: string; name: string; default_locale: string } };
  initialSubject: string;
};

export default function PublicRequestClient({ context, initialSubject }: Props) {
  const locale = context.business.default_locale.toLowerCase().startsWith("en") ? "en" : "ru";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const ru = locale === "ru";

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !email.includes("@") || message.trim().length < 3) {
      setError(ru ? "Заполните имя, email и коротко опишите задачу." : "Enter your name, email and a short description.");
      return;
    }
    setSending(true);
    setError("");
    const supabase = getSupabaseBrowserClient();
    const { error: requestError } = await supabase.rpc("create_public_request", {
      p_business_slug: context.business.slug,
      p_client_name: name,
      p_client_email: email,
      p_client_phone: phone,
      p_client_locale: locale,
      p_business_type: businessType,
      p_subject: subject,
      p_message: message,
      p_request_key: crypto.randomUUID(),
    });
    setSending(false);
    if (requestError) {
      setError(ru ? "Не удалось отправить. Проверьте данные и попробуйте ещё раз." : "Could not send. Check the form and try again.");
      return;
    }
    setSent(true);
  }

  return (
    <main className="min-h-screen bg-[#f4f1ea] px-5 py-12 text-[#17191f]">
      <section className="mx-auto max-w-3xl">
        <Link href={`/site/${context.business.slug}`} className="text-sm text-black/55">
          ← {ru ? "Вернуться на сайт" : "Back to site"}
        </Link>
        <div className="mt-7 overflow-hidden rounded-[36px] bg-white shadow-[0_30px_100px_rgba(23,25,31,0.12)]">
          <header className="bg-[#17191f] p-8 text-white sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">{context.business.name}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
              {ru ? "Расскажите о своём проекте" : "Tell us about your project"}
            </h1>
            <p className="mt-5 max-w-xl leading-7 text-white/65">
              {ru ? "Без выбора даты и созвона. Напишите, что вам нужно, — мы изучим задачу и ответим письменно." : "No calendar or call required. Describe what you need and we will reply in writing."}
            </p>
          </header>

          {sent ? (
            <div className="p-8 sm:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a742e]">{ru ? "Заявка отправлена" : "Request sent"}</p>
              <h2 className="mt-4 text-3xl font-semibold">{ru ? `Спасибо, ${name}.` : `Thank you, ${name}.`}</h2>
              <p className="mt-3 text-black/60">{ru ? "Мы получили сообщение и ответим на указанный email." : "We received your message and will reply by email."}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-5 p-8 sm:grid-cols-2 sm:p-12">
              <label className="grid gap-2 text-sm font-semibold">
                {ru ? "Имя" : "Name"} *
                <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-2xl border border-black/12 px-4 py-3 font-normal outline-none focus:border-[#9a742e]" />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Email *
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-2xl border border-black/12 px-4 py-3 font-normal outline-none focus:border-[#9a742e]" />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                {ru ? "Телефон (необязательно)" : "Phone (optional)"}
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-2xl border border-black/12 px-4 py-3 font-normal outline-none focus:border-[#9a742e]" />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                {ru ? "Тип бизнеса" : "Business type"}
                <input value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder={ru ? "Например, салон или студия" : "For example, salon or studio"} className="rounded-2xl border border-black/12 px-4 py-3 font-normal outline-none focus:border-[#9a742e]" />
              </label>
              <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
                {ru ? "Тема заявки" : "Request subject"}
                <input value={subject} maxLength={160} onChange={(e) => setSubject(e.target.value)} placeholder={ru ? "Например, индивидуальный запуск" : "For example, custom launch"} className="rounded-2xl border border-black/12 px-4 py-3 font-normal outline-none focus:border-[#9a742e]" />
              </label>
              <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
                {ru ? "Что вы хотите создать?" : "What would you like to build?"} *
                <textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className="resize-y rounded-2xl border border-black/12 px-4 py-3 font-normal outline-none focus:border-[#9a742e]" />
              </label>
              {error && <p className="text-sm text-red-700 sm:col-span-2">{error}</p>}
              <button disabled={sending} className="rounded-full bg-[#17191f] px-6 py-4 font-semibold text-white disabled:opacity-50 sm:col-span-2">
                {sending ? (ru ? "Отправляем…" : "Sending…") : (ru ? "Отправить заявку" : "Send request")}
              </button>
              <p className="text-center text-xs leading-5 text-black/45 sm:col-span-2">
                {ru ? "Контактные данные используются только для ответа на эту заявку." : "Contact details are used only to reply to this request."}
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
