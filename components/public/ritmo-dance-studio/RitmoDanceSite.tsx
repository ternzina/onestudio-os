"use client";

import { Children, FormEvent, isValidElement, type ReactNode, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PublicCustomBlock from "@/components/public/PublicCustomBlock";
import type { PremiumTemplatePublicHomeRendererProps } from "@/lib/public-site/premium-template-runtime-adapter";
import { premiumNativeActionKey } from "@/lib/public-site/premium-action-style";
import { publicTypographyStyle } from "@/lib/public-site/typography";
import { resolveRitmoDanceStudioContent } from "@/lib/public-site/ritmo-dance-studio-premium-template-content";
import { createRitmoDanceStudioRenderPlan } from "@/lib/public-site/ritmo-dance-studio-render-plan";
import styles from "./RitmoDanceSite.module.css";

type Filter = "all" | "beginner" | "advanced";

const fallbackDirections = [
  {
    name: "Contemporary",
    note: "Свобода движения и эмоций",
    tag: "С нуля",
    tone: "violet",
    image: "/templates/ritmo-dance-studio/contemporary.jpg",
  },
  {
    name: "Hip-Hop",
    note: "Ритм, энергия и свой стиль",
    tag: "Любой уровень",
    tone: "cyan",
    image: "/templates/ritmo-dance-studio/hiphop.jpg",
  },
  {
    name: "High Heels",
    note: "Уверенность и пластика",
    tag: "18+",
    tone: "rose",
    image: "/templates/ritmo-dance-studio/heels.jpg",
  },
  {
    name: "Latina",
    note: "Сальса, бачата и яркие эмоции",
    tag: "Любой уровень",
    tone: "coral",
    image: "/templates/ritmo-dance-studio/latina.jpg",
  },
  {
    name: "Stretching",
    note: "Гибкость, сила и восстановление",
    tag: "С нуля",
    tone: "sand",
    image: "/templates/ritmo-dance-studio/stretching.jpg",
  },
];

const fallbackSchedule = [
  { day: "Пн", time: "18:30", title: "Contemporary Start", coach: "Анна Лис", level: "beginner", seats: 4 },
  { day: "Вт", time: "19:00", title: "Hip-Hop Basic", coach: "Макс Рэй", level: "beginner", seats: 2 },
  { day: "Ср", time: "20:00", title: "High Heels", coach: "София Марк", level: "advanced", seats: 6 },
  { day: "Чт", time: "18:00", title: "Latina Solo", coach: "Диана Круз", level: "advanced", seats: 4 },
];

const fallbackCoaches = [
  { name: "Анна Лис", role: "Contemporary", image: "/templates/ritmo-dance-studio/coach-anna.jpg" },
  { name: "Макс Рэй", role: "Hip-Hop", image: "/templates/ritmo-dance-studio/coach-max.jpg" },
  { name: "София Марк", role: "High Heels", image: "/templates/ritmo-dance-studio/coach-sofia.jpg" },
  { name: "Диана Круз", role: "Latina", image: "/templates/ritmo-dance-studio/coach-diana.jpg" },
];

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}

function RitmoComposition({ site, children }: Pick<PremiumTemplatePublicHomeRendererProps, "site"> & { children: ReactNode }) {
  const native = new Map<string, ReactNode>();
  for (const child of Children.toArray(children)) {
    if (!isValidElement<{ "data-editor-anchor"?: string }>(child)) continue;
    const sectionId = child.props["data-editor-anchor"];
    if (sectionId) native.set(sectionId, child);
  }
  return createRitmoDanceStudioRenderPlan(site.content).map((item) => item.kind === "native"
    ? <div key={item.key} data-editor-anchor={item.sectionId}>{native.get(item.sectionId)}</div>
    : <div key={item.key} data-editor-anchor={item.key}><PublicCustomBlock block={item.block} services={site.services} bookingHref="#trial" /></div>);
}

export default function RitmoDanceSite({ site, basePath }: PremiumTemplatePublicHomeRendererProps) {
  const content = resolveRitmoDanceStudioContent(site.content);
  const directions = content.directions.length ? content.directions : fallbackDirections;
  const schedule = content.schedule.length ? content.schedule : fallbackSchedule.map((item) => ({ ...item, seats: String(item.seats) }));
  const coaches = content.coaches.length ? content.coaches : fallbackCoaches;
  const locale = site.business.locale === "en" ? "en" : "ru";
  const heading = (id: keyof typeof content.headingTypography) => publicTypographyStyle(content.headingTypography[id]);
  const rootPath = basePath.endsWith("/en") ? basePath.slice(0, -3) : basePath;
  const [filter, setFilter] = useState<Filter>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState("Contemporary");

  const filteredSchedule = useMemo(
    () => schedule.filter((item) => filter === "all" || item.level === filter),
    [filter, schedule],
  );

  const submitTrial = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <main className={styles.page} lang={locale}>
      <div className={styles.promo}>
        <span>{content.promo}</span>
        <span className={styles.promoDot} aria-hidden="true">✦</span>
      </div>

      <header className={styles.header} data-sticky-ritmo-header="true">
        <a className={styles.brand} href="#top" aria-label="RITMO Dance Studio">
          <strong>{content.brand}</strong>
          <span>{content.brandNote}</span>
        </a>

        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-controls="ritmo-nav"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
          <span className={styles.srOnly}>{content.menuLabel}</span>
        </button>

        <nav id="ritmo-nav" className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
          {content.navigation.map((item) => <a href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
        </nav>

        <div className={styles.headerTools}><span className={styles.locales}><Link href={rootPath} aria-current={locale === "ru" ? "page" : undefined}>RU</Link><Link href={`${rootPath}/en`} aria-current={locale === "en" ? "page" : undefined}>EN</Link></span><a className={styles.headerCta} data-premium-action={premiumNativeActionKey("ritmo-dance-studio", "hero", "header-cta")} href={content.headerCta.href}>{content.headerCta.label}</a></div>
      </header>

      <RitmoComposition site={site}>
      <section className={styles.hero} id="top" data-editor-anchor="hero">
        <div className={styles.heroGlow} />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{content.hero.eyebrow}</p>
          <h1 style={{ ...heading("hero"), whiteSpace: "pre-line" }}>{content.hero.title}</h1>
          <p className={styles.heroText}>{content.hero.text}</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} data-premium-action={premiumNativeActionKey("ritmo-dance-studio", "hero", "primary")} href={content.hero.primaryUrl}>{content.hero.primaryLabel}</a>
            <a className={styles.videoButton} data-premium-action={premiumNativeActionKey("ritmo-dance-studio", "hero", "secondary")} href={content.hero.secondaryUrl}>
              <span className={styles.play}>▶</span>
              {content.hero.secondaryLabel}
            </a>
          </div>
          <div className={styles.heroStats} aria-label="Статистика студии">
            <span>{content.hero.statOne}</span><span>{content.hero.statTwo}</span><span>{content.hero.statThree}</span>
          </div>
        </div>

        <div className={styles.heroStage} aria-label="Танцевальная сцена">
          <div className={styles.stageGrid} />
          <div className={styles.neonLine} />
          <div className={styles.heroStageVisual}><Image src={content.hero.image} alt={content.hero.imageAlt} fill priority className={styles.heroPhoto} sizes="(max-width: 820px) 100vw, 60vw" /></div>
          <span className={styles.stageLabel}>{content.hero.stageLabel}</span>
          <span className={styles.stageSub}>{content.hero.stageSub}</span>
          <div className={styles.showreelBadge}>
            <span>▶</span>
            <small>{content.hero.showreel}</small>
          </div>
        </div>
      </section>

      <section className={styles.lightSection} id="directions" data-editor-anchor="directions">
        <div className={styles.sectionHeading}>
          <p style={heading("directions")}>{content.directionsPresentation.title}</p>
          <span>{content.directionsPresentation.text}</span>
        </div>

        <div className={styles.directionGrid}>
          {directions.map((direction) => (
            <button
              type="button"
              className={`${styles.directionCard} ${styles[`tone_${direction.tone}`]} ${selectedDirection === direction.name ? styles.directionActive : ""}`}
              key={direction.name}
              onClick={() => setSelectedDirection(direction.name)}
              aria-pressed={selectedDirection === direction.name}
            >
              <div className={styles.directionVisual}>
                <div className={styles.directionPhoto}><Image src={direction.image} alt={direction.name} fill className={styles.directionImage} sizes="(max-width: 820px) 100vw, 20vw" /></div>
                <span className={styles.tag}>{direction.tag}</span>
              </div>
              <strong>{direction.name}</strong>
              <span>{direction.note}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={`${styles.lightSection} ${styles.scheduleWrap}`} id="schedule" data-editor-anchor="schedule">
        <div className={styles.scheduleCard}>
          <div className={styles.scheduleIntro}>
            <p className={styles.panelEyebrow}>{content.schedulePresentation.eyebrow}</p>
            <h2 style={{ ...heading("schedule"), whiteSpace: "pre-line" }}>{content.schedulePresentation.title}</h2>
            <div className={styles.filters}>
              {[
                ["all", content.schedulePresentation.all],
                ["beginner", content.schedulePresentation.beginner],
                ["advanced", content.schedulePresentation.advanced],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={filter === value ? styles.filterActive : ""}
                  onClick={() => setFilter(value as Filter)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.scheduleList}>
            {filteredSchedule.map((item) => (
              <div className={styles.scheduleRow} key={`${item.day}-${item.time}`}>
                <span className={styles.when}><b>{item.day}</b> · {item.time}</span>
                <strong>{item.title}</strong>
                <span className={styles.coachMini}>
                  <i aria-hidden="true">{item.coach.split(" ").map((part) => part[0]).join("")}</i>
                  {item.coach}
                </span>
                <span className={styles.seats}>{item.seats} {content.schedulePresentation.seats}</span>
              </div>
            ))}
            <a className={styles.scheduleAll} data-premium-action={premiumNativeActionKey("ritmo-dance-studio", "schedule", "cta")} href={content.schedulePresentation.ctaUrl}>{content.schedulePresentation.cta} <ArrowIcon /></a>
          </div>
        </div>
      </section>

      <section className={styles.lightSection} id="coaches" data-editor-anchor="coaches">
        <div className={styles.sectionHeading}>
          <p style={heading("coaches")}>{content.coachesPresentation.title}</p>
          <span>{content.coachesPresentation.text}</span>
        </div>
        <div className={styles.coachGrid}>
          {coaches.map((coach, index) => (
            <article className={styles.coachCard} key={coach.name}>
              <div className={styles.coachArt}>
                <Image src={coach.image} alt={coach.name} fill className={styles.coachPhoto} sizes="(max-width: 820px) 100vw, 25vw" />
                <span className={styles.coachNumber}>0{index + 1}</span>
              </div>
              <div>
                <strong>{coach.name}</strong>
                <span>{coach.role}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.lightSection} ${styles.trialWrap}`} id="trial" data-editor-anchor="trial">
        <div className={styles.trialCard}>
          <div className={styles.trialFormBlock}>
            <p className={styles.panelEyebrow}>{content.trial.eyebrow}</p>
            <h2 style={heading("trial")}>{sent ? content.trial.successTitle : content.trial.title}</h2>
            {sent ? (
              <div className={styles.success}>
                <strong>{content.trial.successLabel}</strong><p>{content.trial.successText}</p><button type="button" onClick={() => setSent(false)}>{content.trial.again}</button>
              </div>
            ) : (
              <form onSubmit={submitTrial}>
                <label>
                  <span>{content.trial.direction}</span>
                  <select defaultValue={selectedDirection} onChange={(event) => setSelectedDirection(event.target.value)}>
                    {directions.map((direction) => <option key={direction.name}>{direction.name}</option>)}
                  </select>
                </label>
                <label>
                  <span>{content.trial.level}</span><select defaultValue={content.trial.beginner}>
                    <option>{content.trial.beginner}</option><option>{content.trial.experienced}</option><option>{content.trial.advanced}</option>
                  </select>
                </label>
                <label>
                  <span>{content.trial.date}</span>
                  <input type="date" required />
                </label>
                <label>
                  <span>{content.trial.time}</span>
                  <select defaultValue="18:30">
                    <option>18:30</option>
                    <option>19:00</option>
                    <option>20:00</option>
                  </select>
                </label>
                <button className={styles.formSubmit} data-premium-action={premiumNativeActionKey("ritmo-dance-studio", "trial", "submit")} type="submit">{content.trial.submit}</button>
              </form>
            )}
            <small>{content.trial.note}</small>
          </div>

          <div className={styles.trialVisual}>
            <div className={styles.trialBeam} />
            <div className={styles.trialPhoto}><Image src={content.trial.image} alt={content.trial.imageAlt} fill className={styles.trialImage} sizes="(max-width: 820px) 100vw, 50vw" /></div>
            <span className={styles.trialWord}>MOVE</span>
          </div>
        </div>
      </section>

      <section className={`${styles.lightSection} ${styles.offerWrap}`} id="prices" data-editor-anchor="memberships">
        <div className={styles.pricingPanel}>
          <div className={styles.pricingSide}>
            <p className={styles.panelEyebrow}>{content.membershipsPresentation.eyebrow}</p>
            <h2 style={heading("memberships")}>{content.membershipsPresentation.title}</h2>
            <p>{content.membershipsPresentation.text}</p>
          </div>
          <div className={styles.priceGrid}>
            {content.memberships.map(({ name, note, price }, index) => (
              <article className={`${styles.priceCard} ${index === 2 ? styles.priceFeatured : ""}`} key={name}>
                {index === 2 ? <span className={styles.star}>★</span> : null}
                <h3>{name}</h3>
                <span>{note}</span>
                <strong>{price}</strong>
                <a data-premium-action={premiumNativeActionKey("ritmo-dance-studio", "memberships", "plan-cta")} href={content.membershipsPresentation.ctaUrl}>{content.membershipsPresentation.cta}</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.lightSection} ${styles.offerWrap}`} id="gallery" data-editor-anchor="gallery">
        <div className={styles.galleryPanel}>
          <div className={styles.galleryTitle}>
            <p className={styles.panelEyebrow}>{content.gallery.eyebrow}</p><h2 style={heading("gallery")}>{content.gallery.title}</h2>
          </div>
          <div className={styles.galleryGrid}>
            {content.gallery.images.map((image, index) => (
              <div className={styles.galleryCell} key={image}>
                <Image src={image} alt={`${content.gallery.imageAlt} ${index + 1}`} fill className={styles.galleryImage} sizes="(max-width: 820px) 50vw, 18vw" />
                <span>0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.lightSection} ${styles.contactWrap}`} id="contact" data-editor-anchor="contact">
        <div className={styles.contactPanel}>
          <div className={styles.quote}>
            <p className={styles.panelEyebrow}>{content.contact.eyebrow}</p><blockquote>{content.contact.quote}</blockquote>
            <div className={styles.quotePerson}>
              <span className={styles.testimonialPhoto}><Image src={content.contact.image} alt={content.contact.imageAlt} fill className={styles.testimonialImage} sizes="64px" /></span>
              <p><strong>{content.contact.person}</strong><small>{content.contact.role}</small></p>
            </div>
          </div>

          <div className={styles.place}>
            <p className={styles.panelEyebrow}>{content.contact.placeEyebrow}</p><h2 style={{ ...heading("contact"), whiteSpace: "pre-line" }}>{content.contact.title}</h2><p>{content.contact.address}</p><a data-premium-action={premiumNativeActionKey("ritmo-dance-studio", "contact", "cta")} href={content.contact.ctaUrl}>{content.contact.cta} <ArrowIcon /></a>
          </div>

          <div className={styles.mapArt} aria-label="Стилизованная карта">
            <span className={styles.roadOne} />
            <span className={styles.roadTwo} />
            <span className={styles.roadThree} />
            <span className={styles.pin}>●</span>
            <b>RITMO</b>
          </div>
        </div>
      </section>

      <footer className={styles.footer} id="footer" data-editor-anchor="footer">
        <a className={styles.brand} href="#top">
          <strong>{content.brand}</strong><span>{content.brandNote}</span>
        </a>
        <div>
          <a href="#directions">{content.footer.directions}</a><a href="#schedule">{content.footer.schedule}</a><a href="#coaches">{content.footer.coaches}</a>
        </div>
        <div>
          <a href="#prices">{content.footer.memberships}</a><a href="#gallery">{content.footer.events}</a><a href="#contact">{content.footer.contacts}</a>
        </div>
        <div className={styles.footerContact}>
          <strong>{content.footer.phone}</strong><span>{content.footer.email}</span>
        </div>
        <p className={styles.osCredit}>{content.footer.credit} <b>OneStudio OS</b></p>
      </footer>
      </RitmoComposition>
    </main>
  );
}
