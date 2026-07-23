"use client";

import { useLanguage } from "../../lib/language-provider";
import { usePhotoshootsContent } from "../../lib/photoshoots-content";
import AnimatedTitle from "@/components/ui/AnimatedTitle";
import PremiumButton from "@/components/ui/PremiumButton";
import PremiumCard from "@/components/ui/PremiumCard";
import PremiumContainer from "@/components/ui/PremiumContainer";

export default function Booking() {
  const { lang } = useLanguage();
  const t = usePhotoshootsContent(lang);

  return (
    <section id="booking" className="bg-[#0B0908] py-32">
      <PremiumContainer>
        <PremiumCard className="bg-gradient-to-br from-[#2B1C16] via-[#4B3427] to-[#87644C] p-12 md:p-16">
          <div className="mx-auto max-w-4xl text-center">
            <AnimatedTitle
              eyebrow={t.booking.eyebrow}
              title={t.booking.title}
            />

            <p className="mx-auto mb-12 max-w-3xl text-xl leading-9 text-[#F5E6DA]">
              {t.booking.description}
            </p>

            <PremiumButton href="/booking-public">
              {t.booking.button}
            </PremiumButton>
          </div>
        </PremiumCard>
      </PremiumContainer>
    </section>
  );
}
