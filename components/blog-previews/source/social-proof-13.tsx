"use client";

import { motion, type Variants } from "motion/react";
import { Globe2 } from "lucide-react";

const markets = [
  { flag: "🇫🇷", label: "France", tilt: "-rotate-2" },
  { flag: "🇩🇪", label: "Germany", tilt: "rotate-1" },
  { flag: "🇲🇽", label: "Mexico", tilt: "-rotate-1" },
  { flag: "🇯🇵", label: "Japan", tilt: "rotate-2" },
  { flag: "🇧🇷", label: "Brazil", tilt: "-rotate-2" },
  { flag: "🇨🇦", label: "Canada", tilt: "rotate-1" },
  { flag: "🇬🇧", label: "United Kingdom", tilt: "rotate-2" },
  { flag: "🇸🇬", label: "Singapore", tilt: "-rotate-1" },
  { flag: "🇰🇷", label: "South Korea", tilt: "rotate-1" },
  { flag: "🇦🇪", label: "UAE", tilt: "-rotate-2" },
];

const stats = [
  { value: "180+", label: "markets" },
  { value: "135", label: "currencies" },
  { value: "99.99%", label: "uptime" },
];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const chipGroup: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

export default function SocialProof13() {
  return (
    <section className="w-full bg-white px-4 py-16 dark:bg-neutral-950 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(64,64,64,0.2)_1.5px,transparent_1.5px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_75%_70%_at_50%_36%,#000_30%,transparent_78%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.14)_1.5px,transparent_1.5px)]"
          />
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="relative flex flex-col items-center px-5 py-16 text-center sm:px-10 sm:py-20 lg:py-24"
          >
            <motion.div
              variants={item}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-neutral-500 shadow-sm shadow-neutral-900/5 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:shadow-none"
            >
              <Globe2 className="h-3.5 w-3.5" />
              Global coverage
            </motion.div>

            <motion.h2
              variants={item}
              className="mt-7 max-w-3xl text-balance text-3xl font-semibold leading-tight tracking-tight text-neutral-900 dark:text-white sm:text-4xl lg:text-5xl"
            >
              Wherever your customers pay, Meridian is already there.
            </motion.h2>

            <motion.p
              variants={item}
              className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg"
            >
              Local acquiring, settlement, and compliance handled in-region, so
              checkout feels native from São Paulo to Seoul.
            </motion.p>

            <motion.div
              variants={chipGroup}
              className="mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-3 sm:mt-14 sm:gap-4"
            >
              {markets.map((market) => (
                <motion.div key={market.label} variants={item}>
                  <span
                    className={`inline-flex items-center gap-2.5 rounded-full border border-neutral-200 bg-white py-2 pl-2.5 pr-4 shadow-sm shadow-neutral-900/5 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-none ${market.tilt}`}
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-neutral-100 text-base leading-none dark:bg-neutral-800">
                      {market.flag}
                    </span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {market.label}
                    </span>
                  </span>
                </motion.div>
              ))}
              <motion.div variants={item}>
                <span className="inline-flex rotate-1 items-center rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white dark:bg-white dark:text-neutral-900">
                  +170 more
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              variants={item}
              className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm sm:mt-14"
            >
              {stats.map((stat, index) => (
                <span key={stat.label} className="flex items-center gap-4">
                  {index > 0 && (
                    <span
                      aria-hidden="true"
                      className="text-neutral-300 dark:text-neutral-700"
                    >
                      ·
                    </span>
                  )}
                  <span>
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {stat.value}
                    </span>{" "}
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {stat.label}
                    </span>
                  </span>
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
