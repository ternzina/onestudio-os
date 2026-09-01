import {
  PUCK_PRODUCTION_MANIFEST_BY_ID,
  PUCK_REGISTRY_VERSION,
  type PuckPropRule,
} from "./registry-manifest.ts";

export const PUCK_DOCUMENT_VERSION = 1 as const;
export const PUCK_DOCUMENT_MAX_BYTES = 512_000;
export const PUCK_DOCUMENT_MAX_COMPONENTS = 100;
const PUCK_DOCUMENT_MAX_DEPTH = 12;

export type PuckDocumentComponent = {
  type: string;
  props: Record<string, unknown> & { id: string };
};

export type PuckDocumentV1 = {
  version: 1;
  registryVersion: typeof PUCK_REGISTRY_VERSION;
  root: { props: { theme: "inherit" | "light" | "dark" } };
  content: PuckDocumentComponent[];
  metadata: {
    pageId: string;
    locale: string;
    seoOwner: "public_site";
  };
};

export type PuckDocumentValidation =
  | { ok: true; document: PuckDocumentV1 }
  | { ok: false; errors: string[] };

const plainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

function unsafeJsonPath(value: unknown, path = "$", depth = 0): string | null {
  if (depth > PUCK_DOCUMENT_MAX_DEPTH) return `${path}: maximum depth exceeded`;
  if (value === null || typeof value === "string" || typeof value === "boolean") return null;
  if (typeof value === "number") return Number.isFinite(value) ? null : `${path}: number must be finite`;
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const issue = unsafeJsonPath(value[index], `${path}[${index}]`, depth + 1);
      if (issue) return issue;
    }
    return null;
  }
  if (!plainObject(value)) return `${path}: value is not deterministic JSON`;
  for (const [key, item] of Object.entries(value)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      return `${path}.${key}: unsafe key`;
    }
    const issue = unsafeJsonPath(item, `${path}.${key}`, depth + 1);
    if (issue) return issue;
  }
  return null;
}

function exactKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
  errors: string[],
) {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) errors.push(`${path}.${key}: unknown key`);
  }
}

const safeUrl = (value: string) =>
  value.startsWith("/") || /^https:\/\/[A-Za-z0-9.-]+(?::\d+)?(?:[/?#][^\s]*)?$/i.test(value);
const safeColor = (value: string) => /^#[0-9a-f]{3,8}$/i.test(value);

function validateRule(value: unknown, rule: PuckPropRule, path: string, errors: string[]) {
  if (rule.kind === "string") {
    if (typeof value !== "string") {
      errors.push(`${path}: expected string`);
      return;
    }
    if (value.length > rule.maxLength) errors.push(`${path}: string is too long`);
    if (rule.format === "url" && !safeUrl(value)) errors.push(`${path}: unsafe URL`);
    if (rule.format === "color" && !safeColor(value)) errors.push(`${path}: invalid color`);
    return;
  }
  if (rule.kind === "boolean") {
    if (typeof value !== "boolean") errors.push(`${path}: expected boolean`);
    return;
  }
  if (rule.kind === "number") {
    if (typeof value !== "number" || !Number.isFinite(value) || value < rule.min || value > rule.max) {
      errors.push(`${path}: number is outside the supported range`);
    }
    return;
  }
  if (rule.kind === "enum") {
    if (typeof value !== "string" || !rule.values.includes(value)) errors.push(`${path}: unsupported value`);
    return;
  }
  if (!Array.isArray(value)) {
    errors.push(`${path}: expected array`);
    return;
  }
  if (value.length > rule.maxItems) errors.push(`${path}: too many items`);
  value.forEach((item, index) => {
    if (!plainObject(item)) {
      errors.push(`${path}[${index}]: expected object`);
      return;
    }
    exactKeys(item, Object.keys(rule.item.properties), `${path}[${index}]`, errors);
    for (const [key, itemRule] of Object.entries(rule.item.properties)) {
      if (!(key in item)) errors.push(`${path}[${index}].${key}: required`);
      else validateRule(item[key], itemRule, `${path}[${index}].${key}`, errors);
    }
  });
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (plainObject(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonicalValue(item)]),
    );
  }
  return value;
}

export function canonicalizePuckDocument(document: PuckDocumentV1): PuckDocumentV1 {
  return canonicalValue(document) as PuckDocumentV1;
}

export function validatePuckDocument(value: unknown): PuckDocumentValidation {
  const errors: string[] = [];
  const unsafe = unsafeJsonPath(value);
  if (unsafe) return { ok: false, errors: [unsafe] };
  if (!plainObject(value)) return { ok: false, errors: ["$: expected object"] };
  exactKeys(value, ["version", "registryVersion", "root", "content", "metadata"], "$", errors);
  if (value.version !== PUCK_DOCUMENT_VERSION) errors.push("$.version: unsupported version");
  if (value.registryVersion !== PUCK_REGISTRY_VERSION) errors.push("$.registryVersion: unsupported registry version");

  if (!plainObject(value.root)) errors.push("$.root: expected object");
  else {
    exactKeys(value.root, ["props"], "$.root", errors);
    if (!plainObject(value.root.props)) errors.push("$.root.props: expected object");
    else {
      exactKeys(value.root.props, ["theme"], "$.root.props", errors);
      if (!["inherit", "light", "dark"].includes(String(value.root.props.theme))) {
        errors.push("$.root.props.theme: unsupported value");
      }
    }
  }

  if (!plainObject(value.metadata)) errors.push("$.metadata: expected object");
  else {
    exactKeys(value.metadata, ["pageId", "locale", "seoOwner"], "$.metadata", errors);
    if (typeof value.metadata.pageId !== "string" || !/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(value.metadata.pageId)) {
      errors.push("$.metadata.pageId: invalid page id");
    }
    if (typeof value.metadata.locale !== "string" || !/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(value.metadata.locale)) {
      errors.push("$.metadata.locale: invalid locale");
    }
    if (value.metadata.seoOwner !== "public_site") errors.push("$.metadata.seoOwner: unsupported SEO owner");
  }

  if (!Array.isArray(value.content)) errors.push("$.content: expected array");
  else {
    if (value.content.length > PUCK_DOCUMENT_MAX_COMPONENTS) errors.push("$.content: too many components");
    const ids = new Set<string>();
    value.content.forEach((component, index) => {
      const path = `$.content[${index}]`;
      if (!plainObject(component)) {
        errors.push(`${path}: expected object`);
        return;
      }
      exactKeys(component, ["type", "props"], path, errors);
      if (typeof component.type !== "string") {
        errors.push(`${path}.type: expected string`);
        return;
      }
      const manifest = PUCK_PRODUCTION_MANIFEST_BY_ID.get(component.type);
      if (!manifest) {
        errors.push(`${path}.type: unknown component id`);
        return;
      }
      if (!plainObject(component.props)) {
        errors.push(`${path}.props: expected object`);
        return;
      }
      exactKeys(component.props, Object.keys(manifest.props), `${path}.props`, errors);
      for (const [key, prop] of Object.entries(component.props)) {
        const rule = manifest.props[key];
        if (rule) validateRule(prop, rule, `${path}.props.${key}`, errors);
      }
      const id = component.props.id;
      if (typeof id !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(id)) errors.push(`${path}.props.id: invalid id`);
      else if (ids.has(id)) errors.push(`${path}.props.id: duplicate id`);
      else ids.add(id);
    });
  }

  let bytes = Number.POSITIVE_INFINITY;
  try {
    bytes = new TextEncoder().encode(JSON.stringify(value)).byteLength;
  } catch {
    errors.push("$: cannot serialize document");
  }
  if (bytes > PUCK_DOCUMENT_MAX_BYTES) errors.push("$: document exceeds size limit");

  if (errors.length) return { ok: false, errors };
  return { ok: true, document: canonicalizePuckDocument(value as PuckDocumentV1) };
}

export function assertPuckDocument(value: unknown): PuckDocumentV1 {
  const result = validatePuckDocument(value);
  if (!result.ok) throw new Error(`Invalid Puck document: ${result.errors.join("; ")}`);
  return result.document;
}

export function createPuckDocument(input: {
  pageId: string;
  locale: string;
  content: PuckDocumentComponent[];
  theme?: "inherit" | "light" | "dark";
}): PuckDocumentV1 {
  return assertPuckDocument({
    version: PUCK_DOCUMENT_VERSION,
    registryVersion: PUCK_REGISTRY_VERSION,
    root: { props: { theme: input.theme ?? "inherit" } },
    content: input.content,
    metadata: { pageId: input.pageId, locale: input.locale, seoOwner: "public_site" },
  });
}
