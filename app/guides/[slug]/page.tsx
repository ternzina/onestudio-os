import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/app/_seo/site";
import {
  GUIDE_ARTICLES,
  GUIDE_CONTENT_LOCALE,
  getGuideArticle,
  type GuideArticle,
  type GuideSubsection,
} from "@/lib/seo/guide-articles";
import { getGuidesUiCopy } from "@/lib/i18n/guides";
import styles from "./page.module.css";

type GuideArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDE_ARTICLES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: GuideArticlePageProps): Promise<Metadata> {
  const article = getGuideArticle((await params).slug);
  if (!article) return { robots: { index: false, follow: false } };

  return {
    title: article.title,
    description: article.description,
    keywords: [article.searchIntent, ...(article.topics ?? [])],
    alternates: { canonical: new URL(article.path, SITE_URL).toString() },
    openGraph: {
      type: "article",
      url: article.path,
      title: article.title,
      description: article.description,
      publishedTime: article.publishedAt,
      siteName: "OneStudio OS",
    },
    robots: { index: true, follow: true },
  };
}

function renderInlineText(text: string) {
  return text.split(/(\[\[[^\]]+\]\])/g).map((part, index) => {
    const match = part.match(/^\[\[([^|]+)\|([^\]]+)\]\]$/);
    return match
      ? <Link href={match[2]} key={`${index}-${match[2]}`}>{match[1]}</Link>
      : part;
  });
}

function renderList(items: readonly string[], ordered = false) {
  const children = items.map((item, index) => (
    <li key={`${index}-${item}`}>{renderInlineText(item)}</li>
  ));
  return ordered ? <ol>{children}</ol> : <ul>{children}</ul>;
}

function GuideSubsectionContent({ subsection }: { subsection: GuideSubsection }) {
  return (
    <div className={styles.subsection}>
      <h3>{subsection.title}</h3>
      {subsection.paragraphs?.map((paragraph, index) => (
        <p key={`${index}-${paragraph}`}>{renderInlineText(paragraph)}</p>
      ))}
      {subsection.list ? renderList(subsection.list) : null}
      {subsection.numberedList ? renderList(subsection.numberedList, true) : null}
    </div>
  );
}

export default async function GuideArticlePage({ params }: GuideArticlePageProps) {
  const article = getGuideArticle((await params).slug) as GuideArticle | undefined;
  if (!article) notFound();

  const copy = getGuidesUiCopy(GUIDE_CONTENT_LOCALE);
  const articleUrl = new URL(article.path, SITE_URL).toString();
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    publisher: { "@type": "Organization", name: "OneStudio OS" },
  };

  return (
    <main className={styles.page}>
      <article className={styles.article} lang={GUIDE_CONTENT_LOCALE}>
        <Link href="/guides" className={styles.back}>← {copy.backToGuides}</Link>
        <p className={styles.eyebrow}>
          <span>{article.primaryCategory}</span>
          <time dateTime={article.publishedAt}>{article.publishedAt}</time>
        </p>
        <h1>{article.h1}</h1>
        <p className={styles.lead}>{article.description}</p>

        {article.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph}`}>{renderInlineText(paragraph)}</p>
            ))}
            {section.checklist ? renderList(section.checklist) : null}
            {section.list ? renderList(section.list) : null}
            {section.numberedList ? renderList(section.numberedList, true) : null}
            {section.subsections?.map((subsection) => (
              <GuideSubsectionContent subsection={subsection} key={subsection.title} />
            ))}
            {section.table ? (
              <div className={styles.tableWrap}>
                <table>
                  {section.table.caption ? <caption>{section.table.caption}</caption> : null}
                  <thead>
                    <tr>{section.table.headers.map((header) => <th scope="col" key={header}>{renderInlineText(header)}</th>)}</tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row, rowIndex) => (
                      <tr key={`${rowIndex}-${row.join("-")}`}>
                        {row.map((cell, cellIndex) => <td key={`${cellIndex}-${cell}`}>{renderInlineText(cell)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            {section.links?.length ? (
              <nav className={styles.sectionLinks} aria-label={`${section.title} links`}>
                {section.links.map((link) => <Link href={link.href} key={link.href}>{link.label} ↗</Link>)}
              </nav>
            ) : null}
            {section.template ? (
              <div className={styles.templateBlock}>
                {section.template.label ? <strong>{section.template.label}</strong> : null}
                <pre><code>{section.template.content}</code></pre>
              </div>
            ) : null}
          </section>
        ))}

        {article.faq?.length ? (
          <section>
            <h2>{copy.faqTitle}</h2>
            {article.faq.map((item) => (
              <div className={styles.subsection} key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </div>
            ))}
          </section>
        ) : null}

        <nav className={styles.related} aria-label={copy.relatedLabel}>
          {article.relatedLinks.map((link) => <Link href={link.href} key={link.href}>{link.label} ↗</Link>)}
        </nav>
      </article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
    </main>
  );
}
