"use client";

import type { CSSProperties, ReactNode } from "react";

export type ReactBitsHostProfile =
  | "flow"
  | "section"
  | "app-surface"
  | "canvas"
  | "aspect-media";

export type ReactBitsHostSpec = {
  profile: ReactBitsHostProfile;
  width: "full" | "content";
  height: "intrinsic" | "source-min" | "technical-definite" | "aspect";
  align?: "start" | "center";
  overflow?: "source" | "clip";
  sourceMinHeight?: { value: number; provenance: "official-source" };
  technicalHeight?: { value: number; provenance: "puck-technical" };
  sourceCssVariable?: {
    name: string;
    value: string;
    provenance: "official-contract";
  };
  aspectRatio?: {
    value: string;
    provenance: "official-source" | "official-demo";
  };
  responsiveFit?: {
    mode: "contain";
    intrinsicWidth: { value: number; provenance: "official-source" };
  };
  surfaceBackground?: {
    value: string;
    provenance: "official-source" | "official-demo";
  };
  runtimeRisk?: "none" | "dom" | "observer" | "resize-observer" | "webgl";
};

function resolvedStyle(spec: ReactBitsHostSpec): CSSProperties {
  const style: CSSProperties = {
    width: "100%",
    minWidth: 0,
    position: "relative",
  };

  // Flow/content sources commonly expose a fixed intrinsic surface. Keep that
  // surface intact and let proven fixed-width contracts opt into a
  // presentation-only contain scale at narrow widths.
  if (spec.profile === "flow" && spec.width === "content") {
    if (spec.responsiveFit?.mode === "contain") {
      style.containerType = "inline-size";
      style.display = "flex";
      style.justifyContent = "center";
    } else {
      style.overflowX = "auto";
    }
  }

  if (spec.align === "center") {
    style.display = "flex";
    style.alignItems = "center";
  }

  if (spec.height === "technical-definite" && spec.technicalHeight) {
    style.height = spec.technicalHeight.value;
    style.minHeight = spec.technicalHeight.value;
  }

  if (spec.height === "source-min" && spec.sourceMinHeight) {
    style.minHeight = spec.sourceMinHeight.value;
  }

  if (spec.overflow === "clip") style.overflow = "hidden";

  if (spec.height === "aspect" && spec.aspectRatio) {
    style.aspectRatio = spec.aspectRatio.value;
  }

  if (spec.surfaceBackground) {
    style.backgroundColor = spec.surfaceBackground.value;
  }

  if (spec.sourceCssVariable) {
    Object.assign(style, {
      [spec.sourceCssVariable.name]: spec.sourceCssVariable.value,
    });
  }

  return style;
}

/**
 * Generic Puck host for original React Bits source. It only supplies the
 * typed technical boundary; visual implementation and official props remain
 * inside the source component.
 */
export function ReactBitsHost({
  spec,
  children,
}: {
  spec?: ReactBitsHostSpec;
  children: ReactNode;
}) {
  if (!spec) return <>{children}</>;

  const needsContentRail = spec.profile === "flow" && spec.width === "content";
  const responsiveFit = spec.responsiveFit?.mode === "contain"
    ? spec.responsiveFit
    : undefined;

  const content = needsContentRail ? (
    <div
      data-reactbits-content-rail="true"
      style={{
        display: "flex",
        width: responsiveFit
          ? `${responsiveFit.intrinsicWidth.value}px`
          : "max-content",
        minWidth: responsiveFit ? undefined : "100%",
        height: spec.height === "technical-definite" ? "100%" : undefined,
        justifyContent: responsiveFit ? "flex-start" : "center",
        zoom: responsiveFit
          ? `min(1, calc(100cqw / ${responsiveFit.intrinsicWidth.value}px))`
          : undefined,
      }}
    >
      {children}
    </div>
  ) : children;

  return (
    <div
      data-reactbits-host-profile={spec.profile}
      data-reactbits-host-width={spec.width}
      data-reactbits-host-height={spec.height}
      data-reactbits-runtime-risk={spec.runtimeRisk ?? "none"}
      style={resolvedStyle(spec)}
    >
      {content}
    </div>
  );
}
