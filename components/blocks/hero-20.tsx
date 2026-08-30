"use client";

import { ArrowRight } from "lucide-react";
import { motion, type Variants } from "motion/react";

const wordmarks = [
  {
    name: "Halcyon",
    className: "font-serif text-lg italic tracking-tight sm:text-xl",
  },
  {
    name: "VERTEX",
    className: "text-sm font-semibold tracking-[0.3em] sm:text-base",
  },
  {
    name: "loopwork",
    className: "text-lg font-medium tracking-tighter sm:text-xl",
  },
  {
    name: "Nimbus",
    className: "text-lg font-medium tracking-tight sm:text-xl",
  },
  {
    name: "FORMA",
    className: "text-base font-medium tracking-widest sm:text-lg",
  },
  {
    name: "arcline",
    className: "font-mono text-base tracking-tight sm:text-lg",
  },
];

const metrics = [
  { value: "4.2B", label: "Events processed daily" },
  { value: "38ms", label: "Median query time" },
  { value: "99.99%", label: "Uptime last 12 months" },
  { value: "3,100+", label: "Teams on Meridian" },
];

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const headline: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const group: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
};

const groupItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Hero20() {
  return (
    <section className="relative flex min-h-screen w-full items-start overflow-hidden bg-white px-4 py-16 dark:bg-neutral-950 sm:px-6 sm:py-20 lg:items-center lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_55%_100%_at_50%_0%,rgba(23,23,23,0.05),transparent)] dark:bg-[radial-gradient(ellipse_55%_100%_at_50%_0%,rgba(250,250,250,0.06),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-neutral-50 to-transparent dark:from-neutral-900/60" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col items-center text-center"
      >
        <motion.h1
          variants={headline}
          className="max-w-4xl text-5xl font-medium leading-[0.95] tracking-[-0.04em] text-neutral-950 dark:text-white sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Answers, not dashboards.
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-7 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg"
        >
          Meridian reads your product data and surfaces the few decisions that
          matter: every morning, for every team.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
        >
          <button className="inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 dark:focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950 sm:w-auto sm:px-8 sm:py-3.5 sm:text-base">
            Start free
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
          <button className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition-colors duration-200 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900 dark:focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950 sm:w-auto sm:px-8 sm:py-3.5 sm:text-base">
            See a live board
          </button>
        </motion.div>

        <motion.div variants={group} className="mt-20 w-full">
          <motion.p
            variants={groupItem}
            className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500"
          >
            Trusted by data teams at
          </motion.p>
          <div className="mx-auto mt-7 flex max-w-4xl flex-wrap items-baseline justify-center gap-x-10 gap-y-4 sm:gap-x-12 sm:[mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]">
            {wordmarks.map((mark) => (
              <motion.span
                key={mark.name}
                variants={groupItem}
                className={`select-none text-neutral-400 dark:text-neutral-600 ${mark.className}`}
              >
                {mark.name}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={group}
          className="mt-16 grid w-full max-w-5xl grid-cols-2 gap-y-10 border-y border-neutral-200 py-10 dark:border-neutral-800 lg:grid-cols-4 lg:divide-x lg:divide-neutral-200 dark:lg:divide-neutral-800"
        >
          {metrics.map((metric) => (
            <motion.div
              key={metric.label}
              variants={groupItem}
              className="flex flex-col items-center gap-2 px-4"
            >
              <span className="text-3xl font-semibold tracking-tight text-neutral-950 dark:text-white sm:text-4xl">
                {metric.value}
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">
                {metric.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Hero20;
