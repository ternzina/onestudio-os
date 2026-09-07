import type { Metadata } from "next";
import { platformMarketingLocale } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n";
import PricingPageClient from "./PricingPageClient";

export const metadata: Metadata = {
  ...getTranslations(platformMarketingLocale).common.metadata.pricing,
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return <PricingPageClient />;
}
