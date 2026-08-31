import type { ControlGroupContract } from "./control-groups";
import { fields } from "./field-helpers";

type MotionControlBase = {
  prop: string;
  label: string;
  provenance: "official-source" | "adapted-source";
};

export type MotionControlDefinition =
  | (MotionControlBase & {
      kind: "toggle";
      defaultValue: boolean;
    })
  | (MotionControlBase & {
      kind: "select";
      defaultValue: string;
      options: readonly { label: string; value: string }[];
    })
  | (MotionControlBase & {
      kind: "number";
      defaultValue: number;
      min: number;
      max: number;
      step: number;
      unit?: "ms" | "s" | "%";
      presentation: "number" | "slider";
    });

export type MotionControlContract = readonly MotionControlDefinition[];

export function defineMotionControls<const Controls extends MotionControlContract>(
  controls: Controls,
) {
  return controls;
}

export function bindMotionControlContract(
  contract: MotionControlContract | undefined,
  sourceFields: Record<string, unknown>,
  sourceDefaults: Record<string, unknown>,
) {
  if (!contract?.length) {
    return {
      fields: sourceFields,
      defaults: sourceDefaults,
      groups: [] as ControlGroupContract[],
    };
  }

  const boundFields = { ...sourceFields };
  const boundDefaults = { ...sourceDefaults };
  const behaviorFields: string[] = [];

  for (const control of contract) {
    if (control.prop in boundFields) {
      throw new Error(`Motion control field already exists: ${control.prop}`);
    }

    if (control.kind === "toggle") {
      boundFields[control.prop] = fields.toggle(control.label);
    } else if (control.kind === "select") {
      boundFields[control.prop] = fields.select(control.label, [...control.options]);
    } else {
      const label = control.unit ? `${control.label} (${control.unit})` : control.label;
      boundFields[control.prop] = control.presentation === "slider"
        ? fields.slider(label, {
            min: control.min,
            max: control.max,
            step: control.step,
          })
        : fields.number(label, {
            min: control.min,
            max: control.max,
            step: control.step,
          });
    }

    boundDefaults[control.prop] = control.defaultValue;
    behaviorFields.push(control.prop);
  }

  return {
    fields: boundFields,
    defaults: boundDefaults,
    groups: [{ id: "motion", label: "Behavior", fields: behaviorFields }] satisfies ControlGroupContract[],
  };
}
