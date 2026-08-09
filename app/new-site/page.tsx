import CanonicalSiteCreationWizard from "./CanonicalSiteCreationWizard";
import { getTemplateCatalogRecord } from "@/lib/public-site/template-catalog";
import type { TemplateCreationMode, TemplateKey } from "@/lib/public-site/template-catalog";

type NewSitePageProps = {
  searchParams: Promise<{ template?: string; mode?: string }>;
};

export default async function NewSitePage({ searchParams }: NewSitePageProps) {
  const params = await searchParams;
  const requested = getTemplateCatalogRecord(params.template);
  const hasValidBlankIntent = params.mode === "blank" && requested?.key === "standard" && requested.capabilities.createFromScratch;
  const hasValidTemplateIntent = params.mode === "template" && requested?.key !== "standard" && requested?.capabilities.customerCreatable;
  const initialMode: TemplateCreationMode | null = hasValidBlankIntent ? "blank" : hasValidTemplateIntent ? "template" : null;
  const initialTemplateKey: TemplateKey | null = initialMode ? requested!.key : null;

  return (
    <CanonicalSiteCreationWizard
      initialMode={initialMode}
      initialTemplateKey={initialTemplateKey}
    />
  );
}
