import { readCategories, readGuides } from "../lib/pages";

const START = ["how-to-compare-personal-loan-offers", "what-is-apr-on-a-personal-loan", "apr-vs-interest-rate", "what-fees-can-personal-loans-include"];

export default function GuidesHub() {
  const guides = readGuides();
  const categories = readCategories();
  const start = START.map((slug) => guides.find((guide) => guide.slug === slug)).filter((guide) => guide !== undefined);
  return <main className="article">
    <header className="article-bar"><a className="brand" href="/">Cash<span>Path</span></a><a href="/">Home</a></header>
    <section className="article-hero"><p className="eyebrow">CashPath Guides</p><h1>Personal Loan Guides &amp; Financial Education</h1><p>CashPath provides educational information and is not a lender. Explore guides to compare borrowing options, understand terms, and prepare questions before making a decision.</p></section>
    <section className="article-grid"><div /><article>
      <h2>Start here</h2>
      <div className="cards">{start.map((guide) => <a key={guide.slug} href={guide.path}>{guide.navLabel || guide.title}</a>)}</div>
      <p><a href="/p/loan-comparison-worksheet">Open the free worksheet →</a></p>
      {categories.map((category) => {
        const items = guides.filter((guide) => guide.categorySlug === category.slug);
        if (!items.length) return null;
        return <section key={category.slug}><h2>{category.name}</h2><div className="cards">{items.map((guide) => <article key={guide.slug}><h3>{guide.title}</h3><p>{guide.description}</p><a href={guide.path}>Read guide →</a></article>)}</div></section>;
      })}
    </article></section>
  </main>;
}
