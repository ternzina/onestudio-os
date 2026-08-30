"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check, ChevronUp, ChevronDown } from "lucide-react";

const tiers = ["Starter", "Team", "Enterprise"];

const monitoringRows: Array<{ label: string; values: Array<true | string> }> = [
  { label: "Real-time error tracking", values: [true, true, true] },
  { label: "Uptime checks every 60 seconds", values: [true, true, true] },
  { label: "Unlimited dashboards and views", values: [true, true, true] },
  { label: "Source map & sourcemap symbolication", values: [true, true, true] },
  {
    label: "Release health and regression detection",
    values: [true, true, true],
  },
  {
    label: "Retention window",
    values: [
      "30 days of event history",
      "+ 90 days of event history with unlimited exports to your warehouse",
      "+ 90 days of event history with unlimited exports to your warehouse",
    ],
  },
];

const incidentRows: Array<{ label: string; values: Array<true | string> }> = [
  { label: "On-call scheduling", values: [true, true, true] },
  {
    label: "Slack, Teams, and PagerDuty integrations",
    values: [true, true, true],
  },
  {
    label: "Escalation policies",
    values: [
      "One policy per workspace",
      "+ Unlimited escalation policies with routing by service, region, and severity",
      "+ Unlimited escalation policies with routing by service, region, and severity",
    ],
  },
];

function Cell({ v }: { v: true | string }) {
  if (v === true) {
    return (
      <span className="grid place-items-center h-5 w-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
        <Check className="h-3 w-3" />
      </span>
    );
  }
  return (
    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
      {v}
    </p>
  );
}

function Section({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; values: Array<true | string> }>;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full grid grid-cols-4 items-center py-5 cursor-pointer"
      >
        <span className="col-span-1 text-xl font-medium text-neutral-900 dark:text-white text-left">
          {title}
        </span>
        <span className="col-span-3 flex justify-end pr-2 text-neutral-500 dark:text-neutral-500">
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </button>
      {open &&
        rows.map((r) => (
          <div
            key={r.label}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start py-5 border-t border-neutral-200 dark:border-neutral-800"
          >
            <a
              href="#"
              className="text-sm text-neutral-800 dark:text-neutral-200 underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-700"
            >
              {r.label}
            </a>
            {r.values.map((v, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="md:hidden text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-500 w-24 shrink-0">
                  {tiers[i]}
                </span>
                <Cell v={v} />
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}

export default function Pricing8() {
  return (
    <section className="w-full min-h-[var(--rb-section-min-h,100vh)] py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-serif text-neutral-900 dark:text-white leading-[1.05]"
          >
            Compare
            <br />
            every plan
          </motion.h2>

          {tiers.map((t, i) => (
            <div key={t} className="flex flex-col gap-4">
              <p className="text-xl text-neutral-900 dark:text-white">{t}</p>
              <button
                className={`w-full py-3 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                  i === 0
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90"
                    : "border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
                }`}
              >
                {i === 2 ? "Contact sales" : "Start free"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Section title="Monitoring" rows={monitoringRows} />
          <Section title="Incident Response" rows={incidentRows} />
        </div>
      </div>
    </section>
  );
}
