"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { agePrograms, faqs, gallery, reviews, schedule, teachers, type AgeKey, type DayKey } from "./content";
import styles from "./PremiumKids.module.css";

const ages = Object.keys(agePrograms) as AgeKey[];
const days = Object.keys(schedule) as DayKey[];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function SectionIntro({ index, eyebrow, title, text }: { index: string; eyebrow: string; title: string; text?: string }) {
  return (
    <div className={styles.sectionIntro}>
      <p><span>{index}</span>{eyebrow}</p>
      <h2>{title}</h2>
      {text ? <div>{text}</div> : null}
    </div>
  );
}

export default function PremiumKidsExperience() {
  const heroRef = useRef<HTMLElement>(null);
  const [age, setAge] = useState<AgeKey>("4–5");
  const [day, setDay] = useState<DayKey>("Пн");
  const [viewer, setViewer] = useState<number | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imageY = useTransform(heroProgress, [0, 1], [0, 54]);
  const shapesY = useTransform(heroProgress, [0, 1], [0, -34]);

  useEffect(() => {
    if (viewer === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const focusables = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])') ?? []);
    focusables()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setViewer(null);
      if (event.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus();
    };
  }, [viewer]);

  const openViewer = (index: number, button: HTMLButtonElement) => {
    openerRef.current = button;
    setViewer(index);
  };

  return (
    <main className={styles.page}>
      <motion.div className={styles.progress} style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="BEMBI — к началу страницы"><i aria-hidden="true" />BEMBI</a>
        <nav aria-label="Навигация по странице">
          <a href="#programs">Программы</a>
          <a href="#schedule">Расписание</a>
          <a href="#team">Команда</a>
        </nav>
        <Link className={styles.allDemos} href="/demos">Все демо <Arrow /></Link>
      </header>

      <section className={styles.hero} id="top" ref={heroRef}>
        <motion.div className={styles.heroShapes} style={{ y: shapesY }} aria-hidden="true">
          <i /><i /><i />
        </motion.div>
        <div className={styles.heroCopy}>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }}>Детский центр · Warszawa</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .08 }}>Место для<br /><em>больших открытий</em></motion.h1>
          <motion.div className={styles.heroBottom} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .7, delay: .28 }}>
            <p>Программы, в которых детям интересно расти и открывать новое.</p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="#programs">Выбрать программу <Arrow /></a>
              <a className={styles.secondaryButton} href="#trial">Записаться на пробное занятие</a>
            </div>
          </motion.div>
        </div>
        <motion.div className={styles.heroImage} style={{ y: imageY }}>
          <Image src="/images/demos/premium-kids-center/hero.webp" alt="Дети создают объёмную композицию вместе с преподавателем" fill sizes="(max-width: 760px) 100vw, 58vw" loading="eager" fetchPriority="high" />
          <div className={styles.heroNote}><strong>8</strong><span>детей<br />максимум</span></div>
        </motion.div>
        <div className={styles.heroRibbon} aria-hidden="true"><span>учиться через интерес · двигаться в своём темпе · придумывать вместе · </span></div>
      </section>

      <section className={styles.programs} id="programs">
        <SectionIntro index="01" eyebrow="Программы по возрастам" title="Интерес растёт вместе с ребёнком" text="Выберите возраст — мы покажем направления, в которых сейчас будет особенно интересно." />
        <div className={styles.agePicker} role="tablist" aria-label="Возраст ребёнка">
          {ages.map((item) => <button key={item} role="tab" aria-selected={age === item} aria-controls="age-panel" tabIndex={age === item ? 0 : -1} onClick={() => setAge(item)} onKeyDown={(event) => {
            const current = ages.indexOf(item);
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              const next = (current + (event.key === "ArrowRight" ? 1 : -1) + ages.length) % ages.length;
              setAge(ages[next]);
              event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
            }
          }}><span>{item}</span> года</button>)}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div id="age-panel" role="tabpanel" className={styles.programGrid} key={age} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .35 }}>
            {agePrograms[age].map((program, index) => <article className={`${styles.programCard} ${styles[program.tone]}`} key={program.title}>
              <div><span>0{index + 1}</span><i aria-hidden="true" /></div>
              <h3>{program.title}</h3><p>{program.note}</p><a href="#schedule">Найти в расписании <Arrow /></a>
            </article>)}
          </motion.div>
        </AnimatePresence>
      </section>

      <section className={styles.discovery} aria-labelledby="discovery-title">
        <div className={styles.discoverySticky}>
          <p>Пространство развития</p>
          <h2 id="discovery-title">Маршрут, где каждый шаг имеет смысл</h2>
          <div className={styles.discoveryImage}><Image src="/images/demos/premium-kids-center/space.webp" alt="Светлый и безопасный интерьер детского центра" fill sizes="(max-width: 760px) 100vw, 42vw" /></div>
        </div>
        <ol className={styles.discoveryRoute}>
          {[
            ["01", "Маленькие группы", "До восьми детей — чтобы слышать каждого и оставлять место для общения."],
            ["02", "Интерес ведёт", "Сначала вопрос и любопытство, затем навык — не наоборот."],
            ["03", "Без перегрузки", "Чередуем концентрацию, движение и паузы в естественном ритме."],
            ["04", "Безопасная среда", "Продуманное пространство, материалы по возрасту и понятные правила."],
            ["05", "Связь с родителями", "После занятия — короткая обратная связь без формальных отчётов."],
          ].map(([number, title, text]) => <motion.li key={number} initial={{ opacity: .35, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ amount: .65, once: true }}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></motion.li>)}
        </ol>
      </section>

      <section className={styles.schedule} id="schedule">
        <SectionIntro index="02" eyebrow="Расписание" title="Неделя, в которой есть место новому" text="Демонстрационное расписание: выберите день и посмотрите занятия, возраст и наличие мест." />
        <div className={styles.dayPicker} role="tablist" aria-label="День недели">
          {days.map((item) => <button key={item} role="tab" aria-selected={day === item} aria-controls="schedule-panel" tabIndex={day === item ? 0 : -1} onClick={() => setDay(item)} onKeyDown={(event) => {
            const current = days.indexOf(item);
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              const next = (current + (event.key === "ArrowRight" ? 1 : -1) + days.length) % days.length;
              setDay(days[next]);
              event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
            }
          }}>{item}</button>)}
        </div>
        <div className={styles.schedulePanel} id="schedule-panel" role="tabpanel">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {schedule[day].map(([time, years, title, teacher, status]) => <article key={`${time}-${title}`}>
                <time>{time}</time><span className={styles.scheduleAge}>{years} года</span><div><h3>{title}</h3><p>{teacher}</p></div><span className={status === "Лист ожидания" ? styles.waitlist : ""}>{status}</span>
              </article>)}
            </motion.div>
          </AnimatePresence>
        </div>
        <p className={styles.demoNote}>Это демонстрационный интерфейс. Расписание не связано с реальной базой или бронированием.</p>
      </section>

      <section className={styles.team} id="team">
        <SectionIntro index="03" eyebrow="Преподаватели" title="Люди, рядом с которыми интересно пробовать" />
        <div className={styles.teacherRail}>
          {teachers.map((teacher, index) => <article key={teacher.name} className={styles.teacherCard}>
            <div><Image src={teacher.image} alt={`Преподаватель ${teacher.name}`} fill sizes="(max-width: 620px) 78vw, 28vw" style={{ objectPosition: teacher.position }} /></div>
            <p>0{index + 1} · {teacher.role}</p><h3>{teacher.name}</h3><span>{teacher.detail}</span>
          </article>)}
        </div>
      </section>

      <section className={styles.firstClass}>
        <SectionIntro index="04" eyebrow="Первое занятие" title="Понятный путь без лишней суеты" />
        <ol>{[
          ["01", "Выбрать программу"], ["02", "Оставить короткую заявку"], ["03", "Познакомиться с преподавателем"], ["04", "Прийти на пробное занятие"], ["05", "Подобрать постоянную группу"],
        ].map(([number, title]) => <li key={number}><span>{number}</span><h3>{title}</h3><i aria-hidden="true">→</i></li>)}</ol>
      </section>

      <section className={styles.gallerySection} id="gallery">
        <SectionIntro index="05" eyebrow="Жизнь центра" title="Не постановка. Настоящий процесс открытия" />
        <div className={styles.galleryGrid}>
          {gallery.map((item, index) => <button type="button" key={item.src} onClick={(event) => openViewer(index, event.currentTarget)} aria-label={`Открыть фотографию: ${item.label}`}>
            <Image src={item.src} alt={item.alt} fill sizes="(max-width: 760px) 100vw, 50vw" /><span>{item.label} <Arrow /></span>
          </button>)}
        </div>
      </section>

      <section className={styles.reviews}>
        <SectionIntro index="06" eyebrow="Голос родителей" title="Спокойствие тоже можно почувствовать" text="Все отзывы в этом блоке созданы исключительно как демонстрационный контент шаблона." />
        <div>{reviews.map((review, index) => <blockquote key={review.author}><span>“</span><p>{review.quote}</p><footer>{review.author}</footer><i>0{index + 1}</i></blockquote>)}</div>
      </section>

      <section className={styles.faq} id="faq">
        <SectionIntro index="07" eyebrow="FAQ" title="Перед первым визитом" />
        <div>{faqs.map(([question, answer], index) => <details key={question}><summary><span>0{index + 1}</span>{question}<i aria-hidden="true">+</i></summary><p>{answer}</p></details>)}</div>
      </section>

      <section className={styles.finalCta} id="trial">
        <div className={styles.finalOrb} aria-hidden="true"><i /><i /><i /></div>
        <p>BEMBI · Kids Discovery Center</p>
        <h2>Первое открытие начинается<br />с одного занятия.</h2>
        <a className={styles.finalButton} href="#schedule">Записаться на пробное занятие <Arrow /></a>
        <span>Демонстрационный интерфейс: форма не отправляет заявку и не создаёт бронирование.</span>
      </section>

      <footer className={styles.footer}><a className={styles.brand} href="#top"><i aria-hidden="true" />BEMBI</a><p>Premium demo by OneStudio OS · Warszawa · 2026</p><Link href="/demos">Все демо <Arrow /></Link></footer>

      <AnimatePresence>
        {viewer !== null ? <motion.div className={styles.viewerBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setViewer(null); }}>
          <motion.div className={styles.viewer} role="dialog" aria-modal="true" aria-labelledby="viewer-title" ref={dialogRef} initial={{ opacity: 0, scale: .96, clipPath: "inset(8% round 28px)" }} animate={{ opacity: 1, scale: 1, clipPath: "inset(0% round 28px)" }} exit={{ opacity: 0, scale: .98 }}>
            <button className={styles.viewerClose} onClick={() => setViewer(null)} aria-label="Закрыть просмотр">Закрыть ×</button>
            <div className={styles.viewerImage}><Image src={gallery[viewer].src} alt={gallery[viewer].alt} fill sizes="92vw" priority /></div>
            <div className={styles.viewerFooter}><div><p>История 0{viewer + 1}</p><h2 id="viewer-title">{gallery[viewer].label}</h2></div><div><button onClick={() => setViewer((viewer - 1 + gallery.length) % gallery.length)} aria-label="Предыдущая фотография">←</button><button onClick={() => setViewer((viewer + 1) % gallery.length)} aria-label="Следующая фотография">→</button></div></div>
          </motion.div>
        </motion.div> : null}
      </AnimatePresence>
    </main>
  );
}
