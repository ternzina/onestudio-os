import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import PublicCustomBlock from "@/components/public/PublicCustomBlock";
import PublicRichText from "@/components/public/PublicRichText";
import { resolveVeloraContent } from "@/lib/public-site/velora-premium-template-content";
import { buildVeloraAvailabilityHref } from "@/lib/public-site/velora-availability-selection";
import { buildVeloraPageHref } from "@/lib/public-site/velora-navigation";
import { publicTypographyStyle } from "@/lib/public-site/typography";
import type { PublicSiteData, PublicSitePage } from "@/lib/public-site/types";
import {
  VeloraCursorTrail,
  VeloraFestiveRibbon,
  VeloraHeroTitle,
  VeloraPageEntrance,
  VeloraReveal,
  VeloraScrollProgress,
  VeloraStickyHeader,
} from "./VeloraInteractions";
import VeloraFooter from "./VeloraFooter";
import styles from "./Velora.module.css";

const BUILTIN_VENUES_IDS = new Set(["velora-venues", "planeta-espacios"]);
const BUILTIN_PACKAGES_IDS = new Set(["velora-packages", "planeta-experiencias"]);

export default function VeloraCustomPage({
  site,
  page,
  basePath,
}: {
  site: PublicSiteData;
  page: PublicSitePage;
  basePath: string;
}) {
  const content = resolveVeloraContent(site.content);
  const pageHref = (slug: string) => buildVeloraPageHref(basePath, slug);
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
  const localePageHref = (locale: string) => {
    const localizedBase = localeHref(locale);
    return buildVeloraPageHref(localizedBase, page.slug);
  };
  const visiblePages =
    site.content.pages?.filter(
      (item) =>
        item.type === "custom" &&
        item.is_visible !== false &&
        item.show_in_navigation,
    ) ?? [];
  const items =
    BUILTIN_VENUES_IDS.has(page.id)
      ? content.venues
      : BUILTIN_PACKAGES_IDS.has(page.id)
        ? content.packages
        : [];
  const theme = {
    "--velora-bg": site.content.theme_dark ?? "#07101E",
    "--velora-gold": site.content.theme_accent ?? "#D6B56E",
    "--velora-fg": site.content.theme_surface ?? "#F6F0E5",
    "--velora-elevated": content.plum,
    "--velora-muted": content.muted,
    "--velora-secondary": content.secondary,
    "--velora-border": content.border,
    "--velora-warm": content.warm,
    "--velora-overlay": content.overlay,
    "--velora-button-fg": content.buttonForeground,
  } as CSSProperties;
  const builtin =
    BUILTIN_VENUES_IDS.has(page.id) || BUILTIN_PACKAGES_IDS.has(page.id);
  const hero =
    BUILTIN_VENUES_IDS.has(page.id)
      ? {
          eyebrow: content.customPages.venuesEyebrow,
          title: content.customPages.venuesTitle,
          intro: content.customPages.venuesIntro,
        }
      : BUILTIN_PACKAGES_IDS.has(page.id)
        ? {
            eyebrow: content.customPages.packagesEyebrow,
            title: content.customPages.packagesTitle,
            intro: content.customPages.packagesIntro,
          }
        : { eyebrow: page.eyebrow, title: page.title, intro: page.intro };
  const heroImage =
    BUILTIN_VENUES_IDS.has(page.id)
      ? content.venues[0].image
      : BUILTIN_PACKAGES_IDS.has(page.id)
        ? content.packages[1].image
        : content.hero.image;
  const heroAlt =
    BUILTIN_VENUES_IDS.has(page.id)
      ? content.venues[0].alt
      : BUILTIN_PACKAGES_IDS.has(page.id)
        ? content.packages[1].alt
        : content.hero.alt;
  return (
    <main
      className={`${styles.site} ${styles.customPage}`}
      style={theme}
      data-visual-variant={content.visualVariant}
      data-locale={currentLocale}
      lang={currentLocale}
    >
      <VeloraPageEntrance />
      <VeloraScrollProgress />
      <VeloraCursorTrail />
      <VeloraStickyHeader className={styles.header}>
        <Link className={styles.logo} href={basePath}>
          {content.brand}
        </Link>
        <nav aria-label={currentLocale.startsWith("es") ? "Navegación principal" : "Main navigation"}>
          <Link href={basePath}>{content.customPages.homeLabel}</Link>
          {visiblePages.map((item) => (
            <Link key={item.id} href={pageHref(item.slug)}>
              {item.nav_label}
            </Link>
          ))}
        </nav>
        <div className={styles.languageSwitch} aria-label={currentLocale.startsWith("es") ? "Idioma" : "Language"}>
          {site.available_locales.map((locale) => (
            <Link
              key={locale}
              href={localePageHref(locale)}
              aria-current={locale === currentLocale ? "page" : undefined}
            >
              {locale.toUpperCase()}
            </Link>
          ))}
        </div>
        <Link className={styles.headerCta} href={`${basePath}#availability`}>
          {content.header.availabilityLabel}
        </Link>
      </VeloraStickyHeader>
      <section id="hero" className={styles.customHero}>
        <div className={styles.customHeroMedia}>
          <Image src={heroImage} alt={heroAlt} fill priority sizes="100vw" />
        </div>
        <div className={styles.customHeroShade} />
        <VeloraFestiveRibbon />
        <VeloraReveal className={styles.customHeroContent}>
          <span>{hero.eyebrow}</span>
          <VeloraHeroTitle title={hero.title} style={publicTypographyStyle(page.title_typography)} />
          <PublicRichText value={hero.intro} />
        </VeloraReveal>
      </section>
      <section className={`${styles.section} ${styles.ivory}`}>
        {items.length ? (
          <div className={styles.compare}>
            {items.map((item, index) => (
              <VeloraReveal
                as="article"
                key={`${item.name}-${index}`}
                direction={index % 2 ? "right" : "left"}
              >
                <div>
                  <Image
                    src={item.image}
                    alt={item.alt}
                    width={1200}
                    height={900}
                    sizes="(max-width: 768px) 92vw, 55vw"
                  />
                </div>
                <h2>{item.name}</h2>
                <strong>{item.result ?? item.mood}</strong>
                <p>{item.price ?? `${item.capacity} · ${item.area}`}</p>
                <PublicRichText value={item.includes ?? item.features} />
                <p>{item.decor ?? item.seating}</p>
                <p>{item.menu ?? item.formats}</p>
                <dl>
                  {Object.entries(item)
                    .filter(([key]) => ["area", "for"].includes(key))
                    .map(([key, value]) => (
                      <div key={key}>
                        <dt>
                          {key === "area"
                            ? content.customPages.areaLabel
                            : content.customPages.formatLabel}
                        </dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                </dl>
                <Link
                  href={buildVeloraAvailabilityHref(
                    basePath,
                    BUILTIN_VENUES_IDS.has(page.id) ? "venue" : "packageName",
                    item.name,
                  )}
                >
                  {content.customPages.requestLabel} →
                </Link>
              </VeloraReveal>
            ))}
          </div>
        ) : null}
        {!builtin &&
          page.blocks?.map((block) => (
            <PublicCustomBlock
              key={block.id}
              block={block}
              services={site.services}
              bookingHref={`${basePath}#availability`}
            />
          ))}
      </section>
      <VeloraFooter
        brand={content.brand}
        footer={content.footer}
        contact={content.contact}
        navigation={content.navigation}
        basePath={basePath}
        currentLocale={currentLocale}
        localeLinks={site.available_locales.map((locale) => ({
          locale,
          href: localePageHref(locale),
        }))}
      />
    </main>
  );
}
