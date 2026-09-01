"use client";

import type { ComponentType, ReactNode } from "react";
import AdaptedContact6 from "./adapted/contact-6";
import AdaptedCta9 from "./adapted/cta-9";
import AdaptedHero14 from "./adapted/hero-14";
import AdaptedNavigation12 from "./adapted/navigation-12";
import { AdaptedPricing3 } from "./adapted/pricing-3";
import Scheduling3 from "@/components/blocks/scheduling-3";
import SocialProof10 from "@/components/blocks/social-proof-10";
import GlowCursor from "@/components/react-bits/GlowCursor";
import {
  PUCK_PRODUCTION_MANIFEST,
  type PuckRegistryManifestEntry,
} from "@/lib/puck-site-editor/registry-manifest";

type PublicRenderer = (props: Record<string, unknown>) => ReactNode;

const rendererImplementations: Readonly<Record<string, PublicRenderer>> = {
  "adapted-navigation-12": (props) => (
    <AdaptedNavigation12 links={props.links as Parameters<typeof AdaptedNavigation12>[0]["links"]} />
  ),
  "adapted-hero-14": (props) => (
    <AdaptedHero14 {...(props as Parameters<typeof AdaptedHero14>[0])} />
  ),
  "adapted-cta-9": (props) => (
    <AdaptedCta9 {...(props as Parameters<typeof AdaptedCta9>[0])} />
  ),
  "adapted-pricing-3": (props) => (
    <AdaptedPricing3 plans={props.plans as Parameters<typeof AdaptedPricing3>[0]["plans"]} />
  ),
  "official-social-proof-10": () => <SocialProof10 />,
  "official-scheduling-3": () => <Scheduling3 />,
  "adapted-contact-6": (props) => (
    <AdaptedContact6 {...(props as Parameters<typeof AdaptedContact6>[0])} />
  ),
  "official-glow-cursor": (props) => (
    <div className="relative h-[480px] min-h-[480px] w-full overflow-hidden bg-neutral-950">
      <GlowCursor {...(props as Parameters<typeof GlowCursor>[0])} />
    </div>
  ),
};

export type PuckProductionRegistryEntry = PuckRegistryManifestEntry & {
  renderPublic: PublicRenderer;
  editorComponent: ComponentType<Record<string, unknown>>;
};

function PublicComponentAdapter({
  renderer,
  ...props
}: Record<string, unknown> & { renderer: PublicRenderer }) {
  return renderer(props);
}

export const PUCK_PRODUCTION_REGISTRY: readonly PuckProductionRegistryEntry[] =
  PUCK_PRODUCTION_MANIFEST.map((manifest) => {
    const publicRenderer = rendererImplementations[manifest.publicRenderer];
    const editorRenderer = rendererImplementations[manifest.editorAdapter];
    if (!publicRenderer || !editorRenderer) {
      throw new Error(`Missing production Puck renderer: ${manifest.id}`);
    }
    const EditorComponent = (props: Record<string, unknown>) => (
      <PublicComponentAdapter {...props} renderer={editorRenderer} />
    );
    return { ...manifest, renderPublic: publicRenderer, editorComponent: EditorComponent };
  });

export const PUCK_PRODUCTION_REGISTRY_BY_ID = new Map(
  PUCK_PRODUCTION_REGISTRY.map((entry) => [entry.id, entry]),
);
