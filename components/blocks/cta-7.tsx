"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export default function Cta7() {
  return (
    <section className="relative w-full min-h-[var(--rb-section-min-h,100vh)] flex items-start py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white dark:bg-neutral-950">
      <div className="relative max-w-[1400px] mx-auto w-full flex flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="px-4 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 text-xs tracking-[0.15em] uppercase font-medium"
        >
          Now available: v2.0
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8 font-serif text-5xl sm:text-7xl md:text-8xl text-neutral-900 dark:text-white tracking-tight leading-none"
        >
          <em className="italic">Download</em> Northwind
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-5 max-w-md text-sm sm:text-base text-neutral-600 dark:text-neutral-400"
        >
          A calmer way to plan, track, and spend. Trusted by over 100,000
          people.
        </motion.p>

        <motion.a
          href="#"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="mt-7 inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs tracking-[0.15em] uppercase font-semibold"
        >
          Get started <ArrowRight className="w-3.5 h-3.5" />
        </motion.a>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 flex items-center gap-12 sm:gap-16 text-neutral-700 dark:text-neutral-300"
        >
          {[
            { brand: "Forbes", line1: "Best Budgeting", line2: "App 2024" },
            {
              brand: "Fast Company",
              line1: "Most Innovative",
              line2: "Companies 2024",
            },
          ].map((a, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-[11px] tracking-[0.12em] uppercase text-neutral-500 dark:text-neutral-500"
            >
              <span className="font-serif italic normal-case tracking-normal text-sm mb-1 text-neutral-900 dark:text-white">
                {a.brand}
              </span>
              <span>{a.line1}</span>
              <span>{a.line2}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-14 w-full max-w-sm aspect-9/12 rounded-[3rem] bg-neutral-100 dark:bg-neutral-900 border-10 border-neutral-200 dark:border-neutral-800 mx-auto flex items-center justify-center shadow-xl"
        >
          <img
            src="/svg/placeholder.svg"
            alt=""
            className="w-20 h-20 opacity-40 dark:invert"
          />
        </motion.div>
      </div>
    </section>
  );
}
