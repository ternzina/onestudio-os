"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowUpRight, Linkedin, ShieldCheck } from "lucide-react";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950";

const lifecycle = ["Start", "Plan", "Ship", "Measure"];
const productLinks = ["Home", "Platform", "Pricing", "Careers"];
const supportLinks = ["Docs", "Privacy", "Terms", "Contact"];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Footer10() {
  const reduce = useReducedMotion();

  return (
    <footer className="relative w-full overflow-hidden bg-white px-4 py-16 dark:bg-neutral-950 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(23,23,23,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,23,23,0.05)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_75%_80%_at_60%_30%,black,transparent)] dark:bg-[linear-gradient(to_right,rgba(250,250,250,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(250,250,250,0.05)_1px,transparent_1px)]"
      />
      <motion.div
        variants={container}
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="relative mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-stretch lg:gap-20"
      >
        <div className="flex flex-col gap-14 lg:justify-between">
          <motion.h2
            variants={item}
            className="max-w-2xl text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-neutral-900 dark:text-white sm:text-5xl lg:text-6xl"
          >
            Every moving part.
            <span className="block text-neutral-400 dark:text-neutral-500">
              One calm surface.
            </span>
          </motion.h2>

          <motion.nav variants={item} aria-label="Footer">
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                Lifecycle
              </span>
              {lifecycle.map((label) => (
                <a
                  key={label}
                  href="#"
                  className={`rounded-sm text-sm font-medium text-neutral-800 transition-colors duration-200 hover:text-neutral-500 dark:text-neutral-200 dark:hover:text-neutral-400 ${focusRing}`}
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="mt-8 grid max-w-sm grid-cols-2 gap-x-12">
              {[productLinks, supportLinks].map((group, index) => (
                <ul key={index} className="space-y-3.5">
                  {group.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className={`rounded-sm text-[15px] font-medium text-neutral-800 transition-colors duration-200 hover:text-neutral-500 dark:text-neutral-200 dark:hover:text-neutral-400 ${focusRing}`}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </motion.nav>

          <motion.div variants={item} className="space-y-6">
            <div className="flex items-center gap-2">
              <a
                href="#"
                aria-label="X profile"
                className={`flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-900 dark:hover:text-white ${focusRing}`}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="LinkedIn profile"
                className={`flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-900 dark:hover:text-white ${focusRing}`}
              >
                <Linkedin className="h-[18px] w-[18px]" />
              </a>
            </div>
            <div className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                Runs on
                <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  SOC 2
                </span>
                compliant infrastructure.
              </p>
              <p>© 2026 Meridian Works. All rights reserved.</p>
              <p>Crafted in Copenhagen &amp; New York.</p>
            </div>
          </motion.div>
        </div>

        <motion.a
          href="#"
          variants={item}
          whileHover={reduce ? undefined : { y: -4 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={`group relative block min-h-[420px] overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-sm transition-shadow duration-300 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900 ${focusRing}`}
        >
          <img
            src="/svg/placeholder.svg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/50 bg-white/85 p-5 backdrop-blur-md dark:border-white/10 dark:bg-neutral-950/80 sm:inset-x-5 sm:bottom-5 sm:p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
              Inside Meridian
            </p>
            <p className="mt-3 max-w-sm text-lg font-medium leading-snug tracking-tight text-neutral-900 dark:text-white sm:text-xl">
              An orchestration desk built to run the entire operation, end to
              end.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 group-hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:group-hover:bg-neutral-200">
              Open a workspace
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </motion.a>
      </motion.div>
    </footer>
  );
}
