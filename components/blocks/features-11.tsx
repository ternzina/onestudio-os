"use client";

import { motion } from "motion/react";
import type { Variants } from "motion/react";
import {
  ArrowRight,
  CalendarSync,
  MessagesSquare,
  ShieldCheck,
} from "lucide-react";

const cards = [
  {
    icon: MessagesSquare,
    index: "01",
    title: "One place for everything",
    description:
      "No more scattered DMs or endless tabs. Chat, plan, and manage every project in a single, uncluttered space.",
    link: "Explore the workspace",
  },
  {
    icon: CalendarSync,
    index: "02",
    title: "Fair, friction-free booking",
    description:
      "Transparent pricing and instant rebooking, because getting paid, or paying, should never be a guessing game.",
    link: "See how booking works",
  },
  {
    icon: ShieldCheck,
    index: "03",
    title: "A community you can trust",
    description:
      "Every member is verified, so you can focus on the work itself instead of wondering who is on the other side.",
    link: "Meet the community",
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Features11() {
  return (
    <section className="w-full bg-white px-4 py-16 dark:bg-neutral-950 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-[1400px]">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 items-end gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:gap-16"
        >
          <div>
            <motion.h2
              variants={fadeUp}
              className="mt-5 max-w-2xl text-3xl font-medium leading-[1.1] tracking-tight text-neutral-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Because creative work shouldn&apos;t be{" "}
              <span className="font-serif italic">this complicated</span>
            </motion.h2>
          </div>

          <motion.p
            variants={fadeUp}
            className="max-w-sm text-base leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg lg:justify-self-end lg:pb-2"
          >
            We&apos;ve lived the creative chaos ourselves, so we built a simpler
            way to connect and collaborate.
          </motion.p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid grid-cols-1 gap-5 sm:mt-16 md:grid-cols-3 lg:gap-6"
        >
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="group flex min-h-[300px] flex-col rounded-3xl border border-neutral-200 bg-white p-7 transition-shadow duration-200 hover:shadow-xl hover:shadow-neutral-200/60 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:shadow-black/40 sm:min-h-[320px] sm:p-8"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 transition-colors duration-200 group-hover:bg-neutral-900 dark:bg-neutral-900 dark:group-hover:bg-white">
                    <Icon className="h-5 w-5 text-neutral-900 transition-colors duration-200 group-hover:text-white dark:text-white dark:group-hover:text-neutral-900" />
                  </div>
                  <span className="text-xs font-medium tracking-[0.15em] text-neutral-400 dark:text-neutral-600">
                    {card.index}
                  </span>
                </div>

                <h3 className="mt-8 text-xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-2xl">
                  {card.title}
                </h3>
                <p className="mt-3 pb-8 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {card.description}
                </p>

                <div className="mt-auto border-t border-neutral-100 pt-5 dark:border-neutral-900">
                  <a
                    href="#"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full text-sm font-medium text-neutral-900 transition-colors duration-200 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 dark:text-white dark:hover:text-neutral-300 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
                  >
                    {card.link}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default Features11;
