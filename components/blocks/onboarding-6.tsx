"use client";

import { ArrowRight, Check } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const SUMMARY = [
  { label: "Workspace", value: "Northwind" },
  { label: "Members invited", value: "4" },
  { label: "Starter template", value: "Sprint board" },
  { label: "Plan", value: "Team trial, 14 days" },
];

export default function Onboarding6() {
  return (
    <div className="relative flex h-full min-h-[560px] w-full flex-col justify-center overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <div className="mx-auto my-auto w-full max-w-[420px] text-center">
        <span
          aria-hidden="true"
          className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
        >
          <Check className="h-5 w-5" strokeWidth={2.5} />
        </span>

        <h2 className="mt-4 text-xl font-medium tracking-[-0.015em] text-neutral-900 dark:text-neutral-100">
          Your workspace is ready
        </h2>
        <p className="mx-auto mt-1.5 max-w-[340px] text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
          We've set everything up from your answers. All of it is editable from
          workspace settings.
        </p>

        <dl className="mt-6 flex flex-col gap-1 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 text-left dark:border-neutral-800 dark:bg-neutral-900">
          {SUMMARY.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white px-4 py-2.5 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <dt className="truncate text-[13px] text-neutral-500">
                {item.label}
              </dt>
              <dd className="truncate text-[13px] font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            className={cx(
              "inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-lg,10px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-4 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.99] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
              transition,
              focus,
            )}
          >
            Open workspace
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={cx(
              "inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white px-4 text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 active:scale-[0.97] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900",
              transition,
              focus,
            )}
          >
            Take the two-minute tour
          </button>
        </div>

        <p className="mt-4 text-xs text-neutral-500">
          A copy of your setup summary is in your inbox.
        </p>
      </div>
    </div>
  );
}
