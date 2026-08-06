"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Task } from "./content";
import styles from "./Platform.module.css";

type WorksheetDefinition = Readonly<{
  label: string;
  instruction: string;
  asideTitle: string;
  hint: string;
  visual: ReactNode;
  steps: readonly string[];
}>;

const worksheetByTaskId: Record<Task["id"], WorksheetDefinition> = {
  "add-100": {
    label: "BEMBI / MATH LAB",
    instruction: "Собери числа из десятков и единиц. Найди удобный переход через десяток и объясни свой способ.",
    asideTitle: "Десятки становятся видимыми",
    hint: "Можно передвигать воображаемые блоки и сначала дополнить 34 до круглого числа.",
    visual: <div className={styles.numberLab} aria-label="Пример сложения 34 и 28 с десятками и единицами"><div><strong>34</strong><i /><i /><i /><span /><span /><span /><span /></div><b>+</b><div><strong>28</strong><i /><i /><span /><span /><span /><span /><span /><span /><span /><span /></div><b>=</b><em>?</em></div>,
    steps: ["Сначала сложи единицы.", "Обмени десять единиц на новый десяток.", "Запиши и проверь получившееся число."],
  },
  patterns: {
    label: "BEMBI / LOGIC LAB",
    instruction: "Рассмотри последовательность, найди правило изменения и выбери две следующие фигуры.",
    asideTitle: "Закономерность — это правило",
    hint: "Сравни цвет, форму и положение каждого следующего элемента.",
    visual: <div className={`${styles.worksheetActivity} ${styles.patternLab}`} aria-label="Последовательность фигур для продолжения"><i /><b /><i /><b /><i /><span>?</span><span>?</span></div>,
    steps: ["Назови, что повторяется.", "Продолжи ряд двумя элементами.", "Придумай собственную последовательность с тем же правилом."],
  },
  syllables: {
    label: "BEMBI / READING ROOM",
    instruction: "Соедини слоги, прочитай слова плавно и выбери слово, которое подходит к маленькой истории.",
    asideTitle: "Читаем смысл, а не скорость",
    hint: "Проведи пальцем от первого слога ко второму и произнеси слово без паузы.",
    visual: <div className={`${styles.worksheetActivity} ${styles.syllableLab}`} aria-label="Слоги для составления слов"><span>МА</span><i>+</i><span>МА</span><b>МАМА</b><span>ЛИ</span><i>+</i><span>СА</span><b>ЛИСА</b></div>,
    steps: ["Прочитай каждый слог отдельно.", "Соедини слоги одним голосовым движением.", "Составь короткое предложение с выбранным словом."],
  },
  space: {
    label: "BEMBI / SHAPE STUDIO",
    instruction: "Собери силуэт из простых форм, поверни одну деталь и найди второй способ заполнить пространство.",
    asideTitle: "Форма меняется при повороте",
    hint: "Начни с самой большой детали, затем заполняй свободные углы.",
    visual: <div className={`${styles.worksheetActivity} ${styles.geometryLab}`} aria-label="Геометрические детали и контур для заполнения"><div><i /><i /><i /><i /></div><span><b /><b /><b /></span></div>,
    steps: ["Назови формы и сравни их стороны.", "Собери фигуру внутри контура.", "Поверни треугольник и найди другую композицию."],
  },
  motor: {
    label: "BEMBI / HAND & LINE",
    instruction: "Проведи линии по маршрутам, меняя направление и нажим, затем вырежи широкую дорожку.",
    asideTitle: "Рука учится планировать движение",
    hint: "Работай медленно: взгляд идёт немного впереди карандаша или ножниц.",
    visual: <div className={`${styles.worksheetActivity} ${styles.motorLab}`} aria-label="Три линии-маршрута для тренировки мелкой моторики"><i /><i /><i /><span>старт</span><b>финиш</b></div>,
    steps: ["Обведи прямой маршрут без остановки.", "Пройди волнистую линию в спокойном темпе.", "Вырежи широкую дорожку по внешнему контуру."],
  },
  maze: {
    label: "BEMBI / STRATEGY LAB",
    instruction: "Найди путь от точки старта к мастерской. Нельзя проходить через закрашенные клетки.",
    asideTitle: "Маршрут можно проверить заранее",
    hint: "Сначала проследи путь глазами и только потом проведи линию.",
    visual: <div className={`${styles.worksheetActivity} ${styles.mazeLab}`} aria-label="Логический лабиринт от старта к финишу">{Array.from({ length: 25 }, (_, index) => <i key={index} className={[1, 6, 8, 13, 16, 18, 21].includes(index) ? styles.mazeWall : ""}>{index === 20 ? "S" : index === 4 ? "F" : ""}</i>)}</div>,
    steps: ["Отметь возможные повороты.", "Выбери самый короткий открытый путь.", "Нарисуй одну стену, которая сделает маршрут сложнее."],
  },
  "creative-print": {
    label: "BEMBI / PRINT STUDIO",
    instruction: "Выбери три формы, придумай ритм и собери печатный узор без готового образца.",
    asideTitle: "Узор начинается с собственного правила",
    hint: "Меняй только один признак за раз: цвет, размер или направление.",
    visual: <div className={`${styles.worksheetActivity} ${styles.creativeLab}`} aria-label="Цветные формы для создания печатного узора"><i /><b /><span /><i /><b /><span /></div>,
    steps: ["Выбери порядок трёх форм.", "Повтори его два раза и измени один элемент.", "Дай узору название и расскажи, какое у него настроение."],
  },
};

export default function WorksheetViewer({ task, onClose }: { task: Task; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const [notice, setNotice] = useState("");
  const worksheet = worksheetByTaskId[task.id];

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !dialog) return;
      const nodes = [...dialog.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')];
      if (!nodes.length) return;
      const first = nodes[0]; const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); if (noticeTimerRef.current !== null) window.clearTimeout(noticeTimerRef.current); document.body.style.overflow = oldOverflow; previous?.focus(); };
  }, [onClose]);

  const demoAction = (message: string) => { setNotice(message); if (noticeTimerRef.current !== null) window.clearTimeout(noticeTimerRef.current); noticeTimerRef.current = window.setTimeout(() => setNotice(""), 2400); };
  return <div className={styles.dialogBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={styles.worksheetDialog} role="dialog" aria-modal="true" aria-labelledby="worksheet-title" ref={dialogRef}>
      <button className={styles.dialogClose} onClick={onClose} aria-label="Закрыть просмотр задания">Закрыть ×</button>
      <div className={styles.worksheetPaper}>
        <div className={styles.paperMeta}><span>{worksheet.label}</span><span>{task.age} · {task.time}</span></div>
        <h2 id="worksheet-title">{task.title}</h2>
        <p>{worksheet.instruction}</p>
        {worksheet.visual}
        <ol>{worksheet.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      </div>
      <aside><p>{task.subject} · {task.skill}</p><h3>{worksheet.asideTitle}</h3><p>{worksheet.hint}</p><button onClick={() => demoAction("Демо: PDF станет доступен в полной версии")}>Посмотреть PDF</button><button onClick={() => demoAction("Задание добавлено в демо-подборку")}>Добавить в подборку</button><span role="status" aria-live="polite">{notice}</span></aside>
    </div>
  </div>;
}
