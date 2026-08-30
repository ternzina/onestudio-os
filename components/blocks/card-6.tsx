"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Users,
  Wallet,
  Repeat,
  type LucideIcon,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const frame =
  "rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900";

const panel =
  "rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950";

const RANGES = ["7d", "30d", "90d"] as const;
type Range = (typeof RANGES)[number];

type Metric = {
  id: string;
  label: string;
  icon: LucideIcon;
  values: Record<Range, { value: string; delta: number; series: number[] }>;
};

const METRICS: Metric[] = [
  {
    id: "balance",
    label: "Available balance",
    icon: Wallet,
    values: {
      "7d": {
        value: "18,420",
        delta: 3.2,
        series: [42, 55, 48, 61, 58, 72, 80],
      },
      "30d": {
        value: "74,910",
        delta: 8.6,
        series: [30, 44, 39, 52, 66, 61, 78],
      },
      "90d": {
        value: "213,540",
        delta: 12.4,
        series: [22, 31, 45, 40, 58, 70, 88],
      },
    },
  },
  {
    id: "spend",
    label: "Card spend",
    icon: CreditCard,
    values: {
      "7d": {
        value: "4,180",
        delta: -1.8,
        series: [70, 62, 66, 51, 55, 44, 40],
      },
      "30d": {
        value: "16,240",
        delta: -5.4,
        series: [82, 74, 68, 60, 57, 49, 41],
      },
      "90d": {
        value: "51,880",
        delta: 2.1,
        series: [48, 52, 46, 58, 55, 63, 67],
      },
    },
  },
  {
    id: "recurring",
    label: "Recurring revenue",
    icon: Repeat,
    values: {
      "7d": {
        value: "9,760",
        delta: 1.1,
        series: [58, 60, 59, 63, 65, 64, 68],
      },
      "30d": {
        value: "38,900",
        delta: 4.7,
        series: [40, 46, 51, 55, 60, 66, 72],
      },
      "90d": {
        value: "112,300",
        delta: 9.9,
        series: [28, 36, 44, 49, 61, 68, 84],
      },
    },
  },
  {
    id: "payers",
    label: "Active payers",
    icon: Users,
    values: {
      "7d": {
        value: "1,284",
        delta: 0.6,
        series: [61, 59, 63, 62, 66, 65, 69],
      },
      "30d": {
        value: "1,342",
        delta: -2.3,
        series: [76, 71, 69, 64, 61, 58, 54],
      },
      "90d": {
        value: "1,410",
        delta: 6.8,
        series: [34, 41, 48, 52, 59, 67, 74],
      },
    },
  },
];

export default function Card6() {
  const [range, setRange] = useState<Range>("30d");

  const total = useMemo(
    () =>
      METRICS.reduce(
        (sum, metric) => sum + metric.values[range].delta,
        0,
      ).toFixed(1),
    [range],
  );

  return (
    <div className="flex h-full min-h-[480px] w-full flex-col overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <div className="flex h-9 shrink-0 items-center gap-3">
        <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
          Accounts overview
        </p>
        <div
          role="radiogroup"
          aria-label="Date range"
          className="inline-flex h-9 shrink-0 items-center gap-1 rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900"
        >
          {RANGES.map((option) => {
            const selected = option === range;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setRange(option)}
                className={cx(
                  "inline-flex h-7 cursor-pointer items-center rounded-[var(--rb-r-sm,6px)] px-2.5 text-[13px] font-medium tabular-nums",
                  selected
                    ? "border border-neutral-200/70 bg-white text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100",
                  transition,
                  focus,
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={cx(
          frame,
          "mt-4 grid grid-cols-1 gap-1 sm:grid-cols-2 xl:grid-cols-4",
        )}
      >
        {METRICS.map((metric) => {
          const Icon = metric.icon;
          const data = metric.values[range];
          const up = data.delta >= 0;
          const DeltaIcon = up ? ArrowUpRight : ArrowDownRight;
          const peak = Math.max(...data.series);

          return (
            <div key={metric.id} className={panel}>
              <p className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-500">
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span className="min-w-0 truncate">{metric.label}</span>
              </p>

              <p className="mt-2 text-xl tabular-nums tracking-[-0.015em] text-neutral-900 dark:text-neutral-100">
                {data.value}
              </p>

              <p
                className={cx(
                  "mt-1 flex items-center gap-1 text-xs tabular-nums",
                  up
                    ? "text-emerald-600 dark:text-emerald-500"
                    : "text-neutral-500 dark:text-neutral-400",
                )}
              >
                <DeltaIcon
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0"
                />
                {up ? "+" : ""}
                {data.delta}%
                <span className="text-neutral-500 dark:text-neutral-500">
                  vs previous {range}
                </span>
              </p>

              <div
                aria-hidden="true"
                className="mt-3 flex h-10 items-end gap-1"
              >
                {data.series.map((point, i) => (
                  <span
                    key={i}
                    style={{ height: `${Math.round((point / peak) * 100)}%` }}
                    className={cx(
                      "min-h-[2px] flex-1 rounded-[var(--rb-r-xs,4px)] transition-[height] duration-300 ease-out motion-reduce:transition-none",
                      i === data.series.length - 1
                        ? "bg-neutral-900 dark:bg-neutral-100"
                        : "bg-neutral-200 dark:bg-neutral-700",
                    )}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 shrink-0 text-xs tabular-nums text-neutral-500 dark:text-neutral-500">
        Net movement across all four accounts over the last {range}: {total}%.
      </p>
    </div>
  );
}
