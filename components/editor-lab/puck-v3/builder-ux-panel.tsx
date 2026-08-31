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
import { viewportDevice } from "@/components/editor-lab/puck/responsive-layout-contract";
import {
  SettingsGroupContext,
  normalizeSettingLabel,
  useSettingsGroup,
} from "@/components/editor-lab/puck/settings-group-context";

const usePuck = createUsePuck();
const USER_PRESET_KEY = "onestudio:puck-v3:user-style-preset:v1";
const USER_PRESETS_KEY = "onestudio:puck-v3:user-style-presets:v2";
type ItemSelector = { index: number; zone?: string };

type UserStylePreset = {
  id: string;
  name: string;
  snapshot: StyleTransferSnapshot;
};

type SaveStatus = "saved" | "unsaved" | "saving" | "error";

type BuilderUxContextValue = {
  styleContract: StyleTransferContract;
  clipboard: StyleTransferSnapshot | null;
  setClipboard: (value: StyleTransferSnapshot | null) => void;
  userPresets: UserStylePreset[];
  createUserPreset: (name: string, value: StyleTransferSnapshot) => void;
  deleteUserPreset: (id: string) => void;
  saveStatus: SaveStatus;
  save: () => void;
  publishMessage: string;
};

const BuilderUxContext = createContext<BuilderUxContextValue>({
  styleContract: new Map(),
  clipboard: null,
  setClipboard: () => undefined,
  userPresets: [],
  createUserPreset: () => undefined,
  deleteUserPreset: () => undefined,
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
  const [userPresets, setUserPresets] = useState<UserStylePreset[]>([]);
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(USER_PRESETS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserStylePreset[];
        setUserPresets(Array.isArray(parsed) ? parsed : []);
        return;
      }
      const legacy = window.localStorage.getItem(USER_PRESET_KEY);
      if (legacy) {
        setUserPresets([{ id: crypto.randomUUID(), name: "Saved style", snapshot: JSON.parse(legacy) as StyleTransferSnapshot }]);
      }
    } catch {
      setUserPresets([]);
    }
  }, []);

  const persistUserPresets = useCallback((value: UserStylePreset[]) => {
    setUserPresets(value);
    try {
      window.localStorage.setItem(USER_PRESETS_KEY, JSON.stringify(value));
      window.localStorage.removeItem(USER_PRESET_KEY);
    } catch {
      // A blocked localStorage preset must never block editing the page.
    }
  }, []);
  const createUserPreset = useCallback((requestedName: string, snapshot: StyleTransferSnapshot) => {
    const baseName = requestedName.trim() || "Untitled style";
    const names = new Set(userPresets.map((preset) => preset.name.toLocaleLowerCase()));
    let name = baseName;
    let suffix = 2;
    while (names.has(name.toLocaleLowerCase())) name = `${baseName} (${suffix++})`;
    persistUserPresets([...userPresets, { id: crypto.randomUUID(), name, snapshot }]);
  }, [persistUserPresets, userPresets]);
  const deleteUserPreset = useCallback((id: string) => {
    persistUserPresets(userPresets.filter((preset) => preset.id !== id));
  }, [persistUserPresets, userPresets]);
  const value = useMemo(() => ({
    styleContract,
    clipboard,
    setClipboard,
    userPresets,
    createUserPreset,
    deleteUserPreset,
    saveStatus,
    save,
    publishMessage,
  }), [clipboard, createUserPreset, deleteUserPreset, publishMessage, save, saveStatus, styleContract, userPresets]);
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

function styleMatches(
  current: ComponentData,
  expected: ComponentData,
  supported: ReadonlySet<string>,
) {
  return [...supported].every((key) =>
    JSON.stringify(current.props[key]) === JSON.stringify(expected.props[key]));
}

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
    userPresets,
    createUserPreset,
    deleteUserPreset,
  } = useContext(BuilderUxContext);
  const selected = usePuck((state) => state.selectedItem);
  const config = usePuck((state) => state.config);
  const dispatch = usePuck((state) => state.dispatch);
  const getSelectorForId = usePuck((state) => state.getSelectorForId);
  const viewportWidth = usePuck((state) => state.appState.ui.viewports.current.width);
  const [query, setQuery] = useState("");
  const [presetName, setPresetName] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set());
  const component = selected
    ? config.components[selected.type] as ComponentConfig | undefined
    : undefined;
  const selector = selected?.props.id
    ? getSelectorForId(String(selected.props.id))
    : itemSelector?.zone
      ? itemSelector as Required<ItemSelector>
      : undefined;
  const supported = selected
    ? styleContract.get(selected.type) ?? new Set<string>()
    : new Set<string>();
  const clipboardCompatibility = clipboard
    ? Object.keys(clipboard.values).filter((key) => supported.has(key)).length
    : 0;
  const descriptors = useMemo(
    () => describeFields(component?.fields as Record<string, unknown> | undefined),
    [component],
  );
  const groupByLabel = useMemo(() => new Map(descriptors
    .filter((descriptor) => descriptor.group && descriptor.group !== descriptor.label)
    .map((descriptor) => [normalizeSettingLabel(descriptor.label), descriptor.group!])), [descriptors]);
  const normalizedQuery = normalize(query);
  const currentPreset = useMemo(() => {
    if (!selected || !component || !supported.size) return "Not available";
    const builtIn = BUILDER_STYLE_PRESETS.find((preset) =>
      styleMatches(selected, applyStylePreset(selected, component, styleContract, preset), supported));
    if (builtIn) return builtIn;
    const user = userPresets.find((preset) =>
      styleMatches(selected, pasteCompatibleStyle(selected, preset.snapshot, styleContract), supported));
    return user?.name ?? "Custom";
  }, [component, selected, styleContract, supported, userPresets]);
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

  useEffect(() => setCollapsedGroups(new Set()), [selected?.props.id]);
  const toggleGroup = useCallback((label: string) => {
    const key = normalizeSettingLabel(label);
    setCollapsedGroups((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

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
      createUserPreset(presetName, copyCompatibleStyle(selected, component, styleContract));
      setPresetName("");
    }
  };
  const applyBuiltIn = (preset: BuilderStylePreset) => {
    if (selected && component) {
      update(applyStylePreset(selected, component, styleContract, preset));
    }
  };

  return <SettingsGroupContext.Provider value={{ collapsedGroups, groupByLabel, query: normalizedQuery, toggleGroup }}>
    <SettingsSearchContext.Provider value={{ query: normalizedQuery, allowedLabels }}>
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
        <div className={styles.viewportContext} data-responsive-device={viewportDevice(viewportWidth)}>
          Editing viewport: <strong>{viewportDevice(viewportWidth)}</strong>
        </div>
        <div className={styles.builderActionGrid}>
          <button type="button" onClick={() => update(createBlockDefaultSnapshot(component, selected))}>Reset block</button>
          <button type="button" disabled={!supported.size} onClick={copy}>Copy style</button>
          <button type="button" disabled={!clipboardCompatibility} onClick={() => clipboard && update(pasteCompatibleStyle(selected, clipboard, styleContract))}>Paste style</button>
        </div>
        <div className={styles.presetCreator}>
          <input aria-label="Style preset name" placeholder="Preset name" value={presetName} onChange={(event) => setPresetName(event.target.value)} />
          <button type="button" disabled={!supported.size} onClick={savePreset}>Save preset</button>
        </div>
        <p className={styles.currentPreset} role="status">Current preset: <strong>{currentPreset}</strong></p>
        <div className={styles.presetRow} aria-label="Style presets">
          {BUILDER_STYLE_PRESETS.map((preset) => <button key={preset} type="button" disabled={!supported.size} onClick={() => applyBuiltIn(preset)}>{preset}</button>)}
        </div>
        {userPresets.length ? <ul className={styles.userPresetList} aria-label="Saved style presets">
          {userPresets.map((preset) => <li key={preset.id}>
            <button type="button" disabled={!Object.keys(preset.snapshot.values).some((key) => supported.has(key))} onClick={() => update(pasteCompatibleStyle(selected, preset.snapshot, styleContract))}>{preset.name}</button>
            <button type="button" aria-label={`Delete style preset ${preset.name}`} onClick={() => deleteUserPreset(preset.id)}>Delete</button>
          </li>)}
        </ul> : null}
      </> : null}
      {normalizedQuery && allowedLabels?.size === 0 ? <p className={styles.settingsEmpty} role="status">No matching settings.</p> : null}
    </div>
    <div aria-busy={isLoading}>{children}</div>
    </SettingsSearchContext.Provider>
  </SettingsGroupContext.Provider>;
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
  const settingsGroup = useSettingsGroup();
  if (query && !allowedLabels?.has(normalize(label))) {
    return <span hidden data-builder-setting-filtered={label} />;
  }
  const group = settingsGroup.groupByLabel.get(normalizeSettingLabel(label));
  if (!settingsGroup.query && group && settingsGroup.collapsedGroups.has(normalizeSettingLabel(group))) {
    return <span hidden data-builder-setting-collapsed={label} />;
  }
  return <FieldLabel icon={icon} label={label} el={el} readOnly={readOnly} className={className}>{children}</FieldLabel>;
}

export function useBuilderSave() {
  return useContext(BuilderUxContext);
}
