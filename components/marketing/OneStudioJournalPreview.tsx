import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { formatJournalDate, getJournalUiCopy } from "@/lib/i18n/journal";
import type { JournalArticleSummary } from "@/lib/seo/journal-articles";
import { SectionReveal } from "./SectionReveal";
import styles from "./OneStudioJournalPreview.module.css";

type OneStudioJournalPreviewProps = {
  articles: readonly JournalArticleSummary[];
  lang: Locale;
};

export function OneStudioJournalPreview({
  articles,
  lang,
}: OneStudioJournalPreviewProps) {
  const copy = getJournalUiCopy(lang);
  const latestArticles = articles.slice(0, 3);

  return (
    <section className={styles.section} aria-labelledby="home-journal-heading">
      <SectionReveal amount={0.06}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <div>
              <p className={`${styles.eyebrow} os-type-eyebrow`}><span />{copy.homepage.eyebrow}</p>
              <h2 id="home-journal-heading" className="os-type-h2">{copy.homepage.title}</h2>
            </div>
            <span className={styles.monogram} aria-hidden="true">J / 01</span>
          </div>

          <div className={styles.grid}>
            {latestArticles.map((article) => {
              const category = article.topics[0];
              return (
                <article className={styles.card} key={article.slug}>
                  <Link href={article.path} aria-label={`${copy.readArticle}: ${article.title}`}>
                    <div className={styles.meta}>
                      <span>{category ? copy.categoryLabels[category] : article.category}</span>
                      <time dateTime={article.publishedAt}>{formatJournalDate(article.publishedAt, lang)}</time>
                    </div>
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                    <div className={styles.action}>
                      <span>{copy.readArticle}</span>
                      <b aria-hidden="true">↗</b>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>

          <div className={styles.footer}>
            <Link href="/journal" className="os-type-action">
              {copy.homepage.viewAll}<span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}

export default OneStudioJournalPreview;
