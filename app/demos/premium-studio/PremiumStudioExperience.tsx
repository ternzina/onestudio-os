"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
  useScroll,
  useTransform,
} from "motion/react";
import { BeforeAfter, FilmStrip, ProjectViewer, usePointerGlow } from "./PremiumInteractions";
import StudioTour from "./StudioTour";
import styles from "./PremiumStudio.module.css";
import { PREMIUM_STUDIO_TEMPLATE_KEY, resolvePremiumStudioContent } from "@/lib/public-site/premium-studio-content";
import { resolvePublicSiteLayoutOrder } from "@/lib/public-site/layout";
import PublicCustomBlock from "@/components/public/PublicCustomBlock";
import { isTemplateNativeSectionVisible } from "@/lib/public-site/template-native-section-state";
import type { PublicSiteContent, PublicSiteData } from "@/lib/public-site/types";

const easing = [0.16, 1, 0.3, 1] as const;

const reveal = {
  hidden: { opacity: 0, y: 44 },
  visible: { opacity: 1, y: 0 },
};

const mobileNavigationQuery = "(max-width: 980px)";

function subscribeToMobileNavigation(callback: () => void) {
  const media = window.matchMedia(mobileNavigationQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getMobileNavigationSnapshot() {
  return window.matchMedia(mobileNavigationQuery).matches;
}

function getServerMobileNavigationSnapshot() {
  return false;
}

function Arrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 18">
      <path d="M1 9h28M22 2l7 7-7 7" />
    </svg>
  );
}

function ParallaxProject({ project, index, onOpen, action }: { project: ReturnType<typeof resolvePremiumStudioContent>["portfolio"][number]; index: number; onOpen: (index: number) => void; action: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const metaY = useTransform(scrollYProgress, [0, 1], ["12px", "-12px"]);

  return (
    <m.article ref={ref} className={styles.project} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .2 }} variants={reveal} transition={{ duration: .8, delay: index * .04 }}>
      <button type="button" className={styles.projectButton} aria-label={`Смотреть проект «${project.title}»`} onClick={() => onOpen(index)}>
        <m.div className={styles.projectImage} data-glow layoutId={`project-${index}`}>
          <m.div className={styles.projectImageLayer} style={{ y: imageY }}><Image src={project.image} alt={project.alt} fill sizes="(max-width: 680px) 100vw, 55vw" quality={88} /></m.div>
        </m.div>
        <m.div className={styles.projectMeta} style={{ y: metaY }}><span>{project.category} · {project.year}</span><h3>{project.title}</h3><b>{action} <Arrow /></b></m.div>
      </button>
    </m.article>
  );
}

function StudioPage({ site, content, basePath = "/demos/premium-studio" }: { site?: PublicSiteData; content?: PublicSiteContent; basePath?: string }) {
  const activeContent = site?.content ?? content;
  const tenantContent = resolvePremiumStudioContent(activeContent);
  const noirVisible = (sectionId: string) =>
    isTemplateNativeSectionVisible(
      activeContent,
      PREMIUM_STUDIO_TEMPLATE_KEY,
      sectionId,
    );
  const noirLayoutOrder = resolvePublicSiteLayoutOrder(
    activeContent ?? {
      template_id: "premium-studio",
      section_order: [],
      layout_order: [],
      custom_blocks: [],
    },
  );
  const noirOrder = (item: string) => {
    const index = noirLayoutOrder.indexOf(item);
    return index < 0 ? noirLayoutOrder.length * 10 : index * 10;
  };
  const { navigation, services, portfolio, team, process: processSteps, equipment, testimonials, faq } = tenantContent;
  const visibleNavigation = navigation.filter((item) => {
    const nativeSectionByHref: Record<string, string> = {
      "#space": "manifest",
      "#sessions": "services",
      "#portfolio": "portfolio",
      "#team": "team",
      "#contact": "contact",
    };
    const sectionId = nativeSectionByHref[item.href];
    return !sectionId || noirVisible(sectionId);
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobileNavigation = useSyncExternalStore(
    subscribeToMobileNavigation,
    getMobileNavigationSnapshot,
    getServerMobileNavigationSnapshot,
  );
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const pageRef = usePointerGlow();
  const sceneRef = useRef<HTMLElement>(null);
  const emotionalRef = useRef<HTMLElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: sceneProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const heroImageY = useTransform(scrollYProgress, [0, 0.14], ["0%", "13%"]);
  const heroCopyY = useTransform(scrollYProgress, [0, 0.14], ["0px", "-42px"]);
  const heroDetailY = useTransform(scrollYProgress, [0, 0.14], ["0px", "-76px"]);
  const heroNoteY = useTransform(scrollYProgress, [0, 0.14], ["0px", "-22px"]);
  const { scrollYProgress: emotionalProgress } = useScroll({
    target: emotionalRef,
    offset: ["start end", "end start"],
  });
  const emotionalImageY = useTransform(emotionalProgress, [0, 1], ["-5%", "5%"]);
  const emotionalCopyY = useTransform(emotionalProgress, [0, 1], ["42px", "-42px"]);
  const sceneScale = useTransform(sceneProgress, [0, 0.42, 1], [0.62, 1, 0.78]);
  const sceneRadius = useTransform(
    sceneProgress,
    [0, 0.42, 1],
    ["34px", "0px", "28px"],
  );
  const sceneRotate = useTransform(sceneProgress, [0, 0.42, 1], [-5, 0, 3]);
  const sceneShade = useTransform(
    sceneProgress,
    [0, 0.36, 0.7, 1],
    [0.56, 0.14, 0.3, 0.46],
  );
  const morningWordOpacity = useTransform(sceneProgress, [0, 0.18, 0.3], [1, 1, 0]);
  const noonWordOpacity = useTransform(sceneProgress, [0.2, 0.34, 0.48, 0.57], [0, 1, 1, 0]);
  const duskWordOpacity = useTransform(sceneProgress, [0.47, 0.6, 0.73, 0.82], [0, 1, 1, 0]);
  const nightWordOpacity = useTransform(sceneProgress, [0.72, 0.85, 1], [0, 1, 1]);
  const morningOpacity = useTransform(sceneProgress, [0, 0.2, 0.31], [1, 1, 0]);
  const noonOpacity = useTransform(
    sceneProgress,
    [0.17, 0.31, 0.47, 0.58],
    [0, 1, 1, 0],
  );
  const duskOpacity = useTransform(
    sceneProgress,
    [0.44, 0.58, 0.73, 0.84],
    [0, 1, 1, 0],
  );
  const nightOpacity = useTransform(sceneProgress, [0.7, 0.84, 1], [0, 1, 1]);
  const sceneCount = useTransform(sceneProgress, (value): string => {
    if (value < 0.25) return "01";
    if (value < 0.5) return "02";
    if (value < 0.75) return "03";
    return "04";
  });

  const closeProject = useCallback(() => setActiveProject(null), []);
  const changeProject = useCallback((index: number) => setActiveProject(index), []);
  const mobileMenuClosed = isMobileNavigation && !menuOpen;

  useEffect(() => {
    if (!isMobileNavigation || !menuOpen) return;
    navigationRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setMenuOpen(false);
      requestAnimationFrame(() => menuButtonRef.current?.focus());
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileNavigation, menuOpen]);

  return (
    <main className={styles.page} ref={pageRef} style={{ display: "flex", flexDirection: "column" }}>
      <m.div className={styles.progress} style={{ width: progress }} aria-hidden="true" />

      <section className={styles.hero} aria-labelledby="premium-studio-title" data-editor-anchor="hero" data-glow style={{ order: noirOrder("noir:hero"), display: noirVisible("hero") ? undefined : "none" }}>
        <m.div className={styles.heroImageWrap} style={{ y: heroImageY }} aria-hidden="true">
          <Image
            src={tenantContent.hero.image}
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={88}
            className={styles.heroImage}
          />
        </m.div>
        <div className={styles.heroWash} aria-hidden="true" />
        <m.div className={styles.heroCut} style={{ y: heroDetailY }} aria-hidden="true">
          <span>{tenantContent.hero.folio}</span>
        </m.div>

        <header className={styles.header}>
          <Link
            className={styles.brand}
            href={basePath}
            aria-label={`${tenantContent.brand.first} ${tenantContent.brand.second} — главная`}
          >
            <span>{tenantContent.brand.first}</span>
            <i aria-hidden="true" />
            <span>{tenantContent.brand.second}</span>
          </Link>
          <nav
            id="premium-studio-navigation"
            ref={navigationRef}
            className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}
            aria-label="Основная навигация"
            aria-hidden={mobileMenuClosed ? true : undefined}
            inert={mobileMenuClosed}
          >
            {visibleNavigation.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            {activeContent?.pages?.filter(page => page.show_in_navigation !== false && page.is_visible !== false).map(page => <Link key={page.id} href={`${basePath}/p/${page.slug}`}>{page.nav_label}</Link>)}
            {!site ? <Link className={styles.demoBack} href="/demos">Все демо</Link> : null}
          </nav>
          <button
            ref={menuButtonRef}
            type="button"
            className={styles.menuButton}
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
            aria-controls="premium-studio-navigation"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </header>

        <m.div className={styles.heroCopy} style={{ y: heroCopyY }}>
          <m.p
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.7 }}
          >
            {tenantContent.hero.eyebrow}
          </m.p>
          <h1 id="premium-studio-title">
            <span className={styles.heroLine}>
              <m.span
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.05, ease: easing }}
              >
                {tenantContent.hero.lines[0]}
              </m.span>
            </span>
            <span className={`${styles.heroLine} ${styles.heroLineOffset}`}>
              <m.span
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.05, delay: 0.1, ease: easing }}
              >
                {tenantContent.hero.lines[1]}
              </m.span>
            </span>
            <span className={`${styles.heroLine} ${styles.heroLineLast}`}>
              <m.span
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.05, delay: 0.2, ease: easing }}
              >
                <i>{tenantContent.hero.lines[2]}</i>
              </m.span>
            </span>
          </h1>
        </m.div>
        <m.div
          className={styles.heroNote}
          style={{ y: heroNoteY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <span>
            {tenantContent.hero.note}
          </span>
          <a href="#light-scene" data-glow data-magnetic>
            {tenantContent.hero.cta} <Arrow />
          </a>
        </m.div>
        <div className={styles.heroIndex} aria-hidden="true">
          {tenantContent.brand.monogram}
          <br />
          <span>{tenantContent.brand.period}</span>
        </div>
      </section>

      <section className={styles.overture} id="space" data-editor-anchor="manifest" style={{ order: noirOrder("noir:manifest"), display: noirVisible("manifest") ? undefined : "none" }}>
        <p className={styles.sectionLabel}>{tenantContent.introduction.eyebrow}</p>
        <m.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={reveal}
          transition={{ duration: 0.9, ease: easing }}
        >
          {tenantContent.introduction.title}
        </m.h2>
        <p className={styles.overtureText}>
          {tenantContent.introduction.text}
        </p>
        <div className={styles.facts}>
          {tenantContent.facts.map((fact) => (
            <div key={fact.value}>
              <b>
                {fact.value}
                <small>{fact.unit}</small>
              </b>
              <span>{fact.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section
        className={styles.lightScene}
        id="light-scene"
        ref={sceneRef}
        aria-label="Световая история студии"
        data-editor-anchor="light"
        style={{ order: noirOrder("noir:light"), display: noirVisible("light") ? undefined : "none" }}
      >
        <div className={styles.sceneSticky}>
          <div className={styles.sceneTop}>
            <span>{tenantContent.lightScene.heading}</span>
            <m.span>{sceneCount}</m.span>
          </div>
          <m.div
            className={styles.sceneImage}
            style={{ scale: sceneScale, rotate: sceneRotate, borderRadius: sceneRadius }}
          >
            <m.div className={styles.sceneLayer} style={{ opacity: morningOpacity }}>
              <Image
                src={tenantContent.lightScene.scenes[0].image}
                alt={tenantContent.lightScene.imageAlt}
                fill
                sizes="100vw"
                quality={88}
              />
            </m.div>
            <m.div className={styles.sceneLayer} style={{ opacity: noonOpacity }} aria-hidden="true">
              <Image src={tenantContent.lightScene.scenes[1].image} alt="" fill sizes="100vw" quality={88} />
            </m.div>
            <m.div className={styles.sceneLayer} style={{ opacity: duskOpacity }} aria-hidden="true">
              <Image src={tenantContent.lightScene.scenes[2].image} alt="" fill sizes="100vw" quality={88} />
            </m.div>
            <m.div className={styles.sceneLayer} style={{ opacity: nightOpacity }} aria-hidden="true">
              <Image src={tenantContent.lightScene.scenes[3].image} alt="" fill sizes="100vw" quality={88} />
            </m.div>
            <m.div className={styles.sceneShade} style={{ opacity: sceneShade }} />
            <div className={styles.sceneAperture} aria-hidden="true" />
          </m.div>
          <div className={styles.sceneWords} aria-hidden="true">
            <m.span style={{ opacity: morningWordOpacity }}>{tenantContent.lightScene.scenes[0].word}</m.span>
            <m.i style={{ opacity: noonWordOpacity }}>{tenantContent.lightScene.scenes[1].word}</m.i>
            <m.span style={{ opacity: duskWordOpacity }}>{tenantContent.lightScene.scenes[2].word}</m.span>
            <m.i style={{ opacity: nightWordOpacity }}>{tenantContent.lightScene.scenes[3].word}</m.i>
          </div>
          <div className={styles.sceneNotes}>{tenantContent.lightScene.scenes.map(scene => <span key={scene.time}>{scene.time}<br /><b>{scene.caption}</b></span>)}</div>
        </div>
      </section>

      <section className={styles.services} id="sessions" data-editor-anchor="services" style={{ order: noirOrder("noir:services"), display: noirVisible("services") ? undefined : "none" }}>
        <div className={styles.servicesMasthead}>
          <p className={styles.sectionLabel}>{tenantContent.servicesPresentation.eyebrow}</p>
          <h2>
            {tenantContent.servicesPresentation.title.split("\n")[0]}<br /><i>{tenantContent.servicesPresentation.title.split("\n").slice(1).join(" ")}</i>
          </h2>
          <span>
            {tenantContent.servicesPresentation.text.split("\n").map((line, index) => <span key={line}>{index ? <br /> : null}{line}</span>)}
          </span>
        </div>
        <div className={styles.editorialSpread}>
          {services.map((service, index) => (
            <m.article
              key={service.number}
              className={styles.service}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
              variants={reveal}
              transition={{ duration: 0.8, delay: index * 0.05 }}
            >
              <span className={styles.serviceNumber}>{service.number}</span>
              <div className={styles.serviceArtwork}>
                <Image
                  src={service.image}
                  alt={service.imageAlt}
                  fill
                  sizes="(max-width: 980px) 100vw, 50vw"
                  quality={88}
                  className={styles.serviceArtworkImage}
                />
                <Image
                  src={service.hoverImage}
                  alt=""
                  fill
                  sizes="(max-width: 980px) 100vw, 50vw"
                  quality={88}
                  className={styles.serviceArtworkHover}
                />
                <span className={styles.serviceArtworkWash} aria-hidden="true" />
                <b aria-hidden="true">{service.number}</b>
              </div>
              <div className={styles.serviceCopy}>
                <small>{service.note}</small>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
              <div className={styles.serviceFooter}>
                <div>
                  {service.meta.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <a href="#contact" aria-label={`Запросить ${service.title}`}>
                  {tenantContent.servicesPresentation.action} <Arrow />
                </a>
              </div>
            </m.article>
          ))}
        </div>
      </section>

      <section className={styles.portfolio} id="portfolio" data-editor-anchor="portfolio" style={{ order: noirOrder("noir:portfolio"), display: noirVisible("portfolio") ? undefined : "none" }}>
        <div className={styles.sectionIntro}>
          <p className={styles.sectionLabel}>{tenantContent.portfolioPresentation.eyebrow}</p>
          <h2>{tenantContent.portfolioPresentation.title.split("\n")[0]}<br /><i>{tenantContent.portfolioPresentation.title.split("\n").slice(1).join(" ")}</i></h2>
          <p>{tenantContent.portfolioPresentation.text}</p>
        </div>
        <div className={styles.portfolioGrid}>
          {portfolio.map((project, index) => (
            <ParallaxProject key={project.title} project={project} index={index} onOpen={setActiveProject} action={tenantContent.portfolioPresentation.projectAction} />
          ))}
        </div>
        <a className={styles.allProjects} href="#contact" data-glow data-magnetic>{tenantContent.portfolioPresentation.allProjectsAction} <Arrow /></a>
      </section>

      <div data-editor-anchor="retouch" style={{ order: noirOrder("noir:retouch"), display: noirVisible("retouch") ? undefined : "none", width: "100%" }}>
        <BeforeAfter content={tenantContent.retouch} />
      </div>
      <div data-editor-anchor="film" style={{ order: noirOrder("noir:film"), display: noirVisible("film") ? undefined : "none", width: "100%" }}>
        <FilmStrip onOpen={setActiveProject} portfolio={portfolio} content={tenantContent.film} />
      </div>

      <section className={styles.team} id="team" data-editor-anchor="team" style={{ order: noirOrder("noir:team"), display: noirVisible("team") ? undefined : "none" }}>
        <div className={styles.teamHeader}><p className={styles.sectionLabel}>{tenantContent.teamPresentation.eyebrow}</p><h2>{tenantContent.teamPresentation.title.split("\n")[0]}<br /><i>{tenantContent.teamPresentation.title.split("\n").slice(1).join(" ")}</i></h2></div>
        <div className={styles.teamFeature}>
          <div className={styles.teamFeatureImage}>
            <Image
              src={tenantContent.teamPresentation.image}
              alt={tenantContent.teamPresentation.imageAlt}
              fill
              sizes="(max-width: 980px) 100vw, 46vw"
              quality={88}
            />
          </div>
          <div className={styles.teamFeatureCopy}>
            <span>{tenantContent.teamPresentation.featureEyebrow}</span>
            <h3>{tenantContent.teamPresentation.featureTitle}</h3>
            <p>{tenantContent.teamPresentation.featureText}</p>
          </div>
        </div>
        <div className={styles.teamStories}>
          {team.map((person, index) => (
            <article key={person.name} className={styles.person}>
              <m.div className={styles.personImage} initial={{ clipPath: "inset(12% 0 0 0)" }} whileInView={{ clipPath: "inset(0% 0 0 0)" }} viewport={{ once: true, amount: .3 }} transition={{ duration: .9, ease: easing }}>
                <Image src={person.image} alt={person.alt} fill sizes="(max-width: 680px) 85vw, 34vw" quality={88} />
              </m.div>
              <span>0{index + 1}</span><h3>{person.name}</h3><b>{person.role}</b><p>{person.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.process} id="process" data-editor-anchor="process" style={{ order: noirOrder("noir:process"), display: noirVisible("process") ? undefined : "none" }}>
        <div className={styles.processHeader}><p className={styles.sectionLabel}>{tenantContent.processPresentation.eyebrow}</p><h2>{tenantContent.processPresentation.title.split("\n")[0]}<br /><i>{tenantContent.processPresentation.title.split("\n").slice(1).join(" ")}</i></h2><p>{tenantContent.processPresentation.text}</p></div>
        <ol className={styles.processLine}>
          {processSteps.map((step) => <li key={step.number}><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}
        </ol>
      </section>

      <section className={styles.equipment} id="equipment" data-editor-anchor="equipment" style={{ order: noirOrder("noir:equipment"), display: noirVisible("equipment") ? undefined : "none" }}>
        <div className={styles.equipmentVisual}><Image src={tenantContent.equipmentPresentation.image} alt={tenantContent.equipmentPresentation.imageAlt} fill sizes="(max-width: 768px) 100vw, 50vw" quality={88} /></div>
        <div className={styles.equipmentCopy}><p className={styles.sectionLabel}>{tenantContent.equipmentPresentation.eyebrow}</p><h2>{tenantContent.equipmentPresentation.title.split("\n")[0]}<br /><i>{tenantContent.equipmentPresentation.title.split("\n").slice(1).join(" ")}</i></h2><p>{tenantContent.equipmentPresentation.text}</p>
          <ul>{equipment.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ul>
        </div>
      </section>

      <div data-editor-anchor="tour" style={{ order: noirOrder("noir:tour"), display: noirVisible("tour") ? undefined : "none", width: "100%" }}>
        <StudioTour content={tenantContent.tour} />
      </div>

      <section className={styles.testimonials} id="reviews" aria-labelledby="reviews-title" data-editor-anchor="reviews" style={{ order: noirOrder("noir:reviews"), display: noirVisible("reviews") ? undefined : "none" }}>
        <div className={styles.reviewTop}><p className={styles.sectionLabel}>{tenantContent.reviewsPresentation.eyebrow}</p><div className={styles.reviewControls} aria-label="Выбор отзыва">{testimonials.map((item, index) => <button key={item.author} type="button" aria-label={`Показать отзыв ${index + 1}`} aria-pressed={activeTestimonial === index} onClick={() => setActiveTestimonial(index)}>{String(index + 1).padStart(2, "0")}</button>)}</div></div>
        <m.blockquote key={activeTestimonial} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>
          <p id="reviews-title">“{testimonials[activeTestimonial].quote}”</p>
          <footer><b>{testimonials[activeTestimonial].author}</b><span>{testimonials[activeTestimonial].meta}</span></footer>
        </m.blockquote>
      </section>

      <section className={styles.faq} id="faq" data-editor-anchor="faq" style={{ order: noirOrder("noir:faq"), display: noirVisible("faq") ? undefined : "none" }}>
        <div className={styles.faqIntro}><p className={styles.sectionLabel}>{tenantContent.faqPresentation.eyebrow}</p><h2>{tenantContent.faqPresentation.title.split("\n")[0]}<br /><i>{tenantContent.faqPresentation.title.split("\n").slice(1).join(" ")}</i></h2><p>{tenantContent.faqPresentation.text}</p></div>
        <div className={styles.faqList}>{faq.map((item, index) => <details key={item.question}><summary><span>{String(index + 1).padStart(2, "0")}</span>{item.question}<i aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</div>
      </section>

      {activeContent?.custom_blocks?.length ? (
        <div
          data-noir-custom-blocks
          style={{
            display: "contents",
            "--site-accent": activeContent.theme_accent ?? "#9a742e",
            "--site-dark": activeContent.theme_dark ?? "#17191f",
            "--site-surface": activeContent.theme_surface ?? "#f3f0e9",
          } as React.CSSProperties}
        >
          {activeContent.custom_blocks.map((block) => (
            <div
              key={block.id}
              data-editor-anchor={`custom:${block.id}`}
              style={{ order: noirOrder(`custom:${block.id}`), width: "100%" }}
            >
              <PublicCustomBlock
                block={block}
                bookingHref={site ? `/book/${site.business.slug}` : "#contact"}
                services={site?.services ?? []}
              />
            </div>
          ))}
        </div>
      ) : null}

      <div data-editor-anchor="contact" style={{ order: noirOrder("noir:contact"), display: noirVisible("contact") ? undefined : "none", width: "100%" }}>
      <section className={styles.emotional} aria-label="Приглашение к съёмке" ref={emotionalRef} data-glow>
        <m.div className={styles.emotionalImage} style={{ y: emotionalImageY }}><Image src={tenantContent.emotional.image} alt="" fill sizes="100vw" quality={88} /></m.div><div className={styles.emotionalShade} />
        <m.p style={{ y: emotionalCopyY }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: .4 }} transition={{ duration: .9, ease: easing }}>{tenantContent.emotional.first}<br /><i>{tenantContent.emotional.firstAccent}</i><span>{tenantContent.emotional.second}<br />{tenantContent.emotional.secondAccent}</span></m.p>
      </section>

      <section className={styles.booking} id="contact">
        <div className={styles.bookingImage} aria-hidden="true">
          <Image src={tenantContent.contact.image} alt="" fill sizes="100vw" quality={88} />
        </div>
        <div className={styles.bookingShade} aria-hidden="true" />
        <div className={styles.bookingNumber} aria-hidden="true">
          {tenantContent.contact.folio}
        </div>
        <p className={styles.sectionLabel}>{tenantContent.contact.eyebrow}</p>
        <m.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={reveal}
          transition={{ duration: 0.9, ease: easing }}
        >
          {tenantContent.contact.title}
        </m.h2>
        <div className={styles.bookingAside}>
          <p>
            {tenantContent.contact.text}
          </p>
          <div>
            <span>{tenantContent.contact.availabilityLabel}</span>
            <b>{tenantContent.contact.availabilityValue}</b>
          </div>
          <a href={`mailto:${tenantContent.brand.email}?subject=${encodeURIComponent(`${tenantContent.brand.first} ${tenantContent.brand.second} session`)}`} data-glow data-magnetic>
            {tenantContent.contact.cta} <Arrow />
          </a>
          <small>{tenantContent.contact.helper}</small>
        </div>
        <div className={styles.bookingMarquee} aria-hidden="true">
          <span>{tenantContent.brand.marquee}</span>
        </div>
      </section>
      </div>

      <footer className={styles.footer} data-editor-anchor="footer" style={{ order: noirOrder("noir:footer"), display: noirVisible("footer") ? undefined : "none" }}>
        <Link className={styles.brand} href={basePath}>
          <span>{tenantContent.brand.first}</span>
          <i />
          <span>{tenantContent.brand.second}</span>
        </Link>
        <p>
          {tenantContent.brand.location}
          <br />{tenantContent.brand.email}
        </p>
        <div>
          <a href="#premium-studio-title">{tenantContent.footer.topLabel}</a>
          <Link href="/demos">{tenantContent.footer.demosLabel}</Link>
        </div>
        <small>© {tenantContent.footer.copyrightYear} {tenantContent.brand.first} {tenantContent.brand.second}</small>
      </footer>
      <ProjectViewer active={activeProject} onClose={closeProject} onChange={changeProject} portfolio={portfolio} />
    </main>
  );
}

export default function PremiumStudioExperience({ site, content, basePath }: { site?: PublicSiteData; content?: PublicSiteContent; basePath?: string }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <StudioPage site={site} content={content} basePath={basePath} />
      </MotionConfig>
    </LazyMotion>
  );
}
