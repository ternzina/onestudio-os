export const PUCK_PRODUCTION_RUNTIME_EXCLUSIONS = [
  {
    id: "RB_pixel_reveal",
    catalogKey: "component:pixel-reveal",
    status: "BLOCKED_HOST_CONTRACT_GAP",
    reason: "Production smoke produced zero-height bounds without provenance-backed host metadata.",
  },
  {
    id: "RB_portal",
    catalogKey: "component:portal",
    status: "BLOCKED_HOST_CONTRACT_GAP",
    reason: "Production smoke produced zero-height bounds without provenance-backed host metadata.",
  },
] as const;
