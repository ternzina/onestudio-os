"use client";

import { useEffect, useMemo, useState } from "react";
import { Allura, Cormorant_Garamond } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../../lib/language-provider";
import {
  fallbackSiteHomeContent,
  type SiteHomeContent,
} from "@/lib/home-content";

const allura = Allura({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const content = {
  uk: {
    eyebrow: fallbackSiteHomeContent.hero_eyebrow_uk,
    words: ["фотосесій", "оренди", "навчання"],
    intro: fallbackSiteHomeContent.hero_intro_uk,
    primaryButton: fallbackSiteHomeContent.hero_primary_button_uk,
    secondaryButton: fallbackSiteHomeContent.hero_secondary_button_uk,
    sectionEyebrow: fallbackSiteHomeContent.directions_eyebrow_uk,
    sectionTitle: fallbackSiteHomeContent.directions_title_uk,
    sectionText: fallbackSiteHomeContent.directions_text_uk,
    more: "Дізнатися більше",
    collage: {
      photoshoots: "Фотосесії",
      interiors: "Інтерʼєри",
      learning: "Навчання",
      equipment: "Техніка",
    },
    directions: [
      {
        title: "Оренда студії",
        text: "Світлі зали, професійне обладнання та комфортний простір для ваших ідей.",
        href: "/wynajem-studia",
        icon: "◱",
        cta: "Забронювати оренду",
      },
      {
        title: "Фотосесії",
        text: "Індивідуальні, сімейні, портретні та контент-зйомки в атмосферному просторі студії.",
        href: "/sesje-zdjeciowe",
        icon: "◎",
        cta: "Обрати фотосесію",
      },
      {
        title: "Навчання",
        text: "Практичні курси, майстер-класи та воркшопи для фотографів різного рівня.",
        href: "/szkolenia",
        icon: "◇",
        cta: "Дізнатися більше",
      },
    ],
  },
  pl: {
    eyebrow: fallbackSiteHomeContent.hero_eyebrow_pl,
    words: ["sesji", "wynajmu", "szkoleń"],
    intro: fallbackSiteHomeContent.hero_intro_pl,
    primaryButton: fallbackSiteHomeContent.hero_primary_button_pl,
    secondaryButton: fallbackSiteHomeContent.hero_secondary_button_pl,
    sectionEyebrow: fallbackSiteHomeContent.directions_eyebrow_pl,
    sectionTitle: fallbackSiteHomeContent.directions_title_pl,
    sectionText: fallbackSiteHomeContent.directions_text_pl,
    more: "Dowiedz się więcej",
    collage: {
      photoshoots: "Sesje",
      interiors: "Wnętrza",
      learning: "Szkolenia",
      equipment: "Sprzęt",
    },
    directions: [
      {
        title: "Wynajem studia",
        text: "Jasne sale, profesjonalny sprzęt i wygodna przestrzeń dla Twoich pomysłów.",
        href: "/wynajem-studia",
        icon: "◱",
        cta: "Zarezerwuj wynajem",
      },
      {
        title: "Sesje zdjęciowe",
        text: "Sesje indywidualne, rodzinne, portretowe i contentowe w klimatycznej przestrzeni studia.",
        href: "/sesje-zdjeciowe",
        icon: "◎",
        cta: "Wybierz sesję",
      },
      {
        title: "Szkolenia",
        text: "Praktyczne kursy, masterclassy i warsztaty dla fotografów na różnych poziomach.",
        href: "/szkolenia",
        icon: "◇",
        cta: "Dowiedz się więcej",
      },
    ],
  },
};

const collage = [
  {
    titleKey: "photoshoots",
    imageKey: "collage_photoshoots_image_url",
    className:
      "left-[8%] top-[2%] z-30 h-[255px] w-[190px] rotate-[-5deg] sm:h-[320px] sm:w-[245px] md:h-[410px] md:w-[315px]",
  },
  {
    titleKey: "interiors",
    imageKey: "collage_interiors_image_url",
    className:
      "right-[0%] top-[10%] z-20 h-[170px] w-[230px] rotate-[6deg] sm:h-[215px] sm:w-[280px] md:h-[280px] md:w-[360px]",
  },
  {
    titleKey: "learning",
    imageKey: "collage_learning_image_url",
    className:
      "bottom-[15%] left-[2%] z-40 h-[170px] w-[235px] rotate-[4deg] sm:h-[210px] sm:w-[300px] md:h-[260px] md:w-[370px]",
  },
  {
    titleKey: "equipment",
    imageKey: "collage_equipment_image_url",
    className:
      "bottom-[6%] right-[4%] z-30 h-[165px] w-[210px] rotate-[-5deg] sm:h-[210px] sm:w-[265px] md:h-[265px] md:w-[325px]",
  },
] as const;

const splitWords = (value: string, fallbackWords: string[]) => {
  const words = value
    .split(",")
    .map((word) => word.trim())
    .filter(Boolean);

  return words.length > 0 ? words : fallbackWords;
};

export default function Hero({
  initialContent,
}: {
  initialContent: SiteHomeContent;
}) {
  const [activeWord, setActiveWord] = useState(0);
  const [activeCard, setActiveCard] = useState<(typeof collage)[number]["titleKey"]>("learning");
  const siteHomeContent = initialContent;
  const { lang } = useLanguage();

  const t = useMemo(() => {
    const baseContent = content[lang];
    const words =
      lang === "pl"
        ? splitWords(siteHomeContent.hero_words_pl, baseContent.words)
        : splitWords(siteHomeContent.hero_words_uk, baseContent.words);

    return {
      ...baseContent,
      eyebrow:
        lang === "pl"
          ? siteHomeContent.hero_eyebrow_pl
          : siteHomeContent.hero_eyebrow_uk,
      words,
      intro:
        lang === "pl"
          ? siteHomeContent.hero_intro_pl
          : siteHomeContent.hero_intro_uk,
      primaryButton:
        lang === "pl"
          ? siteHomeContent.hero_primary_button_pl
          : siteHomeContent.hero_primary_button_uk,
      secondaryButton:
        lang === "pl"
          ? siteHomeContent.hero_secondary_button_pl
          : siteHomeContent.hero_secondary_button_uk,
      sectionEyebrow:
        lang === "pl"
          ? siteHomeContent.directions_eyebrow_pl
          : siteHomeContent.directions_eyebrow_uk,
      sectionTitle:
        lang === "pl"
          ? siteHomeContent.directions_title_pl
          : siteHomeContent.directions_title_uk,
      sectionText:
        lang === "pl"
          ? siteHomeContent.directions_text_pl
          : siteHomeContent.directions_text_uk,
      collage: {
        photoshoots:
          lang === "pl"
            ? siteHomeContent.collage_photoshoots_label_pl
            : siteHomeContent.collage_photoshoots_label_uk,
        interiors:
          lang === "pl"
            ? siteHomeContent.collage_interiors_label_pl
            : siteHomeContent.collage_interiors_label_uk,
        learning:
          lang === "pl"
            ? siteHomeContent.collage_learning_label_pl
            : siteHomeContent.collage_learning_label_uk,
        equipment:
          lang === "pl"
            ? siteHomeContent.collage_equipment_label_pl
            : siteHomeContent.collage_equipment_label_uk,
      },
    };
  }, [lang, siteHomeContent]);

  const words = t.words;

  useEffect(() => {
    setActiveWord(0);
  }, [lang, words.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveWord((current) => (current + 1) % words.length);
    }, 1900);

    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <section className="relative overflow-hidden bg-[#0B0908] text-[#FFF7F2]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(245,162,183,0.16),transparent_30%),radial-gradient(circle_at_18%_34%,rgba(92,51,43,0.55),transparent_34%),linear-gradient(180deg,#0B0908_0%,#080504_100%)]" />
      <div className="absolute left-[55%] top-20 h-[540px] w-[540px] -translate-x-1/2 rounded-full bg-[#F5A2B7]/[0.06] blur-[110px]" />

      <div className="relative mx-auto max-w-[1500px] px-5 pb-16 pt-28 sm:px-8 lg:px-12 lg:pb-24 lg:pt-32">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <div className="relative z-20">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.36em] text-[#F5A2B7]/80 sm:mb-5 sm:text-xs sm:tracking-[0.48em]">
              {t.eyebrow}
            </p>

            <h1
              className={`${allura.className} select-none text-[88px] font-normal leading-[0.88] tracking-[-0.01em] sm:text-[142px] sm:tracking-[-0.02em] lg:text-[170px] xl:text-[188px]`}
              aria-label="Sisters Studio"
            >
              <span className="block text-[#FFF0E6] drop-shadow-[0_0_30px_rgba(255,247,242,0.12)]">
                Sisters
              </span>

              <span className="group relative -mt-3 block translate-x-[0.52em] text-[#F5A2B7] transition duration-500 [text-shadow:0_0_14px_rgba(245,162,183,0.58),0_0_42px_rgba(245,162,183,0.36),0_0_82px_rgba(245,162,183,0.18)] hover:text-[#FFD0D9] hover:[text-shadow:0_0_18px_rgba(255,208,217,0.72),0_0_58px_rgba(245,162,183,0.48),0_0_110px_rgba(245,162,183,0.24)] sm:-mt-6 sm:translate-x-[0.26em] lg:-mt-7 lg:translate-x-[0.3em]">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-0 text-[#F5A2B7] opacity-55 blur-[9px] transition duration-500 group-hover:opacity-80 group-hover:blur-[12px]"
                >
                  Studio
                </span>
                <span className="relative z-10">Studio</span>
              </span>
            </h1>

            <div className="mt-7 flex items-center gap-5 sm:mt-8 sm:gap-6">
              <div className="h-28 w-px bg-[#F5A2B7]/65 sm:h-32" />

              <div className="flex h-36 flex-col justify-center gap-1 overflow-hidden sm:h-40">
                {words.map((word, index) => {
                  const isActive = activeWord === index;

                  return (
                    <div
                      key={`${word}-${index}`}
                      className={`${cormorant.className} leading-none transition-all duration-700 ${
                        isActive
                          ? "translate-x-0 scale-105 text-[42px] text-[#F5A2B7] opacity-100 drop-shadow-[0_0_24px_rgba(245,162,183,0.22)] sm:text-[58px]"
                          : "translate-x-4 scale-95 text-[36px] text-[#FFF7F2]/16 opacity-70 sm:translate-x-5 sm:text-[52px]"
                      }`}
                    >
                      {word}
                    </div>
                  );
                })}
              </div>

              <div className="h-28 w-px bg-[#F5A2B7]/65 sm:h-32" />
            </div>

            <p className="mt-8 max-w-xl text-base leading-8 text-[#E7D8CF] sm:mt-9 sm:text-lg">
              {t.intro}
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:mt-10 sm:flex-row">
              <a
                href="#directions"
                className="inline-flex items-center justify-center rounded-xl bg-[#F5A2B7] px-9 py-5 text-sm font-bold uppercase tracking-[0.18em] text-[#150B09] shadow-[0_0_38px_rgba(245,162,183,0.24)] transition hover:-translate-y-1 hover:bg-[#FFD0D9]"
              >
                {t.primaryButton}
                <span className="ml-4">→</span>
              </a>

              <a
                href="/kontakt"
                className="inline-flex items-center justify-center rounded-xl border border-[#F5A2B7]/45 px-9 py-5 text-sm font-bold uppercase tracking-[0.18em] text-[#F5A2B7] transition hover:-translate-y-1 hover:bg-[#F5A2B7]/10"
              >
                {t.secondaryButton}
                <span className="ml-4">→</span>
              </a>
            </div>
          </div>

          <div className="relative min-h-[455px] sm:min-h-[540px] lg:min-h-[620px]">
            <div className="absolute left-[8%] top-[4%] z-0 font-serif text-[340px] leading-none text-[#F5A2B7]/[0.045] sm:text-[430px] lg:text-[500px]">
              S
            </div>

            <div className="absolute inset-0 rounded-full bg-[#F5A2B7]/10 blur-[95px]" />

            {collage.map((image) => {
              const title = t.collage[image.titleKey];
              const isActiveCard = activeCard === image.titleKey;

              return (
                <div
                  key={image.titleKey}
                  onMouseEnter={() => setActiveCard(image.titleKey)}
                  onMouseLeave={() => setActiveCard("learning")}
                  onClick={() => setActiveCard(image.titleKey)}
                  onTouchStart={() => setActiveCard(image.titleKey)}
                  style={{ zIndex: isActiveCard ? 60 : undefined }}
                  className={`absolute ${image.className} cursor-pointer overflow-hidden rounded-[30px] bg-gradient-to-br from-[#1A0F0C] to-[#3A201C] transition-all duration-500 hover:z-50 hover:scale-[1.025] hover:border-[#F5A2B7]/50 ${
                    isActiveCard
                      ? "-translate-y-6 scale-[1.045] border border-[#F5A2B7]/70 shadow-[0_0_62px_rgba(245,162,183,0.30)]"
                      : "border border-[#F5A2B7]/25 shadow-[0_0_45px_rgba(245,162,183,0.13)]"
                  }`}
                >
                  <Image
                    src={siteHomeContent[image.imageKey]}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 235px, (max-width: 1024px) 370px, 370px"
                    quality={82}
                    preload={image.titleKey === "photoshoots"}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#080504]/55 via-transparent to-transparent" />

                  <div className="absolute inset-0 flex items-end p-5">
                    <span className="rounded-full border border-[#F5A2B7]/30 bg-[#0B0908]/72 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#F5A2B7] backdrop-blur sm:px-4 sm:text-[11px] sm:tracking-[0.2em]">
                      {title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div id="directions" className="mt-10 sm:mt-14 lg:mt-16">
          <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.42em] text-[#F5A2B7]/75">
                {t.sectionEyebrow}
              </p>

              <h2 className="font-serif text-4xl text-[#FFF7F2] sm:text-5xl">
                {t.sectionTitle}
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-7 text-[#D7C8C0]">
              {t.sectionText}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {t.directions.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group block rounded-[28px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A2B7] focus-visible:ring-offset-4 focus-visible:ring-offset-[#080504]"
              >
                <article className="h-full rounded-[28px] border border-[#F5A2B7]/22 bg-[#120B09]/82 p-8 shadow-[0_0_35px_rgba(245,162,183,0.05)] transition group-hover:-translate-y-1 group-hover:border-[#F5A2B7]/55 group-hover:bg-[#160D0B]/92">
                  <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-[#F5A2B7]/35 bg-[#F5A2B7]/10 text-3xl text-[#F5A2B7] transition group-hover:scale-105 group-hover:bg-[#F5A2B7]/16">
                    {item.icon}
                  </div>

                  <h3 className="font-serif text-3xl text-[#FFF7F2]">
                    {item.title}
                  </h3>

                  <p className="mt-5 min-h-0 text-sm leading-7 text-[#D7C8C0] sm:min-h-[112px]">
                    {item.text}
                  </p>

                  <span className="mt-7 inline-flex items-center text-xs font-bold uppercase tracking-[0.18em] text-[#F5A2B7]">
                    {item.cta || t.more}
                    <span className="ml-3 transition group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </article>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
