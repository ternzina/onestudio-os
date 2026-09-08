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
  CreditCard,
  Download,
  MessageSquareText,
  Search,
  SearchX,
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

type Command = {
  id: string;
  title: string;
  detail: string;
  shortcut: string;
  icon: LucideIcon;
};

const COMMANDS: Command[] = [
  {
    id: "invite",
    title: "Invite a teammate",
    detail: "Add someone to the workspace",
    shortcut: "I",
    icon: UserPlus,
  },
  {
    id: "billing",
    title: "Open billing settings",
    detail: "Plan, invoices, and payment method",
    shortcut: "B",
    icon: CreditCard,
  },
  {
    id: "export",
    title: "Export usage report",
    detail: "Download last month as a CSV",
    shortcut: "E",
    icon: Download,
  },
];

const SUGGESTIONS = ["Billing settings", "Invite a teammate", "Usage report"];

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

export default function CommandMenu5() {
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
  const [query, setQuery] = useState("quarterly burn rate by team");
  const [activeIndex, setActiveIndex] = useState(0);

  const listboxId = `${uid}-listbox`;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter((c) =>
      `${c.title} ${c.detail}`.toLowerCase().includes(q),
    );
  }, [query]);
  const empty = filtered.length === 0;
  const trimmed = query.trim();
  const safeIndex = Math.min(activeIndex, Math.max(filtered.length - 1, 0));
  const activeCommand = filtered[safeIndex];
  const activeId = activeCommand ? `${uid}-${activeCommand.id}` : undefined;

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
  }, [safeIndex, query]);

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
        event.preventDefault();
        run();
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
      className="relative flex h-full min-h-[560px] w-full items-center justify-center overflow-hidden bg-white p-4 sm:p-6 dark:bg-neutral-950"
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
        <span className="min-w-0 flex-1 truncate text-left">Search or ask</span>
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
              "absolute left-1/2 top-[12%] z-50 flex max-h-[80%] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 flex-col overflow-hidden rounded-[var(--rb-r-4xl,18px)] border border-neutral-200/70 bg-white shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)] transition-[opacity,transform] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:scale-100 motion-reduce:transition-opacity dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none",
              shown
                ? "scale-100 opacity-100 duration-200"
                : "scale-[0.97] opacity-0 duration-[140ms]",
            )}
          >
            <h2 id={`${uid}-title`} className="sr-only">
              Search or ask
            </h2>
            <div className="flex h-12 shrink-0 items-center gap-3 px-4">
              <Search
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-500"
              />
              <label htmlFor={`${uid}-input`} className="sr-only">
                Search or ask
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
                placeholder="Search or ask"
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
                className="h-full overflow-y-auto bg-neutral-50 dark:bg-neutral-950/50"
              >
                {empty ? (
                  <div className="flex flex-col items-center px-6 pb-6 pt-8 text-center sm:pt-10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                      <SearchX
                        aria-hidden="true"
                        className="h-5 w-5 text-neutral-500 dark:text-neutral-500"
                      />
                    </div>
                    <p className="mt-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      No commands match
                    </p>
                    <p className="mt-1 max-w-sm text-xs text-neutral-600 dark:text-neutral-400">
                      Nothing in this workspace matches that. Ask the assistant
                      to answer it from your data instead.
                    </p>
                    <button
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        run();
                      }}
                      className="mt-4 inline-flex h-9 max-w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3 text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] transition-[transform,background-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                    >
                      <MessageSquareText
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0"
                      />
                      <span className="truncate">Ask about “{trimmed}”</span>
                    </button>

                    <p className="mt-6 text-[11px] font-medium uppercase sm:mt-8 tracking-wider text-neutral-500 dark:text-neutral-500">
                      Try instead
                    </p>
                    <div className="mt-2 flex flex-wrap justify-center gap-2">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            setQuery(s);
                            setActiveIndex(0);
                            inputRef.current?.focus({ preventScroll: true });
                          }}
                          className="inline-flex h-8 cursor-pointer items-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 px-2.5 text-[13px] font-medium text-neutral-700 transition-[transform,background-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-200 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    id={listboxId}
                    role="listbox"
                    aria-label="Commands"
                    className="p-1.5"
                  >
                    {filtered.map((command, index) => {
                      const Icon = command.icon;
                      const selected = index === safeIndex;
                      return (
                        <button
                          key={command.id}
                          id={`${uid}-${command.id}`}
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
                              {command.title}
                            </span>
                            <span className="block truncate text-xs text-neutral-500 dark:text-neutral-500">
                              {command.detail}
                            </span>
                          </span>
                          <Kbd>{command.shortcut}</Kbd>
                        </button>
                      );
                    })}
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
                {empty ? "to ask" : "to run"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Kbd>esc</Kbd>
                to close
              </span>
              <span className="ml-auto shrink-0 tabular-nums">
                {filtered.length} of {COMMANDS.length}
              </span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
