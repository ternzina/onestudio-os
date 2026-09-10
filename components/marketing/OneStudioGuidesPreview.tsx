import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { formatGuideDate, getGuidesUiCopy } from "@/lib/i18n/guides";
import type { GuideArticleSummary } from "@/lib/seo/guide-articles";
import { SectionReveal } from "./SectionReveal";
import styles from "./OneStudioGuidesPreview.module.css";

type OneStudioGuidesPreviewProps = {
  articles: readonly GuideArticleSummary[];
  lang: Locale;
};

export function OneStudioGuidesPreview({
  articles,
  lang,
}: OneStudioGuidesPreviewProps) {
  const copy = getGuidesUiCopy(lang);
  const [before, after] = copy.homepage.title.split(copy.homepage.accent);
  const latestArticles = articles.slice(0, 3);

  return (
    <section className={styles.section} aria-labelledby="home-guides-heading">
      <SectionReveal amount={0.06}>
        <div className="os-public-content-guide">
          <div className={styles.header}>
            <div>
              <p className={`${styles.eyebrow} os-type-eyebrow`}><span />{copy.homepage.eyebrow}</p>
              <h2 id="home-guides-heading" className="os-type-h2">{before}<strong className={styles.accent}>{copy.homepage.accent}</strong>{after}</h2>
            </div>
            <span className={`${styles.monogram} os-type-micro`} aria-hidden="true">G / 01</span>
          </div>

          <div className={styles.grid}>
            {latestArticles.map((article) => {
              const category = article.primaryCategory;
              return (
                <article className={styles.card} key={article.slug}>
                  <Link href={article.path} aria-label={`${copy.readArticle}: ${article.title}`}>
                    <div className={`${styles.meta} os-type-micro`}>
                      <span>{category ? copy.categoryLabels[category] : article.category}</span>
                      <time dateTime={article.publishedAt}>{formatGuideDate(article.publishedAt, lang)}</time>
                    </div>
                    <h3 className="os-type-card-title">{article.title}</h3>
                    <p className="os-type-card-body">{article.excerpt}</p>
                    <div className={`${styles.action} os-type-action`}>
                      <span>{copy.readArticle}</span>
                      <b aria-hidden="true">↗</b>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>

          <div className={styles.footer}>
            <Link href="/guides" className="os-type-action">
              {copy.homepage.viewAll}<span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}

export default OneStudioGuidesPreview;
