import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicCustomPageRuntime from "@/components/public/PublicCustomPageRuntime";
import PublicSiteTemplateRuntime from "@/components/public/PublicSiteTemplateRuntime";
import { newSitePathForTemplate } from "@/lib/public-site/template-catalog";
import {
  createCanonicalVeloraDemoSite,
  veloraDemoBasePath,
} from "@/lib/public-site/velora-demo";
import {
  resolveVeloraDemoPath,
  resolveVeloraDemoMetadata,
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
  const resolved = resolveVeloraDemoPath(templatePath);
  if (!resolved) notFound();
  const site = createCanonicalVeloraDemoSite(resolved.locale);
  const basePath = veloraDemoBasePath(resolved.locale);
  const slug = resolved.slug;
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
        basePath={basePath}
      />
    );
  } else {
    view = (
      <PublicSiteTemplateRuntime site={site} basePath={basePath} />
    );
  }
  return (
    <>
      <div className="fixed right-3 bottom-5 left-3 z-[90] flex justify-end sm:left-auto sm:right-5">
        <Link
          className="max-w-full rounded-full bg-[#C6A66B] px-5 py-3 text-center text-sm font-semibold break-words text-[#101827] shadow-2xl"
          href={newSitePathForTemplate("velora-event-venue")}
        >
          {resolved.locale === "en"
            ? "Use this template"
            : "Использовать шаблон"}
        </Link>
      </div>
      {view}
    </>
  );
}
