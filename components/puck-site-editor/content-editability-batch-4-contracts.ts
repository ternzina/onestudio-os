import { PUCK_EXPANDED_REGISTRY_DATA } from "../../lib/puck-site-editor/generated-registry-data.ts";
import type {
  ComponentEditorContract,
  ProductionEditorArrayItemField,
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
  min?: number,
  max?: number,
) => ({
  key,
  path: [key] as [string],
  group,
  label,
  type,
  originalValue,
  ...(min !== undefined ? { min } : {}),
  ...(max !== undefined ? { max } : {}),
  inlineEditable,
  mediaEligible,
  resettable: true,
});

const itemField = (
  key: string,
  label: string,
  type: ProductionEditorFieldType,
  group: ProductionEditorFieldGroup,
  mediaEligible = false,
  options?: readonly { value: string; label: string }[],
): ProductionEditorArrayItemField => ({
  key,
  path: [key] as [string],
  group,
  label,
  type,
  ...(options ? { options } : {}),
  inlineEditable: false,
  mediaEligible,
  resettable: true,
});

const inline = (fieldKey: string, valueType: Exclude<ProductionEditorFieldType, "media">) => ({
  fieldKey,
  path: [fieldKey] as [string],
  valueType,
});

const media = (fieldKey: string, originalValue: string) => ({
  fieldKey,
  path: [fieldKey] as [string],
  originalValue,
  allowManualUrl: true,
  allowLibrarySelection: true,
  uploadSupported: false,
} as const);

export const hero16ContentDefaults = {
  logoUrl: "/mock-logos/biosynthesis.svg",
  logoAlt: "Biosynthesis",
  headingLine1: "Pioneering the next",
  headingLine2: "era of precision",
  headingLine3: "therapeutics.",
  description: "We decode complex biology with genomics, chemistry, and AI for next-generation therapeutic discovery.",
  primaryButtonLabel: "Discover our platform",
  primaryButtonHref: "#",
  secondaryButtonHref: "#",
} as const;

export const hero16EditorContract = {
  componentId: "RB_hero_16",
  defaultProps: hero16ContentDefaults,
  fields: [
    field("logoUrl", "Logo", "media", "MEDIA", hero16ContentDefaults.logoUrl, false, true),
    field("logoAlt", "Logo alt text", "text", "CONTENT", hero16ContentDefaults.logoAlt, true),
    field("headingLine1", "Heading line 1", "text", "CONTENT", hero16ContentDefaults.headingLine1, true),
    field("headingLine2", "Heading line 2", "text", "CONTENT", hero16ContentDefaults.headingLine2, true),
    field("headingLine3", "Heading line 3", "text", "CONTENT", hero16ContentDefaults.headingLine3, true),
    field("description", "Description", "textarea", "CONTENT", hero16ContentDefaults.description, true),
    field("primaryButtonLabel", "Primary action label", "text", "ACTIONS", hero16ContentDefaults.primaryButtonLabel, true),
    field("primaryButtonHref", "Primary action destination", "url", "ACTIONS", hero16ContentDefaults.primaryButtonHref),
    field("secondaryButtonHref", "Arrow action destination", "url", "ACTIONS", hero16ContentDefaults.secondaryButtonHref),
  ],
  contentFields: ["logoAlt", "headingLine1", "headingLine2", "headingLine3", "description"],
  mediaFields: [media("logoUrl", hero16ContentDefaults.logoUrl)],
  actionFields: ["primaryButtonLabel", "primaryButtonHref", "secondaryButtonHref"],
  arrays: [],
  inlineFields: [
    inline("logoAlt", "text"),
    inline("headingLine1", "text"),
    inline("headingLine2", "text"),
    inline("headingLine3", "text"),
    inline("description", "textarea"),
    inline("primaryButtonLabel", "text"),
  ],
} as const satisfies ComponentEditorContract;

export type Hero17Image = { src: string; alt: string };

export const hero17ContentDefaults = {
  badge: "Free shipping this week",
  headingLine1: "Daily rituals for deeper",
  headingLine2: "focus and calmer mornings.",
  description: "A small-batch tea, a hand-poured candle, and a linen-bound journal, crafted to slow your pace and make space for what actually matters.",
  buttonLabel: "Shop the Ritual Set",
  heroImageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1200&h=750&fit=crop",
  heroImageAlt: "Morning ritual setup",
  gallery: [
    {
      src: "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=400&h=400&fit=crop",
      alt: "Hand-poured candle",
    },
    {
      src: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop",
      alt: "Small-batch tea",
    },
    {
      src: "https://images.unsplash.com/photo-1517971071642-34a2d3ecc9cd?w=400&h=400&fit=crop",
      alt: "Linen-bound journal",
    },
  ] satisfies readonly Hero17Image[],
} as const;

export const hero17EditorContract = {
  componentId: "RB_batch9_hero_17",
  defaultProps: hero17ContentDefaults,
  fields: [
    field("badge", "Badge", "text", "CONTENT", hero17ContentDefaults.badge, true),
    field("headingLine1", "Heading line 1", "text", "CONTENT", hero17ContentDefaults.headingLine1, true),
    field("headingLine2", "Heading line 2", "text", "CONTENT", hero17ContentDefaults.headingLine2, true),
    field("description", "Description", "textarea", "CONTENT", hero17ContentDefaults.description, true),
    field("buttonLabel", "Button label", "text", "ACTIONS", hero17ContentDefaults.buttonLabel, true),
    field("heroImageUrl", "Hero image", "media", "MEDIA", hero17ContentDefaults.heroImageUrl, false, true),
    field("heroImageAlt", "Hero image alt text", "text", "CONTENT", hero17ContentDefaults.heroImageAlt, true),
  ],
  contentFields: ["badge", "headingLine1", "headingLine2", "description", "heroImageAlt"],
  mediaFields: [media("heroImageUrl", hero17ContentDefaults.heroImageUrl)],
  actionFields: ["buttonLabel"],
  arrays: [{
    key: "gallery",
    path: ["gallery"],
    group: "MEDIA",
    label: "Gallery images",
    itemLabel: "Gallery image",
    defaultItems: hero17ContentDefaults.gallery,
    itemFields: [
      itemField("src", "Image", "media", "MEDIA", true),
      itemField("alt", "Image alt text", "text", "CONTENT"),
    ],
  }],
  inlineFields: [
    inline("badge", "text"),
    inline("headingLine1", "text"),
    inline("headingLine2", "text"),
    inline("description", "textarea"),
    inline("buttonLabel", "text"),
    inline("heroImageAlt", "text"),
  ],
} as const satisfies ComponentEditorContract;

export type Hero19Invoice = {
  initials: string;
  name: string;
  terms: string;
  status: string;
};

export const hero19ContentDefaults = {
  eyebrow: "Quoting · Billing · Recognition",
  heading: "Billing that keeps pace with your deals.",
  description: "Ledgerline turns signed contracts into schedules, invoices, and clean recognition entries: no spreadsheets in between, no month-end surprises.",
  primaryButtonLabel: "Book a demo",
  secondaryButtonLabel: "Take the tour",
  securityTrustLabel: "SOC 2 Type II",
  launchTrustLabel: "Live in 14 days",
  billingRunLabel: "March billing run",
  billingRunMeta: "142 invoices · closes in 4 days",
  billingStatusLabel: "On track",
  recognizedLabel: "Recognized this quarter",
  recognizedValue: "$412,900",
  recognizedPercent: 78,
  recognizedPlanLabel: "of plan · ASC 606 aligned",
  paymentReceivedLabel: "Payment received",
  paymentReceivedDetail: "$18,400 · Aurora Systems",
  approvalCompleteLabel: "Approval complete",
  approvalCompleteDetail: "Dana signed Q2 pricing",
  invoices: [
    { initials: "AS", name: "Aurora Systems", terms: "Net 30 · $18,400", status: "Collected" },
    { initials: "BL", name: "Beacon Labs", terms: "Net 45 · $9,850", status: "Scheduled" },
    { initials: "CP", name: "Copperline", terms: "Milestone · $27,300", status: "In review" },
  ] satisfies readonly Hero19Invoice[],
} as const;

export const hero19EditorContract = {
  componentId: "RB_batch9_hero_19",
  defaultProps: hero19ContentDefaults,
  fields: [
    field("eyebrow", "Eyebrow", "text", "CONTENT", hero19ContentDefaults.eyebrow, true),
    field("heading", "Heading", "textarea", "CONTENT", hero19ContentDefaults.heading, true),
    field("description", "Description", "textarea", "CONTENT", hero19ContentDefaults.description, true),
    field("primaryButtonLabel", "Primary button label", "text", "ACTIONS", hero19ContentDefaults.primaryButtonLabel, true),
    field("secondaryButtonLabel", "Secondary button label", "text", "ACTIONS", hero19ContentDefaults.secondaryButtonLabel, true),
    field("securityTrustLabel", "Security trust label", "text", "CONTENT", hero19ContentDefaults.securityTrustLabel, true),
    field("launchTrustLabel", "Launch trust label", "text", "CONTENT", hero19ContentDefaults.launchTrustLabel, true),
    field("billingRunLabel", "Billing run label", "text", "CONTENT", hero19ContentDefaults.billingRunLabel, true),
    field("billingRunMeta", "Billing run detail", "text", "CONTENT", hero19ContentDefaults.billingRunMeta, true),
    field("billingStatusLabel", "Billing status", "text", "CONTENT", hero19ContentDefaults.billingStatusLabel, true),
    field("recognizedLabel", "Recognized amount label", "text", "CONTENT", hero19ContentDefaults.recognizedLabel, true),
    field("recognizedValue", "Recognized amount", "text", "CONTENT", hero19ContentDefaults.recognizedValue, true),
    field("recognizedPercent", "Recognized percentage", "number", "CONTENT", hero19ContentDefaults.recognizedPercent, false, false, 0, 100),
    field("recognizedPlanLabel", "Plan detail", "text", "CONTENT", hero19ContentDefaults.recognizedPlanLabel, true),
    field("paymentReceivedLabel", "Payment notice", "text", "CONTENT", hero19ContentDefaults.paymentReceivedLabel, true),
    field("paymentReceivedDetail", "Payment notice detail", "text", "CONTENT", hero19ContentDefaults.paymentReceivedDetail, true),
    field("approvalCompleteLabel", "Approval notice", "text", "CONTENT", hero19ContentDefaults.approvalCompleteLabel, true),
    field("approvalCompleteDetail", "Approval notice detail", "text", "CONTENT", hero19ContentDefaults.approvalCompleteDetail, true),
  ],
  contentFields: [
    "eyebrow", "heading", "description", "securityTrustLabel", "launchTrustLabel",
    "billingRunLabel", "billingRunMeta", "billingStatusLabel", "recognizedLabel",
    "recognizedValue", "recognizedPercent", "recognizedPlanLabel", "paymentReceivedLabel",
    "paymentReceivedDetail", "approvalCompleteLabel", "approvalCompleteDetail",
  ],
  mediaFields: [],
  actionFields: ["primaryButtonLabel", "secondaryButtonLabel"],
  arrays: [{
    key: "invoices",
    path: ["invoices"],
    group: "CONTENT",
    label: "Invoice rows",
    itemLabel: "Invoice row",
    identityKey: "name",
    defaultItems: hero19ContentDefaults.invoices,
    itemFields: [
      itemField("initials", "Initials", "text", "CONTENT"),
      itemField("name", "Name", "text", "CONTENT"),
      itemField("terms", "Terms", "text", "CONTENT"),
      itemField("status", "Status", "text", "CONTENT"),
    ],
  }],
  inlineFields: [
    inline("eyebrow", "text"),
    inline("heading", "textarea"),
    inline("description", "textarea"),
    inline("primaryButtonLabel", "text"),
    inline("secondaryButtonLabel", "text"),
    inline("securityTrustLabel", "text"),
    inline("launchTrustLabel", "text"),
    inline("billingRunLabel", "text"),
    inline("billingRunMeta", "text"),
    inline("billingStatusLabel", "text"),
    inline("recognizedLabel", "text"),
    inline("recognizedValue", "text"),
    inline("recognizedPlanLabel", "text"),
    inline("paymentReceivedLabel", "text"),
    inline("paymentReceivedDetail", "text"),
    inline("approvalCompleteLabel", "text"),
    inline("approvalCompleteDetail", "text"),
  ],
} as const satisfies ComponentEditorContract;

const cta8GeneratedDefaults = generatedDefaults("pro-block:cta-8") as ComponentEditorContract["defaultProps"] & {
  readonly buttonLabel: string;
  readonly trialLabel: string;
  readonly word: string;
};

export const cta8EditorContract = {
  componentId: "RB_batch9_cta_8",
  defaultProps: cta8GeneratedDefaults,
  fields: [
    field("buttonLabel", "Button label", "text", "ACTIONS", cta8GeneratedDefaults.buttonLabel, true),
    field("trialLabel", "Trial helper text", "text", "CONTENT", cta8GeneratedDefaults.trialLabel, true),
    field("word", "Background word", "text", "CONTENT", cta8GeneratedDefaults.word, true),
  ],
  contentFields: ["trialLabel", "word"],
  mediaFields: [],
  actionFields: ["buttonLabel"],
  arrays: [],
  inlineFields: [inline("buttonLabel", "text"), inline("trialLabel", "text"), inline("word", "text")],
} as const satisfies ComponentEditorContract;

export const cta9ContentDefaults = {
  heading: "Ready to make the switch?",
  description: "Bring your workspace over in minutes — we’ll handle the heavy lifting.",
  buttonLabel: "Request a free migration",
  leftCardImage: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=600&auto=format&fit=crop",
  leftCardHeadline: "Sue · 12 Highlights",
  leftCardMeta: "Product research",
  rightCardContext: "Template · Onboarding recap",
  rightCardTitle: "Summary",
  rightCardDescription: "The team walked through the new workspace rollout, flagged two blockers for the import tool, and agreed on a lighter-touch review cadence for the next sprint…",
} as const;

export const cta9EditorContract = {
  componentId: "reactbits.cta-9",
  defaultProps: cta9ContentDefaults,
  fields: [
    field("heading", "Heading", "textarea", "CONTENT", cta9ContentDefaults.heading, true),
    field("description", "Description", "textarea", "CONTENT", cta9ContentDefaults.description, true),
    field("buttonLabel", "Button label", "text", "ACTIONS", cta9ContentDefaults.buttonLabel, true),
    field("leftCardImage", "Side card image", "media", "MEDIA", cta9ContentDefaults.leftCardImage, false, true),
    field("leftCardHeadline", "Side card headline", "text", "CONTENT", cta9ContentDefaults.leftCardHeadline, true),
    field("leftCardMeta", "Side card detail", "text", "CONTENT", cta9ContentDefaults.leftCardMeta, true),
    field("rightCardContext", "Summary card context", "text", "CONTENT", cta9ContentDefaults.rightCardContext, true),
    field("rightCardTitle", "Summary card title", "text", "CONTENT", cta9ContentDefaults.rightCardTitle, true),
    field("rightCardDescription", "Summary card description", "textarea", "CONTENT", cta9ContentDefaults.rightCardDescription, true),
  ],
  contentFields: ["heading", "description", "leftCardHeadline", "leftCardMeta", "rightCardContext", "rightCardTitle", "rightCardDescription"],
  mediaFields: [media("leftCardImage", cta9ContentDefaults.leftCardImage)],
  actionFields: ["buttonLabel"],
  arrays: [],
  inlineFields: [
    inline("heading", "textarea"),
    inline("description", "textarea"),
    inline("buttonLabel", "text"),
    inline("leftCardHeadline", "text"),
    inline("leftCardMeta", "text"),
    inline("rightCardContext", "text"),
    inline("rightCardTitle", "text"),
    inline("rightCardDescription", "textarea"),
  ],
} as const satisfies ComponentEditorContract;

export type Navigation4Item = {
  iconToken: "home" | "works" | "profile" | "contact";
  label: string;
  href: string;
};

const navigation4IconOptions = [
  { value: "home", label: "Home icon" },
  { value: "works", label: "Works icon" },
  { value: "profile", label: "Profile icon" },
  { value: "contact", label: "Contact icon" },
] as const;

export const navigation4ContentDefaults = {
  mobileBrandLine1: "Brand",
  mobileBrandLine2: "Appart",
  desktopBrandLine1: "Build",
  desktopBrandLine2: "Better",
  openMenuLabel: "Open menu",
  closeMenuLabel: "Close menu",
  navItems: [
    { iconToken: "home", label: "Home", href: "#" },
    { iconToken: "works", label: "Works", href: "#" },
    { iconToken: "profile", label: "Profile", href: "#" },
    { iconToken: "contact", label: "Contact", href: "#" },
  ] satisfies readonly Navigation4Item[],
} as const;

export const navigation4EditorContract = {
  componentId: "RB_batch7_navigation_4",
  defaultProps: navigation4ContentDefaults,
  fields: [
    field("mobileBrandLine1", "Mobile brand line 1", "text", "CONTENT", navigation4ContentDefaults.mobileBrandLine1, true),
    field("mobileBrandLine2", "Mobile brand line 2", "text", "CONTENT", navigation4ContentDefaults.mobileBrandLine2, true),
    field("desktopBrandLine1", "Desktop brand line 1", "text", "CONTENT", navigation4ContentDefaults.desktopBrandLine1, true),
    field("desktopBrandLine2", "Desktop brand line 2", "text", "CONTENT", navigation4ContentDefaults.desktopBrandLine2, true),
    field("openMenuLabel", "Open menu label", "text", "ACTIONS", navigation4ContentDefaults.openMenuLabel, true),
    field("closeMenuLabel", "Close menu label", "text", "ACTIONS", navigation4ContentDefaults.closeMenuLabel, true),
  ],
  contentFields: ["mobileBrandLine1", "mobileBrandLine2", "desktopBrandLine1", "desktopBrandLine2"],
  mediaFields: [],
  actionFields: ["openMenuLabel", "closeMenuLabel"],
  arrays: [{
    key: "navItems",
    path: ["navItems"],
    group: "CONTENT",
    label: "Navigation items",
    itemLabel: "Navigation item",
    identityKey: "label",
    defaultItems: navigation4ContentDefaults.navItems,
    itemFields: [
      itemField("iconToken", "Icon", "select", "CONTENT", false, navigation4IconOptions),
      itemField("label", "Label", "text", "CONTENT"),
      itemField("href", "Destination", "url", "ACTIONS"),
    ],
  }],
  inlineFields: [
    inline("mobileBrandLine1", "text"),
    inline("mobileBrandLine2", "text"),
    inline("desktopBrandLine1", "text"),
    inline("desktopBrandLine2", "text"),
    inline("openMenuLabel", "text"),
    inline("closeMenuLabel", "text"),
  ],
} as const satisfies ComponentEditorContract;

export type Navigation11SectionGroup = { label: string; heading: string };
export type Navigation11Card = { sectionLabel: string; title: string; desc: string; img: string; href: string };
export type Navigation11FooterLink = { label: string; href: string };

export const navigation11ContentDefaults = {
  brandName: "northwind",
  loginLabel: "Login",
  loginHref: "#",
  primaryActionLabel: "Start Testing",
  primaryActionHref: "#",
  openMenuLabel: "Open menu",
  closeMenuLabel: "Close menu",
  sectionGroups: [
    { label: "Overview", heading: "Overview" },
    { label: "Stories", heading: "Stories" },
    { label: "Our Why", heading: "Our Why" },
    { label: "FAQs", heading: "FAQs" },
  ] satisfies readonly Navigation11SectionGroup[],
  cards: [
    { sectionLabel: "Overview", title: "100+ Lab Tests", desc: "A full panel reviewed by clinicians, refreshed every six months.", img: "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=800&auto=format&fit=crop", href: "#" },
    { sectionLabel: "Overview", title: "Member Portal", desc: "Track trends, flag changes, and annotate results over time.", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop", href: "#" },
    { sectionLabel: "Overview", title: "Coaching Calls", desc: "Quarterly sessions with a health coach matched to your goals.", img: "https://images.unsplash.com/photo-1573497491208-6b1acb260507?q=80&w=800&auto=format&fit=crop", href: "#" },
    { sectionLabel: "Overview", title: "Preventive Plans", desc: "Clear next steps tailored to what your numbers are saying.", img: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800&auto=format&fit=crop", href: "#" },
    { sectionLabel: "Stories", title: "From burnt out to steady", desc: "How Ana rebuilt her energy in six months of steady check-ins.", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop", href: "#" },
    { sectionLabel: "Stories", title: "A founder's reset", desc: "Marcus on stopping the grind long enough to read his own labs.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop", href: "#" },
    { sectionLabel: "Stories", title: "Finding the small flag", desc: "Why Priya credits Northwind with catching a marker early.", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop", href: "#" },
    { sectionLabel: "Stories", title: "Back to the trails", desc: "Dan's return to weekly 10ks after a year of chasing sleep.", img: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800&auto=format&fit=crop", href: "#" },
    { sectionLabel: "Our Why", title: "Quiet medicine", desc: "We believe in care that listens longer than it prescribes.", img: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=800&auto=format&fit=crop", href: "#" },
    { sectionLabel: "Our Why", title: "Whole-body view", desc: "One panel, read together, not scattered across specialists.", img: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=800&auto=format&fit=crop", href: "#" },
    { sectionLabel: "Our Why", title: "Research first", desc: "Peer-reviewed signals over whatever is loud this week.", img: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=800&auto=format&fit=crop", href: "#" },
    { sectionLabel: "Our Why", title: "Built to last", desc: "A practice you stay with, not a subscription you churn from.", img: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?q=80&w=800&auto=format&fit=crop", href: "#" },
    { sectionLabel: "FAQs", title: "How does billing work?", desc: "Monthly or annual, cancel anytime, no prorated surprises.", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop", href: "#" },
    { sectionLabel: "FAQs", title: "Who reads my results?", desc: "A licensed clinician on the Northwind team, not a model.", img: "https://images.unsplash.com/photo-1550831107-1553da8c8464?q=80&w=800&auto=format&fit=crop", href: "#" },
    { sectionLabel: "FAQs", title: "Does this replace doctors?", desc: "No. We're the panel between your annual visits.", img: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800&auto=format&fit=crop", href: "#" },
    { sectionLabel: "FAQs", title: "Where is testing done?", desc: "At accredited partner labs in all 50 states.", img: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=800&auto=format&fit=crop", href: "#" },
  ] satisfies readonly Navigation11Card[],
  footerPartnerLinks: [
    { label: "World's Healthiest", href: "#" },
    { label: "The Founder Health Coalition", href: "#" },
  ] satisfies readonly Navigation11FooterLink[],
  footerLegalLinks: [
    { label: "Privacy Policy", href: "#" },
    { label: "Informed Medical Consent", href: "#" },
    { label: "Terms & Conditions", href: "#" },
  ] satisfies readonly Navigation11FooterLink[],
} as const;

export const navigation11EditorContract = {
  componentId: "RB_batch11_navigation_11",
  defaultProps: navigation11ContentDefaults,
  fields: [
    field("brandName", "Brand name", "text", "CONTENT", navigation11ContentDefaults.brandName, true),
    field("loginLabel", "Login label", "text", "ACTIONS", navigation11ContentDefaults.loginLabel, true),
    field("loginHref", "Login destination", "url", "ACTIONS", navigation11ContentDefaults.loginHref),
    field("primaryActionLabel", "Primary action label", "text", "ACTIONS", navigation11ContentDefaults.primaryActionLabel, true),
    field("primaryActionHref", "Primary action destination", "url", "ACTIONS", navigation11ContentDefaults.primaryActionHref),
    field("openMenuLabel", "Open menu label", "text", "ACTIONS", navigation11ContentDefaults.openMenuLabel, true),
    field("closeMenuLabel", "Close menu label", "text", "ACTIONS", navigation11ContentDefaults.closeMenuLabel, true),
  ],
  contentFields: ["brandName"],
  mediaFields: [],
  actionFields: ["loginLabel", "loginHref", "primaryActionLabel", "primaryActionHref", "openMenuLabel", "closeMenuLabel"],
  arrays: [
    {
      key: "sectionGroups",
      path: ["sectionGroups"],
      group: "CONTENT",
      label: "Menu sections",
      itemLabel: "Menu section",
      identityKey: "label",
      defaultItems: navigation11ContentDefaults.sectionGroups,
      itemFields: [itemField("label", "Menu label", "text", "CONTENT"), itemField("heading", "Panel heading", "text", "CONTENT")],
    },
    {
      key: "cards",
      path: ["cards"],
      group: "CONTENT",
      label: "Menu cards",
      itemLabel: "Menu card",
      identityKey: "title",
      defaultItems: navigation11ContentDefaults.cards,
      itemFields: [
        itemField("sectionLabel", "Section", "text", "CONTENT"),
        itemField("title", "Title", "text", "CONTENT"),
        itemField("desc", "Description", "textarea", "CONTENT"),
        itemField("img", "Image", "media", "MEDIA", true),
        itemField("href", "Destination", "url", "ACTIONS"),
      ],
    },
    {
      key: "footerPartnerLinks",
      path: ["footerPartnerLinks"],
      group: "CONTENT",
      label: "Partner footer links",
      itemLabel: "Partner link",
      defaultItems: navigation11ContentDefaults.footerPartnerLinks,
      itemFields: [itemField("label", "Label", "text", "CONTENT"), itemField("href", "Destination", "url", "ACTIONS")],
    },
    {
      key: "footerLegalLinks",
      path: ["footerLegalLinks"],
      group: "CONTENT",
      label: "Legal footer links",
      itemLabel: "Legal link",
      defaultItems: navigation11ContentDefaults.footerLegalLinks,
      itemFields: [itemField("label", "Label", "text", "CONTENT"), itemField("href", "Destination", "url", "ACTIONS")],
    },
  ],
  inlineFields: [
    inline("brandName", "text"),
    inline("loginLabel", "text"),
    inline("primaryActionLabel", "text"),
    inline("openMenuLabel", "text"),
    inline("closeMenuLabel", "text"),
  ],
} as const satisfies ComponentEditorContract;

export type Navigation14SectionGroup = {
  label: string;
  featuredTag: string;
  featuredTitle: string;
  featuredDescription: string;
  featuredHref: string;
};
export type Navigation14Item = {
  sectionLabel: string;
  iconToken: "dashboard" | "log" | "radar" | "trend" | "workflow" | "compass" | "book" | "file" | "chart";
  title: string;
  description: string;
  href: string;
};

const navigation14IconOptions = [
  { value: "dashboard", label: "Dashboard icon" },
  { value: "log", label: "Log icon" },
  { value: "radar", label: "Radar icon" },
  { value: "trend", label: "Trend icon" },
  { value: "workflow", label: "Workflow icon" },
  { value: "compass", label: "Compass icon" },
  { value: "book", label: "Book icon" },
  { value: "file", label: "File icon" },
  { value: "chart", label: "Chart icon" },
] as const;

export const navigation14ContentDefaults = {
  brandName: "Vault",
  brandHref: "#",
  pricingLabel: "Pricing",
  pricingHref: "#",
  loginLabel: "Log in",
  loginHref: "#",
  primaryActionLabel: "Request access",
  primaryActionHref: "#",
  openMenuLabel: "Open menu",
  closeMenuLabel: "Close menu",
  learnMoreLabel: "Learn more",
  sectionGroups: [
    { label: "Product", featuredTag: "New", featuredTitle: "Vault Signals is GA", featuredDescription: "Cluster feedback from 40+ sources into themes your roadmap can act on.", featuredHref: "#" },
    { label: "Solutions", featuredTag: "Case study", featuredTitle: "How Relay cut churn 18%", featuredDescription: "Six months of Vault reviews distilled into one retention play.", featuredHref: "#" },
    { label: "Resources", featuredTag: "Guide", featuredTitle: "The customer evidence stack", featuredDescription: "A field guide to instrumenting decisions, not just dashboards.", featuredHref: "#" },
  ] satisfies readonly Navigation14SectionGroup[],
  items: [
    { sectionLabel: "Product", iconToken: "dashboard", title: "Command center", description: "One operating view for every launch, owner, and deadline.", href: "#" },
    { sectionLabel: "Product", iconToken: "log", title: "Decision logs", description: "Turn scattered updates into a searchable product memory.", href: "#" },
    { sectionLabel: "Product", iconToken: "radar", title: "Signal review", description: "Rank feedback by source, volume, and revenue at stake.", href: "#" },
    { sectionLabel: "Solutions", iconToken: "trend", title: "For growth teams", description: "Catch conversion blockers before they cost you a quarter.", href: "#" },
    { sectionLabel: "Solutions", iconToken: "workflow", title: "For operations", description: "Keep approvals, owners, and risk visible across workstreams.", href: "#" },
    { sectionLabel: "Solutions", iconToken: "compass", title: "For founders", description: "Bring customer evidence into every roadmap and revenue call.", href: "#" },
    { sectionLabel: "Resources", iconToken: "book", title: "Field notes", description: "Practical breakdowns from teams shipping complex products.", href: "#" },
    { sectionLabel: "Resources", iconToken: "file", title: "Playbooks", description: "Templates for launches, research reviews, and postmortems.", href: "#" },
    { sectionLabel: "Resources", iconToken: "chart", title: "Benchmarks", description: "How 400 teams structure customer intelligence at scale.", href: "#" },
  ] satisfies readonly Navigation14Item[],
} as const;

export const navigation14EditorContract = {
  componentId: "RB_batch11_navigation_14",
  defaultProps: navigation14ContentDefaults,
  fields: [
    field("brandName", "Brand name", "text", "CONTENT", navigation14ContentDefaults.brandName, true),
    field("brandHref", "Brand destination", "url", "ACTIONS", navigation14ContentDefaults.brandHref),
    field("pricingLabel", "Pricing label", "text", "ACTIONS", navigation14ContentDefaults.pricingLabel, true),
    field("pricingHref", "Pricing destination", "url", "ACTIONS", navigation14ContentDefaults.pricingHref),
    field("loginLabel", "Login label", "text", "ACTIONS", navigation14ContentDefaults.loginLabel, true),
    field("loginHref", "Login destination", "url", "ACTIONS", navigation14ContentDefaults.loginHref),
    field("primaryActionLabel", "Primary action label", "text", "ACTIONS", navigation14ContentDefaults.primaryActionLabel, true),
    field("primaryActionHref", "Primary action destination", "url", "ACTIONS", navigation14ContentDefaults.primaryActionHref),
    field("openMenuLabel", "Open menu label", "text", "ACTIONS", navigation14ContentDefaults.openMenuLabel, true),
    field("closeMenuLabel", "Close menu label", "text", "ACTIONS", navigation14ContentDefaults.closeMenuLabel, true),
    field("learnMoreLabel", "Featured link label", "text", "ACTIONS", navigation14ContentDefaults.learnMoreLabel, true),
  ],
  contentFields: ["brandName"],
  mediaFields: [],
  actionFields: ["brandHref", "pricingLabel", "pricingHref", "loginLabel", "loginHref", "primaryActionLabel", "primaryActionHref", "openMenuLabel", "closeMenuLabel", "learnMoreLabel"],
  arrays: [
    {
      key: "sectionGroups",
      path: ["sectionGroups"],
      group: "CONTENT",
      label: "Mega-menu sections",
      itemLabel: "Mega-menu section",
      identityKey: "label",
      defaultItems: navigation14ContentDefaults.sectionGroups,
      itemFields: [
        itemField("label", "Menu label", "text", "CONTENT"),
        itemField("featuredTag", "Featured tag", "text", "CONTENT"),
        itemField("featuredTitle", "Featured title", "text", "CONTENT"),
        itemField("featuredDescription", "Featured description", "textarea", "CONTENT"),
        itemField("featuredHref", "Featured destination", "url", "ACTIONS"),
      ],
    },
    {
      key: "items",
      path: ["items"],
      group: "CONTENT",
      label: "Mega-menu links",
      itemLabel: "Mega-menu link",
      identityKey: "title",
      defaultItems: navigation14ContentDefaults.items,
      itemFields: [
        itemField("sectionLabel", "Section", "text", "CONTENT"),
        itemField("iconToken", "Icon", "select", "CONTENT", false, navigation14IconOptions),
        itemField("title", "Title", "text", "CONTENT"),
        itemField("description", "Description", "textarea", "CONTENT"),
        itemField("href", "Destination", "url", "ACTIONS"),
      ],
    },
  ],
  inlineFields: [
    inline("brandName", "text"),
    inline("pricingLabel", "text"),
    inline("loginLabel", "text"),
    inline("primaryActionLabel", "text"),
    inline("openMenuLabel", "text"),
    inline("closeMenuLabel", "text"),
    inline("learnMoreLabel", "text"),
  ],
} as const satisfies ComponentEditorContract;

export type PuckBatch4CatalogKey =
  | "pro-block:hero-16"
  | "pro-block:hero-17"
  | "pro-block:hero-19"
  | "pro-block:cta-8"
  | "pro-block:cta-9"
  | "pro-block:navigation-4"
  | "pro-block:navigation-11"
  | "pro-block:navigation-14";

export const PUCK_BATCH_4_EDITOR_CONTRACTS: Readonly<Record<PuckBatch4CatalogKey, ComponentEditorContract>> = {
  "pro-block:hero-16": hero16EditorContract,
  "pro-block:hero-17": hero17EditorContract,
  "pro-block:hero-19": hero19EditorContract,
  "pro-block:cta-8": cta8EditorContract,
  "pro-block:cta-9": cta9EditorContract,
  "pro-block:navigation-4": navigation4EditorContract,
  "pro-block:navigation-11": navigation11EditorContract,
  "pro-block:navigation-14": navigation14EditorContract,
};
