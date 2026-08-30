"use client";

import { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react";
import { Menu, X } from "lucide-react";

interface MenuItem {
  label: string;
  href: string;
  image: string;
}

export function Navigation6() {
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

  const menuItems: MenuItem[] = [
    {
      label: "Products",
      href: "#products",
      image:
        "https://images.unsplash.com/photo-1762278804698-fc25d03b69e7?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      label: "Solutions",
      href: "#solutions",
      image:
        "https://images.unsplash.com/photo-1762278804771-65c446b6acdb?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      label: "Resources",
      href: "#resources",
      image:
        "https://images.unsplash.com/photo-1762278804832-7f9b4cf3b693?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      label: "Company",
      href: "#company",
      image:
        "https://images.unsplash.com/photo-1762278804930-fd04fc7111c1?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      label: "Contact",
      href: "#contact",
      image:
        "https://images.unsplash.com/photo-1762278805645-cdcbd21c0e7f?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  const topNavItems = [
    { label: "About", href: "#about" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Blog", href: "#blog" },
  ];

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent, index: number) => {
    if (window.matchMedia("(max-width: 1024px)").matches) {
      return;
    }

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const normalizedX = (e.clientX - centerX) / (rect.width / 2);
    const normalizedY = (e.clientY - centerY) / (rect.height / 2);

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
        aria-label="Main navigation"
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <motion.a
              href="#"
              className="flex items-center outline-none"
              initial={{ y: 0 }}
              animate={{ y: isMenuOpen ? -100 : 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              aria-label="Home"
            >
              <img
                src="/mock-logos/spherule.svg"
                alt="Company logo"
                className="h-8 w-auto dark:invert"
              />
            </motion.a>

            <motion.div
              className="hidden lg:flex items-center gap-8"
              initial={{ y: 0 }}
              animate={{ y: isMenuOpen ? -100 : 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              role="list"
            >
              {topNavItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors outline-none"
                >
                  {item.label}
                </a>
              ))}
            </motion.div>

            <button
              onClick={() => setIsMenuOpen(true)}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors outline-none"
              aria-label="Open navigation menu"
              aria-expanded={isMenuOpen}
            >
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline">Menu</span>
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
              aria-label="Navigation menu"
            >
              <div className="fixed top-0 left-0 right-0 z-10 pointer-events-none">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-end h-16 sm:h-20">
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors pointer-events-auto outline-none"
                      aria-label="Close navigation menu"
                    >
                      <X className="w-4 h-4" />
                      <span className="hidden sm:inline">Close</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-screen overflow-y-auto flex flex-col">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-between">
                  <div className="pt-4 h-full flex flex-col justify-between">
                    <div onMouseLeave={handleMouseLeave}>
                      <nav aria-label="Main menu">
                        {menuItems.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{
                              duration: 0.4,
                              delay: 0.2 + index * 0.05,
                              ease: [0.25, 0.1, 0.25, 1] as const,
                            }}
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
                        <p>© 2024 All rights reserved</p>
                        <p className="mt-1">Built with React & Tailwind</p>
                      </div>

                      <nav aria-label="Footer navigation">
                        <ul className="flex flex-wrap gap-4 sm:gap-6">
                          <li>
                            <a
                              href="#contact"
                              className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors outline-none"
                            >
                              Get in touch
                            </a>
                          </li>
                          <li>
                            <a
                              href="#careers"
                              className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors outline-none"
                            >
                              Careers
                            </a>
                          </li>
                          <li>
                            <a
                              href="#support"
                              className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors outline-none"
                            >
                              Support
                            </a>
                          </li>
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
              animate={{
                opacity: isVisible ? 1 : 0,
                scale: isVisible ? 1 : 0.85,
              }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{
                opacity: { duration: 0.15 },
                scale: { duration: 0.15 },
              }}
              style={{
                position: "fixed",
                left: "40px",
                top: 0,
                x: smoothCursorX,
                y: smoothCursorY,
                pointerEvents: "none",
                zIndex: 100,
                width: "16rem",
                height: "16rem",
              }}
              aria-hidden="true"
            >
              <AnimatePresence initial={false}>
                {hoveredIndex !== null && (
                  <motion.div
                    key={`preview-${hoveredIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="absolute inset-0"
                  >
                    <div className="w-48 h-32 sm:w-64 sm:h-48 rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
                      <motion.img
                        src={menuItems[hoveredIndex].image}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{
                          x: smoothParallaxX,
                          y: smoothParallaxY,
                          scale: 1.1,
                        }}
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

export default Navigation6;
