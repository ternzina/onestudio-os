import type { Metadata } from "next";
import { defaultLocale } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n";
import ComponentsPageClient from "./ComponentsPageClient";

export const metadata: Metadata = {
  ...getTranslations(defaultLocale).common.metadata.components,
};

export default function ComponentsPage() {
  return <ComponentsPageClient />;
}
