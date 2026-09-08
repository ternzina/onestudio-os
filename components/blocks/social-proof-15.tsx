"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const stories = [
  {
    quote:
      "We stopped treating feedback like a pile of screenshots. The signal is clean enough that roadmap meetings are finally calm.",
    name: "Elena Ross",
    role: "VP Product, Kinship",
    metric: "41% faster planning cycles",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "The first week felt like moving from a hallway conversation to a proper studio table. Suddenly everyone could see what mattered.",
    name: "Andre Miles",
    role: "Creative Director, Mold Studio",
    metric: "18 launches coordinated",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "Support used to write the same explanation twice a day. Now the answer ships attached to the work that caused it.",
    name: "Tessa Kim",
    role: "Customer Lead, Relay",
    metric: "64% fewer repeat escalations",
    avatar:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=200&q=80",
  },
];

const ROTATE_MS = 6000;

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function SocialProof15() {
  const shouldReduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const pausedRef = useRef(false);
  const story = stories[active];

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    let raf = 0;
    let elapsed = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const delta = now - last;
      last = now;
      if (!pausedRef.current) {
        elapsed += delta;
        const value = Math.min(elapsed / ROTATE_MS, 1);
        if (value >= 1) {
          setProgress(0);
          setActive((current) => (current + 1) % stories.length);
          return;
        }
        setProgress(value);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, shouldReduceMotion]);

  const previous = () => {
    setProgress(0);
    setActive((current) => (current - 1 + stories.length) % stories.length);
  };
  const next = () => {
    setProgress(0);
    setActive((current) => (current + 1) % stories.length);
  };

  return (
    <section className="w-full bg-white px-4 py-16 dark:bg-neutral-950 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto w-full max-w-[1400px]"
      >
        <motion.div
          variants={item}
          className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h2 className="max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              Better heard in their own words.
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={previous}
              aria-label="Previous story"
              className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-neutral-300 text-neutral-900 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-900 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              aria-label="Next story"
              className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-neutral-900 text-white transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-10 border-t border-neutral-200 dark:border-neutral-800 lg:mt-12"
        />

        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          className="mt-10 grid grid-cols-1 gap-12 lg:mt-12 lg:grid-cols-12 lg:gap-16"
        >
          <motion.div variants={item} className="lg:col-span-7 xl:col-span-8">
            <span
              aria-hidden="true"
              className="block font-serif text-6xl leading-none text-neutral-200 dark:text-neutral-800 sm:text-7xl"
            >
              &ldquo;
            </span>
            <div className="mt-2 grid min-h-[340px]">
              <AnimatePresence initial={false}>
                <motion.figure
                  key={active}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="col-start-1 row-start-1"
                >
                  <blockquote className="max-w-3xl text-balance text-2xl font-medium leading-snug tracking-tight text-neutral-900 dark:text-white sm:text-3xl lg:text-4xl">
                    {story.quote}
                  </blockquote>
                  <figcaption className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={story.avatar}
                        alt=""
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {story.name}
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {story.role}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-800 dark:text-neutral-300">
                      {story.metric}
                    </span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="flex flex-col lg:col-span-5 xl:col-span-4"
          >
            {stories.map((entry, index) => {
              const isActive = index === active;
              return (
                <button
                  key={entry.name}
                  onClick={() => setActive(index)}
                  aria-pressed={isActive}
                  aria-label={`Show story from ${entry.name}`}
                  className="group cursor-pointer rounded-xl py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
                >
                  <span className="flex items-center gap-4">
                    <img
                      src={entry.avatar}
                      alt=""
                      className="h-11 w-11 rounded-full object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm font-semibold transition-colors ${
                          isActive
                            ? "text-neutral-900 dark:text-white"
                            : "text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-500 dark:group-hover:text-neutral-300"
                        }`}
                      >
                        {entry.name}
                      </span>
                      <span
                        className={`block text-xs transition-colors ${
                          isActive
                            ? "text-neutral-600 dark:text-neutral-400"
                            : "text-neutral-400 dark:text-neutral-600"
                        }`}
                      >
                        {entry.role}
                      </span>
                    </span>
                  </span>
                  <span className="mt-5 block h-px overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                    <span
                      className="block h-full w-full origin-left bg-neutral-900 dark:bg-white"
                      style={{
                        transform: `scaleX(${isActive ? (shouldReduceMotion ? 1 : progress) : 0})`,
                      }}
                    />
                  </span>
                </button>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
