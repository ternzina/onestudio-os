"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const labelClass =
  "block text-[13px] font-medium text-neutral-900 dark:text-neutral-100";

const fieldClass =
  "h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const STEPS = ["Account", "Workspace", "Team", "Finish"];

const REGIONS = [
  "United States (us-east)",
  "Europe (eu-central)",
  "Asia Pacific (ap-southeast)",
];

export default function Onboarding7() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("Northwind");
  const [slug, setSlug] = useState("northwind");
  const [region, setRegion] = useState(REGIONS[1]);
  const [isPrivate, setIsPrivate] = useState(true);

  const cleanSlug =
    slug.trim().toLowerCase().replace(/\s+/g, "-") || "workspace";

  return (
    <div className="relative flex h-full min-h-[640px] w-full flex-col overflow-y-auto bg-white dark:bg-neutral-950">
      <header className="shrink-0 border-b border-neutral-200 px-6 py-5 sm:px-8 dark:border-neutral-800">
        <ol className="mx-auto flex w-full max-w-[640px] items-center">
          {STEPS.map((label, i) => {
            const done = i < step;
            const active = i === step;

            return (
              <li
                key={label}
                className={cx(
                  "flex min-w-0 items-center gap-2",
                  i < STEPS.length - 1 && "flex-1",
                )}
              >
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  aria-current={active ? "step" : undefined}
                  className={cx(
                    "flex min-w-0 cursor-pointer items-center gap-2 rounded-[var(--rb-r-sm,6px)] px-1 py-0.5",
                    focus,
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium tabular-nums",
                      done || active
                        ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                        : "border border-neutral-200 text-neutral-400 dark:border-neutral-800 dark:text-neutral-600",
                      transition,
                    )}
                  >
                    {done ? (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span
                    className={cx(
                      "hidden truncate text-[13px] font-medium sm:block",
                      done || active
                        ? "text-neutral-900 dark:text-neutral-100"
                        : "text-neutral-500",
                    )}
                  >
                    {label}
                  </span>
                </button>

                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={cx(
                      "h-px min-w-4 flex-1",
                      done
                        ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
                        : "bg-neutral-200 dark:bg-neutral-800",
                      "transition-colors duration-200 ease-out",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </header>

      <div className="flex min-h-0 flex-1 items-center justify-center p-6 sm:p-8">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto w-full max-w-[440px]"
        >
          <h2 className="text-xl font-medium tracking-[-0.015em] text-neutral-900 dark:text-neutral-100">
            Create your workspace
          </h2>
          <p className="mt-1.5 text-[13px] text-neutral-600 dark:text-neutral-400">
            This is the container for your projects, documents and members.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="ob7-name" className={labelClass}>
                Workspace name
              </label>
              <input
                id="ob7-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme"
                className={cx(fieldClass, "mt-1.5")}
              />
            </div>

            <div>
              <label htmlFor="ob7-slug" className={labelClass}>
                Workspace URL
              </label>
              <div className="mt-1.5 flex items-stretch">
                <span className="inline-flex h-9 shrink-0 items-center rounded-l-[var(--rb-r-md,8px)] border border-r-0 border-neutral-200 bg-neutral-50 px-3 text-[13px] text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
                  northwind.app/
                </span>
                <input
                  id="ob7-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="workspace"
                  className={cx(fieldClass, "rounded-l-none")}
                />
              </div>
              <p className="mt-1.5 text-xs text-neutral-500">
                Members will reach it at northwind.app/{cleanSlug}
              </p>
            </div>

            <div>
              <label htmlFor="ob7-region" className={labelClass}>
                Data region
              </label>
              <div className="relative mt-1.5">
                <select
                  id="ob7-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className={cx(
                    fieldClass,
                    "cursor-pointer appearance-none pr-9",
                  )}
                >
                  {REGIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                />
              </div>
              <p className="mt-1.5 text-xs text-neutral-500">
                Region is permanent once the workspace is created.
              </p>
            </div>

            <div className="flex items-start justify-between gap-4 rounded-[var(--rb-r-lg,10px)] border border-neutral-200 p-4 dark:border-neutral-800">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                  Private workspace
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Only invited members can find or join it.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isPrivate}
                aria-label="Private workspace"
                onClick={() => setIsPrivate((v) => !v)}
                className={cx(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full",
                  isPrivate
                    ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
                    : "bg-neutral-200 dark:bg-neutral-700",
                  "transition-colors duration-200 ease-out",
                  focus,
                )}
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    "pointer-events-none inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:bg-neutral-900",
                    isPrivate ? "translate-x-[18px]" : "translate-x-0.5",
                  )}
                />
              </button>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className={cx(
                "inline-flex h-10 shrink-0 cursor-pointer items-center rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white px-4 text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 active:scale-[0.97] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900",
                transition,
                focus,
              )}
            >
              Back
            </button>
            <button
              type="submit"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className={cx(
                "inline-flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-4 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.99] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
                transition,
                focus,
              )}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
