"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Bell,
  Bookmark,
  ChevronRight,
  House,
  Search,
  SlidersHorizontal,
  User,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const SPRING = { type: "spring" as const, bounce: 0, duration: 0.35 };
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const TABS = [
  { id: "home", label: "Home", icon: House, badge: 0 },
  { id: "search", label: "Search", icon: Search, badge: 0 },
  { id: "activity", label: "Activity", icon: Bell, badge: 3 },
  { id: "saved", label: "Saved", icon: Bookmark, badge: 0 },
  { id: "profile", label: "You", icon: User, badge: 0 },
];

const PANELS: Record<
  string,
  { title: string; caption: string; rows: { title: string; meta: string }[] }
> = {
  home: {
    title: "Today",
    caption: "4 updates since you last looked",
    rows: [
      { title: "Northwind renewed for 12 months", meta: "Deals · 8m ago" },
      { title: "Weekly summary is ready", meta: "Reports · 40m ago" },
      { title: "Cedar Labs opened a ticket", meta: "Support · 1h ago" },
      { title: "Payout of $4,120 settled", meta: "Billing · 3h ago" },
      { title: "Harbor Coffee added two seats", meta: "Accounts · 5h ago" },
      { title: "Two invoices moved to overdue", meta: "Billing · 6h ago" },
      { title: "Meridian pilot enters week three", meta: "Deals · 9h ago" },
    ],
  },
  search: {
    title: "Recent searches",
    caption: "Tap a term to run it again",
    rows: [
      { title: "invoices status:overdue", meta: "Saved filter" },
      { title: "Meridian", meta: "Account" },
      { title: "renewal Q3", meta: "12 results" },
      { title: "owner:me updated:7d", meta: "Saved filter" },
      { title: "Cedar Labs", meta: "Account" },
      { title: "seats > 20", meta: "31 results" },
      { title: "payout july", meta: "6 results" },
    ],
  },
  activity: {
    title: "Activity",
    caption: "3 items need a reply",
    rows: [
      { title: "Priya mentioned you on Deal 4192", meta: "Needs reply · 12m" },
      { title: "Approval requested: refund $240", meta: "Needs reply · 55m" },
      { title: "Ana assigned you a ticket", meta: "Needs reply · 2h" },
      { title: "Import finished with 2 warnings", meta: "System · 4h" },
      { title: "Deal 4188 moved to Contract sent", meta: "System · 5h" },
      { title: "Marco left a note on Alder Group", meta: "System · 7h" },
      { title: "Weekly export delivered", meta: "System · 9h" },
    ],
  },
  saved: {
    title: "Saved",
    caption: "Pinned records and views",
    rows: [
      { title: "Enterprise pipeline", meta: "View · 34 records" },
      { title: "Alder Group", meta: "Account" },
      { title: "Churn risk this month", meta: "View · 9 records" },
      { title: "Northwind Supply", meta: "Account" },
      { title: "Invoices awaiting approval", meta: "View · 6 records" },
      { title: "Q3 renewal calls", meta: "View · 18 records" },
      { title: "Harbor Coffee", meta: "Account" },
    ],
  },
  profile: {
    title: "Ana Reyes",
    caption: "Operations · Meridian workspace",
    rows: [
      { title: "Notifications", meta: "Push, email" },
      { title: "Appearance", meta: "Match system" },
      { title: "Connected accounts", meta: "2 linked" },
      { title: "Language and region", meta: "English · UTC+1" },
      { title: "Offline data", meta: "Sync on Wi-Fi" },
      { title: "Privacy", meta: "Reviewed in June" },
      { title: "Sign out", meta: "" },
    ],
  },
};

export default function Mobile1() {
  const reduce = useReducedMotion();
  const uid = useId();
  const [tab, setTab] = useState("home");

  const panel = PANELS[tab];

  const onKeyDown = (event: React.KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === tab);
    let next = i;
    if (event.key === "ArrowRight") next = (i + 1) % TABS.length;
    else if (event.key === "ArrowLeft")
      next = (i - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    else return;
    event.preventDefault();
    setTab(TABS[next].id);
  };

  return (
    <div className="relative flex h-full min-h-[680px] w-full justify-center overflow-hidden bg-white p-5 dark:bg-neutral-950">
      <div className="relative flex h-full w-full max-w-[390px] flex-col overflow-hidden rounded-[28px] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-4">
          <p className="min-w-0 truncate text-[15px] font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
            Meridian
          </p>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="Filters"
              className={cx(
                "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)] text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100",
                transition,
                focus,
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <span
              aria-hidden
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            >
              AR
            </span>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                transition: { duration: 0.12, ease: EASE_OUT },
              }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
            >
              <h2 className="text-[24px] leading-tight font-semibold tracking-[-0.02em] text-neutral-900 dark:text-neutral-100">
                {panel.title}
              </h2>
              <p className="mt-1 text-[13px] text-neutral-500">
                {panel.caption}
              </p>

              <ul className="mt-4 space-y-1">
                {panel.rows.map((r, i) => (
                  <motion.li
                    key={r.title}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
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
                        "flex min-h-[56px] w-full cursor-pointer items-center gap-3 rounded-[var(--rb-r-xl,12px)] px-3 py-2.5 text-left hover:bg-neutral-50 active:bg-neutral-100 dark:hover:bg-neutral-900 dark:active:bg-neutral-800",
                        transition,
                        focus,
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] text-neutral-900 dark:text-neutral-100">
                          {r.title}
                        </span>
                        {r.meta ? (
                          <span className="mt-0.5 block truncate text-[12px] text-neutral-500">
                            {r.meta}
                          </span>
                        ) : null}
                      </span>
                      <ChevronRight
                        aria-hidden
                        className="h-4 w-4 shrink-0 text-neutral-300 dark:text-neutral-600"
                      />
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>

        <nav
          aria-label="Primary"
          role="tablist"
          onKeyDown={onKeyDown}
          className="relative z-20 flex shrink-0 items-stretch gap-0.5 border-t border-neutral-200 p-3 dark:border-neutral-800"
        >
          {TABS.map((t) => {
            const isActive = t.id === tab;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setTab(t.id)}
                className={cx(
                  "relative flex min-h-[48px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-[var(--rb-r-3xl,16px)] px-1",
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
                    layoutId={`${uid}-tab`}
                    transition={reduce ? { duration: 0 } : SPRING}
                    className="absolute inset-0 rounded-[var(--rb-r-3xl,16px)] bg-neutral-100 dark:bg-neutral-900"
                  />
                )}
                <span className="relative">
                  <Icon
                    aria-hidden
                    className={cx(
                      "h-[18px] w-[18px] transition-transform duration-200 ease-out motion-reduce:transition-none",
                      isActive && "scale-[1.06]",
                    )}
                  />
                  {t.badge > 0 && (
                    <span className="absolute -top-1 -right-1.5 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[var(--rb-accent,oklch(20.5%_0_0))] px-1 text-[9px] leading-none font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] tabular-nums dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]">
                      {t.badge}
                    </span>
                  )}
                </span>
                <span className="relative text-[10px] leading-none font-medium">
                  {t.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
