import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
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
    "--lumea-ink": "#2D211C",
    "--lumea-bg": site.content.theme_surface ?? "#FBF8F4",
    "--lumea-brown": site.content.theme_dark ?? "#5A2D17",
    "--lumea-accent": site.content.theme_accent ?? "#87573E",
    "--lumea-muted": "#786A62",
    "--lumea-soft": "#F4ECE4",
    "--lumea-card": "#FFFCF9",
    "--lumea-gold": "#C99343",
  } as CSSProperties;

  const sections: Record<LumeaNativeSectionId, ReactNode> = {
    hero: visible("hero") ? (
      <>
        <a className={styles.skip} href="#services">
          {english ? "Skip to content" : "Перейти к содержанию"}
        </a>
        <div className={styles.announcement}>{content.announcement.text}</div>
        <header className={styles.header}>
          <Link href={basePath} className={styles.logo} aria-label="LUMÉA Beauty Studio">
            <strong>{content.brand}</strong>
            <small>{content.header.subbrand}</small>
          </Link>
          <nav
            className={styles.nav}
            aria-label={english ? "Main navigation" : "Главная навигация"}
          >
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
            <PublicRichText value={content.hero.text} />
            <div className={styles.heroButtons}>
              <a className={styles.primaryButton} href={content.hero.primaryUrl}>
                {content.hero.primaryLabel}
              </a>
              <a className={styles.textButton} href={content.hero.secondaryUrl}>
                {content.hero.secondaryLabel} <span>→</span>
              </a>
            </div>
            <small className={styles.rating}>{content.hero.rating}</small>
          </div>
          <div className={styles.heroMedia}>
            <Image
              src={content.hero.image}
              alt={content.hero.alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 52vw"
            />
          </div>
        </section>
      </>
    ) : null,
    services: visible("services") ? (
      <section id="services" className={styles.section}>
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>{content.servicesPresentation.eyebrow}</span>
          <h2 style={headingStyle("services")}>
            <PublicRichHeading value={content.servicesPresentation.title} />
          </h2>
        </div>
        <div className={styles.serviceGrid}>
          {content.services.map((item, index) => (
            <article key={`${item.name}-${index}`} className={styles.serviceCard}>
              <div className={styles.cardMedia}>
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 680px) 92vw, (max-width: 1100px) 45vw, 23vw"
                />
              </div>
              <div className={styles.serviceBody}>
                <h3>{item.name}</h3>
                <div>
                  <strong>{item.price}</strong>
                  <a href="#booking">{item.cta} →</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    ) : null,
    booking: visible("booking") ? (
      <section id="booking" className={styles.bookingSection}>
        <div className={styles.bookingImage}>
          <Image
            src={content.booking.image}
            alt={content.booking.alt}
            fill
            sizes="(max-width: 900px) 100vw, 48vw"
          />
        </div>
        <LumeaBooking bookingHref={bookingHref} services={site.services} copy={content.booking} />
      </section>
    ) : null,
    experts: visible("experts") ? (
      <section id="experts" className={styles.section}>
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>{content.expertsPresentation.eyebrow}</span>
          <h2 style={headingStyle("experts")}>
            <PublicRichHeading value={content.expertsPresentation.title} />
          </h2>
        </div>
        <div className={styles.expertGrid}>
          {content.experts.map((item) => (
            <article key={item.name} className={styles.expertCard}>
              <div className={styles.expertMedia}>
                <Image src={item.image} alt={item.alt} fill sizes="(max-width: 760px) 92vw, 31vw" />
              </div>
              <div>
                <h3>{item.name}</h3>
                <p>{item.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    ) : null,
    gallery: visible("gallery") ? (
      <section id="gallery" className={`${styles.section} ${styles.gallerySection}`}>
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>{content.galleryPresentation.eyebrow}</span>
          <h2 style={headingStyle("gallery")}>
            <PublicRichHeading value={content.galleryPresentation.title} />
          </h2>
        </div>
        <div className={styles.galleryGrid}>
          {content.gallery.map((item, index) => (
            <div key={`${item.image}-${index}`} className={styles.galleryItem}>
              <Image src={item.image} alt={item.alt} fill sizes="(max-width: 700px) 76vw, 20vw" />
            </div>
          ))}
        </div>
      </section>
    ) : null,
    reviews: visible("reviews") ? (
      <section id="reviews" className={`${styles.section} ${styles.reviewSection}`}>
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>{content.reviewsPresentation.eyebrow}</span>
          <h2 style={headingStyle("reviews")}>
            <PublicRichHeading value={content.reviewsPresentation.title} />
          </h2>
        </div>
        <div className={styles.reviewRail}>
          {content.reviews.map((item) => (
            <article key={item.author} className={styles.reviewCard}>
              <span className={styles.stars}>{item.rating}</span>
              <blockquote><PublicRichText value={item.quote} /></blockquote>
              <strong>{item.author}</strong>
            </article>
          ))}
        </div>
      </section>
    ) : null,
    contact: visible("contact") ? (
      <section id="contact" className={`${styles.section} ${styles.contactSection}`}>
        <div className={styles.contactCard}>
          <div className={styles.contactImage}>
            <Image
              src={content.contact.facadeImage}
              alt={content.contact.facadeAlt}
              fill
              sizes="(max-width: 850px) 100vw, 35vw"
            />
          </div>
          <div className={styles.contactCopy}>
            <span className={styles.eyebrow}>{content.contact.eyebrow}</span>
            <h2 style={headingStyle("contact")}>
              <PublicRichHeading value={content.contact.title} />
            </h2>
            <p>◷ {content.contact.hours}</p>
            <p>⌖ {content.contact.address}</p>
            <p>☎ {content.contact.phone}</p>
            <a
              className={styles.primaryButton}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content.contact.address)}`}
              target="_blank"
              rel="noreferrer"
            >
              {content.contact.cta}
            </a>
          </div>
          <div className={styles.mapVisual} aria-label={content.contact.mapLabel}>
            <div className={styles.mapLines} />
            <span className={styles.mapPin}>●</span>
            <small>{content.contact.mapLabel}</small>
          </div>
        </div>
      </section>
    ) : null,
    footer: visible("footer") ? (
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <strong>{content.brand}</strong>
          <small>{content.footer.subbrand}</small>
        </div>
        <div className={styles.socials}>
          <span>{content.footer.instagram}</span>
          <span>{content.footer.facebook}</span>
          <span>{content.footer.telegram}</span>
        </div>
        <nav>
          {content.navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
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
