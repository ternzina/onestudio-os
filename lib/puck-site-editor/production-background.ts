import type {
  PuckProductionBackgroundCapability,
  PuckProductionBackgroundTarget,
} from "./registry-manifest.ts";
import { PUCK_COMMON_PROP_RULES } from "./registry-manifest.ts";

export type PuckProductionBackgroundRouting = {
  target: PuckProductionBackgroundTarget;
  edited: boolean;
  wrapper?: string;
  sourceProp?: { prop: string; value: string };
  cssVariable?: { name: `--${string}`; value: string };
  sourceRoot?: string;
};

export function resolvePuckProductionSourceProps(
  resolvedProps: Readonly<Record<string, unknown>>,
  sourcePropKeys: readonly string[],
  backgroundRouting: PuckProductionBackgroundRouting,
): Record<string, unknown> {
  const sourceProps = new Set(sourcePropKeys);
  if (backgroundRouting.sourceProp && !sourceProps.has(backgroundRouting.sourceProp.prop)) {
    throw new Error(`Background source prop is not declared by the production source: ${backgroundRouting.sourceProp.prop}`);
  }

  const componentProps = Object.fromEntries(
    Object.entries(resolvedProps).filter(([key]) => {
      const isBackgroundSourceProp = backgroundRouting.sourceProp?.prop === key;
      const isBackgroundValue = key === "backgroundColor";
      return isBackgroundSourceProp || (!isBackgroundValue && (!(key in PUCK_COMMON_PROP_RULES) || sourceProps.has(key)));
    }),
  );
  if (backgroundRouting.sourceProp && backgroundRouting.sourceProp.prop !== "backgroundColor") {
    componentProps[backgroundRouting.sourceProp.prop] = backgroundRouting.sourceProp.value;
  }
  return componentProps;
}

/**
 * Resolves the single persisted Background value into its one declared
 * production render target. A source-root and CSS-variable target are only
 * applied after an edit so the original source behavior remains intact at
 * the manifest default and after Reset Original.
 */
export function resolvePuckProductionBackgroundRouting(
  capability: PuckProductionBackgroundCapability | undefined,
  value: unknown,
  originalValue: unknown,
): PuckProductionBackgroundRouting {
  const target = capability?.target ?? "wrapper";
  const selectedValue = typeof value === "string" ? value : undefined;
  const edited = selectedValue !== undefined && selectedValue !== originalValue;

  if (!capability || !capability.supported) return { target: "none", edited: false };
  if (!selectedValue) return { target: capability.target, edited: false };

  switch (capability.target) {
    case "wrapper":
      return { target, edited, wrapper: selectedValue };
    case "sourceProp":
      return { target, edited, sourceProp: { prop: capability.prop, value: selectedValue } };
    case "cssVariable":
      return edited
        ? { target, edited, cssVariable: { name: capability.name, value: selectedValue } }
        : { target, edited };
    case "sourceRoot":
      return edited ? { target, edited, sourceRoot: selectedValue } : { target, edited };
  }
}
