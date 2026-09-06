import type { Metadata } from "next";
import { defaultLocale } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n";
import PricingPageClient from "./PricingPageClient";

export const metadata: Metadata = {
  ...getTranslations(defaultLocale).common.metadata.pricing,
};

export default function PricingPage() {
  return <PricingPageClient />;
}
