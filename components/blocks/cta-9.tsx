"use client";

import { motion } from "motion/react";
import { ArrowRight, Plus, Copy, Send, Layers, Hexagon } from "lucide-react";

export default function Cta9() {
  return (
    <section className="w-full min-h-[var(--rb-section-min-h,100vh)] flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-[1400px] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-10 sm:p-16 lg:p-20 overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]"
        >
          <motion.div
            initial={{ opacity: 0, x: -40, rotate: -8 }}
            whileInView={{ opacity: 1, x: 0, rotate: -12 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[30%] w-44 lg:w-52 xl:w-56 rounded-2xl bg-white dark:bg-neutral-900 p-2 shadow-xl border border-neutral-100 dark:border-neutral-800"
          >
            <div className="aspect-4/3 rounded-lg overflow-hidden bg-neutral-200">
              <img
                src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=600&auto=format&fit=crop"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-2 px-1 pb-1">
              <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                Sue &middot; 12 Highlights
              </p>
              <p className="text-xs text-neutral-500">Product research</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40, rotate: 8 }}
            whileInView={{ opacity: 1, x: 0, rotate: 10 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden md:block absolute right-0 top-1/2 translate-x-[30%] w-56 lg:w-64 xl:w-72 rounded-2xl bg-white dark:bg-neutral-900 p-4 shadow-xl border border-neutral-100 dark:border-neutral-800"
          >
            <div className="flex items-center justify-between text-neutral-500 text-xs mb-3">
              <span>Template &middot; Onboarding recap</span>
              <div className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5" />
                <Copy className="w-3.5 h-3.5" />
                <Send className="w-3.5 h-3.5" />
              </div>
            </div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
              Summary
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              The team walked through the new workspace rollout, flagged two
              blockers for the import tool, and agreed on a lighter-touch review
              cadence for the next sprint&hellip;
            </p>
          </motion.div>

          <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-white dark:bg-neutral-900 shadow-sm flex items-center justify-center">
                <Layers className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              <div className="w-12 h-12 rounded-lg bg-white dark:bg-neutral-900 shadow-sm flex items-center justify-center">
                <Hexagon className="w-5 h-5 text-neutral-900 dark:text-white" />
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Ready to make the switch?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-700 dark:text-neutral-300">
              Bring your workspace over in minutes &mdash; we&rsquo;ll handle
              the heavy lifting.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-6 px-6 py-3 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              Request a free migration
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
