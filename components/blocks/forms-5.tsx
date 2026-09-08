"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, ChevronDown, Eye, EyeOff, Globe, X } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const checkboxClass =
  "peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-[var(--rb-r-xs,4px)] border border-neutral-300 bg-white transition-colors duration-150 checked:border-neutral-900 checked:bg-neutral-900 hover:border-neutral-400 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-950 dark:checked:border-white dark:checked:bg-white dark:hover:border-neutral-600 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const checkboxBox =
  "relative inline-flex h-4 w-4 shrink-0 items-center justify-center";

const checkboxMark =
  "pointer-events-none absolute h-3 w-3 text-[var(--rb-accent-fg,oklch(100%_0_0))] opacity-0 transition-opacity duration-150 peer-checked:opacity-100 motion-reduce:transition-none dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]";

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

const inputBase =
  "h-9 w-full rounded-[var(--rb-r-md,8px)] border bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500";

const inputRest =
  "border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:border-neutral-800 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const inputError =
  "border-red-500 focus:border-red-500 focus-visible:outline-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus-visible:outline-red-500";

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
          cx(inputBase, inputRest),
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

const labelClass =
  "block text-sm font-medium text-neutral-900 dark:text-neutral-100";

const helpClass = "text-xs text-neutral-500";
const errorClass = "text-xs text-red-600 dark:text-red-400";

const primaryButton =
  "inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3 text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] transition-[background-color,border-color,color,transform] duration-150 ease-out hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const secondaryButton =
  "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 transition-[background-color,border-color,color,transform] duration-150 ease-out hover:bg-neutral-50 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const RESERVED_SUBDOMAINS = ["demo", "admin", "clinic", "app", "api", "test"];

const REGION_OPTIONS = [
  { value: "eu-west", label: "EU West, Dublin" },
  { value: "eu-central", label: "EU Central, Frankfurt" },
  { value: "uk-south", label: "UK South, London" },
  { value: "us-east", label: "US East, Virginia" },
];

const PLAN_OPTIONS = [
  {
    value: "solo",
    name: "Solo clinic",
    description: "One location, up to 8 providers.",
    price: "$49/mo",
  },
  {
    value: "group",
    name: "Group practice",
    description: "Multi-site scheduling and shared rooms.",
    price: "$149/mo",
  },
  {
    value: "network",
    name: "Health network",
    description: "Unlimited sites with SSO and audit logs.",
    price: "$420/mo",
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSubdomain(value: string): {
  ok: boolean;
  message: string;
} {
  if (value.length === 0)
    return { ok: false, message: "Choose a subdomain for the workspace." };
  if (value.length < 3)
    return { ok: false, message: "Use at least 3 characters." };
  if (/[A-Z]/.test(value))
    return { ok: false, message: "Use lowercase letters only." };
  if (/[^a-z0-9-]/.test(value))
    return {
      ok: false,
      message: "Only lowercase letters, digits and hyphens are allowed.",
    };
  if (value.startsWith("-") || value.endsWith("-"))
    return { ok: false, message: "Cannot start or end with a hyphen." };
  if (RESERVED_SUBDOMAINS.includes(value))
    return { ok: false, message: "That subdomain is already taken." };
  return { ok: true, message: "Available" };
}

const passwordRules = [
  {
    id: "length",
    label: "At least 10 characters",
    test: (p: string) => p.length >= 10,
  },
  {
    id: "case",
    label: "Upper and lower case",
    test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p),
  },
  { id: "digit", label: "A number", test: (p: string) => /[0-9]/.test(p) },
  {
    id: "symbol",
    label: "A symbol",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

export default function Forms5() {
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [org, setOrg] = useState("");
  const [orgTouched, setOrgTouched] = useState(false);

  const [subdomain, setSubdomain] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);

  const [region, setRegion] = useState("eu-west");
  const [plan, setPlan] = useState("group");
  const [consent, setConsent] = useState(false);

  const { ref, edges, onScroll } = useScrollFade<HTMLDivElement>();

  useEffect(() => setMounted(true), []);

  const orgValid = org.trim().length >= 2;
  const orgError = orgTouched && !orgValid;

  const sub = validateSubdomain(subdomain);
  const subError = subdomain.length > 0 && !sub.ok;
  const subOk = subdomain.length > 0 && sub.ok;

  const emailValid = EMAIL_RE.test(email);
  const emailError = emailTouched && !emailValid;

  const ruleResults = useMemo(
    () => passwordRules.map((r) => ({ ...r, passed: r.test(password) })),
    [password],
  );
  const passedCount = ruleResults.filter((r) => r.passed).length;
  const passwordValid = passedCount === passwordRules.length;

  const confirmValid = confirm.length > 0 && confirm === password;
  const confirmError = confirmTouched && !confirmValid;

  const allValid =
    orgValid && subOk && emailValid && passwordValid && confirmValid && consent;

  const resetForm = () => {
    setOrg("");
    setOrgTouched(false);
    setSubdomain("");
    setEmail("");
    setEmailTouched(false);
    setPassword("");
    setShowPassword(false);
    setConfirm("");
    setConfirmTouched(false);
    setRegion("eu-west");
    setPlan("group");
    setConsent(false);
    setSubmitted(false);
  };

  const strengthColors = [
    "bg-red-500",
    "bg-amber-500",
    "bg-amber-500",
    "bg-emerald-500",
  ];

  return (
    <div className="flex h-full min-h-[720px] w-full flex-col justify-center overflow-y-auto bg-white p-8 sm:p-10 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-[760px]">
        <div
          className="overflow-hidden rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-900"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? undefined : "translateY(4px)",
            transition: "opacity 200ms ease-out, transform 200ms ease-out",
          }}
        >
          <div className="bg-neutral-50 px-4 py-3 dark:bg-neutral-900/60">
            <h2 className="text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
              Provision a workspace
            </h2>
            <p className="mt-0.5 text-[13px] text-neutral-500">
              Stand up a new tenant for your clinical scheduling account.
            </p>
          </div>

          {submitted ? (
            <div className="flex min-h-[520px] flex-col items-center justify-center px-6 py-12 text-center">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]">
                <Check
                  aria-hidden="true"
                  className="h-6 w-6"
                  strokeWidth={2.5}
                />
              </span>
              <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                Workspace created
              </h3>
              <p className="mt-1.5 max-w-sm text-[13px] text-neutral-600 dark:text-neutral-400">
                <span className="font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                  {subdomain}.med-sched.app
                </span>{" "}
                is provisioning now. The admin invite is on its way to {email}.
              </p>
              <button
                type="button"
                onClick={resetForm}
                className={cx(secondaryButton, "mt-5")}
              >
                Provision another
              </button>
            </div>
          ) : (
            <>
              <div className="relative min-h-0">
                <div
                  ref={ref}
                  onScroll={onScroll}
                  style={{ touchAction: "pan-y" }}
                  className="max-h-[460px] space-y-4 overflow-y-auto px-4 py-4"
                >
                  <div className="space-y-1.5">
                    <label htmlFor="frm5-org" className={labelClass}>
                      Organisation name
                      <span aria-hidden="true" className="text-neutral-400">
                        {" "}
                        *
                      </span>
                    </label>
                    <input
                      id="frm5-org"
                      value={org}
                      required
                      onChange={(e) => setOrg(e.target.value)}
                      onBlur={() => setOrgTouched(true)}
                      aria-invalid={orgError || undefined}
                      aria-describedby={
                        orgError ? "frm5-org-error" : "frm5-org-help"
                      }
                      placeholder="Riverside Family Health"
                      className={cx(
                        inputBase,
                        orgError ? inputError : inputRest,
                      )}
                    />
                    {orgError ? (
                      <p id="frm5-org-error" className={errorClass}>
                        Enter the clinic or organisation name, at least 2
                        characters.
                      </p>
                    ) : (
                      <p id="frm5-org-help" className={helpClass}>
                        Shown to staff on the sign-in screen.
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="frm5-subdomain" className={labelClass}>
                      Workspace address
                      <span aria-hidden="true" className="text-neutral-400">
                        {" "}
                        *
                      </span>
                    </label>
                    <div
                      className={cx(
                        "flex h-9 w-full items-center rounded-[var(--rb-r-md,8px)] border bg-white px-3 transition-colors duration-150 focus-within:outline-none focus-within:outline-2 focus-within:outline-offset-2 dark:bg-neutral-950",
                        subError
                          ? "border-red-500 focus-within:outline-red-500 dark:border-red-500"
                          : "border-neutral-200 hover:border-neutral-300 focus-within:border-neutral-900 focus-within:outline-neutral-900 dark:border-neutral-800 dark:hover:border-neutral-700 dark:focus-within:border-white dark:focus-within:outline-white",
                      )}
                    >
                      <input
                        id="frm5-subdomain"
                        value={subdomain}
                        required
                        onChange={(e) =>
                          setSubdomain(e.target.value.toLowerCase().trim())
                        }
                        aria-invalid={subError || undefined}
                        aria-describedby="frm5-subdomain-msg"
                        placeholder="riverside"
                        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                      />
                      <span className="shrink-0 text-sm tabular-nums text-neutral-400">
                        .med-sched.app
                      </span>
                    </div>
                    {subError ? (
                      <p id="frm5-subdomain-msg" className={errorClass}>
                        {sub.message}
                      </p>
                    ) : subOk ? (
                      <p
                        id="frm5-subdomain-msg"
                        className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"
                      >
                        <Check aria-hidden="true" className="h-3.5 w-3.5" />
                        Available
                      </p>
                    ) : (
                      <p id="frm5-subdomain-msg" className={helpClass}>
                        Lowercase letters, digits and hyphens.
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="frm5-email" className={labelClass}>
                      Admin email
                      <span aria-hidden="true" className="text-neutral-400">
                        {" "}
                        *
                      </span>
                    </label>
                    <input
                      id="frm5-email"
                      type="email"
                      value={email}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setEmailTouched(true)}
                      aria-invalid={emailError || undefined}
                      aria-describedby={
                        emailError ? "frm5-email-error" : "frm5-email-help"
                      }
                      placeholder="admin@riverside.health"
                      className={cx(
                        inputBase,
                        emailError ? inputError : inputRest,
                      )}
                    />
                    {emailError ? (
                      <p id="frm5-email-error" className={errorClass}>
                        Enter a valid email such as name@clinic.com.
                      </p>
                    ) : (
                      <p id="frm5-email-help" className={helpClass}>
                        Becomes the first workspace administrator.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="frm5-password" className={labelClass}>
                        Password
                        <span aria-hidden="true" className="text-neutral-400">
                          {" "}
                          *
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          id="frm5-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          required
                          onChange={(e) => setPassword(e.target.value)}
                          aria-describedby="frm5-password-rules"
                          placeholder="Create a password"
                          className={cx(inputBase, inputRest, "pr-10")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          title={
                            showPassword ? "Hide password" : "Show password"
                          }
                          className={cx(
                            "absolute right-1.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[var(--rb-r-sm,6px)] text-neutral-500 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
                            focus,
                          )}
                        >
                          {showPassword ? (
                            <EyeOff aria-hidden="true" className="h-4 w-4" />
                          ) : (
                            <Eye aria-hidden="true" className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="frm5-confirm" className={labelClass}>
                        Confirm password
                        <span aria-hidden="true" className="text-neutral-400">
                          {" "}
                          *
                        </span>
                      </label>
                      <input
                        id="frm5-confirm"
                        type={showPassword ? "text" : "password"}
                        value={confirm}
                        required
                        onChange={(e) => setConfirm(e.target.value)}
                        onBlur={() => setConfirmTouched(true)}
                        aria-invalid={confirmError || undefined}
                        aria-describedby={
                          confirmError
                            ? "frm5-confirm-error"
                            : "frm5-confirm-help"
                        }
                        placeholder="Re-enter password"
                        className={cx(
                          inputBase,
                          confirmError ? inputError : inputRest,
                        )}
                      />
                      {confirmError ? (
                        <p id="frm5-confirm-error" className={errorClass}>
                          Passwords do not match yet.
                        </p>
                      ) : (
                        <p id="frm5-confirm-help" className={helpClass}>
                          Type it once more to confirm.
                        </p>
                      )}
                    </div>
                  </div>

                  <div id="frm5-password-rules" className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      {passwordRules.map((_, i) => (
                        <span
                          key={i}
                          className={cx(
                            "h-1 flex-1 rounded-[var(--rb-r-xs,4px)] transition-colors duration-150",
                            i < passedCount
                              ? strengthColors[passedCount - 1]
                              : "bg-neutral-200 dark:bg-neutral-800",
                          )}
                        />
                      ))}
                    </div>
                    <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                      {ruleResults.map((r) => (
                        <li
                          key={r.id}
                          className="flex items-center gap-1.5 text-xs"
                        >
                          <span
                            className={cx(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors duration-150",
                              r.passed
                                ? "bg-emerald-500 text-white"
                                : "bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600",
                            )}
                          >
                            {r.passed ? (
                              <Check aria-hidden="true" className="h-3 w-3" />
                            ) : (
                              <X aria-hidden="true" className="h-3 w-3" />
                            )}
                          </span>
                          <span
                            className={cx(
                              r.passed
                                ? "text-neutral-700 dark:text-neutral-300"
                                : "text-neutral-500",
                            )}
                          >
                            {r.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="frm5-region" className={labelClass}>
                      Data region
                    </label>
                    <Select
                      id="frm5-region"
                      value={region}
                      onChange={(v) => setRegion(v)}
                      options={REGION_OPTIONS}
                      leading={
                        <Globe
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500"
                        />
                      }
                    />
                    <p className={helpClass}>
                      Patient data stays in the selected region.
                    </p>
                  </div>

                  <fieldset className="space-y-1.5">
                    <legend className={labelClass}>Plan</legend>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {PLAN_OPTIONS.map((p) => {
                        const selected = plan === p.value;
                        return (
                          <label
                            key={p.value}
                            className={cx(
                              "cursor-pointer rounded-[var(--rb-r-lg,10px)] border bg-white p-3 transition-colors duration-150 dark:bg-neutral-950",
                              selected
                                ? "border-neutral-900 ring-1 ring-neutral-900 dark:border-white dark:ring-white"
                                : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700",
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                                {p.name}
                              </span>
                              <input
                                type="radio"
                                name="frm5-plan"
                                value={p.value}
                                checked={selected}
                                onChange={() => setPlan(p.value)}
                                className="h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border border-neutral-300 bg-white transition-colors duration-150 checked:border-[5px] checked:border-neutral-900 hover:border-neutral-400 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:border-neutral-700 dark:bg-neutral-950 dark:checked:border-white dark:hover:border-neutral-600 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]"
                              />
                            </div>
                            <p className="mt-1 text-xs text-neutral-500">
                              {p.description}
                            </p>
                            <p className="mt-2 text-[13px] tabular-nums text-neutral-900 dark:text-neutral-100">
                              {p.price}
                            </p>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <label className="flex cursor-pointer items-start gap-2.5 rounded-[var(--rb-r-lg,10px)] bg-neutral-50 p-3 dark:bg-neutral-800/40">
                    <span className={cx(checkboxBox, "mt-0.5")}>
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className={checkboxClass}
                      />
                      <Check
                        aria-hidden="true"
                        strokeWidth={3}
                        className={checkboxMark}
                      />
                    </span>
                    <span className="text-[13px] text-neutral-600 dark:text-neutral-300">
                      I confirm this workspace will handle protected health
                      information under our signed data agreement.
                    </span>
                  </label>
                </div>

                <div
                  aria-hidden="true"
                  className={cx(
                    "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
                    edges.start ? "opacity-100" : "opacity-0",
                  )}
                />
                <div
                  aria-hidden="true"
                  className={cx(
                    "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
                    edges.end ? "opacity-100" : "opacity-0",
                  )}
                />
              </div>

              <div className="flex flex-col gap-2 bg-neutral-50 px-4 py-3 dark:bg-neutral-900/60">
                <button
                  type="button"
                  disabled={!allValid}
                  onClick={() => setSubmitted(true)}
                  className={primaryButton}
                >
                  Create workspace
                </button>
                <p className="text-center text-xs text-neutral-500">
                  {allValid
                    ? "Everything checks out. You are ready to provision."
                    : "Complete every required field to continue."}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
