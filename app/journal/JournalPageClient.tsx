"use client";

import MarketingHeader from "@/components/marketing/MarketingHeader";
import { OneStudioFooter } from "@/components/marketing/OneStudioFooter";
import { OneStudioUpdatesHistory } from "@/components/marketing/OneStudioUpdatesHistory";
import { SectionReveal } from "@/components/marketing/SectionReveal";
import { getJournalUiCopy } from "@/lib/i18n/journal";
import { useLocale } from "@/lib/i18n/use-locale";
import styles from "./page.module.css";

export default function JournalPageClient() {
  const [lang, setLang] = useLocale();
  const copy = getJournalUiCopy(lang);

  return (
    <main className={`${styles.page} os-site`}>
      <section className={styles.hero}>
        <MarketingHeader lang={lang} onLangChange={setLang} inFlow />

        <div className={styles.heroInner}>
          <SectionReveal>
            <p className={`${styles.eyebrow} os-type-eyebrow`}><span />{copy.eyebrow}</p>
            <h1 className={styles.heroTitle}>
              <span className={styles.journalName}>{copy.name}</span>
              <span className="os-type-h1">{copy.headline}</span>
            </h1>
            <p className={`${styles.heroLead} os-type-supporting`}>{copy.lead}</p>
          </SectionReveal>
        </div>
      </section>

      <OneStudioUpdatesHistory lang={lang} />
      <OneStudioFooter lang={lang} />
    </main>
  );
}
