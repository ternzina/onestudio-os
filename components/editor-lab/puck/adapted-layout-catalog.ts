import {
  layoutControlProfiles,
  type LayoutControlContract,
} from "./layout-control-contract";

export type AdaptedLayoutStatus = "LAYOUT_SAFE" | "PARTIAL_LAYOUT";

export type AdaptedLayoutMetadata = {
  status: AdaptedLayoutStatus;
  contract: LayoutControlContract;
};

const safe = (contract: LayoutControlContract): AdaptedLayoutMetadata => ({
  status: "LAYOUT_SAFE",
  contract,
});

const partial = (contract: LayoutControlContract): AdaptedLayoutMetadata => ({
  status: "PARTIAL_LAYOUT",
  contract,
});

/**
 * Phase 4's explicit audit ledger. Keys are stable official registry catalogue
 * identifiers, not runtime component names. Every value is an editor/host
 * metadata contract; official React Bits source remains unaware of it.
 */
export const adaptedLayoutCatalog = {
  "pro-block:waitlist-3": partial(layoutControlProfiles.spacing),
  "pro-block:pricing-3": safe(layoutControlProfiles.sectionGrid),
  "pro-block:footer-6": partial(layoutControlProfiles.widthOnly),
  "pro-block:footer-10": partial(layoutControlProfiles.widthOnly),
  "pro-block:contact-6": partial(layoutControlProfiles.sectionRounded),
  "pro-block:card-4": safe(layoutControlProfiles.appSplitFluid),
  "pro-block:cta-8": partial(layoutControlProfiles.background),
  "pro-block:auth-3": safe(layoutControlProfiles.sectionMedia),

  "pro-block:hero-8": safe(layoutControlProfiles.sectionMedia),
  "pro-block:hero-10": safe(layoutControlProfiles.sectionMedia),
  "pro-block:hero-11": safe(layoutControlProfiles.sectionMedia),
  "pro-block:hero-14": safe(layoutControlProfiles.sectionMedia),
  "pro-block:hero-15": partial(layoutControlProfiles.spacingRounded),
  "pro-block:hero-20": partial(layoutControlProfiles.sectionRounded),
  "pro-block:pricing-13": safe(layoutControlProfiles.sectionSplit),
  "pro-block:contact-11": safe(layoutControlProfiles.sectionSplitMedia),
  "pro-block:social-proof-13": partial(layoutControlProfiles.sectionBasic),
  "pro-block:social-proof-14": safe(layoutControlProfiles.sectionMedia),
  "pro-block:social-proof-16": safe(layoutControlProfiles.sectionMedia),
  "pro-block:about-10": safe(layoutControlProfiles.sectionMedia),
  "pro-block:about-12": safe(layoutControlProfiles.sectionMedia),
  "pro-block:social-proof-12": safe(layoutControlProfiles.sectionSplit),
  "pro-block:navigation-11": partial(layoutControlProfiles.widthOnly),
  "pro-block:navigation-14": partial(layoutControlProfiles.widthOnly),
  "pro-block:cta-10": safe(layoutControlProfiles.sectionMedia),
  "pro-block:cta-13": partial(layoutControlProfiles.sectionRounded),
  "pro-block:cta-14": safe(layoutControlProfiles.sectionSplit),
  "pro-block:footer-7": partial(layoutControlProfiles.widthOnly),
  "pro-block:footer-11": partial(layoutControlProfiles.sectionRounded),
  "pro-block:app-sidebar-6": partial(layoutControlProfiles.spacing),
  "pro-block:app-sidebar-7": partial(layoutControlProfiles.spacing),
  "pro-block:card-8": partial(layoutControlProfiles.appRoundedFluid),
  "pro-block:card-9": partial(layoutControlProfiles.appRoundedFluid),
  "pro-block:list-1": partial(layoutControlProfiles.spacing),

  "pro-block:hero-18": partial(layoutControlProfiles.sectionRounded),
  "pro-block:blog-1": safe(layoutControlProfiles.sectionGridMedia),
  "pro-block:blog-2": safe(layoutControlProfiles.sectionMedia),
  "pro-block:ecommerce-1": safe(layoutControlProfiles.sectionSplitMedia),
  "pro-block:ecommerce-2": safe(layoutControlProfiles.sectionSplitMedia),
  "pro-block:cta-9": partial(layoutControlProfiles.sectionRounded),
  "pro-block:cta-11": partial(layoutControlProfiles.sectionRounded),
  "pro-block:footer-12": partial(layoutControlProfiles.widthOnly),
  "pro-block:navbar-2": partial(layoutControlProfiles.widthOnly),
  "pro-block:navbar-4": partial(layoutControlProfiles.widthOnly),
  "pro-block:navbar-6": partial(layoutControlProfiles.widthOnly),
  "pro-block:pricing-7": partial(layoutControlProfiles.sectionBasic),
  "pro-block:pricing-8": partial(layoutControlProfiles.spacing),
  "pro-block:pricing-9": partial(layoutControlProfiles.spacing),
  "pro-block:pricing-10": safe(layoutControlProfiles.sectionSplit),
  "pro-block:pricing-12": partial(layoutControlProfiles.spacing),
  "pro-block:pricing-14": safe(layoutControlProfiles.sectionSplit),
  "pro-block:pricing-15": partial(layoutControlProfiles.sectionBasic),
  "pro-block:contact-7": partial(layoutControlProfiles.spacing),
  "pro-block:contact-8": safe(layoutControlProfiles.sectionSplitMedia),
  "pro-block:contact-10": safe(layoutControlProfiles.sectionSplit),
  "pro-block:contact-12": partial(layoutControlProfiles.spacing),
  "pro-block:app-shell-9": partial(layoutControlProfiles.spacing),
  "pro-block:card-10": partial(layoutControlProfiles.spacing),
  "pro-block:card-11": partial(layoutControlProfiles.spacing),
} satisfies Record<string, AdaptedLayoutMetadata>;

export function resolveAdaptedLayoutContract(catalogKey: string) {
  return (adaptedLayoutCatalog as Record<string, AdaptedLayoutMetadata>)[catalogKey]?.contract;
}
