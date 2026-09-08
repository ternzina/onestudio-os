import type { PrimitivePuckPropRule, PuckPropRule } from "@/lib/puck-site-editor/registry-manifest";

export function humanizePuckFieldKey(name: string) {
  return name.replace(/([A-Z])/g, " $1").replace(/^./, (character) => character.toUpperCase());
}

export function labelForPuckRule(name: string, rule: PrimitivePuckPropRule | PuckPropRule): string {
  return ("label" in rule && typeof rule.label === "string" && rule.label.trim())
    || ("title" in rule && typeof rule.title === "string" && rule.title.trim())
    || humanizePuckFieldKey(name);
}
