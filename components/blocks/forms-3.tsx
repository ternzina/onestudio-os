"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Building2,
  Calendar,
  Check,
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const inputClass =
  "h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const labelClass =
  "block text-[13px] font-medium text-neutral-900 dark:text-neutral-100";

const neutralBadge =
  "inline-flex h-5 shrink-0 items-center rounded-[var(--rb-r-sm,6px)] bg-neutral-100 px-1.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";

const secondaryButton =
  "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 transition-[background-color,border-color,color,transform] duration-150 ease-out hover:bg-neutral-50 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const primaryButton =
  "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3 text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] transition-[background-color,border-color,color,transform] duration-150 ease-out hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const iconButton =
  "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-600 transition-[background-color,border-color,color,transform] duration-150 ease-out hover:bg-neutral-200 hover:text-neutral-900 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

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

const CARGO_OPTIONS = [
  { value: "palletised", label: "Palletised dry goods" },
  { value: "reefer", label: "Temperature-controlled" },
  { value: "hazmat", label: "Hazardous, class 3" },
  { value: "machinery", label: "Machinery and parts" },
  { value: "textiles", label: "Baled textiles" },
];

const ACCOUNTS = [
  {
    value: "northwind",
    label: "Northwind Traders",
    origin: "Rotterdam, NL",
    destination: "Gdansk, PL",
  },
  {
    value: "meridian",
    label: "Meridian Logistics",
    origin: "Felixstowe, GB",
    destination: "Bilbao, ES",
  },
  {
    value: "parcelworks",
    label: "Parcelworks BV",
    origin: "Antwerp, BE",
    destination: "Marseille, FR",
  },
];

const DUTY_OPTIONS = [
  { value: 0, label: "0% exempt" },
  { value: 0.05, label: "5% reduced" },
  { value: 0.12, label: "12% standard" },
  { value: 0.18, label: "18% elevated" },
];

type Line = {
  id: number;
  cargo: string;
  qty: string;
  rate: string;
  duty: number;
};

const INITIAL_LINES: Line[] = [
  { id: 1, cargo: "palletised", qty: "18", rate: "42.50", duty: 0.05 },
  { id: 2, cargo: "reefer", qty: "6", rate: "128.00", duty: 0.12 },
  { id: 3, cargo: "machinery", qty: "2", rate: "540.00", duty: 0.18 },
];

const currency = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const round2 = (n: number) => Math.round(n * 100) / 100;

const toNum = (v: string) => {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const lineBase = (l: Line) => round2(toNum(l.qty) * toNum(l.rate));
const lineDuty = (l: Line) => round2(lineBase(l) * l.duty);
const lineTotal = (l: Line) => round2(lineBase(l) + lineDuty(l));

export default function Forms3() {
  const [mounted, setMounted] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [account, setAccount] = useState("northwind");
  const [reference, setReference] = useState("SHP-4471");
  const [taxId, setTaxId] = useState("GB 842 5591 07");
  const [contact, setContact] = useState("Lena Ostrowski");

  const [pickupDate, setPickupDate] = useState("2026-08-14");
  const [deliveryDate, setDeliveryDate] = useState("2026-08-21");
  const [incoterm, setIncoterm] = useState("DAP");
  const [serviceLevel, setServiceLevel] = useState("standard");
  const [currencyCode, setCurrencyCode] = useState("EUR");

  const [lines, setLines] = useState<Line[]>(INITIAL_LINES);
  const [nextId, setNextId] = useState(4);

  const [submitted, setSubmitted] = useState(false);
  const [savedNote, setSavedNote] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    [],
  );

  const totals = useMemo(() => {
    let subtotal = 0;
    let dutyTotal = 0;
    for (const l of lines) {
      subtotal += lineBase(l);
      dutyTotal += lineDuty(l);
    }
    return { subtotal, dutyTotal, grand: subtotal + dutyTotal };
  }, [lines]);

  const markDirty = () => {
    setDirty(true);
    setSavedNote(false);
  };

  const updateLine = (id: number, patch: Partial<Line>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    markDirty();
  };

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { id: nextId, cargo: "palletised", qty: "1", rate: "0.00", duty: 0.12 },
    ]);
    setNextId((n) => n + 1);
    markDirty();
  };

  const removeLine = (id: number) => {
    setLines((prev) =>
      prev.length > 1 ? prev.filter((l) => l.id !== id) : prev,
    );
    markDirty();
  };

  const saveDraft = () => {
    setDirty(false);
    setSavedNote(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSavedNote(false), 2500);
  };

  const resetForm = () => {
    setAccount("northwind");
    setReference("SHP-4471");
    setTaxId("GB 842 5591 07");
    setContact("Lena Ostrowski");
    setPickupDate("2026-08-14");
    setDeliveryDate("2026-08-21");
    setIncoterm("DAP");
    setServiceLevel("standard");
    setCurrencyCode("EUR");
    setLines(INITIAL_LINES);
    setNextId(4);
    setDirty(false);
    setSavedNote(false);
    setSubmitted(false);
  };

  const activeAccount =
    ACCOUNTS.find((a) => a.value === account) ?? ACCOUNTS[0];

  return (
    <div className="flex h-full min-h-[1120px] w-full flex-col justify-center overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[1100px]">
        {submitted ? (
          <div className="mx-auto flex max-w-[520px] flex-col items-center rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-white px-6 py-14 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]">
              <Check aria-hidden="true" className="h-6 w-6" strokeWidth={2.5} />
            </span>
            <h2 className="mt-4 text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
              Shipment booked
            </h2>
            <p className="mt-1.5 max-w-sm text-[13px] text-neutral-600 dark:text-neutral-400">
              Booking{" "}
              <span className="font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                {reference}
              </span>{" "}
              is confirmed on the {activeAccount.origin} to{" "}
              {activeAccount.destination} lane. The carrier will send collection
              details shortly.
            </p>
            <div className="mt-4 flex w-full max-w-[280px] items-center justify-between gap-6 rounded-[var(--rb-r-lg,10px)] bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-800/60">
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                Total booked
              </span>
              <span className="font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                {currencyCode} {currency(totals.grand)}
              </span>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className={cx(secondaryButton, "mt-5")}
            >
              Book another shipment
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start justify-between gap-4 bg-neutral-50 px-4 py-3 dark:bg-neutral-900/60">
              <div className="min-w-0">
                <h2 className="text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
                  New freight booking
                </h2>
                <p className="mt-0.5 text-[13px] text-neutral-500">
                  Consignor, route and cargo for a single shipment.
                </p>
              </div>
              <span className={neutralBadge}>Draft</span>
            </div>

            <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
              <section
                className="rounded-[var(--rb-r-lg,10px)] bg-neutral-50 p-4 dark:bg-neutral-900/40"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? undefined : "translateY(4px)",
                  transition:
                    "opacity 200ms ease-out, transform 200ms ease-out",
                  transitionDelay: "0ms",
                }}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      Consignor
                    </h3>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Who is sending the goods and how to reach them.
                    </p>
                  </div>
                  <span className={neutralBadge}>Shipper</span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="frm3-account" className={labelClass}>
                      Account
                    </label>
                    <Select
                      id="frm3-account"
                      value={account}
                      onChange={(v) => {
                        setAccount(v);
                        markDirty();
                      }}
                      options={ACCOUNTS.map((a) => ({
                        value: a.value,
                        label: a.label,
                      }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="frm3-reference" className={labelClass}>
                      Booking reference
                    </label>
                    <input
                      id="frm3-reference"
                      value={reference}
                      onChange={(e) => {
                        setReference(e.target.value);
                        markDirty();
                      }}
                      className={cx(inputClass, "tabular-nums")}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="frm3-taxid" className={labelClass}>
                      Tax identifier
                    </label>
                    <div className="relative">
                      <Building2
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                      />
                      <input
                        id="frm3-taxid"
                        value={taxId}
                        onChange={(e) => {
                          setTaxId(e.target.value);
                          markDirty();
                        }}
                        className={cx(inputClass, "pl-9 tabular-nums")}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="frm3-contact" className={labelClass}>
                      Booking contact
                    </label>
                    <input
                      id="frm3-contact"
                      value={contact}
                      onChange={(e) => {
                        setContact(e.target.value);
                        markDirty();
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <section
                className="rounded-[var(--rb-r-lg,10px)] bg-neutral-50 p-4 dark:bg-neutral-900/40"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? undefined : "translateY(4px)",
                  transition:
                    "opacity 200ms ease-out, transform 200ms ease-out",
                  transitionDelay: "20ms",
                }}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      Route and terms
                    </h3>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Collection window, delivery terms and settlement currency.
                    </p>
                  </div>
                  <span className={neutralBadge}>Transit</span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1.5">
                    <label htmlFor="frm3-pickup" className={labelClass}>
                      Pickup date
                    </label>
                    <div className="relative">
                      <input
                        id="frm3-pickup"
                        type="date"
                        value={pickupDate}
                        onChange={(e) => {
                          setPickupDate(e.target.value);
                          markDirty();
                        }}
                        className={cx(inputClass, "pr-9 tabular-nums")}
                      />
                      <Calendar
                        aria-hidden="true"
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="frm3-delivery" className={labelClass}>
                      Delivery date
                    </label>
                    <div className="relative">
                      <input
                        id="frm3-delivery"
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => {
                          setDeliveryDate(e.target.value);
                          markDirty();
                        }}
                        className={cx(inputClass, "pr-9 tabular-nums")}
                      />
                      <Calendar
                        aria-hidden="true"
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="frm3-incoterm" className={labelClass}>
                      Incoterm
                    </label>
                    <Select
                      id="frm3-incoterm"
                      value={incoterm}
                      onChange={(v) => {
                        setIncoterm(v);
                        markDirty();
                      }}
                      options={[
                        { value: "EXW", label: "EXW, ex works" },
                        { value: "FCA", label: "FCA, free carrier" },
                        { value: "DAP", label: "DAP, delivered at place" },
                        { value: "DDP", label: "DDP, delivered duty paid" },
                      ]}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="frm3-service" className={labelClass}>
                      Service level
                    </label>
                    <Select
                      id="frm3-service"
                      value={serviceLevel}
                      onChange={(v) => {
                        setServiceLevel(v);
                        markDirty();
                      }}
                      options={[
                        { value: "economy", label: "Economy road" },
                        { value: "standard", label: "Standard groupage" },
                        { value: "express", label: "Express dedicated" },
                      ]}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="frm3-currency" className={labelClass}>
                      Currency
                    </label>
                    <Select
                      id="frm3-currency"
                      value={currencyCode}
                      onChange={(v) => {
                        setCurrencyCode(v);
                        markDirty();
                      }}
                      options={[
                        { value: "EUR", label: "EUR, euro" },
                        { value: "GBP", label: "GBP, pound sterling" },
                        { value: "USD", label: "USD, US dollar" },
                      ]}
                    />
                  </div>
                </div>
              </section>

              <section
                className="rounded-[var(--rb-r-lg,10px)] bg-neutral-50 p-4 dark:bg-neutral-900/40"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? undefined : "translateY(4px)",
                  transition:
                    "opacity 200ms ease-out, transform 200ms ease-out",
                  transitionDelay: "40ms",
                }}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      Cargo lines
                    </h3>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Amount per line is quantity times unit rate plus duty.
                    </p>
                  </div>
                  <span className={neutralBadge}>
                    {lines.length} {lines.length === 1 ? "line" : "lines"}
                  </span>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_72px_104px_120px_112px_32px] items-center gap-2 border-b border-neutral-200/70 px-1 pb-2 dark:border-neutral-800">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                    Description
                  </span>
                  <span className="text-right text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                    Qty
                  </span>
                  <span className="text-right text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                    Unit rate
                  </span>
                  <span className="text-right text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                    Duty
                  </span>
                  <span className="text-right text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                    Amount
                  </span>
                  <span className="sr-only">Actions</span>
                </div>

                <div className="flex flex-col gap-1.5 pt-1.5">
                  {lines.map((line) => {
                    const only = lines.length === 1;
                    return (
                      <div
                        key={line.id}
                        className="grid grid-cols-[minmax(0,1fr)_72px_104px_120px_112px_32px] items-center gap-2 rounded-[var(--rb-r-md,8px)] bg-white px-1 py-1.5 dark:bg-neutral-950/40"
                      >
                        <div className="min-w-0">
                          <Select
                            ariaLabel="Cargo description"
                            triggerClassName="h-8 text-[13px]"
                            value={line.cargo}
                            onChange={(v) => updateLine(line.id, { cargo: v })}
                            options={CARGO_OPTIONS}
                          />
                        </div>

                        <input
                          aria-label="Quantity"
                          inputMode="numeric"
                          value={line.qty}
                          onChange={(e) =>
                            updateLine(line.id, {
                              qty: e.target.value.replace(/[^0-9]/g, ""),
                            })
                          }
                          className={cx(
                            inputClass,
                            "h-8 px-2 text-right text-[13px] tabular-nums",
                          )}
                        />

                        <input
                          aria-label="Unit rate"
                          inputMode="decimal"
                          value={line.rate}
                          onChange={(e) =>
                            updateLine(line.id, {
                              rate: e.target.value.replace(/[^0-9.]/g, ""),
                            })
                          }
                          className={cx(
                            inputClass,
                            "h-8 px-2 text-right text-[13px] tabular-nums",
                          )}
                        />

                        <Select
                          ariaLabel="Duty rate"
                          triggerClassName="h-8 text-[13px] tabular-nums"
                          value={String(line.duty)}
                          onChange={(v) =>
                            updateLine(line.id, {
                              duty: Number.parseFloat(v),
                            })
                          }
                          options={DUTY_OPTIONS.map((o) => ({
                            value: String(o.value),
                            label: o.label,
                          }))}
                        />

                        <span className="pr-1 text-right text-[13px] tabular-nums text-neutral-900 dark:text-neutral-100">
                          {currency(lineTotal(line))}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          disabled={only}
                          title={
                            only
                              ? "A booking needs at least one cargo line"
                              : "Remove line"
                          }
                          className={cx(iconButton, "h-8 w-8")}
                        >
                          <Trash2 aria-hidden="true" className="h-4 w-4" />
                          <span className="sr-only">Remove line</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <button
                    type="button"
                    onClick={addLine}
                    className={secondaryButton}
                  >
                    <Plus aria-hidden="true" className="h-4 w-4" />
                    Add line
                  </button>

                  <div className="w-full max-w-[280px] space-y-1.5 sm:w-auto">
                    <div className="flex items-center justify-between gap-6 rounded-[var(--rb-r-md,8px)] bg-white px-3 py-2 text-[13px] dark:bg-neutral-950/40">
                      <span className="text-neutral-500">Subtotal</span>
                      <span className="tabular-nums text-neutral-900 dark:text-neutral-100">
                        {currencyCode} {currency(totals.subtotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-6 rounded-[var(--rb-r-md,8px)] bg-white px-3 py-2 text-[13px] dark:bg-neutral-950/40">
                      <span className="text-neutral-500">Duty total</span>
                      <span className="tabular-nums text-neutral-900 dark:text-neutral-100">
                        {currencyCode} {currency(totals.dutyTotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-6 rounded-[var(--rb-r-md,8px)] bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-800/60">
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        Grand total
                      </span>
                      <span className="font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                        {currencyCode} {currency(totals.grand)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="flex flex-col-reverse items-stretch justify-between gap-3 bg-neutral-50 px-4 py-3 dark:bg-neutral-900/60 sm:flex-row sm:items-center">
              <p
                className={cx(
                  "text-xs",
                  savedNote
                    ? "text-neutral-700 dark:text-neutral-300"
                    : "text-neutral-500",
                )}
                aria-live="polite"
              >
                {savedNote
                  ? "Draft saved"
                  : "Rates are indicative until the carrier confirms capacity."}
              </p>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={saveDraft}
                  className={secondaryButton}
                >
                  Save draft
                </button>
                <button
                  type="button"
                  disabled={!dirty}
                  onClick={() => setSubmitted(true)}
                  className={primaryButton}
                >
                  Book shipment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
