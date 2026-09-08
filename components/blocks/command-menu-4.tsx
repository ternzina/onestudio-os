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
  type Ref,
} from "react";
import {
  ArrowLeft,
  Archive,
  ChevronDown,
  CornerDownLeft,
  RefreshCw,
  Search,
  UserPlus,
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

type Field =
  | { id: string; label: string; kind: "text"; placeholder: string }
  | { id: string; label: string; kind: "select"; options: string[] };

type Action = {
  id: string;
  title: string;
  detail: string;
  icon: LucideIcon;
  cta: string;
  destructive?: boolean;
  fields: Field[];
  summary: (v: Record<string, string>) => string;
};

const ACTIONS: Action[] = [
  {
    id: "invite",
    title: "Invite a teammate",
    detail: "Add someone to Northwind",
    icon: UserPlus,
    cta: "Send invite",
    fields: [
      {
        id: "email",
        label: "Email address",
        kind: "text",
        placeholder: "name@company.com",
      },
      {
        id: "role",
        label: "Role",
        kind: "select",
        options: ["Viewer", "Editor", "Admin"],
      },
    ],
    summary: (v) =>
      `Invite ${v.email || "this person"} to Northwind as ${(v.role || "a member").toLowerCase()}.`,
  },
  {
    id: "rerun",
    title: "Rerun a workflow",
    detail: "Trigger a fresh run",
    icon: RefreshCw,
    cta: "Start run",
    fields: [
      {
        id: "workflow",
        label: "Workflow",
        kind: "select",
        options: ["Staged deploy", "Rotate signing keys", "Nightly backup"],
      },
      { id: "ref", label: "Git ref", kind: "text", placeholder: "main" },
    ],
    summary: (v) => `Run ${v.workflow || "a workflow"} on ${v.ref || "main"}.`,
  },
  {
    id: "archive",
    title: "Archive a project",
    detail: "Hide it from the workspace",
    icon: Archive,
    cta: "Archive project",
    destructive: true,
    fields: [
      {
        id: "project",
        label: "Project",
        kind: "select",
        options: [
          "Ledger billing",
          "Relay notifications",
          "Beacon status page",
        ],
      },
    ],
    summary: (v) =>
      `Archive ${v.project || "a project"}. Members lose access until it is restored.`,
  },
];

const DEFAULT_VALUES: Record<string, Record<string, string>> = {
  invite: { email: "erin.walsh@northwind.io", role: "Editor" },
  rerun: { workflow: "Staged deploy", ref: "main" },
  archive: { project: "Ledger billing" },
};

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

export default function CommandMenu4() {
  const uid = useId();
  const rootRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const list = useScrollFade<HTMLDivElement>();
  const formPane = useScrollFade<HTMLDivElement>();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstFieldRef = useRef<HTMLInputElement | HTMLSelectElement>(null);
  const frameRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [open, setOpen] = useState(true);
  const [shown, setShown] = useState(true);
  const [stage, setStage] = useState<"select" | "form" | "confirm">("form");
  const [actionId, setActionId] = useState<string>("invite");
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [values, setValues] = useState<Record<string, Record<string, string>>>(
    () => JSON.parse(JSON.stringify(DEFAULT_VALUES)),
  );

  const listboxId = `${uid}-listbox`;
  const action = ACTIONS.find((a) => a.id === actionId) ?? ACTIONS[0];
  const actionValues = values[actionId] ?? {};

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ACTIONS;
    return ACTIONS.filter((a) =>
      `${a.title} ${a.detail}`.toLowerCase().includes(q),
    );
  }, [query]);
  const activeAction = filtered[activeIndex];
  const activeId = activeAction ? `${uid}-${activeAction.id}` : undefined;

  useEffect(() => {
    if (!open) return;
    if (stage === "select") inputRef.current?.focus({ preventScroll: true });
    else firstFieldRef.current?.focus({ preventScroll: true });
  }, [open, stage]);

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
  }, [activeIndex, query, stage]);

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

  const pick = useCallback((next: Action) => {
    setActionId(next.id);
    setStage("form");
    setQuery("");
  }, []);

  const setField = (fieldId: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [actionId]: { ...prev[actionId], [fieldId]: value },
    }));
  };

  const move = (delta: number) => {
    const count = filtered.length;
    if (count === 0) return;
    setActiveIndex((i) => (i + delta + count) % count);
  };

  const onSelectKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
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
        if (!activeAction) break;
        event.preventDefault();
        pick(activeAction);
        break;
    }
  };

  const onSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (stage === "form") setStage("confirm");
    else close();
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
      className="relative flex h-full min-h-[400px] w-full items-center justify-center overflow-hidden bg-white p-4 sm:p-6 dark:bg-neutral-950"
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => openMenu(true)}
        className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-50 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
      >
        Run an action
        <Kbd>⌘K</Kbd>
      </button>

      {open && (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close menu"
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
              "absolute left-1/2 top-[12%] z-50 flex max-h-[76%] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 flex-col overflow-hidden rounded-[var(--rb-r-4xl,18px)] border border-neutral-200/70 bg-white shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)] transition-[opacity,transform] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:scale-100 motion-reduce:transition-opacity dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none",
              shown
                ? "scale-100 opacity-100 duration-200"
                : "scale-[0.97] opacity-0 duration-[140ms]",
            )}
          >
            {stage === "select" ? (
              <>
                <h2 id={`${uid}-title`} className="sr-only">
                  Run an action
                </h2>
                <div className="flex h-12 shrink-0 items-center gap-3 px-4">
                  <Search
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-500"
                  />
                  <label htmlFor={`${uid}-input`} className="sr-only">
                    Find an action
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
                    onKeyDown={onSelectKeyDown}
                    placeholder="Find an action"
                    className="h-9 min-w-0 flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none dark:text-neutral-100 dark:placeholder:text-neutral-500"
                  />
                </div>
                <div className="relative min-h-0 flex-1">
                  <div
                    ref={(el) => {
                      listRef.current = el;
                      list.ref.current = el;
                    }}
                    onScroll={list.onScroll}
                    className="h-full overflow-y-auto bg-neutral-50 p-1.5 dark:bg-neutral-950/50"
                  >
                    {filtered.length > 0 ? (
                      <div id={listboxId} role="listbox" aria-label="Actions">
                        {filtered.map((item, index) => {
                          const Icon = item.icon;
                          const selected = index === activeIndex;
                          return (
                            <button
                              key={item.id}
                              id={`${uid}-${item.id}`}
                              role="option"
                              aria-selected={selected}
                              data-active={selected}
                              type="button"
                              tabIndex={-1}
                              onPointerMove={() => setActiveIndex(index)}
                              onMouseDown={(event) => {
                                event.preventDefault();
                                pick(item);
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
                                  {item.title}
                                </span>
                                <span className="block truncate text-xs text-neutral-500 dark:text-neutral-500">
                                  {item.detail}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center px-2.5 py-8 text-center">
                        <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                          No action matches “{query.trim()}”
                        </p>
                        <button
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            setQuery("");
                            setActiveIndex(0);
                            inputRef.current?.focus({ preventScroll: true });
                          }}
                          className="mt-3 inline-flex h-8 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 px-2.5 text-[13px] font-medium text-neutral-700 transition-[transform,background-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-200 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                        >
                          Clear search
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
              </>
            ) : (
              <form
                onSubmit={onSubmit}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="flex h-12 shrink-0 items-center gap-3 px-4">
                  <button
                    type="button"
                    aria-label={
                      stage === "confirm"
                        ? "Back to details"
                        : "Back to actions"
                    }
                    onClick={() =>
                      stage === "confirm"
                        ? setStage("form")
                        : setStage("select")
                    }
                    className="-ml-1.5 inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-sm,6px)] bg-neutral-100 text-neutral-700 transition-[transform,background-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-200 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                  >
                    <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                  </button>
                  <h2
                    id={`${uid}-title`}
                    className="min-w-0 flex-1 truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100"
                  >
                    {action.title}
                  </h2>
                  <span className="shrink-0 text-[11px] tabular-nums text-neutral-500 dark:text-neutral-500">
                    {stage === "form" ? "Step 1 of 2" : "Step 2 of 2"}
                  </span>
                </div>

                <div className="relative min-h-0 flex-1">
                  <div
                    ref={formPane.ref}
                    onScroll={formPane.onScroll}
                    className="h-full overflow-y-auto px-4 pb-4"
                  >
                    {stage === "form" ? (
                      <div className="flex flex-col gap-4">
                        {action.fields.map((field, i) => (
                          <div key={field.id} className="flex flex-col gap-1.5">
                            <label
                              htmlFor={`${uid}-${field.id}`}
                              className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100"
                            >
                              {field.label}
                            </label>
                            {field.kind === "text" ? (
                              <input
                                ref={
                                  i === 0
                                    ? (firstFieldRef as Ref<HTMLInputElement>)
                                    : undefined
                                }
                                id={`${uid}-${field.id}`}
                                value={actionValues[field.id] ?? ""}
                                onChange={(e) =>
                                  setField(field.id, e.target.value)
                                }
                                placeholder={field.placeholder}
                                className="h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900 transition-colors duration-150 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                              />
                            ) : (
                              <div className="relative">
                                <select
                                  ref={
                                    i === 0
                                      ? (firstFieldRef as Ref<HTMLSelectElement>)
                                      : undefined
                                  }
                                  id={`${uid}-${field.id}`}
                                  value={
                                    actionValues[field.id] ?? field.options[0]
                                  }
                                  onChange={(e) =>
                                    setField(field.id, e.target.value)
                                  }
                                  className="h-9 w-full cursor-pointer appearance-none rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pl-3 pr-8 text-sm text-neutral-900 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                                >
                                  {field.options.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown
                                  aria-hidden="true"
                                  className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-500"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <p className="text-[13px] leading-relaxed text-neutral-900 dark:text-neutral-100">
                          {action.summary(actionValues)}
                        </p>
                        <dl className="mt-3 flex flex-col gap-1.5">
                          {action.fields.map((field) => (
                            <div
                              key={field.id}
                              className="flex items-center justify-between gap-4 rounded-[var(--rb-r-lg,10px)] bg-neutral-50 px-3 py-2 dark:bg-neutral-800/50"
                            >
                              <dt className="shrink-0 text-xs text-neutral-500 dark:text-neutral-500">
                                {field.label}
                              </dt>
                              <dd className="min-w-0 truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                                {actionValues[field.id] || "-"}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    )}
                  </div>
                  <div
                    aria-hidden="true"
                    className={cx(
                      "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
                      formPane.edges.start ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div
                    aria-hidden="true"
                    className={cx(
                      "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
                      formPane.edges.end ? "opacity-100" : "opacity-0",
                    )}
                  />
                </div>

                <div className="flex h-14 shrink-0 items-center gap-4 bg-neutral-50 px-4 text-[11px] text-neutral-500 dark:bg-neutral-950/50 dark:text-neutral-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Kbd>
                      <CornerDownLeft aria-hidden="true" className="h-3 w-3" />
                    </Kbd>
                    {stage === "form" ? "to review" : "to confirm"}
                  </span>
                  <span className="hidden items-center gap-1.5 sm:inline-flex">
                    <Kbd>esc</Kbd>
                    to close
                  </span>
                  {stage === "form" ? (
                    <button
                      type="submit"
                      className="ml-auto inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3 text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] transition-[transform,background-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                    >
                      Review
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={close}
                      className={cx(
                        "ml-auto inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] px-3 text-sm font-medium text-white transition-[transform,background-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
                        action.destructive
                          ? "bg-red-600 hover:bg-red-700 focus-visible:outline-red-600 dark:hover:bg-red-500"
                          : "bg-[var(--rb-accent,oklch(20.5%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-neutral-900 dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]",
                      )}
                    >
                      {action.cta}
                    </button>
                  )}
                </div>
              </form>
            )}

            {stage === "select" && (
              <div className="flex h-10 shrink-0 items-center gap-4 bg-neutral-50 px-4 text-[11px] text-neutral-500 dark:bg-neutral-950/50 dark:text-neutral-500">
                <span className="inline-flex items-center gap-1.5">
                  <Kbd>
                    <CornerDownLeft aria-hidden="true" className="h-3 w-3" />
                  </Kbd>
                  to choose
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Kbd>esc</Kbd>
                  to close
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
