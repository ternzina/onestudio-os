import type { PublicSiteContent } from "./types";

const TEMPLATE_EDITOR_STATE_KEY = "__onestudio_editor";
const SECTION_VISIBILITY_KEY = "section_visibility";

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function cloneObject(value: JsonObject): JsonObject {
  return JSON.parse(JSON.stringify(value)) as JsonObject;
}

function templateObject(
  content: PublicSiteContent | undefined,
  templateKey: string,
): JsonObject {
  return asObject(content?.template_content?.[templateKey]) ?? {};
}

function editorState(template: JsonObject): JsonObject {
  return asObject(template[TEMPLATE_EDITOR_STATE_KEY]) ?? {};
}

function visibilityState(editor: JsonObject): JsonObject {
  return asObject(editor[SECTION_VISIBILITY_KEY]) ?? {};
}

/**
 * Shared state contract for design-native sections.
 *
 * The editor chrome stays template-agnostic: adapters expose the common
 * `visibility` capability while this helper stores a small reserved state
 * inside the already-persisted per-template content namespace.
 */
export function isTemplateNativeSectionVisible(
  content: PublicSiteContent | undefined,
  templateKey: string,
  sectionId: string,
): boolean {
  const template = templateObject(content, templateKey);
  const editor = editorState(template);
  const visibility = visibilityState(editor);
  return visibility[sectionId] !== false;
}

export function setTemplateNativeSectionVisibility(
  content: PublicSiteContent,
  templateKey: string,
  sectionId: string,
  visible: boolean,
): PublicSiteContent {
  const template = templateObject(content, templateKey);
  const editor = editorState(template);
  const visibility = visibilityState(editor);

  return {
    ...content,
    template_content: {
      ...(content.template_content ?? {}),
      [templateKey]: {
        ...template,
        [TEMPLATE_EDITOR_STATE_KEY]: {
          ...editor,
          [SECTION_VISIBILITY_KEY]: {
            ...visibility,
            [sectionId]: visible,
          },
        },
      },
    },
  };
}

export function replaceTemplateContentPreservingEditorState(
  content: PublicSiteContent,
  templateKey: string,
  nextTemplateContent: JsonObject,
  preserveEditorState = true,
): PublicSiteContent {
  const previousTemplate = templateObject(content, templateKey);
  const previousEditor = asObject(previousTemplate[TEMPLATE_EDITOR_STATE_KEY]);
  const nextTemplate = cloneObject(nextTemplateContent);

  if (preserveEditorState && previousEditor) {
    nextTemplate[TEMPLATE_EDITOR_STATE_KEY] = cloneObject(previousEditor);
  } else {
    delete nextTemplate[TEMPLATE_EDITOR_STATE_KEY];
  }

  return {
    ...content,
    template_content: {
      ...(content.template_content ?? {}),
      [templateKey]: nextTemplate,
    },
  };
}
