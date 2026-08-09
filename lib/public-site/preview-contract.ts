import { isExecutableSiteTemplate } from "./template-registry.ts";
import type { PublicSiteContent, PublicSiteEditorData } from "./types.ts";

export function buildSitePreviewHref({ templateKey, businessSlug, locale, templatePath = [] }: {
  templateKey: string; businessSlug: string; locale: string; templatePath?: readonly string[];
}) {
  const path = [templateKey, businessSlug, "_locale", locale, ...templatePath].map(encodeURIComponent).join("/");
  return `/site-preview/${path}`;
}

export function getLocalePreviewContent(editor: PublicSiteEditorData, locale: string): PublicSiteContent | null {
  const record = editor.locales.find((item) => item.locale === locale);
  return record?.draft_content ?? record?.published_content ?? null;
}

export type PreviewTemplateDecision =
  | { kind: "render"; templateKey: string }
  | { kind: "redirect"; templateKey: string }
  | { kind: "reject"; reason: "missing-template" | "non-executable-template" };

export function decidePreviewTemplate(content: PublicSiteContent, assertedTemplateKey: string): PreviewTemplateDecision {
  const storedTemplateKey = content.template_id;
  if (!storedTemplateKey) return { kind: "reject", reason: "missing-template" };
  if (!isExecutableSiteTemplate(storedTemplateKey)) return { kind: "reject", reason: "non-executable-template" };
  return storedTemplateKey === assertedTemplateKey
    ? { kind: "render", templateKey: storedTemplateKey }
    : { kind: "redirect", templateKey: storedTemplateKey };
}
