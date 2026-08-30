"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const frame =
  "rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900";

const panel =
  "rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-950";

const badgeClass =
  "inline-flex h-5 shrink-0 items-center rounded-[var(--rb-r-sm,6px)] bg-neutral-100 px-1.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300";

const selectClass =
  "inline-flex h-8 cursor-pointer appearance-none items-center rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pl-2.5 pr-7 text-[13px] text-neutral-900 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const LEADING = [31];
const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
const TRAILING = [1, 2, 3, 4];
const MARKED = new Set([4, 8, 9, 10, 11, 13, 21, 24, 25, 28]);

const EVENTS = [
  {
    id: "handoff",
    title: "Mobile QA handoff",
    state: "Upcoming",
    time: "2:30 pm",
    place: "Remote",
    people: ["RS", "MK", "TA"],
  },
  {
    id: "allhands",
    title: "Quarterly all-hands",
    state: "Upcoming",
    time: "4:00 pm",
    place: "Main hall",
    people: ["DV"],
  },
  {
    id: "campaign",
    title: "Campaign review",
    state: "Upcoming",
    time: "10:30 am",
    place: "Video call",
    people: ["LM", "PN", "JR"],
  },
  {
    id: "panel",
    title: "Hiring panel · Design",
    state: "Confirmed",
    time: "11:00 am",
    place: "Room 4B",
    people: ["AO", "SE"],
  },
  {
    id: "retro",
    title: "Platform retro",
    state: "Confirmed",
    time: "5:15 pm",
    place: "Video call",
    people: ["KT", "BR"],
  },
  {
    id: "sync",
    title: "Support escalation sync",
    state: "Tentative",
    time: "6:00 pm",
    place: "Remote",
    people: ["WH"],
  },
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

export default function Scheduling1() {
  const [selected, setSelected] = useState(10);
  const agenda = useScrollFade<HTMLDivElement>();

  return (
    <div className="relative h-full min-h-[720px] w-full overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <section
        className={cx(
          frame,
          "mx-auto grid w-full max-w-5xl grid-cols-1 gap-1 lg:grid-cols-[320px_1fr]",
        )}
      >
        <div className={cx(panel, "p-4")}>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous month"
              className={cx(
                "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                transition,
                focus,
              )}
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>

            <div className="relative min-w-0 flex-1">
              <select
                aria-label="Month"
                defaultValue="June"
                className={cx(selectClass, "w-full", transition, focus)}
              >
                {["April", "May", "June", "July"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
              />
            </div>

            <div className="relative shrink-0">
              <select
                aria-label="Year"
                defaultValue="2026"
                className={cx(selectClass, transition, focus)}
              >
                {["2025", "2026", "2027"].map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
              />
            </div>

            <button
              type="button"
              aria-label="Next month"
              className={cx(
                "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                transition,
                focus,
              )}
            >
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="pb-1 text-center text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-400"
              >
                {day.slice(0, 3)}
              </div>
            ))}

            {LEADING.map((day) => (
              <div
                key={`lead-${day}`}
                aria-hidden="true"
                className="flex h-9 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-50 text-[13px] tabular-nums text-neutral-300 dark:bg-neutral-900 dark:text-neutral-700"
              >
                {day}
              </div>
            ))}

            {DAYS.map((day) => {
              const isSelected = day === selected;

              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelected(day)}
                  className={cx(
                    "relative flex h-9 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-[13px] tabular-nums active:scale-[0.95]",
                    isSelected
                      ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                      : "bg-neutral-50 text-neutral-900 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800",
                    transition,
                    focus,
                  )}
                >
                  {MARKED.has(day) && (
                    <span
                      aria-hidden="true"
                      className={cx(
                        "absolute top-1.5 h-1 w-1 rounded-full",
                        isSelected
                          ? "bg-white/70 dark:bg-neutral-900/60"
                          : "bg-neutral-400 dark:bg-neutral-500",
                      )}
                    />
                  )}
                  {day}
                </button>
              );
            })}

            {TRAILING.map((day) => (
              <div
                key={`trail-${day}`}
                aria-hidden="true"
                className="flex h-9 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-50 text-[13px] tabular-nums text-neutral-300 dark:bg-neutral-900 dark:text-neutral-700"
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        <div className={cx(panel, "flex min-h-0 flex-col")}>
          <div className="flex shrink-0 items-start justify-between gap-3 px-4 pb-3 pt-4">
            <div className="min-w-0">
              <h2 className="truncate text-[15px] font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
                Wednesday, June {selected}
              </h2>
              <p className="mt-0.5 truncate text-xs text-neutral-500">
                {EVENTS.length} events · 3 need a reply
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="relative hidden sm:block">
                <select
                  aria-label="Filter events"
                  className={cx(selectClass, transition, focus)}
                >
                  <option>All events</option>
                  <option>Only mine</option>
                  <option>Needs reply</option>
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
                />
              </div>

              <button
                type="button"
                className={cx(
                  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] pl-2 pr-3 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
                  transition,
                  focus,
                )}
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>

          <div className="relative min-h-0 flex-1">
            <div
              ref={agenda.ref}
              onScroll={agenda.onScroll}
              className="h-full space-y-2 overflow-y-auto px-4 pb-4"
            >
              {EVENTS.map((event) => (
                <article
                  key={event.id}
                  className={cx(
                    "cursor-pointer rounded-[var(--rb-r-lg,10px)] border border-neutral-200 p-3 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900",
                    transition,
                  )}
                >
                  <h3 className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                    {event.title}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className={badgeClass}>{event.state}</span>

                    <span className="flex items-center -space-x-1.5">
                      {event.people.map((person) => (
                        <span
                          key={person}
                          className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-neutral-100 text-[9px] font-medium text-neutral-600 dark:border-neutral-950 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          {person}
                        </span>
                      ))}
                    </span>

                    <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                      {event.time}
                    </span>

                    <span className="flex min-w-0 items-center gap-1.5 text-xs text-neutral-500">
                      <MapPin
                        aria-hidden="true"
                        className="h-3.5 w-3.5 shrink-0"
                      />
                      <span className="truncate">{event.place}</span>
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <div
              aria-hidden="true"
              className={cx(
                "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950",
                agenda.edges.start ? "opacity-100" : "opacity-0",
              )}
            />
            <div
              aria-hidden="true"
              className={cx(
                "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950",
                agenda.edges.end ? "opacity-100" : "opacity-0",
              )}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
