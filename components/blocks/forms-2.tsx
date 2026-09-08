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
  AlertCircle,
  Check,
  ChevronDown,
  Clock3,
  Mic,
  Presentation,
  Send,
  Users,
} from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const field =
  "w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white";

const input = cx(field, "h-9", focus);

const invalid =
  "border-red-500 hover:border-red-500 focus:border-red-500 dark:border-red-500 dark:hover:border-red-500 dark:focus:border-red-500";

const btnPrimary = cx(
  "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3 text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
  transition,
  focus,
);

const btnSecondary = cx(
  "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50 active:scale-[0.97] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800",
  transition,
  focus,
);

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
          field,
          "h-9",
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

const FORMATS = [
  {
    value: "talk",
    label: "Conference talk",
    blurb: "Single speaker, main stage",
    icon: Presentation,
    minutes: 30,
  },
  {
    value: "workshop",
    label: "Hands-on workshop",
    blurb: "Laptops required, capped room",
    icon: Users,
    minutes: 90,
  },
  {
    value: "lightning",
    label: "Lightning slot",
    blurb: "Back-to-back, no questions",
    icon: Mic,
    minutes: 10,
  },
] as const;

const TRACKS = [
  "Instrumentation",
  "Field robotics",
  "Signal processing",
  "Open hardware",
];

const NEEDS = [
  { id: "hdmi", label: "HDMI capture from my own laptop" },
  { id: "audio", label: "Audio playback through the house system" },
  { id: "bench", label: "Bench space for hardware demonstration" },
  { id: "captions", label: "Live captioning" },
];

const ABSTRACT_LIMIT = 600;

type Errors = Partial<
  Record<"title" | "abstract" | "email" | "consent", string>
>;

function Label({
  children,
  htmlFor,
  optional,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 flex items-center justify-between gap-2 text-[13px] font-medium text-neutral-900 dark:text-neutral-100"
    >
      <span>{children}</span>
      {optional && (
        <span className="text-xs font-normal text-neutral-500">Optional</span>
      )}
    </label>
  );
}

function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
      <AlertCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      {children}
    </p>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>
      <p className="mt-0.5 text-[13px] text-neutral-500 dark:text-neutral-500">
        {description}
      </p>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export default function Forms2() {
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [format, setFormat] = useState<string>("talk");
  const [track, setTrack] = useState(TRACKS[0]);
  const [level, setLevel] = useState("intermediate");
  const [speaker, setSpeaker] = useState("");
  const [email, setEmail] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [needs, setNeeds] = useState<string[]>(["hdmi"]);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const active = FORMATS.find((f) => f.value === format) ?? FORMATS[0];

  const errors = useMemo<Errors>(() => {
    const e: Errors = {};
    if (title.trim().length < 8)
      e.title = "Give the session a title of at least 8 characters.";
    if (abstract.trim().length < 120)
      e.abstract = `Abstracts need at least 120 characters. You have ${abstract.trim().length}.`;
    else if (abstract.length > ABSTRACT_LIMIT)
      e.abstract = `Trim ${abstract.length - ABSTRACT_LIMIT} characters to fit the limit.`;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      e.email = "Enter an address the programme committee can reply to.";
    if (!consent) e.consent = "Recording consent is required to submit.";
    return e;
  }, [title, abstract, email, consent]);

  const checklist = [
    { label: "Session title", done: !errors.title },
    { label: "Abstract", done: !errors.abstract },
    { label: "Contact address", done: !errors.email },
    { label: "Recording consent", done: consent },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  const remaining = ABSTRACT_LIMIT - abstract.length;
  const over = remaining < 0;

  const toggleNeed = (id: string) =>
    setNeeds((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id],
    );

  const submit = () => {
    if (Object.keys(errors).length) {
      setShowErrors(true);
      return;
    }
    setSubmitted(true);
  };

  const err = (key: keyof Errors) => (showErrors ? errors[key] : undefined);

  if (submitted) {
    return (
      <div className="flex h-full min-h-[1280px] w-full flex-col items-center justify-center overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
        <div className="w-full max-w-[420px] rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))]">
            <Check
              aria-hidden="true"
              className="h-6 w-6 text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
              strokeWidth={2.5}
            />
          </span>
          <h2 className="mt-4 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Proposal received
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-500">
            &ldquo;{title.trim()}&rdquo; is queued for the {track.toLowerCase()}{" "}
            track. The committee replies to {email.trim()} by 14 March.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className={cx(btnSecondary, "mt-5 w-full")}
          >
            Edit this proposal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[800px] w-full flex-col justify-center overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <div
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? undefined : "translateY(4px)",
          transition: "opacity 300ms ease-out, transform 300ms ease-out",
        }}
        className="mx-auto w-full max-w-[1100px] motion-reduce:transition-none"
      >
        <div className="mb-5">
          <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
            Submit a session
          </h2>
          <p className="mt-0.5 text-[13px] text-neutral-500 dark:text-neutral-500">
            Proposals for the autumn instrumentation symposium close on 28
            February.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <Section
              title="The session"
              description="What attendees will see on the schedule."
            >
              <div>
                <Label htmlFor="f2-title">Session title</Label>
                <input
                  id="f2-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Calibrating low-cost sensors in the field"
                  aria-invalid={Boolean(err("title"))}
                  className={cx(input, err("title") && invalid)}
                />
                <FieldError>{err("title")}</FieldError>
              </div>

              <div>
                <Label htmlFor="f2-abstract">Abstract</Label>
                <textarea
                  id="f2-abstract"
                  rows={5}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Describe the problem, what you did, and what an attendee will be able to do afterwards."
                  aria-invalid={Boolean(err("abstract"))}
                  className={cx(
                    field,
                    focus,
                    "resize-y py-2 leading-relaxed",
                    err("abstract") && invalid,
                  )}
                />
                <div className="mt-1.5 flex items-start justify-between gap-3">
                  <FieldError>{err("abstract")}</FieldError>
                  <span
                    className={cx(
                      "ml-auto shrink-0 text-xs tabular-nums",
                      over
                        ? "text-red-600 dark:text-red-400"
                        : "text-neutral-500",
                    )}
                  >
                    {remaining} left
                  </span>
                </div>
              </div>

              <div>
                <Label>Format</Label>
                <div
                  role="radiogroup"
                  aria-label="Session format"
                  className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                >
                  {FORMATS.map((f) => {
                    const Icon = f.icon;
                    const on = format === f.value;
                    return (
                      <button
                        key={f.value}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setFormat(f.value)}
                        className={cx(
                          "flex cursor-pointer flex-col items-start gap-2 rounded-[var(--rb-r-lg,10px)] border p-3 text-left active:scale-[0.99]",
                          transition,
                          focus,
                          on
                            ? "border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800"
                            : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700",
                        )}
                      >
                        <Icon
                          aria-hidden="true"
                          className="h-4 w-4 text-neutral-500 dark:text-neutral-400"
                        />
                        <span className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                          {f.label}
                        </span>
                        <span className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-500">
                          {f.blurb}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="f2-track">Track</Label>
                  <Select
                    id="f2-track"
                    value={track}
                    onChange={setTrack}
                    options={TRACKS.map((t) => ({ value: t, label: t }))}
                  />
                </div>
                <div>
                  <Label htmlFor="f2-level">Audience level</Label>
                  <Select
                    id="f2-level"
                    value={level}
                    onChange={setLevel}
                    options={[
                      { value: "introductory", label: "Introductory" },
                      { value: "intermediate", label: "Intermediate" },
                      { value: "advanced", label: "Advanced" },
                    ]}
                  />
                </div>
              </div>
            </Section>

            <Section
              title="Speaker"
              description="Used for scheduling and the printed programme."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="f2-speaker">Name as printed</Label>
                  <input
                    id="f2-speaker"
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    placeholder="Marta Enríquez"
                    className={input}
                  />
                </div>
                <div>
                  <Label htmlFor="f2-email">Contact address</Label>
                  <input
                    id="f2-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@institute.org"
                    aria-invalid={Boolean(err("email"))}
                    className={cx(input, err("email") && invalid)}
                  />
                  <FieldError>{err("email")}</FieldError>
                </div>
              </div>
              <div>
                <Label htmlFor="f2-affiliation" optional>
                  Affiliation
                </Label>
                <input
                  id="f2-affiliation"
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                  placeholder="Department, lab or company"
                  className={input}
                />
              </div>
            </Section>

            <Section
              title="Room requirements"
              description="Tell the venue team what the session needs on the day."
            >
              <div className="flex flex-col gap-1.5 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1.5 dark:border-neutral-800 dark:bg-neutral-950">
                {NEEDS.map((n) => {
                  const on = needs.includes(n.id);
                  return (
                    <label
                      key={n.id}
                      className={cx(
                        "flex cursor-pointer items-center gap-2.5 rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white px-3 py-2.5 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700",
                        transition,
                      )}
                    >
                      <span
                        className={cx(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--rb-r-xs,4px)] border transition-colors duration-150",
                          on
                            ? "border-neutral-900 bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:border-white dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
                            : "border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-950",
                        )}
                      >
                        {on && (
                          <Check
                            aria-hidden="true"
                            className="h-3 w-3 text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                          />
                        )}
                      </span>
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleNeed(n.id)}
                        className="sr-only"
                      />
                      <span className="text-[13px] text-neutral-700 dark:text-neutral-300">
                        {n.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </Section>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Before you submit
              </h3>
              <p className="mt-0.5 text-[13px] text-neutral-500 dark:text-neutral-500">
                {doneCount} of {checklist.length} ready
              </p>
              <div className="mt-3 flex flex-col gap-1.5">
                {checklist.map((c) => (
                  <div
                    key={c.label}
                    className="flex items-center gap-2.5 rounded-[var(--rb-r-lg,10px)] bg-neutral-50 px-3 py-2 dark:bg-neutral-950"
                  >
                    <span
                      className={cx(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors duration-150",
                        c.done
                          ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
                          : "border border-neutral-300 dark:border-neutral-700",
                      )}
                    >
                      {c.done && (
                        <Check
                          aria-hidden="true"
                          className="h-2.5 w-2.5 text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                        />
                      )}
                    </span>
                    <span
                      className={cx(
                        "text-[13px]",
                        c.done
                          ? "text-neutral-900 dark:text-neutral-100"
                          : "text-neutral-500",
                      )}
                    >
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-[var(--rb-r-lg,10px)] bg-neutral-50 px-3 py-2.5 dark:bg-neutral-950">
                <Clock3
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400"
                />
                <span className="text-[13px] text-neutral-600 dark:text-neutral-400">
                  {active.label} runs {active.minutes} minutes
                </span>
              </div>
            </div>

            <div className="rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <label className="flex cursor-pointer items-start gap-2.5">
                <span
                  className={cx(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--rb-r-xs,4px)] border transition-colors duration-150",
                    consent
                      ? "border-neutral-900 bg-[var(--rb-accent,oklch(20.5%_0_0))] dark:border-white dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
                      : err("consent")
                        ? "border-red-500"
                        : "border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-950",
                  )}
                >
                  {consent && (
                    <Check
                      aria-hidden="true"
                      className="h-3 w-3 text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                    />
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={() => setConsent((v) => !v)}
                  aria-invalid={Boolean(err("consent"))}
                  className="sr-only"
                />
                <span className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                  I agree to the session being recorded and published to the
                  archive.
                </span>
              </label>
              <FieldError>{err("consent")}</FieldError>

              <button
                type="button"
                onClick={submit}
                className={cx(btnPrimary, "mt-4 w-full")}
              >
                <Send aria-hidden="true" className="h-4 w-4" />
                Submit proposal
              </button>
              {showErrors && Object.keys(errors).length > 0 && (
                <p className="mt-2 text-center text-xs text-red-600 dark:text-red-400">
                  {Object.keys(errors).length} item
                  {Object.keys(errors).length > 1 ? "s" : ""} still need
                  attention.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
