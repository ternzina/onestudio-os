import type { Metadata } from "next";
import Link from "next/link";
import { PlatformLayout } from "../PlatformShell";
import { WorkbookExperience } from "../PremiumMotion";
import styles from "../Platform.module.css";
export const metadata: Metadata = { title: "Рабочие тетради | BEMBI", description: "Последовательные учебные маршруты и рабочие тетради BEMBI.", alternates: { canonical: "/demos/premium-kids-center/workbooks" } };
export default function WorkbooksPage(){return <PlatformLayout><main><section className={styles.pageHero}><div><div className={styles.breadcrumbs}><Link href="/demos/premium-kids-center">BEMBI</Link><span>/</span><span>Тетради</span></div><p>Learning routes / 04</p><h1>Маленькие шаги складываются в навык</h1></div><div>У каждой программы есть темп, понятная последовательность и паузы для повторения — без бесконечной ленты случайных упражнений.</div></section><section className={`${styles.pageBody} ${styles.workbookSection}`}><WorkbookExperience /></section></main></PlatformLayout>}
