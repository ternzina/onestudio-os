"use client";

import { useState } from "react";
import {
  Calendar,
  Cloud,
  GitBranch,
  MessagesSquare,
  Table2,
  Ticket,
  type LucideIcon,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const card =
  "flex h-full items-center gap-3 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900";

type Integration = {
  id: string;
  name: string;
  icon: LucideIcon;
  premium: boolean;
  blurb: string;
};

const INTEGRATIONS: Integration[] = [
  {
    id: "repos",
    name: "Repositories",
    icon: GitBranch,
    premium: false,
    blurb: "Link branches and pull requests to the work item that opened them.",
  },
  {
    id: "chat",
    name: "Team chat",
    icon: MessagesSquare,
    premium: false,
    blurb: "Post status changes into the channel that owns each project.",
  },
  {
    id: "calendar",
    name: "Calendar",
    icon: Calendar,
    premium: false,
    blurb: "Keep milestones and review sessions on everyone's calendar.",
  },
  {
    id: "warehouse",
    name: "Data warehouse",
    icon: Table2,
    premium: true,
    blurb:
      "Stream every event into your warehouse on a fifteen minute cadence.",
  },
  {
    id: "helpdesk",
    name: "Help desk",
    icon: Ticket,
    premium: false,
    blurb: "Turn escalated conversations into tracked issues automatically.",
  },
  {
    id: "storage",
    name: "Object storage",
    icon: Cloud,
    premium: true,
    blurb: "Archive exports and attachments into a bucket you control.",
  },
];

export default function Card2() {
  const [enabled, setEnabled] = useState<Set<string>>(
    () => new Set(["repos", "chat", "calendar"]),
  );

  const toggle = (id: string) =>
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="h-full min-h-[560px] w-full overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <ul className="grid grid-cols-1 gap-3">
        {INTEGRATIONS.map((item) => {
          const Icon = item.icon;
          const on = enabled.has(item.id);

          return (
            <li key={item.id} className={card}>
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--rb-r-lg,10px)] bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
              >
                <Icon className="h-4 w-4" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                  <span className="min-w-0 truncate">{item.name}</span>
                  {item.premium && (
                    <span className="inline-flex h-5 shrink-0 items-center rounded-[var(--rb-r-sm,6px)] bg-neutral-100 px-1.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      Premium
                    </span>
                  )}
                </p>
                <p className="mt-0.5 truncate text-[13px] text-neutral-600 dark:text-neutral-400">
                  {item.blurb}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`Connect ${item.name}`}
                onClick={() => toggle(item.id)}
                className={cx(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full",
                  on
                    ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
                    : "bg-neutral-200 dark:bg-neutral-700",
                  transition,
                  focus,
                )}
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    "pointer-events-none inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:bg-neutral-900",
                    on ? "translate-x-[18px]" : "translate-x-0.5",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
