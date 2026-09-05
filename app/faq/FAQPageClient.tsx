"use client";

import MarketingHeader from "@/components/marketing/MarketingHeader";
import FAQ3 from "@/components/marketing/public-blocks/faq-3";
import { OneStudioFooter } from "@/components/marketing/OneStudioFooter";
import { SectionReveal } from "@/components/marketing/SectionReveal";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/use-locale";
import styles from "./page.module.css";

export default function FAQPageClient() {
  const [lang, setLang] = useLocale();
  const t = getTranslations(lang).faq.page;

  return (
    <main className={`${styles.page} os-site`}>
      <section className={styles.hero}>
        <MarketingHeader lang={lang} onLangChange={setLang} inFlow />

        <div className={styles.heroInner}>
          <SectionReveal>
            <div className={styles.heroCopy}>
              <p className={`${styles.eyebrow} os-type-eyebrow`}><span />{t.eyebrow}</p>
              <h1 className={`${styles.heroTitle} os-type-h1`}>{t.title}</h1>
              <p className={`${styles.heroLead} os-type-supporting`}>{t.description}</p>
            </div>
          </SectionReveal>
        </div>
      </section>

      <SectionReveal>
        <FAQ3 lang={lang} />
      </SectionReveal>

      <section className={styles.contactSection}>
        <SectionReveal>
          <div className={styles.contactInner}>
            <h2 className={`${styles.contactTitle} os-type-h2`}>{t.contactTitle}</h2>
            <p className={`${styles.contactText} os-type-supporting`}>{t.contactText}</p>
            <a className={`${styles.contactAction} os-type-action`} href="mailto:hello@onestudioos.com">{t.contactAction}</a>
          </div>
        </SectionReveal>
      </section>

      <OneStudioFooter lang={lang} />
    </main>
  );
}
