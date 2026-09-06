"use client";

import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import Blog2, { type Blog2Article } from "@/components/marketing/public-blocks/blog-2";
import { OneStudioFooter } from "@/components/marketing/OneStudioFooter";
import { SectionReveal } from "@/components/marketing/SectionReveal";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/use-locale";
import styles from "./page.module.css";



export default function BlogPageClient() {
  const [lang, setLang] = useLocale();
  const t = getTranslations(lang).blog;
  const articles = t.articles as readonly Blog2Article[];

  return (
    <main className={`${styles.page} os-site`}>
      <section className={styles.hero}>
        <MarketingHeader lang={lang} onLangChange={setLang} inFlow />

        <div className={styles.heroInner}>
          <SectionReveal>
            <div className={styles.heroGrid}>
              <div>
                <p className={`${styles.eyebrow} os-type-eyebrow`}><span />{t.eyebrow}</p>
                <h1 className={`${styles.heroTitle} os-type-h1`}>{t.title}</h1>
              </div>
              <div className={styles.heroAside}>
                <p className={`${styles.heroLead} os-type-supporting`}>{t.lead}</p>
                <p className={styles.heroNote}><span>{t.updateCount}</span><i />{t.componentsLabel}<b>·</b>{t.dateNote}</p>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      <SectionReveal amount={0.01}>
        <Blog2
          articles={articles}
          heading={t.catalogTitle}
          intro={t.catalogLead}
          lang={lang}
          articleNoteLabel={t.articleNoteLabel}
        />
      </SectionReveal>

      <OneStudioFooter lang={lang} />
    </main>
  );
}
