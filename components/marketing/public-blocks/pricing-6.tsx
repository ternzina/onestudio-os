"use client";

import { Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export type Pricing6Plan = {
  id: string;
  name: string;
  price: string;
  annualPrice?: string;
  annualTotal?: string;
  storage?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  popular: boolean;
  badge?: string;
};

export type Pricing6BillingCycle = "monthly" | "annual";

export type Pricing6Billing = {
  cycle: Pricing6BillingCycle;
  monthlyLabel: string;
  annualLabel: string;
  priceUnitLabel: string;
  annualNote?: string;
  annualTotalLabel: string;
  ariaLabel: string;
  onCycleChange: (cycle: Pricing6BillingCycle) => void;
};

type Pricing6Props = {
  plans: readonly Pricing6Plan[];
  heading: string;
  supporting: string;
  includedLabel: string;
  storageLabel: string;
  billing?: Pricing6Billing;
};

export function Pricing6({
  plans,
  heading,
  supporting,
  includedLabel,
  storageLabel,
  billing,
}: Pricing6Props) {
  const reducedMotion = useReducedMotion() === true;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  return (
    <section
      className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-[var(--os-public-color-ivory)] px-[var(--os-public-container-gutter)] py-16 text-[#34241c] lg:py-24"
      aria-labelledby="pricing-plans-heading"
    >
      <div className="relative z-10 mx-auto flex w-[var(--os-public-container-width)] flex-col items-center">
        <div className="mb-10 max-w-3xl space-y-4 text-center sm:mb-14">
          <h2
            id="pricing-plans-heading"
            className="text-3xl font-semibold leading-[1.08] tracking-[-.045em] text-[#34241c] sm:text-5xl"
          >
            {heading}
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-7 text-[#766257] sm:text-lg">
            {supporting}
          </p>
        </div>

        {billing ? (
          <div className="mb-10 inline-flex gap-1 rounded-full border border-[#cdb9aa] bg-[#fffdf9] p-1 shadow-[0_10px_24px_rgba(77,49,34,.08)]" role="group" aria-label={billing.ariaLabel}>
            <button
              type="button"
              aria-pressed={billing.cycle === "monthly"}
              onClick={() => billing.onCycleChange("monthly")}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff814a] ${billing.cycle === "monthly" ? "bg-[#34241c] text-[#fff9f4]" : "text-[#766257] hover:bg-[#f3ecdf]"}`}
            >
              {billing.monthlyLabel}
            </button>
            <button
              type="button"
              aria-pressed={billing.cycle === "annual"}
              onClick={() => billing.onCycleChange("annual")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff814a] ${billing.cycle === "annual" ? "bg-[#34241c] text-[#fff9f4]" : "text-[#766257] hover:bg-[#f3ecdf]"}`}
            >
              {billing.annualLabel}
              {billing.annualNote ? <span className={`rounded-full bg-[#ff814a]/15 px-2 py-1 text-[9px] uppercase tracking-[.08em] ${billing.cycle === "annual" ? "text-[#ffb08c]" : "text-[#9f482c]"}`}>{billing.annualNote}</span> : null}
            </button>
          </div>
        ) : null}

        <motion.div
          className="grid w-full grid-cols-1 items-stretch gap-5 min-[651px]:grid-cols-2 min-[1181px]:gap-6 min-[1181px]:grid-cols-3"
          variants={containerVariants}
          initial={reducedMotion ? false : "hidden"}
          animate="visible"
        >
          {plans.map((plan) => (
            <motion.article
              key={plan.id}
              variants={itemVariants}
              className={`relative flex min-w-0 flex-col overflow-hidden rounded-[24px] p-6 min-[651px]:p-8 ${
                plan.popular
                  ? "bg-[#2b1810] text-[#fff9f4] shadow-[0_28px_70px_rgba(70,32,16,.22)] ring-1 ring-[#ff814a]/60 min-[1181px]:-my-5 min-[1181px]:py-10"
                  : "border border-[#d8c8bc] bg-[#fffdf9] text-[#34241c] shadow-[0_18px_54px_rgba(77,49,34,.08)]"
              }`}
            >
              <div className="relative z-10 mb-5 flex min-w-0 flex-wrap items-center justify-between gap-4">
                <h3
                  className={`min-w-0 text-xl font-semibold ${
                    plan.popular ? "text-[#ff9a6d]" : "text-[#9f482c]"
                  }`}
                >
                  {plan.name}
                </h3>
                {plan.badge ? (
                  <span className="rounded-full border border-[#ff814a]/50 bg-[#ff814a]/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#ffb08c]">
                    {plan.badge}
                  </span>
                ) : null}
              </div>

              <div className="relative z-10 mb-4">
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span
                    className={`block text-3xl font-semibold leading-tight tracking-[-.04em] sm:text-4xl ${
                      plan.popular ? "text-[#fff9f4]" : "text-[#34241c]"
                    }`}
                  >
                    {billing?.cycle === "annual" ? plan.annualPrice ?? plan.price : plan.price}
                  </span>
                  {billing ? (
                    <span className={`text-xs font-semibold ${plan.popular ? "text-[#d8b4a3]" : "text-[#9a8273]"}`}>
                      {billing.priceUnitLabel}
                    </span>
                  ) : null}
                </div>
                {billing?.cycle === "annual" && plan.annualTotal ? (
                  <span className={`mt-2 block text-xs font-semibold uppercase tracking-[.1em] ${plan.popular ? "text-[#d8b4a3]" : "text-[#9a8273]"}`}>
                    {plan.annualTotal} {billing.annualTotalLabel}
                  </span>
                ) : null}
                {plan.storage ? (
                  <span
                    className={`mt-2 block text-xs font-semibold uppercase tracking-[.1em] ${
                      plan.popular ? "text-[#d8b4a3]" : "text-[#9a8273]"
                    }`}
                  >
                    {storageLabel}: {plan.storage}
                  </span>
                ) : null}
              </div>

              <p
                className={`relative z-10 mb-8 text-sm leading-6 ${
                  plan.popular ? "text-[#d8c2b7]" : "text-[#766257]"
                }`}
              >
                {plan.description}
              </p>

              <a
                href={plan.href}
                className={`relative z-10 mb-8 inline-flex min-h-12 w-full min-w-0 shrink-0 items-center justify-center rounded-xl px-4 text-center text-sm font-bold transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff814a] ${
                  plan.popular
                    ? "bg-[#ff6b35] text-[#fff9f4] shadow-[0_14px_30px_rgba(255,107,53,.2)]"
                    : "bg-[#34241c] text-[#fff9f4] hover:bg-[#4b2c1f]"
                }`}
              >
                {plan.cta}
              </a>

              <div className="relative z-10 mt-auto">
                <p
                  className={`mb-4 text-xs font-bold uppercase tracking-[.14em] ${
                    plan.popular ? "text-[#ffb08c]" : "text-[#9f725e]"
                  }`}
                >
                  {includedLabel}
                </p>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex min-w-0 items-start gap-3">
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                          plan.popular
                            ? "bg-[#ff814a] text-[#2b1810]"
                            : "bg-[#34241c] text-[#fff9f4]"
                        }`}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span
                        className={`min-w-0 text-sm leading-5 ${
                          plan.popular ? "text-[#f0ddd4]" : "text-[#6f5b50]"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Pricing6;
