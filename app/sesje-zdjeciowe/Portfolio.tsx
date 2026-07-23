"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "../../lib/language-provider";
import { usePhotoshootsContent } from "../../lib/photoshoots-content";
import { supabase } from "../../lib/supabase";
import AnimatedTitle from "@/components/ui/AnimatedTitle";
import PremiumCard from "@/components/ui/PremiumCard";
import PremiumContainer from "@/components/ui/PremiumContainer";

type PortfolioItemFromDb = {
  id: string;
  title_uk: string;
  title_pl: string;
  subtitle_uk: string;
  subtitle_pl: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
};

type PortfolioItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
};

const fallbackImage = "https://cdn.sistersstudio.pl/site/static/portfolio/98f9dc7ff4db-portfolio1.webp";

const fallbackPortfolioItems: Record<"uk" | "pl", PortfolioItem[]> = {
  uk: [
    {
      id: "fallback-1",
      title: "Personal portrait",
      subtitle: "Індивідуальні кадри з акцентом на характер, погляд і настрій.",
      image: "https://cdn.sistersstudio.pl/site/static/portfolio/4e17e3958a6e-portfolio2.webp",
    },
    {
      id: "fallback-2",
      title: "Beauty & style",
      subtitle: "Образи, у яких макіяж, зачіска, світло й деталі працюють разом.",
      image: "https://cdn.sistersstudio.pl/site/static/portfolio/e74a31fd8881-portfolio3.webp",
    },
    {
      id: "fallback-3",
      title: "Fashion mood",
      subtitle: "Елегантна візуальна історія для бренду, контенту або себе.",
      image: "https://cdn.sistersstudio.pl/site/static/portfolio/98f9dc7ff4db-portfolio1.webp",
    },
  ],
  pl: [
    {
      id: "fallback-1",
      title: "Portret osobisty",
      subtitle: "Indywidualne kadry z akcentem na charakter, spojrzenie i nastrój.",
      image: "https://cdn.sistersstudio.pl/site/static/portfolio/4e17e3958a6e-portfolio2.webp",
    },
    {
      id: "fallback-2",
      title: "Beauty & style",
      subtitle: "Stylizacje, w których makijaż, fryzura, światło i detale działają razem.",
      image: "https://cdn.sistersstudio.pl/site/static/portfolio/e74a31fd8881-portfolio3.webp",
    },
    {
      id: "fallback-3",
      title: "Fashion mood",
      subtitle: "Elegancka historia wizualna dla marki, contentu albo dla Ciebie.",
      image: "https://cdn.sistersstudio.pl/site/static/portfolio/98f9dc7ff4db-portfolio1.webp",
    },
  ],
};

function getImageSrc(imageUrl: string) {
  const cleanUrl = imageUrl.trim();

  if (!cleanUrl) return fallbackImage;

  if (
    cleanUrl.startsWith("/") ||
    cleanUrl.startsWith("http://") ||
    cleanUrl.startsWith("https://")
  ) {
    return cleanUrl;
  }

  return fallbackImage;
}

export default function Portfolio() {
  const { lang } = useLanguage();
  const t = usePhotoshootsContent(lang);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItemFromDb[]>([]);
  const [hasLoadedFromDb, setHasLoadedFromDb] = useState(false);

  useEffect(() => {
    async function loadPortfolioItems() {
      const { data, error } = await supabase
        .from("site_portfolio_items")
        .select(
          "id, title_uk, title_pl, subtitle_uk, subtitle_pl, image_url, is_active, sort_order"
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (!error && data) {
        setPortfolioItems(data as PortfolioItemFromDb[]);
      }

      setHasLoadedFromDb(true);
    }

    loadPortfolioItems();
  }, []);

  const items: PortfolioItem[] =
    hasLoadedFromDb && portfolioItems.length > 0
      ? portfolioItems.map((item) => ({
          id: item.id,
          title: lang === "uk" ? item.title_uk : item.title_pl,
          subtitle: lang === "uk" ? item.subtitle_uk : item.subtitle_pl,
          image: getImageSrc(item.image_url),
        }))
      : fallbackPortfolioItems[lang];

  const previewItems = items.slice(0, 3);

  return (
    <section id="portfolio" className="bg-[#0B0908] py-32 text-[#F7EFE6]">
      <PremiumContainer>
        <AnimatedTitle eyebrow={t.portfolio.eyebrow} title={t.portfolio.title} />

        <p className="mx-auto mb-14 max-w-3xl text-center text-base leading-8 text-[#D8C8B8] md:text-lg">
          {t.portfolio.description}
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {previewItems.map((item, index) => (
            <PremiumCard key={item.id} delay={index * 0.12} className="p-0">
              <article className="group relative h-[560px] overflow-hidden rounded-[28px] border border-[#E9A7B3]/18 bg-[#17100D] shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                  onError={(event) => {
                    if (event.currentTarget.src !== window.location.origin + fallbackImage) {
                      event.currentTarget.src = fallbackImage;
                    }
                  }}
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080604]/92 via-[#080604]/24 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <h3 className="font-serif text-[34px] leading-tight text-[#FFF7EF]">
                    {item.title}
                  </h3>

                  <div className="my-4 h-px w-16 bg-[#E9A7B3]/65" />

                  <p className="text-[15px] leading-7 text-[#D8C8B8]">
                    {item.subtitle}
                  </p>
                </div>
              </article>
            </PremiumCard>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Link
            href="/portfolio"
            className="group inline-flex items-center justify-center rounded-full border border-[#E9A7B3]/45 bg-[#F7EFE6] px-8 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#1A120F] shadow-[0_18px_55px_rgba(233,167,179,0.18)] transition duration-300 hover:-translate-y-1 hover:bg-[#E9A7B3] hover:text-[#0B0908]"
            aria-label={lang === "uk" ? "Дивитися більше портфоліо" : "Zobacz więcej portfolio"}
          >
            {lang === "uk" ? "Дивитися більше" : "Zobacz więcej"}
            <span className="ml-3 transition duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </PremiumContainer>
    </section>
  );
}
