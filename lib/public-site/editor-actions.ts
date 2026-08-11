import type {
  EditorInspectorField,
  EditorInspectorPlacedField,
  OneStudioInspectorGroup,
} from "./editor-spec.ts";

const SAFE_EDITOR_ACTION_HREF = /^(#[A-Za-z0-9_-]+|\/(?!\/)[A-Za-z0-9_/?&=.#%:+-]*|https:\/\/[^\s]+)$/i;
const SAFE_PUBLIC_ACTION_HREF = /^(#[A-Za-z0-9_-]+|\/(?!\/)[A-Za-z0-9_/?&=.#%:+-]*|https:\/\/[^\s]+|mailto:[^\s]+|tel:[+0-9().\s-]+)$/i;

export type EditorActionHrefKind =
  | "default"
  | "section"
  | "page"
  | "external"
  | "email"
  | "phone"
  | "invalid";

export function editorActionHrefKind(
  value?: string | null,
  allowContactLinks = false,
): EditorActionHrefKind {
  const href = value?.trim() ?? "";
  if (!href) return "default";
  if (!SAFE_EDITOR_ACTION_HREF.test(href)) {
    if (allowContactLinks && /^mailto:[^\s]+$/i.test(href)) return "email";
    if (allowContactLinks && /^tel:[+0-9().\s-]+$/i.test(href)) return "phone";
    return "invalid";
  }
  if (href.startsWith("#")) return "section";
  if (href.startsWith("/")) return "page";
  if (/^https:\/\//i.test(href)) return "external";
  return "invalid";
}

export function safePublicActionHref(
  value: string | undefined | null,
  fallback = "",
) {
  const href = value?.trim() ?? "";
  return href && SAFE_PUBLIC_ACTION_HREF.test(href) ? href.slice(0, 1000) : fallback;
}

type ActionPair = {
  id: string;
  label: string;
  textFieldId: string;
  hrefFieldId: string;
  destinations?: readonly { value: string; label: string }[];
};

type FixedAction = {
  fieldId: string;
  id?: string;
  label?: string;
  destinationHint: string;
};

function isTextField(
  field: EditorInspectorPlacedField,
): field is Extract<EditorInspectorField, { type: "text" }> & {
  group: OneStudioInspectorGroup;
} {
  return field.type === "text";
}

function isUrlField(
  field: EditorInspectorPlacedField,
): field is Extract<
  EditorInspectorField,
  { type: "url" | "number" | "color" }
> & { type: "url" } & {
  group: OneStudioInspectorGroup;
} {
  return field.type === "url";
}

/**
 * Joins existing label and URL fields without changing their persistence paths.
 * Template schemas remain data owners; OneStudio only supplies the shared UI.
 */
export function pairEditorActionFields(
  fields: readonly EditorInspectorPlacedField[],
  pairs: readonly ActionPair[],
): EditorInspectorPlacedField[] {
  let result = [...fields];
  for (const pair of pairs) {
    const textIndex = result.findIndex((field) => field.id === pair.textFieldId);
    const hrefIndex = result.findIndex((field) => field.id === pair.hrefFieldId);
    const textField = result[textIndex];
    const hrefField = result[hrefIndex];
    if (
      textIndex < 0 ||
      hrefIndex < 0 ||
      !textField ||
      !hrefField ||
      !isTextField(textField) ||
      !isUrlField(hrefField)
    ) {
      continue;
    }
    const action: EditorInspectorPlacedField = {
      id: pair.id,
      group: textField.group as OneStudioInspectorGroup,
      type: "action",
      label: pair.label,
      text: textField.value,
      href: String(hrefField.value),
      originalText: textField.originalValue,
      originalHref: hrefField.originalValue,
      disabled: textField.disabled || hrefField.disabled,
      destinations: pair.destinations,
      onTextChange: textField.onChange,
      onHrefChange: hrefField.onChange,
    };
    const firstIndex = Math.min(textIndex, hrefIndex);
    result = result.filter(
      (field) => field.id !== pair.textFieldId && field.id !== pair.hrefFieldId,
    );
    result.splice(firstIndex, 0, action);
  }
  return result;
}

/** Presents a template-owned destination through the same button editor. */
export function markFixedEditorActionFields(
  fields: readonly EditorInspectorPlacedField[],
  actions: readonly FixedAction[],
): EditorInspectorPlacedField[] {
  const byId = new Map(actions.map((action) => [action.fieldId, action]));
  return fields.map((field) => {
    const action = byId.get(field.id);
    if (!action || !isTextField(field)) return field;
    return {
      id: action.id ?? field.id,
      group: field.group,
      type: "action",
      label: action.label ?? field.label,
      text: field.value,
      originalText: field.originalValue,
      disabled: field.disabled,
      destinationHint: action.destinationHint,
      onTextChange: field.onChange,
    };
  });
}
