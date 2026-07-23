"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../lib/language-provider";
import AnimatedTitle from "@/components/ui/AnimatedTitle";
import PremiumCard from "@/components/ui/PremiumCard";
import PremiumContainer from "@/components/ui/PremiumContainer";

type DbTestimonial = {
  id: string;
  name: string;
  role_uk: string | null;
  role_pl: string | null;
  text_uk: string | null;
  text_pl: string | null;
  rating: number | null;
  image_url: string | null;
  social_url: string | null;
  social_platform: "instagram" | "facebook" | null;
  is_active: boolean;
  sort_order: number | null;
};

type TestimonialItem = {
  id: string;
  name: string;
  type: string;
  text: string;
  rating: number;
  imageUrl?: string;
  socialUrl?: string;
  socialPlatform?: "instagram" | "facebook";
};

const fallbackReviews: Record<"uk" | "pl", TestimonialItem[]> = {
  uk: [
    {
      id: "fallback-uk-1",
      name: "Катерина",
      type: "Portrait session",
      text:
        "Найкрасивіша зйомка в моєму житті. Усе було організовано ідеально: від образу та макіяжу до готових фотографій.",
      rating: 5,
    },
    {
      id: "fallback-uk-2",
      name: "Олександр",
      type: "Family session",
      text:
        "Ми прийшли всією сім’єю й отримали неймовірні кадри. Атмосфера була легкою, теплою і дуже комфортною.",
      rating: 5,
    },
    {
      id: "fallback-uk-3",
      name: "Марина",
      type: "Fashion session",
      text:
        "Це рівень дорогого європейського сервісу. Команда продумує кожну деталь, а результат виглядає справді premium.",
      rating: 5,
    },
  ],
  pl: [
    {
      id: "fallback-pl-1",
      name: "Kateryna",
      type: "Portrait session",
      text:
        "Najpiękniejsza sesja w moim życiu. Wszystko było zorganizowane idealnie: od stylizacji i makijażu po gotowe zdjęcia.",
      rating: 5,
    },
    {
      id: "fallback-pl-2",
      name: "Aleksandr",
      type: "Family session",
      text:
        "Przyszliśmy całą rodziną i otrzymaliśmy niesamowite kadry. Atmosfera była lekka, ciepła i bardzo komfortowa.",
      rating: 5,
    },
    {
      id: "fallback-pl-3",
      name: "Maryna",
      type: "Fashion session",
      text:
        "To poziom drogiego europejskiego serwisu. Zespół dopracowuje każdy detal, a efekt wygląda naprawdę premium.",
      rating: 5,
    },
  ],
};

const copy = {
  uk: {
    eyebrow: "Відгуки",
    title: "Нам довіряють важливі моменти життя",
    emptyTitle: "Відгуки скоро зʼявляться",
    emptyText:
      "Додайте перший відгук в адмінці, і він автоматично зʼявиться на сторінці.",
  },
  pl: {
    eyebrow: "Opinie",
    title: "Powierzają nam ważne momenty życia",
    emptyTitle: "Opinie pojawią się wkrótce",
    emptyText:
      "Dodaj pierwszą opinię w panelu admina, a automatycznie pojawi się na stronie.",
  },
};

function normalizeRating(rating: number | null) {
  if (!rating) return 5;

  return Math.min(Math.max(Math.round(rating), 1), 5);
}

export default function Testimonials() {
  const { lang } = useLanguage();
  const currentCopy = copy[lang];

  const [dbReviews, setDbReviews] = useState<DbTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadTestimonials() {
      const { data, error } = await supabase
        .from("testimonials")
        .select(
          "id, name, role_uk, role_pl, text_uk, text_pl, rating, image_url, social_url, social_platform, is_active, sort_order"
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (!isMounted) return;

      if (error) {
        setHasLoadError(true);
        setIsLoading(false);
        return;
      }

      setDbReviews((data || []) as DbTestimonial[]);
      setHasLoadError(false);
      setIsLoading(false);
    }

    loadTestimonials();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentReviews = useMemo<TestimonialItem[]>(() => {
    if (hasLoadError) {
      return fallbackReviews[lang];
    }

    return dbReviews
      .map((review) => {
        const role = lang === "uk" ? review.role_uk : review.role_pl;
        const text = lang === "uk" ? review.text_uk : review.text_pl;

        return {
          id: review.id,
          name: review.name?.trim() || "Sisters Studio",
          type: role?.trim() || "Sisters Studio",
          text: text?.trim() || "",
          rating: normalizeRating(review.rating),
          imageUrl: review.image_url?.trim() || undefined,
          socialUrl: review.social_url?.trim() || undefined,
          socialPlatform: review.social_platform || undefined,
        };
      })
      .filter((review) => review.text.length > 0);
  }, [dbReviews, hasLoadError, lang]);

  return (
    <section className="bg-[#120E0C] py-32">
      <PremiumContainer>
        <AnimatedTitle
          eyebrow={currentCopy.eyebrow}
          title={currentCopy.title}
        />

        {isLoading && (
          <div className="mx-auto max-w-xl rounded-[28px] border border-[#E9A7B3]/20 bg-[#1A1411] px-8 py-8 text-center text-[#C8B8AA]">
            {lang === "uk" ? "Завантажуємо відгуки..." : "Ładujemy opinie..."}
          </div>
        )}

        {!isLoading && currentReviews.length === 0 && (
          <div className="mx-auto max-w-xl rounded-[28px] border border-[#E9A7B3]/20 bg-[#1A1411] px-8 py-8 text-center">
            <h3 className="text-2xl text-[#F7EFE6]">{currentCopy.emptyTitle}</h3>
            <p className="mt-4 leading-7 text-[#C8B8AA]">
              {currentCopy.emptyText}
            </p>
          </div>
        )}

        {!isLoading && currentReviews.length > 0 && (
          <div className="grid gap-8 lg:grid-cols-3">
            {currentReviews.map((review, index) => (
              <PremiumCard key={review.id} delay={index * 0.12}>
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="text-6xl leading-none text-[#E9A7B3]">“</div>

                  <div
                    className="text-sm tracking-[0.2em] text-[#E9A7B3]"
                    aria-label={`${review.rating} / 5`}
                  >
                    {"★".repeat(review.rating)}
                  </div>
                </div>

                <p className="mb-10 leading-8 text-[#C8B8AA]">
                  {review.text}
                </p>

                <div className="border-t border-[#E9A7B333] pt-6">
                  <div className="flex items-center gap-4">
                    {review.imageUrl ? <img src={review.imageUrl} alt={review.name} loading="lazy" decoding="async" fetchPriority="low" className="h-14 w-14 shrink-0 rounded-full border border-[#E9A7B3]/40 object-cover" /> : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#E9A7B3]/30 bg-[#E9A7B3]/10 text-xl text-[#E9A7B3]">{review.name.charAt(0).toUpperCase()}</div>}
                    <div className="min-w-0">
                      {review.socialUrl ? <a href={review.socialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-2xl text-[#F7EFE6] transition hover:text-[#E9A7B3]"><span>{review.name}</span><span className="rounded-full border border-[#E9A7B3]/35 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#E9A7B3]">{review.socialPlatform === "facebook" ? "f" : "ig"}</span></a> : <h3 className="text-2xl text-[#F7EFE6]">{review.name}</h3>}
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#E9A7B3]">{review.type}</p>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>
        )}
      </PremiumContainer>
    </section>
  );
}
