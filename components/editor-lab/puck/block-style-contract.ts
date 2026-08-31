import type { ControlGroupContract } from "./control-groups";
import { fields } from "./field-helpers";

export const blockStyleControlProps = {
  backgroundMode: "__rbStyleBackgroundMode",
  backgroundColor: "__rbStyleBackgroundColor",
  borderMode: "__rbStyleBorderMode",
  borderColor: "__rbStyleBorderColor",
  shadow: "__rbStyleShadow",
  opacity: "__rbStyleOpacity",
} as const;

export type BlockStyleContract = {
  background?: boolean;
  border?: boolean;
  shadow?: boolean;
  opacity?: boolean;
};

export function defineBlockStyleContract<const Contract extends BlockStyleContract>(
  contract: Contract,
) {
  return contract;
}

const backgroundModeOptions = [
  { label: "Original", value: "original" },
  { label: "Transparent", value: "transparent" },
  { label: "Color", value: "color" },
];

const borderModeOptions = [
  { label: "Original", value: "original" },
  { label: "Off", value: "off" },
  { label: "On", value: "on" },
];

const shadowOptions = [
  { label: "Original", value: "original" },
  { label: "None", value: "none" },
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
];

export function bindBlockStyleContract(
  contract: BlockStyleContract | undefined,
  sourceFields: Record<string, unknown>,
  sourceDefaults: Record<string, unknown>,
) {
  if (!contract) {
    return {
      fields: sourceFields,
      defaults: sourceDefaults,
      groups: [] as ControlGroupContract[],
    };
  }

  const boundFields = { ...sourceFields };
  const boundDefaults = { ...sourceDefaults };
  const appearanceFields: string[] = [];

  const add = (prop: string, field: unknown, defaultValue: unknown) => {
    if (prop in boundFields) {
      throw new Error(`Block style field already exists: ${prop}`);
    }
    boundFields[prop] = field;
    boundDefaults[prop] = defaultValue;
    appearanceFields.push(prop);
  };

  if (contract.background) {
    add(
      blockStyleControlProps.backgroundMode,
      fields.select("Background mode", backgroundModeOptions),
      "original",
    );
    // Inert while mode is Original; this is the initial editor color only.
    add(
      blockStyleControlProps.backgroundColor,
      fields.color("Background color"),
      "#ffffff",
    );
  }

  if (contract.border) {
    add(
      blockStyleControlProps.borderMode,
      fields.select("Border", borderModeOptions),
      "original",
    );
    add(
      blockStyleControlProps.borderColor,
      fields.color("Border color"),
      "#d4d4d4",
    );
  }

  if (contract.shadow) {
    add(
      blockStyleControlProps.shadow,
      fields.select("Shadow", shadowOptions),
      "original",
    );
  }

  if (contract.opacity) {
    add(
      blockStyleControlProps.opacity,
      fields.slider("Opacity (%)", { min: 0, max: 100, step: 5 }),
      100,
    );
  }

  return {
    fields: boundFields,
    defaults: boundDefaults,
    groups: [{ id: "block-style", label: "Appearance", fields: appearanceFields }] satisfies ControlGroupContract[],
  };
}

export function readBlockStyleValues(values: Record<string, unknown>) {
  const backgroundMode = values[blockStyleControlProps.backgroundMode];
  const backgroundColor = values[blockStyleControlProps.backgroundColor];
  const borderMode = values[blockStyleControlProps.borderMode];
  const borderColor = values[blockStyleControlProps.borderColor];
  const shadow = values[blockStyleControlProps.shadow];
  const opacity = values[blockStyleControlProps.opacity];

  return {
    backgroundMode: typeof backgroundMode === "string" ? backgroundMode : "original",
    backgroundColor: typeof backgroundColor === "string" ? backgroundColor : "#ffffff",
    borderMode: typeof borderMode === "string" ? borderMode : "original",
    borderColor: typeof borderColor === "string" ? borderColor : "#d4d4d4",
    shadow: typeof shadow === "string" ? shadow : "original",
    opacity: typeof opacity === "number" ? Math.min(Math.max(opacity, 0), 100) : 100,
  };
}
