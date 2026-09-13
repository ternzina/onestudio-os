"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { OneStudioFooter } from "@/components/marketing/OneStudioFooter";
import { SectionReveal } from "@/components/marketing/SectionReveal";
import { type Locale } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/use-locale";
import {
  PUBLIC_COMPONENT_CATEGORIES,
  publicComponentCatalog,
  type PublicComponentCategory,
  type PublicComponentFamily,
  type PublicComponentVariant,
} from "@/lib/public-component-catalog";
import PublicComponentPreview from "./PublicComponentPreview";
import styles from "./page.module.css";

type Filter = "all" | PublicComponentCategory;

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

const totalVariantCount = publicComponentCatalog.reduce(
  (total, family) => total + family.variants.length,
  0,
);

function categoryLabel(category: PublicComponentCategory) {
  return category;
}

export default function ComponentsPageClient() {
  const [lang, setLang] = useLocale();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [activeFamily, setActiveFamily] = useState<PublicComponentFamily | null>(null);
  const [activeItem, setActiveItem] = useState<PublicComponentVariant | null>(null);
  const deferredQuery = useDeferredValue(query);
  const t = getTranslations(lang).components.page;
  const searchPlaceholder = searchPlaceholders[lang];
  const categories = PUBLIC_COMPONENT_CATEGORIES.filter((category) =>
    publicComponentCatalog.some((family) => family.category === category),
  );

  useEffect(() => {
    if (!activeFamily || !activeItem) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveFamily(null);
        setActiveItem(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeFamily, activeItem]);

  const filteredFamilies = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    const byCategory = filter === "all"
      ? publicComponentCatalog
      : publicComponentCatalog.filter((family) => family.category === filter);

    if (!normalizedQuery) return byCategory;

    return byCategory.filter((family) => {
      const familyText = [
        family.name,
        family.id,
        family.category,
        ...family.variants.flatMap((variant) => [variant.label, variant.officialSlug, variant.taxonomy]),
      ].join(" ").toLowerCase();

      return familyText.includes(normalizedQuery);
    });
  }, [deferredQuery, filter]);

  const filteredVariantCount = useMemo(
    () =>
      filteredFamilies.reduce(
        (total, family) => total + family.variants.length,
        0,
      ),
    [filteredFamilies],
  );

  const closePreview = () => {
    setActiveFamily(null);
    setActiveItem(null);
  };

  const openFamily = (family: PublicComponentFamily) => {
    setActiveFamily(family);
    setActiveItem(family.defaultVariant);
  };

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
              <span>{t.componentsCountLabel} · {filteredFamilies.length}</span>
              <span aria-hidden="true">/</span>
              <span>{t.variantsCountLabel} · {filteredVariantCount}</span>
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
              <small>{publicComponentCatalog.length}</small>
            </button>
            {categories.map((category) => {
              const count = publicComponentCatalog.filter((family) => family.category === category).length;

              return (
                <button
                  type="button"
                  className={filter === category ? styles.categoryActive : ""}
                  aria-pressed={filter === category}
                  onClick={() => setFilter(category)}
                  key={category}
                >
                  <span>{categoryLabel(category)}</span>
                  <small>{count}</small>
                </button>
              );
            })}
          </div>

          <div className={styles.grid} key={filter}>
            {filteredFamilies.map((family, index) => {
              const item = family.defaultVariant;

              return (
                <article className={styles.card} key={family.id}>
                  <div className={styles.previewFrame}>
                    <PublicComponentPreview variant={item} />

                    <span className={`${styles.previewMeta} os-type-micro`}>
                      {t.previewLabel} · {String(index + 1).padStart(2, "0")}
                    </span>

                    {family.variants.length > 1 ? (
                      <span className={`${styles.variantBadge} os-type-micro`}>
                        {t.variantsCountLabel} · {family.variants.length}
                      </span>
                    ) : null}
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardHeading}>
                      <p className={`${styles.cardCategory} os-type-micro`}>
                        {categoryLabel(family.category)}
                      </p>
                      <h3>{family.name}</h3>
                    </div>

                    <p className={styles.description}>
                      {item.taxonomy} · {item.sourceTier}
                    </p>

                    <div className={styles.cardFooter}>
                      <div className={styles.cardFooterMeta}>
                        <code>{family.id}</code>

                        {family.variants.length > 1 ? (
                          <span className={`${styles.cardVariantCount} os-type-micro`}>
                            {t.variantsCountLabel} · {family.variants.length}
                          </span>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        className={styles.previewButton}
                        onClick={() => openFamily(family)}
                      >
                        <span>{t.openPreview}</span>
                        <span aria-hidden="true">↗</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {activeFamily && activeItem ? (
        <div
          className={styles.previewModal}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePreview();
            }
          }}
        >
          <article
            className={styles.previewModalPanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="component-preview-title"
          >
            <header className={styles.previewModalHeader}>
              <div>
                <p className={`${styles.modalCategory} os-type-micro`}>
                  {categoryLabel(activeFamily.category)}
                </p>
                <h2 id="component-preview-title">{activeFamily.name}</h2>
              </div>

              <button
                type="button"
                className={styles.modalClose}
                onClick={closePreview}
                aria-label={t.closePreview}
                autoFocus
              >
                <span aria-hidden="true">×</span>
              </button>
            </header>

            {activeFamily.variants.length > 1 ? (
              <div
                className={styles.variantRail}
                role="group"
                aria-label={t.variantsHeading}
              >
                <span className={`${styles.variantRailLabel} os-type-micro`}>
                  {t.variantsHeading}
                </span>

                <div className={styles.variantButtons}>
                  {activeFamily.variants.map((variant) => (
                    <button
                      type="button"
                      key={variant.id}
                      className={
                        activeItem.id === variant.id
                          ? styles.variantButtonActive
                          : styles.variantButton
                      }
                      aria-pressed={activeItem.id === variant.id}
                      onClick={() => setActiveItem(variant)}
                    >
                      {variant.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className={styles.previewModalStage} key={activeItem.id}>
              <PublicComponentPreview variant={activeItem} />
            </div>

            <footer className={styles.previewModalCopy}>
              <div>
                {activeFamily.variants.length > 1 ? (
                  <span className={`${styles.activeVariantLabel} os-type-micro`}>
                    {t.variantsCountLabel} · {activeItem.label}
                  </span>
                ) : null}

                <p>
                  {activeItem.taxonomy} · {activeItem.sourceTier}
                </p>
              </div>

              <code>{activeItem.officialSlug}</code>
            </footer>
          </article>
        </div>
      ) : null}

      <OneStudioFooter lang={lang} />
    </main>
  );
}
