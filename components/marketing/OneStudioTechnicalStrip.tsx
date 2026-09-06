"use client";

import { SectionReveal } from "./SectionReveal";
import { getTranslations } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import styles from "./OneStudioTechnicalStrip.module.css";

export function OneStudioTechnicalStrip({ lang }: { lang: Locale }) {
  const t = getTranslations(lang).home.technical;

  return (
    <section
      id="technical"
      className={styles.section}
      aria-labelledby="technical-title"
    >
      <SectionReveal>
        <div className="os-public-content-guide">
          <div className={styles.intro}>
            <div className={styles.introMain}>
              <p className={`${styles.eyebrow} os-type-eyebrow`}><span />{t.eyebrow}</p>
              <h2 id="technical-title" className={`os-type-h2 ${styles.title}`}>
                {t.titleBefore}<span className={styles.titleAccent}>{t.titleAccent}.</span>
              </h2>
            </div>
            <p className={`${styles.supporting} os-type-supporting`}>{t.supporting}</p>
          </div>
        </div>

        <div className="os-public-content-guide-wide">
          <div className={styles.strip}>
            <div className={styles.stripHeader}>
              <span className={`${styles.systemLabel} os-type-micro`}>{t.systemLabel}</span>
              <div className={styles.statusVisual} aria-label={`${t.statusLabel}: ${t.online}`}>
                <span className={`${styles.statusLabel} os-type-micro`}>{t.statusLabel}</span>
                <span className={`${styles.domain} os-type-action`}>{t.domain}</span>
                <span className={`${styles.online} os-type-micro`}><i aria-hidden="true" />{t.online}</span>
              </div>
            </div>

            <div className={styles.itemArea}>
              <span className={styles.rail} aria-hidden="true"><i /></span>
              <ol className={styles.items}>
                {t.items.map((item) => (
                  <li
                    className={styles.item}
                    key={item.index}
                  >
                    <div className={styles.itemHeader}>
                      <span className={styles.itemNode} aria-hidden="true" />
                      <span className={`${styles.itemIndex} os-type-micro`}>{item.index}</span>
                      <strong className={`${styles.itemTitle} os-type-action`}>{item.title}</strong>
                    </div>
                    <p className={`${styles.itemCopy} os-type-card-body`}>{item.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}
