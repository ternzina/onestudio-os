"use client";

import Link from "next/link";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/use-locale";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { OneStudioFooter } from "@/components/marketing/OneStudioFooter";
import { SectionReveal } from "@/components/marketing/SectionReveal";
import styles from "./page.module.css";



function TitleLines({ lines }: { lines: readonly string[] }) {
  return (
    <>
      {lines.map((line) => <span className={styles.titleLine} key={line}>{line}</span>)}
    </>
  );
}

function SectionEyebrow({ children }: { children: string }) {
  return <p className={`${styles.eyebrow} os-type-eyebrow`}><span />{children}</p>;
}

export default function AboutPageClient() {
  const [lang, setLang] = useLocale();
  const t = getTranslations(lang).about;

  return (
    <main className={`${styles.page} os-site`}>
      <section className={styles.hero}>
        <MarketingHeader lang={lang} onLangChange={setLang} inFlow />

        <div className={styles.heroInner}>
          <SectionReveal>
            <div className={styles.heroCopy}>
              <SectionEyebrow>{t.hero.eyebrow}</SectionEyebrow>
              <h1 className={`${styles.heroTitle} os-type-h1`}><TitleLines lines={t.hero.title} /></h1>
              <p className={`${styles.heroLead} os-type-supporting`}>{t.hero.lead}</p>
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className={`${styles.section} ${styles.ideaSection}`}>
        <SectionReveal>
          <div className="os-public-content-guide">
            <div className={styles.editorialSplit}>
              <div>
                <SectionEyebrow>{t.idea.eyebrow}</SectionEyebrow>
                <h2 className={`${styles.sectionTitle} os-type-h2`}><TitleLines lines={t.idea.title} /></h2>
              </div>
              <div className={styles.sectionBody}>
                {t.idea.paragraphs.map((paragraph) => <p className="os-type-supporting" key={paragraph}>{paragraph}</p>)}
                <p className={`${styles.note} os-type-micro`}><i aria-hidden="true" />{t.idea.note}</p>
              </div>
            </div>
          </div>
        </SectionReveal>
      </section>

      <section className={`${styles.section} ${styles.whySection}`}>
        <SectionReveal>
          <div className="os-public-content-guide">
            <div className={styles.whyGrid}>
              <div className={styles.whyIntro}>
                <SectionEyebrow>{t.why.eyebrow}</SectionEyebrow>
                <h2 className={`${styles.sectionTitle} os-type-h2`}><TitleLines lines={t.why.title} /></h2>
                <p className={`${styles.introCopy} os-type-supporting`}>{t.why.intro}</p>
              </div>
              <div className={styles.problemPanel}>
                <p className={`${styles.miniLabel} os-type-eyebrow`}>{t.why.problemLabel}</p>
                <ul>
                  {t.why.problemItems.map((item, index) => <li key={item}><span>0{index + 1}</span>{item}</li>)}
                </ul>
              </div>
              <div className={styles.whyExplanation}>
                <p className="os-type-supporting">{t.why.body}</p>
              </div>
              <div className={styles.connectionVisual} aria-label={t.why.visualLabel}>
                <div className={styles.connectionLine} aria-hidden="true" />
                <div className={styles.connectionCore}>
                  <span>{t.why.visualLabel}</span>
                  <strong>OneStudio</strong>
                </div>
                {t.why.visualItems.map((item, index) => (
                  <div className={styles.connectionNode} data-index={index} key={item}>
                    <span>0{index + 1}</span>{item}
                  </div>
                ))}
                <p className={`${styles.visualCaption} os-type-micro`}>{t.why.visualCaption}</p>
              </div>
            </div>
          </div>
        </SectionReveal>
      </section>

      <section className={`${styles.section} ${styles.modularitySection}`}>
        <SectionReveal>
          <div className="os-public-content-guide">
            <div className={styles.modularityGrid}>
              <div className={styles.modularityCopy}>
                <SectionEyebrow>{t.modularity.eyebrow}</SectionEyebrow>
                <h2 className={`${styles.sectionTitle} os-type-h2`}><TitleLines lines={t.modularity.title} /></h2>
                <p className="os-type-supporting">{t.modularity.body}</p>
                <p className={`${styles.note} os-type-micro`}><i aria-hidden="true" />{t.modularity.note}</p>
              </div>
              <div className={styles.moduleStage} aria-label={t.modularity.visualLabel}>
                <div className={styles.moduleOrbit} aria-hidden="true" />
                <div className={styles.moduleCore}>
                  <span>ONE</span>
                  <strong>STUDIO</strong>
                  <small>{t.modularity.coreLabel}</small>
                </div>
                <div className={styles.moduleList}>
                  {t.modularity.modules.map((module, index) => (
                    <div className={styles.module} data-index={index} key={module}>
                      <span className={styles.moduleIndex}>0{index + 1}</span>
                      <span>{module}</span>
                    </div>
                  ))}
                </div>
                <span className={`${styles.stageLabel} os-type-micro`}>{t.modularity.visualLabel}</span>
              </div>
            </div>
          </div>
        </SectionReveal>
      </section>

      <section className={`${styles.section} ${styles.designSection}`}>
        <SectionReveal>
          <div className="os-public-content-guide">
            <div className={styles.designIntro}>
              <SectionEyebrow>{t.design.eyebrow}</SectionEyebrow>
              <h2 className={`${styles.sectionTitle} os-type-h2`}><TitleLines lines={t.design.title} /></h2>
              <p className={`${styles.designBody} os-type-supporting`}>{t.design.body}</p>
            </div>
            <div className={styles.designCards}>
              {t.design.cards.map((card, index) => {
                const content = (
                  <>
                    <div className={styles.cardTopline}>
                      <span className="os-type-eyebrow">0{index + 1}</span>
                      <span className={`${styles.cardLabel} os-type-eyebrow`}>{card.label}</span>
                    </div>
                    <h3 className="os-type-card-title">{card.title}</h3>
                    <p className="os-type-card-body">{card.body}</p>
                    {"href" in card && card.href ? <span className={`${styles.cardArrow} os-type-action`} aria-hidden="true">↗</span> : null}
                  </>
                );

                return "href" in card && card.href ? (
                  <Link className={styles.designCard} href={card.href} key={card.label}>{content}</Link>
                ) : (
                  <article className={styles.designCard} key={card.label}>{content}</article>
                );
              })}
            </div>
          </div>
        </SectionReveal>
      </section>

      <section className={`${styles.section} ${styles.growthSection}`}>
        <SectionReveal>
          <div className="os-public-content-guide">
            <div className={styles.growthGrid}>
              <div>
                <SectionEyebrow>{t.growth.eyebrow}</SectionEyebrow>
                <h2 className={`${styles.sectionTitle} os-type-h2`}><TitleLines lines={t.growth.title} /></h2>
              </div>
              <div className={styles.growthBody}>
                <p className="os-type-supporting">{t.growth.body}</p>
                <p className={`${styles.note} os-type-micro`}><i aria-hidden="true" />{t.growth.note}</p>
              </div>
              <div className={styles.growthList}>
                {t.growth.items.map((item, index) => <div key={item}><span>0{index + 1}</span><strong className="os-type-action">{item}</strong></div>)}
              </div>
            </div>
          </div>
        </SectionReveal>
      </section>

      <section className={`${styles.section} ${styles.principlesSection}`}>
        <SectionReveal>
          <div className="os-public-content-guide">
            <div className={styles.principlesIntro}>
              <SectionEyebrow>{t.principles.eyebrow}</SectionEyebrow>
              <h2 className={`${styles.sectionTitle} os-type-h2`}>{t.principles.title}</h2>
            </div>
            <div className={styles.principlesGrid}>
              {t.principles.items.map((item, index) => (
                <article className={styles.principle} key={item.title}>
                  <span className={`${styles.principleIndex} os-type-micro`}>0{index + 1}</span>
                  <h3 className="os-type-card-title">{item.title}</h3>
                  <p className="os-type-card-body">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </SectionReveal>
      </section>

      <section className={`${styles.section} ${styles.ctaSection}`}>
        <SectionReveal>
          <div className="os-public-content-guide">
            <div className={styles.ctaInner}>
              <SectionEyebrow>{t.cta.eyebrow}</SectionEyebrow>
              <h2 className={`${styles.sectionTitle} os-type-h2`}><TitleLines lines={t.cta.title} /></h2>
              <p className={`${styles.ctaBody} os-type-supporting`}>{t.cta.body}</p>
              <div className={styles.ctaActions}>
                <Link className="os-button primary os-type-action" href="/features">{t.cta.features}<b>↗</b></Link>
                <Link className="os-button ghost os-type-action" href="/demos">{t.cta.demos}<b>↗</b></Link>
              </div>
              <a className={`${styles.contactLink} os-type-action`} href="mailto:hello@onestudioos.com">
                <span>{t.cta.contactLabel}</span>
                <strong>hello@onestudioos.com</strong>
              </a>
            </div>
          </div>
        </SectionReveal>
      </section>

      <OneStudioFooter lang={lang} />
    </main>
  );
}
