"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  Copy,
  FileText,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
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

type TreeNode = {
  id: string;
  label: string;
  children?: TreeNode[];
};

const tree: TreeNode[] = [
  {
    id: "customer-ops",
    label: "Customer operations",
    children: [
      { id: "handoff", label: "Enterprise handoff checklist" },
      { id: "escalation", label: "Escalation runbook" },
      { id: "severity", label: "Severity matrix" },
      {
        id: "field",
        label: "North America field escalation protocol and exception notes",
      },
    ],
  },
  {
    id: "finance",
    label: "Finance close",
    children: [
      { id: "q4", label: "Q4 recognition memo" },
      { id: "vendors", label: "Vendor accrual schedule" },
      { id: "deferred", label: "Deferred revenue policy" },
      { id: "refunds", label: "Refund reconciliation" },
    ],
  },
  {
    id: "compliance",
    label: "Compliance",
    children: [
      { id: "soc", label: "SOC evidence index" },
      { id: "access", label: "Access review notes" },
    ],
  },
  {
    id: "templates",
    label: "Templates",
    children: [
      { id: "incident", label: "Incident report" },
      { id: "postmortem", label: "Postmortem" },
    ],
  },
];

const rowActions = [
  { label: "Rename", icon: Pencil },
  { label: "Duplicate", icon: Copy },
  { label: "Delete", icon: Trash2 },
];

const MENU_HEIGHT = 112;

function TreeRow({
  node,
  depth,
  expanded,
  selectedId,
  menuId,
  onToggle,
  onSelect,
  onMenu,
}: {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  selectedId: string;
  menuId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onMenu: (id: string | null, trigger?: HTMLElement | null) => void;
}) {
  const isFolder = !!node.children?.length;
  const isOpen = expanded.has(node.id);
  const isSelected = selectedId === node.id;
  const isMenuOpen = menuId === node.id;
  const FolderIcon = isOpen ? FolderOpen : Folder;
  const rowRef = useRef<HTMLDivElement>(null);
  const [flipUp, setFlipUp] = useState(false);

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isMenuOpen) {
      onMenu(null);
      return;
    }
    const row = rowRef.current;
    const scroller = row?.closest<HTMLElement>("[data-tree-scroll]");
    if (row && scroller) {
      const room =
        scroller.getBoundingClientRect().bottom -
        row.getBoundingClientRect().bottom;
      setFlipUp(room < MENU_HEIGHT);
    }
    onMenu(node.id, event.currentTarget);
  };

  return (
    <li>
      <div
        ref={rowRef}
        className={cx(
          "group relative flex h-8 items-center rounded-[var(--rb-r-md,8px)] pr-0.5",
          isSelected
            ? "bg-neutral-100 dark:bg-neutral-800"
            : "hover:bg-neutral-100 active:bg-neutral-200 dark:hover:bg-neutral-800 dark:active:bg-neutral-700",
          transition,
        )}
      >
        <button
          type="button"
          aria-current={isSelected ? "page" : undefined}
          aria-expanded={isFolder ? isOpen : undefined}
          onClick={() => (isFolder ? onToggle(node.id) : onSelect(node.id))}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          className={cx(
            "flex h-8 min-w-0 flex-1 cursor-pointer items-center rounded-[var(--rb-r-md,8px)] pr-2 text-left text-[13px]",
            isSelected
              ? "font-medium text-neutral-900 dark:text-neutral-100"
              : "text-neutral-600 dark:text-neutral-400",
            focus,
          )}
        >
          {isFolder ? (
            <ChevronRight
              aria-hidden="true"
              className={cx(
                "mr-1.5 h-3.5 w-3.5 shrink-0 text-neutral-500 transition-transform duration-150 ease-out dark:text-neutral-500",
                isOpen && "rotate-90",
              )}
            />
          ) : (
            <span className="mr-1.5 w-3.5 shrink-0" />
          )}
          {isFolder ? (
            <FolderIcon
              aria-hidden="true"
              className="mr-2 h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-500"
            />
          ) : (
            <FileText
              aria-hidden="true"
              className="mr-2 h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-500"
            />
          )}
          <span className="min-w-0 flex-1 truncate">{node.label}</span>
        </button>

        <button
          type="button"
          aria-label={`Actions for ${node.label}`}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          onClick={openMenu}
          className={cx(
            "inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-sm,6px)] text-neutral-500 opacity-0 hover:bg-neutral-200 hover:text-neutral-900 focus-visible:opacity-100 group-hover:opacity-100 active:bg-neutral-300 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 dark:active:bg-neutral-600",
            isMenuOpen && "opacity-100",
            transition,
            focus,
          )}
        >
          <MoreHorizontal aria-hidden="true" className="h-3.5 w-3.5" />
        </button>

        {isMenuOpen && (
          <div
            role="menu"
            aria-label={`${node.label} actions`}
            className={cx(
              "absolute right-0.5 z-30 w-40 rounded-[var(--rb-r-2xl,14px)] bg-white p-1 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.10)] dark:bg-neutral-800 dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.5)]",
              flipUp
                ? "bottom-[calc(100%-0.25rem)]"
                : "top-[calc(100%-0.25rem)]",
            )}
          >
            {rowActions.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                role="menuitem"
                onClick={() => onMenu(null)}
                className={cx(
                  "flex h-8 w-full cursor-pointer items-center gap-2 rounded-[var(--rb-r-lg,10px)] px-2 text-left text-[13px] active:bg-neutral-200 dark:active:bg-neutral-600",
                  label === "Delete"
                    ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100",
                  transition,
                  focus,
                )}
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {isFolder && isOpen && (
        <ul className="space-y-0.5">
          {node.children!.map((child) => (
            <TreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              selectedId={selectedId}
              menuId={menuId}
              onToggle={onToggle}
              onSelect={onSelect}
              onMenu={onMenu}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function AppSidebar5() {
  const [expanded, setExpanded] = useState(
    () => new Set(["customer-ops", "finance", "compliance", "templates"]),
  );
  const [selectedId, setSelectedId] = useState("escalation");
  const [menuId, setMenuId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const nav = useScrollFade<HTMLElement>();
  const menuTriggerRef = useRef<HTMLElement | null>(null);

  const handleMenu = (id: string | null, trigger?: HTMLElement | null) => {
    if (trigger) menuTriggerRef.current = trigger;
    setMenuId(id);
  };

  useEffect(() => {
    if (!menuId) return;
    const doc = navRef.current?.ownerDocument ?? document;
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setMenuId(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuId(null);
        menuTriggerRef.current?.focus({ preventScroll: true });
        return;
      }
      const items = Array.from(
        navRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ??
          [],
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
      doc.removeEventListener("pointerdown", onPointerDown);
      doc.removeEventListener("keydown", onKeyDown);
    };
  }, [menuId]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="relative flex h-full min-h-[640px] w-full overflow-hidden bg-white dark:bg-neutral-950">
      <aside className="flex w-64 shrink-0 flex-col bg-neutral-50 dark:bg-neutral-900">
        <div className="flex h-14 shrink-0 items-center gap-2 pl-5 pr-2">
          <h2 className="min-w-0 flex-1 truncate text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
            Knowledge base
          </h2>
          <button
            type="button"
            aria-label="New document"
            className={cx(
              "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 active:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 dark:active:bg-neutral-600",
              transition,
              focus,
            )}
          >
            <Plus aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="px-2 pb-2">
          <label className="relative flex items-center">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 h-4 w-4 text-neutral-500 dark:text-neutral-500"
            />
            <input
              type="search"
              placeholder="Search documents"
              aria-label="Search documents"
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
            ref={(el) => {
              navRef.current = el;
              nav.ref.current = el;
            }}
            onScroll={nav.onScroll}
            data-tree-scroll=""
            aria-label="Documents"
            className="h-full overflow-y-auto px-2 pb-3"
          >
            <ul className="space-y-0.5">
              {tree.map((node) => (
                <TreeRow
                  key={node.id}
                  node={node}
                  depth={0}
                  expanded={expanded}
                  selectedId={selectedId}
                  menuId={menuId}
                  onToggle={toggle}
                  onSelect={setSelectedId}
                  onMenu={handleMenu}
                />
              ))}
            </ul>
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
              LM
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                Lena Marchetti
              </p>
              <p className="truncate text-xs text-neutral-500 dark:text-neutral-500">
                Knowledge manager
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
