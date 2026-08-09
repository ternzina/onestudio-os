import PublicRichText from "@/components/public/PublicRichText";
import PremiumUniversalBlock from "@/app/demos/premium-kids-center/PremiumUniversalBlock";
import { PlatformLayout } from "@/app/demos/premium-kids-center/PlatformShell";
import { resolvePremiumKidsContent } from "@/lib/public-site/premium-kids-content";
import { publicTypographyStyle } from "@/lib/public-site/typography";
import type { PublicSiteData, PublicSitePage } from "@/lib/public-site/types";

export default function BembiCustomPage({ site, page, basePath }: { site: PublicSiteData; page: PublicSitePage; basePath: string }) {
  const content = resolvePremiumKidsContent(site.content);
  return <PlatformLayout basePath={basePath} demo={false} content={content} pages={site.content.pages}>
    <main data-bembi-custom-page>
      <section className="mx-auto grid min-h-[54vh] w-[calc(100%_-_40px)] max-w-[1180px] content-center gap-6 py-24">
        <p className="text-xs font-bold uppercase tracking-[.24em] text-[#e56f45]">{page.eyebrow}</p>
        <h1 style={publicTypographyStyle(page.title_typography)} className="max-w-5xl text-5xl font-semibold leading-none tracking-[-.055em] md:text-7xl">{page.title}</h1>
        <PublicRichText value={page.intro} className="max-w-3xl text-lg leading-8 text-black/60" />
      </section>
      {(page.blocks ?? []).map(block => <PremiumUniversalBlock key={block.id} block={{ id: block.id, type: block.kind, visible: block.is_visible !== false, props: { universal_block: block } }} />)}
    </main>
  </PlatformLayout>;
}
