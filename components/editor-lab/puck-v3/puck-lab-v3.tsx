"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import "@puckeditor/core/puck.css";
import { Puck, createUsePuck, type Config, type Data, type Viewports } from "@puckeditor/core";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ComponentType, type RefObject } from "react";
import { pocBlockByCatalogKey, pocBlocks, pocCategories, pocComponents } from "./poc-registry";
import { layoutComponents } from "@/components/editor-lab/puck/layout-primitives";
import { guardEditorPreviewNavigation, RuntimeHost } from "@/components/editor-lab/puck/block-contract";
import styles from "./puck-lab-v3.module.css";
import { MarketingPreview } from "./marketing-puck-component";
import { coreQaBlocks, coreQaCategories, coreQaComponents, coreQaBlockByCatalogKey } from "./core-qa-registry";
import { buildStyleTransferContract } from "@/components/editor-lab/puck/builder-ux-contract";
import {
  BuilderFieldLabel,
  BuilderFields,
  BuilderUxProvider,
  useBuilderSave,
} from "./builder-ux-panel";
import {
  matchesProductLibrarySearch,
  PRODUCT_LIBRARY_CATEGORY_ORDER,
  sortProductLibraryBlocks,
} from "@/lib/puck-site-editor/product-library";
import { useScaledIframeInteractionRetargeting } from "@/components/puck-site-editor/scaled-iframe-interactions";

const usePuck = createUsePuck();
const EMPTY_DATA: Data = { root: { props: {} }, content: [] };
const LAB_VIEWPORTS: Viewports = [
  { width: 1280, height: "auto", label: "Desktop", icon: "Monitor" },
  { width: 768, height: "auto", label: "Tablet", icon: "Tablet" },
  { width: 360, height: "auto", label: "Mobile", icon: "Smartphone" },
];
const PuckThemeContext = createContext(false);
const PuckPreviewContext = createContext<{
  activeKey: string | null;
  setActiveKey: (key: string | null) => void;
}>({ activeKey: null, setActiveKey: () => undefined });
const agencySlugs = ["navigation-13", "hero-16", "showcase-4", "features-1", "how-it-works-4", "about-1", "social-proof-6", "social-proof-3", "contact-2", "footer-3"] as const;
const agencyBlocks = agencySlugs.map((slug) => pocBlockByCatalogKey.get(`pro-block:${slug}`)).filter(Boolean);
const collapsedByDefault = new Set<string>(PRODUCT_LIBRARY_CATEGORY_ORDER);

function PuckCanvasRoot({ children }: { children: React.ReactNode }) {
  const isDark = useContext(PuckThemeContext);
  const rootRef = useRef<HTMLElement>(null);
  useScaledIframeInteractionRetargeting(rootRef);

  return <main ref={rootRef} className={`${styles.editableRoot} ${isDark ? `${styles.editableRootDark} dark` : ""}`}>{children}</main>;
}

function LivePreview({ block, isDark, previewRef, onPointerStay, onPointerLeave }: { block: any; isDark: boolean; previewRef: RefObject<HTMLElement | null>; onPointerStay: () => void; onPointerLeave: () => void }) {
  const Preview = block.component as ComponentType<Record<string, unknown>>;
  const isComponentPreview = block.sourceKind === "component";

  return <section
    className={`${styles.preview} ${isDark ? "dark" : ""}`}
    aria-label={`${block.displayName} live preview`}
    ref={previewRef}
    onPointerEnter={onPointerStay}
    onPointerMove={onPointerStay}
    onPointerLeave={onPointerLeave}
    onClickCapture={guardEditorPreviewNavigation}
    onAuxClickCapture={guardEditorPreviewNavigation}
  >
    <header className={styles.previewHead}><strong>{block.displayName}</strong></header>
    <div className={styles.previewStage}>
      <div className={styles.previewMount} data-preview-kind={isComponentPreview ? "component" : "marketing"}>
        {isComponentPreview
          ? <RuntimeHost family={block.runtimeFamily} definiteHeight={block.definiteHeight} host={block.host}><Preview {...(block.defaultProps as Record<string, unknown>)} /></RuntimeHost>
          : <MarketingPreview><Preview {...(block.defaultProps as Record<string, unknown>)} /></MarketingPreview>}
      </div>
    </div>
  </section>;
}

function Library({ onLiveChange, blocks, blockByCatalogKey, coreQa }: { onLiveChange: (live: boolean) => void; blocks: any[]; blockByCatalogKey: Map<string, any>; coreQa: boolean }) {
  const isDark = useContext(PuckThemeContext);
  const { activeKey, setActiveKey } = useContext(PuckPreviewContext);
  const dispatch = usePuck((state) => state.dispatch);
  const content = usePuck((state) => state.appState.data.content);
  const selection = usePuck((state) => state.appState.ui.itemSelector);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [query, setQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set(collapsedByDefault));
  const libraryRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  const confirmDialogRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);
  const close = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
    setActiveKey(null);
    onLiveChange(false);
  }, [onLiveChange]);
  useEffect(() => () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setQuery("");
      setConfirmReplace(false);
      close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);
  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      // Moving from Library to the shared workspace toggle is a theme
      // transition, not an intent to dismiss the live preview.
      if (document.activeElement?.matches("[data-puck-theme-toggle]")) return;
      close();
    }, 120);
  }, [cancelClose, close]);
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const insideLibrary = libraryRef.current?.contains(target);
      const insidePreview = previewRef.current?.contains(target);
      const insideDialog = confirmDialogRef.current?.contains(target);
      const isThemeToggle = document
        .querySelector("[data-puck-theme-toggle]")
        ?.contains(event.target as Node);
      if (!insideLibrary && !insidePreview && !insideDialog && !isThemeToggle) {
        setConfirmReplace(false);
        close();
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [close]);
  useEffect(() => {
    window.addEventListener("puck-theme-preview-hold", cancelClose);
    return () => window.removeEventListener("puck-theme-preview-hold", cancelClose);
  }, [cancelClose]);
  useEffect(() => {
    if (selection) close();
  }, [close, selection]);
  useEffect(() => {
    if (query) close();
  }, [close, query]);
  const show = (key: string) => {
    if (document.documentElement.dataset.reactbitsQa === "true") return;
    cancelClose();
    if (activeKey === key) return;
    if (openTimer.current) clearTimeout(openTimer.current);
    setActiveKey(null);
    onLiveChange(false);
    openTimer.current = setTimeout(() => {
      setActiveKey(key);
      onLiveChange(true);
      openTimer.current = null;
    }, 150);
  };
  const add = (block: any) => {
    close();
    const index = content.length;
    dispatch({ type: "insert", componentType: block.type, destinationIndex: index, destinationZone: "root:default-zone", id: crypto.randomUUID(), recordHistory: true });
    dispatch({ type: "setUi", ui: { itemSelector: { index, zone: "root:default-zone" } }, recordHistory: false });
  };
  const generate = () => {
    const generatedContent = agencyBlocks.map((block) => ({ type: block!.type, props: { id: crypto.randomUUID() } }));
    if (content.length) {
      // Puck's setData is the single replace operation, so an existing page is not
      // silently mixed with the generated composition and undo can restore it.
      dispatch({ type: "setData", data: { root: { props: {} }, content: generatedContent } });
    } else {
      agencyBlocks.forEach((block, index) => dispatch({ type: "insert", componentType: block!.type, destinationIndex: index, destinationZone: "root:default-zone", id: crypto.randomUUID() }));
    }
    setConfirmReplace(false);
    console.info("[Puck V3] generated Agency Puck content", agencySlugs);
  };
  const active = activeKey ? blockByCatalogKey.get(activeKey) : null;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleBlocks = normalizedQuery
    ? blocks.filter((block) => coreQa
      ? [block.displayName, block.catalogKey, block.category, ...(block.tags || [])]
        .some((value) => String(value).toLocaleLowerCase().includes(normalizedQuery))
      : matchesProductLibrarySearch(block.productLibrary, normalizedQuery))
    : blocks;
  const hasNoResults = Boolean(normalizedQuery) && visibleBlocks.length === 0;
  const libraryGroups = [...(coreQa ? ["Core QA Fixtures"] : PRODUCT_LIBRARY_CATEGORY_ORDER)]
    .map((title) => ({
      title,
      blocks: sortProductLibraryBlocks(visibleBlocks.filter((block) => coreQa
        ? block.catalogKey.startsWith("core-qa:")
        : block.productLibrary.category === title)),
    }))
    .filter((group) => group.blocks.length);
  const toggleGroup = (title: string) => setCollapsedGroups((previous) => {
    const next = new Set(previous);
    if (next.has(title)) next.delete(title); else next.add(title);
    return next;
  });
  return <aside ref={libraryRef} className={styles.library} aria-label="Puck V3 Library" onPointerEnter={cancelClose} onPointerLeave={scheduleClose}><header className={styles.header}><p className={styles.eyebrow}>PUCK LAB V3 · LOCAL POC</p><h1>Component Library</h1><p className={styles.subtitle}>Hover a block to preview it</p><div className={styles.librarySearch}><input aria-label="Search components" placeholder="Search components…" value={query} onChange={(event) => setQuery(event.target.value)} />{query ? <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>×</button> : null}</div><div className={styles.devControl}><button type="button" onClick={() => content.length ? setConfirmReplace(true) : generate()}>Generate Agency Demo</button></div><span className={styles.indicator} data-live={Boolean(active)}>● Live previews: {active ? 1 : 0}</span></header><div className={styles.body}>{hasNoResults ? <p className={styles.emptySearch} role="status">No matching blocks.</p> : libraryGroups.map((group) => { const collapsed = !normalizedQuery && collapsedGroups.has(group.title); const contentId = `puck-library-${group.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`; return <section className={styles.libraryGroup} aria-label={group.title} key={group.title}><h2><button className={styles.groupToggle} type="button" aria-expanded={!collapsed} aria-controls={contentId} onClick={() => toggleGroup(group.title)}><span>{group.title}</span><span className={styles.groupToggleMeta}><small>{group.blocks.length}</small><span className={styles.groupChevron} aria-hidden="true">{collapsed ? "▸" : "▾"}</span></span></button></h2>{!collapsed ? <div className={styles.libraryGrid} id={contentId}>{group.blocks.map((block) => { const index = blocks.indexOf(block); return <article key={block.catalogKey} className={styles.card} onMouseEnter={() => show(block.catalogKey)}><button className={styles.cardMain} type="button" aria-label={`Add ${block.displayName} from card`} onFocus={() => show(block.catalogKey)} onClick={() => add(block)}><span className={styles.cardNumber}>{String(index + 1).padStart(2, "0")}</span><strong>{block.displayName}</strong>{!coreQa ? <span className={styles.tierBadge} data-tier={block.productLibrary.sourceTier}>{block.productLibrary.sourceTier}</span> : null}</button><button className={styles.addButton} type="button" aria-label={`Add ${block.displayName}`} onFocus={() => show(block.catalogKey)} onClick={() => add(block)}>+</button></article>; })}</div> : null}</section>; })}</div>{confirmReplace ? <div ref={confirmDialogRef} role="dialog" aria-modal="true"><p>Replace current page with Agency Demo?</p><button type="button" onClick={() => setConfirmReplace(false)}>Cancel</button><button type="button" onClick={generate}>Generate</button></div> : null}{active ? <LivePreview key={active.catalogKey} block={active} isDark={isDark} previewRef={previewRef} onPointerStay={cancelClose} onPointerLeave={scheduleClose} /> : null}</aside>;
}

function V3HeaderActions({ children }: { children: React.ReactNode }) {
  const dispatch = usePuck((state) => state.dispatch);
  const previewMode = usePuck((state) => state.appState.ui.previewMode);
  const leftSideBarVisible = usePuck((state) => state.appState.ui.leftSideBarVisible);
  const rightSideBarVisible = usePuck((state) => state.appState.ui.rightSideBarVisible);
  const interactive = previewMode === "interactive";
  const editSidebarsRef = useRef({ leftSideBarVisible: true, rightSideBarVisible: true });
  const { saveStatus, save, publishMessage } = useBuilderSave();
  const saveLabel = saveStatus === "saving"
    ? "Saving…"
    : saveStatus === "error"
      ? "Save failed"
      : saveStatus === "unsaved"
        ? "Unsaved changes"
        : "Saved";

  return <div className={styles.headerActions}>
    <span className={styles.saveStatus} data-status={saveStatus} role="status">{saveLabel}</span>
    <button type="button" className={styles.saveButton} disabled={saveStatus === "saving"} onClick={save}>Save</button>
    <button
      type="button"
      className={styles.interactionToggle}
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
    {publishMessage ? <span className={styles.publishMessage} role="status">{publishMessage}</span> : null}
  </div>;
}

export default function PuckLabV3({ coreQa = false }: { coreQa?: boolean }) {
  const blocks = coreQa ? coreQaBlocks : pocBlocks;
  const blockByCatalogKey = coreQa ? coreQaBlockByCatalogKey : pocBlockByCatalogKey;
  const [live, setLive] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activePreviewKey, setActivePreviewKey] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Data | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving" | "error">("saved");
  const [publishMessage, setPublishMessage] = useState("");
  const currentDataRef = useRef<Data>(EMPTY_DATA);
  const savedDataRef = useRef(JSON.stringify(EMPTY_DATA));
  const storageKey = coreQa
    ? "onestudio:puck-v3:core-qa-data:v1"
    : "onestudio:puck-v3:lab-data:v1";

  useEffect(() => {
    let data = EMPTY_DATA;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Data>;
        if (parsed.root && typeof parsed.root === "object" && Array.isArray(parsed.content)) {
          data = parsed as Data;
        }
      }
    } catch {
      setSaveStatus("error");
    }
    currentDataRef.current = data;
    savedDataRef.current = JSON.stringify(data);
    setInitialData(data);
  }, [storageKey]);

  const save = useCallback(() => {
    setSaveStatus("saving");
    const serialized = JSON.stringify(currentDataRef.current);
    window.setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, serialized);
        savedDataRef.current = serialized;
        setSaveStatus(JSON.stringify(currentDataRef.current) === serialized ? "saved" : "unsaved");
      } catch {
        setSaveStatus("error");
      }
    }, 0);
  }, [storageKey]);

  const onChange = useCallback((data: Data) => {
    currentDataRef.current = data;
    setSaveStatus(JSON.stringify(data) === savedDataRef.current ? "saved" : "unsaved");
  }, []);

  const onPublish = useCallback((data: Data) => {
    currentDataRef.current = data;
    setPublishMessage("Publish deferred · editor-lab save only");
  }, []);
  const config = useMemo<Config>(() => ({
    // The Puck canvas is an iframe, so it cannot inherit the shell's `.dark`
    // ancestor. PuckCanvasRoot reads the shared workspace state without
    // recreating the editor config or unmounting Library previews.
    root: { render: PuckCanvasRoot },
    categories: { ...(coreQa ? coreQaCategories : pocCategories), layout: { title: "Layout", components: ["Grid", "Flex"] } },
    components: { ...(coreQa ? coreQaComponents : pocComponents), ...layoutComponents },
  }), [coreQa]);
  const styleContract = useMemo(
    () => buildStyleTransferContract(blocks, config),
    [blocks, config],
  );
  const plugins = useMemo(() => [{ name: "v3-library", label: "Library", render: () => <Library onLiveChange={setLive} blocks={blocks} blockByCatalogKey={blockByCatalogKey} coreQa={coreQa} />, mobilePanelHeight: "min-content" as const }], [blocks, blockByCatalogKey, coreQa]);
  const overrides = useMemo(() => ({
    headerActions: V3HeaderActions,
    fields: BuilderFields,
    fieldLabel: BuilderFieldLabel,
  }), []);

  if (!initialData) {
    return <div className={styles.loadingState} role="status">Loading saved editor-lab data…</div>;
  }

  return <div className={`${styles.shell} ${isDark ? styles.dark : ""}`} data-core-qa={coreQa ? "true" : undefined} data-live-previews={live ? 1 : 0} data-theme={isDark ? "dark" : "light"}><button type="button" data-puck-theme-toggle className={styles.globalThemeToggle} aria-label={isDark ? "Use light workspace theme" : "Use dark workspace theme"} aria-pressed={isDark} onPointerEnter={() => window.dispatchEvent(new Event("puck-theme-preview-hold"))} onClick={() => setIsDark((value) => !value)}>{isDark ? "☀" : "☾"}</button><BuilderUxProvider styleContract={styleContract} saveStatus={saveStatus} save={save} publishMessage={publishMessage}><PuckThemeContext.Provider value={isDark}><PuckPreviewContext.Provider value={{ activeKey: activePreviewKey, setActiveKey: setActivePreviewKey }}><Puck config={config} data={initialData} onChange={onChange} onPublish={onPublish} viewports={LAB_VIEWPORTS} ui={{ leftSideBarVisible: true, rightSideBarVisible: true, previewMode: "edit", plugin: { current: "v3-library" }, viewports: { current: { width: 1280, height: "auto" }, controlsVisible: true, options: LAB_VIEWPORTS } }} overrides={overrides} plugins={plugins} headerTitle={coreQa ? "Puck V3 Core QA" : "Puck Lab V3"}><Puck.Layout /></Puck></PuckPreviewContext.Provider></PuckThemeContext.Provider></BuilderUxProvider></div>;
}
