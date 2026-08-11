import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicCustomPageRuntime from "@/components/public/PublicCustomPageRuntime";
import PublicSiteTemplateRuntime from "@/components/public/PublicSiteTemplateRuntime";
import { newSitePathForTemplate } from "@/lib/public-site/template-catalog";
import {
  createCanonicalVeloraDemoSite,
  VELORA_DEMO_BASE_PATH,
} from "@/lib/public-site/velora-demo";
import {
  resolveVeloraDemoMetadata,
  resolveVeloraDemoSlug,
} from "@/lib/public-site/velora-demo-metadata";

type Params = { templatePath?: string[] };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { templatePath = [] } = await params;
  return resolveVeloraDemoMetadata(templatePath) ?? notFound();
}

export default async function VeloraDemoPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { templatePath = [] } = await params;
  const site = createCanonicalVeloraDemoSite();
  const slug = resolveVeloraDemoSlug(templatePath);
  let view: React.ReactNode;
  if (slug) {
    const page = site.content.pages?.find(
      (item) =>
        item.type === "custom" &&
        item.slug === slug &&
        item.is_visible !== false,
    );
    if (!page) notFound();
    view = (
      <PublicCustomPageRuntime
        site={site}
        page={page}
        basePath={VELORA_DEMO_BASE_PATH}
      />
    );
  } else if (templatePath.length) notFound();
  else
    view = (
      <PublicSiteTemplateRuntime site={site} basePath={VELORA_DEMO_BASE_PATH} />
    );
  return (
    <>
      <div className="fixed bottom-5 right-5 z-[90]">
        <Link
          className="rounded-full bg-[#C6A66B] px-5 py-3 text-sm font-semibold text-[#101827] shadow-2xl"
          href={newSitePathForTemplate("velora-event-venue")}
        >
          Использовать шаблон
        </Link>
      </div>
      {view}
    </>
  );
}
