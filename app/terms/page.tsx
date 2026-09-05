import type { Metadata } from "next";
import LegalPageClient from "@/components/marketing/LegalPageClient";
import { getTranslations } from "@/lib/i18n";

export const metadata: Metadata = {
  ...getTranslations("en").common.metadata.terms,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <LegalPageClient document="terms" />;
}
