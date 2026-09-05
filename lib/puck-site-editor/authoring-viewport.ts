import type { Viewport } from "@puckeditor/core";

/**
 * Puck's auto-height mode derives the source iframe height from its visual
 * zoom. That is correct for a generic page preview, but it changes the
 * logical viewport observed by viewport-based sources. Keep the authoring
 * viewport numeric so zoom remains a presentation transform only.
 *
 * The source contract is still `100vh`; this is the stable editor viewport
 * used to host that source contract, not a component-specific size.
 */
export const PUCK_PRODUCTION_AUTHORING_VIEWPORT_HEIGHT = 720;

export const PUCK_PRODUCTION_AUTHORING_VIEWPORTS: Viewport[] = [
  { label: "Desktop", width: 1280, height: PUCK_PRODUCTION_AUTHORING_VIEWPORT_HEIGHT },
  { label: "Tablet", width: 768, height: PUCK_PRODUCTION_AUTHORING_VIEWPORT_HEIGHT },
  { label: "Mobile", width: 390, height: PUCK_PRODUCTION_AUTHORING_VIEWPORT_HEIGHT },
];

export const PUCK_PRODUCTION_AUTHORING_UI = {
  current: {
    width: PUCK_PRODUCTION_AUTHORING_VIEWPORTS[0].width,
    height: PUCK_PRODUCTION_AUTHORING_VIEWPORT_HEIGHT,
  },
  controlsVisible: true,
  options: PUCK_PRODUCTION_AUTHORING_VIEWPORTS,
} as const;
