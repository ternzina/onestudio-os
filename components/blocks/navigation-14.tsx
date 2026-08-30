"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ChevronDown,
  Compass,
  FileText,
  LayoutDashboard,
  Menu,
  Radar,
  ScrollText,
  TrendingUp,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type SectionKey = "Product" | "Solutions" | "Resources";

type Section = {
  items: { icon: LucideIcon; title: string; description: string }[];
  featured: { tag: string; title: string; description: string };
};

const sections: Record<SectionKey, Section> = {
  Product: {
    items: [
      {
        icon: LayoutDashboard,
        title: "Command center",
        description:
          "One operating view for every launch, owner, and deadline.",
      },
      {
        icon: ScrollText,
        title: "Decision logs",
        description: "Turn scattered updates into a searchable product memory.",
      },
      {
        icon: Radar,
        title: "Signal review",
        description: "Rank feedback by source, volume, and revenue at stake.",
      },
    ],
    featured: {
      tag: "New",
      title: "Vault Signals is GA",
      description:
        "Cluster feedback from 40+ sources into themes your roadmap can act on.",
    },
  },
  Solutions: {
    items: [
      {
        icon: TrendingUp,
        title: "For growth teams",
        description:
          "Catch conversion blockers before they cost you a quarter.",
      },
      {
        icon: Workflow,
        title: "For operations",
        description:
          "Keep approvals, owners, and risk visible across workstreams.",
      },
      {
        icon: Compass,
        title: "For founders",
        description:
          "Bring customer evidence into every roadmap and revenue call.",
      },
    ],
    featured: {
      tag: "Case study",
      title: "How Relay cut churn 18%",
      description:
        "Six months of Vault reviews distilled into one retention play.",
    },
  },
  Resources: {
    items: [
      {
        icon: BookOpen,
        title: "Field notes",
        description:
          "Practical breakdowns from teams shipping complex products.",
      },
      {
        icon: FileText,
        title: "Playbooks",
        description:
          "Templates for launches, research reviews, and postmortems.",
      },
      {
        icon: BarChart3,
        title: "Benchmarks",
        description: "How 400 teams structure customer intelligence at scale.",
      },
    ],
    featured: {
      tag: "Guide",
      title: "The customer evidence stack",
      description:
        "A field guide to instrumenting decisions, not just dashboards.",
    },
  },
};

const sectionKeys = Object.keys(sections) as SectionKey[];

const arrowReveal: Variants = {
  rest: { opacity: 0, x: -4 },
  hover: { opacity: 1, x: 0 },
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950";

export default function Navigation14() {
  const [active, setActive] = useState<SectionKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<SectionKey | null>("Product");

  useEffect(() => {
    if (!active && !mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, mobileOpen]);

  return (
    <header className="w-full min-h-[var(--rb-section-min-h,100vh)] bg-white dark:bg-neutral-950 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        <div onMouseLeave={() => setActive(null)}>
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="border-b border-neutral-200 dark:border-neutral-800"
            aria-label="Primary"
          >
            <div className="mx-auto flex h-[72px] w-full max-w-[1400px] items-center justify-between gap-4">
              <div className="flex items-center gap-8">
                <a
                  href="#"
                  className={`flex items-center gap-2.5 rounded-sm text-neutral-950 dark:text-white ${focusRing}`}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-950 dark:bg-white">
                    <span className="h-2.5 w-2.5 rounded-[3px] border-[1.5px] border-white dark:border-neutral-950" />
                  </span>
                  <span className="text-[15px] font-semibold tracking-tight">
                    Vault
                  </span>
                </a>

                <div className="hidden items-center gap-1 md:flex">
                  {sectionKeys.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onMouseEnter={() => setActive(key)}
                      onFocus={() => setActive(key)}
                      onClick={() =>
                        setActive((value) => (value === key ? null : key))
                      }
                      aria-expanded={active === key}
                      aria-controls="nav14-panel"
                      className={`relative flex cursor-pointer items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${focusRing} ${
                        active === key
                          ? "text-neutral-950 dark:text-white"
                          : "text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                      }`}
                    >
                      {active === key && (
                        <motion.span
                          layoutId="nav14-trigger"
                          className="absolute inset-0 rounded-full bg-neutral-100 dark:bg-neutral-800/80"
                          transition={{ duration: 0.3, ease: EASE }}
                        />
                      )}
                      <span className="relative">{key}</span>
                      <motion.span
                        className="relative"
                        animate={{ rotate: active === key ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: EASE }}
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </motion.span>
                    </button>
                  ))}
                  <a
                    href="#"
                    onMouseEnter={() => setActive(null)}
                    className={`rounded-full px-3.5 py-2 text-sm font-medium text-neutral-500 transition-colors duration-200 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white ${focusRing}`}
                  >
                    Pricing
                  </a>
                </div>
              </div>

              <div className="hidden items-center gap-2 md:flex">
                <a
                  href="#"
                  className={`rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition-colors duration-200 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white ${focusRing}`}
                >
                  Log in
                </a>
                <a
                  href="#"
                  className={`rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 ${focusRing}`}
                >
                  Request access
                </a>
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen((value) => !value)}
                aria-expanded={mobileOpen}
                aria-controls="nav14-mobile"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-neutral-950 transition-colors duration-200 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-900 md:hidden ${focusRing}`}
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </motion.nav>

          <AnimatePresence>
            {active && (
              <motion.div
                key="panel"
                id="nav14-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="hidden overflow-hidden border-b border-neutral-200 dark:border-neutral-800 md:block"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="mx-auto grid w-full max-w-[1400px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8"
                  >
                    <div className="grid gap-1 sm:grid-cols-3">
                      {sections[active].items.map((item) => (
                        <motion.a
                          key={item.title}
                          href="#"
                          initial="rest"
                          animate="rest"
                          whileHover="hover"
                          className={`group flex h-full flex-col rounded-2xl p-4 transition-colors duration-200 hover:bg-neutral-50 dark:hover:bg-neutral-900 ${focusRing}`}
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition-colors duration-200 group-hover:border-neutral-300 group-hover:text-neutral-950 dark:border-neutral-800 dark:text-neutral-300 dark:group-hover:border-neutral-700 dark:group-hover:text-white">
                            <item.icon className="h-4 w-4" />
                          </span>
                          <span className="mt-4 flex items-center gap-1.5 text-sm font-medium text-neutral-950 dark:text-white">
                            {item.title}
                            <motion.span
                              variants={arrowReveal}
                              transition={{ duration: 0.2, ease: EASE }}
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                            </motion.span>
                          </span>
                          <span className="mt-1.5 block text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                            {item.description}
                          </span>
                        </motion.a>
                      ))}
                    </div>

                    <a
                      href="#"
                      className={`group flex flex-col justify-between rounded-2xl bg-neutral-50 p-5 transition-colors duration-200 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800/80 ${focusRing}`}
                    >
                      <span className="inline-flex w-fit items-center rounded-full border border-neutral-300 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
                        {sections[active].featured.tag}
                      </span>
                      <span className="mt-6">
                        <span className="block text-sm font-semibold text-neutral-950 dark:text-white">
                          {sections[active].featured.title}
                        </span>
                        <span className="mt-1.5 block text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                          {sections[active].featured.description}
                        </span>
                        <span className="mt-4 flex items-center gap-1.5 text-sm font-medium text-neutral-950 dark:text-white">
                          Learn more
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </span>
                    </a>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              id="nav14-mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="overflow-hidden md:hidden"
            >
              <div className="border-b border-neutral-200 dark:border-neutral-800">
                <div className="mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6 lg:px-8">
                  {sectionKeys.map((key) => (
                    <div key={key}>
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded((value) => (value === key ? null : key))
                        }
                        aria-expanded={expanded === key}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-3.5 text-left text-[15px] font-medium text-neutral-950 transition-colors duration-200 hover:bg-neutral-50 dark:text-white dark:hover:bg-neutral-900 ${focusRing}`}
                      >
                        {key}
                        <motion.span
                          animate={{ rotate: expanded === key ? 180 : 0 }}
                          transition={{ duration: 0.25, ease: EASE }}
                        >
                          <ChevronDown className="h-4 w-4 text-neutral-500" />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {expanded === key && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: EASE }}
                            className="overflow-hidden"
                          >
                            <div className="grid gap-1 px-3 pb-3">
                              {sections[key].items.map((item) => (
                                <a
                                  key={item.title}
                                  href="#"
                                  onClick={() => setMobileOpen(false)}
                                  className={`flex items-start gap-3 rounded-xl p-3 transition-colors duration-200 hover:bg-neutral-50 dark:hover:bg-neutral-900 ${focusRing}`}
                                >
                                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 dark:border-neutral-800 dark:text-neutral-300">
                                    <item.icon className="h-4 w-4" />
                                  </span>
                                  <span>
                                    <span className="block text-sm font-medium text-neutral-950 dark:text-white">
                                      {item.title}
                                    </span>
                                    <span className="mt-0.5 block text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                                      {item.description}
                                    </span>
                                  </span>
                                </a>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                  <a
                    href="#"
                    onClick={() => setMobileOpen(false)}
                    className={`mt-2 flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-[15px] font-medium text-neutral-950 transition-colors duration-200 hover:bg-neutral-50 dark:text-white dark:hover:bg-neutral-900 ${focusRing}`}
                  >
                    Pricing
                  </a>
                  <div className="mt-3 grid gap-2 px-3">
                    <a
                      href="#"
                      className={`rounded-full border border-neutral-300 px-5 py-3 text-center text-sm font-medium text-neutral-900 transition-colors duration-200 hover:bg-neutral-50 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-900 ${focusRing}`}
                    >
                      Log in
                    </a>
                    <a
                      href="#"
                      className={`rounded-full bg-black px-5 py-3 text-center text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 ${focusRing}`}
                    >
                      Request access
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
