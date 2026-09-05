"use client";

import { Render, type Data } from "@puckeditor/core";
import { useLayoutEffect, useRef, useState } from "react";
import {
  PUCK_PRODUCTION_RUNTIME_DATA_MESSAGE,
  PUCK_PRODUCTION_RUNTIME_READY_MESSAGE,
} from "@/components/puck-site-editor/production-runtime-frame";
import { PUCK_PRODUCTION_EDITOR_CONFIG } from "@/components/puck-site-editor/editor-config";
import { ProductionEditorThemeProvider } from "@/components/puck-site-editor/production-editor-ux";
import { ProductionRuntimeBoundary } from "@/components/puck-site-editor/production-runtime-context";
import type { ProductionRuntimeMode } from "@/lib/puck-site-editor/runtime-realm";

type RuntimeMessage = {
  type?: string;
  data?: Data;
  background?: string;
  theme?: "light" | "dark";
  runtimeMode?: ProductionRuntimeMode;
};

type RealmCheck = {
  ownerWindow: boolean;
  globalWindow: boolean;
  ownerDocument: boolean;
  globalDocument: boolean;
  rafWindow: boolean;
};

export default function PuckRuntimePage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<Data | null>(null);
  const [background, setBackground] = useState("transparent");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [runtimeMode, setRuntimeMode] = useState<ProductionRuntimeMode>("interactive");
  const [realm, setRealm] = useState<RealmCheck | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const ownerDocument = root?.ownerDocument ?? document;
    const ownerWindow = ownerDocument.defaultView;
    const globalWindow = globalThis.window;
    const globalDocument = globalThis.document;
    const rafWindow = ownerWindow?.requestAnimationFrame;
    setRealm({
      ownerWindow: ownerWindow === globalWindow,
      globalWindow: globalWindow === ownerWindow,
      ownerDocument: ownerDocument === globalDocument,
      globalDocument: globalDocument === ownerDocument,
      rafWindow: rafWindow === globalWindow?.requestAnimationFrame,
    });
    const previous = {
      htmlHeight: document.documentElement.style.height,
      bodyHeight: document.body.style.height,
      bodyMargin: document.body.style.margin,
      bodyOverflow: document.body.style.overflow,
    };
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.height = previous.htmlHeight;
      document.body.style.height = previous.bodyHeight;
      document.body.style.margin = previous.bodyMargin;
      document.body.style.overflow = previous.bodyOverflow;
    };
  }, []);

  useLayoutEffect(() => {
    const parent = window.parent;
    let parentOrigin = "null";
    try {
      if (parent.location.origin && parent.location.origin !== "null") parentOrigin = parent.location.origin;
    } catch {
      // A Puck srcDoc parent has an opaque origin. The same-origin top-level
      // host is also accepted because Puck portals component code through the
      // srcDoc while preserving the app window as its JavaScript realm.
    }
    const onMessage = (event: MessageEvent<RuntimeMessage>) => {
      const sourceIsAllowedHost = event.source === parent || event.source === window.top;
      if (!sourceIsAllowedHost || (event.origin !== window.location.origin && event.origin !== parentOrigin)) return;
      if (event.data?.type !== PUCK_PRODUCTION_RUNTIME_DATA_MESSAGE || !event.data.data) return;
      setBackground(event.data.background ?? "transparent");
      setTheme(event.data.theme === "dark" ? "dark" : "light");
      setRuntimeMode(event.data.runtimeMode ?? "interactive");
      setData(event.data.data);
    };
    window.addEventListener("message", onMessage);
    parent.postMessage({ type: PUCK_PRODUCTION_RUNTIME_READY_MESSAGE }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div
      ref={rootRef}
      className={theme === "dark" ? "dark" : undefined}
      data-puck-runtime-root
      data-puck-runtime-pointer-events="local"
      data-puck-runtime-owner-window={realm?.ownerWindow ? "match" : "pending"}
      data-puck-runtime-global-window={realm?.globalWindow ? "match" : "pending"}
      data-puck-runtime-owner-document={realm?.ownerDocument ? "match" : "pending"}
      data-puck-runtime-global-document={realm?.globalDocument ? "match" : "pending"}
      data-puck-runtime-raf-window={realm?.rafWindow ? "match" : "pending"}
      data-puck-runtime-scroll-realm={runtimeMode === "library-preview" ? "local" : undefined}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        overflowY: runtimeMode === "library-preview" ? "auto" : "hidden",
        backgroundColor: background,
      }}
    >
      {data ? (
        <ProductionEditorThemeProvider isDark={theme === "dark"}>
          <ProductionRuntimeBoundary runtimeMode={runtimeMode}>
            <Render config={PUCK_PRODUCTION_EDITOR_CONFIG} data={data} />
          </ProductionRuntimeBoundary>
        </ProductionEditorThemeProvider>
      ) : null}
    </div>
  );
}
