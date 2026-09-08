"use client";

import { motion } from "motion/react";
import { User, ChevronDown } from "lucide-react";

export type AdaptedContact7Props = {
  headingLead: string;
  headingEmphasis: string;
  headingTail: string;
  description: string;
  firstNameLabel: string;
  firstNamePlaceholder: string;
  lastNameLabel: string;
  lastNamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  companySizeLabel: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
};

export const contact7ContentDefaults: AdaptedContact7Props = {
  headingLead: "Talk to the team that",
  headingEmphasis: "quiet",
  headingTail: "way.",
  description:
    "Send us a note and we will reply within a business day: no sales script, no follow-up drip, just a real conversation.",
  firstNameLabel: "First name",
  firstNamePlaceholder: "Enter your first name*",
  lastNameLabel: "Last name",
  lastNamePlaceholder: "Enter your last name*",
  emailLabel: "Email address",
  emailPlaceholder: "Enter email address*",
  companySizeLabel: "Company size",
  messageLabel: "Message",
  messagePlaceholder: "Enter your message",
  submitLabel: "Send message",
};

export default function AdaptedContact7({
  headingLead,
  headingEmphasis,
  headingTail,
  description,
  firstNameLabel,
  firstNamePlaceholder,
  lastNameLabel,
  lastNamePlaceholder,
  emailLabel,
  emailPlaceholder,
  companySizeLabel,
  messageLabel,
  messagePlaceholder,
  submitLabel,
}: AdaptedContact7Props) {
  return (
    <section className="w-full min-h-[var(--rb-section-min-h,100vh)] flex items-start py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-xl mx-auto w-full flex flex-col items-center text-center">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="text-3xl sm:text-5xl md:text-6xl font-semibold text-neutral-900 dark:text-white tracking-tight leading-[1.05]"
        >
          {headingLead}
          <br />
          built the <em className="font-serif italic font-normal">
            {headingEmphasis}
          </em>{" "}
          {headingTail}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-md"
        >
          {description}
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mt-10 w-full rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 text-left flex flex-col gap-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-neutral-900 dark:text-neutral-200">
                {firstNameLabel}
              </label>
              <input
                type="text"
                placeholder={firstNamePlaceholder}
                className="px-3.5 py-2.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-neutral-900 dark:text-neutral-200">
                {lastNameLabel}
              </label>
              <input
                type="text"
                placeholder={lastNamePlaceholder}
                className="px-3.5 py-2.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-900 dark:text-neutral-200">
              {emailLabel}
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder={emailPlaceholder}
                className="w-full px-3.5 py-2.5 pr-10 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
              />
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-900 dark:text-neutral-200">
              {companySizeLabel}
            </label>
            <div className="relative">
              <select className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white cursor-pointer">
                <option>Enter your company size*</option>
                <option>1–10</option>
                <option>11–50</option>
                <option>51–200</option>
                <option>201+</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-900 dark:text-neutral-200">
              {messageLabel}
            </label>
            <textarea
              rows={4}
              placeholder={messagePlaceholder}
              className="px-3.5 py-2.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white resize-none"
            />
          </div>

          <div className="flex flex-col items-center gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="px-6 py-2.5 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              {submitLabel}
            </motion.button>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 text-center">
              By sending this message, you agree to our{" "}
              <a
                href="#"
                className="underline text-neutral-700 dark:text-neutral-300"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="underline text-neutral-700 dark:text-neutral-300"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
