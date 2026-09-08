"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  FileCode,
  FileText,
  Folder,
  FolderOpen,
  Image,
} from "lucide-react";

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

type FileKind = "code" | "text" | "image";

type TreeNode =
  | { id: string; name: string; type: "folder"; children: TreeNode[] }
  | { id: string; name: string; type: "file"; kind: FileKind; size: string };

const TREE: TreeNode[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    children: [
      {
        id: "components",
        name: "components",
        type: "folder",
        children: [
          {
            id: "button",
            name: "Button.tsx",
            type: "file",
            kind: "code",
            size: "2.4 KB",
          },
          {
            id: "modal",
            name: "Modal.tsx",
            type: "file",
            kind: "code",
            size: "3.1 KB",
          },
          {
            id: "icons",
            name: "icons",
            type: "folder",
            children: [
              {
                id: "logo",
                name: "logo.svg",
                type: "file",
                kind: "image",
                size: "1.2 KB",
              },
              {
                id: "spinner",
                name: "spinner.svg",
                type: "file",
                kind: "image",
                size: "0.8 KB",
              },
            ],
          },
        ],
      },
      {
        id: "hooks",
        name: "hooks",
        type: "folder",
        children: [
          {
            id: "use-auth",
            name: "use-auth.ts",
            type: "file",
            kind: "code",
            size: "1.6 KB",
          },
          {
            id: "use-theme",
            name: "use-theme.ts",
            type: "file",
            kind: "code",
            size: "0.9 KB",
          },
        ],
      },
      {
        id: "lib",
        name: "lib",
        type: "folder",
        children: [
          {
            id: "api",
            name: "api.ts",
            type: "file",
            kind: "code",
            size: "4.2 KB",
          },
          {
            id: "format",
            name: "format.ts",
            type: "file",
            kind: "code",
            size: "1.1 KB",
          },
        ],
      },
      {
        id: "styles",
        name: "styles.css",
        type: "file",
        kind: "text",
        size: "5.0 KB",
      },
      {
        id: "index",
        name: "index.ts",
        type: "file",
        kind: "code",
        size: "0.4 KB",
      },
    ],
  },
  {
    id: "public",
    name: "public",
    type: "folder",
    children: [
      {
        id: "favicon",
        name: "favicon.png",
        type: "file",
        kind: "image",
        size: "4.5 KB",
      },
      {
        id: "og",
        name: "og-image.png",
        type: "file",
        kind: "image",
        size: "88 KB",
      },
    ],
  },
  {
    id: "readme",
    name: "README.md",
    type: "file",
    kind: "text",
    size: "6.2 KB",
  },
  {
    id: "pkg",
    name: "package.json",
    type: "file",
    kind: "code",
    size: "1.9 KB",
  },
  {
    id: "tsconfig",
    name: "tsconfig.json",
    type: "file",
    kind: "code",
    size: "0.6 KB",
  },
  {
    id: "gitignore",
    name: ".gitignore",
    type: "file",
    kind: "text",
    size: "0.2 KB",
  },
];

const BASE = 12;
const INDENT = 16;
const CHEVRON_CENTER = 8;

const FILE_ICON = { code: FileCode, text: FileText, image: Image } as const;

type Row = {
  node: TreeNode;
  depth: number;
  parentId: string | null;
  hasChildren: boolean;
  /** 1-based position among siblings, for a DOM-flattened tree. */
  posInSet: number;
  /** Sibling count at this level, for a DOM-flattened tree. */
  setSize: number;
};

function flatten(
  nodes: TreeNode[],
  expanded: Set<string>,
  depth = 0,
  parentId: string | null = null,
  out: Row[] = [],
) {
  for (const [i, node] of nodes.entries()) {
    const folder = node.type === "folder";
    out.push({
      node,
      depth,
      parentId,
      hasChildren: folder && node.children.length > 0,
      posInSet: i + 1,
      setSize: nodes.length,
    });
    if (folder && expanded.has(node.id)) {
      flatten(node.children, expanded, depth + 1, node.id, out);
    }
  }
  return out;
}

function collectFolders(nodes: TreeNode[], out: string[] = []) {
  for (const n of nodes) {
    if (n.type === "folder") {
      out.push(n.id);
      collectFolders(n.children, out);
    }
  }
  return out;
}

const ALL_FOLDERS = collectFolders(TREE);

export default function List12() {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(["src", "components"]),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string>(TREE[0].id);
  const [mounted, setMounted] = useState(false);

  const { ref: scrollRef, edges, onScroll } = useScrollFade<HTMLDivElement>();
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const pendingFocus = useRef(false);

  useEffect(() => setMounted(true), []);

  const rows = useMemo(() => flatten(TREE, expanded), [expanded]);

  const activeIndex = rows.findIndex((r) => r.node.id === activeId);
  const effectiveIndex = activeIndex === -1 ? 0 : activeIndex;
  const effectiveId = rows[effectiveIndex]?.node.id ?? TREE[0].id;

  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    rowRefs.current[effectiveId]?.focus({ preventScroll: true });
  });

  const requestFocus = () => {
    pendingFocus.current = true;
  };

  const isExpanded = (id: string) => expanded.has(id);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onRowClick = (row: Row) => {
    setActiveId(row.node.id);
    if (row.node.type === "folder") toggle(row.node.id);
    else setSelected(row.node.id);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const row = rows[effectiveIndex];
    if (!row) return;
    const folder = row.node.type === "folder";
    const open = folder && isExpanded(row.node.id);

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const next = rows[Math.min(effectiveIndex + 1, rows.length - 1)];
        setActiveId(next.node.id);
        requestFocus();
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prev = rows[Math.max(effectiveIndex - 1, 0)];
        setActiveId(prev.node.id);
        requestFocus();
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        if (folder && !open && row.hasChildren) {
          toggle(row.node.id);
        } else if (open) {
          const child = rows[effectiveIndex + 1];
          if (child && child.parentId === row.node.id) {
            setActiveId(child.node.id);
            requestFocus();
          }
        }
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        if (open) {
          toggle(row.node.id);
        } else if (row.parentId) {
          setActiveId(row.parentId);
          requestFocus();
        }
        break;
      }
      case "Home": {
        e.preventDefault();
        setActiveId(rows[0].node.id);
        requestFocus();
        break;
      }
      case "End": {
        e.preventDefault();
        setActiveId(rows[rows.length - 1].node.id);
        requestFocus();
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        onRowClick(row);
        break;
      }
    }
  };

  const expandAll = () => setExpanded(new Set(ALL_FOLDERS));
  const collapseAll = () => {
    setExpanded(new Set());
    setActiveId(TREE[0].id);
  };

  return (
    <div className="flex h-full min-h-[640px] w-full flex-col overflow-hidden bg-white p-8 sm:p-10 dark:bg-neutral-950">
      <div className="mx-auto flex h-full w-full max-w-[720px] flex-col">
        <div className="mb-4 flex shrink-0 items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
              Repository
            </h2>
            <p className="mt-0.5 truncate text-[12px] text-neutral-500">
              acme/web · main
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={expandAll}
              className={cx(
                "inline-flex h-8 items-center rounded-[var(--rb-r-md,8px)] border border-neutral-200/70 bg-white px-2.5 text-[13px] font-medium text-neutral-600 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-100",
                transition,
                focus,
              )}
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className={cx(
                "inline-flex h-8 items-center rounded-[var(--rb-r-md,8px)] border border-neutral-200/70 bg-white px-2.5 text-[13px] font-medium text-neutral-600 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-100",
                transition,
                focus,
              )}
            >
              Collapse all
            </button>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
          <div
            ref={scrollRef}
            onScroll={onScroll}
            style={{ touchAction: "pan-y" }}
            className="min-h-0 flex-1 overflow-y-auto py-1"
          >
            <div
              role="tree"
              aria-label="Repository files"
              onKeyDown={onKeyDown}
            >
              {rows.map((row, i) => {
                const { node, depth } = row;
                const folder = node.type === "folder";
                const open = folder && isExpanded(node.id);
                const isActive = node.id === effectiveId;
                const isSelected = node.id === selected;
                const Icon = folder
                  ? open
                    ? FolderOpen
                    : Folder
                  : FILE_ICON[node.kind];
                const order = Math.min(i, 8);

                return (
                  <div
                    key={node.id}
                    ref={(el) => {
                      rowRefs.current[node.id] = el;
                    }}
                    role="treeitem"
                    aria-level={depth + 1}
                    aria-posinset={row.posInSet}
                    aria-setsize={row.setSize}
                    aria-expanded={folder ? open : undefined}
                    aria-selected={!folder ? isSelected : undefined}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => onRowClick(row)}
                    style={{
                      paddingLeft: BASE + depth * INDENT,
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? undefined : "translateY(4px)",
                      transition:
                        "opacity 300ms ease-out, transform 300ms ease-out",
                      transitionDelay: mounted ? undefined : `${order * 20}ms`,
                    }}
                    className={cx(
                      "relative flex h-11 cursor-pointer items-center gap-1.5 pr-3",
                      transition,
                      focus,
                      "motion-reduce:transition-none",
                      isSelected
                        ? "bg-neutral-100 ring-1 ring-inset ring-neutral-900 dark:bg-neutral-800 dark:ring-white"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800/60",
                    )}
                  >
                    {Array.from({ length: depth }, (_, k) => (
                      <span
                        key={k}
                        aria-hidden="true"
                        className="pointer-events-none absolute top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800"
                        style={{ left: BASE + k * INDENT + CHEVRON_CENTER }}
                      />
                    ))}

                    {folder ? (
                      <ChevronRight
                        aria-hidden="true"
                        strokeWidth={1.5}
                        className={cx(
                          "h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-150 ease-out motion-reduce:transition-none dark:text-neutral-500",
                          open && "rotate-90",
                        )}
                      />
                    ) : (
                      <span aria-hidden="true" className="h-4 w-4 shrink-0" />
                    )}

                    <Icon
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className="h-4 w-4 shrink-0 text-neutral-500"
                    />

                    <span
                      className={cx(
                        "min-w-0 flex-1 truncate text-[13px]",
                        isSelected
                          ? "font-medium text-neutral-900 dark:text-neutral-100"
                          : "text-neutral-900 dark:text-neutral-100",
                      )}
                    >
                      {node.name}
                    </span>

                    {folder ? (
                      !open && (
                        <span className="shrink-0 text-[12px] tabular-nums text-neutral-500">
                          {node.children.length}{" "}
                          {node.children.length === 1 ? "item" : "items"}
                        </span>
                      )
                    ) : (
                      <span className="shrink-0 text-[12px] tabular-nums text-neutral-500">
                        {node.size}
                      </span>
                    )}
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
      </div>
    </div>
  );
}
