import Image from "next/image";
import Link from "next/link";
import { articles, teachers, workbooks } from "./content";
import { DiscoveryProgress, ExperimentExplorer, InterestNavigator, OfflineExplorer, TaskExplorer } from "./InteractiveBlocks";
import { Arrow, PlatformLayout, SectionLead } from "./PlatformShell";
import EditorialMotion from "./EditorialMotion";
import styles from "./Platform.module.css";

export default function HomeExperience() {
  return <PlatformLayout><main>
    <section className={styles.hero} id="top">
      <div className={styles.heroCopy}><p className={styles.kicker}><span>01</span> Learning ecosystem · Warszawa / online</p><h1>Место для<br /><em>больших</em> открытий</h1><p className={styles.heroText}>Программы, в которых детям интересно расти, исследовать и открывать новое.</p><div className={styles.heroActions}><a href="#offline" className={styles.primaryButton}>Найти занятие <Arrow /></a><Link href="/demos/premium-kids-center/tasks" className={styles.secondaryButton}>Открыть библиотеку заданий</Link></div><ul className={styles.heroCategories}><li>Практика</li><li>Эксперименты</li><li>Журнал</li><li>Офлайн-программы</li></ul></div>
      <EditorialMotion className={styles.heroVisual} distance={28}><Image src="/images/demos/premium-kids-center/hero-platform.webp" alt="Дети вместе с педагогом создают геометрический город в образовательной лаборатории" fill priority sizes="(max-width: 760px) 100vw, 58vw" /><div className={styles.heroNote}>учимся<br />через действие <span>↘</span></div><div className={styles.heroFormula} aria-hidden="true">idea → test → discover</div><svg className={styles.heroRoute} viewBox="0 0 500 260" aria-hidden="true"><path d="M22 220C100 120 172 260 252 134S420 48 480 26" /><circle cx="22" cy="220" r="7"/><circle cx="252" cy="134" r="7"/><circle cx="480" cy="26" r="7"/></svg></EditorialMotion>
      <div className={styles.trustLine}><span>Для детей 2–10 лет</span><span>Материалы для дома</span><span>Маленькие группы</span><span>Осмысленный экран</span></div>
    </section>

    <section className={styles.manifesto}><p>Не ещё один кружок.<br />Не ещё одна папка с распечатками.</p><h2>BEMBI соединяет живые занятия, домашнюю практику и понятные материалы для родителей в одну <em>систему открытий.</em></h2><DiscoveryProgress /></section>

    <section className={`${styles.section} ${styles.interests}`} id="interests"><SectionLead index="02" eyebrow="Навигатор по интересам" title="Что интересно вашему ребёнку сегодня?" text="Выберите направление — платформа соберёт подходящие задания, истории и занятия." /><InterestNavigator /></section>

    <section className={`${styles.section} ${styles.tasksSection}`} id="tasks"><SectionLead index="03" eyebrow="Библиотека практики" title="Практические задания" text="Материалы, которые можно открыть, выполнить вместе или распечатать." /><TaskExplorer compact /><div className={styles.sectionLink}><Link href="/demos/premium-kids-center/tasks">Вся библиотека заданий <Arrow /></Link></div></section>

    <section className={`${styles.section} ${styles.workbookSection}`} id="workbooks"><SectionLead index="04" eyebrow="Рабочие тетради и программы" title="Учимся последовательно" text="Не случайный набор листов, а спокойный маршрут: одна идея становится уверенностью через короткую регулярную практику." /><div className={styles.workbookLayout}><div className={styles.bookStack}><Image src="/images/demos/premium-kids-center/workbook-cover.webp" alt="Рабочая тетрадь BEMBI в кобальтовой обложке и несколько страниц заданий" fill sizes="(max-width: 760px) 90vw, 38vw" /><i /><i /></div><ol>{workbooks.map((book, index) => <li key={book.title}><span>0{index + 1}</span><div><p>{book.age} · {book.tasks} заданий · {book.duration}</p><h3>{book.title}</h3><small>{book.pace}</small><ul>{book.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul></div></li>)}</ol></div><div className={styles.sectionLink}><Link href="/demos/premium-kids-center/workbooks">Открыть все программы <Arrow /></Link></div></section>

    <section className={`${styles.section} ${styles.experiments}`} id="experiments"><SectionLead index="05" eyebrow="Домашняя лаборатория" title="Эксперименты и творчество" text="Проекты с понятными материалами, временем и ролью взрослого — от первого вопроса до собственного вывода." /><ExperimentExplorer limit={4} /><div className={styles.sectionLink}><Link href="/demos/premium-kids-center/experiments">Все эксперименты <Arrow /></Link></div></section>

    <section className={`${styles.section} ${styles.journal}`} id="journal"><SectionLead index="06" eyebrow="Editorial / для взрослых" title="Журнал для родителей" text="Понятно о развитии, обучении и поддержке ребёнка." /><div className={styles.articleGrid}>{articles.map((article, index) => <article key={article.slug} className={index === 0 ? styles.featureArticle : ""}><Link href={article.slug === "add-subtract-within-100" ? `/demos/premium-kids-center/articles/${article.slug}` : "/demos/premium-kids-center/articles"}><div><Image src={article.image} alt={`Обложка статьи «${article.title}»`} fill sizes={index === 0 ? "(max-width: 760px) 100vw, 58vw" : "(max-width: 760px) 100vw, 28vw"} /></div><p>{article.category} · {article.read}</p><h3>{article.title}</h3><span>{article.subtitle}</span><b>Читать <Arrow /></b></Link></article>)}</div><div className={styles.sectionLink}><Link href="/demos/premium-kids-center/articles">Открыть журнал <Arrow /></Link></div></section>

    <EditorialMotion className={styles.platformScene} distance={24}><Image src="/images/demos/premium-kids-center/studio-interior.webp" alt="Современная образовательная студия с лабораторией, библиотекой и мастерской" fill sizes="100vw" /><div><p>Пространство / online + offline</p><h2>Материал дома.<br />Открытие — вместе.</h2><span>Один визуальный язык соединяет тетрадь на кухонном столе, научную лабораторию и разговор с педагогом.</span></div></EditorialMotion>

    <section className={`${styles.section} ${styles.offline}`} id="offline"><SectionLead index="07" eyebrow="Программы центра" title="Живые занятия — часть большой экосистемы" text="Выберите возраст и день. После занятия ребёнок может продолжить тему дома с материалами платформы." /><OfflineExplorer /></section>

    <section className={`${styles.section} ${styles.team}`}><SectionLead index="08" eyebrow="Люди и метод" title="Педагоги, которые умеют не давать готовый ответ" /><div className={styles.teacherEditorial}>{teachers.map((teacher, index) => <article key={teacher.name}><div><Image src={teacher.image} alt={`Педагог ${teacher.name}`} fill sizes="(max-width: 700px) 100vw, 34vw" /></div><p>0{index + 1} / {teacher.role}</p><h3>{teacher.name}</h3><blockquote>«{teacher.quote}»</blockquote><dl><dt>Любимый формат</dt><dd>{teacher.favorite}</dd><dt>Подход</dt><dd>{teacher.approach}</dd><dt>Опыт</dt><dd>{teacher.experience}</dd></dl></article>)}</div></section>

    <section className={styles.parentSupport}><div><p>Родителям тоже нужна опора</p><h2>Спокойный взрослый — часть образовательной среды.</h2></div><ol>{["Как выбрать занятие", "Как поддержать интерес", "Как заниматься дома без давления", "Как понять, что программа подходит", "Как сохранить баланс занятий и отдыха"].map((item, index) => <li key={item}><span>0{index + 1}</span><h3>{item}</h3><Arrow /></li>)}</ol></section>

    <section className={styles.finalCta}><p>BEMBI / Discovery Platform</p><h2>Большие открытия начинаются с <em>маленького интереса.</em></h2><div><a href="#offline">Подобрать программу <Arrow /></a><Link href="/demos/premium-kids-center/tasks">Открыть практические задания</Link><a href="#offline">Записаться на пробное занятие</a></div><span>Демонстрационный интерфейс OneStudio OS.</span></section>
  </main></PlatformLayout>;
}
