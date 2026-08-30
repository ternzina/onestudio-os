"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const USE_CASES = [
  {
    id: "roadmap",
    title: "Plan a roadmap",
    blurb: "Quarterly themes, dated milestones and a view leadership can read.",
  },
  {
    id: "sprints",
    title: "Run sprints",
    blurb: "Cycles, capacity and a board that clears itself every two weeks.",
  },
  {
    id: "requests",
    title: "Triage requests",
    blurb: "One intake queue for bugs, questions and customer escalations.",
  },
  {
    id: "docs",
    title: "Write things down",
    blurb: "Specs and decision records that stay attached to the work.",
  },
  {
    id: "handoffs",
    title: "Automate handoffs",
    blurb: "Move work between teams without anyone chasing a status update.",
  },
  {
    id: "reporting",
    title: "Report on delivery",
    blurb: "Cycle time, throughput and where things actually get stuck.",
  },
];

const TEAM_SIZES = ["Just me", "2–10", "11–50", "50+"];

export default function Onboarding4() {
  const [useCase, setUseCase] = useState("sprints");
  const [size, setSize] = useState("2–10");

  return (
    <div className="relative flex h-full min-h-[640px] w-full flex-col justify-center overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <div className="mx-auto my-auto w-full max-w-[720px]">
        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          Step 2 of 4
        </p>
        <h2 className="mt-2 text-xl font-medium tracking-[-0.015em] text-neutral-900 dark:text-neutral-100">
          What will you use this for first?
        </h2>
        <p className="mt-1.5 text-[13px] text-neutral-600 dark:text-neutral-400">
          We'll open the matching workspace template. Everything else stays
          available.
        </p>

        <div
          role="radiogroup"
          aria-label="Primary use case"
          className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2"
        >
          {USE_CASES.map((option) => {
            const selected = option.id === useCase;

            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setUseCase(option.id)}
                className={cx(
                  "group relative flex cursor-pointer flex-col rounded-[var(--rb-r-lg,10px)] border p-4 text-left active:scale-[0.99]",
                  selected
                    ? "border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800"
                    : "border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900",
                  transition,
                  focus,
                )}
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    "absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full",
                    selected
                      ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                      : "text-transparent",
                    transition,
                  )}
                >
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>

                <span className="pr-6 text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                  {option.title}
                </span>
                <span className="mt-1 text-xs leading-relaxed text-neutral-500">
                  {option.blurb}
                </span>
              </button>
            );
          })}
        </div>

        <fieldset className="mt-6">
          <legend className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
            How many people will join you?
          </legend>
          <div className="mt-2 inline-flex rounded-[var(--rb-r-lg,10px)] bg-neutral-100 p-1 dark:bg-neutral-800">
            {TEAM_SIZES.map((option) => {
              const selected = option === size;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSize(option)}
                  className={cx(
                    "h-7 cursor-pointer rounded-[var(--rb-r-sm,6px)] px-3 text-xs font-medium tabular-nums",
                    selected
                      ? "bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100",
                    transition,
                    focus,
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-8 flex items-center gap-2">
          <button
            type="button"
            className={cx(
              "inline-flex h-10 shrink-0 cursor-pointer items-center rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white px-4 text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 active:scale-[0.97] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900",
              transition,
              focus,
            )}
          >
            Back
          </button>
          <button
            type="button"
            className={cx(
              "inline-flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-4 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.99] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
              transition,
              focus,
            )}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
