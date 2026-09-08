"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  CornerDownLeft,
  FileText,
  Search,
  UserRound,
  Workflow,
  type LucideIcon,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

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

type Kind = "Doc" | "Person" | "Workflow";

type Result = {
  id: string;
  kind: Kind;
  title: string;
  subtitle: string;
  facts: { label: string; value: string }[];
  summary: string;
};

const KIND_ICON: Record<Kind, LucideIcon> = {
  Doc: FileText,
  Person: UserRound,
  Workflow: Workflow,
};

const RESULTS: Result[] = [
  {
    id: "r-readiness",
    kind: "Doc",
    title: "Launch readiness review",
    subtitle: "Runbook · Aurora mobile 2.4",
    facts: [
      { label: "Owner", value: "Priya Anand" },
      { label: "Section", value: "Release" },
      { label: "Updated", value: "6m ago" },
    ],
    summary:
      "Gate checklist covering rollout stages, alerting thresholds, and the rollback owner for the 2.4 launch.",
  },
  {
    id: "r-latency",
    kind: "Doc",
    title: "Checkout latency postmortem",
    subtitle: "Incident 4821",
    facts: [
      { label: "Owner", value: "Marcus Reed" },
      { label: "Section", value: "Reliability" },
      { label: "Updated", value: "1h ago" },
    ],
    summary:
      "Root cause of the p95 spike at checkout, the mitigation shipped, and follow-up work to prevent recurrence.",
  },
  {
    id: "r-rollback",
    kind: "Doc",
    title: "Rollback procedure for staged deploys",
    subtitle: "Runbook · Platform",
    facts: [
      { label: "Owner", value: "Priya Anand" },
      { label: "Section", value: "Release" },
      { label: "Updated", value: "3 days ago" },
    ],
    summary:
      "Step-by-step revert for a canary that fails its error gate, including who to page and what to post.",
  },
  {
    id: "r-priya",
    kind: "Person",
    title: "Priya Anand",
    subtitle: "Staff engineer · Release",
    facts: [
      { label: "Team", value: "Release" },
      { label: "Timezone", value: "GMT+1" },
      { label: "Reviews", value: "18" },
    ],
    summary:
      "Owns launch readiness for mobile. Point of contact for rollout gates and staged deploys.",
  },
  {
    id: "r-marcus",
    kind: "Person",
    title: "Marcus Reed",
    subtitle: "Senior engineer · Reliability",
    facts: [
      { label: "Team", value: "Reliability" },
      { label: "Timezone", value: "GMT−5" },
      { label: "Reviews", value: "24" },
    ],
    summary:
      "Runs the incident rotation this week. Best reached in the reliability channel for pages.",
  },
  {
    id: "r-deploy",
    kind: "Workflow",
    title: "Staged deploy to production",
    subtitle: "Runs on merge to main",
    facts: [
      { label: "Last run", value: "Passed" },
      { label: "Duration", value: "6m 40s" },
      { label: "Steps", value: "9" },
    ],
    summary:
      "Promotes a build through canary and full rollout with automatic rollback if error rate exceeds the gate.",
  },
  {
    id: "r-rotate",
    kind: "Workflow",
    title: "Rotate signing keys",
    subtitle: "Runs weekly, Mondays",
    facts: [
      { label: "Last run", value: "Passed" },
      { label: "Duration", value: "48s" },
      { label: "Steps", value: "4" },
    ],
    summary:
      "Issues a fresh signing key, updates the secret store, and revokes the previous key after a grace window.",
  },
  {
    id: "r-backup",
    kind: "Workflow",
    title: "Nightly database backup",
    subtitle: "Runs daily, 02:00 UTC",
    facts: [
      { label: "Last run", value: "Passed" },
      { label: "Duration", value: "11m 02s" },
      { label: "Steps", value: "3" },
    ],
    summary:
      "Snapshots the primary cluster to cold storage and verifies the restore path against a scratch instance.",
  },
];

const FILTERS: { id: "all" | Kind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Doc", label: "Docs" },
  { id: "Person", label: "People" },
  { id: "Workflow", label: "Workflows" },
];

const EXIT_MS = 140;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-[var(--rb-r-sm,6px)] bg-neutral-100 px-1.5 font-mono text-[11px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
      {children}
    </kbd>
  );
}

export default function CommandMenu3() {
  const uid = useId();
  const rootRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const list = useScrollFade<HTMLDivElement>();
  const preview = useScrollFade<HTMLDivElement>();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [open, setOpen] = useState(true);
  const [shown, setShown] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Kind>("all");
  const [activeIndex, setActiveIndex] = useState(0);

  const listboxId = `${uid}-listbox`;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESULTS.filter((r) => {
      if (filter !== "all" && r.kind !== filter) return false;
      if (!q) return true;
      return `${r.title} ${r.subtitle} ${r.summary}`.toLowerCase().includes(q);
    });
  }, [query, filter]);

  const safeIndex = Math.min(activeIndex, Math.max(filtered.length - 1, 0));
  const active = filtered[safeIndex];
  const activeId = active ? `${uid}-${active.id}` : undefined;

  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    const list = listRef.current;
    const row = list?.querySelector<HTMLElement>('[data-active="true"]');
    if (!list || !row) return;
    const listBox = list.getBoundingClientRect();
    const rowBox = row.getBoundingClientRect();
    if (rowBox.top < listBox.top) {
      list.scrollTop -= listBox.top - rowBox.top;
    } else if (rowBox.bottom > listBox.bottom) {
      list.scrollTop += rowBox.bottom - listBox.bottom;
    }
  }, [safeIndex, query, filter]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frameRef.current ?? 0);
      clearTimeout(timerRef.current);
    },
    [],
  );

  const openMenu = useCallback((animate: boolean) => {
    clearTimeout(timerRef.current);
    setOpen(true);
    if (animate) {
      setShown(false);
      frameRef.current = requestAnimationFrame(() => setShown(true));
    } else {
      setShown(true);
    }
  }, []);

  const close = useCallback(() => {
    setShown(false);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
    }, EXIT_MS);
  }, []);

  useEffect(() => {
    const doc = rootRef.current?.ownerDocument ?? document;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openMenu(false);
      }
    };
    doc.addEventListener("keydown", onKeyDown);
    return () => doc.removeEventListener("keydown", onKeyDown);
  }, [openMenu]);

  const run = useCallback(() => {
    setQuery("");
    setActiveIndex(0);
    close();
  }, [close]);

  const move = (delta: number) => {
    const count = filtered.length;
    if (count === 0) return;
    setActiveIndex((safeIndex + delta + count) % count);
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        move(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        move(-1);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(Math.max(filtered.length - 1, 0));
        break;
      case "Enter":
        if (!active) break;
        event.preventDefault();
        run();
        break;
    }
  };

  const onFilterKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    i: number,
  ) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next =
      (i + (event.key === "ArrowRight" ? 1 : -1) + FILTERS.length) %
      FILTERS.length;
    setFilter(FILTERS[next].id);
    setActiveIndex(0);
    const doc = event.currentTarget.ownerDocument;
    doc
      .getElementById(`${uid}-filter-${FILTERS[next].id}`)
      ?.focus({ preventScroll: true });
  };

  const onDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const root = dialogRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const focused = root.ownerDocument.activeElement;
    if (event.shiftKey && focused === first) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!event.shiftKey && focused === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  };

  return (
    <section
      ref={rootRef}
      className="relative flex h-full min-h-[640px] w-full items-center justify-center overflow-hidden bg-white p-4 sm:p-6 dark:bg-neutral-950"
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => openMenu(true)}
        className="inline-flex h-9 w-64 max-w-full cursor-pointer items-center gap-2 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-50 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
      >
        <Search aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">
          Search docs, people, workflows
        </span>
        <Kbd>⌘K</Kbd>
      </button>

      {open && (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close search"
            onClick={close}
            className={cx(
              "absolute inset-0 z-40 cursor-default bg-neutral-950/40 backdrop-blur-[2px] transition-opacity ease-[cubic-bezier(0.23,1,0.32,1)] dark:bg-neutral-950/60",
              shown ? "opacity-100 duration-200" : "opacity-0 duration-[140ms]",
            )}
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${uid}-title`}
            onKeyDown={onDialogKeyDown}
            className={cx(
              "absolute left-1/2 top-[10%] z-50 flex max-h-[80%] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 flex-col overflow-hidden rounded-[var(--rb-r-4xl,18px)] border border-neutral-200/70 bg-white shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)] transition-[opacity,transform] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:scale-100 motion-reduce:transition-opacity dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none",
              shown
                ? "scale-100 opacity-100 duration-200"
                : "scale-[0.97] opacity-0 duration-[140ms]",
            )}
          >
            <h2 id={`${uid}-title`} className="sr-only">
              Search everything
            </h2>

            <div className="flex h-12 shrink-0 items-center gap-3 px-4">
              <Search
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-500"
              />
              <label htmlFor={`${uid}-input`} className="sr-only">
                Search everything
              </label>
              <input
                ref={inputRef}
                id={`${uid}-input`}
                role="combobox"
                aria-expanded="true"
                aria-controls={listboxId}
                aria-activedescendant={activeId}
                aria-autocomplete="list"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onInputKeyDown}
                placeholder="Search everything"
                className="h-9 min-w-0 flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none dark:text-neutral-100 dark:placeholder:text-neutral-500"
              />
            </div>

            <div className="shrink-0 bg-neutral-50 px-4 pb-2 dark:bg-neutral-950/50">
              <div
                role="tablist"
                aria-label="Result type"
                className="inline-flex items-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 p-0.5 dark:bg-neutral-800"
              >
                {FILTERS.map((f, i) => {
                  const selected = filter === f.id;
                  return (
                    <button
                      key={f.id}
                      id={`${uid}-filter-${f.id}`}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => {
                        setFilter(f.id);
                        setActiveIndex(0);
                      }}
                      onKeyDown={(event) => onFilterKeyDown(event, i)}
                      className={cx(
                        "inline-flex h-7 cursor-pointer items-center rounded-[var(--rb-r-sm,6px)] px-2.5 text-[13px] font-medium transition-[transform,background-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]",
                        selected
                          ? "bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
                          : "bg-transparent text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
                      )}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex min-h-0 flex-1 bg-neutral-50 dark:bg-neutral-950/50">
              <div className="relative min-h-0 w-full sm:w-1/2 sm:shrink-0">
                <div
                  ref={(el) => {
                    listRef.current = el;
                    list.ref.current = el;
                  }}
                  onScroll={list.onScroll}
                  className="h-full overflow-y-auto p-1.5"
                >
                  {filtered.length > 0 ? (
                    <div id={listboxId} role="listbox" aria-label="Results">
                      {filtered.map((result, index) => {
                        const Icon = KIND_ICON[result.kind];
                        const selected = index === safeIndex;
                        return (
                          <button
                            key={result.id}
                            id={`${uid}-${result.id}`}
                            role="option"
                            aria-selected={selected}
                            data-active={selected}
                            type="button"
                            tabIndex={-1}
                            onPointerMove={() => setActiveIndex(index)}
                            onMouseDown={(event) => {
                              event.preventDefault();
                              setActiveIndex(index);
                              run();
                            }}
                            className={cx(
                              "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-[var(--rb-r-lg,10px)] px-2.5 py-2 text-left transition-colors duration-150 active:bg-neutral-200 dark:active:bg-neutral-700",
                              selected
                                ? "bg-neutral-100 dark:bg-neutral-800"
                                : "bg-transparent",
                            )}
                          >
                            <Icon
                              aria-hidden="true"
                              className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-500"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                                {result.title}
                              </span>
                              <span className="block truncate text-xs text-neutral-500 dark:text-neutral-500">
                                {result.subtitle}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center px-2.5 py-10 text-center">
                      <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                        No matches in{" "}
                        {filter === "all" ? "anything" : "this type"}
                      </p>
                      <p className="mt-1 max-w-xs text-xs text-neutral-600 dark:text-neutral-400">
                        Try another term, or widen the filter back to
                        everything.
                      </p>
                      <button
                        type="button"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          setQuery("");
                          setFilter("all");
                          setActiveIndex(0);
                          inputRef.current?.focus({ preventScroll: true });
                        }}
                        className="mt-4 inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--rb-r-md,8px)] bg-neutral-100 px-2.5 text-[13px] font-medium text-neutral-700 transition-[transform,background-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-200 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                      >
                        Reset search
                      </button>
                    </div>
                  )}
                </div>
                <div
                  aria-hidden="true"
                  className={cx(
                    "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950/50",
                    list.edges.start ? "opacity-100" : "opacity-0",
                  )}
                />
                <div
                  aria-hidden="true"
                  className={cx(
                    "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950/50",
                    list.edges.end ? "opacity-100" : "opacity-0",
                  )}
                />
              </div>

              <div className="relative m-1.5 ml-0 hidden min-h-0 min-w-0 flex-1 overflow-hidden rounded-[var(--rb-r-2xl,14px)] sm:block">
                <div
                  ref={preview.ref}
                  onScroll={preview.onScroll}
                  aria-live="polite"
                  className="h-full overflow-y-auto bg-white p-4 dark:bg-neutral-900"
                >
                  {active ? (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                        {active.kind}
                      </p>
                      <h3 className="mt-1 text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
                        {active.title}
                      </h3>
                      <p className="mt-0.5 text-[13px] text-neutral-600 dark:text-neutral-400">
                        {active.subtitle}
                      </p>
                      <dl className="mt-4 flex flex-col gap-1.5">
                        {active.facts.map((fact) => (
                          <div
                            key={fact.label}
                            className="flex items-center justify-between gap-4 rounded-[var(--rb-r-lg,10px)] bg-neutral-50 px-3 py-2 dark:bg-neutral-800/50"
                          >
                            <dt className="shrink-0 text-xs text-neutral-500 dark:text-neutral-500">
                              {fact.label}
                            </dt>
                            <dd className="min-w-0 truncate text-[13px] tabular-nums text-neutral-900 dark:text-neutral-100">
                              {fact.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      <p className="mt-4 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {active.summary}
                      </p>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-xs text-neutral-500 dark:text-neutral-500">
                      Nothing to preview yet.
                    </div>
                  )}
                </div>
                <div
                  aria-hidden="true"
                  className={cx(
                    "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
                    preview.edges.start ? "opacity-100" : "opacity-0",
                  )}
                />
                <div
                  aria-hidden="true"
                  className={cx(
                    "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
                    preview.edges.end ? "opacity-100" : "opacity-0",
                  )}
                />
              </div>
            </div>

            <div className="flex h-10 shrink-0 items-center gap-4 bg-neutral-50 px-4 text-[11px] text-neutral-500 dark:bg-neutral-950/50 dark:text-neutral-500">
              <span className="hidden items-center gap-1.5 sm:inline-flex">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                to move
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Kbd>
                  <CornerDownLeft aria-hidden="true" className="h-3 w-3" />
                </Kbd>
                to open
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Kbd>esc</Kbd>
                to close
              </span>
              <span className="ml-auto shrink-0 tabular-nums">
                {filtered.length} of {RESULTS.length}
              </span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
