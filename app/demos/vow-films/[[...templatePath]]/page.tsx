import type { Metadata } from "next";
import { createDemoMetadata } from "@/lib/seo/demo-metadata";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicSiteTemplateRuntime from "@/components/public/PublicSiteTemplateRuntime";
import { newSitePathForTemplate } from "@/lib/public-site/template-catalog";
import {
  createCanonicalVowDemoSite,
  vowDemoBasePath,
  type VowDemoLocale,
} from "@/lib/public-site/vow-demo";

type Params = { templatePath?: string[] };

function resolveLocale(path: string[]): VowDemoLocale | null {
  if (path.length === 0) return "ru";
  if (path.length === 1 && path[0] === "en") return "en";
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { templatePath = [] } = await params;
  const locale = resolveLocale(templatePath);
  if (!locale) notFound();
  return createDemoMetadata("vow-films", locale);
}

export default async function VowDemoPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { templatePath = [] } = await params;
  const locale = resolveLocale(templatePath);
  if (!locale) notFound();
  const site = createCanonicalVowDemoSite(locale);
  const basePath = vowDemoBasePath(locale);
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
      <PublicSiteTemplateRuntime site={site} basePath={basePath} />
    </>
  );
}
