import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Platform.module.css";

const routes = [
  ["Задания", "/demos/premium-kids-center/tasks"],
  ["Тетради", "/demos/premium-kids-center/workbooks"],
  ["Эксперименты", "/demos/premium-kids-center/experiments"],
  ["Журнал", "/demos/premium-kids-center/articles"],
] as const;

export function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export function PlatformHeader() {
  return <header className={styles.header}>
    <Link className={styles.logo} href="/demos/premium-kids-center" aria-label="BEMBI Discovery Platform — главная"><i aria-hidden="true">B</i><span>BEMBI<small>Discovery Platform</small></span></Link>
    <nav aria-label="Навигация платформы">{routes.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
    <Link className={styles.allDemos} href="/demos">Все демо <Arrow /></Link>
  </header>;
}

export function PlatformFooter() {
  return <footer className={styles.footer}>
    <div><Link className={styles.logo} href="/demos/premium-kids-center"><i aria-hidden="true">B</i><span>BEMBI<small>Discovery Platform</small></span></Link><p>Образовательная экосистема, где дети учатся через практику, игру, эксперименты и творчество.</p></div>
    <nav aria-label="Разделы в подвале">{routes.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
    <div><p>Демонстрационный интерфейс OneStudio OS.<br />Не связан с данными и бронированиями действующего центра.</p><Link href="/demos">← Вернуться ко всем демо</Link></div>
  </footer>;
}

export function PlatformLayout({ children }: { children: ReactNode }) {
  return <div className={styles.platform}><PlatformHeader />{children}<PlatformFooter /></div>;
}

export function SectionLead({ index, eyebrow, title, text }: { index: string; eyebrow: string; title: string; text?: string }) {
  return <div className={styles.sectionLead}><p><span>{index}</span>{eyebrow}</p><h2>{title}</h2>{text ? <div>{text}</div> : null}</div>;
}
