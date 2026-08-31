import { fields } from "./field-helpers";
import type { ControlGroupContract } from "./control-groups";

type VisualGroup = "Appearance" | "Behavior" | "Media";
type VisualBase = {
  prop: string;
  label: string;
  group: VisualGroup;
  provenance: "official-source" | "official-docs";
};

export type NumericControlContract = VisualBase & {
  kind: "number";
  defaultValue: number;
  presentation: "number" | "slider";
  min?: number;
  max?: number;
  step: number;
  unit?: "px" | "ms" | "s" | "%" | "count";
};

export type VisualControlContract =
  | (VisualBase & { kind: "color"; defaultValue: string })
  | (VisualBase & { kind: "toggle"; defaultValue: boolean })
  | (VisualBase & { kind: "select"; defaultValue: string; options: readonly { label: string; value: string }[] })
  | (VisualBase & { kind: "mediaUrl"; defaultValue: string })
  | (VisualBase & { kind: "colorArray"; defaultValue: readonly string[]; itemLabels?: readonly string[] })
  | NumericControlContract;

export function defineVisualControls<const Controls extends readonly VisualControlContract[]>(controls: Controls) {
  return controls;
}

const groupId = (group: VisualGroup) => `visual-${group.toLowerCase()}`;

export function bindVisualControlContracts(
  contracts: readonly VisualControlContract[] | undefined,
  sourceFields: Record<string, unknown>,
  sourceDefaults: Record<string, unknown>,
) {
  if (!contracts?.length) {
    return { fields: sourceFields, defaults: sourceDefaults, groups: [] as ControlGroupContract[] };
  }

  const boundFields = { ...sourceFields };
  const boundDefaults = { ...sourceDefaults };
  const grouped = new Map<VisualGroup, string[]>();

  for (const contract of contracts) {
    if (contract.prop in boundFields) {
      throw new Error(`Visual control field already exists: ${contract.prop}`);
    }
    const label = "unit" in contract && contract.unit
      ? `${contract.label} (${contract.unit})`
      : contract.label;
    switch (contract.kind) {
      case "color":
        boundFields[contract.prop] = fields.color(label);
        break;
      case "toggle":
        boundFields[contract.prop] = fields.toggle(label);
        break;
      case "select":
        boundFields[contract.prop] = fields.select(label, [...contract.options]);
        break;
      case "mediaUrl": {
        boundFields[contract.prop] = fields.imageUrl(label);
        break;
      }
      case "colorArray":
        boundFields[contract.prop] = fields.colorArray(label, contract.defaultValue, contract.itemLabels);
        break;
      case "number":
        if (contract.presentation === "slider") {
          if (contract.min === undefined || contract.max === undefined) {
            throw new Error(`Slider requires proven min/max: ${contract.prop}`);
          }
          boundFields[contract.prop] = fields.slider(label, {
            min: contract.min,
            max: contract.max,
            step: contract.step,
          });
        } else {
          boundFields[contract.prop] = fields.number(label, {
            min: contract.min,
            max: contract.max,
            step: contract.step,
          });
        }
        break;
    }
    boundDefaults[contract.prop] = Array.isArray(contract.defaultValue)
      ? [...contract.defaultValue]
      : contract.defaultValue;
    grouped.set(contract.group, [...(grouped.get(contract.group) ?? []), contract.prop]);
  }

  const groups = (["Media", "Appearance", "Behavior"] as const)
    .filter((group) => grouped.has(group))
    .map((group) => ({ id: groupId(group), label: group, fields: grouped.get(group) ?? [] }));
  return { fields: boundFields, defaults: boundDefaults, groups };
}
