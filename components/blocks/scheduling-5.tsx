"use client";

import { useState } from "react";
import { ChevronDown, Copy, Plus, X } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const TIMES = [
  "07:00",
  "08:00",
  "09:00",
  "12:00",
  "13:00",
  "14:00",
  "17:00",
  "18:00",
];

type Interval = { id: string; from: string; to: string };

const INITIAL: { day: string; on: boolean; intervals: Interval[] }[] = [
  {
    day: "Monday",
    on: true,
    intervals: [{ id: "mon-1", from: "09:00", to: "17:00" }],
  },
  {
    day: "Tuesday",
    on: true,
    intervals: [
      { id: "tue-1", from: "09:00", to: "12:00" },
      { id: "tue-2", from: "13:00", to: "18:00" },
    ],
  },
  {
    day: "Wednesday",
    on: true,
    intervals: [{ id: "wed-1", from: "09:00", to: "17:00" }],
  },
  {
    day: "Thursday",
    on: true,
    intervals: [{ id: "thu-1", from: "08:00", to: "14:00" }],
  },
  {
    day: "Friday",
    on: true,
    intervals: [{ id: "fri-1", from: "09:00", to: "13:00" }],
  },
  { day: "Saturday", on: false, intervals: [] },
  { day: "Sunday", on: false, intervals: [] },
];

export default function Scheduling5() {
  const [days, setDays] = useState(INITIAL);

  const toggleDay = (day: string) =>
    setDays((prev) =>
      prev.map((d) =>
        d.day === day
          ? {
              ...d,
              on: !d.on,
              intervals: d.on
                ? []
                : [{ id: `${day}-new`, from: "09:00", to: "17:00" }],
            }
          : d,
      ),
    );

  const addInterval = (day: string) =>
    setDays((prev) =>
      prev.map((d) =>
        d.day === day
          ? {
              ...d,
              intervals: [
                ...d.intervals,
                {
                  id: `${day}-${d.intervals.length + 1}-${Date.now()}`,
                  from: "13:00",
                  to: "17:00",
                },
              ],
            }
          : d,
      ),
    );

  const removeInterval = (day: string, id: string) =>
    setDays((prev) =>
      prev.map((d) =>
        d.day === day
          ? { ...d, intervals: d.intervals.filter((i) => i.id !== id) }
          : d,
      ),
    );

  const activeDays = days.filter((d) => d.on).length;

  return (
    <div className="relative h-full min-h-[640px] w-full overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <section className="mx-auto w-full max-w-3xl overflow-hidden rounded-[var(--rb-r-2xl,14px)] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <div className="min-w-0">
            <h2 className="text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
              Weekly availability
            </h2>
            <p className="mt-1 text-[13px] text-neutral-500 dark:text-neutral-400">
              Bookable hours on {activeDays} days. Holidays are excluded
              automatically.
            </p>
          </div>

          <div className="relative shrink-0">
            <select
              aria-label="Timezone"
              defaultValue="Europe/Lisbon"
              className={cx(
                "h-8 cursor-pointer appearance-none rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pl-2.5 pr-7 text-[13px] text-neutral-900 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900",
                transition,
                focus,
              )}
            >
              <option>Europe/Lisbon</option>
              <option>Europe/Berlin</option>
              <option>America/New_York</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
            />
          </div>
        </header>

        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {days.map((entry) => (
            <div
              key={entry.day}
              className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-start"
            >
              <div className="flex w-full shrink-0 items-center gap-3 sm:w-44">
                <button
                  type="button"
                  role="switch"
                  aria-checked={entry.on}
                  aria-label={`${entry.day} availability`}
                  onClick={() => toggleDay(entry.day)}
                  className={cx(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-out",
                    entry.on
                      ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
                      : "bg-neutral-200 dark:bg-neutral-700",
                    focus,
                  )}
                >
                  <span
                    className={cx(
                      "pointer-events-none inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:bg-neutral-900",
                      entry.on ? "translate-x-[18px]" : "translate-x-0.5",
                    )}
                  />
                </button>

                <span
                  className={cx(
                    "truncate text-[13px] font-medium",
                    entry.on
                      ? "text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-400",
                  )}
                >
                  {entry.day}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                {entry.on ? (
                  <div className="space-y-2">
                    {entry.intervals.map((interval) => (
                      <div
                        key={interval.id}
                        className="flex items-center gap-2"
                      >
                        {[interval.from, interval.to].map((value, i) => (
                          <div
                            key={i}
                            className="relative min-w-0 flex-1 sm:max-w-28"
                          >
                            <select
                              aria-label={i === 0 ? "From" : "To"}
                              defaultValue={value}
                              className={cx(
                                "h-8 w-full cursor-pointer appearance-none rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pl-2.5 pr-7 text-[13px] tabular-nums text-neutral-900 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900",
                                transition,
                                focus,
                              )}
                            >
                              {TIMES.map((t) => (
                                <option key={t}>{t}</option>
                              ))}
                            </select>
                            <ChevronDown
                              aria-hidden="true"
                              className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
                            />
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => removeInterval(entry.day, interval.id)}
                          aria-label={`Remove interval from ${entry.day}`}
                          disabled={entry.intervals.length === 1}
                          className={cx(
                            "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                            transition,
                            focus,
                          )}
                        >
                          <X aria-hidden="true" className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="flex h-8 items-center text-[13px] text-neutral-400">
                    Not bookable
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => addInterval(entry.day)}
                  disabled={!entry.on}
                  aria-label={`Add interval to ${entry.day}`}
                  className={cx(
                    "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                    transition,
                    focus,
                  )}
                >
                  <Plus aria-hidden="true" className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  disabled={!entry.on}
                  aria-label={`Copy ${entry.day} to other days`}
                  className={cx(
                    "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                    transition,
                    focus,
                  )}
                >
                  <Copy aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-50 px-5 py-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="truncate text-xs text-neutral-500">
            Changes apply to new bookings only.
          </p>

          <button
            type="button"
            className={cx(
              "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-4 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
              transition,
              focus,
            )}
          >
            Save hours
          </button>
        </footer>
      </section>
    </div>
  );
}
