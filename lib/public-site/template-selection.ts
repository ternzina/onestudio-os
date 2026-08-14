import { getSiteTemplateDefinition, isExecutableSiteTemplate } from "./template-registry.ts";
import { createTemplateSeed } from "./template-seeds.ts";
import type { PublicSiteContent } from "./types.ts";

export function selectExecutableTemplate(currentDraft: PublicSiteContent, templateKey: string): PublicSiteContent {
  const template = getSiteTemplateDefinition(templateKey);
  if (!isExecutableSiteTemplate(templateKey) || !template?.capabilities.editorSelectable) throw new Error(`Template is not selectable: ${templateKey}`);
  const templateContent = currentDraft.template_content;
  const needsNamespace = template.contentNamespace && templateContent?.[template.key] === undefined;
  const namespace = needsNamespace ? createTemplateSeed(template.key).template_content?.[template.key] ?? {} : undefined;
  return {
    ...currentDraft,
    template_id: template.key,
    ...(needsNamespace ? { template_content: { ...(templateContent ?? {}), [template.key]: namespace } } : {}),
  };
}
