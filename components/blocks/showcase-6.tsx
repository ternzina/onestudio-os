"use client";

import { motion, type Variants } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const moments = [
  {
    caption: "Opening night · Lisbon",
    date: "04.18.26",
    tilt: -4,
    lift: "lg:mt-12",
  },
  {
    caption: "Material review · Copenhagen",
    date: "05.02.26",
    tilt: 2.5,
    lift: "lg:mt-2",
  },
  {
    caption: "Night prototyping · Seoul",
    date: "05.29.26",
    tilt: -2,
    lift: "lg:mt-16",
  },
  {
    caption: "Launch wall · New York",
    date: "06.11.26",
    tilt: 3.5,
    lift: "lg:mt-6",
  },
];

const headerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const stripVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 48, rotate: 0 },
  visible: (tilt: number) => ({
    opacity: 1,
    y: 0,
    rotate: tilt,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Showcase6() {
  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950 overflow-hidden">
      <div className="max-w-[1400px] mx-auto w-full">
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-16 items-start"
        >
          <motion.div variants={fadeUp}>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.98] text-neutral-900 dark:text-white text-balance">
              Life between{" "}
              <span className="text-neutral-400 dark:text-neutral-500">
                launches.
              </span>
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="lg:pt-2 lg:justify-self-end lg:max-w-sm"
          >
            <p className="text-base sm:text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 text-pretty">
              Lisbon HQ, Copenhagen, Seoul, New York, and a rotating cast of
              pop-up desks wherever the work lands.
            </p>
            <a
              href="#"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors duration-200 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:focus-visible:outline-white"
            >
              Browse the archive
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          variants={stripVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 sm:mt-20 lg:mt-24 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:flex lg:justify-center lg:gap-0"
        >
          {moments.map((moment) => (
            <motion.a
              key={moment.caption}
              href="#"
              custom={moment.tilt}
              variants={cardVariants}
              whileHover={{ rotate: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative block lg:w-[28%] lg:-ml-14 lg:first:ml-0 ${moment.lift} cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 dark:focus-visible:outline-white`}
            >
              <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 sm:p-3.5 shadow-[0_18px_45px_-20px_rgba(0,0,0,0.28)] group-hover:shadow-[0_30px_70px_-28px_rgba(0,0,0,0.4)] transition-shadow duration-300">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src="/svg/placeholder.svg"
                    alt={moment.caption}
                    loading="lazy"
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex items-baseline justify-between gap-3 pt-4 pb-1.5 px-1">
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-300 truncate">
                    {moment.caption}
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.12em] text-neutral-500 dark:text-neutral-400 shrink-0">
                    {moment.date}
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Showcase6;
