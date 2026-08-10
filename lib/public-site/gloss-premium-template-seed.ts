import { GLOSS_TEMPLATE, applySiteTemplate } from "./templates.ts";
import type { PublicSiteContent } from "./types.ts";

export function createGlossPremiumTemplateSeed(): PublicSiteContent {
  return applySiteTemplate({} as PublicSiteContent, GLOSS_TEMPLATE);
}
