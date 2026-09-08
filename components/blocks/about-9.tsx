"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { Play } from "lucide-react";

const stats = [
  { value: "2019", label: "Founded in Copenhagen, still independent" },
  { value: "63", label: "People working across nine cities" },
  { value: "480+", label: "Teams running their practice on Fieldnote" },
];

export default function About9() {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="w-full min-h-[var(--rb-section-min-h,100vh)] flex items-start lg:items-center py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="max-w-[1400px] mx-auto w-full"
      >
        <div className="mx-auto max-w-4xl text-center">
          <motion.p
            variants={item}
            className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-500"
          >
            About Fieldnote
          </motion.p>
          <motion.h2
            variants={item}
            className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.03em] leading-[1.05] text-neutral-950 dark:text-white [text-wrap:balance]"
          >
            Our mission is to make deep work{" "}
            <em className="font-serif font-normal italic tracking-normal">
              the default.
            </em>
          </motion.h2>
          <motion.p
            variants={item}
            className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 [text-wrap:pretty]"
          >
            Fieldnote is the operating platform for teams who refuse to run on
            autopilot: turning scattered decisions, documents, and rituals into
            one deliberate practice.
          </motion.p>
        </div>

        <motion.div
          variants={item}
          className="relative mt-12 sm:mt-16 overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-[0_32px_80px_-48px_rgba(0,0,0,0.4)] dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="relative aspect-[16/9] sm:aspect-[21/9]">
            <img
              src="/svg/placeholder.svg"
              alt="A look inside the Fieldnote studio"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-neutral-950/25 dark:bg-neutral-950/40" />
            <div className="absolute inset-0 grid place-items-center p-4">
              <motion.a
                href="#"
                whileHover={reduce ? undefined : { scale: 1.03 }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                aria-label="Watch the studio film, three minutes"
                className="inline-flex items-center gap-3 rounded-full bg-white/95 p-1.5 pr-6 shadow-lg backdrop-blur transition-colors hover:bg-white dark:bg-neutral-950/90 dark:hover:bg-neutral-950 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                  <Play className="h-4 w-4 fill-current" />
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-neutral-950 dark:text-white">
                    Watch the studio film
                  </span>
                  <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                    3 min
                  </span>
                </span>
              </motion.a>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-12 sm:mt-14 grid grid-cols-1 sm:grid-cols-3 border-t border-neutral-200 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 dark:border-neutral-800 dark:divide-neutral-800"
        >
          {stats.map((stat) => (
            <div
              key={stat.value}
              className="py-6 sm:py-8 sm:px-10 sm:first:pl-0 sm:last:pr-0"
            >
              <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950 dark:text-white">
                {stat.value}
              </p>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
