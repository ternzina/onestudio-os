import ProductionPuckQa from "@/components/puck-site-editor/production-puck-qa";
import { PUCK_PRODUCTION_MANIFEST } from "@/lib/puck-site-editor/registry-manifest";

type ProductionPuckQaPageProps = {
  searchParams: Promise<{
    ids?: string | string[];
    viewport?: string;
  }>;
};

export default async function ProductionPuckQaPage({
  searchParams,
}: ProductionPuckQaPageProps) {
  const query = await searchParams;
  const rawIds = query.ids;
  const requestedIds = (Array.isArray(rawIds) ? rawIds.join(",") : rawIds ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const ids = requestedIds.length
    ? requestedIds
    : PUCK_PRODUCTION_MANIFEST.slice(0, 20).map((entry) => entry.id);
  const initialViewportWidth = query.viewport === "mobile"
    ? 390
    : query.viewport === "tablet"
      ? 768
      : undefined;

  return <ProductionPuckQa ids={ids} initialViewportWidth={initialViewportWidth} />;
}
