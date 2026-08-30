"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const studies = [
  {
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    category: "Type & Lettering",
    title: "A year inside a two-person type foundry",
    copy: "How Atlas Studio keeps a steady release cadence of custom typefaces without burning out the people drawing the curves.",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80",
    category: "Launches & Campaigns",
    title: "Taking a skincare brand to four countries",
    copy: "Cory walks through the pre-launch research, the messy middle, and the quiet week before going live across four markets.",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    category: "Exhibition Design",
    title: "Turning a research paper into a walk-through",
    copy: "Marta and Musfira rebuilt an academic essay about future cities as a room-sized installation for Dubai Design Week.",
  },
];

export default function SocialProof11() {
  return (
    <section className="w-full min-h-[var(--rb-section-min-h,100vh)] flex items-start py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-[1400px] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-5"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-neutral-900 dark:text-white tracking-tight max-w-3xl">
            Stories from studios we admire
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
            A look at how small teams around the world are quietly shipping
            ambitious work without burning out the people making it.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Read all stories
            <ArrowUpRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        <div className="mt-10 sm:mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {studies.map((s, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group relative rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-6 sm:p-7 flex flex-col gap-6 cursor-pointer transition-colors hover:bg-white dark:hover:bg-neutral-900"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <img
                  src={s.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                  {s.category}
                </span>
                <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white leading-snug">
                  {s.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {s.copy}
                </p>
              </div>

              <div className="mt-auto">
                <ArrowUpRight
                  className="w-6 h-6 text-neutral-900 dark:text-white"
                  strokeWidth={1.75}
                />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
