"use client";

import {
  forwardRef,
  type ComponentType,
  type CSSProperties,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
} from "react";
import type { ComponentConfig, ComponentData, Data } from "@puckeditor/core";
import type {
  PuckMediaField,
  PuckTextField,
  PuckToggleField,
  PuckSelectField,
  PuckRichTextField,
  PuckObjectField,
  PuckSlotField,
  PuckArrayField,
  PuckBoundedNestedArrayField,
  PuckColorField,
  PuckSliderField,
  PuckColorArrayField,
} from "./field-helpers";
import { effectFields, type EffectDefinition } from "./effect-contract";
import { bindArrayItemsContracts, type ArrayItemsContract, type PrimitiveArrayItem } from "./array-items-contract";
import { bindBoundedNestedContentContracts, type BoundedNestedContentContract } from "./bounded-nested-content-contract";
import { bindFormContentContract, type FormContentContract } from "./form-content-contract";
import { bindControlGroups, type ControlGroupContract } from "./control-groups";
import { bindVisualControlContracts, type VisualControlContract } from "./visual-control-contract";
import { ReactBitsHost, type ReactBitsHostSpec } from "./reactbits-host";
import styles from "./puck-lab.module.css";

type EditableProps = object;
type LabField =
  | PuckTextField
  | PuckMediaField
  | PuckToggleField
  | PuckSelectField
  | PuckRichTextField
  | PuckObjectField
  | PuckSlotField
  | PuckArrayField
  | PuckBoundedNestedArrayField
  | PuckColorField
  | PuckSliderField
  | PuckColorArrayField
  | {
      type: "array";
      arrayFields: Record<string, LabField>;
      defaultItemProps?: Record<string, unknown>;
      getItemSummary?: (
        item: Record<string, unknown>,
        index?: number,
      ) => string;
    };

type LayoutProps = {
  padding?: string;
  spanCol?: number;
  spanRow?: number;
  grow?: boolean;
};
export type RuntimeFamily =
  | "full-surface"
  | "bounded-card"
  | "inline"
  | "content-sized"
  | "required-data"
  | "required-media";
const spacingOptions = [
  "8px",
  "16px",
  "24px",
  "32px",
  "40px",
  "48px",
  "56px",
  "64px",
].map((value) => ({ label: value, value }));
const layoutField: PuckObjectField = {
  type: "object",
  label: "OneStudio Layout",
  objectFields: {
    spanCol: { label: "Grid Columns", type: "number", min: 1, max: 12 },
    spanRow: { label: "Grid Rows", type: "number", min: 1, max: 12 },
    grow: {
      label: "Flex Grow",
      type: "radio",
      options: [
        { label: "true", value: true },
        { label: "false", value: false },
      ],
    },
    padding: {
      type: "select",
      label: "Vertical Padding",
      options: [{ label: "0px", value: "0px" }, ...spacingOptions],
    },
  },
};

const editorPropNames = new Set([
  "editMode",
  "puck",
  "dragRef",
  "selected",
  "isEditing",
  "editorState",
  "layout",
  "id",
]);

/** Keep Puck/editor metadata at the adapter boundary, never in user DOM. */
export function stripEditorProps<Props extends EditableProps>(
  props: Record<string, unknown>,
): Props {
  return Object.fromEntries(
    Object.entries(props).filter(
      ([name]) => !editorPropNames.has(name) && !name.startsWith("__puckGroup_"),
    ),
  ) as Props;
}

/**
 * Prevent navigation from all anchors inside an editor-owned preview surface.
 *
 * This never writes or rewrites an href, and it does not stop propagation, so
 * source click handlers and local component interactions keep working. The
 * guard is attached only by editor/lab hosts; public production renders retain
 * their original link behaviour.
 */
export function guardEditorPreviewNavigation(
  event: ReactMouseEvent<HTMLElement>,
) {
  if (event.defaultPrevented) return;

  // Puck's canvas is a separate document realm, so do not use `instanceof
  // Element` here. A structural `closest` check works in both the editor page
  // and the iframe that receives the rendered block.
  const target = event.target as EventTarget & {
    closest?: (selector: string) => HTMLAnchorElement | null;
  };
  const link = target.closest?.("a[href]");
  if (!link) return;

  event.preventDefault();
}

/** Prevent native form navigation/reloads inside editor and lab previews. */
export function guardEditorPreviewSubmit(event: FormEvent<HTMLElement>) {
  event.preventDefault();
}

export const Layout = forwardRef<
  HTMLDivElement,
  { children: ReactNode; layout?: LayoutProps }
>(({ children, layout }, ref) => (
  <div
    ref={ref}
    onClickCapture={guardEditorPreviewNavigation}
    onAuxClickCapture={guardEditorPreviewNavigation}
    onSubmitCapture={guardEditorPreviewSubmit}
    style={
      {
        height: "100%",
        gridColumn: layout?.spanCol
          ? `span ${Math.max(Math.min(layout.spanCol, 12), 1)}`
          : undefined,
        gridRow: layout?.spanRow
          ? `span ${Math.max(Math.min(layout.spanRow, 12), 1)}`
          : undefined,
        paddingTop: layout?.padding,
        paddingBottom: layout?.padding,
        flex: layout?.grow ? "1 1 0" : undefined,
      } as CSSProperties
    }
  >
    {children}
  </div>
));
Layout.displayName = "Layout";

export type TextFields<Props extends EditableProps> = Partial<
  Record<keyof Props, LabField>
>;

export type EffectFields<Props extends EditableProps> = TextFields<Props>;

export type BlockContract<Props extends EditableProps> = {
  type: string;
  displayName: string;
  category: string;
  description: string;
  catalogKey: string;
  sourceKind: "pro-block" | "component";
  tags: readonly string[];
  readiness: "READY";
  component: ComponentType<Props>;
  defaultProps: Props;
  fields: TextFields<Props>;
  effects?: readonly EffectDefinition<Props>[];
  arrayItems?: readonly ArrayItemsContract<PrimitiveArrayItem>[];
  nestedContent?: readonly BoundedNestedContentContract[];
  formContent?: FormContentContract;
  controlGroups?: readonly ControlGroupContract[];
  visualControls?: readonly VisualControlContract[];
  libraryPreview?: boolean;
  /** A render-only height for components whose own layout uses `height: 100%`. */
  definiteHeight?: number;
  /** Technical host contract for components whose source requires a sized parent. */
  runtimeFamily?: RuntimeFamily;
  /** Proven generic host metadata for official React Bits source. */
  host?: ReactBitsHostSpec;
};

export function defineBlock<Props extends EditableProps>(
  contract: BlockContract<Props>,
) {
  return contract;
}

/** Build persisted QA/editor data with the same canonical defaults as Puck. */
export function buildCanonicalPuckData(
  componentType: string,
  componentConfig: ComponentConfig,
  officialProps: Record<string, unknown>,
  stableId: string,
): Data {
  const props = {
    ...(componentConfig.defaultProps as Record<string, unknown> | undefined),
    ...officialProps,
    id: stableId,
  };
  return {
    root: { props: {} },
    content: [{ type: componentType, props } as ComponentData],
  };
}

type PuckBlockProps<Props extends EditableProps> = Props & {
  labLabel?: string;
};

export function withPuckFrame<Props extends EditableProps>(
  Block: ComponentType<Props>,
  definiteHeight?: number,
  runtimeFamily?: RuntimeFamily,
  host?: ReactBitsHostSpec,
) {
  return function PuckBlock({ labLabel, ...props }: PuckBlockProps<Props>) {
    if (host) {
      return (
        <section className={styles.blockFrame}>
          {labLabel ? <div className={styles.blockLabel}>{labLabel}</div> : null}
          <ReactBitsHost spec={host}>
            <Block {...(props as Props)} />
          </ReactBitsHost>
        </section>
      );
    }
    const hostHeight = definiteHeight ?? (runtimeFamily === "full-surface" ? 480 : undefined);
    const frameStyle = hostHeight
      ? { height: `${hostHeight}px`, minHeight: `${hostHeight}px`, position: "relative" as const, overflow: "hidden" as const }
      : runtimeFamily === "bounded-card"
        ? { position: "relative" as const }
        : undefined;
    return (
      <section className={styles.blockFrame} style={frameStyle}>
        {labLabel ? <div className={styles.blockLabel}>{labLabel}</div> : null}
        <Block {...(props as Props)} />
      </section>
    );
  };
}

export function RuntimeHost({
  children,
  family,
  definiteHeight,
  host,
}: {
  children: ReactNode;
  family?: RuntimeFamily;
  definiteHeight?: number;
  host?: ReactBitsHostSpec;
}) {
  if (host) {
    return (
      <div
        onClickCapture={guardEditorPreviewNavigation}
        onAuxClickCapture={guardEditorPreviewNavigation}
        onSubmitCapture={guardEditorPreviewSubmit}
      >
        <ReactBitsHost spec={host}>{children}</ReactBitsHost>
      </div>
    );
  }
  const hostHeight = definiteHeight ?? (family === "full-surface" ? 480 : undefined);
  return (
    <div
      data-runtime-family={family}
      onClickCapture={guardEditorPreviewNavigation}
      onAuxClickCapture={guardEditorPreviewNavigation}
      onSubmitCapture={guardEditorPreviewSubmit}
      style={hostHeight
        ? { width: "100%", height: hostHeight, minHeight: hostHeight, position: "relative", overflow: "hidden" }
        : { width: "100%", position: "relative" }}
    >
      {children}
    </div>
  );
}

function preservePrimitiveComponentFields(fields: TextFields<EditableProps>) {
  return Object.fromEntries(
    Object.entries(fields).map(([name, field]) => {
      const typedField = field as LabField | undefined;
      if (!typedField || (typedField.type !== "text" && typedField.type !== "textarea")) {
        return [name, field];
      }
      // Puck's inline editor transforms this prop into a React element at
      // render time. Auto-registered components receive their props as
      // runtime primitives, so their editable strings must stay strings.
      return [name, { ...typedField, contentEditable: false }];
    }),
  ) as TextFields<EditableProps>;
}

export function createPuckComponent<Props extends EditableProps>(
  contract: BlockContract<Props>,
  options: { showLabLabel?: boolean } = {},
): ComponentConfig {
  const showLabLabel = options.showLabLabel ?? true;
  const declaredEffectFields = contract.effects
    ? effectFields(...contract.effects)
    : {};
  // labLabel remains an internal frame/display-name prop; it is not customer content.
  const boundArrays = bindArrayItemsContracts(contract.arrayItems, contract.fields as Record<string, unknown>, contract.defaultProps as Record<string, unknown>);
  const boundNestedContent = bindBoundedNestedContentContracts(contract.nestedContent, boundArrays.fields, boundArrays.defaults);
  const boundFormContent = bindFormContentContract(contract.formContent, boundNestedContent.fields, boundNestedContent.defaults);
  const boundVisualControls = bindVisualControlContracts(
    contract.visualControls,
    { ...boundFormContent.fields, ...declaredEffectFields },
    boundFormContent.defaults,
  );
  const groupedFields = bindControlGroups(
    [...(contract.controlGroups ?? []), ...boundVisualControls.groups],
    boundVisualControls.fields,
  );
  const baseFields = contract.sourceKind === "component"
    ? preservePrimitiveComponentFields(groupedFields)
    : groupedFields;
  // Keep the catalog contract separate from Puck's ComponentConfig. The
  // catalog carries implementation metadata that Puck 0.23 must never see.
  return {
    label: contract.displayName,
    fields: { ...baseFields, layout: layoutField },
    defaultProps: {
      ...(showLabLabel ? { labLabel: contract.displayName } : {}),
      ...boundVisualControls.defaults,
      layout: {
        spanCol: 1,
        spanRow: 1,
        padding: "0px",
        grow: false,
        ...(contract.defaultProps as Props & { layout?: LayoutProps }).layout,
      },
    },
    resolveFields: (_data, params) => {
      const objectFields =
        params.parent?.type === "Grid"
          ? {
              spanCol: layoutField.objectFields.spanCol,
              spanRow: layoutField.objectFields.spanRow,
              padding: layoutField.objectFields.padding,
            }
          : params.parent?.type === "Flex"
            ? {
                grow: layoutField.objectFields.grow,
                padding: layoutField.objectFields.padding,
              }
            : { padding: layoutField.objectFields.padding };
      return {
        ...baseFields,
        layout: { ...layoutField, objectFields },
      } as unknown as NonNullable<ComponentConfig["fields"]>;
    },
    inline: true,
    render: (props) => {
      const labProps = props as typeof props & { layout?: LayoutProps; editMode?: boolean; puck: { dragRef: Ref<HTMLDivElement> } };
      const { puck, layout } = labProps;
      const userProps = stripEditorProps<Props>(labProps as Record<string, unknown>);
      return (
        <Layout ref={puck.dragRef} layout={layout}>
        {withPuckFrame(contract.component, contract.definiteHeight, contract.runtimeFamily, contract.host)(userProps as never)}
        </Layout>
      );
    },
  };
}
