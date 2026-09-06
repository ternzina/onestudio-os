import type { Metadata } from "next";
import { defaultLocale } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n";
import FeaturesPageClient from "./FeaturesPageClient";

export const metadata: Metadata = {
  ...getTranslations(defaultLocale).common.metadata.features,
};

export default function FeaturesPage() {
  return <FeaturesPageClient />;
}
