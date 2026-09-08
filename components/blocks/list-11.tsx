"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color] duration-150 ease-out";

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

type Trio = { r: number; rt: number; cs: number };

type Agent = {
  id: string;
  name: string;
  initials: string;
  team: string;
  /** current + week-over-week / month-over-month deltas, per period. */
  w: Trio;
  wd: Trio;
  m: Trio;
  md: Trio;
};

const AGENTS: Agent[] = [
  {
    id: "nair",
    name: "Priya Nair",
    initials: "PN",
    team: "Tier 2 support",
    w: { r: 172, rt: 96, cs: 4.9 },
    wd: { r: 14, rt: -12, cs: 0.2 },
    m: { r: 712, rt: 108, cs: 4.8 },
    md: { r: 40, rt: -18, cs: 0.1 },
  },
  {
    id: "bello",
    name: "Marcus Bello",
    initials: "MB",
    team: "Escalations",
    w: { r: 168, rt: 132, cs: 4.7 },
    wd: { r: 9, rt: 8, cs: 0 },
    m: { r: 690, rt: 140, cs: 4.7 },
    md: { r: 22, rt: 10, cs: 0 },
  },
  {
    id: "sato",
    name: "Hana Sato",
    initials: "HS",
    team: "Tier 1 support",
    w: { r: 151, rt: 118, cs: 4.8 },
    wd: { r: -6, rt: -5, cs: 0.1 },
    m: { r: 640, rt: 122, cs: 4.8 },
    md: { r: -18, rt: -8, cs: 0.1 },
  },
  {
    id: "ramos",
    name: "Diego Ramos",
    initials: "DR",
    team: "Billing",
    w: { r: 149, rt: 205, cs: 4.5 },
    wd: { r: 21, rt: -22, cs: -0.1 },
    m: { r: 705, rt: 190, cs: 4.6 },
    md: { r: 64, rt: -30, cs: -0.1 },
  },
  {
    id: "okoye",
    name: "Amara Okoye",
    initials: "AO",
    team: "Onboarding",
    w: { r: 138, rt: 176, cs: 4.6 },
    wd: { r: -3, rt: 6, cs: 0.2 },
    m: { r: 588, rt: 168, cs: 4.5 },
    md: { r: -11, rt: 9, cs: 0.1 },
  },
  {
    id: "fischer",
    name: "Lena Fischer",
    initials: "LF",
    team: "Tier 2 support",
    w: { r: 131, rt: 149, cs: 4.7 },
    wd: { r: 12, rt: -9, cs: 0.1 },
    m: { r: 559, rt: 155, cs: 4.7 },
    md: { r: 33, rt: -12, cs: 0.1 },
  },
  {
    id: "whitfield",
    name: "Sam Whitfield",
    initials: "SW",
    team: "Tier 1 support",
    w: { r: 120, rt: 221, cs: 4.4 },
    wd: { r: -8, rt: 14, cs: -0.2 },
    m: { r: 512, rt: 210, cs: 4.4 },
    md: { r: -25, rt: 20, cs: -0.2 },
  },
  {
    id: "tanaka",
    name: "Yuki Tanaka",
    initials: "YT",
    team: "Escalations",
    w: { r: 109, rt: 163, cs: 4.6 },
    wd: { r: 4, rt: -3, cs: 0.1 },
    m: { r: 470, rt: 172, cs: 4.5 },
    md: { r: 12, rt: -6, cs: 0 },
  },
  {
    id: "haddad",
    name: "Omar Haddad",
    initials: "OH",
    team: "Billing",
    w: { r: 96, rt: 258, cs: 4.3 },
    wd: { r: 18, rt: -18, cs: 0.3 },
    m: { r: 604, rt: 226, cs: 4.4 },
    md: { r: 48, rt: -24, cs: 0.2 },
  },
];

const MEASURES = [
  { id: "resolved", label: "Resolved" },
  { id: "response", label: "Response time" },
  { id: "csat", label: "Satisfaction" },
] as const;
type MeasureId = (typeof MEASURES)[number]["id"];

const PERIODS = [
  { id: "w", label: "This week" },
  { id: "m", label: "This month" },
] as const;
type PeriodId = (typeof PERIODS)[number]["id"];

const KEY: Record<MeasureId, keyof Trio> = {
  resolved: "r",
  response: "rt",
  csat: "cs",
};
const ASC: Record<MeasureId, boolean> = {
  resolved: false,
  response: true,
  csat: false,
};

const round1 = (n: number) => Math.round(n * 10) / 10;
const mmss = (sec: number) =>
  `${Math.floor(sec / 60)}:${String(Math.round(sec) % 60).padStart(2, "0")}`;

const current = (a: Agent, period: PeriodId) => (period === "w" ? a.w : a.m);
const delta = (a: Agent, period: PeriodId) => (period === "w" ? a.wd : a.md);

const STRIDE = 68;

const GRID = "28px 60px minmax(0,1fr) 96px 104px 76px";

function HeaderCell({
  children,
  right,
}: {
  children: ReactNode;
  right?: boolean;
}) {
  return (
    <span
      className={cx(
        "text-[11px] font-medium uppercase tracking-wider text-neutral-500",
        right && "text-right",
      )}
    >
      {children}
    </span>
  );
}

function rankMap(period: PeriodId, measure: MeasureId, previous: boolean) {
  const k = KEY[measure];
  const rows = AGENTS.map((a) => {
    const base = current(a, period)[k];
    const val = previous ? round1(base - delta(a, period)[k]) : base;
    return { id: a.id, val };
  });
  rows.sort((x, y) => (ASC[measure] ? x.val - y.val : y.val - x.val));
  const map: Record<string, number> = {};
  rows.forEach((row, i) => (map[row.id] = i + 1));
  return map;
}

export default function List11() {
  const [measure, setMeasure] = useState<MeasureId>("resolved");
  const [period, setPeriod] = useState<PeriodId>("w");
  const [hovered, setHovered] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const { ref: scrollRef, edges, onScroll } = useScrollFade<HTMLDivElement>();

  useEffect(() => setMounted(true), []);

  const curRank = useMemo(
    () => rankMap(period, measure, false),
    [period, measure],
  );
  const prevRank = useMemo(
    () => rankMap(period, measure, true),
    [period, measure],
  );

  const maxResolved = useMemo(
    () => Math.max(...AGENTS.map((a) => current(a, period).r)),
    [period],
  );

  const totals = useMemo(() => {
    const resolved = AGENTS.reduce((n, a) => n + current(a, period).r, 0);
    const rt =
      AGENTS.reduce((n, a) => n + current(a, period).rt, 0) / AGENTS.length;
    const cs =
      AGENTS.reduce((n, a) => n + current(a, period).cs, 0) / AGENTS.length;
    return { resolved, rt, cs: round1(cs) };
  }, [period]);

  return (
    <div className="flex h-full min-h-[640px] w-full flex-col overflow-hidden bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <div className="mx-auto flex h-full w-full max-w-[1100px] flex-col">
        <div className="mb-4 flex shrink-0 flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
              Support leaderboard
            </h2>
            <p className="mt-0.5 text-[12px] text-neutral-500">
              Ranked by conversations resolved
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <div
              role="tablist"
              aria-label="Sort by"
              className="flex items-center gap-0.5 rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-neutral-50 p-0.5 dark:border-neutral-800 dark:bg-neutral-900"
            >
              {MEASURES.map((mo) => {
                const on = mo.id === measure;
                return (
                  <button
                    key={mo.id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setMeasure(mo.id)}
                    className={cx(
                      "h-7 rounded-[var(--rb-r-md,8px)] px-2.5 text-[12px]",
                      transition,
                      focus,
                      on
                        ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-neutral-950 dark:text-neutral-100"
                        : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100",
                    )}
                  >
                    {mo.label}
                  </button>
                );
              })}
            </div>

            <div
              role="tablist"
              aria-label="Period"
              className="flex items-center gap-0.5 rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-neutral-50 p-0.5 dark:border-neutral-800 dark:bg-neutral-900"
            >
              {PERIODS.map((p) => {
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
                        ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-neutral-950 dark:text-neutral-100"
                        : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100",
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
          <div
            className="grid shrink-0 items-center gap-3 rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-950"
            style={{ gridTemplateColumns: GRID }}
          >
            <HeaderCell>#</HeaderCell>
            <HeaderCell>Trend</HeaderCell>
            <HeaderCell>Agent</HeaderCell>
            <HeaderCell right>Resolved</HeaderCell>
            <HeaderCell right>Median FRT</HeaderCell>
            <HeaderCell right>CSAT</HeaderCell>
          </div>

          <div className="relative min-h-0 flex-1">
            <div
              ref={scrollRef}
              onScroll={onScroll}
              style={{ touchAction: "pan-y" }}
              className="h-full overflow-y-auto"
            >
              <div
                className="relative"
                style={{ height: AGENTS.length * STRIDE }}
              >
                {AGENTS.map((a) => {
                  const rank = curRank[a.id];
                  const move = prevRank[a.id] - rank;
                  const cur = current(a, period);
                  const d = delta(a, period);
                  const topThree = rank <= 3;
                  const fill = Math.round((cur.r / maxResolved) * 100);
                  const isHover = hovered === a.id;

                  const measureDelta = d[KEY[measure]];
                  const improved = ASC[measure]
                    ? measureDelta < 0
                    : measureDelta > 0;
                  const wowText =
                    measure === "resolved"
                      ? `${measureDelta > 0 ? "+" : "−"}${Math.abs(measureDelta)} resolved`
                      : measure === "response"
                        ? `${measureDelta > 0 ? "+" : "−"}${Math.abs(measureDelta)}s response`
                        : `${measureDelta > 0 ? "+" : "−"}${Math.abs(round1(measureDelta))} CSAT`;

                  return (
                    <div
                      key={a.id}
                      style={{
                        transform: `translateY(${(rank - 1) * STRIDE}px)`,
                        opacity: mounted ? 1 : 0,
                        zIndex: isHover ? 10 : 1,
                        transitionDelay: mounted
                          ? undefined
                          : `${Math.min(rank - 1, 8) * 20}ms`,
                      }}
                      className="absolute inset-x-0 top-0 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
                    >
                      <div
                        onPointerEnter={() => setHovered(a.id)}
                        onPointerLeave={() =>
                          setHovered((h) => (h === a.id ? null : h))
                        }
                        className={cx(
                          "relative flex h-16 items-center overflow-hidden rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-950",
                          "hover:bg-neutral-50 dark:hover:bg-neutral-800/40",
                          transition,
                        )}
                      >
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-y-0 left-0 bg-neutral-900/[0.035] dark:bg-white/[0.05]"
                          style={{ width: `${fill}%` }}
                        />

                        <div
                          className="relative z-10 grid w-full items-center gap-3 px-3"
                          style={{ gridTemplateColumns: GRID }}
                        >
                          <span
                            className={cx(
                              "text-[13px] tabular-nums",
                              topThree
                                ? "font-medium text-neutral-900 dark:text-neutral-100"
                                : "text-neutral-400 dark:text-neutral-500",
                            )}
                          >
                            {rank}
                          </span>

                          <span className="inline-flex items-center gap-0.5 text-[12px] tabular-nums">
                            {move > 0 ? (
                              <>
                                <ArrowUp
                                  className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-500"
                                  strokeWidth={2}
                                  aria-hidden="true"
                                />
                                <span className="text-emerald-600 dark:text-emerald-500">
                                  {move}
                                </span>
                              </>
                            ) : move < 0 ? (
                              <>
                                <ArrowDown
                                  className="h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-500"
                                  strokeWidth={2}
                                  aria-hidden="true"
                                />
                                <span className="text-red-600 dark:text-red-500">
                                  {Math.abs(move)}
                                </span>
                              </>
                            ) : (
                              <>
                                <Minus
                                  className="h-3.5 w-3.5 shrink-0 text-neutral-400 dark:text-neutral-600"
                                  strokeWidth={2}
                                  aria-hidden="true"
                                />
                                <span className="sr-only">no change</span>
                              </>
                            )}
                          </span>

                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              aria-hidden="true"
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                            >
                              {a.initials}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                                {a.name}
                              </p>
                              <p className="flex items-center gap-1.5 truncate text-[12px] text-neutral-500">
                                <span className="truncate">{a.team}</span>
                                <span
                                  className={cx(
                                    "shrink-0 tabular-nums transition-opacity duration-150",
                                    isHover ? "opacity-100" : "opacity-0",
                                    measureDelta === 0
                                      ? "text-neutral-500"
                                      : improved
                                        ? "text-emerald-600 dark:text-emerald-500"
                                        : "text-red-600 dark:text-red-500",
                                  )}
                                >
                                  · {wowText} vs last
                                </span>
                              </p>
                            </div>
                          </div>

                          <span className="text-right text-[13px] tabular-nums text-neutral-900 dark:text-neutral-100">
                            {cur.r}
                          </span>
                          <span className="text-right text-[13px] tabular-nums text-neutral-700 dark:text-neutral-300">
                            {mmss(cur.rt)}
                          </span>
                          <span className="text-right text-[13px] tabular-nums text-neutral-700 dark:text-neutral-300">
                            {cur.cs.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              aria-hidden="true"
              className={cx(
                "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
                edges.start ? "opacity-100" : "opacity-0",
              )}
            />
            <div
              aria-hidden="true"
              className={cx(
                "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
                edges.end ? "opacity-100" : "opacity-0",
              )}
            />
          </div>

          <div
            className="grid shrink-0 items-center gap-3 rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-950"
            style={{ gridTemplateColumns: GRID }}
          >
            <span className="col-span-3 text-[12px] font-medium text-neutral-900 dark:text-neutral-100">
              Team totals · {AGENTS.length} agents
            </span>
            <span className="text-right text-[13px] font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
              {totals.resolved.toLocaleString("en-US")}
            </span>
            <span className="text-right text-[13px] tabular-nums text-neutral-500">
              {mmss(totals.rt)}
            </span>
            <span className="text-right text-[13px] tabular-nums text-neutral-500">
              {totals.cs.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
