import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Platform.module.css";
import PlatformMotionRuntime from "./PlatformMotionRuntime";
import type { PremiumKidsContent } from "@/lib/public-site/premium-kids-content";

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

export function PlatformHeader({ basePath = BEMBI_DEMO_BASE_PATH, demo = true, content }: { basePath?: string; demo?: boolean; content?: PremiumKidsContent }) {
  return <header className={styles.header}>
    <Link className={styles.logo} href={basePath} aria-label={`${content?.brand_name ?? "BEMBI"} — главная`}><i aria-hidden="true">{(content?.brand_name ?? "B").slice(0, 1)}</i><span>{content?.brand_name ?? "BEMBI"}<small>{content?.brand_tagline ?? "Discovery Platform"}</small></span></Link>
    <nav aria-label="Навигация платформы">{routes.map(([label, path]) => <Link key={path} href={bembiHref(basePath, path)}>{label}</Link>)}</nav>
    {demo ? <Link className={styles.allDemos} href="/demos">Все демо <Arrow /></Link> : null}
  </header>;
}

export function PlatformFooter({ basePath = BEMBI_DEMO_BASE_PATH, demo = true, content }: { basePath?: string; demo?: boolean; content?: PremiumKidsContent }) {
  return <footer className={styles.footer}>
    <div><Link className={styles.logo} href={basePath}><i aria-hidden="true">{(content?.brand_name ?? "B").slice(0, 1)}</i><span>{content?.brand_name ?? "BEMBI"}<small>{content?.brand_tagline ?? "Discovery Platform"}</small></span></Link><p>{content?.footer_description ?? "Образовательная экосистема, где дети учатся через практику, игру, эксперименты и творчество."}</p>{content && (content.contact_email || content.contact_phone || content.contact_address) ? <address>{[content.contact_address, content.contact_phone, content.contact_email].filter(Boolean).join(" · ")}</address> : null}</div>
    <nav aria-label="Разделы в подвале">{routes.map(([label, path]) => <Link key={path} href={bembiHref(basePath, path)}>{label}</Link>)}</nav>
    {demo ? <div><p>Демонстрационный интерфейс OneStudio OS.<br />Не связан с данными и бронированиями действующего центра.</p><Link href="/demos">← Вернуться ко всем демо</Link></div> : null}
  </footer>;
}

export function PlatformLayout({ children, basePath = BEMBI_DEMO_BASE_PATH, demo = true, content }: { children: ReactNode; basePath?: string; demo?: boolean; content?: PremiumKidsContent }) {
  return <div className={styles.platform}><PlatformMotionRuntime /><PlatformHeader basePath={basePath} demo={demo} content={content} />{children}<PlatformFooter basePath={basePath} demo={demo} content={content} /></div>;
}

export function SectionLead({ index, eyebrow, title, text }: { index: string; eyebrow: string; title: string; text?: string }) {
  return <div className={styles.sectionLead}><p><span>{index}</span>{eyebrow}</p><h2>{title}</h2>{text ? <div>{text}</div> : null}</div>;
}
