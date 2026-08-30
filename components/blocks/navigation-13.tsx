"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const leftLinks = ["Work", "Studio", "Services"];
const rightLinks = ["Journal", "Contact"];
const menuLinks = ["Work", "Studio", "Services", "Journal", "Contact"];

const rollTop: Variants = {
  rest: { y: "0%" },
  hover: { y: "-100%" },
};

const rollBottom: Variants = {
  rest: { y: "100%" },
  hover: { y: "0%" },
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950";

function RollLink({ label }: { label: string }) {
  return (
    <motion.a
      href="#"
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      className={`rounded-sm text-sm font-medium ${focusRing}`}
    >
      <span className="relative block overflow-hidden">
        <motion.span
          variants={rollTop}
          transition={{ duration: 0.4, ease: EASE }}
          className="block text-neutral-600 will-change-transform dark:text-neutral-400"
        >
          {label}
        </motion.span>
        <motion.span
          variants={rollBottom}
          transition={{ duration: 0.4, ease: EASE }}
          aria-hidden="true"
          className="absolute inset-0 block text-neutral-950 will-change-transform dark:text-white"
        >
          {label}
        </motion.span>
      </span>
    </motion.a>
  );
}

export default function Navigation13() {
  const [open, setOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const menuStagger: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: shouldReduceMotion ? 0 : 0.3,
      },
    },
  };

  const menuItem: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 26 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  };

  return (
    <header className="w-full min-h-[var(--rb-section-min-h,100vh)] bg-white dark:bg-neutral-950 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="border-b border-neutral-200 dark:border-neutral-800"
          aria-label="Primary"
        >
          <div className="mx-auto grid w-full max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center gap-4 py-5">
            <div className="hidden items-center gap-8 lg:flex">
              {leftLinks.map((link) => (
                <RollLink key={link} label={link} />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="nav13-menu"
              aria-label="Open menu"
              className={`flex h-11 w-11 cursor-pointer items-center justify-center justify-self-start rounded-full border border-neutral-200 text-neutral-900 transition-colors duration-200 hover:bg-neutral-50 dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-900 lg:hidden ${focusRing}`}
            >
              <Menu className="h-5 w-5" />
            </button>

            <a
              href="#"
              className={`justify-self-center rounded-sm text-lg font-semibold tracking-tight text-neutral-950 dark:text-white ${focusRing}`}
            >
              Northline<span className="align-super text-[10px]">®</span>
            </a>

            <div className="hidden items-center gap-8 justify-self-end lg:flex">
              {rightLinks.map((link) => (
                <RollLink key={link} label={link} />
              ))}
              <a
                href="#"
                className={`inline-flex items-center gap-1.5 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 ${focusRing}`}
              >
                Start a project
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
            <a
              href="#"
              aria-label="Start a project"
              className={`flex h-11 w-11 items-center justify-center justify-self-end rounded-full bg-black text-white transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 lg:hidden ${focusRing}`}
            >
              <ArrowUpRight className="h-5 w-5" />
            </a>
          </div>
        </motion.nav>

        <AnimatePresence>
          {open && (
            <motion.div
              id="nav13-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={shouldReduceMotion ? { opacity: 0 } : { y: "-100%" }}
              animate={shouldReduceMotion ? { opacity: 1 } : { y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { y: "-100%" }}
              transition={{
                duration: shouldReduceMotion ? 0.2 : 0.6,
                ease: EASE,
              }}
              className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white dark:bg-neutral-950 lg:hidden"
            >
              <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-4 pb-8 pt-5 sm:px-6">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-neutral-200 pb-5 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className={`flex h-11 w-11 cursor-pointer items-center justify-center justify-self-start rounded-full border border-neutral-200 text-neutral-900 transition-colors duration-200 hover:bg-neutral-50 dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-900 ${focusRing}`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <span className="justify-self-center text-lg font-semibold tracking-tight text-neutral-950 dark:text-white">
                    Northline<span className="align-super text-[10px]">®</span>
                  </span>
                  <span
                    className="h-11 w-11 justify-self-end"
                    aria-hidden="true"
                  />
                </div>

                <motion.nav
                  initial="hidden"
                  animate="visible"
                  variants={menuStagger}
                  className="mt-6 flex flex-col"
                  aria-label="Menu links"
                >
                  {menuLinks.map((link, index) => (
                    <motion.a
                      key={link}
                      href="#"
                      variants={menuItem}
                      onClick={() => setOpen(false)}
                      className={`group flex items-baseline gap-4 border-b border-neutral-200 py-4 dark:border-neutral-800 sm:py-5 ${focusRing}`}
                    >
                      <span className="text-xs tabular-nums text-neutral-400 dark:text-neutral-600">
                        0{index + 1}
                      </span>
                      <span className="text-4xl font-semibold tracking-tight text-neutral-950 transition-colors duration-200 group-hover:text-neutral-500 dark:text-white dark:group-hover:text-neutral-400 sm:text-5xl">
                        {link}
                      </span>
                      <ArrowUpRight className="ml-auto h-5 w-5 self-center text-neutral-400 transition-colors duration-200 group-hover:text-neutral-950 dark:text-neutral-600 dark:group-hover:text-white" />
                    </motion.a>
                  ))}
                </motion.nav>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: shouldReduceMotion ? 0.1 : 0.55,
                    ease: EASE,
                  }}
                  className="mt-auto pt-10"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                    New business
                  </p>
                  <a
                    href="mailto:hello@northline.studio"
                    className={`mt-2 inline-block rounded-sm text-base font-medium text-neutral-950 transition-colors duration-200 hover:text-neutral-500 dark:text-white dark:hover:text-neutral-400 ${focusRing}`}
                  >
                    hello@northline.studio
                  </a>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <a
                      href="#"
                      className={`rounded-full border border-neutral-300 px-5 py-3 text-center text-sm font-medium text-neutral-900 transition-colors duration-200 hover:bg-neutral-50 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-900 ${focusRing}`}
                    >
                      Book a call
                    </a>
                    <a
                      href="#"
                      className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 ${focusRing}`}
                    >
                      Start a project
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
