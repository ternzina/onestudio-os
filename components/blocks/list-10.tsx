"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ExternalLink, ShieldCheck } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

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

type Step = {
  title: string;
  owner: string;
  duration: string;
};

const STEPS: Step[] = [
  {
    title: "Acknowledge the page and declare an incident",
    owner: "On-call primary",
    duration: "2 min",
  },
  {
    title: "Open the incident channel and post the first summary",
    owner: "Incident commander",
    duration: "3 min",
  },
  {
    title: "Confirm blast radius from the error-rate dashboard",
    owner: "SRE",
    duration: "5 min",
  },
  {
    title: "Roll back the checkout service to the last good deploy",
    owner: "Release engineer",
    duration: "8 min",
  },
  {
    title: "Verify error rate and latency have recovered",
    owner: "SRE",
    duration: "5 min",
  },
  {
    title: "Post customer-facing update to the status page",
    owner: "Support lead",
    duration: "4 min",
  },
  {
    title: "Capture the timeline for the postmortem",
    owner: "Incident commander",
    duration: "6 min",
  },
  {
    title: "Stand down responders and close the incident",
    owner: "On-call primary",
    duration: "2 min",
  },
];

export default function List10() {
  const [completed, setCompleted] = useState<boolean[]>(() =>
    STEPS.map(() => false),
  );
  const [mounted, setMounted] = useState(false);

  const { ref: scrollRef, edges, onScroll } = useScrollFade<HTMLDivElement>();

  useEffect(() => setMounted(true), []);

  const done = completed.filter(Boolean).length;
  const allDone = done === STEPS.length;
  const pct = Math.round((done / STEPS.length) * 100);

  const enabled = (index: number) => index === 0 || completed[index - 1];

  const toggle = (index: number) => {
    if (!enabled(index)) return;
    setCompleted((prev) => {
      const next = [...prev];
      const value = !next[index];
      next[index] = value;
      if (!value) for (let j = index + 1; j < next.length; j++) next[j] = false;
      return next;
    });
  };

  const reset = () => setCompleted(STEPS.map(() => false));

  return (
    <div className="flex h-full min-h-[560px] w-full flex-col overflow-hidden bg-white p-8 sm:p-10 dark:bg-neutral-950">
      <div className="mx-auto flex h-full w-full max-w-[720px] flex-col">
        <div className="mb-4 shrink-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Incident runbook
          </p>
          <h2 className="mt-1 text-base tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
            Checkout latency spike: SEV2
          </h2>

          <div className="mt-3 flex min-h-[36px] items-center">
            {allDone ? (
              <div className="flex w-full items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                >
                  <ShieldCheck className="h-4 w-4" strokeWidth={2} />
                </span>
                <p
                  className="min-w-0 flex-1 truncate text-[13px] text-neutral-900 dark:text-neutral-100"
                  role="status"
                >
                  All steps complete: incident resolved.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className={cx(
                    "inline-flex h-8 shrink-0 items-center rounded-[var(--rb-r-md,8px)] border border-neutral-200/70 bg-white px-2.5 text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800",
                    transition,
                    focus,
                  )}
                >
                  Reset runbook
                </button>
              </div>
            ) : (
              <div className="w-full">
                <div className="flex items-center justify-between gap-3">
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-[var(--rb-r-xs,4px)] bg-neutral-200 dark:bg-neutral-800"
                    role="progressbar"
                    aria-valuenow={done}
                    aria-valuemin={0}
                    aria-valuemax={STEPS.length}
                    aria-label="Runbook progress"
                  >
                    <div
                      className="h-full rounded-[var(--rb-r-xs,4px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] transition-[width] duration-300 ease-out motion-reduce:transition-none dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-[12px] tabular-nums text-neutral-500">
                    {done} of {STEPS.length} steps complete
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
          <div
            ref={scrollRef}
            onScroll={onScroll}
            style={{ touchAction: "pan-y" }}
            className="min-h-0 flex-1 space-y-1 overflow-y-auto"
          >
            {STEPS.map((step, i) => {
              const isDone = completed[i];
              const isEnabled = enabled(i);
              const order = Math.min(i, 8);

              return (
                <div
                  key={step.title}
                  aria-disabled={!isEnabled}
                  className={cx(
                    "flex h-14 items-center gap-3 rounded-[var(--rb-r-lg,10px)] border px-3",
                    transition,
                    "motion-reduce:transition-none",
                    isDone
                      ? "border-neutral-200/60 bg-neutral-50 dark:border-neutral-800/70 dark:bg-neutral-900/50"
                      : "border-neutral-200/70 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800/50",
                    !isEnabled && "cursor-not-allowed opacity-50",
                  )}
                  style={{
                    opacity: mounted ? undefined : 0,
                    transform: mounted ? undefined : "translateY(4px)",
                    transition: mounted
                      ? undefined
                      : "opacity 300ms ease-out, transform 300ms ease-out",
                    transitionDelay: mounted ? undefined : `${order * 20}ms`,
                  }}
                >
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isDone}
                    aria-label={`Mark step ${i + 1} ${isDone ? "incomplete" : "complete"}: ${step.title}`}
                    disabled={!isEnabled}
                    onClick={() => toggle(i)}
                    className={cx(
                      "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[var(--rb-r-sm,6px)] border transition-colors duration-150",
                      focus,
                      "disabled:pointer-events-none",
                      isDone
                        ? "border-neutral-900 bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:border-white dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
                        : "border-neutral-300 bg-white hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-neutral-600",
                    )}
                  >
                    <Check
                      aria-hidden="true"
                      strokeWidth={3}
                      className={cx(
                        "h-3 w-3 text-[var(--rb-accent-fg,oklch(100%_0_0))] transition-transform duration-150 ease-out motion-reduce:transition-none dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]",
                        isDone ? "scale-100" : "scale-0",
                      )}
                    />
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cx(
                        "truncate text-[13px] transition-colors duration-150",
                        isDone
                          ? "text-neutral-500 line-through"
                          : "text-neutral-900 dark:text-neutral-100",
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="truncate text-[12px] tabular-nums text-neutral-500">
                      {step.owner} · {step.duration}
                    </p>
                  </div>

                  <a
                    href="#"
                    aria-label={`Open runbook for: ${step.title}`}
                    className={cx(
                      "inline-flex h-7 shrink-0 items-center gap-1 rounded-[var(--rb-r-md,8px)] border border-neutral-200/70 bg-white px-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-100",
                      transition,
                      focus,
                    )}
                  >
                    Runbook
                    <ExternalLink
                      className="h-3.5 w-3.5"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </a>
                </div>
              );
            })}
          </div>

          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-1 top-1 h-8 rounded-t-[var(--rb-r-lg,10px)] bg-gradient-to-b from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              edges.start ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-1 bottom-1 h-8 rounded-b-[var(--rb-r-lg,10px)] bg-gradient-to-t from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              edges.end ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
      </div>
    </div>
  );
}
