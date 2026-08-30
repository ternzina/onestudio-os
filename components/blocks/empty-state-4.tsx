"use client";

import { useState } from "react";
import { ExternalLink, RotateCw, TriangleAlert } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const frame =
  "rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-950";
const panel =
  "rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-900";

const DETAILS = [
  { label: "Request", value: "GET /v2/workspaces/orders" },
  { label: "Trace", value: "8f31c0a4e7b2" },
  { label: "Last success", value: "Today, 14:02" },
];

export default function EmptyState4() {
  const [retrying, setRetrying] = useState(false);

  return (
    <div className="flex h-full min-h-[480px] w-full flex-col justify-center overflow-y-auto bg-white p-4 sm:p-6 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[520px]">
        <div className={cx(frame)}>
          <div className={cx(panel, "p-5 sm:p-6")}>
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--rb-r-lg,10px)] border border-neutral-200 dark:border-neutral-800"
              >
                <TriangleAlert className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              </span>
              <div className="min-w-0">
                <h2 className="text-[15px] font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
                  We could not load your orders
                </h2>
                <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">
                  The request to the orders service timed out after 30 seconds.
                  Your data is safe and nothing was changed.
                </p>
              </div>
            </div>

            <dl className="mt-4 space-y-1">
              {DETAILS.map((d) => (
                <div
                  key={d.label}
                  className="flex items-center gap-3 rounded-[var(--rb-r-md,8px)] bg-neutral-50 px-3 py-2 dark:bg-neutral-950"
                >
                  <dt className="w-24 shrink-0 text-[12px] text-neutral-500">
                    {d.label}
                  </dt>
                  <dd className="min-w-0 flex-1 truncate font-mono text-[12px] text-neutral-900 dark:text-neutral-100">
                    {d.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setRetrying(true);
                  window.setTimeout(() => setRetrying(false), 1400);
                }}
                disabled={retrying}
                className={cx(
                  "inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-4 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
                  transition,
                  focus,
                )}
              >
                <RotateCw
                  className={cx("h-3.5 w-3.5", retrying && "animate-spin")}
                  aria-hidden
                />
                {retrying ? "Retrying" : "Try again"}
              </button>
              <button
                type="button"
                className={cx(
                  "inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--rb-r-md,8px)] border border-neutral-200 px-4 text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-800",
                  transition,
                  focus,
                )}
              >
                Check service status
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        <p className="mt-3 px-1 text-[12px] leading-relaxed text-neutral-500">
          Still failing after a couple of attempts? Send the trace ID to support
          and we will pick it up from there.
        </p>
      </div>
    </div>
  );
}
