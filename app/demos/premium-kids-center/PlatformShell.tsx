import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Platform.module.css";
import PlatformMotionRuntime from "./PlatformMotionRuntime";

const routes = [
  ["Задания", "tasks"],
  ["Тетради", "workbooks"],
  ["Эксперименты", "experiments"],
  ["Журнал", "articles"],
] as const;

export const BEMBI_DEMO_BASE_PATH = "/demos/premium-kids-center";

export function bembiHref(basePath: string, path = "") {
  const normalizedBase = basePath === "/" ? "" : basePath.replace(/\/$/, "");
  return path ? `${normalizedBase}/${path}` : normalizedBase || "/";
}

export function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export function PlatformHeader({ basePath = BEMBI_DEMO_BASE_PATH, demo = true }) {
  return <header className={styles.header}>
    <Link className={styles.logo} href={basePath} aria-label="BEMBI Discovery Platform — главная"><i aria-hidden="true">B</i><span>BEMBI<small>Discovery Platform</small></span></Link>
    <nav aria-label="Навигация платформы">{routes.map(([label, path]) => <Link key={path} href={bembiHref(basePath, path)}>{label}</Link>)}</nav>
    {demo ? <Link className={styles.allDemos} href="/demos">Все демо <Arrow /></Link> : null}
  </header>;
}

export function PlatformFooter({ basePath = BEMBI_DEMO_BASE_PATH, demo = true }) {
  return <footer className={styles.footer}>
    <div><Link className={styles.logo} href={basePath}><i aria-hidden="true">B</i><span>BEMBI<small>Discovery Platform</small></span></Link><p>Образовательная экосистема, где дети учатся через практику, игру, эксперименты и творчество.</p></div>
    <nav aria-label="Разделы в подвале">{routes.map(([label, path]) => <Link key={path} href={bembiHref(basePath, path)}>{label}</Link>)}</nav>
    {demo ? <div><p>Демонстрационный интерфейс OneStudio OS.<br />Не связан с данными и бронированиями действующего центра.</p><Link href="/demos">← Вернуться ко всем демо</Link></div> : null}
  </footer>;
}

export function PlatformLayout({ children, basePath = BEMBI_DEMO_BASE_PATH, demo = true }: { children: ReactNode; basePath?: string; demo?: boolean }) {
  return <div className={styles.platform}><PlatformMotionRuntime /><PlatformHeader basePath={basePath} demo={demo} />{children}<PlatformFooter basePath={basePath} demo={demo} /></div>;
}

export function SectionLead({ index, eyebrow, title, text }: { index: string; eyebrow: string; title: string; text?: string }) {
  return <div className={styles.sectionLead}><p><span>{index}</span>{eyebrow}</p><h2>{title}</h2>{text ? <div>{text}</div> : null}</div>;
}
