"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LanguageProvider, useLanguage } from "../../lib/language-provider";

type LegalPageRow = {
  slug: string;
  title_pl: string;
  content_pl: string;
  title_uk: string | null;
  content_uk: string | null;
};

type RuleSection = {
  title: string;
  items: string[];
};

const chromeContent = {
  pl: {
    eyebrow: "Sisters Studio",
    description:
      "Zasady rezerwacji, płatności i korzystania z przestrzeni Sisters Studio. Rezerwacja oraz wejście na teren Studia oznaczają akceptację niniejszego regulaminu.",
    backCta: "Wróć do wynajmu",
    contactCta: "Kontakt",
    questionTitle: "Masz pytanie?",
    questionText:
      "Jeżeli planujesz większą produkcję, wydarzenie albo sesję wymagającą dodatkowych ustaleń, skontaktuj się z nami przed dokonaniem rezerwacji.",
    spacesCta: "Przestrzenie",
    loading: "Ładowanie regulaminu...",
    error: "Nie udało się wczytać regulaminu.",
  },
  uk: {
    eyebrow: "Sisters Studio",
    description:
      "Правила бронювання, оплати та користування простором Sisters Studio. Бронювання та вхід на територію Студії означають прийняття цих правил.",
    backCta: "До оренди",
    contactCta: "Звʼязатися",
    questionTitle: "Маєте питання?",
    questionText:
      "Якщо ви плануєте велику зйомку, подію або сесію, що потребує додаткових погоджень, звʼяжіться з нами до бронювання.",
    spacesCta: "Простори",
    loading: "Завантаження правил...",
    error: "Не вдалося завантажити правила.",
  },
} as const;

function splitNoteAndRules(content: string) {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  const firstHeadingIndex = normalized.search(/^1\.\s/m);

  if (firstHeadingIndex === -1) {
    return {
      note: normalized,
      rulesText: "",
    };
  }

  return {
    note: normalized.slice(0, firstHeadingIndex).trim(),
    rulesText: normalized.slice(firstHeadingIndex).trim(),
  };
}

function parseRules(rulesText: string): RuleSection[] {
  if (!rulesText.trim()) return [];

  const matches = [...rulesText.matchAll(/(^\d+\.\s.*?)(?=^\d+\.\s|\Z)/gms)];

  return matches.map((match) => {
    const block = match[1].trim();
    const lines = block.split("\n");
    const title = lines[0].trim();
    const bodyLines = lines.slice(1);

    const items: string[] = [];
    let currentItem = "";

    for (const rawLine of bodyLines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (/^\d+\.\d+\./.test(line)) {
        if (currentItem) items.push(currentItem.trim());
        currentItem = line;
      } else {
        currentItem = currentItem ? `${currentItem}\n${line}` : line;
      }
    }

    if (currentItem) items.push(currentItem.trim());

    return { title, items };
  });
}

function RegulaminContent() {
  const { lang } = useLanguage();
  const page = chromeContent[lang];

  const [data, setData] = useState<LegalPageRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
      setError(true);
      setLoading(false);
      return;
    }

    const supabase = createClient(url, key);

    const loadPage = async () => {
      const { data, error } = await supabase
        .from("legal_pages")
        .select("slug, title_pl, content_pl, title_uk, content_uk")
        .eq("slug", "regulamin")
        .single();

      if (error || !data) {
        console.error("Failed to load regulamin:", error);
        setError(true);
        setLoading(false);
        return;
      }

      setData(data as LegalPageRow);
      setLoading(false);
    };

    loadPage();
  }, []);

  const currentTitle = lang === "uk" ? data?.title_uk || data?.title_pl || "" : data?.title_pl || "";
  const currentContent = lang === "uk" ? data?.content_uk || data?.content_pl || "" : data?.content_pl || "";

  const parsed = useMemo(() => {
    const { note, rulesText } = splitNoteAndRules(currentContent);
    const rules = parseRules(rulesText);
    return { note, rules };
  }, [currentContent]);

  return (
    <main className="min-h-screen bg-[#f6efe8] text-[#2b1b14]">
      <Header />

      <section className="relative overflow-hidden bg-[#080604] px-6 pb-20 pt-36 text-[#fff7ef] sm:px-10 lg:px-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_24%,rgba(242,167,184,0.14),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(216,185,153,0.12),transparent_34%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f6efe8] to-transparent" />

        <div className="relative z-10 mx-auto max-w-5xl">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#e8c2c9]">
            {page.eyebrow}
          </p>

          <h1 className="font-serif text-[48px] font-normal leading-[1.02] tracking-[-0.035em] sm:text-[64px] lg:text-[82px]">
            {loading ? page.loading : currentTitle}
          </h1>

          <p className="mt-7 max-w-3xl text-base leading-8 text-[#e8d2c0] sm:text-lg">
            {page.description}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/wynajem-studia"
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#f2a7b8] px-8 text-center text-[12px] font-bold uppercase tracking-[0.18em] text-[#160c0a] transition hover:bg-[#ffc0cc]"
            >
              {page.backCta}
            </Link>

            <Link
              href="/kontakt"
              className="inline-flex h-14 items-center justify-center rounded-full border border-white/28 px-8 text-center text-[12px] font-bold uppercase tracking-[0.18em] text-[#fff7ef] transition hover:border-[#f2a7b8] hover:text-[#f2a7b8]"
            >
              {page.contactCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-10 lg:px-0">
        {loading ? (
          <div className="rounded-[2rem] border border-[#d8c0ad] bg-white/78 p-6 shadow-xl shadow-[#7a5237]/10 sm:p-8">
            <p className="text-sm leading-7 text-[#65483a]">{page.loading}</p>
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-[#e6b8b8] bg-[#fff5f5] p-6 shadow-xl shadow-[#7a5237]/10 sm:p-8">
            <p className="text-sm leading-7 text-[#8c3a3a]">{page.error}</p>
          </div>
        ) : (
          <>
            {parsed.note ? (
              <div className="mb-8 rounded-[2rem] border border-[#d8c0ad] bg-white/78 p-6 shadow-xl shadow-[#7a5237]/10 sm:p-8">
                <p className="whitespace-pre-line text-sm leading-7 text-[#65483a]">{parsed.note}</p>
              </div>
            ) : null}

            <div className="space-y-6">
              {parsed.rules.map((section) => (
                <article
                  key={section.title}
                  className="rounded-[2rem] border border-[#d8c0ad] bg-white/72 p-7 shadow-lg shadow-[#7a5237]/8 sm:p-9"
                >
                  <h2 className="text-2xl font-semibold text-[#2b1b14]">{section.title}</h2>

                  <ul className="mt-5 space-y-3 text-[15px] leading-7 text-[#65483a]">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#9a6b4d]" />
                        <span className="whitespace-pre-line">{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </>
        )}

        <div className="mt-10 rounded-[2rem] bg-[#2f1d15] p-8 text-white shadow-xl shadow-[#7a5237]/15 sm:p-10">
          <h2 className="text-3xl font-semibold">{page.questionTitle}</h2>

          <p className="mt-4 max-w-2xl leading-7 text-white/76">{page.questionText}</p>

          <div className="mt-7 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/kontakt"
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#f2a7b8] px-7 text-center text-[12px] font-bold uppercase tracking-[0.18em] text-[#160c0a] transition hover:bg-[#ffc0cc]"
            >
              {page.contactCta}
            </Link>

            <Link
              href="/wynajem-studia"
              className="inline-flex h-14 items-center justify-center rounded-full border border-white/22 px-7 text-center text-[12px] font-bold uppercase tracking-[0.18em] text-white transition hover:border-[#f2a7b8] hover:text-[#f2a7b8]"
            >
              {page.spacesCta}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function RegulaminPage() {
  return (
    <LanguageProvider>
      <RegulaminContent />
    </LanguageProvider>
  );
}
