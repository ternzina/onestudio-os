import type { Metadata } from "next";
import NotFoundContent from "@/components/layout/NotFoundContent";
import { LanguageProvider } from "@/lib/language-provider";

export const metadata: Metadata = {
  title: "Nie znaleziono strony",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <LanguageProvider>
      <NotFoundContent />
    </LanguageProvider>
  );
}
