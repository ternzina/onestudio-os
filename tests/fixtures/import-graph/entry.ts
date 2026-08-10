import {
  multilineValue,
} from "./multiline.ts";
import {
  type TypeOnly,
  mixedValue,
} from "./mixed.ts";
import type { OnlyType } from "./type-only.ts";
export {
  reexportedValue,
} from "./reexport.ts";
export type { ReexportedType } from "./type-only.ts";

void multilineValue;
void mixedValue;
void import("./dynamic.ts");
export type FixtureType = TypeOnly | OnlyType;
