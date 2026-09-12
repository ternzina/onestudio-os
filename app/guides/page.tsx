import type { Metadata } from "next";
import { getGuidesUiCopy } from "@/lib/i18n/guides";
import { platformMarketingLocale } from "@/lib/i18n/config";
import { listPublishedGuideArticleSummaries } from "@/lib/guides/repository";
import { GUIDE_CATEGORY_ORDER } from "@/lib/guides/types";
import GuidesPageClient from "./GuidesPageClient";

const copy = getGuidesUiCopy(platformMarketingLocale);

export const metadata: Metadata = {
  title: copy.name,
  description: copy.lead,
  alternates: { canonical: "/guides" },
  openGraph: {
    type: "website",
    url: "/guides",
    title: copy.name,
    description: copy.lead,
    siteName: "OneStudio OS",
  },
  robots: { index: true, follow: true },
};

export const dynamic = "force-dynamic";

export default async function GuidesPage() {
  const articles = await listPublishedGuideArticleSummaries(platformMarketingLocale);
  return <GuidesPageClient articles={articles} categories={GUIDE_CATEGORY_ORDER} />;
}
