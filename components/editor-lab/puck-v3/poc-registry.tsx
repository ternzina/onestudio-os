"use client";

import type { ReactNode } from "react";
import { createPuckComponent, defineBlock, type RuntimeFamily } from "@/components/editor-lab/puck/block-contract";
import { createMarketingPuckComponent } from "./marketing-puck-component";
import { Hero13 } from "@/components/blocks/hero-13";
import Showcase5 from "@/components/blocks/showcase-5";
import Navigation5 from "@/components/blocks/navigation-5";
import DotShift from "@/components/react-bits/dot-shift";
import Flicker from "@/components/react-bits/flicker";
import FrameBorder from "@/components/react-bits/frame-border";
import LightDroplets from "@/components/react-bits/light-droplets";
import Lightspeed from "@/components/react-bits/lightspeed";
import PixelReveal from "@/components/react-bits/pixel-reveal";
import Portal from "@/components/react-bits/portal";
import Navigation13 from "@/components/blocks/navigation-13";
import { Hero16 } from "@/components/blocks/hero-16";
import Showcase4 from "@/components/blocks/showcase-4";
import { Features1 } from "@/components/blocks/features-1";
import HowItWorks4 from "@/components/blocks/how-it-works-4";
import About1 from "@/components/blocks/about-1";
import SocialProof6 from "@/components/blocks/social-proof-6";
import SocialProof3 from "@/components/blocks/social-proof-3";
import Contact2 from "@/components/blocks/contact-2";
import Footer3 from "@/components/blocks/footer-3";
import {
  control3Blocks,
  control3Categories,
  control3Components,
} from "@/components/editor-lab/reactbits-control-3/puck-control-registry";
import {
  control6Blocks,
  control6Categories,
  control6Components,
} from "@/components/editor-lab/reactbits-control-6/puck-control-registry";
import {
  fastBatch1Blocks,
  fastBatch1Categories,
  fastBatch1Components,
  fastBatch1PuckBlocks,
} from "@/components/editor-lab/reactbits-fast-batch-1/puck-fast-batch-registry";
import {
  fastBatch2Blocks,
  fastBatch2Categories,
  fastBatch2Components,
  fastBatch2PuckBlocks,
} from "@/components/editor-lab/reactbits-fast-batch-2/puck-fast-batch-registry";
import {
  fastBatch3Blocks,
  fastBatch3Categories,
  fastBatch3Components,
  fastBatch3PuckBlocks,
} from "@/components/editor-lab/reactbits-fast-batch-3/puck-fast-batch-registry";
import {
  fastBatch4Blocks,
  fastBatch4Categories,
  fastBatch4Components,
  fastBatch4PuckBlocks,
} from "@/components/editor-lab/reactbits-fast-batch-4/puck-fast-batch-registry";
import {
  fastBatch5Blocks,
  fastBatch5Categories,
  fastBatch5Components,
  fastBatch5PuckBlocks,
} from "@/components/editor-lab/reactbits-fast-batch-5/puck-fast-batch-registry";
import {
  fastBatch6Blocks,
  fastBatch6Categories,
  fastBatch6Components,
  fastBatch6PuckBlocks,
} from "@/components/editor-lab/reactbits-fast-batch-6/puck-fast-batch-registry";
import {
  fastBatch7Blocks,
  fastBatch7Categories,
  fastBatch7Components,
  fastBatch7PuckBlocks,
} from "@/components/editor-lab/reactbits-fast-batch-7/puck-fast-batch-registry";
import {
  fastBatch8Blocks,
  fastBatch8Categories,
  fastBatch8Components,
  fastBatch8PuckBlocks,
} from "@/components/editor-lab/reactbits-fast-batch-8/puck-fast-batch-registry";
import {
  fastBatch9Blocks,
  fastBatch9Categories,
  fastBatch9Components,
  fastBatch9PuckBlocks,
} from "@/components/editor-lab/reactbits-fast-batch-9/puck-fast-batch-registry";
import {
  fastBatch10Blocks,
  fastBatch10Categories,
  fastBatch10Components,
  fastBatch10PuckBlocks,
} from "@/components/editor-lab/reactbits-fast-batch-10/puck-fast-batch-registry";
import {
  fastBatch11Blocks,
  fastBatch11Categories,
  fastBatch11Components,
  fastBatch11PuckBlocks,
} from "@/components/editor-lab/reactbits-fast-batch-11/puck-fast-batch-registry";

type AnyComponent = (props: Record<string, unknown>) => ReactNode;
const poc = <Props extends Record<string, unknown>>(input: {
  type: string;
  displayName: string;
  catalogKey: string;
  component: AnyComponent;
  defaultProps?: Props;
  runtimeFamily?: RuntimeFamily;
  definiteHeight?: number;
}) => defineBlock({
  ...input,
  category: "POC Components",
  description: `Puck V3 POC: ${input.displayName}`,
  sourceKind: input.catalogKey.startsWith("pro-block") ? "pro-block" : "component",
  tags: ["React Bits", "Puck V3"],
  readiness: "READY" as const,
  defaultProps: (input.defaultProps ?? {}) as Props,
  fields: {},
  runtimeFamily: input.runtimeFamily,
  definiteHeight: input.definiteHeight,
});

const manualPocBlocks = [
  poc({ type: "RB_navigation_13", displayName: "Navigation 13", catalogKey: "pro-block:navigation-13", component: Navigation13 as unknown as AnyComponent }),
  poc({ type: "RB_hero_16", displayName: "Hero 16", catalogKey: "pro-block:hero-16", component: Hero16 as unknown as AnyComponent }),
  poc({ type: "RB_showcase_4", displayName: "Showcase 4", catalogKey: "pro-block:showcase-4", component: Showcase4 as unknown as AnyComponent }),
  poc({ type: "RB_features_1", displayName: "Features 1", catalogKey: "pro-block:features-1", component: Features1 as unknown as AnyComponent }),
  poc({ type: "RB_how_it_works_4", displayName: "How It Works 4", catalogKey: "pro-block:how-it-works-4", component: HowItWorks4 as unknown as AnyComponent }),
  poc({ type: "RB_about_1", displayName: "About 1", catalogKey: "pro-block:about-1", component: About1 as unknown as AnyComponent }),
  poc({ type: "RB_social_proof_6", displayName: "Social Proof 6", catalogKey: "pro-block:social-proof-6", component: SocialProof6 as unknown as AnyComponent }),
  poc({ type: "RB_social_proof_3", displayName: "Social Proof 3", catalogKey: "pro-block:social-proof-3", component: SocialProof3 as unknown as AnyComponent }),
  poc({ type: "RB_contact_2", displayName: "Contact 2", catalogKey: "pro-block:contact-2", component: Contact2 as unknown as AnyComponent }),
  poc({ type: "RB_footer_3", displayName: "Footer 3", catalogKey: "pro-block:footer-3", component: Footer3 as unknown as AnyComponent }),
  poc({ type: "RB_hero_13", displayName: "Hero 13", catalogKey: "pro-block:hero-13", component: Hero13 as unknown as AnyComponent }),
  poc({ type: "RB_showcase_5", displayName: "Showcase 5", catalogKey: "pro-block:showcase-5", component: Showcase5 as unknown as AnyComponent }),
  poc({ type: "RB_navigation_5", displayName: "Navigation 5", catalogKey: "pro-block:navigation-5", component: Navigation5 as unknown as AnyComponent }),
  poc({ type: "RB_pixel_reveal", displayName: "Pixel Reveal", catalogKey: "component:pixel-reveal", component: PixelReveal as unknown as AnyComponent, defaultProps: { imageSrc: "/svg/placeholder.svg", width: "100%", height: "100%", gridSize: 20, duration: 1.6, autoTrigger: true } }),
  poc({ type: "RB_portal", displayName: "Portal", catalogKey: "component:portal", component: Portal as unknown as AnyComponent }),
  poc({ type: "RB_lightspeed", displayName: "Lightspeed", catalogKey: "component:lightspeed", component: Lightspeed as unknown as AnyComponent, runtimeFamily: "full-surface" }),
  poc({ type: "RB_light_droplets", displayName: "Light Droplets", catalogKey: "component:light-droplets", component: LightDroplets as unknown as AnyComponent, runtimeFamily: "full-surface" }),
  poc({ type: "RB_frame_border", displayName: "Frame Border", catalogKey: "component:frame-border", component: FrameBorder as unknown as AnyComponent, runtimeFamily: "full-surface" }),
  poc({ type: "RB_flicker", displayName: "Flicker", catalogKey: "component:flicker", component: Flicker as unknown as AnyComponent, runtimeFamily: "full-surface" }),
  poc({ type: "RB_dot_shift", displayName: "Dot Shift", catalogKey: "component:dot-shift", component: DotShift as unknown as AnyComponent, runtimeFamily: "full-surface" }),
];

// Stable foundation deliberately registers a small, explicit set of blocks.
// The official React Bits catalog is metadata-only at this boundary and will be
// connected in a later integration stage after each source is verified.
export const pocBlocks = [...manualPocBlocks, ...control3Blocks, ...control6Blocks, ...fastBatch1PuckBlocks, ...fastBatch2PuckBlocks, ...fastBatch3PuckBlocks, ...fastBatch4PuckBlocks, ...fastBatch5PuckBlocks, ...fastBatch6PuckBlocks, ...fastBatch7PuckBlocks, ...fastBatch8PuckBlocks, ...fastBatch9PuckBlocks, ...fastBatch10PuckBlocks, ...fastBatch11PuckBlocks];

const duplicateValues = (values: string[]) => [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
const duplicateCatalogKeys = duplicateValues(pocBlocks.map((block) => block.catalogKey));
const duplicateTypes = duplicateValues(pocBlocks.map((block) => block.type));

if (duplicateCatalogKeys.length || duplicateTypes.length) {
  throw new Error(
    `Puck V3 registry identity collision: catalogKeys=[${duplicateCatalogKeys.join(", ")}] types=[${duplicateTypes.join(", ")}]`,
  );
}

export const pocRegistryAccounting = {
  wholesaleComponents: 0,
  manualPocComponentsBeforeFilter: manualPocBlocks.length,
  overlapWithWholesale: 0,
  removedDuplicateRegistrations: 0,
  totalPocBlocksBeforeDedupe: pocBlocks.length,
  currentOfficialComponents: control3Blocks.length + control6Blocks.length + fastBatch1Blocks.length + fastBatch2Blocks.length + fastBatch3Blocks.length + fastBatch4Blocks.length + fastBatch5Blocks.length + fastBatch6Blocks.length + fastBatch7Blocks.length + fastBatch8Blocks.length + fastBatch9Blocks.length + fastBatch10Blocks.length + fastBatch11Blocks.length,
  canonicalSourceOnlyComponents: [...control3Blocks, ...control6Blocks, ...fastBatch1Blocks, ...fastBatch2Blocks, ...fastBatch3Blocks, ...fastBatch4Blocks, ...fastBatch5Blocks, ...fastBatch6Blocks, ...fastBatch7Blocks, ...fastBatch8Blocks, ...fastBatch9Blocks, ...fastBatch10Blocks, ...fastBatch11Blocks].map((block) => block.catalogKey),
  finalUniqueComponentKeys: new Set(pocBlocks.map((block) => block.catalogKey)).size,
  finalUniqueTypes: new Set(pocBlocks.map((block) => block.type)).size,
  duplicateCatalogKeys,
  duplicateTypes,
};

export const pocBlockByCatalogKey = new Map(pocBlocks.map((block) => [block.catalogKey, block]));
export const pocComponents = {
  ...Object.fromEntries(manualPocBlocks.map((block) => [
  block.type,
  block.sourceKind === "pro-block"
    ? createMarketingPuckComponent(block as never)
    : createPuckComponent(block as never, { showLabLabel: false }),
  ])),
  ...control3Components,
  ...control6Components,
  ...fastBatch1Components,
  ...fastBatch2Components,
  ...fastBatch3Components,
  ...fastBatch4Components,
  ...fastBatch5Components,
  ...fastBatch6Components,
  ...fastBatch7Components,
  ...fastBatch8Components,
  ...fastBatch9Components,
  ...fastBatch10Components,
  ...fastBatch11Components,
};
export const pocCategories = {
  ...control3Categories,
  ...control6Categories,
  ...fastBatch1Categories,
  ...fastBatch2Categories,
  ...fastBatch3Categories,
  ...fastBatch4Categories,
  ...fastBatch5Categories,
  ...fastBatch6Categories,
  ...fastBatch7Categories,
  ...fastBatch8Categories,
  ...fastBatch9Categories,
  ...fastBatch10Categories,
  ...fastBatch11Categories,
  officialReactBits: {
    title: "Official React Bits",
    defaultExpanded: true,
    components: pocBlocks.filter((block) => block.catalogKey.startsWith("component:") || block.catalogKey.startsWith("starter:")).map((block) => block.type),
  },
  marketingBlocks: {
    title: "Marketing Blocks",
    defaultExpanded: false,
    components: pocBlocks.filter((block) => block.catalogKey.startsWith("pro-block:")).map((block) => block.type),
  },
  experimentalCurrentFree: {
    title: "Experimental / Current-free",
    defaultExpanded: false,
    components: pocBlocks.filter((block) => block.catalogKey.startsWith("current-free:")).map((block) => block.type),
  },
};
