"use client";

import { useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";

const faqs = [
  {
    question: "Can you help us plan the rollout?",
    answer:
      "Yes. Share your timeline and org structure and we'll map a staged rollout (pilot group, department waves, and launch comms) with a named specialist owning each checkpoint.",
  },
  {
    question: "How does procurement usually go?",
    answer:
      "We keep a ready-made vendor packet: company details, tax forms, DPA, SOC 2 report, and standard contract language. Most procurement reviews close within two weeks.",
  },
  {
    question: "Do you run training for new teams?",
    answer:
      "Every annual plan includes two live onboarding sessions, and our academy has role-based tracks your admins can assign. Recordings stay available to everyone in the workspace.",
  },
  {
    question: "What does priority support include?",
    answer:
      "A dedicated queue with same-business-day responses, incident routing straight to engineers, and a shared escalation channel for anything affecting production access.",
  },
  {
    question: "Can we start before contracts are signed?",
    answer:
      "Absolutely. The full product is available during evaluation, and anything you build carries straight over: no reset when the paperwork lands.",
  },
  {
    question: "Is there an implementation partner network?",
    answer:
      "Certified partners are available in North America and Europe for complex migrations, workflow redesign, and company-wide enablement programs.",
  },
  {
    question: "How are feature requests handled?",
    answer:
      "Requests are triaged weekly and linked to your account, so when something ships you hear about it directly. The public roadmap shows what's planned, building, and released.",
  },
  {
    question: "What if we outgrow our current plan?",
    answer:
      "Plans change in place: history, permissions, and integrations all carry over. Upgrades apply immediately and billing is prorated on the next invoice.",
  },
];

const stats = [
  { value: "2h", label: "Median first reply" },
  { value: "98%", label: "Support CSAT" },
];

export default function FAQ9() {
  const reduce = useReducedMotion();
  const [openIndex, setOpenIndex] = useState(0);
  const columns = [faqs.slice(0, 4), faqs.slice(4)];

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="w-full bg-white px-4 py-16 dark:bg-neutral-950 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
          <motion.aside
            initial={{ opacity: 0, y: reduce ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-between gap-12 rounded-3xl bg-neutral-900 p-7 ring-1 ring-neutral-950/10 dark:ring-white/10 sm:p-10 lg:sticky lg:top-24 lg:self-start"
          >
            <div>
              <h2 className="text-3xl font-medium leading-[1.1] tracking-tighter text-white sm:text-4xl lg:text-5xl">
                Questions that need a human?
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-neutral-400">
                The answers here cover the basics. For procurement, security
                reviews, or rollout planning, send us the messy context: a real
                person replies.
              </p>
            </div>
            <div>
              <div className="grid grid-cols-2 divide-x divide-white/10 border-y border-white/10">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`py-5 ${index === 0 ? "pr-6" : "pl-6"}`}
                  >
                    <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-neutral-400">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              <a
                href="#"
                className="group mt-8 inline-flex w-full items-center justify-between rounded-full bg-white px-6 py-3.5 text-sm font-medium text-neutral-900 transition-colors duration-200 hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 sm:w-auto sm:min-w-56"
              >
                Email the team
                <ArrowUpRight className="h-4 w-4 text-neutral-500 transition-colors duration-200 group-hover:text-neutral-900" />
              </a>
              <p className="mt-4 text-sm text-neutral-500">
                Weekdays 9:00–18:00 ET, worldwide.
              </p>
            </div>
          </motion.aside>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2"
          >
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="flex flex-col gap-4">
                {column.map((faq, indexInColumn) => {
                  const index = columnIndex * 4 + indexInColumn;
                  const isOpen = openIndex === index;
                  return (
                    <motion.div
                      key={faq.question}
                      variants={item}
                      className={`rounded-2xl border transition-colors duration-200 ${
                        isOpen
                          ? "border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900"
                          : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
                      }`}
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`faq9-answer-${index}`}
                        onClick={() => setOpenIndex(isOpen ? -1 : index)}
                        className="group flex w-full cursor-pointer items-start justify-between gap-4 rounded-2xl p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white sm:p-6"
                      >
                        <span className="flex-1 text-base font-medium leading-snug text-neutral-900 dark:text-white">
                          {faq.question}
                        </span>
                        <motion.span
                          animate={{ rotate: isOpen ? 45 : 0 }}
                          transition={{
                            duration: 0.35,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="mt-0.5 shrink-0 text-neutral-400 transition-colors duration-200 group-hover:text-neutral-900 dark:text-neutral-500 dark:group-hover:text-white"
                        >
                          <Plus className="h-4.5 w-4.5" />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={`faq9-answer-${index}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              height: {
                                duration: 0.4,
                                ease: [0.22, 1, 0.36, 1],
                              },
                              opacity: {
                                duration: 0.3,
                                ease: [0.22, 1, 0.36, 1],
                              },
                            }}
                            className="overflow-hidden"
                          >
                            <p className="px-5 pb-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:px-6 sm:pb-6">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
