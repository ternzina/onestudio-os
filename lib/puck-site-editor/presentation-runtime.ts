import type { PuckProductionPresentationContract } from "./registry-manifest.ts";
import { PUCK_PRODUCTION_AUTHORING_UI, PUCK_PRODUCTION_AUTHORING_VIEWPORT_HEIGHT } from "./authoring-viewport.ts";

export type ProductionRuntimeMode = "public" | "authoring";

export type PuckProductionPresentationStyle = {
  height?: number;
  minHeight?: number;
  aspectRatio?: number;
  overflow?: "hidden" | "visible";
  display?: "flex";
  alignItems?: "center";
  justifyContent?: "center";
};

export type PuckProductionAuthoringStage = {
  width: number;
  height: number;
};

/**
 * Resolve the logical editor stage without conflating it with the public host
 * fallback. Authoring aspect geometry is the strongest override, followed by
 * explicit editor dimensions, then the shared fullSurface viewport.
 */
export function resolvePuckProductionAuthoringStage(
  presentationContract: PuckProductionPresentationContract | undefined,
): PuckProductionAuthoringStage | undefined {
  if (!presentationContract) return undefined;

  const explicitStage = presentationContract.editorPresentationDefault;
  const defaultAuthoringWidth = typeof PUCK_PRODUCTION_AUTHORING_UI.current.width === "number"
    ? PUCK_PRODUCTION_AUTHORING_UI.current.width
    : undefined;
  const width = explicitStage?.width.value
    ?? (presentationContract.geometry.kind === "fullSurface"
      ? defaultAuthoringWidth
      : undefined);
  if (width === undefined) return undefined;

  const authoringAspectRatio = presentationContract.geometry.aspectRatio?.provenance === "editorPresentationDefault"
    ? presentationContract.geometry.aspectRatio.value
    : undefined;
  if (authoringAspectRatio !== undefined) {
    return { width, height: width / authoringAspectRatio };
  }
  if (explicitStage) return { width, height: explicitStage.height.value };
  if (presentationContract.geometry.kind === "fullSurface") {
    return { width, height: PUCK_PRODUCTION_AUTHORING_VIEWPORT_HEIGHT };
  }
  return undefined;
}

/** Resolve typed presentation metadata without changing source props. */
export function resolvePuckProductionPresentationStyle(
  presentationContract: PuckProductionPresentationContract | undefined,
  runtimeMode: ProductionRuntimeMode,
): PuckProductionPresentationStyle {
  if (!presentationContract) return {};

  const authoringStage = runtimeMode === "authoring"
    ? resolvePuckProductionAuthoringStage(presentationContract)
    : undefined;
  const usesAuthoringAspectRatio = runtimeMode === "authoring"
    && presentationContract.geometry.aspectRatio?.provenance === "editorPresentationDefault";
  const style: PuckProductionPresentationStyle = {};

  if (runtimeMode === "public" && presentationContract.technicalRuntime) {
    style.height = presentationContract.technicalRuntime.height.value;
    style.minHeight = presentationContract.technicalRuntime.height.value;
  }
  if (authoringStage && !usesAuthoringAspectRatio) {
    style.height = authoringStage.height;
    style.minHeight = authoringStage.height;
  }
  if (presentationContract.geometry.minHeight) {
    style.minHeight = presentationContract.geometry.minHeight.value;
  }
  if (presentationContract.geometry.aspectRatio && (
    presentationContract.geometry.aspectRatio.provenance !== "editorPresentationDefault"
    || usesAuthoringAspectRatio
  )) {
    style.aspectRatio = presentationContract.geometry.aspectRatio.value;
  }
  if (presentationContract.overflow === "clip") style.overflow = "hidden";
  if (presentationContract.rootLayout) {
    style.display = presentationContract.rootLayout.display;
    style.alignItems = presentationContract.rootLayout.alignItems;
    style.justifyContent = presentationContract.rootLayout.justifyContent;
  }

  return style;
}
