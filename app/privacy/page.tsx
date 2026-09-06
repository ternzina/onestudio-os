import type { Metadata } from "next";
import LegalPageClient from "@/components/marketing/LegalPageClient";
import { getTranslations } from "@/lib/i18n";

export const metadata: Metadata = {
  ...getTranslations("en").common.metadata.privacy,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalPageClient document="privacy" />;
}
