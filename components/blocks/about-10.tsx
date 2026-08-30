"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { Play } from "lucide-react";

const founder = {
  src: "https://i.pravatar.cc/500?img=12",
  name: "Mara Voss",
  role: "Co-founder & CEO",
};

interface Portrait {
  src: string;
  name: string;
  desktopOnly?: boolean;
}

const portraits: Portrait[] = [
  { src: "https://i.pravatar.cc/300?img=13", name: "Jonas Reinholt" },
  { src: "https://i.pravatar.cc/300?img=25", name: "Priya Anand" },
  { src: "https://i.pravatar.cc/300?img=47", name: "Theo Lindgren" },
  { src: "https://i.pravatar.cc/300?img=9", name: "Amara Diallo" },
  { src: "https://i.pravatar.cc/300?img=56", name: "Elena Marchetti" },
  { src: "https://i.pravatar.cc/300?img=33", name: "Daniel Okafor" },
  {
    src: "https://i.pravatar.cc/300?img=60",
    name: "Sofia Herrera",
    desktopOnly: true,
  },
  {
    src: "https://i.pravatar.cc/300?img=5",
    name: "Felix Braun",
    desktopOnly: true,
  },
];

const partners = ["Harbor", "Nocturne", "Atlas & Co", "Fernwood", "Callisto"];

export default function About10() {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const grid: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="w-full min-h-[var(--rb-section-min-h,100vh)] flex items-start py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-[1400px] mx-auto w-full">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <motion.p
            variants={item}
            className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-500"
          >
            The team behind the tools
          </motion.p>
          <motion.h2
            variants={item}
            className="mt-5 text-4xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.03em] leading-[1.02]"
          >
            <span className="text-neutral-950 dark:text-white">We are </span>
            <span className="text-neutral-400 dark:text-neutral-600">
              Meridian.
            </span>
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-6 max-w-xl font-serif text-lg sm:text-xl leading-relaxed text-neutral-600 dark:text-neutral-400 [text-wrap:pretty]"
          >
            Ninety-one people, eleven time zones, one shared habit. We sweat the
            details other tools skip.
          </motion.p>
          <motion.div variants={item} className="mt-8 w-full sm:w-auto">
            <motion.a
              href="#"
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-black dark:bg-white px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-medium text-white dark:text-black transition-colors hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 dark:focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950"
            >
              <Play className="h-4 w-4 fill-current" />
              Hear our story
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div
          variants={grid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 auto-rows-[150px] sm:auto-rows-[160px] lg:auto-rows-[200px] gap-3 sm:gap-4"
        >
          <motion.figure
            variants={item}
            className="group relative col-span-2 row-span-2 row-start-1 sm:col-start-2 lg:col-start-3 overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-900"
          >
            <img
              src={founder.src}
              alt={`${founder.name}, ${founder.role} at Meridian`}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
            <figcaption className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 rounded-full bg-white/90 px-4 py-2 backdrop-blur dark:bg-neutral-950/85">
              <span className="block text-sm font-semibold leading-tight text-neutral-950 dark:text-white">
                {founder.name}
              </span>
              <span className="block text-xs leading-tight text-neutral-600 dark:text-neutral-400">
                {founder.role}
              </span>
            </figcaption>
          </motion.figure>
          {portraits.map((person) => (
            <motion.div
              key={person.name}
              variants={item}
              className={`group relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900 ${
                person.desktopOnly ? "hidden sm:block" : ""
              }`}
            >
              <img
                src={person.src}
                alt={`${person.name}, Meridian team member`}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 sm:mt-16 flex flex-col gap-5 border-t border-neutral-200 pt-8 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-500">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {partners.map((partner) => (
              <span
                key={partner}
                className="text-base font-semibold tracking-tight text-neutral-500 dark:text-neutral-500"
              >
                {partner}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
