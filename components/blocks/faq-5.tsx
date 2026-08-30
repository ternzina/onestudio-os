"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Plus, Minus, ArrowRight, ArrowUpRight } from "lucide-react";

const faqs = [
  {
    q: "How quickly can my team get started?",
    a: "Most teams are up and running in under an hour. Sign up, connect your workspace, and import your data, we'll handle the rest.",
  },
  {
    q: "What integrations do you offer?",
    a: "We integrate with dozens of tools out of the box, including SSO providers, Slack, Teams, Jira, major HRIS platforms, and more.",
    cta: "See all integrations",
  },
  {
    q: "Does every plan include human support?",
    a: "Yes. Every paid plan comes with a dedicated success manager and access to 24/5 live chat support.",
  },
  {
    q: "Is there a minimum team size?",
    a: "No minimum. Pricing scales with your team, starting at just a handful of seats.",
  },
  {
    q: "Which currencies can I be billed in?",
    a: "We support billing in USD, EUR, GBP, CAD, and AUD by default, with more currencies available on request.",
  },
  {
    q: "Can I switch between monthly and annual billing?",
    a: "Anytime. Switch in your account settings, annual plans include a discount and are billed up front.",
  },
];

export default function Faq5() {
  const [open, setOpen] = useState(1);

  return (
    <section className="w-full min-h-[var(--rb-section-min-h,100vh)] flex items-start py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-3xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-700 dark:text-neutral-300">
            Not finding what you were looking for?{" "}
            <a
              href="#"
              className="text-neutral-900 dark:text-white font-medium inline-flex items-center gap-1 hover:underline"
            >
              Talk to us <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </p>
        </motion.div>

        <div className="mt-10 flex flex-col gap-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.04 * i }}
                className={`rounded-2xl transition-colors ${
                  isOpen
                    ? "bg-white dark:bg-neutral-900 shadow-sm"
                    : "bg-neutral-100 dark:bg-neutral-900/60"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left cursor-pointer"
                >
                  <span
                    className={`flex-1 text-sm sm:text-base ${
                      isOpen
                        ? "font-semibold text-neutral-900 dark:text-white"
                        : "font-normal text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <Minus className="w-4 h-4 text-neutral-900 dark:text-white shrink-0" />
                  ) : (
                    <Plus className="w-4 h-4 text-neutral-500 dark:text-neutral-500 shrink-0" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {faq.a}
                        {faq.cta && (
                          <a
                            href="#"
                            className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs sm:text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                          >
                            {faq.cta}
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
