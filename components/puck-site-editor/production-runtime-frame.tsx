"use client";

import type { Data } from "@puckeditor/core";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PuckDocumentComponent } from "@/lib/puck-site-editor/document";
import type { ProductionRuntimeMode } from "@/lib/puck-site-editor/runtime-realm";
import styles from "./production-runtime-frame.module.css";

export const PUCK_PRODUCTION_RUNTIME_ROUTE = "/puck-runtime" as const;
export const PUCK_PRODUCTION_RUNTIME_DATA_MESSAGE = "onestudio:puck-runtime-data" as const;
export const PUCK_PRODUCTION_RUNTIME_READY_MESSAGE = "onestudio:puck-runtime-ready" as const;

export type ProductionRuntimeData = Data;

export function productionRuntimeDataForComponent(component: PuckDocumentComponent): ProductionRuntimeData {
  return {
    root: { props: {} },
    content: [component as ProductionRuntimeData["content"][number]],
  } as ProductionRuntimeData;
}

function runtimeOrigin(frame?: HTMLIFrameElement | null) {
  if (typeof window === "undefined") return "";
  try {
    const frameOrigin = frame?.src ? new URL(frame.src, document.baseURI).origin : "";
    if (frameOrigin && frameOrigin !== "null") return frameOrigin;
    if (window.location.origin !== "null") return window.location.origin;
    const parentOrigin = window.parent.location.origin;
    if (parentOrigin && parentOrigin !== "null") return parentOrigin;
  } catch {
    // A Puck srcDoc preview can expose an opaque local origin. Fall through
    // to its referrer, which is the same-origin application URL.
  }
  try {
    return document.referrer ? new URL(document.referrer).origin : "";
  } catch {
    return "";
  }
}

export function ProductionRuntimeFrame({
  component,
  background,
  theme = "light",
  runtimeMode = "interactive",
}: {
  component: PuckDocumentComponent;
  background?: string;
  theme?: "light" | "dark";
  runtimeMode?: ProductionRuntimeMode;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const data = useMemo(() => productionRuntimeDataForComponent(component), [component]);
  const sendData = useCallback(() => {
    const frame = frameRef.current;
    const target = frame?.contentWindow;
    if (!target) return;
    target.postMessage(
      {
        type: PUCK_PRODUCTION_RUNTIME_DATA_MESSAGE,
        data,
        background: background ?? "transparent",
        theme,
      },
      runtimeOrigin(frame),
    );
  }, [background, data, theme]);

  useEffect(() => {
    if (!loaded) return;
    sendData();
    const retry = window.setTimeout(sendData, 0);
    return () => window.clearTimeout(retry);
  }, [loaded, sendData]);

  useLayoutEffect(() => {
    const onMessage = (event: MessageEvent<{ type?: string }>) => {
      const frame = frameRef.current;
      const hostWindow = frame?.ownerDocument.defaultView;
      if (event.source !== hostWindow || event.origin !== runtimeOrigin(frame)) return;
      if (event.data?.type === PUCK_PRODUCTION_RUNTIME_READY_MESSAGE) sendData();
    };
    const hostWindow = frameRef.current?.ownerDocument.defaultView ?? window;
    hostWindow.addEventListener("message", onMessage);
    return () => hostWindow.removeEventListener("message", onMessage);
  }, [sendData]);

  return (
    <iframe
      ref={frameRef}
      className={styles.frame}
      title="Interactive component runtime"
      src={PUCK_PRODUCTION_RUNTIME_ROUTE}
      data-puck-runtime-realm="iframeNative"
      data-puck-runtime-route={PUCK_PRODUCTION_RUNTIME_ROUTE}
      data-puck-runtime-mode={runtimeMode}
      data-puck-runtime-pointer-events={runtimeMode === "authoring" ? "disabled-authoring" : "contained"}
      style={{ pointerEvents: runtimeMode === "authoring" ? "none" : "auto" }}
      onLoad={() => setLoaded(true)}
    />
  );
}
