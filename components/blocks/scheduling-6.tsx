"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const ROW = 56;
const START_HOUR = 8;
const END_HOUR = 18;
const MIN_DURATION = 0.5;
const SNAP = 0.25;
const HOURS = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => START_HOUR + i,
);

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LONG_WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const weekdayOf = (date: number) => (date - 1) % 7;
const mondayOf = (date: number) => date - weekdayOf(date);

const TODAY = 10;
const NOW = 10.35;

const DURATIONS = [
  { label: "30 min", value: 0.5 },
  { label: "45 min", value: 0.75 },
  { label: "1 hour", value: 1 },
  { label: "90 min", value: 1.5 },
  { label: "2 hours", value: 2 },
];

type CalendarEvent = {
  id: string;
  date: number;
  from: number;
  duration: number;
  title: string;
};

type Drag =
  | { mode: "move"; id: string; grab: number }
  | { mode: "resize"; id: string }
  | null;

const SEED: CalendarEvent[] = [
  { id: "e1", date: 8, from: 9, duration: 0.5, title: "Standup" },
  { id: "e2", date: 8, from: 11, duration: 1.5, title: "Roadmap shaping" },
  { id: "e3", date: 9, from: 10, duration: 1, title: "1:1 · Nadia" },
  { id: "e4", date: 9, from: 10.5, duration: 1, title: "Vendor call" },
  { id: "e5", date: 9, from: 14, duration: 2, title: "Design critique" },
  { id: "e6", date: 10, from: 9.5, duration: 1, title: "Mobile QA handoff" },
  { id: "e7", date: 10, from: 13, duration: 1, title: "All-hands" },
  { id: "e8", date: 11, from: 11, duration: 1, title: "Hiring panel" },
  { id: "e9", date: 11, from: 15, duration: 1, title: "Platform retro" },
  { id: "e10", date: 12, from: 9, duration: 3, title: "Focus block" },
  { id: "e11", date: 12, from: 14, duration: 1, title: "Customer demo" },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const snap = (value: number) => Math.round(value / SNAP) * SNAP;

function formatHour(value: number) {
  const hour = Math.floor(value);
  const minutes = Math.round((value - hour) * 60);
  const suffix = hour >= 12 ? "pm" : "am";
  const display = hour > 12 ? hour - 12 : hour;
  return `${display}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function formatDuration(value: number) {
  const minutes = Math.round(value * 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

function layoutDay(list: CalendarEvent[]) {
  const sorted = [...list].sort(
    (a, b) => a.from - b.from || b.duration - a.duration,
  );
  const placed: { event: CalendarEvent; lane: number; lanes: number }[] = [];

  let cluster: CalendarEvent[] = [];
  let clusterEnd = -Infinity;

  const flush = () => {
    if (!cluster.length) return;
    const ends: number[] = [];
    const assigned = cluster.map((event) => {
      let lane = ends.findIndex((end) => end <= event.from + 1e-6);
      if (lane === -1) {
        ends.push(event.from + event.duration);
        lane = ends.length - 1;
      } else {
        ends[lane] = event.from + event.duration;
      }
      return { event, lane };
    });
    assigned.forEach((item) =>
      placed.push({ ...item, lanes: Math.max(1, ends.length) }),
    );
    cluster = [];
    clusterEnd = -Infinity;
  };

  sorted.forEach((event) => {
    if (cluster.length && event.from >= clusterEnd - 1e-6) flush();
    cluster.push(event);
    clusterEnd = Math.max(clusterEnd, event.from + event.duration);
  });
  flush();

  return placed;
}

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

export default function Scheduling6() {
  const [view, setView] = useState<"Day" | "Week">("Week");
  const [weekStart, setWeekStart] = useState(mondayOf(TODAY));
  const [focusDate, setFocusDate] = useState(TODAY);
  const [events, setEvents] = useState<CalendarEvent[]>(SEED);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const drag = useRef<Drag>(null);
  const moved = useRef(false);
  const columnsRef = useRef<HTMLDivElement>(null);
  const grid = useScrollFade<HTMLDivElement>();

  const columns = useMemo(
    () =>
      view === "Week"
        ? Array.from({ length: 5 }, (_, i) => weekStart + i)
        : [focusDate],
    [view, weekStart, focusDate],
  );

  const selected = events.find((event) => event.id === selectedId) ?? null;

  const readPointer = (clientX: number, clientY: number) => {
    const el = columnsRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const index = clamp(
      Math.floor(((clientX - rect.left) / rect.width) * columns.length),
      0,
      columns.length - 1,
    );
    const time = START_HOUR + (clientY - rect.top) / ROW;
    return { date: columns[index], time };
  };

  const patch = (id: string, next: Partial<CalendarEvent>) =>
    setEvents((prev) =>
      prev.map((event) => (event.id === id ? { ...event, ...next } : event)),
    );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const point = readPointer(e.clientX, e.clientY);
    if (!point) return;

    const target = e.target as HTMLElement;
    const node = target.closest<HTMLElement>("[data-event-id]");
    const id = node?.dataset.eventId;

    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
    moved.current = false;
    setDragging(true);

    if (id) {
      const event = events.find((item) => item.id === id);
      if (!event) return;
      setSelectedId(id);
      drag.current = target.closest("[data-resize]")
        ? { mode: "resize", id }
        : { mode: "move", id, grab: point.time - event.from };
      return;
    }

    const from = clamp(snap(point.time), START_HOUR, END_HOUR - MIN_DURATION);
    const draft: CalendarEvent = {
      id: `draft-${Date.now()}`,
      date: point.date,
      from,
      duration: MIN_DURATION,
      title: "Untitled",
    };
    setEvents((prev) => [...prev, draft]);
    setSelectedId(draft.id);
    drag.current = { mode: "resize", id: draft.id };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const active = drag.current;
    if (!active) return;
    const point = readPointer(e.clientX, e.clientY);
    if (!point) return;

    moved.current = true;
    const event = events.find((item) => item.id === active.id);
    if (!event) return;

    if (active.mode === "move") {
      const from = clamp(
        snap(point.time - active.grab),
        START_HOUR,
        END_HOUR - event.duration,
      );
      if (from !== event.from || point.date !== event.date) {
        patch(active.id, { from, date: point.date });
      }
      return;
    }

    const duration = clamp(
      snap(point.time - event.from),
      MIN_DURATION,
      END_HOUR - event.from,
    );
    if (duration !== event.duration) patch(active.id, { duration });
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    drag.current = null;
    setDragging(false);
  };

  const nudge = (id: string, steps: number) => {
    const event = events.find((item) => item.id === id);
    if (!event) return;
    patch(id, {
      from: clamp(
        event.from + steps * SNAP,
        START_HOUR,
        END_HOUR - event.duration,
      ),
    });
  };

  const shift = (direction: number) => {
    setSelectedId(null);

    if (view === "Week") {
      const next = clamp(weekStart + direction * 7, 1, 22);
      setWeekStart(next);
      setFocusDate(next + 2);
      return;
    }

    const next = clamp(focusDate + direction, 1, 26);
    setFocusDate(next);
    setWeekStart(clamp(mondayOf(next), 1, 22));
  };

  const goToday = () => {
    setWeekStart(mondayOf(TODAY));
    setFocusDate(TODAY);
    setSelectedId(null);
  };

  const addEvent = () => {
    const date = columns.includes(focusDate) ? focusDate : columns[0];
    const id = `draft-${Date.now()}`;
    setEvents((prev) => [
      ...prev,
      { id, date, from: 9, duration: 1, title: "Untitled" },
    ]);
    setSelectedId(id);
  };

  const heading =
    view === "Week"
      ? `${weekStart} – ${weekStart + 4} June 2026`
      : `${LONG_WEEKDAYS[weekdayOf(focusDate)]}, ${focusDate} June 2026`;

  return (
    <div className="relative flex h-full min-h-[720px] w-full flex-col overflow-hidden bg-white dark:bg-neutral-950">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200 px-4 sm:px-5 dark:border-neutral-800">
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label={view === "Week" ? "Previous week" : "Previous day"}
            className={cx(
              "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
              transition,
              focus,
            )}
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label={view === "Week" ? "Next week" : "Next day"}
            className={cx(
              "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
              transition,
              focus,
            )}
          >
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={goToday}
          className={cx(
            "inline-flex h-8 shrink-0 cursor-pointer items-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 px-2.5 text-[13px] font-medium text-neutral-700 hover:bg-neutral-200 active:scale-[0.97] dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
            transition,
            focus,
          )}
        >
          Today
        </button>

        <h1 className="min-w-0 flex-1 truncate px-1 text-[13px] font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
          {heading}
        </h1>

        <div
          role="tablist"
          aria-label="Calendar view"
          className="hidden shrink-0 items-center gap-0.5 rounded-[var(--rb-r-lg,10px)] bg-neutral-100 p-1 sm:flex dark:bg-neutral-800"
        >
          {(["Day", "Week"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={option === view}
              onClick={() => {
                setView(option);
                setSelectedId(null);
              }}
              className={cx(
                "inline-flex h-7 cursor-pointer items-center rounded-[var(--rb-r-sm,6px)] px-2.5 text-[13px]",
                option === view
                  ? "bg-white font-medium text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-neutral-950 dark:text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100",
                transition,
                focus,
              )}
            >
              {option}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={addEvent}
          className={cx(
            "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] pl-2 pr-3 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
            transition,
            focus,
          )}
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          New
        </button>
      </header>

      <div className="flex shrink-0 border-b border-neutral-200 dark:border-neutral-800">
        <div className="w-14 shrink-0" />
        <div
          className="grid flex-1"
          style={{
            gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
          }}
        >
          {columns.map((date) => {
            const isToday = date === TODAY;

            return (
              <button
                key={date}
                type="button"
                onClick={() => {
                  setFocusDate(date);
                  setView("Day");
                  setSelectedId(null);
                }}
                className={cx(
                  "flex cursor-pointer items-center justify-center gap-1.5 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-900",
                  transition,
                  focus,
                )}
              >
                <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-400">
                  {WEEKDAYS[weekdayOf(date)]}
                </span>
                <span
                  className={cx(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[13px] tabular-nums",
                    isToday
                      ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                      : "text-neutral-900 dark:text-neutral-100",
                  )}
                >
                  {date}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={grid.ref}
          onScroll={grid.onScroll}
          className="h-full overflow-y-auto"
        >
          <div className="flex select-none py-4">
            <div className="w-14 shrink-0">
              {HOURS.map((hour) => (
                <div key={hour} style={{ height: ROW }} className="relative">
                  <span className="absolute -top-1.5 right-3 text-[11px] tabular-nums text-neutral-400">
                    {hour === 12
                      ? "12 pm"
                      : hour > 12
                        ? `${hour - 12} pm`
                        : `${hour} am`}
                  </span>
                </div>
              ))}
            </div>

            <div
              ref={columnsRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              style={{
                gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
                touchAction: "none",
              }}
              className={cx(
                "grid flex-1",
                dragging ? "cursor-grabbing" : "cursor-cell",
              )}
            >
              {columns.map((date) => (
                <div
                  key={date}
                  className="relative border-l border-neutral-200 dark:border-neutral-800"
                  style={{ height: (END_HOUR - START_HOUR) * ROW }}
                >
                  {HOURS.slice(1).map((hour) => (
                    <div
                      key={hour}
                      aria-hidden="true"
                      style={{ top: (hour - START_HOUR) * ROW }}
                      className="pointer-events-none absolute inset-x-0 h-px bg-neutral-200/70 dark:bg-neutral-800/70"
                    />
                  ))}

                  {date === TODAY && (
                    <div
                      aria-hidden="true"
                      style={{ top: (NOW - START_HOUR) * ROW }}
                      className="pointer-events-none absolute inset-x-0 z-10 flex -translate-y-1/2 items-center"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))]" />
                      <span className="h-px flex-1 bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))]" />
                    </div>
                  )}

                  {layoutDay(events.filter((event) => event.date === date)).map(
                    ({ event, lane, lanes }) => {
                      const isSelected = event.id === selectedId;
                      const height = event.duration * ROW - 3;

                      return (
                        <button
                          key={event.id}
                          type="button"
                          data-event-id={event.id}
                          aria-pressed={isSelected}
                          onClick={() => setSelectedId(event.id)}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                              e.preventDefault();
                              nudge(event.id, e.key === "ArrowUp" ? -1 : 1);
                            }
                          }}
                          style={{
                            top: (event.from - START_HOUR) * ROW,
                            height,
                            left: `calc(${(lane / lanes) * 100}% + 3px)`,
                            width: `calc(${100 / lanes}% - 6px)`,
                          }}
                          className={cx(
                            "group absolute overflow-hidden rounded-[var(--rb-r-md,8px)] border px-2 py-1 text-left",
                            dragging ? "cursor-grabbing" : "cursor-grab",
                            isSelected
                              ? "z-20 border-neutral-900 bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:border-white dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                              : "z-10 border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-700 dark:hover:bg-neutral-900",
                            transition,
                            focus,
                          )}
                        >
                          <span className="block truncate text-xs font-medium leading-4">
                            {event.title}
                          </span>
                          {height > 34 && (
                            <span
                              className={cx(
                                "block truncate text-[11px] leading-4 tabular-nums",
                                isSelected
                                  ? "text-white/70 dark:text-neutral-900/70"
                                  : "text-neutral-500",
                              )}
                            >
                              {formatHour(event.from)}
                            </span>
                          )}

                          <span
                            data-resize="true"
                            aria-hidden="true"
                            className="absolute inset-x-0 bottom-0 flex h-3 cursor-ns-resize items-end justify-center pb-0.5 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-aria-pressed:opacity-100"
                          >
                            <span
                              className={cx(
                                "h-0.5 w-6 rounded-full",
                                isSelected
                                  ? "bg-white/60 dark:bg-neutral-900/50"
                                  : "bg-neutral-300 dark:bg-neutral-600",
                              )}
                            />
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className={cx(
            "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950",
            grid.edges.start ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          aria-hidden="true"
          className={cx(
            "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950",
            grid.edges.end ? "opacity-100" : "opacity-0",
          )}
        />
      </div>

      {selected ? (
        <div className="flex h-[60px] shrink-0 items-center gap-2 border-t border-neutral-200 bg-neutral-50 px-4 sm:px-5 dark:border-neutral-800 dark:bg-neutral-900">
          <input
            value={selected.title}
            onChange={(e) => patch(selected.id, { title: e.target.value })}
            aria-label="Event title"
            className={cx(
              "h-9 min-w-0 flex-1 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100",
              transition,
              focus,
            )}
          />

          <select
            value={selected.duration}
            onChange={(e) =>
              patch(selected.id, {
                duration: clamp(
                  Number(e.target.value),
                  MIN_DURATION,
                  END_HOUR - selected.from,
                ),
              })
            }
            aria-label="Duration"
            className={cx(
              "hidden h-9 shrink-0 cursor-pointer rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-2.5 text-[13px] text-neutral-900 sm:block dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100",
              transition,
              focus,
            )}
          >
            {DURATIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <p className="hidden shrink-0 px-1 text-xs tabular-nums text-neutral-500 md:block">
            June {selected.date} · {formatHour(selected.from)} ·{" "}
            {formatDuration(selected.duration)}
          </p>

          <button
            type="button"
            onClick={() => {
              setEvents((prev) =>
                prev.filter((event) => event.id !== selected.id),
              );
              setSelectedId(null);
            }}
            aria-label="Delete event"
            className={cx(
              "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 active:scale-[0.97] dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900 dark:hover:text-neutral-100",
              transition,
              focus,
            )}
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setSelectedId(null)}
            aria-label="Close editor"
            className={cx(
              "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
              transition,
              focus,
            )}
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex h-[60px] shrink-0 items-center border-t border-neutral-200 bg-neutral-50 px-4 sm:px-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="truncate text-xs text-neutral-500">
            Drag on the grid to block out time. Drag an event to move it, or its
            bottom edge to resize.
          </p>
        </div>
      )}
    </div>
  );
}
