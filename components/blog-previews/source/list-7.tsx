"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Search, SearchX, X } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

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

type Contract = "active" | "expiring" | "expired" | "draft";

type Supplier = {
  id: string;
  name: string;
  initials: string;
  location: string;
  since: string;
  category: string;
  contract: Contract;
  contractLabel: string;
  spend: string;
  delta: string;
  up: boolean;
};

const CONTRACT_DOT: Record<Contract, string> = {
  active: "bg-neutral-300 dark:bg-neutral-600",
  draft: "bg-neutral-300 dark:bg-neutral-600",
  expiring: "bg-amber-500",
  expired: "bg-red-500",
};

const SUPPLIERS: Supplier[] = [
  {
    id: "northwind",
    name: "Northwind Freight Co.",
    initials: "NF",
    location: "Rotterdam, NL",
    since: "Onboarded Mar 2021",
    category: "Logistics",
    contract: "active",
    contractLabel: "Active",
    spend: "$1,240,000",
    delta: "+8.2%",
    up: true,
  },
  {
    id: "kraft",
    name: "Kraft & Hollow Packaging",
    initials: "KH",
    location: "Portland, US",
    since: "Onboarded Jul 2019",
    category: "Packaging",
    contract: "expiring",
    contractLabel: "Expiring",
    spend: "$486,500",
    delta: "-3.1%",
    up: false,
  },
  {
    id: "meridian",
    name: "Meridian Cloud Systems",
    initials: "MC",
    location: "Dublin, IE",
    since: "Onboarded Jan 2022",
    category: "Cloud",
    contract: "active",
    contractLabel: "Active",
    spend: "$918,300",
    delta: "+14.6%",
    up: true,
  },
  {
    id: "brightledger",
    name: "Brightledger Advisory",
    initials: "BA",
    location: "London, UK",
    since: "Onboarded Sep 2020",
    category: "Professional",
    contract: "active",
    contractLabel: "Active",
    spend: "$212,750",
    delta: "+2.4%",
    up: true,
  },
  {
    id: "parcelworks",
    name: "Parcelworks Logistics",
    initials: "PL",
    location: "Memphis, US",
    since: "Onboarded Nov 2018",
    category: "Logistics",
    contract: "expired",
    contractLabel: "Expired",
    spend: "$74,900",
    delta: "-18.9%",
    up: false,
  },
  {
    id: "atlas",
    name: "Atlas Component Works",
    initials: "AC",
    location: "Stuttgart, DE",
    since: "Onboarded Feb 2020",
    category: "Manufacturing",
    contract: "active",
    contractLabel: "Active",
    spend: "$1,506,200",
    delta: "+6.7%",
    up: true,
  },
  {
    id: "verdant",
    name: "Verdant Materials",
    initials: "VM",
    location: "Malmö, SE",
    since: "Onboarded May 2023",
    category: "Manufacturing",
    contract: "draft",
    contractLabel: "In review",
    spend: "$0",
    delta: "0.0%",
    up: true,
  },
  {
    id: "harborlight",
    name: "Harborlight Freight",
    initials: "HF",
    location: "Singapore, SG",
    since: "Onboarded Aug 2021",
    category: "Logistics",
    contract: "active",
    contractLabel: "Active",
    spend: "$643,100",
    delta: "+11.3%",
    up: true,
  },
  {
    id: "corvid",
    name: "Corvid Cloud Infrastructure",
    initials: "CC",
    location: "Ashburn, US",
    since: "Onboarded Oct 2022",
    category: "Cloud",
    contract: "expiring",
    contractLabel: "Expiring",
    spend: "$355,000",
    delta: "-5.4%",
    up: false,
  },
  {
    id: "fold",
    name: "Fold & Crease Cartons",
    initials: "FC",
    location: "Guadalajara, MX",
    since: "Onboarded Apr 2019",
    category: "Packaging",
    contract: "active",
    contractLabel: "Active",
    spend: "$298,400",
    delta: "+4.1%",
    up: true,
  },
  {
    id: "sterling",
    name: "Sterling Tax Partners",
    initials: "ST",
    location: "Toronto, CA",
    since: "Onboarded Dec 2020",
    category: "Professional",
    contract: "active",
    contractLabel: "Active",
    spend: "$164,000",
    delta: "+1.2%",
    up: true,
  },
  {
    id: "ironvale",
    name: "Ironvale Fabrication",
    initials: "IF",
    location: "Sheffield, UK",
    since: "Onboarded Jun 2017",
    category: "Manufacturing",
    contract: "active",
    contractLabel: "Active",
    spend: "$822,600",
    delta: "+3.8%",
    up: true,
  },
  {
    id: "swiftload",
    name: "Swiftload Distribution",
    initials: "SD",
    location: "Lyon, FR",
    since: "Onboarded Feb 2024",
    category: "Logistics",
    contract: "draft",
    contractLabel: "In review",
    spend: "$0",
    delta: "0.0%",
    up: true,
  },
  {
    id: "nimbus",
    name: "Nimbus Data Platform",
    initials: "ND",
    location: "Sydney, AU",
    since: "Onboarded Mar 2023",
    category: "Cloud",
    contract: "active",
    contractLabel: "Active",
    spend: "$531,900",
    delta: "+9.5%",
    up: true,
  },
];

const CATEGORIES = [
  "All categories",
  "Logistics",
  "Packaging",
  "Cloud",
  "Manufacturing",
  "Professional",
];

function highlight(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;
  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  const parts: React.ReactNode[] = [];
  let from = 0;
  let idx = lower.indexOf(needle, from);
  let key = 0;
  while (idx !== -1) {
    if (idx > from) parts.push(text.slice(from, idx));
    parts.push(
      <mark
        key={key++}
        className="rounded-[var(--rb-r-xs,4px)] bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white"
      >
        {text.slice(idx, idx + needle.length)}
      </mark>,
    );
    from = idx + needle.length;
    idx = lower.indexOf(needle, from);
  }
  if (from < text.length) parts.push(text.slice(from));
  return parts.map((p, i) => <Fragment key={i}>{p}</Fragment>);
}

const GRID =
  "grid grid-cols-[minmax(0,1fr)_120px_120px] items-center gap-4 md:grid-cols-[minmax(0,1fr)_130px_130px_140px]";

export default function List7() {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const { ref, edges, onScroll } = useScrollFade<HTMLDivElement>();

  useEffect(() => setMounted(true), []);

  const q = query.trim().toLowerCase();
  const rows = SUPPLIERS.filter((s) => {
    const matchesQuery =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q);
    const matchesCategory =
      category === "All categories" || s.category === category;
    return matchesQuery && matchesCategory;
  });

  const clearSearch = () => {
    setQuery("");
    setCategory("All categories");
  };

  return (
    <div className="flex h-full min-h-[640px] w-full flex-col overflow-hidden bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <div className="mx-auto flex h-full w-full max-w-[1100px] flex-col">
        <div className="flex min-h-0 flex-1 flex-col rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
                Suppliers
              </h2>
              <p className="mt-0.5 text-[13px] tabular-nums text-neutral-500">
                {rows.length} of {SUPPLIERS.length} suppliers
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64 sm:flex-none">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name or category"
                  aria-label="Search suppliers"
                  className={cx(
                    "h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pl-9 pr-14 text-[13px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white",
                    transition,
                    focus,
                  )}
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className={cx(
                      "absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[var(--rb-r-sm,6px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                      transition,
                      focus,
                    )}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <kbd
                    aria-hidden="true"
                    className="pointer-events-none absolute right-2 top-1/2 flex h-5 -translate-y-1/2 items-center rounded-[var(--rb-r-xs,4px)] border border-neutral-200 bg-neutral-100 px-1.5 font-mono text-[11px] text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400"
                  >
                    ⌘K
                  </kbd>
                )}
              </div>

              <div className="relative shrink-0">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  aria-label="Filter by category"
                  className={cx(
                    "h-9 cursor-pointer appearance-none rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pl-3 pr-8 text-[13px] text-neutral-900 hover:border-neutral-300 focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-700 dark:focus:border-white",
                    transition,
                    focus,
                  )}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m4 6 4 4 4-4" />
                </svg>
              </div>
            </div>
          </div>

          <div
            className={cx(
              GRID,
              "px-4 pb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-500",
            )}
          >
            <span>Supplier</span>
            <span className="hidden md:block">Category</span>
            <span>Contract</span>
            <span className="text-right">Spend</span>
          </div>

          {rows.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                <SearchX className="h-5 w-5 text-neutral-500" />
              </div>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                No suppliers found
              </p>
              <p className="mt-1 max-w-xs text-[13px] text-neutral-600 dark:text-neutral-400">
                Nothing matches{" "}
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  “{query || category}”
                </span>
                . Try a different name or category.
              </p>
              <button
                type="button"
                onClick={clearSearch}
                className={cx(
                  "mt-4 inline-flex h-8 cursor-pointer items-center rounded-[var(--rb-r-md,8px)] border border-neutral-200/70 bg-white px-3 text-[13px] font-medium text-neutral-900 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800",
                  transition,
                  focus,
                )}
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="relative min-h-0 flex-1 overflow-hidden">
              <div
                ref={ref}
                onScroll={onScroll}
                style={{ touchAction: "pan-y" }}
                className="flex h-full flex-col gap-1 overflow-y-auto p-1"
              >
                {rows.map((s, i) => (
                  <div
                    key={s.id}
                    className={cx(
                      GRID,
                      "h-16 shrink-0 rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white px-3 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800/60",
                      transition,
                    )}
                    style={{
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? undefined : "translateY(4px)",
                      transition:
                        "opacity 200ms ease-out, transform 200ms ease-out",
                      transitionDelay: `${Math.min(i, 8) * 20}ms`,
                    }}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                      >
                        {s.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                          {highlight(s.name, query)}
                        </p>
                        <p className="mt-0.5 truncate text-[12px] text-neutral-500">
                          {s.location} · {s.since}
                        </p>
                      </div>
                    </div>

                    <span className="hidden truncate text-[13px] text-neutral-600 md:block dark:text-neutral-400">
                      {s.category}
                    </span>

                    <span className="flex items-center gap-1.5 text-[13px] text-neutral-600 dark:text-neutral-400">
                      <span
                        aria-hidden="true"
                        className={cx(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          CONTRACT_DOT[s.contract],
                        )}
                      />
                      <span className="truncate">{s.contractLabel}</span>
                    </span>

                    <span className="text-right">
                      <span className="block text-[13px] tabular-nums text-neutral-900 dark:text-neutral-100">
                        {s.spend}
                      </span>
                      <span
                        className={cx(
                          "block text-[12px] tabular-nums",
                          s.up
                            ? "text-emerald-600 dark:text-emerald-500"
                            : "text-red-600 dark:text-red-500",
                        )}
                      >
                        {s.delta} YoY
                      </span>
                    </span>
                  </div>
                ))}
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
          )}
        </div>
      </div>
    </div>
  );
}
