"use client";

import type { ReactNode } from "react";
import { AdaptedCta8 } from "@/components/editor-lab/adapted/cta-8";
import Contact9 from "@/components/blocks/contact-9";
import HowItWorks1 from "@/components/blocks/how-it-works-1";
import Hero4 from "@/components/blocks/hero-4";
import Hero17 from "@/components/blocks/hero-17";
import Hero19 from "@/components/blocks/hero-19";
import Blog6 from "@/components/blocks/blog-6";
import Ecommerce7 from "@/components/blocks/ecommerce-7";
import CTA12 from "@/components/blocks/cta-12";
import Hero5 from "@/components/blocks/hero-5";
import AdaptedAuth3, { auth3ContentDefaults } from "@/components/editor-lab/adapted/auth-3";
import Hero12 from "@/components/blocks/hero-12";
import CursorWave from "@/components/react-bits/cursor-wave";
import GradientCarousel from "@/components/react-bits/gradient-carousel";
import SmoothCursor from "@/components/react-bits/smooth-cursor";
import { createPuckComponent } from "@/components/editor-lab/puck/block-contract";
import type { ReactBitsHostSpec } from "@/components/editor-lab/puck/reactbits-host";
import { createMarketingPuckComponent } from "@/components/editor-lab/puck-v3/marketing-puck-component";
import { fields } from "@/components/editor-lab/puck/field-helpers";
import { bindFormContentContract, defineFormContentContract, type FormContentContract } from "@/components/editor-lab/puck/form-content-contract";

type AnyComponent = (props: Record<string, unknown>) => ReactNode;
type BatchGroup = "CURSORS" | "GALLERIES" | "BACKGROUNDS";
type BatchStatus =
  | "DIRECT_RENDER_PASS"
  | "BLOCKED_BROWSER_RUNTIME"
  | "BLOCKED_PUCK_RENDER";

type FastBatchBlock = {
  type: string;
  displayName: string;
  catalogKey: string;
  description: string;
  component: AnyComponent;
  sourceKind: "component" | "pro-block";
  tags: readonly string[];
  defaultProps: Record<string, unknown>;
  fields: Record<string, unknown>;
  formContent?: FormContentContract;
  host: ReactBitsHostSpec;
  category: "React Bits Fast Batch 9";
  batchGroup: BatchGroup;
  batchStatus: BatchStatus;
  blocker?: "BLOCKED_BROWSER_RUNTIME" | "BLOCKED_PUCK_RENDER";
};

const block = (
  input: Omit<FastBatchBlock, "category" | "defaultProps" | "fields" | "batchStatus"> & {
    defaultProps?: Record<string, unknown>;
    fields?: Record<string, unknown>;
    batchStatus?: BatchStatus;
    blocker?: "BLOCKED_BROWSER_RUNTIME" | "BLOCKED_PUCK_RENDER";
  },
): FastBatchBlock => {
  const boundFormContent = bindFormContentContract(
    input.formContent,
    input.fields ?? {},
    input.defaultProps ?? {},
  );
  return {
    ...input,
    category: "React Bits Fast Batch 9",
    defaultProps: boundFormContent.defaults,
    fields: boundFormContent.fields,
    batchStatus: input.batchStatus ?? "DIRECT_RENDER_PASS",
  };
};

const auth3FormContent = defineFormContentContract({
  slots: [
    { slot: "heading", label: "Heading", type: "text", defaultValue: auth3ContentDefaults.heading },
    { slot: "newUserLabel", label: "New-user prompt", type: "text", defaultValue: auth3ContentDefaults.newUserLabel },
    { slot: "createAccountLabel", label: "Create-account link", type: "text", defaultValue: auth3ContentDefaults.createAccountLabel },
    { slot: "emailPlaceholder", label: "Email placeholder", type: "text", defaultValue: auth3ContentDefaults.emailPlaceholder },
    { slot: "continueLabel", label: "Submit button label", type: "text", defaultValue: auth3ContentDefaults.continueLabel },
    { slot: "dividerLabel", label: "Divider label", type: "text", defaultValue: auth3ContentDefaults.dividerLabel },
    { slot: "googleLabel", label: "Google button label", type: "text", defaultValue: auth3ContentDefaults.googleLabel },
    { slot: "appleLabel", label: "Apple button label", type: "text", defaultValue: auth3ContentDefaults.appleLabel },
    { slot: "githubLabel", label: "GitHub button label", type: "text", defaultValue: auth3ContentDefaults.githubLabel },
    { slot: "viewMoreLabel", label: "View-more button label", type: "text", defaultValue: auth3ContentDefaults.viewMoreLabel },
    { slot: "helpPrompt", label: "Help prompt", type: "text", defaultValue: auth3ContentDefaults.helpPrompt },
    { slot: "helpLabel", label: "Help link label", type: "text", defaultValue: auth3ContentDefaults.helpLabel },
    { slot: "productTitle", label: "Product title", type: "text", defaultValue: auth3ContentDefaults.productTitle },
    { slot: "productDescription", label: "Product description", type: "textarea", defaultValue: auth3ContentDefaults.productDescription },
  ],
});

const componentHost: ReactBitsHostSpec = {
  profile: "section",
  width: "full",
  height: "intrinsic",
  overflow: "source",
  runtimeRisk: "dom",
};

const marketingHost: ReactBitsHostSpec = {
  profile: "section",
  width: "full",
  height: "intrinsic",
  overflow: "source",
  runtimeRisk: "none",
};

const cursorBlocks = [
  block({ type: "RB_batch9_cursor_wave", displayName: "React Bits Cursor Wave", catalogKey: "component:cursor-wave", description: "Official React Bits Cursor Wave.", component: CursorWave as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 9", "Cursor"], batchGroup: "CURSORS", host: componentHost, batchStatus: "BLOCKED_PUCK_RENDER", blocker: "BLOCKED_PUCK_RENDER" }),
  block({ type: "RB_batch9_smooth_cursor", displayName: "React Bits Smooth Cursor", catalogKey: "component:smooth-cursor", description: "Official React Bits Smooth Cursor.", component: SmoothCursor as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 9", "Cursor"], batchGroup: "CURSORS", host: componentHost, batchStatus: "BLOCKED_PUCK_RENDER", blocker: "BLOCKED_PUCK_RENDER" }),
  block({ type: "RB_batch9_cta_8", displayName: "React Bits CTA 8 Cursor Reveal", catalogKey: "pro-block:cta-8", description: "Official React Bits CTA 8 cursor reveal.", component: AdaptedCta8 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 9", "Cursor"], batchGroup: "CURSORS", host: marketingHost, defaultProps: { buttonLabel: "Start creating", trialLabel: "Free for 14 days", word: "Horizon" }, fields: { buttonLabel: fields.text("Button label", { contentEditable: false }), trialLabel: fields.text("Trial label", { contentEditable: false }), word: fields.text("Display word", { contentEditable: false }) } }),
  block({ type: "RB_batch9_hero_19", displayName: "React Bits Hero 19 Pointer Parallax", catalogKey: "pro-block:hero-19", description: "Official React Bits Hero 19 pointer parallax.", component: Hero19 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 9", "Cursor"], batchGroup: "CURSORS", host: marketingHost }),
];

const galleryBlocks = [
  block({ type: "RB_batch9_gradient_carousel", displayName: "React Bits Gradient Carousel", catalogKey: "component:gradient-carousel", description: "Official React Bits Gradient Carousel.", component: GradientCarousel as unknown as AnyComponent, sourceKind: "component", tags: ["React Bits Fast Batch 9", "Gallery"], batchGroup: "GALLERIES", host: componentHost, batchStatus: "BLOCKED_PUCK_RENDER", blocker: "BLOCKED_PUCK_RENDER" }),
  block({ type: "RB_batch9_contact_9", displayName: "React Bits Contact 9 Photo Carousel", catalogKey: "pro-block:contact-9", description: "Official React Bits Contact 9 photo carousel.", component: Contact9 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 9", "Gallery"], batchGroup: "GALLERIES", host: marketingHost }),
  block({ type: "RB_batch9_how_it_works_1", displayName: "React Bits How It Works 1 Carousel", catalogKey: "pro-block:how-it-works-1", description: "Official React Bits How It Works 1 carousel.", component: HowItWorks1 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 9", "Gallery"], batchGroup: "GALLERIES", host: marketingHost }),
  block({ type: "RB_batch9_hero_4", displayName: "React Bits Hero 4 Video Carousel", catalogKey: "pro-block:hero-4", description: "Official React Bits Hero 4 video carousel.", component: Hero4 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 9", "Gallery"], batchGroup: "GALLERIES", host: marketingHost, batchStatus: "BLOCKED_BROWSER_RUNTIME", blocker: "BLOCKED_BROWSER_RUNTIME" }),
  block({ type: "RB_batch9_hero_17", displayName: "React Bits Hero 17 Image Grid", catalogKey: "pro-block:hero-17", description: "Official React Bits Hero 17 image grid.", component: Hero17 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 9", "Gallery"], batchGroup: "GALLERIES", host: marketingHost }),
  block({ type: "RB_batch9_blog_6", displayName: "React Bits Blog 6 Portfolio Grid", catalogKey: "pro-block:blog-6", description: "Official React Bits Blog 6 portfolio grid.", component: Blog6 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 9", "Gallery"], batchGroup: "GALLERIES", host: marketingHost }),
  block({ type: "RB_batch9_ecommerce_7", displayName: "React Bits Ecommerce 7 Gallery", catalogKey: "pro-block:ecommerce-7", description: "Official React Bits Ecommerce 7 category gallery.", component: Ecommerce7 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 9", "Gallery"], batchGroup: "GALLERIES", host: marketingHost }),
];

const backgroundBlocks = [
  block({ type: "RB_batch9_cta_12", displayName: "React Bits CTA 12 Blueprint Grid", catalogKey: "pro-block:cta-12", description: "Official React Bits CTA 12 blueprint background.", component: CTA12 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 9", "Background"], batchGroup: "BACKGROUNDS", host: marketingHost }),
  block({ type: "RB_batch9_hero_5", displayName: "React Bits Hero 5 Gradient Orbs", catalogKey: "pro-block:hero-5", description: "Official React Bits Hero 5 gradient-orb background.", component: Hero5 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 9", "Background"], batchGroup: "BACKGROUNDS", host: marketingHost, batchStatus: "BLOCKED_BROWSER_RUNTIME", blocker: "BLOCKED_BROWSER_RUNTIME" }),
  block({ type: "RB_batch9_auth_3", displayName: "React Bits Auth 3 Image Background", catalogKey: "pro-block:auth-3", description: "Official React Bits Auth 3 image background.", component: AdaptedAuth3 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 9", "Background"], batchGroup: "BACKGROUNDS", host: marketingHost, formContent: auth3FormContent }),
  block({ type: "RB_batch9_hero_12", displayName: "React Bits Hero 12 Curved Background", catalogKey: "pro-block:hero-12", description: "Official React Bits Hero 12 curved image background.", component: Hero12 as unknown as AnyComponent, sourceKind: "pro-block", tags: ["React Bits Fast Batch 9", "Background"], batchGroup: "BACKGROUNDS", host: marketingHost }),
];

export const fastBatch9Blocks = [...cursorBlocks, ...galleryBlocks, ...backgroundBlocks];
export const fastBatch9PuckBlocks = fastBatch9Blocks.filter(
  (entry) => entry.batchStatus === "DIRECT_RENDER_PASS",
);
export const fastBatch9Components = Object.fromEntries(
  fastBatch9PuckBlocks.map((entry) => [
    entry.type,
    entry.sourceKind === "pro-block"
      ? createMarketingPuckComponent(entry as never)
      : createPuckComponent({ ...entry, readiness: "READY" } as never, { showLabLabel: false }),
  ]),
);
export const fastBatch9Categories = {
  fastBatch9: {
    title: "React Bits Fast Batch 9",
    defaultExpanded: false,
    components: fastBatch9PuckBlocks.map((entry) => entry.type),
  },
};
