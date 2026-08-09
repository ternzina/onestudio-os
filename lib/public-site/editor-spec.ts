import type { HTMLAttributes, ReactNode, Ref } from "react";
import type { EditorBlockLibraryItem } from "@/components/admin/EditorBlockLibrary";
import type { PublicSiteTypography } from "@/lib/public-site/types";

export type TemplateEditorDevice = "desktop" | "tablet" | "mobile";
export type EditorSectionCapabilities = {
  select?: boolean;
  visibility?: boolean;
  duplicate?: boolean;
  delete?: boolean;
  reorder?: boolean;
  move?: boolean;
  reset?: boolean;
  typography?: boolean;
};

export type EditorSectionRecord = {
  id: string;
  key: string;
  label: string;
  description?: string;
  index: number;
  selected: boolean;
  visible: boolean;
  required?: boolean;
  locked?: boolean;
  disabled?: boolean;
  capabilities: EditorSectionCapabilities;
  onSelect: () => void;
  onVisibilityChange?: (visible: boolean) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onMove?: (direction: -1 | 1) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: () => void;
  onDrop?: () => void;
};

export type EditorNavigatorModel = {
  heading: string;
  sections: readonly EditorSectionRecord[];
  onCollapse?: () => void;
  addBlock?: { label: string; disabled?: boolean; onClick: () => void };
  emptyState?: string;
  footerNotice?: ReactNode;
};

export type EditorInspectorField =
  | { id: string; type: "text" | "url" | "number" | "color"; label: string; value: string | number; disabled?: boolean; onChange: (value: string) => void }
  | { id: string; type: "textarea"; label: string; value: string; rows?: number; disabled?: boolean; onChange: (value: string) => void }
  | { id: string; type: "toggle"; label: string; checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }
  | { id: string; type: "select"; label: string; value: string; options: readonly { value: string; label: string }[]; disabled?: boolean; onChange: (value: string) => void }
  | { id: string; type: "richText"; label?: string; value: string; disabled?: boolean; onChange: (value: string) => void }
  | { id: string; type: "typography"; title: string; description: string; value?: PublicSiteTypography; disabled?: boolean; onChange: (value: PublicSiteTypography | undefined) => void }
  | { id: string; type: "button"; label: string; disabled?: boolean; tone?: "default" | "quiet"; onClick: () => void }
  | { id: string; type: "notice"; text: string }
  | { id: string; type: "custom"; customContent: ReactNode };

export const ONESTUDIO_INSPECTOR_GROUPS = ["content", "typography", "media", "layout"] as const;
export type OneStudioInspectorGroup = (typeof ONESTUDIO_INSPECTOR_GROUPS)[number];
export type EditorInspectorPlacedField = EditorInspectorField & { group: OneStudioInspectorGroup };

export type EditorInspectorAction = {
  id: string;
  label: string;
  tone?: "default" | "danger";
  disabled?: boolean;
  onClick: () => void;
};

export type EditorInspectorModel = {
  heading: string;
  title: string;
  description?: string;
  fields: readonly EditorInspectorPlacedField[];
  actions?: readonly EditorInspectorAction[];
  onCollapse?: () => void;
};

export type EditorPageCommand = {
  id: string;
  label: string;
  selected: boolean;
  hidden?: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

export type EditorCommandAction = {
  id: string;
  label: string;
  disabled?: boolean;
  tone?: "default" | "accent" | "quiet";
  onClick: () => void;
};

/** Data-only command contract. OneStudio owns placement, geometry, and styling. */
export type EditorCommandModel = {
  pageLabel: string;
  pages: readonly EditorPageCommand[];
  addPage?: EditorCommandAction;
  design: EditorCommandAction;
  seo: EditorCommandAction;
  contextualAction?: EditorCommandAction;
  auxiliaryAction?: EditorCommandAction;
};

export type TemplateEditorSectionCapabilities = EditorSectionCapabilities;
export type TemplateEditorSection = { id: string; label: string; description: string; capabilities: TemplateEditorSectionCapabilities };

/** The practical boundary between design-specific content and OneStudio-owned editor UI. */
export type TemplateEditorSpec = {
  templateKey: string;
  designName: string;
  templateTier?: string;
  draftLabel: string;
  previewHref: string;
  device: TemplateEditorDevice;
  editingEnabled: boolean;
  saving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onDeviceChange: (device: TemplateEditorDevice) => void;
  onEditingChange: (enabled: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onPublish: () => void;
  commandModel: EditorCommandModel;
  navigatorModel: EditorNavigatorModel;
  canvas: ReactNode;
  inspectorModel: EditorInspectorModel;
  canvasRef?: Ref<HTMLDivElement>;
  canvasProps?: Omit<HTMLAttributes<HTMLDivElement>, "children" | "className">;
  libraryOpen: boolean;
  templateLibraryItems: readonly EditorBlockLibraryItem[];
  universalLibraryItems: readonly EditorBlockLibraryItem[];
  onLibraryClose: () => void;
};

/**
 * Future-template invariant: adapters supply identity, command/page data, section
 * records, inspector schema, libraries, callbacks, and a canvas renderer. They
 * cannot supply editor chrome, geometry, or system dialogs. Design and SEO are
 * controller callbacks rendered by OneStudio. A new design never needs a new shell
 * or modal implementation.
 */
export type OneStudioTemplateAdapter = TemplateEditorSpec;
