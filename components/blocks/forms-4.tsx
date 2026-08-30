"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  Barcode,
  Building,
  Calendar,
  Check,
  ChevronDown,
  CircleGauge,
  Clock,
  Gauge,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  User,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const inputClass =
  "h-8 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-2.5 text-[13px] text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

type SelectOption = { value: string; label: string; hint?: string };

function Select({
  id,
  value,
  onChange,
  options,
  disabled,
  placeholder = "Select…",
  className,
  triggerClassName,
  leading,
  ariaLabel,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  leading?: ReactNode;
  ariaLabel?: string;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [flip, setFlip] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ buffer: "", at: 0 });

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const openList = (index?: number) => {
    if (disabled) return;
    const node = rootRef.current;
    const win = node?.ownerDocument.defaultView;
    if (node && win) {
      const r = node.getBoundingClientRect();
      const room = win.innerHeight - r.bottom;
      const needed = Math.min(options.length * 32 + 8, 264);
      setFlip(room < needed + 8 && r.top > room);
    }
    setActive(index ?? (selectedIndex >= 0 ? selectedIndex : 0));
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const node = rootRef.current;
    const doc = node?.ownerDocument;
    if (!doc) return;
    const onPointer = (e: Event) => {
      if (!node.contains(e.target as Node)) setOpen(false);
    };
    doc.addEventListener("mousedown", onPointer);
    doc.addEventListener("touchstart", onPointer);
    return () => {
      doc.removeEventListener("mousedown", onPointer);
      doc.removeEventListener("touchstart", onPointer);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const row = list?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!list || !row) return;
    const top = row.offsetTop;
    const bottom = top + row.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight)
      list.scrollTop = bottom - list.clientHeight;
  }, [open, active]);

  const commit = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    rootRef.current?.querySelector("button")?.focus({ preventScroll: true });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      commit(active);
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      const now = Date.now();
      const t = typeahead.current;
      t.buffer = now - t.at > 700 ? e.key : t.buffer + e.key;
      t.at = now;
      const hit = options.findIndex((o) =>
        o.label.toLowerCase().startsWith(t.buffer.toLowerCase()),
      );
      if (hit >= 0) setActive(hit);
    }
  };

  return (
    <div ref={rootRef} className={cx("relative", className)}>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={cx(
          inputClass,
          "flex cursor-pointer items-center justify-between gap-2 pr-2.5 text-left",
          focus,
          "focus-visible:outline-offset-[-2px]",
          open && "border-neutral-900 dark:border-white",
          triggerClassName,
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {leading}
          <span
            className={cx(
              "truncate",
              !selected && "text-neutral-400 dark:text-neutral-500",
            )}
          >
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cx(
            "h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-150 ease-out motion-reduce:transition-none dark:text-neutral-600",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          className={cx(
            "absolute z-30 max-h-[264px] w-full overflow-y-auto rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white p-1 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)] dark:border-neutral-800 dark:bg-neutral-900",
            flip ? "bottom-full mb-1.5" : "top-full mt-1.5",
          )}
        >
          {options.map((o, i) => {
            const isSelected = o.value === value;
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={isSelected}
                data-index={i}
                onMouseEnter={() => setActive(i)}
                onClick={() => commit(i)}
                className={cx(
                  "flex h-8 cursor-pointer items-center justify-between gap-2 rounded-[var(--rb-r-sm,6px)] px-2.5 text-sm text-neutral-900 dark:text-neutral-100",
                  i === active && "bg-neutral-100 dark:bg-neutral-800",
                )}
              >
                <span className="flex min-w-0 items-baseline gap-2">
                  <span className="truncate">{o.label}</span>
                  {o.hint && (
                    <span className="shrink-0 text-xs text-neutral-500">
                      {o.hint}
                    </span>
                  )}
                </span>
                {isSelected && (
                  <Check
                    aria-hidden="true"
                    className="h-3.5 w-3.5 shrink-0 text-neutral-900 dark:text-white"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const neutralBadge =
  "inline-flex h-5 shrink-0 items-center rounded-[var(--rb-r-sm,6px)] bg-neutral-100 px-1.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";

const emeraldBadge =
  "inline-flex h-5 shrink-0 items-center gap-1 rounded-[var(--rb-r-sm,6px)] bg-emerald-50 px-1.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";

const redBadge =
  "inline-flex h-5 shrink-0 items-center gap-1 rounded-[var(--rb-r-sm,6px)] bg-red-50 px-1.5 text-[11px] font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400";

const secondaryButton =
  "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-2.5 text-[13px] font-medium text-neutral-900 transition-[background-color,border-color,color,transform] duration-150 ease-out hover:bg-neutral-50 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const iconButton =
  "inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-600 transition-[background-color,border-color,color,transform] duration-150 ease-out hover:bg-neutral-200 hover:text-neutral-900 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

type TextField = {
  id: string;
  kind: "text" | "date";
  label: string;
  icon: LucideIcon;
  value: string;
};

type SelectField = {
  id: string;
  kind: "select";
  label: string;
  icon: LucideIcon;
  value: string;
  options: { value: string; label: string }[];
};

type EditableField = TextField | SelectField;

const CONDITION_OPTIONS = [
  { value: "excellent", label: "Excellent" },
  { value: "serviceable", label: "Serviceable" },
  { value: "needs-repair", label: "Needs repair" },
  { value: "out-of-service", label: "Out of service" },
];

const INTERVAL_OPTIONS = [
  { value: "30", label: "Every 30 days" },
  { value: "90", label: "Every 90 days" },
  { value: "180", label: "Every 180 days" },
  { value: "365", label: "Every 365 days" },
];

const INITIAL_FIELDS: EditableField[] = [
  {
    id: "asset-tag",
    kind: "text",
    label: "Asset tag",
    icon: Barcode,
    value: "EQ-20841",
  },
  {
    id: "model",
    kind: "text",
    label: "Model",
    icon: Wrench,
    value: "Atlas HG-40 compressor",
  },
  {
    id: "site",
    kind: "select",
    label: "Site",
    icon: Building,
    value: "riverside",
    options: [
      { value: "riverside", label: "Riverside plant" },
      { value: "eastdock", label: "East dock depot" },
      { value: "northgate", label: "Northgate yard" },
    ],
  },
  {
    id: "location",
    kind: "text",
    label: "Bay location",
    icon: MapPin,
    value: "Bay C, rack 14",
  },
  {
    id: "condition",
    kind: "select",
    label: "Condition",
    icon: Gauge,
    value: "serviceable",
    options: CONDITION_OPTIONS,
  },
  {
    id: "custodian",
    kind: "text",
    label: "Custodian",
    icon: User,
    value: "Priya Nandakumar",
  },
  {
    id: "warranty",
    kind: "date",
    label: "Warranty ends",
    icon: ShieldCheck,
    value: "2026-05-30",
  },
  {
    id: "last-service",
    kind: "date",
    label: "Last serviced",
    icon: Clock,
    value: "2026-06-18",
  },
  {
    id: "interval",
    kind: "select",
    label: "Service interval",
    icon: CircleGauge,
    value: "90",
    options: INTERVAL_OPTIONS,
  },
];

const TODAY = "2026-08-07";

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map((n) => Number.parseInt(n, 10));
  const base = Date.UTC(y, m - 1, d);
  const shifted = new Date(base + days * 86400000);
  return shifted.toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  if (!iso) return "Not set";
  const [y, m, d] = iso.split("-").map((n) => Number.parseInt(n, 10));
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${d} ${months[m - 1]} ${y}`;
}

function displayValue(field: EditableField): string {
  if (field.kind === "select") {
    return (
      field.options.find((o) => o.value === field.value)?.label ?? field.value
    );
  }
  if (field.kind === "date") return formatDate(field.value);
  return field.value;
}

export default function Forms4() {
  const [mounted, setMounted] = useState(false);
  const [fields, setFields] = useState<EditableField[]>(INITIAL_FIELDS);
  const [tracked, setTracked] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const controlRef = useRef<HTMLInputElement | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (editingId && controlRef.current)
      controlRef.current.focus({ preventScroll: true });
  }, [editingId]);

  const startEdit = (field: EditableField) => {
    setEditingId(field.id);
    setDraft(field.value);
  };

  const returnFocus = (id: string) => {
    requestAnimationFrame(() =>
      rowRefs.current[id]?.focus({ preventScroll: true }),
    );
  };

  const commit = (id: string) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === id ? ({ ...f, value: draft } as EditableField) : f,
      ),
    );
    setEditingId(null);
    returnFocus(id);
  };

  const cancel = (id: string) => {
    setEditingId(null);
    returnFocus(id);
  };

  const byId = (id: string) => fields.find((f) => f.id === id)!;
  const warranty = byId("warranty");
  const lastService = byId("last-service");
  const interval = byId("interval");

  const warrantyActive = warranty.value >= TODAY;
  const nextServiceDue = addDays(
    lastService.value,
    Number.parseInt(interval.value, 10),
  );

  return (
    <div className="flex h-full min-h-[720px] w-full flex-col justify-center overflow-y-auto bg-white p-8 sm:p-10 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[760px]">
        <div className="overflow-hidden rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-start justify-between gap-4 bg-neutral-50 px-4 py-3 dark:bg-neutral-900/60">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
                  Equipment record
                </h2>
                <span className={neutralBadge}>Fixed asset</span>
                <span className={neutralBadge}>Maintenance</span>
                <span className={warrantyActive ? emeraldBadge : redBadge}>
                  <span
                    aria-hidden="true"
                    className={cx(
                      "h-1.5 w-1.5 rounded-full",
                      warrantyActive ? "bg-emerald-500" : "bg-red-500",
                    )}
                  />
                  {warrantyActive ? "In warranty" : "Warranty expired"}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-neutral-500">
                Click a row to edit it. Each change saves on its own, there is
                no save bar.
              </p>
            </div>
            <button type="button" className={secondaryButton}>
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add note
            </button>
          </div>

          <div className="flex flex-col gap-1.5 p-1.5">
            {fields.map((field, i) => {
              const editing = editingId === field.id;
              const Icon = field.icon;
              return (
                <div
                  key={field.id}
                  ref={(el) => {
                    rowRefs.current[field.id] = el;
                  }}
                  role={editing ? undefined : "button"}
                  tabIndex={editing ? undefined : 0}
                  aria-label={editing ? undefined : `Edit ${field.label}`}
                  onClick={() => {
                    if (!editing && editingId === null) startEdit(field);
                  }}
                  onKeyDown={(e) => {
                    if (editing) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (editingId === null) startEdit(field);
                    }
                  }}
                  className={cx(
                    "grid grid-cols-1 items-center gap-1.5 rounded-[var(--rb-r-lg,10px)] bg-neutral-50 px-3 py-2.5 dark:bg-neutral-800/40 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)] sm:gap-4",
                    !editing &&
                      "cursor-pointer transition-colors duration-150 hover:bg-neutral-100 dark:hover:bg-neutral-800/70",
                    !editing && focus,
                    editingId !== null && !editing && "opacity-60",
                  )}
                  style={{
                    opacity: mounted ? undefined : 0,
                    transform: mounted ? undefined : "translateY(4px)",
                    transition:
                      "opacity 200ms ease-out, transform 200ms ease-out",
                    transitionDelay: `${Math.min(i, 8) * 20}ms`,
                  }}
                >
                  <span className="flex items-center gap-2 text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                    <Icon
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-neutral-400"
                    />
                    {field.label}
                  </span>

                  {editing ? (
                    <div className="flex items-center gap-2">
                      {field.kind === "select" ? (
                        <Select
                          value={draft}
                          onChange={(v) => setDraft(v)}
                          options={field.options}
                          className="min-w-0 flex-1"
                        />
                      ) : (
                        <input
                          ref={(el) => {
                            controlRef.current = el;
                          }}
                          type={field.kind === "date" ? "date" : "text"}
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commit(field.id);
                            if (e.key === "Escape") cancel(field.id);
                          }}
                          aria-label={field.label}
                          className={cx(
                            inputClass,
                            "min-w-0 flex-1",
                            field.kind === "date" && "tabular-nums",
                          )}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => commit(field.id)}
                        title="Save change"
                        className={iconButton}
                      >
                        <Check aria-hidden="true" className="h-4 w-4" />
                        <span className="sr-only">Save {field.label}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => cancel(field.id)}
                        title="Discard change"
                        className={iconButton}
                      >
                        <X aria-hidden="true" className="h-4 w-4" />
                        <span className="sr-only">Cancel</span>
                      </button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2 text-[13px] text-neutral-600 dark:text-neutral-300">
                      <span
                        className={cx(
                          (field.kind === "date" || field.id === "asset-tag") &&
                            "tabular-nums",
                        )}
                      >
                        {displayValue(field)}
                      </span>
                      <Pencil
                        aria-hidden="true"
                        className="ml-auto h-3.5 w-3.5 shrink-0 text-neutral-400"
                      />
                    </span>
                  )}
                </div>
              );
            })}

            <div className="grid grid-cols-1 items-center gap-1.5 rounded-[var(--rb-r-lg,10px)] bg-neutral-50 px-3 py-2.5 dark:bg-neutral-800/40 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)] sm:gap-4">
              <span className="flex items-center gap-2 text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                <Gauge
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-neutral-400"
                />
                Condition tracking
              </span>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-neutral-600 dark:text-neutral-300">
                  {tracked ? "Sensor telemetry on" : "Manual checks only"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={tracked}
                  aria-label="Condition tracking"
                  onClick={() => setTracked((v) => !v)}
                  className={cx(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-out",
                    focus,
                    tracked
                      ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
                      : "bg-neutral-200 dark:bg-neutral-700",
                  )}
                >
                  <span
                    className={cx(
                      "pointer-events-none inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:bg-neutral-900",
                      tracked ? "translate-x-[18px]" : "translate-x-0.5",
                    )}
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 items-center gap-1.5 rounded-[var(--rb-r-lg,10px)] bg-neutral-100/70 px-3 py-2.5 dark:bg-neutral-800/60 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)] sm:gap-4">
              <span className="flex items-center gap-2 text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                <Calendar
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-neutral-400"
                />
                Next service due
              </span>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] tabular-nums text-neutral-900 dark:text-neutral-100">
                  {formatDate(nextServiceDue)}
                </span>
                <span className={neutralBadge}>Calculated</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
