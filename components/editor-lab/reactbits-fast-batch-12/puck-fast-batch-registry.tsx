"use client";

import type { ReactNode } from "react";
import { Hero18 } from "@/components/blocks/hero-18";
import { Blog1 } from "@/components/blocks/blog-1";
import { Blog2 } from "@/components/blocks/blog-2";
import { Blog3 } from "@/components/blocks/blog-3";
import Ecommerce1 from "@/components/blocks/ecommerce-1";
import Ecommerce2 from "@/components/blocks/ecommerce-2";
import Cta9 from "@/components/blocks/cta-9";
import Cta11 from "@/components/blocks/cta-11";
import Footer12 from "@/components/blocks/footer-12";
import Pricing7 from "@/components/blocks/pricing-7";
import Pricing8 from "@/components/blocks/pricing-8";
import Pricing9 from "@/components/blocks/pricing-9";
import Pricing10 from "@/components/blocks/pricing-10";
import Pricing12 from "@/components/blocks/pricing-12";
import Pricing14 from "@/components/blocks/pricing-14";
import Pricing15 from "@/components/blocks/pricing-15";
import Contact7 from "@/components/blocks/contact-7";
import Contact8 from "@/components/blocks/contact-8";
import Contact10 from "@/components/blocks/contact-10";
import Contact12 from "@/components/blocks/contact-12";
import { HowItWorks9 } from "@/components/blocks/how-it-works-9";
import AppShell9 from "@/components/blocks/app-shell-9";
import Navbar1 from "@/components/blocks/navbar-1";
import Navbar2 from "@/components/blocks/navbar-2";
import Navbar3 from "@/components/blocks/navbar-3";
import Navbar4 from "@/components/blocks/navbar-4";
import Navbar5 from "@/components/blocks/navbar-5";
import Navbar6 from "@/components/blocks/navbar-6";
import CommandMenu4 from "@/components/blocks/command-menu-4";
import CommandMenu5 from "@/components/blocks/command-menu-5";
import CommandMenu6 from "@/components/blocks/command-menu-6";
import Mobile1 from "@/components/blocks/mobile-1";
import Card10 from "@/components/blocks/card-10";
import Card11 from "@/components/blocks/card-11";
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
): FastBatch12Block => ({
  ...input,
  sourceKind: "pro-block",
  category: "React Bits Fast Batch 12",
  defaultProps: input.defaultProps ?? {},
  fields: input.fields ?? {},
  batchStatus: input.batchStatus ?? "DIRECT_RENDER_PASS",
});

const blockedPuckInteraction = (input: Parameters<typeof block>[0]) => block({
  ...input,
  description: `${input.description} Its click-driven official state did not update in Puck Interact mode.`,
  batchStatus: "BLOCKED_PUCK_RENDER",
  blocker: "BLOCKED_PUCK_RENDER",
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

const heroBlocks = [
  block({ type: "RB_batch12_hero_18", displayName: "React Bits Hero 18", catalogKey: "pro-block:hero-18", description: "Official React Bits Hero 18 premium section.", component: Hero18 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Hero", "Premium"], batchGroup: "HERO / PREMIUM", host: marketingHost }),
];

const showcaseBlocks = [
  block({ type: "RB_batch12_blog_1", displayName: "React Bits Blog 1", catalogKey: "pro-block:blog-1", description: "Official React Bits Blog 1 media grid.", component: Blog1 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Showcase", "Blog"], batchGroup: "SHOWCASE / MEDIA", host: marketingHost }),
  blockedPuckInteraction({ type: "RB_batch12_blog_2", displayName: "React Bits Blog 2", catalogKey: "pro-block:blog-2", description: "Official React Bits Blog 2 paginated media list.", component: Blog2 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Showcase", "Blog"], batchGroup: "SHOWCASE / MEDIA", host: marketingHost }),
  blockedPuckInteraction({ type: "RB_batch12_ecommerce_1", displayName: "React Bits Ecommerce 1", catalogKey: "pro-block:ecommerce-1", description: "Official React Bits Ecommerce 1 product detail showcase.", component: Ecommerce1 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Showcase", "Ecommerce"], batchGroup: "SHOWCASE / MEDIA", host: marketingHost }),
  blockedPuckInteraction({ type: "RB_batch12_ecommerce_2", displayName: "React Bits Ecommerce 2", catalogKey: "pro-block:ecommerce-2", description: "Official React Bits Ecommerce 2 product showcase.", component: Ecommerce2 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Showcase", "Ecommerce"], batchGroup: "SHOWCASE / MEDIA", host: marketingHost }),
];

const navigationBlocks = [
  block({ type: "RB_batch12_cta_9", displayName: "React Bits CTA 9", catalogKey: "pro-block:cta-9", description: "Official React Bits CTA 9.", component: Cta9 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "CTA"], batchGroup: "NAV / CTA / FOOTER", host: marketingHost }),
  block({ type: "RB_batch12_cta_11", displayName: "React Bits CTA 11", catalogKey: "pro-block:cta-11", description: "Official React Bits CTA 11.", component: Cta11 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "CTA"], batchGroup: "NAV / CTA / FOOTER", host: marketingHost }),
  block({ type: "RB_batch12_footer_12", displayName: "React Bits Footer 12", catalogKey: "pro-block:footer-12", description: "Official React Bits Footer 12.", component: Footer12 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Footer"], batchGroup: "NAV / CTA / FOOTER", host: marketingHost }),
  blockedPuckInteraction({ type: "RB_batch12_navbar_1", displayName: "React Bits Navbar 1", catalogKey: "pro-block:navbar-1", description: "Official React Bits App UI Navbar 1.", component: Navbar1 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Navigation", "App UI"], batchGroup: "NAV / CTA / FOOTER", host: appHost(480) }),
  blockedPuckInteraction({ type: "RB_batch12_navbar_2", displayName: "React Bits Navbar 2", catalogKey: "pro-block:navbar-2", description: "Official React Bits App UI Navbar 2.", component: Navbar2 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Navigation", "App UI"], batchGroup: "NAV / CTA / FOOTER", host: appHost(400) }),
  blockedPuckInteraction({ type: "RB_batch12_navbar_3", displayName: "React Bits Navbar 3", catalogKey: "pro-block:navbar-3", description: "Official React Bits App UI Navbar 3.", component: Navbar3 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Navigation", "App UI"], batchGroup: "NAV / CTA / FOOTER", host: appHost(480) }),
  blockedPuckInteraction({ type: "RB_batch12_navbar_4", displayName: "React Bits Navbar 4", catalogKey: "pro-block:navbar-4", description: "Official React Bits App UI Navbar 4.", component: Navbar4 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Navigation", "App UI"], batchGroup: "NAV / CTA / FOOTER", host: appHost(560) }),
  blockedPuckInteraction({ type: "RB_batch12_navbar_5", displayName: "React Bits Navbar 5", catalogKey: "pro-block:navbar-5", description: "Official React Bits App UI Navbar 5.", component: Navbar5 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Navigation", "App UI"], batchGroup: "NAV / CTA / FOOTER", host: appHost(640) }),
  blockedPuckInteraction({ type: "RB_batch12_navbar_6", displayName: "React Bits Navbar 6", catalogKey: "pro-block:navbar-6", description: "Official React Bits App UI Navbar 6.", component: Navbar6 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Navigation", "App UI"], batchGroup: "NAV / CTA / FOOTER", host: appHost(480) }),
];

const pricingBlocks = [
  blockedPuckInteraction({ type: "RB_batch12_pricing_7", displayName: "React Bits Pricing 7", catalogKey: "pro-block:pricing-7", description: "Official React Bits Pricing 7.", component: Pricing7 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Pricing"], batchGroup: "PRICING / CONTACT", host: marketingHost }),
  blockedPuckInteraction({ type: "RB_batch12_pricing_8", displayName: "React Bits Pricing 8", catalogKey: "pro-block:pricing-8", description: "Official React Bits Pricing 8.", component: Pricing8 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Pricing"], batchGroup: "PRICING / CONTACT", host: marketingHost }),
  blockedPuckInteraction({ type: "RB_batch12_pricing_9", displayName: "React Bits Pricing 9", catalogKey: "pro-block:pricing-9", description: "Official React Bits Pricing 9.", component: Pricing9 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Pricing"], batchGroup: "PRICING / CONTACT", host: marketingHost }),
  blockedPuckInteraction({ type: "RB_batch12_pricing_10", displayName: "React Bits Pricing 10", catalogKey: "pro-block:pricing-10", description: "Official React Bits Pricing 10.", component: Pricing10 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Pricing"], batchGroup: "PRICING / CONTACT", host: marketingHost }),
  blockedPuckInteraction({ type: "RB_batch12_pricing_12", displayName: "React Bits Pricing 12", catalogKey: "pro-block:pricing-12", description: "Official React Bits Pricing 12.", component: Pricing12 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Pricing"], batchGroup: "PRICING / CONTACT", host: marketingHost }),
  blockedPuckInteraction({ type: "RB_batch12_pricing_14", displayName: "React Bits Pricing 14", catalogKey: "pro-block:pricing-14", description: "Official React Bits Pricing 14.", component: Pricing14 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Pricing"], batchGroup: "PRICING / CONTACT", host: marketingHost }),
  blockedPuckInteraction({ type: "RB_batch12_pricing_15", displayName: "React Bits Pricing 15", catalogKey: "pro-block:pricing-15", description: "Official React Bits Pricing 15.", component: Pricing15 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Pricing"], batchGroup: "PRICING / CONTACT", host: marketingHost }),
  block({ type: "RB_batch12_contact_7", displayName: "React Bits Contact 7", catalogKey: "pro-block:contact-7", description: "Official React Bits Contact 7.", component: Contact7 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Contact"], batchGroup: "PRICING / CONTACT", host: marketingHost }),
  block({ type: "RB_batch12_contact_8", displayName: "React Bits Contact 8", catalogKey: "pro-block:contact-8", description: "Official React Bits Contact 8.", component: Contact8 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Contact"], batchGroup: "PRICING / CONTACT", host: marketingHost }),
  block({ type: "RB_batch12_contact_10", displayName: "React Bits Contact 10", catalogKey: "pro-block:contact-10", description: "Official React Bits Contact 10.", component: Contact10 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Contact"], batchGroup: "PRICING / CONTACT", host: marketingHost }),
  block({ type: "RB_batch12_contact_12", displayName: "React Bits Contact 12", catalogKey: "pro-block:contact-12", description: "Official React Bits Contact 12.", component: Contact12 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Contact"], batchGroup: "PRICING / CONTACT", host: marketingHost }),
];

const appBlocks = [
  blockedPuckInteraction({ type: "RB_batch12_app_shell_9", displayName: "React Bits App Shell 9", catalogKey: "pro-block:app-shell-9", description: "Official React Bits App Shell 9.", component: AppShell9 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "App Shell", "App UI"], batchGroup: "APP / CONTENT", host: appHost(720) }),
  blockedPuckInteraction({ type: "RB_batch12_mobile_1", displayName: "React Bits Mobile 1", catalogKey: "pro-block:mobile-1", description: "Official React Bits Mobile UI 1.", component: Mobile1 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Mobile", "App UI"], batchGroup: "APP / CONTENT", host: appHost(680) }),
  block({ type: "RB_batch12_card_10", displayName: "React Bits Card 10", catalogKey: "pro-block:card-10", description: "Official React Bits App UI Card 10.", component: Card10 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Card", "Content", "App UI"], batchGroup: "APP / CONTENT", host: appHost(560) }),
  block({ type: "RB_batch12_card_11", displayName: "React Bits Card 11", catalogKey: "pro-block:card-11", description: "Official React Bits App UI Card 11.", component: Card11 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Card", "Content", "App UI"], batchGroup: "APP / CONTENT", host: appHost(640) }),
  blockedPuckInteraction({ type: "RB_batch12_list_7", displayName: "React Bits List 7", catalogKey: "pro-block:list-7", description: "Official React Bits App UI List 7.", component: List7 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "List", "Content", "App UI"], batchGroup: "APP / CONTENT", host: appHost(640) }),
  blockedPuckInteraction({ type: "RB_batch12_list_8", displayName: "React Bits List 8", catalogKey: "pro-block:list-8", description: "Official React Bits App UI List 8.", component: List8 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "List", "Content", "App UI"], batchGroup: "APP / CONTENT", host: appHost(560) }),
  blockedPuckInteraction({ type: "RB_batch12_list_9", displayName: "React Bits List 9", catalogKey: "pro-block:list-9", description: "Official React Bits App UI List 9.", component: List9 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "List", "Content", "App UI"], batchGroup: "APP / CONTENT", host: appHost(640) }),
  blockedPuckInteraction({ type: "RB_batch12_list_10", displayName: "React Bits List 10", catalogKey: "pro-block:list-10", description: "Official React Bits App UI List 10.", component: List10 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "List", "Content", "App UI"], batchGroup: "APP / CONTENT", host: appHost(560) }),
  blockedPuckInteraction({ type: "RB_batch12_list_11", displayName: "React Bits List 11", catalogKey: "pro-block:list-11", description: "Official React Bits App UI List 11.", component: List11 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "List", "Content", "App UI"], batchGroup: "APP / CONTENT", host: appHost(640) }),
  blockedPuckInteraction({ type: "RB_batch12_list_12", displayName: "React Bits List 12", catalogKey: "pro-block:list-12", description: "Official React Bits App UI List 12.", component: List12 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "List", "Content", "App UI"], batchGroup: "APP / CONTENT", host: appHost(640) }),
  blockedPuckInteraction({ type: "RB_batch12_onboarding_5", displayName: "React Bits Onboarding 5", catalogKey: "pro-block:onboarding-5", description: "Official React Bits App UI Onboarding 5.", component: Onboarding5 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Onboarding", "App UI"], batchGroup: "APP / CONTENT", host: appHost(640) }),
  block({ type: "RB_batch12_onboarding_6", displayName: "React Bits Onboarding 6", catalogKey: "pro-block:onboarding-6", description: "Official React Bits App UI Onboarding 6.", component: Onboarding6 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Onboarding", "App UI"], batchGroup: "APP / CONTENT", host: appHost(560) }),
  blockedPuckInteraction({ type: "RB_batch12_onboarding_7", displayName: "React Bits Onboarding 7", catalogKey: "pro-block:onboarding-7", description: "Official React Bits App UI Onboarding 7.", component: Onboarding7 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Onboarding", "App UI"], batchGroup: "APP / CONTENT", host: appHost(640) }),
  blockedPuckInteraction({ type: "RB_batch12_forms_4", displayName: "React Bits Forms 4", catalogKey: "pro-block:forms-4", description: "Official React Bits App UI Forms 4.", component: Forms4 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Forms", "App UI"], batchGroup: "APP / CONTENT", host: appHost(720) }),
  blockedPuckInteraction({ type: "RB_batch12_forms_5", displayName: "React Bits Forms 5", catalogKey: "pro-block:forms-5", description: "Official React Bits App UI Forms 5.", component: Forms5 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Forms", "App UI"], batchGroup: "APP / CONTENT", host: appHost(720) }),
  blockedPuckInteraction({ type: "RB_batch12_forms_6", displayName: "React Bits Forms 6", catalogKey: "pro-block:forms-6", description: "Official React Bits App UI Forms 6.", component: Forms6 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Forms", "App UI"], batchGroup: "APP / CONTENT", host: appHost(1040) }),
  blockedPuckInteraction({ type: "RB_batch12_settings_form_2", displayName: "React Bits Settings Form 2", catalogKey: "pro-block:settings-form-2", description: "Official React Bits App UI Settings Form 2.", component: SettingsForm2 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Settings", "Forms", "App UI"], batchGroup: "APP / CONTENT", host: appHost(800) }),
  blockedPuckInteraction({ type: "RB_batch12_settings_form_3", displayName: "React Bits Settings Form 3", catalogKey: "pro-block:settings-form-3", description: "Official React Bits App UI Settings Form 3.", component: SettingsForm3 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Settings", "Forms", "App UI"], batchGroup: "APP / CONTENT", host: appHost(800) }),
  blockedPuckInteraction({ type: "RB_batch12_settings_form_4", displayName: "React Bits Settings Form 4", catalogKey: "pro-block:settings-form-4", description: "Official React Bits App UI Settings Form 4.", component: SettingsForm4 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Settings", "Forms", "App UI"], batchGroup: "APP / CONTENT", host: appHost(720) }),
  blockedPuckInteraction({ type: "RB_batch12_scheduling_3", displayName: "React Bits Scheduling 3", catalogKey: "pro-block:scheduling-3", description: "Official React Bits App UI Scheduling 3.", component: Scheduling3 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Scheduling", "App UI"], batchGroup: "APP / CONTENT", host: appHost(720) }),
];

const interactiveBlocks = [
  blockedPuckInteraction({ type: "RB_batch12_command_menu_4", displayName: "React Bits Command Menu 4", catalogKey: "pro-block:command-menu-4", description: "Official React Bits App UI Command Menu 4.", component: CommandMenu4 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Interactive", "Command Menu", "App UI"], batchGroup: "BACKGROUNDS / INTERACTIVE", host: appHost(400) }),
  blockedPuckInteraction({ type: "RB_batch12_command_menu_5", displayName: "React Bits Command Menu 5", catalogKey: "pro-block:command-menu-5", description: "Official React Bits App UI Command Menu 5.", component: CommandMenu5 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Interactive", "Command Menu", "App UI"], batchGroup: "BACKGROUNDS / INTERACTIVE", host: appHost(560) }),
  blockedPuckInteraction({ type: "RB_batch12_command_menu_6", displayName: "React Bits Command Menu 6", catalogKey: "pro-block:command-menu-6", description: "Official React Bits App UI Command Menu 6.", component: CommandMenu6 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Interactive", "Command Menu", "App UI"], batchGroup: "BACKGROUNDS / INTERACTIVE", host: appHost(480) }),
];

const otherBlocks = [
  blockedPuckInteraction({ type: "RB_batch12_blog_3", displayName: "React Bits Blog 3", catalogKey: "pro-block:blog-3", description: "Official React Bits Blog 3 filterable content list.", component: Blog3 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "Blog", "Content"], batchGroup: "OTHER", host: marketingHost }),
  blockedPuckInteraction({ type: "RB_batch12_how_it_works_9", displayName: "React Bits How It Works 9", catalogKey: "pro-block:how-it-works-9", description: "Official React Bits How It Works 9 section.", component: HowItWorks9 as unknown as AnyComponent, tags: ["React Bits Fast Batch 12", "How It Works"], batchGroup: "OTHER", host: marketingHost }),
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
