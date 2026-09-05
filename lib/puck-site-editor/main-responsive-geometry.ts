/**
 * Puck's authoring viewport is a logical CSS width. It is independent from
 * the canvas transform used to present that viewport at the selected zoom.
 * Keep non-numeric/full-width modes on the host's normal 100% path.
 */
export function resolvePuckMainLogicalViewportWidth(
  viewportWidth: number | string | undefined,
): number | undefined {
  return typeof viewportWidth === "number"
    && Number.isFinite(viewportWidth)
    && viewportWidth > 0
    ? viewportWidth
    : undefined;
}
