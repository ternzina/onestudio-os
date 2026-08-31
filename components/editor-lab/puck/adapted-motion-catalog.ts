import {
  defineMotionControls,
  type MotionControlContract,
} from "./motion-control-contract";

export type AdaptedMotionStatus = "MOTION_SAFE";

export type AdaptedMotionMetadata = {
  status: AdaptedMotionStatus;
  contract: MotionControlContract;
};

const decorativeLoop = defineMotionControls([
  {
    prop: "loop",
    label: "Loop",
    kind: "toggle",
    defaultValue: true,
    provenance: "adapted-source",
  },
]);

/**
 * Phase 5 motion ledger. Only adapter-safe boolean loop contracts survived the
 * source/range gate. Numeric literals without proven min/max remain deferred.
 */
export const adaptedMotionCatalog = {
  "pro-block:hero-18": { status: "MOTION_SAFE", contract: decorativeLoop },
  "pro-block:cta-11": { status: "MOTION_SAFE", contract: decorativeLoop },
  "pro-block:cta-13": { status: "MOTION_SAFE", contract: decorativeLoop },
  "pro-block:cta-14": { status: "MOTION_SAFE", contract: decorativeLoop },
  "pro-block:footer-12": { status: "MOTION_SAFE", contract: decorativeLoop },
} satisfies Record<string, AdaptedMotionMetadata>;

export function resolveAdaptedMotionContract(catalogKey: string) {
  return (adaptedMotionCatalog as Record<string, AdaptedMotionMetadata>)[catalogKey]?.contract;
}
