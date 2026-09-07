import type { Metadata } from "next";
import { platformMarketingLocale } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n";
import WebsitePageClient from "./WebsitePageClient";

export const metadata: Metadata = {
  ...getTranslations(platformMarketingLocale).common.metadata.website,
  alternates: { canonical: "/website" },
};

export default function WebsitePage() {
  return <WebsitePageClient />;
}
