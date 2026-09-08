import { PUCK_EXPANDED_REGISTRY_DATA } from "../../lib/puck-site-editor/generated-registry-data.ts";
import type { ComponentEditorContract } from "../../lib/puck-site-editor/builder-contract.ts";

function generatedDefaults(catalogKey: string) {
  const entry = PUCK_EXPANDED_REGISTRY_DATA.find((item) => item.catalogKey === catalogKey);
  if (!entry) throw new Error(`Missing generated defaults for ${catalogKey}`);
  return entry.defaults;
}

const hero18Defaults = generatedDefaults("pro-block:hero-18") as ComponentEditorContract["defaultProps"] & {
  readonly heading: string;
  readonly description: string;
  readonly primaryButtonLabel: string;
  readonly loop: boolean;
};

const cta10Defaults = generatedDefaults("pro-block:cta-10") as ComponentEditorContract["defaultProps"] & {
  readonly heading: string;
  readonly description: string;
  readonly emailPlaceholder: string;
  readonly buttonLabel: string;
  readonly mediaUrl: string;
};

const navigation9Defaults = generatedDefaults("pro-block:navigation-9") as ComponentEditorContract["defaultProps"] & {
  readonly links: ReadonlyArray<Readonly<{ label: string; href: string }>>;
};

export const hero18EditorContract = {
  componentId: "RB_batch12_hero_18",
  defaultProps: hero18Defaults,
  fields: [
    { key: "heading", path: ["heading"], group: "CONTENT", label: "Heading", type: "textarea", originalValue: hero18Defaults.heading, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "description", path: ["description"], group: "CONTENT", label: "Description", type: "textarea", originalValue: hero18Defaults.description, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "primaryButtonLabel", path: ["primaryButtonLabel"], group: "ACTIONS", label: "Primary button label", type: "text", originalValue: hero18Defaults.primaryButtonLabel, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "loop", path: ["loop"], group: "MOTION", label: "Loop animation", type: "boolean", originalValue: hero18Defaults.loop, inlineEditable: false, mediaEligible: false, resettable: true },
  ],
  contentFields: ["heading", "description"],
  mediaFields: [],
  actionFields: ["primaryButtonLabel"],
  arrays: [],
  inlineFields: [
    { fieldKey: "heading", path: ["heading"], valueType: "textarea" },
    { fieldKey: "description", path: ["description"], valueType: "textarea" },
    { fieldKey: "primaryButtonLabel", path: ["primaryButtonLabel"], valueType: "text" },
  ],
} as const satisfies ComponentEditorContract;

export const cta10EditorContract = {
  componentId: "RB_batch11_cta_10",
  defaultProps: cta10Defaults,
  fields: [
    { key: "heading", path: ["heading"], group: "CONTENT", label: "Heading", type: "text", originalValue: cta10Defaults.heading, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "description", path: ["description"], group: "CONTENT", label: "Description", type: "textarea", originalValue: cta10Defaults.description, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "emailPlaceholder", path: ["emailPlaceholder"], group: "CONTENT", label: "Email placeholder", type: "text", originalValue: cta10Defaults.emailPlaceholder, inlineEditable: false, mediaEligible: false, resettable: true },
    { key: "buttonLabel", path: ["buttonLabel"], group: "ACTIONS", label: "Submit button label", type: "text", originalValue: cta10Defaults.buttonLabel, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "mediaUrl", path: ["mediaUrl"], group: "MEDIA", label: "Signup image", type: "media", originalValue: cta10Defaults.mediaUrl, inlineEditable: false, mediaEligible: true, resettable: true },
  ],
  contentFields: ["heading", "description", "emailPlaceholder"],
  mediaFields: [{ fieldKey: "mediaUrl", path: ["mediaUrl"], originalValue: cta10Defaults.mediaUrl, allowManualUrl: true, allowLibrarySelection: true, uploadSupported: false }],
  actionFields: ["buttonLabel"],
  arrays: [],
  inlineFields: [
    { fieldKey: "heading", path: ["heading"], valueType: "text" },
    { fieldKey: "description", path: ["description"], valueType: "textarea" },
    { fieldKey: "buttonLabel", path: ["buttonLabel"], valueType: "text" },
  ],
} as const satisfies ComponentEditorContract;

export const navigation9EditorContract = {
  componentId: "RB_batch11_navigation_9",
  defaultProps: navigation9Defaults,
  fields: [],
  contentFields: [],
  mediaFields: [],
  actionFields: [],
  arrays: [
    {
      key: "links",
      path: ["links"],
      group: "CONTENT",
      label: "Navigation links",
      itemLabel: "Link",
      defaultItems: navigation9Defaults.links,
      itemFields: [
        { key: "label", path: ["label"], group: "CONTENT", label: "Label", type: "text", inlineEditable: false, mediaEligible: false, resettable: true },
        { key: "href", path: ["href"], group: "ACTIONS", label: "Destination", type: "url", inlineEditable: false, mediaEligible: false, resettable: true },
      ],
    },
  ],
  inlineFields: [],
} as const satisfies ComponentEditorContract;

export const PUCK_BATCH_1_EDITOR_CONTRACTS: Readonly<Partial<Record<string, ComponentEditorContract>>> = {
  "pro-block:hero-18": hero18EditorContract,
  "pro-block:cta-10": cta10EditorContract,
  "pro-block:navigation-9": navigation9EditorContract,
};
