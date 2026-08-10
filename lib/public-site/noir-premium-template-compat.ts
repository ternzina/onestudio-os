import {
  createPremiumTemplateNativeToken,
  movePremiumTemplateCompositionItem,
  normalizePremiumTemplateComposition,
  parsePremiumTemplateNativeToken,
  type PremiumTemplateCompositionToken,
  type PremiumTemplateNativeToken,
} from "./premium-template-composition.ts";
import {
  getNoirNativeSection,
  NOIR_PREMIUM_TEMPLATE_CONTRACT,
  type NoirNativeSectionId,
} from "./noir-premium-template-contract.ts";

export type LegacyNoirToken = `noir:${NoirNativeSectionId}`;
export type LegacyNoirCompositionToken = LegacyNoirToken | `custom:${string}`;

export function parseLegacyNoirToken(token: string): { sectionId: NoirNativeSectionId } | null {
  const parts = token.split(":");
  if (parts.length !== 2 || parts[0] !== "noir" || !getNoirNativeSection(parts[1])) return null;
  return { sectionId: parts[1] as NoirNativeSectionId };
}

export function legacyNoirTokenToCanonical(token: string): PremiumTemplateNativeToken | null {
  const parsed = parseLegacyNoirToken(token);
  return parsed
    ? createPremiumTemplateNativeToken(NOIR_PREMIUM_TEMPLATE_CONTRACT.templateKey, parsed.sectionId)
    : null;
}

export function canonicalNoirTokenToLegacy(token: string): LegacyNoirToken | null {
  const parsed = parsePremiumTemplateNativeToken(token);
  if (
    !parsed ||
    parsed.templateKey !== NOIR_PREMIUM_TEMPLATE_CONTRACT.templateKey ||
    !getNoirNativeSection(parsed.sectionId)
  ) return null;
  return `noir:${parsed.sectionId as NoirNativeSectionId}`;
}

function toCanonicalToken(token: string): PremiumTemplateCompositionToken | null {
  if (token.startsWith("custom:")) return token as PremiumTemplateCompositionToken;
  return legacyNoirTokenToCanonical(token);
}

function toLegacyToken(token: PremiumTemplateCompositionToken): LegacyNoirCompositionToken | null {
  if (token.startsWith("custom:")) return token as `custom:${string}`;
  return canonicalNoirTokenToLegacy(token);
}

export function isLegacyNoirNativeTokenPinned(token: string): boolean {
  const parsed = parseLegacyNoirToken(token);
  const section = parsed ? getNoirNativeSection(parsed.sectionId) : undefined;
  return section ? "pinning" in section : false;
}

export function canLegacyNoirNativeSectionReorder(sectionId: string): boolean {
  return getNoirNativeSection(sectionId)?.capabilities.reorder === true;
}

export function legacyNoirVisibilityAfterReset(
  sectionId: string,
  currentVisibility: boolean,
): boolean {
  const policy = getNoirNativeSection(sectionId)?.visibilityAfterReset;
  if (policy === "visible") return true;
  if (policy === "hidden") return false;
  return currentVisibility;
}

/** Normalize legacy persisted layout in memory, then convert it back before persistence. */
export function normalizeLegacyNoirComposition(
  tokens: readonly string[],
  customBlockIds: readonly string[],
): LegacyNoirCompositionToken[] {
  const canonicalRequested = tokens
    .map(toCanonicalToken)
    .filter((token): token is PremiumTemplateCompositionToken => token !== null);

  // This is the existing NOIR empty/legacy fallback: new custom blocks sit
  // before the logical contact composition until a native order is persisted.
  if (!canonicalRequested.some((token) => token.startsWith("native:"))) {
    canonicalRequested.length = 0;
    const sections = NOIR_PREMIUM_TEMPLATE_CONTRACT.nativeSections;
    canonicalRequested.push(
      ...sections.slice(0, -2).map((section) =>
        createPremiumTemplateNativeToken(NOIR_PREMIUM_TEMPLATE_CONTRACT.templateKey, section.id)),
      ...customBlockIds.map((id) => `custom:${id}` as const),
      ...sections.slice(-2).map((section) =>
        createPremiumTemplateNativeToken(NOIR_PREMIUM_TEMPLATE_CONTRACT.templateKey, section.id)),
    );
  }

  return normalizePremiumTemplateComposition({
    contract: NOIR_PREMIUM_TEMPLATE_CONTRACT,
    tokens: canonicalRequested,
    customBlockIds,
  }).flatMap((token) => {
    const legacy = toLegacyToken(token);
    return legacy ? [legacy] : [];
  });
}

export type MoveLegacyNoirCompositionItemInput = {
  tokens: readonly string[];
  customBlockIds: readonly string[];
  fromIndex: number;
  toIndex: number;
};

/** Move legacy persisted composition through the canonical contract boundary. */
export function moveLegacyNoirCompositionItem({
  tokens,
  customBlockIds,
  fromIndex,
  toIndex,
}: MoveLegacyNoirCompositionItemInput): LegacyNoirCompositionToken[] {
  const canonicalTokens = tokens
    .map(toCanonicalToken)
    .filter((token): token is PremiumTemplateCompositionToken => token !== null);

  return movePremiumTemplateCompositionItem({
    contract: NOIR_PREMIUM_TEMPLATE_CONTRACT,
    tokens: canonicalTokens,
    customBlockIds,
    fromIndex,
    toIndex,
  }).flatMap((token) => {
    const legacy = toLegacyToken(token);
    return legacy ? [legacy] : [];
  });
}

export function canMoveLegacyNoirCompositionItem(
  input: Omit<MoveLegacyNoirCompositionItemInput, "toIndex"> & { direction: -1 | 1 },
): boolean {
  const normalized = normalizeLegacyNoirComposition(input.tokens, input.customBlockIds);
  const moved = moveLegacyNoirCompositionItem({
    ...input,
    toIndex: input.fromIndex + input.direction,
  });
  return moved.some((token, index) => token !== normalized[index]);
}

export const LEGACY_NOIR_NATIVE_LAYOUT_ORDER = NOIR_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(
  (section) => `noir:${section.id}` as LegacyNoirToken,
);
