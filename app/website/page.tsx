import type { Metadata } from "next";
import { defaultLocale } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n";
import WebsitePageClient from "./WebsitePageClient";

export const metadata: Metadata = {
  ...getTranslations(defaultLocale).common.metadata.website,
};

export default function WebsitePage() {
  return <WebsitePageClient />;
}
