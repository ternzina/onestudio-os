"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";

const links = ["Overview", "Product", "Customers", "Pricing"];

const menuStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

const menuItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950";

export default function Navigation12() {
  const [active, setActive] = useState("Overview");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="w-full min-h-[var(--rb-section-min-h,100vh)] bg-white px-4 py-6 dark:bg-neutral-950 sm:py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1400px]">
        <motion.nav
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-16 items-center justify-between gap-3 rounded-full border border-neutral-200/80 bg-white/80 pl-5 pr-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/80"
          aria-label="Primary"
        >
          <a
            href="#"
            className={`flex items-center gap-2.5 rounded-full text-neutral-900 dark:text-white ${focusRing}`}
          >
            <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 dark:bg-white">
              <span className="absolute h-3 w-3 rounded-full border-[1.5px] border-white dark:border-neutral-900" />
              <span className="absolute right-1 top-1 h-1 w-1 rounded-full bg-white dark:bg-neutral-900" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              Arc
            </span>
          </a>

          <div className="hidden items-center md:flex">
            {links.map((link) => (
              <button
                key={link}
                type="button"
                onClick={() => setActive(link)}
                aria-current={active === link ? "page" : undefined}
                className={`relative cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${focusRing} ${
                  active === link
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                }`}
              >
                {active === link && (
                  <motion.span
                    layoutId="nav12-active"
                    className="absolute inset-0 rounded-full bg-neutral-100 dark:bg-neutral-800"
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                <span className="relative">{link}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href="#"
              className={`hidden rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition-colors duration-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white md:inline-flex ${focusRing}`}
            >
              Sign in
            </a>
            <a
              href="#"
              className={`hidden items-center gap-1.5 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 md:inline-flex ${focusRing}`}
            >
              Start free
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="nav12-mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-neutral-900 transition-colors duration-200 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800 md:hidden ${focusRing}`}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </motion.nav>

        <AnimatePresence>
          {open && (
            <motion.div
              id="nav12-mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden md:hidden"
            >
              <motion.nav
                initial="hidden"
                animate="visible"
                variants={menuStagger}
                className="mt-3 rounded-3xl border border-neutral-200/80 bg-white/90 p-2 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/90"
                aria-label="Mobile"
              >
                {links.map((link) => (
                  <motion.button
                    key={link}
                    type="button"
                    variants={menuItem}
                    onClick={() => {
                      setActive(link);
                      setOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-2xl px-4 py-3.5 text-left text-[15px] font-medium transition-colors duration-200 ${focusRing} ${
                      active === link
                        ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                        : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800/50"
                    }`}
                  >
                    {link}
                    {active === link && (
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-900 dark:bg-white" />
                    )}
                  </motion.button>
                ))}
                <motion.div
                  variants={menuItem}
                  className="mt-2 grid gap-2 border-t border-neutral-200 px-2 pb-2 pt-3 dark:border-neutral-800"
                >
                  <a
                    href="#"
                    className={`rounded-full border border-neutral-300 px-5 py-3 text-center text-sm font-medium text-neutral-900 transition-colors duration-200 hover:bg-neutral-50 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 ${focusRing}`}
                  >
                    Sign in
                  </a>
                  <a
                    href="#"
                    className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 ${focusRing}`}
                  >
                    Start free
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </motion.div>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
