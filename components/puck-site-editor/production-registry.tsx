"use client";

import type { ComponentType, ReactNode } from "react";
import {
  PUCK_PRODUCTION_MANIFEST,
  type PuckRegistryManifestEntry,
} from "@/lib/puck-site-editor/registry-manifest";
import { PUCK_PRODUCTION_COMPONENTS_BY_CATALOG_KEY } from "./production-component-sources";

type PublicRenderer = (props: Record<string, unknown>) => ReactNode;

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
    const Source = PUCK_PRODUCTION_COMPONENTS_BY_CATALOG_KEY[manifest.catalogKey];
    if (!Source) throw new Error(`Missing production Puck renderer: ${manifest.id}`);
    const publicRenderer: PublicRenderer = (props) => <Source {...props} />;
    const editorRenderer = publicRenderer;
    const EditorComponent = (props: Record<string, unknown>) => (
      <PublicComponentAdapter {...props} renderer={editorRenderer} />
    );
    return { ...manifest, renderPublic: publicRenderer, editorComponent: EditorComponent };
  });

export const PUCK_PRODUCTION_REGISTRY_BY_ID = new Map(
  PUCK_PRODUCTION_REGISTRY.map((entry) => [entry.id, entry]),
);
