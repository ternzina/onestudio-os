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
import {
  equipment,
  facts,
  faq,
  navigation,
  portfolio,
  processSteps,
  services,
  team,
  testimonials,
} from "./content";
import { BeforeAfter, FilmStrip, ProjectViewer, usePointerGlow } from "./PremiumInteractions";
import StudioTour from "./StudioTour";
import styles from "./PremiumStudio.module.css";

const brightBase = "/images/demos/premium-studio/bright";

const images = {
  hero: `${brightBase}/hero.webp`,
  morning: `${brightBase}/scene-morning.webp`,
  noon: `${brightBase}/scene-noon.webp`,
  dusk: `${brightBase}/scene-dusk.webp`,
  night: `${brightBase}/scene-night.webp`,
  equipment: `${brightBase}/equipment.webp`,
  emotional: `${brightBase}/emotional.webp`,
  booking: `${brightBase}/booking.webp`,
  teamGroup: `${brightBase}/team-group.webp`,
} as const;

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

function ParallaxProject({ project, index, onOpen }: { project: (typeof portfolio)[number]; index: number; onOpen: (index: number) => void }) {
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
        <m.div className={styles.projectMeta} style={{ y: metaY }}><span>{project.category} · {project.year}</span><h3>{project.title}</h3><b>Смотреть проект <Arrow /></b></m.div>
      </button>
    </m.article>
  );
}

function StudioPage() {
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
    <main className={styles.page} ref={pageRef}>
      <m.div className={styles.progress} style={{ width: progress }} aria-hidden="true" />

      <section className={styles.hero} aria-labelledby="premium-studio-title" data-glow>
        <m.div className={styles.heroImageWrap} style={{ y: heroImageY }} aria-hidden="true">
          <Image
            src={images.hero}
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
          <span>№ 01</span>
        </m.div>

        <header className={styles.header}>
          <Link
            className={styles.brand}
            href="/demos/premium-studio"
            aria-label="NOIR FRAME — главная"
          >
            <span>NOIR</span>
            <i aria-hidden="true" />
            <span>FRAME</span>
          </Link>
          <nav
            id="premium-studio-navigation"
            ref={navigationRef}
            className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}
            aria-label="Основная навигация"
            aria-hidden={mobileMenuClosed ? true : undefined}
            inert={mobileMenuClosed}
          >
            {navigation.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            <Link className={styles.demoBack} href="/demos">
              Все демо
            </Link>
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
            Фотостудия · Киев · 2026
          </m.p>
          <h1 id="premium-studio-title">
            <span className={styles.heroLine}>
              <m.span
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.05, ease: easing }}
              >
                Свет
              </m.span>
            </span>
            <span className={`${styles.heroLine} ${styles.heroLineOffset}`}>
              <m.span
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.05, delay: 0.1, ease: easing }}
              >
                решает
              </m.span>
            </span>
            <span className={`${styles.heroLine} ${styles.heroLineLast}`}>
              <m.span
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.05, delay: 0.2, ease: easing }}
              >
                <i>всё.</i>
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
            Пространство для тех,
            <br />кто видит иначе.
          </span>
          <a href="#light-scene" data-glow data-magnetic>
            Войти в свет <Arrow />
          </a>
        </m.div>
        <div className={styles.heroIndex} aria-hidden="true">
          NF
          <br />
          <span>24—26</span>
        </div>
      </section>

      <section className={styles.overture} id="space">
        <p className={styles.sectionLabel}>Манифест / 01</p>
        <m.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={reveal}
          transition={{ duration: 0.9, ease: easing }}
        >
          Мы не сдаём
          <br />четыре стены.
          <br />
          <i>Мы ставим свет.</i>
        </m.h2>
        <p className={styles.overtureText}>
          Белая циклорама становится сценой. Утренний луч — соавтором. Тишина — частью
          кадра. Здесь изображение сначала чувствуют, и только потом снимают.
        </p>
        <div className={styles.facts}>
          {facts.map((fact) => (
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
      >
        <div className={styles.sceneSticky}>
          <div className={styles.sceneTop}>
            <span>Один зал / четыре состояния</span>
            <m.span>{sceneCount}</m.span>
          </div>
          <m.div
            className={styles.sceneImage}
            style={{ scale: sceneScale, rotate: sceneRotate, borderRadius: sceneRadius }}
          >
            <m.div className={styles.sceneLayer} style={{ opacity: morningOpacity }}>
              <Image
                src={images.morning}
                alt="Пространство студии NOIR FRAME в меняющемся естественном свете"
                fill
                sizes="100vw"
                quality={88}
              />
            </m.div>
            <m.div className={styles.sceneLayer} style={{ opacity: noonOpacity }} aria-hidden="true">
              <Image src={images.noon} alt="" fill sizes="100vw" quality={88} />
            </m.div>
            <m.div className={styles.sceneLayer} style={{ opacity: duskOpacity }} aria-hidden="true">
              <Image src={images.dusk} alt="" fill sizes="100vw" quality={88} />
            </m.div>
            <m.div className={styles.sceneLayer} style={{ opacity: nightOpacity }} aria-hidden="true">
              <Image src={images.night} alt="" fill sizes="100vw" quality={88} />
            </m.div>
            <m.div className={styles.sceneShade} style={{ opacity: sceneShade }} />
            <div className={styles.sceneAperture} aria-hidden="true" />
          </m.div>
          <div className={styles.sceneWords} aria-hidden="true">
            <m.span style={{ opacity: morningWordOpacity }}>утро</m.span>
            <m.i style={{ opacity: noonWordOpacity }}>полдень</m.i>
            <m.span style={{ opacity: duskWordOpacity }}>сумерки</m.span>
            <m.i style={{ opacity: nightWordOpacity }}>ночь</m.i>
          </div>
          <div className={styles.sceneNotes}>
            <span>
              08:10
              <br />
              <b>мягкий контур</b>
            </span>
            <span>
              12:40
              <br />
              <b>чистая геометрия</b>
            </span>
            <span>
              18:25
              <br />
              <b>длинная тень</b>
            </span>
            <span>
              22:15
              <br />
              <b>кобальтовая тишина</b>
            </span>
          </div>
        </div>
      </section>

      <section className={styles.services} id="sessions">
        <div className={styles.servicesMasthead}>
          <p className={styles.sectionLabel}>Форматы / 02</p>
          <h2>
            Съёмочный
            <br />
            <i>номер.</i>
          </h2>
          <span>
            Выберите масштаб истории.
            <br />Остальное соберём вокруг неё.
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
                  Обсудить <Arrow />
                </a>
              </div>
            </m.article>
          ))}
        </div>
      </section>

      <section className={styles.portfolio} id="portfolio">
        <div className={styles.sectionIntro}>
          <p className={styles.sectionLabel}>Избранное / 03</p>
          <h2>Истории,<br /><i>оставшиеся в свете.</i></h2>
          <p>Портреты, кампании и личные серии, созданные в NOIR FRAME.</p>
        </div>
        <div className={styles.portfolioGrid}>
          {portfolio.map((project, index) => (
            <ParallaxProject key={project.title} project={project} index={index} onOpen={setActiveProject} />
          ))}
        </div>
        <a className={styles.allProjects} href="#contact" data-glow data-magnetic>Всё портфолио <Arrow /></a>
      </section>

      <BeforeAfter />
      <FilmStrip onOpen={setActiveProject} />

      <section className={styles.team} id="team">
        <div className={styles.teamHeader}><p className={styles.sectionLabel}>Мастера / 04</p><h2>Люди<br /><i>по ту сторону камеры.</i></h2></div>
        <div className={styles.teamFeature}>
          <div className={styles.teamFeatureImage}>
            <Image
              src={images.teamGroup}
              alt="Команда фотографа, арт-директора и стилиста в светлой студии"
              fill
              sizes="(max-width: 980px) 100vw, 46vw"
              quality={88}
            />
          </div>
          <div className={styles.teamFeatureCopy}>
            <span>Одна команда · разные взгляды</span>
            <h3>Собираем съёмку целиком.</h3>
            <p>
              Фотограф, арт-директор, стилист, визажист и продюсер работают как одна
              система, чтобы идея не потерялась между подготовкой и последним кадром.
            </p>
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

      <section className={styles.process} id="process">
        <div className={styles.processHeader}><p className={styles.sectionLabel}>Процесс / 05</p><h2>От идеи<br />до <i>серии.</i></h2><p>Вы всегда знаете, что происходит сейчас и какой шаг будет следующим.</p></div>
        <ol className={styles.processLine}>
          {processSteps.map((step) => <li key={step.number}><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}
        </ol>
      </section>

      <section className={styles.equipment} id="equipment">
        <div className={styles.equipmentVisual}><Image src={images.equipment} alt="Оснащённое пространство фотостудии NOIR FRAME" fill sizes="(max-width: 768px) 100vw, 50vw" quality={88} /></div>
        <div className={styles.equipmentCopy}><p className={styles.sectionLabel}>Оснащение / 06</p><h2>Всё нужное.<br /><i>Ничего лишнего.</i></h2><p>Пространство готово к работе команды любого масштаба — от личного портрета до кампании.</p>
          <ul>{equipment.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ul>
        </div>
      </section>

      <StudioTour />

      <section className={styles.testimonials} id="reviews" aria-labelledby="reviews-title">
        <div className={styles.reviewTop}><p className={styles.sectionLabel}>Говорят клиенты / 07</p><div className={styles.reviewControls} aria-label="Выбор отзыва">{testimonials.map((item, index) => <button key={item.author} type="button" aria-label={`Показать отзыв ${index + 1}`} aria-pressed={activeTestimonial === index} onClick={() => setActiveTestimonial(index)}>{String(index + 1).padStart(2, "0")}</button>)}</div></div>
        <m.blockquote key={activeTestimonial} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>
          <p id="reviews-title">“{testimonials[activeTestimonial].quote}”</p>
          <footer><b>{testimonials[activeTestimonial].author}</b><span>{testimonials[activeTestimonial].meta}</span></footer>
        </m.blockquote>
      </section>

      <section className={styles.faq} id="faq">
        <div className={styles.faqIntro}><p className={styles.sectionLabel}>Вопросы / 08</p><h2>Перед<br /><i>съёмкой.</i></h2><p>Если ответа нет здесь, напишите нам — ответим в течение рабочего дня.</p></div>
        <div className={styles.faqList}>{faq.map((item, index) => <details key={item.question}><summary><span>{String(index + 1).padStart(2, "0")}</span>{item.question}<i aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</div>
      </section>

      <section className={styles.emotional} aria-label="Приглашение к съёмке" ref={emotionalRef} data-glow>
        <m.div className={styles.emotionalImage} style={{ y: emotionalImageY }}><Image src={images.emotional} alt="" fill sizes="100vw" quality={88} /></m.div><div className={styles.emotionalShade} />
        <m.p style={{ y: emotionalCopyY }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: .4 }} transition={{ duration: .9, ease: easing }}>Приходите<br />с <i>идеей.</i><span>Уходите<br />с историей.</span></m.p>
      </section>

      <section className={styles.booking} id="contact">
        <div className={styles.bookingImage} aria-hidden="true">
          <Image src={images.booking} alt="" fill sizes="100vw" quality={88} />
        </div>
        <div className={styles.bookingShade} aria-hidden="true" />
        <div className={styles.bookingNumber} aria-hidden="true">
          03
        </div>
        <p className={styles.sectionLabel}>Бронирование / финал</p>
        <m.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={reveal}
          transition={{ duration: 0.9, ease: easing }}
        >
          Ваша идея.
          <br />
          <i>Наш свет.</i>
          <br />Один день.
        </m.h2>
        <div className={styles.bookingAside}>
          <p>
            Опишите задачу в нескольких строках. Мы ответим с форматом, командой и
            свободными датами.
          </p>
          <div>
            <span>Ближайшее окно</span>
            <b>14 / 08</b>
          </div>
          <a href="mailto:studio@example.com?subject=NOIR%20FRAME%20session" data-glow data-magnetic>
            Начать проект <Arrow />
          </a>
          <small>Демо-интерфейс · откроется почтовый клиент</small>
        </div>
        <div className={styles.bookingMarquee} aria-hidden="true">
          <span>NOIR FRAME · NOIR FRAME · NOIR FRAME ·</span>
        </div>
      </section>

      <footer className={styles.footer}>
        <Link className={styles.brand} href="/demos/premium-studio">
          <span>NOIR</span>
          <i />
          <span>FRAME</span>
        </Link>
        <p>
          Киев · Украина
          <br />studio@example.com
        </p>
        <div>
          <a href="#premium-studio-title">Наверх ↑</a>
          <Link href="/demos">Демо OneStudio OS</Link>
        </div>
        <small>© 2026 NOIR FRAME</small>
      </footer>
      <ProjectViewer active={activeProject} onClose={closeProject} onChange={changeProject} />
    </main>
  );
}

export default function PremiumStudioExperience() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <StudioPage />
      </MotionConfig>
    </LazyMotion>
  );
}
