"use client";

import { Suspense, useImperativeHandle, useRef, type CSSProperties, type ReactNode, type Ref } from "react";
import { assertPuckDocument, type PuckDocumentComponent, type PuckDocumentV1 } from "@/lib/puck-site-editor/document";
import {
  PUCK_PRODUCTION_REGISTRY_BY_ID,
  type PuckProductionRegistryEntry,
} from "./production-registry";
import {
  resolvePuckProductionBackgroundRouting,
  resolvePuckProductionSourceProps,
  type PuckProductionBackgroundRouting,
} from "@/lib/puck-site-editor/production-background";
import {
  resolvePuckRuntimeRealm,
  shouldUseIframeNativeRuntime,
  type ProductionRuntimeMode,
} from "@/lib/puck-site-editor/runtime-realm";
import { interactionPolicyDataset } from "@/lib/puck-site-editor/interaction-policy";
import { resolvePuckMainLogicalViewportWidth } from "@/lib/puck-site-editor/main-responsive-geometry";
import { resolvePuckProductionAuthoringStage } from "@/lib/puck-site-editor/presentation-runtime";
import styles from "./public-renderer.module.css";
import {
  ProductionEditorThemeProvider,
  useProductionEditorTheme,
} from "./production-editor-ux";
import { ProductionRuntimeFrame } from "./production-runtime-frame";
import { useInsideProductionRuntime, useProductionRuntimeMode } from "./production-runtime-context";

const visiblePresentationOverflowStyle: CSSProperties = {
  overflow: "visible",
  overflowX: "visible",
  overflowY: "visible",
};

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
  const backgroundRouting = resolvePuckProductionBackgroundRouting(
    entry.backgroundCapability,
    resolvedProps.backgroundColor,
    entry.defaults.backgroundColor,
  );
  const componentProps = resolvePuckProductionSourceProps(resolvedProps, entry.sourcePropKeys, backgroundRouting);
  return { entry, componentProps, resolvedProps, backgroundRouting };
}

function ProductionSourceHost({
  entry,
  backgroundRouting,
  runtimeMode,
  mainLogicalViewportWidth,
  children,
}: {
  entry: PuckProductionRegistryEntry;
  backgroundRouting: PuckProductionBackgroundRouting;
  runtimeMode: ProductionRuntimeMode;
  mainLogicalViewportWidth?: number;
  children: ReactNode;
}) {
  const spec = entry.host;
  const presentationContract = entry.presentationContract;
  const rootLayout = presentationContract?.rootLayout;
  const presentationGeometry = presentationContract?.geometry;
  const presentationOverflow = presentationContract?.overflow;
  const preservesVisiblePresentationOverflow = presentationOverflow === "visible";
  const isWrapperTarget = backgroundRouting.target === "wrapper";
  const isFullSurface = presentationGeometry?.kind === "fullSurface";
  const fallbackHeight = entry.definiteHeight;
  const shouldRenderHost = Boolean(spec || fallbackHeight || presentationGeometry || isWrapperTarget);
  if (!shouldRenderHost) return <>{children}</>;
  const authoringStage = runtimeMode !== "public"
    ? resolvePuckProductionAuthoringStage(presentationContract)
    : undefined;
  const usesAuthoringAspectRatio = runtimeMode !== "public"
    && presentationGeometry?.aspectRatio?.provenance === "editorPresentationDefault";

  const presentationHostStyle: CSSProperties = {};
  if (presentationContract?.technicalRuntime && runtimeMode === "public") {
    presentationHostStyle.height = presentationContract.technicalRuntime.height.value;
    presentationHostStyle.minHeight = presentationContract.technicalRuntime.height.value;
  }
  if (authoringStage && !usesAuthoringAspectRatio) {
    presentationHostStyle.height = authoringStage.height;
    presentationHostStyle.minHeight = authoringStage.height;
  }
  if (presentationGeometry?.minHeight) presentationHostStyle.minHeight = presentationGeometry.minHeight.value;
  if (presentationGeometry?.aspectRatio && (
    presentationGeometry.aspectRatio.provenance !== "editorPresentationDefault"
    || usesAuthoringAspectRatio
  )) {
    presentationHostStyle.aspectRatio = presentationGeometry.aspectRatio.value;
  }
  if (presentationGeometry?.viewportHeight) {
    presentationHostStyle.height = presentationGeometry.viewportHeight.value;
    presentationHostStyle.minHeight = presentationGeometry.viewportHeight.value;
  }
  if (runtimeMode === "library-preview" && isFullSurface) {
    presentationHostStyle.height = "100%";
    presentationHostStyle.minHeight = "100%";
  }
  const hasPresentationHeight = presentationHostStyle.height !== undefined
    || presentationHostStyle.minHeight !== undefined
    || presentationHostStyle.aspectRatio !== undefined;
  const style: CSSProperties & Record<string, string | number | undefined> = {
    width: mainLogicalViewportWidth ?? "100%",
    maxWidth: "100%",
    minWidth: 0,
    position: "relative",
    ...presentationHostStyle,
  };
  if (fallbackHeight && !hasPresentationHeight) {
    style.height = fallbackHeight;
    style.minHeight = fallbackHeight;
  }
  if (!hasPresentationHeight) {
    if (spec?.height === "technical-definite" && spec.technicalHeight) {
      style.height = spec.technicalHeight.value;
      style.minHeight = spec.technicalHeight.value;
    }
    if (spec?.height === "source-min" && spec.sourceMinHeight) {
      style.minHeight = spec.sourceMinHeight.value;
    }
    if (spec?.height === "aspect" && spec.aspectRatio) style.aspectRatio = spec.aspectRatio.value;
  }
  if (!presentationContract && spec?.overflow === "clip") {
    style.overflow = "hidden";
  }
  if (spec?.align === "center") {
    style.display = "flex";
    style.alignItems = "center";
  }
  if (spec?.surfaceBackground) style.backgroundColor = spec.surfaceBackground.value;
  if (spec?.sourceCssVariable) style[spec.sourceCssVariable.name] = spec.sourceCssVariable.value;
  if (backgroundRouting.wrapper) style.backgroundColor = backgroundRouting.wrapper;
  if (backgroundRouting.cssVariable) {
    style[backgroundRouting.cssVariable.name] = backgroundRouting.cssVariable.value;
  }
  const responsiveFit = spec?.profile === "flow" && spec.width === "content"
    ? spec.responsiveFit?.mode === "contain" ? spec.responsiveFit : undefined
    : undefined;
  if (spec?.profile === "flow" && spec.width === "content") {
    if (responsiveFit) {
      style.containerType = "inline-size";
      style.display = "flex";
      style.justifyContent = "center";
    } else if (!preservesVisiblePresentationOverflow) {
      style.overflowX = "auto";
    }
  }
  if (rootLayout) {
    style.display = rootLayout.display;
    style.alignItems = rootLayout.alignItems;
    style.justifyContent = rootLayout.justifyContent;
  }
  if (preservesVisiblePresentationOverflow && style.overflow !== "hidden") {
    style.overflow = "visible";
    style.overflowX = "visible";
    style.overflowY = "visible";
  }

  const source = backgroundRouting.sourceRoot ? (
    <div
      className={styles.sourceRootBackgroundBridge}
      data-production-background-target="sourceRoot"
      style={{ "--puck-source-background": backgroundRouting.sourceRoot } as CSSProperties}
    >
      {children}
    </div>
  ) : children;

  const content = spec?.profile === "flow" && spec.width === "content" ? (
    <div
      data-production-content-rail="true"
      style={{
        display: "flex",
        width: responsiveFit ? `${responsiveFit.intrinsicWidth.value}px` : "max-content",
        minWidth: responsiveFit ? undefined : "100%",
        height: spec.height === "technical-definite" ? "100%" : undefined,
        justifyContent: responsiveFit ? "flex-start" : "center",
        ...(preservesVisiblePresentationOverflow ? visiblePresentationOverflowStyle : {}),
      }}
    >
      {source}
    </div>
  ) : source;

  return (
    <div
      data-production-host-profile={spec?.profile ?? presentationGeometry?.kind ?? entry.runtimeFamily ?? "definite"}
      data-production-runtime-risk={spec?.runtimeRisk ?? "none"}
      data-production-background-target={backgroundRouting.target}
      data-production-presentation-geometry={presentationGeometry?.kind}
      data-production-presentation-root-layout={rootLayout ? "flex-center" : undefined}
      style={style}
    >
      {content}
    </div>
  );
}

export function PuckProductionBlock({
  component,
  dragRef,
  mainViewportWidth,
  runtimeMode = "public",
}: {
  component: PuckDocumentComponent;
  dragRef?: Ref<HTMLDivElement>;
  /** Editor-only logical width; never supplied by Library or public render. */
  mainViewportWidth?: number | string;
  runtimeMode?: ProductionRuntimeMode;
}) {
  const { entry, componentProps, resolvedProps: props, backgroundRouting } = splitProps(component);
  const isInsideRuntime = useInsideProductionRuntime();
  const runtimeContextMode = useProductionRuntimeMode();
  const effectiveRuntimeMode = isInsideRuntime && runtimeContextMode ? runtimeContextMode : runtimeMode;
  const isDark = useProductionEditorTheme();
  const rootRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(dragRef, () => rootRef.current as HTMLDivElement);
  const loadingHeight = entry.definiteHeight
    ?? entry.presentationContract?.geometry.minHeight?.value
    ?? 120;
  const presentationContract = entry.presentationContract;
  const isFullSurface = presentationContract?.geometry.kind === "fullSurface";
  const mainLogicalViewportWidth = effectiveRuntimeMode !== "library-preview" && isFullSurface
    ? resolvePuckMainLogicalViewportWidth(mainViewportWidth)
    : undefined;
  const useLibraryPreviewViewportRuntime = effectiveRuntimeMode === "library-preview"
    && presentationContract?.geometry.kind === "viewport";
  const useIframeNativeRuntime = !isInsideRuntime && (
    shouldUseIframeNativeRuntime(entry, effectiveRuntimeMode)
    || useLibraryPreviewViewportRuntime
  );
  const style = {
    "--puck-block-max-width": widths[String(props.layoutWidth)] ?? widths.full,
    "--puck-block-padding": spacing[String(props.paddingY)] ?? spacing.none,
    "--puck-block-background": "transparent",
    "--puck-block-text": entry.textColorCapability.target === "wrapper"
      ? String(props.textColor ?? "inherit")
      : "inherit",
    "--puck-block-align": String(props.align ?? "left"),
    width: mainLogicalViewportWidth,
    marginInline: mainLogicalViewportWidth === undefined ? undefined : 0,
    height: effectiveRuntimeMode === "library-preview" && isFullSurface ? "100%" : undefined,
    minHeight: effectiveRuntimeMode === "library-preview" && isFullSurface ? "100%" : undefined,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={styles.surface}
      data-production-component={entry.id}
      data-puck-taxonomy={entry.taxonomy}
      data-mobile-hidden={String(props.mobileHidden === true)}
      data-mobile-width={String(props.mobileWidth ?? "inherit")}
      data-motion={String(props.motion ?? "default")}
      data-production-presentation={presentationContract?.provenance}
      data-production-presentation-target={presentationContract?.target}
      data-production-presentation-overflow={presentationContract?.overflow}
      data-production-presentation-geometry={presentationContract?.geometry.kind}
      {...interactionPolicyDataset(entry.interactionPolicy)}
      data-puck-runtime-realm={resolvePuckRuntimeRealm(entry)}
      data-puck-runtime-mode={effectiveRuntimeMode}
      style={style}
    >
      <Suspense fallback={<div data-production-component-loading style={{ minHeight: loadingHeight }} />}>
        <ProductionSourceHost
          entry={entry}
          backgroundRouting={backgroundRouting}
          runtimeMode={effectiveRuntimeMode}
          mainLogicalViewportWidth={mainLogicalViewportWidth}
        >
          {useIframeNativeRuntime ? (
            <ProductionRuntimeFrame
              component={component}
              background={entry.host?.surfaceBackground?.value}
              theme={isDark ? "dark" : "light"}
              runtimeMode={effectiveRuntimeMode}
            />
          ) : entry.renderPublic(componentProps)}
        </ProductionSourceHost>
      </Suspense>
    </div>
  );
}

export default function PuckPublicRenderer({ document }: { document: PuckDocumentV1 }) {
  const validated = assertPuckDocument(document);
  const theme = validated.root.props.theme === "dark" ? "dark" : "light";
  const hasVisiblePresentation = validated.content.some((component) =>
    PUCK_PRODUCTION_REGISTRY_BY_ID.get(component.type)?.presentationContract?.overflow === "visible",
  );
  return (
    <ProductionEditorThemeProvider isDark={theme === "dark"}>
      <main
        className={`${styles.page} ${theme === "dark" ? "dark" : ""}`}
        data-puck-document-version={validated.version}
        data-puck-registry-version={validated.registryVersion}
        data-puck-preview-theme={theme}
        data-puck-visible-presentation={hasVisiblePresentation ? "true" : undefined}
      >
        {validated.content.map((component) => (
          <PuckProductionBlock key={component.props.id} component={component} />
        ))}
      </main>
    </ProductionEditorThemeProvider>
  );
}
