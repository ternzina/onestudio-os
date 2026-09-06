"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { OneStudioFooter } from "@/components/marketing/OneStudioFooter";
import { SectionReveal } from "@/components/marketing/SectionReveal";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/use-locale";
import { websitePortfolioCards } from "@/lib/site-content";
import styles from "./page.module.css";

const contactHref = "/contact";

export default function WebsitePageClient() {
  const [lang, setLang] = useLocale();
  const t = getTranslations(lang).website;

  return (
    <main className={`${styles.page} os-site`}>
      <section className={styles.hero}>
        <MarketingHeader lang={lang} onLangChange={setLang} />
        <div className={styles.heroInner}>
          <SectionReveal>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <p className={`${styles.eyebrow} os-type-eyebrow`}><span />{t.hero.eyebrow}</p>
                <h1 className={`${styles.heroTitle} os-type-h1`}>{t.hero.title}</h1>
                <div className={styles.heroPrice}>{t.hero.priceLabel}<span> / {t.hero.projectUnit}</span></div>
                <p className={`${styles.heroLead} os-type-supporting`}>{t.hero.lead}</p>
                <Link className={`${styles.heroCta} os-type-action`} href={contactHref}>
                  {t.hero.cta}<ArrowUpRight size={17} aria-hidden="true" />
                </Link>
                <p className={`${styles.heroCtaNote} os-type-micro`}>{t.hero.ctaNote}</p>
              </div>

              <div className={styles.heroVisual} aria-hidden="true">
                <div className={styles.heroVisualGlow} />
                <div className={styles.browserFrame}>
                  <div className={styles.browserBar}><span /><span /><span /><small>your-project.com</small><b>↗</b></div>
                  <div className={styles.browserPage}>
                    <div className={styles.browserNav}><b>STUDIO / 24</b><span>ABOUT</span><span>WORK</span><i /></div>
                    <div className={styles.browserContent}><small>ONE STUDIO / PROJECT</small><strong>Built around<br /><em>your work.</em></strong><b>Start a conversation <span>↘</span></b></div>
                    <div className={styles.browserFooter}><span>01 — 03</span><span>OneStudio</span></div>
                  </div>
                </div>
                <div className={styles.fixedPriceCard}><span>PROJECT PRICE</span><b>FIXED</b><small>before we begin</small></div>
              </div>
            </div>
            <p className={`${styles.priceNote} os-type-card-body`}>{t.hero.priceNote}</p>
          </SectionReveal>
        </div>
      </section>

      <section className={styles.includedSection} aria-labelledby="website-included-heading">
        <div className={styles.container}>
          <SectionReveal>
            <div className={styles.sectionIntro}>
              <p className={`${styles.lightEyebrow} os-type-eyebrow`}><span />{t.included.eyebrow}</p>
              <div className={styles.splitIntro}>
                <h2 id="website-included-heading" className={`${styles.sectionTitle} os-type-h2`}>{t.included.title}</h2>
                <p className={`${styles.sectionLead} os-type-supporting`}>{t.included.lead}</p>
              </div>
            </div>
          </SectionReveal>
          <SectionReveal>
            <div className={styles.includedGrid}>
              {t.included.items.map((item, index) => (
                <article className={styles.includedCard} key={item.title}>
                  <span className={`${styles.cardNumber} os-type-micro`}>{String(index + 1).padStart(2, "0")}</span>
                  <Check size={18} strokeWidth={1.7} aria-hidden="true" />
                  <h3 className="os-type-action">{item.title}</h3>
                  <p className="os-type-card-body">{item.description}</p>
                </article>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className={styles.scopeSection} aria-labelledby="website-scope-heading">
        <div className={styles.container}>
          <SectionReveal>
            <div className={styles.scopeCard}>
              <div>
                <p className={`${styles.lightEyebrow} os-type-eyebrow`}><span />{t.scope.eyebrow}</p>
                <h2 id="website-scope-heading" className={`${styles.scopeTitle} os-type-h2`}>{t.scope.title}</h2>
                <p className={`${styles.scopeLead} os-type-supporting`}>{t.scope.lead}</p>
              </div>
              <ul className={styles.scopeList}>
                {t.scope.items.map((item) => <li key={item}><span />{item}</li>)}
              </ul>
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className={styles.processSection} aria-labelledby="website-process-heading">
        <div className={styles.container}>
          <SectionReveal>
            <p className={`${styles.lightEyebrow} os-type-eyebrow`}><span />{t.process.eyebrow}</p>
            <h2 id="website-process-heading" className={`${styles.sectionTitle} os-type-h2`}>{t.process.title}</h2>
          </SectionReveal>
          <SectionReveal>
            <div className={styles.processGrid}>
              {t.process.steps.map((step) => (
                <article className={styles.processStep} key={step.number}>
                  <span className="os-type-micro">{step.number}</span>
                  <h3 className="os-type-action">{step.title}</h3>
                  <p className="os-type-card-body">{step.description}</p>
                </article>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className={styles.showcaseSection} aria-labelledby="website-showcase-heading">
        <div className={styles.container}>
          <SectionReveal>
            <div className={styles.showcaseIntro}>
              <p className={`${styles.showcaseEyebrow} os-type-eyebrow`}><span />{t.showcase.eyebrow}</p>
              <h2 id="website-showcase-heading" className={`${styles.showcaseTitle} os-type-h2`}>{t.showcase.title}</h2>
              <p className={`${styles.showcaseLead} os-type-supporting`}>{t.showcase.lead}</p>
            </div>
          </SectionReveal>
          <SectionReveal>
            <div className={styles.showcaseGrid}>
              {websitePortfolioCards.map((card) => {
                const cardCopy = t.portfolio[card.key];
                return (
                <article className={styles.showcaseCard} key={card.key}>
                  <div className={styles.showcaseImage}>
                    {card.previewImage ? (
                      <Image
                        src={card.previewImage}
                        alt={cardCopy.alt ?? card.name}
                        fill
                        sizes="(max-width: 560px) calc(100vw - 36px), (max-width: 650px) calc(47.5vw - 17px), (max-width: 800px) calc(47.5vw - 30px), 24vw"
                      />
                    ) : null}
                  </div>
                  <div className={styles.showcaseCopy}>
                    <p className={`${styles.showcaseMeta} os-type-micro`}>{cardCopy.projectType}</p>
                    <h3 className="os-type-card-title">{card.name}</h3>
                    {cardCopy.description ? <p className="os-type-card-body">{cardCopy.description}</p> : null}
                    <a className={`${styles.showcaseLink} os-type-action`} href={card.url} target="_blank" rel="noopener noreferrer">
                      {cardCopy.cta} <ArrowUpRight size={15} aria-hidden="true" />
                    </a>
                  </div>
                </article>
                );
              })}
            </div>
          </SectionReveal>
        </div>
      </section>

      <OneStudioFooter lang={lang} />
    </main>
  );
}
