"use client";

import { Asterisk } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";

const mulberry32 = (seed: number) => {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const buildHalftone = () => {
  const rand = mulberry32(7);
  const size = 360;
  const step = 12;
  const dots: { x: number; y: number; r: number; o: number }[] = [];
  for (let y = step / 2; y < size; y += step) {
    for (let x = step / 2; x < size; x += step) {
      const density = Math.max(0, 1 - Math.hypot(x, y) / size);
      if (rand() > density * 1.15) continue;
      dots.push({
        x: Math.round((x + (rand() - 0.5) * 6) * 10) / 10,
        y: Math.round((y + (rand() - 0.5) * 6) * 10) / 10,
        r: Math.round((0.7 + density * 2.1 + rand() * 0.4) * 100) / 100,
        o: Math.round((0.3 + density * 0.55) * 100) / 100,
      });
    }
  }
  return dots;
};

const halftoneDots = buildHalftone();

const panel: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const field: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const HalftoneField = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 360 360" aria-hidden="true" className={className}>
    {halftoneDots.map((dot, i) => (
      <circle
        key={i}
        cx={dot.x}
        cy={dot.y}
        r={dot.r}
        opacity={dot.o}
        fill="currentColor"
      />
    ))}
  </svg>
);

export default function CTA13() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="w-full bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[1400px]">
        <motion.div
          variants={panel}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="relative overflow-hidden rounded-[2.5rem] border border-neutral-200 bg-neutral-100 dark:border-white/[0.08] dark:bg-neutral-900"
        >
          <motion.div
            variants={field}
            className="pointer-events-none absolute -left-10 -top-10 w-40 text-neutral-600 sm:w-72 dark:text-neutral-400"
          >
            <HalftoneField className="h-auto w-full opacity-80" />
          </motion.div>
          <motion.div
            variants={field}
            className="pointer-events-none absolute -right-14 -top-14 w-48 text-neutral-600 sm:w-96 dark:text-neutral-400"
          >
            <motion.div
              animate={reduceMotion ? undefined : { opacity: [0.85, 1, 0.85] }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 9, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <HalftoneField className="h-auto w-full rotate-90" />
            </motion.div>
          </motion.div>
          <motion.div
            variants={field}
            className="pointer-events-none absolute -bottom-12 -left-12 w-44 text-neutral-600 sm:w-80 dark:text-neutral-400"
          >
            <motion.div
              animate={reduceMotion ? undefined : { opacity: [1, 0.82, 1] }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 11, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <HalftoneField className="h-auto w-full -rotate-90" />
            </motion.div>
          </motion.div>
          <motion.div
            variants={field}
            className="pointer-events-none absolute -bottom-10 -right-10 w-40 text-neutral-600 sm:w-72 dark:text-neutral-400"
          >
            <HalftoneField className="h-auto w-full rotate-180 opacity-70" />
          </motion.div>

          <motion.div
            variants={list}
            className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center sm:px-12 sm:py-28 lg:py-32"
          >
            <motion.span
              variants={item}
              className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400"
            >
              <Asterisk className="h-4 w-4 text-neutral-900 dark:text-white" />
              The Foreword Panel
            </motion.span>

            <motion.h2
              variants={item}
              className="mt-7 font-serif text-4xl leading-[1.08] tracking-tight text-neutral-950 sm:text-5xl md:text-6xl dark:text-white"
            >
              Put your <em className="italic">taste</em> to work.
            </motion.h2>

            <motion.p
              variants={item}
              className="mt-6 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg dark:text-neutral-400"
            >
              Foreword pairs discerning reviewers with unreleased products.
              Preview what&apos;s next, say what you really think, and get paid
              for the feedback that shapes it.
            </motion.p>

            <motion.div variants={item} className="mt-10 w-full sm:w-auto">
              <motion.a
                href="#"
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-neutral-950 px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100 sm:w-auto dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-900"
              >
                Request an invite
              </motion.a>
            </motion.div>

            <motion.p
              variants={item}
              className="mt-6 text-sm text-neutral-500 dark:text-neutral-400"
            >
              Invites reviewed weekly · Panelists average $340/mo
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
