"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export default function Contact6() {
  return (
    <section className="w-full min-h-[var(--rb-section-min-h,100vh)] flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-lg rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-10 sm:p-14 flex flex-col items-center text-center"
      >
        <div className="w-14 h-14 rounded-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shadow-sm">
          <Sparkles
            className="w-6 h-6 text-neutral-900 dark:text-white"
            strokeWidth={1.75}
          />
        </div>

        <h2 className="mt-6 text-3xl sm:text-4xl font-medium text-neutral-900 dark:text-white tracking-tight leading-[1.1]">
          Still wondering
          <br />
          about something?
        </h2>

        <p className="mt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-sm leading-relaxed">
          Drop us a line any time and a real person will get back to you within
          a business day.
        </p>

        <a
          href="mailto:hello@northwind.com"
          className="mt-8 inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
        >
          hello@northwind.com
        </a>
      </motion.div>
    </section>
  );
}
