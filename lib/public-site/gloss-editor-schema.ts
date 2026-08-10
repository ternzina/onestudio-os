import type { EditorInspectorPlacedField } from "./editor-spec.ts";
import type { GlossNativeSectionId } from "./gloss-premium-template-contract.ts";
import type { PublicSiteContent } from "./types.ts";

const fields: Record<GlossNativeSectionId, readonly (keyof PublicSiteContent)[]> = {
  services: ["services_label", "services_title", "services_button_label"],
  portfolio: ["portfolio_label", "portfolio_title", "popular_title"],
  team: ["team_label", "team_title", "team_items"],
  booking: ["booking_label", "booking_title", "booking_text"],
  membership: ["membership_label", "membership_title", "membership_text"],
  safety: ["safety_label", "safety_title", "safety_items"],
  reviews: ["reviews_label", "reviews_title", "reviews_items"],
  gift: ["gift_label", "gift_title", "gift_text"],
  faq: ["faq_label", "faq_title", "faq_items"],
  about: ["about_label", "about_title", "about_text"],
  contact: ["contact_label", "contact_title", "contact_address", "contact_phone", "contact_email", "contact_hours", "contact_note"],
};

const multiline = new Set<keyof PublicSiteContent>([
  "team_items", "booking_text", "membership_text", "safety_items", "reviews_items",
  "gift_text", "faq_items", "about_text", "contact_note",
]);

export function buildGlossInspectorFields(
  content: PublicSiteContent,
  sectionId: GlossNativeSectionId,
  disabled: boolean,
  onChange: (content: PublicSiteContent, historyGroup: string) => void,
): EditorInspectorPlacedField[] {
  return fields[sectionId].map((key) => ({
    id: `gloss-${String(key).replaceAll("_", "-")}`,
    group: "content",
    type: multiline.has(key) ? "textarea" : "text",
    label: String(key).replaceAll("_", " "),
    value: String(content[key] ?? ""),
    disabled,
    onChange: (value: string) => onChange(
      { ...content, [key]: value },
      `gloss:${sectionId}:${String(key)}`,
    ),
  } as EditorInspectorPlacedField));
}
