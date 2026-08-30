"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Check,
  CreditCard,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const features = [
  "Every component, block, and template",
  "Unlimited projects and seats",
  "Lifetime updates while subscribed",
  "Private Slack channel with the team",
  "Design reviews on request",
  "Priority fixes within one business day",
  "Figma library with tokens synced",
  "Cancel or pause in one click",
];

const assurances = [
  { icon: ShieldCheck, label: "SOC 2 Type II certified" },
  { icon: RefreshCcw, label: "14-day money-back guarantee" },
  { icon: CreditCard, label: "No card required to browse" },
];

const periods = [
  { id: "monthly", label: "Monthly" },
  { id: "annual", label: "Annual", badge: "−20%" },
] as const;

export default function Pricing12() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const reduceMotion = useReducedMotion();

  const price = billing === "annual" ? 63 : 79;
  const shift = reduceMotion ? 0 : 18;

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: shift },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  };

  return (
    <section className="w-full bg-white dark:bg-neutral-950 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={container}
        className="max-w-[1400px] mx-auto w-full"
      >
        <motion.div variants={item} className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tighter leading-tight text-neutral-900 dark:text-white">
            One plan. The whole studio.
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
            Every component, block, and template we ship, plus direct access to
            the team that builds them. No tiers to outgrow.
          </p>
        </motion.div>

        <motion.div variants={item} className="mt-10 flex justify-center">
          <div
            role="group"
            aria-label="Billing period"
            className="inline-flex rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 p-1"
          >
            {periods.map((period) => (
              <button
                key={period.id}
                type="button"
                aria-pressed={billing === period.id}
                onClick={() => setBilling(period.id)}
                className={`relative cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100 dark:focus-visible:ring-offset-neutral-900 ${
                  billing === period.id
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {billing === period.id && (
                  <motion.span
                    layoutId="pricing12-billing-thumb"
                    transition={{
                      duration: reduceMotion ? 0 : 0.35,
                      ease: EASE,
                    }}
                    className="absolute inset-0 rounded-full bg-white dark:bg-neutral-800 shadow-sm"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {period.label}
                  {"badge" in period && (
                    <span className="rounded-full bg-neutral-900 dark:bg-white px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white dark:text-neutral-900">
                      {period.badge}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="mx-auto mt-10 w-full max-w-5xl rounded-3xl border border-neutral-800 bg-neutral-950 dark:bg-neutral-900 shadow-2xl shadow-neutral-950/15 dark:shadow-none"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-6 sm:p-10 lg:p-12">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-neutral-200">
                <BadgeCheck className="h-3.5 w-3.5" />
                The Studio plan
              </span>

              <div className="mt-8 flex items-baseline gap-1.5">
                <span className="text-2xl font-medium text-neutral-500">$</span>
                <span className="relative inline-grid overflow-hidden">
                  <span
                    aria-hidden="true"
                    className="invisible col-start-1 row-start-1 text-6xl sm:text-7xl font-semibold tracking-tight tabular-nums"
                  >
                    {price}
                  </span>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={price}
                      initial={{ opacity: 0, y: shift }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -shift }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.3,
                        ease: EASE,
                      }}
                      className="col-start-1 row-start-1 text-6xl sm:text-7xl font-semibold tracking-tight tabular-nums text-white"
                    >
                      {price}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className="text-base text-neutral-500">/ month</span>
              </div>

              <div className="mt-3 min-h-5">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={billing}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.2 }}
                    className="text-sm text-neutral-400"
                  >
                    {billing === "annual"
                      ? "Billed as $756 once a year: save 20%."
                      : "Billed monthly. Switch to annual anytime."}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <button className="w-full sm:w-auto cursor-pointer rounded-full bg-white px-8 py-3.5 text-sm font-medium text-neutral-950 transition-colors duration-200 hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 dark:focus-visible:ring-offset-neutral-900">
                  Become a member
                </button>
                <a
                  href="#"
                  className="text-sm font-medium text-neutral-400 underline underline-offset-4 decoration-neutral-700 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 dark:focus-visible:ring-offset-neutral-900 rounded-sm"
                >
                  Talk to a human first
                </a>
              </div>

              <div className="mt-10 pt-6">
                <p className="text-xs leading-relaxed text-neutral-500">
                  Prices in USD. VAT calculated at checkout. Membership covers
                  your entire team under one workspace.
                </p>
              </div>
            </div>

            <div className="border-t lg:border-t-0 lg:border-l border-white/10 p-6 sm:p-10 lg:p-12">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                Everything included
              </p>
              <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm leading-relaxed text-neutral-300"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-3"
        >
          {assurances.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400"
            >
              <Icon className="h-4 w-4" />
              {label}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
