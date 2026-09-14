import Link from "next/link";
import { eligibleCashPathGuideLinks } from "@/lib/public-site/cashpath-guides";
import { CASH_PATH_GUIDE_CATEGORY_REGISTRY } from "@/lib/public-site/cashpath-guide-categories";
import type { PublicSiteData } from "@/lib/public-site/types";

const START_HERE_SLUGS = [
  "how-to-compare-personal-loan-offers",
  "what-is-apr-on-a-personal-loan",
  "apr-vs-interest-rate",
  "what-fees-can-personal-loans-include",
] as const;

export default function CashPathGuidesHub({
  site,
  basePath,
}: {
  site: PublicSiteData;
  basePath: string;
}) {
  const pageHref = (slug: string) =>
    `${basePath === "/" ? "" : basePath}/p/${slug}`;
  const guides = eligibleCashPathGuideLinks(site.content);
  const startHere = START_HERE_SLUGS.map((slug) => guides.find((guide) => guide.slug === slug)).filter(
    (guide): guide is (typeof guides)[number] => Boolean(guide),
  );
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#182b29]">
      <header className="border-b border-[#182b29]/10 px-5 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href={basePath} className="text-2xl font-semibold">
            Cash<span className="text-[#167a6a]">Path</span>
          </Link>
          <Link href={basePath} className="text-sm font-semibold">
            Home
          </Link>
        </div>
      </header>
      <section className="border-b border-[#182b29]/10 px-5 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[.2em] text-[#167a6a]">
            CashPath Guides
          </p>
          <h1 className="mt-4 font-serif text-5xl sm:text-6xl">
            Personal Loan Guides &amp; Financial Education
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#182b29]/75">
            CashPath provides educational information and is not a lender.
            Explore guides to compare borrowing options, understand terms, and
            prepare questions before making a decision.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-10">
        <h2 className="font-serif text-3xl">Start here</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {startHere.map((guide) => <Link key={guide.slug} href={pageHref(guide.slug)} className="rounded-2xl border border-[#182b29]/10 bg-white p-5 font-semibold hover:border-[#167a6a]">{guide.nav_label || guide.title}</Link>)}
        </div>
      </section>
      <nav aria-label="Guide categories" className="mx-auto flex max-w-6xl flex-wrap gap-3 px-5 pb-10">
        {CASH_PATH_GUIDE_CATEGORY_REGISTRY.map((category) => <Link key={category.slug} href={`${pageHref("guides")}/${category.slug}`} className="rounded-full border border-[#182b29]/15 px-4 py-2 text-sm font-semibold">{category.name}</Link>)}
      </nav>
      <div className="mx-auto max-w-6xl space-y-16 px-5 pb-20">
        {CASH_PATH_GUIDE_CATEGORY_REGISTRY.map((category) => {
          const items = guides.filter((guide) => guide.category === category.name);
          return items.length ? (
            <section
              key={category.slug}
              id={category.slug}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3"><h2 className="font-serif text-3xl">{category.name}</h2><Link className="font-semibold text-[#167a6a]" href={`${pageHref("guides")}/${category.slug}`}>Browse category →</Link></div>
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {items.map((guide) => (
                  <article
                    key={guide.slug}
                    className="rounded-2xl border border-[#182b29]/10 bg-white p-6"
                  >
                    <h3 className="text-xl font-semibold">{guide.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#182b29]/70">
                      {guide.seo_description}
                    </p>
                    <Link
                      href={pageHref(guide.slug)}
                      className="mt-5 inline-block font-semibold text-[#167a6a]"
                    >
                      Read guide →
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ) : null;
        })}
      </div>
    </main>
  );
}
