"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  CircleCheck,
  FileText,
  Home,
  Inbox,
  LifeBuoy,
  Menu,
  Settings,
  Users,
  UsersRound,
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
  "transition-[background-color,border-color,color,opacity] duration-150 ease-out";

const groups = [
  {
    label: "Today",
    items: [
      { label: "Home", icon: Home, current: true },
      { label: "Inbox", icon: Inbox, badge: "6" },
      { label: "Schedule", icon: CalendarDays },
      { label: "Tasks", icon: CircleCheck, badge: "4" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Customers", icon: Users },
      { label: "Documents", icon: FileText },
      { label: "Reports", icon: BarChart3 },
      { label: "Knowledge base", icon: BookOpen },
      { label: "Team", icon: UsersRound },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Notifications", icon: Bell },
      { label: "Settings", icon: Settings },
      { label: "Help & support", icon: LifeBuoy },
    ],
  },
];

export default function AppSidebar6() {
  const [open, setOpen] = useState(true);
  const [shown, setShown] = useState(false);
  const nav = useScrollFade<HTMLElement>();
  const shouldFocusRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const doc = drawerRef.current?.ownerDocument ?? document;
    const frame = requestAnimationFrame(() => setShown(true));
    if (shouldFocusRef.current) {
      closeRef.current?.focus({ preventScroll: true });
      shouldFocusRef.current = false;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setShown(false);
        triggerRef.current?.focus({ preventScroll: true });
        return;
      }
      if (event.key !== "Tab") return;
      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusable = Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled"));
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
  }, [open]);

  const closeDrawer = () => {
    setOpen(false);
    setShown(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="relative flex h-full min-h-[640px] w-full flex-col overflow-hidden bg-white dark:bg-neutral-950">
      <div className="flex h-14 shrink-0 items-center px-4">
        <button
          ref={triggerRef}
          type="button"
          aria-label="Open navigation"
          aria-expanded={open}
          onClick={() => {
            shouldFocusRef.current = true;
            setOpen(true);
          }}
          className={cx(
            "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 active:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 dark:active:bg-neutral-600",
            transition,
            focus,
          )}
        >
          <Menu aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close navigation overlay"
            tabIndex={-1}
            onClick={closeDrawer}
            className="absolute inset-0 z-30 cursor-pointer"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className={cx(
              "absolute inset-y-0 left-0 z-40 flex w-72 max-w-[85%] flex-col rounded-r-[var(--rb-r-4xl,18px)] bg-white shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none dark:bg-neutral-900 dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)]",
              shown ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="flex h-14 shrink-0 items-center gap-2.5 pl-3 pr-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]">
                F
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
                  Fieldbase
                </p>
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-500">
                  Support team
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close navigation"
                onClick={closeDrawer}
                className={cx(
                  "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 active:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 dark:active:bg-neutral-600",
                  transition,
                  focus,
                )}
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
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
                              href="#home"
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
                  "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
                  nav.edges.start ? "opacity-100" : "opacity-0",
                )}
              />
              <div
                aria-hidden="true"
                className={cx(
                  "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
                  nav.edges.end ? "opacity-100" : "opacity-0",
                )}
              />
            </div>

            <div className="shrink-0 bg-neutral-100/70 p-2 dark:bg-neutral-800/40">
              <div className="flex h-11 items-center gap-2.5 rounded-[var(--rb-r-lg,10px)] px-1">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                  PN
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                    Priya Nair
                  </p>
                  <p className="truncate text-xs text-neutral-500 dark:text-neutral-500">
                    priya@fieldbase.io
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
