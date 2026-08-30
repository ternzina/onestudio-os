"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  BookOpen,
  Boxes,
  ChevronDown,
  Layers,
  LifeBuoy,
  Menu,
  Newspaper,
  ShieldCheck,
  Users,
  Workflow,
  X,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const EASE_DRAWER: [number, number, number, number] = [0.32, 0.72, 0, 1];

const pop = (reduce: boolean | null) => ({
  initial: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -4 },
  animate: reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 },
  exit: reduce
    ? { opacity: 0, transition: { duration: 0.12 } }
    : {
        opacity: 0,
        scale: 0.97,
        y: -4,
        transition: { duration: 0.12, ease: EASE_OUT },
      },
  transition: { duration: 0.18, ease: EASE_OUT },
});

type Link = { icon: typeof Layers; label: string; hint: string };

const MENUS: Record<string, Link[]> = {
  Product: [
    {
      icon: Layers,
      label: "Platform",
      hint: "The workspace your team runs on",
    },
    {
      icon: Workflow,
      label: "Automations",
      hint: "Rules that move work forward",
    },
    {
      icon: Boxes,
      label: "Integrations",
      hint: "Connect the tools you already use",
    },
    {
      icon: ShieldCheck,
      label: "Security",
      hint: "Controls, audit logs and SSO",
    },
  ],
  Company: [
    { icon: Users, label: "About", hint: "Who we are and what we build" },
    {
      icon: Newspaper,
      label: "Blog",
      hint: "Product notes and engineering posts",
    },
    {
      icon: BookOpen,
      label: "Careers",
      hint: "Nine open roles across four teams",
    },
    { icon: LifeBuoy, label: "Support", hint: "Reach a human within one hour" },
  ],
};

const FLAT = ["Pricing", "Changelog"];

export default function Navbar4() {
  const reduce = useReducedMotion();
  const [menu, setMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [section, setSection] = useState<string | null>("Product");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu && !mobileOpen) return;
    const doc = rootRef.current?.ownerDocument;
    if (!doc) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest?.("[data-menu-root]")) setMenu(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenu(null);
      setMobileOpen(false);
    };
    doc.addEventListener("pointerdown", onPointerDown);
    doc.addEventListener("keydown", onKeyDown);
    return () => {
      doc.removeEventListener("pointerdown", onPointerDown);
      doc.removeEventListener("keydown", onKeyDown);
    };
  }, [menu, mobileOpen]);

  const open = (id: string) => {
    setMenu((m) => (m === id ? null : id));
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className="relative flex h-full min-h-[560px] w-full flex-col overflow-hidden bg-white dark:bg-neutral-950"
    >
      <header className="relative z-20 flex h-16 shrink-0 items-center gap-2 border-b border-neutral-200 px-4 sm:px-6 dark:border-neutral-800">
        <a
          href="#"
          className={cx(
            "inline-flex shrink-0 items-center gap-2 rounded-[var(--rb-r-md,8px)]",
            focus,
          )}
        >
          <span
            aria-hidden
            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--rb-r-lg,10px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
          >
            <Layers className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.015em] text-neutral-900 dark:text-neutral-100">
            Halcyon
          </span>
        </a>

        <span
          aria-hidden
          className="mx-2 hidden h-5 w-px bg-neutral-200 md:block dark:bg-neutral-800"
        />

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-0.5">
            {Object.keys(MENUS).map((key) => (
              <li key={key} className="relative" data-menu-root>
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={menu === key}
                  onClick={() => open(key)}
                  className={cx(
                    "inline-flex h-9 cursor-pointer items-center gap-1 rounded-[var(--rb-r-md,8px)] px-2.5 text-sm font-medium",
                    menu === key
                      ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                    transition,
                    focus,
                  )}
                >
                  {key}
                  <ChevronDown
                    aria-hidden
                    className={cx(
                      "h-3.5 w-3.5 text-neutral-400 transition-transform duration-150 ease-out motion-reduce:transition-none",
                      menu === key && "rotate-180",
                    )}
                  />
                </button>
                <AnimatePresence>
                  {menu === key && (
                    <motion.div
                      {...pop(reduce)}
                      className={cx(
                        "absolute top-full left-0 z-30 mt-1.5 w-[320px] origin-top-left rounded-[var(--rb-r-2xl,14px)] border border-neutral-200 bg-white p-1.5 shadow-[0_12px_32px_-10px_rgba(0,0,0,0.22)] transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none dark:border-neutral-800 dark:bg-neutral-900",
                      )}
                    >
                      {MENUS[key].map((l) => {
                        const Icon = l.icon;
                        return (
                          <a
                            key={l.label}
                            href="#"
                            onClick={() => setMenu(null)}
                            className={cx(
                              "flex items-start gap-2.5 rounded-[var(--rb-r-lg,10px)] p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800",
                              transition,
                              focus,
                            )}
                          >
                            <span
                              aria-hidden
                              className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                                {l.label}
                              </span>
                              <span className="mt-0.5 block text-[12px] text-neutral-500">
                                {l.hint}
                              </span>
                            </span>
                          </a>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
            {FLAT.map((f) => (
              <li key={f}>
                <a
                  href="#"
                  className={cx(
                    "inline-flex h-9 items-center rounded-[var(--rb-r-md,8px)] px-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                    transition,
                    focus,
                  )}
                >
                  {f}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <a
            href="#"
            className={cx(
              "hidden h-9 items-center rounded-[var(--rb-r-md,8px)] px-3 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 sm:inline-flex dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
              transition,
              focus,
            )}
          >
            Sign in
          </a>
          <a
            href="#"
            className={cx(
              "inline-flex h-9 items-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3.5 text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
              transition,
              focus,
            )}
          >
            Get started
          </a>
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => (mobileOpen ? closeMobile() : setMobileOpen(true))}
            className={cx(
              "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-600 hover:bg-neutral-100 md:hidden dark:text-neutral-300 dark:hover:bg-neutral-800",
              transition,
              focus,
            )}
          >
            {mobileOpen ? (
              <X className="h-4.5 w-4.5" />
            ) : (
              <Menu className="h-4.5 w-4.5" />
            )}
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-[560px] text-center">
          <p className="text-[12px] font-medium tracking-[0.08em] text-neutral-500 uppercase">
            Ship with confidence
          </p>
          <h1 className="mt-2 text-[28px] leading-[1.15] font-semibold tracking-[-0.02em] text-neutral-900 sm:text-[34px] dark:text-neutral-100">
            One workspace for the whole release
          </h1>
          <p className="mx-auto mt-3 max-w-[420px] text-[14px] leading-relaxed text-neutral-500">
            Plan the work, run the automations and watch it land, without
            stitching six tools together.
          </p>
        </div>
        <div className="mx-auto mt-8 h-[120px] max-w-[720px] rounded-[var(--rb-r-3xl,16px)] border border-dashed border-neutral-200 bg-neutral-50/60 dark:border-neutral-800 dark:bg-neutral-900/40" />
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={closeMobile}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: { duration: 0.16, ease: EASE_OUT },
              }}
              transition={{ duration: 0.24, ease: EASE_OUT }}
              className="absolute inset-0 z-30 cursor-default bg-neutral-950/20 md:hidden dark:bg-neutral-950/50"
            />
            <motion.nav
              aria-label="Mobile"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={
                reduce
                  ? { opacity: 0, transition: { duration: 0.16 } }
                  : {
                      opacity: 0,
                      y: -10,
                      transition: { duration: 0.2, ease: EASE_DRAWER },
                    }
              }
              transition={{ duration: 0.3, ease: EASE_DRAWER }}
              className="absolute inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-neutral-200 bg-white p-3 md:hidden dark:border-neutral-800 dark:bg-neutral-950"
            >
              {Object.keys(MENUS).map((key) => {
                const isOpen = section === key;
                return (
                  <div key={key} className="mb-1">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setSection(isOpen ? null : key)}
                      className={cx(
                        "flex h-11 w-full cursor-pointer items-center justify-between rounded-[var(--rb-r-lg,10px)] px-3 text-sm font-medium text-neutral-900 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-900",
                        transition,
                        focus,
                      )}
                    >
                      {key}
                      <ChevronDown
                        aria-hidden
                        className={cx(
                          "h-4 w-4 text-neutral-400 transition-transform duration-150 ease-out motion-reduce:transition-none",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.ul
                          initial={
                            reduce ? { opacity: 0 } : { height: 0, opacity: 0 }
                          }
                          animate={
                            reduce
                              ? { opacity: 1 }
                              : { height: "auto", opacity: 1 }
                          }
                          exit={
                            reduce
                              ? { opacity: 0, transition: { duration: 0.12 } }
                              : {
                                  height: 0,
                                  opacity: 0,
                                  transition: {
                                    duration: 0.16,
                                    ease: EASE_OUT,
                                  },
                                }
                          }
                          transition={{ duration: 0.2, ease: EASE_OUT }}
                          className="mt-0.5 ml-3 space-y-0.5 overflow-hidden border-l border-neutral-200 pl-3 dark:border-neutral-800"
                        >
                          {MENUS[key].map((l) => (
                            <li key={l.label}>
                              <a
                                href="#"
                                onClick={closeMobile}
                                className={cx(
                                  "flex h-10 items-center rounded-[var(--rb-r-md,8px)] px-2.5 text-[13px] text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-100",
                                  transition,
                                  focus,
                                )}
                              >
                                {l.label}
                              </a>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              {FLAT.map((f) => (
                <a
                  key={f}
                  href="#"
                  onClick={closeMobile}
                  className={cx(
                    "flex h-11 items-center rounded-[var(--rb-r-lg,10px)] px-3 text-sm font-medium text-neutral-900 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-900",
                    transition,
                    focus,
                  )}
                >
                  {f}
                </a>
              ))}
              <div className="mt-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
                <a
                  href="#"
                  onClick={closeMobile}
                  className={cx(
                    "flex h-11 items-center justify-center rounded-[var(--rb-r-lg,10px)] border border-neutral-200 text-sm font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-900",
                    transition,
                    focus,
                  )}
                >
                  Sign in
                </a>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
