"use client";

import { createUsePuck } from "@puckeditor/core";
import { Children, isValidElement, useMemo, useState, type ChangeEvent, type DragEvent, type ReactElement, type ReactNode } from "react";
import type { ComponentEditorContract, ProductionEditorArrayItemField, ProductionEditorField, ProductionEditorFieldGroup, ProductionEditorPrimitive, ProductionEditorValue } from "@/lib/puck-site-editor/builder-contract";
import { PUCK_PRODUCTION_REGISTRY_BY_ID } from "./production-registry";
import {
  filterProductionEditorContract,
  PRODUCTION_PROPERTIES_GROUP_LABELS,
  PRODUCTION_PROPERTIES_GROUP_ORDER,
  productionFieldsByGroup,
  productionNativeFieldGroup,
  productionPropertiesContract,
  productionPropertiesContractForManualPanel,
  resetProductionEditorBlock,
  resetProductionEditorField,
  resetProductionEditorGroup,
  updateProductionEditorArrayItem,
  addProductionEditorArrayItem,
  removeProductionEditorArrayItem,
  reorderProductionEditorArrayItem,
  updateProductionEditorField,
} from "@/lib/puck-site-editor/builder-properties";
import styles from "./production-properties-panel.module.css";
import { useProductionEditorLocale } from "./production-editor-ux";
import { translateAdminText } from "@/lib/i18n/admin";
import { resolvePuckProductionFieldValue } from "@/lib/puck-site-editor/production-props";
import { ProductionPuckNumberInput } from "./production-puck-scalar-field";

const usePuck = createUsePuck();
type ProductionPropsUpdate = (next: Record<string, ProductionEditorValue> | ((current: Readonly<Record<string, ProductionEditorValue>>) => Record<string, ProductionEditorValue>)) => void;

type ProductionPropertiesPanelProps = {
  children: ReactNode;
  isLoading: boolean;
  itemSelector?: { index: number; zone?: string } | null;
};

function valueAt(props: Readonly<Record<string, ProductionEditorValue>>, path: readonly string[]) {
  let value: ProductionEditorValue | undefined = props;
  for (const segment of path) {
    if (!value || Array.isArray(value) || typeof value !== "object") return undefined;
    value = (value as Readonly<Record<string, ProductionEditorValue>>)[segment];
  }
  return value;
}

function ProductionFieldInput({
  field,
  id,
  value,
  onChange,
}: {
  field: ProductionEditorField | ProductionEditorArrayItemField;
  id: string;
  value: ProductionEditorPrimitive;
  onChange: (value: ProductionEditorPrimitive) => void;
}) {
  const handleText = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value);
  if (field.type === "textarea") return <textarea id={id} aria-label={field.label} value={typeof value === "string" ? value : ""} onChange={handleText} rows={4} />;
  if (field.type === "boolean") return <input id={id} aria-label={field.label} checked={value === true} onChange={(event) => onChange(event.target.checked)} type="checkbox" />;
  if (field.type === "number") return <ProductionPuckNumberInput id={id} label={field.label} value={value} min={field.min} max={field.max} step={field.step} onChange={onChange} />;
  if (field.type === "select") {
    const currentValue = typeof value === "string" ? value : "";
    const hasKnownValue = field.options?.some((option) => option.value === currentValue);
    return (
      <select id={id} aria-label={field.label} value={currentValue} onChange={(event) => onChange(event.target.value)}>
        {currentValue && !hasKnownValue ? <option value={currentValue}>Legacy: {currentValue}</option> : null}
        {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    );
  }
  if (field.type === "text") return <input id={id} aria-label={field.label} value={typeof value === "string" ? value : ""} onChange={handleText} type="text" />;
  return <input id={id} aria-label={field.label} value={typeof value === "string" ? value : ""} onChange={handleText} type={field.type === "url" || field.type === "media" ? "url" : "text"} />;
}

function ContractField({
  field,
  props,
  contract,
  update,
}: {
  field: ProductionEditorField;
  props: Readonly<Record<string, ProductionEditorValue>>;
  contract: ComponentEditorContract;
  update: ProductionPropsUpdate;
}) {
  const locale = useProductionEditorLocale();
  const value = resolvePuckProductionFieldValue(props, contract.defaultProps, field.path) as ProductionEditorPrimitive;
  return (
    <div className={styles.field} data-production-field={field.key} data-field-type={field.type}>
      {field.type !== "number" ? <label htmlFor={`production-${field.key}`}>{translateAdminText(locale, field.label)}</label> : null}
      {field.type === "media" && typeof value === "string" ? <img className={styles.mediaPreview} src={value} alt="" /> : null}
      <ProductionFieldInput id={`production-${field.key}`} field={field} value={value} onChange={(next) => update(updateProductionEditorField(props, contract, field.key, next))} />
      {field.resettable ? <button type="button" onClick={() => update(resetProductionEditorField(props, contract, field.key))}>Вернуть оригинал</button> : null}
    </div>
  );
}

function ContractArrays({
  contract,
  props,
  group,
  update,
}: {
  contract: ComponentEditorContract;
  props: Readonly<Record<string, ProductionEditorValue>>;
  group: ProductionEditorFieldGroup;
  update: ProductionPropsUpdate;
}) {
  const locale = useProductionEditorLocale();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  return contract.arrays.filter((array) => array.itemFields.some((field) => field.group === group)).map((array) => {
    const items = valueAt(props, array.path);
    if (!Array.isArray(items)) return null;
    const itemFields = array.itemFields.filter((field) => field.group === group);
    const clearDrag = () => { setDraggedIndex(null); setDropIndex(null); };
    const handleDragStart = (event: DragEvent<HTMLButtonElement>, index: number) => {
      setDraggedIndex(index);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(index));
    };
    const handleDragOver = (event: DragEvent<HTMLDivElement>, index: number) => {
      if (draggedIndex === null || draggedIndex === index) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      const rect = event.currentTarget.getBoundingClientRect();
      setDropIndex(index + (event.clientY > rect.top + rect.height / 2 ? 1 : 0));
    };
    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const fromIndex = draggedIndex;
      const insertionIndex = dropIndex;
      clearDrag();
      if (fromIndex === null || insertionIndex === null) return;
      const toIndex = insertionIndex > fromIndex ? insertionIndex - 1 : insertionIndex;
      if (toIndex !== fromIndex) update((current) => reorderProductionEditorArrayItem(current, contract, array.key, fromIndex, toIndex));
    };
    return <fieldset className={styles.array} key={array.key}><legend>{translateAdminText(locale, array.label)}</legend>{items.map((item, index) => (
      <div className={`${styles.arrayItem}${draggedIndex === index ? ` ${styles.dragging}` : ""}${dropIndex === index || dropIndex === index + 1 ? ` ${styles.dropTarget}` : ""}`} key={`${array.key}-${index}`} data-production-array-item={array.key} onDragOver={(event) => handleDragOver(event, index)} onDrop={handleDrop}>
        <div className={styles.arrayItemHeader}><button className={styles.dragHandle} type="button" draggable={items.length > 1} aria-label="Переместить элемент" title="Переместить элемент" onDragStart={(event) => handleDragStart(event, index)} onDragEnd={clearDrag}>⠿</button><strong>{array.itemLabel} {index + 1}</strong></div>
        {itemFields.map((field) => <div className={styles.field} data-production-array-field={`${array.key}.${field.key}`} data-field-type={field.type} key={field.key}>
          {field.type !== "number" ? <label htmlFor={`production-${array.key}-${index}-${field.key}`}>{translateAdminText(locale, field.label)}</label> : null}
          {field.type === "media" && item && typeof item === "object" && !Array.isArray(item) && typeof item[field.key] === "string" ? <img className={styles.mediaPreview} src={item[field.key]} alt="" /> : null}
          <ProductionFieldInput id={`production-${array.key}-${index}-${field.key}`} field={field} value={item && typeof item === "object" && !Array.isArray(item) ? (item[field.key] as ProductionEditorPrimitive) : null} onChange={(next) => update(updateProductionEditorArrayItem(props, contract, array.key, index, field.key, next))} />
        </div>)}
        <div className={styles.groupActions}>
          <button type="button" onClick={() => update(removeProductionEditorArrayItem(props, contract, array.key, index))}>Удалить</button>
          {index > 0 ? <button type="button" onClick={() => update((current) => reorderProductionEditorArrayItem(current, contract, array.key, index, index - 1))}>Выше</button> : null}
          {index < items.length - 1 ? <button type="button" onClick={() => update((current) => reorderProductionEditorArrayItem(current, contract, array.key, index, index + 1))}>Ниже</button> : null}
        </div>
      </div>
    ))}<button type="button" onClick={() => update(addProductionEditorArrayItem(props, contract, array.key))}>Добавить {array.itemLabel}</button></fieldset>;
  });
}

function ContractProperties({ contract, resetContract, props, update }: { contract: ComponentEditorContract; resetContract: ComponentEditorContract; props: Readonly<Record<string, ProductionEditorValue>>; update: ProductionPropsUpdate }) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<ProductionEditorFieldGroup>>(() => new Set(["LAYOUT", "MOTION", "RESPONSIVE"]));
  const filtered = useMemo(() => filterProductionEditorContract(contract, query), [contract, query]);
  const groups = productionFieldsByGroup(filtered).filter(({ fields, arrays }) => fields.length + arrays.length > 0);

  return <section className={styles.panel} data-production-properties>
    <header><h2>Свойства блока</h2><input aria-label="Поиск настроек" placeholder="Поиск настроек…" type="search" value={query} onChange={(event) => setQuery(event.target.value)} /><button type="button" onClick={() => update(resetProductionEditorBlock(props, resetContract))}>Вернуть блок к оригиналу</button></header>
    {groups.map(({ group, label, fields, arrays }) => {
      const isCollapsed = !query && collapsed.has(group);
      return <section className={styles.group} key={group} data-production-group={group}>
        <button type="button" className={styles.groupToggle} aria-expanded={!isCollapsed} onClick={() => setCollapsed((previous) => { const next = new Set(previous); if (next.has(group)) next.delete(group); else next.add(group); return next; })}>{label}<span>{isCollapsed ? "▸" : "▾"}</span></button>
        {!isCollapsed ? <div className={styles.groupContent}>
          <div className={styles.groupActions}><button type="button" onClick={() => update(resetProductionEditorGroup(props, resetContract, group))}>Сбросить группу</button></div>
          {fields.map((field) => <ContractField key={field.key} field={field} props={props} contract={contract} update={update} />)}
          <ContractArrays contract={contract} props={props} group={group} update={update} />
        </div> : null}
      </section>;
    })}
  </section>;
}

type PuckFieldChild = ReactElement<{ fieldName?: string }>;

/**
 * Puck 0.23 passes each native field as a FieldsChild with its fieldName.
 * Grouping those children here keeps Puck's field controls and lifecycle
 * intact while restoring the canonical OneStudio semantic groups around them.
 */
export function NativePuckFieldsBySemanticGroup({
  children,
  contract,
}: {
  children: ReactNode;
  contract: ComponentEditorContract;
}) {
  const nativeFields = new Set(contract.nativePuck?.fields ?? []);
  const grouped = new Map<(typeof PRODUCTION_PROPERTIES_GROUP_ORDER)[number], ReactNode[]>();
  const additional: ReactNode[] = [];

  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) {
      additional.push(child);
      continue;
    }
    const fieldName = (child as PuckFieldChild).props.fieldName;
    const group = fieldName && (nativeFields.has(fieldName) || contract.nativePuck?.arrays?.includes(fieldName))
      ? productionNativeFieldGroup(contract, fieldName)
      : undefined;
    if (!group) {
      additional.push(child);
      continue;
    }
    const items = grouped.get(group) ?? [];
    items.push(child);
    grouped.set(group, items);
  }

  return <>
    {PRODUCTION_PROPERTIES_GROUP_ORDER.map((group) => {
      const items = grouped.get(group);
      if (!items?.length) return null;
      return <section className={styles.nativeGroup} data-production-native-group={group} key={group}>
        <h3>{PRODUCTION_PROPERTIES_GROUP_LABELS[group]}</h3>
        <div className={styles.nativeGroupContent}>{items}</div>
      </section>;
    })}
    {additional.length ? <section className={styles.genericFallback} data-production-generic-controls>
      <h2>Дополнительные настройки</h2>
      {additional}
    </section> : null}
  </>;
}

export function PuckProductionProperties({ children, itemSelector }: ProductionPropertiesPanelProps) {
  const content = usePuck((state) => state.appState.data.content);
  const dispatch = usePuck((state) => state.dispatch);
  const selected = itemSelector?.zone === "root:default-zone" ? content[itemSelector.index] : null;
  const entry = selected ? PUCK_PRODUCTION_REGISTRY_BY_ID.get(selected.type) : undefined;
  const contract = entry
    ? productionPropertiesContract(entry.id, entry.editorContract, entry.defaults, entry.backgroundCapability, entry.textColorCapability)
    : undefined;
  const panelContract = contract ? productionPropertiesContractForManualPanel(contract) : undefined;
  if (!selected || !entry || !contract || !panelContract) return <>{children}</>;
  const props = selected.props as Record<string, ProductionEditorValue>;
  const update: ProductionPropsUpdate = (nextProps) => {
    dispatch({ type: "setData", recordHistory: true, data: (previous) => ({
      content: previous.content.map((component) => {
        if (component.type !== selected.type) return component;
        if (previous.content[itemSelector!.index] !== component) return component;
        const resolvedProps = typeof nextProps === "function" ? nextProps(component.props as Record<string, ProductionEditorValue>) : nextProps;
        return { ...component, props: resolvedProps };
      }),
    }) });
  };
  return <>
    <ContractProperties contract={panelContract} resetContract={contract} props={props} update={update} />
    <NativePuckFieldsBySemanticGroup contract={contract}>{children}</NativePuckFieldsBySemanticGroup>
  </>;
}
