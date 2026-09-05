"use client";

import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/use-locale";
import PlatformLegalShell, { LegalSection } from "./PlatformLegalShell";
import { contactEmail } from "@/lib/site-content";

export type LegalDocument = "privacy" | "terms";

function LegalParagraph({ text }: { text: string }) {
  const [before, after] = text.split("{{email}}", 2);
  return <p>{before}{after === undefined ? null : <a href={`mailto:${contactEmail}`}>{contactEmail}</a>}{after ?? null}</p>;
}

export default function LegalPageClient({ document }: { document: LegalDocument }) {
  const [lang, setLang] = useLocale();
  const content = getTranslations(lang).legal[document];

  return (
    <PlatformLegalShell lang={lang} onLangChange={setLang} eyebrow={content.eyebrow} title={content.title} intro={content.intro} updatedAt={content.updatedAt}>
      {content.sections.map((section) => (
        <LegalSection key={section.title} title={section.title}>
          {section.paragraphs.map((paragraph) => <LegalParagraph key={paragraph} text={paragraph} />)}
        </LegalSection>
      ))}
    </PlatformLegalShell>
  );
}
