"use client";

import { motion } from "motion/react";

export type Pricing3Plan = {
  title: string;
  description: string;
  price: string;
  suffix: string;
  limit: string;
  ctaLabel: string;
};

export function AdaptedPricing3({ plans }: { plans: Pricing3Plan[] }) {
  return (
    <section className="relative w-full bg-white dark:bg-neutral-950 py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px] w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12 sm:mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 dark:text-white leading-tight"
          >
            Analytics for Modern Teams
          </motion.h1>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="cursor-pointer px-8 py-3 rounded-full border border-neutral-900 dark:border-neutral-700 text-neutral-900 dark:text-white font-medium text-sm hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            Learn more
          </motion.button>
        </div>

        <div data-rb-layout-grid-target="true" className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="bg-white border border-neutral-200 dark:border-neutral-800 shadow-lg dark:bg-neutral-900 rounded-3xl p-8 sm:p-10 flex flex-col"
            >
              <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-neutral-900 dark:text-white mb-4">
                {plan.title}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-base leading-relaxed mb-8">
                {plan.description}
              </p>

              <div className="border-t border-neutral-200 dark:border-neutral-800 mb-8" />

              <div className="mb-12">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl sm:text-6xl font-medium tracking-tight text-neutral-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.suffix ? (
                    <span className="text-2xl text-neutral-600 dark:text-neutral-400">
                      {plan.suffix}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {plan.limit}
                </p>
              </div>

              <div className="flex-1" />

              <button className="cursor-pointer w-fit px-6 py-3 rounded-full border border-neutral-900 dark:border-neutral-700 text-neutral-900 dark:text-white font-medium text-sm hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200">
                {plan.ctaLabel}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
