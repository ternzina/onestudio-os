"use client";

import { LanguageProvider } from "../../../lib/language-provider";
import { HallPageContent } from "../hall-page-content";

export default function CykloramaPage() {
  return (
    <LanguageProvider>
      <HallPageContent hallKey="cyklorama" />
    </LanguageProvider>
  );
}
