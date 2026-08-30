"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Users } from "lucide-react";

export default function Pricing2() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section className="relative w-full bg-white dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px] w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-medium text-neutral-900 dark:text-white leading-tight mb-6">
            Choose The Plan That&apos;s Right For You
          </h1>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Limited-time discount
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 flex flex-col"
          >
            <h2 className="text-3xl font-medium text-neutral-900 dark:text-white mb-4">
              Free
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-12">
              Start exploring. A complete experience for occasional use.
            </p>

            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-500 mb-2">
                STARTER
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-medium text-neutral-900 dark:text-white">
                  £0
                </span>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Explore all available features with a content limit.
              </p>
            </div>

            <div className="flex-1" />

            <button className="w-full px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-medium text-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors duration-200">
              Sign up
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 flex flex-col"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="px-4 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black text-2xl font-medium">
                  Plus
                </span>
              </div>
              <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-full p-1">
                <button
                  onClick={() => setIsYearly(true)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    isYearly
                      ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                      : "text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  Yearly
                </button>
                <button
                  onClick={() => setIsYearly(false)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    !isYearly
                      ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                      : "text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-8">
              For your daily workflow. Remove all limits and make Craft your
              everyday creative home.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              <div className="flex flex-col">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-500 mb-2">
                  PLUS
                </p>
                <div className="mb-1">
                  <span className="text-sm line-through text-neutral-400 dark:text-neutral-600">
                    £8.00
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-3 relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isYearly ? "yearly-plus" : "monthly-plus"}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-4xl font-medium text-neutral-900 dark:text-white"
                    >
                      £{isYearly ? "4.80" : "8.00"}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-neutral-600 dark:text-neutral-400 text-sm">
                    /month
                  </span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 max-w-[30ch]">
                  One account: full-featured, no content limit. Ideal for
                  individual creators.
                </p>

                <div className="flex-1" />

                <button className="w-fit px-6 py-3 rounded-full bg-white shadow-md dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200 border border-neutral-200 dark:border-neutral-700">
                  Get Started
                </button>
              </div>

              <div className="flex flex-col">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-500 mb-2">
                  FAMILY
                </p>
                <div className="mb-1">
                  <span className="text-sm line-through text-neutral-400 dark:text-neutral-600">
                    £15.00
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-3 relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isYearly ? "yearly-family" : "monthly-family"}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-4xl font-medium text-neutral-900 dark:text-white"
                    >
                      £{isYearly ? "9.00" : "15.00"}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-neutral-600 dark:text-neutral-400 text-sm">
                    /month
                  </span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 max-w-[30ch]">
                  Fixed-price bundle of 2 to 6 Plus accounts. Collaborate in a
                  shared Space.
                </p>

                <div className="flex-1" />

                <button className="w-fit px-6 py-3 rounded-full bg-white shadow-md dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200 border border-neutral-200 dark:border-neutral-700">
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Users className="w-13 h-13 text-neutral-900 dark:text-white" />
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                Big team?
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Discount available for groups up to 15.
              </p>
            </div>
          </div>
          <button className="w-full sm:w-auto px-6 py-3 rounded-full bg-white shadow-md dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200 border border-neutral-200 dark:border-neutral-700">
            Contact Us
          </button>
        </motion.div>
      </div>
    </section>
  );
}
