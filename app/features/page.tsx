import type { Metadata } from "next";
import { platformMarketingLocale } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n";
import FeaturesPageClient from "./FeaturesPageClient";

export const metadata: Metadata = {
  ...getTranslations(platformMarketingLocale).common.metadata.features,
  alternates: { canonical: "/features" },
};

export default function FeaturesPage() {
  return <FeaturesPageClient />;
}
