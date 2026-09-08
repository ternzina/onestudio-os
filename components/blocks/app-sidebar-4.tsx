"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Blocks,
  FileText,
  FolderKanban,
  Plus,
  Search,
  Settings,
  Shield,
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

const sections = [
  {
    label: "Automations",
    icon: Workflow,
    groups: [
      {
        label: "Build",
        items: ["Agent runs", "Playbooks", "Schedules", "Triggers"],
      },
      { label: "Review", items: ["Approvals", "Run history", "Failures"] },
      { label: "Configure", items: ["Variables", "Webhooks", "Retries"] },
    ],
  },
  {
    label: "Projects",
    icon: FolderKanban,
    groups: [
      {
        label: "Boards",
        items: ["Active", "Backlog", "Archived", "Templates"],
      },
      { label: "Planning", items: ["Roadmap", "Milestones", "Releases"] },
      { label: "Delivery", items: ["Handoffs", "Retros", "Reports"] },
    ],
  },
  {
    label: "People",
    icon: Users,
    groups: [
      {
        label: "Directory",
        items: ["Members", "Teams", "Guests", "Invitations"],
      },
      { label: "Access", items: ["Roles", "Permissions", "Groups"] },
      { label: "Records", items: ["Onboarding", "Time off", "Reviews"] },
    ],
  },
  {
    label: "Insights",
    icon: BarChart3,
    groups: [
      { label: "Usage", items: ["Seats", "Sessions", "Adoption", "Exports"] },
      { label: "Performance", items: ["Latency", "Throughput", "Errors"] },
      { label: "Finance", items: ["Costs", "Forecasts", "Invoices"] },
    ],
  },
  {
    label: "Documents",
    icon: FileText,
    groups: [
      { label: "Library", items: ["All files", "Shared", "Recent", "Starred"] },
      { label: "Templates", items: ["Contracts", "Briefs", "Policies"] },
      { label: "Lifecycle", items: ["Drafts", "In review", "Archived"] },
    ],
  },
  {
    label: "Integrations",
    icon: Blocks,
    groups: [
      {
        label: "Connections",
        items: ["Connected apps", "Data sources", "Sinks", "Registry"],
      },
      { label: "Developer", items: ["API keys", "Webhooks", "Events"] },
      { label: "Health", items: ["Sync status", "Quotas", "Logs"] },
    ],
  },
  {
    label: "Security",
    icon: Shield,
    groups: [
      {
        label: "Identity",
        items: ["Sign-in", "Devices", "Sessions", "Domains"],
      },
      { label: "Policies", items: ["Retention", "Sharing", "Encryption"] },
      { label: "Audit", items: ["Access review", "Audit log", "Alerts"] },
    ],
  },
];

export default function AppSidebar4() {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [activeItem, setActiveItem] = useState(sections[0].groups[0].items[0]);
  const rail = useScrollFade<HTMLElement>();
  const pages = useScrollFade<HTMLElement>();

  const section = sections[sectionIndex];

  return (
    <div className="relative flex h-full min-h-[640px] w-full overflow-hidden bg-white dark:bg-neutral-950">
      <aside className="flex w-14 shrink-0 flex-col items-center bg-neutral-50 dark:bg-neutral-900">
        <div className="flex h-14 shrink-0 items-center">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]">
            O
          </span>
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col items-center">
          <nav
            ref={rail.ref}
            onScroll={rail.onScroll}
            aria-label="Sections"
            className="flex h-full flex-col items-center gap-1 overflow-y-auto pb-3"
          >
            {sections.map((s, i) => {
              const Icon = s.icon;
              const current = i === sectionIndex;
              return (
                <button
                  key={s.label}
                  type="button"
                  title={s.label}
                  aria-label={s.label}
                  aria-current={current ? "page" : undefined}
                  onClick={() => {
                    setSectionIndex(i);
                    setActiveItem(s.groups[0].items[0]);
                  }}
                  className={cx(
                    "inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)] active:bg-neutral-200 dark:active:bg-neutral-700",
                    current
                      ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                      : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                    transition,
                    focus,
                  )}
                >
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                </button>
              );
            })}
          </nav>
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              rail.edges.start ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              rail.edges.end ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
        <div className="flex h-[60px] w-full shrink-0 items-center justify-center bg-neutral-100/70 dark:bg-neutral-800/40">
          <button
            type="button"
            title="Workspace settings"
            aria-label="Workspace settings"
            className={cx(
              "inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)] text-neutral-500 hover:bg-white hover:text-neutral-900 active:bg-neutral-200 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:active:bg-neutral-700",
              transition,
              focus,
            )}
          >
            <Settings aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <div className="flex w-full min-w-0 flex-col bg-neutral-50 sm:w-64 sm:shrink-0 dark:bg-neutral-900">
        <div className="flex h-14 shrink-0 items-center gap-2 pl-5 pr-2">
          <h2 className="min-w-0 flex-1 truncate text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
            {section.label}
          </h2>
          <button
            type="button"
            aria-label={`New ${section.label.toLowerCase().replace(/s$/, "")}`}
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
              placeholder={`Search ${section.label.toLowerCase()}`}
              aria-label={`Search ${section.label}`}
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
            ref={pages.ref}
            onScroll={pages.onScroll}
            aria-label={`${section.label} pages`}
            className="h-full space-y-4 overflow-y-auto px-2 pb-3"
          >
            {section.groups.map((group) => (
              <div key={group.label}>
                <p className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const current = item === activeItem;
                    return (
                      <li key={item}>
                        <button
                          type="button"
                          aria-current={current ? "page" : undefined}
                          onClick={() => setActiveItem(item)}
                          className={cx(
                            "flex h-8 w-full cursor-pointer items-center rounded-[var(--rb-r-md,8px)] px-3 text-left text-[13px] active:bg-neutral-200 dark:active:bg-neutral-700",
                            current
                              ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                            transition,
                            focus,
                          )}
                        >
                          <span className="min-w-0 flex-1 truncate">
                            {item}
                          </span>
                        </button>
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
              pages.edges.start ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              pages.edges.end ? "opacity-100" : "opacity-0",
            )}
          />
        </div>

        <div className="shrink-0 bg-neutral-100/70 p-2 dark:bg-neutral-800/40">
          <div className="flex h-11 items-center gap-2.5 rounded-[var(--rb-r-lg,10px)] px-1">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
              RC
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                Ruben Cole
              </p>
              <p className="truncate text-xs text-neutral-500 dark:text-neutral-500">
                Automation lead
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
