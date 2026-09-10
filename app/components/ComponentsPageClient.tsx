"use client";

import { useDeferredValue, useMemo, useState } from "react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import {
  ComponentCatalogPreview,
  componentCatalogItems,
  type ComponentCategory,
} from "@/components/marketing/OneStudioMotionShowcase";
import { OneStudioFooter } from "@/components/marketing/OneStudioFooter";
import { SectionReveal } from "@/components/marketing/SectionReveal";
import { type Locale } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/use-locale";
import styles from "./page.module.css";

type Filter = "all" | ComponentCategory;

const categoryDefinitions: ReadonlyArray<{ id: ComponentCategory }> = [
  { id: "hero" },
  { id: "galleries" },
  { id: "social-proof" },
  { id: "forms" },
  { id: "motion" },
];

const searchPlaceholders: Record<Locale, string> = {
  ru: "Найти компонент…",
  en: "Search components…",
  uk: "Знайти компонент…",
  pl: "Szukaj komponentu…",
  de: "Komponente suchen…",
  es: "Buscar componente…",
  fr: "Rechercher un composant…",
  pt: "Pesquisar componente…",
};

const availableCategories = new Set(
  componentCatalogItems.flatMap((item) => item.categories),
);

function categoryLabel(category: ComponentCategory, lang: Locale) {
  return getTranslations(lang).components.categories[category];
}

export default function ComponentsPageClient() {
  const [lang, setLang] = useLocale();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const t = getTranslations(lang).components.page;
  const searchPlaceholder = searchPlaceholders[lang];
  const categories = categoryDefinitions.filter((category) => availableCategories.has(category.id));
  const filteredItems = useMemo(() => {
    const catalog = getTranslations(lang).components;
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const byCategory = filter === "all"
      ? componentCatalogItems
      : componentCatalogItems.filter((item) => item.categories.includes(filter));

    if (!normalizedQuery) return byCategory;

    return byCategory.filter((item) => {
      const copy = catalog.items[item.id];
      const haystack = [
        item.name,
        item.slug,
        copy.label,
        copy.description,
        ...item.categories.map((category) => catalog.categories[category]),
      ].join(" ").toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [deferredQuery, filter, lang]);

  return (
    <main className={`${styles.page} os-site`}>
      <section className={styles.hero}>
        <MarketingHeader lang={lang} onLangChange={setLang} inFlow />

        <div className={styles.heroInner}>
          <SectionReveal>
            <div className={styles.heroCopy}>
              <p className={`${styles.eyebrow} os-type-eyebrow`}><span />{t.eyebrow}</p>
              <h1 className={`${styles.heroTitle} os-type-h1`}>{t.titleBefore}<br /><strong>{t.titleAccent}</strong></h1>
              <p className={`${styles.heroLead} os-type-supporting`}>{t.lead}</p>
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className={styles.catalog} aria-labelledby="components-catalog-title">
        <div className={styles.catalogInner}>
          <SectionReveal>
            <div className={styles.catalogHeader}>
              <div>
                <p className={`${styles.catalogEyebrow} os-type-eyebrow`}>{t.catalogEyebrow}</p>
                <h2 id="components-catalog-title" className="os-type-h2">{t.catalogTitle}</h2>
              </div>
              <p className={`${styles.catalogLead} os-type-supporting`}>{t.catalogLead}</p>
            </div>
          </SectionReveal>

          <div className={styles.libraryToolbar}>
            <label className={styles.searchField}>
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <span className={`${styles.resultCount} os-type-micro`} aria-live="polite">
              {filteredItems.length} / {componentCatalogItems.length}
            </span>
          </div>

          <div className={styles.categoryBar} role="group" aria-label={t.categoryLabel}>
            <button
              type="button"
              className={filter === "all" ? styles.categoryActive : ""}
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
            >
              <span>{t.all}</span>
              <small>{componentCatalogItems.length}</small>
            </button>
            {categories.map((category) => {
              const count = componentCatalogItems.filter((item) => item.categories.includes(category.id)).length;

              return (
                <button
                  type="button"
                  className={filter === category.id ? styles.categoryActive : ""}
                  aria-pressed={filter === category.id}
                  onClick={() => setFilter(category.id)}
                  key={category.id}
                >
                  <span>{categoryLabel(category.id, lang)}</span>
                  <small>{count}</small>
                </button>
              );
            })}
          </div>

          <div className={styles.grid} key={filter}>
            {filteredItems.map((item, index) => (
              <article className={styles.card} key={item.id}>
                <div className={styles.previewFrame}>
                  <ComponentCatalogPreview item={item} loadingLabel={t.previewLabel} />
                  <span className={`${styles.previewMeta} os-type-micro`}>
                    {t.previewLabel} · {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardHeading}>
                    <p className={`${styles.cardCategory} os-type-micro`}>
                      {item.categories.map((category) => categoryLabel(category, lang)).join(" · ")}
                    </p>
                    <h3>{item.name}</h3>
                  </div>
                  <p className={styles.description}>
                    {getTranslations(lang).components.items[item.id].description}
                  </p>
                  <code>{item.slug}</code>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <OneStudioFooter lang={lang} />
    </main>
  );
}
