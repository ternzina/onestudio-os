"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/lib/language-provider";
import {
  normalizeCarouselDelay,
  type HomeCarouselSettings,
  type HomeCarouselSlide,
} from "@/lib/home-carousel";

type HomeCarouselProps = {
  settings: HomeCarouselSettings;
  slides: HomeCarouselSlide[];
};

export default function HomeCarousel({ settings, slides }: HomeCarouselProps) {
  const { lang } = useLanguage();
  const visibleSlides = useMemo(
    () => slides.filter((slide) => slide.is_active && slide.image_url.trim()),
    [slides],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setActiveIndex((current) =>
      visibleSlides.length === 0 ? 0 : Math.min(current, visibleSlides.length - 1),
    );
  }, [visibleSlides.length]);

  useEffect(() => {
    if (isPaused || visibleSlides.length < 2) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % visibleSlides.length);
    }, normalizeCarouselDelay(settings.autoplay_delay_ms));

    return () => window.clearInterval(timer);
  }, [isPaused, settings.autoplay_delay_ms, visibleSlides.length]);

  if (!settings.enabled || visibleSlides.length === 0) return null;

  const showPrevious = () => {
    setActiveIndex(
      (current) =>
        (current - 1 + visibleSlides.length) % visibleSlides.length,
    );
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % visibleSlides.length);
  };

  return (
    <section
      className="relative overflow-hidden bg-[#080504] px-5 pb-24 pt-8 text-[#FFF7F2] sm:px-8 sm:pb-28 lg:px-12 lg:pb-32"
      aria-label={lang === "pl" ? "Galeria studia" : "Галерея студії"}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_45%,rgba(245,162,183,0.12),transparent_30%),radial-gradient(circle_at_86%_65%,rgba(92,51,43,0.48),transparent_34%)]" />

      <div className="relative mx-auto max-w-[900px]">
        <div className="mb-7 flex items-end justify-between gap-6 sm:mb-9">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-[#F5A2B7]/75 sm:text-xs sm:tracking-[0.44em]">
              {lang === "pl" ? "Sisters Studio od środka" : "Sisters Studio зсередини"}
            </p>
            <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-[#FFF7F2] sm:text-5xl lg:text-6xl">
              {lang === "pl"
                ? "Przestrzeń dla pięknych historii"
                : "Простір для красивих історій"}
            </h2>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <button
              type="button"
              onClick={showPrevious}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#F5A2B7]/35 bg-[#120B09]/75 text-xl text-[#F5A2B7] backdrop-blur transition hover:border-[#F5A2B7]/75 hover:bg-[#F5A2B7] hover:text-[#150B09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A2B7]"
              aria-label={lang === "pl" ? "Poprzednie zdjęcie" : "Попереднє фото"}
            >
              ←
            </button>
            <button
              type="button"
              onClick={showNext}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#F5A2B7]/35 bg-[#120B09]/75 text-xl text-[#F5A2B7] backdrop-blur transition hover:border-[#F5A2B7]/75 hover:bg-[#F5A2B7] hover:text-[#150B09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A2B7]"
              aria-label={lang === "pl" ? "Następne zdjęcie" : "Наступне фото"}
            >
              →
            </button>
          </div>
        </div>

        <div
          className="group relative aspect-[4/5] overflow-hidden rounded-[30px] border border-[#F5A2B7]/25 bg-[#160D0B] shadow-[0_30px_100px_rgba(0,0,0,0.46),0_0_58px_rgba(245,162,183,0.08)] sm:aspect-video sm:rounded-[38px]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") showPrevious();
            if (event.key === "ArrowRight") showNext();
          }}
          tabIndex={0}
        >
          {visibleSlides.map((slide, index) => {
            const isActive = index === activeIndex;
            const title = lang === "pl" ? slide.title_pl : slide.title_uk;
            const text = lang === "pl" ? slide.text_pl : slide.text_uk;
            const alt =
              (lang === "pl" ? slide.alt_pl : slide.alt_uk) ||
              title ||
              "Sisters Studio";

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 motion-reduce:transition-none ${
                  isActive ? "z-10 opacity-100" : "z-0 opacity-0"
                }`}
                aria-hidden={!isActive}
              >
                <Image
                  src={slide.image_url}
                  alt={alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 980px) 92vw, 900px"
                  quality={86}
                  priority={index === 0}
                  className={`object-cover transition-transform duration-[7000ms] ease-out motion-reduce:transition-none ${
                    isActive ? "scale-105" : "scale-100"
                  }`}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#080504]/90 via-[#080504]/15 to-[#080504]/15 sm:bg-gradient-to-r sm:from-[#080504]/85 sm:via-[#080504]/25 sm:to-transparent" />

                {(title || text) && (
                  <div className="absolute inset-x-0 bottom-0 z-20 p-6 sm:max-w-[70%] sm:p-10 lg:max-w-[58%] lg:p-14">
                    {title && (
                      <h3 className="font-serif text-3xl leading-tight text-[#FFF7F2] drop-shadow sm:text-5xl lg:text-6xl">
                        {title}
                      </h3>
                    )}
                    {text && (
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#EEE0D8] sm:mt-5 sm:text-base sm:leading-7">
                        {text}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {visibleSlides.length > 1 && (
            <>
              <div className="absolute inset-x-0 bottom-4 z-30 flex justify-center gap-2 sm:bottom-6 sm:justify-end sm:px-8 lg:px-12">
                {visibleSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-1.5 rounded-full transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A2B7] ${
                      index === activeIndex
                        ? "w-10 bg-[#F5A2B7]"
                        : "w-4 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`${lang === "pl" ? "Pokaż zdjęcie" : "Показати фото"} ${index + 1}`}
                    aria-current={index === activeIndex ? "true" : undefined}
                  />
                ))}
              </div>

              <div className="absolute inset-x-4 top-1/2 z-30 flex -translate-y-1/2 justify-between sm:hidden">
                <button
                  type="button"
                  onClick={showPrevious}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-[#080504]/55 text-lg text-white backdrop-blur"
                  aria-label={lang === "pl" ? "Poprzednie zdjęcie" : "Попереднє фото"}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-[#080504]/55 text-lg text-white backdrop-blur"
                  aria-label={lang === "pl" ? "Następne zdjęcie" : "Наступне фото"}
                >
                  →
                </button>
              </div>
            </>
          )}

          <div className="absolute right-5 top-5 z-30 rounded-full border border-white/20 bg-[#080504]/55 px-4 py-2 text-[10px] font-semibold tracking-[0.22em] text-white/85 backdrop-blur sm:right-8 sm:top-8">
            {String(activeIndex + 1).padStart(2, "0")} / {String(visibleSlides.length).padStart(2, "0")}
          </div>
        </div>
      </div>
    </section>
  );
}
