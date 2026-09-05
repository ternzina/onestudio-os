/**
 * Production interaction contract for a React Bits source inside Puck.
 *
 * This metadata describes source behaviour; it is deliberately independent of
 * component ids and is consumed by the shared renderer/editor boundary.
 */
export type PuckInteractionRuntime = "live" | "static";
export type PuckPassiveInteraction = "passive-edit" | "interact-only" | "none";
export type PuckReservedInteraction = "interact-only" | "none";

export type PuckInteractionPolicy = {
  /** The audited EDIT-mode bucket, kept separate from source capabilities. */
  editBucket?: PuckInteractionPolicyBucket;
  visualRuntime: PuckInteractionRuntime;
  hover: PuckPassiveInteraction;
  pointerMove: PuckPassiveInteraction;
  click: PuckReservedInteraction;
  drag: PuckReservedInteraction;
  form: PuckReservedInteraction;
};

export type PuckInteractionPolicyBucket =
  | "LIVE"
  | "LIVE_NONBLOCKING"
  | "PAUSED_INTERACTION"
  | "INTERACT_REQUIRED"
  | "STATIC_OK";

export type PuckInteractionPolicyDataset = {
  "data-puck-interaction-bucket": PuckInteractionPolicyBucket;
  "data-puck-interaction-visual-runtime": PuckInteractionRuntime;
  "data-puck-interaction-hover": PuckPassiveInteraction;
  "data-puck-interaction-pointer-move": PuckPassiveInteraction;
  "data-puck-interaction-click": PuckReservedInteraction;
  "data-puck-interaction-drag": PuckReservedInteraction;
  "data-puck-interaction-form": PuckReservedInteraction;
};

const reserveActions = {
  click: "interact-only",
  drag: "interact-only",
  form: "interact-only",
} as const;

const live = (overrides: Partial<PuckInteractionPolicy> = {}): PuckInteractionPolicy => ({
  visualRuntime: "live",
  hover: "none",
  pointerMove: "none",
  ...reserveActions,
  ...overrides,
});

const staticPolicy: PuckInteractionPolicy = {
  visualRuntime: "static",
  hover: "none",
  pointerMove: "none",
  click: "none",
  drag: "none",
  form: "none",
};

/** The 15 entries classified by the audit as passive hover-reactive. */
const passiveHoverCatalogKeys = new Set([
  "control-6:text-scatter-tw",
  "pro-block:features-6",
  "pro-block:navigation-14",
  "pro-block:navigation-11",
  "component:credit-card",
  "component:device",
  "component:skewed-carousel",
  "component:tumble-carousel",
  "component:vortex",
  "pro-block:features-4",
  "pro-block:features-9",
  "pro-block:features-11",
  "pro-block:features-12",
  "pro-block:hero-17",
  "pro-block:hero-14",
]);

/** The 11 entries classified by the audit as local pointer-follow effects. */
const passivePointerCatalogKeys = new Set([
  "pro-block:cta-8",
  "pro-block:hero-19",
  "component:cursor-wave",
  "component:card-spread",
  "component:bending-marquee",
  "component:tilted-tiles",
  "component:glue-dots",
  "current-free:particle-text",
  "current-free:floating-lines",
  "pro-block:pricing-1",
  "pro-block:stats-6",
]);

/** Static sources keep the selection contract but do not need a live runtime. */
const staticCatalogKeys = new Set([
  "pro-block:features-1",
  "pro-block:about-1",
  "pro-block:social-proof-3",
  "pro-block:social-proof-10",
  "pro-block:contact-2",
  "pro-block:stats-7",
  "pro-block:stats-8",
  "pro-block:about-12",
]);

/**
 * The 80 audited sources whose visual runtime remains live in EDIT. This is
 * classification metadata only; action capabilities remain guarded by the
 * shared authoring firewall.
 */
const liveCatalogKeys = new Set([
  "pro-block:navigation-12",
  "pro-block:cta-9",
  "pro-block:pricing-3",
  "pro-block:scheduling-3",
  "pro-block:contact-6",
  "pro-block:navigation-13",
  "pro-block:hero-16",
  "pro-block:showcase-4",
  "pro-block:how-it-works-4",
  "pro-block:social-proof-6",
  "pro-block:footer-3",
  "pro-block:hero-13",
  "pro-block:showcase-5",
  "pro-block:navigation-5",
  "component:lightspeed",
  "component:light-droplets",
  "component:frame-border",
  "starter:flicker-tw",
  "component:dot-shift",
  "control-3:blur-highlight",
  "control-3:faq-4",
  "control-3:empty-state-3",
  "control-6:download-1",
  "control-6:card-2",
  "pro-block:features-2",
  "pro-block:waitlist-1",
  "pro-block:social-proof-2",
  "pro-block:showcase-2",
  "pro-block:faq-3",
  "pro-block:stats-2",
  "pro-block:stats-3",
  "pro-block:footer-5",
  "pro-block:empty-state-1",
  "pro-block:feedback-1",
  "pro-block:comments-1",
  "pro-block:onboarding-1",
  "pro-block:settings-form-1",
  "pro-block:social-proof-4",
  "pro-block:faq-5",
  "pro-block:stats-4",
  "pro-block:about-8",
  "pro-block:how-it-works-8",
  "pro-block:showcase-6",
  "pro-block:social-proof-5",
  "pro-block:about-9",
  "pro-block:empty-state-2",
  "pro-block:feedback-2",
  "pro-block:onboarding-2",
  "pro-block:notifications-2",
  "pro-block:support-2",
  "pro-block:list-2",
  "pro-block:mobile-2",
  "pro-block:features-5",
  "pro-block:how-it-works-6",
  "pro-block:faq-6",
  "pro-block:waitlist-2",
  "pro-block:comments-2",
  "pro-block:empty-state-4",
  "pro-block:feedback-3",
  "pro-block:list-3",
  "pro-block:mobile-3",
  "pro-block:notifications-3",
  "pro-block:support-3",
  "component:scroll-stack",
  "pro-block:how-it-works-5",
  "pro-block:social-proof-8",
  "pro-block:faq-7",
  "pro-block:waitlist-3",
  "pro-block:comments-3",
  "pro-block:empty-state-5",
  "pro-block:feedback-4",
  "pro-block:list-4",
  "pro-block:mobile-4",
  "pro-block:notifications-4",
  "pro-block:support-4",
  "starter:magic-transform-tw",
  "starter:circle-stack-tw",
  "pro-block:faq-8",
  "pro-block:faq-9",
  "pro-block:features-8",
]);

/**
 * The canonical audit snapshot is intentionally catalog-key based. The
 * renderer never branches on these values; it only reads the resolved policy
 * attached to a manifest entry.
 */
const policyBucketByCatalogKey: Readonly<Record<string, PuckInteractionPolicyBucket>> = {
  "current-free:glow-cursor": "INTERACT_REQUIRED",
  "current-free:magic-rings": "INTERACT_REQUIRED",
  "current-free:splash-cursor": "INTERACT_REQUIRED",
  "component:circle-gallery": "INTERACT_REQUIRED",
  "component:gradient-carousel": "INTERACT_REQUIRED",
  "component:liquid-ascii": "INTERACT_REQUIRED",
  "component:text-cube": "INTERACT_REQUIRED",
  "component:modal-cards": "INTERACT_REQUIRED",
  "component:click-stack": "INTERACT_REQUIRED",
  "component:credit-card": "INTERACT_REQUIRED",
  "component:device": "INTERACT_REQUIRED",
  "component:page-flip": "INTERACT_REQUIRED",
  "component:glitch-text": "INTERACT_REQUIRED",
  "component:skewed-carousel": "INTERACT_REQUIRED",
  "component:tilted-tiles": "INTERACT_REQUIRED",
  "component:tumble-carousel": "INTERACT_REQUIRED",
  "component:cursor-wave": "INTERACT_REQUIRED",
  "component:glue-dots": "INTERACT_REQUIRED",
  "starter:rotating-cards-tw": "INTERACT_REQUIRED",
  "pro-block:app-dialog-1": "INTERACT_REQUIRED",
  "pro-block:app-dialog-2": "INTERACT_REQUIRED",
  "pro-block:app-dialog-3": "INTERACT_REQUIRED",
  "pro-block:app-dialog-4": "INTERACT_REQUIRED",
  "pro-block:app-dialog-5": "INTERACT_REQUIRED",
  "pro-block:app-dialog-6": "INTERACT_REQUIRED",
  "pro-block:command-menu-1": "INTERACT_REQUIRED",
  "pro-block:command-menu-2": "INTERACT_REQUIRED",
  "pro-block:command-menu-3": "INTERACT_REQUIRED",
  "pro-block:command-menu-4": "INTERACT_REQUIRED",
  "pro-block:command-menu-5": "INTERACT_REQUIRED",
  "pro-block:command-menu-6": "INTERACT_REQUIRED",
  "pro-block:app-shell-1": "INTERACT_REQUIRED",
  "pro-block:app-shell-2": "INTERACT_REQUIRED",
  "pro-block:app-shell-3": "INTERACT_REQUIRED",
  "pro-block:app-shell-5": "INTERACT_REQUIRED",
  "pro-block:app-shell-6": "INTERACT_REQUIRED",
  "pro-block:app-shell-8": "INTERACT_REQUIRED",
  "pro-block:app-shell-9": "INTERACT_REQUIRED",
  "pro-block:app-sidebar-1": "INTERACT_REQUIRED",
  "pro-block:app-sidebar-2": "INTERACT_REQUIRED",
  "pro-block:app-sidebar-3": "INTERACT_REQUIRED",
  "pro-block:app-sidebar-4": "INTERACT_REQUIRED",
  "pro-block:app-sidebar-5": "INTERACT_REQUIRED",
  "pro-block:app-sidebar-6": "INTERACT_REQUIRED",
  "pro-block:app-sidebar-7": "INTERACT_REQUIRED",
  "pro-block:forms-1": "INTERACT_REQUIRED",
  "pro-block:forms-2": "INTERACT_REQUIRED",
  "pro-block:forms-3": "INTERACT_REQUIRED",
  "pro-block:forms-4": "INTERACT_REQUIRED",
  "pro-block:forms-5": "INTERACT_REQUIRED",
  "pro-block:forms-6": "INTERACT_REQUIRED",
  "pro-block:settings-form-2": "INTERACT_REQUIRED",
  "pro-block:settings-form-3": "INTERACT_REQUIRED",
  "pro-block:navigation-2": "INTERACT_REQUIRED",
  "pro-block:navigation-4": "INTERACT_REQUIRED",
  "pro-block:navigation-6": "INTERACT_REQUIRED",
  "pro-block:navigation-7": "INTERACT_REQUIRED",
  "pro-block:navigation-8": "INTERACT_REQUIRED",
  "pro-block:navigation-9": "INTERACT_REQUIRED",
  "pro-block:navigation-15": "INTERACT_REQUIRED",
  "pro-block:settings-form-4": "INTERACT_REQUIRED",
};

const policyForBucket = (bucket: PuckInteractionPolicyBucket): PuckInteractionPolicy => {
  if (bucket === "STATIC_OK") return { ...staticPolicy, editBucket: bucket };
  if (bucket === "LIVE_NONBLOCKING") return { ...live(), editBucket: bucket };
  if (bucket === "INTERACT_REQUIRED") {
    return { ...live({ hover: "interact-only", pointerMove: "interact-only" }), editBucket: bucket };
  }
  return { ...live(), editBucket: bucket };
};

/** Resolve the audited policy from canonical production catalog metadata. */
export function resolvePuckInteractionPolicy(catalogKey: string): PuckInteractionPolicy {
  if (staticCatalogKeys.has(catalogKey)) return { ...staticPolicy, editBucket: "STATIC_OK" };
  if (passiveHoverCatalogKeys.has(catalogKey) || passivePointerCatalogKeys.has(catalogKey)) {
    return {
      ...live({
        hover: passiveHoverCatalogKeys.has(catalogKey) ? "passive-edit" : "none",
        pointerMove: passivePointerCatalogKeys.has(catalogKey) ? "passive-edit" : "none",
      }),
      editBucket: "LIVE_NONBLOCKING",
    };
  }
  const bucket = liveCatalogKeys.has(catalogKey)
    ? "LIVE"
    : policyBucketByCatalogKey[catalogKey] ?? "PAUSED_INTERACTION";
  return policyForBucket(bucket);
}

export function interactionPolicyDataset(policy: PuckInteractionPolicy): PuckInteractionPolicyDataset {
  return {
    "data-puck-interaction-bucket": interactionPolicyBucket(policy),
    "data-puck-interaction-visual-runtime": policy.visualRuntime,
    "data-puck-interaction-hover": policy.hover,
    "data-puck-interaction-pointer-move": policy.pointerMove,
    "data-puck-interaction-click": policy.click,
    "data-puck-interaction-drag": policy.drag,
    "data-puck-interaction-form": policy.form,
  };
}

export function interactionPolicyBucket(policy: PuckInteractionPolicy): PuckInteractionPolicyBucket {
  if (policy.editBucket) return policy.editBucket;
  if (policy.visualRuntime === "static") return "STATIC_OK";
  if (policy.hover === "passive-edit" || policy.pointerMove === "passive-edit") return "LIVE_NONBLOCKING";
  if (policy.hover === "interact-only" || policy.pointerMove === "interact-only") return "INTERACT_REQUIRED";
  if (policy.click === "none" && policy.drag === "none" && policy.form === "none") return "LIVE";
  return "PAUSED_INTERACTION";
}

export function policyAllowsPassiveHover(policy: PuckInteractionPolicy) {
  return policy.hover === "passive-edit";
}

export function policyAllowsPassivePointerMove(policy: PuckInteractionPolicy) {
  return policy.pointerMove === "passive-edit";
}

export function policyReservesClick(policy: PuckInteractionPolicy) {
  return policy.click === "interact-only";
}

export function policyReservesDrag(policy: PuckInteractionPolicy) {
  return policy.drag === "interact-only";
}

export function policyReservesForm(policy: PuckInteractionPolicy) {
  return policy.form === "interact-only";
}
