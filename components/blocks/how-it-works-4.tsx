"use client";

import { motion } from "motion/react";
import { Check, ArrowRight } from "lucide-react";

const stages = [
  {
    label: "Today",
    title: "Get started.",
    items: [
      "Connect your ERP in five minutes",
      "Upload your policy in two minutes",
      "Issue yourself a card in one minute",
    ],
  },
  {
    label: "Day 5",
    title: "Get comfortable.",
    items: [
      "Connect to HRIS, email, and 200+ apps",
      "Set up approvals and controls",
      "Issue cards to employees",
    ],
  },
  {
    label: "Day 30",
    title: "Ask why you didn't switch years ago.",
    items: [
      "100% of business spend moved to Northwind",
      "Intake-to-pay 8.5x more efficient",
      "Books close 75% faster",
    ],
  },
];

export default function HowItWorks4() {
  return (
    <section className="w-full min-h-[var(--rb-section-min-h,100vh)] flex items-start py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-[1400px] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center gap-3"
        >
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            New software should not take a year to implement.
          </p>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-semibold text-neutral-900 dark:text-white tracking-tight leading-tight max-w-3xl">
            Here is what you can get done with Northwind in just 30 days.
          </h2>
          <a
            href="#"
            className="mt-2 inline-flex items-center gap-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
          >
            Switch to Northwind <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </motion.div>

        <div className="relative mt-12 sm:mt-16">
          <div className="grid grid-cols-3 items-center">
            {stages.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className="flex justify-center"
              >
                <span className="px-4 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white">
                  {s.label}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="relative mt-5 h-3 flex items-center">
            <div className="absolute left-[16.66%] right-[16.66%] h-px bg-neutral-300 dark:bg-neutral-700" />
            {stages.map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="absolute w-2.5 h-2.5 rounded-full border-2 border-neutral-400 dark:border-neutral-500 bg-white dark:bg-neutral-900"
                style={{ left: `calc(${16.66 + 33.33 * i}% - 5px)` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {stages.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col gap-4"
            >
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {s.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {s.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    <Check
                      className="w-4 h-4 mt-0.5 text-neutral-500 dark:text-neutral-400 shrink-0"
                      strokeWidth={2.5}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
