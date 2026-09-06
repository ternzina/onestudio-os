"use client";

import { localeNames, supportedLocales, type Locale } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n";
import styles from "./LanguageSwitcher.module.css";

export default function LanguageSwitcher({
  lang,
  onLangChange,
  tone = "dark",
}: {
  lang: Locale;
  onLangChange: (locale: Locale) => void;
  tone?: "light" | "dark";
}) {
  const label = getTranslations(lang).common.languageLabel;

  return (
    <details className={`${styles.switcher} ${tone === "light" ? styles.light : ""}`}>
      <summary aria-label={label}>
        <span>{localeNames[lang]}</span>
        <span className={styles.chevron} aria-hidden="true">⌄</span>
      </summary>
      <div className={styles.menu} role="menu" aria-label={label}>
        {supportedLocales.map((locale) => (
          <button
            key={locale}
            type="button"
            role="menuitemradio"
            aria-checked={lang === locale}
            className={lang === locale ? styles.active : ""}
            onClick={(event) => {
              onLangChange(locale);
              event.currentTarget.closest("details")?.removeAttribute("open");
            }}
          >
            {localeNames[locale]}
          </button>
        ))}
      </div>
    </details>
  );
}
