"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { hero17ContentDefaults, type Hero17Image } from "../../content-editability-batch-4-contracts";

export type AdaptedHero17Props = {
  badge: string;
  headingLine1: string;
  headingLine2: string;
  description: string;
  buttonLabel: string;
  heroImageUrl: string;
  heroImageAlt: string;
  gallery: readonly Hero17Image[];
};

export function AdaptedHero17({
  badge,
  headingLine1,
  headingLine2,
  description,
  buttonLabel,
  heroImageUrl,
  heroImageAlt,
  gallery,
}: AdaptedHero17Props = hero17ContentDefaults) {
  return (
    <section className="w-full min-h-screen flex items-start lg:items-center py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-20 items-center">
          <div className="flex flex-col gap-6 sm:gap-7">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                {badge}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl font-medium text-neutral-900 dark:text-white leading-[1.1] tracking-[-0.01em]"
            >
              {headingLine1}
              <br />
              {headingLine2}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="px-7 sm:px-8 py-3.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium text-sm sm:text-base cursor-pointer hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors duration-200 w-full sm:w-auto"
              >
                {buttonLabel}
              </motion.button>
            </motion.div>
          </div>

          <div className="flex flex-col gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.25 }}
              className="w-full rounded-2xl overflow-hidden"
              style={{ aspectRatio: "16/10" }}
            >
              <img
                src={heroImageUrl}
                alt={heroImageAlt}
                className="w-full h-full object-cover"
              />
            </motion.div>

            <div className="grid grid-cols-3 gap-3">
              {gallery.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.45 + i * 0.08 }}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-xl overflow-hidden aspect-square cursor-pointer"
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdaptedHero17;
