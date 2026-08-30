"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock, Globe, Video } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const panel =
  "rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-950";

const caption =
  "text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-400";

const WEEK = [
  { id: "mon", label: "Mon", date: 8, free: 6 },
  { id: "tue", label: "Tue", date: 9, free: 2 },
  { id: "wed", label: "Wed", date: 10, free: 9 },
  { id: "thu", label: "Thu", date: 11, free: 0 },
  { id: "fri", label: "Fri", date: 12, free: 4 },
  { id: "sat", label: "Sat", date: 13, free: 0 },
  { id: "mon2", label: "Mon", date: 15, free: 7 },
  { id: "tue2", label: "Tue", date: 16, free: 5 },
];

const SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
];

const DETAILS = [
  { icon: Clock, label: "30 minutes" },
  { icon: Video, label: "Video call, link on confirm" },
  { icon: Globe, label: "Europe/Lisbon · WEST" },
];

function useHorizontalFade<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setEdges({
      start: scrollLeft > 1,
      end: Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1,
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

export default function Scheduling7() {
  const [day, setDay] = useState("wed");
  const [slot, setSlot] = useState("10:00");
  const strip = useHorizontalFade<HTMLDivElement>();

  const selectedDay = WEEK.find((d) => d.id === day) ?? WEEK[0];

  return (
    <div className="relative h-full min-h-[640px] w-full overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <section className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-1 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 lg:grid-cols-[260px_1fr] dark:border-neutral-800 dark:bg-neutral-900">
        <div className={cx(panel, "flex flex-col p-4")}>
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200/70 bg-neutral-50 text-[13px] font-medium text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
          >
            JV
          </span>

          <p className="mt-3 text-xs text-neutral-500">Jonas Vieira</p>
          <h2 className="mt-0.5 text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
            Intro call
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
            A short call to work out whether we are a fit. Bring anything you
            already have.
          </p>

          <dl className="mt-4 space-y-2.5">
            {DETAILS.map((detail) => {
              const Icon = detail.icon;

              return (
                <div key={detail.label} className="flex items-start gap-2">
                  <dt className="shrink-0 pt-px">
                    <Icon
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-neutral-400"
                    />
                    <span className="sr-only">Detail</span>
                  </dt>
                  <dd className="min-w-0 text-[13px] text-neutral-600 dark:text-neutral-400">
                    {detail.label}
                  </dd>
                </div>
              );
            })}
          </dl>

          <p className="mt-auto pt-4 text-xs leading-relaxed text-neutral-500">
            Rescheduling stays open until an hour before the call.
          </p>
        </div>

        <div className={cx(panel, "flex min-h-0 min-w-0 flex-col p-4")}>
          <div className="flex items-center justify-between gap-3">
            <h3 className={caption}>Pick a day</h3>
            <p className="text-xs text-neutral-500">June 2026</p>
          </div>

          <div className="relative mt-2.5">
            <div
              ref={strip.ref}
              onScroll={strip.onScroll}
              role="radiogroup"
              aria-label="Available days"
              className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {WEEK.map((entry) => {
                const selected = entry.id === day;
                const full = entry.free === 0;

                return (
                  <button
                    key={entry.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={full}
                    onClick={() => setDay(entry.id)}
                    className={cx(
                      "flex w-[72px] shrink-0 cursor-pointer flex-col items-center gap-0.5 rounded-[var(--rb-r-lg,10px)] border px-2 py-2.5 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40",
                      selected
                        ? "border-neutral-900 bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:border-white dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                        : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900",
                      transition,
                      focus,
                    )}
                  >
                    <span
                      className={cx(
                        "text-[11px] font-medium uppercase tracking-[0.06em]",
                        selected
                          ? "text-white/70 dark:text-neutral-900/70"
                          : "text-neutral-400",
                      )}
                    >
                      {entry.label}
                    </span>
                    <span className="text-[15px] font-medium tabular-nums">
                      {entry.date}
                    </span>
                    <span
                      className={cx(
                        "text-[11px] tabular-nums",
                        selected
                          ? "text-white/70 dark:text-neutral-900/70"
                          : "text-neutral-500",
                      )}
                    >
                      {full ? "Full" : `${entry.free} free`}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              aria-hidden="true"
              className={cx(
                "pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950",
                strip.edges.start ? "opacity-100" : "opacity-0",
              )}
            />
            <div
              aria-hidden="true"
              className={cx(
                "pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950",
                strip.edges.end ? "opacity-100" : "opacity-0",
              )}
            />
          </div>

          <h3 className={cx(caption, "mt-5")}>
            Times on June {selectedDay.date}
          </h3>

          <div
            role="radiogroup"
            aria-label="Available times"
            className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3"
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
                    "inline-flex h-9 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] border text-[13px] tabular-nums active:scale-[0.97]",
                    selected
                      ? "border-neutral-300 bg-neutral-100 font-medium text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
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

          <div className="mt-5 flex items-center justify-between gap-3 rounded-[var(--rb-r-lg,10px)] bg-neutral-50 px-3 py-2.5 dark:bg-neutral-900">
            <p className="min-w-0 truncate text-[13px] text-neutral-600 dark:text-neutral-400">
              June {selectedDay.date} at{" "}
              <span className="font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                {slot}
              </span>
            </p>

            <button
              type="button"
              className={cx(
                "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-4 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
                transition,
                focus,
              )}
            >
              Confirm
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
