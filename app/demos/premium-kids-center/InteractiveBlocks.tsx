"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { experiments, interests, offlinePrograms, schedule, tasks, type InterestId, type Task } from "./content";
import { ageRangesOverlap } from "./ageRanges";
import { ExperimentPreview, TaskMicroPreview } from "./PremiumMotion";
import styles from "./Platform.module.css";
import BembiTemplateImage from "./BembiTemplateImage";
import { premiumKidsNativeMediaUrl, type PremiumKidsNativeMedia } from "@/lib/public-site/premium-kids-native-media";

const WorksheetViewer = dynamic(() => import("./WorksheetViewer"), { ssr: false, loading: () => <div className={styles.viewerLoading} role="status">Открываем лист…</div> });

export function InterestNavigator({ nativeMedia }: { nativeMedia?: PremiumKidsNativeMedia } = {}) {
  const [active, setActive] = useState<InterestId>("math");
  const current = interests.find((item) => item.id === active) ?? interests[0];
  return <div className={styles.interestExplorer}>
    <div className={styles.interestTabs} role="tablist" aria-label="Интересы ребёнка">{interests.map((item) => <button key={item.id} role="tab" aria-selected={active === item.id} aria-controls="interest-panel" onClick={() => setActive(item.id)}>{item.label}</button>)}</div>
    <AnimatePresence mode="wait"><motion.div id="interest-panel" role="tabpanel" key={current.id} className={styles.interestPanel} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div><p>Подборка дня / {current.label}</p><h3>{current.title}</h3><span>{current.note}</span><ul>{current.links.map((link) => <li key={link}>{link}<i aria-hidden="true">↗</i></li>)}</ul></div>
      <div className={styles.interestImage}><BembiTemplateImage src={premiumKidsNativeMediaUrl(nativeMedia, `interest-${current.id}`, current.image)} alt={`Ребёнок исследует направление «${current.label}»`} sizes="(max-width: 760px) 100vw, 48vw" media={nativeMedia} /></div>
    </motion.div></AnimatePresence>
  </div>;
}

const filterOptions = {
  age: ["Все", "4–6", "6–8", "7–10"],
  grade: ["Все", "Старт", "1–2 класс", "2 класс", "2–4 класс"],
  subject: ["Все", "Математика", "Логика", "Чтение", "Творчество"],
  skill: ["Все", "Состав числа", "Анализ", "Плавность", "Геометрия", "Координация", "Стратегия", "Воображение"],
  format: ["Все", "Printable", "Карточки", "Мини-книга", "Практикум"],
  time: ["Все", "до 15 минут", "15–20 минут", "более 20 минут"],
} as const;

export function TaskExplorer({ compact = false, nativeMedia }: { compact?: boolean; nativeMedia?: PremiumKidsNativeMedia }) {
  const [filters, setFilters] = useState({ age: "Все", grade: "Все", subject: "Все", skill: "Все", format: "Все", time: "Все" });
  const [selected, setSelected] = useState<Task | null>(null);
  const visible = useMemo(() => tasks.filter((task) => {
    const minutes = Number.parseInt(task.time);
    const timeMatch = filters.time === "Все" || (filters.time === "до 15 минут" && minutes <= 15) || (filters.time === "15–20 минут" && minutes >= 15 && minutes <= 20) || (filters.time === "более 20 минут" && minutes > 20);
    return (filters.age === "Все" || ageRangesOverlap(filters.age, task.age)) && (filters.grade === "Все" || task.grade === filters.grade) && (filters.subject === "Все" || task.subject === filters.subject) && (filters.skill === "Все" || task.skill === filters.skill) && (filters.format === "Все" || task.format === filters.format) && timeMatch;
  }), [filters]);
  const display = compact ? visible.slice(0, 4) : visible;
  return <>
    <div className={styles.taskFilters} aria-label="Фильтры заданий">{Object.entries(filterOptions).map(([key, options]) => <label key={key}><span>{{ age: "Возраст", grade: "Класс", subject: "Предмет", skill: "Навык", format: "Формат", time: "Время" }[key]}</span><select value={filters[key as keyof typeof filters]} onChange={(event) => setFilters((old) => ({ ...old, [key]: event.target.value }))}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>)}</div>
    <div className={styles.taskGrid}>{display.map((task, index) => <article className={`${styles.taskCard} ${styles[task.accent]}`} key={task.id}>
      <div className={styles.taskPreview}><BembiTemplateImage src={premiumKidsNativeMediaUrl(nativeMedia, `task-${task.id}`, task.image)} alt="" sizes="(max-width: 700px) 100vw, 32vw" media={nativeMedia} /><span>{String(index + 1).padStart(2, "0")}</span><TaskMicroPreview task={task} /></div>
      <div><p>{task.age} · {task.time}</p><h3>{task.title}</h3><ul><li>{task.level}</li><li>{task.skill}</li><li>{task.format}</li></ul><button onClick={() => setSelected(task)}>Открыть задание <span aria-hidden="true">↗</span></button></div>
    </article>)}</div>
    {selected ? <WorksheetViewer task={selected} onClose={() => setSelected(null)} /> : null}
  </>;
}

export function ExperimentExplorer({ limit, nativeMedia }: { limit?: number; nativeMedia?: PremiumKidsNativeMedia }) {
  const [open, setOpen] = useState<string | null>(null);
  return <div className={styles.experimentGrid}>{experiments.slice(0, limit).map((item, index) => <article key={item.id} className={styles.experimentCard}>
    <div className={styles.experimentImage}><BembiTemplateImage src={premiumKidsNativeMediaUrl(nativeMedia, `experiment-${item.id}`, item.image)} alt={`Материалы для эксперимента «${item.title}»`} sizes="(max-width: 700px) 100vw, 45vw" media={nativeMedia} /><span>0{index + 1}</span><ExperimentPreview id={item.id} /></div>
    <div><p>{item.category} · {item.age}</p><h3>{item.title}</h3><ul><li>{item.time}</li><li>{item.level}</li><li>{item.adult}</li></ul><button aria-expanded={open === item.id} aria-controls={`experiment-${item.id}`} onClick={() => setOpen(open === item.id ? null : item.id)}>{open === item.id ? "Свернуть" : "Что понадобится"}<span aria-hidden="true">{open === item.id ? "−" : "+"}</span></button>
      <AnimatePresence>{open === item.id ? <motion.div id={`experiment-${item.id}`} className={styles.experimentDetails} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}><h4>Материалы</h4><p>{item.materials.join(" · ")}</p><h4>Как проходит эксперимент</h4><ol>{item.steps.map((step) => <li key={step}>{step}</li>)}</ol></motion.div> : null}</AnimatePresence>
    </div>
  </article>)}</div>;
}

export function OfflineExplorer() {
  const ages = Object.keys(offlinePrograms) as Array<keyof typeof offlinePrograms>;
  const days = Object.keys(schedule) as Array<keyof typeof schedule>;
  const [age, setAge] = useState<(typeof ages)[number]>("6–7"); const [day, setDay] = useState<(typeof days)[number]>("Пн");
  return <div className={styles.offlineExplorer}><div className={styles.ageColumn}><div role="tablist" aria-label="Возрастные группы">{ages.map((value) => <button role="tab" aria-selected={age === value} key={value} onClick={() => setAge(value)}>{value} лет</button>)}</div><AnimatePresence mode="wait"><motion.ul role="tabpanel" key={age} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{offlinePrograms[age].map((program, index) => <li key={program}><span>0{index + 1}</span><h3>{program}</h3><i aria-hidden="true">↗</i></li>)}</motion.ul></AnimatePresence></div>
    <div className={styles.schedule}><div role="tablist" aria-label="Дни недели">{days.map((value) => <button role="tab" aria-selected={day === value} key={value} onClick={() => setDay(value)}>{value}</button>)}</div><AnimatePresence mode="wait"><motion.div key={day} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{schedule[day].map(([time, years, title, teacher, status]) => <article key={`${time}-${title}`}><time>{time}</time><span>{years}</span><div><h3>{title}</h3><p>{teacher}</p></div><b>{status}</b></article>)}</motion.div></AnimatePresence><small>Демонстрационное расписание: не связано с базой и бронированием.</small></div>
  </div>;
}

export function DiscoveryProgress() {
  const reduced = useReducedMotion();
  return <motion.div className={styles.discoveryProgress} aria-hidden="true" initial={{ scaleX: 0 }} whileInView={{ scaleX: reduced ? 1 : 1 }} viewport={{ once: true, amount: .3 }} transition={{ duration: reduced ? 0 : 1.2 }} />;
}
