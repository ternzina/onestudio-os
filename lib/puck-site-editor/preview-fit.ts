import type { PuckProductionPresentationContract } from "./registry-manifest.ts";

export type ProductionPreviewFit = {
  width: number;
  height: number;
  scale: number;
  left: number;
  top: number;
};

export type ProductionPreviewSceneSize = {
  width: number;
  height: number;
};

/**
 * Resolve a preview scene from the window that owns the Library preview
 * mount. An unrelated Puck editor iframe must not determine its geometry.
 */
export function resolveProductionPreviewSceneSize({
  availableWidth,
  availableHeight,
  sourceWidth,
  sourceHeight,
  measuredSceneHeight,
  presentation,
}: {
  availableWidth: number;
  availableHeight: number;
  sourceWidth?: number;
  sourceHeight?: number;
  measuredSceneHeight: number;
  presentation?: PuckProductionPresentationContract;
}): ProductionPreviewSceneSize {
  const width = presentation?.editorPresentationDefault?.width.value
    ?? Math.max(sourceWidth ?? availableWidth, 1);
  const height = presentation?.editorPresentationDefault?.height.value
    ?? (presentation?.geometry?.viewportHeight
      ? Math.max(sourceHeight ?? availableHeight, 1)
      : Math.max(measuredSceneHeight, 1));
  return { width, height };
}

/**
 * Contain a canonical authored scene in the Library viewport. The scene
 * dimensions are never replaced with the viewport dimensions, so a measured
 * WebGL/canvas source keeps its authored aspect before this transform.
 */
export function calculateProductionPreviewFit({
  availableWidth,
  availableHeight,
  sceneWidth,
  sceneHeight,
}: {
  availableWidth: number;
  availableHeight: number;
  sceneWidth: number;
  sceneHeight: number;
}): ProductionPreviewFit {
  const width = Math.max(sceneWidth, 1);
  const height = Math.max(sceneHeight, 1);
  const scale = Math.min(availableWidth / width, availableHeight / height);
  return {
    width,
    height,
    scale,
    left: Math.max(0, (availableWidth - width * scale) / 2),
    top: Math.max(0, (availableHeight - height * scale) / 2),
  };
}
