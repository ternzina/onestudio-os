import { PUCK_EXPANDED_REGISTRY_DATA } from "../../lib/puck-site-editor/generated-registry-data.ts";
import type {
  ComponentEditorContract,
  ProductionEditorFieldGroup,
  ProductionEditorFieldType,
  ProductionEditorPrimitive,
} from "../../lib/puck-site-editor/builder-contract.ts";

function generatedDefaults(catalogKey: string) {
  const entry = PUCK_EXPANDED_REGISTRY_DATA.find((item) => item.catalogKey === catalogKey);
  if (!entry) throw new Error(`Missing generated defaults for ${catalogKey}`);
  return entry.defaults;
}

const field = (
  key: string,
  label: string,
  type: ProductionEditorFieldType,
  group: ProductionEditorFieldGroup,
  originalValue: ProductionEditorPrimitive,
  inlineEditable = false,
  mediaEligible = false,
) => ({
  key,
  path: [key] as [string],
  group,
  label,
  type,
  originalValue,
  inlineEditable,
  mediaEligible,
  resettable: true,
});

const itemField = (
  key: string,
  label: string,
  type: ProductionEditorFieldType,
  group: ProductionEditorFieldGroup,
  inlineEditable = false,
  mediaEligible = false,
) => ({
  key,
  path: [key] as [string],
  group,
  label,
  type,
  inlineEditable,
  mediaEligible,
  resettable: true,
});

const inline = (fieldKey: string, valueType: Exclude<ProductionEditorFieldType, "media">) => ({
  fieldKey,
  path: [fieldKey] as [string],
  valueType,
});

export type Hero8Image = {
  url: string;
  aspectRatio: number;
};

const hero8GeneratedDefaults = generatedDefaults("pro-block:hero-8") as ComponentEditorContract["defaultProps"] & {
  readonly firstLeft: string;
  readonly firstRight: string;
  readonly secondLeft: string;
  readonly secondRight: string;
  readonly description: string;
};

export const hero8ContentDefaults = {
  ...hero8GeneratedDefaults,
  creatingImages: [
    { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop", aspectRatio: 2 },
    { url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=200&h=200&fit=crop", aspectRatio: 1 },
    { url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=350&h=200&fit=crop", aspectRatio: 1.75 },
    { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=200&fit=crop", aspectRatio: 1 },
  ] satisfies readonly Hero8Image[],
  buildingImages: [
    { url: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=200&h=200&fit=crop", aspectRatio: 1 },
    { url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop", aspectRatio: 2 },
    { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop", aspectRatio: 1 },
    { url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=350&h=200&fit=crop", aspectRatio: 1.75 },
  ] satisfies readonly Hero8Image[],
  creatingImageAlt: "Creating digital experiences",
  buildingImageAlt: "Building tomorrow",
  heroImageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&h=600&fit=crop",
  heroImageAlt: "Team collaboration",
} as const;

export const hero8EditorContract = {
  componentId: "RB_batch11_hero_8",
  defaultProps: hero8ContentDefaults,
  fields: [
    field("firstLeft", "First line left", "text", "CONTENT", hero8ContentDefaults.firstLeft, true),
    field("firstRight", "First line right", "text", "CONTENT", hero8ContentDefaults.firstRight, true),
    field("secondLeft", "Second line left", "text", "CONTENT", hero8ContentDefaults.secondLeft, true),
    field("secondRight", "Second line right", "text", "CONTENT", hero8ContentDefaults.secondRight, true),
    field("description", "Description", "textarea", "CONTENT", hero8ContentDefaults.description, true),
    field("creatingImageAlt", "Creating image alt text", "text", "CONTENT", hero8ContentDefaults.creatingImageAlt, true),
    field("buildingImageAlt", "Building image alt text", "text", "CONTENT", hero8ContentDefaults.buildingImageAlt, true),
    field("heroImageUrl", "Team image", "media", "MEDIA", hero8ContentDefaults.heroImageUrl, false, true),
    field("heroImageAlt", "Team image alt text", "text", "CONTENT", hero8ContentDefaults.heroImageAlt, true),
  ],
  contentFields: ["firstLeft", "firstRight", "secondLeft", "secondRight", "description", "creatingImageAlt", "buildingImageAlt", "heroImageAlt"],
  mediaFields: [{ fieldKey: "heroImageUrl", path: ["heroImageUrl"], originalValue: hero8ContentDefaults.heroImageUrl, allowManualUrl: true, allowLibrarySelection: true, uploadSupported: false }],
  actionFields: [],
  arrays: [
    {
      key: "creatingImages",
      path: ["creatingImages"],
      group: "MEDIA",
      label: "Creating images",
      itemLabel: "Creating image",
      defaultItems: hero8ContentDefaults.creatingImages,
      itemFields: [
        itemField("url", "Image", "media", "MEDIA", false, true),
      ],
    },
    {
      key: "buildingImages",
      path: ["buildingImages"],
      group: "MEDIA",
      label: "Building images",
      itemLabel: "Building image",
      defaultItems: hero8ContentDefaults.buildingImages,
      itemFields: [
        itemField("url", "Image", "media", "MEDIA", false, true),
      ],
    },
  ],
  inlineFields: [
    inline("firstLeft", "text"), inline("firstRight", "text"), inline("secondLeft", "text"), inline("secondRight", "text"),
    inline("description", "textarea"), inline("creatingImageAlt", "text"), inline("buildingImageAlt", "text"), inline("heroImageAlt", "text"),
  ],
} as const satisfies ComponentEditorContract;

export type Hero10Card = {
  rotate: number;
  translateY: number;
  src: string;
  alt: string;
};

const hero10GeneratedDefaults = generatedDefaults("pro-block:hero-10") as ComponentEditorContract["defaultProps"] & {
  readonly heading: string;
  readonly description: string;
  readonly buttonLabel: string;
};

export const hero10ContentDefaults = {
  ...hero10GeneratedDefaults,
  cards: [
    { rotate: -12, translateY: 40, src: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop", alt: "Creative technology" },
    { rotate: 0, translateY: 0, src: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=600&fit=crop", alt: "Building something new" },
    { rotate: 12, translateY: 40, src: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=600&fit=crop", alt: "Creative workspace" },
  ] satisfies readonly Hero10Card[],
} as const;

export const hero10EditorContract = {
  componentId: "RB_batch11_hero_10",
  defaultProps: hero10ContentDefaults,
  fields: [
    field("heading", "Heading", "textarea", "CONTENT", hero10ContentDefaults.heading, true),
    field("description", "Description", "textarea", "CONTENT", hero10ContentDefaults.description, true),
    field("buttonLabel", "Button label", "text", "ACTIONS", hero10ContentDefaults.buttonLabel, true),
  ],
  contentFields: ["heading", "description"],
  mediaFields: [],
  actionFields: ["buttonLabel"],
  arrays: [{
    key: "cards",
    path: ["cards"],
    group: "MEDIA",
    label: "Hero cards",
    itemLabel: "Card",
    defaultItems: hero10ContentDefaults.cards,
    itemFields: [
      itemField("src", "Image", "media", "MEDIA", false, true),
      itemField("alt", "Image alt text", "text", "CONTENT"),
    ],
  }],
  inlineFields: [inline("heading", "textarea"), inline("description", "textarea"), inline("buttonLabel", "text")],
} as const satisfies ComponentEditorContract;

export type Hero20Wordmark = { name: string; className: string };
export type Hero20Metric = { value: string; label: string };

const hero20GeneratedDefaults = generatedDefaults("pro-block:hero-20") as ComponentEditorContract["defaultProps"] & {
  readonly heading: string;
  readonly description: string;
  readonly primaryButtonLabel: string;
  readonly secondaryButtonLabel: string;
  readonly trustLabel: string;
};

export const hero20ContentDefaults = {
  ...hero20GeneratedDefaults,
  wordmarks: [
    { name: "Halcyon", className: "font-serif text-lg italic tracking-tight sm:text-xl" },
    { name: "VERTEX", className: "text-sm font-semibold tracking-[0.3em] sm:text-base" },
    { name: "loopwork", className: "text-lg font-medium tracking-tighter sm:text-xl" },
    { name: "Nimbus", className: "text-lg font-medium tracking-tight sm:text-xl" },
    { name: "FORMA", className: "text-base font-medium tracking-widest sm:text-lg" },
    { name: "arcline", className: "font-mono text-base tracking-tight sm:text-lg" },
  ] satisfies readonly Hero20Wordmark[],
  metrics: [
    { value: "4.2B", label: "Events processed daily" },
    { value: "38ms", label: "Median query time" },
    { value: "99.99%", label: "Uptime last 12 months" },
    { value: "3,100+", label: "Teams on Meridian" },
  ] satisfies readonly Hero20Metric[],
} as const;

export const hero20EditorContract = {
  componentId: "RB_batch11_hero_20",
  defaultProps: hero20ContentDefaults,
  fields: [
    field("heading", "Heading", "textarea", "CONTENT", hero20ContentDefaults.heading, true),
    field("description", "Description", "textarea", "CONTENT", hero20ContentDefaults.description, true),
    field("primaryButtonLabel", "Primary button label", "text", "ACTIONS", hero20ContentDefaults.primaryButtonLabel, true),
    field("secondaryButtonLabel", "Secondary button label", "text", "ACTIONS", hero20ContentDefaults.secondaryButtonLabel, true),
    field("trustLabel", "Trust label", "text", "CONTENT", hero20ContentDefaults.trustLabel, true),
  ],
  contentFields: ["heading", "description", "trustLabel"],
  mediaFields: [],
  actionFields: ["primaryButtonLabel", "secondaryButtonLabel"],
  arrays: [
    {
      key: "wordmarks",
      path: ["wordmarks"],
      group: "CONTENT",
      label: "Customer wordmarks",
      itemLabel: "Wordmark",
      defaultItems: hero20ContentDefaults.wordmarks,
      itemFields: [itemField("name", "Name", "text", "CONTENT")],
    },
    {
      key: "metrics",
      path: ["metrics"],
      group: "CONTENT",
      label: "Metrics",
      itemLabel: "Metric",
      defaultItems: hero20ContentDefaults.metrics,
      itemFields: [itemField("value", "Value", "text", "CONTENT"), itemField("label", "Label", "text", "CONTENT")],
    },
  ],
  inlineFields: [inline("heading", "textarea"), inline("description", "textarea"), inline("primaryButtonLabel", "text"), inline("secondaryButtonLabel", "text"), inline("trustLabel", "text")],
} as const satisfies ComponentEditorContract;

export type Cta11LedgerRow = { label: string; meta: string; amount: string; status: string };

const cta11GeneratedDefaults = generatedDefaults("pro-block:cta-11") as ComponentEditorContract["defaultProps"] & {
  readonly eyebrow: string;
  readonly heading: string;
  readonly description: string;
  readonly primaryButtonLabel: string;
  readonly secondaryButtonLabel: string;
  readonly helperText: string;
  readonly loop: boolean;
};

export const cta11ContentDefaults = {
  ...cta11GeneratedDefaults,
  primaryButtonHref: "#",
  secondaryButtonHref: "#",
  balanceLabel: "Operating balance",
  balanceCurrency: "USD",
  balanceValue: "$128,340.19",
  settledTodayLabel: "+$12,480.00 settled today",
  moveFundsLabel: "Move funds",
  ledger: [
    { label: "Stripe payout", meta: "Today · 09:41", amount: "+$12,480.00", status: "Cleared" },
    { label: "Acme Corp", meta: "Wire · Invoice #2041", amount: "+$86,200.00", status: "Pending" },
    { label: "Refund batch", meta: "14 items", amount: "−$1,240.50", status: "Posted" },
  ] satisfies readonly Cta11LedgerRow[],
} as const;

export const cta11EditorContract = {
  componentId: "RB_batch12_cta_11",
  defaultProps: cta11ContentDefaults,
  fields: [
    field("eyebrow", "Eyebrow", "text", "CONTENT", cta11ContentDefaults.eyebrow, true),
    field("heading", "Heading", "textarea", "CONTENT", cta11ContentDefaults.heading, true),
    field("description", "Description", "textarea", "CONTENT", cta11ContentDefaults.description, true),
    field("helperText", "Helper text", "text", "CONTENT", cta11ContentDefaults.helperText, true),
    field("balanceLabel", "Balance label", "text", "CONTENT", cta11ContentDefaults.balanceLabel, true),
    field("balanceCurrency", "Balance currency", "text", "CONTENT", cta11ContentDefaults.balanceCurrency, true),
    field("balanceValue", "Balance value", "text", "CONTENT", cta11ContentDefaults.balanceValue, true),
    field("settledTodayLabel", "Settled today label", "text", "CONTENT", cta11ContentDefaults.settledTodayLabel, true),
    field("moveFundsLabel", "Move funds label", "text", "CONTENT", cta11ContentDefaults.moveFundsLabel, true),
    field("primaryButtonLabel", "Primary button label", "text", "ACTIONS", cta11ContentDefaults.primaryButtonLabel, true),
    field("primaryButtonHref", "Primary button destination", "url", "ACTIONS", cta11ContentDefaults.primaryButtonHref),
    field("secondaryButtonLabel", "Secondary button label", "text", "ACTIONS", cta11ContentDefaults.secondaryButtonLabel, true),
    field("secondaryButtonHref", "Secondary button destination", "url", "ACTIONS", cta11ContentDefaults.secondaryButtonHref),
    field("loop", "Loop animation", "boolean", "MOTION", cta11ContentDefaults.loop),
  ],
  contentFields: ["eyebrow", "heading", "description", "helperText", "balanceLabel", "balanceCurrency", "balanceValue", "settledTodayLabel", "moveFundsLabel"],
  mediaFields: [],
  actionFields: ["primaryButtonLabel", "primaryButtonHref", "secondaryButtonLabel", "secondaryButtonHref"],
  arrays: [{
    key: "ledger",
    path: ["ledger"],
    group: "CONTENT",
    label: "Ledger rows",
    itemLabel: "Ledger row",
    defaultItems: cta11ContentDefaults.ledger,
    itemFields: [itemField("label", "Label", "text", "CONTENT"), itemField("meta", "Meta", "text", "CONTENT"), itemField("amount", "Amount", "text", "CONTENT"), itemField("status", "Status", "text", "CONTENT")],
  }],
  inlineFields: [inline("eyebrow", "text"), inline("heading", "textarea"), inline("description", "textarea"), inline("helperText", "text"), inline("balanceLabel", "text"), inline("balanceCurrency", "text"), inline("balanceValue", "text"), inline("settledTodayLabel", "text"), inline("moveFundsLabel", "text"), inline("primaryButtonLabel", "text"), inline("secondaryButtonLabel", "text")],
} as const satisfies ComponentEditorContract;

export type Cta14Activity = { initials: string; name: string; action: string; time: string };

const cta14GeneratedDefaults = generatedDefaults("pro-block:cta-14") as ComponentEditorContract["defaultProps"] & {
  readonly eyebrow: string;
  readonly heading: string;
  readonly description: string;
  readonly primaryButtonLabel: string;
  readonly secondaryButtonLabel: string;
  readonly helperText: string;
  readonly collaborationLabel: string;
  readonly liveLabel: string;
  readonly loop: boolean;
};

export const cta14ContentDefaults = {
  ...cta14GeneratedDefaults,
  primaryButtonHref: "#",
  secondaryButtonHref: "#",
  capabilities: [
    { label: "Presence" }, { label: "Live cursors" }, { label: "CRDT sync" }, { label: "Comments" }, { label: "Mentions" },
    { label: "Version history" }, { label: "Offline-first" }, { label: "Branching" }, { label: "Webhooks" }, { label: "Granular permissions" },
  ],
  activity: [
    { initials: "JT", name: "Jo Tan", action: "resolved 3 suggestions", time: "8m" },
    { initials: "MR", name: "Marco Ruiz", action: "commented on §4. Rollout", time: "2m" },
    { initials: "AK", name: "Ana Kim", action: "joined Pricing draft", time: "now" },
  ] satisfies readonly Cta14Activity[],
} as const;

export const cta14EditorContract = {
  componentId: "RB_batch11_cta_14",
  defaultProps: cta14ContentDefaults,
  fields: [
    field("eyebrow", "Eyebrow", "text", "CONTENT", cta14ContentDefaults.eyebrow, true),
    field("heading", "Heading", "textarea", "CONTENT", cta14ContentDefaults.heading, true),
    field("description", "Description", "textarea", "CONTENT", cta14ContentDefaults.description, true),
    field("helperText", "Helper text", "text", "CONTENT", cta14ContentDefaults.helperText, true),
    field("collaborationLabel", "Collaboration label", "text", "CONTENT", cta14ContentDefaults.collaborationLabel, true),
    field("liveLabel", "Live label", "text", "CONTENT", cta14ContentDefaults.liveLabel, true),
    field("primaryButtonLabel", "Primary button label", "text", "ACTIONS", cta14ContentDefaults.primaryButtonLabel, true),
    field("primaryButtonHref", "Primary button destination", "url", "ACTIONS", cta14ContentDefaults.primaryButtonHref),
    field("secondaryButtonLabel", "Secondary button label", "text", "ACTIONS", cta14ContentDefaults.secondaryButtonLabel, true),
    field("secondaryButtonHref", "Secondary button destination", "url", "ACTIONS", cta14ContentDefaults.secondaryButtonHref),
    field("loop", "Loop animation", "boolean", "MOTION", cta14ContentDefaults.loop),
  ],
  contentFields: ["eyebrow", "heading", "description", "helperText", "collaborationLabel", "liveLabel"],
  mediaFields: [],
  actionFields: ["primaryButtonLabel", "primaryButtonHref", "secondaryButtonLabel", "secondaryButtonHref"],
  arrays: [
    { key: "capabilities", path: ["capabilities"], group: "CONTENT", label: "Capabilities", itemLabel: "Capability", defaultItems: cta14ContentDefaults.capabilities, itemFields: [itemField("label", "Label", "text", "CONTENT")] },
    { key: "activity", path: ["activity"], group: "CONTENT", label: "Activity", itemLabel: "Activity item", defaultItems: cta14ContentDefaults.activity, itemFields: [itemField("initials", "Initials", "text", "CONTENT"), itemField("name", "Name", "text", "CONTENT"), itemField("action", "Action", "text", "CONTENT"), itemField("time", "Time", "text", "CONTENT")] },
  ],
  inlineFields: [inline("eyebrow", "text"), inline("heading", "textarea"), inline("description", "textarea"), inline("helperText", "text"), inline("collaborationLabel", "text"), inline("liveLabel", "text"), inline("primaryButtonLabel", "text"), inline("secondaryButtonLabel", "text")],
} as const satisfies ComponentEditorContract;

export type Navigation5Item = { title: string; image: string; href: string };
export type Navigation5SocialLink = { name: string; href: string };

export const navigation5ContentDefaults = {
  mainHeading: "Main Content Area",
  mainDescription: "Click the navigation at the bottom.",
  brandMessage: "This is Trok",
  contactLabel: "Let's talk",
  contactHref: "#",
  navItems: [
    { title: "Homepage", image: "/svg/placeholder.svg", href: "#" },
    { title: "About", image: "/svg/placeholder.svg", href: "#" },
    { title: "Work", image: "/svg/placeholder.svg", href: "#" },
    { title: "Contact", image: "/svg/placeholder.svg", href: "#" },
  ],
  socialLinks: [
    { name: "LinkedIn", href: "#" }, { name: "Instagram", href: "#" }, { name: "Facebook", href: "#" }, { name: "Trok on X", href: "#" },
  ],
  openMenuLabel: "Open Menu",
  closeMenuLabel: "Close Menu",
  currentPageLabel: "Home",
} as const;

export const navigation5EditorContract = {
  componentId: "RB_navigation_5",
  defaultProps: navigation5ContentDefaults,
  fields: [
    field("mainHeading", "Main heading", "text", "CONTENT", navigation5ContentDefaults.mainHeading, true),
    field("mainDescription", "Main description", "text", "CONTENT", navigation5ContentDefaults.mainDescription, true),
    field("brandMessage", "Brand message", "text", "CONTENT", navigation5ContentDefaults.brandMessage, true),
    field("currentPageLabel", "Current page label", "text", "CONTENT", navigation5ContentDefaults.currentPageLabel, true),
    field("openMenuLabel", "Open menu label", "text", "ACTIONS", navigation5ContentDefaults.openMenuLabel, true),
    field("closeMenuLabel", "Close menu label", "text", "ACTIONS", navigation5ContentDefaults.closeMenuLabel, true),
    field("contactLabel", "Contact button label", "text", "ACTIONS", navigation5ContentDefaults.contactLabel, true),
    field("contactHref", "Contact button destination", "url", "ACTIONS", navigation5ContentDefaults.contactHref),
  ],
  contentFields: ["mainHeading", "mainDescription", "brandMessage", "currentPageLabel"],
  mediaFields: [],
  actionFields: ["openMenuLabel", "closeMenuLabel", "contactLabel", "contactHref"],
  arrays: [
    { key: "navItems", path: ["navItems"], group: "CONTENT", label: "Navigation items", itemLabel: "Navigation item", defaultItems: navigation5ContentDefaults.navItems, itemFields: [itemField("title", "Title", "text", "CONTENT"), itemField("image", "Image", "media", "MEDIA", false, true), itemField("href", "Destination", "url", "ACTIONS")] },
    { key: "socialLinks", path: ["socialLinks"], group: "CONTENT", label: "Social links", itemLabel: "Social link", defaultItems: navigation5ContentDefaults.socialLinks, itemFields: [itemField("name", "Label", "text", "CONTENT"), itemField("href", "Destination", "url", "ACTIONS")] },
  ],
  inlineFields: [inline("mainHeading", "text"), inline("mainDescription", "text"), inline("brandMessage", "text"), inline("currentPageLabel", "text"), inline("openMenuLabel", "text"), inline("closeMenuLabel", "text"), inline("contactLabel", "text")],
} as const satisfies ComponentEditorContract;

export type Navigation6MenuItem = { label: string; href: string; image: string };
export type Navigation6Link = { label: string; href: string };

export const navigation6ContentDefaults = {
  logoUrl: "/mock-logos/spherule.svg",
  logoAlt: "Company logo",
  homeAriaLabel: "Home",
  logoHref: "#",
  mainNavigationLabel: "Main navigation",
  navigationMenuLabel: "Navigation menu",
  mainMenuLabel: "Main menu",
  footerNavigationLabel: "Footer navigation",
  openNavigationLabel: "Open navigation menu",
  closeNavigationLabel: "Close navigation menu",
  menuButtonLabel: "Menu",
  closeButtonLabel: "Close",
  menuItems: [
    { label: "Products", href: "#products", image: "https://images.unsplash.com/photo-1762278804698-fc25d03b69e7?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { label: "Solutions", href: "#solutions", image: "https://images.unsplash.com/photo-1762278804771-65c446b6acdb?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { label: "Resources", href: "#resources", image: "https://images.unsplash.com/photo-1762278804832-7f9b4cf3b693?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { label: "Company", href: "#company", image: "https://images.unsplash.com/photo-1762278804930-fd04fc7111c1?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { label: "Contact", href: "#contact", image: "https://images.unsplash.com/photo-1762278805645-cdcbd21c0e7f?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  ],
  topNavItems: [{ label: "About", href: "#about" }, { label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "Blog", href: "#blog" }],
  copyright: "© 2024 All rights reserved",
  technologyNote: "Built with React & Tailwind",
  footerLinks: [{ label: "Get in touch", href: "#contact" }, { label: "Careers", href: "#careers" }, { label: "Support", href: "#support" }],
} as const;

export const navigation6EditorContract = {
  componentId: "RB_batch7_navigation_6",
  defaultProps: navigation6ContentDefaults,
  fields: [
    field("logoUrl", "Logo", "media", "MEDIA", navigation6ContentDefaults.logoUrl, false, true),
    field("logoAlt", "Logo alt text", "text", "CONTENT", navigation6ContentDefaults.logoAlt, true),
    field("homeAriaLabel", "Home link label", "text", "ACTIONS", navigation6ContentDefaults.homeAriaLabel, true),
    field("logoHref", "Logo destination", "url", "ACTIONS", navigation6ContentDefaults.logoHref),
    field("mainNavigationLabel", "Main navigation label", "text", "CONTENT", navigation6ContentDefaults.mainNavigationLabel),
    field("navigationMenuLabel", "Open menu label", "text", "CONTENT", navigation6ContentDefaults.navigationMenuLabel),
    field("mainMenuLabel", "Main menu label", "text", "CONTENT", navigation6ContentDefaults.mainMenuLabel),
    field("footerNavigationLabel", "Footer navigation label", "text", "CONTENT", navigation6ContentDefaults.footerNavigationLabel),
    field("openNavigationLabel", "Open navigation action", "text", "ACTIONS", navigation6ContentDefaults.openNavigationLabel, true),
    field("closeNavigationLabel", "Close navigation action", "text", "ACTIONS", navigation6ContentDefaults.closeNavigationLabel, true),
    field("menuButtonLabel", "Menu button label", "text", "ACTIONS", navigation6ContentDefaults.menuButtonLabel, true),
    field("closeButtonLabel", "Close button label", "text", "ACTIONS", navigation6ContentDefaults.closeButtonLabel, true),
    field("copyright", "Copyright copy", "text", "CONTENT", navigation6ContentDefaults.copyright, true),
    field("technologyNote", "Technology note", "text", "CONTENT", navigation6ContentDefaults.technologyNote, true),
  ],
  contentFields: ["logoAlt", "mainNavigationLabel", "navigationMenuLabel", "mainMenuLabel", "footerNavigationLabel", "copyright", "technologyNote"],
  mediaFields: [{ fieldKey: "logoUrl", path: ["logoUrl"], originalValue: navigation6ContentDefaults.logoUrl, allowManualUrl: true, allowLibrarySelection: true, uploadSupported: false }],
  actionFields: ["logoHref", "homeAriaLabel", "openNavigationLabel", "closeNavigationLabel", "menuButtonLabel", "closeButtonLabel"],
  arrays: [
    { key: "menuItems", path: ["menuItems"], group: "CONTENT", label: "Menu items", itemLabel: "Menu item", defaultItems: navigation6ContentDefaults.menuItems, itemFields: [itemField("label", "Label", "text", "CONTENT"), itemField("href", "Destination", "url", "ACTIONS"), itemField("image", "Preview image", "media", "MEDIA", false, true)] },
    { key: "topNavItems", path: ["topNavItems"], group: "CONTENT", label: "Desktop links", itemLabel: "Desktop link", defaultItems: navigation6ContentDefaults.topNavItems, itemFields: [itemField("label", "Label", "text", "CONTENT"), itemField("href", "Destination", "url", "ACTIONS")] },
    { key: "footerLinks", path: ["footerLinks"], group: "CONTENT", label: "Footer links", itemLabel: "Footer link", defaultItems: navigation6ContentDefaults.footerLinks, itemFields: [itemField("label", "Label", "text", "CONTENT"), itemField("href", "Destination", "url", "ACTIONS")] },
  ],
  inlineFields: [inline("logoAlt", "text"), inline("openNavigationLabel", "text"), inline("closeNavigationLabel", "text"), inline("menuButtonLabel", "text"), inline("closeButtonLabel", "text"), inline("copyright", "text"), inline("technologyNote", "text")],
} as const satisfies ComponentEditorContract;

export type Navigation12Link = { label: string };

export const navigation12Links = [
  { label: "Overview" }, { label: "Product" }, { label: "Customers" }, { label: "Pricing" },
] satisfies readonly Navigation12Link[];

export const navigation12ContentDefaults = {
  links: navigation12Links,
  brandName: "Arc",
  brandHref: "#",
  primaryNavLabel: "Primary",
  mobileNavLabel: "Mobile",
  signInLabel: "Sign in",
  signInHref: "#",
  primaryActionLabel: "Start free",
  primaryActionHref: "#",
  openMenuLabel: "Open menu",
  closeMenuLabel: "Close menu",
} as const;

export const navigation12EditorContract = {
  componentId: "reactbits.navigation-12",
  defaultProps: navigation12ContentDefaults,
  fields: [
    field("brandName", "Brand name", "text", "CONTENT", navigation12ContentDefaults.brandName, true),
    field("brandHref", "Brand destination", "url", "ACTIONS", navigation12ContentDefaults.brandHref),
    field("primaryNavLabel", "Primary navigation label", "text", "CONTENT", navigation12ContentDefaults.primaryNavLabel),
    field("mobileNavLabel", "Mobile navigation label", "text", "CONTENT", navigation12ContentDefaults.mobileNavLabel),
    field("signInLabel", "Sign-in label", "text", "ACTIONS", navigation12ContentDefaults.signInLabel, true),
    field("signInHref", "Sign-in destination", "url", "ACTIONS", navigation12ContentDefaults.signInHref),
    field("primaryActionLabel", "Primary action label", "text", "ACTIONS", navigation12ContentDefaults.primaryActionLabel, true),
    field("primaryActionHref", "Primary action destination", "url", "ACTIONS", navigation12ContentDefaults.primaryActionHref),
    field("openMenuLabel", "Open menu label", "text", "ACTIONS", navigation12ContentDefaults.openMenuLabel, true),
    field("closeMenuLabel", "Close menu label", "text", "ACTIONS", navigation12ContentDefaults.closeMenuLabel, true),
  ],
  contentFields: ["brandName", "primaryNavLabel", "mobileNavLabel"],
  mediaFields: [],
  actionFields: ["brandHref", "signInLabel", "signInHref", "primaryActionLabel", "primaryActionHref", "openMenuLabel", "closeMenuLabel"],
  arrays: [{
    key: "links",
    path: ["links"],
    group: "CONTENT",
    label: "Navigation links",
    itemLabel: "Link",
    defaultItems: navigation12ContentDefaults.links,
    itemFields: [itemField("label", "Label", "text", "CONTENT")],
  }],
  inlineFields: [inline("brandName", "text"), inline("signInLabel", "text"), inline("primaryActionLabel", "text"), inline("openMenuLabel", "text"), inline("closeMenuLabel", "text")],
} as const satisfies ComponentEditorContract;

export type PuckBatch3CatalogKey =
  | "pro-block:hero-8"
  | "pro-block:hero-10"
  | "pro-block:hero-20"
  | "pro-block:cta-11"
  | "pro-block:cta-14"
  | "pro-block:navigation-5"
  | "pro-block:navigation-6"
  | "pro-block:navigation-12";

export const PUCK_BATCH_3_EDITOR_CONTRACTS: Readonly<Record<PuckBatch3CatalogKey, ComponentEditorContract>> = {
  "pro-block:hero-8": hero8EditorContract,
  "pro-block:hero-10": hero10EditorContract,
  "pro-block:hero-20": hero20EditorContract,
  "pro-block:cta-11": cta11EditorContract,
  "pro-block:cta-14": cta14EditorContract,
  "pro-block:navigation-5": navigation5EditorContract,
  "pro-block:navigation-6": navigation6EditorContract,
  "pro-block:navigation-12": navigation12EditorContract,
};
