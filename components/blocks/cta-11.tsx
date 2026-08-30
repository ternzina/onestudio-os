"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";

const ledger = [
  {
    label: "Stripe payout",
    meta: "Today · 09:41",
    amount: "+$12,480.00",
    status: "Cleared",
  },
  {
    label: "Acme Corp",
    meta: "Wire · Invoice #2041",
    amount: "+$86,200.00",
    status: "Pending",
  },
  {
    label: "Refund batch",
    meta: "14 items",
    amount: "−$1,240.50",
    status: "Posted",
  },
];

const panel: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.09,
      delayChildren: 0.1,
    },
  },
};

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const echo: Variants = {
  hidden: { opacity: 0, y: 6, scale: 0.96 },
  show: {
    opacity: 1,
    y: -22,
    scale: 0.96,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const card: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const arrow: Variants = {
  hover: { x: 3, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
};

export default function CTA11() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="w-full bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[1400px]">
        <motion.div
          variants={panel}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 dark:border-white/[0.08] dark:bg-neutral-900"
        >
          <motion.div
            aria-hidden="true"
            animate={
              reduceMotion ? undefined : { x: [0, -36, 0], y: [0, 20, 0] }
            }
            transition={
              reduceMotion
                ? undefined
                : { duration: 18, repeat: Infinity, ease: "easeInOut" }
            }
            className="pointer-events-none absolute -top-32 right-[8%] h-[24rem] w-[24rem] rounded-full bg-white/80 blur-3xl dark:bg-white/[0.05]"
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
            <motion.div
              variants={list}
              className="max-w-xl px-6 pt-12 pb-2 sm:px-10 sm:pt-16 lg:py-20 lg:pl-16 lg:pr-0"
            >
              <motion.span
                variants={item}
                className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400"
              >
                Meridian · Revenue ops
              </motion.span>
              <motion.h2
                variants={item}
                className="mt-5 text-3xl font-semibold leading-[1.08] tracking-tight text-neutral-950 sm:text-4xl md:text-5xl dark:text-white"
              >
                Every payout, accounted for.
              </motion.h2>
              <motion.p
                variants={item}
                className="mt-5 max-w-lg text-base leading-relaxed text-neutral-600 sm:text-lg dark:text-neutral-400"
              >
                Meridian reconciles revenue across processors, banks, and your
                ledger: automatically. Close the books in an afternoon, not a
                week.
              </motion.p>
              <motion.div
                variants={item}
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
                <motion.a
                  href="#"
                  whileHover="hover"
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-neutral-950 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100 sm:w-auto dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-900"
                >
                  Start free trial
                  <motion.span variants={arrow} className="flex">
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </motion.span>
                </motion.a>
                <motion.a
                  href="#"
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-neutral-300 px-7 py-3.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100 sm:w-auto dark:border-white/15 dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-900"
                >
                  Book a demo
                </motion.a>
              </motion.div>
              <motion.p
                variants={item}
                className="mt-6 text-sm text-neutral-500 dark:text-neutral-400"
              >
                14-day trial · No credit card · SOC 2 Type II
              </motion.p>
            </motion.div>

            <div className="flex items-end justify-center px-6 pt-10 sm:px-10 lg:justify-end lg:pt-16 lg:pr-16">
              <div className="relative w-full max-w-md">
                <motion.div
                  variants={echo}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-2xl border border-neutral-200/80 bg-white/60 dark:border-white/[0.06] dark:bg-white/[0.04]"
                />
                <motion.div
                  variants={card}
                  className="relative rounded-t-2xl border border-b-0 border-neutral-200 bg-white p-6 pb-2 shadow-2xl shadow-neutral-900/10 sm:p-8 sm:pb-3 dark:border-white/10 dark:bg-neutral-950 dark:shadow-black/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      Operating balance
                    </span>
                    <span className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:border-white/10 dark:text-neutral-300">
                      USD
                    </span>
                  </div>
                  <p className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950 tabular-nums sm:text-5xl dark:text-white">
                    $128,340.19
                  </p>
                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                    +$12,480.00 settled today
                  </p>
                  <div className="mt-6 rounded-xl bg-neutral-950 py-3 text-center text-sm font-medium text-white dark:bg-white dark:text-neutral-950">
                    Move funds
                  </div>
                  <div className="mt-6">
                    {ledger.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between gap-4 border-t border-neutral-100 py-3.5 dark:border-white/[0.06]"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                            {row.label}
                          </p>
                          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                            {row.meta}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-sm font-medium text-neutral-900 tabular-nums dark:text-white">
                            {row.amount}
                          </span>
                          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
                            {row.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
