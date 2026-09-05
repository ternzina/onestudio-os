import type { PuckProductionPresentationContract } from "./registry-manifest.ts";

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

/** Resolve typed presentation metadata without changing source props. */
export function resolvePuckProductionPresentationStyle(
  presentationContract: PuckProductionPresentationContract | undefined,
  runtimeMode: ProductionRuntimeMode,
): PuckProductionPresentationStyle {
  if (!presentationContract) return {};

  const usesAuthoringAspectRatio = runtimeMode === "authoring"
    && presentationContract.geometry.aspectRatio?.provenance === "editorPresentationDefault";
  const style: PuckProductionPresentationStyle = {};

  if (presentationContract.technicalRuntime && !usesAuthoringAspectRatio) {
    style.height = presentationContract.technicalRuntime.height.value;
    style.minHeight = presentationContract.technicalRuntime.height.value;
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
