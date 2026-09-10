"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { OneStudioFooter } from "@/components/marketing/OneStudioFooter";
import { SectionReveal } from "@/components/marketing/SectionReveal";
import { formatGuideCount, formatGuideDate, getGuidesUiCopy } from "@/lib/i18n/guides";
import { useLocale } from "@/lib/i18n/use-locale";
import type {
  GuideArticleSummary,
  GuideCategory,
} from "@/lib/seo/guide-articles";
import styles from "./page.module.css";

const PAGE_SIZE = 9;

type GuidesPageClientProps = {
  articles: readonly GuideArticleSummary[];
  categories: readonly GuideCategory[];
};

export default function GuidesPageClient({
  articles,
  categories,
}: GuidesPageClientProps) {
  const [lang, setLang] = useLocale();
  const [selectedCategory, setSelectedCategory] = useState<GuideCategory | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const copy = getGuidesUiCopy(lang);
  const filteredArticles = useMemo(
    () => selectedCategory
      ? articles.filter((article) => article.primaryCategory === selectedCategory)
      : articles,
    [articles, selectedCategory],
  );
  const visibleArticles = filteredArticles.slice(0, visibleCount);

  const chooseCategory = (category: GuideCategory | null) => {
    setSelectedCategory(category);
    setVisibleCount(PAGE_SIZE);
  };

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

      <section className={styles.library} aria-labelledby="guides-library-heading">
        <div className={styles.libraryInner}>
          <SectionReveal amount={0.05}>
            <div className={styles.libraryHeader}>
              <div>
                <h2 id="guides-library-heading" className="os-type-h2">{copy.libraryTitle}</h2>
                <p className="os-type-supporting">{copy.libraryLead}</p>
              </div>
              <span className={`${styles.count} os-type-micro`} aria-live="polite">
                {formatGuideCount(filteredArticles.length, lang)}
              </span>
            </div>

            <div className={styles.filters} aria-label={copy.libraryTitle}>
              <button
                type="button"
                className={selectedCategory === null ? styles.filterActive : undefined}
                aria-pressed={selectedCategory === null}
                onClick={() => chooseCategory(null)}
              >
                {copy.allCategories}
              </button>
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={selectedCategory === category ? styles.filterActive : undefined}
                  aria-pressed={selectedCategory === category}
                  onClick={() => chooseCategory(category)}
                >
                  {copy.categoryLabels[category]}
                </button>
              ))}
            </div>

            <div className={styles.grid}>
              {visibleArticles.map((article, index) => {
                const category = article.primaryCategory;
                return (
                  <article className={styles.card} key={article.slug}>
                    <Link href={article.path} aria-label={`${copy.readArticle}: ${article.title}`}>
                      <div className={styles.cardTop}>
                        <span className={styles.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
                        <span className={styles.cardCategory}>
                          {category ? copy.categoryLabels[category] : article.category}
                        </span>
                      </div>
                      <h3>{article.title}</h3>
                      <p>{article.excerpt}</p>
                      <div className={styles.cardFoot}>
                        <time dateTime={article.publishedAt}>{formatGuideDate(article.publishedAt, lang)}</time>
                        <span>{copy.readArticle}<b aria-hidden="true">↗</b></span>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>

            {visibleCount < filteredArticles.length ? (
              <div className={styles.loadMoreRow}>
                <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                  {copy.loadMore}
                  <span aria-hidden="true">↓</span>
                </button>
              </div>
            ) : null}
          </SectionReveal>
        </div>
      </section>

      <OneStudioFooter lang={lang} />
    </main>
  );
}
