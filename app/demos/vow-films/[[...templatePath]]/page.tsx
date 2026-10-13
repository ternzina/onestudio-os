import type { Metadata } from "next";
import { createDemoMetadata } from "@/lib/seo/demo-metadata";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicSiteTemplateRuntime from "@/components/public/PublicSiteTemplateRuntime";
import PublicCustomPageRuntime from "@/components/public/PublicCustomPageRuntime";
import { createDemoPageMetadata, resolveDemoPage } from "@/lib/seo/demo-pages";
import { newSitePathForTemplate } from "@/lib/public-site/template-catalog";
import {
  createCanonicalVowDemoSite,
  vowDemoBasePath,
  type VowDemoLocale,
} from "@/lib/public-site/vow-demo";

type Params = { templatePath?: string[] };

function resolvePath(path: string[]) {
  const locale: VowDemoLocale = path[0] === "en" ? "en" : "ru";
  const rest = locale === "en" ? path.slice(1) : path;
  const site = createCanonicalVowDemoSite(locale);
  const page = rest.length ? resolveDemoPage(site, rest) : undefined;
  if (rest.length && !page) notFound();
  return { locale, site, page, basePath: vowDemoBasePath(locale) };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { templatePath = [] } = await params;
  const { locale, site, page, basePath } = resolvePath(templatePath);
  if (page) return createDemoPageMetadata(site, page, basePath, { ru: vowDemoBasePath("ru"), en: vowDemoBasePath("en") });
  return createDemoMetadata("vow-films", locale);
}

export default async function VowDemoPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { templatePath = [] } = await params;
  const { locale, site, page, basePath } = resolvePath(templatePath);
  return (
    <>
      <div className="fixed right-3 bottom-5 left-3 z-[90] flex justify-end sm:left-auto sm:right-5">
        <Link
          className="max-w-full rounded-full bg-[#07111F] px-5 py-3 text-center text-sm font-semibold break-words text-[#F7F2E9] shadow-2xl"
          href={newSitePathForTemplate("vow-films")}
        >
          {locale === "en" ? "Use this template" : "Использовать шаблон"}
        </Link>
      </div>
      {page
        ? <PublicCustomPageRuntime site={site} page={page} basePath={basePath} />
        : <PublicSiteTemplateRuntime site={site} basePath={basePath} />}
    </>
  );
}
