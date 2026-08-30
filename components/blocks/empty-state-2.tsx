"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

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

const INITIAL_FILTERS = [
  { id: "owner", label: "Owner", value: "Priya Nandakumar" },
  { id: "status", label: "Status", value: "Archived" },
  { id: "range", label: "Created", value: "Last 7 days" },
  { id: "tag", label: "Tag", value: "Finance" },
];

const SUGGESTIONS = [
  { query: "quarterly revenue", count: 46 },
  { query: "revenue by region", count: 12 },
  { query: "revenue forecast", count: 8 },
];

export default function EmptyState2() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [query, setQuery] = useState("quaterly revenu");

  return (
    <div className="flex h-full min-h-[560px] w-full flex-col overflow-y-auto bg-white p-4 sm:p-6 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[640px]">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400"
            aria-hidden
          />
          <label htmlFor="empty-state-2-search" className="sr-only">
            Search reports
          </label>
          <input
            id="empty-state-2-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white pr-3 pl-9 text-[14px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-700 dark:focus:border-white"
          />
        </div>

        {filters.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {filters.map((f) => (
              <span
                key={f.id}
                className="inline-flex h-7 items-center gap-1 rounded-[var(--rb-r-md,8px)] border border-neutral-200 pr-1 pl-2.5 text-[12px] text-neutral-700 dark:border-neutral-800 dark:text-neutral-300"
              >
                <span className="text-neutral-500">{f.label}</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {f.value}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${f.label} filter`}
                  onClick={() =>
                    setFilters((prev) => prev.filter((x) => x.id !== f.id))
                  }
                  className={cx(
                    "inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-[var(--rb-r-xs,4px)] text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                    transition,
                    focus,
                  )}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => setFilters([])}
              className={cx(
                "inline-flex h-7 cursor-pointer items-center rounded-[var(--rb-r-md,8px)] px-2 text-[12px] font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                transition,
                focus,
              )}
            >
              Clear all
            </button>
          </div>
        )}

        <div className={cx(frame, "mt-4")}>
          <div className={cx(panel, "px-6 py-10 text-center sm:px-10")}>
            <span
              aria-hidden
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-[var(--rb-r-xl,12px)] border border-neutral-200 dark:border-neutral-800"
            >
              <Search className="h-4 w-4 text-neutral-400" />
            </span>
            <h2 className="mt-4 text-[16px] font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
              No reports match &ldquo;{query}&rdquo;
            </h2>
            <p className="mx-auto mt-1.5 max-w-[380px] text-[13px] leading-relaxed text-neutral-500">
              {filters.length > 0
                ? `${filters.length} ${filters.length === 1 ? "filter is" : "filters are"} narrowing this search. Removing one usually brings results back.`
                : "Nothing in this workspace matches that spelling. Try one of the searches below."}
            </p>

            <div className="mx-auto mt-5 max-w-[360px] space-y-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.query}
                  type="button"
                  onClick={() => setQuery(s.query)}
                  className={cx(
                    "flex w-full cursor-pointer items-center gap-2 rounded-[var(--rb-r-md,8px)] px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800",
                    transition,
                    focus,
                  )}
                >
                  <Search
                    className="h-3.5 w-3.5 shrink-0 text-neutral-400"
                    aria-hidden
                  />
                  <span className="truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                    {s.query}
                  </span>
                  <span className="ml-auto shrink-0 text-[12px] tabular-nums text-neutral-400">
                    {s.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-[12px] text-neutral-500">
          Searches cover report titles, descriptions and column names.
        </p>
      </div>
    </div>
  );
}
