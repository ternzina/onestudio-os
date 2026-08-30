"use client";

import { motion } from "motion/react";
import { useState } from "react";
import {
  Paintbrush,
  Users,
  Rocket,
  Settings2,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

const personas: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "designers", label: "Designers", Icon: Paintbrush },
  { key: "leads", label: "Team Leads", Icon: Users },
  { key: "founders", label: "Founders", Icon: Rocket },
  { key: "ops", label: "Operations", Icon: Settings2 },
  { key: "marketers", label: "Marketers", Icon: Megaphone },
];

const content: Record<
  string,
  {
    ctaTitle: string;
    buttonLabel: string;
    blocks: { title: string; desc: string }[];
  }
> = {
  designers: {
    ctaTitle: "From first sketch to final ship",
    buttonLabel: "See the design toolkit",
    blocks: [
      {
        title: "Stay in the flow",
        desc: "Keep briefs, references, and feedback next to your canvas so you never lose the thread of a good idea.",
      },
      {
        title: "Hand off without friction",
        desc: "Specs, assets, and versions stay tidy so engineering can build straight from what you made.",
      },
    ],
  },
  leads: {
    ctaTitle: "From first sketch to final ship",
    buttonLabel: "See the team toolkit",
    blocks: [
      {
        title: "See the whole picture",
        desc: "Track where every project actually stands, not where someone promised it would be in the last standup.",
      },
      {
        title: "Spot the snags early",
        desc: "Surface the tickets getting stuck and the people getting buried before either turns into a real problem.",
      },
    ],
  },
  founders: {
    ctaTitle: "From first sketch to final ship",
    buttonLabel: "See the founder toolkit",
    blocks: [
      {
        title: "One source of truth",
        desc: "Pull roadmap, revenue, and team status into a single place so every conversation starts from the same page.",
      },
      {
        title: "Move fast, stay calm",
        desc: "Ship more in less time with lightweight planning that respects how small teams actually work day-to-day.",
      },
    ],
  },
  ops: {
    ctaTitle: "From first sketch to final ship",
    buttonLabel: "See the ops toolkit",
    blocks: [
      {
        title: "One connected stack",
        desc: "Bring every tool your team already uses into a single, tidy workspace with clean, enriched data underneath.",
      },
      {
        title: "Report without guessing",
        desc: "Live dashboards built on numbers you can actually defend in a review meeting.",
      },
    ],
  },
  marketers: {
    ctaTitle: "From first sketch to final ship",
    buttonLabel: "See the marketing toolkit",
    blocks: [
      {
        title: "Ship the right story",
        desc: "Plan campaigns, draft copy, and schedule everything side-by-side with the work it's promoting.",
      },
      {
        title: "Close the loop with product",
        desc: "Share launch dates, assets, and context with the team building the thing you're about to announce.",
      },
    ],
  },
};

export default function Features9() {
  const [active, setActive] = useState("founders");
  const data = content[active];

  return (
    <section className="w-full min-h-[var(--rb-section-min-h,100vh)] flex items-start py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-[1400px] mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="text-center font-serif text-3xl sm:text-5xl md:text-6xl text-neutral-900 dark:text-white tracking-tight leading-tight"
        >
          Built to <span className="italic">power</span>
          <br />
          the teams behind great work
        </motion.h2>

        <div className="mt-10 sm:mt-14 flex sm:grid sm:grid-cols-5 gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          {personas.map((p) => {
            const isActive = active === p.key;
            const Icon = p.Icon;
            return (
              <button
                key={p.key}
                onClick={() => setActive(p.key)}
                className={`group relative flex sm:flex-col items-center justify-start sm:justify-center text-center gap-2 sm:gap-5 rounded-xl px-3 sm:px-6 py-2.5 sm:py-10 border transition-colors cursor-pointer shrink-0 sm:shrink ${
                  isActive
                    ? "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 shadow-sm"
                    : "bg-neutral-50 dark:bg-neutral-900/40 border-transparent hover:bg-white dark:hover:bg-neutral-900"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-7 h-7 sm:w-16 sm:h-16 rounded-full shrink-0 ${
                    isActive
                      ? "bg-neutral-100 dark:bg-neutral-800"
                      : "bg-white dark:bg-neutral-900"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 sm:w-8 sm:h-8 ${
                      isActive
                        ? "text-neutral-900 dark:text-white"
                        : "text-neutral-400 dark:text-neutral-600"
                    }`}
                    strokeWidth={1.5}
                  />
                </div>
                <span
                  className={`text-xs sm:text-base font-medium whitespace-nowrap ${
                    isActive
                      ? "text-neutral-900 dark:text-white"
                      : "text-neutral-500 dark:text-neutral-500"
                  }`}
                >
                  {p.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="persona-accent"
                    className="absolute inset-0 -z-10 rounded-xl pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle at 70% 50%, rgba(147,197,253,0.35), transparent 60%)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-10 pt-8 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
        >
          <div className="flex flex-col gap-5">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-medium text-neutral-900 dark:text-white tracking-tight leading-tight">
              {data.ctaTitle}
            </h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="self-start px-5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {data.buttonLabel}
            </motion.button>
          </div>
          <div className="flex flex-col gap-8">
            {data.blocks.map((b, i) => (
              <div key={i} className="flex flex-col gap-2">
                <h4 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white">
                  {b.title}
                </h4>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
