"use client";

import "@puckeditor/core/puck.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUsePuck, Puck, type Data } from "@puckeditor/core";
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

const usePuck = createUsePuck();

function PuckEditorKeyboardShortcuts({ onSave }: { onSave: () => void }) {
  const undo = usePuck((state) => state.history.back);
  const redo = usePuck((state) => state.history.forward);

  useEffect(() => {
    const isTextEditingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return target.matches("input, textarea, [contenteditable='true'], [contenteditable='']")
        || Boolean(target.closest("[contenteditable='true'], [contenteditable='']"));
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing || event.key === "Process") return;
      const modifier = event.metaKey || event.ctrlKey;
      if (!modifier) return;

      const key = event.key.toLowerCase();
      if (key === "s") {
        event.preventDefault();
        onSave();
        return;
      }
      if (isTextEditingTarget(event.target)) return;
      if (key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (key === "y" && event.ctrlKey && !event.metaKey && !event.shiftKey) {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave, redo, undo]);

  return null;
}

export default function PuckPilotEditor({
  businessId,
  locale,
  initialDocument,
  publicPreviewHref,
}: PilotEditorProps) {
  const fallback = initialDocument ?? createPuckPilotFixture(locale);
  const scope = { businessId, locale, pageId: fallback.metadata.pageId };
  const [data, setData] = useState<Data | null>(null);
  const [status, setStatus] = useState<"clean" | "dirty" | "saving" | "save-error">("clean");
  const [publishStatus, setPublishStatus] = useState<"idle" | "publishing" | "published" | "publish-error">("idle");
  const [publishedDrift, setPublishedDrift] = useState(false);
  const [message, setMessage] = useState("");
  const [leaveHref, setLeaveHref] = useState<string | null>(null);
  const allowNavigationRef = useRef(false);
  const router = useRouter();
  const documentRef = useRef(fallback);
  const savedDocumentRef = useRef(fallback);
  const savingRef = useRef(false);
  const plugins = useMemo(() => [{
    name: "library",
    label: "Библиотека",
    render: PuckPilotProductLibrary,
    mobilePanelHeight: "min-content" as const,
  }], []);

  useEffect(() => {
    try {
      const loaded = readLocalPuckDocument("draft", scope) ?? fallback;
      const published = readLocalPuckDocument("published", scope);
      documentRef.current = loaded;
      savedDocumentRef.current = loaded;
      setPublishedDrift(Boolean(published && JSON.stringify(loaded) !== JSON.stringify(published)));
      setData(puckDocumentToData(loaded) as Data);
      setStatus("clean");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load pilot draft");
      setData(puckDocumentToData(fallback) as Data);
      setStatus("save-error");
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
      const nextDocument = toDocument(next);
      documentRef.current = nextDocument;
      setStatus(JSON.stringify(nextDocument) === JSON.stringify(savedDocumentRef.current) ? "clean" : "dirty");
      setMessage("");
    } catch (error) {
      setStatus("save-error");
      setMessage(error instanceof Error ? error.message : "Document validation failed");
    }
  }, [toDocument]);

  const save = useCallback(async () => {
    if (savingRef.current || status === "saving" || status === "clean") return;
    savingRef.current = true;
    const snapshot = documentRef.current;
    setStatus("saving");
    setMessage("");
    try {
      await Promise.resolve();
      writeLocalPuckDocument("draft", scope, snapshot);
      savedDocumentRef.current = snapshot;
      const published = readLocalPuckDocument("published", scope);
      setPublishedDrift(Boolean(published && JSON.stringify(snapshot) !== JSON.stringify(published)));
      setStatus(JSON.stringify(documentRef.current) === JSON.stringify(snapshot) ? "clean" : "dirty");
    } catch (error) {
      setStatus("save-error");
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить");
    } finally {
      savingRef.current = false;
    }
  }, [businessId, locale, scope.pageId, status]);

  const publish = useCallback(async (next: Data) => {
    const document = toDocument(next);
    if (JSON.stringify(document) !== JSON.stringify(savedDocumentRef.current)) {
      setMessage("Сначала сохраните изменения");
      setPublishStatus("idle");
      return;
    }
    setPublishStatus("publishing");
    setMessage("");
    try {
      await Promise.resolve();
      writeLocalPuckDocument("draft", scope, document);
      writeLocalPuckDocument("published", scope, document);
      setPublishedDrift(false);
      setPublishStatus("published");
    } catch (error) {
      setPublishStatus("publish-error");
      setMessage(error instanceof Error ? error.message : "Не удалось опубликовать");
    }
  }, [businessId, locale, scope.pageId, toDocument]);

  const isDirty = status !== "clean";

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (allowNavigationRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const requestLeave = useCallback((href: string) => {
    if (!isDirty) {
      router.push(href);
      return;
    }
    setLeaveHref(href);
  }, [isDirty, router]);

  const confirmLeave = useCallback(() => {
    if (!leaveHref) return;
    allowNavigationRef.current = true;
    router.push(leaveHref);
    setLeaveHref(null);
    window.setTimeout(() => { allowNavigationRef.current = false; }, 0);
  }, [leaveHref, router]);

  if (!data) return <div className={styles.loading} role="status">Loading Puck pilot…</div>;

  return (
    <ProductionEditorProvider locale={locale} businessId={businessId} pilot>
      <div className={styles.toolbar}>
        <strong>Puck Site Editor Pilot</strong>
        <span className={styles.saveStatus} data-save-status={status} aria-live="polite">
          {status === "dirty" ? "Есть несохранённые изменения" : status === "saving" ? "Сохранение…" : status === "save-error" ? "Не удалось сохранить" : "Сохранено ✓"}
        </span>
        {publishedDrift ? <span className={styles.driftStatus}>Есть неопубликованные изменения</span> : null}
        <button type="button" data-primary="true" onClick={save} disabled={status === "clean" || status === "saving"}>
          {status === "saving" ? "Сохранение…" : status === "save-error" ? "Сохранить снова" : "Сохранить"}
        </button>
        <button
          type="button"
          data-publish-action="true"
          onClick={() => void publish(data)}
          disabled={status !== "clean" || publishStatus === "publishing"}
        >
          Опубликовать
        </button>
        <Link href={publicPreviewHref} onClick={(event) => {
          event.preventDefault();
          requestLeave(publicPreviewHref);
        }}>Open public pilot render</Link>
        {publishStatus !== "idle" ? <span className={styles.publishStatus} aria-live="polite">
          {publishStatus === "publishing" ? "Публикация…" : publishStatus === "published" ? "Опубликовано ✓" : "Не удалось опубликовать"}
        </span> : null}
        {message ? <span role={status === "save-error" || publishStatus === "publish-error" ? "alert" : "status"}>{message}</span> : null}
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
            "plugin-fields": "Настройки",
            "outline-header-title": "Структура",
          }}
        >
          <PuckEditorKeyboardShortcuts onSave={() => void save()} />
          <Puck.Layout />
        </Puck>
      </div>
      {leaveHref ? (
        <div className={styles.leaveBackdrop} role="presentation">
          <div className={styles.leaveDialog} role="dialog" aria-modal="true" aria-labelledby="leave-dialog-title" onKeyDown={(event) => {
            if (event.key === "Escape") setLeaveHref(null);
          }} tabIndex={-1} ref={(node) => node?.focus()}>
            <h2 id="leave-dialog-title">Есть несохранённые изменения</h2>
            <p>Выйти без сохранения?</p>
            <div className={styles.leaveActions}>
              <button type="button" onClick={() => setLeaveHref(null)}>Остаться</button>
              <button type="button" data-primary="true" onClick={confirmLeave}>Выйти без сохранения</button>
            </div>
          </div>
        </div>
      ) : null}
    </ProductionEditorProvider>
  );
}
