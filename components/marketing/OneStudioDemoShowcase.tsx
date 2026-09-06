"use client";

import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { SectionReveal } from "./SectionReveal";
import styles from "./OneStudioDemoShowcase.module.css";

function renderAccentTitle(title: string, accent: string) {
  const start = title.indexOf(accent);
  return start < 0 ? title : <>{title.slice(0, start)}<strong>{accent}</strong>{title.slice(start + accent.length)}</>;
}

export function OneStudioDemoShowcase({ lang }: { lang: Locale }) {
  const t = getTranslations(lang).home.demoShowcase;

  return <section className={styles.section} aria-labelledby="ready-designs-title">
    <div className="os-public-content-guide-wide">
      <SectionReveal>
        <div className={styles.layout}>
          <div className={styles.visualColumn}>
            <div className={styles.visualFrame}>
              <Image src="/images/landing/block5-site-stack.webp" alt={t.imageAlt} fill sizes="(max-width: 1050px) 100vw, 55vw" priority />
            </div>
          </div>

          <div className={styles.copyColumn}>
            <p className={`os-type-eyebrow ${styles.eyebrow}`}>{t.eyebrow}</p>
            <h2 id="ready-designs-title" className="os-type-h2">{renderAccentTitle(t.title, t.accent)}</h2>
            <p className={`os-type-supporting ${styles.supporting}`}>{t.supporting}</p>
            <p className={`os-type-micro ${styles.microline}`}>{t.microline}</p>
            <p className={`os-type-micro ${styles.features}`}>{t.features}</p>
            <p className={`os-type-micro ${styles.note}`}>{t.note}</p>
            <div className={styles.actions}>
              <Link className="os-button primary os-type-action" href="/demos">{t.open}<b>↗</b></Link>
              <Link className={`os-type-action ${styles.allDemos}`} href="/demos">{t.all}<b>↗</b></Link>
            </div>
          </div>
        </div>
      </SectionReveal>
    </div>
  </section>;
}
