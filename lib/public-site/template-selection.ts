import { getSiteTemplateDefinition, isExecutableSiteTemplate } from "./template-registry.ts";
import type { PublicSiteContent } from "./types.ts";

export function selectExecutableTemplate(currentDraft: PublicSiteContent, templateKey: string): PublicSiteContent {
  if (!isExecutableSiteTemplate(templateKey)) throw new Error(`Template is not executable: ${templateKey}`);
  const template = getSiteTemplateDefinition(templateKey)!;
  const templateContent = currentDraft.template_content;
  const needsNamespace = template.contentNamespace && templateContent?.[templateKey] === undefined;
  return {
    ...currentDraft,
    template_id: templateKey,
    ...(needsNamespace ? { template_content: { ...(templateContent ?? {}), [templateKey]: {} } } : {}),
  };
}
