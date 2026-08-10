import { AURORA_PREMIUM_TEMPLATE_CONTRACT } from "./aurora-contract.ts";
import type { PremiumTemplateEditorAdapter } from "../../../lib/public-site/premium-template-editor-adapter.ts";

export const AURORA_PREMIUM_TEMPLATE_EDITOR_ADAPTER = {
  templateKey: "aurora-wellness",
  contract: AURORA_PREMIUM_TEMPLATE_CONTRACT,
  fixture: "aurora-editor",
} as unknown as PremiumTemplateEditorAdapter;
