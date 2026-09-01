"use client";

import { createUsePuck, Drawer } from "@puckeditor/core";
import { useRef, useState, type ReactNode } from "react";
import { PUCK_PRODUCTION_MANIFEST } from "@/lib/puck-site-editor/registry-manifest";
import {
  createProductLibraryMetadata,
  matchesProductLibrarySearch,
  PRODUCT_LIBRARY_CATEGORY_ORDER,
  type ProductLibraryCategory,
} from "@/lib/puck-site-editor/product-library";
import styles from "./product-library-drawer.module.css";
import { PuckProductionProperties } from "./production-properties-panel";

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
                rightSideBarVisible: false,
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

export function PuckPilotProductLibrary() {
  const dispatch = usePuck((state) => state.dispatch);
  const content = usePuck((state) => state.appState.data.content);
  const [query, setQuery] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<ProductLibraryCategory>>(
    () => new Set(PRODUCT_LIBRARY_CATEGORY_ORDER),
  );
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleItems = normalizedQuery
    ? productItems.filter((item) => matchesProductLibrarySearch(item.metadata, normalizedQuery))
    : productItems;
  const groups = PRODUCT_LIBRARY_CATEGORY_ORDER.flatMap((category) => {
    const items = visibleItems.filter((item) => item.entry.taxonomy === category);
    return items.length ? [{ category, items }] : [];
  });

  const toggleCategory = (category: ProductLibraryCategory) => {
    setCollapsedCategories((previous) => {
      const next = new Set(previous);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const add = (componentType: string) => {
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

  return (
    <aside className={styles.library} aria-label="Product component library">
      <header className={styles.header}>
        <h2>Библиотека блоков</h2>
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
                  <Drawer>
                    {items.map(({ entry }) => (
                      <div className={styles.item} key={entry.id}>
                        <Drawer.Item name={entry.id} label={entry.label} />
                        <span className={styles.tierBadge} data-tier={entry.sourceTier}>
                          {entry.sourceTier}
                        </span>
                        <button
                          className={styles.addButton}
                          type="button"
                          aria-label={`Добавить ${entry.label}`}
                          onClick={() => add(entry.id)}
                        >
                          +
                        </button>
                      </div>
                    ))}
                  </Drawer>
                </div>
              ) : null}
            </section>
          );
        }) : (
          <p className={styles.empty} role="status">No matching components.</p>
        )}
      </div>
    </aside>
  );
}

export const PUCK_PRODUCTION_EDITOR_OVERRIDES = {
  headerActions: PuckPilotHeaderActions,
  fields: PuckProductionProperties,
} as const;
