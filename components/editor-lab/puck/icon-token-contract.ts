import type { ComponentType } from "react";
import type { PuckSelectField } from "./field-helpers";

export type SerializableIconTokenContract<Token extends string> = {
  label: string;
  tokens: readonly { token: Token; label: string }[];
};

export function defineSerializableIconTokenContract<Token extends string>(
  contract: SerializableIconTokenContract<Token>,
) {
  return contract;
}

export function iconTokenField<Token extends string>(
  contract: SerializableIconTokenContract<Token>,
  label = contract.label,
): PuckSelectField {
  return {
    type: "select",
    label,
    options: contract.tokens.map(({ token, label: optionLabel }) => ({
      label: optionLabel,
      value: token,
    })),
  };
}

/** Runtime icon components stay adapter-local; Puck persists only the token. */
export function resolveIconToken<Token extends string>(
  token: Token,
  icons: Readonly<Record<Token, ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>>>,
) {
  return icons[token];
}
