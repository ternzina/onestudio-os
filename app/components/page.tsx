import type { Metadata } from "next";
import { platformMarketingLocale } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n";
import ComponentsPageClient from "./ComponentsPageClient";

export const metadata: Metadata = {
  ...getTranslations(platformMarketingLocale).common.metadata.components,
  alternates: { canonical: "/components" },
};

export default function ComponentsPage() {
  return <ComponentsPageClient />;
}
