"use client";

import type { CSSProperties, Ref } from "react";
import { assertPuckDocument, type PuckDocumentComponent, type PuckDocumentV1 } from "@/lib/puck-site-editor/document";
import { PUCK_COMMON_PROP_RULES } from "@/lib/puck-site-editor/registry-manifest";
import { PUCK_PRODUCTION_REGISTRY_BY_ID } from "./production-registry";
import styles from "./public-renderer.module.css";

const widths: Record<string, string> = {
  full: "none",
  wide: "1400px",
  medium: "1024px",
  narrow: "768px",
};
const spacing: Record<string, string> = {
  none: "0",
  compact: "24px",
  normal: "48px",
  airy: "80px",
};

function splitProps(component: PuckDocumentComponent) {
  const entry = PUCK_PRODUCTION_REGISTRY_BY_ID.get(component.type);
  if (!entry) throw new Error(`Unknown production Puck component: ${component.type}`);
  const componentProps = Object.fromEntries(
    Object.entries(component.props).filter(([key]) => !(key in PUCK_COMMON_PROP_RULES)),
  );
  return { entry, componentProps };
}

export function PuckProductionBlock({
  component,
  dragRef,
}: {
  component: PuckDocumentComponent;
  dragRef?: Ref<HTMLDivElement>;
}) {
  const { entry, componentProps } = splitProps(component);
  const props = component.props;
  const style = {
    "--puck-block-max-width": widths[String(props.layoutWidth)] ?? widths.full,
    "--puck-block-padding": spacing[String(props.paddingY)] ?? spacing.none,
    "--puck-block-background": String(props.backgroundColor ?? "transparent"),
    "--puck-block-text": String(props.textColor ?? "inherit"),
    "--puck-block-align": String(props.align ?? "left"),
  } as CSSProperties;

  return (
    <div
      ref={dragRef}
      className={styles.surface}
      data-puck-component={entry.id}
      data-puck-taxonomy={entry.taxonomy}
      data-mobile-hidden={String(props.mobileHidden === true)}
      data-mobile-width={String(props.mobileWidth ?? "inherit")}
      data-motion={String(props.motion ?? "default")}
      style={style}
    >
      {entry.renderPublic(componentProps)}
    </div>
  );
}

export default function PuckPublicRenderer({ document }: { document: PuckDocumentV1 }) {
  const validated = assertPuckDocument(document);
  return (
    <main className={styles.page} data-puck-document-version={validated.version} data-puck-registry-version={validated.registryVersion}>
      {validated.content.map((component) => (
        <PuckProductionBlock key={component.props.id} component={component} />
      ))}
    </main>
  );
}
