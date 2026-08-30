"use client";

import { motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";

const expectations = [
  "A calm, zero-pressure walkthrough of the platform",
  "A look at how teams like yours are using it today",
  "A quick tour of pricing, plans, and what's included",
  "Straight answers on setup, migration, and support",
];

const reviewers = [
  {
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    name: "Ana Mirov",
    role: "Head of Ops, Fernwood",
  },
  {
    src: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80",
    name: "Jules Park",
    role: "Founder, Coastline Co.",
  },
  {
    src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    name: "Sam Oduya",
    role: "GM, Northlake Studio",
  },
];

export default function Contact8() {
  return (
    <section className="w-full min-h-[var(--rb-section-min-h,100vh)] flex items-start py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-8"
          >
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-neutral-900 dark:text-white leading-tight tracking-tight">
              A quieter way to
              <br />
              run your operations
            </h2>

            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                What to expect on the call
              </h3>
              <ul className="flex flex-col gap-3">
                {expectations.map((e, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.08 * i }}
                    className="flex items-center gap-3 text-sm sm:text-base text-neutral-700 dark:text-neutral-300"
                  >
                    <Check
                      className="w-4 h-4 text-neutral-900 dark:text-white shrink-0"
                      strokeWidth={3}
                    />
                    {e}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Reviewed by operators we trust
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {reviewers.map((r) => (
                    <img
                      key={r.name}
                      src={r.src}
                      alt={r.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-neutral-950 bg-neutral-200 dark:bg-neutral-800"
                    />
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    {reviewers[0].name}, {reviewers[1].name} &{" "}
                    {reviewers[2].name}
                  </span>
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">
                    plus 40+ ops leaders across SMB and mid-market
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-2xl p-6 sm:p-8 flex flex-col gap-4 bg-neutral-950 dark:bg-neutral-900 border border-neutral-800"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
              Book a live, 20-minute walkthrough
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First name*"
                className="px-4 py-3 rounded-full bg-transparent border border-neutral-700 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400"
              />
              <input
                type="text"
                placeholder="Last name*"
                className="px-4 py-3 rounded-full bg-transparent border border-neutral-700 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400"
              />
            </div>

            <input
              type="email"
              placeholder="Work email*"
              className="px-4 py-3 rounded-full bg-transparent border border-neutral-700 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400"
            />

            <div className="grid grid-cols-2 sm:grid-cols-[2fr_1fr] gap-3">
              <div className="relative">
                <select className="w-full appearance-none px-4 py-3 pr-10 rounded-full bg-transparent border border-neutral-700 text-sm text-neutral-400 focus:outline-none focus:border-neutral-400 cursor-pointer">
                  <option>Country*</option>
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
              </div>
              <input
                type="text"
                placeholder="+1"
                className="px-4 py-3 rounded-full bg-transparent border border-neutral-700 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Company name*"
                className="px-4 py-3 rounded-full bg-transparent border border-neutral-700 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400"
              />
              <input
                type="text"
                placeholder="Website URL*"
                className="px-4 py-3 rounded-full bg-transparent border border-neutral-700 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Job title*"
                className="px-4 py-3 rounded-full bg-transparent border border-neutral-700 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400"
              />
              <div className="relative">
                <select className="w-full appearance-none px-4 py-3 pr-10 rounded-full bg-transparent border border-neutral-700 text-sm text-neutral-400 focus:outline-none focus:border-neutral-400 cursor-pointer">
                  <option>Team size*</option>
                  <option>1–10</option>
                  <option>11–50</option>
                  <option>51–200</option>
                  <option>200+</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
              </div>
            </div>

            <input
              type="text"
              placeholder="How did you hear about us?"
              className="px-4 py-3 rounded-full bg-transparent border border-neutral-700 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400"
            />

            <p className="text-[11px] text-neutral-500 leading-relaxed">
              We only use this information to get in touch about your demo. You
              can unsubscribe from follow-ups anytime.
            </p>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="w-full mt-2 px-6 py-3.5 rounded-full bg-white text-neutral-900 text-sm font-medium hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Book my walkthrough
            </motion.button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
