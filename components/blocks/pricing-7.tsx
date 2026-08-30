"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check, Minus } from "lucide-react";

const tiers = [
  {
    name: "Hobby",
    tagline: "Everything you need to explore",
    price: "$0",
    unit: "forever free",
    highlights: [
      "Up to 2 collaborators",
      "5 active projects",
      "10k API requests / month",
      "Community support",
    ],
    cta: "Start free",
    popular: false,
  },
  {
    name: "Studio",
    tagline: "For small teams shipping fast",
    price: "$29",
    unit: "per seat / month",
    highlights: [
      "Unlimited projects and views",
      "Branch-based previews",
      "Up to 15 collaborators",
      "250k API requests / month",
      "Shared component library",
      "Priority email support",
    ],
    cta: "Start 14-day trial",
    popular: true,
  },
  {
    name: "Business",
    tagline: "Governance and scale for orgs",
    price: "Let's talk",
    unit: "",
    highlights: [
      "Unlimited seats",
      "SSO / SAML and SCIM",
      "Custom data residency",
      "SOC 2 Type II + HIPAA BAA",
      "99.99% uptime SLA",
      "Named support engineer",
    ],
    cta: "Contact sales",
    popular: false,
  },
];

const workspaceRows = [
  { feature: "Collaborators", values: ["Up to 2", "Up to 15", "Unlimited"] },
  {
    feature: "Workspaces",
    values: ["Personal only", "Team + Personal", "Custom org structure"],
  },
  {
    feature: "Projects per workspace",
    values: ["5", "Unlimited", "Unlimited"],
  },
];

const platformRows: Array<{
  feature: string;
  values: Array<true | false | string>;
}> = [
  { feature: "Real-time collaborative editor", values: [true, true, true] },
  { feature: "Version history and rollbacks", values: [true, true, true] },
  { feature: "Comments and review flows", values: [true, true, true] },
  { feature: "Figma and Linear integrations", values: [true, true, true] },
  { feature: "Custom domains per project", values: [false, true, true] },
  { feature: "Monthly API requests", values: ["10k", "250k", "Custom"] },
  { feature: "Data export to S3 / warehouse", values: [false, true, true] },
  { feature: "Audit logs", values: [false, "90 days", "Unlimited + export"] },
  {
    feature: "Role-based permissions",
    values: ["Basic", "Granular", "Custom policies"],
  },
  { feature: "Sandboxed preview environments", values: [true, true, true] },
  { feature: "Single Sign-On (SSO)", values: [false, false, true] },
  { feature: "Dedicated tenant deployment", values: [false, false, true] },
];

function Cell({ v }: { v: true | false | string }) {
  if (v === true) {
    return (
      <span className="grid place-items-center h-5 w-5 mx-auto rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
        <Check className="h-3 w-3" />
      </span>
    );
  }
  if (v === false) {
    return (
      <span className="grid place-items-center h-5 w-5 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
        <Minus className="h-3 w-3" />
      </span>
    );
  }
  return (
    <span className="text-sm text-neutral-700 dark:text-neutral-300">{v}</span>
  );
}

export default function Pricing7() {
  const [billing, setBilling] = useState<"Annually" | "Monthly">("Monthly");

  return (
    <section className="w-full min-h-[var(--rb-section-min-h,100vh)] py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800">
            <p className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-500 mb-4">
              Billing
            </p>
            <div className="space-y-2.5">
              {(["Annually", "Monthly"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer"
                >
                  <span
                    className={`h-3 w-3 rounded-full border ${
                      billing === b
                        ? "border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white ring-2 ring-offset-1 ring-neutral-900 dark:ring-white dark:ring-offset-neutral-950"
                        : "border-neutral-400"
                    }`}
                  />
                  {b}
                  {b === "Annually" && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                      Save 20%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {tiers.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className={`p-6 flex flex-col gap-4 border-b md:border-b-0 ${
                idx < tiers.length - 1 ? "md:border-r" : ""
              } border-neutral-200 dark:border-neutral-800 ${
                t.popular ? "bg-neutral-50 dark:bg-neutral-900" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold text-neutral-900 dark:text-white">
                  {t.name}
                </p>
                {t.popular && (
                  <span className="px-2 py-0.5 rounded bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] font-medium">
                    Popular
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {t.tagline}
              </p>
              <div className="mt-4">
                <span className="text-2xl font-semibold text-neutral-900 dark:text-white">
                  {t.price}
                </span>
                {t.unit && (
                  <span className="ml-2 text-xs text-neutral-500">
                    {t.unit}
                  </span>
                )}
              </div>
              <ul className="space-y-2 mt-2">
                {t.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300"
                  >
                    <Check className="h-3.5 w-3.5 text-neutral-900 dark:text-white mt-0.5 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-auto w-full py-2.5 rounded-full text-[11px] font-semibold tracking-[0.15em] uppercase cursor-pointer transition-colors ${
                  t.popular
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90"
                    : "border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
                }`}
              >
                {t.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 bg-neutral-50 dark:bg-neutral-900 border-x border-neutral-200 dark:border-neutral-800">
            <div className="col-span-full p-3 text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Workspace
            </div>
          </div>
          {workspaceRows.map((r) => (
            <div
              key={r.feature}
              className="grid grid-cols-1 md:grid-cols-4 border-x border-b border-neutral-200 dark:border-neutral-800"
            >
              <div className="p-4 text-sm text-neutral-700 dark:text-neutral-300 border-r border-neutral-200 dark:border-neutral-800">
                {r.feature}
              </div>
              {r.values.map((v, i) => (
                <div
                  key={i}
                  className="p-4 text-center text-sm text-neutral-700 dark:text-neutral-300 flex md:block items-center justify-between md:justify-center border-t md:border-t-0 border-neutral-200 dark:border-neutral-800"
                >
                  <span className="md:hidden text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                    {tiers[i].name}
                  </span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-4 bg-neutral-50 dark:bg-neutral-900 border-x border-neutral-200 dark:border-neutral-800">
            <div className="col-span-full p-3 text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Platform
            </div>
          </div>
          {platformRows.map((r, ri) => (
            <div
              key={r.feature}
              className={`grid grid-cols-1 md:grid-cols-4 border-x border-b border-neutral-200 dark:border-neutral-800 ${
                ri === platformRows.length - 1 ? "rounded-b-2xl" : ""
              }`}
            >
              <div className="p-4 text-sm text-neutral-700 dark:text-neutral-300 border-r border-neutral-200 dark:border-neutral-800">
                {r.feature}
              </div>
              {r.values.map((v, i) => (
                <div
                  key={i}
                  className="p-4 text-center flex md:block items-center justify-between md:justify-center border-t md:border-t-0 border-neutral-200 dark:border-neutral-800"
                >
                  <span className="md:hidden text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                    {tiers[i].name}
                  </span>
                  <Cell v={v} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
