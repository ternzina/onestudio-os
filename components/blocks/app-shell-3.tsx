"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type RefObject,
  type SVGProps,
} from "react";
import {
  BarChart3,
  Bell,
  Building2,
  CalendarClock,
  CheckSquare,
  FileText,
  LayoutTemplate,
  Library,
  LifeBuoy,
  Megaphone,
  Menu,
  PanelLeft,
  Plus,
  Search,
  Settings,
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

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const iconButton =
  "h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 active:scale-[0.97] dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100";

const SIDEBAR_ID = "app-shell-3-sidebar";
const DRAWER_ID = "app-shell-3-drawer";

type NavItem = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  count?: string;
  current?: boolean;
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Contracts",
    items: [
      { label: "Contracts", icon: FileText, current: true },
      { label: "Renewals", icon: CalendarClock, count: "4" },
      { label: "Templates", icon: LayoutTemplate },
      { label: "Clause library", icon: Library },
    ],
  },
  {
    label: "Organisation",
    items: [
      { label: "Counterparties", icon: Building2 },
      { label: "Approvals", icon: CheckSquare, count: "2" },
      { label: "Reports", icon: BarChart3 },
    ],
  },
];

const SECONDARY_NAV: NavItem[] = [
  { label: "Help center", icon: LifeBuoy },
  { label: "What's new", icon: Megaphone },
];

const ACCOUNT_MENU = [
  "Account settings",
  "Notification preferences",
  "Switch workspace",
  "Sign out",
];

const METRICS = [
  { label: "Renewing in 90 days", value: "4" },
  { label: "Awaiting approval", value: "2" },
  { label: "Annual contract value", value: "$3.91M" },
];

type Status =
  "Active" | "Draft" | "In review" | "Renewing" | "Needs approval" | "Overdue";

type Stage = "signed" | "drafting" | "attention";

type Agreement = {
  name: string;
  counterparty: string;
  owner: string;
  value: string;
  renews: string;
  status: Status;
  stage: Stage;
};

const STATUS_DOT: Record<Status, string> = {
  Active: "bg-neutral-300 dark:bg-neutral-600",
  Draft: "bg-neutral-300 dark:bg-neutral-600",
  "In review": "bg-neutral-300 dark:bg-neutral-600",
  Renewing: "bg-neutral-400 dark:bg-neutral-500",
  "Needs approval": "bg-amber-500",
  Overdue: "bg-red-500",
};

const AGREEMENTS: Agreement[] = [
  {
    name: "Data processing addendum",
    counterparty: "Corvus Health",
    owner: "Tomas Lindqvist",
    value: "-",
    renews: "04 Jan 2026",
    status: "Overdue",
    stage: "attention",
  },
  {
    name: "Platform subscription and support renewal for the North American field operations team",
    counterparty: "Halden Manufacturing",
    owner: "Priya Raghunathan",
    value: "$1,120,000",
    renews: "28 Feb 2026",
    status: "Needs approval",
    stage: "attention",
  },
  {
    name: "Master services agreement",
    counterparty: "Brightline Logistics Group",
    owner: "Amara Okafor",
    value: "$248,000",
    renews: "12 Mar 2026",
    status: "Active",
    stage: "signed",
  },
  {
    name: "Reseller agreement",
    counterparty: "Kestrel Digital",
    owner: "Amara Okafor",
    value: "$86,500",
    renews: "19 Apr 2026",
    status: "Active",
    stage: "signed",
  },
  {
    name: "Mutual non-disclosure agreement",
    counterparty: "Verity Partners",
    owner: "-",
    value: "-",
    renews: "22 May 2026",
    status: "Active",
    stage: "signed",
  },
  {
    name: "Statement of work 14",
    counterparty: "Halden Manufacturing",
    owner: "Daniel Whitfield",
    value: "$312,000",
    renews: "30 Jun 2026",
    status: "In review",
    stage: "drafting",
  },
  {
    name: "Software licence renewal",
    counterparty: "Northgate Utilities",
    owner: "Priya Raghunathan",
    value: "$455,000",
    renews: "08 Jul 2026",
    status: "Renewing",
    stage: "signed",
  },
  {
    name: "Professional services agreement",
    counterparty: "Larkspur Media",
    owner: "Daniel Whitfield",
    value: "$128,400",
    renews: "15 Aug 2026",
    status: "Draft",
    stage: "drafting",
  },
  {
    name: "Supply agreement",
    counterparty: "Ironbark Components",
    owner: "Tomas Lindqvist",
    value: "$674,200",
    renews: "01 Sep 2026",
    status: "Active",
    stage: "signed",
  },
  {
    name: "Security addendum",
    counterparty: "Kestrel Digital",
    owner: "Amara Okafor",
    value: "$24,000",
    renews: "11 Oct 2026",
    status: "In review",
    stage: "drafting",
  },
  {
    name: "Master services agreement",
    counterparty: "Verity Partners",
    owner: "Priya Raghunathan",
    value: "$198,000",
    renews: "03 Nov 2026",
    status: "Active",
    stage: "signed",
  },
  {
    name: "Hosting and infrastructure agreement",
    counterparty: "Northgate Utilities",
    owner: "Daniel Whitfield",
    value: "$530,000",
    renews: "27 Nov 2026",
    status: "Needs approval",
    stage: "attention",
  },
  {
    name: "Consulting retainer",
    counterparty: "Larkspur Media",
    owner: "Tomas Lindqvist",
    value: "$96,000",
    renews: "14 Dec 2026",
    status: "Active",
    stage: "signed",
  },
  {
    name: "Equipment lease",
    counterparty: "Ironbark Components",
    owner: "Amara Okafor",
    value: "$41,750",
    renews: "20 Jan 2027",
    status: "Draft",
    stage: "drafting",
  },
];

const FILTERS: { label: string; stage: Stage | null }[] = [
  { label: "All", stage: null },
  { label: "Signed", stage: "signed" },
  { label: "Needs attention", stage: "attention" },
];

function StatusCell({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-neutral-600 dark:text-neutral-400">
      <span
        className={cx("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[status])}
      />
      {status}
    </span>
  );
}

function AccountMenu() {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | undefined>(undefined);

  const itemsOf = () =>
    Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );

  useEffect(() => {
    if (!open) return;
    const doc = rootRef.current?.ownerDocument ?? document;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setShown(false);
      }
    };
    doc.addEventListener("pointerdown", onPointerDown);
    return () => doc.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) itemsOf()[0]?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => () => cancelAnimationFrame(frameRef.current ?? 0), []);

  const openMenu = (withAnimation: boolean) => {
    setOpen(true);
    if (withAnimation) {
      setShown(false);
      frameRef.current = requestAnimationFrame(() => setShown(true));
    } else {
      setShown(true);
    }
  };

  const close = (restoreFocus = true) => {
    setOpen(false);
    setShown(false);
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(false);
    }
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = itemsOf();
    if (items.length === 0) return;
    const index = items.indexOf(
      event.currentTarget.ownerDocument.activeElement as HTMLElement,
    );
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "ArrowDown":
        event.preventDefault();
        items[(index + 1) % items.length]?.focus({ preventScroll: true });
        break;
      case "ArrowUp":
        event.preventDefault();
        items[(index - 1 + items.length) % items.length]?.focus({
          preventScroll: true,
        });
        break;
      case "Home":
        event.preventDefault();
        items[0]?.focus({ preventScroll: true });
        break;
      case "End":
        event.preventDefault();
        items[items.length - 1]?.focus({ preventScroll: true });
        break;
      case "Tab":
        close(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Amara Okafor, account menu"
        onClick={() => (open ? close(false) : openMenu(true))}
        onKeyDown={onTriggerKeyDown}
        className={cx(
          "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-300 active:scale-[0.97] dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600",
          transition,
          focus,
        )}
      >
        AO
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Account"
          onKeyDown={onMenuKeyDown}
          className={cx(
            "absolute right-0 top-[calc(100%+0.5rem)] z-30 w-60 origin-top-right rounded-[var(--rb-r-xl,12px)] border border-neutral-200 bg-white p-1 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.10)] transition-[opacity,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none",
            shown ? "scale-100 opacity-100" : "scale-95 opacity-0",
          )}
        >
          <div role="presentation" className="px-2 pb-2 pt-1">
            <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
              Amara Okafor
            </p>
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-500">
              amara.okafor@sundialclm.com
            </p>
          </div>
          {ACCOUNT_MENU.map((label) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => close()}
              className={cx(
                "flex h-8 w-full cursor-pointer items-center rounded-[var(--rb-r-md,8px)] px-2 text-left text-[13px] text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:active:bg-neutral-700",
                transition,
                "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]",
              )}
            >
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarNav({
  collapsed,
  onClose,
}: {
  collapsed: boolean;
  onClose?: () => void;
}) {
  const nav = useScrollFade<HTMLElement>();
  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    return (
      <li key={item.label}>
        <a
          href="#contracts"
          aria-current={item.current ? "page" : undefined}
          aria-label={collapsed ? item.label : undefined}
          className={cx(
            "group relative flex h-8 cursor-pointer items-center gap-2 rounded-[var(--rb-r-md,8px)] px-2.5 text-[13px] active:bg-neutral-200 dark:active:bg-neutral-700",
            item.current
              ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
            collapsed && "justify-center",
            transition,
            focus,
          )}
        >
          <Icon
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-500"
          />
          {collapsed ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-full top-1/2 z-[70] ml-2 -translate-y-1/2 whitespace-nowrap rounded-[var(--rb-r-sm,6px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-neutral-900"
            >
              {item.label}
            </span>
          ) : (
            <>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.count && (
                <span className="shrink-0 text-xs tabular-nums text-neutral-500 dark:text-neutral-500">
                  {item.count}
                </span>
              )}
            </>
          )}
        </a>
      </li>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {onClose && (
        <div className="flex h-14 shrink-0 items-center gap-2.5 pl-4 pr-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] text-sm font-medium text-white dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-neutral-900">
            S
          </span>
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Sundial
          </p>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className={cx(iconButton, "inline-flex h-8 w-8", transition, focus)}
          >
            <X aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col">
        <nav
          ref={nav.ref}
          onScroll={nav.onScroll}
          aria-label="Primary"
          className={cx(
            "flex h-full flex-col px-2 py-3",
            collapsed ? "overflow-visible" : "overflow-y-auto",
          )}
        >
          <div className="space-y-4">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                {!collapsed && (
                  <p className="mb-1 px-2.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                    {group.label}
                  </p>
                )}
                <ul className="space-y-0.5">{group.items.map(renderItem)}</ul>
              </div>
            ))}
          </div>

          <ul className="mt-auto space-y-0.5 pt-8">
            {SECONDARY_NAV.map(renderItem)}
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
    </div>
  );
}

export default function AppShell3() {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(FILTERS[0].label);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerShown, setDrawerShown] = useState(false);
  const content = useScrollFade<HTMLElement>();

  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const shouldFocusRef = useRef(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const view =
        searchTriggerRef.current?.ownerDocument.defaultView ?? window;
      if (view.matchMedia("(max-width: 1023px)").matches) setDrawerOpen(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const doc = rootRef.current?.ownerDocument ?? document;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus({ preventScroll: true });
      }
    };
    doc.addEventListener("keydown", onKeyDown);
    return () => doc.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const drawer = drawerRef.current;
    const doc = drawer?.ownerDocument ?? document;
    const frame = requestAnimationFrame(() => setDrawerShown(true));
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
        menuTriggerRef.current?.focus({ preventScroll: true });
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
    if (mobileSearch) mobileSearchRef.current?.focus({ preventScroll: true });
  }, [mobileSearch]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerShown(false);
    menuTriggerRef.current?.focus({ preventScroll: true });
  };

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const stage = FILTERS.find((item) => item.label === filter)?.stage ?? null;
    return AGREEMENTS.filter((row) => {
      if (stage && row.stage !== stage) return false;
      if (!needle) return true;
      return (
        row.name.toLowerCase().includes(needle) ||
        row.counterparty.toLowerCase().includes(needle)
      );
    });
  }, [query, filter]);

  const onFilterKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (step === 0) return;
    event.preventDefault();
    const index = FILTERS.findIndex((item) => item.label === filter);
    const next = FILTERS[(index + step + FILTERS.length) % FILTERS.length];
    setFilter(next.label);
    const buttons = event.currentTarget.querySelectorAll("button");
    buttons[FILTERS.indexOf(next)]?.focus({ preventScroll: true });
  };

  const renderSearch = (
    ref: RefObject<HTMLInputElement | null>,
    withHint: boolean,
  ) => (
    <div className="relative w-full">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-500"
      />
      <input
        ref={ref}
        type="text"
        role="searchbox"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setQuery("");
        }}
        placeholder="Search contracts and counterparties"
        aria-label="Search contracts and counterparties"
        className={cx(
          "h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-neutral-50 pl-9 text-sm text-neutral-900 placeholder:text-neutral-500 hover:border-neutral-300 focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white",
          withHint ? "pr-14" : "pr-3",
          transition,
          focus,
        )}
      />
      {withHint && (
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden h-5 -translate-y-1/2 items-center rounded-[var(--rb-r-sm,6px)] bg-neutral-100 px-1.5 font-mono text-[11px] text-neutral-600 lg:inline-flex dark:bg-neutral-800 dark:text-neutral-400">
          ⌘K
        </kbd>
      )}
    </div>
  );

  const countLabel =
    visible.length === AGREEMENTS.length
      ? `${AGREEMENTS.length} agreements`
      : `${visible.length} of ${AGREEMENTS.length} agreements`;

  return (
    <div
      ref={rootRef}
      className="relative flex h-full min-h-[720px] w-full flex-col overflow-hidden bg-white dark:bg-neutral-950"
    >
      <header className="relative z-20 flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200/70 px-4 sm:px-6 dark:border-neutral-800">
        <button
          ref={menuTriggerRef}
          type="button"
          aria-label="Open navigation"
          aria-expanded={drawerOpen}
          aria-controls={DRAWER_ID}
          onClick={() => {
            shouldFocusRef.current = true;
            setDrawerOpen(true);
          }}
          className={cx(iconButton, "inline-flex lg:hidden", transition, focus)}
        >
          <Menu aria-hidden="true" className="h-4 w-4" />
        </button>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]">
          S
        </span>
        <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
          Sundial
        </p>

        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          aria-controls={SIDEBAR_ID}
          onClick={() => setCollapsed((value) => !value)}
          className={cx(
            iconButton,
            "ml-1 hidden lg:inline-flex",
            transition,
            focus,
          )}
        >
          <PanelLeft aria-hidden="true" className="h-4 w-4" />
        </button>

        <div className="mx-4 hidden min-w-0 flex-1 justify-center md:flex">
          <div className="w-full max-w-md">{renderSearch(searchRef, true)}</div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
          <button
            ref={searchTriggerRef}
            type="button"
            aria-label="Search contracts"
            aria-expanded={mobileSearch}
            onClick={() => setMobileSearch((value) => !value)}
            className={cx(
              iconButton,
              "inline-flex md:hidden",
              transition,
              focus,
            )}
          >
            <Search aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className={cx(
              iconButton,
              "hidden sm:inline-flex",
              transition,
              focus,
            )}
          >
            <Bell aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Workspace settings"
            className={cx(
              iconButton,
              "hidden sm:inline-flex",
              transition,
              focus,
            )}
          >
            <Settings aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Create contract"
            className={cx(
              "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] sm:w-auto sm:px-3 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
              transition,
              focus,
            )}
          >
            <Plus aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Create</span>
          </button>
          <AccountMenu />
        </div>
      </header>

      {mobileSearch && (
        <div className="flex shrink-0 items-center gap-2 border-b border-neutral-200/70 px-4 py-2 md:hidden dark:border-neutral-800">
          {renderSearch(mobileSearchRef, false)}
          <button
            type="button"
            aria-label="Close search"
            onClick={() => {
              setMobileSearch(false);
              searchTriggerRef.current?.focus({ preventScroll: true });
            }}
            className={cx(iconButton, "inline-flex", transition, focus)}
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <aside
          id={SIDEBAR_ID}
          className={cx(
            "hidden shrink-0 flex-col bg-neutral-50 transition-[width] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none lg:flex dark:bg-neutral-900",
            collapsed ? "w-14" : "w-64",
          )}
        >
          <SidebarNav collapsed={collapsed} />
        </aside>

        <div className="relative flex min-h-0 min-w-0 flex-1">
          <main
            id="contracts"
            ref={content.ref}
            onScroll={content.onScroll}
            className="h-full w-full overflow-y-auto p-4 sm:p-6"
          >
            <h1 className="text-xl font-medium tracking-[-0.015em] text-neutral-900 dark:text-neutral-100">
              Contracts
            </h1>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {METRICS.map((metric, index) => (
                <div
                  key={metric.label}
                  className={cx(
                    "rounded-[var(--rb-r-xl,12px)] border border-neutral-200/70 p-4 dark:border-neutral-800",
                    index === METRICS.length - 1 &&
                      "sm:col-span-2 lg:col-span-1",
                  )}
                >
                  <p className="truncate text-[13px] text-neutral-500 dark:text-neutral-500">
                    {metric.label}
                  </p>
                  <p className="mt-1 text-xl font-medium tabular-nums tracking-[-0.015em] text-neutral-900 dark:text-neutral-100">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-baseline gap-2">
                <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Upcoming renewals
                </h2>
                <span className="shrink-0 text-xs tabular-nums text-neutral-500 dark:text-neutral-500">
                  {countLabel}
                </span>
              </div>

              <div
                role="radiogroup"
                aria-label="Filter agreements"
                onKeyDown={onFilterKeyDown}
                className="inline-flex h-8 shrink-0 items-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 p-0.5 dark:bg-neutral-800"
              >
                {FILTERS.map((item) => {
                  const active = item.label === filter;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      tabIndex={active ? 0 : -1}
                      onClick={() => setFilter(item.label)}
                      className={cx(
                        "inline-flex h-7 cursor-pointer items-center rounded-[var(--rb-r-sm,6px)] px-2.5 text-[13px] font-medium active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]",
                        active
                          ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-neutral-950 dark:text-neutral-100 dark:shadow-none"
                          : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
                        transition,
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {visible.length === 0 ? (
              <div className="mt-3 flex flex-col items-center justify-center rounded-[var(--rb-r-xl,12px)] border border-neutral-200/70 px-6 py-12 text-center dark:border-neutral-800">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  No agreements match this search
                </p>
                <p className="mt-1 max-w-xs text-xs text-neutral-600 dark:text-neutral-400">
                  Try a contract name or a counterparty, such as Kestrel
                  Digital.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setFilter(FILTERS[0].label);
                  }}
                  className={cx(
                    "mt-4 inline-flex h-9 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50 active:scale-[0.97] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800",
                    transition,
                    focus,
                  )}
                >
                  Clear search
                </button>
              </div>
            ) : (
              <>
                <div className="mt-3 hidden overflow-hidden rounded-[var(--rb-r-xl,12px)] border border-neutral-200/70 md:block dark:border-neutral-800">
                  <table className="w-full table-fixed border-collapse text-left">
                    <caption className="sr-only">
                      Agreements by renewal date
                    </caption>
                    <colgroup>
                      <col className="w-[34%]" />
                      <col className="w-[18%]" />
                      <col className="w-[14%]" />
                      <col className="w-[15%]" />
                      <col className="w-[19%]" />
                    </colgroup>
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-900/60">
                        <th
                          scope="col"
                          className="h-9 pl-4 pr-3 text-xs font-medium text-neutral-500 dark:text-neutral-500"
                        >
                          Contract
                        </th>
                        <th
                          scope="col"
                          className="h-9 px-3 text-xs font-medium text-neutral-500 dark:text-neutral-500"
                        >
                          Owner
                        </th>
                        <th
                          scope="col"
                          className="h-9 px-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-500"
                        >
                          Value
                        </th>
                        <th
                          scope="col"
                          className="h-9 px-3 text-xs font-medium text-neutral-500 dark:text-neutral-500"
                        >
                          Renews
                        </th>
                        <th
                          scope="col"
                          className="h-9 pl-3 pr-4 text-xs font-medium text-neutral-500 dark:text-neutral-500"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/70">
                      {visible.map((row) => (
                        <tr
                          key={`${row.name}-${row.counterparty}`}
                          className={cx(
                            "h-11 hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
                            transition,
                          )}
                        >
                          <td className="pl-4 pr-3">
                            <div className="min-w-0">
                              <a
                                href="#contracts"
                                className={cx(
                                  "block truncate text-[13px] text-neutral-900 hover:underline dark:text-neutral-100",
                                  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]",
                                )}
                              >
                                {row.name}
                              </a>
                              <p className="truncate text-xs text-neutral-500 dark:text-neutral-500">
                                {row.counterparty}
                              </p>
                            </div>
                          </td>
                          <td className="truncate px-3 text-[13px] text-neutral-600 dark:text-neutral-400">
                            {row.owner}
                          </td>
                          <td className="px-3 text-right text-[13px] tabular-nums text-neutral-900 dark:text-neutral-100">
                            {row.value}
                          </td>
                          <td className="px-3 text-[13px] tabular-nums text-neutral-600 dark:text-neutral-400">
                            {row.renews}
                          </td>
                          <td className="pl-3 pr-4">
                            <StatusCell status={row.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <ul className="mt-3 space-y-2 md:hidden">
                  {visible.map((row) => (
                    <li
                      key={`${row.name}-${row.counterparty}`}
                      className="rounded-[var(--rb-r-xl,12px)] border border-neutral-200/70 p-4 dark:border-neutral-800"
                    >
                      <a
                        href="#contracts"
                        className={cx(
                          "block truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100",
                          focus,
                        )}
                      >
                        {row.name}
                      </a>
                      <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-500">
                        {row.counterparty}
                      </p>
                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                        <div className="min-w-0">
                          <dt className="text-xs text-neutral-500 dark:text-neutral-500">
                            Owner
                          </dt>
                          <dd className="truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                            {row.owner}
                          </dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-xs text-neutral-500 dark:text-neutral-500">
                            Value
                          </dt>
                          <dd className="truncate text-[13px] tabular-nums text-neutral-900 dark:text-neutral-100">
                            {row.value}
                          </dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-xs text-neutral-500 dark:text-neutral-500">
                            Renews
                          </dt>
                          <dd className="truncate text-[13px] tabular-nums text-neutral-900 dark:text-neutral-100">
                            {row.renews}
                          </dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-xs text-neutral-500 dark:text-neutral-500">
                            Status
                          </dt>
                          <dd>
                            <StatusCell status={row.status} />
                          </dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ul>
              </>
            )}
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
            aria-label="Close navigation overlay"
            tabIndex={-1}
            onClick={closeDrawer}
            className={cx(
              "absolute inset-0 z-30 cursor-pointer bg-neutral-950/40 backdrop-blur-[2px] transition-opacity duration-200 ease-out motion-reduce:transition-none dark:bg-neutral-950/60",
              drawerShown ? "opacity-100" : "opacity-0",
            )}
          />
          <aside
            ref={drawerRef}
            id={DRAWER_ID}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className={cx(
              "absolute inset-y-0 left-0 z-40 flex w-72 max-w-[85%] flex-col rounded-r-[var(--rb-r-4xl,18px)] bg-white shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)] transition-transform duration-[320ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none dark:bg-neutral-900 dark:shadow-none",
              drawerShown ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <SidebarNav collapsed={false} onClose={closeDrawer} />
          </aside>
        </div>
      )}
    </div>
  );
}
