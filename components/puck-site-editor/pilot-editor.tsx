"use client";

import "@puckeditor/core/puck.css";
import Link from "next/link";
import { Puck, type Data } from "@puckeditor/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PUCK_PRODUCTION_EDITOR_CONFIG } from "./editor-config";
import {
  PuckPilotProductLibrary,
  PUCK_PRODUCTION_EDITOR_OVERRIDES,
} from "./product-library-drawer";
import { ProductionEditorProvider } from "./production-editor-ux";
import { createPuckPilotFixture } from "@/lib/puck-site-editor/pilot-fixture";
import { puckDataToDocument, puckDocumentToData, type ProductionPuckData } from "@/lib/puck-site-editor/data-adapter";
import type { PuckDocumentV1 } from "@/lib/puck-site-editor/document";
import { readLocalPuckDocument, writeLocalPuckDocument } from "@/lib/puck-site-editor/client-local-store";
import { PUCK_PRODUCTION_AUTHORING_UI } from "@/lib/puck-site-editor/authoring-viewport";
import styles from "./pilot-editor.module.css";

type PilotEditorProps = {
  businessId: string;
  locale: string;
  initialDocument?: PuckDocumentV1;
  publicPreviewHref: string;
};

export default function PuckPilotEditor({
  businessId,
  locale,
  initialDocument,
  publicPreviewHref,
}: PilotEditorProps) {
  const fallback = initialDocument ?? createPuckPilotFixture(locale);
  const scope = { businessId, locale, pageId: fallback.metadata.pageId };
  const [data, setData] = useState<Data | null>(null);
  const [status, setStatus] = useState<"saved" | "unsaved" | "error">("saved");
  const [message, setMessage] = useState("");
  const documentRef = useRef(fallback);
  const plugins = useMemo(() => [{
    name: "library",
    label: "Библиотека",
    render: PuckPilotProductLibrary,
    mobilePanelHeight: "min-content" as const,
  }], []);

  useEffect(() => {
    try {
      const loaded = readLocalPuckDocument("draft", scope) ?? fallback;
      documentRef.current = loaded;
      setData(puckDocumentToData(loaded) as Data);
      setStatus("saved");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load pilot draft");
      setData(puckDocumentToData(fallback) as Data);
      setStatus("error");
    }
  }, [businessId, locale]);

  const toDocument = useCallback((next: Data) => {
    const rootProps = (next.root.props ?? {}) as Record<string, unknown>;
    const rootTheme = String(rootProps.theme ?? "inherit");
    const normalized: ProductionPuckData = {
      root: {
        props: {
          theme: ["light", "dark"].includes(rootTheme)
            ? rootTheme as "light" | "dark"
            : "inherit",
        },
      },
      content: next.content.map((component) => ({
        type: component.type,
        props: component.props as ProductionPuckData["content"][number]["props"],
      })),
    };
    return puckDataToDocument(normalized, { pageId: scope.pageId, locale });
  }, [locale, scope.pageId]);

  const onChange = useCallback((next: Data) => {
    try {
      documentRef.current = toDocument(next);
      setStatus("unsaved");
      setMessage("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Document validation failed");
    }
  }, [toDocument]);

  const save = useCallback(() => {
    try {
      documentRef.current = writeLocalPuckDocument("draft", scope, documentRef.current);
      setStatus("saved");
      setMessage("Local/test draft saved");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Save failed");
    }
  }, [businessId, locale, scope.pageId]);

  const publish = useCallback((next: Data) => {
    try {
      const document = toDocument(next);
      writeLocalPuckDocument("draft", scope, document);
      writeLocalPuckDocument("published", scope, document);
      documentRef.current = document;
      setStatus("saved");
      setMessage("Publish simulation complete — no production RPC executed");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Publish simulation failed");
    }
  }, [businessId, locale, scope.pageId, toDocument]);

  if (!data) return <div className={styles.loading} role="status">Loading Puck pilot…</div>;

  return (
    <ProductionEditorProvider locale={locale} businessId={businessId} pilot>
      <div className={styles.toolbar}>
        <strong>Puck Site Editor Pilot</strong>
        <span data-save-status={status}>{status === "unsaved" ? "Unsaved changes" : status === "error" ? "Validation error" : "Saved"}</span>
        <button type="button" data-primary="true" onClick={save}>Save draft</button>
        <Link href={publicPreviewHref}>Open public pilot render</Link>
        {message ? <span role={status === "error" ? "alert" : "status"}>{message}</span> : null}
      </div>
      <div className={styles.editor}>
        <Puck
          config={PUCK_PRODUCTION_EDITOR_CONFIG}
          data={data}
          onChange={onChange}
          onPublish={publish}
          overrides={PUCK_PRODUCTION_EDITOR_OVERRIDES}
          plugins={plugins}
          headerTitle="OneStudio · Puck Pilot"
          ui={{
            leftSideBarVisible: true,
            rightSideBarVisible: true,
            previewMode: "edit",
            plugin: { current: "library" },
            viewports: PUCK_PRODUCTION_AUTHORING_UI,
          }}
          dictionary={{
            "plugin-blocks": "Блоки",
            "plugin-outline": "Структура",
            "outline-header-title": "Структура",
          }}
        >
          <Puck.Layout />
        </Puck>
      </div>
    </ProductionEditorProvider>
  );
}
