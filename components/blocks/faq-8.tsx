"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";

const tags = ["All", "Billing", "Account", "API", "Privacy"];

const faqs = [
  {
    tag: "Billing",
    question: "Why was my card charged twice this month?",
    answer:
      "Two charges usually mean a plan change mid-cycle: the prorated difference bills immediately, then the regular renewal follows. Both appear on one invoice in Settings → Billing. If the amounts don't add up, reply to the invoice email and we'll reconcile it within a day.",
  },
  {
    tag: "Billing",
    question: "Do you offer discounts for nonprofits or education?",
    answer:
      "Registered nonprofits and accredited educational institutions get 40% off any plan. Submit your documentation through the billing page: approval typically takes one business day and applies retroactively to the current cycle.",
  },
  {
    tag: "Account",
    question: "How do I transfer ownership of a workspace?",
    answer:
      "Any current owner can promote another admin to owner from Settings → Members. You'll confirm billing responsibility and recovery contacts during the handoff, and the transfer is recorded in the audit log.",
  },
  {
    tag: "Account",
    question: "Can I merge two accounts under one email?",
    answer:
      "Yes. Start a merge from the account you want to keep, verify both email addresses, and we'll combine workspaces, preserving history and permissions. Merges are reversible for 30 days.",
  },
  {
    tag: "API",
    question: "What are the API rate limits?",
    answer:
      "Standard keys allow 600 requests per minute with burst headroom, and responses include rate-limit headers so your clients can back off gracefully. Enterprise plans can request dedicated limits per key.",
  },
  {
    tag: "API",
    question: "Where do I find webhook delivery logs?",
    answer:
      "Every delivery attempt (payload, response code, latency, and retry schedule) is listed under Developers → Webhooks. Failed events retry with exponential backoff for 24 hours and can be replayed manually.",
  },
  {
    tag: "Privacy",
    question: "Can I export or delete all my personal data?",
    answer:
      "Both, at any time. Request a full export from Privacy settings and you'll receive a signed download link within minutes. Deletion requests complete within 30 days and cover backups, in line with GDPR and CCPA.",
  },
];

export default function FAQ8() {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [openQuestion, setOpenQuestion] = useState(faqs[0].question);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((faq) => {
      const matchesTag = activeTag === "All" || faq.tag === activeTag;
      const matchesQuery =
        !q || `${faq.question} ${faq.answer}`.toLowerCase().includes(q);
      return matchesTag && matchesQuery;
    });
  }, [query, activeTag]);

  const clearFilters = () => {
    setQuery("");
    setActiveTag("All");
  };

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
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto w-full max-w-3xl"
        >
          <motion.div variants={item} className="text-center">
            <h2 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-tight text-neutral-900 dark:text-white sm:text-4xl lg:text-5xl">
              How can we help?
            </h2>
          </motion.div>

          <motion.div variants={item} className="mt-8">
            <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 transition-colors duration-200 focus-within:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:focus-within:border-neutral-600">
              <Search className="h-5 w-5 shrink-0 text-neutral-400 dark:text-neutral-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search billing, exports, webhooks…"
                aria-label="Search frequently asked questions"
                className="w-full bg-transparent text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-white dark:placeholder:text-neutral-500"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors duration-200 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:text-neutral-500 dark:hover:text-white dark:focus-visible:ring-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-5 flex flex-wrap items-center justify-center gap-2"
          >
            {tags.map((tag) => {
              const isActive = activeTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveTag(tag)}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950 ${
                    isActive
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-white"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </motion.div>

          <motion.div variants={item} className="mt-10">
            {filtered.length > 0 ? (
              <div className="flex flex-col gap-3">
                {filtered.map((faq) => {
                  const isOpen = openQuestion === faq.question;
                  const panelId = `faq8-answer-${faq.question.replace(/\W+/g, "-").toLowerCase()}`;
                  return (
                    <div
                      key={faq.question}
                      className={`rounded-2xl border transition-colors duration-200 ${
                        isOpen
                          ? "border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900"
                          : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
                      }`}
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() =>
                          setOpenQuestion(isOpen ? "" : faq.question)
                        }
                        className="group flex w-full cursor-pointer items-center gap-4 rounded-2xl px-5 py-4.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white sm:px-6 sm:py-5"
                      >
                        <span className="flex-1 text-base font-medium leading-snug text-neutral-900 dark:text-white">
                          {faq.question}
                        </span>
                        <span className="hidden shrink-0 text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500 sm:block">
                          {faq.tag}
                        </span>
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{
                            duration: 0.35,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="shrink-0 text-neutral-400 transition-colors duration-200 group-hover:text-neutral-900 dark:text-neutral-500 dark:group-hover:text-white"
                        >
                          <ChevronDown className="h-4.5 w-4.5" />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={panelId}
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
                            <p className="px-5 pb-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:px-6 sm:pb-6 sm:text-base">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-dashed border-neutral-300 px-6 py-14 text-center dark:border-neutral-700"
              >
                <p className="text-base font-medium text-neutral-900 dark:text-white">
                  No results for &ldquo;{query.trim()}&rdquo;
                </p>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                  Try a different keyword, or clear the filters to browse all
                  seven answers.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 cursor-pointer rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-900 transition-colors duration-200 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-900 dark:focus-visible:ring-white"
                >
                  Clear filters
                </button>
              </motion.div>
            )}
          </motion.div>

          <motion.p
            variants={item}
            className="mt-10 text-center text-sm text-neutral-500 dark:text-neutral-400"
          >
            Can&rsquo;t find what you need?{" "}
            <a
              href="#"
              className="font-medium text-neutral-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:text-white dark:focus-visible:ring-white"
            >
              Talk to support
            </a>
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
