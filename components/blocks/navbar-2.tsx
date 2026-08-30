"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUpDown,
  Check,
  Copy,
  House,
  LayoutGrid,
  Link2,
  ListFilter,
  MoreHorizontal,
  Send,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const surface =
  "rounded-[var(--rb-r-xl,12px)] border border-neutral-200 bg-white p-1 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)] dark:border-neutral-800 dark:bg-neutral-900";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const pop = (reduce: boolean | null) => ({
  initial: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -4 },
  animate: reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 },
  exit: reduce
    ? { opacity: 0, transition: { duration: 0.12 } }
    : {
        opacity: 0,
        scale: 0.97,
        y: -4,
        transition: { duration: 0.12, ease: EASE_OUT },
      },
  transition: { duration: 0.18, ease: EASE_OUT },
});

const menuItem =
  "flex w-full cursor-pointer items-center gap-2 rounded-[var(--rb-r-md,8px)] px-2.5 py-1.5 text-left text-[13px] text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800";

const SORTS = [
  { id: "recent", label: "Recently updated" },
  { id: "created", label: "Date created" },
  { id: "name", label: "Name" },
  { id: "owner", label: "Owner" },
];

const FILTERS = ["Assigned to me", "Due this week", "Blocked"];

const ROWS = [
  { name: "Payment retries", meta: "Sprint 24 · Nadia V." },
  { name: "Guest checkout polish", meta: "Sprint 24 · Marcus S." },
  { name: "Address autofill", meta: "Sprint 23 · Priya P." },
  { name: "Order summary copy", meta: "Sprint 23 · Tom P." },
];

export default function Navbar2() {
  const reduce = useReducedMotion();
  const [menu, setMenu] = useState<string | null>(null);
  const [sort, setSort] = useState("recent");
  const [filters, setFilters] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const doc = rootRef.current?.ownerDocument;
    if (!doc) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest?.("[data-menu-root]")) setMenu(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(null);
    };
    doc.addEventListener("pointerdown", onPointerDown);
    doc.addEventListener("keydown", onKeyDown);
    return () => {
      doc.removeEventListener("pointerdown", onPointerDown);
      doc.removeEventListener("keydown", onKeyDown);
    };
  }, [menu]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(id);
  }, [copied]);

  const toggleFilter = (f: string) =>
    setFilters((list) =>
      list.includes(f) ? list.filter((x) => x !== f) : [...list, f],
    );

  const trigger = (id: string) =>
    ({
      "aria-haspopup": "menu" as const,
      "aria-expanded": menu === id,
      onClick: () => {
        setMenu((m) => (m === id ? null : id));
      },
    }) as const;

  return (
    <div
      ref={rootRef}
      className="relative flex h-full min-h-[400px] w-full flex-col overflow-hidden bg-white dark:bg-neutral-950"
    >
      <header className="relative z-20 flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200 px-3 sm:px-4 dark:border-neutral-800">
        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <ol className="flex items-center gap-1.5 text-[13px]">
            <li className="flex items-center gap-1.5">
              <a
                href="#"
                className={cx(
                  "inline-flex items-center gap-1.5 rounded-[var(--rb-r-sm,6px)] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100",
                  transition,
                  focus,
                )}
              >
                <House aria-hidden className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Home</span>
              </a>
              <span
                aria-hidden
                className="text-neutral-300 dark:text-neutral-600"
              >
                /
              </span>
            </li>
            <li className="flex min-w-0 items-center gap-1.5">
              <a
                href="#"
                className={cx(
                  "inline-flex items-center gap-1.5 truncate rounded-[var(--rb-r-sm,6px)] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100",
                  transition,
                  focus,
                )}
              >
                <LayoutGrid aria-hidden className="h-3.5 w-3.5 shrink-0" />
                Projects
              </a>
              <span
                aria-hidden
                className="text-neutral-300 dark:text-neutral-600"
              >
                /
              </span>
            </li>
            <li className="min-w-0">
              <span
                aria-current="page"
                className="truncate font-medium text-neutral-900 dark:text-neutral-100"
              >
                Sprint 24
              </span>
            </li>
          </ol>
        </nav>

        <div className="hidden items-center sm:flex">
          <ul className="flex -space-x-2">
            {["NV", "MS", "PP"].map((p) => (
              <li
                key={p}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-600 ring-2 ring-white dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-950"
              >
                {p}
              </li>
            ))}
          </ul>
          <span className="ml-2 text-[12px] text-neutral-500 tabular-nums">
            +8
          </span>
        </div>

        <div className="relative shrink-0" data-menu-root>
          <button
            type="button"
            {...trigger("invite")}
            className={cx(
              "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-2.5 text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 active:scale-[0.97] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800",
              transition,
              focus,
            )}
          >
            <UserPlus aria-hidden className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Invite</span>
          </button>
          <AnimatePresence>
            {menu === "invite" && (
              <motion.div
                {...pop(reduce)}
                className={cx(
                  surface,
                  "absolute top-full right-0 z-30 mt-1.5 w-[260px] origin-top-right p-2.5",
                )}
              >
                <label
                  htmlFor="navbar-2-invite"
                  className="text-[12px] font-medium text-neutral-900 dark:text-neutral-100"
                >
                  Invite to Sprint 24
                </label>
                <div className="mt-1.5 flex gap-1.5">
                  <input
                    id="navbar-2-invite"
                    type="email"
                    placeholder="name@company.com"
                    className={cx(
                      "h-8 min-w-0 flex-1 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-2.5 text-[13px] text-neutral-900 placeholder:text-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100",
                      transition,
                      focus,
                    )}
                  />
                  <button
                    type="button"
                    aria-label="Send invite"
                    className={cx(
                      "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
                      transition,
                      focus,
                    )}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setCopied(true)}
                  className={cx(menuItem, "mt-1.5", transition, focus)}
                >
                  {copied ? (
                    <Check aria-hidden className="h-3.5 w-3.5" />
                  ) : (
                    <Link2 aria-hidden className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Link copied" : "Copy invite link"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative shrink-0" data-menu-root>
          <button
            type="button"
            aria-label="Filter tasks"
            {...trigger("filter")}
            className={cx(
              "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] active:scale-[0.97]",
              filters.length > 0 || menu === "filter"
                ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800",
              transition,
              focus,
            )}
          >
            <ListFilter className="h-3.5 w-3.5" />
          </button>
          <AnimatePresence>
            {menu === "filter" && (
              <motion.div
                {...pop(reduce)}
                role="menu"
                className={cx(
                  surface,
                  "absolute top-full right-0 z-30 mt-1.5 w-[200px] origin-top-right",
                )}
              >
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={filters.includes(f)}
                    onClick={() => toggleFilter(f)}
                    className={cx(menuItem, transition, focus)}
                  >
                    <Check
                      aria-hidden
                      className={cx(
                        "h-3.5 w-3.5 shrink-0",
                        filters.includes(f) ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {f}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative shrink-0" data-menu-root>
          <button
            type="button"
            aria-label="Sort tasks"
            {...trigger("sort")}
            className={cx(
              "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] active:scale-[0.97]",
              menu === "sort"
                ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800",
              transition,
              focus,
            )}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
          <AnimatePresence>
            {menu === "sort" && (
              <motion.div
                {...pop(reduce)}
                role="menu"
                className={cx(
                  surface,
                  "absolute top-full right-0 z-30 mt-1.5 w-[190px] origin-top-right",
                )}
              >
                {SORTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={sort === s.id}
                    onClick={() => {
                      setSort(s.id);
                      setMenu(null);
                    }}
                    className={cx(menuItem, transition, focus)}
                  >
                    <Check
                      aria-hidden
                      className={cx(
                        "h-3.5 w-3.5 shrink-0",
                        sort === s.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {s.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative shrink-0" data-menu-root>
          <button
            type="button"
            aria-label="More actions"
            {...trigger("more")}
            className={cx(
              "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
              transition,
              focus,
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          <AnimatePresence>
            {menu === "more" && (
              <motion.div
                {...pop(reduce)}
                role="menu"
                className={cx(
                  surface,
                  "absolute top-full right-0 z-30 mt-1.5 w-[180px] origin-top-right",
                )}
              >
                <button
                  type="button"
                  role="menuitem"
                  className={cx(menuItem, transition, focus)}
                >
                  <Copy aria-hidden className="h-3.5 w-3.5" />
                  Duplicate sprint
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={cx(menuItem, transition, focus)}
                >
                  <Link2 aria-hidden className="h-3.5 w-3.5" />
                  Copy sprint link
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={cx(
                    menuItem,
                    "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10",
                    transition,
                    focus,
                  )}
                >
                  <Trash2 aria-hidden className="h-3.5 w-3.5" />
                  Archive sprint
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <AnimatePresence>
        {filters.length > 0 && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={
              reduce
                ? { opacity: 0, transition: { duration: 0.12 } }
                : {
                    height: 0,
                    opacity: 0,
                    transition: { duration: 0.14, ease: EASE_OUT },
                  }
            }
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="shrink-0 overflow-hidden border-b border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 sm:px-4">
              <AnimatePresence initial={false} mode="popLayout">
                {filters.map((f) => (
                  <motion.span
                    key={f}
                    layout={!reduce}
                    initial={
                      reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }
                    }
                    animate={{ opacity: 1, scale: 1 }}
                    exit={
                      reduce
                        ? { opacity: 0, transition: { duration: 0.12 } }
                        : {
                            opacity: 0,
                            scale: 0.9,
                            transition: { duration: 0.12, ease: EASE_OUT },
                          }
                    }
                    transition={{ duration: 0.18, ease: EASE_OUT }}
                    className="inline-flex h-7 items-center gap-1 rounded-[var(--rb-r-md,8px)] bg-neutral-100 pr-1 pl-2.5 text-[12px] font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                  >
                    {f}
                    <button
                      type="button"
                      aria-label={`Remove ${f} filter`}
                      onClick={() => toggleFilter(f)}
                      className={cx(
                        "inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-[var(--rb-r-sm,6px)] text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-700 dark:hover:text-neutral-100",
                        transition,
                        focus,
                      )}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
              <button
                type="button"
                onClick={() => setFilters([])}
                className={cx(
                  "ml-1 cursor-pointer rounded-[var(--rb-r-sm,6px)] px-1 text-[12px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100",
                  transition,
                  focus,
                )}
              >
                Clear all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        <p className="mb-2 text-[12px] text-neutral-500">
          Sorted by {SORTS.find((s) => s.id === sort)?.label.toLowerCase()}
          {filters.length > 0 && ` · ${filters.length} filter applied`}
        </p>
        <ul className="space-y-1">
          {ROWS.map((r) => (
            <li
              key={r.name}
              className="flex items-center justify-between gap-3 rounded-[var(--rb-r-md,8px)] bg-neutral-50 px-3 py-2.5 dark:bg-neutral-900/60"
            >
              <span className="min-w-0 truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                {r.name}
              </span>
              <span className="shrink-0 text-[12px] text-neutral-500">
                {r.meta}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
