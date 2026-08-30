"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  CalendarPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleSlash,
  Globe,
  Sunrise,
  Timer,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const panel =
  "rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-950";

const PRESETS = [
  { id: "today", icon: Sunrise, label: "Today", hint: "Tuesday" },
  { id: "tomorrow", icon: Timer, label: "Tomorrow", hint: "Wednesday" },
  {
    id: "week",
    icon: CalendarDays,
    label: "Later this week",
    hint: "Thursday",
  },
  { id: "next", icon: CalendarPlus, label: "Next week", hint: "Mon, Jul 6" },
  { id: "none", icon: CircleSlash, label: "No date", hint: "Clear deadline" },
];

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
const SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

function useScrollFade<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setEdges({
      start: scrollTop > 1,
      end: Math.ceil(scrollTop + clientHeight) < scrollHeight - 1,
    });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    const view = el?.ownerDocument.defaultView;
    if (!el || !view?.ResizeObserver) return;
    const observer = new view.ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update]);

  return { ref, edges, onScroll: update };
}

export default function Scheduling4() {
  const [preset, setPreset] = useState("today");
  const [day, setDay] = useState(30);
  const [slot, setSlot] = useState("10:00");
  const slots = useScrollFade<HTMLDivElement>();

  return (
    <div className="relative flex h-full min-h-[640px] w-full flex-col justify-center overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <section className="mx-auto my-auto flex w-full max-w-[600px] flex-col gap-1 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
        <header className="flex items-center gap-2 px-3 py-2.5">
          <Globe aria-hidden="true" className="h-3.5 w-3.5 text-neutral-400" />
          <p className="min-w-0 truncate text-xs text-neutral-500">
            Times shown in{" "}
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              Europe/Bucharest
            </span>
          </p>
        </header>

        <div className={cx(panel, "p-1")}>
          {PRESETS.map((item) => {
            const Icon = item.icon;
            const active = item.id === preset;

            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setPreset(item.id)}
                className={cx(
                  "flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-[var(--rb-r-sm,6px)] px-2.5 text-left",
                  active
                    ? "bg-neutral-100 dark:bg-neutral-800"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-900",
                  transition,
                  focus,
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cx(
                    "h-4 w-4 shrink-0",
                    active
                      ? "text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-400",
                  )}
                />
                <span
                  className={cx(
                    "min-w-0 flex-1 truncate text-[13px]",
                    active
                      ? "font-medium text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-900 dark:text-neutral-100",
                  )}
                >
                  {item.label}
                </span>
                <span className="shrink-0 text-xs text-neutral-500">
                  {item.hint}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-1 sm:grid-cols-[1fr_150px]">
          <div className={cx(panel, "p-3")}>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous month"
                className={cx(
                  "inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-sm,6px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                  transition,
                  focus,
                )}
              >
                <ChevronLeft aria-hidden="true" className="h-4 w-4" />
              </button>

              <div className="relative min-w-0 flex-1">
                <select
                  aria-label="Month"
                  defaultValue="June 2026"
                  className={cx(
                    "h-7 w-full cursor-pointer appearance-none rounded-[var(--rb-r-sm,6px)] bg-transparent pl-2 pr-6 text-[13px] font-medium text-neutral-900 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800",
                    transition,
                    focus,
                  )}
                >
                  <option>May 2026</option>
                  <option>June 2026</option>
                  <option>July 2026</option>
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
                />
              </div>

              <button
                type="button"
                aria-label="Next month"
                className={cx(
                  "inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-sm,6px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                  transition,
                  focus,
                )}
              >
                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((label, i) => (
                <div
                  key={`${label}-${i}`}
                  className="pb-1 text-center text-[11px] font-medium text-neutral-400"
                >
                  {label}
                </div>
              ))}

              <div
                aria-hidden="true"
                className="flex h-8 items-center justify-center rounded-[var(--rb-r-sm,6px)] text-[13px] tabular-nums text-neutral-300 dark:text-neutral-700"
              >
                31
              </div>

              {DAYS.map((d) => {
                const selected = d === day;

                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setDay(d)}
                    className={cx(
                      "flex h-8 cursor-pointer items-center justify-center rounded-[var(--rb-r-sm,6px)] text-[13px] tabular-nums active:scale-[0.95]",
                      selected
                        ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                        : "text-neutral-900 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800",
                      transition,
                      focus,
                    )}
                  >
                    {d}
                  </button>
                );
              })}

              {[1, 2, 3, 4].map((d) => (
                <div
                  key={`t-${d}`}
                  aria-hidden="true"
                  className="flex h-8 items-center justify-center rounded-[var(--rb-r-sm,6px)] text-[13px] tabular-nums text-neutral-300 dark:text-neutral-700"
                >
                  {d}
                </div>
              ))}
            </div>
          </div>

          <div
            className={cx(
              panel,
              "relative min-h-[280px] overflow-hidden sm:min-h-0",
            )}
          >
            <div className="absolute inset-0 flex flex-col">
              <p className="shrink-0 px-3 pb-2 pt-3 text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                Tuesday, {day}
              </p>

              <div className="relative min-h-0 flex-1">
                <div
                  ref={slots.ref}
                  onScroll={slots.onScroll}
                  role="radiogroup"
                  aria-label="Available times"
                  className="h-full space-y-1 overflow-y-auto px-2 pb-2"
                >
                  {SLOTS.map((time) => {
                    const selected = time === slot;

                    return (
                      <button
                        key={time}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setSlot(time)}
                        className={cx(
                          "flex h-8 w-full cursor-pointer items-center justify-center rounded-[var(--rb-r-sm,6px)] border text-[13px] tabular-nums active:scale-[0.97]",
                          selected
                            ? "border-neutral-900 bg-[var(--rb-accent,oklch(20.5%_0_0))] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:border-white dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                            : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900",
                          transition,
                          focus,
                        )}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>

                <div
                  aria-hidden="true"
                  className={cx(
                    "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950",
                    slots.edges.start ? "opacity-100" : "opacity-0",
                  )}
                />
                <div
                  aria-hidden="true"
                  className={cx(
                    "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950",
                    slots.edges.end ? "opacity-100" : "opacity-0",
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 px-3 py-2.5">
          <p className="min-w-0 truncate text-xs tabular-nums text-neutral-500">
            Due{" "}
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              June {day}, {slot}
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
