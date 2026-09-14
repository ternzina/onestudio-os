import Link from "next/link";
import CashPathBreadcrumbs from "./CashPathBreadcrumbs";
import { eligibleCashPathGuideLinks } from "@/lib/public-site/cashpath-guides";
import type { CashPathGuideCategoryDefinition } from "@/lib/public-site/cashpath-guide-categories";
import type { PublicSiteData } from "@/lib/public-site/types";

export default function CashPathGuideCategoryHub({
  site,
  category,
  basePath,
}: {
  site: PublicSiteData;
  category: CashPathGuideCategoryDefinition;
  basePath: string;
}) {
  const pageHref = (slug: string) => `${basePath === "/" ? "" : basePath}/p/${slug}`;
  const guidesHref = pageHref("guides");
  const categoryHref = `${guidesHref}/${category.slug}`;
  const guides = eligibleCashPathGuideLinks(site.content).filter(
    (guide) => guide.category === category.name,
  );
  const absolute = (path: string) =>
    `https://cashpath.org${path === "/" ? "" : path}`;

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#182b29]">
      <header className="border-b border-[#182b29]/10 px-5 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href={basePath} className="text-2xl font-semibold">Cash<span className="text-[#167a6a]">Path</span></Link>
          <Link href={basePath} className="text-sm font-semibold">Home</Link>
        </div>
      </header>
      <section className="border-b border-[#182b29]/10 px-5 py-14 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <CashPathBreadcrumbs
            items={[
              { label: "Home", href: absolute(basePath) },
              { label: "Guides", href: absolute(guidesHref) },
              { label: category.name },
            ]}
          />
          <p className="mt-8 text-sm font-semibold uppercase tracking-[.2em] text-[#167a6a]">CashPath Guides</p>
          <h1 className="mt-4 font-serif text-5xl sm:text-6xl">{category.pageTitle}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#182b29]/75">{category.intro}</p>
          <p className="mt-5 text-sm font-semibold text-[#182b29]/65">{guides.length} {guides.length === 1 ? "guide" : "guides"}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-16">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <article key={guide.slug} className="rounded-2xl border border-[#182b29]/10 bg-white p-6">
              <h2 className="text-xl font-semibold">{guide.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#182b29]/70">{guide.seo_description}</p>
              <Link href={pageHref(guide.slug)} className="mt-5 inline-block font-semibold text-[#167a6a]">Read guide →</Link>
            </article>
          ))}
        </div>
        <Link href={guidesHref} className="mt-12 inline-block font-semibold text-[#167a6a]">Browse all guides →</Link>
      </section>
    </main>
  );
}
