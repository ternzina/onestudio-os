"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, Link2, Paperclip, X } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const fieldLabel =
  "text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-400";

const inputClass =
  "h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 placeholder:text-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100";

const TIMES = ["08:30", "09:00", "09:30", "10:00", "10:30", "11:00"];

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

export default function Scheduling3() {
  const [attendees, setAttendees] = useState(["Marta Rey", "Idris Kane"]);
  const body = useScrollFade<HTMLDivElement>();

  return (
    <div className="relative flex h-full min-h-[720px] w-full flex-col justify-center overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <section className="mx-auto my-auto flex max-h-full w-full max-w-[560px] flex-col rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
        <header className="shrink-0 px-3 py-2.5">
          <h2 className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
            New schedule
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            Everyone invited gets a hold on their calendar right away.
          </p>
        </header>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-950">
          <div
            ref={body.ref}
            onScroll={body.onScroll}
            className="h-full space-y-4 overflow-y-auto p-4"
          >
            <div>
              <label htmlFor="sched-name" className={fieldLabel}>
                Name
              </label>
              <input
                id="sched-name"
                type="text"
                placeholder="Weekly platform sync"
                className={cx(inputClass, "mt-1.5", transition, focus)}
              />
            </div>

            <div>
              <p className={fieldLabel}>Attendees</p>
              <div
                className={cx(
                  "mt-1.5 flex min-h-9 flex-wrap items-center gap-1.5 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white p-1.5 dark:border-neutral-800 dark:bg-neutral-950",
                  transition,
                )}
              >
                {attendees.map((person) => (
                  <span
                    key={person}
                    className="inline-flex h-6 items-center gap-1.5 rounded-[var(--rb-r-sm,6px)] bg-neutral-100 pl-1 pr-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-medium text-neutral-600 dark:bg-neutral-950 dark:text-neutral-300"
                    >
                      {person
                        .split(" ")
                        .map((w) => w[0])
                        .join("")}
                    </span>
                    {person}
                    <button
                      type="button"
                      onClick={() =>
                        setAttendees((prev) => prev.filter((p) => p !== person))
                      }
                      aria-label={`Remove ${person}`}
                      className={cx(
                        "inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-[var(--rb-r-xs,4px)] text-neutral-400 hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-700 dark:hover:text-neutral-100",
                        transition,
                        focus,
                      )}
                    >
                      <X aria-hidden="true" className="h-3 w-3" />
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  aria-label="Add attendee"
                  placeholder="Add someone"
                  className="h-6 min-w-24 flex-1 bg-transparent px-1 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus-visible:outline-none dark:text-neutral-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="sched-date" className={fieldLabel}>
                Date
              </label>
              <div className="relative mt-1.5">
                <input
                  id="sched-date"
                  type="text"
                  defaultValue="10 June 2026"
                  className={cx(inputClass, "pr-9", transition, focus)}
                />
                <CalendarDays
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "sched-from", label: "Starts", value: "09:00" },
                { id: "sched-to", label: "Ends", value: "10:00" },
              ].map((field) => (
                <div key={field.id}>
                  <label htmlFor={field.id} className={fieldLabel}>
                    {field.label}
                  </label>
                  <div className="relative mt-1.5">
                    <select
                      id={field.id}
                      defaultValue={field.value}
                      className={cx(
                        "h-9 w-full cursor-pointer appearance-none rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pl-3 pr-8 text-[13px] tabular-nums text-neutral-900 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900",
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
                      className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-neutral-50 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="min-w-0">
                <p className="truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                  Attachments
                </p>
                <p className="mt-0.5 truncate text-xs text-neutral-500">
                  Agenda or brief, up to three files
                </p>
              </div>
              <button
                type="button"
                className={cx(
                  "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-2.5 text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 active:scale-[0.97] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900",
                  transition,
                  focus,
                )}
              >
                <Paperclip aria-hidden="true" className="h-3.5 w-3.5" />
                Attach
              </button>
            </div>

            <div>
              <label htmlFor="sched-link" className={fieldLabel}>
                Meeting link
              </label>
              <div className="relative mt-1.5">
                <input
                  id="sched-link"
                  type="text"
                  placeholder="Paste a room link"
                  className={cx(inputClass, "pr-9", transition, focus)}
                />
                <Link2
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="sched-notes" className={fieldLabel}>
                Notes
              </label>
              <textarea
                id="sched-notes"
                rows={3}
                placeholder="What should people read before joining?"
                className={cx(
                  "mt-1.5 w-full resize-none rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 py-2 text-[13px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100",
                  transition,
                  focus,
                )}
              />
            </div>
          </div>

          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950",
              body.edges.start ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950",
              body.edges.end ? "opacity-100" : "opacity-0",
            )}
          />
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 px-3 py-2.5">
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
            Create schedule
          </button>
        </footer>
      </section>
    </div>
  );
}
