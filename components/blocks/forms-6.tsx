"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, Lock } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const inputClass =
  "h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

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

const errorBox =
  "border-red-500 hover:border-red-500 focus:border-red-500 focus-visible:outline-red-500 dark:border-red-500 dark:hover:border-red-500 dark:focus:border-red-500";

const primaryButton =
  "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-lg,10px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-4 text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] transition-[background-color,border-color,color,transform] duration-150 ease-out hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const secondaryButton =
  "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-900 transition-[background-color,border-color,color,transform] duration-150 ease-out hover:bg-neutral-50 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const labelClass =
  "block text-[13px] font-medium text-neutral-900 dark:text-neutral-100";

const checkboxClass =
  "peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-[var(--rb-r-xs,4px)] border border-neutral-300 bg-white transition-colors duration-150 checked:border-neutral-900 checked:bg-neutral-900 hover:border-neutral-400 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-950 dark:checked:border-white dark:checked:bg-white dark:hover:border-neutral-600 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const checkboxBox =
  "relative inline-flex h-4 w-4 shrink-0 items-center justify-center";

const checkboxMark =
  "pointer-events-none absolute h-3 w-3 text-[var(--rb-accent-fg,oklch(100%_0_0))] opacity-0 transition-opacity duration-150 peer-checked:opacity-100 motion-reduce:transition-none dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]";

const radioClass =
  "h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border border-neutral-300 bg-white transition-colors duration-150 checked:border-[5px] checked:border-neutral-900 hover:border-neutral-400 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-950 dark:checked:border-white dark:hover:border-neutral-600 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

type Country = {
  code: string;
  name: string;
  regionLabel: string | null;
  regions: string[] | null;
  postalLabel: string;
  postalHint: string;
  postalPattern: RegExp;
};

const COUNTRIES: Country[] = [
  {
    code: "US",
    name: "United States",
    regionLabel: "State",
    regions: [
      "California",
      "New York",
      "Texas",
      "Washington",
      "Illinois",
      "Massachusetts",
    ],
    postalLabel: "ZIP code",
    postalHint: "5 digits, e.g. 94103",
    postalPattern: /^\d{5}$/,
  },
  {
    code: "CA",
    name: "Canada",
    regionLabel: "Province",
    regions: [
      "Ontario",
      "Quebec",
      "British Columbia",
      "Alberta",
      "Nova Scotia",
    ],
    postalLabel: "Postal code",
    postalHint: "Format A1A 1A1",
    postalPattern: /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/,
  },
  {
    code: "IE",
    name: "Ireland",
    regionLabel: "County",
    regions: ["Dublin", "Cork", "Galway", "Limerick", "Kerry", "Mayo"],
    postalLabel: "Eircode",
    postalHint: "Format D02 X285",
    postalPattern: /^[A-Za-z]\d{2} ?[A-Za-z0-9]{4}$/,
  },
  {
    code: "SG",
    name: "Singapore",
    regionLabel: null,
    regions: null,
    postalLabel: "Postal code",
    postalHint: "6 digits, e.g. 049483",
    postalPattern: /^\d{6}$/,
  },
];

const countryByCode = (code: string) =>
  COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];

type Address = {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  country: string;
  region: string;
  postal: string;
};

const emptyAddress = (country: string): Address => ({
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  country,
  region: "",
  postal: "",
});

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function addressComplete(a: Address): boolean {
  const country = countryByCode(a.country);
  const regionOk = country.regions ? a.region !== "" : a.line1 !== "";
  return (
    a.fullName.trim() !== "" &&
    a.line1.trim() !== "" &&
    a.city.trim() !== "" &&
    regionOk &&
    country.postalPattern.test(a.postal.trim())
  );
}

const LINE_ITEMS = [
  { name: "Merino wool throw blanket", qty: 1, unit: 12800 },
  { name: "Ceramic pour-over set", qty: 2, unit: 4600 },
  { name: "Linen tea towels, set of 4", qty: 1, unit: 3400 },
];

const SHIPPING = [
  { id: "standard", label: "Standard", note: "5 to 7 business days", cents: 0 },
  {
    id: "express",
    label: "Express",
    note: "2 to 3 business days",
    cents: 1400,
  },
  { id: "priority", label: "Priority", note: "Next business day", cents: 2800 },
];

const TAX_RATE = 0.085;

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

function detectScheme(digits: string): string {
  if (digits === "") return "";
  const first = digits[0];
  if (first === "4") return "Visa";
  if (first === "5") return "Mastercard";
  if (first === "3") return "Amex";
  return "";
}

function formatCard(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

function AddressGroup({
  idPrefix,
  value,
  onChange,
}: {
  idPrefix: string;
  value: Address;
  onChange: (patch: Partial<Address>) => void;
}) {
  const country = countryByCode(value.country);
  const postalInvalid =
    value.postal.trim() !== "" &&
    !country.postalPattern.test(value.postal.trim());

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <label htmlFor={`${idPrefix}-name`} className={labelClass}>
          Full name
        </label>
        <input
          id={`${idPrefix}-name`}
          value={value.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          placeholder="Recipient name"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <label htmlFor={`${idPrefix}-line1`} className={labelClass}>
          Street address
        </label>
        <input
          id={`${idPrefix}-line1`}
          value={value.line1}
          onChange={(e) => onChange({ line1: e.target.value })}
          placeholder="Number and street"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <label htmlFor={`${idPrefix}-line2`} className={labelClass}>
          Apartment or unit
        </label>
        <input
          id={`${idPrefix}-line2`}
          value={value.line2}
          onChange={(e) => onChange({ line2: e.target.value })}
          placeholder="Optional"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-country`} className={labelClass}>
          Country
        </label>
        <Select
          id={`${idPrefix}-country`}
          value={value.country}
          onChange={(v) => onChange({ country: v, region: "", postal: "" })}
          options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-city`} className={labelClass}>
          City
        </label>
        <input
          id={`${idPrefix}-city`}
          value={value.city}
          onChange={(e) => onChange({ city: e.target.value })}
          placeholder="City or town"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-region`} className={labelClass}>
          {country.regionLabel ?? "Region"}
        </label>
        {country.regions ? (
          <Select
            id={`${idPrefix}-region`}
            value={value.region}
            onChange={(v) => onChange({ region: v })}
            options={country.regions.map((r) => ({ value: r, label: r }))}
            placeholder={`Select ${country.regionLabel?.toLowerCase()}`}
          />
        ) : (
          <input
            id={`${idPrefix}-region`}
            value={value.region}
            onChange={(e) => onChange({ region: e.target.value })}
            placeholder="District or area"
            className={inputClass}
          />
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-postal`} className={labelClass}>
          {country.postalLabel}
        </label>
        <input
          id={`${idPrefix}-postal`}
          value={value.postal}
          onChange={(e) => onChange({ postal: e.target.value })}
          aria-invalid={postalInvalid}
          aria-describedby={`${idPrefix}-postal-help`}
          placeholder={country.postalLabel}
          className={cx(inputClass, postalInvalid && errorBox)}
        />
        <p
          id={`${idPrefix}-postal-help`}
          className={cx(
            "text-xs",
            postalInvalid
              ? "text-red-600 dark:text-red-400"
              : "text-neutral-500",
          )}
        >
          {postalInvalid
            ? `Enter a valid ${country.postalLabel.toLowerCase()}.`
            : country.postalHint}
        </p>
      </div>
    </div>
  );
}

export default function Forms6() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [email, setEmail] = useState("");
  const [delivery, setDelivery] = useState<Address>(emptyAddress("US"));
  const [billingSame, setBillingSame] = useState(true);
  const [billing, setBilling] = useState<Address>(emptyAddress("US"));

  const [shippingId, setShippingId] = useState("standard");

  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const [cartEmpty, setCartEmpty] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const scheme = detectScheme(card.replace(/\D/g, ""));
  const cardDigits = card.replace(/\D/g, "");

  const items = cartEmpty ? [] : LINE_ITEMS;
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.unit, 0);
  const shippingCents = SHIPPING.find((s) => s.id === shippingId)?.cents ?? 0;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shippingCents + tax;

  const shippingLabel =
    SHIPPING.find((s) => s.id === shippingId)?.label ?? "Standard";
  const cardLast4 = cardDigits.slice(-4);

  const emailValid = isEmail(email);
  const cardValid = cardDigits.length >= 15;
  const expiryValid = expiry.replace(/\D/g, "").length === 4;
  const cvcValid = cvc.length >= 3;

  const valid =
    !cartEmpty &&
    emailValid &&
    addressComplete(delivery) &&
    (billingSame || addressComplete(billing)) &&
    cardValid &&
    expiryValid &&
    cvcValid;

  const sectionStyle = (i: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? undefined : "translateY(4px)",
    transition: "opacity 200ms ease-out, transform 200ms ease-out",
    transitionDelay: `${Math.min(i, 8) * 20}ms`,
  });

  return (
    <div className="relative flex h-full min-h-[1040px] w-full flex-col justify-center overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[1100px]">
        {submitted ? (
          <div className="overflow-hidden rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]">
                <Check
                  aria-hidden="true"
                  className="h-6 w-6"
                  strokeWidth={2.5}
                />
              </span>
              <h2 className="mt-4 text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
                Order confirmed
              </h2>
              <p className="mt-1 max-w-sm text-sm text-neutral-500">
                We sent a receipt to {email || "your inbox"}. Your order ships
                once payment settles.
              </p>
              <dl className="mt-5 w-full max-w-sm space-y-2.5 rounded-[var(--rb-r-lg,10px)] bg-neutral-50 p-4 text-left dark:bg-neutral-800/40">
                <div className="flex items-center justify-between text-[13px]">
                  <dt className="text-neutral-500">Order reference</dt>
                  <dd className="font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                    ORD-2026-5821
                  </dd>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <dt className="text-neutral-500">Amount charged</dt>
                  <dd className="tabular-nums text-neutral-900 dark:text-neutral-100">
                    {money(total)}
                  </dd>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <dt className="text-neutral-500">Shipping</dt>
                  <dd className="text-neutral-900 dark:text-neutral-100">
                    {shippingLabel}
                  </dd>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <dt className="text-neutral-500">Card charged</dt>
                  <dd className="tabular-nums text-neutral-900 dark:text-neutral-100">
                    •••• {cardLast4}
                  </dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className={cx(secondaryButton, "mt-6")}
              >
                Back to checkout
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start justify-between gap-4 bg-neutral-50 px-4 py-3 dark:bg-neutral-900/60">
              <div className="min-w-0">
                <h2 className="text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
                  Checkout
                </h2>
                <p className="mt-0.5 truncate text-[13px] text-neutral-500">
                  Enter delivery and payment details to complete your order.
                </p>
              </div>
              <span className="hidden shrink-0 items-center gap-1.5 text-[13px] text-neutral-500 sm:inline-flex">
                <Lock aria-hidden="true" className="h-3.5 w-3.5" />
                Secure
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] sm:p-5">
              <div className="space-y-4">
                <section style={sectionStyle(0)}>
                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      Delivery address
                    </h3>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Where should we send this order?
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="frm6-email" className={labelClass}>
                        Email for updates
                      </label>
                      <input
                        id="frm6-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-invalid={email !== "" && !emailValid}
                        placeholder="you@example.com"
                        className={cx(
                          inputClass,
                          email !== "" && !emailValid && errorBox,
                        )}
                      />
                    </div>

                    <AddressGroup
                      idPrefix="frm6-del"
                      value={delivery}
                      onChange={(patch) =>
                        setDelivery((prev) => ({ ...prev, ...patch }))
                      }
                    />
                  </div>
                </section>

                <section style={sectionStyle(1)}>
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-[var(--rb-r-lg,10px)] bg-neutral-50 px-3 py-2.5 dark:bg-neutral-800/50">
                    <span className={checkboxBox}>
                      <input
                        type="checkbox"
                        checked={billingSame}
                        onChange={(e) => setBillingSame(e.target.checked)}
                        className={checkboxClass}
                      />
                      <Check
                        aria-hidden="true"
                        strokeWidth={3}
                        className={checkboxMark}
                      />
                    </span>
                    <span className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                      Billing address matches delivery
                    </span>
                  </label>

                  <div
                    className="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
                    style={{ gridTemplateRows: billingSame ? "0fr" : "1fr" }}
                  >
                    <div className="overflow-hidden">
                      <div className="pt-4">
                        <div className="mb-3">
                          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            Billing address
                          </h3>
                          <p className="mt-0.5 text-xs text-neutral-500">
                            The address on your payment method.
                          </p>
                        </div>
                        <AddressGroup
                          idPrefix="frm6-bill"
                          value={billing}
                          onChange={(patch) =>
                            setBilling((prev) => ({ ...prev, ...patch }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section style={sectionStyle(2)}>
                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      Payment
                    </h3>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Your card is charged when the order ships.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label htmlFor="frm6-card" className={labelClass}>
                        Card number
                      </label>
                      <div className="relative">
                        <input
                          id="frm6-card"
                          inputMode="numeric"
                          value={card}
                          onChange={(e) => setCard(formatCard(e.target.value))}
                          placeholder="1234 5678 9012 3456"
                          className={cx(inputClass, "pr-20 tabular-nums")}
                        />
                        {scheme && (
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-neutral-500">
                            {scheme}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="frm6-exp" className={labelClass}>
                        Expiry
                      </label>
                      <input
                        id="frm6-exp"
                        inputMode="numeric"
                        value={expiry}
                        onChange={(e) =>
                          setExpiry(formatExpiry(e.target.value))
                        }
                        placeholder="MM / YY"
                        className={cx(inputClass, "tabular-nums")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="frm6-cvc" className={labelClass}>
                        CVC
                      </label>
                      <input
                        id="frm6-cvc"
                        inputMode="numeric"
                        value={cvc}
                        onChange={(e) =>
                          setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                        }
                        placeholder="123"
                        className={cx(inputClass, "tabular-nums")}
                      />
                    </div>
                  </div>
                </section>
              </div>

              <aside style={sectionStyle(3)}>
                <div className="rounded-[var(--rb-r-lg,10px)] bg-neutral-50 p-4 dark:bg-neutral-800/40">
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Order summary
                  </h3>

                  {cartEmpty ? (
                    <div className="mt-3 flex flex-col items-center rounded-[var(--rb-r-md,8px)] bg-white px-4 py-8 text-center dark:bg-neutral-900/60">
                      <p className="text-[13px] text-neutral-700 dark:text-neutral-300">
                        Your cart is empty.
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        Restore your items to continue checking out.
                      </p>
                      <button
                        type="button"
                        onClick={() => setCartEmpty(false)}
                        className={cx(
                          secondaryButton,
                          "mt-3 h-8 px-2.5 text-[13px]",
                        )}
                      >
                        Restore items
                      </button>
                    </div>
                  ) : (
                    <>
                      <ul className="mt-3 space-y-2.5">
                        {items.map((item) => (
                          <li
                            key={item.name}
                            className="flex items-start justify-between gap-3"
                          >
                            <span className="min-w-0 text-[13px] text-neutral-700 dark:text-neutral-300">
                              <span className="block truncate">
                                {item.name}
                              </span>
                              <span className="text-xs text-neutral-500">
                                Qty {item.qty} · {money(item.unit)} each
                              </span>
                            </span>
                            <span className="shrink-0 text-[13px] tabular-nums text-neutral-900 dark:text-neutral-100">
                              {money(item.qty * item.unit)}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
                          Shipping speed
                        </p>
                        <div className="space-y-1.5">
                          {SHIPPING.map((s) => (
                            <label
                              key={s.id}
                              className="flex cursor-pointer items-center gap-2.5 rounded-[var(--rb-r-md,8px)] bg-white px-3 py-2 dark:bg-neutral-900/60"
                            >
                              <input
                                type="radio"
                                name="frm6-shipping"
                                value={s.id}
                                checked={shippingId === s.id}
                                onChange={() => setShippingId(s.id)}
                                className={radioClass}
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block text-[13px] text-neutral-900 dark:text-neutral-100">
                                  {s.label}
                                </span>
                                <span className="block text-xs text-neutral-500">
                                  {s.note}
                                </span>
                              </span>
                              <span className="shrink-0 text-[13px] tabular-nums text-neutral-700 dark:text-neutral-300">
                                {s.cents === 0 ? "Free" : money(s.cents)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <dl className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-[13px]">
                          <dt className="text-neutral-500">Subtotal</dt>
                          <dd className="tabular-nums text-neutral-900 dark:text-neutral-100">
                            {money(subtotal)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between text-[13px]">
                          <dt className="text-neutral-500">Shipping</dt>
                          <dd className="tabular-nums text-neutral-900 dark:text-neutral-100">
                            {shippingCents === 0
                              ? "Free"
                              : money(shippingCents)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between text-[13px]">
                          <dt className="text-neutral-500">
                            Tax ({(TAX_RATE * 100).toFixed(1)}%)
                          </dt>
                          <dd className="tabular-nums text-neutral-900 dark:text-neutral-100">
                            {money(tax)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between pt-2 text-sm">
                          <dt className="font-medium text-neutral-900 dark:text-neutral-100">
                            Total
                          </dt>
                          <dd className="font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                            {money(total)}
                          </dd>
                        </div>
                      </dl>
                    </>
                  )}
                </div>
              </aside>
            </div>

            <div className="flex flex-col-reverse items-stretch gap-2 bg-neutral-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:bg-neutral-900/60">
              <button
                type="button"
                disabled={cartEmpty}
                onClick={() => setCartEmpty(true)}
                className={secondaryButton}
              >
                Back to cart
              </button>
              <div className="flex items-center gap-3">
                {!valid && (
                  <span className="hidden text-xs text-neutral-500 sm:inline">
                    {cartEmpty
                      ? "Your cart is empty"
                      : "Complete the required fields to pay"}
                  </span>
                )}
                <button
                  type="button"
                  disabled={!valid}
                  onClick={() => setSubmitted(true)}
                  className={cx(primaryButton, "flex-1 sm:flex-none")}
                >
                  Pay {money(total)}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
