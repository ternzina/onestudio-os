"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";
import { Check, ChevronDown, Loader2 } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

function useScrollFade<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [edges, setEdges] = useState({ start: false, end: false });
  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setEdges({
      start: scrollTop > 1,
      end: scrollTop + clientHeight < scrollHeight - 1,
    });
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    const RO = el.ownerDocument.defaultView?.ResizeObserver;
    const ro = RO ? new RO(update) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [update]);
  return { ref, edges, onScroll: update };
}

function useScrollFadeX<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [edges, setEdges] = useState({ start: false, end: false });
  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setEdges({
      start: scrollLeft > 1,
      end: scrollLeft + clientWidth < scrollWidth - 1,
    });
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    const RO = el.ownerDocument.defaultView?.ResizeObserver;
    const ro = RO ? new RO(update) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [update]);
  return { ref, edges, onScroll: update };
}

const inputClass =
  "h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const textareaClass =
  "min-h-20 w-full resize-none rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const selectClass =
  "h-9 w-full cursor-pointer appearance-none rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pl-3 pr-8 text-sm text-neutral-900 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const checkboxClass =
  "peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-[var(--rb-r-xs,4px)] border border-neutral-300 bg-white transition-colors duration-150 checked:border-neutral-900 checked:bg-neutral-900 hover:border-neutral-400 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-950 dark:checked:border-white dark:checked:bg-white dark:hover:border-neutral-600 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const checkboxBox =
  "relative inline-flex h-4 w-4 shrink-0 items-center justify-center";

const checkboxMark =
  "pointer-events-none absolute h-3 w-3 text-[var(--rb-accent-fg,oklch(100%_0_0))] opacity-0 transition-opacity duration-150 peer-checked:opacity-100 motion-reduce:transition-none dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]";

const prefixedInputBox =
  "flex h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900 transition-colors duration-150 hover:border-neutral-300 focus-within:border-neutral-900 focus-within:outline-none focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-700 dark:focus-within:border-white dark:focus-within:outline-white";

const prefixedInput =
  "min-w-0 flex-1 border-0 bg-transparent px-0 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 disabled:pointer-events-none disabled:opacity-50 dark:text-neutral-100 dark:placeholder:text-neutral-500";

const secondaryButton =
  "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-50 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const primaryButton =
  "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3 text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const rowLabelClass =
  "block text-[13px] font-medium text-neutral-900 dark:text-neutral-100";

const rowDescriptionClass = "mt-0.5 text-[13px] text-neutral-500";

type Option = { value: string; label: string };

type Field =
  | { kind: "text"; id: string; label: string; hint: string }
  | { kind: "prefix"; id: string; label: string; hint: string; prefix: string }
  | { kind: "textarea"; id: string; label: string; hint: string }
  | {
      kind: "select";
      id: string;
      label: string;
      hint: string;
      options: Option[];
    }
  | { kind: "switch"; id: string; label: string; hint: string }
  | {
      kind: "checkgroup";
      id: string;
      label: string;
      hint: string;
      items: { id: string; label: string }[];
    };

type Section = {
  id: string;
  label: string;
  title: string;
  blurb: string;
  fields: Field[];
};

const sections: Section[] = [
  {
    id: "workspace",
    label: "Workspace",
    title: "Workspace",
    blurb: "Details, defaults, and formats people use across the workspace.",
    fields: [
      {
        kind: "text",
        id: "ws-name",
        label: "Name",
        hint: "Shown in sidebars, invitations, and reports.",
      },
      {
        kind: "prefix",
        id: "ws-slug",
        label: "Workspace URL",
        hint: "Lowercase letters, numbers, and hyphens only.",
        prefix: "northwind.app/",
      },
      {
        kind: "select",
        id: "ws-region",
        label: "Primary region",
        hint: "Where new projects store data by default.",
        options: [
          { value: "us-east", label: "US East (N. Virginia)" },
          { value: "us-west", label: "US West (Oregon)" },
          { value: "eu-west", label: "Europe (Frankfurt)" },
          { value: "ap-south", label: "Asia Pacific (Singapore)" },
        ],
      },
      {
        kind: "textarea",
        id: "ws-description",
        label: "Description",
        hint: "A short note for people joining the workspace.",
      },
      {
        kind: "select",
        id: "ws-language",
        label: "Language",
        hint: "The default language for shared workspace screens.",
        options: [
          { value: "en", label: "English" },
          { value: "de", label: "German" },
          { value: "fr", label: "French" },
          { value: "ja", label: "Japanese" },
        ],
      },
      {
        kind: "select",
        id: "ws-timezone",
        label: "Time zone",
        hint: "Used for timestamps in reports and exports.",
        options: [
          { value: "new_york", label: "New York, GMT−05:00" },
          { value: "london", label: "London, GMT+00:00" },
          { value: "berlin", label: "Berlin, GMT+01:00" },
          { value: "tokyo", label: "Tokyo, GMT+09:00" },
        ],
      },
      {
        kind: "select",
        id: "ws-date",
        label: "Date format",
        hint: "How dates appear in shared workspace screens.",
        options: [
          { value: "mdy", label: "Aug 5, 2026" },
          { value: "dmy", label: "5 Aug 2026" },
          { value: "iso", label: "2026-08-05" },
        ],
      },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    title: "Billing",
    blurb: "Who is charged, how often, and what appears on the invoice.",
    fields: [
      {
        kind: "select",
        id: "bl-plan",
        label: "Plan",
        hint: "Changes apply on the next invoice.",
        options: [
          { value: "team", label: "Team" },
          { value: "business", label: "Business" },
          { value: "enterprise", label: "Enterprise" },
        ],
      },
      {
        kind: "select",
        id: "bl-cycle",
        label: "Billing cycle",
        hint: "Annual plans are invoiced once, in advance.",
        options: [
          { value: "monthly", label: "Monthly" },
          { value: "annual", label: "Annual" },
        ],
      },
      {
        kind: "text",
        id: "bl-email",
        label: "Billing email",
        hint: "Invoices and receipts are sent here.",
      },
      {
        kind: "textarea",
        id: "bl-address",
        label: "Billing address",
        hint: "Printed on every invoice.",
      },
      {
        kind: "text",
        id: "bl-tax",
        label: "Tax ID",
        hint: "Shown on invoices in regions that require it.",
      },
      {
        kind: "text",
        id: "bl-po",
        label: "Purchase order",
        hint: "Added to the invoice reference. Leave empty if unused.",
      },
      {
        kind: "switch",
        id: "bl-receipts",
        label: "Email receipts",
        hint: "Send a receipt to the billing address after each charge.",
      },
    ],
  },
  {
    id: "notifications",
    label: "Notifications",
    title: "Notifications",
    blurb: "Where workspace activity reaches people, and how often.",
    fields: [
      {
        kind: "checkgroup",
        id: "nt-email",
        label: "Email",
        hint: "Choose which messages reach the inbox.",
        items: [
          { id: "nt-email-product", label: "Product updates" },
          { id: "nt-email-security", label: "Security alerts" },
          { id: "nt-email-digest", label: "Weekly digest" },
        ],
      },
      {
        kind: "select",
        id: "nt-digest-day",
        label: "Digest day",
        hint: "When the weekly digest is sent.",
        options: [
          { value: "monday", label: "Monday" },
          { value: "friday", label: "Friday" },
          { value: "sunday", label: "Sunday" },
        ],
      },
      {
        kind: "select",
        id: "nt-quiet",
        label: "Quiet hours",
        hint: "Hold non-urgent alerts until the morning.",
        options: [
          { value: "off", label: "Off" },
          { value: "18-09", label: "18:00 to 09:00" },
          { value: "22-07", label: "22:00 to 07:00" },
        ],
      },
      {
        kind: "text",
        id: "nt-reply",
        label: "Reply-to address",
        hint: "Where replies to workspace email are delivered.",
      },
      {
        kind: "switch",
        id: "nt-desktop",
        label: "Desktop alerts",
        hint: "Show alerts while the app is open.",
      },
      {
        kind: "switch",
        id: "nt-mobile",
        label: "Mobile push",
        hint: "Send alerts to signed-in mobile devices.",
      },
      {
        kind: "switch",
        id: "nt-mentions",
        label: "Mentions",
        hint: "Notify people when someone mentions their name.",
      },
    ],
  },
  {
    id: "security",
    label: "Security",
    title: "Security",
    blurb: "How members prove who they are and how long they stay signed in.",
    fields: [
      {
        kind: "switch",
        id: "sc-2fa",
        label: "Two-factor authentication",
        hint: "Require a second factor for every member.",
      },
      {
        kind: "select",
        id: "sc-sso",
        label: "Single sign-on",
        hint: "Members sign in through your identity provider.",
        options: [
          { value: "off", label: "Off" },
          { value: "okta", label: "Okta" },
          { value: "google", label: "Google Workspace" },
        ],
      },
      {
        kind: "select",
        id: "sc-timeout",
        label: "Session timeout",
        hint: "Sign members out after this much inactivity.",
        options: [
          { value: "8h", label: "8 hours" },
          { value: "24h", label: "24 hours" },
          { value: "7d", label: "7 days" },
          { value: "30d", label: "30 days" },
        ],
      },
      {
        kind: "text",
        id: "sc-domains",
        label: "Allowed email domains",
        hint: "Only these domains can join without an invitation.",
      },
      {
        kind: "textarea",
        id: "sc-ips",
        label: "IP allowlist",
        hint: "One CIDR range per line. Empty allows every address.",
      },
      {
        kind: "select",
        id: "sc-audit",
        label: "Audit log retention",
        hint: "How long member activity is kept.",
        options: [
          { value: "30d", label: "30 days" },
          { value: "1y", label: "1 year" },
          { value: "3y", label: "3 years" },
        ],
      },
      {
        kind: "switch",
        id: "sc-devices",
        label: "Device approval",
        hint: "Ask an admin to approve every new device.",
      },
    ],
  },
  {
    id: "advanced",
    label: "Advanced",
    title: "Advanced",
    blurb: "Defaults for projects, the API, and scheduled exports.",
    fields: [
      {
        kind: "select",
        id: "ad-visibility",
        label: "New project visibility",
        hint: "Where new projects start out.",
        options: [
          { value: "workspace", label: "Everyone in the workspace" },
          { value: "private", label: "Only the creator" },
        ],
      },
      {
        kind: "select",
        id: "ad-rate",
        label: "API rate limit",
        hint: "Requests per minute across every key.",
        options: [
          { value: "1000", label: "1,000 requests" },
          { value: "5000", label: "5,000 requests" },
          { value: "10000", label: "10,000 requests" },
        ],
      },
      {
        kind: "prefix",
        id: "ad-webhook",
        label: "Webhook endpoint",
        hint: "Workspace events are posted here.",
        prefix: "https://",
      },
      {
        kind: "select",
        id: "ad-export",
        label: "Export format",
        hint: "Used by scheduled workspace exports.",
        options: [
          { value: "json", label: "JSON" },
          { value: "csv", label: "CSV" },
          { value: "parquet", label: "Parquet" },
        ],
      },
      {
        kind: "prefix",
        id: "ad-domain",
        label: "Custom domain",
        hint: "Serve shared links from your own domain.",
        prefix: "https://",
      },
      {
        kind: "switch",
        id: "ad-beta",
        label: "Beta features",
        hint: "Try unreleased features before general release.",
      },
      {
        kind: "switch",
        id: "ad-analytics",
        label: "Usage analytics",
        hint: "Share anonymous usage data to help prioritise work.",
      },
    ],
  },
];

type Values = Record<string, string | boolean>;

const savedValues: Values = {
  "ws-name": "Northwind",
  "ws-slug": "northwind",
  "ws-region": "us-east",
  "ws-description":
    "Internal tools and dashboards for the operations team. Shared with 24 people.",
  "ws-language": "en",
  "ws-timezone": "new_york",
  "ws-date": "mdy",

  "bl-plan": "business",
  "bl-cycle": "annual",
  "bl-email": "accounts-payable@northwind.co",
  "bl-address": "18 Wharf Road\nLondon N1 7GS\nUnited Kingdom",
  "bl-tax": "GB 428 9971 07",
  "bl-po": "",
  "bl-receipts": true,

  "nt-email-product": false,
  "nt-email-security": true,
  "nt-email-digest": true,
  "nt-digest-day": "monday",
  "nt-quiet": "18-09",
  "nt-reply": "no-reply@northwind.co",
  "nt-desktop": true,
  "nt-mobile": false,
  "nt-mentions": true,

  "sc-2fa": true,
  "sc-sso": "okta",
  "sc-timeout": "24h",
  "sc-domains": "northwind.co, contractors.northwind.co",
  "sc-ips": "",
  "sc-audit": "1y",
  "sc-devices": false,

  "ad-visibility": "workspace",
  "ad-rate": "5000",
  "ad-webhook": "hooks.northwind.co/workspace",
  "ad-export": "json",
  "ad-domain": "",
  "ad-beta": false,
  "ad-analytics": true,
};

function Switch({
  id,
  checked,
  onChange,
  labelledBy,
  describedBy,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  labelledBy: string;
  describedBy: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-out",
        "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]",
        "disabled:pointer-events-none disabled:opacity-50",
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

function Select({
  id,
  value,
  onChange,
  options,
  describedBy,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  describedBy: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.value)}
        className={selectClass}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
      />
    </div>
  );
}

function SettingsRow({
  id,
  label,
  description,
  native,
  inline,
  changed,
  children,
}: {
  id: string;
  label: string;
  description: string;
  native: boolean;
  inline?: boolean;
  changed?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "rounded-[var(--rb-r-lg,10px)] bg-neutral-50 px-3 py-2.5 dark:bg-neutral-800/50",
        inline
          ? "flex items-center justify-between gap-4"
          : "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {native ? (
            <label htmlFor={id} className={rowLabelClass}>
              {label}
            </label>
          ) : (
            <span id={`${id}-label`} className={rowLabelClass}>
              {label}
            </span>
          )}
          {changed ? (
            <span className="rounded-[var(--rb-r-xs,4px)] bg-amber-100 px-1.5 py-0.5 text-[11px] leading-none font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
              Changed
            </span>
          ) : null}
        </div>
        <p id={`${id}-hint`} className={rowDescriptionClass}>
          {description}
        </p>
      </div>
      <div className={inline ? "shrink-0" : "w-full sm:w-80 sm:shrink-0"}>
        {children}
      </div>
    </div>
  );
}

export default function SettingsForm1() {
  const reduce = useReducedMotion();
  const nav = useScrollFadeX<HTMLElement>();
  const body = useScrollFade<HTMLDivElement>();
  const [active, setActive] = useState(sections[0].id);
  const [values, setValues] = useState<Values>({
    ...savedValues,
    "ws-name": "Northwind Labs",
  });
  const [baseline, setBaseline] = useState<Values>(savedValues);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const dirtyKeys = useMemo(
    () => Object.keys(values).filter((k) => values[k] !== baseline[k]),
    [values, baseline],
  );
  const dirty = dirtyKeys.length > 0;

  const dirtySection = useMemo(
    () =>
      sections.find((s) =>
        s.fields.some((f) =>
          f.kind === "checkgroup"
            ? f.items.some((i) => dirtyKeys.includes(i.id))
            : dirtyKeys.includes(f.id),
        ),
      ),
    [dirtyKeys],
  );

  const section = sections.find((s) => s.id === active) ?? sections[0];

  const setValue = (key: string, value: string | boolean) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    if (!dirty || saving) return;
    setSaving(true);
    window.setTimeout(
      () => {
        setBaseline(values);
        setSaving(false);
        setSavedAt("just now");
      },
      reduce ? 0 : 700,
    );
  };

  const discard = () => setValues(baseline);

  const navItem = (id: string, label: string, layout: string) => {
    const selected = id === active;
    return (
      <button
        key={id}
        type="button"
        aria-current={selected ? "page" : undefined}
        onClick={() => setActive(id)}
        className={cx(
          layout,
          "h-8 cursor-pointer rounded-[var(--rb-r-md,8px)] px-3 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]",
          selected
            ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
            : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
        )}
      >
        {label}
      </button>
    );
  };

  const renderField = (field: Field) => {
    const describedBy = `${field.id}-hint`;
    const changed =
      field.kind === "checkgroup"
        ? field.items.some((i) => dirtyKeys.includes(i.id))
        : dirtyKeys.includes(field.id);

    if (field.kind === "switch") {
      return (
        <SettingsRow
          key={field.id}
          id={field.id}
          label={field.label}
          description={field.hint}
          native={false}
          inline
          changed={changed}
        >
          <Switch
            id={field.id}
            checked={Boolean(values[field.id])}
            onChange={(v) => setValue(field.id, v)}
            labelledBy={`${field.id}-label`}
            describedBy={describedBy}
          />
        </SettingsRow>
      );
    }

    if (field.kind === "checkgroup") {
      return (
        <SettingsRow
          key={field.id}
          id={field.id}
          label={field.label}
          description={field.hint}
          native={false}
          changed={changed}
        >
          <div
            role="group"
            aria-labelledby={`${field.id}-label`}
            aria-describedby={describedBy}
            className="flex flex-col gap-2"
          >
            {field.items.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-center gap-2.5 text-[13px] text-neutral-700 dark:text-neutral-300"
              >
                <span className={checkboxBox}>
                  <input
                    type="checkbox"
                    checked={Boolean(values[item.id])}
                    onChange={(e) => setValue(item.id, e.target.checked)}
                    className={checkboxClass}
                  />
                  <Check
                    aria-hidden="true"
                    strokeWidth={3}
                    className={checkboxMark}
                  />
                </span>
                {item.label}
              </label>
            ))}
          </div>
        </SettingsRow>
      );
    }

    return (
      <SettingsRow
        key={field.id}
        id={field.id}
        label={field.label}
        description={field.hint}
        native
        changed={changed}
      >
        {field.kind === "select" ? (
          <Select
            id={field.id}
            value={String(values[field.id] ?? "")}
            onChange={(v) => setValue(field.id, v)}
            options={field.options}
            describedBy={describedBy}
          />
        ) : field.kind === "textarea" ? (
          <textarea
            id={field.id}
            rows={2}
            value={String(values[field.id] ?? "")}
            aria-describedby={describedBy}
            onChange={(e) => setValue(field.id, e.target.value)}
            className={textareaClass}
          />
        ) : field.kind === "prefix" ? (
          <div className={prefixedInputBox}>
            <span className="mr-1.5 inline-flex items-center text-neutral-400 dark:text-neutral-500">
              {field.prefix}
            </span>
            <input
              id={field.id}
              value={String(values[field.id] ?? "")}
              aria-describedby={describedBy}
              onChange={(e) => setValue(field.id, e.target.value)}
              className={prefixedInput}
            />
          </div>
        ) : (
          <input
            id={field.id}
            value={String(values[field.id] ?? "")}
            aria-describedby={describedBy}
            onChange={(e) => setValue(field.id, e.target.value)}
            className={inputClass}
          />
        )}
      </SettingsRow>
    );
  };

  return (
    <div className="relative flex h-full min-h-[800px] w-full overflow-hidden bg-white dark:bg-neutral-950">
      <aside className="hidden w-64 shrink-0 flex-col gap-4 bg-neutral-50 p-4 sm:p-5 lg:flex dark:bg-neutral-900">
        <div>
          <h2 className="text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
            Settings
          </h2>
          <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
            Northwind Labs
          </p>
        </div>
        <nav aria-label="Settings sections" className="flex flex-col gap-0.5">
          {sections.map((s) =>
            navItem(s.id, s.label, "flex items-center text-left"),
          )}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="relative shrink-0 lg:hidden">
          <nav
            ref={nav.ref}
            onScroll={nav.onScroll}
            aria-label="Settings sections"
            className="flex items-center gap-2 overflow-x-auto bg-neutral-50 px-4 py-2 dark:bg-neutral-900"
          >
            {sections.map((s) => navItem(s.id, s.label, "shrink-0"))}
          </nav>
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              nav.edges.start ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-neutral-50 to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              nav.edges.end ? "opacity-100" : "opacity-0",
            )}
          />
        </div>

        <div className="relative min-h-0 flex-1">
          <div
            ref={body.ref}
            onScroll={body.onScroll}
            className="h-full overflow-y-auto"
          >
            <div className="mx-auto max-w-2xl p-4 sm:p-6">
              <div className="overflow-hidden rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                <div className="bg-neutral-50 px-4 py-3 dark:bg-neutral-900/60">
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {section.title}
                  </h3>
                  <p className="mt-0.5 text-[13px] text-neutral-500">
                    {section.blurb}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 p-1.5">
                  {section.fields.map(renderField)}
                </div>

                <div className="flex flex-col gap-3 bg-neutral-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:bg-neutral-900/60">
                  <p
                    aria-live="polite"
                    className="flex min-w-0 items-center gap-2 text-[13px] text-neutral-600 dark:text-neutral-400"
                  >
                    {dirty ? (
                      <>
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        <span className="truncate">
                          Unsaved changes in{" "}
                          {dirtySection?.label ?? "Workspace"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 shrink-0 text-neutral-500" />
                        <span className="truncate">
                          {savedAt ? `Saved ${savedAt}` : "All changes saved"}
                        </span>
                      </>
                    )}
                  </p>
                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={discard}
                      disabled={!dirty || saving}
                      className={cx(secondaryButton, "w-full sm:w-auto")}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={save}
                      disabled={!dirty || saving}
                      className={cx(
                        primaryButton,
                        "w-full min-w-[7.5rem] sm:w-auto",
                      )}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                          Saving
                        </>
                      ) : (
                        "Save changes"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950",
              body.edges.start ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-950",
              body.edges.end ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
      </div>
    </div>
  );
}
