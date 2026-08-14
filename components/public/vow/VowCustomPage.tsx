import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import PublicCustomBlock from "@/components/public/PublicCustomBlock";
import PublicRichText from "@/components/public/PublicRichText";
import type { PublicSiteData, PublicSitePage } from "@/lib/public-site/types";
import { resolveVowContent } from "@/lib/public-site/vow-premium-template-content";
import styles from "./Vow.module.css";

export default function VowCustomPage({
  site,
  page,
  basePath,
}: {
  site: PublicSiteData;
  page: PublicSitePage;
  basePath: string;
}) {
  const content = resolveVowContent(site.content);
  const locale = site.business.locale;
  const bookingHref = `${basePath}#availability`;
  const isFilms = page.slug === "films";
  const isPackages = page.slug === "packages";

  return (
    <main
      className={styles.site}
      lang={locale}
      style={{
        "--vow-bg": site.content.theme_dark ?? "#07111F",
        "--vow-fg": site.content.theme_surface ?? "#F7F2E9",
        "--vow-gold": site.content.theme_accent ?? "#CDB078",
        "--vow-muted": content.muted,
        "--vow-elevated": content.elevated,
        "--vow-border": content.border,
        "--vow-warm": content.warm,
        "--vow-overlay": content.overlay,
        "--vow-button-fg": content.buttonForeground,
      } as CSSProperties}
    >
      <header className={styles.header} style={{ position: "relative", background: "#07111F" }}>
        <Link href={basePath} className={styles.logo}>
          <strong>{content.brand}</strong>
          <span>{content.header.eyebrow}</span>
        </Link>
        <nav aria-label={locale === "en" ? "Page navigation" : "Навигация страницы"}>
          <Link href={basePath}>{locale === "en" ? "Home" : "Главная"}</Link>
          <Link href={`${basePath}/films`}>{content.customPages.filmsLabel}</Link>
          <Link href={`${basePath}/packages`}>{content.customPages.packagesLabel}</Link>
        </nav>
        <div className={styles.headerRight}>
          <Link className={styles.headerCta} href={bookingHref}>{content.header.availabilityLabel}</Link>
        </div>
      </header>

      <section className={`${styles.section} ${styles.darkSection}`} style={{ paddingTop: "clamp(72px, 9vw, 130px)" }}>
        <span className={styles.eyebrow}>{page.eyebrow || content.header.eyebrow}</span>
        <h1 style={{
          margin: "18px 0 22px",
          maxWidth: "980px",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontWeight: 400,
          fontSize: "clamp(50px, 7vw, 104px)",
          lineHeight: .94,
          letterSpacing: "-.04em",
        }}>
          {page.title}
        </h1>
        {page.intro ? <div style={{ maxWidth: 680, color: "rgba(247,242,233,.64)", lineHeight: 1.75 }}><PublicRichText value={page.intro} /></div> : null}
      </section>

      {isFilms ? (
        <section className={`${styles.section} ${styles.darkSection}`} style={{ paddingTop: 0 }}>
          <div className={styles.filmGrid}>
            {content.films.map((film, index) => (
              <article className={styles.filmCard} key={`${film.names}-${index}`}>
                <div className={styles.filmImage}>
                  <Image src={film.image} alt={film.alt} fill sizes="(max-width: 900px) 92vw, 55vw" style={{ objectPosition: film.position }} />
                  <span className={styles.filmNumber}>0{index + 1}</span>
                  <span className={styles.playCircleSmall} aria-hidden="true">▶</span>
                </div>
                <div className={styles.filmMeta}><span>{film.location}</span><span>{film.year}</span></div>
                <h3>{film.names}</h3>
                <PublicRichText value={film.caption} />
                <Link className={styles.inlineLink} href={bookingHref}>{film.cta} ↗</Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {isPackages ? (
        <section className={`${styles.section} ${styles.packages}`}>
          <div className={styles.packageGrid}>
            {content.packages.map((item, index) => (
              <article className={`${styles.packageCard} ${index === 1 ? styles.featuredPackage : ""}`} key={item.name}>
                <div className={styles.packageTop}><span>0{index + 1}</span><strong>{item.price}</strong></div>
                <h3>{item.name}</h3>
                <p className={styles.packageLength}>{item.length} · {item.hours}</p>
                <PublicRichText value={item.includes} />
                <small>{item.note}</small>
                <Link href={bookingHref}>{item.cta} →</Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {!isFilms && !isPackages && page.blocks?.length ? (
        <section className={styles.customBlock}>
          {page.blocks.map((block) => (
            <PublicCustomBlock key={block.id} block={block} services={site.services} bookingHref={bookingHref} />
          ))}
        </section>
      ) : null}

      <section className={styles.contact} style={{ minHeight: 520 }}>
        <Image src={content.contact.image} alt={content.contact.alt} fill sizes="100vw" />
        <div className={styles.contactVeil} />
        <div className={styles.contactCopy}>
          <span>{content.contact.eyebrow}</span>
          <h2>{content.contact.title}</h2>
          <PublicRichText value={content.contact.text} />
          <div><Link className={styles.goldButton} href={bookingHref}>{content.contact.cta}</Link></div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}><strong>{content.brand}</strong><span>{content.footer.note}</span></div>
        <p>{content.footer.tagline}</p>
        <nav><Link href={basePath}>{content.customPages.homeLabel}</Link><Link href={`${basePath}/films`}>{content.customPages.filmsLabel}</Link><Link href={`${basePath}/packages`}>{content.customPages.packagesLabel}</Link></nav>
        <div className={styles.footerBottom}><small>{content.footer.copyright}</small><Link href={basePath}>{content.customPages.homeLabel} ↑</Link></div>
      </footer>
    </main>
  );
}
