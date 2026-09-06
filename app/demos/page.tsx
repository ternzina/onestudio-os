"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState, type ReactNode } from "react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { OneStudioFooter } from "@/components/marketing/OneStudioFooter";
import {
  getPublicDemoTemplateChoices,
  groupTemplatesByAccess,
  newSitePathForTemplate,
  templateAccessLabel,
} from "@/lib/public-site/template-catalog";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/use-locale";
import styles from "./DemosPage.module.css";

type DemoGroup = "studio" | "beauty" | "wellness" | "education" | "events" | "business";
type Filter = "all" | DemoGroup;
type DemoTemplateCopy = { title: string; description: string; alt: string };

type RevealDirection = "up" | "left" | "right";

function DemosReveal({
  children,
  className,
  as = "div",
  delay = 0,
  direction = "up",
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
  delay?: number;
  direction?: RevealDirection;
  ariaLabel?: string;
}) {
  const reduced = useReducedMotion();
  const Component = as === "section" ? motion.section : motion.div;
  const offset =
    direction === "left"
      ? { x: -54, y: 0 }
      : direction === "right"
        ? { x: 54, y: 0 }
        : { x: 0, y: 42 };

  return (
    <Component
      className={className}
      aria-label={ariaLabel}
      initial={reduced ? false : { opacity: 0, ...offset }}
      whileInView={reduced ? undefined : { opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Component>
  );
}

function DemosCardReveal({
  children,
  index,
}: {
  children: ReactNode;
  index: number;
}) {
  const reduced = useReducedMotion();
  const entrances = [
    { x: -90, y: 55, rotate: -2.5 },
    { x: 75, y: 125, rotate: 2.5 },
    { x: 120, y: 70, rotate: 1.5 },
  ];

  return (
    <motion.div
      className={styles.revealItem}
      initial={
        reduced
          ? false
          : { opacity: 0, ...entrances[index % entrances.length] }
      }
      whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{
        duration: 1.05,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export default function DemosPage() {
  const [lang, setLang] = useLocale();
  const [filter, setFilter] = useState<Filter>("all");
  const t = getTranslations(lang).demos;
  const templateCopy = (key: string): DemoTemplateCopy => {
    const copy = (t.templates as unknown as Record<string, DemoTemplateCopy>)[key];
    if (!copy) throw new Error(`Missing public demo translation: ${key}`);
    return copy;
  };
  const accessLabel = (access: "free" | "premium") =>
    t.access[access] || templateAccessLabel(access, lang === "ru" ? "ru" : "en");
  const previewRoute = (route: string | null, key: string) => {
    if (!route) throw new Error(`Missing public demo preview route: ${key}`);
    return route;
  };
  const templates = useMemo(
    () => getPublicDemoTemplateChoices().filter(
      (template) => filter === "all" || template.gallery.group === filter,
    ),
    [filter],
  );
  const templateGroups = groupTemplatesByAccess(templates);
  const freeTemplates = templateGroups.free;
  const premiumTemplates = templateGroups.premium;

  return (
    <main className={`${styles.page} os-site`}>
      <section className={styles.hero}>
        <MarketingHeader lang={lang} onLangChange={setLang} inFlow />

        <DemosReveal className={styles.intro}>
          <div>
            <p className={`${styles.eyebrow} os-type-eyebrow`}><span />{t.eyebrow}</p>
            <h1 className={`${styles.introTitle} os-type-h1`}>{t.titleBefore}<br /><strong>{t.titleAccent}</strong></h1>
          </div>
          <p className={`${styles.introText} os-type-supporting`}>{t.lead}</p>
        </DemosReveal>
      </section>

      <DemosReveal
        className={styles.filters}
        ariaLabel={t.filtersLabel}
      >
        {(Object.entries(t.filters) as Array<[Filter, string]>).map(([value, label]) => (
          <button
            type="button"
            className={filter === value ? styles.active : ""}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            key={value}
          >
            {label}
          </button>
        ))}
      </DemosReveal>

      {premiumTemplates.length > 0 ? (
        <section className={styles.premium} aria-labelledby="premium-collection-title">
          <DemosReveal className={styles.premiumHeading}>
            <p className={styles.premiumEyebrow}>01 / {t.premiumEyebrow}</p>
            <div>
              <h2 id="premium-collection-title">{t.premiumEyebrow}</h2>
              <p>{t.premiumLead}</p>
            </div>
          </DemosReveal>
          <div className={styles.premiumGrid}>
            {premiumTemplates.map((template, index) => (
              <DemosCardReveal index={index} key={template.key}>
                <article className={styles.premiumCard} data-premium={template.key}>
                  <Link className={styles.premiumVisual} href={previewRoute(template.gallery.previewRoute, template.key)} aria-label={`${t.premiumView}: ${template.name}`}>
                    {template.gallery.previewImage ? (
                      <Image
                        src={template.gallery.previewImage}
                        alt={templateCopy(template.key).alt}
                        fill
                        sizes="(max-width: 699px) calc(100vw - 64px), (max-width: 1179px) calc(50vw - 64px), calc(33.333vw - 64px)"
                      />
                    ) : (
                      <div className={styles.visualFallback}>{template.name}</div>
                    )}
                    <span aria-hidden="true">{template.name.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase()} / {String(index + 1).padStart(2, "0")}</span>
                  </Link>
                  <div className={styles.premiumCopy}>
                    <div className={styles.premiumMeta}>
                      <span>{accessLabel(template.access)}</span>
                      <span>{templateCopy(template.key).title}</span>
                    </div>
                    <div>
                      <h3>{template.name}</h3>
                      <p>{templateCopy(template.key).description}</p>
                    </div>
                    <div className={styles.premiumActions}>
                      <Link className={styles.premiumAction} href={previewRoute(template.gallery.previewRoute, template.key)}>{t.premiumView} <span aria-hidden="true">↗</span></Link>
                      <Link className={styles.premiumAction} href={newSitePathForTemplate(template.key)}>{t.configure}</Link>
                    </div>
                  </div>
                </article>
              </DemosCardReveal>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.grid}>
        {freeTemplates.map((template, index) => (
          <DemosCardReveal index={index} key={template.key}>
            <article className={styles.card}>
              <Link className={styles.previewLink} href={previewRoute(template.gallery.previewRoute, template.key)}>
                <div className={styles.previewFrame}>
                  {template.gallery.previewImage ? (
                    <Image src={template.gallery.previewImage} alt={templateCopy(template.key).alt} fill className={styles.previewImage} sizes="(max-width: 699px) calc(100vw - 44px), (max-width: 1179px) calc(50vw - 40px), calc(33.333vw - 40px)" />
                  ) : <div className={styles.visualFallback}>{template.name}</div>}
                </div>
              </Link>
              <div className={styles.cardInfo}>
                <div>
                  <p className={styles.kind}>{accessLabel(template.access)} · {templateCopy(template.key).title}</p>
                  <h2>{template.name}</h2>
                  <p className={styles.description}>{templateCopy(template.key).description}</p>
                </div>
                <div className={styles.actions}>
                  <Link href={previewRoute(template.gallery.previewRoute, template.key)}>{t.view}</Link>
                  <Link href={newSitePathForTemplate(template.key)}>{t.configure} ↗</Link>
                </div>
              </div>
            </article>
          </DemosCardReveal>
        ))}
      </section>

      <OneStudioFooter lang={lang} />
    </main>
  );
}
