import { adaptedLayoutCatalog } from "./adapted-layout-catalog";
import {
  defineBlockStyleContract,
  type BlockStyleContract,
} from "./block-style-contract";

export type AdaptedBlockStyleStatus = "STYLE_SAFE";

export type AdaptedBlockStyleMetadata = {
  status: AdaptedBlockStyleStatus;
  contract: BlockStyleContract;
};

const borderCandidates = new Set([
  "pro-block:app-shell-9",
  "pro-block:pricing-13",
  "pro-block:pricing-14",
]);
const shadowCandidates = new Set(["pro-block:list-1"]);
const opacityCandidates = new Set(["pro-block:list-1"]);

/**
 * Phase 5 outer-surface audit. Auth 3 is the sole audited adapted item without
 * a safe single background surface, so it intentionally has no style entry.
 */
export const adaptedBlockStyleCatalog = Object.fromEntries(
  Object.keys(adaptedLayoutCatalog)
    .filter((catalogKey) => catalogKey !== "pro-block:auth-3")
    .map((catalogKey) => [
      catalogKey,
      {
        status: "STYLE_SAFE" as const,
        contract: defineBlockStyleContract({
          background: true,
          border: borderCandidates.has(catalogKey),
          shadow: shadowCandidates.has(catalogKey),
          opacity: opacityCandidates.has(catalogKey),
        }),
      },
    ]),
) as Record<string, AdaptedBlockStyleMetadata>;

export function resolveAdaptedBlockStyleContract(catalogKey: string) {
  return adaptedBlockStyleCatalog[catalogKey]?.contract;
}
