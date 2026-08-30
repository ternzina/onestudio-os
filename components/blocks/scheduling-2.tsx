"use client";

import { useState } from "react";
import { ChevronDown, Info, MoreHorizontal } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const fieldLabel =
  "text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-400";

const DURATIONS = [
  "15 min",
  "30 min",
  "45 min",
  "1 hour",
  "90 min",
  "2 hours",
  "3 hours",
  "Half day",
  "Full day",
  "Custom",
];

const START_TIMES = ["08:30", "09:00", "09:30", "10:00", "10:30"];
const END_TIMES = ["09:30", "10:00", "10:30", "11:00", "11:30"];

export default function Scheduling2() {
  const [duration, setDuration] = useState("1 hour");

  return (
    <div className="relative flex h-full min-h-[480px] w-full flex-col justify-center overflow-y-auto bg-white p-8 sm:p-10 dark:bg-neutral-950">
      <section className="mx-auto my-auto w-full max-w-[520px] rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
        <header className="flex items-center gap-3 px-3 py-2.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200/70 bg-white text-[13px] font-medium text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
          >
            AN
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
              Anna Neary
            </p>
            <p className="truncate text-xs text-neutral-500">
              Head of Operations
            </p>
          </div>

          <button
            type="button"
            aria-label="More options"
            className={cx(
              "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-900 active:scale-[0.97] dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
              transition,
              focus,
            )}
          >
            <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
          </button>
        </header>

        <div className="rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="sched-start" className={fieldLabel}>
                Start
              </label>
              <div className="relative mt-1.5">
                <select
                  id="sched-start"
                  defaultValue="09:00"
                  className={cx(
                    "h-9 w-full cursor-pointer appearance-none rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pl-3 pr-8 text-[13px] tabular-nums text-neutral-900 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900",
                    transition,
                    focus,
                  )}
                >
                  {START_TIMES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="sched-end" className={fieldLabel}>
                End
              </label>
              <div className="relative mt-1.5">
                <select
                  id="sched-end"
                  defaultValue="10:00"
                  className={cx(
                    "h-9 w-full cursor-pointer appearance-none rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pl-3 pr-8 text-[13px] tabular-nums text-neutral-900 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900",
                    transition,
                    focus,
                  )}
                >
                  {END_TIMES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                />
              </div>
            </div>
          </div>

          <p className={cx(fieldLabel, "mt-4 block")}>Duration</p>
          <div
            role="radiogroup"
            aria-label="Duration"
            className="mt-1.5 flex flex-wrap gap-1.5"
          >
            {DURATIONS.map((option) => {
              const selected = option === duration;

              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setDuration(option)}
                  className={cx(
                    "inline-flex h-8 cursor-pointer items-center rounded-[var(--rb-r-md,8px)] border px-3 text-[13px] tabular-nums active:scale-[0.97]",
                    selected
                      ? "border-neutral-300 bg-neutral-100 font-medium text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                      : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900",
                    transition,
                    focus,
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 px-3 py-2.5">
          <p className="flex min-w-0 items-center gap-1.5 text-xs text-neutral-500">
            <Info aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              Blocks{" "}
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {duration}
              </span>{" "}
              on the shared calendar
            </span>
          </p>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className={cx(
                "inline-flex h-8 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 active:scale-[0.97] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900",
                transition,
                focus,
              )}
            >
              Cancel
            </button>

            <button
              type="button"
              className={cx(
                "inline-flex h-8 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
                transition,
                focus,
              )}
            >
              Apply
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
