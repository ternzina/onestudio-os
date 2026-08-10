import {
  assertValidPremiumTemplateContract,
  isValidPremiumTemplateIdentifier,
  type PremiumTemplateContract,
} from "./premium-template-contract.ts";

export type PremiumTemplateNativeToken = `native:${string}:${string}`;
export type PremiumTemplateCustomToken = `custom:${string}`;
export type PremiumTemplateCompositionToken =
  | PremiumTemplateNativeToken
  | PremiumTemplateCustomToken;

const CUSTOM_BLOCK_ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function createPremiumTemplateNativeToken(
  templateKey: string,
  sectionId: string,
): PremiumTemplateNativeToken {
  if (!isValidPremiumTemplateIdentifier(templateKey) || !isValidPremiumTemplateIdentifier(sectionId)) {
    throw new Error("Native composition tokens require canonical template and section identifiers");
  }
  return `native:${templateKey}:${sectionId}`;
}

export function createPremiumTemplateCustomToken(blockId: string): PremiumTemplateCustomToken {
  if (!CUSTOM_BLOCK_ID.test(blockId)) throw new Error("Custom composition tokens require a valid block id");
  return `custom:${blockId}`;
}

export function parsePremiumTemplateNativeToken(
  token: string,
): { templateKey: string; sectionId: string } | null {
  const parts = token.split(":");
  if (parts.length !== 3 || parts[0] !== "native") return null;
  const [, templateKey, sectionId] = parts;
  if (!isValidPremiumTemplateIdentifier(templateKey) || !isValidPremiumTemplateIdentifier(sectionId)) return null;
  return { templateKey, sectionId };
}

function parseCustomToken(token: string): { blockId: string } | null {
  const parts = token.split(":");
  if (parts.length !== 2 || parts[0] !== "custom" || !CUSTOM_BLOCK_ID.test(parts[1])) return null;
  return { blockId: parts[1] };
}

export function isCanonicalPremiumTemplateCompositionToken(
  token: string,
): token is PremiumTemplateCompositionToken {
  return parsePremiumTemplateNativeToken(token) !== null || parseCustomToken(token) !== null;
}

function contractNativeTokens(contract: PremiumTemplateContract): PremiumTemplateNativeToken[] {
  return [...contract.nativeSections]
    .sort((a, b) => a.defaultOrder - b.defaultOrder)
    .map((section) => createPremiumTemplateNativeToken(contract.templateKey, section.id));
}

export type NormalizePremiumTemplateCompositionInput = {
  contract: PremiumTemplateContract;
  tokens: readonly string[];
  customBlockIds: readonly string[];
};

export function normalizePremiumTemplateComposition({
  contract,
  tokens,
  customBlockIds,
}: NormalizePremiumTemplateCompositionInput): PremiumTemplateCompositionToken[] {
  assertValidPremiumTemplateContract(contract);
  const nativeTokens = contractNativeTokens(contract);
  const validNative = new Set(nativeTokens);
  const validCustomIds = new Set(customBlockIds.filter((id) => CUSTOM_BLOCK_ID.test(id)));
  const seen = new Set<string>();
  const accepted: PremiumTemplateCompositionToken[] = [];

  for (const token of tokens) {
    const native = parsePremiumTemplateNativeToken(token);
    const custom = parseCustomToken(token);
    const acceptedToken = native && native.templateKey === contract.templateKey && validNative.has(token as PremiumTemplateNativeToken)
      ? token as PremiumTemplateNativeToken
      : custom && validCustomIds.has(custom.blockId)
        ? token as PremiumTemplateCustomToken
        : null;
    if (acceptedToken && !seen.has(acceptedToken)) {
      seen.add(acceptedToken);
      accepted.push(acceptedToken);
    }
  }

  for (const token of nativeTokens) {
    if (!seen.has(token)) {
      seen.add(token);
      accepted.push(token);
    }
  }
  for (const blockId of customBlockIds) {
    if (!CUSTOM_BLOCK_ID.test(blockId)) continue;
    const token = createPremiumTemplateCustomToken(blockId);
    if (!seen.has(token)) {
      seen.add(token);
      accepted.push(token);
    }
  }

  const pinning = new Map(contract.nativeSections.map((section) => [
    createPremiumTemplateNativeToken(contract.templateKey, section.id),
    section.pinning,
  ]));
  const starts = nativeTokens.filter((token) => pinning.get(token) === "start");
  const ends = nativeTokens.filter((token) => pinning.get(token) === "end");
  const boundaryTokens = new Set([...starts, ...ends]);
  return [...starts, ...accepted.filter((token) => !boundaryTokens.has(token as PremiumTemplateNativeToken)), ...ends];
}

export type MovePremiumTemplateCompositionInput = NormalizePremiumTemplateCompositionInput & {
  fromIndex: number;
  toIndex: number;
};

export function movePremiumTemplateCompositionItem({
  contract,
  tokens,
  customBlockIds,
  fromIndex,
  toIndex,
}: MovePremiumTemplateCompositionInput): PremiumTemplateCompositionToken[] {
  const normalized = normalizePremiumTemplateComposition({ contract, tokens, customBlockIds });
  if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex) || fromIndex < 0 || fromIndex >= normalized.length) {
    return normalized;
  }

  const startCount = contract.nativeSections.filter((section) => section.pinning === "start").length;
  const endCount = contract.nativeSections.filter((section) => section.pinning === "end").length;
  const movableEnd = normalized.length - endCount;
  if (fromIndex < startCount || fromIndex >= movableEnd) return normalized;

  const target = Math.max(startCount, Math.min(Math.trunc(toIndex), movableEnd - 1));
  const next = [...normalized];
  const [item] = next.splice(fromIndex, 1);
  next.splice(target, 0, item);
  return next;
}
