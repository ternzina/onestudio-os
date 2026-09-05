"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { arc, pie } from "@/components/blog-previews/d3-shape";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const frame =
  "rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-950";
const panel =
  "rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-900";

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const grouped = (n: number) => n.toLocaleString("en-US");

function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    const view = el?.ownerDocument.defaultView;
    if (!el || !view?.ResizeObserver) return;
    const observer = new view.ResizeObserver(([entry]) => {
      const box = entry.contentRect;
      setSize({ width: box.width, height: box.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}

const METRICS = ["Sessions", "Revenue"] as const;
type Metric = (typeof METRICS)[number];

type Channel = { name: string; sessions: number; revenue: number };

const CHANNELS: Channel[] = [
  { name: "Organic search", sessions: 5842, revenue: 84_200 },
  { name: "Direct", sessions: 3210, revenue: 47_900 },
  { name: "Referral", sessions: 1680, revenue: 22_300 },
  { name: "Email", sessions: 1145, revenue: 12_600 },
  { name: "Paid social", sessions: 968, revenue: 61_500 },
];

const RAMP = [
  {
    fill: "fill-neutral-900 dark:fill-white",
    dot: "bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))]",
  },
  {
    fill: "fill-neutral-600 dark:fill-neutral-300",
    dot: "bg-neutral-600 dark:bg-neutral-300",
  },
  {
    fill: "fill-neutral-400 dark:fill-neutral-500",
    dot: "bg-neutral-400 dark:bg-neutral-500",
  },
  {
    fill: "fill-neutral-300 dark:fill-neutral-700",
    dot: "bg-neutral-300 dark:bg-neutral-700",
  },
  {
    fill: "fill-neutral-200 dark:fill-neutral-800",
    dot: "bg-neutral-200 dark:bg-neutral-800",
  },
];

export default function Analytics5() {
  const [metric, setMetric] = useState<Metric>("Sessions");
  const [active, setActive] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [ref, size] = useMeasure<HTMLDivElement>();

  useEffect(() => setMounted(true), []);

  const slices = useMemo(() => {
    const key: "sessions" | "revenue" =
      metric === "Sessions" ? "sessions" : "revenue";
    const sorted = [...CHANNELS].sort((a, b) => b[key] - a[key]);
    const total = sorted.reduce((sum, c) => sum + c[key], 0);
    const raw = sorted.map((c) => Math.round((c[key] / total) * 1000) / 10);
    const sumOthers = raw.slice(0, -1).reduce((sum, s) => sum + s, 0);
    const shares = raw.map((s, i) =>
      i === raw.length - 1 ? Math.round((100 - sumOthers) * 10) / 10 : s,
    );
    return { sorted, total, shares, key };
  }, [metric]);

  const SIZE = clamp(
    size.width > 0 ? Math.min(size.width, 300) : 260,
    200,
    300,
  );
  const outer = SIZE / 2 - 4;
  const inner = outer * 0.62;

  const arcs = useMemo(() => {
    const gen = pie<Channel>()
      .value((d) => d[slices.key])
      .sort(null)
      .padAngle(0.012)(slices.sorted);
    const shape = arc<(typeof gen)[number]>()
      .innerRadius(inner)
      .outerRadius(outer)
      .cornerRadius(2);
    return gen.map((d, i) => {
      const mid = (d.startAngle + d.endAngle) / 2;
      return {
        path: shape(d) ?? "",
        lx: Math.sin(mid) * 4,
        ly: -Math.cos(mid) * 4,
        index: i,
      };
    });
  }, [slices, inner, outer]);

  const unit = metric === "Sessions" ? "sessions" : "revenue";
  const isMoney = metric === "Revenue";
  const fmt = (n: number) => (isMoney ? `$${grouped(n)}` : grouped(n));

  const centerValue =
    active === null
      ? fmt(slices.total)
      : fmt(slices.sorted[active][slices.key]);
  const centerLabel =
    active === null
      ? metric
      : `${slices.shares[active].toFixed(1)}% of ${unit}`;

  return (
    <div className="flex h-full min-h-[560px] w-full flex-col justify-center overflow-y-auto bg-white p-8 sm:p-10 dark:bg-neutral-950">
      <div className={cx(frame, "mx-auto w-full max-w-[880px] space-y-1")}>
        <div
          className={cx(
            panel,
            "flex flex-wrap items-start justify-between gap-3 px-5 py-4",
          )}
        >
          <div className="min-w-0">
            <h2 className="text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
              Traffic by channel
            </h2>
            <p className="mt-0.5 truncate text-[13px] text-neutral-500">
              Where visitors came from over the last 30 days.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Metric"
            className="flex shrink-0 items-center gap-0.5 rounded-[var(--rb-r-lg,10px)] bg-neutral-100 p-1 dark:bg-neutral-800"
          >
            {METRICS.map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={option === metric}
                onClick={() => {
                  setMetric(option);
                  setActive(null);
                }}
                className={cx(
                  "inline-flex h-7 cursor-pointer items-center rounded-[var(--rb-r-sm,6px)] px-2.5 text-[13px]",
                  option === metric
                    ? "bg-white font-medium text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-neutral-950 dark:text-neutral-100"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100",
                  transition,
                  focus,
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div
          className={cx(
            panel,
            "grid gap-5 px-5 py-5 md:grid-cols-[minmax(0,300px)_1fr] md:items-center md:gap-6",
          )}
        >
          <div ref={ref} className="relative mx-auto w-full max-w-[300px]">
            {size.width > 0 && (
              <svg
                width={SIZE}
                height={SIZE}
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                role="img"
                aria-label={`${metric} by acquisition channel. Total ${fmt(
                  slices.total,
                )}.`}
                className="mx-auto block overflow-visible"
                onPointerLeave={() => setActive(null)}
              >
                <g transform={`translate(${SIZE / 2} ${SIZE / 2})`}>
                  {arcs.map((a) => {
                    const isActive = active === a.index;
                    const dim = active !== null && !isActive;
                    return (
                      <path
                        key={a.index}
                        d={a.path}
                        className={cx(
                          RAMP[a.index].fill,
                          "cursor-pointer transition-[transform,opacity] duration-150 ease-out motion-reduce:transition-none",
                        )}
                        style={{
                          opacity: dim ? 0.4 : mounted ? 1 : 0,
                          transform: isActive
                            ? `translate(${a.lx}px, ${a.ly}px)`
                            : "translate(0px, 0px)",
                        }}
                        onPointerEnter={() => setActive(a.index)}
                      />
                    );
                  })}
                </g>
              </svg>
            )}

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-medium tabular-nums tracking-[-0.02em] text-neutral-900 dark:text-neutral-100">
                {centerValue}
              </p>
              <p className="mt-0.5 max-w-[9rem] truncate text-center text-[11px] text-neutral-500">
                {centerLabel}
              </p>
            </div>
          </div>

          <ul className="flex flex-col gap-0.5">
            {slices.sorted.map((channel, i) => {
              const isActive = active === i;
              return (
                <li key={channel.name}>
                  <button
                    type="button"
                    onPointerEnter={() => setActive(i)}
                    onPointerLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    className={cx(
                      "flex w-full items-center gap-2.5 rounded-[var(--rb-r-md,8px)] px-2.5 py-2 text-left",
                      isActive
                        ? "bg-neutral-100 dark:bg-neutral-800"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
                      transition,
                      focus,
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cx(
                        "h-2 w-2 shrink-0 rounded-[2px]",
                        RAMP[i].dot,
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-neutral-700 dark:text-neutral-300">
                      {channel.name}
                    </span>
                    <span className="shrink-0 text-[13px] tabular-nums text-neutral-900 dark:text-neutral-100">
                      {fmt(channel[slices.key])}
                    </span>
                    <span className="w-12 shrink-0 text-right text-[13px] tabular-nums text-neutral-500">
                      {slices.shares[i].toFixed(1)}%
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
