"use client";

import { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react";
import { Menu, X } from "lucide-react";
import { navigation6ContentDefaults } from "../../../content-editability-batch-3-contracts";
import type { Navigation6Link, Navigation6MenuItem } from "../../../content-editability-batch-3-contracts";

export { navigation6ContentDefaults };

export type AdaptedNavigation6Props = {
  logoUrl: string;
  logoAlt: string;
  homeAriaLabel: string;
  logoHref: string;
  mainNavigationLabel: string;
  navigationMenuLabel: string;
  mainMenuLabel: string;
  footerNavigationLabel: string;
  openNavigationLabel: string;
  closeNavigationLabel: string;
  menuButtonLabel: string;
  closeButtonLabel: string;
  menuItems: readonly Navigation6MenuItem[];
  topNavItems: readonly Navigation6Link[];
  copyright: string;
  technologyNote: string;
  footerLinks: readonly Navigation6Link[];
};

export function AdaptedNavigation6({
  logoUrl,
  logoAlt,
  homeAriaLabel,
  logoHref,
  mainNavigationLabel,
  navigationMenuLabel,
  mainMenuLabel,
  footerNavigationLabel,
  openNavigationLabel,
  closeNavigationLabel,
  menuButtonLabel,
  closeButtonLabel,
  menuItems,
  topNavItems,
  copyright,
  technologyNote,
  footerLinks,
}: AdaptedNavigation6Props = navigation6ContentDefaults) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const smoothCursorX = useSpring(cursorX, { stiffness: 250, damping: 20 });
  const smoothCursorY = useSpring(cursorY, { stiffness: 250, damping: 20 });
  const parallaxX = useMotionValue(0);
  const parallaxY = useMotionValue(0);
  const smoothParallaxX = useSpring(parallaxX, { stiffness: 150, damping: 25 });
  const smoothParallaxY = useSpring(parallaxY, { stiffness: 150, damping: 25 });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  }, []);

  const handleMouseMove = (e: React.MouseEvent, index: number) => {
    if (window.matchMedia("(max-width: 1024px)").matches) return;
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);
    const rect = e.currentTarget.getBoundingClientRect();
    const normalizedX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const normalizedY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    parallaxX.set(normalizedX * 20);
    parallaxY.set(normalizedY * 20);
    setHoveredIndex(index);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredIndex(null);
      setIsVisible(false);
      parallaxX.set(0);
      parallaxY.set(0);
    }, 50);
  };

  return (
    <>
      <nav
        className="sticky top-0 z-40 w-full bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8 dark:bg-neutral-950/80"
        role="navigation"
        aria-label={mainNavigationLabel}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <motion.a
              href={logoHref}
              className="flex items-center outline-none"
              initial={{ y: 0 }}
              animate={{ y: isMenuOpen ? -100 : 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              aria-label={homeAriaLabel}
            >
              <img src={logoUrl} alt={logoAlt} className="h-8 w-auto dark:invert" />
            </motion.a>

            <motion.div
              className="hidden lg:flex items-center gap-8"
              initial={{ y: 0 }}
              animate={{ y: isMenuOpen ? -100 : 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              role="list"
            >
              {topNavItems.map((item, index) => (
                <a key={index} href={item.href} className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors outline-none">
                  {item.label}
                </a>
              ))}
            </motion.div>

            <button
              onClick={() => setIsMenuOpen(true)}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors outline-none"
              aria-label={openNavigationLabel}
              aria-expanded={isMenuOpen}
            >
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline">{menuButtonLabel}</span>
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-white dark:bg-neutral-950"
              role="dialog"
              aria-modal="true"
              aria-label={navigationMenuLabel}
            >
              <div className="fixed top-0 left-0 right-0 z-10 pointer-events-none">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-end h-16 sm:h-20">
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors pointer-events-auto outline-none"
                      aria-label={closeNavigationLabel}
                    >
                      <X className="w-4 h-4" />
                      <span className="hidden sm:inline">{closeButtonLabel}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-screen overflow-y-auto flex flex-col">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-between">
                  <div className="pt-4 h-full flex flex-col justify-between">
                    <div onMouseLeave={handleMouseLeave}>
                      <nav aria-label={mainMenuLabel}>
                        {menuItems.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, delay: 0.2 + index * 0.05, ease: [0.25, 0.1, 0.25, 1] as const }}
                            onMouseEnter={(e) => handleMouseMove(e, index)}
                            onMouseMove={(e) => handleMouseMove(e, index)}
                            className={`${index === 0 ? "pb-2 sm:pb-3" : "py-2 sm:py-3"}`}
                          >
                            <a
                              href={item.href}
                              onClick={() => {
                                setIsMenuOpen(false);
                                setIsVisible(false);
                                setHoveredIndex(null);
                              }}
                              className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-white transition-colors duration-300 leading-[1.1] cursor-pointer outline-none"
                            >
                              {item.label}
                            </a>
                          </motion.div>
                        ))}
                      </nav>
                    </div>

                    <motion.footer
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                      className="pb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-8"
                    >
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        <p>{copyright}</p>
                        <p className="mt-1">{technologyNote}</p>
                      </div>

                      <nav aria-label={footerNavigationLabel}>
                        <ul className="flex flex-wrap gap-4 sm:gap-6">
                          {footerLinks.map((link) => (
                            <li key={link.label}>
                              <a href={link.href} className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors outline-none">
                                {link.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    </motion.footer>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.85 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ opacity: { duration: 0.15 }, scale: { duration: 0.15 } }}
              style={{ position: "fixed", left: "40px", top: 0, x: smoothCursorX, y: smoothCursorY, pointerEvents: "none", zIndex: 100, width: "16rem", height: "16rem" }}
              aria-hidden="true"
            >
              <AnimatePresence initial={false}>
                {hoveredIndex !== null && (
                  <motion.div key={`preview-${hoveredIndex}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="absolute inset-0">
                    <div className="w-48 h-32 sm:w-64 sm:h-48 rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
                      <motion.img
                        src={menuItems[hoveredIndex].image}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{ x: smoothParallaxX, y: smoothParallaxY, scale: 1.1 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default AdaptedNavigation6;
