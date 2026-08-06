import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { workbooks } from "../content";
import { PlatformLayout } from "../PlatformShell";
import styles from "../Platform.module.css";
export const metadata: Metadata = { title: "Рабочие тетради | BEMBI", description: "Последовательные учебные маршруты и рабочие тетради BEMBI.", alternates: { canonical: "/demos/premium-kids-center/workbooks" } };
export default function WorkbooksPage(){return <PlatformLayout><main><section className={styles.pageHero}><div><div className={styles.breadcrumbs}><Link href="/demos/premium-kids-center">BEMBI</Link><span>/</span><span>Тетради</span></div><p>Learning routes / 04</p><h1>Маленькие шаги складываются в навык</h1></div><div>У каждой программы есть темп, понятная последовательность и паузы для повторения — без бесконечной ленты случайных упражнений.</div></section><section className={`${styles.pageBody} ${styles.workbookSection}`}><div className={styles.workbookLayout}><div className={styles.bookStack}><Image src="/images/demos/premium-kids-center/workbook-cover.webp" alt="Обложка и страницы рабочей тетради BEMBI" fill sizes="(max-width:760px) 90vw,38vw"/><i/><i/></div><ol>{workbooks.map((book,index)=><li key={book.title}><span>0{index+1}</span><div><p>{book.age} · {book.tasks} заданий · {book.duration}</p><h3>{book.title}</h3><small>{book.pace}</small><ul>{book.skills.map(skill=><li key={skill}>{skill}</li>)}</ul></div></li>)}</ol></div></section></main></PlatformLayout>}
