"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowUpRight, ChevronDown } from "lucide-react";

const desks = [
  {
    label: "General enquiries",
    name: "Marta Iversen",
    email: "hello@framefield.studio",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  },
  {
    label: "New business",
    name: "Theo Reyes",
    email: "new@framefield.studio",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
  },
  {
    label: "Press & partnerships",
    name: "Imogen Clarke",
    email: "press@framefield.studio",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  },
  {
    label: "Careers",
    name: "Daniel Osei",
    email: "join@framefield.studio",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
];

const fieldClass =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-200 focus-visible:border-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-600 dark:focus-visible:border-white dark:focus-visible:ring-white/15";
const labelClass =
  "mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300";

export default function Contact11() {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };
  const nudge: Variants = {
    hover: {
      x: 2,
      y: -2,
      transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="w-full bg-white px-4 py-16 dark:bg-neutral-950 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto grid w-full max-w-[1400px] items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.h2
            variants={item}
            className="font-serif text-4xl leading-[1.1] tracking-tight text-neutral-900 dark:text-white sm:text-5xl"
          >
            Reach the right desk, <em className="italic">first time</em>.
          </motion.h2>

          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {desks.map((desk) => (
              <motion.div key={desk.label} variants={item}>
                <h3 className="font-serif text-lg italic text-neutral-500 dark:text-neutral-400">
                  {desk.label}
                </h3>
                <div className="mt-4 flex items-center gap-3">
                  <img
                    src={desk.avatar}
                    alt={desk.name}
                    className="h-11 w-11 rounded-full border border-neutral-200 bg-neutral-100 object-cover dark:border-neutral-800 dark:bg-neutral-800"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {desk.name}
                    </p>
                    <motion.a
                      href={`mailto:${desk.email}`}
                      whileHover={reduce ? undefined : "hover"}
                      className="mt-0.5 inline-flex max-w-full cursor-pointer items-center gap-1 text-sm text-neutral-600 transition-colors hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-neutral-400 dark:hover:text-white dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
                    >
                      <span className="truncate">{desk.email}</span>
                      <motion.span variants={nudge} className="shrink-0">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </motion.span>
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={item}
            className="mt-12 grid gap-x-8 gap-y-10 border-t border-neutral-200 pt-10 dark:border-neutral-800 sm:grid-cols-2"
          >
            <div>
              <h3 className="font-serif text-lg italic text-neutral-500 dark:text-neutral-400">
                Find us
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                The Old Tannery
                <br />
                48 Fournier Street
                <br />
                London E1 6QE
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg italic text-neutral-500 dark:text-neutral-400">
                Talk to us
              </h3>
              <a
                href="tel:+442079460551"
                className="mt-4 inline-block cursor-pointer text-sm text-neutral-700 transition-colors hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-neutral-300 dark:hover:text-white dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950"
              >
                +44 20 7946 0551
              </a>
              <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                9am – 6pm, Mon to Fri
              </p>
            </div>
          </motion.div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={(e) => e.preventDefault()}
          className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8 lg:p-10"
        >
          <h3 className="font-serif text-3xl leading-[1.15] tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            Or fill in the form: <br />
            we&apos;ll reach out.
          </h3>

          <div className="mt-8 grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="c11-name" className={labelClass}>
                  Full name
                </label>
                <input
                  id="c11-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Alex Morgan"
                  required
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="c11-email" className={labelClass}>
                  Email
                </label>
                <input
                  id="c11-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  required
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="c11-company" className={labelClass}>
                  Company
                </label>
                <input
                  id="c11-company"
                  type="text"
                  autoComplete="organization"
                  placeholder="Optional"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="c11-type" className={labelClass}>
                  Type of enquiry
                </label>
                <div className="relative">
                  <select
                    id="c11-type"
                    defaultValue=""
                    required
                    className={`${fieldClass} cursor-pointer appearance-none pr-10 invalid:text-neutral-400 dark:invalid:text-neutral-600`}
                  >
                    <option value="" disabled>
                      Please select
                    </option>
                    <option>New project</option>
                    <option>Press</option>
                    <option>Partnership</option>
                    <option>Something else</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="c11-message" className={labelClass}>
                Message
              </label>
              <textarea
                id="c11-message"
                rows={5}
                placeholder="Tell us about your project, timeline, and budget."
                className={`${fieldClass} resize-none`}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <input
                id="c11-consent"
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 dark:accent-white dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-900"
              />
              <label
                htmlFor="c11-consent"
                className="cursor-pointer text-xs leading-relaxed text-neutral-600 dark:text-neutral-400"
              >
                I have read and agree to the{" "}
                <a
                  href="#"
                  className="cursor-pointer underline underline-offset-2 transition-colors hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:hover:text-white dark:focus-visible:ring-white"
                >
                  Privacy Policy
                </a>
                .
              </label>
            </div>
            <motion.button
              type="submit"
              whileHover={reduce ? undefined : { y: -1 }}
              whileTap={{ scale: 0.99 }}
              className="w-full cursor-pointer rounded-full bg-black px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-900 sm:w-auto"
            >
              Send message
            </motion.button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
