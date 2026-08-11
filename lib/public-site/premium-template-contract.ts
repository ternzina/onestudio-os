export const PREMIUM_TEMPLATE_CONTRACT_VERSION = "1.0" as const;

export type PremiumTemplatePinning = "start" | "end";
export type PremiumTemplateVisibilityAfterReset = "visible" | "hidden" | "preserve";

export type PremiumTemplateSectionCapabilities = {
  visibility: boolean;
  reorder: boolean;
  reset: boolean;
};

export type PremiumTemplateNativeSection<SectionId extends string = string> = {
  id: SectionId;
  label: string;
  /** Stable editor and preview navigation target, without a leading hash. */
  anchor: string;
  defaultOrder: number;
  pinning?: PremiumTemplatePinning;
  capabilities: PremiumTemplateSectionCapabilities;
  visibilityAfterReset: PremiumTemplateVisibilityAfterReset;
};

export type PremiumTemplateCustomPageCapability = {
  supported: boolean;
  maxPages?: number;
};

export type PremiumTemplateInternalRouteCapability = {
  supported: boolean;
  routeKinds?: readonly string[];
};

/**
 * New premium templates use canonical `native:<template>:<section>` tokens.
 * The legacy modes exist only so the shared editor can preserve older sites
 * without making future template packages add another layout special case.
 */
export type PremiumTemplateCompositionMode =
  | "canonical"
  | "legacy-section"
  | "legacy-noir";

/**
 * Durable metadata only. Rendering components and client callbacks belong in
 * runtime adapters, not in this application-layer contract.
 */
export type PremiumTemplateContract<
  TemplateKey extends string = string,
  SectionId extends string = string,
> = {
  templateKey: TemplateKey;
  contractVersion: typeof PREMIUM_TEMPLATE_CONTRACT_VERSION;
  compositionMode?: PremiumTemplateCompositionMode;
  nativeSections: readonly PremiumTemplateNativeSection<SectionId>[];
  customPages?: PremiumTemplateCustomPageCapability;
  internalRoutes?: PremiumTemplateInternalRouteCapability;
};

/** Type-level boundary for a template-owned content adapter. */
export type PremiumTemplateContentHooks<
  RootContent,
  TemplateContent,
  SectionId extends string = string,
> = {
  resolve(root: Readonly<RootContent>): TemplateContent;
  write(root: Readonly<RootContent>, value: Readonly<TemplateContent>): RootContent;
  reset(
    root: Readonly<RootContent>,
    sectionId: SectionId,
    visibilityAfterReset: PremiumTemplateVisibilityAfterReset,
  ): RootContent;
};

const CONTRACT_IDENTIFIER = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const ANCHOR = /^[A-Za-z][A-Za-z0-9._:-]*$/;

export function isValidPremiumTemplateIdentifier(value: string): boolean {
  return CONTRACT_IDENTIFIER.test(value);
}

export function validatePremiumTemplateContract(
  contract: PremiumTemplateContract,
): readonly string[] {
  const errors: string[] = [];
  if (!isValidPremiumTemplateIdentifier(contract.templateKey)) {
    errors.push("templateKey must be a non-empty canonical identifier");
  }
  if (
    contract.compositionMode !== undefined &&
    !["canonical", "legacy-section", "legacy-noir"].includes(
      contract.compositionMode,
    )
  ) {
    errors.push("compositionMode is invalid");
  }

  const ids = new Set<string>();
  const anchors = new Set<string>();
  const orders = new Set<number>();
  for (const section of contract.nativeSections) {
    if (!isValidPremiumTemplateIdentifier(section.id)) {
      errors.push(`section id \"${section.id}\" is invalid`);
    } else if (ids.has(section.id)) {
      errors.push(`duplicate section id \"${section.id}\"`);
    }
    ids.add(section.id);

    if (!ANCHOR.test(section.anchor)) {
      errors.push(`anchor \"${section.anchor}\" is invalid`);
    } else if (anchors.has(section.anchor)) {
      errors.push(`duplicate anchor \"${section.anchor}\"`);
    }
    anchors.add(section.anchor);

    if (!Number.isSafeInteger(section.defaultOrder) || section.defaultOrder < 0) {
      errors.push(`defaultOrder for \"${section.id}\" must be a non-negative integer`);
    } else if (orders.has(section.defaultOrder)) {
      errors.push(`duplicate defaultOrder ${section.defaultOrder}`);
    }
    orders.add(section.defaultOrder);

    if (section.pinning !== undefined && section.pinning !== "start" && section.pinning !== "end") {
      errors.push(`pinning for \"${section.id}\" is invalid`);
    }
  }

  const ordered = [...contract.nativeSections].sort((a, b) => a.defaultOrder - b.defaultOrder);
  let boundary: "start" | "middle" | "end" = "start";
  for (const section of ordered) {
    if (section.pinning === "start") {
      if (boundary !== "start") errors.push(`start-pinned section \"${section.id}\" is outside the start boundary`);
    } else if (section.pinning === "end") {
      boundary = "end";
    } else {
      if (boundary === "end") errors.push(`unpinned section \"${section.id}\" follows the end boundary`);
      boundary = "middle";
    }
  }

  return errors;
}

export function validatePremiumTemplateContractRegistry(
  contracts: readonly PremiumTemplateContract[],
): readonly string[] {
  const errors: string[] = [];
  const templateKeys = new Set<string>();

  contracts.forEach((contract, index) => {
    for (const error of validatePremiumTemplateContract(contract)) {
      errors.push(`contract[${index}] "${contract.templateKey}": ${error}`);
    }

    if (templateKeys.has(contract.templateKey)) {
      errors.push(`duplicate templateKey "${contract.templateKey}" at contract[${index}]`);
    }
    templateKeys.add(contract.templateKey);
  });

  return errors;
}

export function assertValidPremiumTemplateContract(
  contract: PremiumTemplateContract,
): void {
  const errors = validatePremiumTemplateContract(contract);
  if (errors.length) throw new Error(`Invalid premium template contract: ${errors.join("; ")}`);
}
