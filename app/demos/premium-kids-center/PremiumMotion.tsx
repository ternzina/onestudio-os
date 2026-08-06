"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { experiments, tasks, workbooks, type Task } from "./content";
import { Arrow } from "./PlatformShell";
import styles from "./Platform.module.css";

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroDiscovery() {
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 90, damping: 22 });
  const y = useSpring(pointerY, { stiffness: 90, damping: 22 });
  const formulaX = useTransform(x, value => -value * .7);
  const shapeX = useTransform(x, value => value * 1.4);
  const shapeY = useTransform(y, value => value * 1.4);
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 30]);
  const detailY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -20]);

  const trackPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 9);
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 7);
  };

  return <section className={styles.hero} id="top">
    <motion.div className={styles.heroCopy} initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : .09 } } }}>
      <motion.p className={styles.kicker} variants={{ hidden: { opacity: 0, x: -14 }, visible: { opacity: 1, x: 0, transition: { duration: .55, ease } } }}><span>01</span> Learning ecosystem · Warszawa / online</motion.p>
      <h1 aria-label="Место для больших открытий"><span className={styles.heroLine}><motion.span variants={{ hidden: { y: "110%" }, visible: { y: 0, transition: { duration: .72, ease } } }}>Место для</motion.span></span><span className={styles.heroLine}><motion.em variants={{ hidden: { y: "110%" }, visible: { y: 0, transition: { duration: .72, ease } } }}>больших<i aria-hidden="true" /></motion.em></span><span className={styles.heroLine}><motion.span variants={{ hidden: { y: "110%" }, visible: { y: 0, transition: { duration: .72, ease } } }}>открытий</motion.span></span></h1>
      <motion.p className={styles.heroText} variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: .55, ease } } }}>Программы, в которых детям интересно расти, исследовать и открывать новое.</motion.p>
      <motion.div className={styles.heroActions} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: .5 } } }}><a href="#offline" className={styles.primaryButton}>Найти занятие <Arrow /></a><Link href="/demos/premium-kids-center/tasks" className={styles.secondaryButton}>Открыть библиотеку заданий</Link></motion.div>
      <motion.ul className={styles.heroCategories} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}><li>Практика</li><li>Эксперименты</li><li>Журнал</li><li>Офлайн-программы</li></motion.ul>
    </motion.div>
    <div ref={stageRef} className={styles.heroVisual} onPointerMove={trackPointer} onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}>
      <motion.div className={styles.heroImageMask} initial={{ clipPath: "inset(0 0 100% 0 round 48% 48% 18px 18px)" }} animate={{ clipPath: "inset(0 0 0% 0 round 0px)" }} transition={{ duration: reduced ? 0 : 1.05, delay: reduced ? 0 : .12, ease }} style={{ y: imageY }}><Image src="/images/demos/premium-kids-center/hero-platform.webp" alt="Дети вместе с педагогом создают геометрический город в образовательной лаборатории" fill priority sizes="(max-width: 760px) 100vw, 58vw" /></motion.div>
      <motion.div className={styles.heroPaper} style={{ x, y }} initial={{ opacity: 0, rotate: -8, scale: .92 }} animate={{ opacity: 1, rotate: -3, scale: 1 }} transition={{ delay: reduced ? 0 : .7, duration: .6, ease }}>наблюдай<br />пробуй<br /><b>объясняй</b></motion.div>
      <motion.div className={styles.heroFormula} style={{ x: formulaX, y: detailY }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .65 }}>12 × ? = idea</motion.div>
      <motion.div className={styles.heroShape} style={{ x: shapeX, y: shapeY }} aria-hidden="true"><span>∑</span><i /></motion.div>
      <svg className={styles.heroRoute} viewBox="0 0 500 260" aria-hidden="true"><motion.path d="M22 220C100 120 172 260 252 134S420 48 480 26" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduced ? 0 : 1.4, delay: reduced ? 0 : .8, ease }} /><circle cx="22" cy="220" r="7"/><circle cx="252" cy="134" r="7"/><circle cx="480" cy="26" r="7"/></svg>
    </div>
    <div className={styles.trustLine}><span>Для детей 2–10 лет</span><span>Материалы для дома</span><span>Маленькие группы</span><span>Осмысленный экран</span></div>
  </section>;
}

export function DiscoveryRoute() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 55%"] });
  return <div ref={ref} className={styles.discoveryRoute} aria-hidden="true"><svg viewBox="0 0 80 1000" preserveAspectRatio="none"><path className={styles.routeBase} d="M40 0 C70 110 12 180 42 270 S70 430 35 520 S10 690 44 770 S64 900 40 1000"/><motion.path className={styles.routeLive} d="M40 0 C70 110 12 180 42 270 S70 430 35 520 S10 690 44 770 S64 900 40 1000" style={{ pathLength: reduced ? 1 : scrollYProgress }}/></svg>{["вопрос", "идея", "опыт", "навык", "результат"].map((label, index) => <motion.span key={label} style={{ top: `${8 + index * 21}%` }} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ amount: 1 }} transition={{ duration: reduced ? 0 : .45, delay: index * .04 }}><i />{label}</motion.span>)}</div>;
}

export function TaskMicroPreview({ task }: { task: Task }) {
  const kind = task.id === "add-100" ? "math" : task.id === "syllables" ? "reading" : task.id === "space" ? "geometry" : task.id === "motor" ? "motor" : task.id === "creative-print" ? "creative" : "logic";
  const content: Record<typeof kind, ReactNode> = {
    math: <><b>30</b><i>+</i><b>4</b><i>+</i><b>28</b><span>= 62</span></>,
    reading: <><b>ЛИ</b><i>+</i><b>СА</b><span>ЛИСА</span></>,
    geometry: <><b /><i /><span /><em /></>,
    logic: <><b /><i /><b /><i /><span>?</span></>,
    creative: <><b /><i /><span /><em /></>,
    motor: <svg viewBox="0 0 180 60"><path d="M4 42 C38 4 55 57 88 26 S142 4 176 35"/><polyline points="164,27 176,35 164,42"/></svg>,
  };
  return <div className={`${styles.taskMicro} ${styles[`taskMicro_${kind}`]}`} aria-hidden="true">{content[kind]}</div>;
}

export function ExperimentPreview({ id }: { id: string }) {
  return <div className={`${styles.experimentPreview} ${styles[`experimentPreview_${id}`]}`} aria-hidden="true"><i /><i /><i /><b /><span /></div>;
}

export function WorkbookExperience() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const book = workbooks[active];
  return <div className={styles.workbookLayout}>
    <div className={styles.bookStage}><motion.div className={styles.bookStack} key={book.title} initial={{ opacity: 0, rotateY: -8 }} animate={{ opacity: 1, rotateY: 0 }} transition={{ duration: reduced ? 0 : .55, ease }}><i /><i /><motion.div initial={{ clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }} transition={{ delay: reduced ? 0 : .15, duration: reduced ? 0 : .55, ease }}><Image src="/images/demos/premium-kids-center/workbook-cover.webp" alt={`Обложка программы «${book.title}»`} fill sizes="(max-width: 760px) 90vw, 38vw" /></motion.div><span>{String(active + 1).padStart(2, "0")} / 04</span></motion.div></div>
    <ol>{workbooks.map((item, index) => <li key={item.title} className={index === active ? styles.activeWorkbook : ""}><button onClick={() => setActive(index)} aria-pressed={index === active}><span>0{index + 1}</span><div><p>{item.age} · {item.tasks} заданий · {item.duration}</p><h3>{item.title}</h3><small>{item.pace}</small><ul>{item.skills.map(skill => <li key={skill}>{skill}</li>)}</ul></div></button></li>)}</ol>
  </div>;
}

const discoveryOptions = {
  interest: ["Числа", "Истории", "Творчество", "Эксперименты"], age: ["4–6", "6–8", "8–10"], time: ["15 минут", "30 минут", "Выходной"],
} as const;

export function TodayDiscovery() {
  const reduced = useReducedMotion();
  const [choice, setChoice] = useState({ interest: "Числа", age: "6–8", time: "30 минут" });
  const [version, setVersion] = useState(0);
  const interestIndex = discoveryOptions.interest.findIndex(value => value === choice.interest);
  const ageIndex = discoveryOptions.age.findIndex(value => value === choice.age);
  const index = (interestIndex + ageIndex + version) % 4;
  return <section className={styles.todayDiscovery} aria-labelledby="today-title"><div className={styles.todayIntro}><p>Персональный маршрут / demo</p><h2 id="today-title">Карта сегодняшнего открытия</h2><span>Три быстрых выбора превращаются в спокойную подборку на день.</span></div><div className={styles.discoveryBuilder}>{Object.entries(discoveryOptions).map(([key, options]) => <fieldset key={key}><legend>{{ interest: "Интерес", age: "Возраст", time: "Свободное время" }[key]}</legend>{options.map(option => <button type="button" key={option} aria-pressed={choice[key as keyof typeof choice] === option} onClick={() => setChoice(old => ({ ...old, [key]: option }))}>{option}</button>)}</fieldset>)}</div><motion.div className={styles.discoveryBundle} key={`${choice.interest}-${choice.age}-${choice.time}-${version}`} initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }} animate={{ opacity: 1, clipPath: "inset(0)" }} transition={{ duration: reduced ? 0 : .55, ease }}><div><small>Задание</small><b>{tasks[index].title}</b></div><div><small>Эксперимент</small><b>{experiments[index].title}</b></div><div><small>Для родителя</small><b>{index % 2 ? "Как поддержать интерес без давления" : "Числа в повседневных разговорах"}</b></div><div><small>В центре</small><b>{index % 2 ? "Творческая лаборатория" : "Математика через практику"}</b></div></motion.div><button className={styles.rebuildButton} onClick={() => setVersion(value => value + 1)}>Собрать другое открытие <Arrow /></button></section>;
}

export function ReadingProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  return <motion.div className={styles.readingProgress} style={{ scaleX: reduced ? 1 : scrollYProgress }} aria-hidden="true" />;
}
