"use client";

import {
  FieldLabel,
  createUsePuck,
  type ComponentConfig,
  type ComponentData,
  type PuckAction,
} from "@puckeditor/core";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  BUILDER_STYLE_PRESETS,
  applyStylePreset,
  copyCompatibleStyle,
  createBlockDefaultSnapshot,
  pasteCompatibleStyle,
  type BuilderStylePreset,
  type StyleTransferContract,
  type StyleTransferSnapshot,
} from "@/components/editor-lab/puck/builder-ux-contract";
import styles from "./puck-lab-v3.module.css";
import {
  SettingsSearchContext,
  useSettingsSearch,
} from "@/components/editor-lab/puck/settings-search-context";

const usePuck = createUsePuck();
const USER_PRESET_KEY = "onestudio:puck-v3:user-style-preset:v1";
type ItemSelector = { index: number; zone?: string };

type SaveStatus = "saved" | "unsaved" | "saving" | "error";

type BuilderUxContextValue = {
  styleContract: StyleTransferContract;
  clipboard: StyleTransferSnapshot | null;
  setClipboard: (value: StyleTransferSnapshot | null) => void;
  userPreset: StyleTransferSnapshot | null;
  setUserPreset: (value: StyleTransferSnapshot | null) => void;
  saveStatus: SaveStatus;
  save: () => void;
  publishMessage: string;
};

const BuilderUxContext = createContext<BuilderUxContextValue>({
  styleContract: new Map(),
  clipboard: null,
  setClipboard: () => undefined,
  userPreset: null,
  setUserPreset: () => undefined,
  saveStatus: "saved",
  save: () => undefined,
  publishMessage: "",
});

export function BuilderUxProvider({
  children,
  styleContract,
  saveStatus,
  save,
  publishMessage,
}: {
  children: ReactNode;
  styleContract: StyleTransferContract;
  saveStatus: SaveStatus;
  save: () => void;
  publishMessage: string;
}) {
  const [clipboard, setClipboard] = useState<StyleTransferSnapshot | null>(null);
  const [userPreset, setUserPresetState] = useState<StyleTransferSnapshot | null>(null);
  useEffect(() => {
    try {
      const value = window.localStorage.getItem(USER_PRESET_KEY);
      setUserPresetState(value ? JSON.parse(value) as StyleTransferSnapshot : null);
    } catch {
      setUserPresetState(null);
    }
  }, []);
  const setUserPreset = useCallback((value: StyleTransferSnapshot | null) => {
    setUserPresetState(value);
    try {
      if (value) window.localStorage.setItem(USER_PRESET_KEY, JSON.stringify(value));
      else window.localStorage.removeItem(USER_PRESET_KEY);
    } catch {
      // A blocked localStorage preset must never block editing the page.
    }
  }, []);
  const value = useMemo(() => ({
    styleContract,
    clipboard,
    setClipboard,
    userPreset,
    setUserPreset,
    saveStatus,
    save,
    publishMessage,
  }), [clipboard, publishMessage, save, saveStatus, setUserPreset, styleContract, userPreset]);
  return <BuilderUxContext.Provider value={value}>{children}</BuilderUxContext.Provider>;
}

function replaceSelected(
  dispatch: (action: PuckAction) => void,
  selector: Required<ItemSelector>,
  data: ComponentData,
) {
  dispatch({
    type: "replace",
    destinationIndex: selector.index,
    destinationZone: selector.zone,
    data,
    recordHistory: true,
  });
}

type FieldDescriptor = { label: string; group?: string; ancestors: string[] };

function describeFields(fields: Record<string, unknown> | undefined) {
  const descriptors: FieldDescriptor[] = [];
  let group: string | undefined;

  const walk = (definitions: Record<string, unknown>, ancestors: string[] = [], inheritedGroup?: string) => {
    for (const [name, value] of Object.entries(definitions)) {
      if (!value || typeof value !== "object") continue;
      const field = value as Record<string, unknown>;
      const label = typeof field.label === "string" ? field.label : name;
      if (name.startsWith("__puckGroup_")) group = label;
      const activeGroup = inheritedGroup ?? group;
      descriptors.push({ label, group: activeGroup, ancestors });
      const nested = (field.arrayFields ?? field.objectFields) as Record<string, unknown> | undefined;
      if (nested) walk(nested, [...ancestors, label], activeGroup);
    }
  };

  if (fields) walk(fields);
  return descriptors;
}

const normalize = (value: string) => value.trim().toLocaleLowerCase();

export function BuilderFields({
  children,
  isLoading,
  itemSelector,
}: {
  children: ReactNode;
  isLoading: boolean;
  itemSelector?: ItemSelector | null;
}) {
  const {
    styleContract,
    clipboard,
    setClipboard,
    userPreset,
    setUserPreset,
  } = useContext(BuilderUxContext);
  const selected = usePuck((state) => state.selectedItem);
  const config = usePuck((state) => state.config);
  const dispatch = usePuck((state) => state.dispatch);
  const getSelectorForId = usePuck((state) => state.getSelectorForId);
  const [query, setQuery] = useState("");
  const component = selected
    ? config.components[selected.type] as ComponentConfig | undefined
    : undefined;
  const selector = selected?.props.id
    ? getSelectorForId(String(selected.props.id))
    : itemSelector?.zone
      ? itemSelector as Required<ItemSelector>
      : undefined;
  const supported = selected ? styleContract.get(selected.type) ?? new Set() : new Set();
  const clipboardCompatibility = clipboard
    ? Object.keys(clipboard.values).filter((key) => supported.has(key)).length
    : 0;
  const descriptors = useMemo(
    () => describeFields(component?.fields as Record<string, unknown> | undefined),
    [component],
  );
  const normalizedQuery = normalize(query);
  const allowedLabels = useMemo(() => {
    if (!normalizedQuery) return null;
    const labels = new Set<string>();
    for (const descriptor of descriptors) {
      const match = normalize(descriptor.label).includes(normalizedQuery) ||
        normalize(descriptor.group ?? "").includes(normalizedQuery);
      if (!match) continue;
      labels.add(normalize(descriptor.label));
      descriptor.ancestors.forEach((label) => labels.add(normalize(label)));
      if (descriptor.group) labels.add(normalize(descriptor.group));
    }
    return labels;
  }, [descriptors, normalizedQuery]);

  const update = (data: ComponentData) => {
    if (selector) replaceSelected(dispatch, selector, data);
  };
  const copy = () => {
    if (selected && component) {
      setClipboard(copyCompatibleStyle(selected, component, styleContract));
    }
  };
  const savePreset = () => {
    if (selected && component) {
      setUserPreset(copyCompatibleStyle(selected, component, styleContract));
    }
  };
  const applyBuiltIn = (preset: BuilderStylePreset) => {
    if (selected && component) {
      update(applyStylePreset(selected, component, styleContract, preset));
    }
  };

  return <SettingsSearchContext.Provider value={{ query: normalizedQuery, allowedLabels }}>
    <div className={styles.propertiesTools} aria-label="Block settings tools">
      <div className={styles.propertiesSearch}>
        <input
          type="search"
          value={query}
          aria-label="Search settings"
          placeholder="Search settings"
          onChange={(event) => setQuery(event.target.value)}
        />
        {query ? <button type="button" aria-label="Clear settings search" onClick={() => setQuery("")}>×</button> : null}
      </div>
      {selected && component && selector ? <>
        <div className={styles.builderActionGrid}>
          <button type="button" onClick={() => update(createBlockDefaultSnapshot(component, selected))}>Reset block</button>
          <button type="button" disabled={!supported.size} onClick={copy}>Copy style</button>
          <button type="button" disabled={!clipboardCompatibility} onClick={() => clipboard && update(pasteCompatibleStyle(selected, clipboard, styleContract))}>Paste style</button>
          <button type="button" disabled={!supported.size} onClick={savePreset}>Save style preset</button>
        </div>
        <div className={styles.presetRow} aria-label="Style presets">
          {BUILDER_STYLE_PRESETS.map((preset) => <button key={preset} type="button" disabled={!supported.size} onClick={() => applyBuiltIn(preset)}>{preset}</button>)}
          {userPreset ? <button type="button" disabled={!Object.keys(userPreset.values).some((key) => supported.has(key))} onClick={() => update(pasteCompatibleStyle(selected, userPreset, styleContract))}>Saved style</button> : null}
        </div>
      </> : null}
      {normalizedQuery && allowedLabels?.size === 0 ? <p className={styles.settingsEmpty} role="status">No matching settings.</p> : null}
    </div>
    <div aria-busy={isLoading}>{children}</div>
  </SettingsSearchContext.Provider>;
}

export function BuilderFieldLabel({
  children,
  icon,
  label,
  el,
  readOnly,
  className,
}: {
  children?: ReactNode;
  icon?: ReactNode;
  label: string;
  el?: "label" | "div";
  readOnly?: boolean;
  className?: string;
}) {
  const { query, allowedLabels } = useSettingsSearch();
  if (query && !allowedLabels?.has(normalize(label))) {
    return <span hidden data-builder-setting-filtered={label} />;
  }
  return <FieldLabel icon={icon} label={label} el={el} readOnly={readOnly} className={className}>{children}</FieldLabel>;
}

export function useBuilderSave() {
  return useContext(BuilderUxContext);
}
