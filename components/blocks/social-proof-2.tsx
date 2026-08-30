"use client";

import { motion } from "motion/react";
import { useEffect, useRef } from "react";

export default function SocialProof2() {
  const row1Companies = [
    { name: "Boltshift", logo: "/mock-logos/boltshift.svg" },
    { name: "Lightbox", logo: "/mock-logos/lightbox.svg" },
    { name: "Feather Dev", logo: "/mock-logos/featherdev.svg" },
    { name: "Spherule", logo: "/mock-logos/spherule.svg" },
  ];

  const row2Companies = [
    { name: "Global Bank", logo: "/mock-logos/globalbank.svg" },
    { name: "Nietzsche", logo: "/mock-logos/nietzsche.svg" },
    { name: "Hourglass", logo: "/mock-logos/hourglass.svg" },
    { name: "Catalog", logo: "/mock-logos/catalog.svg" },
  ];

  const marquee1Ref = useRef<HTMLDivElement>(null);
  const marquee2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marquee1 = marquee1Ref.current;
    const marquee2 = marquee2Ref.current;
    if (!marquee1 || !marquee2) return;

    let offset1 = 0;
    let offset2 = 0;
    const speed = 0.5;

    const animate = () => {
      offset1 += speed;
      const width1 = marquee1.scrollWidth / 3;
      if (offset1 >= width1) {
        offset1 = 0;
      }
      marquee1.style.transform = `translateX(-${offset1}px)`;

      offset2 -= speed;
      const width2 = marquee2.scrollWidth / 3;
      if (offset2 <= -width2) {
        offset2 = 0;
      }
      marquee2.style.transform = `translateX(-${width2 + offset2}px)`;

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-white py-16 dark:bg-neutral-950 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-4 inline-block tracking-tight rounded-full bg-neutral-100 px-4 py-1.5 text-sm font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
          >
            Customers
          </motion.p>

          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-6 text-4xl font-normal text-neutral-900 dark:text-neutral-50 sm:text-5xl lg:text-6xl"
          >
            Meet our customers
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mx-auto max-w-2xl text-base text-neutral-600 dark:text-neutral-400 sm:text-lg"
          >
            Learn how leading SaaS, Fintech, Infra and AI companies are
            streamlining their quote to revenue workflows end-to-end.
          </motion.p>
        </div>

        <div className="relative">
          <div className="space-y-6">
            <div className="relative overflow-hidden">
              <div ref={marquee1Ref} className="flex gap-6">
                {[...row1Companies, ...row1Companies, ...row1Companies].map(
                  (company, index) => (
                    <div
                      key={`${company.name}-${index}`}
                      className="flex h-20 min-w-60 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white px-8 dark:border-neutral-800 dark:bg-neutral-950"
                    >
                      <img
                        src={company.logo}
                        alt={`${company.name} logo`}
                        className="h-6 w-auto object-contain brightness-0 opacity-60 dark:invert dark:opacity-40"
                      />
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="relative overflow-hidden">
              <div ref={marquee2Ref} className="flex gap-6">
                {[...row2Companies, ...row2Companies, ...row2Companies].map(
                  (company, index) => (
                    <div
                      key={`${company.name}-${index}`}
                      className="flex h-20 min-w-60 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white px-8 dark:border-neutral-800 dark:bg-neutral-950"
                    >
                      <img
                        src={company.logo}
                        alt={`${company.name} logo`}
                        className="h-6 w-auto object-contain brightness-0 opacity-60 dark:invert dark:opacity-40"
                      />
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-linear-to-r from-white to-transparent dark:from-neutral-950" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-linear-to-l from-white to-transparent dark:from-neutral-950" />
        </div>
      </div>
    </section>
  );
}
