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
  ArrowLeft,
  BellOff,
  CalendarClock,
  Check,
  ChevronRight,
  Clock,
  Copy,
  CornerDownLeft,
  FolderGit2,
  Keyboard,
  Monitor,
  Moon,
  Palette,
  Search,
  Sun,
  UserCircle2,
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

type Item = {
  id: string;
  title: string;
  detail?: string;
  icon: LucideIcon;
  to?: "project" | "theme" | "status";
};

type PageId = "root" | "project" | "theme" | "status";

type Page = {
  id: PageId;
  title: string;
  placeholder: string;
  items: Item[];
};

const PROJECTS: Item[] = [
  {
    id: "p-northwind",
    title: "Northwind",
    detail: "Updated 4m ago",
    icon: FolderGit2,
  },
  {
    id: "p-aurora",
    title: "Aurora mobile",
    detail: "Updated 1h ago",
    icon: FolderGit2,
  },
  {
    id: "p-ledger",
    title: "Ledger billing",
    detail: "Updated yesterday",
    icon: FolderGit2,
  },
  {
    id: "p-atlas",
    title: "Atlas search platform",
    detail: "Updated 2 days ago",
    icon: FolderGit2,
  },
  {
    id: "p-relay",
    title: "Relay notifications",
    detail: "Updated 3 days ago",
    icon: FolderGit2,
  },
  {
    id: "p-vault",
    title: "Vault access control",
    detail: "Updated last week",
    icon: FolderGit2,
  },
];

const PAGES: Record<PageId, Page> = {
  root: {
    id: "root",
    title: "Home",
    placeholder: "Search or run a command",
    items: [
      {
        id: "switch-project",
        title: "Switch project",
        icon: FolderGit2,
        to: "project",
      },
      { id: "set-theme", title: "Change theme", icon: Palette, to: "theme" },
      {
        id: "set-status",
        title: "Set your status",
        icon: UserCircle2,
        to: "status",
      },
      { id: "copy-link", title: "Copy link to this view", icon: Copy },
      { id: "shortcuts", title: "Open keyboard shortcuts", icon: Keyboard },
    ],
  },
  project: {
    id: "project",
    title: "Switch project",
    placeholder: "Find a project",
    items: PROJECTS,
  },
  theme: {
    id: "theme",
    title: "Change theme",
    placeholder: "Choose a theme",
    items: [
      {
        id: "t-system",
        title: "System",
        detail: "Follows your device",
        icon: Monitor,
      },
      { id: "t-light", title: "Light", icon: Sun },
      { id: "t-dark", title: "Dark", icon: Moon },
    ],
  },
  status: {
    id: "status",
    title: "Set your status",
    placeholder: "Choose a status",
    items: [
      { id: "s-active", title: "Active", icon: UserCircle2 },
      {
        id: "s-away",
        title: "Away",
        detail: "Clears when you return",
        icon: Clock,
      },
      {
        id: "s-dnd",
        title: "Do not disturb",
        detail: "Mutes notifications",
        icon: BellOff,
      },
      {
        id: "s-meeting",
        title: "In a meeting",
        detail: "Clears after 1 hour",
        icon: CalendarClock,
      },
    ],
  },
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

export default function CommandMenu2() {
  const uid = useId();
  const rootRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const list = useScrollFade<HTMLDivElement>();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [open, setOpen] = useState(true);
  const [shown, setShown] = useState(true);
  const [stack, setStack] = useState<PageId[]>(["root"]);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const [project, setProject] = useState("Northwind");
  const [theme, setTheme] = useState("System");
  const [status, setStatus] = useState("Active");

  const pageId = stack[stack.length - 1];
  const page = PAGES[pageId];
  const nested = stack.length > 1;
  const listboxId = `${uid}-listbox`;

  const chosen =
    pageId === "project"
      ? project
      : pageId === "theme"
        ? theme
        : pageId === "status"
          ? status
          : undefined;

  const detailFor = useCallback(
    (item: Item) => {
      if (item.to === "project") return `Currently ${project}`;
      if (item.to === "theme") return `Currently ${theme.toLowerCase()}`;
      if (item.to === "status") return `Currently ${status.toLowerCase()}`;
      return item.detail;
    },
    [project, theme, status],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return page.items;
    return page.items.filter((item) =>
      `${item.title} ${item.detail ?? ""}`.toLowerCase().includes(q),
    );
  }, [page, query]);

  const activeItem = filtered[activeIndex];
  const activeId = activeItem ? `${uid}-${activeItem.id}` : undefined;

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
  }, [activeIndex, query, pageId]);

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
      setStack(["root"]);
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

  const goBack = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
    setQuery("");
    setActiveIndex(0);
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const select = useCallback(
    (item: Item) => {
      if (item.to) {
        setStack((s) => [...s, item.to as PageId]);
        setQuery("");
        setActiveIndex(0);
        inputRef.current?.focus({ preventScroll: true });
        return;
      }
      if (pageId === "project") setProject(item.title);
      if (pageId === "theme") setTheme(item.title);
      if (pageId === "status") setStatus(item.title);
      setQuery("");
      setActiveIndex(0);
      close();
    },
    [close, pageId],
  );

  const move = (delta: number) => {
    setActiveIndex((i) => {
      const count = filtered.length;
      if (count === 0) return 0;
      return (i + delta + count) % count;
    });
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
        if (!activeItem) break;
        event.preventDefault();
        select(activeItem);
        break;
      case "Backspace":
        if (query !== "" || !nested) break;
        event.preventDefault();
        goBack();
        break;
    }
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
      className="relative flex h-full min-h-[480px] w-full items-center justify-center overflow-hidden bg-white p-4 sm:p-6 dark:bg-neutral-950"
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
          Search or run a command
        </span>
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
              "absolute left-1/2 top-[12%] z-50 flex max-h-[76%] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 flex-col overflow-hidden rounded-[var(--rb-r-4xl,18px)] border border-neutral-200/70 bg-white shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)] transition-[opacity,transform] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:scale-100 motion-reduce:transition-opacity dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none",
              shown
                ? "scale-100 opacity-100 duration-200"
                : "scale-[0.97] opacity-0 duration-[140ms]",
            )}
          >
            <h2 id={`${uid}-title`} className="sr-only">
              {page.title}
            </h2>

            <div className="flex h-12 shrink-0 items-center gap-3 px-4">
              <Search
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-500"
              />
              {nested && (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex h-6 max-w-[9rem] shrink-0 cursor-pointer items-center gap-1 rounded-[var(--rb-r-sm,6px)] bg-neutral-100 pl-1.5 pr-2 text-xs font-medium text-neutral-700 transition-[transform,background-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-200 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                >
                  <ArrowLeft aria-hidden="true" className="h-3 w-3 shrink-0" />
                  <span className="truncate">{page.title}</span>
                  <span className="sr-only">: go back</span>
                </button>
              )}
              <label htmlFor={`${uid}-input`} className="sr-only">
                {page.placeholder}
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
                placeholder={page.placeholder}
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
                  <div id={listboxId} role="listbox" aria-label={page.title}>
                    {filtered.map((item, index) => {
                      const Icon = item.icon;
                      const selected = index === activeIndex;
                      const detail = detailFor(item);
                      const isChosen = chosen === item.title;
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
                            setActiveIndex(index);
                            select(item);
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
                            {detail && (
                              <span className="block truncate text-xs text-neutral-500 dark:text-neutral-500">
                                {detail}
                              </span>
                            )}
                          </span>
                          {isChosen ? (
                            <Check
                              aria-hidden="true"
                              className="h-4 w-4 shrink-0 text-neutral-900 dark:text-neutral-100"
                            />
                          ) : item.to ? (
                            <ChevronRight
                              aria-hidden="true"
                              className="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-600"
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center px-2.5 py-10 text-center">
                    <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                      Nothing here matches “{query.trim()}”
                    </p>
                    <p className="mt-1 max-w-xs text-xs text-neutral-600 dark:text-neutral-400">
                      Clear the search to see everything on this page.
                    </p>
                    <button
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        setQuery("");
                        setActiveIndex(0);
                        inputRef.current?.focus({ preventScroll: true });
                      }}
                      className="mt-4 inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--rb-r-md,8px)] bg-neutral-100 px-2.5 text-[13px] font-medium text-neutral-700 transition-[transform,background-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-200 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
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

            <div className="flex h-10 shrink-0 items-center gap-4 bg-neutral-50 px-4 text-[11px] text-neutral-500 dark:bg-neutral-950/50 dark:text-neutral-500">
              <span className="inline-flex items-center gap-1.5">
                <Kbd>
                  <CornerDownLeft aria-hidden="true" className="h-3 w-3" />
                </Kbd>
                to select
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Kbd>esc</Kbd>
                to close
              </span>
              {nested && (
                <span className="ml-auto inline-flex shrink-0 items-center gap-1.5">
                  <Kbd>⌫</Kbd>
                  to go back
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
