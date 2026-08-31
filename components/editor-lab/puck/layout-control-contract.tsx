"use client";

import type { CSSProperties, ReactNode } from "react";
import { fields } from "./field-helpers";
import type { ControlGroupContract } from "./control-groups";
import styles from "./layout-control-contract.module.css";
import {
  readBlockStyleValues,
  type BlockStyleContract,
} from "./block-style-contract";

const SOURCE_VALUE = "source";

export const layoutControlProps = {
  topPadding: "__rbLayoutTopPadding",
  bottomPadding: "__rbLayoutBottomPadding",
  horizontalPadding: "__rbLayoutHorizontalPadding",
  contentWidth: "__rbLayoutContentWidth",
  alignment: "__rbLayoutAlignment",
  verticalAlignment: "__rbLayoutVerticalAlignment",
  columns: "__rbLayoutColumns",
  gap: "__rbLayoutGap",
  radius: "__rbLayoutRadius",
  imageFit: "__rbLayoutImageFit",
  imagePosition: "__rbLayoutImagePosition",
} as const;

type LayoutControlProp = (typeof layoutControlProps)[keyof typeof layoutControlProps];
type LayoutControlValues = Partial<Record<LayoutControlProp, string>>;

export type LayoutControlContract = {
  padding?: boolean;
  contentWidth?: boolean;
  alignment?: boolean;
  verticalAlignment?: boolean;
  columns?: readonly (1 | 2 | 3 | 4)[];
  gap?: boolean;
  radius?: boolean;
  imageFit?: boolean;
  imagePosition?: boolean;
};

export function defineLayoutControlContract<const Contract extends LayoutControlContract>(
  contract: Contract,
) {
  return contract;
}

const paddingOptions = [
  { label: "Original", value: SOURCE_VALUE },
  { label: "None", value: "none" },
  { label: "Tight", value: "tight" },
  { label: "Normal", value: "normal" },
  { label: "Relaxed", value: "relaxed" },
  { label: "Spacious", value: "spacious" },
];

const contentWidthOptions = [
  { label: "Original", value: SOURCE_VALUE },
  { label: "Narrow", value: "narrow" },
  { label: "Medium", value: "medium" },
  { label: "Wide", value: "wide" },
  { label: "Full", value: "full" },
];

const alignmentOptions = [
  { label: "Original", value: SOURCE_VALUE },
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
];

const verticalAlignmentOptions = [
  { label: "Original", value: SOURCE_VALUE },
  { label: "Top", value: "top" },
  { label: "Center", value: "center" },
  { label: "Bottom", value: "bottom" },
];

const gapOptions = [
  { label: "Original", value: SOURCE_VALUE },
  { label: "Tight", value: "tight" },
  { label: "Normal", value: "normal" },
  { label: "Relaxed", value: "relaxed" },
  { label: "Spacious", value: "spacious" },
];

const radiusOptions = [
  { label: "Original", value: SOURCE_VALUE },
  { label: "None", value: "none" },
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
  { label: "Pill", value: "pill" },
];

const imageFitOptions = [
  { label: "Original", value: SOURCE_VALUE },
  { label: "Cover", value: "cover" },
  { label: "Contain", value: "contain" },
  { label: "Fill", value: "fill" },
];

const imagePositionOptions = [
  { label: "Original", value: SOURCE_VALUE },
  { label: "Center", value: "center" },
  { label: "Top", value: "top" },
  { label: "Bottom", value: "bottom" },
  { label: "Left", value: "left" },
  { label: "Right", value: "right" },
];

function addField(
  boundFields: Record<string, unknown>,
  boundDefaults: Record<string, unknown>,
  grouped: Map<"Layout" | "Appearance" | "Media", string[]>,
  group: "Layout" | "Appearance" | "Media",
  prop: LayoutControlProp,
  label: string,
  options: Array<{ label: string; value: string }>,
) {
  if (prop in boundFields) throw new Error(`Layout control field already exists: ${prop}`);
  boundFields[prop] = fields.select(label, options);
  boundDefaults[prop] = SOURCE_VALUE;
  grouped.set(group, [...(grouped.get(group) ?? []), prop]);
}

export function bindLayoutControlContract(
  contract: LayoutControlContract | undefined,
  sourceFields: Record<string, unknown>,
  sourceDefaults: Record<string, unknown>,
) {
  if (!contract) {
    return {
      fields: sourceFields,
      defaults: sourceDefaults,
      groups: [] as ControlGroupContract[],
    };
  }

  const boundFields = { ...sourceFields };
  const boundDefaults = { ...sourceDefaults };
  const grouped = new Map<"Layout" | "Appearance" | "Media", string[]>();

  if (contract.padding) {
    addField(boundFields, boundDefaults, grouped, "Layout", layoutControlProps.topPadding, "Top padding", paddingOptions);
    addField(boundFields, boundDefaults, grouped, "Layout", layoutControlProps.bottomPadding, "Bottom padding", paddingOptions);
    addField(boundFields, boundDefaults, grouped, "Layout", layoutControlProps.horizontalPadding, "Horizontal padding", paddingOptions);
  }
  if (contract.contentWidth) {
    addField(boundFields, boundDefaults, grouped, "Layout", layoutControlProps.contentWidth, "Content width", contentWidthOptions);
  }
  if (contract.alignment) {
    addField(boundFields, boundDefaults, grouped, "Layout", layoutControlProps.alignment, "Alignment", alignmentOptions);
  }
  if (contract.verticalAlignment) {
    addField(boundFields, boundDefaults, grouped, "Layout", layoutControlProps.verticalAlignment, "Vertical alignment", verticalAlignmentOptions);
  }
  if (contract.columns?.length) {
    addField(
      boundFields,
      boundDefaults,
      grouped,
      "Layout",
      layoutControlProps.columns,
      "Columns",
      [
        { label: "Original", value: SOURCE_VALUE },
        ...contract.columns.map((value) => ({ label: String(value), value: String(value) })),
      ],
    );
  }
  if (contract.gap) {
    addField(boundFields, boundDefaults, grouped, "Layout", layoutControlProps.gap, "Gap", gapOptions);
  }
  if (contract.radius) {
    addField(boundFields, boundDefaults, grouped, "Appearance", layoutControlProps.radius, "Corner radius", radiusOptions);
  }
  if (contract.imageFit) {
    addField(boundFields, boundDefaults, grouped, "Media", layoutControlProps.imageFit, "Image fit", imageFitOptions);
  }
  if (contract.imagePosition) {
    addField(boundFields, boundDefaults, grouped, "Media", layoutControlProps.imagePosition, "Image position", imagePositionOptions);
  }

  const groups = (["Layout", "Appearance", "Media"] as const)
    .filter((group) => grouped.has(group))
    .map((group) => ({
      id: `layout-${group.toLowerCase()}`,
      label: group,
      fields: grouped.get(group) ?? [],
    }));

  return { fields: boundFields, defaults: boundDefaults, groups };
}

const spacingValues: Record<string, string | undefined> = {
  source: undefined,
  none: "0px",
  tight: "16px",
  normal: "32px",
  relaxed: "48px",
  spacious: "64px",
};

const widthValues: Record<string, string | undefined> = {
  source: undefined,
  narrow: "720px",
  medium: "960px",
  wide: "1280px",
  full: "none",
};

const gapValues: Record<string, string | undefined> = {
  source: undefined,
  tight: "8px",
  normal: "16px",
  relaxed: "24px",
  spacious: "32px",
};

const radiusValues: Record<string, string | undefined> = {
  source: undefined,
  none: "0px",
  small: "8px",
  medium: "16px",
  large: "24px",
  pill: "9999px",
};

export type LayoutSurfaceStyle = CSSProperties & {
  "--rb-layout-columns"?: string;
  "--rb-layout-gap"?: string;
  "--rb-layout-image-fit"?: string;
  "--rb-layout-image-position"?: string;
  "--rb-style-background-color"?: string;
  "--rb-style-border-color"?: string;
};

export function resolveLayoutSurfaceStyle(values: LayoutControlValues): LayoutSurfaceStyle {
  const style: LayoutSurfaceStyle = { width: "100%", minWidth: 0, boxSizing: "border-box" };
  const topPadding = spacingValues[values[layoutControlProps.topPadding] ?? SOURCE_VALUE];
  const bottomPadding = spacingValues[values[layoutControlProps.bottomPadding] ?? SOURCE_VALUE];
  const horizontalPadding = spacingValues[values[layoutControlProps.horizontalPadding] ?? SOURCE_VALUE];
  const maxWidth = widthValues[values[layoutControlProps.contentWidth] ?? SOURCE_VALUE];
  const alignment = values[layoutControlProps.alignment];
  const verticalAlignment = values[layoutControlProps.verticalAlignment];
  const columns = values[layoutControlProps.columns];
  const gap = gapValues[values[layoutControlProps.gap] ?? SOURCE_VALUE];
  const radius = radiusValues[values[layoutControlProps.radius] ?? SOURCE_VALUE];
  const imageFit = values[layoutControlProps.imageFit];
  const imagePosition = values[layoutControlProps.imagePosition];

  if (topPadding) style.paddingTop = topPadding;
  if (bottomPadding) style.paddingBottom = bottomPadding;
  if (horizontalPadding) {
    style.paddingLeft = horizontalPadding;
    style.paddingRight = horizontalPadding;
  }
  if (maxWidth) style.maxWidth = maxWidth;
  if (alignment === "left") style.marginRight = "auto";
  if (alignment === "center") {
    style.marginLeft = "auto";
    style.marginRight = "auto";
  }
  if (alignment === "right") style.marginLeft = "auto";
  if (verticalAlignment && verticalAlignment !== SOURCE_VALUE) {
    style.display = "flex";
    style.flexDirection = "column";
    style.minHeight = "100%";
    style.justifyContent = verticalAlignment === "center"
      ? "center"
      : verticalAlignment === "bottom"
        ? "flex-end"
        : "flex-start";
  }
  if (columns && columns !== SOURCE_VALUE) style["--rb-layout-columns"] = columns;
  if (gap) style["--rb-layout-gap"] = gap;
  if (radius) {
    style.borderRadius = radius;
    style.overflow = "hidden";
  }
  if (imageFit && imageFit !== SOURCE_VALUE) style["--rb-layout-image-fit"] = imageFit;
  if (imagePosition && imagePosition !== SOURCE_VALUE) style["--rb-layout-image-position"] = imagePosition;
  return style;
}

export function LayoutControlSurface({
  contract,
  styleContract,
  values,
  children,
}: {
  contract?: LayoutControlContract;
  styleContract?: BlockStyleContract;
  values: Record<string, unknown>;
  children: ReactNode;
}) {
  if (!contract && !styleContract) return <>{children}</>;
  const controlValues = Object.fromEntries(
    Object.values(layoutControlProps)
      .filter((prop) => typeof values[prop] === "string")
      .map((prop) => [prop, values[prop] as string]),
  ) as LayoutControlValues;
  const columns = controlValues[layoutControlProps.columns];
  const gap = controlValues[layoutControlProps.gap];
  const imageFit = controlValues[layoutControlProps.imageFit];
  const imagePosition = controlValues[layoutControlProps.imagePosition];
  const blockStyle = readBlockStyleValues(values);
  const surfaceStyle = resolveLayoutSurfaceStyle(controlValues);
  if (styleContract?.background) {
    surfaceStyle["--rb-style-background-color"] = blockStyle.backgroundColor;
  }
  if (styleContract?.border) {
    surfaceStyle["--rb-style-border-color"] = blockStyle.borderColor;
  }
  if (styleContract?.opacity) {
    surfaceStyle.opacity = blockStyle.opacity / 100;
  }
  return (
    <div
      className={styles.surface}
      data-rb-layout-surface="true"
      data-rb-layout-columns={columns && columns !== SOURCE_VALUE ? columns : undefined}
      data-rb-layout-gap={gap && gap !== SOURCE_VALUE ? gap : undefined}
      data-rb-layout-image-fit={imageFit && imageFit !== SOURCE_VALUE ? imageFit : undefined}
      data-rb-layout-image-position={imagePosition && imagePosition !== SOURCE_VALUE ? imagePosition : undefined}
      data-rb-style-background-mode={styleContract?.background && blockStyle.backgroundMode !== "original" ? blockStyle.backgroundMode : undefined}
      data-rb-style-border-mode={styleContract?.border && blockStyle.borderMode !== "original" ? blockStyle.borderMode : undefined}
      data-rb-style-shadow={styleContract?.shadow && blockStyle.shadow !== "original" ? blockStyle.shadow : undefined}
      data-rb-style-opacity={styleContract?.opacity ? blockStyle.opacity : undefined}
      style={surfaceStyle}
    >
      {children}
    </div>
  );
}

const sectionBase = {
  padding: true,
  contentWidth: true,
  verticalAlignment: true,
} satisfies LayoutControlContract;

export const layoutControlProfiles = {
  widthOnly: defineLayoutControlContract({ contentWidth: true }),
  spacing: defineLayoutControlContract({ padding: true, verticalAlignment: true }),
  spacingRounded: defineLayoutControlContract({ padding: true, verticalAlignment: true, radius: true }),
  section: defineLayoutControlContract({ ...sectionBase, alignment: true }),
  sectionBasic: defineLayoutControlContract(sectionBase),
  sectionRounded: defineLayoutControlContract({ ...sectionBase, alignment: true, radius: true }),
  sectionSplit: defineLayoutControlContract({ ...sectionBase, columns: [1, 2], gap: true }),
  sectionGrid: defineLayoutControlContract({ ...sectionBase, columns: [1, 2, 3, 4], gap: true }),
  sectionMedia: defineLayoutControlContract({ ...sectionBase, alignment: true, imageFit: true, imagePosition: true }),
  sectionSplitMedia: defineLayoutControlContract({ ...sectionBase, columns: [1, 2], gap: true, imageFit: true, imagePosition: true }),
  sectionGridMedia: defineLayoutControlContract({ ...sectionBase, columns: [1, 2, 3, 4], gap: true, imageFit: true, imagePosition: true }),
  app: defineLayoutControlContract({ padding: true, contentWidth: true, verticalAlignment: true }),
  appRounded: defineLayoutControlContract({ padding: true, contentWidth: true, verticalAlignment: true, radius: true }),
  appGrid: defineLayoutControlContract({ padding: true, contentWidth: true, verticalAlignment: true, columns: [1, 2, 3, 4], gap: true }),
  appRoundedFluid: defineLayoutControlContract({ padding: true, verticalAlignment: true, radius: true }),
  appGridFluid: defineLayoutControlContract({ padding: true, verticalAlignment: true, columns: [1, 2, 3, 4], gap: true }),
  appSplitFluid: defineLayoutControlContract({ padding: true, verticalAlignment: true, columns: [1, 2], gap: true }),
  navigation: defineLayoutControlContract({ padding: true, contentWidth: true }),
  background: defineLayoutControlContract({ padding: true, verticalAlignment: true, radius: true }),
} as const;
