"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getTranslations } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import styles from "./faq-3.module.css";

export type FAQ3Lang = Locale;

export type FAQ3Item = {
  question: string;
  answer: string;
};

export type FAQ3CategoryId = "foundation" | "setup" | "site" | "system";

export type FAQ3Category = {
  title: string;
  faqs: FAQ3Item[];
};

export type FAQ3Copy = {
  heading: string;
  categories: Array<{ id: FAQ3CategoryId; label: string }>;
  faqsByCategory: Record<FAQ3CategoryId, FAQ3Category>;
};


export default function FAQ3({
  lang = "ru",
  items,
  compact = false,
  compactAriaLabel,
}: {
  lang?: FAQ3Lang;
  items?: readonly FAQ3Item[];
  compact?: boolean;
  compactAriaLabel?: string;
}) {
  const t = getTranslations(lang).faq.content as FAQ3Copy;
  const compactLabel = compactAriaLabel ?? getTranslations(lang).pricing.faq.compactAriaLabel;
  const [selectedCategory, setSelectedCategory] = useState<FAQ3CategoryId>("foundation");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const currentCategory =
    t.faqsByCategory[selectedCategory];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleCategoryChange = (categoryId: FAQ3CategoryId) => {
    setSelectedCategory(categoryId);
    setOpenIndex(null);
  };

  if (compact && items) {
    return (
      <section className={styles.compactSection} aria-label={compactLabel}>
        <div className={styles.compactInner}>
          <div className={styles.faqList}>
            {items.map((faq, index) => (
              <div key={`compact-${faq.question}`} className={styles.item}>
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  id={`faq3-compact-question-${lang}-${index}`}
                  aria-expanded={openIndex === index}
                  aria-controls={`faq3-compact-${lang}-${index}`}
                  className={styles.questionButton}
                >
                  <span className={`${styles.question} os-type-card-body`}>{faq.question}</span>
                  <span className={styles.icon} aria-hidden="true">
                    {openIndex === index ? <Minus /> : <Plus />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                        opacity: { duration: 0.2, ease: "easeInOut" },
                      }}
                      id={`faq3-compact-${lang}-${index}`}
                      role="region"
                      aria-labelledby={`faq3-compact-question-${lang}-${index}`}
                      className={styles.answerMotion}
                    >
                      <div className={styles.answerInner}>
                        <p className={`${styles.answer} os-type-card-body`}>{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.categoryHeader}>
        <div className={styles.inner}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`${styles.heading} os-type-h2`}
          >
            {t.heading}
          </motion.h2>

          <div className={styles.categories}>
            {t.categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              >
                <button
                  type="button"
                  onClick={() => handleCategoryChange(category.id)}
                  aria-pressed={selectedCategory === category.id}
                  className={`${styles.categoryButton} ${selectedCategory === category.id ? styles.active : ""}`}
                >
                  {category.label}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.answerArea}>
        <div className={styles.inner}>
          <div className={styles.contentGrid}>
            <div className={styles.categoryTitleWrap}>
              <motion.h3
                key={selectedCategory}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className={`${styles.categoryTitle} os-type-card-title`}
              >
                {currentCategory.title}
              </motion.h3>
            </div>

            <div className={styles.faqList}>
              <div key={selectedCategory}>
                {currentCategory.faqs.map((faq, index) => (
                  <div
                    key={`${selectedCategory}-${index}`}
                    className={styles.item}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFAQ(index)}
                      id={`faq3-question-${lang}-${selectedCategory}-${index}`}
                      aria-expanded={openIndex === index}
                      aria-controls={`faq3-${lang}-${selectedCategory}-${index}`}
                      className={styles.questionButton}
                    >
                      <span className={`${styles.question} os-type-card-body`}>
                        {faq.question}
                      </span>
                      <span className={styles.icon} aria-hidden="true">
                        {openIndex === index ? (
                          <Minus />
                        ) : (
                          <Plus />
                        )}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {openIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            height: {
                              duration: 0.3,
                              ease: [0.4, 0, 0.2, 1],
                            },
                            opacity: { duration: 0.2, ease: "easeInOut" },
                          }}
                          id={`faq3-${lang}-${selectedCategory}-${index}`}
                          role="region"
                          aria-labelledby={`faq3-question-${lang}-${selectedCategory}-${index}`}
                          className={styles.answerMotion}
                        >
                          <div className={styles.answerInner}>
                            <p className={`${styles.answer} os-type-card-body`}>
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
