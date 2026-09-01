"use client";

import { useEffect, useState } from "react";
import PuckPublicRenderer from "./public-renderer";
import { createPuckPilotFixture } from "@/lib/puck-site-editor/pilot-fixture";
import type { PuckDocumentV1 } from "@/lib/puck-site-editor/document";
import { readLocalPuckDocument } from "@/lib/puck-site-editor/client-local-store";

export default function PuckPilotPublicPreview({
  businessId,
  locale,
  pageId = "pilot-home",
}: {
  businessId: string;
  locale: string;
  pageId?: string;
}) {
  const [document, setDocument] = useState<PuckDocumentV1 | null>(null);
  const [source, setSource] = useState("fixture");

  useEffect(() => {
    const scope = { businessId, locale, pageId };
    const published = readLocalPuckDocument("published", scope);
    const draft = readLocalPuckDocument("draft", scope);
    setDocument(published ?? draft ?? createPuckPilotFixture(locale));
    setSource(published ? "published-simulation" : draft ? "draft" : "fixture");
  }, [businessId, locale, pageId]);

  if (!document) return <p role="status">Loading public pilot render…</p>;
  return (
    <div data-puck-public-pilot data-render-source={source}>
      <PuckPublicRenderer document={document} />
    </div>
  );
}
