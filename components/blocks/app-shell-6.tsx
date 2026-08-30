"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
} from "react";
import {
  Bold,
  ChevronRight,
  Code,
  Copy,
  Download,
  FolderInput,
  History,
  Italic,
  Link2,
  List,
  Menu,
  MoreHorizontal,
  Plus,
  Quote,
  Share2,
  Strikethrough,
  Trash2,
  X,
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

function useScrollFadeX<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setEdges({
      start: scrollLeft > 1,
      end: Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1,
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

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

type Doc = {
  id: string;
  title: string;
  updated: string;
  author: string;
  words: number;
};

type Folder = {
  id: string;
  name: string;
  docs: Doc[];
};

const TREE: Folder[] = [
  {
    id: "product",
    name: "Product specs",
    docs: [
      {
        id: "checkout",
        title: "Checkout redesign",
        updated: "6 March 2025",
        author: "Priya Raman",
        words: 1420,
      },
      {
        id: "saved-methods",
        title: "Saved payment methods",
        updated: "27 February 2025",
        author: "Mara Vogt",
        words: 860,
      },
      {
        id: "refunds",
        title: "Refund policy for marketplace sellers and connected accounts",
        updated: "12 March 2025",
        author: "Elena Costa",
        words: 2310,
      },
      {
        id: "disputes",
        title: "Dispute handling",
        updated: "4 March 2025",
        author: "Elena Costa",
        words: 1180,
      },
      {
        id: "payouts",
        title: "Payout scheduling",
        updated: "19 February 2025",
        author: "Tobias Lindqvist",
        words: 740,
      },
      {
        id: "onboarding",
        title: "Merchant onboarding",
        updated: "28 January 2025",
        author: "Priya Raman",
        words: 1960,
      },
      {
        id: "currencies",
        title: "Currency support",
        updated: "11 February 2025",
        author: "Tobias Lindqvist",
        words: 520,
      },
    ],
  },
  {
    id: "notes",
    name: "Meeting notes",
    docs: [
      {
        id: "sync-14-mar",
        title: "Weekly sync, 14 March",
        updated: "14 March 2025",
        author: "Elena Costa",
        words: 430,
      },
      {
        id: "q2-planning",
        title: "Q2 planning",
        updated: "5 March 2025",
        author: "Priya Raman",
        words: 980,
      },
      {
        id: "postmortem",
        title: "Payout delay postmortem",
        updated: "26 February 2025",
        author: "Tobias Lindqvist",
        words: 1120,
      },
    ],
  },
  {
    id: "engineering",
    name: "Engineering",
    docs: [
      {
        id: "webhooks",
        title: "Webhook retry schedule",
        updated: "14 March 2025",
        author: "Mara Vogt",
        words: 812,
      },
      {
        id: "versioning",
        title: "API versioning",
        updated: "9 March 2025",
        author: "Tobias Lindqvist",
        words: 1340,
      },
      {
        id: "ledger",
        title: "Ledger migration plan",
        updated: "2 March 2025",
        author: "Priya Raman",
        words: 3080,
      },
      {
        id: "idempotency",
        title: "Idempotency keys",
        updated: "21 February 2025",
        author: "Mara Vogt",
        words: 690,
      },
      {
        id: "runbook",
        title: "Incident runbook",
        updated: "13 March 2025",
        author: "Elena Costa",
        words: 1570,
      },
      {
        id: "rate-limits",
        title: "Rate limits",
        updated: "7 March 2025",
        author: "Tobias Lindqvist",
        words: 640,
      },
      {
        id: "signing-keys",
        title: "Signing key rotation",
        updated: "24 February 2025",
        author: "Mara Vogt",
        words: 1050,
      },
      {
        id: "queues",
        title: "Queue backpressure",
        updated: "18 February 2025",
        author: "Priya Raman",
        words: 1490,
      },
      {
        id: "sandbox",
        title: "Sandbox data reset",
        updated: "9 January 2025",
        author: "",
        words: 210,
      },
    ],
  },
];

const ALL_DOCS = TREE.flatMap((folder) => folder.docs);

const OPEN_DOC_ID = "webhooks";

const DOCUMENT_MENU = [
  { label: "Duplicate", icon: Copy },
  { label: "Move to folder", icon: FolderInput },
  { label: "Version history", icon: History },
  { label: "Export as Markdown", icon: Download },
  { label: "Move to trash", icon: Trash2 },
];

const BLOCK_MENU = [
  { label: "Bulleted list", icon: List },
  { label: "Quote", icon: Quote },
  { label: "Code block", icon: Code },
  { label: "Link", icon: Link2 },
];

const RETRY_CONFIG = `retry:
  initial_delay: 30s
  multiplier: 3
  max_delay: 6h
  max_attempts: 21
  jitter: 0.2`;

const groupDigits = (value: number) =>
  String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

function OverflowMenu({
  label,
  items,
  className,
}: {
  label: string;
  items: {
    label: string;
    icon: IconComponent;
  }[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | undefined>(undefined);

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    setShown(false);
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!open) return;
    const doc = rootRef.current?.ownerDocument ?? document;
    const getItems = () =>
      Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ??
          [],
      );

    getItems()[0]?.focus({ preventScroll: true });

    const onPointerDown = (event: Event) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const nodes = getItems();
      if (nodes.length === 0) return;
      const index = nodes.indexOf(doc.activeElement as HTMLElement);
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        nodes[index < 0 || index === nodes.length - 1 ? 0 : index + 1]?.focus({
          preventScroll: true,
        });
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        nodes[index <= 0 ? nodes.length - 1 : index - 1]?.focus({
          preventScroll: true,
        });
      } else if (event.key === "Home") {
        event.preventDefault();
        nodes[0]?.focus({ preventScroll: true });
      } else if (event.key === "End") {
        event.preventDefault();
        nodes[nodes.length - 1]?.focus({ preventScroll: true });
      } else if (event.key === "Tab") {
        close(false);
      }
    };

    doc.addEventListener("pointerdown", onPointerDown);
    doc.addEventListener("keydown", onKeyDown);
    return () => {
      doc.removeEventListener("pointerdown", onPointerDown);
      doc.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => () => cancelAnimationFrame(frameRef.current ?? 0), []);

  const openMenu = (animated: boolean) => {
    setOpen(true);
    if (!animated) {
      setShown(true);
      return;
    }
    setShown(false);
    frameRef.current = requestAnimationFrame(() => setShown(true));
  };

  return (
    <div ref={rootRef} className={cx("relative shrink-0", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? close(false) : openMenu(true))}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" || open) return;
          event.preventDefault();
          openMenu(false);
        }}
        className={cx(
          "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 active:scale-[0.97] dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100",
          transition,
          focus,
        )}
      >
        <MoreHorizontal aria-hidden="true" className="h-4 w-4 shrink-0" />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={label}
          className={cx(
            "absolute right-0 top-full z-30 mt-1 w-56 origin-top-right rounded-[var(--rb-r-2xl,14px)] border border-neutral-200 bg-white p-1 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.10)] transition-[opacity,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none",
            shown ? "scale-100 opacity-100" : "scale-95 opacity-0",
          )}
        >
          {items.map(({ label: item, icon: Icon }) => (
            <button
              key={item}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => close(true)}
              className={cx(
                "flex h-8 w-full cursor-pointer items-center gap-2 rounded-[var(--rb-r-lg,10px)] px-2 text-left text-[13px] text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.99] dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                transition,
                "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]",
              )}
            >
              <Icon
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0 text-neutral-500 dark:text-neutral-500"
              />
              <span className="min-w-0 flex-1 truncate">{item}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentTree({
  titles,
  expanded,
  onToggleFolder,
  selectedId,
  onSelect,
  activeId,
  onActivate,
}: {
  titles: Record<string, string>;
  expanded: Record<string, boolean>;
  onToggleFolder: (id: string) => void;
  selectedId: string;
  onSelect: (id: string) => void;
  activeId: string;
  onActivate: (id: string) => void;
}) {
  const treeRef = useRef<HTMLUListElement>(null);

  const visibleNodes = () =>
    Array.from(
      treeRef.current?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? [],
    );

  const moveTo = (node: HTMLElement | undefined) => {
    if (!node) return;
    node.focus({ preventScroll: true });
    if (node.dataset.id) onActivate(node.dataset.id);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const nodes = visibleNodes();
    if (nodes.length === 0) return;
    const doc = treeRef.current?.ownerDocument ?? document;
    const index = nodes.indexOf(doc.activeElement as HTMLElement);
    const node = nodes[index];

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveTo(nodes[Math.min(index + 1, nodes.length - 1)]);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveTo(nodes[Math.max(index - 1, 0)]);
        break;
      case "Home":
        event.preventDefault();
        moveTo(nodes[0]);
        break;
      case "End":
        event.preventDefault();
        moveTo(nodes[nodes.length - 1]);
        break;
      case "ArrowRight": {
        if (!node) return;
        event.preventDefault();
        const state = node.getAttribute("aria-expanded");
        if (state === "false" && node.dataset.id)
          onToggleFolder(node.dataset.id);
        else if (state === "true") moveTo(nodes[index + 1]);
        break;
      }
      case "ArrowLeft": {
        if (!node) return;
        event.preventDefault();
        if (node.getAttribute("aria-expanded") === "true" && node.dataset.id) {
          onToggleFolder(node.dataset.id);
          break;
        }
        const parent = node.dataset.parent;
        if (!parent) break;
        moveTo(nodes.find((item) => item.dataset.id === parent));
        break;
      }
    }
  };

  return (
    <ul
      ref={treeRef}
      role="tree"
      aria-label="Documents"
      onKeyDown={onKeyDown}
      className="space-y-0.5"
    >
      {TREE.map((folder, folderIndex) => {
        const open = expanded[folder.id];
        return (
          <li key={folder.id} role="none">
            <button
              type="button"
              role="treeitem"
              data-id={folder.id}
              aria-expanded={open}
              aria-selected={false}
              aria-level={1}
              aria-posinset={folderIndex + 1}
              aria-setsize={TREE.length}
              tabIndex={activeId === folder.id ? 0 : -1}
              onClick={() => {
                onActivate(folder.id);
                onToggleFolder(folder.id);
              }}
              className={cx(
                "flex h-8 w-full cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-md,8px)] px-2 text-left text-[13px] font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.99] dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                transition,
                focus,
              )}
            >
              <ChevronRight
                aria-hidden="true"
                className={cx(
                  "h-3.5 w-3.5 shrink-0 text-neutral-500 transition-transform duration-200 ease-out motion-reduce:transition-none dark:text-neutral-500",
                  open && "rotate-90",
                )}
              />
              <span className="min-w-0 flex-1 truncate">{folder.name}</span>
            </button>

            {open && (
              <ul role="group" aria-label={folder.name} className="space-y-0.5">
                {folder.docs.map((item, docIndex) => {
                  const current = item.id === selectedId;
                  return (
                    <li key={item.id} role="none">
                      <button
                        type="button"
                        role="treeitem"
                        data-id={item.id}
                        data-parent={folder.id}
                        aria-level={2}
                        aria-posinset={docIndex + 1}
                        aria-setsize={folder.docs.length}
                        aria-selected={current}
                        aria-current={current ? "page" : undefined}
                        tabIndex={activeId === item.id ? 0 : -1}
                        onClick={() => {
                          onActivate(item.id);
                          onSelect(item.id);
                        }}
                        className={cx(
                          "flex h-8 w-full cursor-pointer items-center rounded-[var(--rb-r-md,8px)] pl-8 pr-2 text-left text-[13px] active:scale-[0.99]",
                          current
                            ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                            : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                          transition,
                          focus,
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {titles[item.id]}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function SidebarBody({
  titles,
  expanded,
  onToggleFolder,
  selectedId,
  onSelect,
  activeId,
  onActivate,
  onClose,
}: {
  titles: Record<string, string>;
  expanded: Record<string, boolean>;
  onToggleFolder: (id: string) => void;
  selectedId: string;
  onSelect: (id: string) => void;
  activeId: string;
  onActivate: (id: string) => void;
  onClose?: () => void;
}) {
  const nav = useScrollFade<HTMLElement>();
  return (
    <>
      <div className="flex h-14 shrink-0 items-center gap-2 pl-3 pr-2">
        <p className="min-w-0 flex-1 truncate text-sm font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
          Halden docs
        </p>
        <button
          type="button"
          aria-label="New document"
          className={cx(
            "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 active:scale-[0.97] dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100",
            transition,
            focus,
          )}
        >
          <Plus aria-hidden="true" className="h-4 w-4 shrink-0" />
        </button>
        {onClose && (
          <button
            type="button"
            aria-label="Close documents"
            onClick={onClose}
            className={cx(
              "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 active:scale-[0.97] dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100",
              transition,
              focus,
            )}
          >
            <X aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          </button>
        )}
      </div>

      <div className="relative min-h-0 flex-1">
        <nav
          ref={nav.ref}
          onScroll={nav.onScroll}
          aria-label="Documents"
          className="h-full overflow-y-auto px-2 pb-2"
        >
          <DocumentTree
            titles={titles}
            expanded={expanded}
            onToggleFolder={onToggleFolder}
            selectedId={selectedId}
            onSelect={onSelect}
            activeId={activeId}
            onActivate={onActivate}
          />
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

      <div className="shrink-0 px-2 pb-3 pt-2">
        <button
          type="button"
          className={cx(
            "flex h-8 w-full cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-md,8px)] px-2 text-left text-[13px] text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.99] dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
            transition,
            focus,
          )}
        >
          <Trash2
            aria-hidden="true"
            className="h-3.5 w-3.5 shrink-0 text-neutral-500 dark:text-neutral-500"
          />
          <span className="min-w-0 flex-1 truncate">Trash</span>
          <span className="shrink-0 tabular-nums text-neutral-500 dark:text-neutral-500">
            6
          </span>
        </button>
      </div>
    </>
  );
}

function FormatToggle({
  label,
  icon: Icon,
  pressed,
  onToggle,
}: {
  label: string;
  icon: IconComponent;
  pressed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onToggle}
      className={cx(
        "inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] active:scale-[0.97]",
        pressed
          ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-neutral-950 dark:text-neutral-100 dark:shadow-none"
          : "bg-transparent text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100",
        transition,
        "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]",
      )}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
    </button>
  );
}

export default function AppShell6() {
  const [titles, setTitles] = useState<Record<string, string>>(() =>
    Object.fromEntries(ALL_DOCS.map((item) => [item.id, item.title])),
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    product: true,
    engineering: true,
    notes: false,
  });
  const [selectedId, setSelectedId] = useState(OPEN_DOC_ID);
  const [activeId, setActiveId] = useState(OPEN_DOC_ID);
  const [marks, setMarks] = useState({
    bold: true,
    italic: false,
    strikethrough: false,
    list: false,
    quote: false,
    code: false,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerShown, setDrawerShown] = useState(false);
  const shouldFocusRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const readerRef = useRef<HTMLElement>(null);
  const content = useScrollFade<HTMLElement>();
  const code = useScrollFadeX<HTMLPreElement>();

  useEffect(() => {
    const view = triggerRef.current?.ownerDocument.defaultView ?? window;
    const query = view.matchMedia("(max-width: 1023px)");
    let settled = false;
    const openOnce = () => {
      if (settled || !query.matches) return;
      settled = true;
      setDrawerOpen(true);
    };
    const frame = requestAnimationFrame(openOnce);
    query.addEventListener("change", openOnce);
    return () => {
      cancelAnimationFrame(frame);
      query.removeEventListener("change", openOnce);
    };
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const drawer = drawerRef.current;
    const frame = requestAnimationFrame(() => setDrawerShown(true));
    const doc = drawer?.ownerDocument ?? document;
    const getFocusable = () =>
      Array.from(
        drawer?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => !element.hasAttribute("disabled"));

    if (shouldFocusRef.current) {
      getFocusable()[0]?.focus({ preventScroll: true });
      shouldFocusRef.current = false;
    }

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        setDrawerShown(false);
        triggerRef.current?.focus({ preventScroll: true });
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && doc.activeElement === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && doc.activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    doc.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      doc.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  useEffect(() => {
    readerRef.current?.scrollTo({ top: 0 });
  }, [selectedId]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerShown(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  const toggleFolder = (id: string) => {
    setExpanded((current) => {
      const next = { ...current, [id]: !current[id] };
      return next;
    });
    const folder = TREE.find((item) => item.id === id);
    if (
      expanded[id] &&
      folder?.docs.some((item) => item.id === activeId) &&
      activeId !== id
    ) {
      setActiveId(id);
    }
  };

  const doc = ALL_DOCS.find((item) => item.id === selectedId) ?? ALL_DOCS[0];
  const title = titles[doc.id];

  return (
    <div className="relative flex h-full min-h-[720px] w-full overflow-hidden bg-white dark:bg-neutral-950">
      <aside className="hidden w-64 shrink-0 flex-col bg-neutral-50 lg:flex dark:bg-neutral-900">
        <SidebarBody
          titles={titles}
          expanded={expanded}
          onToggleFolder={toggleFolder}
          selectedId={selectedId}
          onSelect={setSelectedId}
          activeId={activeId}
          onActivate={setActiveId}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 px-4 sm:px-6">
          <button
            ref={triggerRef}
            type="button"
            aria-label="Open documents"
            aria-expanded={drawerOpen}
            onClick={() => {
              shouldFocusRef.current = true;
              setDrawerOpen(true);
            }}
            className={cx(
              "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 active:scale-[0.97] lg:hidden dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100",
              transition,
              focus,
            )}
          >
            <Menu aria-hidden="true" className="h-4 w-4 shrink-0" />
          </button>

          <div className="min-w-0 flex-1">
            <input
              value={title}
              aria-label="Document title"
              onChange={(event) =>
                setTitles((current) => ({
                  ...current,
                  [doc.id]: event.target.value,
                }))
              }
              className={cx(
                "h-8 w-full max-w-[20rem] rounded-[var(--rb-r-md,8px)] border-0 bg-transparent px-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 focus:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800",
                transition,
                focus,
              )}
            />
          </div>

          <span
            aria-live="polite"
            className="hidden shrink-0 items-center gap-1.5 text-[13px] text-neutral-500 sm:inline-flex dark:text-neutral-500"
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-600"
            />
            Saved
          </span>

          <button
            type="button"
            className={cx(
              "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-2 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] sm:px-2.5 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
              transition,
              focus,
            )}
          >
            <Share2 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            Share
          </button>

          <OverflowMenu label="Document actions" items={DOCUMENT_MENU} />
        </header>

        <div className="flex h-12 shrink-0 items-center gap-2 bg-neutral-50 px-4 sm:px-6 dark:bg-neutral-900">
          <div
            role="group"
            aria-label="Text style"
            className="inline-flex h-8 shrink-0 items-center gap-0.5 rounded-[var(--rb-r-lg,10px)] bg-neutral-100 p-0.5 dark:bg-neutral-800"
          >
            <FormatToggle
              label="Bold"
              icon={Bold}
              pressed={marks.bold}
              onToggle={() => setMarks((m) => ({ ...m, bold: !m.bold }))}
            />
            <FormatToggle
              label="Italic"
              icon={Italic}
              pressed={marks.italic}
              onToggle={() => setMarks((m) => ({ ...m, italic: !m.italic }))}
            />
            <FormatToggle
              label="Strikethrough"
              icon={Strikethrough}
              pressed={marks.strikethrough}
              onToggle={() =>
                setMarks((m) => ({ ...m, strikethrough: !m.strikethrough }))
              }
            />
          </div>

          <div
            role="group"
            aria-label="Block style"
            className="hidden h-8 shrink-0 items-center gap-0.5 rounded-[var(--rb-r-lg,10px)] bg-neutral-100 p-0.5 md:inline-flex dark:bg-neutral-800"
          >
            <FormatToggle
              label="Bulleted list"
              icon={List}
              pressed={marks.list}
              onToggle={() => setMarks((m) => ({ ...m, list: !m.list }))}
            />
            <FormatToggle
              label="Quote"
              icon={Quote}
              pressed={marks.quote}
              onToggle={() => setMarks((m) => ({ ...m, quote: !m.quote }))}
            />
            <FormatToggle
              label="Code block"
              icon={Code}
              pressed={marks.code}
              onToggle={() => setMarks((m) => ({ ...m, code: !m.code }))}
            />
          </div>

          <button
            type="button"
            aria-label="Insert link"
            className={cx(
              "hidden h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 active:scale-[0.97] md:inline-flex dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100",
              transition,
              focus,
            )}
          >
            <Link2 aria-hidden="true" className="h-4 w-4 shrink-0" />
          </button>

          <OverflowMenu
            label="More formatting"
            items={BLOCK_MENU}
            className="md:hidden"
          />

          <span className="ml-auto shrink-0 text-[13px] tabular-nums text-neutral-500 dark:text-neutral-500">
            {groupDigits(doc.words)} words
          </span>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <main
            ref={(el) => {
              readerRef.current = el;
              content.ref.current = el;
            }}
            onScroll={content.onScroll}
            className="h-full overflow-y-auto"
          >
            <article className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
              <h1 className="text-2xl font-medium tracking-[-0.02em] text-neutral-900 dark:text-neutral-100">
                {title}
              </h1>
              <p className="mt-2 text-[13px] text-neutral-500 dark:text-neutral-500">
                Last edited {doc.updated} by{" "}
                {doc.author || (
                  <span className="text-neutral-400 dark:text-neutral-600">
                    -
                  </span>
                )}
              </p>

              <p className="mt-6 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                Every webhook Halden sends is retried until the endpoint accepts
                it or the schedule runs out. This page describes the schedule as
                it behaves in production today, so support and integration
                engineers can answer a merchant&rsquo;s question without reading
                the delivery service.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                Retries are tracked per endpoint rather than per account. If a
                merchant has three endpoints registered and one of them is
                unreachable, deliveries to the other two are unaffected and stay
                on time.
              </p>

              <h2 className="mt-8 text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
                Timing
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                The first retry is sent 30 seconds after a failed attempt. Each
                attempt after that waits about three times as long as the one
                before it, up to a ceiling of six hours. A delivery is abandoned
                after 21 attempts, which works out to just under three days.
              </p>
              <div className="relative mt-4 overflow-hidden rounded-[var(--rb-r-lg,10px)]">
                <pre
                  ref={code.ref}
                  onScroll={code.onScroll}
                  className="overflow-x-auto bg-neutral-50 p-4 font-mono text-[13px] leading-relaxed text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"
                >
                  {RETRY_CONFIG}
                </pre>
                <div
                  aria-hidden="true"
                  className={cx(
                    "pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
                    code.edges.start ? "opacity-100" : "opacity-0",
                  )}
                />
                <div
                  aria-hidden="true"
                  className={cx(
                    "pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
                    code.edges.end ? "opacity-100" : "opacity-0",
                  )}
                />
              </div>

              <h2 className="mt-8 text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
                What counts as a failure
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                An attempt fails when any of the following happens. Everything
                else, including a slow but successful response, counts as
                delivered.
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 marker:text-neutral-400 dark:text-neutral-400 dark:marker:text-neutral-600">
                <li>
                  The endpoint returns a status outside the 2xx range, including
                  redirects.
                </li>
                <li>The connection is not established within 10 seconds.</li>
                <li>
                  The response body has not arrived 30 seconds after the request
                  was sent.
                </li>
                <li>
                  The TLS certificate cannot be verified against the public
                  trust store.
                </li>
              </ul>

              <h2 className="mt-8 text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
                Replaying a delivery
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                Support can replay a single delivery from the endpoint page. A
                replay sends the payload as it was recorded when the event
                happened, so a replayed charge still carries the amount that was
                charged at the time rather than the amount on the account today.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                Replays do not reset the retry counter and do not extend the
                three day window. If a merchant needs deliveries older than
                that, read them from the events API instead and reconcile
                against the ledger export.
              </p>
            </article>
          </main>
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950",
              content.edges.start ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950",
              content.edges.end ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
      </div>

      {drawerOpen && (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close documents overlay"
            tabIndex={-1}
            onClick={closeDrawer}
            className={cx(
              "absolute inset-0 z-30 cursor-pointer bg-neutral-950/40 backdrop-blur-[2px] transition-opacity duration-200 ease-out motion-reduce:transition-none dark:bg-neutral-950/60",
              drawerShown ? "opacity-100" : "opacity-0",
            )}
          />
          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Documents"
            className={cx(
              "absolute inset-y-0 left-0 z-40 flex w-72 max-w-[85%] flex-col rounded-r-[var(--rb-r-4xl,18px)] bg-white shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)] transition-transform duration-[320ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none dark:bg-neutral-900 dark:shadow-none",
              drawerShown ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <SidebarBody
              titles={titles}
              expanded={expanded}
              onToggleFolder={toggleFolder}
              selectedId={selectedId}
              onSelect={setSelectedId}
              activeId={activeId}
              onActivate={setActiveId}
              onClose={closeDrawer}
            />
          </aside>
        </div>
      )}
    </div>
  );
}
