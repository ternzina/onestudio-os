"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bell, Mail, Moon, Smartphone } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out";

const CHANNELS = [
  { key: "inApp", label: "In-app", icon: Bell },
  { key: "email", label: "Email", icon: Mail },
  { key: "push", label: "Push", icon: Smartphone },
] as const;

type ChannelKey = (typeof CHANNELS)[number]["key"];
type Row = Record<ChannelKey, boolean>;

type Event = {
  id: string;
  group: string;
  label: string;
  hint: string;
};

const EVENTS: Event[] = [
  {
    id: "mention",
    group: "Collaboration",
    label: "Mentions and replies",
    hint: "Someone names you in a comment or thread.",
  },
  {
    id: "assign",
    group: "Collaboration",
    label: "Assigned to you",
    hint: "A task, review or ticket lands in your queue.",
  },
  {
    id: "share",
    group: "Collaboration",
    label: "Shared with you",
    hint: "A board, document or dashboard is shared.",
  },
  {
    id: "invoice",
    group: "Account",
    label: "Invoices and receipts",
    hint: "Monthly statements for Cedar Labs.",
  },
  {
    id: "seats",
    group: "Account",
    label: "Seat changes",
    hint: "A member joins, leaves or changes role.",
  },
  {
    id: "signin",
    group: "Security",
    label: "New sign-in",
    hint: "A session starts on an unrecognised device.",
  },
  {
    id: "keys",
    group: "Security",
    label: "API key activity",
    hint: "A key is created, rotated or revoked.",
  },
];

const DEFAULTS: Record<string, Row> = {
  mention: { inApp: true, email: true, push: true },
  assign: { inApp: true, email: true, push: false },
  share: { inApp: true, email: false, push: false },
  invoice: { inApp: false, email: true, push: false },
  seats: { inApp: true, email: true, push: false },
  signin: { inApp: true, email: true, push: true },
  keys: { inApp: true, email: true, push: false },
};

const GROUPS = ["Collaboration", "Account", "Security"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Notifications3() {
  const reduce = useReducedMotion();
  const [rows, setRows] = useState<Record<string, Row>>(DEFAULTS);
  const [quiet, setQuiet] = useState(true);
  const [quietDays, setQuietDays] = useState<string[]>(["Sat", "Sun"]);
  const [saved, setSaved] = useState(true);

  const set = (id: string, key: ChannelKey, value: boolean) => {
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
    setSaved(false);
  };

  const setColumn = (group: string, key: ChannelKey, value: boolean) => {
    setRows((prev) => {
      const next = { ...prev };
      for (const e of EVENTS) {
        if (e.group === group) next[e.id] = { ...next[e.id], [key]: value };
      }
      return next;
    });
    setSaved(false);
  };

  const groupState = useMemo(() => {
    const out: Record<string, Record<ChannelKey, boolean>> = {};
    for (const g of GROUPS) {
      const members = EVENTS.filter((e) => e.group === g);
      out[g] = {
        inApp: members.every((e) => rows[e.id].inApp),
        email: members.every((e) => rows[e.id].email),
        push: members.every((e) => rows[e.id].push),
      };
    }
    return out;
  }, [rows]);

  const enabled = useMemo(
    () =>
      EVENTS.reduce(
        (n, e) => n + CHANNELS.filter((c) => rows[e.id][c.key]).length,
        0,
      ),
    [rows],
  );

  return (
    <div className="relative flex h-full min-h-[680px] w-full flex-col overflow-hidden bg-white dark:bg-neutral-950">
      <header className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
        <h2 className="text-[15px] font-medium text-neutral-900 dark:text-white">
          Notification preferences
        </h2>
        <p className="mt-1 text-[13px] leading-5 text-neutral-500 dark:text-neutral-400">
          {enabled} of {EVENTS.length * CHANNELS.length} deliveries enabled for
          this workspace.
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="min-w-[520px]">
          <div className="sticky top-0 z-10 grid grid-cols-[1fr_repeat(3,72px)] items-center gap-2 bg-white pb-2 dark:bg-neutral-950">
            <span className="text-[11px] tracking-[0.06em] text-neutral-400 uppercase dark:text-neutral-500">
              Event
            </span>
            {CHANNELS.map((c) => (
              <span
                key={c.key}
                className="flex items-center justify-center gap-1.5 text-[11px] tracking-[0.06em] text-neutral-400 uppercase dark:text-neutral-500"
              >
                <c.icon className="h-3 w-3" strokeWidth={1.75} />
                {c.label}
              </span>
            ))}
          </div>

          <div className="space-y-4">
            {GROUPS.map((group) => (
              <section key={group}>
                <div className="grid grid-cols-[1fr_repeat(3,72px)] items-center gap-2 rounded-[var(--rb-r-md,8px)] bg-neutral-50 px-3 py-2 dark:bg-neutral-900">
                  <span className="text-[13px] font-medium text-neutral-900 dark:text-white">
                    {group}
                  </span>
                  {CHANNELS.map((c) => (
                    <div key={c.key} className="flex justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          setColumn(group, c.key, !groupState[group][c.key])
                        }
                        className={cx(
                          "rounded-[var(--rb-r-sm,6px)] px-2 py-1 text-[12px] text-neutral-500 dark:text-neutral-400",
                          "hover:text-neutral-900 dark:hover:text-white",
                          transition,
                          focus,
                        )}
                      >
                        {groupState[group][c.key] ? "None" : "All"}
                      </button>
                    </div>
                  ))}
                </div>

                <ul>
                  {EVENTS.filter((e) => e.group === group).map((e) => (
                    <li
                      key={e.id}
                      className="grid grid-cols-[1fr_repeat(3,72px)] items-center gap-2 px-3 py-3"
                    >
                      <div className="min-w-0 pr-4">
                        <p
                          id={`${e.id}-label`}
                          className="truncate text-[13px] text-neutral-900 dark:text-white"
                        >
                          {e.label}
                        </p>
                        <p className="truncate text-[13px] leading-5 text-neutral-500 dark:text-neutral-400">
                          {e.hint}
                        </p>
                      </div>
                      {CHANNELS.map((c) => (
                        <div key={c.key} className="flex justify-center">
                          <Switch
                            checked={rows[e.id][c.key]}
                            onChange={(v) => set(e.id, c.key, v)}
                            label={`${e.label}: ${c.label}`}
                          />
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="mt-4 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] border border-neutral-200/70 bg-neutral-50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
                    <Moon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-[13px] font-medium text-neutral-900 dark:text-white">
                      Quiet hours
                    </p>
                    <p className="mt-0.5 text-[13px] leading-5 text-neutral-500 dark:text-neutral-400">
                      Hold email and push between 20:00 and 08:00. In-app stays
                      on.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={quiet}
                  onChange={(v) => {
                    setQuiet(v);
                    setSaved(false);
                  }}
                  label="Quiet hours"
                />
              </div>

              <AnimatePresence initial={false}>
                {quiet && (
                  <motion.div
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduce ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-1.5 pt-4">
                      {DAYS.map((d) => {
                        const on = quietDays.includes(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            aria-pressed={on}
                            onClick={() => {
                              setQuietDays((prev) =>
                                prev.includes(d)
                                  ? prev.filter((x) => x !== d)
                                  : [...prev, d],
                              );
                              setSaved(false);
                            }}
                            className={cx(
                              "h-8 rounded-[var(--rb-r-md,8px)] border px-3 text-[13px]",
                              on
                                ? "border-neutral-900 bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:border-white dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900",
                              transition,
                              focus,
                            )}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
        <span className="text-[13px] text-neutral-500 dark:text-neutral-400">
          {saved ? "All changes saved" : "Unsaved changes"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setRows(DEFAULTS);
              setQuiet(true);
              setQuietDays(["Sat", "Sun"]);
              setSaved(true);
            }}
            className={cx(
              "inline-flex h-9 items-center rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-[13px] text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300",
              "hover:bg-neutral-50 dark:hover:bg-neutral-900",
              transition,
              focus,
            )}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setSaved(true)}
            disabled={saved}
            className={cx(
              "inline-flex h-9 items-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] disabled:pointer-events-none disabled:opacity-40 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]",
              "hover:bg-neutral-800 dark:hover:bg-neutral-200",
              transition,
              focus,
            )}
          >
            Save preferences
          </button>
        </div>
      </footer>
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-out",
        "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]",
        checked
          ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
          : "bg-neutral-200 dark:bg-neutral-700",
      )}
    >
      <span
        className={cx(
          "pointer-events-none inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:bg-neutral-900",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
