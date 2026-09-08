"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ChevronDown, MoreHorizontal, Plus } from "lucide-react";

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

const inputClass =
  "h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const errorBox =
  "border-red-500 hover:border-red-500 focus:border-red-500 focus-visible:outline-red-500 focus-within:border-red-500 focus-within:outline-red-500 dark:border-red-500 dark:hover:border-red-500 dark:focus:border-red-500 dark:focus-visible:outline-red-500 dark:focus-within:border-red-500 dark:focus-within:outline-red-500";

const selectClass =
  "h-9 w-full cursor-pointer appearance-none rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white pl-3 pr-8 text-sm text-neutral-900 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const primaryButton =
  "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-md,8px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-3 text-sm font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const iconButton =
  "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--rb-r-md,8px)] bg-neutral-100 text-neutral-500 transition-[transform,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-neutral-200 hover:text-neutral-900 active:scale-[0.97] focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const menuItemClass =
  "flex h-8 w-full cursor-pointer items-center rounded-[var(--rb-r-sm,6px)] px-2 text-left text-[13px] text-neutral-700 transition-colors duration-150 hover:bg-neutral-100 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] disabled:pointer-events-none disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const menuItemDangerClass =
  "flex h-8 w-full cursor-pointer items-center rounded-[var(--rb-r-sm,6px)] px-2 text-left text-[13px] text-red-600 transition-colors duration-150 hover:bg-red-50 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-red-600 disabled:pointer-events-none disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10 dark:focus-visible:outline-red-400";

type Status = "active" | "invited";

type Member = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: string;
  status: Status;
};

const roles = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "billing", label: "Billing" },
  { value: "viewer", label: "Viewer" },
];

const roleLabel = (value: string) =>
  roles.find((r) => r.value === value)?.label ?? value;

const initialMembers: Member[] = [
  {
    id: "m1",
    name: "Mara Whitfield",
    email: "mara.whitfield@northwind.co",
    initials: "MW",
    role: "owner",
    status: "active",
  },
  {
    id: "m2",
    name: "Devan Rao",
    email: "devan@northwind.co",
    initials: "DR",
    role: "admin",
    status: "active",
  },
  {
    id: "m3",
    name: "Priyanka Balasubramanian",
    email: "priyanka.b@northwind.co",
    initials: "PB",
    role: "member",
    status: "active",
  },
  {
    id: "m4",
    name: "Tom Ek",
    email: "tom@contractors.northwind.co",
    initials: "TE",
    role: "viewer",
    status: "active",
  },
  {
    id: "m5",
    name: "Jules Moreau",
    email: "jules.moreau@northwind.co",
    initials: "JM",
    role: "member",
    status: "invited",
  },
  {
    id: "m6",
    name: "Sofia Castellano",
    email: "sofia@northwind.co",
    initials: "SC",
    role: "billing",
    status: "active",
  },
];

function StatusLabel({ status }: { status: Status }) {
  const map = {
    active: { dot: "bg-neutral-300 dark:bg-neutral-600", label: "Active" },
    invited: { dot: "bg-amber-500", label: "Invited" },
  } as const;
  const s = map[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-neutral-600 dark:text-neutral-400">
      <span className={cx("h-1.5 w-1.5 shrink-0 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

function Select({
  id,
  value,
  onChange,
  options,
  label,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectClass}
      >
        {options.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
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

type MenuItem = {
  id: string;
  label: string;
  danger?: boolean;
  run: () => void;
};

function RowMenu({ label, items }: { label: string; items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    setShown(false);
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!open) return;
    const doc = wrapRef.current?.ownerDocument ?? document;
    const raf = requestAnimationFrame(() => setShown(true));
    const onDown = (e: Event) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        close(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close(true);
      }
    };
    doc.addEventListener("pointerdown", onDown);
    doc.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      doc.removeEventListener("pointerdown", onDown);
      doc.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) itemRefs.current[active]?.focus({ preventScroll: true });
  }, [open, active]);

  const openAt = (index: number) => {
    setShown(false);
    setActive(index);
    setOpen(true);
  };

  const move = (delta: number) =>
    setActive((cur) => (cur + delta + items.length) % items.length);

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? close(false) : openAt(0))}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            openAt(0);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            openAt(items.length - 1);
          }
        }}
        className={iconButton}
      >
        <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={label}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              move(1);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              move(-1);
            } else if (e.key === "Home") {
              e.preventDefault();
              setActive(0);
            } else if (e.key === "End") {
              e.preventDefault();
              setActive(items.length - 1);
            } else if (e.key === "Tab") {
              close(false);
            }
          }}
          className={cx(
            "absolute right-0 top-9 z-30 w-44 origin-top-right rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-white p-1 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.10)] transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none",
            shown ? "scale-100 opacity-100" : "scale-95 opacity-0",
          )}
        >
          {items.map((item, i) => (
            <button
              key={item.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              type="button"
              role="menuitem"
              tabIndex={i === active ? 0 : -1}
              onFocus={() => setActive(i)}
              onClick={() => {
                item.run();
                close(true);
              }}
              className={item.danger ? menuItemDangerClass : menuItemClass}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function SettingsForm4() {
  const body = useScrollFade<HTMLDivElement>();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [email, setEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteRole, setInviteRole] = useState("member");
  const [flash, setFlash] = useState<{
    id: string;
    text: string;
    at: number;
  } | null>(null);
  const nextId = useRef(initialMembers.length);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(null), 2400);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const showFlash = (id: string, text: string) =>
    setFlash({ id, text, at: Date.now() });

  const seatLimit = 10;
  const used = members.length;
  const full = used >= seatLimit;

  const invite = () => {
    const value = email.trim();
    if (full) {
      setInviteError("All seats are in use. Remove a member first.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setInviteError("Enter a valid email address.");
      return;
    }
    if (members.some((m) => m.email.toLowerCase() === value.toLowerCase())) {
      setInviteError("That person is already on the team.");
      return;
    }
    setInviteError(null);
    const name = value.split("@")[0].replace(/[._-]+/g, " ");
    const initials = name
      .split(" ")
      .map((p) => p[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("");
    nextId.current += 1;
    const id = `m${nextId.current}`;
    setMembers((prev) => [
      ...prev,
      {
        id,
        name: name.replace(/\b\w/g, (m) => m.toUpperCase()),
        email: value,
        initials: initials || "?",
        role: inviteRole,
        status: "invited",
      },
    ]);
    setEmail("");
    showFlash(id, "Invitation sent");
  };

  const setRole = (id: string, role: string) =>
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));

  const remove = (id: string) =>
    setMembers((prev) => prev.filter((m) => m.id !== id));

  return (
    <div className="relative flex h-full min-h-[720px] w-full flex-col overflow-hidden bg-white dark:bg-neutral-950">
      <header className="shrink-0 px-4 sm:px-6">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center">
          <h2 className="truncate text-base font-medium tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
            Members
          </h2>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div
          ref={body.ref}
          onScroll={body.onScroll}
          className="h-full overflow-y-auto px-4 sm:px-6"
        >
          <div className="mx-auto w-full max-w-2xl pb-4 sm:pb-6">
            <div className="overflow-hidden rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <div className="bg-neutral-50 px-4 py-3 dark:bg-neutral-900/60">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Team access
                </h3>
                <p className="mt-0.5 text-[13px] text-neutral-500">
                  Invite people and keep role assignments aligned.
                </p>
              </div>

              <div className="flex flex-col gap-1.5 p-1.5">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    invite();
                  }}
                  className="rounded-[var(--rb-r-lg,10px)] bg-neutral-50 px-3 py-2.5 dark:bg-neutral-800/50"
                >
                  <div className="mb-2.5">
                    <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                      Invite member
                    </p>
                    <p
                      id="invite-hint"
                      className="mt-0.5 text-[13px] text-neutral-500"
                    >
                      {full
                        ? "All seats are in use. Remove a member to invite someone new."
                        : "Send an invitation with the right role from the start."}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <label htmlFor="invite-email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="invite-email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      aria-invalid={inviteError ? true : undefined}
                      aria-describedby={
                        inviteError ? "invite-error invite-hint" : "invite-hint"
                      }
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (inviteError) setInviteError(null);
                      }}
                      className={cx(
                        inputClass,
                        "sm:flex-1",
                        inviteError && errorBox,
                      )}
                    />
                    <div className="sm:w-40">
                      <Select
                        id="invite-role"
                        value={inviteRole}
                        onChange={setInviteRole}
                        label="Role for invite"
                        options={roles.filter((r) => r.value !== "owner")}
                      />
                    </div>
                    <button type="submit" className={primaryButton}>
                      <Plus aria-hidden="true" className="h-4 w-4" />
                      Send invite
                    </button>
                  </div>
                  {inviteError ? (
                    <p
                      id="invite-error"
                      role="alert"
                      className="mt-1.5 flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400"
                    >
                      <AlertCircle
                        aria-hidden="true"
                        className="mt-px h-3.5 w-3.5 shrink-0"
                      />
                      {inviteError}
                    </p>
                  ) : null}
                </form>

                <ul className="flex flex-col gap-1.5">
                  {members.map((m) => {
                    const owner = m.role === "owner";
                    const items: MenuItem[] = [];
                    if (m.status === "invited")
                      items.push({
                        id: "resend",
                        label: "Resend invite",
                        run: () => showFlash(m.id, "Invitation resent"),
                      });
                    items.push({
                      id: "copy",
                      label: "Copy email address",
                      run: () => {
                        void navigator.clipboard?.writeText(m.email);
                        showFlash(m.id, "Email address copied");
                      },
                    });
                    if (!owner)
                      items.push({
                        id: "remove",
                        label: "Remove from team",
                        danger: true,
                        run: () => remove(m.id),
                      });

                    return (
                      <li
                        key={m.id}
                        className="flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-[var(--rb-r-lg,10px)] bg-neutral-50 px-3 py-2.5 dark:bg-neutral-800/50"
                      >
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          {m.initials}
                        </span>
                        <div className="min-w-0 flex-1 basis-0">
                          <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                            {m.name}
                          </p>
                          <p
                            className={cx(
                              "truncate text-xs",
                              flash?.id === m.id
                                ? "text-neutral-700 dark:text-neutral-300"
                                : "text-neutral-500",
                            )}
                          >
                            {flash?.id === m.id ? flash.text : m.email}
                          </p>
                        </div>

                        <div className="order-last flex w-full items-center gap-3 sm:order-none sm:w-auto">
                          <div className="w-20 shrink-0">
                            <StatusLabel status={m.status} />
                          </div>
                          {owner ? (
                            <p className="flex h-9 flex-1 items-center px-3 text-sm text-neutral-500 sm:w-32 sm:flex-none">
                              {roleLabel(m.role)}
                            </p>
                          ) : (
                            <div className="flex-1 sm:w-32 sm:flex-none">
                              <Select
                                id={`role-${m.id}`}
                                value={m.role}
                                onChange={(role) => setRole(m.id, role)}
                                label={`Role for ${m.name}`}
                                options={roles.filter(
                                  (r) => r.value !== "owner",
                                )}
                              />
                            </div>
                          )}
                        </div>

                        <RowMenu
                          label={`Actions for ${m.name}`}
                          items={items}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="flex flex-col gap-2 bg-neutral-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:bg-neutral-900/60">
                <p
                  aria-live="polite"
                  className="text-[13px] text-neutral-600 dark:text-neutral-400"
                >
                  {flash ? (
                    flash.text
                  ) : (
                    <>
                      <span className="tabular-nums">{used}</span> of{" "}
                      {seatLimit} seats used
                    </>
                  )}
                </p>
                <div
                  aria-hidden="true"
                  className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 sm:w-32 dark:bg-neutral-800"
                >
                  <div
                    className="h-full rounded-full bg-[var(--rb-accent,oklch(20.5%_0_0))] transition-[width] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none dark:bg-[var(--rb-accent,oklch(100%_0_0))]"
                    style={{
                      width: `${Math.min(100, (used / seatLimit) * 100)}%`,
                    }}
                  />
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
  );
}
