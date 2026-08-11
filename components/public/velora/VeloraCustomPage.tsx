import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import PublicCustomBlock from "@/components/public/PublicCustomBlock";
import PublicRichText from "@/components/public/PublicRichText";
import { resolveVeloraContent } from "@/lib/public-site/velora-premium-template-content";
import { buildVeloraAvailabilityHref } from "@/lib/public-site/velora-availability-selection";
import type { PublicSiteData, PublicSitePage } from "@/lib/public-site/types";
import styles from "./Velora.module.css";

const BUILTIN_VENUES_ID = "velora-venues";
const BUILTIN_PACKAGES_ID = "velora-packages";

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
  const pageHref = (slug: string) =>
    basePath.startsWith("/demos/")
      ? `${basePath}/${slug}`
      : `${basePath}/p/${slug}`;
  const visiblePages =
    site.content.pages?.filter(
      (item) =>
        item.type === "custom" &&
        item.is_visible !== false &&
        item.show_in_navigation,
    ) ?? [];
  const items =
    page.id === BUILTIN_VENUES_ID
      ? content.venues
      : page.id === BUILTIN_PACKAGES_ID
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
    page.id === BUILTIN_VENUES_ID || page.id === BUILTIN_PACKAGES_ID;
  const hero =
    page.id === BUILTIN_VENUES_ID
      ? {
          eyebrow: content.customPages.venuesEyebrow,
          title: content.customPages.venuesTitle,
          intro: content.customPages.venuesIntro,
        }
      : page.id === BUILTIN_PACKAGES_ID
        ? {
            eyebrow: content.customPages.packagesEyebrow,
            title: content.customPages.packagesTitle,
            intro: content.customPages.packagesIntro,
          }
        : { eyebrow: page.eyebrow, title: page.title, intro: page.intro };
  return (
    <main className={`${styles.site} ${styles.customPage}`} style={theme}>
      <header className={styles.header}>
        <Link className={styles.logo} href={basePath}>
          {content.brand}
        </Link>
        <nav>
          <Link href={basePath}>{content.customPages.homeLabel}</Link>
          {visiblePages.map((item) => (
            <Link key={item.id} href={pageHref(item.slug)}>
              {item.nav_label}
            </Link>
          ))}
        </nav>
        <Link className={styles.headerCta} href={`${basePath}#availability`}>
          {content.header.availabilityLabel}
        </Link>
      </header>
      <section className={styles.customHero}>
        <span>{hero.eyebrow}</span>
        <h1>{hero.title}</h1>
        <PublicRichText value={hero.intro} />
      </section>
      <section className={`${styles.section} ${styles.ivory}`}>
        {items.length ? (
          <div className={styles.compare}>
            {items.map((item, index) => (
              <article key={`${item.name}-${index}`}>
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
                    page.id === BUILTIN_VENUES_ID ? "venue" : "packageName",
                    item.name,
                  )}
                >
                  {content.customPages.requestLabel} →
                </Link>
              </article>
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
      <footer className={styles.footer}>
        <Link href={basePath}>{content.brand}</Link>
        <span>{content.footer.note}</span>
        <span>{content.footer.copyright}</span>
      </footer>
    </main>
  );
}
