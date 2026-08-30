"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";

export function Navigation3() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "PRICING", href: "#" },
    { name: "DOCS", href: "#" },
    { name: "BLOG", href: "#" },
    { name: "TUTORIALS", href: "#" },
    { name: "CHANGELOG", href: "#" },
  ];

  return (
    <nav className="relative w-full px-4 sm:px-6 lg:px-8 py-4">
      <div className="mx-auto w-full max-w-[1400px]">
        <motion.div
          className="hidden lg:flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <a
            href="#"
            className="flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white no-underline"
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L2 7L12 12L22 7L12 2Z" />
              <path d="M2 17L12 22L22 17L12 12L2 17Z" />
            </svg>
            <span>Toosquare</span>
          </a>

          <div className="flex items-center gap-1 px-3 py-3 rounded-sm bg-neutral-200/80 dark:bg-neutral-900/80">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-[5px] hover:bg-white dark:hover:bg-neutral-800 no-underline"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#"
              className="px-4 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white no-underline"
            >
              LOGIN
            </a>
            <a
              href="#"
              className="px-5 py-3 rounded-sm bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 no-underline"
            >
              SIGN UP
            </a>
          </div>
        </motion.div>

        <motion.div
          className="lg:hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="flex items-center justify-between">
            <a
              href="#"
              className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white no-underline"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                <path d="M2 17L12 22L22 17L12 12L2 17Z" />
              </svg>
              <span>Toosquare</span>
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-sm bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-2 space-y-1">
                  <div className="bg-neutral-200/80 dark:bg-neutral-900/80 rounded-2xl p-2 mb-3">
                    {navLinks.map((link, index) => (
                      <motion.a
                        key={link.name}
                        href={link.href}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: index * 0.03,
                        }}
                        className="block px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-sm hover:bg-white dark:hover:bg-neutral-800 no-underline"
                      >
                        {link.name}
                      </motion.a>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <a
                      href="#"
                      className="block text-center px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white no-underline"
                    >
                      LOGIN
                    </a>
                    <a
                      href="#"
                      className="block text-center px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 no-underline"
                    >
                      SIGN UP
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </nav>
  );
}

export default Navigation3;
