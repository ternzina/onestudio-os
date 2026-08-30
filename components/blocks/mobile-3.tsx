"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesColumn,
  CornerDownLeft,
  Inbox,
  House,
  Search,
  X,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const SPRING = { type: "spring" as const, bounce: 0, duration: 0.35 };
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const DESTINATIONS = [
  { id: "home", label: "Home", icon: House },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "schedule", label: "Schedule", icon: CalendarDays },
  { id: "reports", label: "Reports", icon: ChartNoAxesColumn },
];

const FEED = [
  {
    title: "Alder Group signed the pilot",
    body: "Two regions go live on Monday. Provisioning is already queued.",
    meta: "Deals · 14m ago",
  },
  {
    title: "Latency back under target",
    body: "The eu-west read replica caught up after the reindex finished.",
    meta: "Platform · 1h ago",
  },
  {
    title: "Weekly digest is ready",
    body: "Retention held at 94% and three accounts moved into expansion.",
    meta: "Reports · 3h ago",
  },
  {
    title: "Harbor Coffee replied",
    body: "They want the invoice split across two cost centres from July.",
    meta: "Support · 5h ago",
  },
  {
    title: "Two seats freed on the Cedar Labs plan",
    body: "Both were dormant for 60 days, so the July invoice drops by $180.",
    meta: "Billing · 8h ago",
  },
];

const TARGETS = [
  { title: "Alder Group", meta: "Account" },
  { title: "Renewal pipeline", meta: "Saved view" },
  { title: "Invoice 4192", meta: "Billing" },
  { title: "Ana Reyes", meta: "Teammate" },
  { title: "Latency incident", meta: "Report" },
  { title: "Harbor Coffee", meta: "Account" },
];

export default function Mobile3() {
  const reduce = useReducedMotion();
  const uid = useId();
  const [active, setActive] = useState("home");
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searching) return;
    const view = inputRef.current?.ownerDocument.defaultView;
    const frame = view?.requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      if (frame !== undefined) view?.cancelAnimationFrame(frame);
    };
  }, [searching]);

  useEffect(() => {
    if (!searching) return;
    const doc = rootRef.current?.ownerDocument;
    if (!doc) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearching(false);
    };
    doc.addEventListener("keydown", onKeyDown);
    return () => doc.removeEventListener("keydown", onKeyDown);
  }, [searching]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TARGETS.slice(0, 4);
    return TARGETS.filter((t) => t.title.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="relative flex h-full min-h-[680px] w-full justify-center overflow-hidden bg-white p-5 dark:bg-neutral-950">
      <div
        ref={rootRef}
        className="relative flex h-full w-full max-w-[390px] flex-col overflow-hidden rounded-[28px] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
      >
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-5">
          <p className="min-w-0 truncate text-[15px] font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
            {DESTINATIONS.find((d) => d.id === active)?.label}
          </p>
          <span
            aria-hidden
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
          >
            AR
          </span>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-28">
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={active}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                transition: { duration: 0.12, ease: EASE_OUT },
              }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="space-y-2"
            >
              {FEED.map((f, i) => (
                <motion.li
                  key={f.title}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.26,
                    ease: EASE_OUT,
                    delay: reduce ? 0 : Math.min(i * 0.04, 0.2),
                  }}
                  className="rounded-[var(--rb-r-2xl,14px)] border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 text-[14px] font-medium text-neutral-900 dark:text-neutral-100">
                      {f.title}
                    </p>
                    <ArrowUpRight
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-neutral-300 dark:text-neutral-600"
                    />
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
                    {f.body}
                  </p>
                  <p className="mt-2.5 text-[12px] text-neutral-400">
                    {f.meta}
                  </p>
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {searching && (
            <motion.button
              type="button"
              aria-label="Close search"
              onClick={() => setSearching(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: { duration: 0.16, ease: EASE_OUT },
              }}
              transition={{ duration: 0.24, ease: EASE_OUT }}
              className="absolute inset-0 z-30 cursor-default bg-white/75 backdrop-blur-[3px] dark:bg-neutral-950/75"
            />
          )}
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex flex-col items-center gap-2 px-5 pb-5">
          <AnimatePresence>
            {searching && matches.length > 0 && (
              <motion.ul
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={
                  reduce
                    ? { opacity: 0, transition: { duration: 0.12 } }
                    : {
                        opacity: 0,
                        y: 10,
                        transition: { duration: 0.16, ease: EASE_OUT },
                      }
                }
                transition={{ duration: 0.24, ease: EASE_OUT }}
                className="pointer-events-auto w-full origin-bottom overflow-hidden rounded-[var(--rb-r-4xl,18px)] border border-neutral-200 bg-white p-1.5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.28)] dark:border-neutral-800 dark:bg-neutral-900"
              >
                {matches.map((m, i) => (
                  <motion.li
                    key={m.title}
                    layout={!reduce}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.18,
                      ease: EASE_OUT,
                      delay: reduce ? 0 : Math.min(i * 0.03, 0.15),
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setQuery(m.title);
                        setSearching(false);
                      }}
                      className={cx(
                        "flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-[var(--rb-r-2xl,14px)] px-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800",
                        transition,
                        focus,
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                        {m.title}
                      </span>
                      <span className="shrink-0 text-[12px] text-neutral-500">
                        {m.meta}
                      </span>
                    </button>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>

          <motion.div
            layout={!reduce}
            transition={reduce ? { duration: 0 } : SPRING}
            className={cx(
              "pointer-events-auto flex h-14 items-center overflow-hidden rounded-full border border-neutral-200 bg-white/90 p-1.5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/90",
              searching ? "w-full" : "w-auto",
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {searching ? (
                <motion.div
                  key="search"
                  initial={
                    reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.1, ease: EASE_OUT },
                  }}
                  transition={{ duration: 0.18, ease: EASE_OUT }}
                  className="flex w-full items-center gap-2 pl-3"
                >
                  <Search
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-neutral-400"
                  />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search accounts, views, invoices"
                    aria-label="Search"
                    className="min-w-0 flex-1 bg-transparent text-[14px] text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
                  />
                  {query ? (
                    <span className="hidden shrink-0 items-center gap-1 text-[11px] text-neutral-400 sm:flex">
                      <CornerDownLeft aria-hidden className="h-3 w-3" />
                      open
                    </span>
                  ) : null}
                  <button
                    type="button"
                    aria-label="Close search"
                    onClick={() => {
                      setSearching(false);
                      setQuery("");
                    }}
                    className={cx(
                      "inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                      transition,
                      focus,
                    )}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.nav
                  key="nav"
                  aria-label="Primary"
                  initial={
                    reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.1, ease: EASE_OUT },
                  }}
                  transition={{ duration: 0.18, ease: EASE_OUT }}
                  className="flex items-center gap-0.5"
                >
                  {DESTINATIONS.map((d) => {
                    const isActive = d.id === active;
                    const Icon = d.icon;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        aria-label={d.label}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setActive(d.id)}
                        className={cx(
                          "relative inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full",
                          transition,
                          focus,
                          isActive
                            ? "text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                            : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100",
                        )}
                      >
                        {isActive && (
                          <motion.span
                            aria-hidden
                            layoutId={`${uid}-dock`}
                            transition={reduce ? { duration: 0 } : SPRING}
                            className="absolute inset-0 rounded-full bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
                          />
                        )}
                        <Icon
                          aria-hidden
                          className="relative h-[18px] w-[18px]"
                        />
                      </button>
                    );
                  })}
                  <span
                    aria-hidden
                    className="mx-1 h-6 w-px bg-neutral-200 dark:bg-neutral-800"
                  />
                  <button
                    type="button"
                    aria-label="Search"
                    onClick={() => setSearching(true)}
                    className={cx(
                      "inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                      transition,
                      focus,
                    )}
                  >
                    <Search className="h-[18px] w-[18px]" />
                  </button>
                </motion.nav>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
