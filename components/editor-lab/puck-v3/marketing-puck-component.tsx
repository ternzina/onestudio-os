"use client";

import type { ComponentConfig } from "@puckeditor/core";
import { useLayoutEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { guardEditorPreviewNavigation, guardEditorPreviewSubmit, stripEditorProps, type BlockContract } from "@/components/editor-lab/puck/block-contract";
import { ReactBitsHost } from "@/components/editor-lab/puck/reactbits-host";
import { bindArrayItemsContracts } from "@/components/editor-lab/puck/array-items-contract";
import styles from "./puck-lab-v3.module.css";

type EditableProps = object;

/** Uniformly fit a complete Marketing section into the V3 hover popup. */
export function MarketingPreview({ children }: { children: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ width: 1, height: 1, scale: 1, left: 0, top: 0 });

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const scene = sceneRef.current;
    if (!viewport || !scene) return;

    const measure = () => {
      const availableWidth = viewport.clientWidth;
      const availableHeight = viewport.clientHeight;
      const editorWidth = document.querySelector<HTMLIFrameElement>("iframe")?.contentWindow?.innerWidth;
      const width = Math.max(availableWidth, editorWidth ?? availableWidth);
      scene.style.width = `${width}px`;
      const height = Math.max(scene.scrollHeight, scene.getBoundingClientRect().height, 1);
      const scale = Math.min(1, availableWidth / width, availableHeight / height);
      const left = Math.max(0, (availableWidth - width * scale) / 2);
      const top = Math.max(0, (availableHeight - height * scale) / 2);
      setFit((previous) =>
        Math.abs(previous.width - width) < 0.5 &&
        Math.abs(previous.height - height) < 0.5 &&
        Math.abs(previous.scale - scale) < 0.0001 &&
        Math.abs(previous.left - left) < 0.5 &&
        Math.abs(previous.top - top) < 0.5
          ? previous
          : { width, height, scale, left, top },
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(scene);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={viewportRef}
      className={styles.marketingPreviewViewport}
      onSubmitCapture={guardEditorPreviewSubmit}
    >
      <div
        ref={sceneRef}
        className={styles.marketingPreviewScene}
        data-marketing-preview-scale={fit.scale}
        style={{
          width: fit.width,
          minHeight: fit.height,
          transform: `translate(${fit.left}px, ${fit.top}px) scale(${fit.scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Marketing blocks keep their source layout and use a flow-sized Puck boundary. */
export function createMarketingPuckComponent<Props extends EditableProps>(
  contract: BlockContract<Props>,
): ComponentConfig {
  const boundArrays = bindArrayItemsContracts(contract.arrayItems, contract.fields as Record<string, unknown>, contract.defaultProps as Record<string, unknown>);
  return {
    label: contract.displayName,
    // Marketing blocks normally expose no source props. Adapted editor copies
    // declare only their explicit serializable content contract here.
    fields: boundArrays.fields as ComponentConfig["fields"],
    defaultProps: { ...boundArrays.defaults },
    inline: false,
    render: (props) => {
      const { puck } = props as typeof props & {
        puck: { dragRef: Ref<HTMLDivElement> };
      };
      const userProps = stripEditorProps<Props>(props as Record<string, unknown>);
      const Block = contract.component;
      return (
        <div
          ref={puck.dragRef}
          className={styles.marketingBoundary}
          onClickCapture={guardEditorPreviewNavigation}
          onAuxClickCapture={guardEditorPreviewNavigation}
          onSubmitCapture={guardEditorPreviewSubmit}
        >
          <ReactBitsHost spec={contract.host}>
            <Block {...(userProps as Props)} />
          </ReactBitsHost>
        </div>
      );
    },
  };
}
