"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  Boxes,
  Github,
  Instagram,
  Layers3,
  Linkedin,
  Orbit,
  Radio,
  Youtube,
  type LucideIcon,
} from "lucide-react";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950";

const columns: {
  title: string;
  links: { label: string; icon?: LucideIcon }[];
}[] = [
  {
    title: "Products",
    links: [
      { label: "Aster Core", icon: Orbit },
      { label: "Aster Sync", icon: Radio },
      { label: "Aster Rooms", icon: Layers3 },
      { label: "Aster Kit", icon: Boxes },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Journal" },
      { label: "Brand kit" },
      { label: "Guides" },
      { label: "Support" },
      { label: "FAQ" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation" },
      { label: "API reference" },
      { label: "Changelog" },
      { label: "Security" },
      { label: "Open source" },
    ],
  },
  {
    title: "Legal & privacy",
    links: [
      { label: "Privacy policy" },
      { label: "Terms of use" },
      { label: "Licenses" },
      { label: "Press" },
      { label: "Contact" },
    ],
  },
  {
    title: "About",
    links: [{ label: "Company" }, { label: "Careers" }],
  },
];

const socials = [
  { icon: Instagram, label: "Instagram" },
  { icon: Youtube, label: "YouTube" },
  { icon: Linkedin, label: "LinkedIn" },
  { icon: Github, label: "GitHub" },
];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Footer11() {
  const reduce = useReducedMotion();

  return (
    <footer className="w-full bg-white px-4 py-16 dark:bg-neutral-950 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <motion.div
        variants={container}
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto w-full max-w-[1400px]"
      >
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-12">
          {columns.map((column) => (
            <motion.nav
              key={column.title}
              variants={item}
              aria-label={column.title}
              className="min-w-0"
            >
              <h3 className="mb-5 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-500">
                {column.title}
              </h3>
              <ul className="space-y-3.5">
                {column.links.map(({ label, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href="#"
                      className={`group inline-flex items-center gap-3 rounded-sm text-[17px] font-medium leading-snug tracking-tight text-neutral-900 transition-colors duration-200 hover:text-neutral-500 dark:text-white dark:hover:text-neutral-400 ${focusRing}`}
                    >
                      {Icon && (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-700 transition-colors duration-200 group-hover:border-neutral-300 group-hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:group-hover:border-neutral-700 dark:group-hover:bg-neutral-800">
                          <Icon className="h-4 w-4" />
                        </span>
                      )}
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.nav>
          ))}
        </div>

        <motion.div
          variants={item}
          className="mt-16 flex flex-col gap-8 pt-8 sm:mt-20 sm:flex-row sm:items-center sm:justify-between"
        >
          <a
            href="#"
            aria-label="Aster home"
            className={`inline-flex w-fit items-center gap-2.5 rounded-md ${focusRing}`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-base font-semibold text-white dark:bg-white dark:text-neutral-900">
              A
            </span>
            <span className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              Aster
            </span>
          </a>
          <nav
            aria-label="Social"
            className="flex flex-wrap items-center gap-1"
          >
            {socials.map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition-colors duration-200 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:text-neutral-500 dark:hover:bg-neutral-900 dark:hover:text-white dark:focus-visible:ring-white"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </nav>
        </motion.div>

        <motion.p
          variants={item}
          className="mt-8 max-w-3xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-500"
        >
          Aster builds coordination software for distributed engineering teams.
          Product availability, pricing, and feature scope vary by region and
          plan; see the current service description for binding terms.
          Independent integrations are maintained by their respective authors.
        </motion.p>
      </motion.div>
    </footer>
  );
}
