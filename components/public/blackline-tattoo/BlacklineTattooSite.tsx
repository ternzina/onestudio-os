"use client";

import { Children, isValidElement, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import PublicCustomBlock from "@/components/public/PublicCustomBlock";
import PublicRichText from "@/components/public/PublicRichText";
import type { PremiumTemplatePublicHomeRendererProps } from "@/lib/public-site/premium-template-runtime-adapter";
import { resolveBlacklineTattooContent } from "@/lib/public-site/blackline-tattoo-premium-template-content";
import { normalizeTypography, publicTypographyStyle } from "@/lib/public-site/typography";
import { createBlacklineTattooRenderPlan } from "@/lib/public-site/blackline-tattoo-render-plan";
import { premiumNativeActionKey } from "@/lib/public-site/premium-action-style";
import styles from "./BlacklineTattooSite.module.css";

function Media({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
  return (
    <div
      className={`${styles.media} ${className}`}
      style={src ? { backgroundImage: `url(${src})` } : undefined}
      role="img"
      aria-label={alt}
    />
  );
}

function Composition({ site, children }: Pick<PremiumTemplatePublicHomeRendererProps, "site"> & { children: ReactNode }) {
  const native = new Map<string, ReactNode>();
  for (const child of Children.toArray(children)) {
    if (!isValidElement<{ "data-editor-anchor"?: string }>(child)) continue;
    const id = child.props["data-editor-anchor"];
    if (id) native.set(String(id), child);
  }

  return (
    <>
      {createBlacklineTattooRenderPlan(site.content).map((item) =>
        item.kind === "native" ? (
          <div key={item.key}>{native.get(item.sectionId)}</div>
        ) : (
          <PublicCustomBlock key={item.key} block={item.block} services={site.services} bookingHref="#consultation" />
        ),
      )}
    </>
  );
}

export default function BlacklineTattooSite({ site, basePath }: PremiumTemplatePublicHomeRendererProps) {
  const c = resolveBlacklineTattooContent(site.content);
  const en = site.business.locale === "en";
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const homePath = basePath.replace(/\/en$/, "");
  const heroTypography = normalizeTypography(c.headingTypography?.hero);
  const heroStyle = publicTypographyStyle(heroTypography);
  const consultationImage = c.consultation.image;
  const contactImage = c.contact.image;

  return (
    <main className={styles.site} lang={en ? "en" : "ru"}>
      <div className={styles.announcement}>{c.announcement}</div>
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label={c.brand}>
          <b>{c.brand}</b>
          <small>{c.brandNote}</small>
        </a>
        <button
          className={styles.menu}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="blackline-navigation"
          aria-label={en ? "Toggle navigation" : "Открыть навигацию"}
        >
          <span />
          <span />
        </button>
        <nav id="blackline-navigation" className={open ? styles.navOpen : ""} aria-label={en ? "BLACKLINE navigation" : "Навигация BLACKLINE"}>
          {c.navigation.map((item) => (
            <a key={item.text} href={item.text} onClick={() => setOpen(false)}>{item.title}</a>
          ))}
        </nav>
        <div className={styles.tools}>
          <span className={styles.locale}><Link href={homePath}>RU</Link><i>/</i><Link href={`${homePath}/en`}>EN</Link></span>
          <a className={styles.outline} data-premium-action={premiumNativeActionKey("blackline-tattoo", "hero", "header-cta")} href={c.headerCta.text}>{c.headerCta.title}<span>↗</span></a>
        </div>
      </header>

      <Composition site={site}>
        <section id="top" data-editor-anchor="hero" className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>{c.hero.eyebrow}</p>
            <h1 style={heroStyle}>{c.hero.title}</h1>
            <PublicRichText value={c.hero.text} className={styles.lead} />
            <div className={styles.actions}>
              <a className={styles.primary} data-premium-action={premiumNativeActionKey("blackline-tattoo", "hero", "primary")} href={c.hero.primaryHref}>{c.hero.primaryLabel}<span>↗</span></a>
              <a href={c.hero.secondaryHref} data-premium-action={premiumNativeActionKey("blackline-tattoo", "hero", "secondary")} className={styles.textLink}>{c.hero.secondaryLabel}<span>↗</span></a>
            </div>
            <div className={styles.trust}>{c.hero.trust.map((item) => <span key={item}>◇ {item}</span>)}</div>
          </div>
          <div className={styles.heroMedia}>
            <Media src={c.hero.image} alt={en ? "BLACKLINE tattoo studio" : "Тату-студия BLACKLINE"} />
            <div className={styles.imageShade} />
            <span className={styles.stamp}>BL / 01</span>
          </div>
        </section>

        <section id="styles" data-editor-anchor="styles" className={styles.section}>
          <Heading index="01 / STYLE" title={c.stylesPresentation.title} text={c.stylesPresentation.text} style={publicTypographyStyle(c.headingTypography?.styles)} />
          <div className={styles.cards}>{c.styles.map((item, index) => <article className={styles.imageCard} key={item.title}><Media src={item.image} alt={item.title} /><div className={styles.imageShade} /><span className={styles.cardNumber}>0{index + 1}</span><div className={styles.cardCopy}><h3>{item.title}</h3><PublicRichText value={item.text} /></div><span className={styles.cardArrow}>↗</span></article>)}</div>
        </section>

        <section id="artists" data-editor-anchor="artists" className={`${styles.section} ${styles.panel}`}>
          <Heading index="02 / ARTISTS" title={c.artistsPresentation.title} text={c.artistsPresentation.text} style={publicTypographyStyle(c.headingTypography?.artists)} />
          <div className={styles.people}>{c.artists.map((item, index) => <article key={item.title}><Media src={item.image} alt={item.title} /><PublicRichText value={item.text} /><h3>{item.title}</h3><a data-premium-action={premiumNativeActionKey("blackline-tattoo", "artists", `artist-${index}-cta`)} href={item.ctaHref}>{item.ctaLabel}<span>↗</span></a></article>)}</div>
        </section>

        <section id="portfolio" data-editor-anchor="portfolio" className={styles.section}>
          <Heading index="03 / SELECTED WORK" title={c.portfolio.title} text={c.portfolio.text} style={publicTypographyStyle(c.headingTypography?.portfolio)} />
          <div className={styles.gallery}>{c.portfolio.items.map((item, index) => <figure key={`${item.category}-${index}`}><Media src={item.image} alt={item.text} /><div className={styles.imageShade} /><figcaption><span>{item.category}</span><span>0{index + 1}</span></figcaption></figure>)}</div>
        </section>

        <section id="consultation" data-editor-anchor="consultation" className={`${styles.section} ${styles.consult}`}>
          <div className={styles.consultCopy}><p className={styles.kicker}>04 / CONSULTATION</p><h2 style={publicTypographyStyle(c.headingTypography?.consultation)}>{c.consultation.title}</h2><PublicRichText value={c.consultation.text} /><Media src={consultationImage} alt={en ? "BLACKLINE consultation details" : "Детали консультации BLACKLINE"} className={styles.consultImage} /></div>
          {sent ? <PublicRichText value={c.consultation.success} className={styles.success} /> : <form onSubmit={(event) => { event.preventDefault(); setSent(true); }}>{c.consultation.fields.map((field, index) => <input key={field} required={index === 0} placeholder={field} />)}<button className={styles.primary} data-premium-action={premiumNativeActionKey("blackline-tattoo", "consultation", "cta")} type="submit">{c.consultation.ctaLabel}<span>↗</span></button></form>}
        </section>

        <section id="process" data-editor-anchor="process" className={styles.section}><Heading index="05 / PROCESS" title={c.processPresentation.title} text={c.processPresentation.text} style={publicTypographyStyle(c.headingTypography?.process)} /><div className={styles.steps}>{c.process.map((item, index) => <article key={item.title}><b>0{index + 1}</b><h3>{item.title}</h3><PublicRichText value={item.text} /></article>)}</div></section>
        <section id="safety" data-editor-anchor="safety" className={`${styles.section} ${styles.lime}`}><Heading index="06 / SAFETY" title={c.safety.title} text={c.safety.text} style={publicTypographyStyle(c.headingTypography?.safety)} /><ul>{c.safety.items.map((item) => <li key={item}><PublicRichText value={item} /></li>)}</ul></section>
        <section id="care" data-editor-anchor="care" className={`${styles.section} ${styles.panel}`}><Heading index="07 / CARE" title={c.care.title} text={c.care.text} style={publicTypographyStyle(c.headingTypography?.care)} /><div className={styles.steps}>{c.care.groups.map((item, index) => <article key={item.title}><b>0{index + 1}</b><h3>{item.title}</h3><PublicRichText value={item.text} /></article>)}</div></section>
        <section id="testimonials" data-editor-anchor="testimonials" className={`${styles.section} ${styles.quoteSection}`}><Heading index="08 / TRUST" title={c.testimonialsPresentation.title} text={c.testimonialsPresentation.text} style={publicTypographyStyle(c.headingTypography?.testimonials)} />{c.testimonials.map((item) => <blockquote key={item.title}><PublicRichText value={item.text} /><footer>{item.title}</footer></blockquote>)}</section>
        <section id="faq" data-editor-anchor="faq" className={styles.section}><Heading index="09 / FAQ" title={c.faqPresentation.title} text={c.faqPresentation.text} style={publicTypographyStyle(c.headingTypography?.faq)} /><div className={styles.faq}>{c.faq.map((item, index) => <details key={item.title} open={index === 0}><summary>{item.title}<span>＋</span></summary><PublicRichText value={item.text} /></details>)}</div></section>
        <section id="contact" data-editor-anchor="contact" className={`${styles.section} ${styles.contact}`}><div><Heading index="10 / CONTACT" title={c.contact.title} text={c.contact.text} style={publicTypographyStyle(c.headingTypography?.contact)} /><div className={styles.contactRows}><span>{c.contact.hours}</span><span>{c.contact.address}</span><a href={`tel:${c.contact.phone}`}>{c.contact.phone}</a><a href={`mailto:${c.contact.email}`}>{c.contact.email}</a></div><a className={styles.primary} data-premium-action={premiumNativeActionKey("blackline-tattoo", "contact", "cta")} href={c.contact.ctaHref}>{c.contact.ctaLabel}<span>↗</span></a></div><Media src={contactImage} alt={en ? "BLACKLINE studio detail" : "Деталь студии BLACKLINE"} className={styles.contactImage} /></section>
        <footer id="footer" data-editor-anchor="footer" className={styles.footer}><div className={styles.footerLead}><a className={styles.brand} href="#top"><b>{c.footer.title}</b><small>{c.brandNote}</small></a><PublicRichText value={c.footer.text} /><a className={styles.primary} data-premium-action={premiumNativeActionKey("blackline-tattoo", "footer", "cta")} href={c.footer.ctaHref}>{c.footer.ctaLabel}<span>↗</span></a></div><nav aria-label={en ? "Footer navigation" : "Навигация в подвале"}>{c.footer.navigation.map((item) => <a key={item.text} href={item.text}>{item.title}<span>↗</span></a>)}</nav><div className={styles.footerContact}><p>{c.footer.address}</p><p><a href={`tel:${c.footer.phone}`}>{c.footer.phone}</a><br /><a href={`mailto:${c.footer.email}`}>{c.footer.email}</a></p></div><PublicRichText value={c.footer.credit} className={styles.credit} /></footer>
      </Composition>
    </main>
  );
}

function Heading({ index, title, text, style }: { index: string; title: string; text?: string; style?: CSSProperties }) {
  return <div className={styles.heading}><div><p className={styles.kicker}>{index}</p><h2 style={style}>{title}</h2></div>{text ? <PublicRichText value={text} /> : null}</div>;
}
