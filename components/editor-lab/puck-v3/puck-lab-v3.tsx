"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import "@puckeditor/core/puck.css";
import { Puck, createUsePuck, type Config, type Data } from "@puckeditor/core";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ComponentType, type RefObject } from "react";
import { pocBlockByCatalogKey, pocBlocks, pocCategories, pocComponents } from "./poc-registry";
import { layoutComponents } from "@/components/editor-lab/puck/layout-primitives";
import { guardEditorPreviewNavigation, RuntimeHost } from "@/components/editor-lab/puck/block-contract";
import styles from "./puck-lab-v3.module.css";
import { MarketingPreview } from "./marketing-puck-component";
import { coreQaBlocks, coreQaCategories, coreQaComponents, coreQaBlockByCatalogKey } from "./core-qa-registry";

const usePuck = createUsePuck();
const PuckThemeContext = createContext(false);
const PuckPreviewContext = createContext<{
  activeKey: string | null;
  setActiveKey: (key: string | null) => void;
}>({ activeKey: null, setActiveKey: () => undefined });
const agencySlugs = ["navigation-13", "hero-16", "showcase-4", "features-1", "how-it-works-4", "about-1", "social-proof-6", "social-proof-3", "contact-2", "footer-3"] as const;
const agencyBlocks = agencySlugs.map((slug) => pocBlockByCatalogKey.get(`pro-block:${slug}`)).filter(Boolean);
const libraryGroupOrder = ["React Bits Control 3", "React Bits Control 6", "React Bits Fast Batch 1", "React Bits Fast Batch 2", "React Bits Fast Batch 3", "React Bits Fast Batch 4", "React Bits Fast Batch 5", "React Bits Fast Batch 6", "React Bits Fast Batch 7", "React Bits Fast Batch 8", "React Bits Fast Batch 9", "Official React Bits", "Marketing Blocks", "Experimental / Current-free"];
const collapsedByDefault = new Set(["React Bits Fast Batch 1", "React Bits Fast Batch 2", "React Bits Fast Batch 3", "React Bits Fast Batch 4", "React Bits Fast Batch 5", "React Bits Fast Batch 6", "React Bits Fast Batch 7", "React Bits Fast Batch 8", "React Bits Fast Batch 9", "Official React Bits", "Marketing Blocks", "Experimental / Current-free"]);

function PuckCanvasRoot({ children }: { children: React.ReactNode }) {
  const isDark = useContext(PuckThemeContext);
  return <main className={`${styles.editableRoot} ${isDark ? `${styles.editableRootDark} dark` : ""}`}>{children}</main>;
}

function libraryClass(block: any) {
  if (block.catalogKey.startsWith("core-qa:")) return "Core QA Fixtures";
  if (block.catalogKey.startsWith("control-3:")) return "React Bits Control 3";
  if (block.catalogKey.startsWith("control-6:")) return "React Bits Control 6";
  if (block.catalogKey.startsWith("component:") || block.catalogKey.startsWith("starter:") || block.catalogKey.startsWith("pro-block:")) {
    if (block.tags.includes("React Bits Fast Batch 1")) return "React Bits Fast Batch 1";
    if (block.tags.includes("React Bits Fast Batch 2")) return "React Bits Fast Batch 2";
    if (block.tags.includes("React Bits Fast Batch 3")) return "React Bits Fast Batch 3";
    if (block.tags.includes("React Bits Fast Batch 4")) return "React Bits Fast Batch 4";
    if (block.tags.includes("React Bits Fast Batch 5")) return "React Bits Fast Batch 5";
    if (block.tags.includes("React Bits Fast Batch 6")) return "React Bits Fast Batch 6";
    if (block.tags.includes("React Bits Fast Batch 7")) return "React Bits Fast Batch 7";
    if (block.tags.includes("React Bits Fast Batch 8")) return "React Bits Fast Batch 8";
    if (block.tags.includes("React Bits Fast Batch 9")) return "React Bits Fast Batch 9";
  }
  if (block.catalogKey.startsWith("pro-block:")) return "Marketing Blocks";
  if (block.catalogKey.startsWith("current-free:")) return "Experimental / Current-free";
  return "Official React Bits";
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
  const visibleBlocks = normalizedQuery ? blocks.filter((block) => [block.displayName, block.catalogKey, block.catalogKey.split(":").pop(), block.category, ...(block.tags || [])].some((value) => String(value).toLocaleLowerCase().includes(normalizedQuery))) : blocks;
  const hasNoResults = Boolean(normalizedQuery) && visibleBlocks.length === 0;
  const libraryGroups = [...(coreQa ? ["Core QA Fixtures"] : libraryGroupOrder)]
    .map((title) => ({ title, blocks: visibleBlocks.filter((block) => libraryClass(block) === title) }))
    .filter((group) => group.blocks.length);
  const toggleGroup = (title: string) => setCollapsedGroups((previous) => {
    const next = new Set(previous);
    if (next.has(title)) next.delete(title); else next.add(title);
    return next;
  });
  return <aside ref={libraryRef} className={styles.library} aria-label="Puck V3 Library" onPointerEnter={cancelClose} onPointerLeave={scheduleClose}><header className={styles.header}><p className={styles.eyebrow}>PUCK LAB V3 · LOCAL POC</p><h1>React Bits-style Live Library Preview</h1><p className={styles.subtitle}>Hover a block to preview it</p><div className={styles.librarySearch}><input aria-label="Search React Bits components" placeholder="Search components…" value={query} onChange={(event) => setQuery(event.target.value)} />{query ? <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>×</button> : null}</div><div className={styles.devControl}><button type="button" onClick={() => content.length ? setConfirmReplace(true) : generate()}>Generate Agency Demo</button></div><span className={styles.indicator} data-live={Boolean(active)}>● Live previews: {active ? 1 : 0}</span></header><div className={styles.body}>{hasNoResults ? <p className={styles.emptySearch} role="status">No matching blocks.</p> : libraryGroups.map((group) => { const collapsed = !normalizedQuery && collapsedGroups.has(group.title); const contentId = `puck-library-${group.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`; return <section className={styles.libraryGroup} aria-label={group.title} key={group.title}><h2><button className={styles.groupToggle} type="button" aria-expanded={!collapsed} aria-controls={contentId} onClick={() => toggleGroup(group.title)}><span>{group.title}</span><span className={styles.groupToggleMeta}><small>{group.blocks.length}</small><span className={styles.groupChevron} aria-hidden="true">{collapsed ? "▸" : "▾"}</span></span></button></h2>{!collapsed ? <div className={styles.libraryGrid} id={contentId}>{group.blocks.map((block) => { const index = blocks.indexOf(block); return <article key={block.catalogKey} className={styles.card} onMouseEnter={() => show(block.catalogKey)}><button className={styles.cardMain} type="button" aria-label={`Add ${block.displayName} from card`} onFocus={() => show(block.catalogKey)} onClick={() => add(block)}><span className={styles.cardNumber}>{String(index + 1).padStart(2, "0")}</span><strong>{block.displayName}</strong></button><button className={styles.addButton} type="button" aria-label={`Add ${block.displayName}`} onFocus={() => show(block.catalogKey)} onClick={() => add(block)}>+</button></article>; })}</div> : null}</section>; })}</div>{confirmReplace ? <div ref={confirmDialogRef} role="dialog" aria-modal="true"><p>Replace current page with Agency Demo?</p><button type="button" onClick={() => setConfirmReplace(false)}>Cancel</button><button type="button" onClick={generate}>Generate</button></div> : null}{active ? <LivePreview key={active.catalogKey} block={active} isDark={isDark} previewRef={previewRef} onPointerStay={cancelClose} onPointerLeave={scheduleClose} /> : null}</aside>;
}

function V3HeaderActions({ children }: { children: React.ReactNode }) {
  const dispatch = usePuck((state) => state.dispatch);
  const previewMode = usePuck((state) => state.appState.ui.previewMode);
  const interactive = previewMode === "interactive";

  return <div className={styles.headerActions}>
    <button
      type="button"
      className={styles.interactionToggle}
      aria-pressed={interactive}
      onClick={() => dispatch({ type: "setUi", ui: { previewMode: interactive ? "edit" : "interactive" } })}
    >
      {interactive ? "Edit layout" : "Interact with page"}
    </button>
    {children}
  </div>;
}

export default function PuckLabV3({ coreQa = false }: { coreQa?: boolean }) {
  const blocks = coreQa ? coreQaBlocks : pocBlocks;
  const blockByCatalogKey = coreQa ? coreQaBlockByCatalogKey : pocBlockByCatalogKey;
  const [live, setLive] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activePreviewKey, setActivePreviewKey] = useState<string | null>(null);
  const initialData = useMemo<Data>(() => ({ root: { props: {} }, content: [] }), []);
  const config = useMemo<Config>(() => ({
    // The Puck canvas is an iframe, so it cannot inherit the shell's `.dark`
    // ancestor. PuckCanvasRoot reads the shared workspace state without
    // recreating the editor config or unmounting Library previews.
    root: { render: PuckCanvasRoot },
    categories: { ...(coreQa ? coreQaCategories : pocCategories), layout: { title: "Layout", components: ["Grid", "Flex"] } },
    components: { ...(coreQa ? coreQaComponents : pocComponents), ...layoutComponents },
  }), [coreQa]);
  const plugins = useMemo(() => [{ name: "v3-library", label: "Library", render: () => <Library onLiveChange={setLive} blocks={blocks} blockByCatalogKey={blockByCatalogKey} coreQa={coreQa} />, mobilePanelHeight: "min-content" as const }], [blocks, blockByCatalogKey, coreQa]);
  const overrides = useMemo(() => ({ headerActions: V3HeaderActions }), []);
  return <div className={`${styles.shell} ${isDark ? styles.dark : ""}`} data-core-qa={coreQa ? "true" : undefined} data-live-previews={live ? 1 : 0} data-theme={isDark ? "dark" : "light"}><button type="button" data-puck-theme-toggle className={styles.globalThemeToggle} aria-label={isDark ? "Use light workspace theme" : "Use dark workspace theme"} aria-pressed={isDark} onPointerEnter={() => window.dispatchEvent(new Event("puck-theme-preview-hold"))} onClick={() => setIsDark((value) => !value)}>{isDark ? "☀" : "☾"}</button><PuckThemeContext.Provider value={isDark}><PuckPreviewContext.Provider value={{ activeKey: activePreviewKey, setActiveKey: setActivePreviewKey }}><Puck config={config} data={initialData} ui={{ leftSideBarVisible: true, rightSideBarVisible: true, previewMode: "edit", plugin: { current: "v3-library" } }} overrides={overrides} plugins={plugins} headerTitle={coreQa ? "Puck V3 Core QA" : "Puck Lab V3"}><Puck.Layout /></Puck></PuckPreviewContext.Provider></PuckThemeContext.Provider></div>;
}
