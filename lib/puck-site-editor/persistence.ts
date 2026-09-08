import type { PublicSiteContent } from "../public-site/types.ts";
import type { PuckDocumentV1 } from "./document.ts";
import {
  attachPuckDocument,
  createPublishedPuckSnapshot,
  readPuckDocument,
  type PublicSiteContentWithPuck,
} from "./storage.ts";

export type PuckTenantContext = {
  businessId: string;
  userId: string;
  role: "owner" | "admin" | "manager" | "editor" | "viewer";
};

export type PuckStorageScope = {
  businessId: string;
  locale: string;
  pageId: string;
};

export interface PuckContentRepository {
  readDraft(scope: PuckStorageScope): Promise<PublicSiteContentWithPuck | null>;
  writeDraft(scope: PuckStorageScope, content: PublicSiteContentWithPuck): Promise<void>;
  readPublished(scope: PuckStorageScope): Promise<PublicSiteContentWithPuck | null>;
  writePublished(scope: PuckStorageScope, content: PublicSiteContentWithPuck): Promise<void>;
}

const canWrite = (role: PuckTenantContext["role"]) =>
  role === "owner" || role === "admin" || role === "manager" || role === "editor";

const scopeFor = (
  context: PuckTenantContext,
  document: Pick<PuckDocumentV1, "metadata">,
): PuckStorageScope => ({
  businessId: context.businessId,
  locale: document.metadata.locale,
  pageId: document.metadata.pageId,
});

export function createPuckPersistenceService(repository: PuckContentRepository) {
  return {
    async loadDraft(
      context: PuckTenantContext,
      input: { locale: string; pageId: string },
    ): Promise<PuckDocumentV1 | null> {
      const content = await repository.readDraft({
        businessId: context.businessId,
        locale: input.locale,
        pageId: input.pageId,
      });
      return content ? readPuckDocument(content) : null;
    },

    async savePuckDraft(
      context: PuckTenantContext,
      document: PuckDocumentV1,
      legacyContent: PublicSiteContent,
    ): Promise<PuckDocumentV1> {
      if (!canWrite(context.role)) throw new Error("puck_draft_write_forbidden");
      const scope = scopeFor(context, document);
      const content = attachPuckDocument(legacyContent, document);
      await repository.writeDraft(scope, content);
      const persisted = await repository.readDraft(scope);
      const roundTrip = persisted ? readPuckDocument(persisted) : null;
      if (!roundTrip || JSON.stringify(roundTrip) !== JSON.stringify(content.puck_document)) {
        throw new Error("puck_draft_round_trip_failed");
      }
      return roundTrip;
    },

    async publishPuckDraft(
      context: PuckTenantContext,
      input: { locale: string; pageId: string },
    ): Promise<PuckDocumentV1> {
      if (!canWrite(context.role)) throw new Error("puck_publish_forbidden");
      const scope = { businessId: context.businessId, ...input };
      const draft = await repository.readDraft(scope);
      if (!draft) throw new Error("puck_draft_not_found");
      const published = createPublishedPuckSnapshot(draft);
      await repository.writePublished(scope, published);
      const roundTrip = await repository.readPublished(scope);
      const document = roundTrip ? readPuckDocument(roundTrip) : null;
      if (!document) throw new Error("puck_publish_round_trip_failed");
      return document;
    },
  };
}

export class InMemoryPuckContentRepository implements PuckContentRepository {
  private drafts = new Map<string, PublicSiteContentWithPuck>();
  private published = new Map<string, PublicSiteContentWithPuck>();

  private key(scope: PuckStorageScope) {
    return `${scope.businessId}\u0000${scope.locale.toLowerCase()}\u0000${scope.pageId}`;
  }

  async readDraft(scope: PuckStorageScope) {
    return structuredClone(this.drafts.get(this.key(scope)) ?? null);
  }

  async writeDraft(scope: PuckStorageScope, content: PublicSiteContentWithPuck) {
    this.drafts.set(this.key(scope), structuredClone(content));
  }

  async readPublished(scope: PuckStorageScope) {
    return structuredClone(this.published.get(this.key(scope)) ?? null);
  }

  async writePublished(scope: PuckStorageScope, content: PublicSiteContentWithPuck) {
    this.published.set(this.key(scope), structuredClone(content));
  }
}
