import Link from "next/link";
import type { VeloraItem } from "@/lib/public-site/velora-premium-template-content";
import styles from "./Velora.module.css";

type LocaleLink = {
  locale: string;
  href: string;
};

export default function VeloraFooter({
  brand,
  footer,
  contact,
  navigation,
  basePath,
  localeLinks,
  currentLocale,
}: {
  brand: string;
  footer: VeloraItem;
  contact: VeloraItem;
  navigation: VeloraItem[];
  basePath: string;
  localeLinks: LocaleLink[];
  currentLocale: string;
}) {
  const phoneHref = `tel:${contact.phone.replace(/[^\d+]/g, "")}`;
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGlow} aria-hidden="true" />
      <div className={styles.footerGrid}>
        <div className={styles.footerBrand}>
          <span>{footer.note}</span>
          <Link href={basePath}>{brand}</Link>
          <p>{footer.tagline}</p>
          <Link data-premium-action="velora-event-venue:footer:cta" className={styles.footerCta} href={`${basePath}#availability`}>
            {footer.cta} <i aria-hidden="true">↗</i>
          </Link>
        </div>

        <nav className={styles.footerNav} aria-label={footer.navigationLabel}>
          <span>{footer.navigationLabel}</span>
          {navigation.map((item) => (
            <Link key={item.href} href={`${basePath}${item.href}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.footerContact}>
          <span>{footer.contactLabel}</span>
          <address>
            <p>{contact.address}</p>
            <a href={phoneHref}>{contact.phone}</a>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            <small>{contact.hours}</small>
          </address>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <span>{footer.copyright}</span>
        <div className={styles.footerLanguages} aria-label={footer.languageLabel}>
          <span>{footer.languageLabel}</span>
          {localeLinks.map(({ locale, href }) => (
            <Link
              key={locale}
              href={href}
              aria-current={locale === currentLocale ? "page" : undefined}
            >
              {locale.toUpperCase()}
            </Link>
          ))}
        </div>
        <Link className={styles.footerTop} href="#hero">
          {footer.topLabel} ↑
        </Link>
      </div>
    </footer>
  );
}
