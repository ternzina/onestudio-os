"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Archive,
  Blocks,
  Check,
  ChevronsUpDown,
  FileText,
  FolderKanban,
  Inbox,
  LayoutGrid,
  Plus,
  Search,
  Settings,
  Users,
  Workflow,
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

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity] duration-150 ease-out";

const workspaces = [
  { name: "Northwind Logistics", plan: "Enterprise", mono: "N" },
  { name: "Atlas Service Desk", plan: "Team", mono: "A" },
  { name: "Harbor Finance", plan: "Team", mono: "H" },
];

const groups = [
  {
    label: "Pinned",
    items: [
      { label: "Escalation runbook", icon: FileText },
      { label: "Quarter-end compliance review", icon: FolderKanban },
      { label: "Vendor renewal tracker", icon: Archive },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Boards", icon: LayoutGrid, current: true },
      { label: "Inbox", icon: Inbox, badge: "7" },
      { label: "Projects", icon: FolderKanban },
      { label: "People", icon: Users },
      { label: "Documents", icon: FileText },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Automations", icon: Workflow },
      { label: "Integrations", icon: Blocks, badge: "3" },
      { label: "Settings", icon: Settings },
    ],
  },
];

export default function AppSidebar3() {
  const [active, setActive] = useState(0);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const nav = useScrollFade<HTMLElement>();
  const switcherRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeSwitcher = (restoreFocus: boolean) => {
    setSwitcherOpen(false);
    setShown(false);
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!switcherOpen) return;
    const doc = switcherRef.current?.ownerDocument ?? document;
    const frame = requestAnimationFrame(() => setShown(true));

    const onPointerDown = (event: PointerEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) {
        closeSwitcher(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSwitcher(true);
        return;
      }
      const items = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>(
          '[role="menuitem"], [role="menuitemradio"]',
        ) ?? [],
      );
      if (items.length === 0) return;
      const index = items.indexOf(doc.activeElement as HTMLElement);
      if (event.key === "ArrowDown") {
        event.preventDefault();
        items[index < 0 || index === items.length - 1 ? 0 : index + 1]?.focus({
          preventScroll: true,
        });
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        items[index <= 0 ? items.length - 1 : index - 1]?.focus({
          preventScroll: true,
        });
      } else if (event.key === "Home") {
        event.preventDefault();
        items[0]?.focus({ preventScroll: true });
      } else if (event.key === "End") {
        event.preventDefault();
        items[items.length - 1]?.focus({ preventScroll: true });
      }
    };

    doc.addEventListener("pointerdown", onPointerDown);
    doc.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      doc.removeEventListener("pointerdown", onPointerDown);
      doc.removeEventListener("keydown", onKeyDown);
    };
  }, [switcherOpen]);

  const workspace = workspaces[active];

  return (
    <div className="relative flex h-full min-h-[640px] w-full overflow-hidden bg-white dark:bg-neutral-950">
      <aside className="flex w-64 shrink-0 flex-col bg-neutral-50 dark:bg-neutral-900">
        <div ref={switcherRef} className="relative flex h-14 shrink-0 px-2">
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={switcherOpen}
            onClick={() =>
              switcherOpen ? closeSwitcher(false) : setSwitcherOpen(true)
            }
            className={cx(
              "my-auto flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-[var(--rb-r-lg,10px)] bg-white px-1 text-left hover:bg-neutral-100 active:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:active:bg-neutral-600",
              transition,
              focus,
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]">
              {workspace.mono}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                {workspace.name}
              </span>
              <span className="block truncate text-xs text-neutral-500 dark:text-neutral-500">
                {workspace.plan}
              </span>
            </span>
            <ChevronsUpDown
              aria-hidden="true"
              className="mr-1 h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-500"
            />
          </button>

          {switcherOpen && (
            <div
              ref={menuRef}
              role="menu"
              aria-label="Switch workspace"
              className={cx(
                "absolute left-2 right-2 top-[calc(100%-0.25rem)] z-30 origin-top rounded-[var(--rb-r-2xl,14px)] bg-white p-1 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.10)] transition-[opacity,transform] duration-150 ease-out dark:bg-neutral-800 dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.5)]",
                shown ? "scale-100 opacity-100" : "scale-[0.98] opacity-0",
              )}
            >
              {workspaces.map((ws, i) => (
                <button
                  key={ws.name}
                  type="button"
                  role="menuitemradio"
                  aria-checked={i === active}
                  onClick={() => {
                    setActive(i);
                    closeSwitcher(true);
                  }}
                  className={cx(
                    "flex h-9 w-full cursor-pointer items-center gap-2 rounded-[var(--rb-r-lg,10px)] px-1 text-left hover:bg-neutral-100 active:bg-neutral-200 dark:hover:bg-neutral-700 dark:active:bg-neutral-600",
                    transition,
                    focus,
                  )}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--rb-r-sm,6px)] bg-neutral-200 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                    {ws.mono}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                    {ws.name}
                  </span>
                  {i === active && (
                    <Check
                      aria-hidden="true"
                      className="mr-1 h-4 w-4 shrink-0 text-neutral-900 dark:text-neutral-100"
                    />
                  )}
                </button>
              ))}
              <div className="h-1" />
              <button
                type="button"
                role="menuitem"
                onClick={() => closeSwitcher(true)}
                className={cx(
                  "flex h-8 w-full cursor-pointer items-center gap-2 rounded-[var(--rb-r-lg,10px)] px-2 text-left text-[13px] text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 dark:active:bg-neutral-600",
                  transition,
                  focus,
                )}
              >
                <Plus
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-500"
                />
                Create workspace
              </button>
            </div>
          )}
        </div>

        <div className="px-2 pb-2">
          <label className="relative flex items-center">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 h-4 w-4 text-neutral-500 dark:text-neutral-500"
            />
            <input
              type="search"
              placeholder={`Search ${workspace.name.split(" ")[0]}`}
              aria-label="Search this workspace"
              className={cx(
                "h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pl-9 pr-3 text-[13px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white",
                transition,
                focus,
              )}
            />
          </label>
        </div>

        <div className="relative min-h-0 flex-1">
          <nav
            ref={nav.ref}
            onScroll={nav.onScroll}
            aria-label="Primary"
            className="h-full space-y-4 overflow-y-auto px-2 pb-3"
          >
            {groups.map((group) => (
              <div key={group.label}>
                <p className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const current = "current" in item && item.current;
                    const badge = "badge" in item ? item.badge : undefined;
                    return (
                      <li key={item.label}>
                        <a
                          href="#boards"
                          aria-current={current ? "page" : undefined}
                          className={cx(
                            "flex h-8 cursor-pointer items-center gap-2 rounded-[var(--rb-r-md,8px)] px-3 text-[13px] active:bg-neutral-200 dark:active:bg-neutral-700",
                            current
                              ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                            transition,
                            focus,
                          )}
                        >
                          <Icon
                            aria-hidden="true"
                            className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-500"
                          />
                          <span className="min-w-0 flex-1 truncate">
                            {item.label}
                          </span>
                          {badge && (
                            <span className="text-xs tabular-nums text-neutral-500 dark:text-neutral-500">
                              {badge}
                            </span>
                          )}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              nav.edges.start ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              nav.edges.end ? "opacity-100" : "opacity-0",
            )}
          />
        </div>

        <div className="shrink-0 bg-neutral-100/70 p-2 dark:bg-neutral-800/40">
          <div className="flex h-11 items-center gap-2.5 rounded-[var(--rb-r-lg,10px)] px-1">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
              DM
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                Dana Mireles
              </p>
              <p className="truncate text-xs text-neutral-500 dark:text-neutral-500">
                Admin
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
