"use client";

import type { ReactNode } from "react";
import { AdaptedHero18 } from "@/components/editor-lab/adapted/hero-18";
import AdaptedBlog1 from "@/components/editor-lab/adapted/advanced/content/blog-1";
import AdaptedBlog2 from "@/components/editor-lab/adapted/advanced/content/blog-2";
import { Blog3 } from "@/components/blocks/blog-3";
import AdaptedEcommerce1 from "@/components/editor-lab/adapted/advanced/content/ecommerce-1";
import AdaptedEcommerce2 from "@/components/editor-lab/adapted/advanced/content/ecommerce-2";
import AdaptedCta9 from "@/components/editor-lab/adapted/cta-9";
import AdaptedCta11, { cta11ContentDefaults } from "@/components/editor-lab/adapted/cta/cta-11";
import AdaptedFooter12, { footer12ContentDefaults } from "@/components/editor-lab/adapted/footer/footer-12";
import AdaptedPricing7 from "@/components/editor-lab/adapted/advanced/pricing/pricing-7";
import AdaptedPricing8, { pricing8ContentDefaults } from "@/components/editor-lab/adapted/pricing/pricing-8";
import AdaptedPricing9, { pricing9ContentDefaults } from "@/components/editor-lab/adapted/pricing/pricing-9";
import AdaptedPricing10, {
  pricing10ContentDefaults,
  pricing10RunFeatures,
  pricing10RunTiers,
  pricing10SeatFeatures,
  pricing10SeatTiers,
} from "@/components/editor-lab/adapted/pricing-10";
import AdaptedPricing12 from "@/components/editor-lab/adapted/advanced/pricing/pricing-12";
import AdaptedPricing14 from "@/components/editor-lab/adapted/advanced/pricing/pricing-14";
import AdaptedPricing15 from "@/components/editor-lab/adapted/advanced/pricing/pricing-15";
import AdaptedContact7, { contact7ContentDefaults } from "@/components/editor-lab/adapted/contact-7";
import AdaptedContact8 from "@/components/editor-lab/adapted/advanced/contact/contact-8";
import AdaptedContact10 from "@/components/editor-lab/adapted/advanced/contact/contact-10";
import AdaptedContact12, { contact12ContentDefaults } from "@/components/editor-lab/adapted/contact/contact-12";
import { HowItWorks9 } from "@/components/blocks/how-it-works-9";
import AdaptedAppShell9 from "@/components/editor-lab/adapted/advanced/app-ui/app-shell-9";
import Navbar1 from "@/components/blocks/navbar-1";
import AdaptedNavbar2 from "@/components/editor-lab/adapted/advanced/navigation/navbar-2";
import Navbar3 from "@/components/blocks/navbar-3";
import AdaptedNavbar4 from "@/components/editor-lab/adapted/advanced/navigation/navbar-4";
import {
  appShell9NestedContent,
  blog1ArrayItems,
  blog1FormContent,
  blog2ArrayItems,
  blog2FormContent,
  contact10ArrayItems,
  contact10FormContent,
  contact8ArrayItems,
  contact8FormContent,
  ecommerce2NestedContent,
  ecommerce1ArrayItems,
  ecommerce1FormContent,
  navbar2ArrayItems,
  navbar4NestedContent,
  navbar6ArrayItems,
  pricing12ArrayItems,
  pricing12FormContent,
  pricing14ArrayItems,
  pricing15ArrayItems,
  pricing7NestedContent,
} from "@/components/editor-lab/adapted/advanced/advanced-structured-contracts";
import Navbar5 from "@/components/blocks/navbar-5";
import AdaptedNavbar6 from "@/components/editor-lab/adapted/advanced/navigation/navbar-6";
import CommandMenu4 from "@/components/blocks/command-menu-4";
import CommandMenu5 from "@/components/blocks/command-menu-5";
import CommandMenu6 from "@/components/blocks/command-menu-6";
import Mobile1 from "@/components/blocks/mobile-1";
import AdaptedCard10, { card10ActivityDefaultItems, card10ContentDefaults, card10SplitDefaultItems } from "@/components/editor-lab/adapted/cards/card-10";
import AdaptedCard11, { card11ContentDefaults, card11LineDefaultItems, card11TotalDefaultItems } from "@/components/editor-lab/adapted/cards/card-11";
import List7 from "@/components/blocks/list-7";
import List8 from "@/components/blocks/list-8";
import List9 from "@/components/blocks/list-9";
import List10 from "@/components/blocks/list-10";
import List11 from "@/components/blocks/list-11";
import List12 from "@/components/blocks/list-12";
import Onboarding5 from "@/components/blocks/onboarding-5";
import Onboarding6 from "@/components/blocks/onboarding-6";
import Onboarding7 from "@/components/blocks/onboarding-7";
import Forms4 from "@/components/blocks/forms-4";
import Forms5 from "@/components/blocks/forms-5";
import Forms6 from "@/components/blocks/forms-6";
import SettingsForm2 from "@/components/blocks/settings-form-2";
import SettingsForm3 from "@/components/blocks/settings-form-3";
import SettingsForm4 from "@/components/blocks/settings-form-4";
import Scheduling3 from "@/components/blocks/scheduling-3";
import type { ReactBitsHostSpec } from "@/components/editor-lab/puck/reactbits-host";
import { createMarketingPuckComponent } from "@/components/editor-lab/puck-v3/marketing-puck-component";
import { fields } from "@/components/editor-lab/puck/field-helpers";
import { bindFormContentContract, defineFormContentContract, type FormContentContract } from "@/components/editor-lab/puck/form-content-contract";
import { bindArrayItemsContracts, defineArrayItemsContract, type ArrayItemsContract, type PrimitiveArrayItem } from "@/components/editor-lab/puck/array-items-contract";
import { bindBoundedNestedContentContracts, type BoundedNestedContentContract } from "@/components/editor-lab/puck/bounded-nested-content-contract";

type AnyComponent = (props: Record<string, unknown>) => ReactNode;

export type FastBatch12Group =
  | "HERO / PREMIUM"
  | "SHOWCASE / MEDIA"
  | "NAV / CTA / FOOTER"
  | "PRICING / CONTACT"
  | "APP / CONTENT"
  | "BACKGROUNDS / INTERACTIVE"
  | "OTHER";

export type FastBatch12Status =
  | "DIRECT_RENDER_PASS"
  | "BLOCKED_SOURCE_DIFF"
  | "BLOCKED_REQUIRED_DATA"
  | "BLOCKED_REQUIRED_ASSET"
  | "BLOCKED_BROWSER_RUNTIME"
  | "BLOCKED_GPU_RUNTIME"
  | "BLOCKED_PUCK_RENDER"
  | "BLOCKED_HOST_CONTRACT_GAP"
  | "BLOCKED_EDITOR_NATIVE_SUBMIT"
  | "BLOCKED_OTHER";

export type FastBatch12Block = {
  type: string;
  displayName: string;
  catalogKey: string;
  description: string;
  component?: AnyComponent;
  sourceKind: "pro-block";
  tags: readonly string[];
  defaultProps: Record<string, unknown>;
  fields: Record<string, unknown>;
  formContent?: FormContentContract;
  arrayItems?: readonly ArrayItemsContract<PrimitiveArrayItem>[];
  nestedContent?: readonly BoundedNestedContentContract[];
  host: ReactBitsHostSpec;
  category: "React Bits Fast Batch 12";
  batchGroup: FastBatch12Group;
  batchStatus: FastBatch12Status;
  blocker?: Exclude<FastBatch12Status, "DIRECT_RENDER_PASS">;
};

const block = (
  input: Omit<FastBatch12Block, "category" | "defaultProps" | "fields" | "batchStatus" | "sourceKind"> & {
    defaultProps?: Record<string, unknown>;
    fields?: Record<string, unknown>;
    batchStatus?: FastBatch12Status;
    blocker?: FastBatch12Block["blocker"];
  },
): FastBatch12Block => {
  const boundArrays = bindArrayItemsContracts(
    input.arrayItems,
    input.fields ?? {},
    input.defaultProps ?? {},
  );
  const boundNestedContent = bindBoundedNestedContentContracts(
    input.nestedContent,
    boundArrays.fields,
    boundArrays.defaults,
  );
  const boundFormContent = bindFormContentContract(
    input.formContent,
    boundNestedContent.fields,
    boundNestedContent.defaults,
  );
  return {
    ...input,
    sourceKind: "pro-block",
    category: "React Bits Fast Batch 12",
    defaultProps: boundFormContent.defaults,
    fields: boundFormContent.fields,
    batchStatus: input.batchStatus ?? "DIRECT_RENDER_PASS",
  };
};

const contact7FormContent = defineFormContentContract({
  slots: [
    { slot: "headingLead", label: "Heading lead", type: "text", defaultValue: contact7ContentDefaults.headingLead },
    { slot: "headingEmphasis", label: "Heading emphasis", type: "text", defaultValue: contact7ContentDefaults.headingEmphasis },
    { slot: "headingTail", label: "Heading tail", type: "text", defaultValue: contact7ContentDefaults.headingTail },
    { slot: "description", label: "Description", type: "textarea", defaultValue: contact7ContentDefaults.description },
    { slot: "firstNameLabel", label: "First-name label", type: "text", defaultValue: contact7ContentDefaults.firstNameLabel },
    { slot: "firstNamePlaceholder", label: "First-name placeholder", type: "text", defaultValue: contact7ContentDefaults.firstNamePlaceholder },
    { slot: "lastNameLabel", label: "Last-name label", type: "text", defaultValue: contact7ContentDefaults.lastNameLabel },
    { slot: "lastNamePlaceholder", label: "Last-name placeholder", type: "text", defaultValue: contact7ContentDefaults.lastNamePlaceholder },
    { slot: "emailLabel", label: "Email label", type: "text", defaultValue: contact7ContentDefaults.emailLabel },
    { slot: "emailPlaceholder", label: "Email placeholder", type: "text", defaultValue: contact7ContentDefaults.emailPlaceholder },
    { slot: "companySizeLabel", label: "Company-size label", type: "text", defaultValue: contact7ContentDefaults.companySizeLabel },
    { slot: "messageLabel", label: "Message label", type: "text", defaultValue: contact7ContentDefaults.messageLabel },
    { slot: "messagePlaceholder", label: "Message placeholder", type: "text", defaultValue: contact7ContentDefaults.messagePlaceholder },
    { slot: "submitLabel", label: "Submit button label", type: "text", defaultValue: contact7ContentDefaults.submitLabel },
  ],
});

const pricing10FormContent = defineFormContentContract({
  slots: [
    { slot: "heading", label: "Heading", type: "text", defaultValue: pricing10ContentDefaults.heading },
    { slot: "description", label: "Description", type: "textarea", defaultValue: pricing10ContentDefaults.description },
    { slot: "buttonLabel", label: "Button label", type: "text", defaultValue: pricing10ContentDefaults.buttonLabel },
  ],
});

const footer12FormContent = defineFormContentContract({
  slots: [
    { slot: "brandInitial", label: "Brand initial", type: "text", defaultValue: footer12ContentDefaults.brandInitial },
    { slot: "brandLabel", label: "Brand label", type: "text", defaultValue: footer12ContentDefaults.brandLabel },
    { slot: "heading", label: "Heading", type: "text", defaultValue: footer12ContentDefaults.heading },
    { slot: "description", label: "Description", type: "textarea", defaultValue: footer12ContentDefaults.description },
    { slot: "emailLabel", label: "Email label", type: "text", defaultValue: footer12ContentDefaults.emailLabel },
    { slot: "emailPlaceholder", label: "Email placeholder", type: "text", defaultValue: footer12ContentDefaults.emailPlaceholder },
    { slot: "buttonLabel", label: "Button label", type: "text", defaultValue: footer12ContentDefaults.buttonLabel },
    { slot: "footerBrand", label: "Footer brand", type: "text", defaultValue: footer12ContentDefaults.footerBrand },
    { slot: "footerDescription", label: "Footer description", type: "textarea", defaultValue: footer12ContentDefaults.footerDescription },
    { slot: "copyright", label: "Copyright", type: "text", defaultValue: footer12ContentDefaults.copyright },
  ],
});

const card10ArrayContracts = [
  defineArrayItemsContract({
    slot: "split",
    label: "Balance split",
    defaults: card10SplitDefaultItems,
    fields: {
      label: fields.text("Label", { contentEditable: false }),
      value: fields.text("Value", { contentEditable: false }),
    },
    itemLabel: (item) => String(item.label ?? "Balance item"),
  }),
  defineArrayItemsContract({
    slot: "activity",
    label: "Activity",
    defaults: card10ActivityDefaultItems,
    fields: {
      name: fields.text("Name", { contentEditable: false }),
      when: fields.text("When", { contentEditable: false }),
      amount: fields.text("Amount", { contentEditable: false }),
    },
    itemLabel: (item) => String(item.name ?? "Activity"),
  }),
];

const card11ArrayContracts = [
  defineArrayItemsContract({
    slot: "lines",
    label: "Invoice lines",
    defaults: card11LineDefaultItems,
    fields: {
      label: fields.text("Label", { contentEditable: false }),
      detail: fields.text("Detail", { contentEditable: false }),
      amount: fields.text("Amount", { contentEditable: false }),
    },
    itemLabel: (item) => String(item.label ?? "Invoice line"),
  }),
  defineArrayItemsContract({
    slot: "totals",
    label: "Invoice totals",
    defaults: card11TotalDefaultItems,
    fields: {
      label: fields.text("Label", { contentEditable: false }),
      value: fields.text("Value", { contentEditable: false }),
    },
    itemLabel: (item) => String(item.label ?? "Total"),
  }),
];

const pricing10ArrayContracts = [
  defineArrayItemsContract({
    slot: "runTiers",
    label: "Run tiers",
    defaults: pricing10RunTiers,
    fields: {
      runs: fields.number("Runs", { min: 0, step: 1000 }),
      monthly: fields.number("Monthly price", { min: 0, step: 1 }),
    },
    itemLabel: (tier) => `${Number(tier.runs ?? 0).toLocaleString()} runs`,
  }),
  defineArrayItemsContract({
    slot: "seatTiers",
    label: "Seat tiers",
    defaults: pricing10SeatTiers,
    fields: {
      seats: fields.number("Seats", { min: 0, step: 1 }),
      monthly: fields.number("Monthly price", { min: 0, step: 1 }),
    },
    itemLabel: (tier) => `${Number(tier.seats ?? 0)} seats`,
  }),
  defineArrayItemsContract({
    slot: "runFeatures",
    label: "Run features",
    defaults: pricing10RunFeatures,
    fields: { text: fields.text("Feature", { contentEditable: false }) },
    itemLabel: (feature) => String(feature.text ?? "Feature"),
  }),
  defineArrayItemsContract({
    slot: "seatFeatures",
    label: "Seat features",
    defaults: pricing10SeatFeatures,
    fields: { text: fields.text("Feature", { contentEditable: false }) },
    itemLabel: (feature) => String(feature.text ?? "Feature"),
  }),
];

const marketingHost: ReactBitsHostSpec = {
  profile: "section",
  width: "full",
  height: "intrinsic",
  overflow: "source",
  runtimeRisk: "dom",
};

const appHost = (minHeight: number): ReactBitsHostSpec => ({
  profile: "app-surface",
  width: "full",
  height: "source-min",
  sourceMinHeight: { value: minHeight, provenance: "official-source" },
  overflow: "source",
  runtimeRisk: "dom",
});

const heroBlocks = [
  block({ type: "RB_batch12_hero_18", displayName: "React Bits Hero 18", catalogKey: "pro-block:hero-18", description: "Official React Bits Hero 18 premium section.", component: AdaptedHero18 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Hero", "Premium"], batchGroup: "HERO / PREMIUM", host: marketingHost, defaultProps: { heading: "Every tool you use,\none keystroke away.", description: "Waypoint indexes your docs, repos, people, and actions into a single command bar that answers before you finish typing.", primaryButtonLabel: "Get Waypoint free" }, fields: { heading: fields.text("Heading", { contentEditable: false }), description: fields.textarea("Description", { contentEditable: false }), primaryButtonLabel: fields.text("Primary button label", { contentEditable: false }) } }),
];

const showcaseBlocks = [
  block({ type: "RB_batch12_blog_1", displayName: "React Bits Blog 1", catalogKey: "pro-block:blog-1", description: "Official React Bits Blog 1 media grid.", component: AdaptedBlog1 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Showcase", "Blog"], batchGroup: "SHOWCASE / MEDIA", host: marketingHost, arrayItems: blog1ArrayItems, formContent: blog1FormContent }),
  block({ type: "RB_batch12_blog_2", displayName: "React Bits Blog 2", catalogKey: "pro-block:blog-2", description: "Official React Bits Blog 2 paginated media list.", component: AdaptedBlog2 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Showcase", "Blog"], batchGroup: "SHOWCASE / MEDIA", host: marketingHost, arrayItems: blog2ArrayItems, formContent: blog2FormContent }),
  block({ type: "RB_batch12_ecommerce_1", displayName: "React Bits Ecommerce 1", catalogKey: "pro-block:ecommerce-1", description: "Official React Bits Ecommerce 1 product detail showcase.", component: AdaptedEcommerce1 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Showcase", "Ecommerce"], batchGroup: "SHOWCASE / MEDIA", host: marketingHost, arrayItems: ecommerce1ArrayItems, formContent: ecommerce1FormContent }),
  block({ type: "RB_batch12_ecommerce_2", displayName: "React Bits Ecommerce 2", catalogKey: "pro-block:ecommerce-2", description: "Official React Bits Ecommerce 2 product showcase.", component: AdaptedEcommerce2 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Showcase", "Ecommerce"], batchGroup: "SHOWCASE / MEDIA", host: marketingHost, nestedContent: ecommerce2NestedContent }),
];

const navigationBlocks = [
  block({ type: "RB_batch12_cta_9", displayName: "React Bits CTA 9", catalogKey: "pro-block:cta-9", description: "Official React Bits CTA 9.", component: AdaptedCta9 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "CTA"], batchGroup: "NAV / CTA / FOOTER", host: marketingHost, defaultProps: { heading: "Ready to make the switch?", description: "Bring your workspace over in minutes — we’ll handle the heavy lifting.", buttonLabel: "Request a free migration" }, fields: { heading: fields.text("Heading", { contentEditable: false }), description: fields.textarea("Description", { contentEditable: false }), buttonLabel: fields.text("Button label", { contentEditable: false }) } }),
  block({ type: "RB_batch12_cta_11", displayName: "React Bits CTA 11", catalogKey: "pro-block:cta-11", description: "Official React Bits CTA 11.", component: AdaptedCta11 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "CTA"], batchGroup: "NAV / CTA / FOOTER", host: marketingHost, defaultProps: cta11ContentDefaults, fields: { eyebrow: fields.text("Eyebrow", { contentEditable: false }), heading: fields.text("Heading", { contentEditable: false }), description: fields.textarea("Description", { contentEditable: false }), primaryButtonLabel: fields.text("Primary button label", { contentEditable: false }), secondaryButtonLabel: fields.text("Secondary button label", { contentEditable: false }), helperText: fields.text("Helper text", { contentEditable: false }) } }),
  block({ type: "RB_batch12_footer_12", displayName: "React Bits Footer 12", catalogKey: "pro-block:footer-12", description: "Official React Bits Footer 12.", component: AdaptedFooter12 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Footer"], batchGroup: "NAV / CTA / FOOTER", host: marketingHost, formContent: footer12FormContent }),
  block({ type: "RB_batch12_navbar_1", displayName: "React Bits Navbar 1", catalogKey: "pro-block:navbar-1", description: "Official React Bits App UI Navbar 1.", component: Navbar1 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Navigation", "App UI"], batchGroup: "NAV / CTA / FOOTER", host: appHost(480) }),
  block({ type: "RB_batch12_navbar_2", displayName: "React Bits Navbar 2", catalogKey: "pro-block:navbar-2", description: "Official React Bits App UI Navbar 2.", component: AdaptedNavbar2 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Navigation", "App UI"], batchGroup: "NAV / CTA / FOOTER", host: appHost(400), arrayItems: navbar2ArrayItems }),
  block({ type: "RB_batch12_navbar_3", displayName: "React Bits Navbar 3", catalogKey: "pro-block:navbar-3", description: "Official React Bits App UI Navbar 3.", component: Navbar3 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Navigation", "App UI"], batchGroup: "NAV / CTA / FOOTER", host: appHost(480) }),
  block({ type: "RB_batch12_navbar_4", displayName: "React Bits Navbar 4", catalogKey: "pro-block:navbar-4", description: "Official React Bits App UI Navbar 4.", component: AdaptedNavbar4 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Navigation", "App UI"], batchGroup: "NAV / CTA / FOOTER", host: appHost(560), nestedContent: navbar4NestedContent }),
  block({ type: "RB_batch12_navbar_5", displayName: "React Bits Navbar 5", catalogKey: "pro-block:navbar-5", description: "Official React Bits App UI Navbar 5.", component: Navbar5 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Navigation", "App UI"], batchGroup: "NAV / CTA / FOOTER", host: appHost(640) }),
  block({ type: "RB_batch12_navbar_6", displayName: "React Bits Navbar 6", catalogKey: "pro-block:navbar-6", description: "Official React Bits App UI Navbar 6.", component: AdaptedNavbar6 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Navigation", "App UI"], batchGroup: "NAV / CTA / FOOTER", host: appHost(480), arrayItems: navbar6ArrayItems }),
];

const pricingBlocks = [
  block({ type: "RB_batch12_pricing_7", displayName: "React Bits Pricing 7", catalogKey: "pro-block:pricing-7", description: "Official React Bits Pricing 7.", component: AdaptedPricing7 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Pricing"], batchGroup: "PRICING / CONTACT", host: marketingHost, nestedContent: pricing7NestedContent }),
  block({ type: "RB_batch12_pricing_8", displayName: "React Bits Pricing 8", catalogKey: "pro-block:pricing-8", description: "Official React Bits Pricing 8.", component: AdaptedPricing8 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Pricing"], batchGroup: "PRICING / CONTACT", host: marketingHost, defaultProps: pricing8ContentDefaults, fields: { headingLine1: fields.text("Heading line 1", { contentEditable: false }), headingLine2: fields.text("Heading line 2", { contentEditable: false }), standardButtonLabel: fields.text("Standard button label", { contentEditable: false }), enterpriseButtonLabel: fields.text("Enterprise button label", { contentEditable: false }), monitoringTitle: fields.text("Monitoring title", { contentEditable: false }), incidentTitle: fields.text("Incident title", { contentEditable: false }) } }),
  block({ type: "RB_batch12_pricing_9", displayName: "React Bits Pricing 9", catalogKey: "pro-block:pricing-9", description: "Official React Bits Pricing 9.", component: AdaptedPricing9 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Pricing"], batchGroup: "PRICING / CONTACT", host: marketingHost, defaultProps: pricing9ContentDefaults, fields: { eyebrow: fields.text("Eyebrow", { contentEditable: false }), headingLine1: fields.text("Heading line 1", { contentEditable: false }), headingLine2: fields.text("Heading line 2", { contentEditable: false }), description: fields.textarea("Description", { contentEditable: false }), saveBadge: fields.text("Save badge", { contentEditable: false }), annualTitle: fields.text("Annual title", { contentEditable: false }), annualPrice: fields.text("Annual price", { contentEditable: false }), annualDescription: fields.text("Annual description", { contentEditable: false }), monthlyTitle: fields.text("Monthly title", { contentEditable: false }), monthlyPrice: fields.text("Monthly price", { contentEditable: false }), monthlyDescription: fields.text("Monthly description", { contentEditable: false }), helperText: fields.textarea("Helper text", { contentEditable: false }), termsLabel: fields.text("Terms label", { contentEditable: false }), cancelLabel: fields.text("Cancel label", { contentEditable: false }), buttonLabel: fields.text("Button label", { contentEditable: false }) } }),
  block({ type: "RB_batch12_pricing_10", displayName: "React Bits Pricing 10", catalogKey: "pro-block:pricing-10", description: "Official React Bits Pricing 10.", component: AdaptedPricing10 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Pricing"], batchGroup: "PRICING / CONTACT", host: marketingHost, formContent: pricing10FormContent, arrayItems: pricing10ArrayContracts }),
  block({ type: "RB_batch12_pricing_12", displayName: "React Bits Pricing 12", catalogKey: "pro-block:pricing-12", description: "Official React Bits Pricing 12.", component: AdaptedPricing12 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Pricing"], batchGroup: "PRICING / CONTACT", host: marketingHost, arrayItems: pricing12ArrayItems, formContent: pricing12FormContent }),
  block({ type: "RB_batch12_pricing_14", displayName: "React Bits Pricing 14", catalogKey: "pro-block:pricing-14", description: "Official React Bits Pricing 14.", component: AdaptedPricing14 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Pricing"], batchGroup: "PRICING / CONTACT", host: marketingHost, arrayItems: pricing14ArrayItems }),
  block({ type: "RB_batch12_pricing_15", displayName: "React Bits Pricing 15", catalogKey: "pro-block:pricing-15", description: "Official React Bits Pricing 15.", component: AdaptedPricing15 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Pricing"], batchGroup: "PRICING / CONTACT", host: marketingHost, arrayItems: pricing15ArrayItems }),
  block({ type: "RB_batch12_contact_7", displayName: "React Bits Contact 7", catalogKey: "pro-block:contact-7", description: "Official React Bits Contact 7.", component: AdaptedContact7 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Contact"], batchGroup: "PRICING / CONTACT", host: marketingHost, formContent: contact7FormContent }),
  block({ type: "RB_batch12_contact_8", displayName: "React Bits Contact 8", catalogKey: "pro-block:contact-8", description: "Official React Bits Contact 8.", component: AdaptedContact8 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Contact"], batchGroup: "PRICING / CONTACT", host: marketingHost, arrayItems: contact8ArrayItems, formContent: contact8FormContent }),
  block({ type: "RB_batch12_contact_10", displayName: "React Bits Contact 10", catalogKey: "pro-block:contact-10", description: "Official React Bits Contact 10.", component: AdaptedContact10 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Contact"], batchGroup: "PRICING / CONTACT", host: marketingHost, arrayItems: contact10ArrayItems, formContent: contact10FormContent }),
  block({ type: "RB_batch12_contact_12", displayName: "React Bits Contact 12", catalogKey: "pro-block:contact-12", description: "Official React Bits Contact 12.", component: AdaptedContact12 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Contact"], batchGroup: "PRICING / CONTACT", host: marketingHost, defaultProps: contact12ContentDefaults, fields: { heading: fields.text("Heading", { contentEditable: false }), description: fields.textarea("Description", { contentEditable: false }), responseValue: fields.text("Response value", { contentEditable: false }), responseLabel: fields.text("Response label", { contentEditable: false }) } }),
];

const appBlocks = [
  block({ type: "RB_batch12_app_shell_9", displayName: "React Bits App Shell 9", catalogKey: "pro-block:app-shell-9", description: "Official React Bits App Shell 9.", component: AdaptedAppShell9 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "App Shell", "App UI"], batchGroup: "APP / CONTENT", host: appHost(720), nestedContent: appShell9NestedContent }),
  block({ type: "RB_batch12_mobile_1", displayName: "React Bits Mobile 1", catalogKey: "pro-block:mobile-1", description: "Official React Bits Mobile UI 1.", component: Mobile1 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Mobile", "App UI"], batchGroup: "APP / CONTENT", host: appHost(680) }),
  block({ type: "RB_batch12_card_10", displayName: "React Bits Card 10", catalogKey: "pro-block:card-10", description: "Official React Bits App UI Card 10.", component: AdaptedCard10 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Card", "Content", "App UI"], batchGroup: "APP / CONTENT", host: appHost(560), defaultProps: card10ContentDefaults, fields: { balanceLabel: fields.text("Balance label", { contentEditable: false }), balanceValue: fields.text("Balance value", { contentEditable: false }), changeValue: fields.text("Change value", { contentEditable: false }), balanceMeta: fields.text("Balance metadata", { contentEditable: false }), addButtonLabel: fields.text("Add button label", { contentEditable: false }), transferButtonLabel: fields.text("Transfer button label", { contentEditable: false }) }, arrayItems: card10ArrayContracts }),
  block({ type: "RB_batch12_card_11", displayName: "React Bits Card 11", catalogKey: "pro-block:card-11", description: "Official React Bits App UI Card 11.", component: AdaptedCard11 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Card", "Content", "App UI"], batchGroup: "APP / CONTENT", host: appHost(640), defaultProps: card11ContentDefaults, fields: { invoiceLabel: fields.text("Invoice label", { contentEditable: false }), invoiceId: fields.text("Invoice ID", { contentEditable: false }), statusLabel: fields.text("Status label", { contentEditable: false }), metadata: fields.text("Metadata", { contentEditable: false }), totalLabel: fields.text("Total label", { contentEditable: false }), totalValue: fields.text("Total value", { contentEditable: false }), downloadLabel: fields.text("Download label", { contentEditable: false }) }, arrayItems: card11ArrayContracts }),
  block({ type: "RB_batch12_list_7", displayName: "React Bits List 7", catalogKey: "pro-block:list-7", description: "Official React Bits App UI List 7.", component: List7 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "List", "Content", "App UI"], batchGroup: "APP / CONTENT", host: appHost(640) }),
  block({ type: "RB_batch12_list_8", displayName: "React Bits List 8", catalogKey: "pro-block:list-8", description: "Official React Bits App UI List 8.", component: List8 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "List", "Content", "App UI"], batchGroup: "APP / CONTENT", host: appHost(560) }),
  block({ type: "RB_batch12_list_9", displayName: "React Bits List 9", catalogKey: "pro-block:list-9", description: "Official React Bits App UI List 9.", component: List9 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "List", "Content", "App UI"], batchGroup: "APP / CONTENT", host: appHost(640) }),
  block({ type: "RB_batch12_list_10", displayName: "React Bits List 10", catalogKey: "pro-block:list-10", description: "Official React Bits App UI List 10.", component: List10 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "List", "Content", "App UI"], batchGroup: "APP / CONTENT", host: appHost(560) }),
  block({ type: "RB_batch12_list_11", displayName: "React Bits List 11", catalogKey: "pro-block:list-11", description: "Official React Bits App UI List 11.", component: List11 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "List", "Content", "App UI"], batchGroup: "APP / CONTENT", host: appHost(640) }),
  block({ type: "RB_batch12_list_12", displayName: "React Bits List 12", catalogKey: "pro-block:list-12", description: "Official React Bits App UI List 12.", component: List12 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "List", "Content", "App UI"], batchGroup: "APP / CONTENT", host: appHost(640) }),
  block({ type: "RB_batch12_onboarding_5", displayName: "React Bits Onboarding 5", catalogKey: "pro-block:onboarding-5", description: "Official React Bits App UI Onboarding 5.", component: Onboarding5 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Onboarding", "App UI"], batchGroup: "APP / CONTENT", host: appHost(640) }),
  block({ type: "RB_batch12_onboarding_6", displayName: "React Bits Onboarding 6", catalogKey: "pro-block:onboarding-6", description: "Official React Bits App UI Onboarding 6.", component: Onboarding6 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Onboarding", "App UI"], batchGroup: "APP / CONTENT", host: appHost(560) }),
  block({ type: "RB_batch12_onboarding_7", displayName: "React Bits Onboarding 7", catalogKey: "pro-block:onboarding-7", description: "Official React Bits App UI Onboarding 7.", component: Onboarding7 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Onboarding", "App UI"], batchGroup: "APP / CONTENT", host: appHost(640) }),
  block({ type: "RB_batch12_forms_4", displayName: "React Bits Forms 4", catalogKey: "pro-block:forms-4", description: "Official React Bits App UI Forms 4.", component: Forms4 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Forms", "App UI"], batchGroup: "APP / CONTENT", host: appHost(720) }),
  block({ type: "RB_batch12_forms_5", displayName: "React Bits Forms 5", catalogKey: "pro-block:forms-5", description: "Official React Bits App UI Forms 5.", component: Forms5 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Forms", "App UI"], batchGroup: "APP / CONTENT", host: appHost(720) }),
  block({ type: "RB_batch12_forms_6", displayName: "React Bits Forms 6", catalogKey: "pro-block:forms-6", description: "Official React Bits App UI Forms 6.", component: Forms6 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Forms", "App UI"], batchGroup: "APP / CONTENT", host: appHost(1040) }),
  block({ type: "RB_batch12_settings_form_2", displayName: "React Bits Settings Form 2", catalogKey: "pro-block:settings-form-2", description: "Official React Bits App UI Settings Form 2.", component: SettingsForm2 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Settings", "Forms", "App UI"], batchGroup: "APP / CONTENT", host: appHost(800) }),
  block({ type: "RB_batch12_settings_form_3", displayName: "React Bits Settings Form 3", catalogKey: "pro-block:settings-form-3", description: "Official React Bits App UI Settings Form 3.", component: SettingsForm3 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Settings", "Forms", "App UI"], batchGroup: "APP / CONTENT", host: appHost(800) }),
  block({ type: "RB_batch12_settings_form_4", displayName: "React Bits Settings Form 4", catalogKey: "pro-block:settings-form-4", description: "Official React Bits App UI Settings Form 4.", component: SettingsForm4 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Settings", "Forms", "App UI"], batchGroup: "APP / CONTENT", host: appHost(720) }),
  block({ type: "RB_batch12_scheduling_3", displayName: "React Bits Scheduling 3", catalogKey: "pro-block:scheduling-3", description: "Official React Bits App UI Scheduling 3.", component: Scheduling3 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Scheduling", "App UI"], batchGroup: "APP / CONTENT", host: appHost(720) }),
];

const interactiveBlocks = [
  block({ type: "RB_batch12_command_menu_4", displayName: "React Bits Command Menu 4", catalogKey: "pro-block:command-menu-4", description: "Official React Bits App UI Command Menu 4.", component: CommandMenu4 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Interactive", "Command Menu", "App UI"], batchGroup: "BACKGROUNDS / INTERACTIVE", host: appHost(400) }),
  block({ type: "RB_batch12_command_menu_5", displayName: "React Bits Command Menu 5", catalogKey: "pro-block:command-menu-5", description: "Official React Bits App UI Command Menu 5.", component: CommandMenu5 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Interactive", "Command Menu", "App UI"], batchGroup: "BACKGROUNDS / INTERACTIVE", host: appHost(560) }),
  block({ type: "RB_batch12_command_menu_6", displayName: "React Bits Command Menu 6", catalogKey: "pro-block:command-menu-6", description: "Official React Bits App UI Command Menu 6.", component: CommandMenu6 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Interactive", "Command Menu", "App UI"], batchGroup: "BACKGROUNDS / INTERACTIVE", host: appHost(480) }),
];

const otherBlocks = [
  block({ type: "RB_batch12_blog_3", displayName: "React Bits Blog 3", catalogKey: "pro-block:blog-3", description: "Official React Bits Blog 3 filterable content list.", component: Blog3 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Blog", "Content"], batchGroup: "OTHER", host: marketingHost }),
  block({ type: "RB_batch12_how_it_works_9", displayName: "React Bits How It Works 9", catalogKey: "pro-block:how-it-works-9", description: "Official React Bits How It Works 9 section.", component: HowItWorks9 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "How It Works"], batchGroup: "OTHER", host: marketingHost }),
];

export const fastBatch12Blocks = [
  ...heroBlocks,
  ...showcaseBlocks,
  ...navigationBlocks,
  ...pricingBlocks,
  ...appBlocks,
  ...interactiveBlocks,
  ...otherBlocks,
];

export const fastBatch12PuckBlocks = fastBatch12Blocks.filter(
  (entry): entry is FastBatch12Block & { component: AnyComponent } =>
    !entry.batchStatus.startsWith("BLOCKED") && Boolean(entry.component),
);

export const fastBatch12Components = Object.fromEntries(
  fastBatch12PuckBlocks.map((entry) => [
    entry.type,
    createMarketingPuckComponent(entry as never),
  ]),
);

export const fastBatch12Categories = {
  fastBatch12: {
    title: "React Bits Fast Batch 12",
    defaultExpanded: false,
    components: fastBatch12PuckBlocks.map((entry) => entry.type),
  },
};
