"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, Menu, X, Flame, Twitter, Github } from "lucide-react";

export default function Navigation10() {
  const [open, setOpen] = useState(false);

  return (
    <section className="relative w-full min-h-[var(--rb-section-min-h,100vh)] bg-white dark:bg-neutral-950 flex items-start">
      <div className="w-full">
        <motion.nav
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 px-4 sm:px-8 py-5 border-b border-dashed border-neutral-300 dark:border-neutral-800"
        >
          <a href="#" className="flex items-center gap-2">
            <span className="grid place-items-center h-7 w-7 shrink-0 rounded-full bg-neutral-900 dark:bg-white">
              <Flame
                className="h-3.5 w-3.5 text-white dark:text-neutral-900"
                strokeWidth={2.2}
              />
            </span>
            <span className="tracking-[0.2em] text-sm font-semibold text-neutral-900 dark:text-white">
              NORTHWIND
            </span>
          </a>

          <a
            href="#"
            className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 shadow-sm hover:shadow transition-shadow"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Early access is open. Northwind is live on iOS
            <span className="text-neutral-400">›</span>
          </a>

          <div className="col-start-3 flex items-center justify-end">
            <button className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold tracking-[0.15em] cursor-pointer mr-1.5">
              <Download className="h-4 w-4" strokeWidth={2.2} />
              <span className="hidden sm:inline">DOWNLOAD</span>
            </button>
            <div className="h-9 w-9 shrink-0" aria-hidden="true" />
          </div>
        </motion.nav>

        <AnimatePresence>
          {open && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {open && (
            <motion.aside
              key="panel"
              initial={{ clipPath: "circle(0% at calc(100% - 18px) 18px)" }}
              animate={{ clipPath: "circle(150% at calc(100% - 18px) 18px)" }}
              exit={{ clipPath: "circle(0% at calc(100% - 18px) 18px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-[18px] right-4 sm:right-8 w-[min(92vw,420px)] h-[min(85vh,640px)] z-40 rounded-2xl bg-neutral-950 text-white border border-neutral-800 shadow-lg overflow-hidden"
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25, delay: 0.2 }}
                className="absolute inset-0 p-6 sm:p-7 pt-14 flex flex-col"
              >
                <nav className="flex flex-col gap-2">
                  <a
                    href="#"
                    className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight"
                  >
                    Homepage
                  </a>
                  <a
                    href="#"
                    className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight"
                  >
                    Careers
                  </a>
                </nav>

                <div className="mt-10 pt-6 border-t border-dashed border-neutral-700">
                  <p className="text-[11px] tracking-[0.2em] text-neutral-500">
                    RESOURCES
                  </p>
                  <div className="mt-4 flex flex-col gap-3">
                    <a href="#" className="text-base text-neutral-200">
                      Privacy
                    </a>
                    <div className="h-px w-full border-t border-dashed border-neutral-800" />
                    <a href="#" className="text-base text-neutral-200">
                      Terms of Service
                    </a>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-dashed border-neutral-700 flex items-center gap-2">
                  <a
                    href="#"
                    className="grid place-items-center h-9 w-9 rounded-md bg-neutral-800 text-white"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a
                    href="#"
                    className="grid place-items-center h-9 w-9 rounded-md bg-neutral-800 text-white"
                    aria-label="GitHub"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                </div>

                <div className="mt-auto pt-8">
                  <button className="w-full inline-flex items-center justify-between px-5 py-4 rounded-full border border-neutral-700 text-white text-xs font-semibold tracking-[0.2em] hover:bg-neutral-900 transition-colors cursor-pointer">
                    DOWNLOAD THE APP
                    <Download className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                </div>
              </motion.div>
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="fixed top-5 right-4 sm:right-8 z-50 h-9 w-9 pointer-events-none">
          <motion.div
            initial={false}
            animate={{ opacity: open ? 0 : 1 }}
            transition={{ duration: open ? 0 : 0.2, delay: open ? 0 : 0.35 }}
            className="absolute inset-0 rounded-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800"
          />
          <motion.button
            onClick={() => setOpen((v) => !v)}
            initial={false}
            animate={{ x: open ? -1 : 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 grid place-items-center rounded-full cursor-pointer pointer-events-auto"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span
              className="grid place-items-center text-white"
              style={{ mixBlendMode: "difference" }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.span
                    key="x"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="grid place-items-center"
                  >
                    <X className="h-4 w-4" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="m"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="grid place-items-center"
                  >
                    <Menu className="h-4 w-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </motion.button>
        </div>
      </div>
    </section>
  );
}
