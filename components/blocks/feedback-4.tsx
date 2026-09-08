"use client";

import { useMemo, useState } from "react";
import { ChevronUp, MessageSquare, Plus, Search } from "lucide-react";

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

type Status = "Under review" | "Planned" | "In progress" | "Shipped";

const STATUS_STYLE: Record<Status, string> = {
  "Under review":
    "border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400",
  Planned:
    "border-neutral-300 text-neutral-700 dark:border-neutral-600 dark:text-neutral-300",
  "In progress":
    "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100",
  Shipped:
    "border-neutral-900 bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:border-white dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]",
};

const REQUESTS = [
  {
    id: "r1",
    title: "Schedule exports to a Google Sheet",
    body: "We rebuild the same sheet every Monday. A native destination would remove the last manual step in our reporting.",
    status: "In progress" as Status,
    votes: 214,
    comments: 18,
    voted: true,
    board: "Exports",
  },
  {
    id: "r2",
    title: "Row-level permissions on shared views",
    body: "Contractors should see their own accounts only. Today we duplicate a view per person, which drifts within a week.",
    status: "Planned" as Status,
    votes: 187,
    comments: 24,
    voted: false,
    board: "Access",
  },
  {
    id: "r3",
    title: "Undo a bulk edit",
    body: "One mis-clicked filter rewrote 4,000 rows. A 30 second undo window would have saved a full afternoon.",
    status: "Under review" as Status,
    votes: 96,
    comments: 7,
    voted: false,
    board: "Editing",
  },
  {
    id: "r4",
    title: "Dark mode for shared dashboards",
    body: "Our wallboards run overnight in a dim room and the white background is hard to look at for a whole shift.",
    status: "Shipped" as Status,
    votes: 342,
    comments: 41,
    voted: true,
    board: "Dashboards",
  },
  {
    id: "r5",
    title: "Webhook retries with a dead letter queue",
    body: "A five minute outage on our side silently dropped events. We would rather replay them than reconcile by hand.",
    status: "Planned" as Status,
    votes: 128,
    comments: 11,
    voted: false,
    board: "Integrations",
  },
];

const TABS = ["Top", "New", "Shipped"] as const;

export default function Feedback4() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Top");
  const [votes, setVotes] = useState(() =>
    Object.fromEntries(REQUESTS.map((r) => [r.id, r.voted])),
  );

  const rows = useMemo(() => {
    if (tab === "Shipped")
      return REQUESTS.filter((r) => r.status === "Shipped");
    if (tab === "New") return [...REQUESTS].reverse();
    return [...REQUESTS].sort((a, b) => b.votes - a.votes);
  }, [tab]);

  return (
    <div className="flex h-full min-h-[640px] w-full flex-col overflow-hidden bg-white p-4 sm:p-6 dark:bg-neutral-950">
      <div className="mx-auto flex w-full max-w-[760px] min-h-0 flex-1 flex-col">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-[17px] font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
              Feature requests
            </h2>
            <p className="mt-0.5 text-[13px] text-neutral-500">
              Vote on what you need next. Status changes appear here first.
            </p>
          </div>
          <button
            type="button"
            className={cx(
              "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
              transition,
              focus,
            )}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            New request
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-0.5 rounded-[var(--rb-r-lg,10px)] bg-neutral-100 p-1 dark:bg-neutral-800">
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
            <label htmlFor="feedback-4-search" className="sr-only">
              Search requests
            </label>
            <input
              id="feedback-4-search"
              type="search"
              placeholder="Search requests"
              className="h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pr-3 pl-8 text-[13px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-700 dark:focus:border-white"
            />
          </div>
        </div>

        <div className={cx(frame, "mt-3 flex min-h-0 flex-1 flex-col")}>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
            {rows.map((r) => {
              const voted = votes[r.id];
              const count = r.votes + (voted && !r.voted ? 1 : 0);
              return (
                <article
                  key={r.id}
                  className={cx(panel, "flex gap-3 p-3 sm:gap-4 sm:p-4")}
                >
                  <button
                    type="button"
                    aria-pressed={voted}
                    aria-label={`${voted ? "Remove vote from" : "Vote for"} ${r.title}`}
                    onClick={() =>
                      setVotes((prev) => ({ ...prev, [r.id]: !prev[r.id] }))
                    }
                    className={cx(
                      "flex h-14 w-11 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-[var(--rb-r-md,8px)] border",
                      voted
                        ? "border-neutral-900 bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:border-white dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                        : "border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-800",
                      transition,
                      focus,
                    )}
                  >
                    <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                    <span className="text-[13px] font-medium tabular-nums">
                      {count}
                    </span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h3 className="text-[14px] font-medium text-neutral-900 dark:text-neutral-100">
                        {r.title}
                      </h3>
                      <span
                        className={cx(
                          "inline-flex h-5 shrink-0 items-center rounded-[var(--rb-r-xs,4px)] border px-1.5 text-[11px] font-medium",
                          STATUS_STYLE[r.status],
                        )}
                      >
                        {r.status}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">
                      {r.body}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[12px] text-neutral-500">
                      <span>{r.board}</span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" aria-hidden />
                        <span className="tabular-nums">{r.comments}</span>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
