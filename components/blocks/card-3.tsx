"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const frame =
  "flex flex-col gap-1 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900";

const panel =
  "rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-950";

const STEPS = [
  {
    id: "connect",
    index: "0.1",
    title: "Connect a source",
    blurb: "Point the workspace at the repository or warehouse you work in.",
  },
  {
    id: "invite",
    index: "0.2",
    title: "Invite your team",
    blurb: "Anyone with an invitation can open the workspace immediately.",
  },
  {
    id: "rules",
    index: "0.3",
    title: "Set review rules",
    blurb: "Decide what needs approval before it reaches production.",
  },
  {
    id: "ship",
    index: "0.4",
    title: "Ship the first change",
    blurb: "Run it end to end so you can see the whole trail in one place.",
  },
];

export default function Card3() {
  const [done, setDone] = useState<Set<string>>(() => new Set(["connect"]));

  const toggle = (id: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="flex h-full min-h-[480px] w-full flex-col overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <div className="flex h-9 shrink-0 items-center gap-3">
        <p className="min-w-0 flex-1 truncate text-[13px] text-neutral-600 tabular-nums dark:text-neutral-400">
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {done.size} of {STEPS.length}
          </span>{" "}
          steps complete
        </p>
        <button
          type="button"
          disabled={done.size === 0}
          onClick={() => setDone(new Set())}
          className={cx(
            "inline-flex h-9 shrink-0 cursor-pointer items-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 px-3 text-[13px] font-medium text-neutral-700 hover:bg-neutral-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
            transition,
            focus,
          )}
        >
          Reset
        </button>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => {
          const isDone = done.has(step.id);

          return (
            <li key={step.id} className={cx(frame, "min-h-[280px]")}>
              <div className={cx(panel, "flex flex-1 flex-col p-4")}>
                <p className="text-[13px] tabular-nums text-neutral-400 dark:text-neutral-600">
                  {step.index}
                </p>
                <p className="mt-auto pt-8 text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                  {step.title}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {step.blurb}
                </p>
              </div>

              <button
                type="button"
                aria-pressed={isDone}
                onClick={() => toggle(step.id)}
                className={cx(
                  "inline-flex h-10 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-lg,10px)] px-3 text-[13px] font-medium active:scale-[0.99]",
                  isDone
                    ? "border border-neutral-200/70 bg-white text-neutral-900 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
                    : "bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
                  transition,
                  focus,
                )}
              >
                {isDone && (
                  <Check
                    aria-hidden="true"
                    className="h-4 w-4"
                    strokeWidth={2.5}
                  />
                )}
                {isDone ? "Completed" : "Mark complete"}
                <span className="sr-only">: {step.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
