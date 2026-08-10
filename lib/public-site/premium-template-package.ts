export const PREMIUM_TEMPLATE_PACKAGE_VERSION = "1.0" as const;

export type LocalizedText = Readonly<{ ru: string; en: string }>;
export type PremiumDemoGroup = "studio" | "beauty" | "wellness" | "education" | "events";

export type PremiumTemplatePackageManifest<TemplateKey extends string = string> = Readonly<{
  packageVersion: typeof PREMIUM_TEMPLATE_PACKAGE_VERSION;
  templateKey: TemplateKey;
  name: string;
  description: string;
  category: string;
  aliases: readonly string[];
  library: Readonly<{ tier: "standard" | "premium"; visible: boolean; order: number }>;
  preview: Readonly<{
    collectionVisible: boolean;
    group: PremiumDemoGroup;
    title: LocalizedText;
    description: LocalizedText;
    alt: LocalizedText;
    route: string;
    image: string;
    order: number;
    accent: string;
    dark: string;
    surface: string;
  }>;
  persistence: Readonly<{ schemaVersion: string; compatibleSince: string; contentNamespace: boolean }>;
  capabilities: Readonly<{
    customerCreatable: boolean;
    editorSelectable: boolean;
    previewRenderable: boolean;
    publicHome: boolean;
    customPages: boolean;
    seoMetadata: boolean;
    nativeSections: boolean;
    customBlocks: boolean;
  }>;
  nativeSectionIds: readonly string[];
  assets: readonly string[];
}>;

export function definePremiumTemplateManifest<const TemplateKey extends string>(
  manifest: PremiumTemplatePackageManifest<TemplateKey>,
): PremiumTemplatePackageManifest<TemplateKey> {
  return manifest;
}

export function validatePremiumTemplateManifests(
  manifests: readonly PremiumTemplatePackageManifest[],
): readonly string[] {
  const errors: string[] = [];
  const keys = new Set<string>();
  for (const [index, manifest] of manifests.entries()) {
    if (keys.has(manifest.templateKey)) errors.push(`duplicate package templateKey "${manifest.templateKey}" at package[${index}]`);
    keys.add(manifest.templateKey);
    if (!manifest.preview.route.startsWith("/demos/")) errors.push(`package[${index}] preview route must be a demo route`);
    if (!manifest.preview.image.startsWith("/")) errors.push(`package[${index}] preview image must be absolute`);
  }
  return errors;
}

export function createPremiumTemplateManifestLookup<const Manifest extends PremiumTemplatePackageManifest>(
  manifests: readonly Manifest[],
) {
  const byKey = new Map<string, Manifest>();
  for (const manifest of manifests) {
    if (byKey.has(manifest.templateKey)) throw new Error(`Duplicate premium package manifest for "${manifest.templateKey}"`);
    byKey.set(manifest.templateKey, manifest);
  }
  return (templateKey: string | null | undefined) => templateKey ? byKey.get(templateKey) : undefined;
}
