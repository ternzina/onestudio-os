"use client";

import { LanguageProvider } from "../../../lib/language-provider";
import { HallPageContent } from "../hall-page-content";

export default function LoftPage() {
  return (
    <LanguageProvider>
      <HallPageContent hallKey="loft" />
    </LanguageProvider>
  );
}
