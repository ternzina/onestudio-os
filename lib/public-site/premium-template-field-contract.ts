import { richTextPlainText } from "./rich-text.ts";

/** Semantic meaning of a premium-template value. Layout remains template-owned. */
export type PremiumTemplateFieldSemantic = "plainText" | "heading" | "richText" | "media" | "action";

export type PremiumTemplateFieldDefinition = {
  path: string;
  semantic: PremiumTemplateFieldSemantic;
};

/** Plain fields stay readable when legacy content accidentally contains rich text. */
export function resolvePremiumTemplatePlainText(value?: string | null): string {
  return richTextPlainText(value);
}
