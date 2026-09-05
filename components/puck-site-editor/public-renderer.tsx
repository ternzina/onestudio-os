"use client";

import { Suspense, type CSSProperties, type ReactNode, type Ref } from "react";
import { assertPuckDocument, type PuckDocumentComponent, type PuckDocumentV1 } from "@/lib/puck-site-editor/document";
import { PUCK_COMMON_PROP_RULES } from "@/lib/puck-site-editor/registry-manifest";
import {
  PUCK_PRODUCTION_REGISTRY_BY_ID,
  type PuckProductionRegistryEntry,
} from "./production-registry";
import styles from "./public-renderer.module.css";
import {
  resolvePuckProductionPresentationStyle,
  type ProductionRuntimeMode,
} from "@/lib/puck-site-editor/presentation-runtime";

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
  const resolvedProps = { ...entry.defaults, ...component.props };
  const componentProps = Object.fromEntries(
    Object.entries(resolvedProps).filter(([key]) => !(key in PUCK_COMMON_PROP_RULES)),
  );
  return { entry, componentProps, resolvedProps };
}

function ProductionSourceHost({
  entry,
  runtimeMode,
  children,
}: {
  entry: PuckProductionRegistryEntry;
  runtimeMode: ProductionRuntimeMode;
  children: ReactNode;
}) {
  const spec = entry.host;
  const presentationContract = entry.presentationContract;
  const presentationStyle = resolvePuckProductionPresentationStyle(presentationContract, runtimeMode);
  const fallbackHeight = entry.definiteHeight;
  if (!spec && !fallbackHeight && !presentationContract) return <>{children}</>;

  const style: CSSProperties & Record<string, string | number | undefined> = {
    width: "100%",
    minWidth: 0,
    position: "relative",
    ...presentationStyle,
  };
  if (fallbackHeight) {
    style.height = fallbackHeight;
    style.minHeight = fallbackHeight;
  }
  if (spec?.height === "technical-definite" && spec.technicalHeight) {
    style.height = spec.technicalHeight.value;
    style.minHeight = spec.technicalHeight.value;
  }
  if (spec?.height === "source-min" && spec.sourceMinHeight) {
    style.minHeight = spec.sourceMinHeight.value;
  }
  if (spec?.height === "aspect" && spec.aspectRatio) style.aspectRatio = spec.aspectRatio.value;
  if (!presentationContract && spec?.overflow === "clip") style.overflow = "hidden";
  if (spec?.align === "center") {
    style.display = "flex";
    style.alignItems = "center";
  }
  if (spec?.surfaceBackground) style.backgroundColor = spec.surfaceBackground.value;
  if (spec?.sourceCssVariable) style[spec.sourceCssVariable.name] = spec.sourceCssVariable.value;
  if (spec?.profile === "flow" && spec.width === "content") {
    if (spec.responsiveFit?.mode === "contain") {
      style.containerType = "inline-size";
      style.display = "flex";
      style.justifyContent = "center";
    } else {
      style.overflowX = "auto";
    }
  }

  const content = spec?.profile === "flow" && spec.width === "content" ? (
    <div
      data-production-content-rail="true"
      style={{
        display: "flex",
        width: spec.responsiveFit
          ? `${spec.responsiveFit.intrinsicWidth.value}px`
          : "max-content",
        minWidth: spec.responsiveFit ? undefined : "100%",
        height: spec.height === "technical-definite" ? "100%" : undefined,
        justifyContent: spec.responsiveFit ? "flex-start" : "center",
        zoom: spec.responsiveFit
          ? `min(1, calc(100cqw / ${spec.responsiveFit.intrinsicWidth.value}px))`
          : undefined,
      }}
    >
      {children}
    </div>
  ) : children;

  return (
    <div
      data-production-host-profile={spec?.profile ?? entry.runtimeFamily ?? "definite"}
      data-production-runtime-risk={spec?.runtimeRisk ?? "none"}
      data-production-presentation-geometry={presentationContract?.geometry.kind}
      style={style}
    >
      {content}
    </div>
  );
}

export function PuckProductionBlock({
  component,
  dragRef,
  runtimeMode = "public",
}: {
  component: PuckDocumentComponent;
  dragRef?: Ref<HTMLDivElement>;
  runtimeMode?: ProductionRuntimeMode;
}) {
  const { entry, componentProps, resolvedProps: props } = splitProps(component);
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
      data-production-component={entry.id}
      data-puck-taxonomy={entry.taxonomy}
      data-mobile-hidden={String(props.mobileHidden === true)}
      data-mobile-width={String(props.mobileWidth ?? "inherit")}
      data-motion={String(props.motion ?? "default")}
      style={style}
    >
      <Suspense fallback={<div data-production-component-loading style={{ minHeight: entry.definiteHeight ?? 120 }} />}>
        <ProductionSourceHost entry={entry} runtimeMode={runtimeMode}>
          {entry.renderPublic(componentProps)}
        </ProductionSourceHost>
      </Suspense>
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
