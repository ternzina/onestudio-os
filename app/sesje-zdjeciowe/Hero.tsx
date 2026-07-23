"use client";

import Image from "next/image";
import { useState } from "react";
import { useLanguage } from "../../lib/language-provider";
import { usePhotoshootsContent } from "../../lib/photoshoots-content";

export default function Hero() {
  const { lang } = useLanguage();
  const t = usePhotoshootsContent(lang);
  const [videoReady, setVideoReady] = useState(false);

  const featureIcons = ["✦", "♡", "✓"];

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-[#080604] px-6 pt-28 text-[#FFF7EF] sm:px-8 lg:px-12"
    >
      <Image
        src={t.hero.backgroundImage}
        alt=""
        fill
        sizes="100vw"
        quality={82}
        preload
        className="object-cover object-center"
      />

      <video
        src="/videos/photoshoots-hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        onCanPlay={() => setVideoReady(true)}
        className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 motion-reduce:hidden ${
          videoReady ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,6,4,0.97)_0%,rgba(8,6,4,0.86)_34%,rgba(8,6,4,0.48)_62%,rgba(8,6,4,0.22)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#080604]/15 via-transparent to-[#080604]/72" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_28%,rgba(242,167,184,0.10),transparent_34%),radial-gradient(circle_at_78%_42%,rgba(232,210,192,0.08),transparent_35%)]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-7xl items-center">
        <div className="max-w-[620px] pb-10 pt-10">
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.34em] text-[#E8C2C9] sm:text-xs">
            {t.hero.eyebrow}
          </p>

          <h1 className="mb-7 max-w-[610px] font-serif text-[44px] font-normal leading-[1.02] tracking-[-0.035em] text-[#FFF7EF] sm:text-[56px] md:text-[64px] lg:text-[72px]">
            {t.hero.titlePart1}
            <br />
            {t.hero.titleAccent}
            <br />
            <span className="text-[#F2A7B8]">{t.hero.titlePart2}</span>
          </h1>

          <p className="mb-9 max-w-[520px] text-[15px] leading-7 text-[#E8D2C0] sm:text-base">
            {t.hero.description}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="/booking-public"
              className="inline-flex h-14 items-center justify-center rounded-md bg-[#F2A7B8] px-8 text-center text-[12px] font-bold uppercase tracking-[0.12em] text-[#160C0A] shadow-[0_16px_45px_rgba(242,167,184,0.18)] transition duration-300 hover:translate-y-[-2px] hover:bg-[#FFC0CC]"
            >
              {t.hero.primaryCta}
            </a>

            <a
              href="#packages"
              className="inline-flex h-14 items-center justify-center gap-3 rounded-md px-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#FFF7EF] transition duration-300 hover:text-[#F2A7B8]"
            >
              {t.hero.secondaryCta}
              <span className="text-lg leading-none">→</span>
            </a>
          </div>

          <div className="mt-14 grid max-w-[610px] grid-cols-1 gap-4 text-[12px] uppercase tracking-[0.1em] text-[#E8D2C0] sm:grid-cols-3">
            {t.hero.features.map((feature, index) => (
              <div key={feature} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#F2A7B8]/35 text-[#F2A7B8]">
                  {featureIcons[index]}
                </span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
