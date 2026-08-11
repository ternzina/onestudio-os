import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import PublicCustomBlock from "@/components/public/PublicCustomBlock";
import PublicRichText from "@/components/public/PublicRichText";
import { isTemplateNativeSectionVisible } from "@/lib/public-site/template-native-section-state";
import {
  resolveVeloraContent,
  VELORA_TEMPLATE_KEY,
} from "@/lib/public-site/velora-premium-template-content";
import type { PublicSiteData } from "@/lib/public-site/types";
import {
  VeloraAvailability,
  VeloraGallery,
  VeloraInteractiveShell,
  VeloraPackageCta,
  VeloraVenueCta,
} from "./VeloraInteractions";
import styles from "./Velora.module.css";

const sectionTitle = (eyebrow: string, heading: string) => (
  <div className={styles.sectionTitle}>
    <span>{eyebrow}</span>
    <h2>{heading}</h2>
  </div>
);

export default function VeloraSite({
  site,
  basePath,
}: {
  site: PublicSiteData;
  basePath: string;
}) {
  const content = resolveVeloraContent(site.content);
  const visible = (id: string) =>
    isTemplateNativeSectionVisible(site.content, VELORA_TEMPLATE_KEY, id);
  const pageHref = (slug: string) =>
    basePath.startsWith("/demos/")
      ? `${basePath}/${slug}`
      : `${basePath}/p/${slug}`;
  const pages =
    site.content.pages?.filter(
      (page) =>
        page.type === "custom" &&
        page.is_visible !== false &&
        page.show_in_navigation,
    ) ?? [];
  const theme = {
    "--navy": site.content.theme_dark ?? "#101827",
    "--gold": site.content.theme_accent ?? "#C6A66B",
    "--ivory": site.content.theme_surface ?? "#F4EFE6",
    "--plum": content.plum || "#6D4055",
  } as CSSProperties;
  const sections: Record<string, ReactNode> = {
    hero: visible("hero") ? (
      <>
        <header className={styles.header}>
          <Link href={basePath} className={styles.logo}>
            {content.brand}
          </Link>
          <nav>
            {content.navigation.map((item, index) => (
              <Link
                key={`${item.href}-${index}`}
                href={
                  item.href.startsWith("#")
                    ? `${basePath}${item.href}`
                    : item.href
                }
              >
                {item.label}
              </Link>
            ))}
            {pages.map((page) => (
              <Link key={page.id} href={pageHref(page.slug)}>
                {page.nav_label}
              </Link>
            ))}
          </nav>
          <Link className={styles.headerCta} href="#availability">
            {content.header.availabilityLabel}
          </Link>
        </header>
        <section id="hero" className={styles.hero}>
          <Image
            src={content.hero.image}
            alt={content.hero.alt}
            fill
            priority
            sizes="100vw"
          />
          <div className={styles.heroShade} />
          <div className={styles.heroContent}>
            <span>{content.hero.eyebrow}</span>
            <h1>{content.hero.title}</h1>
            <PublicRichText
              value={content.hero.text}
              className={styles.heroText}
            />
            <div className={styles.actions}>
              <Link href={content.hero.primaryUrl}>
                {content.hero.primaryLabel}
              </Link>
              <Link href={content.hero.secondaryUrl}>
                {content.hero.secondaryLabel}
              </Link>
            </div>
            <small>{content.hero.traits}</small>
          </div>
        </section>
      </>
    ) : null,
    availability: visible("availability") ? (
      <section
        id="availability"
        className={`${styles.section} ${styles.availability}`}
      >
        {sectionTitle(content.availability.eyebrow, content.availability.title)}
        <PublicRichText
          value={content.availability.text}
          className={styles.lead}
        />
        <VeloraAvailability
          businessSlug={site.business.slug}
          venues={content.venues}
          packages={content.packages}
          formats={content.formats}
          copy={content.availability}
        />
      </section>
    ) : null,
    venues: visible("venues") ? (
      <section id="venues" className={`${styles.section} ${styles.ivory}`}>
        {sectionTitle(
          content.venuesPresentation.eyebrow,
          content.venuesPresentation.title,
        )}
        <div className={styles.venueGrid}>
          {content.venues.map((venue, index) => (
            <article key={`${venue.name}-${index}`}>
              <div>
                <Image
                  src={venue.image}
                  alt={venue.alt}
                  width={1200}
                  height={900}
                  sizes="(max-width: 768px) 100vw, 42vw"
                />
              </div>
              <span>
                0{index + 1} · {venue.area}
              </span>
              <h3>{venue.name}</h3>
              <p>{venue.capacity}</p>
              <PublicRichText
                value={venue.features}
                className={styles.cardText}
              />
              <VeloraVenueCta venue={venue.name} label={venue.cta} />
            </article>
          ))}
        </div>
        <Link className={styles.textLink} href={pageHref("venues")}>
          {content.venuesPresentation.pageLabel} →
        </Link>
      </section>
    ) : null,
    formats: visible("formats") ? (
      <section id="formats" className={`${styles.section} ${styles.navy}`}>
        {sectionTitle(
          content.formatsPresentation.eyebrow,
          content.formatsPresentation.title,
        )}
        <div className={styles.formatList}>
          {content.formats.map((item, index) => (
            <article key={`${item.title}-${index}`}>
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <PublicRichText value={item.text} />
            </article>
          ))}
        </div>
      </section>
    ) : null,
    packages: visible("packages") ? (
      <section id="packages" className={`${styles.section} ${styles.ivory}`}>
        {sectionTitle(
          content.packagesPresentation.eyebrow,
          content.packagesPresentation.title,
        )}
        <div className={styles.packageGrid}>
          {content.packages.map((item, index) => (
            <article
              key={`${item.name}-${index}`}
              className={index === 1 ? styles.featured : ""}
            >
              <span>{item.for}</span>
              <h3>{item.name}</h3>
              <strong>{item.price}</strong>
              <PublicRichText value={item.includes} />
              <VeloraPackageCta packageName={item.name} label={item.cta} />
            </article>
          ))}
        </div>
        <Link className={styles.textLink} href={pageHref("packages")}>
          {content.packagesPresentation.pageLabel} →
        </Link>
      </section>
    ) : null,
    gallery: visible("gallery") ? (
      <section id="gallery" className={`${styles.section} ${styles.gallery}`}>
        {sectionTitle(
          content.galleryPresentation.eyebrow,
          content.galleryPresentation.title,
        )}
        <VeloraGallery
          items={content.gallery}
          copy={content.galleryPresentation}
        />
      </section>
    ) : null,
    catering: visible("catering") ? (
      <section id="catering" className={`${styles.section} ${styles.ivory}`}>
        {sectionTitle(
          content.cateringPresentation.eyebrow,
          content.cateringPresentation.title,
        )}
        <div className={styles.simpleGrid}>
          {content.catering.map((item, index) => (
            <article key={`${item.title}-${index}`}>
              <h3>{item.title}</h3>
              <PublicRichText value={item.text} />
              <span>{item.meta}</span>
            </article>
          ))}
        </div>
      </section>
    ) : null,
    planner: visible("planner") ? (
      <section id="planner" className={`${styles.section} ${styles.plum}`}>
        {sectionTitle(
          content.plannerPresentation.eyebrow,
          content.plannerPresentation.title,
        )}
        <div className={styles.timeline}>
          {content.planner.map((item, index) => (
            <article key={`${item.number}-${index}`}>
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <PublicRichText value={item.text} />
            </article>
          ))}
        </div>
        <PublicRichText
          value={content.plannerPresentation.text}
          className={styles.lead}
        />
      </section>
    ) : null,
    facts: visible("facts") ? (
      <section id="facts" className={`${styles.section} ${styles.facts}`}>
        {content.facts.map((item, index) => (
          <div key={`${item.label}-${index}`}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>
    ) : null,
    reviews: visible("reviews") ? (
      <section id="reviews" className={`${styles.section} ${styles.ivory}`}>
        {sectionTitle(
          content.reviewsPresentation.eyebrow,
          content.reviewsPresentation.title,
        )}
        <div className={styles.reviewGrid}>
          {content.reviews.map((item, index) => (
            <blockquote key={`${item.author}-${index}`}>
              <PublicRichText value={item.quote} />
              <footer>
                {item.author}
                <span>{item.meta}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>
    ) : null,
    faq: visible("faq") ? (
      <section id="faq" className={`${styles.section} ${styles.navy}`}>
        {sectionTitle(
          content.faqPresentation.eyebrow,
          content.faqPresentation.title,
        )}
        <div className={styles.faq}>
          {content.faq.map((item, index) => (
            <details key={`${item.question}-${index}`}>
              <summary>{item.question}</summary>
              <PublicRichText value={item.answer} />
            </details>
          ))}
        </div>
      </section>
    ) : null,
    contact: visible("contact") ? (
      <section id="contact" className={`${styles.section} ${styles.contact}`}>
        {sectionTitle(content.contact.eyebrow, content.contact.title)}
        <PublicRichText value={content.contact.text} className={styles.lead} />
        <div className={styles.contactGrid}>
          <address>
            <span>{content.contact.address}</span>
            <a href={`tel:${content.contact.phone.replaceAll(" ", "")}`}>
              {content.contact.phone}
            </a>
            <a href={`mailto:${content.contact.email}`}>
              {content.contact.email}
            </a>
            <span>{content.contact.hours}</span>
          </address>
          <div
            className={styles.map}
            role="img"
            aria-label={content.contact.mapAria}
          >
            <i />
            <p>{content.contact.map}</p>
          </div>
        </div>
        <a className={styles.goldButton} href="#availability">
          {content.contact.cta}
        </a>
      </section>
    ) : null,
    footer: visible("footer") ? (
      <footer className={styles.footer}>
        <Link href={basePath}>{content.brand}</Link>
        <span>{content.footer.note}</span>
        <span>{content.footer.copyright}</span>
      </footer>
    ) : null,
  };
  const custom = new Map(
    (site.content.custom_blocks ?? []).map((block) => [
      `custom:${block.id}`,
      block,
    ]),
  );
  const order = site.content.layout_order?.length
    ? site.content.layout_order
    : Object.keys(sections).map((id) => `native:${VELORA_TEMPLATE_KEY}:${id}`);
  return (
    <main className={styles.site} style={theme}>
      <VeloraInteractiveShell venues={content.venues} packages={content.packages}>
        {order.map((token) => {
          const prefix = `native:${VELORA_TEMPLATE_KEY}:`;
          if (token.startsWith(prefix))
            return (
              <div key={token}>{sections[token.slice(prefix.length)]}</div>
            );
          const block = custom.get(token);
          return block ? (
            <PublicCustomBlock
              key={token}
              block={block}
              services={site.services}
              bookingHref="#availability"
            />
          ) : null;
        })}
      </VeloraInteractiveShell>
    </main>
  );
}
