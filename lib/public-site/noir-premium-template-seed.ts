import { createPremiumStudioSeed, withPremiumStudioContent } from "./premium-studio-content.ts";
import type { PublicSiteContent } from "./types.ts";

export function createNoirPremiumTemplateSeed(): PublicSiteContent {
  return withPremiumStudioContent({ brand_name: "NOIR FRAME" } as PublicSiteContent, createPremiumStudioSeed(), { preserveEditorState: false });
}
