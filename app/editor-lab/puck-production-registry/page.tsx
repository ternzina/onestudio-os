import ProductionQaHarness from "@/components/puck-site-editor/production-qa-harness";
import { PUCK_PRODUCTION_MANIFEST } from "@/lib/puck-site-editor/registry-manifest";

const clamp = (value: string | string[] | undefined, fallback: number, max: number) => {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(Math.floor(parsed), max)) : fallback;
};

export default async function ProductionRegistryQaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const start = clamp(query.start, 0, PUCK_PRODUCTION_MANIFEST.length);
  const limit = clamp(query.limit, 20, 60);
  const requestedIds = (Array.isArray(query.ids) ? query.ids[0] : query.ids)
    ?.split(",")
    .filter((id) => PUCK_PRODUCTION_MANIFEST.some((entry) => entry.id === id));
  const ids = requestedIds?.length
    ? requestedIds
    : PUCK_PRODUCTION_MANIFEST.slice(start, start + limit).map((entry) => entry.id);

  return (
    <ProductionQaHarness
      componentIds={ids}
      automatic={(Array.isArray(query.auto) ? query.auto[0] : query.auto) === "1"}
    />
  );
}
