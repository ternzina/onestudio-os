import {
  defineArrayItemsContract,
  type ArrayItemsContract,
  type PrimitiveArrayItem,
} from "./array-items-contract";
import { fields } from "./field-helpers";

export type MenuLinkItem = PrimitiveArrayItem & {
  label: string;
  href?: string;
};

/**
 * A bounded, flat link-list specialization of ARRAY_ITEMS_CONTRACT.
 * Structural menu state and non-serializable icons stay in adapted sources.
 */
export function defineMenuLinksArrayContract({
  slot,
  label,
  defaults,
  includeHref = true,
}: {
  slot: string;
  label: string;
  defaults: readonly MenuLinkItem[];
  includeHref?: boolean;
}): ArrayItemsContract<PrimitiveArrayItem> {
  return defineArrayItemsContract<PrimitiveArrayItem>({
    slot,
    label,
    defaults,
    fields: {
      label: fields.text("Label", { contentEditable: false }),
      ...(includeHref
        ? { href: fields.text("Href", { contentEditable: false }) }
        : {}),
    },
    itemLabel: (item) => String(item.label ?? "Link"),
  });
}
