"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { calculateProductionPreviewFit } from "@/lib/puck-site-editor/preview-fit";
import type { PuckProductionPresentationContract } from "@/lib/puck-site-editor/registry-manifest";
import styles from "./production-preview-fit.module.css";
import { guardProductionPreviewSubmit } from "./production-editor-ux";

/**
 * The editor presentation scene is resolved/measured before it is contained in
 * the fixed Library viewport. The transform is preview-only.
 */
export function ProductionPreviewViewport({
  children,
  presentation,
}: {
  children: ReactNode;
  presentation?: PuckProductionPresentationContract;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(() => calculateProductionPreviewFit({
    availableWidth: 1,
    availableHeight: 1,
    sceneWidth: 1,
    sceneHeight: 1,
  }));

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const scene = sceneRef.current;
    if (!viewport || !scene) return;

    const measure = () => {
      const availableWidth = viewport.clientWidth;
      const availableHeight = viewport.clientHeight;
      const editorFrame = document.querySelector<HTMLIFrameElement>("iframe#preview-frame, iframe");
      const editorWindow = editorFrame?.contentWindow;
      const editorWidth = editorWindow?.innerWidth;
      const editorHeight = editorWindow?.innerHeight;
      const sceneWidth = presentation?.editorPresentationDefault?.width.value
        ?? Math.max(editorWidth ?? availableWidth, 1);
      scene.style.width = `${sceneWidth}px`;
      if (presentation?.editorPresentationDefault) {
        const sceneHeight = presentation.editorPresentationDefault.height.value;
        scene.style.height = `${sceneHeight}px`;
        scene.style.minHeight = `${sceneHeight}px`;
      } else {
        scene.style.height = "";
        scene.style.minHeight = "";
      }
      const sceneHeight = presentation?.editorPresentationDefault?.height.value
        ?? (presentation?.geometry?.viewportHeight
          ? Math.max(editorHeight ?? availableHeight, 1)
          : Math.max(scene.scrollHeight, scene.getBoundingClientRect().height, 1));
      const next = calculateProductionPreviewFit({
        availableWidth,
        availableHeight,
        sceneWidth,
        sceneHeight,
      });
      setFit((previous) =>
        Math.abs(previous.width - next.width) < 0.5
        && Math.abs(previous.height - next.height) < 0.5
        && Math.abs(previous.scale - next.scale) < 0.0001
        && Math.abs(previous.left - next.left) < 0.5
        && Math.abs(previous.top - next.top) < 0.5
          ? previous
          : next,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(scene);
    return () => observer.disconnect();
  }, [presentation]);

  return (
    <div
      ref={viewportRef}
      className={styles.viewport}
      data-production-preview-fit="canonical-contain"
      data-production-preview-geometry={presentation?.geometry.kind}
      onSubmitCapture={guardProductionPreviewSubmit}
    >
      <div
        ref={sceneRef}
        className={styles.scene}
        data-production-preview-scale={fit.scale}
        data-production-preview-width={fit.width}
        data-production-preview-height={fit.height}
        style={{
          width: fit.width,
          height: fit.height,
          minHeight: fit.height,
          transform: `translate(${fit.left}px, ${fit.top}px) scale(${fit.scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
