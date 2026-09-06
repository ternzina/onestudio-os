"use client";

import { Check, ChevronDown, ChevronUp, Minus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

export type Pricing8Value = true | false | string;

export type Pricing8Row = {
  label: string;
  values: readonly [Pricing8Value, Pricing8Value, Pricing8Value];
};

export type Pricing8Section = {
  title: string;
  rows: Pricing8Row[];
};

export type Pricing8Tier = {
  id: string;
  name: string;
  price: string;
  annualPrice: string;
  actionLabel: string;
  href: string;
  highlighted?: boolean;
};

type Pricing8Props = {
  title: string;
  tiers: readonly Pricing8Tier[];
  sections: readonly Pricing8Section[];
  yesLabel: string;
  noLabel: string;
  priceUnitLabel: string;
  annualPriceLabel: string;
};

function Cell({
  value,
  yesLabel,
  noLabel,
}: {
  value: Pricing8Value;
  yesLabel: string;
  noLabel: string;
}) {
  if (value === true) {
    return (
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--os-public-color-dark)] text-[var(--os-public-color-cream)]"
        role="img"
        aria-label={yesLabel}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
      </span>
    );
  }

  if (value === false) {
    return (
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[var(--os-public-color-border-light)] text-[#aa9386]"
        role="img"
        aria-label={noLabel}
      >
        <Minus className="h-3.5 w-3.5" />
      </span>
    );
  }

  return <p className="text-sm leading-6 text-[var(--os-public-color-muted-on-light)]">{value}</p>;
}

function Section({
  section,
  tiers,
  yesLabel,
  noLabel,
}: {
  section: Pricing8Section;
  tiers: readonly Pricing8Tier[];
  yesLabel: string;
  noLabel: string;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-t border-[var(--os-public-color-border-light)]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="grid w-full grid-cols-[1fr_auto] items-center gap-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff814a] lg:grid-cols-[minmax(0,1.45fr)_repeat(3,minmax(0,1fr))]"
        aria-expanded={open}
      >
        <span className="os-type-action text-[var(--os-public-color-dark)]">
          {section.title}
        </span>
        <span className="text-[#9a8273] lg:col-span-3 lg:justify-self-end lg:pr-2">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {open
        ? section.rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-1 items-start gap-3 border-t border-[var(--os-public-color-border-light)] py-4 lg:grid-cols-[minmax(0,1.45fr)_repeat(3,minmax(0,1fr))] lg:gap-6"
            >
              <span className="os-type-action text-[var(--os-public-color-dark)]">
                {row.label}
              </span>
              {row.values.map((value, index) => (
                <div key={`${row.label}-${tiers[index].id}`} className="flex items-center gap-3 lg:min-h-7">
                  <span className="os-type-micro w-28 shrink-0 text-[#aa9386] lg:hidden">
                    {tiers[index].name}
                  </span>
                  <Cell value={value} yesLabel={yesLabel} noLabel={noLabel} />
                </div>
              ))}
            </div>
          ))
        : null}
    </div>
  );
}

export default function Pricing8({
  title,
  tiers,
  sections,
  yesLabel,
  noLabel,
  priceUnitLabel,
  annualPriceLabel,
}: Pricing8Props) {
  const reducedMotion = useReducedMotion() === true;

  return (
    <section
      className="w-full bg-[var(--os-public-color-ivory)] px-[var(--os-public-container-gutter)] py-16 text-[var(--os-public-color-dark)] lg:py-24"
      aria-labelledby="pricing-comparison-heading"
    >
      <div className="os-public-content-guide">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <h2
            id="pricing-comparison-heading"
            className="os-type-h2 text-center text-[var(--os-public-color-dark)]"
          >
            {title}
          </h2>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-8 pb-8 sm:grid-cols-3 sm:gap-6">
          {tiers.map((tier) => (
            <div key={tier.id} className="flex min-w-0 flex-col">
              <p className="os-type-action text-center uppercase text-[var(--os-public-color-dark)] sm:text-left">
                {tier.name}
              </p>
              <p className="mt-3 text-center text-3xl font-semibold leading-tight tracking-[-.04em] text-[var(--os-public-color-dark)] sm:text-left">
                {tier.price}
                <span className="ml-1 text-xs font-semibold tracking-normal text-[#9a8273]">{priceUnitLabel}</span>
              </p>
              <p className="mt-1 text-center text-xs leading-5 text-[var(--os-public-color-muted-on-light)] sm:text-left">
                {tier.annualPrice} {annualPriceLabel}
              </p>
              <a
                href={tier.href}
                className={`os-button os-type-action mt-5 w-full ${tier.highlighted ? "primary" : "ghost"}`}
              >
                {tier.actionLabel}
              </a>
            </div>
          ))}
        </div>

        <div>
          {sections.map((section) => (
            <Section
              key={section.title}
              section={section}
              tiers={tiers}
              yesLabel={yesLabel}
              noLabel={noLabel}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
