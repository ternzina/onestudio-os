"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const frame =
  "flex flex-col gap-1 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900";

const panel =
  "rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-950";

function useScrollFade<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setEdges({
      start: scrollTop > 1,
      end: Math.ceil(scrollTop + clientHeight) < scrollHeight - 1,
    });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    const view = el?.ownerDocument.defaultView;
    if (!el || !view?.ResizeObserver) return;
    const observer = new view.ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update]);

  return { ref, edges, onScroll: update };
}

type Period = "month" | "quarter";

type Service = {
  id: string;
  name: string;
  initials: string;
  team: string;
  by: Record<Period, { spend: number; delta: number; units: string }>;
};

const SERVICES: Service[] = [
  {
    id: "compute",
    name: "Container compute",
    initials: "CC",
    team: "Platform",
    by: {
      month: { spend: 42180, delta: 4.2, units: "18,400 vCPU hrs" },
      quarter: { spend: 121460, delta: 9.6, units: "54,900 vCPU hrs" },
    },
  },
  {
    id: "storage",
    name: "Object storage",
    initials: "OS",
    team: "Data",
    by: {
      month: { spend: 18740, delta: -1.8, units: "312 TB stored" },
      quarter: { spend: 57120, delta: 2.4, units: "938 TB stored" },
    },
  },
  {
    id: "warehouse",
    name: "Query warehouse",
    initials: "QW",
    team: "Analytics",
    by: {
      month: { spend: 15390, delta: 12.7, units: "9,860 credits" },
      quarter: { spend: 41870, delta: 21.3, units: "27,140 credits" },
    },
  },
  {
    id: "egress",
    name: "Network egress",
    initials: "NE",
    team: "Platform",
    by: {
      month: { spend: 9260, delta: -6.4, units: "74 TB transferred" },
      quarter: { spend: 30480, delta: -3.1, units: "241 TB transferred" },
    },
  },
  {
    id: "search",
    name: "Search cluster",
    initials: "SC",
    team: "Product",
    by: {
      month: { spend: 7420, delta: 0.9, units: "6 nodes" },
      quarter: { spend: 22010, delta: 5.5, units: "6 nodes" },
    },
  },
  {
    id: "observability",
    name: "Observability",
    initials: "OB",
    team: "Platform",
    by: {
      month: { spend: 5130, delta: 3.6, units: "1.4 TB ingested" },
      quarter: { spend: 14980, delta: 7.2, units: "4.1 TB ingested" },
    },
  },
];

const money = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;

const signed = (n: number) =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(1)}%`;

export default function List2() {
  const [period, setPeriod] = useState<Period>("month");
  const [selected, setSelected] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const fade = useScrollFade<HTMLDivElement>();

  useEffect(() => setMounted(true), []);

  const rows = useMemo(
    () => [...SERVICES].sort((a, b) => b.by[period].spend - a.by[period].spend),
    [period],
  );

  const total = useMemo(
    () => rows.reduce((sum, s) => sum + s.by[period].spend, 0),
    [rows, period],
  );

  return (
    <div className="flex h-full min-h-[640px] w-full flex-col justify-center overflow-y-auto bg-white p-8 sm:p-10 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[720px] overflow-hidden rounded-[var(--rb-r-4xl,18px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
          <div>
            <h2 className="text-[13px] text-neutral-900 dark:text-white">
              Infrastructure spend
            </h2>
            <p className="mt-0.5 text-[12px] text-neutral-500 tabular-nums">
              {money(total)} across {rows.length} services
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Billing period"
            className="flex items-center gap-0.5 rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-neutral-50 p-0.5 dark:border-neutral-800 dark:bg-neutral-900"
          >
            {(
              [
                { id: "month", label: "Month" },
                { id: "quarter", label: "Quarter" },
              ] as const
            ).map((p) => {
              const on = p.id === period;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setPeriod(p.id)}
                  className={cx(
                    "h-7 rounded-[var(--rb-r-md,8px)] px-2.5 text-[12px]",
                    transition,
                    focus,
                    on
                      ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-neutral-950 dark:text-white"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white",
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-3">
          <div className={cx(frame, "relative")}>
            <div
              ref={fade.ref}
              onScroll={fade.onScroll}
              className="flex max-h-[292px] flex-col gap-1 overflow-y-auto"
            >
              {rows.map((s, i) => {
                const { spend, delta, units } = s.by[period];
                const on = selected === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSelected(on ? null : s.id)}
                    className={cx(
                      panel,
                      "flex h-14 w-full shrink-0 items-center gap-3 px-3 text-left",
                      "hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
                      on && "ring-1 ring-neutral-900 dark:ring-white",
                      focus,
                      "motion-reduce:transition-none",
                    )}
                    style={{
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? undefined : "translateY(4px)",
                      transition:
                        "opacity 300ms ease-out, transform 300ms ease-out," +
                        " background-color 150ms ease-out",
                      transitionDelay: `${Math.min(i, 8) * 20}ms`,
                    }}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      {s.initials}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-neutral-900 dark:text-white">
                        {s.name}
                      </span>
                      <span className="block truncate text-[12px] text-neutral-500">
                        {s.team} · {units}
                      </span>
                    </span>

                    <span className="shrink-0 text-right">
                      <span className="block text-[13px] text-neutral-900 tabular-nums dark:text-white">
                        {money(spend)}
                      </span>
                      <span
                        className={cx(
                          "block text-[12px] tabular-nums",
                          delta > 0
                            ? "text-red-600 dark:text-red-500"
                            : delta < 0
                              ? "text-emerald-600 dark:text-emerald-500"
                              : "text-neutral-500",
                        )}
                      >
                        {signed(delta)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              aria-hidden="true"
              className={cx(
                "pointer-events-none absolute inset-x-1 top-1 h-8 rounded-t-[var(--rb-r-lg,10px)] bg-gradient-to-b from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
                fade.edges.start ? "opacity-100" : "opacity-0",
              )}
            />
            <div
              aria-hidden="true"
              className={cx(
                "pointer-events-none absolute inset-x-1 bottom-1 h-8 rounded-b-[var(--rb-r-lg,10px)] bg-gradient-to-t from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
                fade.edges.end ? "opacity-100" : "opacity-0",
              )}
            />
          </div>
        </div>

        <div className="px-3 py-3">
          <button
            type="button"
            className={cx(
              "flex h-10 w-full items-center justify-center gap-2 rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white text-[13px] text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white",
              "hover:bg-neutral-50 dark:hover:bg-neutral-900",
              transition,
              focus,
            )}
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Connect a billing account
          </button>
        </div>
      </div>
    </div>
  );
}
