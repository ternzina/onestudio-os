"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import BlogPreview from "@/components/blog-previews/BlogPreview";
import type { BlogPreviewId } from "@/components/blog-previews/blog-preview-registry";
import type { Locale } from "@/lib/i18n/config";
import type { JournalUpdateTone } from "@/lib/journal/update-types";
import styles from "./blog-2.module.css";
import Link from "next/link";

export type Blog2Lang = Locale;
export type Blog2Tone = JournalUpdateTone;

export type Blog2Article = {
  id: string;
  componentId: BlogPreviewId;
  title: string;
  publishedAt: string;
  date: string;
  category: string;
  excerpt: string;
  tone?: Blog2Tone;
  href?: string;
};

export type Blog2Props = {
  headingId?: string;
  heading?: string;
  intro?: string;
  lang?: Blog2Lang;
  articles?: readonly Blog2Article[];
  articleNoteLabel?: string;
};

const pageVariants = {
  enter: { opacity: 0, x: 28 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -28 },
};

function Blog2CardReveal({
  children,
  index,
}: {
  children: ReactNode;
  index: number;
}) {
  const reduced = useReducedMotion();
  const entrances = [
    { x: -90, y: 55, rotate: -2.5 },
    { x: 75, y: 125, rotate: 2.5 },
    { x: 120, y: 70, rotate: 1.5 },
  ];

  return (
    <motion.article
      className={styles.revealItem}
      initial={reduced ? false : { opacity: 0, ...entrances[index % entrances.length] }}
      whileInView={reduced ? undefined : { opacity: 1, x: 0, y: 0, rotate: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{
        duration: 1.05,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.article>
  );
}

export function Blog2({
  headingId = "blog-2-heading",
  heading = "Recently published",
  intro,
  lang = "en",
  articles = [],
  articleNoteLabel = "Journal note",
}: Blog2Props = {}) {
  const reduced = useReducedMotion();
  const sortedArticles = [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <section className={styles.catalog} aria-labelledby={headingId}>
      <div className={styles.container}>
        <div className={styles.catalogHeader}>
          <div>
            <motion.h2
              id={headingId}
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.5 }}
              className={`${styles.heading} os-type-h2`}
            >
              {heading}
            </motion.h2>
            {intro ? <p className={`${styles.intro} os-type-supporting`}>{intro}</p> : null}
          </div>
          <span className={`${styles.count} os-type-micro`}>{sortedArticles.length.toString().padStart(2, "0")}</span>
        </div>

        <div className={styles.catalogRule}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={lang}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={reduced ? { duration: 0 } : { duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.grid}>
                {sortedArticles.map((article, index) => (
                  <Blog2CardReveal index={index} key={article.id}>
                    {article.href ? <Link href={article.href} className={styles.card} aria-label={`Read ${article.title}`}>
                      <div className={styles.cover}>
                        <BlogPreview componentId={article.componentId} title={article.title} />
                      </div>
                      <div className={styles.cardBody}>
                        <div className={styles.meta}><span>{article.category}</span><time dateTime={article.publishedAt}>{article.date}</time></div>
                        <h3>{article.title}</h3><p>{article.excerpt}</p>
                        <div className={styles.cardFoot}><span>{articleNoteLabel}</span><span className={styles.arrow} aria-hidden="true">↗</span></div>
                      </div>
                    </Link> : <div className={styles.card}>
                      <div className={styles.cover}>
                        <BlogPreview componentId={article.componentId} title={article.title} />
                      </div>

                      <div className={styles.cardBody}>
                        <div className={styles.meta}>
                          <span>{article.category}</span>
                          <time dateTime={article.publishedAt}>{article.date}</time>
                        </div>
                        <h3>{article.title}</h3>
                        <p>{article.excerpt}</p>
                        <div className={styles.cardFoot}>
                          <span>{articleNoteLabel}</span>
                          <span className={styles.arrow} aria-hidden="true">↗</span>
                        </div>
                      </div>
                    </div>}
                  </Blog2CardReveal>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default Blog2;
