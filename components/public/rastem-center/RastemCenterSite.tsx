"use client";

import { Children, FormEvent, isValidElement, type ReactNode, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PublicCustomBlock from "@/components/public/PublicCustomBlock";
import type { PremiumTemplatePublicHomeRendererProps } from "@/lib/public-site/premium-template-runtime-adapter";
import { premiumNativeActionKey } from "@/lib/public-site/premium-action-style";
import { createRastemCenterRenderPlan } from "@/lib/public-site/rastem-center-render-plan";
import { resolveRastemCenterContent } from "@/lib/public-site/rastem-center-premium-template-content";
import styles from "./RastemCenterSite.module.css";

function Composition({ site, children }: Pick<PremiumTemplatePublicHomeRendererProps, "site"> & { children: ReactNode }) {
  const native = new Map<string, ReactNode>();
  for (const child of Children.toArray(children)) {
    if (isValidElement<{ "data-editor-anchor"?: string }>(child)) {
      const anchor = child.props["data-editor-anchor"];
      if (anchor) native.set(anchor, child);
    }
  }
  return createRastemCenterRenderPlan(site.content).map((item) => item.kind === "native"
    ? <div className={styles.planItem} key={item.key} data-editor-anchor={item.sectionId}>{native.get(item.sectionId)}</div>
    : <div className={styles.planItem} key={item.key} data-editor-anchor={item.key}><PublicCustomBlock block={item.block} services={site.services} bookingHref="#trial" /></div>);
}

function SectionHeading({ eyebrow, title, text, tone = "blue" }: { eyebrow: string; title: string; text?: string; tone?: "blue" | "navy" | "yellow" }) {
  return <div className={`${styles.sectionHeading} ${styles[`heading_${tone}`]}`}><p className={styles.eyebrow}>{eyebrow}</p><h2>{title}</h2>{text ? <p className={styles.sectionLead}>{text}</p> : null}</div>;
}

export default function RastemCenterSite({ site, basePath }: PremiumTemplatePublicHomeRendererProps) {
  const content = resolveRastemCenterContent(site.content);
  const locale = site.business.locale === "en" ? "en" : "ru";
  const rootPath = basePath.endsWith("/en") ? basePath.slice(0, -3) : basePath;
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState("Все");
  const [sent, setSent] = useState(false);
  const [scheduleAge, setScheduleAge] = useState("");
  const filteredSchedule = useMemo(() => filter === content.schedule.filters[0] ? content.schedule.items : content.schedule.items.filter((item) => item.age === filter), [content.schedule.filters, content.schedule.items, filter]);
  const submitTrial = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };

  return <main className={styles.page} lang={locale}>
    <div className={styles.promo}>{content.promo}</div>
    <header className={styles.header}>
      <a className={styles.logo} href="#top" aria-label={content.brand}><strong>{content.brand}</strong><span>{content.brandNote}</span></a>
      <button className={styles.menuButton} type="button" aria-expanded={menuOpen} aria-controls="rastem-navigation" onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /><span className={styles.srOnly}>{locale === "en" ? "Menu" : "Меню"}</span></button>
      <nav id="rastem-navigation" className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`} aria-label={locale === "en" ? "Main navigation" : "Основная навигация"}>{content.navigation.map((item) => <a href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}</nav>
      <div className={styles.headerTools}><span className={styles.locales}><Link href={rootPath} aria-current={locale === "ru" ? "page" : undefined}>RU</Link><Link href={`${rootPath}/en`} aria-current={locale === "en" ? "page" : undefined}>EN</Link></span><a className={styles.headerCta} href="#trial">{content.trial.buttonLabel}</a></div>
    </header>

    <Composition site={site}>
      <section className={styles.hero} id="top" data-editor-anchor="hero">
        <div className={styles.heroCopy}><span className={`${styles.doodle} ${styles.sun}`} aria-hidden="true">☼</span><p className={styles.eyebrow}>{content.hero.eyebrow}</p><h1>{content.hero.title}</h1><p className={styles.heroLead}>{content.hero.text}</p><div className={styles.heroActions}><a className={styles.primaryButton} data-premium-action={premiumNativeActionKey("rastem-center", "hero", "primary")} href={content.hero.primaryUrl}>{content.hero.primaryLabel}</a><a className={styles.textLink} data-premium-action={premiumNativeActionKey("rastem-center", "hero", "secondary")} href={content.hero.secondaryUrl}>{content.hero.secondaryLabel} <span aria-hidden="true">→</span></a></div><div className={styles.heroFacts}>{content.hero.facts.map((fact, index) => <span key={fact}><b aria-hidden="true">{["♧", "♕", "▣"][index]}</b>{fact}</span>)}</div></div>
        <div className={styles.heroPhoto}><Image src={content.hero.image} alt={content.hero.imageAlt} fill priority sizes="(max-width: 860px) 100vw, 52vw" /><span className={`${styles.doodle} ${styles.loop}`} aria-hidden="true">⌁</span></div>
      </section>

      <section className={styles.section} id="ages" data-editor-anchor="ages"><SectionHeading eyebrow={content.ages.eyebrow} title={content.ages.title} text={content.ages.text} /><div className={styles.ageGrid}>{content.ages.items.map((item) => <article className={`${styles.ageCard} ${styles[item.tone]}`} key={item.label}><div className={styles.ageImage}><Image src={item.image} alt={item.note} fill sizes="(max-width: 720px) 50vw, 220px" /></div><h3>{item.label}</h3><p>{item.note}</p></article>)}</div></section>

      <section className={`${styles.section} ${styles.programSection}`} id="programs" data-editor-anchor="programs"><SectionHeading eyebrow={content.programs.eyebrow} title={content.programs.title} text={content.programs.text} /><div className={styles.programGrid}>{content.programs.items.map((item) => <article className={styles.programCard} key={item.title}><div className={styles.programImage}><Image src={item.image} alt={item.title} fill sizes="(max-width: 720px) 50vw, 180px" /></div><span className={`${styles.programIcon} ${styles[item.tone]}`} aria-hidden="true">{item.icon}</span><h3>{item.title}</h3><p>{item.note}</p><a href="#trial">{locale === "en" ? "Learn more" : "Подробнее"} <span aria-hidden="true">→</span></a></article>)}</div></section>

      <section className={styles.infoGrid} id="schedule" data-editor-anchor="schedule"><article className={styles.scheduleCard}><SectionHeading eyebrow={content.schedule.eyebrow} title={content.schedule.title} text={content.schedule.text} tone="navy" /><div className={styles.filters}>{content.schedule.filters.map((item) => <button type="button" className={filter === item ? styles.filterActive : ""} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div><div className={styles.scheduleList}>{filteredSchedule.map((item) => <div className={styles.scheduleRow} key={`${item.day}-${item.title}`}><span>{item.day}</span><strong>{item.title}</strong><small>{item.age}</small><em className={item.seats.startsWith("1") || item.seats.startsWith("1 ") ? styles.danger : ""}>{item.seats}</em></div>)}</div><a className={styles.outlineButton} data-premium-action={premiumNativeActionKey("rastem-center", "schedule", "schedule-cta")} href={content.schedule.buttonUrl}>{content.schedule.buttonLabel}</a></article></section>

      <section className={styles.teachersSection} id="teachers" data-editor-anchor="teachers"><SectionHeading eyebrow={content.teachers.eyebrow} title={content.teachers.title} text={content.teachers.text} /><div className={styles.teacherGrid}>{content.teachers.items.map((teacher) => <article className={styles.teacher} key={teacher.name}><div className={styles.teacherPhoto}><Image src={teacher.image} alt={teacher.name} fill sizes="(max-width: 720px) 30vw, 180px" /></div><strong>{teacher.name}</strong><span>{teacher.role}</span></article>)}</div></section>

      <section className={styles.trialCard} id="trial" data-editor-anchor="trial"><div><SectionHeading eyebrow={content.trial.eyebrow} title={sent ? (locale === "en" ? "We will be in touch" : "Мы скоро свяжемся") : content.trial.title} text={sent ? (locale === "en" ? "Your trial request is ready. We will confirm the time by email." : "Заявка на пробное занятие принята. Подтвердим время по email.") : content.trial.text} tone="navy" />{sent ? <button type="button" className={styles.primaryButton} data-premium-action={premiumNativeActionKey("rastem-center", "trial", "button")} onClick={() => setSent(false)}>{locale === "en" ? "Book another" : "Записать ещё одного ребёнка"}</button> : <form className={styles.formGrid} onSubmit={submitTrial}><label><span>{locale === "en" ? "Parent name" : "Имя родителя"}</span><input required placeholder={locale === "en" ? "Your name" : "Введите имя"} /></label><label><span>{locale === "en" ? "Child's age" : "Возраст ребёнка"}</span><select required value={scheduleAge} onChange={(event) => setScheduleAge(event.target.value)}><option value="" disabled>{locale === "en" ? "Choose an age" : "Выберите возраст"}</option>{content.trial.ages.map((age) => <option key={age}>{age}</option>)}</select></label><label className={styles.formWide}><span>{locale === "en" ? "Program" : "Программа"}</span><select required defaultValue=""><option value="" disabled>{locale === "en" ? "Choose a program" : "Выберите программу"}</option>{content.trial.programs.map((program) => <option key={program}>{program}</option>)}</select></label><label><span>{locale === "en" ? "Date" : "Дата"}</span><input required type="date" /></label><label><span>{locale === "en" ? "Time" : "Время"}</span><select required defaultValue=""><option value="" disabled>{locale === "en" ? "Choose a time" : "Выберите время"}</option>{content.trial.times.map((time) => <option key={time}>{time}</option>)}</select></label><button type="submit" data-premium-action={premiumNativeActionKey("rastem-center", "trial", "button")} className={`${styles.primaryButton} ${styles.formWide}`}>{content.trial.buttonLabel}</button><small className={styles.formWide}>{content.trial.note}</small></form>}</div><span className={`${styles.doodle} ${styles.heartDoodle}`} aria-hidden="true">♡</span></section>

      <section className={styles.benefits} id="benefits" data-editor-anchor="benefits">{content.benefits.items.map((item) => <article key={item.title}><span aria-hidden="true">{item.icon}</span><div><strong>{item.title}</strong><p>{item.text}</p></div></article>)}</section>

      <section className={styles.priceAppGrid}><article className={styles.pricesCard} id="memberships" data-editor-anchor="memberships"><SectionHeading eyebrow={content.memberships.eyebrow} title={content.memberships.title} text={content.memberships.text} /><div className={styles.prices}>{content.memberships.items.map((item) => <article className={`${styles.priceCard} ${styles[item.tone]}`} key={item.title}><strong>{item.title}</strong><span>{item.text}</span><b>{item.price}</b><a href="#trial">{locale === "en" ? "Choose" : "Выбрать"}</a></article>)}</div></article><article className={styles.parentApp} id="parents" data-editor-anchor="parents"><div><SectionHeading eyebrow={content.parents.eyebrow} title={content.parents.title} text={content.parents.text} /><a className={styles.textLink} data-premium-action={premiumNativeActionKey("rastem-center", "parents", "parents-link")} href={content.parents.linkUrl}>{content.parents.linkLabel} <span aria-hidden="true">→</span></a></div><div className={styles.phone} aria-label={content.parents.title}><div className={styles.phoneBar} /><small>{content.parents.phoneTitle}</small><strong>{content.parents.phoneClass}</strong><span>{content.parents.phoneTime}</span><div className={styles.phoneNote}>{content.parents.phoneNote}</div><div className={styles.phoneNext}>{content.parents.phoneNext}</div></div></article></section>

      <section className={styles.gallerySection} id="gallery" data-editor-anchor="gallery"><SectionHeading eyebrow={content.gallery.eyebrow} title={content.gallery.title} text={content.gallery.text} /><div className={styles.gallery}>{content.gallery.images.map((src, index) => <div className={styles.galleryImage} key={src}><Image src={src} alt={`${content.gallery.title} ${index + 1}`} fill sizes="(max-width: 720px) 50vw, 210px" /></div>)}</div></section>

      <section className={styles.testimonials} id="testimonials" data-editor-anchor="testimonials"><SectionHeading eyebrow={content.testimonials.eyebrow} title={content.testimonials.title} text={content.testimonials.text} tone="navy" /><div className={styles.testimonialGrid}>{content.testimonials.items.map((item) => <blockquote key={item.author}><span className={styles.quoteMark} aria-hidden="true">“</span><p>{item.quote}</p><footer><strong>{item.author}</strong><span>{item.age}</span></footer></blockquote>)}</div></section>

      <section className={styles.faqSection} id="faq" data-editor-anchor="faq"><SectionHeading eyebrow={content.faq.eyebrow} title={content.faq.title} text={content.faq.text} /><div className={styles.faqList}>{content.faq.items.map((item) => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div></section>

      <section className={styles.contactSection} id="contact" data-editor-anchor="contact"><SectionHeading eyebrow={content.contact.eyebrow} title={content.contact.title} text={content.contact.text} /><div className={styles.contactGrid}><div className={styles.contactItem}><span>{content.contact.hoursLabel}</span><strong>{content.contact.hours}</strong></div><div className={styles.contactItem}><span>{content.contact.addressLabel}</span><strong>{content.contact.address}</strong></div><div className={styles.contactItem}><span>{locale === "en" ? "WRITE OR CALL" : "НАПИШИТЕ ИЛИ ПОЗВОНИТЕ"}</span><a href={`tel:${content.contact.phone}`}>{content.contact.phone}</a><a href={`mailto:${content.contact.email}`}>{content.contact.email}</a></div></div><a className={styles.primaryButton} data-premium-action={premiumNativeActionKey("rastem-center", "contact", "contact-cta")} href={content.contact.buttonUrl}>{content.contact.buttonLabel}</a></section>

      <footer className={styles.footer} id="footer" data-editor-anchor="footer"><div className={styles.footerBrand}><a className={styles.logo} href="#top"><strong>{content.brand}</strong><span>{content.brandNote}</span></a><p>{content.footer.description}</p><p>{content.footer.address}</p><p>{content.footer.credit}</p></div><div><strong>{content.footer.navigationLabel}</strong>{content.footer.navigation.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}</div><div><strong>{content.footer.parentLabel}</strong>{content.footer.parentLinks.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}</div><div className={styles.footerContact}><strong>{locale === "en" ? "CONTACT" : "КОНТАКТЫ"}</strong><a href={`tel:${content.footer.phone}`}>{content.footer.phone}</a><a href={`mailto:${content.footer.email}`}>{content.footer.email}</a><a className={styles.footerCta} data-premium-action={premiumNativeActionKey("rastem-center", "footer", "footer-cta")} href={content.footer.ctaUrl}>{content.footer.ctaLabel}</a></div></footer>
    </Composition>
  </main>;
}
