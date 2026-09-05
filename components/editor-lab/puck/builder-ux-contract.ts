import type { ComponentConfig, ComponentData, Config } from "@puckeditor/core";

export type StyleTransferSnapshot = {
  sourceType: string;
  values: Record<string, unknown>;
};

export type BuilderBlockMetadata = {
  type: string;
  motionControls?: readonly { prop: string }[];
  visualControls?: readonly {
    prop: string;
    group: "Appearance" | "Behavior" | "Media";
    kind: string;
  }[];
};

export type StyleTransferContract = ReadonlyMap<string, ReadonlySet<string>>;

export const BUILDER_STYLE_PRESETS = ["Original", "Clean", "Spacious"] as const;
export type BuilderStylePreset = (typeof BUILDER_STYLE_PRESETS)[number];

const isBuilderStyleProp = (name: string) =>
  name.startsWith("__rbLayout") || name.startsWith("__rbStyle");

export function cloneBuilderValue<Value>(value: Value): Value {
  return value === undefined ? value : structuredClone(value);
}

/**
 * Build style compatibility from explicit block metadata and the exact bound
 * Puck defaults. User content and media source URLs never enter this map.
 */
export function buildStyleTransferContract(
  blocks: readonly BuilderBlockMetadata[],
  config: Config,
): StyleTransferContract {
  return new Map(blocks.map((block) => {
    const component = config.components[block.type] as ComponentConfig | undefined;
    const defaults = (component?.defaultProps ?? {}) as Record<string, unknown>;
    const keys = new Set(Object.keys(defaults).filter(isBuilderStyleProp));

    block.motionControls?.forEach((control) => keys.add(control.prop));
    block.visualControls
      ?.filter((control) =>
        (control.group === "Appearance" || control.group === "Behavior") &&
        control.kind !== "mediaUrl",
      )
      .forEach((control) => keys.add(control.prop));

    return [block.type, keys] as const;
  }));
}

/** Exact, serializable reset snapshot. The instance id is identity, not content. */
export function createBlockDefaultSnapshot(
  component: ComponentConfig,
  current: ComponentData,
): ComponentData {
  const defaults = cloneBuilderValue(
    (component.defaultProps ?? {}) as Record<string, unknown>,
  );
  return {
    ...current,
    props: {
      ...defaults,
      id: current.props.id,
    },
  };
}

export function copyCompatibleStyle(
  source: ComponentData,
  _component: ComponentConfig,
  contract: StyleTransferContract,
): StyleTransferSnapshot {
  const keys = contract.get(source.type) ?? new Set<string>();
  // A copied style represents only explicit editor choices. Filling missing
  // values from a component config turns native source defaults into sticky
  // overrides when pasted into a different block.
  const values = Object.fromEntries([...keys]
    .filter((key) => source.props[key] !== undefined)
    .map((key) => [key, cloneBuilderValue(source.props[key])]));
  return { sourceType: source.type, values };
}

export function pasteCompatibleStyle(
  target: ComponentData,
  snapshot: StyleTransferSnapshot,
  contract: StyleTransferContract,
): ComponentData {
  const supported = contract.get(target.type) ?? new Set<string>();
  const compatible = Object.fromEntries(Object.entries(snapshot.values)
    .filter(([key]) => supported.has(key))
    .map(([key, value]) => [key, cloneBuilderValue(value)]));
  return {
    ...target,
    props: { ...target.props, ...compatible },
  };
}

function presetValue(key: string, preset: Exclude<BuilderStylePreset, "Original">) {
  if (key.endsWith("TopPadding") || key.endsWith("BottomPadding") || key.endsWith("HorizontalPadding")) {
    return preset === "Spacious" ? "spacious" : "normal";
  }
  if (key.endsWith("ContentWidth")) return "wide";
  if (key.endsWith("Gap")) return preset === "Spacious" ? "spacious" : "normal";
  if (key.endsWith("Radius")) return preset === "Spacious" ? "large" : "medium";
  if (key.endsWith("Shadow")) return preset === "Spacious" ? "medium" : "none";
  if (key.endsWith("Opacity")) return 100;
  return undefined;
}

function setDesktopValue(current: unknown, next: unknown) {
  if (!current || typeof current !== "object" || Array.isArray(current)) return next;
  return { ...(current as Record<string, unknown>), desktop: next };
}

export function applyStylePreset(
  target: ComponentData,
  _component: ComponentConfig,
  contract: StyleTransferContract,
  preset: BuilderStylePreset,
): ComponentData {
  const supported = contract.get(target.type) ?? new Set<string>();
  const nextProps = { ...target.props };

  for (const key of supported) {
    if (preset === "Original") {
      // Original is an absence of an editor override. Passing a cached config
      // default here can materially differ from an official/adapted source
      // default and makes pointer effects appear subdued after a reset.
      delete nextProps[key];
      continue;
    }
    const value = presetValue(key, preset);
    if (value !== undefined) nextProps[key] = setDesktopValue(nextProps[key], value);
  }

  return { ...target, props: nextProps };
}
