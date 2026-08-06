import type { Metadata } from "next";
import Link from "next/link";
import { TaskExplorer } from "../InteractiveBlocks";
import { PlatformLayout } from "../PlatformShell";
import styles from "../Platform.module.css";
export const metadata: Metadata = { title: "Практические задания | BEMBI", description: "Демонстрационная библиотека printable-заданий BEMBI по математике, чтению, логике и творчеству.", alternates: { canonical: "/demos/premium-kids-center/tasks" } };
export default function TasksPage(){return <PlatformLayout><main><section className={styles.pageHero}><div><div className={styles.breadcrumbs}><Link href="/demos/premium-kids-center">BEMBI</Link><span>/</span><span>Задания</span></div><p>Practice library / 01</p><h1>Задания, к которым хочется вернуться</h1></div><div>Короткая практика для дома и занятий: понятная цель, красивый printable-лист и место для собственного способа решения.</div></section><section className={styles.pageBody}><TaskExplorer /></section></main></PlatformLayout>}
