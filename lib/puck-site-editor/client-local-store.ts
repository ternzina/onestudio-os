"use client";

import { validatePuckDocument, type PuckDocumentV1 } from "./document";

const key = (kind: "draft" | "published", businessId: string, locale: string, pageId: string) =>
  `onestudio:puck-pilot:${kind}:v1:${businessId}:${locale.toLowerCase()}:${pageId}`;

export function readLocalPuckDocument(
  kind: "draft" | "published",
  scope: { businessId: string; locale: string; pageId: string },
) {
  const serialized = window.localStorage.getItem(key(kind, scope.businessId, scope.locale, scope.pageId));
  if (!serialized) return null;
  const result = validatePuckDocument(JSON.parse(serialized));
  return result.ok ? result.document : null;
}

export function writeLocalPuckDocument(
  kind: "draft" | "published",
  scope: { businessId: string; locale: string; pageId: string },
  document: PuckDocumentV1,
) {
  const result = validatePuckDocument(document);
  if (!result.ok) throw new Error(result.errors.join("; "));
  window.localStorage.setItem(
    key(kind, scope.businessId, scope.locale, scope.pageId),
    JSON.stringify(result.document),
  );
  return result.document;
}
