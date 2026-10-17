import JsonLd from "./JsonLd";
import { readGuides, type ExportCategory } from "../lib/pages";
import { absoluteUrl } from "../lib/site";

export default function CategoryHub({ category }: { category: ExportCategory }) {
  const guides = readGuides().filter((guide) => guide.categorySlug === category.slug);
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/p/guides") },
      { "@type": "ListItem", position: 3, name: category.name },
    ],
  };
  return <main className="article">
    <JsonLd data={crumbs} />
    <header className="article-bar"><a className="brand" href="/">Cash<span>Path</span></a><a href="/">Home</a></header>
    <section className="article-hero"><nav className="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/p/guides">Guides</a> / <span>{category.name}</span></nav><p className="eyebrow">CashPath Guides</p><h1>{category.title}</h1><p>{category.intro}</p><p>{guides.length} guides</p></section>
    <section className="article-grid"><div /><article><div className="cards">{guides.map((guide) => <article key={guide.slug}><h2>{guide.title}</h2><p>{guide.description}</p><a href={guide.path}>Read guide →</a></article>)}</div><a href="/p/guides">Browse all guides →</a></article></section>
  </main>;
}
