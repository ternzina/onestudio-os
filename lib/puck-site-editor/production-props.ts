type ProductionProps = Readonly<Record<string, unknown>>;

function readPath(value: unknown, path: readonly string[]) {
  let current: unknown = value;
  for (const segment of path) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return { present: false, value: undefined };
    if (!Object.prototype.hasOwnProperty.call(current, segment)) return { present: false, value: undefined };
    current = (current as Record<string, unknown>)[segment];
  }
  return { present: true, value: current };
}

/**
 * Resolves defaults exactly once at the shared production boundary. An
 * explicitly stored false, zero, or empty string is always more specific than
 * the registry default.
 */
export function resolvePuckProductionProps(
  defaults: ProductionProps,
  storedProps: ProductionProps,
): Record<string, unknown> {
  const resolved: Record<string, unknown> = { ...defaults };
  for (const key of Object.keys(storedProps)) {
    resolved[key] = storedProps[key];
  }
  return resolved;
}

export function resolvePuckProductionFieldValue(
  storedProps: ProductionProps,
  defaults: ProductionProps,
  path: readonly string[],
) {
  const stored = readPath(storedProps, path);
  return stored.present ? stored.value : readPath(defaults, path).value;
}
