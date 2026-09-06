"use client";

import {
  ArrowRight,
  FileText,
  GitPullRequest,
  Search,
  Sparkle,
  Sparkles,
  Users,
} from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";

const scopes = [
  { label: "All", count: 24, active: true },
  { label: "Docs", count: 9, active: false },
  { label: "Actions", count: 6, active: false },
  { label: "People", count: 3, active: false },
];

const results = [
  {
    icon: FileText,
    title: "Q3 launch brief",
    source: "Notion",
    active: true,
  },
  {
    icon: GitPullRequest,
    title: "payments-retry #482 needs review",
    source: "GitHub",
    active: false,
  },
  {
    icon: Users,
    title: "Platform on-call rotation",
    source: "PagerDuty",
    active: false,
  },
  {
    icon: Sparkles,
    title: "Draft a standup summary from yesterday",
    source: "Ask AI",
    active: false,
  },
];

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const headline: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

const panel: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.06,
      delayChildren: 0.2,
    },
  },
};

const row: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-neutral-200 bg-white px-1.5 text-[11px] font-medium text-neutral-500 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
      {children}
    </kbd>
  );
}

export function Hero18() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-screen w-full items-start overflow-hidden bg-white px-4 py-16 dark:bg-neutral-950 sm:px-6 sm:py-20 lg:items-center lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(23,23,23,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,23,23,0.045)_1px,transparent_1px)] bg-[size:96px_96px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_38%,black,transparent)] dark:bg-[linear-gradient(to_right,rgba(250,250,250,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(250,250,250,0.05)_1px,transparent_1px)]" />
        <div className="absolute left-[6%] top-[38%] hidden h-56 w-36 bg-[radial-gradient(rgba(23,23,23,0.14)_1px,transparent_1px)] bg-[size:11px_11px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)] dark:bg-[radial-gradient(rgba(250,250,250,0.12)_1px,transparent_1px)] lg:block" />
        <div className="absolute right-[6%] top-[24%] hidden h-56 w-36 bg-[radial-gradient(rgba(23,23,23,0.14)_1px,transparent_1px)] bg-[size:11px_11px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)] dark:bg-[radial-gradient(rgba(250,250,250,0.12)_1px,transparent_1px)] lg:block" />
        <div className="absolute left-1/2 top-1/3 h-[360px] w-[720px] max-w-[110vw] -translate-x-1/2 rounded-full bg-neutral-100/80 blur-[110px] dark:bg-neutral-900/60" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col items-center text-center"
      >
        <motion.div
          variants={item}
          className="inline-flex items-center gap-2.5 rounded-full border border-neutral-200 bg-white/80 py-1.5 pl-1.5 pr-4 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80"
        >
          <span className="inline-flex items-center rounded-full bg-neutral-950 px-2.5 py-0.5 text-[11px] font-medium text-white dark:bg-white dark:text-neutral-950">
            ⌘K
          </span>
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300 sm:text-sm">
            Introducing AI actions
          </span>
        </motion.div>

        <motion.h1
          variants={headline}
          className="mt-8 max-w-4xl text-4xl font-medium leading-[1.02] tracking-[-0.04em] text-neutral-950 dark:text-white sm:text-6xl md:text-7xl"
        >
          Every tool you use,
          <br />
          <span className="text-neutral-500 dark:text-neutral-400">
            one keystroke away.
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg"
        >
          Waypoint indexes your docs, repos, people, and actions into a single
          command bar that answers before you finish typing.
        </motion.p>

        <motion.div
          variants={panel}
          className="mt-12 w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white text-left shadow-2xl shadow-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-black/50"
        >
          <div className="flex items-center gap-3 border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
            <Search className="h-5 w-5 shrink-0 text-neutral-400 dark:text-neutral-500" />
            <div className="flex min-w-0 flex-1 items-center">
              <span className="truncate text-sm text-neutral-950 dark:text-white sm:text-base">
                launch
              </span>
              {!reduceMotion && (
                <motion.span
                  aria-hidden="true"
                  className="ml-px inline-block h-5 w-px bg-neutral-950 dark:bg-white"
                  animate={{ opacity: [1, 1, 0, 0] }}
                  transition={{
                    duration: 1.06,
                    times: [0, 0.5, 0.5, 1],
                    repeat: Infinity,
                  }}
                />
              )}
            </div>
            <Key>esc</Key>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto px-3 pt-3">
            {scopes.map((scope) => (
              <span
                key={scope.label}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                  scope.active
                    ? "bg-neutral-100 text-neutral-950 dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {scope.label}
                <span
                  className={
                    scope.active
                      ? "text-neutral-400 dark:text-neutral-500"
                      : "text-neutral-300 dark:text-neutral-600"
                  }
                >
                  {scope.count}
                </span>
              </span>
            ))}
          </div>

          <div className="px-5 pb-1 pt-4">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
              Top results
            </span>
          </div>

          <div className="flex flex-col gap-0.5 px-2 pb-2">
            {results.map(({ icon: Icon, title, source, active }) => (
              <motion.div
                key={title}
                variants={row}
                className={`relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 ${
                  active ? "bg-neutral-100 dark:bg-neutral-800/70" : ""
                }`}
              >
                {active && !reduceMotion && (
                  <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-neutral-950/[0.045] to-transparent dark:via-white/[0.07]"
                    initial={{ x: "-140%" }}
                    animate={{ x: "140%" }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      repeatDelay: 2.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                )}
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="relative min-w-0 flex-1 truncate text-sm font-medium text-neutral-950 dark:text-white">
                  {title}
                </span>
                <span className="relative hidden shrink-0 text-xs text-neutral-400 dark:text-neutral-500 sm:block">
                  {source}
                </span>
                {active && (
                  <span className="relative flex shrink-0 items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="hidden sm:inline">Open</span>
                    <Key>↵</Key>
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3 dark:border-neutral-800">
            <div className="flex items-center gap-4 text-xs text-neutral-400 dark:text-neutral-500">
              <span className="flex items-center gap-1.5">
                <Key>↑</Key>
                <Key>↓</Key>
                <span className="hidden sm:inline">navigate</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Key>↵</Key>
                <span className="hidden sm:inline">open</span>
              </span>
            </div>
            <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
              Waypoint
            </span>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row"
        >
          <button className="inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 dark:focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950 sm:w-auto sm:px-7">
            Get Waypoint free
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </button>
          <p className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            or press <Key>⌘</Key> <Key>K</Key> anywhere
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Hero18;
