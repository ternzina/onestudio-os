export type ProductionPreviewFit = {
  width: number;
  height: number;
  scale: number;
  left: number;
  top: number;
};

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
