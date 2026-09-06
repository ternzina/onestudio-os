"use client";

import { createUsePuck } from "@puckeditor/core";
import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { PUCK_PRODUCTION_MANIFEST } from "@/lib/puck-site-editor/registry-manifest";
import type { PuckDocumentComponent } from "@/lib/puck-site-editor/document";
import {
  createProductLibraryMetadata,
  matchesProductLibrarySearch,
  PRODUCT_LIBRARY_CATEGORY_ORDER,
  type ProductLibraryCategory,
} from "@/lib/puck-site-editor/product-library";
import styles from "./product-library-drawer.module.css";
import { PuckProductionProperties } from "./production-properties-panel";
import {
  guardProductionPreviewNavigation,
  guardProductionPreviewSubmit,
  ProductionFieldLabel,
  useProductionEditorTheme,
} from "./production-editor-ux";
import { PuckProductionBlock } from "./public-renderer";
import { ProductionPreviewViewport } from "./production-preview-fit";

const productItems = PUCK_PRODUCTION_MANIFEST.map((entry) => ({
  entry,
  metadata: createProductLibraryMetadata({
    type: entry.id,
    displayName: entry.label,
    catalogKey: entry.catalogKey,
    sourceKind: entry.catalogKey.startsWith("pro-block:") ? "pro-block" : "component",
    category: entry.taxonomy,
    sourceTier: entry.sourceTier,
  }),
}));
const usePuck = createUsePuck();

function PuckPilotHeaderActions({ children }: { children: ReactNode }) {
  const dispatch = usePuck((state) => state.dispatch);
  const previewMode = usePuck((state) => state.appState.ui.previewMode);
  const leftSideBarVisible = usePuck((state) => state.appState.ui.leftSideBarVisible);
  const rightSideBarVisible = usePuck((state) => state.appState.ui.rightSideBarVisible);
  const interactive = previewMode === "interactive";
  const editSidebarsRef = useRef({ leftSideBarVisible: true, rightSideBarVisible: true });

  return (
    <>
      <button
        type="button"
        aria-pressed={interactive}
        onClick={() => {
          if (!interactive) {
            editSidebarsRef.current = { leftSideBarVisible, rightSideBarVisible };
            dispatch({
              type: "setUi",
              ui: {
                previewMode: "interactive",
                leftSideBarVisible: false,
                // Keep the Puck-owned inspector mounted while the canvas enters
                // interaction mode. Selection and field state remain the single
                // source of truth in Puck; only the canvas authoring chrome is
                // hidden.
                rightSideBarVisible: true,
              },
            });
            return;
          }
          dispatch({
            type: "setUi",
            ui: {
              previewMode: "edit",
              ...editSidebarsRef.current,
            },
          });
        }}
      >
        {interactive ? "Edit layout" : "Interact with page"}
      </button>
      {children}
    </>
  );
}

function ProductionLibraryPreview({
  entry,
  isDark,
  previewRef,
  onPointerStay,
  onPointerLeave,
}: {
  entry: (typeof PUCK_PRODUCTION_MANIFEST)[number];
  isDark: boolean;
  previewRef: RefObject<HTMLElement | null>;
  onPointerStay: () => void;
  onPointerLeave: () => void;
}) {
  const component: PuckDocumentComponent = {
    type: entry.id,
    props: {
      id: `production-library-preview-${entry.id}`,
      ...structuredClone(entry.defaults),
    },
  };

  return (
    <section
      className={`${styles.preview} ${isDark ? `${styles.darkPreview} dark` : ""}`}
      aria-label={`${entry.label} live preview`}
      ref={previewRef}
      onPointerEnter={onPointerStay}
      onPointerMove={onPointerStay}
      onPointerLeave={onPointerLeave}
      onClickCapture={guardProductionPreviewNavigation}
      onAuxClickCapture={guardProductionPreviewNavigation}
      onSubmitCapture={guardProductionPreviewSubmit}
    >
      <header className={styles.previewHead}>
        <strong>{entry.label}</strong>
      </header>
      <div
        className={styles.previewStage}
        data-production-preview-scroll-realm={entry.presentationContract?.geometry.kind === "viewport" ? "local" : undefined}
      >
        <ProductionPreviewViewport presentation={entry.presentationContract}>
          <div
            className={styles.previewMount}
            data-preview-kind={entry.sourceKind}
            data-production-preview-fill={entry.presentationContract?.geometry.kind === "fullSurface" ? "direct" : undefined}
          >
            <PuckProductionBlock component={component} runtimeMode="library-preview" />
          </div>
        </ProductionPreviewViewport>
      </div>
    </section>
  );
}

export function PuckPilotProductLibrary() {
  const isDark = useProductionEditorTheme();
  const dispatch = usePuck((state) => state.dispatch);
  const content = usePuck((state) => state.appState.data.content);
  const selection = usePuck((state) => state.appState.ui.itemSelector);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<ProductLibraryCategory>>(
    () => new Set(PRODUCT_LIBRARY_CATEGORY_ORDER),
  );
  const libraryRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleItems = normalizedQuery
    ? productItems.filter((item) => matchesProductLibrarySearch(item.metadata, normalizedQuery))
    : productItems;
  const groups = PRODUCT_LIBRARY_CATEGORY_ORDER.flatMap((category) => {
    const items = visibleItems.filter((item) => item.entry.taxonomy === category);
    return items.length ? [{ category, items }] : [];
  });

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);

  const closePreview = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
    setActiveId(null);
  }, []);

  useEffect(() => () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    if (selection) closePreview();
  }, [closePreview, selection]);

  useEffect(() => {
    if (query) closePreview();
  }, [closePreview, query]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!libraryRef.current?.contains(target) && !previewRef.current?.contains(target)) closePreview();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [closePreview]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePreview();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closePreview]);

  useEffect(() => {
    window.addEventListener("puck-theme-preview-hold", cancelClose);
    return () => window.removeEventListener("puck-theme-preview-hold", cancelClose);
  }, [cancelClose]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(closePreview, 120);
  }, [cancelClose, closePreview]);

  const showPreview = useCallback((id: string) => {
    cancelClose();
    if (activeId === id) return;
    if (openTimer.current) clearTimeout(openTimer.current);
    // Keep the current live source visible while the replacement lazy source
    // resolves; PuckProductionBlock remains the shared runtime contract.
    openTimer.current = setTimeout(() => {
      setActiveId(id);
      openTimer.current = null;
    }, 150);
  }, [activeId, cancelClose]);

  const toggleCategory = (category: ProductLibraryCategory) => {
    setCollapsedCategories((previous) => {
      const next = new Set(previous);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const add = (componentType: string) => {
    closePreview();
    const destinationIndex = content.length;
    dispatch({
      type: "insert",
      componentType,
      destinationIndex,
      destinationZone: "root:default-zone",
      id: crypto.randomUUID(),
      recordHistory: true,
    });
    dispatch({
      type: "setUi",
      ui: { itemSelector: { index: destinationIndex, zone: "root:default-zone" } },
      recordHistory: false,
    });
  };

  const activeEntry = activeId
    ? productItems.find((item) => item.entry.id === activeId)?.entry
    : undefined;

  return (
    <aside
      ref={libraryRef}
      className={`${styles.library} ${isDark ? styles.darkLibrary : ""}`}
      aria-label="Product component library"
      onPointerEnter={cancelClose}
      onPointerLeave={scheduleClose}
    >
      <header className={styles.header}>
        <h2>Библиотека блоков</h2>
        <p className={styles.subtitle}>Hover a block to preview it</p>
        <div className={styles.search}>
          <input
            aria-label="Поиск блоков"
            placeholder="Поиск блоков…"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query ? (
            <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>
              ×
            </button>
          ) : null}
        </div>
      </header>

      <div className={styles.categories}>
        {groups.length ? groups.map(({ category, items }) => {
          const collapsed = !normalizedQuery && collapsedCategories.has(category);
          const contentId = `pilot-library-${category.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
          return (
            <section className={styles.category} aria-label={category} key={category}>
              <h3>
                <button
                  className={styles.categoryToggle}
                  type="button"
                  aria-expanded={!collapsed}
                  aria-controls={contentId}
                  onClick={() => toggleCategory(category)}
                >
                  <span>{category}</span>
                  <span className={styles.categoryMeta}>
                    <small>{items.length}</small>
                    <span aria-hidden="true">{collapsed ? "▸" : "▾"}</span>
                  </span>
                </button>
              </h3>
              {!collapsed ? (
                <div className={styles.items} id={contentId}>
                  <div className={styles.libraryGrid}>
                    {items.map(({ entry }, index) => (
                      <article
                        className={styles.card}
                        key={entry.id}
                        onPointerEnter={() => showPreview(entry.id)}
                      >
                        <button
                          className={styles.cardMain}
                          type="button"
                          aria-label={`Add ${entry.label} from card`}
                          onFocus={() => showPreview(entry.id)}
                          onClick={() => add(entry.id)}
                        >
                          <span className={styles.cardNumber}>{String(index + 1).padStart(2, "0")}</span>
                          <strong>{entry.label}</strong>
                        </button>
                        <button
                          className={styles.addButton}
                          type="button"
                          aria-label={`Add ${entry.label}`}
                          onFocus={() => showPreview(entry.id)}
                          onClick={() => add(entry.id)}
                        >
                          +
                        </button>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          );
        }) : (
          <p className={styles.empty} role="status">No matching components.</p>
        )}
      </div>
      {activeEntry ? (
        <ProductionLibraryPreview
          entry={activeEntry}
          isDark={isDark}
          previewRef={previewRef}
          onPointerStay={cancelClose}
          onPointerLeave={scheduleClose}
        />
      ) : null}
    </aside>
  );
}

export const PUCK_PRODUCTION_EDITOR_OVERRIDES = {
  headerActions: PuckPilotHeaderActions,
  fields: PuckProductionProperties,
  fieldLabel: ProductionFieldLabel,
} as const;
