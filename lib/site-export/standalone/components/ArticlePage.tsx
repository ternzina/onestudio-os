import JsonLd from "./JsonLd";
import PageFooter from "./PageFooter";
import type { ExportedPage } from "../lib/pages";
import { absoluteUrl, readSite } from "../lib/site";

export default function ArticlePage({ page }: { page: ExportedPage }) {
  const site = readSite();
  const cashpath = site.templateId === "cashpath";
  const crumbs = page.categorySlug ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/p/guides") },
      { "@type": "ListItem", position: 3, name: page.categoryName, item: absoluteUrl(`/p/guides/${page.categorySlug}`) },
      { "@type": "ListItem", position: 4, name: page.navLabel },
    ],
  } : null;
  const posting = page.categorySlug ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: page.title,
    description: page.seoDescription,
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(page.path) },
    isPartOf: { "@type": "WebSite", "@id": `${site.canonicalOrigin}/#website` },
    publisher: { "@type": "Organization", name: site.brandName, url: site.canonicalOrigin },
  } : null;
  return <main className={cashpath ? "article" : "generic"}>
    <JsonLd data={posting} />
    <JsonLd data={crumbs} />
    <header className="article-bar"><a className="brand" href="/">{cashpath ? <>Cash<span>Path</span></> : site.brandName}</a><nav><a href="/">Home</a>{cashpath ? <><a href="/p/faq">FAQ</a><a href="/p/about">About</a><a className="button" href="/#request">Start Your Request</a></> : null}</nav></header>
    <section className="article-hero">
      {page.categorySlug ? <nav className="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/p/guides">Guides</a> / <a href={`/p/guides/${page.categorySlug}`}>{page.categoryName}</a> / <span>{page.navLabel}</span></nav> : null}
      {page.eyebrow ? <p className="eyebrow">{page.eyebrow}</p> : null}
      <h1>{page.title}</h1>
      <div className="intro" dangerouslySetInnerHTML={{ __html: page.introHtml }} />
    </section>
    <section className="article-grid">
      {page.toc.length ? <nav className="toc"><b>On this page</b>{page.toc.map((item) => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}</nav> : <div />}
      <article>
        {page.worksheetCallout ? <section className="callout"><h2>Compare your offers side by side</h2><p>Use our free worksheet to record the written terms of up to three offers. No account or loan request is required, and your entries are not submitted to CashPath.</p><a href="/p/loan-comparison-worksheet">Open the free printable loan comparison worksheet →</a></section> : null}
        {page.blocks.map((block) => <section id={block.id} key={block.id}>{block.title ? <h2>{block.title}</h2> : null}<div dangerouslySetInnerHTML={{ __html: block.bodyHtml }} /></section>)}
        {page.related.length ? <section className="related"><h2>Related guides</h2><div className="cards">{page.related.map((item) => <a key={item.slug} href={item.path}>{item.title}</a>)}</div></section> : null}
      </article>
    </section>
    <PageFooter />
  </main>;
}
