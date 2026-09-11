import type { Metadata } from "next";
import { getGuidesUiCopy } from "@/lib/i18n/guides";
import { platformMarketingLocale } from "@/lib/i18n/config";
import {
  getGuideArticleSummaries,
  getGuideCategories,
} from "@/lib/seo/guide-articles";
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

export default function GuidesPage() {
  const articles = getGuideArticleSummaries();
  return <GuidesPageClient articles={articles} categories={getGuideCategories()} />;
}
