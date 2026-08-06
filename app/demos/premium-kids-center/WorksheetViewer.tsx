"use client";

import { useEffect, useRef, useState } from "react";
import type { Task } from "./content";
import styles from "./Platform.module.css";

export default function WorksheetViewer({ task, onClose }: { task: Task; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const [notice, setNotice] = useState("");

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
        <div className={styles.paperMeta}><span>BEMBI / MATH LAB</span><span>{task.age} · {task.time}</span></div>
        <h2 id="worksheet-title">{task.title}</h2>
        <p>Собери число из десятков и единиц. Покажи два разных способа и объясни, что осталось неизменным.</p>
        <div className={styles.numberLab} aria-label="Демонстрационный лист с десятками и единицами">
          <div><strong>34</strong><i /><i /><i /><span /><span /><span /><span /></div>
          <b>+</b>
          <div><strong>28</strong><i /><i /><span /><span /><span /><span /><span /><span /><span /><span /></div>
          <b>=</b><em>?</em>
        </div>
        <ol><li>Сначала сложи единицы.</li><li>Собери десять единиц в новый десяток.</li><li>Запиши, сколько десятков и единиц получилось.</li></ol>
      </div>
      <aside><p>{task.subject} · {task.skill}</p><h3>Лист готов к совместной работе</h3><p>Это демонстрация printable-материала. Реальный PDF и коллекция не создаются.</p><button onClick={() => demoAction("Демо: PDF станет доступен в полной версии")}>Посмотреть PDF</button><button onClick={() => demoAction("Задание добавлено в демо-подборку")}>Добавить в подборку</button><span role="status" aria-live="polite">{notice}</span></aside>
    </div>
  </div>;
}
