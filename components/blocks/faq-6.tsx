"use client";

import { useState } from "react";
import { ArrowUpRight, ChevronDown, Mail, MessageCircle } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";

const faqs = [
  {
    question: "How long does it take to get set up?",
    answer:
      "Most teams issue their first cards the same day they sign up. Connecting your accounting stack, importing your chart of accounts, and tuning approval policies usually takes two to three days: a specialist stays with you throughout.",
  },
  {
    question: "Can we set spend limits per team or vendor?",
    answer:
      "Yes: limits work per card, per person, per team, or per vendor, on daily, monthly, or per-transaction windows. When someone hits a limit they can request an increase in-app, and the approver sees full context before deciding.",
  },
  {
    question: "How does receipt matching work?",
    answer:
      "Snap a photo, forward the email, or let the mobile app prompt you seconds after a charge. Receipts match to transactions automatically, and anything missing is chased for you ahead of month-end close.",
  },
  {
    question: "Does Ledger sync with our accounting software?",
    answer:
      "We maintain native two-way syncs for QuickBooks, Xero, and NetSuite, with field-level mapping for classes, departments, and tax codes. For anything else there's a clean CSV export and a full API.",
  },
  {
    question: "What happens if a card is compromised?",
    answer:
      "Freeze it instantly from any device and issue a replacement virtual card in seconds. Physical replacements ship the same business day, and our team handles the dispute end to end.",
  },
];

const channels = [
  {
    icon: MessageCircle,
    label: "Live chat",
    detail: "Weekdays, 9:00–18:00 ET",
  },
  {
    icon: Mail,
    label: "support@ledger.app",
    detail: "Replies in about two hours",
  },
];

export default function FAQ6() {
  const reduce = useReducedMotion();
  const [openIndex, setOpenIndex] = useState(0);

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="w-full bg-white px-4 py-16 dark:bg-neutral-950 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16 xl:gap-20">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <motion.h2
              variants={item}
              className="text-3xl font-medium leading-[1.1] tracking-tighter text-neutral-900 dark:text-white sm:text-4xl lg:text-5xl"
            >
              Everything teams ask before switching.
            </motion.h2>
            <motion.p
              variants={item}
              className="mt-5 max-w-md text-base leading-relaxed text-neutral-600 dark:text-neutral-400"
            >
              The practical details finance teams want to know before moving
              their spend to Ledger. Answers from the team, not a chatbot.
            </motion.p>
            <motion.div
              variants={item}
              className="mt-10 max-w-md divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800"
            >
              {channels.map((channel) => (
                <a
                  key={channel.label}
                  href="#"
                  className="group flex items-center gap-4 bg-neutral-50 p-5 transition-colors duration-200 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-900 dark:bg-neutral-900 dark:hover:bg-neutral-800/70 dark:focus-visible:ring-white"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-neutral-700 ring-1 ring-neutral-200 dark:bg-neutral-950 dark:text-neutral-300 dark:ring-neutral-800">
                    <channel.icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-neutral-900 dark:text-white">
                      {channel.label}
                    </span>
                    <span className="mt-0.5 block text-sm text-neutral-500 dark:text-neutral-400">
                      {channel.detail}
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-400 transition-colors duration-200 group-hover:text-neutral-900 dark:text-neutral-500 dark:group-hover:text-white" />
                </a>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="border-t border-neutral-200 dark:border-neutral-800"
          >
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div
                  key={faq.question}
                  variants={item}
                  className="border-b border-neutral-200 dark:border-neutral-800"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq6-panel-${index}`}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="group flex w-full cursor-pointer items-start gap-5 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white sm:gap-8 sm:py-7"
                  >
                    <span
                      className={`w-8 shrink-0 pt-1 text-sm tabular-nums transition-colors duration-200 ${
                        isOpen
                          ? "text-neutral-900 dark:text-white"
                          : "text-neutral-400 dark:text-neutral-600"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-base font-medium leading-snug text-neutral-900 transition-colors duration-200 group-hover:text-neutral-600 dark:text-white dark:group-hover:text-neutral-300 sm:text-lg">
                      {faq.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
                        isOpen
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                          : "bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:group-hover:bg-neutral-800"
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq6-panel-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                          opacity: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                        }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-6 pl-13 pr-6 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:pb-7 sm:pl-16 sm:text-base">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
