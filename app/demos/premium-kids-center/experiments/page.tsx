import type { Metadata } from "next";
import Link from "next/link";
import { ExperimentExplorer } from "../InteractiveBlocks";
import { PlatformLayout } from "../PlatformShell";
import styles from "../Platform.module.css";
export const metadata: Metadata = { title: "Эксперименты и творчество | BEMBI", description: "Домашние эксперименты, творческие практики и семейные проекты BEMBI.", alternates: { canonical: "/demos/premium-kids-center/experiments" } };
export default function ExperimentsPage(){return <PlatformLayout><main><section className={styles.pageHero}><div><div className={styles.breadcrumbs}><Link href="/demos/premium-kids-center">BEMBI</Link><span>/</span><span>Эксперименты</span></div><p>Home laboratory / 02</p><h1>Вопросы, которые можно проверить руками</h1></div><div>Каждый проект показывает материалы, время, сложность и роль взрослого. Никакой тяжёлой теории до первого наблюдения.</div></section><section className={styles.pageBody}><ExperimentExplorer /></section></main></PlatformLayout>}
