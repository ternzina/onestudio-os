import Link from "next/link";
import PublicRichText from "./PublicRichText";
import PublicRichHeading from "./PublicRichHeading";
import PublicCustomBlock from "./PublicCustomBlock";
import { resolvePremiumStudioContent } from "@/lib/public-site/premium-studio-content";
import { publicTypographyStyle } from "@/lib/public-site/typography";
import type { PublicSiteData, PublicSitePage } from "@/lib/public-site/types";

export default function NoirCustomPage({ site, page, basePath }: { site: PublicSiteData; page: PublicSitePage; basePath: string }) {
  const noir = resolvePremiumStudioContent(site.content);
  return <main data-noir-custom-page className="min-h-screen bg-[#f4eee7] text-[#17191f]">
    <header className="flex items-center justify-between border-b border-black/10 px-6 py-5"><Link href={basePath} className="text-lg font-black tracking-[-.06em]">{noir.brand.first} ◼ {noir.brand.second}</Link><nav className="flex gap-4 text-xs font-semibold">{site.content.pages?.filter(item => item.show_in_navigation !== false).map(item => <Link key={item.id} href={`${basePath}/p/${item.slug}`}>{item.nav_label}</Link>)}</nav></header>
    <section className="mx-auto grid min-h-[55vh] max-w-6xl content-center gap-6 px-6 py-24"><p className="text-xs font-bold uppercase tracking-[.24em] text-[#dc4f31]">{page.eyebrow}</p><h1 style={publicTypographyStyle(page.title_typography)} className="max-w-5xl text-6xl font-black leading-[.9] tracking-[-.065em] md:text-8xl"><PublicRichHeading value={page.title} /></h1><PublicRichText value={page.intro} className="max-w-3xl text-lg leading-8 text-black/60" /></section>
    <section className="mx-auto max-w-6xl px-6 pb-24">{(page.blocks ?? []).map(block => <PublicCustomBlock key={block.id} block={block} />)}</section>
  </main>;
}
