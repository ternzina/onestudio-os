import { PUCK_EXPANDED_REGISTRY_DATA } from "../../lib/puck-site-editor/generated-registry-data.ts";
import type { ComponentEditorContract } from "../../lib/puck-site-editor/builder-contract.ts";
import { navigation13Defaults } from "./adapted/navigation-13-contract.ts";

function generatedDefaults(catalogKey: string) {
  const entry = PUCK_EXPANDED_REGISTRY_DATA.find((item) => item.catalogKey === catalogKey);
  if (!entry) throw new Error(`Missing generated defaults for ${catalogKey}`);
  return entry.defaults;
}

const hero11Defaults = generatedDefaults("pro-block:hero-11") as ComponentEditorContract["defaultProps"] & {
  readonly badge: string;
  readonly announcement: string;
  readonly heading: string;
  readonly description: string;
  readonly primaryButtonLabel: string;
  readonly secondaryButtonLabel: string;
  readonly mediaUrl: string;
};

const hero15Defaults = generatedDefaults("pro-block:hero-15") as ComponentEditorContract["defaultProps"] & {
  readonly badge: string;
  readonly heading: string;
  readonly intro: string;
  readonly description: string;
  readonly ctaLabel: string;
  readonly inputPlaceholder: string;
  readonly footer: string;
};

const cta13Defaults = generatedDefaults("pro-block:cta-13") as ComponentEditorContract["defaultProps"] & {
  readonly eyebrow: string;
  readonly headingPrefix: string;
  readonly headingEmphasis: string;
  readonly headingSuffix: string;
  readonly description: string;
  readonly buttonLabel: string;
  readonly helperText: string;
  readonly loop: boolean;
};

const navigation15Defaults = generatedDefaults("pro-block:navigation-15") as ComponentEditorContract["defaultProps"] & {
  readonly links: ReadonlyArray<Readonly<{ label: string; href: string }>>;
};

export const hero11EditorContract = {
  componentId: "RB_batch11_hero_11",
  defaultProps: hero11Defaults,
  fields: [
    { key: "badge", path: ["badge"], group: "CONTENT", label: "Badge", type: "text", originalValue: hero11Defaults.badge, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "announcement", path: ["announcement"], group: "CONTENT", label: "Announcement", type: "text", originalValue: hero11Defaults.announcement, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "heading", path: ["heading"], group: "CONTENT", label: "Heading", type: "textarea", originalValue: hero11Defaults.heading, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "description", path: ["description"], group: "CONTENT", label: "Description", type: "textarea", originalValue: hero11Defaults.description, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "primaryButtonLabel", path: ["primaryButtonLabel"], group: "ACTIONS", label: "Primary button label", type: "text", originalValue: hero11Defaults.primaryButtonLabel, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "secondaryButtonLabel", path: ["secondaryButtonLabel"], group: "ACTIONS", label: "Secondary button label", type: "text", originalValue: hero11Defaults.secondaryButtonLabel, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "mediaUrl", path: ["mediaUrl"], group: "MEDIA", label: "Product dashboard image", type: "media", originalValue: hero11Defaults.mediaUrl, inlineEditable: false, mediaEligible: true, resettable: true },
  ],
  contentFields: ["badge", "announcement", "heading", "description"],
  mediaFields: [{ fieldKey: "mediaUrl", path: ["mediaUrl"], originalValue: hero11Defaults.mediaUrl, allowManualUrl: true, allowLibrarySelection: true, uploadSupported: false }],
  actionFields: ["primaryButtonLabel", "secondaryButtonLabel"],
  arrays: [],
  inlineFields: [
    { fieldKey: "badge", path: ["badge"], valueType: "text" },
    { fieldKey: "announcement", path: ["announcement"], valueType: "text" },
    { fieldKey: "heading", path: ["heading"], valueType: "textarea" },
    { fieldKey: "description", path: ["description"], valueType: "textarea" },
    { fieldKey: "primaryButtonLabel", path: ["primaryButtonLabel"], valueType: "text" },
    { fieldKey: "secondaryButtonLabel", path: ["secondaryButtonLabel"], valueType: "text" },
  ],
} as const satisfies ComponentEditorContract;

export const hero15EditorContract = {
  componentId: "RB_batch11_hero_15",
  defaultProps: hero15Defaults,
  fields: [
    { key: "badge", path: ["badge"], group: "CONTENT", label: "Badge", type: "text", originalValue: hero15Defaults.badge, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "heading", path: ["heading"], group: "CONTENT", label: "Heading", type: "textarea", originalValue: hero15Defaults.heading, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "intro", path: ["intro"], group: "CONTENT", label: "Intro", type: "text", originalValue: hero15Defaults.intro, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "description", path: ["description"], group: "CONTENT", label: "Description", type: "textarea", originalValue: hero15Defaults.description, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "inputPlaceholder", path: ["inputPlaceholder"], group: "CONTENT", label: "Input placeholder", type: "text", originalValue: hero15Defaults.inputPlaceholder, inlineEditable: false, mediaEligible: false, resettable: true },
    { key: "footer", path: ["footer"], group: "CONTENT", label: "Footer copy", type: "text", originalValue: hero15Defaults.footer, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "ctaLabel", path: ["ctaLabel"], group: "ACTIONS", label: "CTA label", type: "text", originalValue: hero15Defaults.ctaLabel, inlineEditable: true, mediaEligible: false, resettable: true },
  ],
  contentFields: ["badge", "heading", "intro", "description", "inputPlaceholder", "footer"],
  mediaFields: [],
  actionFields: ["ctaLabel"],
  arrays: [],
  inlineFields: [
    { fieldKey: "badge", path: ["badge"], valueType: "text" },
    { fieldKey: "heading", path: ["heading"], valueType: "textarea" },
    { fieldKey: "intro", path: ["intro"], valueType: "text" },
    { fieldKey: "description", path: ["description"], valueType: "textarea" },
    { fieldKey: "footer", path: ["footer"], valueType: "text" },
    { fieldKey: "ctaLabel", path: ["ctaLabel"], valueType: "text" },
  ],
} as const satisfies ComponentEditorContract;

export const cta13EditorContract = {
  componentId: "RB_batch11_cta_13",
  defaultProps: cta13Defaults,
  fields: [
    { key: "eyebrow", path: ["eyebrow"], group: "CONTENT", label: "Eyebrow", type: "text", originalValue: cta13Defaults.eyebrow, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "headingPrefix", path: ["headingPrefix"], group: "CONTENT", label: "Heading prefix", type: "text", originalValue: cta13Defaults.headingPrefix, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "headingEmphasis", path: ["headingEmphasis"], group: "CONTENT", label: "Heading emphasis", type: "text", originalValue: cta13Defaults.headingEmphasis, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "headingSuffix", path: ["headingSuffix"], group: "CONTENT", label: "Heading suffix", type: "text", originalValue: cta13Defaults.headingSuffix, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "description", path: ["description"], group: "CONTENT", label: "Description", type: "textarea", originalValue: cta13Defaults.description, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "helperText", path: ["helperText"], group: "CONTENT", label: "Helper text", type: "text", originalValue: cta13Defaults.helperText, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "buttonLabel", path: ["buttonLabel"], group: "ACTIONS", label: "Button label", type: "text", originalValue: cta13Defaults.buttonLabel, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "loop", path: ["loop"], group: "MOTION", label: "Loop animation", type: "boolean", originalValue: cta13Defaults.loop, inlineEditable: false, mediaEligible: false, resettable: true },
  ],
  contentFields: ["eyebrow", "headingPrefix", "headingEmphasis", "headingSuffix", "description", "helperText"],
  mediaFields: [],
  actionFields: ["buttonLabel"],
  arrays: [],
  inlineFields: [
    { fieldKey: "eyebrow", path: ["eyebrow"], valueType: "text" },
    { fieldKey: "headingPrefix", path: ["headingPrefix"], valueType: "text" },
    { fieldKey: "headingEmphasis", path: ["headingEmphasis"], valueType: "text" },
    { fieldKey: "headingSuffix", path: ["headingSuffix"], valueType: "text" },
    { fieldKey: "description", path: ["description"], valueType: "textarea" },
    { fieldKey: "helperText", path: ["helperText"], valueType: "text" },
    { fieldKey: "buttonLabel", path: ["buttonLabel"], valueType: "text" },
  ],
} as const satisfies ComponentEditorContract;

export const navigation13EditorContract = {
  componentId: "RB_navigation_13",
  defaultProps: navigation13Defaults,
  fields: [
    { key: "brandName", path: ["brandName"], group: "CONTENT", label: "Brand name", type: "text", originalValue: navigation13Defaults.brandName, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "contactEyebrow", path: ["contactEyebrow"], group: "CONTENT", label: "Contact section label", type: "text", originalValue: navigation13Defaults.contactEyebrow, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "contactEmail", path: ["contactEmail"], group: "CONTENT", label: "Contact email", type: "text", originalValue: navigation13Defaults.contactEmail, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "brandHref", path: ["brandHref"], group: "ACTIONS", label: "Brand destination", type: "url", originalValue: navigation13Defaults.brandHref, inlineEditable: false, mediaEligible: false, resettable: true },
    { key: "primaryActionLabel", path: ["primaryActionLabel"], group: "ACTIONS", label: "Primary action label", type: "text", originalValue: navigation13Defaults.primaryActionLabel, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "primaryActionHref", path: ["primaryActionHref"], group: "ACTIONS", label: "Primary action destination", type: "url", originalValue: navigation13Defaults.primaryActionHref, inlineEditable: false, mediaEligible: false, resettable: true },
    { key: "secondaryActionLabel", path: ["secondaryActionLabel"], group: "ACTIONS", label: "Secondary action label", type: "text", originalValue: navigation13Defaults.secondaryActionLabel, inlineEditable: true, mediaEligible: false, resettable: true },
    { key: "secondaryActionHref", path: ["secondaryActionHref"], group: "ACTIONS", label: "Secondary action destination", type: "url", originalValue: navigation13Defaults.secondaryActionHref, inlineEditable: false, mediaEligible: false, resettable: true },
  ],
  contentFields: ["brandName", "contactEyebrow", "contactEmail"],
  mediaFields: [],
  actionFields: ["brandHref", "primaryActionLabel", "primaryActionHref", "secondaryActionLabel", "secondaryActionHref"],
  arrays: [
    {
      key: "links",
      path: ["links"],
      group: "CONTENT",
      label: "Navigation links",
      itemLabel: "Link",
      defaultItems: navigation13Defaults.links,
      itemFields: [
        { key: "label", path: ["label"], group: "CONTENT", label: "Label", type: "text", inlineEditable: false, mediaEligible: false, resettable: true },
        { key: "href", path: ["href"], group: "ACTIONS", label: "Destination", type: "url", inlineEditable: false, mediaEligible: false, resettable: true },
      ],
    },
  ],
  inlineFields: [
    { fieldKey: "brandName", path: ["brandName"], valueType: "text" },
    { fieldKey: "contactEyebrow", path: ["contactEyebrow"], valueType: "text" },
    { fieldKey: "contactEmail", path: ["contactEmail"], valueType: "text" },
    { fieldKey: "primaryActionLabel", path: ["primaryActionLabel"], valueType: "text" },
    { fieldKey: "secondaryActionLabel", path: ["secondaryActionLabel"], valueType: "text" },
  ],
} as const satisfies ComponentEditorContract;

export const navigation15EditorContract = {
  componentId: "RB_batch11_navigation_15",
  defaultProps: navigation15Defaults,
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
      defaultItems: navigation15Defaults.links,
      itemFields: [
        { key: "label", path: ["label"], group: "CONTENT", label: "Label", type: "text", inlineEditable: false, mediaEligible: false, resettable: true },
        { key: "href", path: ["href"], group: "ACTIONS", label: "Destination", type: "url", inlineEditable: false, mediaEligible: false, resettable: true },
      ],
    },
  ],
  inlineFields: [],
} as const satisfies ComponentEditorContract;

export const PUCK_BATCH_2_EDITOR_CONTRACTS: Readonly<Partial<Record<string, ComponentEditorContract>>> = {
  "pro-block:hero-11": hero11EditorContract,
  "pro-block:hero-15": hero15EditorContract,
  "pro-block:cta-13": cta13EditorContract,
  "pro-block:navigation-13": navigation13EditorContract,
  "pro-block:navigation-15": navigation15EditorContract,
};
