"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ChevronRight,
  Folder,
  MoreHorizontal,
  Plus,
  Search,
  Star,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const SPRING = { type: "spring", bounce: 0, duration: 0.35 } as const;

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const iconButton =
  "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100";

const CRUMBS = [
  { label: "Products", icon: true },
  { label: "Mobile", icon: true },
  { label: "Checkout Flow", icon: false },
];

const TABS = [
  { id: "discussion", label: "Discussion", count: 3 },
  { id: "tasks", label: "Tasks", count: 0 },
  { id: "timeline", label: "Timeline", count: 0 },
  { id: "files", label: "Files", count: 0 },
  { id: "overview", label: "Overview", count: 0 },
];

const PEOPLE = ["AM", "RK", "TN", "JD"];

const PANELS: Record<string, { title: string; rows: string[] }[]> = {
  discussion: [
    { title: "Open threads", rows: ["Payment retries", "Guest checkout"] },
    { title: "Mentions", rows: ["Refund copy review"] },
    { title: "Resolved", rows: ["Address autofill", "Coupon field"] },
  ],
  tasks: [
    { title: "In progress", rows: ["Wallet sheet", "Card vaulting"] },
    { title: "In review", rows: ["Step-up challenge state"] },
    { title: "Done", rows: ["Order summary", "Tax breakdown"] },
  ],
  timeline: [
    { title: "This week", rows: ["Design freeze", "Copy handoff"] },
    { title: "Next week", rows: ["Beta rollout"] },
    { title: "Later", rows: ["Wallet support", "Split payments"] },
  ],
  files: [
    { title: "Specs", rows: ["checkout-flow.pdf", "states.fig"] },
    { title: "Research", rows: ["drop-off-study.md"] },
    { title: "Assets", rows: ["icons.zip", "brand-marks.svg"] },
  ],
  overview: [
    { title: "Goal", rows: ["Cut checkout drop-off by 12%"] },
    { title: "Owners", rows: ["Payments", "Growth"] },
    { title: "Status", rows: ["On track for the July release"] },
  ],
};

export default function Navbar1() {
  const [active, setActive] = useState("tasks");
  const [starred, setStarred] = useState(false);
  const uid = useId();
  const reduce = useReducedMotion();

  const onTabKeyDown = (event: React.KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === active);
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setActive(TABS[(i + 1) % TABS.length].id);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActive(TABS[(i - 1 + TABS.length) % TABS.length].id);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(TABS[0].id);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(TABS[TABS.length - 1].id);
    }
  };

  const panels = PANELS[active];

  return (
    <div className="relative flex h-full min-h-[480px] w-full flex-col overflow-hidden bg-white dark:bg-neutral-950">
      <header className="shrink-0 border-b border-neutral-200 px-4 pt-5 sm:px-6 dark:border-neutral-800">
        <h1 className="text-[17px] font-semibold tracking-[-0.015em] text-neutral-900 dark:text-neutral-100">
          Checkout Flow
        </h1>

        <div className="mt-2 flex h-8 items-center gap-2">
          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex items-center gap-1.5 text-[13px]">
              {CRUMBS.map((c, i) => {
                const last = i === CRUMBS.length - 1;
                return (
                  <li
                    key={c.label}
                    className="flex min-w-0 items-center gap-1.5"
                  >
                    {i > 0 && (
                      <ChevronRight
                        aria-hidden
                        className="h-3.5 w-3.5 shrink-0 text-neutral-300 dark:text-neutral-600"
                      />
                    )}
                    {c.icon && (
                      <Folder
                        aria-hidden
                        className="h-3.5 w-3.5 shrink-0 text-neutral-400"
                      />
                    )}
                    {last ? (
                      <span
                        aria-current="page"
                        className="truncate font-medium text-neutral-900 dark:text-neutral-100"
                      >
                        {c.label}
                      </span>
                    ) : (
                      <a
                        href="#"
                        className={cx(
                          "truncate rounded-[var(--rb-r-sm,6px)] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100",
                          transition,
                          focus,
                        )}
                      >
                        {c.label}
                      </a>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              aria-label="Search this project"
              className={cx(iconButton, transition, focus)}
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-pressed={starred}
              aria-label={starred ? "Remove from starred" : "Add to starred"}
              onClick={() => setStarred((s) => !s)}
              className={cx(
                iconButton,
                starred && "text-neutral-900 dark:text-neutral-100",
                transition,
                focus,
              )}
            >
              <motion.span
                key={String(starred)}
                initial={reduce ? false : { scale: 0.7 }}
                animate={{ scale: 1 }}
                transition={SPRING}
                className="inline-flex"
              >
                <Star
                  aria-hidden
                  className={cx("h-4 w-4", starred && "fill-current")}
                />
              </motion.span>
            </button>
            <button
              type="button"
              aria-label="More project actions"
              className={cx(iconButton, transition, focus)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-1 flex items-end justify-between gap-3">
          <div
            role="tablist"
            aria-label="Project sections"
            onKeyDown={onTabKeyDown}
            className="relative -mb-px flex min-w-0 items-center gap-1 overflow-x-auto"
          >
            {TABS.map((t) => {
              const isActive = t.id === active;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  data-tab={t.id}
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActive(t.id)}
                  className={cx(
                    "relative inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-t-[var(--rb-r-md,8px)] px-2 text-[13px] font-medium",
                    transition,
                    focus,
                    isActive
                      ? "text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100",
                  )}
                >
                  {t.label}
                  {t.count > 0 && (
                    <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[var(--rb-r-sm,6px)] bg-neutral-100 px-1 text-[11px] font-medium text-neutral-600 tabular-nums dark:bg-neutral-800 dark:text-neutral-300">
                      {t.count}
                    </span>
                  )}
                  {isActive && (
                    <motion.span
                      aria-hidden
                      layoutId={`${uid}-tab`}
                      transition={reduce ? { duration: 0 } : SPRING}
                      className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mb-1.5 flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              aria-label="Invite people to this project"
              className={cx(
                "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.96] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
                transition,
                focus,
              )}
            >
              <Plus className="h-4 w-4" />
            </button>
            <span
              aria-hidden
              className="hidden h-5 w-px bg-neutral-200 sm:block dark:bg-neutral-800"
            />
            <div className="hidden items-center sm:flex">
              <ul className="flex -space-x-2">
                {PEOPLE.map((p) => (
                  <li
                    key={p}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-600 ring-2 ring-white dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-950"
                  >
                    {p}
                  </li>
                ))}
              </ul>
              <span className="ml-2 text-[12px] text-neutral-500 tabular-nums">
                +9
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={
              reduce
                ? { opacity: 0, transition: { duration: 0.1 } }
                : { opacity: 0, y: -4, transition: { duration: 0.12 } }
            }
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {panels.map((p, i) => (
              <motion.section
                key={p.title}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.2,
                  ease: EASE_OUT,
                  delay: reduce ? 0 : i * 0.04,
                }}
                className="rounded-[var(--rb-r-xl,12px)] border border-dashed border-neutral-200 bg-neutral-50/60 p-3 dark:border-neutral-800 dark:bg-neutral-900/40"
              >
                <h2 className="text-[12px] font-medium text-neutral-500">
                  {p.title}
                </h2>
                <ul className="mt-2 space-y-1.5">
                  {p.rows.map((r) => (
                    <li
                      key={r}
                      className="rounded-[var(--rb-r-md,8px)] bg-white px-2.5 py-2 text-[13px] text-neutral-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-neutral-900 dark:text-neutral-300"
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              </motion.section>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
