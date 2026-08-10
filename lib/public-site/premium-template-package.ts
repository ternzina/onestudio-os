import type { PremiumTemplateContract } from "./premium-template-contract.ts";
import type { PremiumTemplateCustomPageRuntimeAdapter } from "./premium-template-custom-page-runtime-adapter.ts";
import type { PremiumTemplateEditorAdapter } from "./premium-template-editor-adapter.ts";
import type { PremiumTemplateRuntimeAdapter } from "./premium-template-runtime-adapter.ts";
import type { PublicSiteContent } from "./types.ts";

export const PREMIUM_TEMPLATE_PACKAGE_VERSION = "1.0" as const;

export type PremiumTemplatePackageManifest<TemplateKey extends string = string> = {
  packageVersion: typeof PREMIUM_TEMPLATE_PACKAGE_VERSION;
  templateKey: TemplateKey;
  name: string;
  description: string;
  category: string;
  aliases: readonly string[];
  legacyAdapter: "gloss" | "noir";
  library: { tier: "standard" | "premium"; visible: boolean; order: number };
  preview: { route: string; image: string; accent: string; dark: string; surface: string };
  persistence: { schemaVersion: string; compatibleSince: string; contentNamespace: boolean };
  capabilities: {
    customerCreatable: boolean;
    editorSelectable: boolean;
    previewRenderable: boolean;
    publicHome: boolean;
    customPages: boolean;
    seoMetadata: boolean;
    nativeSections: boolean;
    customBlocks: boolean;
  };
  nativeSectionIds: readonly string[];
  assets: readonly string[];
};

export type PremiumTemplatePackageBindings<TemplateKey extends string = string> = {
  contract: PremiumTemplateContract<TemplateKey>;
  createDefaultContent(): PublicSiteContent;
  editor: PremiumTemplateEditorAdapter;
  publicHome: PremiumTemplateRuntimeAdapter;
  customPage: PremiumTemplateCustomPageRuntimeAdapter;
};

export type PremiumTemplatePackage<TemplateKey extends string = string> = {
  manifest: PremiumTemplatePackageManifest<TemplateKey>;
  bindings: PremiumTemplatePackageBindings<TemplateKey>;
};

export function definePremiumTemplatePackage<const TemplateKey extends string>(
  entry: PremiumTemplatePackage<TemplateKey>,
): PremiumTemplatePackage<TemplateKey> {
  return entry;
}

export function validatePremiumTemplatePackages(
  packages: readonly PremiumTemplatePackage[],
): readonly string[] {
  const errors: string[] = [];
  const keys = new Set<string>();
  for (const [index, entry] of packages.entries()) {
    const key = entry.manifest.templateKey;
    if (keys.has(key)) errors.push(`duplicate package templateKey "${key}" at package[${index}]`);
    keys.add(key);
    if (entry.bindings.contract.templateKey !== key) errors.push(`package[${index}] contract key does not match manifest`);
    if (entry.bindings.editor.templateKey !== key) errors.push(`package[${index}] editor key does not match manifest`);
    if (entry.bindings.publicHome.templateKey !== key) errors.push(`package[${index}] public home key does not match manifest`);
    if (entry.bindings.customPage.templateKey !== key) errors.push(`package[${index}] custom-page key does not match manifest`);
    if (entry.manifest.capabilities.customPages !== (entry.bindings.contract.customPages?.supported === true)) {
      errors.push(`package[${index}] custom-page capability does not match contract`);
    }
    const contractSections = entry.bindings.contract.nativeSections.map(({ id }) => id);
    if (JSON.stringify(contractSections) !== JSON.stringify(entry.manifest.nativeSectionIds)) {
      errors.push(`package[${index}] native sections do not match contract`);
    }
  }
  return errors;
}
