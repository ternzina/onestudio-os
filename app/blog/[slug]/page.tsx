import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { JOURNAL_ARTICLES, getJournalArticle, type JournalArticle } from "@/lib/seo/journal-articles";
import { SITE_URL } from "@/app/_seo/site";
import styles from "./page.module.css";

export const dynamicParams = false;
export function generateStaticParams() { return JOURNAL_ARTICLES.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = getJournalArticle((await params).slug); if (!article) return {};
  return { title: article.title, description: article.description, alternates: { canonical: new URL(article.path, SITE_URL).toString() }, openGraph: { type: "article", url: article.path, title: article.title, description: article.description, siteName: "OneStudio OS" }, robots: { index: true, follow: true } };
}
function renderText(text: string) { return text.split(/(\[\[[^\]]+\]\])/g).map((part, i) => { const match = part.match(/^\[\[([^|]+)\|([^\]]+)\]\]$/); return match ? <Link href={match[2]} key={i}>{match[1]}</Link> : part; }); }
export default async function JournalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = getJournalArticle((await params).slug) as JournalArticle | undefined; if (!article) notFound();
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, datePublished: article.publishedAt, url: new URL(article.path, SITE_URL).toString(), publisher: { "@type": "Organization", name: "OneStudio OS" } };
  return <main className={styles.page}><article className={styles.article}><Link href="/blog" className={styles.back}>← Journal</Link><p className={styles.eyebrow}>{article.category} · {article.publishedAt}</p><h1>{article.h1}</h1><p className={styles.lead}>{article.description}</p>{article.sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{renderText(paragraph)}</p>)}{section.checklist ? <ul>{section.checklist.map((item) => <li key={item}>{item}</li>)}</ul> : null}</section>)}{article.faq ? <section><h2>Questions businesses ask</h2>{article.faq.map((item) => <div key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></div>)}</section> : null}<nav className={styles.related} aria-label="Related links">{article.relatedLinks.map((link) => <Link href={link.href} key={link.href}>{link.label} ↗</Link>)}</nav></article><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /></main>;
}
