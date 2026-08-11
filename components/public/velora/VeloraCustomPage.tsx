import type { CSSProperties } from "react";
import Link from "next/link";
import PublicCustomBlock from "@/components/public/PublicCustomBlock";
import PublicRichText from "@/components/public/PublicRichText";
import { resolveVeloraContent } from "@/lib/public-site/velora-premium-template-content";
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
    "--navy": site.content.theme_dark ?? "#101827",
    "--gold": site.content.theme_accent ?? "#C6A66B",
    "--ivory": site.content.theme_surface ?? "#F4EFE6",
    "--plum": content.plum || "#6D4055",
  } as CSSProperties;
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
        <span>{page.eyebrow}</span>
        <h1>{page.title}</h1>
        <PublicRichText value={page.intro} />
      </section>
      <section className={`${styles.section} ${styles.ivory}`}>
        {items.length ? (
          <div className={styles.compare}>
            {items.map((item, index) => (
              <article key={`${item.name}-${index}`}>
                <h2>{item.name}</h2>
                <strong>{item.price ?? item.capacity}</strong>
                <PublicRichText value={item.includes ?? item.features} />
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
                <Link href={`${basePath}#availability`}>
                  {content.customPages.requestLabel} →
                </Link>
              </article>
            ))}
          </div>
        ) : null}
        {page.blocks?.map((block) => (
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
