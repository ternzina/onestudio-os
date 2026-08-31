"use client";

import type { ReactNode } from "react";
import AdaptedHero8, { hero8ContentDefaults } from "@/components/editor-lab/adapted/hero/hero-8";
import AdaptedHero10, { hero10ContentDefaults } from "@/components/editor-lab/adapted/hero/hero-10";
import AdaptedHero11, { hero11ContentDefaults } from "@/components/editor-lab/adapted/hero/hero-11";
import AdaptedHero14, { hero14ContentDefaults } from "@/components/editor-lab/adapted/hero/hero-14";
import { AdaptedHero15 } from "@/components/editor-lab/adapted/hero-15";
import AdaptedHero20, { hero20ContentDefaults } from "@/components/editor-lab/adapted/hero/hero-20";
import AdaptedPricing13 from "@/components/editor-lab/adapted/advanced/pricing/pricing-13";
import AdaptedContact11 from "@/components/editor-lab/adapted/advanced/contact/contact-11";
import AdaptedSocialProof12, { socialProof12ContentDefaults } from "@/components/editor-lab/adapted/showcase/social-proof-12";
import AdaptedSocialProof13, { socialProof13ContentDefaults } from "@/components/editor-lab/adapted/showcase/social-proof-13";
import AdaptedSocialProof14, { socialProof14ContentDefaults } from "@/components/editor-lab/adapted/showcase/social-proof-14";
import AdaptedSocialProof16, { socialProof16ContentDefaults } from "@/components/editor-lab/adapted/showcase/social-proof-16";
import AdaptedAbout10, { about10ContentDefaults } from "@/components/editor-lab/adapted/showcase/about-10";
import AdaptedAbout12, { about12ContentDefaults } from "@/components/editor-lab/adapted/showcase/about-12";
import AdaptedNavigation9, { navigation9Links } from "@/components/editor-lab/adapted/navigation-9";
import AdaptedNavigation11 from "@/components/editor-lab/adapted/advanced/navigation/navigation-11";
import AdaptedNavigation12, { navigation12Links } from "@/components/editor-lab/adapted/navigation-12";
import AdaptedNavigation14 from "@/components/editor-lab/adapted/advanced/navigation/navigation-14";
import AdaptedNavigation15, { navigation15Links } from "@/components/editor-lab/adapted/navigation-15";
import AdaptedCta10, { cta10ContentDefaults } from "@/components/editor-lab/adapted/cta/cta-10";
import AdaptedCta13, { cta13ContentDefaults } from "@/components/editor-lab/adapted/cta/cta-13";
import AdaptedCta14, { cta14ContentDefaults } from "@/components/editor-lab/adapted/cta/cta-14";
import AdaptedFooter7, { footer7NavigationLinks } from "@/components/editor-lab/adapted/footer-7";
import AdaptedFooter11, { footer11ContentDefaults } from "@/components/editor-lab/adapted/footer/footer-11";
import AppShell6 from "@/components/blocks/app-shell-6";
import AppShell8 from "@/components/blocks/app-shell-8";
import AdaptedAppSidebar6 from "@/components/editor-lab/adapted/advanced/app-ui/app-sidebar-6";
import AdaptedAppSidebar7 from "@/components/editor-lab/adapted/advanced/app-ui/app-sidebar-7";
import {
  advancedControlGroups,
  appSidebar6NestedContent,
  appSidebar7NestedContent,
  contact11ArrayItems,
  navigation11NestedContent,
  navigation14NestedContent,
  pricing13NestedContent,
} from "@/components/editor-lab/adapted/advanced/advanced-structured-contracts";
import AdaptedCard8, { card8ContentDefaults } from "@/components/editor-lab/adapted/cards/card-8";
import AdaptedCard9, { card9ContentDefaults } from "@/components/editor-lab/adapted/cards/card-9";
import AdaptedList1, { list1ContentDefaults } from "@/components/editor-lab/adapted/lists/list-1";
import ScrollMask from "@/components/react-bits/scroll-mask";
import RotatingCards from "@/components/react-bits/rotating-cards";
import { createPuckComponent } from "@/components/editor-lab/puck/block-contract";
import type { ReactBitsHostSpec } from "@/components/editor-lab/puck/reactbits-host";
import { createMarketingPuckComponent } from "@/components/editor-lab/puck-v3/marketing-puck-component";
import { fields } from "@/components/editor-lab/puck/field-helpers";
import { bindArrayItemsContracts, type ArrayItemsContract, type PrimitiveArrayItem } from "@/components/editor-lab/puck/array-items-contract";
import { bindBoundedNestedContentContracts, type BoundedNestedContentContract } from "@/components/editor-lab/puck/bounded-nested-content-contract";
import { defineMenuLinksArrayContract } from "@/components/editor-lab/puck/menu-links-array-contract";
import { bindFormContentContract, defineFormContentContract, type FormContentContract } from "@/components/editor-lab/puck/form-content-contract";
import { bindControlGroups, type ControlGroupContract } from "@/components/editor-lab/puck/control-groups";
import type { LayoutControlContract } from "@/components/editor-lab/puck/layout-control-contract";

type AnyComponent = (props: Record<string, unknown>) => ReactNode;
export type FastBatch11Group =
  | "HERO / PREMIUM"
  | "SHOWCASE / MEDIA"
  | "NAV / CTA / FOOTER"
  | "APP / CONTENT"
  | "BACKGROUNDS / INTERACTIVE";
export type FastBatch11Status =
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

export type FastBatch11Block = {
  type: string;
  displayName: string;
  catalogKey: string;
  description: string;
  component?: AnyComponent;
  sourceKind: "component" | "pro-block";
  tags: readonly string[];
  defaultProps: Record<string, unknown>;
  fields: Record<string, unknown>;
  arrayItems?: readonly ArrayItemsContract<PrimitiveArrayItem>[];
  nestedContent?: readonly BoundedNestedContentContract[];
  formContent?: FormContentContract;
  controlGroups?: readonly ControlGroupContract[];
  layoutControls?: LayoutControlContract;
  host: ReactBitsHostSpec;
  category: "React Bits Fast Batch 11";
  batchGroup: FastBatch11Group;
  batchStatus: FastBatch11Status;
  blocker?: Exclude<FastBatch11Status, "DIRECT_RENDER_PASS">;
  replacementFor?: string;
};

const block = (
  input: Omit<FastBatch11Block, "category" | "defaultProps" | "fields" | "batchStatus"> & {
    defaultProps?: Record<string, unknown>;
    fields?: Record<string, unknown>;
    batchStatus?: FastBatch11Status;
    blocker?: FastBatch11Block["blocker"];
  },
): FastBatch11Block => {
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
  const groupedFields = bindControlGroups(
    input.controlGroups,
    boundFormContent.fields,
  );
  return {
    ...input,
    category: "React Bits Fast Batch 11",
    defaultProps: boundFormContent.defaults,
    fields: groupedFields,
    batchStatus: input.batchStatus ?? "DIRECT_RENDER_PASS",
  };
};

const navigation9LinkContract = defineMenuLinksArrayContract({
  slot: "links",
  label: "Navigation links",
  defaults: navigation9Links,
});

const navigation12LinkContract = defineMenuLinksArrayContract({
  slot: "links",
  label: "Header menu links",
  defaults: navigation12Links,
  includeHref: false,
});

const footer7LinkContract = defineMenuLinksArrayContract({
  slot: "navigationLinks",
  label: "Footer navigation links",
  defaults: footer7NavigationLinks,
});

const navigation15LinkContract = defineMenuLinksArrayContract({
  slot: "links",
  label: "Navigation links",
  defaults: navigation15Links,
});

const hero14FormContent = defineFormContentContract({
  slots: [
    { slot: "rating", label: "Rating", type: "text", defaultValue: hero14ContentDefaults.rating },
    { slot: "reviews", label: "Reviews", type: "text", defaultValue: hero14ContentDefaults.reviews },
    { slot: "headingLine1", label: "Heading line 1", type: "text", defaultValue: hero14ContentDefaults.headingLine1 },
    { slot: "headingLine2", label: "Heading line 2", type: "text", defaultValue: hero14ContentDefaults.headingLine2 },
    { slot: "description", label: "Description", type: "textarea", defaultValue: hero14ContentDefaults.description },
    { slot: "emailPlaceholder", label: "Email placeholder", type: "text", defaultValue: hero14ContentDefaults.emailPlaceholder },
    { slot: "buttonLabel", label: "Button label", type: "text", defaultValue: hero14ContentDefaults.buttonLabel },
    { slot: "linkLabel", label: "Link label", type: "text", defaultValue: hero14ContentDefaults.linkLabel },
  ],
});

const cta10FormContent = defineFormContentContract({
  slots: [
    { slot: "heading", label: "Heading", type: "text", defaultValue: cta10ContentDefaults.heading },
    { slot: "description", label: "Description", type: "textarea", defaultValue: cta10ContentDefaults.description },
    { slot: "emailPlaceholder", label: "Email placeholder", type: "text", defaultValue: cta10ContentDefaults.emailPlaceholder },
    { slot: "buttonLabel", label: "Button label", type: "text", defaultValue: cta10ContentDefaults.buttonLabel },
  ],
});

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

const scrollHost: ReactBitsHostSpec = {
  profile: "section",
  width: "full",
  height: "intrinsic",
  overflow: "source",
  runtimeRisk: "observer",
};

const rotatingCardsHost: ReactBitsHostSpec = {
  profile: "flow",
  width: "content",
  height: "intrinsic",
  align: "center",
  overflow: "source",
  responsiveFit: {
    mode: "contain",
    intrinsicWidth: { value: 880, provenance: "official-source" },
  },
  runtimeRisk: "dom",
};

const canvasHost: ReactBitsHostSpec = {
  profile: "canvas",
  width: "full",
  height: "technical-definite",
  technicalHeight: { value: 480, provenance: "puck-technical" },
  overflow: "clip",
  runtimeRisk: "webgl",
};

const rotatingCards = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  content: String(index + 1),
}));

const heroBlocks = [
  block({ type: "RB_batch11_hero_8", displayName: "React Bits Hero 8", catalogKey: "pro-block:hero-8", description: "Official React Bits Hero 8 media-between-text section.", component: AdaptedHero8 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Hero", "Premium"], batchGroup: "HERO / PREMIUM", host: marketingHost, defaultProps: hero8ContentDefaults, fields: { firstLeft: fields.text("First line left", { contentEditable: false }), firstRight: fields.text("First line right", { contentEditable: false }), secondLeft: fields.text("Second line left", { contentEditable: false }), secondRight: fields.text("Second line right", { contentEditable: false }), description: fields.textarea("Description", { contentEditable: false }) } }),
  block({ type: "RB_batch11_hero_10", displayName: "React Bits Hero 10", catalogKey: "pro-block:hero-10", description: "Official React Bits Hero 10 media hero.", component: AdaptedHero10 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Hero", "Premium"], batchGroup: "HERO / PREMIUM", host: marketingHost, defaultProps: hero10ContentDefaults, fields: { heading: fields.inlineText("Heading"), description: fields.inlineTextarea("Description"), buttonLabel: fields.inlineText("Button label") } }),
  block({ type: "RB_batch11_hero_11", displayName: "React Bits Hero 11", catalogKey: "pro-block:hero-11", description: "Official React Bits Hero 11 split media hero.", component: AdaptedHero11 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Hero", "Premium"], batchGroup: "HERO / PREMIUM", host: marketingHost, defaultProps: hero11ContentDefaults, fields: { badge: fields.text("Badge", { contentEditable: false }), announcement: fields.text("Announcement", { contentEditable: false }), heading: fields.inlineText("Heading"), description: fields.inlineTextarea("Description"), primaryButtonLabel: fields.inlineText("Primary button label"), secondaryButtonLabel: fields.inlineText("Secondary button label"), mediaUrl: fields.imageUrl("Hero image", { defaultValue: hero11ContentDefaults.mediaUrl }) } }),
  block({ type: "RB_batch11_hero_14", displayName: "React Bits Hero 14", catalogKey: "pro-block:hero-14", description: "Official React Bits Hero 14 analytics hero.", component: AdaptedHero14 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Hero", "Premium"], batchGroup: "HERO / PREMIUM", host: marketingHost, defaultProps: { mediaUrl: hero14ContentDefaults.mediaUrl }, fields: { mediaUrl: fields.imageUrl("Hero image", { defaultValue: hero14ContentDefaults.mediaUrl }) }, formContent: hero14FormContent }),
  block({ type: "RB_batch11_hero_15", displayName: "React Bits Hero 15", catalogKey: "pro-block:hero-15", description: "Official React Bits Hero 15 editorial hero.", component: AdaptedHero15 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Hero", "Premium"], batchGroup: "HERO / PREMIUM", host: marketingHost, defaultProps: { badge: "Free for 30 days: limited offer", heading: "Build your future", intro: "Acme is your personal AI Business Advisor.", description: "Monitor your metrics, forecasts, revenue and optimize your growth strategy: all in one place.", ctaLabel: "Get started", inputPlaceholder: "Ask me anything...", footer: "Track everything. Ask anything." }, fields: { badge: fields.text("Badge", { contentEditable: false }), heading: fields.inlineText("Heading"), intro: fields.inlineText("Intro"), description: fields.inlineTextarea("Description"), ctaLabel: fields.inlineText("CTA label"), inputPlaceholder: fields.text("Input placeholder", { contentEditable: false }), footer: fields.inlineText("Footer") } }),
  block({ type: "RB_batch11_hero_20", displayName: "React Bits Hero 20", catalogKey: "pro-block:hero-20", description: "Official React Bits Hero 20 premium typographic hero.", component: AdaptedHero20 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Hero", "Premium"], batchGroup: "HERO / PREMIUM", host: marketingHost, defaultProps: hero20ContentDefaults, fields: { heading: fields.inlineText("Heading"), description: fields.inlineTextarea("Description"), primaryButtonLabel: fields.inlineText("Primary button label"), secondaryButtonLabel: fields.inlineText("Secondary button label"), trustLabel: fields.inlineText("Trust label") } }),
  block({ type: "RB_batch11_pricing_13", displayName: "React Bits Pricing 13", catalogKey: "pro-block:pricing-13", description: "Official React Bits Pricing 13 section.", component: AdaptedPricing13 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Pricing", "Premium"], batchGroup: "HERO / PREMIUM", host: marketingHost, nestedContent: pricing13NestedContent, controlGroups: advancedControlGroups.pricing13 }),
  block({ type: "RB_batch11_contact_11", displayName: "React Bits Contact 11", catalogKey: "pro-block:contact-11", description: "Official React Bits Contact 11 section.", component: AdaptedContact11 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Contact", "Premium"], batchGroup: "HERO / PREMIUM", host: marketingHost, arrayItems: contact11ArrayItems, controlGroups: advancedControlGroups.contact11 }),
];

const showcaseBlocks = [
  block({ type: "RB_batch11_social_proof_1", displayName: "React Bits Social Proof 1", catalogKey: "pro-block:social-proof-1", description: "Official React Bits Social Proof 1; two required local logo assets are absent from the registry and project.", sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Showcase", "Social Proof"], batchGroup: "SHOWCASE / MEDIA", host: marketingHost, batchStatus: "BLOCKED_REQUIRED_ASSET", blocker: "BLOCKED_REQUIRED_ASSET" }),
  block({ type: "RB_batch11_social_proof_13", displayName: "React Bits Social Proof 13", catalogKey: "pro-block:social-proof-13", description: "Official React Bits Social Proof 13 showcase.", component: AdaptedSocialProof13 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Showcase", "Social Proof"], batchGroup: "SHOWCASE / MEDIA", host: marketingHost, defaultProps: socialProof13ContentDefaults, fields: { eyebrow: fields.inlineText("Eyebrow"), heading: fields.inlineText("Heading"), description: fields.inlineTextarea("Description"), moreLabel: fields.inlineText("More label") } }),
  block({ type: "RB_batch11_social_proof_14", displayName: "React Bits Social Proof 14", catalogKey: "pro-block:social-proof-14", description: "Official React Bits Social Proof 14 testimonial media section.", component: AdaptedSocialProof14 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Showcase", "Social Proof"], batchGroup: "SHOWCASE / MEDIA", host: marketingHost, defaultProps: socialProof14ContentDefaults, fields: { heading: fields.inlineText("Heading"), description: fields.inlineTextarea("Description"), ratingValue: fields.inlineText("Rating"), reviewsLabel: fields.inlineText("Reviews label"), buttonLabel: fields.inlineText("Button label") } }),
  block({ type: "RB_batch11_social_proof_16", displayName: "React Bits Social Proof 16", catalogKey: "pro-block:social-proof-16", description: "Official React Bits Social Proof 16 testimonial media section.", component: AdaptedSocialProof16 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Showcase", "Social Proof"], batchGroup: "SHOWCASE / MEDIA", host: marketingHost, defaultProps: socialProof16ContentDefaults, fields: { featuredQuote: fields.inlineTextarea("Featured quote"), featuredName: fields.inlineText("Featured name"), featuredRole: fields.inlineText("Featured role"), companyLabel: fields.inlineText("Company label") } }),
  block({ type: "RB_batch11_ecommerce_10", displayName: "React Bits Ecommerce 10", catalogKey: "pro-block:ecommerce-10", description: "Official React Bits Ecommerce 10; its required official placeholder asset is absent from the registry and project.", sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Showcase", "Ecommerce"], batchGroup: "SHOWCASE / MEDIA", host: marketingHost, batchStatus: "BLOCKED_REQUIRED_ASSET", blocker: "BLOCKED_REQUIRED_ASSET" }),
  block({ type: "RB_batch11_about_10", displayName: "React Bits About 10", catalogKey: "pro-block:about-10", description: "Official React Bits About 10 team showcase.", component: AdaptedAbout10 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Showcase", "Media"], batchGroup: "SHOWCASE / MEDIA", host: marketingHost, defaultProps: about10ContentDefaults, fields: { eyebrow: fields.inlineText("Eyebrow"), headingLead: fields.inlineText("Heading lead"), headingBrand: fields.inlineText("Heading brand"), description: fields.inlineTextarea("Description"), buttonLabel: fields.inlineText("Button label"), partnersLabel: fields.inlineText("Partners label") } }),
  block({ type: "RB_batch11_about_12", displayName: "React Bits About 12", catalogKey: "pro-block:about-12", description: "Official React Bits About 12, replacing Ecommerce 10 after required-asset validation.", component: AdaptedAbout12 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Showcase", "Media"], batchGroup: "SHOWCASE / MEDIA", host: marketingHost, replacementFor: "pro-block:ecommerce-10", defaultProps: about12ContentDefaults, fields: { eyebrow: fields.inlineText("Eyebrow"), quote: fields.inlineTextarea("Quote"), authorName: fields.inlineText("Author name"), authorRole: fields.inlineText("Author role"), description: fields.inlineTextarea("Description") } }),
  block({ type: "RB_batch11_social_proof_12", displayName: "React Bits Social Proof 12", catalogKey: "pro-block:social-proof-12", description: "Official React Bits Social Proof 12, replacing Social Proof 1 after required-asset validation.", component: AdaptedSocialProof12 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Showcase", "Social Proof"], batchGroup: "SHOWCASE / MEDIA", host: marketingHost, replacementFor: "pro-block:social-proof-1", defaultProps: socialProof12ContentDefaults, fields: { heading: fields.inlineText("Heading"), description: fields.inlineTextarea("Description"), buttonLabel: fields.inlineText("Button label") } }),
];

const navigationBlocks = [
  block({ type: "RB_batch11_navigation_9", displayName: "React Bits Navigation 9", catalogKey: "pro-block:navigation-9", description: "Official React Bits Navigation 9.", component: AdaptedNavigation9 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Navigation"], batchGroup: "NAV / CTA / FOOTER", host: marketingHost, arrayItems: [navigation9LinkContract] }),
  block({ type: "RB_batch11_navigation_10", displayName: "React Bits Navigation 10", catalogKey: "pro-block:navigation-10", description: "Official React Bits Navigation 10; its menu did not open in Puck Interact mode after two diagnostics.", sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Navigation"], batchGroup: "NAV / CTA / FOOTER", host: marketingHost, batchStatus: "BLOCKED_PUCK_RENDER", blocker: "BLOCKED_PUCK_RENDER" }),
  block({ type: "RB_batch11_navigation_11", displayName: "React Bits Navigation 11", catalogKey: "pro-block:navigation-11", description: "Official React Bits Navigation 11.", component: AdaptedNavigation11 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Navigation"], batchGroup: "NAV / CTA / FOOTER", host: marketingHost, nestedContent: navigation11NestedContent, controlGroups: advancedControlGroups.navigation11 }),
  block({ type: "RB_batch11_navigation_12", displayName: "React Bits Navigation 12", catalogKey: "pro-block:navigation-12", description: "Official React Bits Navigation 12.", component: AdaptedNavigation12 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Navigation"], batchGroup: "NAV / CTA / FOOTER", host: marketingHost, arrayItems: [navigation12LinkContract] }),
  block({ type: "RB_batch11_navigation_14", displayName: "React Bits Navigation 14", catalogKey: "pro-block:navigation-14", description: "Official React Bits Navigation 14.", component: AdaptedNavigation14 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Navigation"], batchGroup: "NAV / CTA / FOOTER", host: marketingHost, nestedContent: navigation14NestedContent, controlGroups: advancedControlGroups.navigation14 }),
  block({ type: "RB_batch11_cta_10", displayName: "React Bits CTA 10", catalogKey: "pro-block:cta-10", description: "Official React Bits CTA 10.", component: AdaptedCta10 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "CTA"], batchGroup: "NAV / CTA / FOOTER", host: marketingHost, defaultProps: { mediaUrl: cta10ContentDefaults.mediaUrl }, fields: { mediaUrl: fields.imageUrl("CTA image", { defaultValue: cta10ContentDefaults.mediaUrl }) }, formContent: cta10FormContent }),
  block({ type: "RB_batch11_cta_13", displayName: "React Bits CTA 13", catalogKey: "pro-block:cta-13", description: "Official React Bits CTA 13.", component: AdaptedCta13 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "CTA"], batchGroup: "NAV / CTA / FOOTER", host: marketingHost, defaultProps: cta13ContentDefaults, fields: { eyebrow: fields.inlineText("Eyebrow"), headingPrefix: fields.inlineText("Heading prefix"), headingEmphasis: fields.inlineText("Heading emphasis"), headingSuffix: fields.inlineText("Heading suffix"), description: fields.inlineTextarea("Description"), buttonLabel: fields.inlineText("Button label"), helperText: fields.inlineText("Helper text") } }),
  block({ type: "RB_batch11_cta_14", displayName: "React Bits CTA 14", catalogKey: "pro-block:cta-14", description: "Official React Bits CTA 14.", component: AdaptedCta14 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "CTA"], batchGroup: "NAV / CTA / FOOTER", host: marketingHost, defaultProps: cta14ContentDefaults, fields: { eyebrow: fields.inlineText("Eyebrow"), heading: fields.inlineText("Heading"), description: fields.inlineTextarea("Description"), primaryButtonLabel: fields.inlineText("Primary button label"), secondaryButtonLabel: fields.inlineText("Secondary button label"), helperText: fields.inlineText("Helper text"), collaborationLabel: fields.inlineText("Collaboration label"), liveLabel: fields.inlineText("Live label") } }),
  block({ type: "RB_batch11_footer_7", displayName: "React Bits Footer 7", catalogKey: "pro-block:footer-7", description: "Official React Bits Footer 7.", component: AdaptedFooter7 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Footer"], batchGroup: "NAV / CTA / FOOTER", host: marketingHost, arrayItems: [footer7LinkContract] }),
  block({ type: "RB_batch11_footer_11", displayName: "React Bits Footer 11", catalogKey: "pro-block:footer-11", description: "Official React Bits Footer 11.", component: AdaptedFooter11 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Footer"], batchGroup: "NAV / CTA / FOOTER", host: marketingHost, defaultProps: footer11ContentDefaults, fields: { brandInitial: fields.text("Brand initial", { contentEditable: false }), brandName: fields.text("Brand name", { contentEditable: false }), description: fields.textarea("Description", { contentEditable: false }) } }),
  block({ type: "RB_batch11_navigation_15", displayName: "React Bits Navigation 15", catalogKey: "pro-block:navigation-15", description: "Official React Bits Navigation 15, replacing Navigation 10 after Puck interaction validation.", component: AdaptedNavigation15 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Navigation"], batchGroup: "NAV / CTA / FOOTER", host: marketingHost, replacementFor: "pro-block:navigation-10", arrayItems: [navigation15LinkContract] }),
];

const appBlocks = [
  block({ type: "RB_batch11_app_shell_4", displayName: "React Bits App Shell 4", catalogKey: "pro-block:app-shell-4", description: "Official React Bits App Shell 4; its filters did not change state in Puck Interact mode after two diagnostics.", sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "App Shell"], batchGroup: "APP / CONTENT", host: appHost(800), batchStatus: "BLOCKED_PUCK_RENDER", blocker: "BLOCKED_PUCK_RENDER" }),
  block({ type: "RB_batch11_app_shell_6", displayName: "React Bits App Shell 6", catalogKey: "pro-block:app-shell-6", description: "Official React Bits App Shell 6.", component: AppShell6 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "App Shell"], batchGroup: "APP / CONTENT", host: appHost(720) }),
  block({ type: "RB_batch11_app_shell_8", displayName: "React Bits App Shell 8", catalogKey: "pro-block:app-shell-8", description: "Official React Bits App Shell 8.", component: AppShell8 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "App Shell"], batchGroup: "APP / CONTENT", host: appHost(640) }),
  block({ type: "RB_batch11_app_sidebar_6", displayName: "React Bits App Sidebar 6", catalogKey: "pro-block:app-sidebar-6", description: "Official React Bits App Sidebar 6.", component: AdaptedAppSidebar6 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "App Sidebar"], batchGroup: "APP / CONTENT", host: appHost(640), nestedContent: appSidebar6NestedContent, controlGroups: advancedControlGroups.appSidebar6 }),
  block({ type: "RB_batch11_app_sidebar_7", displayName: "React Bits App Sidebar 7", catalogKey: "pro-block:app-sidebar-7", description: "Official React Bits App Sidebar 7.", component: AdaptedAppSidebar7 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "App Sidebar"], batchGroup: "APP / CONTENT", host: appHost(720), nestedContent: appSidebar7NestedContent, controlGroups: advancedControlGroups.appSidebar7 }),
  block({ type: "RB_batch11_card_8", displayName: "React Bits Card 8", catalogKey: "pro-block:card-8", description: "Official React Bits Card 8.", component: AdaptedCard8 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Cards", "Content"], batchGroup: "APP / CONTENT", host: appHost(560), defaultProps: card8ContentDefaults, fields: { clearLabel: fields.text("Clear label", { contentEditable: false }), downloadLabel: fields.text("Download label", { contentEditable: false }) } }),
  block({ type: "RB_batch11_card_9", displayName: "React Bits Card 9", catalogKey: "pro-block:card-9", description: "Official React Bits Card 9.", component: AdaptedCard9 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "Cards", "Content"], batchGroup: "APP / CONTENT", host: appHost(480), defaultProps: card9ContentDefaults, fields: { initials: fields.text("Initials", { contentEditable: false }), name: fields.text("Name", { contentEditable: false }), role: fields.text("Role", { contentEditable: false }), location: fields.text("Location", { contentEditable: false }), bio: fields.textarea("Bio", { contentEditable: false }), followLabel: fields.text("Follow label", { contentEditable: false }), followingLabel: fields.text("Following label", { contentEditable: false }), messageLabel: fields.text("Message label", { contentEditable: false }) } }),
  block({ type: "RB_batch11_list_1", displayName: "React Bits List 1", catalogKey: "pro-block:list-1", description: "Official React Bits List 1.", component: AdaptedList1 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "List", "Content"], batchGroup: "APP / CONTENT", host: appHost(560), defaultProps: list1ContentDefaults, fields: { heading: fields.text("Heading", { contentEditable: false }), description: fields.textarea("Description", { contentEditable: false }) } }),
  block({ type: "RB_batch11_app_shell_7", displayName: "React Bits App Shell 7", catalogKey: "pro-block:app-shell-7", description: "Official React Bits App Shell 7 replacement; its status popover did not open in Puck Interact mode after two diagnostics.", sourceKind: "pro-block", tags: ["React Bits Fast Batch 11", "App Shell"], batchGroup: "APP / CONTENT", host: appHost(720), batchStatus: "BLOCKED_PUCK_RENDER", blocker: "BLOCKED_PUCK_RENDER", replacementFor: "pro-block:app-shell-4" }),
];

const backgroundBlocks = [
  block({ type: "RB_batch11_scroll_mask", displayName: "React Bits Scroll Mask", catalogKey: "starter:scroll-mask-tw", description: "Official React Bits Scroll Mask with its intrinsic source runway.", component: ScrollMask as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 11", "Interactive", "Scroll"], batchGroup: "BACKGROUNDS / INTERACTIVE", host: scrollHost }),
  block({ type: "RB_batch11_rotating_cards", displayName: "React Bits Rotating Cards", catalogKey: "starter:rotating-cards-tw", description: "Official React Bits Rotating Cards with official numeric demo data.", component: RotatingCards as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 11", "Interactive", "Cards"], batchGroup: "BACKGROUNDS / INTERACTIVE", host: rotatingCardsHost, defaultProps: { cards: rotatingCards } }),
  block({ type: "RB_batch11_minimal_ripple", displayName: "React Bits Minimal Ripple", catalogKey: "starter:minimal-ripple-tw", description: "Official React Bits Minimal Ripple; its GPU diagnostic emitted a Three.js runtime warning.", sourceKind: "component", tags: ["React Bits Fast Batch 11", "Background", "WebGL"], batchGroup: "BACKGROUNDS / INTERACTIVE", host: canvasHost, batchStatus: "BLOCKED_GPU_RUNTIME", blocker: "BLOCKED_GPU_RUNTIME" }),
  block({ type: "RB_batch11_blinking_dots", displayName: "React Bits Blinking Dots", catalogKey: "starter:blinking-dots-tw", description: "Official React Bits Blinking Dots; its GPU diagnostic emitted a Three.js runtime warning.", sourceKind: "component", tags: ["React Bits Fast Batch 11", "Background", "WebGL"], batchGroup: "BACKGROUNDS / INTERACTIVE", host: canvasHost, batchStatus: "BLOCKED_GPU_RUNTIME", blocker: "BLOCKED_GPU_RUNTIME" }),
];

export const fastBatch11Blocks = [
  ...heroBlocks,
  ...showcaseBlocks,
  ...navigationBlocks,
  ...appBlocks,
  ...backgroundBlocks,
];
export const fastBatch11PuckBlocks = fastBatch11Blocks.filter(
  (entry): entry is FastBatch11Block & { component: AnyComponent } =>
    !entry.batchStatus.startsWith("BLOCKED") && Boolean(entry.component),
);
export const fastBatch11Components = Object.fromEntries(
  fastBatch11PuckBlocks.map((entry) => [
    entry.type,
    entry.sourceKind === "pro-block"
      ? createMarketingPuckComponent(entry as never)
      : createPuckComponent({ ...entry, readiness: "READY" } as never, { showLabLabel: false }),
  ]),
);
export const fastBatch11Categories = {
  fastBatch11: {
    title: "React Bits Fast Batch 11",
    defaultExpanded: false,
    components: fastBatch11PuckBlocks.map((entry) => entry.type),
  },
};
