import Link from "next/link";
import { articles, teachers } from "./content";
import { DiscoveryProgress, ExperimentExplorer, InterestNavigator, OfflineExplorer, TaskExplorer } from "./InteractiveBlocks";
import { Arrow, PlatformLayout, SectionLead } from "./PlatformShell";
import EditorialMotion from "./EditorialMotion";
import { DiscoveryRoute, HeroDiscovery, TodayDiscovery, WorkbookExperience } from "./PremiumMotion";
import { CenterExperience, CenterFinalCta, CenterStickyNav } from "./CenterExperience";
import PremiumUniversalBlock from "./PremiumUniversalBlock";
import styles from "./Platform.module.css";
import type { PublicSiteData } from "@/lib/public-site/types";
import { BEMBI_DEMO_BASE_PATH, bembiHref } from "./PlatformShell";
import {
  premiumKidsContentForBlock,
  resolvePremiumKidsContent,
  type PremiumKidsBlock,
  type PremiumKidsContent,
} from "@/lib/public-site/premium-kids-content";
import BembiTemplateImage from "./BembiTemplateImage";
import { premiumKidsNativeMediaUrl, type PremiumKidsNativeMedia } from "@/lib/public-site/premium-kids-native-media";
import { publicTypographyStyle } from "@/lib/public-site/typography";

function DiscoveryPrelude({ basePath, nativeMedia }: { basePath: string; nativeMedia?: PremiumKidsNativeMedia }) {
  return <>
    <section className={styles.manifesto}><p>Не ещё один кружок.<br />Не ещё одна папка с распечатками.</p><h2>BEMBI соединяет живые занятия, домашнюю практику и понятные материалы для родителей в одну <em>систему открытий.</em></h2><DiscoveryProgress /></section>
    <section className={`${styles.section} ${styles.interests}`} id="interests"><SectionLead index="02" eyebrow="Навигатор по интересам" title="Что интересно вашему ребёнку сегодня?" text="Выберите направление — платформа соберёт подходящие задания, истории и занятия." /><InterestNavigator nativeMedia={nativeMedia} /></section>
    <section className={`${styles.section} ${styles.tasksSection}`} id="tasks"><SectionLead index="03" eyebrow="Библиотека практики" title="Практические задания" text="Материалы, которые можно открыть, выполнить вместе или распечатать." /><TaskExplorer compact nativeMedia={nativeMedia} /><div className={styles.sectionLink}><Link href={bembiHref(basePath, "tasks")}>Вся библиотека заданий <Arrow /></Link></div></section>
    <section className={`${styles.section} ${styles.workbookSection}`} id="workbooks"><SectionLead index="04" eyebrow="Рабочие тетради и программы" title="Учимся последовательно" text="Не случайный набор листов, а спокойный маршрут: одна идея становится уверенностью через короткую регулярную практику." /><WorkbookExperience nativeMedia={nativeMedia} /><div className={styles.sectionLink}><Link href={bembiHref(basePath, "workbooks")}>Открыть все программы <Arrow /></Link></div></section>
    <section className={`${styles.section} ${styles.experiments}`} id="experiments"><SectionLead index="05" eyebrow="Домашняя лаборатория" title="Эксперименты и творчество" text="Проекты с понятными материалами, временем и ролью взрослого — от первого вопроса до собственного вывода." /><ExperimentExplorer limit={4} nativeMedia={nativeMedia} /><div className={styles.sectionLink}><Link href={bembiHref(basePath, "experiments")}>Все эксперименты <Arrow /></Link></div></section>
    <section className={`${styles.section} ${styles.journal}`} id="journal"><SectionLead index="06" eyebrow="Editorial / для взрослых" title="Журнал для родителей" text="Понятно о развитии, обучении и поддержке ребёнка." /><div className={styles.articleGrid}>{articles.map((article, index) => <article key={article.slug} className={index === 0 ? styles.featureArticle : ""}><Link href={article.slug === "add-subtract-within-100" ? bembiHref(basePath, `articles/${article.slug}`) : bembiHref(basePath, "articles")}><div><BembiTemplateImage src={premiumKidsNativeMediaUrl(nativeMedia, `article-${article.slug}`, article.image)} alt={`Обложка статьи «${article.title}»`} sizes={index === 0 ? "(max-width: 760px) 100vw, 58vw" : "(max-width: 760px) 100vw, 28vw"} media={nativeMedia} /></div><p>{article.category} · {article.read}</p><h3>{article.title}</h3><span>{article.subtitle}</span><b>Читать <Arrow /></b></Link></article>)}</div><div className={styles.sectionLink}><Link href={bembiHref(basePath, "articles")}>Открыть журнал <Arrow /></Link></div></section>
  </>;
}

function IntroBlock({ block, content, basePath }: { block: PremiumKidsBlock; content: PremiumKidsContent; basePath: string }) {
  return <div data-premium-block-id={block.id}><DiscoveryRoute /><DiscoveryPrelude basePath={basePath} nativeMedia={block.props.native_media} /><CenterExperience content={content} blockType="intro" blockId={block.id} anchored={false} nativeMedia={block.props.native_media} /></div>;
}

function ProgramsBlock({ content, block }: { content: PremiumKidsContent; block: PremiumKidsBlock }) {
  const blockId = block.id;
  const headingStyle = publicTypographyStyle(content.heading_typography[blockId] ?? content.heading_typography.programs);
  return <div data-premium-block-id={blockId}>
    <EditorialMotion className={styles.platformScene} distance={24}><BembiTemplateImage src={premiumKidsNativeMediaUrl(block.props.native_media, "programs", "/images/demos/premium-kids-center/studio-interior.webp")} alt="Современная образовательная студия с лабораторией, библиотекой и мастерской" sizes="100vw" media={block.props.native_media} /><div><p>Пространство / online + offline</p><h2>Материал дома.<br />Открытие — вместе.</h2><span>Один визуальный язык соединяет тетрадь на кухонном столе, научную лабораторию и разговор с педагогом.</span></div></EditorialMotion>
    <section className={`${styles.section} ${styles.offline}`} id={blockId === "bembi-programs" ? "offline" : undefined}><SectionLead index="07" eyebrow="Программы центра" title={content.programs_title} text={content.programs_description} headingStyle={headingStyle} /><OfflineExplorer /></section>
  </div>;
}

function TeachersBlock({ content, block }: { content: PremiumKidsContent; block: PremiumKidsBlock }) {
  return <div data-premium-block-id={block.id}><CenterExperience content={content} blockType="teachers" blockId={block.id} anchored={false} nativeMedia={block.props.native_media} /><section className={`${styles.section} ${styles.team}`}><SectionLead index="08" eyebrow="Люди и метод" title="Педагоги, которые умеют не давать готовый ответ" /><div className={styles.teacherEditorial}>{teachers.map((teacher, index) => <article key={teacher.name}><div><BembiTemplateImage src={premiumKidsNativeMediaUrl(block.props.native_media, `teacher-${index}`, teacher.image)} alt={`Педагог ${teacher.name}`} sizes="(max-width: 700px) 100vw, 34vw" media={block.props.native_media} /></div><p>0{index + 1} / {teacher.role}</p><h3>{teacher.name}</h3><blockquote>«{teacher.quote}»</blockquote><dl><dt>Любимый формат</dt><dd>{teacher.favorite}</dd><dt>Подход</dt><dd>{teacher.approach}</dd><dt>Опыт</dt><dd>{teacher.experience}</dd></dl></article>)}</div></section></div>;
}

function FinalBlock({ content, blockId, basePath, demo }: { content: PremiumKidsContent; blockId: string; basePath: string; demo: boolean }) {
  const headingStyle = publicTypographyStyle(content.heading_typography[blockId] ?? content.heading_typography.final);
  return <div data-premium-block-id={blockId}>
    <section className={styles.parentSupport}><div><p>Родителям тоже нужна опора</p><h2>Спокойный взрослый — часть образовательной среды.</h2></div><ol>{["Как выбрать занятие", "Как поддержать интерес", "Как заниматься дома без давления", "Как понять, что программа подходит", "Как сохранить баланс занятий и отдыха"].map((item, index) => <li key={item}><span>0{index + 1}</span><h3>{item}</h3><Arrow /></li>)}</ol></section>
    <TodayDiscovery />
    <section className={styles.finalCta}><p>{content.brand_name} / {content.brand_tagline}</p><h2 style={headingStyle}>{content.final_cta_title}</h2><div><a href="#offline">{content.final_cta_label} <Arrow /></a><Link href={bembiHref(basePath, "tasks")}>{content.secondary_cta_label}</Link><a href="#offline">{content.primary_cta_label}</a></div>{demo ? <span>Демонстрационный интерфейс OneStudio OS.</span> : null}</section>
    <CenterFinalCta content={content} headingStyle={headingStyle} />
  </div>;
}

function PremiumBlockRenderer({ block, content, basePath, demo }: { block: PremiumKidsBlock; content: PremiumKidsContent; basePath: string; demo: boolean }) {
  if (!block.visible) return null;
  const blockContent = premiumKidsContentForBlock(content, block);
  switch (block.type) {
    case "hero":
      return <div data-premium-block-id={block.id}><HeroDiscovery tasksHref={bembiHref(basePath, "tasks")} content={blockContent} nativeMedia={block.props.native_media} /><CenterStickyNav /></div>;
    case "intro":
      return <IntroBlock block={block} content={blockContent} basePath={basePath} />;
    case "approach":
    case "schedule":
    case "gallery":
    case "reviews":
    case "faq":
      return <CenterExperience content={blockContent} blockType={block.type} blockId={block.id} nativeMedia={block.props.native_media} />;
    case "teachers":
      return <TeachersBlock content={blockContent} block={block} />;
    case "programs":
      return <ProgramsBlock content={blockContent} block={block} />;
    case "final":
      return <FinalBlock content={blockContent} blockId={block.id} basePath={basePath} demo={demo} />;
    case "text":
    case "media_text":
    case "columns":
    case "features":
    case "cta":
    case "slider":
    case "collage":
    case "video":
      return <PremiumUniversalBlock block={block} />;
    default:
      return null;
  }
}

export default function HomeExperience({ basePath = BEMBI_DEMO_BASE_PATH, site }: { basePath?: string; site?: PublicSiteData }) {
  const demo = !site;
  const content = resolvePremiumKidsContent(site?.content);
  const header = content.blocks.find(block => block.type === "header")?.props;
  const footer = content.blocks.find(block => block.type === "footer")?.props;
  const shellContent: PremiumKidsContent = {
    ...content,
    brand_name: typeof header?.brand_name === "string" ? header.brand_name : content.brand_name,
    brand_tagline: typeof header?.brand_tagline === "string" ? header.brand_tagline : content.brand_tagline,
    footer_description: typeof footer?.footer_description === "string" ? footer.footer_description : content.footer_description,
    contact_email: typeof footer?.contact_email === "string" ? footer.contact_email : content.contact_email,
    contact_phone: typeof footer?.contact_phone === "string" ? footer.contact_phone : content.contact_phone,
    contact_address: typeof footer?.contact_address === "string" ? footer.contact_address : content.contact_address,
  };
  return <PlatformLayout basePath={basePath} demo={demo} content={shellContent} pages={site?.content.pages} headerBlockId={content.blocks.find(block => block.type === "header")?.id} footerBlockId={content.blocks.find(block => block.type === "footer")?.id}><main>
    {content.blocks.filter(block => block.type !== "header" && block.type !== "footer").map(block => <PremiumBlockRenderer key={block.id} block={block} content={content} basePath={basePath} demo={demo} />)}
  </main></PlatformLayout>;
}
