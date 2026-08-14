import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import PublicCustomBlock from "@/components/public/PublicCustomBlock";
import PublicRichHeading from "@/components/public/PublicRichHeading";
import PublicRichText from "@/components/public/PublicRichText";
import { isTemplateNativeSectionVisible } from "@/lib/public-site/template-native-section-state";
import {
  resolveLumeaContent,
  LUMEA_TEMPLATE_KEY,
} from "@/lib/public-site/lumea-premium-template-content";
import type { PublicSiteData } from "@/lib/public-site/types";
import { publicTypographyStyle } from "@/lib/public-site/typography";
import type { LumeaNativeSectionId } from "@/lib/public-site/lumea-premium-template-contract";
import LumeaBooking from "./LumeaBooking";
import styles from "./Lumea.module.css";

function Photo({
  src,
  alt,
  className,
  loading = "lazy",
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
    />
  );
}

export default function LumeaSite({
  site,
  basePath,
}: {
  site: PublicSiteData;
  basePath: string;
}) {
  const content = resolveLumeaContent(site.content);
  const locale = site.business.locale;
  const english = locale.toLowerCase().startsWith("en");
  const headingStyle = (section: LumeaNativeSectionId) =>
    publicTypographyStyle(content.headingTypography[section]);
  const visible = (id: LumeaNativeSectionId) =>
    isTemplateNativeSectionVisible(site.content, LUMEA_TEMPLATE_KEY, id);
  const bookingHref = `/book/${site.business.slug}`;

  const primaryLocale = site.business.primary_locale;
  const currentSuffix = `/${locale}`;
  const localizedRoot =
    locale !== primaryLocale && basePath.endsWith(currentSuffix)
      ? basePath.slice(0, -currentSuffix.length) || "/"
      : basePath;
  const localeHref = (nextLocale: string) =>
    nextLocale === primaryLocale
      ? localizedRoot
      : `${localizedRoot.replace(/\/$/, "")}/${nextLocale}`;

  const theme = {
    "--lumea-ink": "#211B18",
    "--lumea-bg": site.content.theme_surface ?? "#F4EFE9",
    "--lumea-brown": site.content.theme_dark ?? "#35251F",
    "--lumea-accent": site.content.theme_accent ?? "#9B6D56",
    "--lumea-sage": "#8B9181",
    "--lumea-muted": "#74675F",
    "--lumea-line": "rgba(53,37,31,.14)",
    "--lumea-paper": "#FBF8F4",
    "--lumea-gold": "#B08A5C",
  } as CSSProperties;

  const sections: Record<LumeaNativeSectionId, ReactNode> = {
    hero: visible("hero") ? (
      <>
        <a className={styles.skip} href="#services">
          {english ? "Skip to content" : "Перейти к содержанию"}
        </a>
        <div className={styles.announcement}>
          <span>{content.announcement.text}</span>
          <span className={styles.announcementMark}>LUMÉA / 01</span>
        </div>
        <header className={styles.header}>
          <Link href={basePath} className={styles.logo} aria-label="LUMÉA Beauty Studio">
            <strong>{content.brand}</strong>
            <small>{content.header.subbrand}</small>
          </Link>
          <nav className={styles.nav} aria-label={english ? "Main navigation" : "Главная навигация"}>
            {content.navigation.map((item) => (
              <a key={item.href} href={item.href}>{item.label}</a>
            ))}
          </nav>
          <div className={styles.headerActions}>
            <div className={styles.localeSwitch} aria-label="Language">
              {site.available_locales.map((nextLocale) => (
                <Link
                  key={nextLocale}
                  href={localeHref(nextLocale)}
                  aria-current={nextLocale === locale ? "page" : undefined}
                >
                  {nextLocale.toUpperCase()}
                </Link>
              ))}
            </div>
            <a className={styles.headerCta} href="#booking">{content.header.cta}</a>
          </div>
          <details className={styles.mobileMenu}>
            <summary>{content.header.menu}</summary>
            <div>
              {content.navigation.map((item) => (
                <a key={item.href} href={item.href}>{item.label}</a>
              ))}
              <div className={styles.mobileLocales}>
                {site.available_locales.map((nextLocale) => (
                  <Link key={nextLocale} href={localeHref(nextLocale)}>
                    {nextLocale.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>
          </details>
        </header>

        <section id="hero" className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>{content.hero.eyebrow}</span>
            <h1 style={headingStyle("hero")}>
              <PublicRichHeading value={content.hero.title} />
            </h1>
            <div className={styles.heroText}>
              <PublicRichText value={content.hero.text} />
            </div>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href={content.hero.primaryUrl}>
                {content.hero.primaryLabel}
              </a>
              <a className={styles.arrowLink} href={content.hero.secondaryUrl}>
                {content.hero.secondaryLabel}
                <span aria-hidden="true">↘</span>
              </a>
            </div>
            <div className={styles.heroProof}>
              <span>○</span>
              <small>{content.hero.rating}</small>
            </div>
          </div>

          <div className={styles.heroArt}>
            <div className={styles.heroPhoto}>
              <Photo src={content.hero.image} alt={content.hero.alt} loading="eager" />
            </div>
            <div className={styles.heroInset}>
              <Photo src={content.booking.image} alt={content.booking.alt} loading="eager" />
              <span>{english ? "care, without the rush" : "уход без спешки"}</span>
            </div>
            <div className={styles.heroSeal} aria-hidden="true">
              <span>L</span>
              <small>BEAUTY<br />STUDIO</small>
            </div>
          </div>

          <div className={styles.heroFootnote}>
            <span>{english ? "personal beauty studio" : "персональная beauty studio"}</span>
            <span>50.4501° N · 30.5234° E</span>
          </div>
        </section>
      </>
    ) : null,

    services: visible("services") ? (
      <section id="services" className={styles.servicesSection}>
        <div className={styles.servicesIntro}>
          <div>
            <span className={styles.eyebrow}>{content.servicesPresentation.eyebrow}</span>
            <h2 style={headingStyle("services")}>
              <PublicRichHeading value={content.servicesPresentation.title} />
            </h2>
          </div>
          <p>
            {english
              ? "Choose the direction. The exact treatment is shaped together with your expert."
              : "Вы выбираете направление. Точную процедуру собираете вместе со специалистом."}
          </p>
        </div>
        <div className={styles.serviceDeck}>
          {content.services.map((item, index) => (
            <article
              key={`${item.name}-${index}`}
              className={`${styles.serviceCard} ${index === 0 ? styles.serviceFeatured : ""}`}
            >
              <div className={styles.serviceImage}>
                <Photo src={item.image} alt={item.alt} />
                <span className={styles.serviceNumber}>0{index + 1}</span>
              </div>
              <div className={styles.serviceMeta}>
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.cta}</p>
                </div>
                <div className={styles.servicePrice}>
                  <strong>{item.price}</strong>
                  <a href="#booking" aria-label={`${item.name}: ${english ? "book" : "записаться"}`}>↗</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    ) : null,

    booking: visible("booking") ? (
      <section id="booking" className={styles.bookingSection}>
        <div className={styles.bookingBackdrop}>
          <Photo src={content.booking.image} alt={content.booking.alt} />
          <div className={styles.bookingCaption}>
            <span>LUMÉA</span>
            <small>{english ? "beauty at your pace" : "красота в вашем темпе"}</small>
          </div>
        </div>
        <div className={styles.bookingPanel}>
          <LumeaBooking bookingHref={bookingHref} services={site.services} copy={content.booking} />
        </div>
      </section>
    ) : null,

    experts: visible("experts") ? (
      <section id="experts" className={styles.expertsSection}>
        <div className={styles.expertsHeading}>
          <span className={styles.eyebrow}>{content.expertsPresentation.eyebrow}</span>
          <h2 style={headingStyle("experts")}>
            <PublicRichHeading value={content.expertsPresentation.title} />
          </h2>
        </div>
        <div className={styles.expertGrid}>
          {content.experts.map((item, index) => (
            <article key={item.name} className={styles.expertCard}>
              <div className={styles.expertPhoto}>
                <Photo src={item.image} alt={item.alt} />
                <span>0{index + 1}</span>
              </div>
              <div className={styles.expertMeta}>
                <h3>{item.name}</h3>
                <p>{item.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    ) : null,

    gallery: visible("gallery") ? (
      <section id="gallery" className={styles.gallerySection}>
        <div className={styles.galleryHeading}>
          <span className={styles.eyebrow}>{content.galleryPresentation.eyebrow}</span>
          <h2 style={headingStyle("gallery")}>
            <PublicRichHeading value={content.galleryPresentation.title} />
          </h2>
        </div>
        <div className={styles.galleryMasonry}>
          {content.gallery.map((item, index) => (
            <figure key={`${item.image}-${index}`} className={styles.galleryItem}>
              <Photo src={item.image} alt={item.alt} />
              <figcaption>0{index + 1}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    ) : null,

    reviews: visible("reviews") ? (
      <section id="reviews" className={styles.reviewsSection}>
        <div className={styles.reviewHeading}>
          <span className={styles.eyebrow}>{content.reviewsPresentation.eyebrow}</span>
          <h2 style={headingStyle("reviews")}>
            <PublicRichHeading value={content.reviewsPresentation.title} />
          </h2>
        </div>
        <div className={styles.reviewLayout}>
          {content.reviews.map((item, index) => (
            <article
              key={item.author}
              className={`${styles.reviewCard} ${index === 0 ? styles.reviewFeatured : ""}`}
            >
              <span className={styles.stars}>{item.rating}</span>
              <blockquote><PublicRichText value={item.quote} /></blockquote>
              <div>
                <strong>{item.author}</strong>
                <small>{english ? "verified visit" : "подтверждённый визит"}</small>
              </div>
            </article>
          ))}
        </div>
      </section>
    ) : null,

    contact: visible("contact") ? (
      <section id="contact" className={styles.contactSection}>
        <div className={styles.contactCopy}>
          <span className={styles.eyebrow}>{content.contact.eyebrow}</span>
          <h2 style={headingStyle("contact")}>
            <PublicRichHeading value={content.contact.title} />
          </h2>
          <div className={styles.contactDetails}>
            <p>{content.contact.hours}</p>
            <p>{content.contact.address}</p>
            <p>{content.contact.phone}</p>
          </div>
          <a
            className={styles.lightButton}
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content.contact.address)}`}
            target="_blank"
            rel="noreferrer"
          >
            {content.contact.cta} ↗
          </a>
        </div>
        <div className={styles.contactPhoto}>
          <Photo src={content.contact.facadeImage} alt={content.contact.facadeAlt} />
        </div>
        <div className={styles.mapVisual} aria-label={content.contact.mapLabel}>
          <div className={styles.mapGrid} />
          <div className={styles.mapCircle}>
            <span>L</span>
          </div>
          <small>{content.contact.mapLabel}</small>
        </div>
      </section>
    ) : null,

    footer: visible("footer") ? (
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <strong>{content.brand}</strong>
          <small>{content.footer.subbrand}</small>
        </div>
        <nav>
          {content.navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <div className={styles.socials}>
          <span>{content.footer.instagram}</span>
          <span>{content.footer.facebook}</span>
          <span>{content.footer.telegram}</span>
        </div>
        <div className={styles.footerContact}>
          <span>{content.contact.hours}</span>
          <span>{content.contact.address}</span>
          <span>{content.contact.phone}</span>
        </div>
        <small className={styles.footerNote}>{content.footer.note}</small>
      </footer>
    ) : null,
  };

  const custom = new Map(
    (site.content.custom_blocks ?? []).map((block) => [`custom:${block.id}`, block]),
  );
  const order = site.content.layout_order?.length
    ? site.content.layout_order
    : Object.keys(sections).map((id) => `native:${LUMEA_TEMPLATE_KEY}:${id}`);

  return (
    <main className={styles.site} style={theme} lang={locale} data-locale={locale}>
      {order.map((token) => {
        const prefix = `native:${LUMEA_TEMPLATE_KEY}:`;
        if (token.startsWith(prefix)) {
          const id = token.slice(prefix.length) as LumeaNativeSectionId;
          return <div key={token} data-editor-anchor={id}>{sections[id]}</div>;
        }
        const block = custom.get(token);
        return block ? (
          <div key={token} data-editor-anchor={token}>
            <PublicCustomBlock
              block={block}
              services={site.services}
              bookingHref={bookingHref}
            />
          </div>
        ) : null;
      })}
    </main>
  );
}

