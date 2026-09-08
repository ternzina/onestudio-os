"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Plus, Search } from "lucide-react";

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

type Status = "Open" | "Waiting on you" | "Resolved";

const STATUS_STYLE: Record<Status, string> = {
  Open: "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100",
  "Waiting on you":
    "border-neutral-900 bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:border-white dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]",
  Resolved:
    "border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400",
};

const TICKETS = [
  {
    id: "4192",
    subject: "Scheduled export is empty",
    area: "Reports and exports",
    status: "Waiting on you" as Status,
    agent: "Sofia Alvarez",
    updated: "22m ago",
    replies: 4,
  },
  {
    id: "4188",
    subject: "SAML metadata upload fails validation",
    area: "Accounts and access",
    status: "Open" as Status,
    agent: "Marcus Bell",
    updated: "3h ago",
    replies: 7,
  },
  {
    id: "4171",
    subject: "Two invoices issued for March",
    area: "Billing and plans",
    status: "Open" as Status,
    agent: "Wei Chen",
    updated: "Yesterday",
    replies: 2,
  },
  {
    id: "4150",
    subject: "Webhook retries stop after one failure",
    area: "Integrations",
    status: "Resolved" as Status,
    agent: "Sofia Alvarez",
    updated: "4 Aug",
    replies: 11,
  },
  {
    id: "4133",
    subject: "Seat count did not drop after removing a user",
    area: "Billing and plans",
    status: "Resolved" as Status,
    agent: "Amelia Whitfield",
    updated: "1 Aug",
    replies: 3,
  },
  {
    id: "4110",
    subject: "Dashboard filter resets between tabs",
    area: "Dashboards",
    status: "Resolved" as Status,
    agent: "Marcus Bell",
    updated: "28 Jul",
    replies: 5,
  },
];

const TABS = ["All", "Open", "Resolved"] as const;

export default function Support5() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");

  const rows = useMemo(() => {
    if (tab === "Open") return TICKETS.filter((t) => t.status !== "Resolved");
    if (tab === "Resolved")
      return TICKETS.filter((t) => t.status === "Resolved");
    return TICKETS;
  }, [tab]);

  const counts = {
    open: TICKETS.filter((t) => t.status !== "Resolved").length,
    waiting: TICKETS.filter((t) => t.status === "Waiting on you").length,
  };

  return (
    <div className="flex h-full min-h-[640px] w-full flex-col overflow-hidden bg-white p-4 sm:p-6 dark:bg-neutral-950">
      <div className="mx-auto flex w-full max-w-[860px] min-h-0 flex-1 flex-col">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-[17px] font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
              Your requests
            </h2>
            <p className="mt-0.5 text-[13px] text-neutral-500">
              {counts.open} open · {counts.waiting} waiting on your reply
            </p>
          </div>
          <button
            type="button"
            className={cx(
              "inline-flex h-9 w-fit shrink-0 cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
              transition,
              focus,
            )}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            New request
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-fit items-center gap-0.5 rounded-[var(--rb-r-lg,10px)] bg-neutral-100 p-1 dark:bg-neutral-800">
            {TABS.map((t) => {
              const active = tab === t;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTab(t)}
                  className={cx(
                    "inline-flex h-7 cursor-pointer items-center rounded-[var(--rb-r-sm,6px)] px-2.5 text-[13px] font-medium",
                    active
                      ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-neutral-950 dark:text-neutral-100"
                      : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
                    transition,
                    focus,
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <div className="relative sm:w-[240px]">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
              aria-hidden
            />
            <label htmlFor="support-5-search" className="sr-only">
              Search your requests
            </label>
            <input
              id="support-5-search"
              type="search"
              placeholder="Search by subject or number"
              className="h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pr-3 pl-8 text-[13px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-700 dark:focus:border-white"
            />
          </div>
        </div>

        <div className={cx(frame, "mt-3 flex min-h-0 flex-1 flex-col")}>
          <div
            className={cx(
              panel,
              "flex min-h-0 flex-1 flex-col overflow-hidden",
            )}
          >
            <div className="hidden items-center gap-3 px-4 py-2.5 text-[11px] tracking-[0.06em] text-neutral-400 uppercase sm:flex">
              <span className="w-14 shrink-0">Ticket</span>
              <span className="min-w-0 flex-1">Subject</span>
              <span className="w-32 shrink-0">Status</span>
              <span className="w-24 shrink-0 text-right">Updated</span>
              <span className="w-4 shrink-0" aria-hidden />
            </div>

            <ul className="min-h-0 flex-1 overflow-y-auto p-1 sm:pt-0">
              {rows.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className={cx(
                      "flex w-full cursor-pointer flex-col gap-1.5 rounded-[var(--rb-r-sm,6px)] px-3 py-2.5 text-left hover:bg-neutral-50 sm:flex-row sm:items-center sm:gap-3 dark:hover:bg-neutral-800",
                      transition,
                      focus,
                    )}
                  >
                    <span className="w-14 shrink-0 font-mono text-[12px] text-neutral-400">
                      #{t.id}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                        {t.subject}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-neutral-500">
                        {t.area} · {t.agent} · {t.replies} replies
                      </span>
                    </span>
                    <span className="w-32 shrink-0">
                      <span
                        className={cx(
                          "inline-flex h-5 items-center rounded-[var(--rb-r-xs,4px)] border px-1.5 text-[11px] font-medium",
                          STATUS_STYLE[t.status],
                        )}
                      >
                        {t.status}
                      </span>
                    </span>
                    <span className="w-24 shrink-0 text-[12px] text-neutral-500 sm:text-right">
                      {t.updated}
                    </span>
                    <ChevronRight
                      className="hidden h-4 w-4 shrink-0 text-neutral-300 sm:block dark:text-neutral-600"
                      aria-hidden
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-3 px-1 text-[12px] text-neutral-500">
          Resolved requests stay readable for 12 months. Replying to one reopens
          it.
        </p>
      </div>
    </div>
  );
}
