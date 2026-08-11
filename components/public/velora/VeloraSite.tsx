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
import VeloraFooter from "./VeloraFooter";
import {
  VeloraAvailability,
  VeloraCursorTrail,
  VeloraFestiveRibbon,
  VeloraGallery,
  VeloraHeroMedia,
  VeloraHeroTitle,
  VeloraInteractiveShell,
  VeloraMobileCta,
  VeloraPageEntrance,
  VeloraPackageCta,
  VeloraReveal,
  VeloraScrollProgress,
  VeloraStickyHeader,
  VeloraStoryFilm,
  VeloraTiltCard,
  VeloraTransformation,
  VeloraVenueReveal,
  VeloraVenueCta,
} from "./VeloraInteractions";
import styles from "./Velora.module.css";

const title = (eyebrow: string, heading: string, text?: string) => (
  <VeloraReveal className={styles.sectionTitle}>
    <span>{eyebrow}</span>
    <h2>{heading}</h2>
    {text ? <PublicRichText value={text} /> : null}
  </VeloraReveal>
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
  const currentLocale = site.business.locale;
  const primaryLocale = site.business.primary_locale;
  const currentSuffix = `/${currentLocale}`;
  const localizedRoot =
    currentLocale !== primaryLocale && basePath.endsWith(currentSuffix)
      ? basePath.slice(0, -currentSuffix.length) || "/"
      : basePath;
  const localeHref = (locale: string) =>
    locale === primaryLocale
      ? localizedRoot
      : `${localizedRoot.replace(/\/$/, "")}/${locale}`;
  const pages =
    site.content.pages?.filter(
      (page) =>
        page.type === "custom" &&
        page.is_visible !== false &&
        page.show_in_navigation,
    ) ?? [];
  const theme = {
    "--velora-bg": site.content.theme_dark ?? "#07101E",
    "--velora-elevated": content.plum,
    "--velora-fg": site.content.theme_surface ?? "#F6F0E5",
    "--velora-muted": content.muted,
    "--velora-gold": site.content.theme_accent ?? "#D6B56E",
    "--velora-secondary": content.secondary,
    "--velora-border": content.border,
    "--velora-warm": content.warm,
    "--velora-overlay": content.overlay,
    "--velora-button-fg": content.buttonForeground,
  } as CSSProperties;
  const sections: Record<string, ReactNode> = {
    hero: visible("hero") ? (
      <>
        <a className={styles.skip} href="#main-story">
          {currentLocale === "en" ? "Skip to content" : "Перейти к содержанию"}
        </a>
        <VeloraStickyHeader className={styles.header}>
          <Link href={basePath} className={styles.logo}>
            {content.brand}
          </Link>
          <nav
            aria-label={currentLocale === "en" ? "Main navigation" : "Главная навигация"}
          >
            {content.navigation.map((item) => (
              <Link key={item.href} href={`${basePath}${item.href}`}>
                {item.label}
              </Link>
            ))}
            {pages.map((page) => (
              <Link key={page.id} href={pageHref(page.slug)}>
                {page.nav_label}
              </Link>
            ))}
          </nav>
          <div className={styles.languageSwitch} aria-label="Language">
            {site.available_locales.map((locale) => (
              <Link
                key={locale}
                href={localeHref(locale)}
                aria-current={locale === currentLocale ? "page" : undefined}
              >
                {locale.toUpperCase()}
              </Link>
            ))}
          </div>
          <Link className={styles.headerCta} href="#availability">
            {content.header.availabilityLabel}
          </Link>
        </VeloraStickyHeader>
        <section id="hero" className={styles.hero}>
          <VeloraHeroMedia image={content.hero.image} alt={content.hero.alt} />
          <VeloraFestiveRibbon />
          <VeloraReveal className={styles.heroContent}>
            <span>{content.hero.eyebrow}</span>
            <VeloraHeroTitle title={content.hero.title} />
            <PublicRichText value={content.hero.text} />
            <div className={styles.actions}>
              <Link href={content.hero.primaryUrl}>
                {content.hero.primaryLabel}
              </Link>
              <Link href={content.hero.secondaryUrl}>
                {content.hero.secondaryLabel}
              </Link>
            </div>
            <small>{content.hero.traits}</small>
          </VeloraReveal>
          <a className={styles.scrollCue} href="#main-story">
            <i />
            {content.hero.scrollLabel}
          </a>
        </section>
      </>
    ) : null,
    facts: visible("facts") ? (
      <section
        id="main-story"
        className={styles.facts}
        aria-label={
          currentLocale === "en" ? "VELORA in numbers" : "VELORA в цифрах"
        }
      >
        {content.facts.map((item, index) => (
          <VeloraReveal key={item.label} delay={index * 0.08}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </VeloraReveal>
        ))}
      </section>
    ) : null,
    venues: visible("venues") ? (
      <section
        id="venues"
        className={`${styles.section} ${styles.lightSection} ${styles.venueSection}`}
      >
        {title(
          content.venuesPresentation.eyebrow,
          content.venuesPresentation.title,
          content.venuesPresentation.text,
        )}
        <div className={styles.venueGrid}>
          {content.venues.map((venue, index) => (
            <VeloraVenueReveal key={venue.name} index={index}>
              <VeloraTiltCard className={styles.venueCard}>
                <div className={styles.venueImage}>
                  <Image
                    src={venue.image}
                    alt={venue.alt}
                    fill
                    sizes="(max-width: 768px) 92vw, 55vw"
                  />
                  <span className={styles.venueNumber}>0{index + 1}</span>
                </div>
                <span>{venue.mood}</span>
                <h3>{venue.name}</h3>
                <strong>
                  {venue.capacity} · {venue.area}
                </strong>
                <PublicRichText value={venue.features} />
                <small>{venue.formats}</small>
                <VeloraVenueCta venue={venue.name} label={venue.cta} />
              </VeloraTiltCard>
            </VeloraVenueReveal>
          ))}
        </div>
        <Link className={styles.textLink} href={pageHref("venues")}>
          {content.venuesPresentation.pageLabel} →
        </Link>
      </section>
    ) : null,
    formats: visible("formats") ? (
      <section
        id="formats"
        className={`${styles.section} ${styles.elevated} ${styles.formatSection}`}
      >
        {title(
          content.formatsPresentation.eyebrow,
          content.formatsPresentation.title,
        )}
        <div className={styles.formatRail}>
          {content.formats.map((item, index) => (
            <VeloraReveal
              as="article"
              key={item.title}
              delay={index * 0.06}
              direction={index % 2 ? "right" : "left"}
            >
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <PublicRichText value={item.text} />
            </VeloraReveal>
          ))}
        </div>
      </section>
    ) : null,
    transformation: visible("transformation") ? (
      <section
        id="transformation"
        className={`${styles.section} ${styles.transformationSection}`}
      >
        {title(
          content.transformation.eyebrow,
          content.transformation.title,
          content.transformation.text,
        )}
        <VeloraTransformation copy={content.transformation} />
      </section>
    ) : null,
    story: visible("story") ? (
      <section id="story" className={`${styles.section} ${styles.story}`}>
        {title(
          content.storyPresentation.eyebrow,
          content.storyPresentation.title,
          content.storyPresentation.text,
        )}
        <VeloraStoryFilm
          items={content.story}
          images={[
            { image: content.transformation.beforeImage, alt: content.transformation.beforeAlt },
            { image: content.hero.image, alt: content.hero.alt },
            { image: content.cateringPresentation.image, alt: content.cateringPresentation.alt },
            { image: content.decor.image, alt: content.decor.alt },
            { image: content.gallery[1].image, alt: content.gallery[1].alt },
            { image: content.gallery[0].image, alt: content.gallery[0].alt },
          ]}
        />
      </section>
    ) : null,
    packages: visible("packages") ? (
      <section
        id="packages"
        className={`${styles.section} ${styles.lightSection} ${styles.packagesSection}`}
      >
        {title(
          content.packagesPresentation.eyebrow,
          content.packagesPresentation.title,
          content.packagesPresentation.text,
        )}
        <div className={styles.packageGrid}>
          {content.packages.map((item, index) => (
            <VeloraReveal key={item.name} delay={index * 0.1}>
              <VeloraTiltCard
                className={index === 1 ? styles.featured : ""}
              >
                <div className={styles.packageImage}>
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 90vw, 33vw"
                  />
                </div>
                <span>{item.for}</span>
                <h3>{item.name}</h3>
                <h4>{item.result}</h4>
                <strong>{item.price}</strong>
                <PublicRichText value={item.includes} />
                <VeloraPackageCta packageName={item.name} label={item.cta} />
              </VeloraTiltCard>
            </VeloraReveal>
          ))}
        </div>
        <Link className={styles.textLink} href={pageHref("packages")}>
          {content.packagesPresentation.pageLabel} →
        </Link>
      </section>
    ) : null,
    included: visible("included") ? (
      <section id="included" className={`${styles.section} ${styles.included}`}>
        {title(
          content.includedPresentation.eyebrow,
          content.includedPresentation.title,
          content.includedPresentation.text,
        )}
        <ol>
          {content.included.map((item) => (
            <li key={item.title}>
              <span>{item.number}</span>
              {item.title}
            </li>
          ))}
        </ol>
      </section>
    ) : null,
    catering: visible("catering") ? (
      <section
        id="catering"
        className={`${styles.section} ${styles.splitScene}`}
      >
        <div className={styles.sceneImage}>
          <Image
            src={content.cateringPresentation.image}
            alt={content.cateringPresentation.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <VeloraReveal direction="right">
          {title(
            content.cateringPresentation.eyebrow,
            content.cateringPresentation.title,
            content.cateringPresentation.text,
          )}
          <div className={styles.menuList}>
            {content.catering.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <span>{item.meta}</span>
              </article>
            ))}
          </div>
          <a className={styles.goldButton} href="#availability">
            {content.cateringPresentation.cta}
          </a>
        </VeloraReveal>
      </section>
    ) : null,
    decor: visible("decor") ? (
      <section
        id="decor"
        className={`${styles.section} ${styles.lightSection} ${styles.collage}`}
      >
        <div>
          {title(
            content.decor.eyebrow,
            content.decor.title,
            content.decor.text,
          )}
        </div>
        <div className={styles.collageImage}>
          <Image
            src={content.decor.image}
            alt={content.decor.alt}
            fill
            sizes="(max-width: 768px) 90vw, 48vw"
          />
        </div>
      </section>
    ) : null,
    coordinator: visible("coordinator") ? (
      <section
        id="coordinator"
        className={`${styles.section} ${styles.coordinator}`}
      >
        <div className={styles.coordinatorImage}>
          <Image
            src={content.coordinator.image}
            alt={content.coordinator.alt}
            fill
            sizes="(max-width: 768px) 100vw, 46vw"
          />
        </div>
        <div>
          {title(
            content.coordinator.eyebrow,
            content.coordinator.title,
            content.coordinator.text,
          )}
          <blockquote>{content.coordinator.promise}</blockquote>
        </div>
      </section>
    ) : null,
    reviews: visible("reviews") ? (
      <section
        id="stories"
        className={`${styles.section} ${styles.storiesSection}`}
      >
        {title(
          content.reviewsPresentation.eyebrow,
          content.reviewsPresentation.title,
        )}
        <p className={styles.disclaimer}>
          {content.reviewsPresentation.disclaimer}
        </p>
        <div className={styles.stories}>
          {content.reviews.map((item, index) => (
            <VeloraReveal
              as="article"
              key={item.author}
              direction={index % 2 ? "right" : "left"}
            >
              <div>
                <Image
                  src={item.image}
                  alt={item.alt}
                  width={900}
                  height={700}
                  sizes="(max-width: 768px) 92vw, 38vw"
                />
              </div>
              <span>{item.meta}</span>
              <h3>{item.task}</h3>
              <blockquote>“{item.quote}”</blockquote>
              <small>{item.author}</small>
            </VeloraReveal>
          ))}
        </div>
      </section>
    ) : null,
    gallery: visible("gallery") ? (
      <section id="gallery" className={`${styles.section} ${styles.gallery}`}>
        {title(
          content.galleryPresentation.eyebrow,
          content.galleryPresentation.title,
        )}
        <VeloraGallery
          items={content.gallery}
          copy={content.galleryPresentation}
        />
      </section>
    ) : null,
    planner: visible("planner") ? (
      <section
        id="planner"
        className={`${styles.section} ${styles.lightSection}`}
      >
        {title(
          content.plannerPresentation.eyebrow,
          content.plannerPresentation.title,
          content.plannerPresentation.text,
        )}
        <div className={styles.timeline}>
          {content.planner.map((item, index) => (
            <VeloraReveal as="article" key={item.number} delay={index * 0.08}>
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </VeloraReveal>
          ))}
        </div>
      </section>
    ) : null,
    faq: visible("faq") ? (
      <section
        id="faq"
        className={`${styles.section} ${styles.lightSection} ${styles.faqSection}`}
      >
        {title(content.faqPresentation.eyebrow, content.faqPresentation.title)}
        <div className={styles.faq}>
          {content.faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <PublicRichText value={item.answer} />
            </details>
          ))}
        </div>
      </section>
    ) : null,
    availability: visible("availability") ? (
      <section
        id="availability"
        className={`${styles.section} ${styles.availability}`}
      >
        {title(
          content.availability.eyebrow,
          content.availability.title,
          content.availability.text,
        )}
        <VeloraAvailability
          businessSlug={site.business.slug}
          venues={content.venues}
          packages={content.packages}
          formats={content.formats}
          copy={content.availability}
          locale={currentLocale}
        />
      </section>
    ) : null,
    footer: visible("footer") ? (
      <VeloraFooter
        brand={content.brand}
        footer={content.footer}
        contact={content.contact}
        navigation={content.navigation}
        basePath={basePath}
        currentLocale={currentLocale}
        localeLinks={site.available_locales.map((locale) => ({
          locale,
          href: localeHref(locale),
        }))}
      />
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
    <main
      className={styles.site}
      style={theme}
      data-locale={currentLocale}
      lang={currentLocale}
    >
      <VeloraPageEntrance />
      <VeloraScrollProgress />
      <VeloraCursorTrail />
      <VeloraInteractiveShell
        venues={content.venues}
        packages={content.packages}
      >
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
        <VeloraMobileCta label={content.header.availabilityLabel} />
      </VeloraInteractiveShell>
    </main>
  );
}
