"use client";

import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const focus =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rb-accent,oklch(20.5%_0_0))] dark:focus-visible:outline-[var(--rb-accent,oklch(100%_0_0))]";

const transition =
  "transition-[background-color,border-color,color,transform] duration-150 ease-out";

const frame =
  "flex flex-col gap-1 rounded-[var(--rb-r-2xl,14px)] border border-neutral-200/70 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900";

const panel =
  "rounded-[var(--rb-r-lg,10px)] border border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-950";

type Plan = {
  id: string;
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  specs: { label: string; value: string }[];
  includes: string[];
  recommended: boolean;
};

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    cadence: "forever",
    blurb: "For a single person keeping one project tidy.",
    specs: [
      { label: "Seats", value: "1" },
      { label: "Projects", value: "3" },
      { label: "History", value: "30 days" },
      { label: "Support", value: "Community" },
    ],
    includes: ["Unlimited work items", "Two integrations"],
    recommended: false,
  },
  {
    id: "team",
    name: "Team",
    price: "$18",
    cadence: "per seat / month",
    blurb: "For a working team that ships on a weekly cadence.",
    specs: [
      { label: "Seats", value: "Up to 50" },
      { label: "Projects", value: "Unlimited" },
      { label: "History", value: "2 years" },
      { label: "Support", value: "Next business day" },
    ],
    includes: ["Everything in Starter", "Roles and approvals", "Audit trail"],
    recommended: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    cadence: "billed annually",
    blurb: "For organisations with procurement and residency rules.",
    specs: [
      { label: "Seats", value: "Unlimited" },
      { label: "Projects", value: "Unlimited" },
      { label: "History", value: "Unlimited" },
      { label: "Support", value: "Dedicated" },
    ],
    includes: ["Everything in Team", "SSO and SCIM", "Data residency"],
    recommended: false,
  },
];

export default function Card5() {
  const [current, setCurrent] = useState("team");

  return (
    <div className="h-full min-h-[560px] w-full overflow-y-auto bg-white p-6 sm:p-8 dark:bg-neutral-950">
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PLANS.map((plan) => {
          const active = plan.id === current;

          return (
            <li key={plan.id} className={frame}>
              <div className={cx(panel, "px-4 py-4")}>
                <p className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                    {plan.name}
                  </span>
                  {plan.recommended && (
                    <span className="inline-flex h-5 shrink-0 items-center rounded-[var(--rb-r-sm,6px)] bg-neutral-100 px-1.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      Recommended
                    </span>
                  )}
                </p>
                <p className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-xl tabular-nums tracking-[-0.015em] text-neutral-900 dark:text-neutral-100">
                    {plan.price}
                  </span>
                  <span className="min-w-0 truncate text-xs text-neutral-500 dark:text-neutral-500">
                    {plan.cadence}
                  </span>
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {plan.blurb}
                </p>
              </div>

              <dl className={cx(panel, "flex-1 px-4 py-1")}>
                {plan.specs.map((spec, i) => (
                  <div
                    key={spec.label}
                    className={cx(
                      "flex items-center justify-between gap-3 py-2.5 text-[13px]",
                      i > 0 &&
                        "border-t border-neutral-200/70 dark:border-neutral-800",
                    )}
                  >
                    <dt className="min-w-0 truncate text-neutral-500 dark:text-neutral-500">
                      {spec.label}
                    </dt>
                    <dd className="min-w-0 shrink-0 truncate tabular-nums text-neutral-900 dark:text-neutral-100">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <ul className={cx(panel, "space-y-2 px-4 py-3")}>
                {plan.includes.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2 text-[13px] text-neutral-600 dark:text-neutral-400"
                  >
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-900 dark:text-neutral-100"
                      strokeWidth={2.5}
                    />
                    <span className="min-w-0">{line}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                aria-pressed={active}
                onClick={() => setCurrent(plan.id)}
                className={cx(
                  "inline-flex h-10 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--rb-r-lg,10px)] px-3 text-[13px] font-medium active:scale-[0.99]",
                  active
                    ? "border border-neutral-200/70 bg-white text-neutral-900 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800"
                    : "bg-[var(--rb-accent,oklch(20.5%_0_0))] text-[var(--rb-accent-fg,oklch(100%_0_0))] hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(20.5%_0_0))_90%,transparent)] dark:bg-[var(--rb-accent,oklch(100%_0_0))] dark:text-[var(--rb-accent-fg,oklch(20.5%_0_0))] dark:hover:bg-[color-mix(in_oklab,var(--rb-accent,oklch(100%_0_0))_90%,transparent)]",
                  transition,
                  focus,
                )}
              >
                {active ? "Current plan" : `Choose ${plan.name}`}
                {!active && (
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
