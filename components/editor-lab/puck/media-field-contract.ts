import {
  isPuckMediaField,
  withMediaDefaultResolver,
  type PuckPrimitiveField,
} from "./field-helpers";
import type { ControlGroupContract } from "./control-groups";

function readPath(root: unknown, path: string): unknown {
  const segments = path.match(/[^.[\]]+/g) ?? [];
  let current = root;
  for (const segment of segments) {
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current)) {
      const index = Number(segment);
      if (!Number.isInteger(index)) return undefined;
      current = current[index];
      continue;
    }
    if (typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/** Resolve an official default from Puck's scalar/array/nested field path. */
export function resolveMediaDefault(
  slot: string,
  defaults: readonly object[],
  fieldName: string,
) {
  const marker = `${slot}[`;
  const markerIndex = fieldName.indexOf(marker);
  if (markerIndex < 0) return undefined;
  const value = readPath({ [slot]: defaults }, fieldName.slice(markerIndex));
  return typeof value === "string" ? value : undefined;
}

/** Give every media item field the exact default from its owning content contract. */
export function bindMediaDefaults(
  sourceFields: Record<string, PuckPrimitiveField>,
  slot: string,
  defaults: readonly object[],
) {
  return Object.fromEntries(
    Object.entries(sourceFields).map(([fieldName, field]) => [
      fieldName,
      withMediaDefaultResolver(field, (name) => resolveMediaDefault(slot, defaults, name)),
    ]),
  ) as Record<string, PuckPrimitiveField>;
}

/** Add ungrouped scalar media fields to one shared Media properties group. */
export function mergeMediaControlGroup(
  sourceGroups: readonly ControlGroupContract[],
  sourceFields: Record<string, unknown>,
) {
  const grouped = new Set(sourceGroups.flatMap((group) => group.fields));
  const mediaFields = Object.entries(sourceFields)
    .filter(([, field]) => isPuckMediaField(field as PuckPrimitiveField))
    .map(([name]) => name)
    .filter((name) => !grouped.has(name));
  if (!mediaFields.length) return sourceGroups;

  const mediaGroupIndex = sourceGroups.findIndex((group) => group.label === "Media");
  if (mediaGroupIndex < 0) {
    return [...sourceGroups, { id: "media", label: "Media" as const, fields: mediaFields }];
  }
  return sourceGroups.map((group, index) => index === mediaGroupIndex
    ? { ...group, fields: [...group.fields, ...mediaFields] }
    : group);
}
