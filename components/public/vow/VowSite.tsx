import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import PublicCustomBlock from "@/components/public/PublicCustomBlock";
import PublicRichHeading from "@/components/public/PublicRichHeading";
import PublicRichText from "@/components/public/PublicRichText";
import { isTemplateNativeSectionVisible } from "@/lib/public-site/template-native-section-state";
import {
  resolveVowContent,
  VOW_TEMPLATE_KEY,
} from "@/lib/public-site/vow-premium-template-content";
import type { VowNativeSectionId } from "@/lib/public-site/vow-premium-template-contract";
import type { PublicSiteData } from "@/lib/public-site/types";
import { publicTypographyStyle } from "@/lib/public-site/typography";
import { VowAvailability, VowReveal } from "./VowInteractions";
import styles from "./Vow.module.css";

function SectionHeading({
  eyebrow,
  title,
  text,
  style,
  light = false,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  style?: CSSProperties;
  light?: boolean;
}) {
  return (
    <VowReveal className={`${styles.sectionHeading} ${light ? styles.sectionHeadingLight : ""}`}>
      <span>{eyebrow}</span>
      <h2 style={style}><PublicRichHeading value={title} /></h2>
      {text ? <PublicRichText value={text} /> : null}
    </VowReveal>
  );
}

export default function VowSite({
  site,
  basePath,
}: {
  site: PublicSiteData;
  basePath: string;
}) {
  const content = resolveVowContent(site.content);
  const currentLocale = site.business.locale;
  const primaryLocale = site.business.primary_locale;
  const headingStyle = (section: VowNativeSectionId) =>
    publicTypographyStyle(content.headingTypography[section]);
  const visible = (id: string) =>
    isTemplateNativeSectionVisible(site.content, VOW_TEMPLATE_KEY, id);
  const pageHref = (slug: string) =>
    basePath.startsWith("/demos/") ? `${basePath}/${slug}` : `${basePath}/p/${slug}`;
  const currentSuffix = `/${currentLocale}`;
  const localizedRoot =
    currentLocale !== primaryLocale && basePath.endsWith(currentSuffix)
      ? basePath.slice(0, -currentSuffix.length) || "/"
      : basePath;
  const localeHref = (locale: string) =>
    locale === primaryLocale
      ? localizedRoot
      : `${localizedRoot.replace(/\/$/, "")}/${locale}`;
  const theme = {
    "--vow-bg": site.content.theme_dark ?? "#07111F",
    "--vow-fg": site.content.theme_surface ?? "#F7F2E9",
    "--vow-gold": site.content.theme_accent ?? "#CDB078",
    "--vow-muted": content.muted,
    "--vow-elevated": content.elevated,
    "--vow-border": content.border,
    "--vow-warm": content.warm,
    "--vow-overlay": content.overlay,
    "--vow-button-fg": content.buttonForeground,
  } as CSSProperties;

  const sections: Record<string, ReactNode> = {
    hero: visible("hero") ? (
      <>
        <a className={styles.skip} href="#manifesto">
          {currentLocale === "en" ? "Skip to content" : "Перейти к содержанию"}
        </a>
        <header className={styles.header}>
          <Link href={basePath} className={styles.logo}>
            <strong>{content.brand}</strong>
            <span>{content.header.eyebrow}</span>
          </Link>
          <nav aria-label={currentLocale === "en" ? "Main navigation" : "Главная навигация"}>
            {content.navigation.map((item) => (
              <Link key={item.href} href={`${basePath}${item.href}`}>{item.label}</Link>
            ))}
          </nav>
          <div className={styles.headerRight}>
            <div className={styles.lang} aria-label="Language">
              {site.available_locales.map((locale) => (
                <Link key={locale} href={localeHref(locale)} aria-current={locale === currentLocale ? "page" : undefined}>
                  {locale.toUpperCase()}
                </Link>
              ))}
            </div>
            <Link className={styles.headerCta} href="#availability">{content.header.availabilityLabel}</Link>
          </div>
        </header>
        <section id="hero" className={styles.hero}>
          <div className={styles.heroMedia}>
            <Image
              src={content.hero.image}
              alt={content.hero.alt}
              fill
              priority
              sizes="100vw"
            />
          </div>
          <div className={styles.heroVeil} />
          <VowReveal className={styles.heroCopy}>
            <span className={styles.eyebrow}>{content.hero.eyebrow}</span>
            <h1 style={headingStyle("hero")}><PublicRichHeading value={content.hero.title} /></h1>
            <PublicRichText value={content.hero.text} />
            <div className={styles.heroActions}>
              <Link className={styles.goldButton} href={content.hero.primaryUrl}>{content.hero.primaryLabel}</Link>
              <Link className={styles.textButton} href={content.hero.secondaryUrl}>{content.hero.secondaryLabel} <span aria-hidden="true">↗</span></Link>
            </div>
          </VowReveal>
          <div className={styles.showreel}>
            <span className={styles.playCircle} aria-hidden="true">▶</span>
            <span>{content.hero.playLabel}</span>
          </div>
          <a className={styles.scrollCue} href="#manifesto"><i />{content.hero.scrollLabel}</a>
        </section>
      </>
    ) : null,

    manifesto: visible("manifesto") ? (
      <section id="manifesto" className={`${styles.section} ${styles.manifesto}`}>
        <VowReveal className={styles.manifestoGrid}>
          <span className={styles.indexLabel}>{content.manifesto.eyebrow}</span>
          <div>
            <h2 style={headingStyle("manifesto")}><PublicRichHeading value={content.manifesto.title} /></h2>
            <PublicRichText value={content.manifesto.text} />
          </div>
          <blockquote>“{content.manifesto.quote}”</blockquote>
        </VowReveal>
      </section>
    ) : null,

    films: visible("films") ? (
      <section id="films" className={`${styles.section} ${styles.darkSection}`}>
        <SectionHeading
          eyebrow={content.filmsPresentation.eyebrow}
          title={content.filmsPresentation.title}
          text={content.filmsPresentation.text}
          style={headingStyle("films")}
          light
        />
        <div className={styles.filmGrid}>
          {content.films.map((film, index) => (
            <VowReveal className={styles.filmCard} key={`${film.names}-${index}`} delay={index * 0.07}>
              <div className={styles.filmImage}>
                <Image
                  src={film.image}
                  alt={film.alt}
                  fill
                  sizes={index === 0 ? "(max-width: 900px) 92vw, 62vw" : "(max-width: 900px) 92vw, 31vw"}
                  style={{ objectPosition: film.position }}
                />
                <span className={styles.filmNumber}>0{index + 1}</span>
                <span className={styles.playCircleSmall} aria-hidden="true">▶</span>
              </div>
              <div className={styles.filmMeta}><span>{film.location}</span><span>{film.year}</span></div>
              <h3>{film.names}</h3>
              <PublicRichText value={film.caption} />
              <a href="#availability" className={styles.inlineLink}>{film.cta} <span aria-hidden="true">↗</span></a>
            </VowReveal>
          ))}
        </div>
        <Link className={styles.sectionLink} href={pageHref("films")}>{content.filmsPresentation.pageLabel} →</Link>
      </section>
    ) : null,

    story: visible("story") ? (
      <section id="story" className={`${styles.section} ${styles.story}`}>
        <div className={styles.storyMedia}>
          <Image src={content.story.image} alt={content.story.alt} fill sizes="(max-width: 900px) 100vw, 52vw" />
        </div>
        <VowReveal className={styles.storyCopy}>
          <span className={styles.eyebrowDark}>{content.story.eyebrow}</span>
          <h2 style={headingStyle("story")}><PublicRichHeading value={content.story.title} /></h2>
          <PublicRichText value={content.story.text} />
          <small>{content.story.note}</small>
        </VowReveal>
      </section>
    ) : null,

    experience: visible("experience") ? (
      <section id="experience" className={`${styles.section} ${styles.experience}`}>
        <SectionHeading
          eyebrow={content.experiencePresentation.eyebrow}
          title={content.experiencePresentation.title}
          text={content.experiencePresentation.text}
          style={headingStyle("experience")}
          light
        />
        <div className={styles.experienceGrid}>
          {content.experience.map((item, index) => (
            <VowReveal className={styles.experienceItem} key={item.number} delay={index * 0.08}>
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <PublicRichText value={item.text} />
            </VowReveal>
          ))}
        </div>
      </section>
    ) : null,

    process: visible("process") ? (
      <section id="process" className={`${styles.section} ${styles.process}`}>
        <SectionHeading
          eyebrow={content.processPresentation.eyebrow}
          title={content.processPresentation.title}
          style={headingStyle("process")}
        />
        <div className={styles.processRail}>
          {content.process.map((item, index) => (
            <VowReveal className={styles.processItem} key={item.number} delay={index * 0.06}>
              <span>{item.number}</span>
              <div><h3>{item.title}</h3><PublicRichText value={item.text} /></div>
            </VowReveal>
          ))}
        </div>
      </section>
    ) : null,

    packages: visible("packages") ? (
      <section id="packages" className={`${styles.section} ${styles.packages}`}>
        <SectionHeading
          eyebrow={content.packagesPresentation.eyebrow}
          title={content.packagesPresentation.title}
          text={content.packagesPresentation.text}
          style={headingStyle("packages")}
        />
        <div className={styles.packageGrid}>
          {content.packages.map((item, index) => (
            <VowReveal className={`${styles.packageCard} ${index === 1 ? styles.featuredPackage : ""}`} key={item.name} delay={index * 0.07}>
              <div className={styles.packageTop}><span>0{index + 1}</span><strong>{item.price}</strong></div>
              <h3>{item.name}</h3>
              <p className={styles.packageLength}>{item.length} · {item.hours}</p>
              <PublicRichText value={item.includes} />
              <small>{item.note}</small>
              <a href="#availability">{item.cta} <span aria-hidden="true">→</span></a>
            </VowReveal>
          ))}
        </div>
        <Link className={styles.sectionLinkDark} href={pageHref("packages")}>{content.packagesPresentation.pageLabel} →</Link>
      </section>
    ) : null,

    gallery: visible("gallery") ? (
      <section id="gallery" className={`${styles.section} ${styles.gallerySection}`}>
        <SectionHeading
          eyebrow={content.galleryPresentation.eyebrow}
          title={content.galleryPresentation.title}
          text={content.galleryPresentation.text}
          style={headingStyle("gallery")}
          light
        />
        <div className={styles.galleryGrid}>
          {content.gallery.map((item, index) => (
            <VowReveal className={styles.galleryItem} key={`${item.title}-${index}`} delay={index * 0.05}>
              <Image src={item.image} alt={item.alt} fill sizes="(max-width: 800px) 92vw, 46vw" style={{ objectPosition: item.position }} />
              <div><span>{item.meta}</span><h3>{item.title}</h3></div>
            </VowReveal>
          ))}
        </div>
      </section>
    ) : null,

    reviews: visible("reviews") ? (
      <section id="reviews" className={`${styles.section} ${styles.reviews}`}>
        <SectionHeading
          eyebrow={content.reviewsPresentation.eyebrow}
          title={content.reviewsPresentation.title}
          style={headingStyle("reviews")}
        />
        <div className={styles.reviewGrid}>
          {content.reviews.map((item, index) => (
            <VowReveal className={styles.reviewCard} key={item.author} delay={index * 0.08}>
              <span className={styles.quoteMark}>“</span>
              <PublicRichText value={item.quote} />
              <footer><strong>{item.author}</strong><span>{item.meta}</span></footer>
            </VowReveal>
          ))}
        </div>
        <small className={styles.disclaimer}>{content.reviewsPresentation.disclaimer}</small>
      </section>
    ) : null,

    availability: visible("availability") ? (
      <section id="availability" className={`${styles.section} ${styles.availability}`}>
        <div className={styles.availabilityIntro}>
          <SectionHeading
            eyebrow={content.availability.eyebrow}
            title={content.availability.title}
            text={content.availability.text}
            style={headingStyle("availability")}
          />
          <div className={styles.availabilityMonogram}>V / F</div>
        </div>
        <VowAvailability
          businessSlug={site.business.slug}
          locale={currentLocale}
          copy={content.availability}
          packages={content.packages}
        />
      </section>
    ) : null,

    faq: visible("faq") ? (
      <section id="faq" className={`${styles.section} ${styles.faq}`}>
        <SectionHeading eyebrow={content.faqPresentation.eyebrow} title={content.faqPresentation.title} style={headingStyle("faq")} />
        <div className={styles.faqList}>
          {content.faq.map((item, index) => (
            <details key={item.question} className={styles.faqItem}>
              <summary><span>{String(index + 1).padStart(2, "0")}</span>{item.question}<b aria-hidden="true">+</b></summary>
              <PublicRichText value={item.answer} />
            </details>
          ))}
        </div>
      </section>
    ) : null,

    contact: visible("contact") ? (
      <section id="contact" className={styles.contact}>
        <Image src={content.contact.image} alt={content.contact.alt} fill sizes="100vw" />
        <div className={styles.contactVeil} />
        <VowReveal className={styles.contactCopy}>
          <span>{content.contact.eyebrow}</span>
          <h2 style={headingStyle("contact")}><PublicRichHeading value={content.contact.title} /></h2>
          <PublicRichText value={content.contact.text} />
          <div><a className={styles.goldButton} href="#availability">{content.contact.cta}</a><a className={styles.contactEmail} href={`mailto:${content.contact.secondary}`}>{content.contact.secondary}</a></div>
        </VowReveal>
      </section>
    ) : null,

    footer: visible("footer") ? (
      <footer className={styles.footer}>
        <div className={styles.footerBrand}><strong>{content.brand}</strong><span>{content.footer.note}</span></div>
        <p>{content.footer.tagline}</p>
        <nav>
          {content.navigation.map((item) => <Link key={item.href} href={`${basePath}${item.href}`}>{item.label}</Link>)}
        </nav>
        <div className={styles.footerBottom}><small>{content.footer.copyright}</small><a href="#hero">{content.footer.topLabel} ↑</a></div>
      </footer>
    ) : null,
  };

  const custom = new Map(
    (site.content.custom_blocks ?? []).map((block) => [`custom:${block.id}`, block]),
  );
  const order = site.content.layout_order?.length
    ? site.content.layout_order
    : Object.keys(sections).map((id) => `native:${VOW_TEMPLATE_KEY}:${id}`);

  return (
    <main className={styles.site} style={theme} data-locale={currentLocale} lang={currentLocale}>
      {order.map((token) => {
        const prefix = `native:${VOW_TEMPLATE_KEY}:`;
        if (token.startsWith(prefix)) {
          const sectionId = token.slice(prefix.length);
          return <div key={token} data-editor-anchor={sectionId}>{sections[sectionId]}</div>;
        }
        const block = custom.get(token);
        return block ? (
          <div key={token} data-editor-anchor={token} className={styles.customBlock}>
            <PublicCustomBlock block={block} services={site.services} bookingHref="#availability" />
          </div>
        ) : null;
      })}
    </main>
  );
}
