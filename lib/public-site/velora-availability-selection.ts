export type VeloraAvailabilitySelection = {
  venue: string;
  packageName: string;
};

type SelectionKind = keyof VeloraAvailabilitySelection;

const QUERY_KEYS: Record<SelectionKind, string> = {
  venue: "venue",
  packageName: "package",
};

export function buildVeloraAvailabilityHref(
  basePath: string,
  kind: SelectionKind,
  value: string,
) {
  const encodedValue = encodeURIComponent(value);
  const params = new URLSearchParams(
    `${QUERY_KEYS[kind]}=${encodedValue}`,
  );
  return `${basePath}?${params.toString()}#availability`;
}

export function parseVeloraAvailabilitySelection(
  search: string | URLSearchParams,
  venueNames: readonly string[],
  packageNames: readonly string[],
): VeloraAvailabilitySelection {
  const params =
    typeof search === "string" ? new URLSearchParams(search) : search;
  const venue = params.get(QUERY_KEYS.venue) ?? "";
  const packageName = params.get(QUERY_KEYS.packageName) ?? "";
  return {
    venue: venueNames.includes(venue) ? venue : "",
    packageName: packageNames.includes(packageName) ? packageName : "",
  };
}
