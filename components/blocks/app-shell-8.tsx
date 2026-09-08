"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Ban,
  CalendarDays,
  CalendarRange,
  CheckCheck,
  ClipboardList,
  Flag,
  Inbox,
  Menu,
  Package,
  Plus,
  Search,
  Truck,
  X,
  type LucideIcon,
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

const focusInset =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,opacity] duration-150 ease-out";

type Status =
  "Scheduled" | "En route" | "Waiting on parts" | "Overdue" | "Completed";

const STATUS_DOT: Record<Status, string> = {
  Scheduled: "bg-neutral-300 dark:bg-neutral-600",
  "En route":
    "bg-neutral-400 animate-pulse motion-reduce:animate-none dark:bg-neutral-500",
  "Waiting on parts": "bg-amber-500",
  Overdue: "bg-red-500",
  Completed: "bg-neutral-300 dark:bg-neutral-600",
};

type Job = {
  id: string;
  customer: string;
  service: string;
  technician: string | null;
  window: string;
  status: Status;
  day: "today" | "tomorrow" | "earlier";
};

const JOBS: Job[] = [
  {
    id: "WO-4821",
    customer: "Ferngate Dental",
    service: "Annual boiler service",
    technician: "Priya Raman",
    window: "08:00 – 10:00",
    status: "Completed",
    day: "today",
  },
  {
    id: "WO-4822",
    customer: "Halstead Grocers",
    service: "Walk-in cooler not holding temperature",
    technician: "Dominic Fuchs",
    window: "08:30 – 10:30",
    status: "Completed",
    day: "today",
  },
  {
    id: "WO-4823",
    customer: "Riverbend Assisted Living and Rehabilitation Center",
    service: "Rooftop unit 3 compressor fault",
    technician: "Dominic Fuchs",
    window: "09:00 – 12:00",
    status: "En route",
    day: "today",
  },
  {
    id: "WO-4824",
    customer: "Northline Logistics",
    service: "Loading bay heater inspection",
    technician: "Amara Osei",
    window: "10:00 – 11:00",
    status: "En route",
    day: "today",
  },
  {
    id: "WO-4825",
    customer: "Cobb and Wren Bakery",
    service: "Proofer thermostat replacement",
    technician: null,
    window: "10:30 – 12:30",
    status: "Overdue",
    day: "today",
  },
  {
    id: "WO-4826",
    customer: "Aldergate Primary School",
    service: "Boiler room annual certification",
    technician: "Priya Raman",
    window: "11:00 – 13:00",
    status: "Scheduled",
    day: "today",
  },
  {
    id: "WO-4827",
    customer: "Pinebrook Veterinary",
    service: "Autoclave leaking at the door seal",
    technician: "Amara Osei",
    window: "12:00 – 14:00",
    status: "Waiting on parts",
    day: "today",
  },
  {
    id: "WO-4828",
    customer: "Kestrel Sports Centre",
    service: "Pool dehumidifier service",
    technician: "Joachim Bauer",
    window: "13:00 – 15:00",
    status: "Scheduled",
    day: "today",
  },
  {
    id: "WO-4829",
    customer: "Vance and Hollis Solicitors",
    service: "Air handling unit filter change",
    technician: null,
    window: "13:30 – 14:30",
    status: "Scheduled",
    day: "today",
  },
  {
    id: "WO-4830",
    customer: "Sablefield Hotel",
    service: "Kitchen extraction fan noise",
    technician: "Joachim Bauer",
    window: "14:00 – 16:00",
    status: "Waiting on parts",
    day: "today",
  },
  {
    id: "WO-4831",
    customer: "Orchard Park Clinic",
    service: "Chiller pressure alarm",
    technician: "Dominic Fuchs",
    window: "15:00 – 17:00",
    status: "Scheduled",
    day: "today",
  },
  {
    id: "WO-4832",
    customer: "Trenholm Manufacturing",
    service: "Compressed air line leak survey",
    technician: null,
    window: "16:00 – 18:00",
    status: "Scheduled",
    day: "today",
  },
  {
    id: "WO-4833",
    customer: "Ashgrove Retail Park",
    service: "Quarterly maintenance, units 1 to 6",
    technician: "Priya Raman",
    window: "08:00 – 11:00",
    status: "Scheduled",
    day: "tomorrow",
  },
  {
    id: "WO-4834",
    customer: "Merrow Dental Practice",
    service: "Compressor annual service",
    technician: "Amara Osei",
    window: "09:00 – 10:30",
    status: "Scheduled",
    day: "tomorrow",
  },
  {
    id: "WO-4835",
    customer: "Bexley Print Works",
    service: "Humidity control recalibration",
    technician: null,
    window: "10:00 – 12:00",
    status: "Scheduled",
    day: "tomorrow",
  },
  {
    id: "WO-4836",
    customer: "Calderwood Care Home",
    service: "Hot water cylinder replacement",
    technician: "Joachim Bauer",
    window: "11:00 – 15:00",
    status: "Waiting on parts",
    day: "tomorrow",
  },
  {
    id: "WO-4837",
    customer: "Hollowbrook Leisure",
    service: "Sauna heater fault",
    technician: "Dominic Fuchs",
    window: "13:00 – 14:30",
    status: "Scheduled",
    day: "tomorrow",
  },
  {
    id: "WO-4838",
    customer: "Quillon Data Centre",
    service: "Condensate alarm on cooling unit 2",
    technician: "Priya Raman",
    window: "15:00 – 18:00",
    status: "Scheduled",
    day: "tomorrow",
  },
  {
    id: "WO-4802",
    customer: "Bramley Court Apartments",
    service: "Communal boiler flue repair",
    technician: "Amara Osei",
    window: "08:00 – 11:00",
    status: "Completed",
    day: "earlier",
  },
  {
    id: "WO-4805",
    customer: "Thornecroft Garden Centre",
    service: "Irrigation pump rewire",
    technician: "Joachim Bauer",
    window: "09:30 – 11:30",
    status: "Completed",
    day: "earlier",
  },
  {
    id: "WO-4809",
    customer: "Denbury Motors",
    service: "Spray booth extraction service",
    technician: "Priya Raman",
    window: "10:00 – 13:00",
    status: "Completed",
    day: "earlier",
  },
  {
    id: "WO-4813",
    customer: "Whitlock Pharmacy",
    service: "Fridge temperature logger fault",
    technician: "Dominic Fuchs",
    window: "11:00 – 12:00",
    status: "Completed",
    day: "earlier",
  },
  {
    id: "WO-4816",
    customer: "Eastvale Community Pool",
    service: "Backwash valve replacement",
    technician: "Amara Osei",
    window: "13:00 – 16:00",
    status: "Completed",
    day: "earlier",
  },
  {
    id: "WO-4818",
    customer: "Garrick Chambers",
    service: "Split system decommission",
    technician: null,
    window: "15:00 – 16:30",
    status: "Completed",
    day: "earlier",
  },
];

type QueueId =
  | "today"
  | "unassigned"
  | "progress"
  | "parts"
  | "tomorrow"
  | "week"
  | "completed"
  | "cancelled";

type Queue = {
  id: QueueId;
  label: string;
  icon: LucideIcon;
  match: (job: Job) => boolean;
  /** Shown when the queue has no jobs at all. */
  emptyTitle: string;
  emptyHelp: string;
};

const QUEUES: Queue[] = [
  {
    id: "today",
    label: "Today",
    icon: ClipboardList,
    match: (job) => job.day === "today",
    emptyTitle: "Nothing booked today",
    emptyHelp: "New jobs land here as soon as they are scheduled.",
  },
  {
    id: "unassigned",
    label: "Unassigned",
    icon: Inbox,
    match: (job) => job.technician === null && job.day !== "earlier",
    emptyTitle: "Every job has an engineer",
    emptyHelp: "Jobs without an engineer are collected here.",
  },
  {
    id: "progress",
    label: "In progress",
    icon: Truck,
    match: (job) => job.status === "En route",
    emptyTitle: "No one is on the road",
    emptyHelp: "Jobs appear here once an engineer starts travelling.",
  },
  {
    id: "parts",
    label: "Waiting on parts",
    icon: Package,
    match: (job) => job.status === "Waiting on parts",
    emptyTitle: "No jobs are held up",
    emptyHelp: "Jobs paused for a part are collected here.",
  },
  {
    id: "tomorrow",
    label: "Tomorrow",
    icon: CalendarDays,
    match: (job) => job.day === "tomorrow",
    emptyTitle: "Tomorrow is clear",
    emptyHelp: "Bookings for tomorrow appear here as they come in.",
  },
  {
    id: "week",
    label: "This week",
    icon: CalendarRange,
    match: (job) => job.day !== "earlier",
    emptyTitle: "This week is clear",
    emptyHelp: "Bookings for the next seven days appear here.",
  },
  {
    id: "completed",
    label: "Completed",
    icon: CheckCheck,
    match: (job) => job.status === "Completed",
    emptyTitle: "No completed jobs yet",
    emptyHelp: "Signed-off jobs move here automatically.",
  },
  {
    id: "cancelled",
    label: "Cancelled",
    icon: Ban,
    match: () => false,
    emptyTitle: "No cancelled jobs",
    emptyHelp: "Cancelled jobs stay here for 90 days before they are archived.",
  },
];

const NAV_GROUPS: { label: string; queues: QueueId[] }[] = [
  { label: "Dispatch", queues: ["today", "unassigned", "progress", "parts"] },
  { label: "Upcoming", queues: ["tomorrow", "week"] },
  { label: "Archive", queues: ["completed", "cancelled"] },
];

const TAB_QUEUES: QueueId[] = [
  "today",
  "unassigned",
  "progress",
  "tomorrow",
  "completed",
];

const queueById = (id: QueueId) =>
  QUEUES.find((queue) => queue.id === id) as Queue;

const SORTS: { id: "window" | "customer"; label: string }[] = [
  { id: "window", label: "Time" },
  { id: "customer", label: "Customer" },
];

function StatusLabel({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-neutral-600 dark:text-neutral-400">
      <span
        aria-hidden="true"
        className={cx("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[status])}
      />
      {status}
    </span>
  );
}

function FlagButton({
  flagged,
  onToggle,
  jobId,
  alwaysVisible,
}: {
  flagged: boolean;
  onToggle: () => void;
  jobId: string;
  alwaysVisible?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={flagged}
      aria-label={
        flagged ? `Clear follow-up on ${jobId}` : `Flag ${jobId} for follow-up`
      }
      onClick={onToggle}
      className={cx(
        "inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-sm,6px)] bg-neutral-100 hover:bg-neutral-200 active:scale-[0.97] dark:bg-neutral-800 dark:hover:bg-neutral-700",
        "transition-[background-color,color,opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
        flagged
          ? "text-neutral-900 dark:text-neutral-100"
          : "text-neutral-500 dark:text-neutral-400",
        alwaysVisible || flagged
          ? "opacity-100"
          : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
        focusRing,
      )}
    >
      <Flag
        aria-hidden="true"
        className={cx("h-3.5 w-3.5", flagged && "fill-current")}
      />
    </button>
  );
}

function JobRow({
  job,
  flagged,
  onToggleFlag,
}: {
  job: Job;
  flagged: boolean;
  onToggleFlag: () => void;
}) {
  return (
    <li className="group flex min-h-11 items-center gap-4 rounded-[var(--rb-r-lg,10px)] px-3 py-2.5 transition-colors duration-150 ease-out hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
      <span className="hidden w-[4.5rem] shrink-0 font-mono text-xs tabular-nums text-neutral-500 lg:block dark:text-neutral-500">
        {job.id}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
          {job.customer}
        </span>
        <span className="block truncate text-[13px] text-neutral-500 dark:text-neutral-500">
          {job.service}
        </span>
      </span>
      <span
        className={cx(
          "hidden w-32 shrink-0 truncate text-[13px] lg:block",
          job.technician
            ? "text-neutral-600 dark:text-neutral-400"
            : "text-neutral-400 dark:text-neutral-600",
        )}
      >
        {job.technician ?? "-"}
      </span>
      <span className="w-[6.5rem] shrink-0 text-right text-[13px] tabular-nums text-neutral-600 dark:text-neutral-400">
        {job.window}
      </span>
      <span className="w-32 shrink-0">
        <StatusLabel status={job.status} />
      </span>
      <FlagButton flagged={flagged} onToggle={onToggleFlag} jobId={job.id} />
    </li>
  );
}

function JobCard({
  job,
  flagged,
  onToggleFlag,
}: {
  job: Job;
  flagged: boolean;
  onToggleFlag: () => void;
}) {
  return (
    <li className="rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
            {job.customer}
          </p>
          <p className="mt-0.5 line-clamp-2 text-[13px] text-neutral-500 dark:text-neutral-500">
            {job.service}
          </p>
        </div>
        <FlagButton
          flagged={flagged}
          onToggle={onToggleFlag}
          jobId={job.id}
          alwaysVisible
        />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 rounded-[var(--rb-r-lg,10px)] bg-neutral-50 px-3 py-2.5 dark:bg-neutral-800/50">
        <div className="min-w-0">
          <dt className="text-xs text-neutral-500 dark:text-neutral-500">
            Arrival window
          </dt>
          <dd className="mt-0.5 truncate text-[13px] tabular-nums text-neutral-900 dark:text-neutral-100">
            {job.window}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-neutral-500 dark:text-neutral-500">
            Engineer
          </dt>
          <dd
            className={cx(
              "mt-0.5 truncate text-[13px]",
              job.technician
                ? "text-neutral-900 dark:text-neutral-100"
                : "text-neutral-400 dark:text-neutral-600",
            )}
          >
            {job.technician ?? "-"}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between gap-3">
        <StatusLabel status={job.status} />
        <span className="shrink-0 font-mono text-xs tabular-nums text-neutral-500 dark:text-neutral-500">
          {job.id}
        </span>
      </div>
    </li>
  );
}

function NavGroups({
  current,
  counts,
  onSelect,
}: {
  current: QueueId;
  counts: Record<QueueId, number>;
  onSelect: (id: QueueId) => void;
}) {
  return (
    <div className="space-y-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.queues.map((id) => {
              const queue = queueById(id);
              const Icon = queue.icon;
              const active = current === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => onSelect(id)}
                    className={cx(
                      "flex h-8 w-full cursor-pointer items-center gap-2 rounded-[var(--rb-r-md,8px)] px-3 text-left text-[13px] active:bg-neutral-200 dark:active:bg-neutral-700",
                      active
                        ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                      transition,
                      focusRing,
                    )}
                  >
                    <Icon
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-500"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {queue.label}
                    </span>
                    {counts[id] > 0 && (
                      <span className="shrink-0 text-xs tabular-nums text-neutral-500 dark:text-neutral-500">
                        {counts[id]}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function CoverageCard({
  assigned,
  total,
  onAssign,
}: {
  assigned: number;
  total: number;
  onAssign: () => void;
}) {
  return (
    <div className="mt-auto rounded-[var(--rb-r-lg,10px)] bg-neutral-100 p-3 dark:bg-neutral-800/60">
      <p className="text-xs text-neutral-500 dark:text-neutral-500">
        Shift coverage
      </p>
      <p className="mt-1 text-[13px] text-neutral-900 dark:text-neutral-100">
        <span className="font-medium tabular-nums">{assigned}</span> of{" "}
        <span className="font-medium tabular-nums">{total}</span> jobs assigned
      </p>
      <button
        type="button"
        onClick={onAssign}
        className={cx(
          "mt-2.5 inline-flex h-8 w-full cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-white px-2.5 text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 active:scale-[0.98] dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
          "transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
          focusRing,
        )}
      >
        Assign remaining
      </button>
    </div>
  );
}

function BrandMark() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]">
      C
    </span>
  );
}

export default function AppShell8() {
  const [current, setCurrent] = useState<QueueId>("today");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [sort, setSort] = useState<"window" | "customer">("window");
  const [flags, setFlags] = useState<Record<string, boolean>>({
    "WO-4825": true,
  });
  const [navOpen, setNavOpen] = useState(false);
  const [navShown, setNavShown] = useState(false);

  const shouldFocusRef = useRef(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const nav = useScrollFade<HTMLDivElement>();
  const content = useScrollFade<HTMLElement>();
  const drawerNav = useScrollFade<HTMLDivElement>();

  const counts = useMemo(() => {
    const next = {} as Record<QueueId, number>;
    for (const queue of QUEUES) {
      next[queue.id] = JOBS.filter(queue.match).length;
    }
    return next;
  }, []);

  const queue = queueById(current);
  const QueueIcon = queue.icon;
  const trimmed = query.trim().toLowerCase();

  const jobs = useMemo(() => {
    const inQueue = JOBS.filter(queueById(current).match);
    const found = trimmed
      ? inQueue.filter((job) =>
          `${job.id} ${job.customer} ${job.service} ${job.technician ?? ""}`
            .toLowerCase()
            .includes(trimmed),
        )
      : inQueue;
    if (sort === "customer") {
      return [...found].sort((a, b) => a.customer.localeCompare(b.customer));
    }
    return found;
  }, [current, sort, trimmed]);

  const todayTotal = counts.today;
  const todayAssigned = todayTotal - counts.unassigned;

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus({ preventScroll: true });
  }, [searchOpen]);

  useEffect(() => {
    if (!navOpen) return;
    const drawer = drawerRef.current;
    const frame = requestAnimationFrame(() => setNavShown(true));
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
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setNavOpen(false);
        setNavShown(false);
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
  }, [navOpen]);

  const closeNav = () => {
    setNavOpen(false);
    setNavShown(false);
    menuTriggerRef.current?.focus({ preventScroll: true });
  };

  const openNav = () => {
    shouldFocusRef.current = true;
    setNavOpen(true);
  };

  const closeSearch = () => {
    setQuery("");
    setSearchOpen(false);
    searchTriggerRef.current?.focus({ preventScroll: true });
  };

  const toggleFlag = (id: string) =>
    setFlags((previous) => ({ ...previous, [id]: !previous[id] }));

  const select = (id: QueueId) => {
    setCurrent(id);
    setQuery("");
  };

  return (
    <div className="relative flex h-full min-h-[640px] w-full overflow-hidden bg-white dark:bg-neutral-950">
      <aside
        aria-label="Queues"
        className="hidden w-14 shrink-0 flex-col items-center bg-neutral-50 md:flex lg:hidden dark:bg-neutral-900"
      >
        <div className="flex h-14 shrink-0 items-center">
          <BrandMark />
        </div>
        <nav aria-label="Queues" className="flex flex-col gap-0.5 px-2">
          {QUEUES.map((item) => {
            const Icon = item.icon;
            const active = current === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                onClick={() => select(item.id)}
                className={cx(
                  "group relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] active:bg-neutral-200 dark:active:bg-neutral-700",
                  active
                    ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                  transition,
                  focusRing,
                )}
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-full top-1/2 z-[70] ml-2 -translate-y-1/2 whitespace-nowrap rounded-[var(--rb-r-sm,6px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-2 py-1 text-xs text-[var(--rb-accent-fg,oklch(100%_0_0))] opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
        <div className="mt-auto flex h-14 shrink-0 items-center">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200"
          >
            RM
          </span>
          <span className="sr-only">Signed in as Rosa Mendel, dispatcher</span>
        </div>
      </aside>

      <aside
        aria-label="Queues"
        className="hidden w-64 shrink-0 flex-col bg-neutral-50 lg:flex dark:bg-neutral-900"
      >
        <div className="flex h-14 shrink-0 items-center gap-2.5 px-3">
          <BrandMark />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
              Calder Field
            </p>
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-500">
              Dispatch
            </p>
          </div>
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            ref={nav.ref}
            onScroll={nav.onScroll}
            className="flex h-full flex-col overflow-y-auto px-2 pb-2"
          >
            <nav aria-label="Queues">
              <NavGroups current={current} counts={counts} onSelect={select} />
            </nav>
            <CoverageCard
              assigned={todayAssigned}
              total={todayTotal}
              onAssign={() => select("unassigned")}
            />
          </div>
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
        <div className="flex shrink-0 items-center gap-2.5 bg-neutral-100/70 px-3 py-2.5 dark:bg-neutral-800/40">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200"
          >
            RM
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
              Rosa Mendel
            </span>
            <span className="block truncate text-xs text-neutral-500 dark:text-neutral-500">
              Dispatcher
            </span>
          </span>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 px-4 sm:px-6">
          <button
            ref={menuTriggerRef}
            type="button"
            aria-label="Open queues"
            aria-expanded={navOpen}
            onClick={openNav}
            className={cx(
              "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 active:scale-[0.97] md:hidden dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100",
              "transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
              focusRing,
            )}
          >
            <Menu aria-hidden="true" className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-medium leading-5 tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
              {queue.label}
            </h1>
            <p className="truncate text-xs leading-4 text-neutral-500 dark:text-neutral-500">
              Tuesday, 12 March
              <span aria-hidden="true"> · </span>
              <span className="tabular-nums">{jobs.length}</span>{" "}
              {jobs.length === 1 ? "job" : "jobs"}
            </p>
          </div>

          <button
            ref={searchTriggerRef}
            type="button"
            aria-label={searchOpen ? "Hide search" : "Search jobs"}
            aria-expanded={searchOpen}
            onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
            className={cx(
              "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 active:scale-[0.97] md:hidden dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100",
              "transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
              focusRing,
            )}
          >
            {searchOpen ? (
              <X aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Search aria-hidden="true" className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            className={cx(
              "hidden h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-2.5 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] md:inline-flex dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
              "transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
              focusRing,
            )}
          >
            <Plus aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            Book job
          </button>
        </header>

        <div
          className={cx(
            "h-12 shrink-0 items-center gap-3 px-4 sm:px-6 md:flex",
            searchOpen ? "flex" : "hidden",
          )}
        >
          <div className="relative min-w-0 flex-1 md:w-64 md:flex-none">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500 dark:text-neutral-500"
            />
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape" && searchOpen) closeSearch();
              }}
              aria-label="Search jobs"
              placeholder="Search jobs"
              className="h-8 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pl-8 pr-2.5 text-[13px] text-neutral-900 transition-colors duration-150 ease-out placeholder:text-neutral-500 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
            />
          </div>

          <div
            role="group"
            aria-label="Sort jobs"
            className="ml-auto hidden shrink-0 items-center gap-0.5 rounded-[var(--rb-r-lg,10px)] bg-neutral-100 p-1 md:flex dark:bg-neutral-800/60"
          >
            {SORTS.map((option) => {
              const isActive = sort === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSort(option.id)}
                  className={cx(
                    "h-6 cursor-pointer rounded-[var(--rb-r-sm,6px)] px-2 text-xs font-medium transition-colors duration-150 ease-out",
                    isActive
                      ? "bg-white text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
                    focusInset,
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <main
            ref={content.ref}
            onScroll={content.onScroll}
            className="h-full overflow-y-auto px-4 pb-20 pt-2 sm:px-6 md:pb-4 md:pt-1"
          >
            {jobs.length === 0 ? (
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center px-6 pb-16 text-center md:pb-4">
                {trimmed ? (
                  <Search
                    aria-hidden="true"
                    className="mb-3 h-6 w-6 text-neutral-400 dark:text-neutral-600"
                  />
                ) : (
                  <QueueIcon
                    aria-hidden="true"
                    className="mb-3 h-6 w-6 text-neutral-400 dark:text-neutral-600"
                  />
                )}
                <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                  {trimmed ? "No jobs match that search" : queue.emptyTitle}
                </p>
                <p className="mt-1 max-w-xs text-xs text-neutral-600 dark:text-neutral-400">
                  {trimmed
                    ? "Search covers the customer, the job number and the engineer."
                    : queue.emptyHelp}
                </p>
                {trimmed && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className={cx(
                      "mt-4 inline-flex h-8 cursor-pointer items-center rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-2.5 text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 active:scale-[0.97] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800",
                      "transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
                      focusRing,
                    )}
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <>
                <ul className="flex flex-col gap-3 md:hidden">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      flagged={Boolean(flags[job.id])}
                      onToggleFlag={() => toggleFlag(job.id)}
                    />
                  ))}
                </ul>
                <ul className="hidden flex-col gap-1 md:-mx-3 md:flex">
                  {jobs.map((job) => (
                    <JobRow
                      key={job.id}
                      job={job}
                      flagged={Boolean(flags[job.id])}
                      onToggleFlag={() => toggleFlag(job.id)}
                    />
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

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-16 z-20 h-8 bg-gradient-to-t from-white to-transparent md:hidden dark:from-neutral-950"
      />

      <nav
        aria-label="Queues"
        className="absolute inset-x-0 bottom-0 z-20 h-16 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 md:hidden dark:bg-neutral-900/80 dark:supports-[backdrop-filter]:bg-neutral-900/60"
      >
        <ul className="flex h-full items-stretch px-1">
          {TAB_QUEUES.map((id) => {
            const item = queueById(id);
            const Icon = item.icon;
            const active = current === id;
            return (
              <li key={id} className="flex-1">
                <button
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => select(id)}
                  className={cx(
                    "flex h-full min-h-11 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-[var(--rb-r-lg,10px)] px-1 active:bg-neutral-100 dark:active:bg-neutral-800",
                    active
                      ? "text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-500 dark:text-neutral-500",
                    transition,
                    focusInset,
                  )}
                >
                  <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
                  <span
                    className={cx(
                      "w-full truncate text-center text-[11px] leading-none",
                      active && "font-medium",
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {navOpen && (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="Close queues overlay"
            tabIndex={-1}
            onClick={closeNav}
            className={cx(
              "absolute inset-0 z-30 cursor-pointer bg-neutral-950/40 backdrop-blur-[2px] transition-opacity duration-200 ease-out dark:bg-neutral-950/60",
              navShown ? "opacity-100" : "opacity-0",
            )}
          />
          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-shell-8-drawer-title"
            className={cx(
              "absolute inset-y-0 left-0 z-40 flex w-72 max-w-[85%] flex-col rounded-r-[var(--rb-r-4xl,18px)] bg-white shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)] transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] dark:bg-neutral-900 dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)]",
              navShown ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="flex h-14 shrink-0 items-center gap-2.5 pl-3 pr-2">
              <BrandMark />
              <div className="min-w-0 flex-1">
                <p
                  id="app-shell-8-drawer-title"
                  className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100"
                >
                  Calder Field
                </p>
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-500">
                  Dispatch
                </p>
              </div>
              <button
                type="button"
                aria-label="Close queues"
                onClick={closeNav}
                className={cx(
                  "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 active:scale-[0.97] dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100",
                  transition,
                  focusRing,
                )}
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 flex-col">
              <div
                ref={drawerNav.ref}
                onScroll={drawerNav.onScroll}
                className="flex h-full flex-col overflow-y-auto px-2 pb-2"
              >
                <nav aria-label="All queues">
                  <NavGroups
                    current={current}
                    counts={counts}
                    onSelect={(id) => {
                      select(id);
                      closeNav();
                    }}
                  />
                </nav>
                <CoverageCard
                  assigned={todayAssigned}
                  total={todayTotal}
                  onAssign={() => {
                    select("unassigned");
                    closeNav();
                  }}
                />
              </div>
              <div
                aria-hidden="true"
                className={cx(
                  "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
                  drawerNav.edges.start ? "opacity-100" : "opacity-0",
                )}
              />
              <div
                aria-hidden="true"
                className={cx(
                  "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
                  drawerNav.edges.end ? "opacity-100" : "opacity-0",
                )}
              />
            </div>
            <div className="flex shrink-0 items-center gap-2.5 rounded-br-[var(--rb-r-4xl,18px)] bg-neutral-100/70 px-3 py-2.5 dark:bg-neutral-800/40">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200"
              >
                RM
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                  Rosa Mendel
                </span>
                <span className="block truncate text-xs text-neutral-500 dark:text-neutral-500">
                  Dispatcher
                </span>
              </span>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
