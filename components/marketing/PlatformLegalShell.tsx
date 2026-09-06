import type { ReactNode } from "react";
import { getTranslations } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import MarketingHeader from "./MarketingHeader";
import { OneStudioFooter } from "./OneStudioFooter";
import styles from "./PlatformLegalShell.module.css";

type PlatformLegalShellProps = {
  eyebrow: string;
  title: string;
  intro: string;
  updatedAt: string;
  lang: Locale;
  onLangChange: (locale: Locale) => void;
  children: ReactNode;
};

export default function PlatformLegalShell({
  eyebrow,
  title,
  intro,
  updatedAt,
  lang,
  onLangChange,
  children,
}: PlatformLegalShellProps) {
  const t = getTranslations(lang).common;
  return (
    <main className={`${styles.page} os-site`}>
      <MarketingHeader
        lang={lang}
        onLangChange={onLangChange}
        inFlow
        languageTone="light"
      />

      <article className={styles.article}>
        <p className={`${styles.eyebrow} os-type-eyebrow`}>
          {eyebrow}
        </p>
        <h1 className={`${styles.title} os-type-h1`}>{title}</h1>
        <p className={`${styles.intro} os-type-supporting`}>
          {intro}
        </p>
        <p className={`${styles.updated} os-type-micro`}>{t.legal.lastUpdated}: {updatedAt}</p>

        <div className={styles.content}>
          {children}
        </div>

        <div className={styles.contactRow}>
          <span>OneStudio OS</span>
          <a href="mailto:hello@onestudioos.com">hello@onestudioos.com</a>
        </div>
      </article>

      <OneStudioFooter lang={lang} />
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h2 className={`${styles.sectionTitle} os-type-card-title`}>{title}</h2>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}
