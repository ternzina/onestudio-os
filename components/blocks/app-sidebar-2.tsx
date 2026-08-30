"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Blocks,
  Boxes,
  Database,
  Gauge,
  KeyRound,
  LifeBuoy,
  Rocket,
  Server,
  Shield,
  Workflow,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity] duration-150 ease-out";

type RailItem = {
  label: string;
  icon: typeof Gauge;
  current?: boolean;
  children: string[];
};

const railGroups: RailItem[][] = [
  [
    { label: "Overview", icon: Gauge, children: ["Today", "This week"] },
    {
      label: "Automation",
      icon: Workflow,
      current: true,
      children: ["Agent runs", "Playbooks", "Schedules"],
    },
    {
      label: "Services",
      icon: Boxes,
      children: ["Inventory", "Vendors", "Contracts"],
    },
    {
      label: "Data",
      icon: Database,
      children: ["Warehouses", "Exports", "Retention"],
    },
    {
      label: "Integrations",
      icon: Blocks,
      children: ["Connected apps", "Webhooks", "API keys"],
    },
  ],
  [
    {
      label: "Governance",
      icon: Shield,
      children: ["Access review", "Audit log", "Policies"],
    },
    {
      label: "Monitoring",
      icon: Activity,
      children: ["Incidents", "Alerts", "Uptime"],
    },
    {
      label: "Releases",
      icon: Rocket,
      children: ["Rollouts", "Changelog", "Flags"],
    },
    {
      label: "Environments",
      icon: Server,
      children: ["Production", "Staging", "Sandbox"],
    },
    {
      label: "Credentials",
      icon: KeyRound,
      children: ["Tokens", "Certificates", "Secrets"],
    },
  ],
];

function Flyout({
  label,
  items,
  align,
  menuRef,
}: {
  label: string;
  items: string[];
  align: "top" | "bottom";
  menuRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={menuRef}
      className={cx(
        "absolute left-full z-30 pl-2",
        align === "top" ? "top-0" : "bottom-0",
      )}
    >
      <div
        role="menu"
        aria-label={label}
        className="min-w-44 rounded-[var(--rb-r-2xl,14px)] bg-white p-1 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.10)] dark:bg-neutral-800 dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.5)]"
      >
        <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
          {label}
        </p>
        {items.map((child) => (
          <button
            key={child}
            type="button"
            role="menuitem"
            className={cx(
              "flex h-8 w-full cursor-pointer items-center rounded-[var(--rb-r-lg,10px)] px-2 text-left text-[13px] text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 dark:active:bg-neutral-600",
              transition,
              focus,
            )}
          >
            <span className="truncate">{child}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AppSidebar2() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [pinned, setPinned] = useState(false);
  const railRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const close = (restoreFocus: boolean) => {
    const key = openKey;
    setOpenKey(null);
    setPinned(false);
    if (restoreFocus && key)
      triggerRefs.current[key]?.focus({ preventScroll: true });
  };

  const hoverOpen = (key: string, event: React.PointerEvent) => {
    if (event.pointerType !== "mouse" || pinned) return;
    setOpenKey(key);
  };

  const hoverClose = (key: string, event: React.PointerEvent) => {
    if (event.pointerType !== "mouse" || pinned) return;
    setOpenKey((cur) => (cur === key ? null : cur));
  };

  const toggle = (key: string) => {
    if (openKey === key && pinned) {
      setOpenKey(null);
      setPinned(false);
      return;
    }
    setOpenKey(key);
    setPinned(true);
  };

  useEffect(() => {
    if (!openKey) return;
    const doc = railRef.current?.ownerDocument ?? document;

    const onPointerDown = (event: Event) => {
      if (!railRef.current?.contains(event.target as Node)) close(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
        return;
      }
      const items = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ??
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openKey]);

  return (
    <div className="relative flex h-full min-h-[640px] w-full overflow-hidden bg-white dark:bg-neutral-950">
      <aside
        ref={railRef}
        className="flex w-14 shrink-0 flex-col items-center bg-neutral-50 py-3 dark:bg-neutral-900"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]">
          A
        </span>

        <nav
          aria-label="Primary"
          className="mt-4 flex flex-1 flex-col items-center gap-4"
        >
          {railGroups.map((group, groupIndex) => (
            <ul
              key={groupIndex}
              className="flex flex-col items-center gap-1"
              role="list"
            >
              {group.map((item) => {
                const Icon = item.icon;
                const open = openKey === item.label;
                return (
                  <li
                    key={item.label}
                    className="relative"
                    onPointerEnter={(event) => hoverOpen(item.label, event)}
                    onPointerLeave={(event) => hoverClose(item.label, event)}
                  >
                    <button
                      ref={(node) => {
                        triggerRefs.current[item.label] = node;
                      }}
                      type="button"
                      aria-label={item.label}
                      aria-current={item.current ? "page" : undefined}
                      aria-haspopup="menu"
                      aria-expanded={open}
                      onClick={() => toggle(item.label)}
                      className={cx(
                        "inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)] active:bg-neutral-200 dark:active:bg-neutral-700",
                        item.current
                          ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                          : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                        transition,
                        focus,
                      )}
                    >
                      <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                    </button>
                    {open && (
                      <Flyout
                        menuRef={menuRef}
                        label={item.label}
                        items={item.children}
                        align="top"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          ))}
        </nav>

        <div className="mt-4 flex flex-col items-center gap-1">
          {(
            [
              {
                label: "Support",
                icon: LifeBuoy,
                children: ["Help center", "Contact support", "Status page"],
              },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const open = openKey === item.label;
            return (
              <div
                key={item.label}
                className="relative"
                onPointerEnter={(event) => hoverOpen(item.label, event)}
                onPointerLeave={(event) => hoverClose(item.label, event)}
              >
                <button
                  ref={(node) => {
                    triggerRefs.current[item.label] = node;
                  }}
                  type="button"
                  aria-label={item.label}
                  aria-haspopup="menu"
                  aria-expanded={open}
                  onClick={() => toggle(item.label)}
                  className={cx(
                    "inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:active:bg-neutral-700",
                    transition,
                    focus,
                  )}
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </button>
                {open && (
                  <Flyout
                    menuRef={menuRef}
                    label={item.label}
                    items={[...item.children]}
                    align="bottom"
                  />
                )}
              </div>
            );
          })}

          <div
            className="relative"
            onPointerEnter={(event) => hoverOpen("Account", event)}
            onPointerLeave={(event) => hoverClose("Account", event)}
          >
            <button
              ref={(node) => {
                triggerRefs.current.Account = node;
              }}
              type="button"
              aria-label="Your account"
              aria-haspopup="menu"
              aria-expanded={openKey === "Account"}
              onClick={() => toggle("Account")}
              className={cx(
                "inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)] hover:bg-neutral-100 active:bg-neutral-200 dark:hover:bg-neutral-800 dark:active:bg-neutral-700",
                transition,
                focus,
              )}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                TS
              </span>
            </button>
            {openKey === "Account" && (
              <div
                ref={menuRef}
                className="absolute bottom-0 left-full z-30 pl-2"
              >
                <div
                  role="menu"
                  aria-label="Account"
                  className="w-56 rounded-[var(--rb-r-2xl,14px)] bg-white p-1 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.10)] dark:bg-neutral-800 dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.5)]"
                >
                  <div className="px-2 py-1.5">
                    <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                      Theo Salcedo
                    </p>
                    <p className="truncate text-xs text-neutral-500 dark:text-neutral-500">
                      theo@northwind.co
                    </p>
                  </div>
                  {["Account settings", "Preferences", "Sign out"].map(
                    (label) => (
                      <button
                        key={label}
                        type="button"
                        role="menuitem"
                        className={cx(
                          "flex h-8 w-full cursor-pointer items-center rounded-[var(--rb-r-lg,10px)] px-2 text-left text-[13px] text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 dark:active:bg-neutral-600",
                          transition,
                          focus,
                        )}
                      >
                        <span className="truncate">{label}</span>
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
