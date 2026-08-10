import { getSiteTemplateDefinition, isExecutableSiteTemplate } from "./template-registry.ts";
import { createTemplateSeed } from "./template-seeds.ts";
import type { PublicSiteContent } from "./types.ts";

export function selectExecutableTemplate(currentDraft: PublicSiteContent, templateKey: string): PublicSiteContent {
  if (!isExecutableSiteTemplate(templateKey)) throw new Error(`Template is not executable: ${templateKey}`);
  const template = getSiteTemplateDefinition(templateKey)!;
  const templateContent = currentDraft.template_content;
  const needsNamespace = template.contentNamespace && templateContent?.[template.key] === undefined;
  const namespace = needsNamespace ? createTemplateSeed(template.key).template_content?.[template.key] ?? {} : undefined;
  return {
    ...currentDraft,
    template_id: template.key,
    ...(needsNamespace ? { template_content: { ...(templateContent ?? {}), [template.key]: namespace } } : {}),
  };
}
