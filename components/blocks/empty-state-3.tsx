"use client";

import { ArrowRight, Check } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const frame =
  "rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-950";
const panel =
  "rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-900";

const TODAY = [
  { label: "Resolved", value: "14" },
  { label: "Assigned on", value: "6" },
  { label: "Median first reply", value: "9m" },
];

const NEXT = [
  {
    title: "3 tickets waiting on the customer",
    body: "Nothing to do until they reply. We will nudge each one after 48 hours.",
  },
  {
    title: "2 drafts you never sent",
    body: "Both are from yesterday afternoon and are still editable.",
  },
  {
    title: "Team queue has 5 unassigned",
    body: "Outside your view, but you have permission to pick them up.",
  },
];

export default function EmptyState3() {
  return (
    <div className="flex h-full min-h-[560px] w-full flex-col justify-center overflow-y-auto bg-white p-4 sm:p-6 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[560px]">
        <div className="text-center">
          <span
            aria-hidden
            className="mx-auto flex h-11 w-11 items-center justify-center rounded-[var(--rb-r-2xl,14px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
          >
            <Check className="h-5 w-5 text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]" />
          </span>
          <h2 className="mt-4 text-[19px] font-medium tracking-[-0.01em] text-neutral-900 sm:text-xl dark:text-neutral-100">
            Inbox zero, and it is only 3pm
          </h2>
          <p className="mx-auto mt-1.5 max-w-[400px] text-[13px] leading-relaxed text-neutral-500">
            Nothing is assigned to you and nothing is overdue. New tickets will
            appear here the moment they are routed.
          </p>
        </div>

        <div className={cx(frame, "mt-5 grid grid-cols-3 gap-1")}>
          {TODAY.map((s) => (
            <div key={s.label} className={cx(panel, "px-3 py-3 text-center")}>
              <p className="text-lg font-medium tracking-[-0.02em] text-neutral-900 tabular-nums dark:text-neutral-100">
                {s.value}
              </p>
              <p className="mt-0.5 text-[12px] text-neutral-500">{s.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-5 px-1 text-[12px] tracking-[0.06em] text-neutral-400 uppercase">
          If you want something to do
        </p>

        <div className={cx(frame, "mt-2 space-y-1")}>
          {NEXT.map((n) => (
            <button
              key={n.title}
              type="button"
              className={cx(
                panel,
                "group flex w-full cursor-pointer items-center gap-3 p-3 text-left hover:border-neutral-300 hover:bg-neutral-50 dark:hover:border-neutral-700 dark:hover:bg-neutral-800",
                transition,
                focus,
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                  {n.title}
                </span>
                <span className="mt-0.5 block text-[12px] leading-relaxed text-neutral-500">
                  {n.body}
                </span>
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-neutral-300 transition-colors duration-150 ease-out group-hover:text-neutral-900 dark:text-neutral-600 dark:group-hover:text-neutral-100"
                aria-hidden
              />
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-[12px] text-neutral-500">
          Last refreshed a moment ago · updates arrive automatically
        </p>
      </div>
    </div>
  );
}
