"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, Menu, Play, Plus, X } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const SPRING = { type: "spring" as const, bounce: 0, duration: 0.35 };
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const SEGMENTS = ["Queue", "Running", "Done"];

const MENU = [
  {
    label: "Workflows",
    children: ["All workflows", "Templates", "Scheduled runs", "Archive"],
  },
  {
    label: "Data",
    children: ["Sources", "Destinations", "Field mapping"],
  },
  { label: "Runs", children: null },
  { label: "Alerts", children: null },
  {
    label: "Settings",
    children: ["Workspace", "Members", "Billing", "API keys"],
  },
];

const RUNS: Record<string, { name: string; meta: string; state: string }[]> = {
  Queue: [
    { name: "Nightly ledger export", meta: "Starts in 12m", state: "Queued" },
    { name: "Cedar Labs backfill", meta: "Starts in 40m", state: "Queued" },
    {
      name: "Invoice reconciliation",
      meta: "Starts at 02:00",
      state: "Queued",
    },
  ],
  Running: [
    { name: "Warehouse sync", meta: "4m 12s elapsed", state: "Running" },
    { name: "Contact dedupe", meta: "58s elapsed", state: "Running" },
    { name: "Harbor Coffee import", meta: "2m 04s elapsed", state: "Running" },
    { name: "Usage rollup", meta: "6m 41s elapsed", state: "Running" },
    { name: "Invoice PDF batch", meta: "1m 19s elapsed", state: "Running" },
    {
      name: "Northwind field mapping",
      meta: "3m 55s elapsed",
      state: "Running",
    },
    { name: "Alert rule evaluation", meta: "22s elapsed", state: "Running" },
    { name: "Ledger checksum", meta: "8m 02s elapsed", state: "Running" },
  ],
  Done: [
    { name: "Weekly digest", meta: "Finished 21m ago", state: "Succeeded" },
    {
      name: "Region failover drill",
      meta: "Finished 2h ago",
      state: "Succeeded",
    },
    { name: "Legacy import", meta: "Finished 5h ago", state: "Failed" },
    { name: "Seat audit", meta: "Finished 9h ago", state: "Succeeded" },
    {
      name: "Cedar Labs backfill",
      meta: "Finished 11h ago",
      state: "Succeeded",
    },
    {
      name: "Nightly ledger export",
      meta: "Finished 14h ago",
      state: "Succeeded",
    },
    { name: "Contact enrichment", meta: "Finished 18h ago", state: "Failed" },
    { name: "Warehouse vacuum", meta: "Finished 21h ago", state: "Succeeded" },
  ],
};

export default function Mobile5() {
  const reduce = useReducedMotion();
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [segment, setSegment] = useState("Running");
  const [section, setSection] = useState<string | null>("Workflows");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const doc = rootRef.current?.ownerDocument;
    if (!doc) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    doc.addEventListener("keydown", onKeyDown);
    return () => doc.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const rows = RUNS[segment];

  return (
    <div className="relative flex h-full min-h-[680px] w-full justify-center overflow-hidden bg-white p-5 dark:bg-neutral-950">
      <div
        ref={rootRef}
        className="relative flex h-full w-full max-w-[390px] flex-col overflow-hidden rounded-[28px] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
      >
        <header className="relative z-20 flex h-14 shrink-0 items-center justify-between gap-2 px-4">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className={cx(
              "inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[var(--rb-r-xl,12px)] text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900",
              transition,
              focus,
            )}
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="min-w-0 truncate text-[15px] font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
            Runs
          </p>
          <button
            type="button"
            aria-label="New run"
            className={cx(
              "inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[var(--rb-r-xl,12px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] active:scale-[0.95] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]",
              transition,
              focus,
            )}
          >
            <Plus className="h-5 w-5" />
          </button>
        </header>

        <div className="shrink-0 px-4 pb-3">
          <div
            role="tablist"
            aria-label="Run status"
            className="flex items-center gap-0.5 rounded-[var(--rb-r-2xl,14px)] bg-neutral-100 p-1 dark:bg-neutral-900"
          >
            {SEGMENTS.map((s) => {
              const isActive = s === segment;
              return (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSegment(s)}
                  className={cx(
                    "relative inline-flex h-9 flex-1 cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)] text-[13px] font-medium",
                    transition,
                    focus,
                    isActive
                      ? "text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100",
                  )}
                >
                  {isActive && (
                    <motion.span
                      aria-hidden
                      layoutId={`${uid}-seg`}
                      transition={reduce ? { duration: 0 } : SPRING}
                      className="absolute inset-0 rounded-[var(--rb-r-lg,10px)] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.08)] dark:bg-neutral-800"
                    />
                  )}
                  <span className="relative">{s}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={segment}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                transition: { duration: 0.12, ease: EASE_OUT },
              }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="space-y-1"
            >
              {rows.map((r, i) => (
                <motion.li
                  key={r.name}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.24,
                    ease: EASE_OUT,
                    delay: reduce ? 0 : Math.min(i * 0.035, 0.2),
                  }}
                >
                  <button
                    type="button"
                    className={cx(
                      "flex min-h-[60px] w-full cursor-pointer items-center gap-3 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200 bg-white px-3.5 py-3 text-left hover:bg-neutral-50 active:scale-[0.995] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800",
                      transition,
                      focus,
                    )}
                  >
                    <span
                      aria-hidden
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--rb-r-lg,10px)] bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      <Play className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-neutral-900 dark:text-neutral-100">
                        {r.name}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-neutral-500">
                        <span
                          aria-hidden
                          className={cx(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            r.state === "Running"
                              ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
                              : r.state === "Failed"
                                ? "bg-neutral-400"
                                : "bg-neutral-300 dark:bg-neutral-600",
                          )}
                        />
                        <span className="truncate">
                          {r.state} · {r.meta}
                        </span>
                      </span>
                    </span>
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: { duration: 0.16, ease: EASE_OUT },
              }}
              transition={{ duration: 0.24, ease: EASE_OUT }}
              className="absolute inset-0 z-40 flex flex-col bg-white dark:bg-neutral-950"
            >
              <div className="flex h-14 shrink-0 items-center justify-between px-4">
                <p className="text-[15px] font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
                  Meridian
                </p>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className={cx(
                    "inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[var(--rb-r-xl,12px)] text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900",
                    transition,
                    focus,
                  )}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav
                aria-label="Sections"
                className="min-h-0 flex-1 overflow-y-auto px-3 pb-4"
              >
                {MENU.map((m, i) => {
                  const isOpen = section === m.label;
                  return (
                    <motion.div
                      key={m.label}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: EASE_OUT,
                        delay: reduce ? 0 : 0.04 + i * 0.035,
                      }}
                    >
                      <button
                        type="button"
                        aria-expanded={m.children ? isOpen : undefined}
                        onClick={() =>
                          m.children
                            ? setSection(isOpen ? null : m.label)
                            : setOpen(false)
                        }
                        className={cx(
                          "flex min-h-[52px] w-full cursor-pointer items-center justify-between gap-3 rounded-[var(--rb-r-xl,12px)] px-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900",
                          transition,
                          focus,
                        )}
                      >
                        <span className="min-w-0 truncate text-[22px] leading-tight font-medium tracking-[-0.02em] text-neutral-900 dark:text-neutral-100">
                          {m.label}
                        </span>
                        {m.children ? (
                          <ChevronDown
                            aria-hidden
                            className={cx(
                              "h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ease-out motion-reduce:transition-none",
                              isOpen && "rotate-180",
                            )}
                          />
                        ) : null}
                      </button>

                      <AnimatePresence initial={false}>
                        {m.children && isOpen && (
                          <motion.ul
                            initial={
                              reduce
                                ? { opacity: 0 }
                                : { height: 0, opacity: 0 }
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
                            className="overflow-hidden pl-3"
                          >
                            {m.children.map((c) => (
                              <li key={c}>
                                <button
                                  type="button"
                                  onClick={() => setOpen(false)}
                                  className={cx(
                                    "flex min-h-[44px] w-full cursor-pointer items-center rounded-[var(--rb-r-lg,10px)] px-3 text-left text-[14px] text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100",
                                    transition,
                                    focus,
                                  )}
                                >
                                  {c}
                                </button>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </nav>

              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  ease: EASE_OUT,
                  delay: reduce ? 0 : 0.04 + MENU.length * 0.035,
                }}
                className="shrink-0 p-3"
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={cx(
                    "flex min-h-[56px] w-full cursor-pointer items-center gap-3 rounded-[var(--rb-r-3xl,16px)] bg-neutral-100 px-3 text-left dark:bg-neutral-900",
                    transition,
                    focus,
                  )}
                >
                  <span
                    aria-hidden
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    AR
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-neutral-900 dark:text-neutral-100">
                      Ana Reyes
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] text-neutral-500">
                      ana@meridian.example
                    </span>
                  </span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
