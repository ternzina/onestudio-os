"use client";

import { Download } from "lucide-react";

export type Card11LineItem = { id: string; label: string; detail: string; amount: string };
export type Card11TotalItem = { id: string; label: string; value: string };

export const card11ContentDefaults = {
  invoiceLabel: "Invoice",
  invoiceId: "INV-2024-0318",
  statusLabel: "Paid",
  metadata: "Meridian Fund · Issued 18 March · Due 1 April",
  totalLabel: "Total due",
  totalValue: "$838.86",
  downloadLabel: "Download PDF",
};

export type AdaptedCard11Props = { [K in keyof typeof card11ContentDefaults]: string } & {
  lines: Card11LineItem[];
  totals: Card11TotalItem[];
};

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const panel =
  "rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-950";

export const card11LineDefaultItems: Card11LineItem[] = [
  {
    id: "seats",
    label: "Team seats",
    detail: "24 × $18.00",
    amount: "$432.00",
  },
  {
    id: "storage",
    label: "Additional storage",
    detail: "250 GB × $0.40",
    amount: "$100.00",
  },
  {
    id: "support",
    label: "Priority support",
    detail: "1 month",
    amount: "$150.00",
  },
];

export const card11TotalDefaultItems: Card11TotalItem[] = [
  { id: "subtotal", label: "Subtotal", value: "$682.00" },
  { id: "tax", label: "VAT (23%)", value: "$156.86" },
];

export default function AdaptedCard11({ invoiceLabel, invoiceId, statusLabel, metadata, totalLabel, totalValue, downloadLabel, lines, totals }: AdaptedCard11Props) {
  return (
    <div className="relative flex h-full min-h-[640px] w-full items-center justify-center overflow-hidden bg-white p-8 sm:p-10 dark:bg-neutral-950">
      <article className="flex w-full max-w-[400px] flex-col gap-1 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
        <div className={cx(panel, "p-4")}>
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            {invoiceLabel}
          </p>

          <div className="mt-1 flex items-baseline justify-between gap-3">
            <h2 className="min-w-0 truncate text-base font-medium tracking-[-0.01em] tabular-nums text-neutral-900 dark:text-neutral-100">
              {invoiceId}
            </h2>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600"
              />
              {statusLabel}
            </span>
          </div>

          <p className="mt-1 truncate text-xs text-neutral-500">
            {metadata}
          </p>
        </div>

        <div className={cx(panel, "px-2 py-1")}>
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800/70">
            {lines.map((line) => (
              <li
                key={line.id}
                className="flex items-center justify-between gap-3 px-2 py-2.5"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                    {line.label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs tabular-nums text-neutral-500">
                    {line.detail}
                  </span>
                </span>
                <span className="shrink-0 text-[13px] tabular-nums text-neutral-600 dark:text-neutral-400">
                  {line.amount}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <dl className={cx(panel, "space-y-1.5 px-4 py-3")}>
          {totals.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between gap-3"
            >
              <dt className="text-[13px] text-neutral-600 dark:text-neutral-400">
                {row.label}
              </dt>
              <dd className="text-[13px] tabular-nums text-neutral-600 dark:text-neutral-400">
                {row.value}
              </dd>
            </div>
          ))}

          <div className="flex items-baseline justify-between gap-3 pt-1.5">
            <dt className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
              {totalLabel}
            </dt>
            <dd className="text-base font-medium tabular-nums tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
              {totalValue}
            </dd>
          </div>
        </dl>

        <div className="rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
          <button
            type="button"
            className={cx(
              "inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-4 text-[13px] font-medium text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.99] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-900",
              transition,
              focus,
            )}
          >
            <Download aria-hidden="true" className="h-3.5 w-3.5" />
            {downloadLabel}
          </button>
        </div>
      </article>
    </div>
  );
}
