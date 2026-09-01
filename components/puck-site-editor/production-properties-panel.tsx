"use client";

import { createUsePuck } from "@puckeditor/core";
import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import type { ComponentEditorContract, ProductionEditorArrayItemField, ProductionEditorField, ProductionEditorFieldGroup, ProductionEditorPrimitive, ProductionEditorValue } from "@/lib/puck-site-editor/builder-contract";
import { PUCK_PRODUCTION_REGISTRY_BY_ID } from "./production-registry";
import {
  filterProductionEditorContract,
  productionFieldsByGroup,
  resetProductionEditorBlock,
  resetProductionEditorField,
  resetProductionEditorGroup,
  updateProductionEditorArrayItem,
  updateProductionEditorField,
} from "@/lib/puck-site-editor/builder-properties";
import styles from "./production-properties-panel.module.css";

const usePuck = createUsePuck();

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
  value,
  onChange,
}: {
  field: ProductionEditorField | ProductionEditorArrayItemField;
  value: ProductionEditorPrimitive;
  onChange: (value: ProductionEditorPrimitive) => void;
}) {
  const handleText = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value);
  if (field.type === "textarea") return <textarea aria-label={field.label} value={typeof value === "string" ? value : ""} onChange={handleText} rows={4} />;
  if (field.type === "boolean") return <input aria-label={field.label} checked={value === true} onChange={(event) => onChange(event.target.checked)} type="checkbox" />;
  if (field.type === "number") return <input aria-label={field.label} value={typeof value === "number" ? value : ""} min={field.min} max={field.max} onChange={(event) => onChange(event.target.value === "" ? 0 : Number(event.target.value))} type="number" />;
  if (field.type === "select") return (
    <select aria-label={field.label} value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)}>
      {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  );
  if (field.type === "color") return <input aria-label={field.label} value={typeof value === "string" ? value : "#000000"} onChange={handleText} type="color" />;
  if (field.type === "text") return <input aria-label={field.label} value={typeof value === "string" ? value : ""} onChange={handleText} type="text" />;
  return <input aria-label={field.label} value={typeof value === "string" ? value : ""} onChange={handleText} type={field.type === "url" || field.type === "media" ? "url" : "text"} />;
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
  update: (next: Record<string, ProductionEditorValue>) => void;
}) {
  const value = valueAt(props, field.path) as ProductionEditorPrimitive;
  return (
    <div className={styles.field} data-production-field={field.key} data-field-type={field.type}>
      <label>{field.label}</label>
      {field.type === "media" && typeof value === "string" ? <img className={styles.mediaPreview} src={value} alt="" /> : null}
      <ProductionFieldInput field={field} value={value} onChange={(next) => update(updateProductionEditorField(props, contract, field.key, next))} />
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
  update: (next: Record<string, ProductionEditorValue>) => void;
}) {
  return contract.arrays.filter((array) => array.itemFields.some((field) => field.group === group)).map((array) => {
    const items = valueAt(props, array.path);
    if (!Array.isArray(items)) return null;
    const itemFields = array.itemFields.filter((field) => field.group === group);
    return <fieldset className={styles.array} key={array.key}><legend>{array.label}</legend>{items.map((item, index) => (
      <div className={styles.arrayItem} key={`${array.key}-${index}`} data-production-array-item={array.key}>
        <strong>{array.itemLabel} {index + 1}</strong>
        {itemFields.map((field) => <div className={styles.field} data-production-array-field={`${array.key}.${field.key}`} data-field-type={field.type} key={field.key}>
          <label>{field.label}</label>
          {field.type === "media" && item && typeof item === "object" && !Array.isArray(item) && typeof item[field.key] === "string" ? <img className={styles.mediaPreview} src={item[field.key]} alt="" /> : null}
          <ProductionFieldInput field={field} value={item && typeof item === "object" && !Array.isArray(item) ? (item[field.key] as ProductionEditorPrimitive) : null} onChange={(next) => update(updateProductionEditorArrayItem(props, contract, array.key, index, field.key, next))} />
        </div>)}
      </div>
    ))}</fieldset>;
  });
}

function ContractProperties({ contract, props, update }: { contract: ComponentEditorContract; props: Readonly<Record<string, ProductionEditorValue>>; update: (next: Record<string, ProductionEditorValue>) => void }) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<ProductionEditorFieldGroup>>(() => new Set(["LAYOUT", "STYLE", "MOTION", "RESPONSIVE"]));
  const filtered = useMemo(() => filterProductionEditorContract(contract, query), [contract, query]);
  const groups = productionFieldsByGroup(filtered).filter(({ fields, arrays }) => fields.length + arrays.length > 0);

  return <section className={styles.panel} data-production-properties>
    <header><h2>Свойства блока</h2><input aria-label="Поиск настроек" placeholder="Поиск настроек…" type="search" value={query} onChange={(event) => setQuery(event.target.value)} /><button type="button" onClick={() => update(resetProductionEditorBlock(props, contract))}>Вернуть блок к оригиналу</button></header>
    {groups.map(({ group, label, fields, arrays }) => {
      const isCollapsed = !query && collapsed.has(group);
      return <section className={styles.group} key={group} data-production-group={group}>
        <button type="button" className={styles.groupToggle} aria-expanded={!isCollapsed} onClick={() => setCollapsed((previous) => { const next = new Set(previous); if (next.has(group)) next.delete(group); else next.add(group); return next; })}>{label}<span>{isCollapsed ? "▸" : "▾"}</span></button>
        {!isCollapsed ? <div className={styles.groupContent}>
          <div className={styles.groupActions}><button type="button" onClick={() => update(resetProductionEditorGroup(props, contract, group))}>Сбросить группу</button></div>
          {fields.map((field) => <ContractField key={field.key} field={field} props={props} contract={contract} update={update} />)}
          <ContractArrays contract={contract} props={props} group={group} update={update} />
        </div> : null}
      </section>;
    })}
  </section>;
}

export function PuckProductionProperties({ children, itemSelector }: ProductionPropertiesPanelProps) {
  const content = usePuck((state) => state.appState.data.content);
  const dispatch = usePuck((state) => state.dispatch);
  const selected = itemSelector?.zone === "root:default-zone" ? content[itemSelector.index] : null;
  const entry = selected ? PUCK_PRODUCTION_REGISTRY_BY_ID.get(selected.type) : undefined;
  const contract = entry?.editorContract;
  if (!selected || !contract) return <>{children}</>;
  const props = selected.props as Record<string, ProductionEditorValue>;
  const update = (nextProps: Record<string, ProductionEditorValue>) => {
    dispatch({ type: "setData", recordHistory: true, data: (previous) => ({
      content: previous.content.map((component, index) => index === itemSelector!.index && component.type === selected.type ? { ...component, props: nextProps } : component),
    }) });
  };
  return <><ContractProperties contract={contract} props={props} update={update} /><section className={styles.genericFallback} data-production-generic-controls><h2>Дополнительные настройки</h2>{children}</section></>;
}
