"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";

const capabilities = [
  "Presence",
  "Live cursors",
  "CRDT sync",
  "Comments",
  "Mentions",
  "Version history",
  "Offline-first",
  "Branching",
  "Webhooks",
  "Granular permissions",
];

const activity = [
  {
    initials: "JT",
    name: "Jo Tan",
    action: "resolved 3 suggestions",
    time: "8m",
  },
  {
    initials: "MR",
    name: "Marco Ruiz",
    action: "commented on §4. Rollout",
    time: "2m",
  },
  {
    initials: "AK",
    name: "Ana Kim",
    action: "joined Pricing draft",
    time: "now",
  },
];

const panel: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.09,
      delayChildren: 0.1,
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

const arrow: Variants = {
  hover: { x: 3, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
};

const TagChip = ({ label }: { label: string }) => (
  <span className="flex shrink-0 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm whitespace-nowrap text-neutral-300">
    <span className="h-1 w-1 rounded-full bg-white/50" aria-hidden="true" />
    {label}
  </span>
);

export default function CTA14() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="w-full bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[1400px]">
        <motion.div
          variants={panel}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="relative overflow-hidden rounded-3xl bg-neutral-950 shadow-2xl shadow-neutral-950/25 ring-1 ring-neutral-950/10 dark:bg-neutral-900 dark:shadow-black/40 dark:ring-white/10"
        >
          <motion.div
            aria-hidden="true"
            animate={
              reduceMotion ? undefined : { x: [0, 40, 0], y: [0, -24, 0] }
            }
            transition={
              reduceMotion
                ? undefined
                : { duration: 16, repeat: Infinity, ease: "easeInOut" }
            }
            className="pointer-events-none absolute -top-40 left-1/4 h-[26rem] w-[26rem] rounded-full bg-white/[0.05] blur-3xl"
          />

          <div className="relative grid grid-cols-1 gap-12 px-6 pt-12 pb-12 sm:px-10 sm:pt-16 sm:pb-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:px-16 lg:pt-20 lg:pb-16">
            <motion.div variants={list} className="max-w-xl">
              <motion.span
                variants={item}
                className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400"
              >
                Braid SDK
              </motion.span>
              <motion.h2
                variants={item}
                className="mt-5 text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl"
              >
                Multiplayer, minus the rewrite.
              </motion.h2>
              <motion.p
                variants={item}
                className="mt-5 max-w-lg text-base leading-relaxed text-neutral-400 sm:text-lg"
              >
                Drop Braid into your existing stack and ship presence, comments,
                and real-time sync in an afternoon. The state layer is already
                solved. You just render it.
              </motion.p>
              <motion.div
                variants={item}
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
                <motion.a
                  href="#"
                  whileHover="hover"
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-neutral-950 transition-colors hover:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 sm:w-auto dark:focus-visible:ring-offset-neutral-900"
                >
                  Start building
                  <motion.span variants={arrow} className="flex">
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </motion.span>
                </motion.a>
                <motion.a
                  href="#"
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 sm:w-auto dark:focus-visible:ring-offset-neutral-900"
                >
                  Read the docs
                </motion.a>
              </motion.div>
              <motion.p
                variants={item}
                className="mt-6 text-sm text-neutral-500"
              >
                Free up to 1,000 monthly active users
              </motion.p>
            </motion.div>

            <motion.div
              variants={list}
              className="mx-auto w-full max-w-md lg:max-w-none"
            >
              <div className="flex flex-col gap-3">
                {activity.map((event, i) => (
                  <motion.div
                    key={event.initials}
                    variants={item}
                    className={
                      i === activity.length - 1
                        ? ""
                        : i === activity.length - 2
                          ? "mx-3"
                          : "mx-6"
                    }
                  >
                    <div
                      className={
                        i === activity.length - 1
                          ? "flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.08] px-5 py-4"
                          : i === activity.length - 2
                            ? "flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 opacity-80"
                            : "flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-4 opacity-50"
                      }
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/10 text-xs font-semibold text-white">
                        {event.initials}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-neutral-400">
                        <span className="font-medium text-white">
                          {event.name}
                        </span>{" "}
                        {event.action}
                      </span>
                      <span className="shrink-0 text-xs text-neutral-500">
                        {event.time}
                      </span>
                    </div>
                  </motion.div>
                ))}
                <motion.div
                  variants={item}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4"
                >
                  <span className="text-sm text-neutral-400">
                    Editing together
                  </span>
                  <span className="flex items-center gap-2 text-sm font-medium text-white">
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full bg-white/60"
                    />
                    3 people live
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={item}
            className="relative border-t border-white/10"
          >
            <div className="overflow-hidden py-5 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
              <motion.div
                animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
                transition={
                  reduceMotion
                    ? undefined
                    : { duration: 32, repeat: Infinity, ease: "linear" }
                }
                className="flex w-max gap-3 pl-3 will-change-transform"
              >
                {[...capabilities, ...capabilities].map((label, i) => (
                  <TagChip key={`${label}-${i}`} label={label} />
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
