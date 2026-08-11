const BLOCKED_PATH_SEGMENTS = new Set([
  "__proto__",
  "prototype",
  "constructor",
]);

function isArrayIndex(segment: string) {
  return /^(0|[1-9]\d*)$/.test(segment);
}

function cloneContainer(value: unknown, array: boolean): unknown[] | Record<string, unknown> {
  if (array) return Array.isArray(value) ? [...value] : [];
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return { ...(value as Record<string, unknown>) };
  }
  return {};
}

export function setImmutableDeepPath(
  source: unknown,
  path: string,
  value: unknown,
): unknown {
  const segments = path.split(".");
  if (
    !path ||
    segments.some(
      (segment) => !segment || BLOCKED_PATH_SEGMENTS.has(segment),
    )
  ) {
    throw new Error("Unsafe template content path");
  }

  const update = (current: unknown, index: number): unknown => {
    const segment = segments[index];
    const array = isArrayIndex(segment);
    const container = cloneContainer(current, array);
    const key = array ? Number(segment) : segment;
    if (index === segments.length - 1) {
      container[key as never] = value as never;
      return container;
    }
    const child = container[key as never];
    container[key as never] = update(child, index + 1) as never;
    return container;
  };

  return update(source, 0);
}

export function setTemplateContentPath(
  templateContent: Record<string, unknown> | undefined,
  templateKey: string,
  path: string,
  value: unknown,
) {
  if (!templateKey || BLOCKED_PATH_SEGMENTS.has(templateKey)) {
    throw new Error("Unsafe template content namespace");
  }
  return {
    ...(templateContent ?? {}),
    [templateKey]: setImmutableDeepPath(templateContent?.[templateKey], path, value),
  };
}
