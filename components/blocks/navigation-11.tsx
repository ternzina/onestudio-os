"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ExternalLink, Menu, X } from "lucide-react";

const menu: Record<
  string,
  { heading: string; cards: { title: string; desc: string; img: string }[] }
> = {
  Overview: {
    heading: "Overview",
    cards: [
      {
        title: "100+ Lab Tests",
        desc: "A full panel reviewed by clinicians, refreshed every six months.",
        img: "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=800&auto=format&fit=crop",
      },
      {
        title: "Member Portal",
        desc: "Track trends, flag changes, and annotate results over time.",
        img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
      },
      {
        title: "Coaching Calls",
        desc: "Quarterly sessions with a health coach matched to your goals.",
        img: "https://images.unsplash.com/photo-1573497491208-6b1acb260507?q=80&w=800&auto=format&fit=crop",
      },
      {
        title: "Preventive Plans",
        desc: "Clear next steps tailored to what your numbers are saying.",
        img: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800&auto=format&fit=crop",
      },
    ],
  },
  Stories: {
    heading: "Stories",
    cards: [
      {
        title: "From burnt out to steady",
        desc: "How Ana rebuilt her energy in six months of steady check-ins.",
        img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
      },
      {
        title: "A founder's reset",
        desc: "Marcus on stopping the grind long enough to read his own labs.",
        img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
      },
      {
        title: "Finding the small flag",
        desc: "Why Priya credits Northwind with catching a marker early.",
        img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop",
      },
      {
        title: "Back to the trails",
        desc: "Dan's return to weekly 10ks after a year of chasing sleep.",
        img: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800&auto=format&fit=crop",
      },
    ],
  },
  "Our Why": {
    heading: "Our Why",
    cards: [
      {
        title: "Quiet medicine",
        desc: "We believe in care that listens longer than it prescribes.",
        img: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=800&auto=format&fit=crop",
      },
      {
        title: "Whole-body view",
        desc: "One panel, read together, not scattered across specialists.",
        img: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=800&auto=format&fit=crop",
      },
      {
        title: "Research first",
        desc: "Peer-reviewed signals over whatever is loud this week.",
        img: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=800&auto=format&fit=crop",
      },
      {
        title: "Built to last",
        desc: "A practice you stay with, not a subscription you churn from.",
        img: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?q=80&w=800&auto=format&fit=crop",
      },
    ],
  },
  FAQs: {
    heading: "FAQs",
    cards: [
      {
        title: "How does billing work?",
        desc: "Monthly or annual, cancel anytime, no prorated surprises.",
        img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop",
      },
      {
        title: "Who reads my results?",
        desc: "A licensed clinician on the Northwind team, not a model.",
        img: "https://images.unsplash.com/photo-1550831107-1553da8c8464?q=80&w=800&auto=format&fit=crop",
      },
      {
        title: "Does this replace doctors?",
        desc: "No. We're the panel between your annual visits.",
        img: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800&auto=format&fit=crop",
      },
      {
        title: "Where is testing done?",
        desc: "At accredited partner labs in all 50 states.",
        img: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=800&auto=format&fit=crop",
      },
    ],
  },
};

const links = ["Overview", "Stories", "Our Why", "FAQs"] as const;

export default function Navigation11() {
  const [active, setActive] = useState<(typeof links)[number] | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = active ? menu[active] : null;

  return (
    <section className="w-full min-h-[var(--rb-section-min-h,100vh)] bg-white dark:bg-neutral-950 flex items-start py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div
        className="max-w-[1400px] mx-auto w-full flex flex-col gap-4"
        onMouseLeave={() => setActive(null)}
      >
        <motion.nav
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-full bg-neutral-900 dark:bg-neutral-900 border border-neutral-800 pl-1.5 md:pl-6 pr-1.5 py-1.5 flex items-center justify-between gap-2"
        >
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <button
                key={l}
                type="button"
                onMouseEnter={() => setActive(l)}
                onFocus={() => setActive(l)}
                onClick={() => setActive((a) => (a === l ? null : l))}
                className={`text-sm transition-colors cursor-pointer py-2 ${
                  active === l
                    ? "text-white"
                    : "text-neutral-300 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 md:contents">
            <button
              type="button"
              onClick={() => {
                setMobileOpen((o) => !o);
                if (mobileOpen) setActive(null);
              }}
              aria-label="Toggle menu"
              className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-full text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <a
              href="#"
              className="md:absolute md:left-1/2 md:-translate-x-1/2 text-white font-semibold text-base sm:text-lg tracking-tight lowercase pointer-events-none whitespace-nowrap"
            >
              northwind
            </a>
          </div>

          <div className="flex items-center gap-1">
            <a
              href="#"
              className="hidden sm:inline-flex text-sm text-neutral-300 hover:text-white px-3 py-2"
            >
              Login
            </a>
            <button className="inline-flex items-center rounded-full bg-orange-500 text-white text-xs sm:text-sm font-medium px-3 sm:px-5 py-2 hover:bg-orange-600 transition-colors cursor-pointer whitespace-nowrap">
              Start Testing
            </button>
          </div>
        </motion.nav>

        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.div
              key="mobile-links"
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="md:hidden rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              <div className="flex flex-col p-2">
                {links.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setActive((a) => (a === l ? null : l))}
                    className={`text-left text-sm rounded-2xl px-4 py-3 transition-colors cursor-pointer ${
                      active === l
                        ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {current && (
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              <div className="p-4 sm:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <p className="text-lg font-medium text-neutral-900 dark:text-white">
                      {current.heading}
                    </p>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {current.cards.map((c) => (
                        <a
                          key={c.title}
                          href="#"
                          className="group rounded-2xl bg-neutral-50 dark:bg-neutral-800 overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                        >
                          <div className="aspect-4/3 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                            <img
                              src={c.img}
                              alt=""
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                          </div>
                          <div className="p-4">
                            <div className="flex items-center gap-1 text-sm font-medium text-neutral-900 dark:text-white">
                              {c.title}
                              <ChevronRight className="h-4 w-4 text-neutral-500 transition-transform group-hover:translate-x-0.5" />
                            </div>
                            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                              {c.desc}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 pt-5 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between text-xs text-neutral-600 dark:text-neutral-400">
                  <div className="flex flex-wrap items-center gap-4">
                    <a
                      href="#"
                      className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white"
                    >
                      World&apos;s Healthiest{" "}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <a
                      href="#"
                      className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white"
                    >
                      The Founder Health Coalition{" "}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <a
                      href="#"
                      className="hover:text-neutral-900 dark:hover:text-white"
                    >
                      Privacy Policy
                    </a>
                    <a
                      href="#"
                      className="hover:text-neutral-900 dark:hover:text-white"
                    >
                      Informed Medical Consent
                    </a>
                    <a
                      href="#"
                      className="hover:text-neutral-900 dark:hover:text-white"
                    >
                      Terms & Conditions
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
