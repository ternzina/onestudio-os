import type { EffectFields, TextFields } from "./block-contract";

export type EffectMetadata = {
  kind?: "animated" | "decorative";
  category?: string;
  description?: string;
  libraryLabel?: string;
  propertiesLabel?: string;
};

export type EffectDefinition<
  Props extends object,
  EnabledProp extends string = string,
> = {
  key: string;
  label: string;
  enabledProp: EnabledProp;
  defaultEnabled: Props[EnabledProp & keyof Props];
  capabilities: readonly string[];
  fields: EffectFields<Props>;
  props?: readonly (keyof Props & string)[];
  metadata?: EffectMetadata;
};

export function defineEffect<
  Props extends object,
  EnabledProp extends string = "effectEnabled",
>(definition: EffectDefinition<Props, EnabledProp>) {
  return definition;
}

/** Flattens declarative effect controls into the existing Puck block props. */
export function effectFields<Props extends object>(
  ...definitions: readonly EffectDefinition<Props>[]
): TextFields<Props> {
  return Object.assign({}, ...definitions.map((definition) => definition.fields));
}
