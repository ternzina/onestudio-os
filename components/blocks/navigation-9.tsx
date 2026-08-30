"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";

export default function Navigation9() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const links = ["Products", "Platform", "Pricing", "Company"];

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative w-full bg-white dark:bg-neutral-950">
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      <div className="w-full pt-4">
        <div className="sticky top-4 z-40 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px]">
            <motion.nav
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={`relative py-1.5 pr-0 pl-0 flex items-center justify-between transition-[background-color,backdrop-filter,border-color,box-shadow,border-radius,padding-left,padding-right] duration-300 ease-out ${
                scrolled
                  ? "rounded-2xl bg-white/70 dark:bg-neutral-950/60 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] pl-4! pr-1.5!"
                  : "rounded-none bg-transparent border border-transparent"
              }`}
            >
              <a
                href="#"
                className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold"
              >
                <span className="grid place-items-center h-7 w-7 rounded-md bg-linear-to-br from-sky-400 to-emerald-400 text-neutral-900 text-xs font-bold">
                  N
                </span>
                <span className="tracking-tight">Northwind</span>
              </a>

              <div className="hidden md:flex items-center gap-8 px-4">
                {links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-[10px] bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
                  Get Started
                </button>
                <button
                  onClick={() => setOpen((v) => !v)}
                  className="md:hidden grid place-items-center h-10 w-10 rounded-[10px] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white cursor-pointer"
                  aria-label="Toggle menu"
                >
                  {open ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </button>
              </div>
            </motion.nav>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="md:hidden mt-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl p-4 flex flex-col gap-1"
                >
                  {links.map((l) => (
                    <a
                      key={l}
                      href="#"
                      className="text-sm text-neutral-800 dark:text-neutral-200 py-2"
                    >
                      {l}
                    </a>
                  ))}
                  <button className="mt-2 w-full px-4 py-2.5 rounded-[10px] bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium cursor-pointer">
                    Get Started
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="h-[var(--rb-section-min-h,100vh)] overflow-hidden px-4 sm:px-6 lg:px-8"
        >
          <div className="mx-auto mt-10 w-full max-w-[1400px] space-y-6 pb-20">
            <div className="h-64 rounded-2xl bg-neutral-100 dark:bg-neutral-900" />
            <div className="h-64 rounded-2xl bg-neutral-100 dark:bg-neutral-900" />
            <div className="h-64 rounded-2xl bg-neutral-100 dark:bg-neutral-900" />
            <div className="h-64 rounded-2xl bg-neutral-100 dark:bg-neutral-900" />
          </div>
        </div>
      </div>
    </section>
  );
}
