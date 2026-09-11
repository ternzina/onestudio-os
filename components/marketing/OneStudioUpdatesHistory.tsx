"use client";

import type { Locale } from "@/lib/i18n/config";
import { getJournalUpdates, getJournalUpdatesCopy } from "@/lib/journal/updates";
import Blog2 from "./public-blocks/blog-2";
import styles from "./OneStudioUpdatesHistory.module.css";

/** Keeps the original preview cards and their independent, computed update count. */
export function OneStudioUpdatesHistory({ lang }: { lang: Locale }) {
  const updates = getJournalUpdates(lang);
  const copy = getJournalUpdatesCopy(lang);

  return (
    <div className={styles.history}>
      <Blog2
        headingId="journal-updates-heading"
        heading={copy.title}
        intro={copy.lead}
        articles={updates}
        lang={lang}
      />
    </div>
  );
}
