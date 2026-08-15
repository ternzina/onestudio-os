"use client";

import { Children, isValidElement, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import PublicCustomBlock from "@/components/public/PublicCustomBlock";
import type { PremiumTemplatePublicHomeRendererProps } from "@/lib/public-site/premium-template-runtime-adapter";
import { premiumNativeActionKey, premiumNativeActionStyleSheet } from "@/lib/public-site/premium-action-style";
import { resolveBloomFloralStudioContent, type BloomItem } from "@/lib/public-site/bloom-floral-studio-premium-template-content";
import { createBloomFloralStudioRenderPlan } from "@/lib/public-site/bloom-floral-studio-render-plan";
import { publicTypographyStyle } from "@/lib/public-site/typography";
import styles from "./BloomFloralStudioSite.module.css";

const key = (section: string, id: string) => premiumNativeActionKey("bloom-floral-studio", section, `${section}-${id}`);

function Action({ section, id, action, className = "" }: { section: string; id: string; action: { title: string; text: string }; className?: string }) {
  return <a className={`${styles.action} ${className}`} href={action.text} data-premium-action={key(section, id)}>{action.title}<span aria-hidden="true">↗</span></a>;
}

function Media({ src, label, className = "" }: { src?: string; label: string; className?: string }) {
  return <div className={`${styles.media} ${className}`} style={src ? { backgroundImage: `url(${src})` } : undefined} role="img" aria-label={label} />;
}

function SectionHeading({ meta, title, text, style }: { meta: string; title: string; text?: string; style?: CSSProperties }) {
  return <div className={styles.heading}><small className={styles.eyebrow}>{meta}</small><h2 style={style}>{title}</h2>{text && <p className={styles.intro}>{text}</p>}</div>;
}

function Composition({ site, children }: Pick<PremiumTemplatePublicHomeRendererProps, "site"> & { children: ReactNode }) {
  const native = new Map<string, ReactNode>();
  for (const child of Children.toArray(children)) {
    if (!isValidElement<{ "data-editor-anchor"?: string }>(child)) continue;
    const id = child.props["data-editor-anchor"];
    if (id) native.set(String(id), child);
  }
  return <>{createBloomFloralStudioRenderPlan(site.content).map((part) => part.kind === "native" ? <div key={part.key}>{native.get(part.sectionId)}</div> : <PublicCustomBlock key={part.key} block={part.block} services={site.services} bookingHref="#contact" />)}</>;
}

function ItemList({ items, className = "" }: { items: BloomItem[]; className?: string }) {
  return <div className={`${styles.itemList} ${className}`}>{items.map((item, index) => <article className={styles.listItem} key={`${item.title}-${index}`}><span className={styles.itemIndex}>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.text}</p></div><span className={styles.itemMeta}>{item.meta}</span></article>)}</div>;
}

export default function BloomFloralStudioSite({ site, basePath }: PremiumTemplatePublicHomeRendererProps) {
  const c = resolveBloomFloralStudioContent(site.content);
  const en = site.business.locale === "en";
  const [open, setOpen] = useState(false);
  const homePath = basePath.replace(/\/en$/, "");
  const heading = (section: keyof typeof c.headingTypography) => publicTypographyStyle(c.headingTypography?.[section]);

  return <main className={styles.page} lang={en ? "en" : "ru"}>
    <style dangerouslySetInnerHTML={{ __html: premiumNativeActionStyleSheet(site.content, "bloom-floral-studio") }} />
    <header className={styles.header}>
      <a className={styles.logo} href="#top" aria-label={c.brand}><b>{c.brand}</b><small>{c.brandNote}</small></a>
      <button className={styles.menu} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="bloom-navigation" aria-label={en ? "Toggle navigation" : "Открыть навигацию"}><i /><i /></button>
      <nav id="bloom-navigation" className={open ? styles.navOpen : ""} aria-label={en ? "BLOOM navigation" : "Навигация BLOOM"}>{c.navigation.map((item) => <a key={item.text} href={item.text} onClick={() => setOpen(false)}>{item.title}</a>)}</nav>
      <div className={styles.headerTools}><span className={styles.locales}><Link href={homePath} aria-current={!en ? "page" : undefined}>RU</Link><i>/</i><Link href={`${homePath}/en`} aria-current={en ? "page" : undefined}>EN</Link></span><Action section="hero" id="header" action={c.headerCta} className={styles.headerCta} /></div>
    </header>

    <Composition site={site}>
      <section id="top" data-editor-anchor="hero" className={styles.hero}>
        <div className={styles.heroCopy}><small className={styles.eyebrow}>{c.hero.eyebrow}</small><h1 style={heading("hero")}>{c.hero.title}</h1><p className={styles.lead}>{c.hero.text}</p><div className={styles.actions}><Action section="hero" id="primary" action={c.hero.primary} /><Action section="hero" id="secondary" action={c.hero.secondary} className={styles.textAction} /></div><div className={styles.heroFoot}><span>01 — 07</span><span>{en ? "Seasonal flowers, considered slowly." : "Сезонные цветы, собранные с вниманием."}</span></div></div>
        <div className={styles.heroVisual}><Media src={c.hero.image} label="BLOOM floral atelier" className={styles.heroMedia} /><span className={styles.heroSeal}>B<br /><em>✳</em><br />24</span><span className={styles.heroCaption}>{en ? "A study in colour & form" : "Исследование цвета и формы"}</span></div>
      </section>

      <section id="collections" data-editor-anchor="collections" className={`${styles.section} ${styles.collections}`}><SectionHeading meta={c.collections.meta ?? "01 / COLLECTIONS"} title={c.collections.title} text={c.collections.text} style={heading("collections")} /><div className={styles.collectionGrid}>{c.collections.items.map((item, index) => <article className={`${styles.collectionCard} ${styles[`collection${index + 1}`]}`} key={item.title}><Media src={item.image} label={item.title} className={styles.collectionMedia} /><div className={styles.cardOverlay}><span>0{index + 1}</span><small>{item.meta}</small></div><div className={styles.cardCopy}><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div><Action section="collections" id="cta" action={c.collections.cta} className={styles.underlinedAction} /></section>

      <section id="occasions" data-editor-anchor="occasions" className={`${styles.section} ${styles.occasions}`}><SectionHeading meta={c.occasions.meta ?? "02 / OCCASIONS"} title={c.occasions.title} text={c.occasions.text} style={heading("occasions")} /><ItemList items={c.occasions.items} className={styles.occasionList} /><div className={styles.occasionNote}><span>✳</span>{en ? "The right flower is often the one you cannot name yet." : "Иногда правильный цветок — тот, название которого вы ещё не знаете."}</div></section>

      <section id="delivery" data-editor-anchor="delivery" className={`${styles.feature} ${styles.delivery}`}><div className={styles.featureVisual}><Media src={c.delivery.image} label={c.delivery.title} className={styles.deliveryMedia} /><span className={styles.imageLabel}>BEFORE DISPATCH / 03</span></div><div className={styles.featureCopy}><small className={styles.eyebrow}>{c.delivery.meta}</small><h2 style={heading("delivery")}>{c.delivery.title}</h2><p>{c.delivery.text}</p><div className={styles.deliverySteps}><span><b>01</b>{en ? "Choose a window" : "Выберите интервал"}</span><span><b>02</b>{en ? "Add a note or gift card" : "Добавьте открытку или подпись"}</span><span><b>03</b>{en ? "See it before it leaves" : "Увидьте букет до отправки"}</span></div><Media src={c.delivery.detailImage} label={en ? "Flower detail" : "Деталь букета"} className={styles.detailMedia} /><Action section="delivery" id="cta" action={c.delivery.cta} className={styles.underlinedAction} /></div></section>

      <section id="weddings" data-editor-anchor="weddings" className={`${styles.section} ${styles.weddings}`}><div className={styles.weddingIntro}><small className={styles.eyebrow}>{c.weddings.meta}</small><h2 style={heading("weddings")}>{c.weddings.title}</h2><p className={styles.intro}>{c.weddings.text}</p><Action section="weddings" id="cta" action={c.weddings.cta} /></div><div className={styles.weddingVisual}><Media src={c.weddings.image} label={c.weddings.title} className={styles.weddingMedia} /><span>THE FLORAL STORY / 04</span></div><ItemList items={c.weddings.items} className={styles.weddingList} /></section>

      <section id="subscription" data-editor-anchor="subscription" className={`${styles.feature} ${styles.subscription}`}><div className={styles.subscriptionCopy}><small className={styles.eyebrow}>{c.subscription.meta}</small><h2 style={heading("subscription")}>{c.subscription.title}</h2><p>{c.subscription.text}</p><ItemList items={c.subscription.items} className={styles.subscriptionList} /><Action section="subscription" id="cta" action={c.subscription.cta} className={styles.lightAction} /></div><div className={styles.subscriptionVisual}><Media src={c.subscription.image} label={c.subscription.title} className={styles.subscriptionMedia} /><span>HOME / OFFICE / 05</span></div></section>

      <section id="workshops" data-editor-anchor="workshops" className={`${styles.section} ${styles.workshops}`}><div className={styles.workshopVisual}><Media src={c.workshops.image} label={c.workshops.title} className={styles.workshopMedia} /><span className={styles.ticketMark}>✳</span></div><div className={styles.workshopCopy}><small className={styles.eyebrow}>{c.workshops.meta}</small><h2 style={heading("workshops")}>{c.workshops.title}</h2><p className={styles.intro}>{c.workshops.text}</p><ItemList items={c.workshops.items} className={styles.workshopList} /><Action section="workshops" id="cta" action={c.workshops.cta} className={styles.underlinedAction} /></div></section>

      <section id="testimonials" data-editor-anchor="testimonials" className={`${styles.section} ${styles.testimonials}`}><small className={styles.eyebrow}>07 / KIND WORDS</small><h2 style={heading("testimonials")}>{en ? "A few words from our clients." : "Несколько слов от наших гостей."}</h2><div className={styles.quotes}>{c.testimonials.map((item) => <blockquote key={item.title}><span>“</span><p>{item.title}</p><footer>{item.meta}<br /><small>{item.text}</small></footer></blockquote>)}</div></section>

      <section id="faq" data-editor-anchor="faq" className={`${styles.section} ${styles.faqSection}`}><div><small className={styles.eyebrow}>08 / FAQ</small><h2 style={heading("faq")}>{en ? "Questions, answered." : "Ответы на вопросы."}</h2></div><div className={styles.faq}>{c.faq.map((item, index) => <details key={item.title} open={index === 0}><summary><span>{item.title}</span><b>+</b></summary><p>{item.text}</p></details>)}</div></section>

      <section id="contact" data-editor-anchor="contact" className={styles.contact}><div className={styles.contactCopy}><small className={styles.eyebrow}>{c.contact.meta}</small><h2 style={heading("contact")}>{c.contact.title}</h2><p>{c.contact.text}</p><div className={styles.contactFacts}><span>{en ? "ORDERING" : "ЗАКАЗ"}<b>{en ? "Personal guidance" : "Личный подбор"}</b></span><span>{en ? "ATELIER" : "МАСТЕРСКАЯ"}<b>{en ? "Pickup by arrangement" : "Самовывоз по договорённости"}</b></span><span>{en ? "CARE" : "УХОД"}<b>{en ? "A note with every order" : "Памятка с каждым заказом"}</b></span></div><Action section="contact" id="cta" action={c.contact.cta} className={styles.lightAction} /></div><div className={styles.contactDetail}><Media src={c.contact.image} label={c.contact.title} className={styles.contactMedia} /><Media src={c.contact.detailImage} label={en ? "Atelier detail" : "Деталь мастерской"} className={styles.contactDetailMedia} /><p>{c.contact.address}<br />{c.contact.phone}<br /><a href={`mailto:${c.contact.email}`}>{c.contact.email}</a></p></div></section>

      <footer data-editor-anchor="footer" className={styles.footer}><div className={styles.footerLead}><a className={styles.logo} href="#top"><b>{c.footer.title}</b><small>{c.brandNote}</small></a><p>{c.footer.text}</p><Action section="footer" id="cta" action={c.footer.cta} className={styles.lightAction} /></div><nav aria-label={en ? "Footer navigation" : "Навигация в подвале"}>{c.footer.navigation.map((item) => <a key={item.text} href={item.text}>{item.title}<span>↗</span></a>)}</nav><div className={styles.footerContact}><span>{en ? "WRITE OR VISIT" : "НАПИШИТЕ ИЛИ ЗАХОДИТЕ"}</span><p>{c.contact.address}<br /><a href={`mailto:${c.contact.email}`}>{c.contact.email}</a></p></div><small className={styles.credit}>{c.footer.copyright}<br />{en ? "Made with OneStudio OS" : "Сделано на OneStudio OS"}</small></footer>
    </Composition>
  </main>;
}
