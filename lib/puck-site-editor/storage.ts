import type { PublicSiteContent } from "../public-site/types.ts";
import {
  assertPuckDocument,
  canonicalizePuckDocument,
  type PuckDocumentV1,
} from "./document.ts";

export type PublicSiteContentWithPuck = PublicSiteContent & {
  puck_document?: PuckDocumentV1;
};

const clone = <Value>(value: Value): Value => structuredClone(value);

export function attachPuckDocument(
  legacyContent: PublicSiteContent,
  document: PuckDocumentV1,
): PublicSiteContentWithPuck {
  return {
    ...clone(legacyContent),
    puck_document: canonicalizePuckDocument(assertPuckDocument(document)),
  };
}

export function readPuckDocument(content: PublicSiteContentWithPuck): PuckDocumentV1 | null {
  return content.puck_document ? assertPuckDocument(content.puck_document) : null;
}

export function normalizePuckStorageContent(value: unknown): PublicSiteContentWithPuck {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Public site storage content must be an object");
  }
  const content = clone(value) as PublicSiteContentWithPuck;
  if (content.puck_document) content.puck_document = assertPuckDocument(content.puck_document);
  return content;
}

export function serializePuckStorageContent(content: PublicSiteContentWithPuck): string {
  return JSON.stringify(normalizePuckStorageContent(content));
}

export function deserializePuckStorageContent(serialized: string): PublicSiteContentWithPuck {
  return normalizePuckStorageContent(JSON.parse(serialized));
}

/** Publish transformation mirrors the existing RPC: validated draft becomes the published snapshot. */
export function createPublishedPuckSnapshot(
  draft: PublicSiteContentWithPuck,
): PublicSiteContentWithPuck {
  return deserializePuckStorageContent(serializePuckStorageContent(draft));
}
