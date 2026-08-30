"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import {
  Bell,
  Check,
  ChevronRight,
  ChevronsUpDown,
  Database,
  GitBranch,
  Globe,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  ScrollText,
  Search,
  Settings,
  Users,
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

const focusRing =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const insetFocusRing =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const colorTransition =
  "transition-[background-color,border-color,color,opacity] duration-150 ease-out";

const tertiaryButton =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[var(--rb-r-md,8px)] bg-neutral-100 font-medium text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100";

const pressTransition =
  "transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none";

const menuSurface =
  "z-30 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200 bg-white p-1 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.10)] outline-none transition-[opacity,transform] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none";

const menuItem =
  "flex h-8 w-full cursor-pointer items-center gap-2 rounded-[var(--rb-r-lg,10px)] px-2 text-left text-[13px] text-neutral-700 dark:text-neutral-300";

const ORGANISATIONS = ["Northwind Labs", "Halden Group", "Corran Health"];

const PROJECTS = [
  { name: "Payments API", slug: "payments-api" },
  { name: "Ledger core", slug: "ledger-core" },
  { name: "Merchant portal", slug: "merchant-portal" },
  { name: "Risk engine", slug: "risk-engine" },
];

const ENVIRONMENTS = ["Production", "Staging", "Preview"];

type Status = "active" | "syncing" | "paused" | "degraded";

type Resource = {
  suffix: string;
  region: string;
  status: Status;
  connections: number;
  backup: string | null;
};

const STATUS_LABEL: Record<Status, string> = {
  active: "Active",
  syncing: "Syncing",
  paused: "Paused",
  degraded: "Degraded",
};

const STATUS_DOT: Record<Status, string> = {
  active: "bg-neutral-300 dark:bg-neutral-600",
  syncing:
    "bg-neutral-400 animate-pulse motion-reduce:animate-none dark:bg-neutral-500",
  paused: "bg-neutral-300 dark:bg-neutral-600",
  degraded: "bg-amber-500",
};

const RESOURCES: Record<string, Resource[]> = {
  Production: [
    {
      suffix: "primary",
      region: "eu-west-1",
      status: "active",
      connections: 184,
      backup: "7 Apr 2026",
    },
    {
      suffix: "replica-a",
      region: "eu-west-1",
      status: "active",
      connections: 96,
      backup: "7 Apr 2026",
    },
    {
      suffix: "replica-b",
      region: "eu-west-1",
      status: "active",
      connections: 88,
      backup: "7 Apr 2026",
    },
    {
      suffix: "read-replica-analytics-frankfurt-standby",
      region: "eu-central-1",
      status: "degraded",
      connections: 41,
      backup: "6 Apr 2026",
    },
    {
      suffix: "sessions",
      region: "us-east-1",
      status: "active",
      connections: 310,
      backup: "7 Apr 2026",
    },
    {
      suffix: "jobs",
      region: "eu-west-1",
      status: "active",
      connections: 22,
      backup: "7 Apr 2026",
    },
    {
      suffix: "audit-log",
      region: "ap-southeast-2",
      status: "active",
      connections: 12,
      backup: "7 Apr 2026",
    },
    {
      suffix: "search-index",
      region: "eu-west-1",
      status: "syncing",
      connections: 6,
      backup: null,
    },
    {
      suffix: "billing",
      region: "eu-west-1",
      status: "active",
      connections: 47,
      backup: "7 Apr 2026",
    },
    {
      suffix: "webhooks",
      region: "us-west-2",
      status: "active",
      connections: 31,
      backup: "6 Apr 2026",
    },
    {
      suffix: "cache-meta",
      region: "eu-west-1",
      status: "active",
      connections: 15,
      backup: "7 Apr 2026",
    },
    {
      suffix: "reporting",
      region: "eu-central-1",
      status: "active",
      connections: 28,
      backup: "7 Apr 2026",
    },
    {
      suffix: "archive-2025",
      region: "us-east-1",
      status: "paused",
      connections: 0,
      backup: "1 Apr 2026",
    },
    {
      suffix: "restore-drill",
      region: "us-east-1",
      status: "paused",
      connections: 0,
      backup: "5 Apr 2026",
    },
  ],
  Staging: [
    {
      suffix: "primary",
      region: "eu-west-1",
      status: "active",
      connections: 24,
      backup: "7 Apr 2026",
    },
    {
      suffix: "replica-a",
      region: "eu-west-1",
      status: "active",
      connections: 11,
      backup: "7 Apr 2026",
    },
    {
      suffix: "read-replica-analytics-frankfurt-standby",
      region: "eu-central-1",
      status: "active",
      connections: 8,
      backup: "6 Apr 2026",
    },
    {
      suffix: "sessions",
      region: "us-east-1",
      status: "active",
      connections: 19,
      backup: "7 Apr 2026",
    },
    {
      suffix: "jobs",
      region: "eu-west-1",
      status: "active",
      connections: 5,
      backup: "7 Apr 2026",
    },
    {
      suffix: "audit-log",
      region: "ap-southeast-2",
      status: "active",
      connections: 3,
      backup: "6 Apr 2026",
    },
    {
      suffix: "search-index",
      region: "eu-west-1",
      status: "syncing",
      connections: 2,
      backup: null,
    },
    {
      suffix: "billing",
      region: "eu-west-1",
      status: "active",
      connections: 7,
      backup: "7 Apr 2026",
    },
    {
      suffix: "webhooks",
      region: "us-west-2",
      status: "active",
      connections: 4,
      backup: "7 Apr 2026",
    },
    {
      suffix: "seed-data",
      region: "eu-west-1",
      status: "active",
      connections: 1,
      backup: "5 Apr 2026",
    },
    {
      suffix: "load-test",
      region: "us-east-1",
      status: "paused",
      connections: 0,
      backup: "2 Apr 2026",
    },
    {
      suffix: "archive-2025",
      region: "us-east-1",
      status: "paused",
      connections: 0,
      backup: "1 Apr 2026",
    },
    {
      suffix: "fixtures",
      region: "eu-west-1",
      status: "active",
      connections: 2,
      backup: "4 Apr 2026",
    },
  ],
  Preview: [
    {
      suffix: "primary",
      region: "eu-west-1",
      status: "active",
      connections: 3,
      backup: "7 Apr 2026",
    },
    {
      suffix: "pr-4821",
      region: "eu-west-1",
      status: "active",
      connections: 2,
      backup: null,
    },
    {
      suffix: "pr-4817",
      region: "eu-west-1",
      status: "active",
      connections: 1,
      backup: null,
    },
    {
      suffix: "pr-4802-checkout-redesign-rollback",
      region: "eu-west-1",
      status: "syncing",
      connections: 0,
      backup: null,
    },
    {
      suffix: "sessions",
      region: "eu-west-1",
      status: "active",
      connections: 2,
      backup: "6 Apr 2026",
    },
    {
      suffix: "jobs",
      region: "eu-west-1",
      status: "active",
      connections: 1,
      backup: "6 Apr 2026",
    },
    {
      suffix: "search-index",
      region: "eu-west-1",
      status: "active",
      connections: 1,
      backup: "5 Apr 2026",
    },
    {
      suffix: "billing",
      region: "eu-central-1",
      status: "active",
      connections: 1,
      backup: "5 Apr 2026",
    },
    {
      suffix: "webhooks",
      region: "eu-west-1",
      status: "paused",
      connections: 0,
      backup: "4 Apr 2026",
    },
    {
      suffix: "seed-data",
      region: "eu-west-1",
      status: "active",
      connections: 1,
      backup: "4 Apr 2026",
    },
    {
      suffix: "pr-4788",
      region: "us-east-1",
      status: "paused",
      connections: 0,
      backup: "3 Apr 2026",
    },
    {
      suffix: "pr-4771",
      region: "us-east-1",
      status: "paused",
      connections: 0,
      backup: "2 Apr 2026",
    },
    {
      suffix: "fixtures",
      region: "eu-west-1",
      status: "active",
      connections: 1,
      backup: "3 Apr 2026",
    },
  ],
};

const NAV_GROUPS = [
  {
    label: "Project",
    items: [
      { label: "Overview", icon: LayoutDashboard },
      {
        label: "Data",
        icon: Database,
        children: ["Databases", "Backups", "Migrations"],
      },
      { label: "Deployments", icon: GitBranch },
      { label: "Logs", icon: ScrollText },
    ],
  },
  {
    label: "Environment",
    items: [
      { label: "Variables", icon: KeyRound },
      { label: "Domains", icon: Globe },
      { label: "Access", icon: Users },
    ],
  },
];

const ACCOUNT_MENU = [
  { label: "Account settings", icon: Settings },
  { label: "Notification preferences", icon: Bell },
  { label: "Help centre", icon: LifeBuoy },
  { label: "Sign out", icon: LogOut },
];

function useDismiss(
  open: boolean,
  ref: RefObject<HTMLElement | null>,
  onDismiss: (restoreFocus: boolean) => void,
) {
  const handler = useRef(onDismiss);

  useEffect(() => {
    handler.current = onDismiss;
  });

  useEffect(() => {
    if (!open) return;
    const doc = ref.current?.ownerDocument ?? document;

    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) handler.current(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      handler.current(true);
    };

    doc.addEventListener("pointerdown", onPointerDown);
    doc.addEventListener("keydown", onKeyDown);
    return () => {
      doc.removeEventListener("pointerdown", onPointerDown);
      doc.removeEventListener("keydown", onKeyDown);
    };
  }, [open, ref]);
}

function StatusMark({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-neutral-600 dark:text-neutral-400">
      <span
        aria-hidden="true"
        className={cx("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[status])}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}

type ScopeSection = {
  label: string;
  options: string[];
  value: string;
  onSelect: (next: string) => void;
};

function ScopeMenu({
  id,
  label,
  display,
  sections,
  createLabel,
  open,
  onOpenChange,
  className,
  triggerMaxWidth,
}: {
  id: string;
  label: string;
  display?: string;
  sections: ScopeSection[];
  createLabel?: string;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  className?: string;
  triggerMaxWidth?: string;
}) {
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | undefined>(undefined);

  const flat = sections.flatMap((section, sectionIndex) =>
    section.options.map((name) => ({ sectionIndex, name })),
  );
  const total = flat.length + (createLabel ? 1 : 0);

  const close = (restoreFocus: boolean) => {
    setShown(false);
    onOpenChange(false);
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
  };

  useDismiss(open, rootRef, close);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => () => cancelAnimationFrame(frameRef.current ?? 0), []);

  const openMenu = (withAnimation: boolean) => {
    const current = flat.findIndex(
      (item) => sections[item.sectionIndex].value === item.name,
    );
    setActive(current < 0 ? 0 : current);
    onOpenChange(true);
    if (withAnimation) {
      setShown(false);
      frameRef.current = requestAnimationFrame(() => setShown(true));
    } else {
      setShown(true);
    }
  };

  const select = (index: number) => {
    const item = flat[index];
    if (item) sections[item.sectionIndex].onSelect(item.name);
    close(true);
  };

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    openMenu(false);
    if (event.key === "ArrowUp") setActive(total - 1);
  };

  const onMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((i) => (i + 1) % total);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((i) => (i - 1 + total) % total);
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(total - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        select(active);
        break;
      case "Tab":
        close(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className={cx("relative shrink-0", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={display ? `${label}: ${display}` : label}
        onClick={() => (open ? close(false) : openMenu(true))}
        onKeyDown={onTriggerKeyDown}
        className={cx(
          display ? "h-8 px-2.5" : "h-8 w-8",
          "text-[13px]",
          tertiaryButton,
          pressTransition,
          focusRing,
        )}
      >
        {display ? (
          <>
            <span className={cx("truncate", triggerMaxWidth)}>{display}</span>
            <ChevronsUpDown
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 text-neutral-500 dark:text-neutral-500"
            />
          </>
        ) : (
          <MoreHorizontal aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
        )}
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={label}
          aria-activedescendant={`${id}-item-${active}`}
          tabIndex={-1}
          onKeyDown={onMenuKeyDown}
          className={cx(
            "absolute left-0 top-full mt-2 w-60 origin-top-left",
            menuSurface,
            shown ? "scale-100 opacity-100" : "scale-95 opacity-0",
          )}
        >
          {sections.map((section, sectionIndex) => {
            const offset = sections
              .slice(0, sectionIndex)
              .reduce((sum, item) => sum + item.options.length, 0);
            return (
              <div
                key={section.label}
                role="group"
                aria-label={section.label}
                className={sectionIndex > 0 ? "mt-1" : undefined}
              >
                {sections.length > 1 && (
                  <p className="px-2 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                    {section.label}
                  </p>
                )}
                {section.options.map((name, optionIndex) => {
                  const index = offset + optionIndex;
                  const selected = name === section.value;
                  return (
                    <button
                      key={name}
                      id={`${id}-item-${index}`}
                      type="button"
                      role="menuitemradio"
                      aria-checked={selected}
                      tabIndex={-1}
                      onClick={() => select(index)}
                      onPointerMove={() => setActive(index)}
                      className={cx(
                        menuItem,
                        pressTransition,
                        "active:scale-[0.99]",
                        index === active &&
                          "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100",
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate">{name}</span>
                      {selected && (
                        <Check
                          aria-hidden="true"
                          className="h-3.5 w-3.5 shrink-0 text-neutral-900 dark:text-neutral-100"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {createLabel && (
            <button
              id={`${id}-item-${total - 1}`}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => close(true)}
              onPointerMove={() => setActive(total - 1)}
              className={cx(
                menuItem,
                "mt-1",
                pressTransition,
                "active:scale-[0.99]",
                active === total - 1 &&
                  "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100",
              )}
            >
              <Plus
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0 text-neutral-500 dark:text-neutral-500"
              />
              <span className="truncate">{createLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SystemStatus({
  regions,
  degradedRegion,
  open,
  onOpenChange,
}: {
  regions: string[];
  degradedRegion: string | null;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const [shown, setShown] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<number | undefined>(undefined);

  const close = (restoreFocus: boolean) => {
    setShown(false);
    onOpenChange(false);
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
  };

  useDismiss(open, rootRef, close);

  useEffect(() => () => cancelAnimationFrame(frameRef.current ?? 0), []);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={
          degradedRegion
            ? `System status: degraded in ${degradedRegion}`
            : "System status: operational"
        }
        onClick={() => {
          if (open) {
            close(false);
            return;
          }
          onOpenChange(true);
          setShown(false);
          frameRef.current = requestAnimationFrame(() => setShown(true));
        }}
        className={cx(
          "h-8 px-2.5 text-[13px]",
          tertiaryButton,
          pressTransition,
          focusRing,
        )}
      >
        <span
          aria-hidden="true"
          className={cx(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            degradedRegion
              ? "bg-amber-500"
              : "bg-neutral-400 dark:bg-neutral-500",
          )}
        />
        <span className="truncate">
          {degradedRegion ? "Degraded" : "Operational"}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="System status"
          className={cx(
            "absolute right-0 top-full mt-2 w-72 origin-top-right",
            menuSurface,
            shown ? "scale-100 opacity-100" : "scale-95 opacity-0",
          )}
        >
          <p className="px-2 pb-2 pt-1.5 text-[13px] text-neutral-600 dark:text-neutral-400">
            {degradedRegion
              ? `Write latency is above target in ${degradedRegion}.`
              : "All regions are serving traffic normally."}
          </p>
          <ul>
            {regions.map((region) => (
              <li
                key={region}
                className="flex h-8 items-center justify-between gap-3 rounded-[var(--rb-r-lg,10px)] px-2"
              >
                <span className="min-w-0 truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                  {region}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] text-neutral-600 dark:text-neutral-400">
                  <span
                    aria-hidden="true"
                    className={cx(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      region === degradedRegion
                        ? "bg-amber-500"
                        : "bg-neutral-300 dark:bg-neutral-600",
                    )}
                  />
                  {region === degradedRegion ? "Degraded" : "Operational"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SidebarBody({
  idPrefix,
  dataOpen,
  onDataToggle,
  announcement,
  onDismissAnnouncement,
  onClose,
}: {
  idPrefix: string;
  dataOpen: boolean;
  onDataToggle: () => void;
  announcement: "shown" | "leaving" | "gone";
  onDismissAnnouncement: () => void;
  onClose?: () => void;
}) {
  const [accountOpen, setAccountOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const nav = useScrollFade<HTMLElement>();
  const footerRef = useRef<HTMLDivElement>(null);
  const accountTriggerRef = useRef<HTMLButtonElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | undefined>(undefined);

  const closeAccount = (restoreFocus: boolean) => {
    setAccountOpen(false);
    setShown(false);
    if (restoreFocus) accountTriggerRef.current?.focus({ preventScroll: true });
  };

  useDismiss(accountOpen, footerRef, closeAccount);

  useEffect(() => () => cancelAnimationFrame(frameRef.current ?? 0), []);

  const onAccountKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      accountMenuRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]',
      ) ?? [],
    );
    if (items.length === 0) return;
    const doc = accountMenuRef.current?.ownerDocument ?? document;
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

  return (
    <>
      <div className="flex shrink-0 items-center gap-2 p-3">
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-500"
          />
          <label className="sr-only" htmlFor={`${idPrefix}-search`}>
            Search this project
          </label>
          <input
            id={`${idPrefix}-search`}
            type="search"
            placeholder="Search"
            className={cx(
              "h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pl-8 pr-3 text-sm text-neutral-900 placeholder:text-neutral-500 hover:border-neutral-300 focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white",
              colorTransition,
              focusRing,
            )}
          />
        </div>
        {onClose && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className={cx(
              "h-9 w-9 shrink-0",
              tertiaryButton,
              pressTransition,
              focusRing,
            )}
          >
            <X aria-hidden="true" className="h-4 w-4 shrink-0" />
          </button>
        )}
      </div>

      <div className="relative min-h-0 flex-1">
        <nav
          ref={nav.ref}
          onScroll={nav.onScroll}
          aria-label="Project"
          className="h-full space-y-4 overflow-y-auto px-2 pb-2"
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  if (!item.children) {
                    return (
                      <li key={item.label}>
                        <a
                          href="#databases"
                          className={cx(
                            "flex h-8 cursor-pointer items-center gap-2 rounded-[var(--rb-r-md,8px)] px-3 text-[13px] text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:active:bg-neutral-700",
                            colorTransition,
                            focusRing,
                          )}
                        >
                          <Icon
                            aria-hidden="true"
                            className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-500"
                          />
                          <span className="min-w-0 flex-1 truncate">
                            {item.label}
                          </span>
                        </a>
                      </li>
                    );
                  }

                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        aria-expanded={dataOpen}
                        aria-controls={`${idPrefix}-${item.label.toLowerCase()}`}
                        onClick={onDataToggle}
                        className={cx(
                          "flex h-8 w-full cursor-pointer items-center gap-2 rounded-[var(--rb-r-md,8px)] px-3 text-left text-[13px] text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:active:bg-neutral-700",
                          colorTransition,
                          focusRing,
                        )}
                      >
                        <Icon
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-500"
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {item.label}
                        </span>
                        <ChevronRight
                          aria-hidden="true"
                          className={cx(
                            "h-3.5 w-3.5 shrink-0 text-neutral-500 transition-transform duration-200 ease-out motion-reduce:transition-none dark:text-neutral-500",
                            dataOpen && "rotate-90",
                          )}
                        />
                      </button>
                      <div
                        id={`${idPrefix}-${item.label.toLowerCase()}`}
                        className={cx(
                          "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
                          dataOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                        )}
                      >
                        <ul className="overflow-hidden">
                          {item.children.map((child, childIndex) => {
                            const current = childIndex === 0;
                            return (
                              <li key={child} className="pt-0.5">
                                <a
                                  href="#databases"
                                  aria-current={current ? "page" : undefined}
                                  className={cx(
                                    "flex h-8 cursor-pointer items-center rounded-[var(--rb-r-md,8px)] pl-9 pr-3 text-[13px] active:bg-neutral-200 dark:active:bg-neutral-700",
                                    current
                                      ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                                    colorTransition,
                                    focusRing,
                                  )}
                                >
                                  <span className="min-w-0 flex-1 truncate">
                                    {child}
                                  </span>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
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

      {announcement !== "gone" && (
        <div className="shrink-0 px-2 pb-2">
          <div
            className={cx(
              "rounded-[var(--rb-r-lg,10px)] bg-white p-3 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none dark:bg-neutral-800/60",
              announcement === "leaving"
                ? "translate-y-1 opacity-0"
                : "translate-y-0 opacity-100",
            )}
          >
            <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
              Point-in-time restore
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
              Rewind any database to any point in the last 30 days.
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                className={cx(
                  "h-7 px-2 text-xs",
                  tertiaryButton,
                  pressTransition,
                  focusRing,
                )}
              >
                Read more
              </button>
              <button
                type="button"
                onClick={onDismissAnnouncement}
                className={cx(
                  "h-7 px-2 text-xs",
                  tertiaryButton,
                  pressTransition,
                  focusRing,
                )}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div ref={footerRef} className="relative shrink-0 px-2 pb-2">
        <button
          ref={accountTriggerRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={accountOpen}
          onClick={() => {
            if (accountOpen) {
              closeAccount(false);
              return;
            }
            setAccountOpen(true);
            setShown(false);
            frameRef.current = requestAnimationFrame(() => setShown(true));
          }}
          className={cx(
            "flex h-12 w-full cursor-pointer items-center gap-2.5 rounded-[var(--rb-r-lg,10px)] px-2 text-left hover:bg-white active:bg-neutral-200 dark:hover:bg-neutral-800 dark:active:bg-neutral-700",
            colorTransition,
            focusRing,
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
            DW
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
              Dana Whitfield
            </span>
            <span className="block truncate text-xs text-neutral-500 dark:text-neutral-500">
              dana.whitfield@northwindlabs.com
            </span>
          </span>
          <ChevronsUpDown
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-500"
          />
        </button>

        {accountOpen && (
          <div
            ref={accountMenuRef}
            role="menu"
            aria-label="Account"
            onKeyDown={onAccountKeyDown}
            className={cx(
              "absolute bottom-[calc(100%-0.5rem)] left-2 right-2 origin-bottom",
              menuSurface,
              shown ? "scale-100 opacity-100" : "scale-95 opacity-0",
            )}
          >
            {ACCOUNT_MENU.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                role="menuitem"
                onClick={() => closeAccount(true)}
                className={cx(
                  menuItem,
                  "hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.99] dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                  pressTransition,
                  insetFocusRing,
                )}
              >
                <Icon
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-500"
                />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function ResourceTable({ rows, slug }: { rows: Resource[]; slug: string }) {
  return (
    <>
      <table className="hidden w-full table-fixed border-collapse text-left md:table">
        <caption className="sr-only">
          Databases in the selected project and environment
        </caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky top-0 z-20 h-9 w-[32%] bg-neutral-50 px-3 text-xs font-medium text-neutral-500 first:pl-4 sm:first:pl-6 dark:bg-neutral-900"
            >
              Database
            </th>
            <th
              scope="col"
              className="sticky top-0 z-20 h-9 w-[18%] bg-neutral-50 px-3 text-xs font-medium text-neutral-500 dark:bg-neutral-900"
            >
              Region
            </th>
            <th
              scope="col"
              className="sticky top-0 z-20 h-9 w-[18%] bg-neutral-50 px-3 text-xs font-medium text-neutral-500 dark:bg-neutral-900"
            >
              Status
            </th>
            <th
              scope="col"
              className="sticky top-0 z-20 h-9 w-[16%] bg-neutral-50 px-3 text-right text-xs font-medium text-neutral-500 dark:bg-neutral-900"
            >
              Connections
            </th>
            <th
              scope="col"
              className="sticky top-0 z-20 h-9 w-[16%] bg-neutral-50 px-3 text-xs font-medium text-neutral-500 last:pr-4 sm:last:pr-6 dark:bg-neutral-900"
            >
              Last backup
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/70">
          {rows.map((row) => (
            <tr
              key={row.suffix}
              className="h-11 transition-colors duration-150 ease-out hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            >
              <td className="truncate px-3 text-[13px] text-neutral-900 first:pl-4 sm:first:pl-6 dark:text-neutral-100">
                {slug}-{row.suffix}
              </td>
              <td className="truncate px-3 text-[13px] text-neutral-600 dark:text-neutral-400">
                {row.region}
              </td>
              <td className="px-3">
                <StatusMark status={row.status} />
              </td>
              <td className="px-3 text-right text-[13px] tabular-nums text-neutral-900 dark:text-neutral-100">
                {row.connections}
              </td>
              <td className="truncate px-3 text-[13px] tabular-nums text-neutral-600 last:pr-4 sm:last:pr-6 dark:text-neutral-400">
                {row.backup ?? (
                  <span className="text-neutral-400 dark:text-neutral-600">
                    -
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="space-y-2 px-4 pb-4 md:hidden">
        {rows.map((row) => (
          <li
            key={row.suffix}
            className="rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 p-3 dark:border-neutral-800"
          >
            <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
              {slug}-{row.suffix}
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <StatusMark status={row.status} />
              <span className="shrink-0 text-[13px] text-neutral-600 dark:text-neutral-400">
                {row.region}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3 text-[13px] text-neutral-600 dark:text-neutral-400">
              <span>
                <span className="text-neutral-500">Connections </span>
                <span className="tabular-nums text-neutral-900 dark:text-neutral-100">
                  {row.connections}
                </span>
              </span>
              <span className="shrink-0 tabular-nums">
                {row.backup ?? (
                  <span className="text-neutral-400 dark:text-neutral-600">
                    -
                  </span>
                )}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function AppShell7() {
  const content = useScrollFade<HTMLDivElement>();
  const [organisation, setOrganisation] = useState(ORGANISATIONS[0]);
  const [project, setProject] = useState(PROJECTS[0].name);
  const [environment, setEnvironment] = useState(ENVIRONMENTS[0]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [dataOpen, setDataOpen] = useState(true);
  const [announcement, setAnnouncement] = useState<
    "shown" | "leaving" | "gone"
  >("shown");
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerShown, setDrawerShown] = useState(false);
  const shouldFocusRef = useRef(false);
  const drawerTriggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => () => clearTimeout(dismissTimer.current), []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const view =
        drawerTriggerRef.current?.ownerDocument.defaultView ?? window;
      if (view.matchMedia("(max-width: 1023px)").matches) setDrawerOpen(true);
    });
    return () => cancelAnimationFrame(frame);
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
        drawerTriggerRef.current?.focus({ preventScroll: true });
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

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerShown(false);
    drawerTriggerRef.current?.focus({ preventScroll: true });
  };

  const dismissAnnouncement = () => {
    setAnnouncement("leaving");
    dismissTimer.current = setTimeout(() => setAnnouncement("gone"), 200);
  };

  const rows = RESOURCES[environment];
  const slug =
    PROJECTS.find((item) => item.name === project)?.slug ?? PROJECTS[0].slug;
  const regions = Array.from(new Set(rows.map((row) => row.region)));
  const degradedRegion =
    rows.find((row) => row.status === "degraded")?.region ?? null;

  const toggleMenu = (id: string) => (next: boolean) =>
    setOpenMenu(next ? id : null);

  const orgSection: ScopeSection = {
    label: "Organisation",
    options: ORGANISATIONS,
    value: organisation,
    onSelect: setOrganisation,
  };
  const projectSection: ScopeSection = {
    label: "Project",
    options: PROJECTS.map((item) => item.name),
    value: project,
    onSelect: setProject,
  };

  return (
    <div className="relative flex h-full min-h-[720px] w-full flex-col overflow-hidden bg-white dark:bg-neutral-950">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200/70 px-4 sm:px-6 dark:border-neutral-800">
        <button
          ref={drawerTriggerRef}
          type="button"
          aria-label="Open navigation"
          aria-expanded={drawerOpen}
          onClick={() => {
            shouldFocusRef.current = true;
            setDrawerOpen(true);
          }}
          className={cx(
            "h-8 w-8 shrink-0 lg:hidden",
            tertiaryButton,
            pressTransition,
            focusRing,
          )}
        >
          <Menu aria-hidden="true" className="h-4 w-4 shrink-0" />
        </button>

        <span
          aria-hidden="true"
          className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[11px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] sm:flex dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
        >
          T
        </span>
        <span className="sr-only">Tideline</span>

        <nav
          aria-label="Scope"
          className="flex min-w-0 flex-1 items-center gap-1"
        >
          <ScopeMenu
            id="scope-organisation"
            label="Organisation"
            display={organisation}
            sections={[orgSection]}
            createLabel="Create organisation"
            open={openMenu === "organisation"}
            onOpenChange={toggleMenu("organisation")}
            className="hidden md:block"
            triggerMaxWidth="max-w-[9rem]"
          />
          <span
            aria-hidden="true"
            className="hidden select-none text-neutral-300 md:inline dark:text-neutral-700"
          >
            /
          </span>
          <ScopeMenu
            id="scope-project"
            label="Project"
            display={project}
            sections={[projectSection]}
            createLabel="Create project"
            open={openMenu === "project"}
            onOpenChange={toggleMenu("project")}
            className="hidden md:block"
            triggerMaxWidth="max-w-[9rem]"
          />
          <ScopeMenu
            id="scope-overflow"
            label="Organisation and project"
            sections={[orgSection, projectSection]}
            open={openMenu === "overflow"}
            onOpenChange={toggleMenu("overflow")}
            className="md:hidden"
          />
          <span
            aria-hidden="true"
            className="select-none text-neutral-300 dark:text-neutral-700"
          >
            /
          </span>
          <ScopeMenu
            id="scope-environment"
            label="Environment"
            display={environment}
            sections={[
              {
                label: "Environment",
                options: ENVIRONMENTS,
                value: environment,
                onSelect: setEnvironment,
              },
            ]}
            createLabel="Create environment"
            open={openMenu === "environment"}
            onOpenChange={toggleMenu("environment")}
            triggerMaxWidth="max-w-[7rem]"
          />
        </nav>

        <SystemStatus
          regions={regions}
          degradedRegion={degradedRegion}
          open={openMenu === "status"}
          onOpenChange={toggleMenu("status")}
        />
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 flex-col bg-neutral-50 lg:flex dark:bg-neutral-900">
          <SidebarBody
            idPrefix="sidebar"
            dataOpen={dataOpen}
            onDataToggle={() => setDataOpen((v) => !v)}
            announcement={announcement}
            onDismissAnnouncement={dismissAnnouncement}
          />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center gap-3 px-4 py-4 sm:px-6">
            <h1
              id="databases"
              className="truncate text-xl font-medium tracking-[-0.015em] text-neutral-900 dark:text-neutral-100"
            >
              Databases
            </h1>
            <span className="shrink-0 text-sm tabular-nums text-neutral-500">
              {rows.length}
            </span>
            <button
              type="button"
              aria-label="Create database"
              className={cx(
                "ml-auto inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3 text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
                pressTransition,
                focusRing,
              )}
            >
              <Plus aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span className="sm:hidden">Create</span>
              <span className="hidden sm:inline">Create database</span>
            </button>
          </div>

          <div className="relative min-h-0 flex-1">
            <div
              ref={content.ref}
              onScroll={content.onScroll}
              className="h-full overflow-y-auto"
            >
              <ResourceTable rows={rows} slug={slug} />
            </div>
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
        </main>
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
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className={cx(
              "absolute inset-y-0 left-0 z-40 flex w-72 max-w-[85%] flex-col rounded-r-[var(--rb-r-4xl,18px)] bg-neutral-50 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)] transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none dark:bg-neutral-900 dark:shadow-none",
              drawerShown ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <SidebarBody
              idPrefix="drawer"
              dataOpen={dataOpen}
              onDataToggle={() => setDataOpen((v) => !v)}
              announcement={announcement}
              onDismissAnnouncement={dismissAnnouncement}
              onClose={closeDrawer}
            />
          </aside>
        </div>
      )}
    </div>
  );
}
