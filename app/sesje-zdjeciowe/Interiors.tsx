"use client";

import { useEffect, useMemo, useState } from "react";
import AnimatedTitle from "@/components/ui/AnimatedTitle";
import PremiumCard from "@/components/ui/PremiumCard";
import PremiumContainer from "@/components/ui/PremiumContainer";
import { useLanguage } from "../../lib/language-provider";
import { supabase } from "../../lib/supabase";

const translations = {
  uk: {
    eyebrow: "ІНТЕРʼЄРИ",
    title: "Простори для різних візуальних історій",
    intro:
      "Оберіть атмосферу під вашу зйомку: чисту циклораму, темний студійний простір або теплий інтерʼєр з готовими деталями для кадру.",
    note:
      "Локація підбирається під концепцію зйомки. Оренда студії або додаткової локації оплачується окремо.",
    fallbackLabel: "studio space",
    items: [
      {
        title: "Світла циклорама",
        label: "clean studio",
        subtitle:
          "Чистий простір для fashion, beauty та портретних кадрів, де головний акцент залишається на людині.",
        image: "https://cdn.sistersstudio.pl/site/static/interiors/cb00b349ebda-interiors1.webp",
      },
      {
        title: "Темна зона",
        label: "moody light",
        subtitle:
          "Глибокий атмосферний інтерʼєр для драматичних, стильних і більш кінематографічних зйомок.",
        image: "https://cdn.sistersstudio.pl/site/static/interiors/96a46e6dd211-interiors3.webp",
      },
      {
        title: "Теплий інтерʼєр",
        label: "soft details",
        subtitle:
          "Мʼякі фактури, меблі та деталі для жіночних, брендових і lifestyle-історій.",
        image: "https://cdn.sistersstudio.pl/site/static/interiors/dee2a0424c9a-interiors2.webp",
      },
    ],
  },
  pl: {
    eyebrow: "WNĘTRZA",
    title: "Przestrzenie dla różnych wizualnych historii",
    intro:
      "Wybierz atmosferę dla swojej sesji: czystą cykloramę, ciemną przestrzeń studyjną albo ciepłe wnętrze z gotowymi detalami do kadru.",
    note:
      "Lokalizacja dobierana jest do koncepcji sesji. Wynajem studia lub dodatkowej lokalizacji jest płatny osobno.",
    fallbackLabel: "studio space",
    items: [
      {
        title: "Jasna cyklorama",
        label: "clean studio",
        subtitle:
          "Czysta przestrzeń do kadrów fashion, beauty i portretowych, w której główny akcent pozostaje na osobie.",
        image: "https://cdn.sistersstudio.pl/site/static/interiors/cb00b349ebda-interiors1.webp",
      },
      {
        title: "Ciemna strefa",
        label: "moody light",
        subtitle:
          "Głębokie, nastrojowe wnętrze do dramatycznych, stylowych i bardziej filmowych sesji.",
        image: "https://cdn.sistersstudio.pl/site/static/interiors/96a46e6dd211-interiors3.webp",
      },
      {
        title: "Ciepłe wnętrze",
        label: "soft details",
        subtitle:
          "Miękkie faktury, meble i detale do kobiecych, brandingowych oraz lifestyleʼowych historii.",
        image: "https://cdn.sistersstudio.pl/site/static/interiors/dee2a0424c9a-interiors2.webp",
      },
    ],
  },
};

type InteriorRow = {
  id: string;
  name: string | null;
  description_uk: string | null;
  description_pl: string | null;
  image_url: string | null;
  is_active: boolean | null;
  sort_order: number | null;
};

type InteriorCard = {
  title: string;
  label: string;
  subtitle: string;
  image: string;
};

function getInteriorLabel(title: string, fallbackLabel: string) {
  const normalizedTitle = title.toLowerCase();

  if (
    normalizedTitle.includes("cyklorama") ||
    normalizedTitle.includes("циклорама")
  ) {
    return "clean studio";
  }

  if (
    normalizedTitle.includes("ciem") ||
    normalizedTitle.includes("тем") ||
    normalizedTitle.includes("dark")
  ) {
    return "moody light";
  }

  if (
    normalizedTitle.includes("ciep") ||
    normalizedTitle.includes("теп") ||
    normalizedTitle.includes("warm")
  ) {
    return "soft details";
  }

  return fallbackLabel;
}

export default function Interiors() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [dbInteriors, setDbInteriors] = useState<InteriorRow[]>([]);

  useEffect(() => {
    async function loadInteriors() {
      const { data, error } = await supabase
        .from("interiors")
        .select(
          "id, name, description_uk, description_pl, image_url, is_active, sort_order"
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (!error && data && data.length > 0) {
        setDbInteriors(data as InteriorRow[]);
      }
    }

    loadInteriors();
  }, []);

  const items = useMemo<InteriorCard[]>(() => {
    if (dbInteriors.length === 0) {
      return t.items;
    }

    return dbInteriors.map((interior, index) => {
      const fallback = t.items[index] || t.items[0];
      const title = interior.name?.trim() || fallback.title;
      const description =
        lang === "uk"
          ? interior.description_uk?.trim()
          : interior.description_pl?.trim();
      const fallbackDescription = fallback.subtitle;
      const image = interior.image_url?.trim() || fallback.image;

      return {
        title,
        label: getInteriorLabel(title, fallback.label || t.fallbackLabel),
        subtitle: description || fallbackDescription,
        image,
      };
    });
  }, [dbInteriors, lang, t]);

  return (
    <section id="interiors" className="bg-[#0B0908] py-24 sm:py-28 lg:py-32">
      <PremiumContainer>
        <AnimatedTitle eyebrow={t.eyebrow} title={t.title} />

        <p className="mx-auto mb-14 max-w-3xl text-center text-[16px] leading-8 text-[#D8C9BF] sm:text-[18px]">
          {t.intro}
        </p>

        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {items.map((item, index) => (
            <PremiumCard
              key={`${item.title}-${index}`}
              delay={index * 0.12}
              className="group overflow-hidden p-0"
            >
              <article className="h-full rounded-[30px] border border-[#4A332B] bg-[#17100D] shadow-[0_24px_80px_rgba(0,0,0,0.22)] transition duration-300 group-hover:border-[#D98DA2]/60 group-hover:bg-[#1D1411]">
                <div className="relative aspect-square overflow-hidden rounded-t-[30px] bg-[#100B09]">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0908]/68 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 rounded-full border border-[#D98DA2]/35 bg-[#120C0A]/72 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#E9A7B3] backdrop-blur-md">
                    {item.label}
                  </div>
                </div>

                <div className="p-6 sm:p-7">
                  <h3 className="font-serif text-[30px] leading-tight text-[#FFF7EF] sm:text-[34px]">
                    {item.title}
                  </h3>

                  <div className="my-5 h-px w-16 bg-[#D98DA2]/60" />

                  <p className="text-[15px] leading-7 text-[#D8C9BF]">
                    {item.subtitle}
                  </p>
                </div>
              </article>
            </PremiumCard>
          ))}
        </div>

        <div className="mt-10 rounded-[28px] border border-[#4A332B] bg-[#15100D] px-6 py-5 text-center text-[14px] leading-7 text-[#CDBAAF] sm:px-8">
          {t.note}
        </div>
      </PremiumContainer>
    </section>
  );
}
