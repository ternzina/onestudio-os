"use client";

import { useState } from "react";
import { MapPin, Users } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const frame =
  "grid grid-cols-[auto_1fr] gap-1 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900";

const panel =
  "rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-950";

type Meeting = {
  id: string;
  title: string;
  day: string;
  weekday: string;
  window: string;
  place: string;
  invited: number;
};

const MEETINGS: Meeting[] = [
  {
    id: "roadmap",
    title: "Roadmap review",
    day: "14",
    weekday: "Mon",
    window: "09:30 – 10:15",
    place: "Studio A",
    invited: 7,
  },
  {
    id: "standup",
    title: "Platform standup",
    day: "14",
    weekday: "Mon",
    window: "11:00 – 11:15",
    place: "Video call",
    invited: 8,
  },
  {
    id: "design",
    title: "Design critique",
    day: "14",
    weekday: "Mon",
    window: "14:00 – 15:00",
    place: "Studio B",
    invited: 4,
  },
  {
    id: "pricing",
    title: "Pricing working group",
    day: "15",
    weekday: "Tue",
    window: "10:00 – 10:50",
    place: "Video call",
    invited: 5,
  },
  {
    id: "retro",
    title: "Sprint retrospective",
    day: "17",
    weekday: "Thu",
    window: "16:00 – 16:45",
    place: "Studio A",
    invited: 8,
  },
  {
    id: "onsite",
    title: "Customer onsite prep",
    day: "18",
    weekday: "Fri",
    window: "08:30 – 09:00",
    place: "Video call",
    invited: 2,
  },
];

export default function Card4() {
  const [rsvp, setRsvp] = useState<Record<string, "going" | "declined" | null>>(
    {
      roadmap: "going",
    },
  );

  const set = (id: string, value: "going" | "declined") =>
    setRsvp((prev) => ({ ...prev, [id]: prev[id] === value ? null : value }));

  return (
    <div className="h-full min-h-[560px] w-full overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {MEETINGS.map((meeting) => {
          const answer = rsvp[meeting.id] ?? null;

          return (
            <li key={meeting.id} className={frame}>
              <div
                className={cx(
                  panel,
                  "row-span-2 flex w-16 flex-col items-center justify-center",
                )}
              >
                <span className="text-xl tabular-nums leading-none tracking-[-0.015em] text-neutral-900 dark:text-neutral-100">
                  {meeting.day}
                </span>
                <span className="mt-1 text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                  {meeting.weekday}
                </span>
              </div>

              <div className={cx(panel, "px-4 py-3")}>
                <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                  {meeting.title}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-500">
                  <span className="tabular-nums">{meeting.window}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin
                      aria-hidden="true"
                      className="h-3.5 w-3.5 shrink-0"
                    />
                    {meeting.place}
                  </span>
                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                    <Users
                      aria-hidden="true"
                      className="h-3.5 w-3.5 shrink-0"
                    />
                    {meeting.invited}
                  </span>
                </p>
              </div>

              <div className="flex gap-1">
                <button
                  type="button"
                  aria-pressed={answer === "going"}
                  onClick={() => set(meeting.id, "going")}
                  className={cx(
                    "inline-flex h-9 flex-1 cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)] px-3 text-[13px] font-medium active:scale-[0.98]",
                    answer === "going"
                      ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]"
                      : "border border-neutral-200/70 bg-white text-neutral-900 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800",
                    transition,
                    focus,
                  )}
                >
                  Going
                  <span className="sr-only"> to {meeting.title}</span>
                </button>
                <button
                  type="button"
                  aria-pressed={answer === "declined"}
                  onClick={() => set(meeting.id, "declined")}
                  className={cx(
                    "inline-flex h-9 flex-1 cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)] border px-3 text-[13px] font-medium active:scale-[0.98]",
                    answer === "declined"
                      ? "border-neutral-400 bg-white text-neutral-900 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
                      : "border-neutral-200/70 bg-white text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                    transition,
                    focus,
                  )}
                >
                  Decline
                  <span className="sr-only"> {meeting.title}</span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
