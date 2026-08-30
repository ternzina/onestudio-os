"use client";

import { ArrowDownLeft, ArrowUpRight, Plus, Send } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const panel =
  "rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-950";

const outlineButton =
  "inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-4 text-[13px] font-medium text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-900";

const SPLIT = [
  { label: "Pending", value: "$1,204.00" },
  { label: "Reserved", value: "$380.00" },
];

const ACTIVITY = [
  {
    id: "stripe",
    name: "Stripe payout",
    when: "Today, 09:14",
    amount: "+$4,820.00",
    incoming: true,
  },
  {
    id: "aws",
    name: "Amazon Web Services",
    when: "Yesterday",
    amount: "−$612.40",
    incoming: false,
  },
  {
    id: "payroll",
    name: "March payroll",
    when: "28 February",
    amount: "−$18,900.00",
    incoming: false,
  },
];

export default function Card10() {
  return (
    <div className="relative flex h-full min-h-[560px] w-full items-center justify-center overflow-hidden bg-white p-8 sm:p-10 dark:bg-neutral-950">
      <section
        aria-labelledby="balance-heading"
        className="flex w-full max-w-[400px] flex-col gap-1 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className={cx(panel, "px-5 py-4")}>
          <h2
            id="balance-heading"
            className="text-[11px] font-medium uppercase tracking-wider text-neutral-500"
          >
            Available balance
          </h2>
          <p className="mt-1.5 text-xl font-medium tabular-nums tracking-[-0.015em] text-neutral-900 dark:text-neutral-100">
            $46,318.52
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
              +3.1%
            </span>{" "}
            against last month · Operating · USD
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-1">
          {SPLIT.map((item) => (
            <div key={item.label} className={cx(panel, "px-4 py-3")}>
              <dt className="truncate text-[11px] text-neutral-500">
                {item.label}
              </dt>
              <dd className="mt-0.5 truncate text-[13px] font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className={cx(panel, "px-4 py-1")}>
          <ul className="divide-y divide-neutral-200/70 dark:divide-neutral-800">
            {ACTIVITY.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                >
                  {item.incoming ? (
                    <ArrowDownLeft className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                    {item.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    {item.when}
                  </p>
                </div>
                <p className="shrink-0 text-[13px] tabular-nums text-neutral-900 dark:text-neutral-100">
                  {item.amount}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className={cx(panel, "p-3")}>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={cx(outlineButton, transition, focus)}
            >
              <Plus aria-hidden="true" className="h-3.5 w-3.5" />
              Add money
            </button>

            <button
              type="button"
              className={cx(outlineButton, transition, focus)}
            >
              <Send aria-hidden="true" className="h-3.5 w-3.5" />
              Transfer
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
