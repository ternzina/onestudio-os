"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Plus } from "lucide-react";

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

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const labelClass =
  "block text-[13px] font-medium text-neutral-900 dark:text-neutral-100";

const inputClass =
  "mt-1.5 h-9 w-full rounded-[var(--rb-r-md,8px)] border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 hover:border-neutral-300 focus:border-neutral-900 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-700 dark:focus:border-white dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const optionClass =
  "flex w-full cursor-pointer items-center gap-3 rounded-[var(--rb-r-lg,10px)] border px-3 py-2.5 text-left active:scale-[0.99]";

const STEPS = [
  { id: "profile", label: "Profile", blurb: "Basic profile details." },
  { id: "role", label: "Role", blurb: "Tune starter views." },
  { id: "source", label: "Source", blurb: "Optional discovery signal." },
  { id: "workspace", label: "Workspace", blurb: "Name the workspace." },
  { id: "goals", label: "Goals", blurb: "Pick first workflows." },
  { id: "invite", label: "Invite", blurb: "Add teammates." },
] as const;

const ROLES = ["Engineering", "Design", "Product", "Operations"];
const SOURCES = ["Search", "Social", "A colleague", "Conference talk"];
const GOALS = [
  "Track work across teams",
  "Automate handoffs",
  "Report on delivery",
  "Centralise documents",
];

const HEADINGS: Record<string, { title: string; blurb: string }> = {
  profile: {
    title: "Set up your profile",
    blurb: "Add the details teammates will see across the workspace.",
  },
  role: {
    title: "What do you work on?",
    blurb: "We use this to pick the starter views you land on.",
  },
  source: {
    title: "How did you find us?",
    blurb: "Optional, and it only ever shapes what we build next.",
  },
  workspace: {
    title: "Name your workspace",
    blurb: "This appears in invitations and in the sidebar.",
  },
  goals: {
    title: "What should we set up first?",
    blurb: "Pick as many as you like. You can change these later.",
  },
  invite: {
    title: "Bring your team in",
    blurb: "Invitations stay open for 14 days.",
  },
};

export default function Onboarding2() {
  const body = useScrollFade<HTMLFormElement>();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("Sam Rivera");
  const [title, setTitle] = useState("Product Lead");
  const [role, setRole] = useState("Product");
  const [source, setSource] = useState("");
  const [workspace, setWorkspace] = useState("Northwind");
  const [goals, setGoals] = useState<string[]>([GOALS[0]]);
  const [invites, setInvites] = useState(["", ""]);

  const current = STEPS[step];
  const heading = HEADINGS[current.id];
  const last = step === STEPS.length - 1;

  const toggleGoal = (goal: string) =>
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );

  const slug =
    workspace.trim().toLowerCase().replace(/\s+/g, "-") || "workspace";

  return (
    <div className="relative flex h-full min-h-[720px] w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <div className="hidden w-64 shrink-0 flex-col justify-center px-6 lg:flex">
        <ol className="space-y-0">
          {STEPS.map((item, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  aria-current={active ? "step" : undefined}
                  className={cx(
                    "flex w-full cursor-pointer items-start gap-3 rounded-[var(--rb-r-md,8px)] px-1 py-1.5 text-left",
                    focus,
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium tabular-nums",
                      active || done
                        ? "bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                        : "border border-neutral-200 text-neutral-400 dark:border-neutral-800 dark:text-neutral-600",
                      transition,
                    )}
                  >
                    {done ? (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cx(
                        "block truncate text-[13px] font-medium",
                        active || done
                          ? "text-neutral-900 dark:text-neutral-100"
                          : "text-neutral-500 dark:text-neutral-500",
                      )}
                    >
                      {item.label}
                    </span>
                    <span className="block truncate text-xs text-neutral-500 dark:text-neutral-500">
                      {item.blurb}
                    </span>
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="ml-4 block h-3 w-px bg-neutral-200 dark:bg-neutral-800"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex min-w-0 flex-1 p-4 sm:p-6">
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-[var(--rb-r-2xl,14px)]">
          <form
            ref={body.ref}
            onScroll={body.onScroll}
            onSubmit={(e) => {
              e.preventDefault();
              if (!last) setStep((s) => s + 1);
            }}
            className="flex h-full w-full flex-col overflow-y-auto rounded-[var(--rb-r-2xl,14px)] border border-neutral-200 bg-white p-6 sm:p-10 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col">
              <p className="text-xs tabular-nums text-neutral-500 lg:hidden dark:text-neutral-500">
                Step {step + 1} of {STEPS.length}
              </p>
              <h2 className="mt-1 text-xl font-medium tracking-[-0.015em] text-neutral-900 lg:mt-0 dark:text-neutral-100">
                {heading.title}
              </h2>
              <p className="mt-1.5 text-[13px] text-neutral-500 dark:text-neutral-400">
                {heading.blurb}
              </p>

              <div className="mt-8 space-y-4">
                {current.id === "profile" && (
                  <>
                    <div>
                      <label htmlFor="ob2-name" className={labelClass}>
                        Full name
                      </label>
                      <input
                        id="ob2-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="ob2-title" className={labelClass}>
                        Job title
                      </label>
                      <input
                        id="ob2-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What you do"
                        className={inputClass}
                      />
                    </div>
                  </>
                )}

                {current.id === "role" && (
                  <div
                    role="radiogroup"
                    aria-label="Role"
                    className="space-y-2"
                  >
                    {ROLES.map((option) => {
                      const selected = option === role;
                      return (
                        <button
                          key={option}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setRole(option)}
                          className={cx(
                            optionClass,
                            selected
                              ? "border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800"
                              : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900",
                            transition,
                            focus,
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cx(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                              selected
                                ? "border-neutral-900 dark:border-neutral-100"
                                : "border-neutral-300 dark:border-neutral-600",
                            )}
                          >
                            {selected && (
                              <span className="h-2 w-2 rounded-full bg-neutral-900 dark:bg-neutral-100" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                            {option}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {current.id === "source" && (
                  <div
                    role="radiogroup"
                    aria-label="Source"
                    className="space-y-2"
                  >
                    {SOURCES.map((option) => {
                      const selected = option === source;
                      return (
                        <button
                          key={option}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setSource(option)}
                          className={cx(
                            optionClass,
                            selected
                              ? "border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800"
                              : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900",
                            transition,
                            focus,
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cx(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                              selected
                                ? "border-neutral-900 dark:border-neutral-100"
                                : "border-neutral-300 dark:border-neutral-600",
                            )}
                          >
                            {selected && (
                              <span className="h-2 w-2 rounded-full bg-neutral-900 dark:bg-neutral-100" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                            {option}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {current.id === "workspace" && (
                  <>
                    <div>
                      <label htmlFor="ob2-ws" className={labelClass}>
                        Workspace name
                      </label>
                      <input
                        id="ob2-ws"
                        value={workspace}
                        onChange={(e) => setWorkspace(e.target.value)}
                        placeholder="Acme"
                        className={inputClass}
                      />
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500">
                      Your team will reach it at northwind.app/{slug}
                    </p>
                  </>
                )}

                {current.id === "goals" && (
                  <div className="space-y-2">
                    {GOALS.map((option) => {
                      const selected = goals.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleGoal(option)}
                          className={cx(
                            optionClass,
                            selected
                              ? "border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800"
                              : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900",
                            transition,
                            focus,
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cx(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--rb-r-xs,4px)] border",
                              selected
                                ? "border-neutral-900 bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] dark:border-neutral-100 dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))]"
                                : "border-neutral-300 text-transparent dark:border-neutral-600",
                            )}
                          >
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[13px] text-neutral-900 dark:text-neutral-100">
                            {option}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {current.id === "invite" && (
                  <>
                    {invites.map((email, i) => (
                      <div key={i}>
                        <label
                          htmlFor={`ob2-invite-${i}`}
                          className={labelClass}
                        >
                          Email address {i + 1}
                        </label>
                        <input
                          id={`ob2-invite-${i}`}
                          type="email"
                          value={email}
                          onChange={(e) =>
                            setInvites((prev) =>
                              prev.map((v, j) =>
                                j === i ? e.target.value : v,
                              ),
                            )
                          }
                          placeholder="teammate@company.com"
                          className={inputClass}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setInvites((prev) => [...prev, ""])}
                      className={cx(
                        "inline-flex h-9 cursor-pointer items-center gap-2 rounded-[var(--rb-r-md,8px)] bg-neutral-100 px-3 text-[13px] font-medium text-neutral-700 hover:bg-neutral-200 active:scale-[0.97] dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
                        transition,
                        focus,
                      )}
                    >
                      <Plus aria-hidden="true" className="h-4 w-4" />
                      Add another
                    </button>
                  </>
                )}
              </div>

              <div className="mt-8 flex shrink-0 items-center gap-2 pt-4">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className={cx(
                      "inline-flex h-10 shrink-0 cursor-pointer items-center rounded-[var(--rb-r-lg,10px)] border border-neutral-200 bg-white px-4 text-[13px] font-medium text-neutral-900 hover:bg-neutral-50 active:scale-[0.97] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800",
                      transition,
                      focus,
                    )}
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  className={cx(
                    "inline-flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[var(--rb-r-lg,10px)] bg-[var(--rb-accent,oklch(20.5%_0_0))] px-4 text-[13px] font-medium text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] active:scale-[0.99] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
                    transition,
                    focus,
                  )}
                >
                  {last ? "Finish setup" : "Continue"}
                </button>
              </div>
            </div>
          </form>
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              body.edges.start ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ease-out dark:from-neutral-900",
              body.edges.end ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
      </div>
    </div>
  );
}
