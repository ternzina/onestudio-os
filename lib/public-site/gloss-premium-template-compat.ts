import {
  createPremiumTemplateNativeToken,
  movePremiumTemplateCompositionItem,
  normalizePremiumTemplateComposition,
} from "./premium-template-composition.ts";
import {
  GLOSS_PREMIUM_TEMPLATE_CONTRACT,
  type GlossNativeSectionId,
} from "./gloss-premium-template-contract.ts";

export const LEGACY_GLOSS_NATIVE_LAYOUT_ORDER = GLOSS_PREMIUM_TEMPLATE_CONTRACT.nativeSections
  .map(({ id }) => `section:${id}`) as `section:${GlossNativeSectionId}`[];

export function parseLegacyGlossToken(token: string): { sectionId: GlossNativeSectionId } | null {
  const sectionId = token.startsWith("section:") ? token.slice("section:".length) : token;
  const section = GLOSS_PREMIUM_TEMPLATE_CONTRACT.nativeSections.find(({ id }) => id === sectionId);
  return section ? { sectionId: section.id } : null;
}

export function legacyGlossTokenToCanonical(token: string) {
  const parsed = parseLegacyGlossToken(token);
  return parsed
    ? createPremiumTemplateNativeToken(GLOSS_PREMIUM_TEMPLATE_CONTRACT.templateKey, parsed.sectionId)
    : token.startsWith("custom:") ? token : null;
}

export function canonicalGlossTokenToLegacy(token: string) {
  const prefix = `native:${GLOSS_PREMIUM_TEMPLATE_CONTRACT.templateKey}:`;
  if (!token.startsWith(prefix)) return token.startsWith("custom:") ? token : null;
  const parsed = parseLegacyGlossToken(token.slice(prefix.length));
  return parsed ? `section:${parsed.sectionId}` : null;
}

export function normalizeLegacyGlossComposition(tokens: readonly string[], customBlockIds: readonly string[]) {
  const canonical = tokens.flatMap((token) => {
    const converted = legacyGlossTokenToCanonical(token);
    return converted ? [converted] : [];
  });
  return normalizePremiumTemplateComposition({
    contract: GLOSS_PREMIUM_TEMPLATE_CONTRACT,
    tokens: canonical,
    customBlockIds,
  }).flatMap((token) => {
    const converted = canonicalGlossTokenToLegacy(token);
    return converted ? [converted] : [];
  });
}

export function moveLegacyGlossCompositionItem(input: {
  tokens: readonly string[];
  customBlockIds: readonly string[];
  fromIndex: number;
  toIndex: number;
}) {
  const normalized = normalizeLegacyGlossComposition(input.tokens, input.customBlockIds);
  const canonical = normalized.flatMap((token) => {
    const converted = legacyGlossTokenToCanonical(token);
    return converted ? [converted] : [];
  });
  return movePremiumTemplateCompositionItem({
    contract: GLOSS_PREMIUM_TEMPLATE_CONTRACT,
    tokens: canonical,
    customBlockIds: input.customBlockIds,
    fromIndex: input.fromIndex,
    toIndex: input.toIndex,
  }).flatMap((token) => {
    const converted = canonicalGlossTokenToLegacy(token);
    return converted ? [converted] : [];
  });
}
