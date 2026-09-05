"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import FAQ3 from "@/components/marketing/public-blocks/faq-3";
import Pricing6, {
  type Pricing6BillingCycle,
} from "@/components/marketing/public-blocks/pricing-6";
import Pricing8 from "@/components/marketing/public-blocks/pricing-8";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { OneStudioFooter } from "@/components/marketing/OneStudioFooter";
import { SectionReveal } from "@/components/marketing/SectionReveal";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/use-locale";
import { pricingConfig } from "@/lib/pricing-config";
import styles from "./page.module.css";

export default function PricingPageClient() {
  const [lang, setLang] = useLocale();
  const [cycle, setCycle] = useState<Pricing6BillingCycle>("annual");
  const t = getTranslations(lang).pricing;
  const plans = pricingConfig.plans.map((plan) => {
    const copy = t.plans[plan.id];
    return {
      ...plan,
      name: copy.name,
      description: copy.description,
      features: [...copy.features],
      cta: copy.cta,
      badge: "badge" in copy ? copy.badge : undefined,
    };
  });
  const comparisonSections = pricingConfig.comparison.map((section) => ({
    title: t.comparison.sectionTitles[section.id],
    rows: section.rows.map((row) => {
      const [first, second, third] = row.values;
      const valueLabel = (value: (typeof row.values)[number]) => {
        if (value === "standard") return t.comparison.valueLabels.standard;
        if (value === "more") return t.comparison.valueLabels.more;
        return value;
      };
      return {
        label: t.comparison.rowLabels[row.id],
        values: [valueLabel(first), valueLabel(second), valueLabel(third)] as const,
      };
    }),
  }));
  const tiers = plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    annualPrice: plan.annualPrice ?? plan.price,
    actionLabel: plan.cta,
    href: plan.href,
    highlighted: plan.popular,
  }));

  return (
    <main className={`${styles.page} os-site`}>
      <section className={styles.hero}>
        <MarketingHeader lang={lang} onLangChange={setLang} />
        <div className={`${styles.heroInner} os-public-content-guide`}>
          <SectionReveal>
            <div className={styles.heroCopy}>
              <p className={`${styles.eyebrow} os-type-eyebrow`}><span />{t.hero.eyebrow}</p>
              <h1 className={`${styles.heroTitle} os-type-h1`}>
                {t.hero.title.map((line) => <span key={line}>{line}</span>)}
              </h1>
              <p className={`${styles.heroLead} os-type-supporting`}>{t.hero.lead}</p>
            </div>
          </SectionReveal>
        </div>
      </section>

      <Pricing6
        plans={plans}
        heading={t.plansHeading}
        supporting={t.plansSupporting}
        includedLabel={t.planLabels.included}
        storageLabel={t.planLabels.storage}
        billing={{
          cycle,
          monthlyLabel: t.billing.monthly,
          annualLabel: t.billing.annual,
          priceUnitLabel: t.billing.priceUnit,
          annualNote: t.billing.annualNote,
          annualTotalLabel: t.billing.annualTotal,
          ariaLabel: t.billing.ariaLabel,
          onCycleChange: setCycle,
        }}
      />

      <Pricing8
        title={t.comparison.title}
        tiers={tiers}
        sections={comparisonSections}
        yesLabel={t.comparison.yesLabel}
        noLabel={t.comparison.noLabel}
        priceUnitLabel={t.comparison.priceUnitLabel}
        annualPriceLabel={t.comparison.annualPriceLabel}
      />

      <section className={styles.designSection} aria-labelledby="pricing-design-heading">
        <div className="os-public-content-guide">
          <SectionReveal>
            <div className={styles.designIntro}>
              <div>
                <p className={`${styles.designEyebrow} os-type-eyebrow`}><span />{t.design.eyebrow}</p>
                <h2 id="pricing-design-heading" className={`${styles.designTitle} os-type-h2`}>{t.design.title}</h2>
              </div>
              <div className={styles.designCopy}>
                <p className={`${styles.designLead} os-type-supporting`}>{t.design.body}</p>
                <p className={styles.designPrice}>{pricingConfig.design.price} {t.design.priceSuffix}</p>
                <p className={`${styles.designTagline} os-type-action`}>{t.design.tagline}</p>
                <p className={`${styles.designNote} os-type-card-body`}>{t.design.note}</p>
                <Link className={`${styles.outlineCta} os-type-action`} href="/components">
                  {t.design.cta}<ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </SectionReveal>

          <SectionReveal>
            <div className={styles.designGrid}>
              {t.design.items.map((item, index) => (
                <article className={styles.designCard} key={item.label}>
                  <span className={`${styles.designCardIndex} os-type-micro`}>{String(index + 1).padStart(2, "0")}</span>
                  <h3 className={`${styles.designCardLabel} os-type-action`}>{item.label}</h3>
                  <p className={`${styles.designCardDescription} os-type-card-body`}>{item.description}</p>
                </article>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className={styles.faqSection} aria-labelledby="pricing-faq-heading">
        <div className="os-public-content-guide">
          <SectionReveal>
            <div className={styles.faqIntro}>
              <div>
                <p className={`${styles.sectionEyebrow} os-type-eyebrow`}><span />{t.faq.eyebrow}</p>
                <h2 id="pricing-faq-heading" className={`${styles.sectionTitle} os-type-h2`}>{t.faq.title}</h2>
              </div>
            </div>
          </SectionReveal>

          <FAQ3 lang={lang} items={t.faq.items} compact compactAriaLabel={t.faq.compactAriaLabel} />

          <div className={styles.faqFooter}>
            <Link className={`${styles.faqMore} os-type-action`} href="/faq">
              {t.faq.more}
            </Link>
          </div>
        </div>
      </section>

      <OneStudioFooter lang={lang} />
    </main>
  );
}
