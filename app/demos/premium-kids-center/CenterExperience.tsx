"use client";

import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Arrow, SectionLead } from "./PlatformShell";
import styles from "./Platform.module.css";

const ages = ["2–3", "4–5", "6–7", "8–10"] as const;
type CenterAge = (typeof ages)[number];
const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] as const;
type CenterDay = (typeof days)[number];

const agePrograms: Record<CenterAge, readonly { title: string; note: string; tone: string }[]> = {
  "2–3": [
    { title: "Раннее развитие", note: "Сенсорная игра, речь и первые самостоятельные открытия.", tone: "centerCoral" },
    { title: "Музыка и движение", note: "Ритм, координация и радость движения вместе.", tone: "centerSky" },
    { title: "Творческая мастерская", note: "Цвет, форма и безопасные материалы для первых идей.", tone: "centerYellow" },
  ],
  "4–5": [
    { title: "Творчество", note: "Большие форматы, смешанные техники и свобода воображения.", tone: "centerCoral" },
    { title: "Английский в игре", note: "Живые фразы, музыка и истории без зубрёжки.", tone: "centerSky" },
    { title: "Театральная студия", note: "Голос, эмоции и уверенность в небольшой группе.", tone: "centerGreen" },
  ],
  "6–7": [
    { title: "Подготовка к школе", note: "Чтение, логика и внимание в бережном темпе.", tone: "centerYellow" },
    { title: "Научная лаборатория", note: "Эксперименты, вопросы и понятные открытия руками.", tone: "centerSky" },
    { title: "Арт-мастерская", note: "Собственные проекты от эскиза до маленькой выставки.", tone: "centerCoral" },
  ],
  "8–10": [
    { title: "Science club", note: "Исследовательские задачи и командные эксперименты.", tone: "centerSky" },
    { title: "Разговорный английский", note: "Проекты, истории и уверенная речь в группе.", tone: "centerGreen" },
    { title: "Театр и сторителлинг", note: "Сценарий, импровизация и собственная постановка.", tone: "centerCoral" },
  ],
};

const centerSchedule: Record<CenterDay, readonly (readonly [string, string, string, string, string])[]> = {
  Пн: [["09:30", "2–3", "Музыка и движение", "Оливия", "3 места"], ["16:30", "6–7", "Подготовка к школе", "Елена", "2 места"], ["18:00", "8–10", "Science club", "Ян", "Лист ожидания"]],
  Вт: [["10:00", "4–5", "Творческая мастерская", "Марта", "4 места"], ["16:00", "6–7", "Английский в игре", "Оливия", "3 места"], ["17:30", "8–10", "Театр и сторителлинг", "Адам", "5 мест"]],
  Ср: [["09:30", "2–3", "Раннее развитие", "Елена", "2 места"], ["16:30", "6–7", "Научная лаборатория", "Ян", "1 место"], ["18:00", "8–10", "Разговорный английский", "Оливия", "4 места"]],
  Чт: [["10:00", "4–5", "Музыка и движение", "Оливия", "3 места"], ["16:00", "6–7", "Арт-мастерская", "Марта", "5 мест"], ["17:30", "8–10", "Science club", "Ян", "2 места"]],
  Пт: [["09:30", "2–3", "Творческая мастерская", "Марта", "4 места"], ["16:30", "4–5", "Театральная студия", "Адам", "3 места"], ["18:00", "6–7", "Подготовка к школе", "Елена", "Лист ожидания"]],
  Сб: [["10:00", "4–7", "Семейная арт-мастерская", "Марта", "5 мест"], ["12:00", "7–10", "Юный исследователь", "Ян", "2 места"]],
};

const centerTeachers = [
  { name: "Елена Новак", role: "Подготовка к школе", detail: "Помогает увидеть смысл задачи раньше правила.", image: "teacher-elena.webp", position: "50% 32%" },
  { name: "Ян Левандовский", role: "Science & making", detail: "Превращает вопрос в опыт, который хочется продолжить.", image: "teacher-jan.webp", position: "50% 28%" },
  { name: "Марта Ковальска", role: "Искусство", detail: "Создаёт среду, где у идеи нет взрослого образца.", image: "creative-studio.webp", position: "54% center" },
  { name: "Оливия Вишневска", role: "Музыка и язык", detail: "Соединяет новое слово, ритм и движение.", image: "music-motion.webp", position: "48% center" },
  { name: "Адам Зелиньский", role: "Театр и истории", detail: "Учит слышать партнёра и уверенно рассказывать своё.", image: "reading-story.webp", position: "55% center" },
] as const;

const gallery = [
  ["creative-studio.webp", "Большой формат", "Ребёнок работает над творческим заданием"],
  ["science-prism.webp", "Сначала вопрос", "Детский научный эксперимент со светом"],
  ["collaboration.webp", "Вместе", "Дети совместно собирают учебный проект"],
  ["music-motion.webp", "Движение и ритм", "Занятие музыкой и движением"],
  ["studio-interior.webp", "Пространство", "Интерьер современной образовательной студии"],
] as const;

const reviews = [
  ["Здесь не торопят с ответом. Ребёнок возвращается домой не уставшим, а с новым вопросом.", "Демонстрационный отзыв · мама Леи"],
  ["Нам спокойно объяснили, как устроена программа и почему именно этот темп сейчас подходит.", "Демонстрационный отзыв · семья Марека"],
  ["После лаборатории опыт продолжился дома — и впервые это была идея ребёнка, а не домашнее задание.", "Демонстрационный отзыв · папа Нины"],
] as const;

const faqs = [
  ["С какого возраста можно посещать занятия?", "Программы начинаются с двух лет и подбираются по возрасту, интересу и комфортному темпу ребёнка."],
  ["Можно ли прийти на пробное занятие?", "Да. Пробный формат помогает познакомиться с педагогом, пространством и будущей группой."],
  ["Сколько детей в группе?", "Обычно от пяти до восьми: достаточно для общения и достаточно мало для личного внимания."],
  ["Можно ли перенести занятие?", "В демонстрационной модели перенос возможен при предварительном уведомлении и наличии места в параллельной группе."],
  ["На каком языке проходят занятия?", "В интерфейсе представлены русскоязычные, польскоязычные и билингвальные форматы."],
  ["Как выбрать программу?", "Начните с возраста и текущего интереса. Координатор поможет уточнить уровень и выбрать пробное занятие."],
  ["Что нужно взять с собой?", "Удобную одежду, сменную обувь и воду. Материалы для занятия уже находятся в центре."],
] as const;

const submenu = [
  ["Обзор", "top"], ["Задания", "tasks"], ["Тетради", "workbooks"], ["Эксперименты", "experiments"], ["Журнал", "journal"], ["Программы", "programs"], ["Расписание", "schedule"], ["Команда", "team"], ["FAQ", "faq"],
] as const;

function useRovingTabs<T extends string>(values: readonly T[], setValue: (value: T) => void) {
  return (event: React.KeyboardEvent<HTMLButtonElement>, value: T) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const current = values.indexOf(value);
    const next = event.key === "Home" ? 0 : event.key === "End" ? values.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + values.length) % values.length;
    setValue(values[next]);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  };
}

export function CenterStickyNav() {
  const [active, setActive] = useState("top");
  const railRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sections = submenu.map(([, id]) => document.getElementById(id)).filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find(entry => entry.isIntersecting);
      if (visible) setActive(visible.target.id);
    }, { rootMargin: "-34% 0px -65%", threshold: 0 });
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const rail = railRef.current;
    const current = rail?.querySelector<HTMLElement>("[aria-current]");
    if (!rail || !current) return;
    const left = current.offsetLeft - (rail.clientWidth - current.offsetWidth) / 2;
    rail.scrollTo({ left, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [active]);
  return <nav className={styles.centerSubnav} aria-label="Разделы главной страницы"><div ref={railRef}>{submenu.map(([label, id]) => <a key={id} href={`#${id}`} aria-current={active === id ? "location" : undefined}>{label}</a>)}</div></nav>;
}

export function CenterExperience() {
  const reduced = useReducedMotion();
  const [age, setAge] = useState<CenterAge>("4–5");
  const [day, setDay] = useState<CenterDay>("Пн");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const ageKeys = useRovingTabs(ages, setAge);
  const dayKeys = useRovingTabs(days, setDay);
  const reveal = { initial: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: .25 }, transition: { duration: reduced ? 0 : .55 } };

  return <div className={styles.centerExperience}>
    <section className={styles.centerPrograms} id="programs"><SectionLead index="07" eyebrow="Программы по возрастам" title="Интерес растёт вместе с ребёнком" text="Выберите возраст — мы покажем направления, в которых сейчас будет особенно интересно." />
      <div className={styles.centerAgePicker} role="tablist" aria-label="Возраст ребёнка">{ages.map(item => <button key={item} role="tab" aria-selected={age === item} aria-controls="center-age-panel" tabIndex={age === item ? 0 : -1} onClick={() => setAge(item)} onKeyDown={event => ageKeys(event, item)}><span>{item}</span> года</button>)}</div>
      <AnimatePresence mode="wait" initial={false}><motion.div id="center-age-panel" role="tabpanel" className={styles.centerProgramGrid} key={age} initial={{ opacity: 0, y: reduced ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -8 }} transition={{ duration: reduced ? 0 : .35 }}>{agePrograms[age].map((program, index) => <article className={`${styles.centerProgramCard} ${styles[program.tone]}`} key={program.title}><div><span>0{index + 1}</span><i aria-hidden="true" /></div><h3>{program.title}</h3><p>{program.note}</p><a href="#schedule">Найти в расписании <Arrow /></a></article>)}</motion.div></AnimatePresence>
    </section>

    <section className={styles.centerApproach} aria-labelledby="center-approach-title"><div className={styles.centerApproachSticky}><p>Пространство развития</p><h2 id="center-approach-title">Маршрут, где каждый шаг имеет смысл</h2><div><Image src="/images/demos/premium-kids-center/studio-interior.webp" alt="Светлый интерьер образовательной студии" fill sizes="(max-width: 760px) 100vw, 42vw" /></div></div><ol>{[["01", "Маленькие группы", "До восьми детей — чтобы слышать каждого и оставлять место для общения."], ["02", "Интерес ведёт", "Сначала вопрос и любопытство, затем навык — не наоборот."], ["03", "Без перегрузки", "Чередуем концентрацию, движение и паузы в естественном ритме."], ["04", "Безопасная среда", "Продуманное пространство, материалы по возрасту и понятные правила."], ["05", "Связь с родителями", "После занятия — короткая обратная связь без формальных отчётов."]].map(([number, title, text]) => <motion.li key={number} {...reveal}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></motion.li>)}</ol></section>

    <section className={styles.centerSchedule} id="schedule"><SectionLead index="08" eyebrow="Расписание" title="Неделя, в которой есть место новому" text="Демонстрационное расписание: выберите день и посмотрите занятия, возраст и наличие мест." /><div className={styles.centerDayPicker} role="tablist" aria-label="День недели">{days.map(item => <button key={item} role="tab" aria-selected={day === item} aria-controls="center-schedule-panel" tabIndex={day === item ? 0 : -1} onClick={() => setDay(item)} onKeyDown={event => dayKeys(event, item)}>{item}</button>)}</div><div className={styles.centerSchedulePanel} id="center-schedule-panel" role="tabpanel"><AnimatePresence mode="wait" initial={false}><motion.div key={day} initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .3 }}>{centerSchedule[day].map(([time, years, title, teacher, status]) => <article key={`${time}-${title}`}><time>{time}</time><span>{years} лет</span><div><h3>{title}</h3><p>{teacher}</p></div><b className={status === "Лист ожидания" ? styles.centerWaitlist : ""}>{status}</b></article>)}</motion.div></AnimatePresence></div><p className={styles.centerDemoNote}>Демонстрационный интерфейс: расписание не связано с реальной базой или бронированием.</p></section>

    <section className={styles.centerTeam} id="team"><SectionLead index="09" eyebrow="Преподаватели" title="Люди, рядом с которыми интересно пробовать" /><div className={styles.centerRailControls}><button onClick={() => railRef.current?.scrollBy({ left: -320, behavior: reduced ? "auto" : "smooth" })} aria-label="Прокрутить преподавателей назад">←</button><button onClick={() => railRef.current?.scrollBy({ left: 320, behavior: reduced ? "auto" : "smooth" })} aria-label="Прокрутить преподавателей вперёд">→</button></div><div className={styles.centerTeacherRail} ref={railRef}>{centerTeachers.map((teacher, index) => <article key={teacher.name}><div><Image src={`/images/demos/premium-kids-center/${teacher.image}`} alt={`Преподаватель ${teacher.name}`} fill sizes="(max-width: 760px) 76vw, 19vw" style={{ objectPosition: teacher.position }} /></div><p>0{index + 1} · {teacher.role}</p><h3>{teacher.name}</h3><span>{teacher.detail}</span></article>)}</div></section>

    <section className={styles.centerFirstClass}><SectionLead index="10" eyebrow="Первое занятие" title="Понятный путь без лишней суеты" /><motion.ol initial="rest" whileInView="active" viewport={{ once: true, amount: .35 }}>{["Выбрать программу", "Оставить короткую заявку", "Познакомиться с преподавателем", "Прийти на пробное занятие", "Подобрать постоянную группу"].map((title, index) => <motion.li key={title} variants={{ rest: { opacity: reduced ? 1 : .55, y: 0 }, active: { opacity: 1, y: 0, transition: { delay: reduced ? 0 : index * .09 } } }}><span>0{index + 1}</span><h3>{title}</h3><i aria-hidden="true">→</i></motion.li>)}</motion.ol></section>

    <section className={styles.centerGallery} id="gallery"><SectionLead index="11" eyebrow="Жизнь центра" title="Не постановка. Настоящий процесс открытия" /><div>{gallery.map(([src, label, alt]) => <figure key={src}><div><Image src={`/images/demos/premium-kids-center/${src}`} alt={alt} fill sizes="(max-width: 760px) 100vw, 50vw" /></div><figcaption>{label} <Arrow /></figcaption></figure>)}</div></section>

    <section className={styles.centerReviews}><SectionLead index="12" eyebrow="Голос родителей" title="Спокойствие тоже можно почувствовать" text="Все отзывы в этом блоке созданы исключительно как демонстрационный контент шаблона." /><div>{reviews.map(([quote, author], index) => <blockquote key={author}><span aria-hidden="true">“</span><p>{quote}</p><footer>{author}</footer><i>0{index + 1}</i></blockquote>)}</div></section>

    <section className={styles.centerFaq} id="faq"><SectionLead index="13" eyebrow="FAQ" title="Перед первым визитом" /><div>{faqs.map(([question, answer], index) => { const open = openFaq === index; return <div className={styles.centerFaqItem} key={question}><h3><button aria-expanded={open} aria-controls={`faq-panel-${index}`} onClick={() => setOpenFaq(open ? null : index)}><span>0{index + 1}</span>{question}<i aria-hidden="true">+</i></button></h3><AnimatePresence initial={false}>{open ? <motion.div id={`faq-panel-${index}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : .28 }}><p>{answer}</p></motion.div> : null}</AnimatePresence></div>; })}</div></section>
  </div>;
}

export function CenterFinalCta() {
  const ref = useRef<HTMLElement>(null);
  const active = useInView(ref, { amount: .2 });
  const reduced = useReducedMotion();
  return <section ref={ref} className={styles.centerFinalCta} id="trial"><div className={styles.centerFinalOrb} data-active={active && !reduced ? "true" : "false"} aria-hidden="true"><i /><i /><i /></div><p>BEMBI · Kids Discovery Platform</p><h2>Первое открытие начинается<br />с одного занятия.</h2><a href="#schedule">Записаться на пробное занятие <Arrow /></a><span>Демонстрационный интерфейс OneStudio OS: форма не отправляет заявку и не создаёт бронирование.</span></section>;
}
