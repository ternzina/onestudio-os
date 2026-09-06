"use client";

import { Fragment } from "react";
import Link from "next/link";
import FeatureMediaFrame from "@/components/marketing/FeatureMediaFrame";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { OneStudioFooter } from "@/components/marketing/OneStudioFooter";
import { SectionReveal } from "@/components/marketing/SectionReveal";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/use-locale";
import styles from "./page.module.css";



function renderTitle(title: string) {
  return title.split("\n").map((line, index) => (
    <span key={line}>
      {line}
      {index < title.split("\n").length - 1 ? <br /> : null}
    </span>
  ));
}

export default function FeaturesPageClient() {
  const [lang, setLang] = useLocale();
  const t = getTranslations(lang).features;

  return (
    <main className={`${styles.page} os-site`}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <MarketingHeader lang={lang} onLangChange={setLang} inFlow />

        <div className={styles.heroInner}>
          <SectionReveal>
            <div className={styles.heroCopy}>
              <p className={`${styles.eyebrow} os-type-eyebrow`}><span />{t.hero.eyebrow}</p>
              <h1 className={`${styles.heroTitle} os-type-h1`}>{renderTitle(t.hero.title)}</h1>
              <p className={`${styles.heroLead} os-type-supporting`}>{t.hero.lead}</p>
              <p className={styles.heroLine}>{t.hero.line}</p>
            </div>
          </SectionReveal>

          <div className={styles.heroMedia}>
            <SectionReveal>
              <FeatureMediaFrame
                src="/images/features/admin-modules.webp"
                label={t.hero.mediaLabel}
                alt={t.hero.mediaAlt}
                caption={t.hero.mediaCaption}
                plannedPath="/images/features/admin-modules.webp"
                aspectRatio="1973 / 1329"
                priority
                openLabel={t.openScreenshot}
                closeLabel={t.closeScreenshot}
                lang={lang}
              />
            </SectionReveal>
          </div>
        </div>
      </section>

      <nav className={styles.quickNav} aria-label={t.quickLabel}>
        <div className={styles.quickNavInner}>
          <span className={styles.quickLabel}>{t.quickLabel}</span>
          <div className={styles.quickLinks}>
            {t.quickNav.map((item) => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}
          </div>
        </div>
      </nav>

      <div id="capabilities" className={styles.anchorAlias} aria-hidden="true" />

      <div className={styles.chapters}>
        {t.chapters.map((chapter, index) => {
          const media = chapter.media as {
            src?: string | null;
            plannedPath: string;
            label: string;
            alt: string;
            caption: string;
            aspectRatio?: string;
            supporting?: {
              src?: string | null;
              plannedPath: string;
              label: string;
              alt: string;
              caption: string;
              aspectRatio?: string;
            };
          };

          return (
          <Fragment key={chapter.id}>
          <section className={`${styles.chapter} ${index % 2 === 1 ? styles.chapterReverse : ""}`} id={chapter.id}>
            {chapter.id === "website" ? <span id="design-motion" className={styles.anchorAlias} aria-hidden="true" /> : null}
            <div className={styles.chapterInner}>
              <SectionReveal>
                <div className={styles.chapterCopy}>
                  <p className={`${styles.chapterEyebrow} os-type-eyebrow`}><span />{chapter.eyebrow}</p>
                  <h2 className={`${styles.chapterTitle} os-type-h2`}>{chapter.title}</h2>
                  <p className={`${styles.chapterBody} os-type-supporting`}>{chapter.body}</p>
                  <ul className={styles.capabilityList}>
                    {chapter.capabilities.map((capability) => <li key={capability}>{capability}</li>)}
                  </ul>
                </div>
              </SectionReveal>
              <div className={`${styles.chapterMedia} ${media.supporting ? styles.chapterMediaComposite : ""}`}>
                <div className={media.supporting ? styles.chapterMediaPrimary : undefined}>
                  <SectionReveal>
                    <FeatureMediaFrame
                      src={media.src}
                      label={media.label}
                      alt={media.alt}
                      caption={media.caption}
                      plannedPath={media.plannedPath}
                      aspectRatio={media.aspectRatio}
                      openLabel={t.openScreenshot}
                      closeLabel={t.closeScreenshot}
                      lang={lang}
                    />
                  </SectionReveal>
                </div>
                {media.supporting ? (
                  <div className={styles.chapterMediaSupporting}>
                    <SectionReveal>
                      <FeatureMediaFrame
                        src={media.supporting.src}
                        label={media.supporting.label}
                        alt={media.supporting.alt}
                        caption={media.supporting.caption}
                        plannedPath={media.supporting.plannedPath}
                        aspectRatio={media.supporting.aspectRatio}
                        openLabel={t.openScreenshot}
                        closeLabel={t.closeScreenshot}
                        lang={lang}
                      />
                    </SectionReveal>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
          {chapter.id === "booking" ? (
            <section className={styles.integrationHighlight} aria-labelledby="google-calendar-highlight-title">
              <div className={styles.integrationInner}>
                <SectionReveal>
                  <div className={styles.integrationCopy}>
                    <p className={`${styles.integrationEyebrow} os-type-eyebrow`}><span />{t.calendarHighlight.eyebrow}</p>
                    <h2 id="google-calendar-highlight-title" className={`${styles.integrationTitle} os-type-h2`}>{t.calendarHighlight.title}</h2>
                    <p className={`${styles.integrationBody} os-type-supporting`}>{t.calendarHighlight.body}</p>
                  </div>
                </SectionReveal>
                <div className={styles.integrationMedia}>
                  <SectionReveal>
                    <FeatureMediaFrame
                      src={t.calendarHighlight.media.src}
                      label={t.calendarHighlight.media.label}
                      alt={t.calendarHighlight.media.alt}
                      caption={t.calendarHighlight.media.caption}
                      plannedPath={t.calendarHighlight.media.plannedPath}
                      aspectRatio={t.calendarHighlight.media.aspectRatio}
                      openLabel={t.openScreenshot}
                      closeLabel={t.closeScreenshot}
                      lang={lang}
                    />
                  </SectionReveal>
                </div>
              </div>
            </section>
          ) : null}
          </Fragment>
          );
        })}
      </div>

      <section id="launch" className={styles.flowSection}>
        <div className={styles.flowInner}>
          <SectionReveal>
            <div className={styles.flowIntro}>
              <p className={`${styles.flowEyebrow} os-type-eyebrow`}><span />{t.flow.eyebrow}</p>
              <h2 className={`${styles.flowTitle} os-type-h2`}>{t.flow.title}</h2>
              <p className={`${styles.flowBody} os-type-supporting`}>{t.flow.body}</p>
            </div>
          </SectionReveal>

          <div className={styles.flowTrack} aria-label={t.flow.note}>
            {t.flow.stages.map((stage, index) => (
              <div className={styles.flowItem} key={stage.title}>
                <div className={styles.flowStage}>
                  <span className={styles.flowIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.flowDot} aria-hidden="true" />
                  <strong>{stage.title}</strong>
                  <small>{stage.detail}</small>
                </div>
                {index < t.flow.stages.length - 1 ? <span className={styles.flowArrow} aria-hidden="true">→</span> : null}
              </div>
            ))}
          </div>
          <p className={styles.flowNote}>{t.flow.note}</p>
          <div className={styles.flowMedia}>
            <SectionReveal>
              <FeatureMediaFrame
                src={t.flow.media.src}
                label={t.flow.media.label}
                alt={t.flow.media.alt}
                caption={t.flow.media.caption}
                plannedPath={t.flow.media.plannedPath}
                aspectRatio={t.flow.media.aspectRatio}
                openLabel={t.openScreenshot}
                closeLabel={t.closeScreenshot}
                lang={lang}
              />
            </SectionReveal>
          </div>
        </div>
      </section>

      <section className={styles.catalogSection}>
        <div className={styles.catalogInner}>
          <SectionReveal>
            <div className={styles.catalogIntro}>
              <p className={`${styles.catalogEyebrow} os-type-eyebrow`}><span />{t.catalog.eyebrow}</p>
              <h2 className={`${styles.catalogTitle} os-type-h2`}>{t.catalog.title}</h2>
            </div>
          </SectionReveal>
          <div className={styles.catalogGrid}>
            {t.catalog.groups.map((group) => (
              <SectionReveal key={group.title}>
                <article className={styles.catalogGroup}>
                  <h3 className="os-type-eyebrow">{group.title}</h3>
                  <ul>
                    {group.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </article>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <SectionReveal>
          <div className={styles.ctaInner}>
            <p className={`${styles.ctaEyebrow} os-type-eyebrow`}><span />{t.cta.eyebrow}</p>
            <h2 className={`${styles.ctaTitle} os-type-h2`}>{t.cta.title}</h2>
            <p className={`${styles.ctaBody} os-type-supporting`}>{t.cta.body}</p>
            <div className={styles.ctaActions}>
              <a className={`${styles.ctaPrimary} os-type-action`} href="mailto:hello@onestudioos.com">{t.cta.primary}<b>↗</b></a>
              <Link className={`${styles.ctaSecondary} os-type-action`} href="/faq">{t.cta.secondary}<b>→</b></Link>
            </div>
          </div>
        </SectionReveal>
      </section>

      <OneStudioFooter lang={lang} />
    </main>
  );
}
