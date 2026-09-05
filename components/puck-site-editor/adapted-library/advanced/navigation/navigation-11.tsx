"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ExternalLink, Menu, X } from "lucide-react";
import {
  navigation11ContentDefaults,
  type Navigation11Card,
  type Navigation11SectionGroup,
  type Navigation11FooterLink,
} from "../../../content-editability-batch-4-contracts";

type Navigation11Section = Navigation11SectionGroup & {
  cards: readonly Navigation11Card[];
};

function buildSections(
  sectionGroups: readonly Navigation11SectionGroup[],
  cards: readonly Navigation11Card[],
): Navigation11Section[] {
  return sectionGroups.map((section) => ({
    ...section,
    cards: cards.filter((card) => card.sectionLabel === section.label),
  }));
}

export type AdaptedNavigation11Props = {
  brandName: string;
  loginLabel: string;
  loginHref: string;
  primaryActionLabel: string;
  primaryActionHref: string;
  openMenuLabel: string;
  closeMenuLabel: string;
  sectionGroups: readonly Navigation11SectionGroup[];
  cards: readonly Navigation11Card[];
  footerPartnerLinks: readonly Navigation11FooterLink[];
  footerLegalLinks: readonly Navigation11FooterLink[];
};

export default function AdaptedNavigation11({
  brandName,
  loginLabel,
  loginHref,
  primaryActionLabel,
  primaryActionHref,
  openMenuLabel,
  closeMenuLabel,
  sectionGroups,
  cards,
  footerPartnerLinks,
  footerLegalLinks,
}: AdaptedNavigation11Props = navigation11ContentDefaults) {
  const sections = buildSections(sectionGroups, cards);
  const links = sections.map((section) => section.label);
  const [active, setActive] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = active
    ? sections.find((section) => section.label === active) ?? null
    : null;

  return (
    <section className="w-full min-h-[var(--rb-section-min-h,100vh)] bg-white dark:bg-neutral-950 flex items-start py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div
        className="max-w-[1400px] mx-auto w-full flex flex-col gap-4"
        onMouseLeave={() => setActive(null)}
      >
        <motion.nav
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-full bg-neutral-900 dark:bg-neutral-900 border border-neutral-800 pl-1.5 md:pl-6 pr-1.5 py-1.5 flex items-center justify-between gap-2"
        >
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <button
                key={l}
                type="button"
                onMouseEnter={() => setActive(l)}
                onFocus={() => setActive(l)}
                onClick={() => setActive((a) => (a === l ? null : l))}
                className={`text-sm transition-colors cursor-pointer py-2 ${
                  active === l
                    ? "text-white"
                    : "text-neutral-300 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 md:contents">
            <button
              type="button"
              onClick={() => {
                setMobileOpen((o) => !o);
                if (mobileOpen) setActive(null);
              }}
              aria-label={mobileOpen ? closeMenuLabel : openMenuLabel}
              className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-full text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <a
              href="#"
              className="md:absolute md:left-1/2 md:-translate-x-1/2 text-white font-semibold text-base sm:text-lg tracking-tight lowercase pointer-events-none whitespace-nowrap"
            >
              {brandName}
            </a>
          </div>

          <div className="flex items-center gap-1">
            <a
              href={loginHref}
              className="hidden sm:inline-flex text-sm text-neutral-300 hover:text-white px-3 py-2"
            >
              {loginLabel}
            </a>
            <a
              href={primaryActionHref}
              className="inline-flex items-center rounded-full bg-orange-500 text-white text-xs sm:text-sm font-medium px-3 sm:px-5 py-2 hover:bg-orange-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              {primaryActionLabel}
            </a>
          </div>
        </motion.nav>

        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.div
              key="mobile-links"
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="md:hidden rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              <div className="flex flex-col p-2">
                {links.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setActive((a) => (a === l ? null : l))}
                    className={`text-left text-sm rounded-2xl px-4 py-3 transition-colors cursor-pointer ${
                      active === l
                        ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {current && (
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              <div className="p-4 sm:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <p className="text-lg font-medium text-neutral-900 dark:text-white">
                      {current.heading}
                    </p>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {current.cards.map((c) => (
                        <a
                          key={c.title}
                          href={c.href}
                          className="group rounded-2xl bg-neutral-50 dark:bg-neutral-800 overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                        >
                          <div className="aspect-4/3 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                            <img
                              src={c.img}
                              alt=""
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                          </div>
                          <div className="p-4">
                            <div className="flex items-center gap-1 text-sm font-medium text-neutral-900 dark:text-white">
                              {c.title}
                              <ChevronRight className="h-4 w-4 text-neutral-500 transition-transform group-hover:translate-x-0.5" />
                            </div>
                            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                              {c.desc}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 pt-5 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between text-xs text-neutral-600 dark:text-neutral-400">
                  <div className="flex flex-wrap items-center gap-4">
                    {footerPartnerLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white"
                      >
                        {link.label} <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    {footerLegalLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        className="hover:text-neutral-900 dark:hover:text-white"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
