import type { ComponentType } from "react";

/** Runtime icon components stay adapter-local; production documents persist only tokens. */
export function resolveIconToken<Token extends string>(
  token: Token,
  icons: Readonly<Record<Token, ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>>>,
) {
  return icons[token];
}
