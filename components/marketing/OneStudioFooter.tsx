"use client";

import Link from "next/link";
import MarketingBrand from "@/components/marketing/MarketingBrand";
import { getTranslations } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { SectionReveal } from "./SectionReveal";
import styles from "./OneStudioFooter.module.css";

type FooterLinkKind = "route";

type FooterLink = {
  label: string;
  href: string;
  kind: FooterLinkKind;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

function FooterLinkItem({ link }: { link: FooterLink }) {
  const className = `${styles.link} os-type-action`;

  if (link.kind === "route") {
    return <Link className={className} href={link.href}>{link.label}</Link>;
  }

  return <a className={className} href={link.href}>{link.label}</a>;
}

export function OneStudioFooter({ lang }: { lang: Locale }) {
  const t = getTranslations(lang).common;
  const columns: FooterColumn[] = [
    {
      title: t.footer.product,
      links: [
        { label: t.footer.links.features, href: "/features", kind: "route" },
        { label: t.footer.links.solutions, href: "/solutions", kind: "route" },
        { label: t.footer.links.templates, href: "/demos", kind: "route" },
        { label: t.footer.links.components, href: "/components", kind: "route" },
        { label: t.footer.links.pricing, href: "/pricing", kind: "route" },
      ],
    },
    {
      title: t.footer.oneStudio,
      links: [
        { label: t.footer.links.about, href: "/about", kind: "route" },
        { label: t.footer.links.website, href: "/website", kind: "route" },
        { label: t.footer.links.faq, href: "/faq", kind: "route" },
        { label: t.footer.links.blog, href: "/blog", kind: "route" },
      ],
    },
    {
      title: t.footer.information,
      links: [
        { label: t.footer.links.contact, href: "/contact", kind: "route" },
        { label: t.footer.links.privacy, href: "/privacy", kind: "route" },
        { label: t.footer.links.terms, href: "/terms", kind: "route" },
      ],
    },
  ];
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} aria-label={t.footer.navigationLabel}>
      <SectionReveal>
        <div className={styles.inner}>
          <div className={styles.topGrid}>
            <div className={styles.brandArea}>
              <MarketingBrand />
              <p className={`${styles.description} os-type-card-body`}>{t.footer.brandDescription}</p>
            </div>

            <nav className={styles.columns} aria-label={t.footer.navigationLabel}>
              {columns.map((column) => (
                <div className={styles.column} key={column.title}>
                  <h2 className={`${styles.columnTitle} os-type-eyebrow`}>{column.title}</h2>
                  <div className={styles.links}>
                    {column.links.map((link) => <FooterLinkItem key={`${column.title}-${link.label}`} link={link} />)}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <div className={styles.divider} />

          <div className={styles.bottomRow}>
            <small className={`${styles.copyright} os-type-micro`}>{t.footer.copyright} · {year}</small>
          </div>
        </div>
      </SectionReveal>
    </footer>
  );
}

export default OneStudioFooter;
