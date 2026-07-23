"use client";

import Link from "next/link";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { useLanguage } from "@/lib/language-provider";

export default function NotFoundContent() {
  const { lang } = useLanguage();
  const text =
    lang === "pl"
      ? {
          eyebrow: "Błąd 404",
          title: "Tej strony tu nie ma",
          description:
            "Link mógł się zmienić albo strona została przeniesiona. Wróć na stronę główną lub zobacz nasze studio.",
          home: "Strona główna",
          studio: "Zobacz studio",
        }
      : {
          eyebrow: "Помилка 404",
          title: "Такої сторінки немає",
          description:
            "Посилання могло змінитися або сторінку перенесли. Поверніться на головну чи перегляньте нашу студію.",
          home: "На головну",
          studio: "Переглянути студію",
        };

  return (
    <main className="min-h-screen bg-[#080604] text-[#fff7ef]">
      <Header />
      <section className="relative flex min-h-[78vh] items-center overflow-hidden px-6 pb-20 pt-32 sm:px-10 lg:px-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_35%,rgba(242,167,184,0.16),transparent_32%),radial-gradient(circle_at_75%_55%,rgba(216,185,153,0.12),transparent_34%)]" />
        <div className="relative z-10 mx-auto w-full max-w-5xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.36em] text-[#f2a7b8]">
            {text.eyebrow}
          </p>
          <p aria-hidden="true" className="mt-2 font-serif text-[clamp(7rem,24vw,17rem)] leading-none text-white/5">
            404
          </p>
          <h1 className="-mt-10 max-w-3xl font-serif text-5xl leading-tight sm:-mt-16 sm:text-7xl">
            {text.title}
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-[#e8d2c0] sm:text-lg">
            {text.description}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#f2a7b8] px-8 text-xs font-bold uppercase tracking-[0.18em] text-[#160c0a] transition hover:bg-[#ffc0cc]"
            >
              {text.home}
            </Link>
            <Link
              href="/wynajem-studia"
              className="inline-flex h-14 items-center justify-center rounded-full border border-white/25 px-8 text-xs font-bold uppercase tracking-[0.18em] transition hover:border-[#f2a7b8] hover:text-[#f2a7b8]"
            >
              {text.studio}
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
