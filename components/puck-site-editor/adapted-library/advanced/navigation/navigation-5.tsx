"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { navigation5ContentDefaults } from "../../../content-editability-batch-3-contracts";
import type { Navigation5Item, Navigation5SocialLink } from "../../../content-editability-batch-3-contracts";

export { navigation5ContentDefaults };

export type AdaptedNavigation5Props = {
  mainHeading: string;
  mainDescription: string;
  brandMessage: string;
  contactLabel: string;
  contactHref: string;
  navItems: readonly Navigation5Item[];
  socialLinks: readonly Navigation5SocialLink[];
  openMenuLabel: string;
  closeMenuLabel: string;
  currentPageLabel: string;
};

export function AdaptedNavigation5({
  mainHeading,
  mainDescription,
  brandMessage,
  contactLabel,
  contactHref,
  navItems,
  socialLinks,
  openMenuLabel,
  closeMenuLabel,
  currentPageLabel,
}: AdaptedNavigation5Props = navigation5ContentDefaults) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-[var(--rb-section-min-h,100vh)] w-full relative bg-white dark:bg-neutral-950">
      <div
        className="absolute inset-0 z-0 dark:hidden"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)",
          opacity: 0.3,
        }}
      />

      <div
        className="absolute inset-0 z-0 hidden dark:block"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 10%, #0a0a0a 40%, #6366f1 100%)",
          opacity: 0.3,
        }}
      />

      <div className="relative z-10 p-8">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-4xl text-center font-medium tracking-tight text-neutral-900 dark:text-white mb-2">
            {mainHeading}
          </h1>
          <p className="text-neutral-600 tracking-tight text-center dark:text-neutral-400">
            {mainDescription}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 cursor-pointer"
          />
        )}
      </AnimatePresence>

      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="fixed bottom-6 left-0 right-0 z-50 px-6 pointer-events-none"
      >
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <div
            ref={navContainerRef}
            className="rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden"
          >
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="w-10 h-10 bg-neutral-900 dark:bg-white rounded-sm flex items-center justify-center"
                    >
                      <svg
                        className="w-6 h-6 text-white dark:text-neutral-900"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8z" />
                      </svg>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.15 }}
                      className="flex items-center justify-between"
                    >
                      <div className="text-2xl font-medium text-neutral-900 dark:text-white leading-tight">
                        {brandMessage}
                      </div>
                      <a
                        href={contactHref}
                        className="px-4 py-2 rounded-sm bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors no-underline"
                      >
                        {contactLabel}
                      </a>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="-mx-4"
                    >
                      {navItems.map((item, index) => (
                        <motion.a
                          key={item.title}
                          href={item.href}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
                          className={`flex items-center justify-between px-4 py-3 border-t hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors no-underline group cursor-pointer ${index === navItems.length - 1 ? "border-neutral-200 dark:border-neutral-800 border-b" : "border-neutral-200 dark:border-neutral-800"}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-12 bg-neutral-200 dark:bg-neutral-800 rounded-lg overflow-hidden shrink-0 group-hover:w-[84px] transition-all duration-200">
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-base font-light text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                              {item.title}
                            </span>
                          </div>
                        </motion.a>
                      ))}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                      className="space-y-1 pt-2"
                    >
                      {socialLinks.map((link) => (
                        <a
                          key={link.name}
                          href={link.href}
                          className="block text-xs text-neutral-500 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors no-underline"
                        >
                          {link.name}
                        </a>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between px-6 py-4 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 text-neutral-900 dark:text-white">
                {isExpanded ? (
                  <>
                    <ChevronDown className="w-5 h-5" />
                    <span className="text-sm font-medium">{closeMenuLabel}</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-5 h-5" />
                    <span className="text-sm font-medium">{openMenuLabel}</span>
                  </>
                )}
              </div>

              <div className="text-sm font-medium text-neutral-500 dark:text-neutral-500">
                {currentPageLabel}
              </div>
            </button>
          </div>
        </div>
      </motion.nav>
    </div>
  );
}

export default AdaptedNavigation5;
