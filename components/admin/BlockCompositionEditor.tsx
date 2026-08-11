"use client";

import { EditorToggle, editorCompactFieldClass } from "@/components/admin/EditorChrome";
import {
  normalizePublicSiteCompositionOrder,
  publicSiteBlockCompositionCapabilities,
  resolvePublicSiteBlockComposition,
} from "@/lib/public-site/block-composition";
import type { AdminMessage, AdminMessageValues } from "@/lib/i18n/admin";
import type {
  PublicSiteCompositionElement,
  PublicSiteCustomBlock,
} from "@/lib/public-site/types";

type Translate = (message: AdminMessage, values?: AdminMessageValues) => string;

type BlockCompositionEditorProps = {
  block: PublicSiteCustomBlock;
  disabled: boolean;
  t: Translate;
  onChange: <Key extends keyof PublicSiteCustomBlock>(
    key: Key,
    value: PublicSiteCustomBlock[Key],
  ) => void;
};

const elementLabels: Record<PublicSiteCompositionElement, AdminMessage> = {
  eyebrow: "Eyebrow",
  title: "Heading",
  text: "Text",
  media: "Block media",
  cards: "Cards",
  action: "Button",
};

function SelectField({
  label,
  value,
  disabled,
  options,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-xs font-semibold text-[#4f4b45]">
      {label}
      <select
        className={editorCompactFieldClass}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ElementOrderEditor({
  order,
  disabled,
  t,
  onChange,
  device,
}: {
  order: PublicSiteCompositionElement[];
  disabled: boolean;
  t: Translate;
  onChange: (order: PublicSiteCompositionElement[]) => void;
  device: "desktop" | "mobile";
}) {
  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= order.length) return;
    const next = [...order];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  };

  return (
    <div data-block-composition-order={device} className="grid gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">
        {t("Element order")}
      </p>
      {order.map((element, index) => (
        <div
          key={element}
          className="flex min-h-10 items-center justify-between gap-2 rounded-xl border border-black/8 bg-white px-3"
        >
          <span className="text-xs font-semibold text-[#4f4b45]">
            {t(elementLabels[element])}
          </span>
          <span className="flex gap-1">
            <button
              type="button"
              aria-label={`${t("Move up")} · ${t(elementLabels[element])}`}
              disabled={disabled || index === 0}
              onClick={() => move(index, -1)}
              className="grid h-7 w-7 place-items-center rounded-lg border border-black/10 text-xs disabled:opacity-25"
            >
              ↑
            </button>
            <button
              type="button"
              aria-label={`${t("Move down")} · ${t(elementLabels[element])}`}
              disabled={disabled || index === order.length - 1}
              onClick={() => move(index, 1)}
              className="grid h-7 w-7 place-items-center rounded-lg border border-black/10 text-xs disabled:opacity-25"
            >
              ↓
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}

export default function BlockCompositionEditor({
  block,
  disabled,
  t,
  onChange,
}: BlockCompositionEditorProps) {
  const capabilities = publicSiteBlockCompositionCapabilities(block.kind);
  const composition = resolvePublicSiteBlockComposition(block);
  const desktopOrder = normalizePublicSiteCompositionOrder(block.kind, block.composition_order);
  const mobileOrder = normalizePublicSiteCompositionOrder(
    block.kind,
    block.composition_mobile_order ?? desktopOrder,
  );
  const layoutOptions = capabilities.layouts.map((layout) => ({
    value: layout,
    label: t(layout === "stack" ? "Stack" : layout === "split" ? "Split" : "Grid"),
  }));
  const gapOptions = ["none", "compact", "normal", "airy"].map((value) => ({
    value,
    label: t(value === "none" ? "None" : value === "compact" ? "Tight" : value === "normal" ? "Comfortable" : "Wide gap"),
  }));
  const alignOptions = ["start", "center", "end", "stretch"].map((value) => ({
    value,
    label: t(value === "start" ? "Start" : value === "center" ? "Center" : value === "end" ? "End" : "Stretch"),
  }));
  const textAlignOptions = ["left", "center", "right"].map((value) => ({
    value,
    label: t(value === "left" ? "Left" : value === "center" ? "Center" : "Right"),
  }));

  return (
    <section data-block-composition-editor className="grid gap-3 rounded-2xl border border-[#9a742e]/20 bg-[#fbf7ee] p-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6f531f]">
          {t("Block composition")}
        </p>
        <p className="mt-1 text-[11px] leading-5 text-[#716d65]">
          {t("Arrange elements inside this block without changing other blocks.")}
        </p>
      </div>
      <EditorToggle
        label={t("Custom composition")}
        checked={composition.enabled}
        disabled={disabled}
        onChange={(enabled) => onChange("composition_enabled", enabled)}
      />

      {composition.enabled ? (
        <div className="grid gap-5 border-t border-[#9a742e]/15 pt-4">
          <div data-block-composition-device="desktop" className="grid gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9a742e]">
              {t("Desktop composition")}
            </p>
            <SelectField
              label={t("Layout")}
              value={composition.layout}
              disabled={disabled}
              options={layoutOptions}
              onChange={(value) => onChange("composition_layout", value as PublicSiteCustomBlock["composition_layout"])}
            />
            {(composition.layout === "grid" || capabilities.cards) ? (
              <SelectField
                label={t("Columns")}
                value={String(composition.columns)}
                disabled={disabled}
                options={[1, 2, 3, 4].map((value) => ({ value: String(value), label: String(value) }))}
                onChange={(value) => onChange("composition_columns", Number(value) as PublicSiteCustomBlock["composition_columns"])}
              />
            ) : null}
            {capabilities.splitRatio && composition.layout === "split" ? (
              <SelectField
                label={t("Column ratio")}
                value={composition.splitRatio}
                disabled={disabled}
                options={[
                  { value: "balanced", label: t("Equal columns") },
                  { value: "content_wide", label: t("Content wider") },
                  { value: "media_wide", label: t("Second column wider") },
                ]}
                onChange={(value) => onChange("composition_split_ratio", value as PublicSiteCustomBlock["composition_split_ratio"])}
              />
            ) : null}
            <SelectField label={t("Gap")} value={composition.gap} disabled={disabled} options={gapOptions} onChange={(value) => onChange("composition_gap", value as PublicSiteCustomBlock["composition_gap"])} />
            <SelectField label={t("Element alignment")} value={composition.align} disabled={disabled} options={alignOptions} onChange={(value) => onChange("composition_align", value as PublicSiteCustomBlock["composition_align"])} />
            <SelectField label={t("Text alignment")} value={composition.textAlign} disabled={disabled} options={textAlignOptions} onChange={(value) => onChange("composition_text_align", value as PublicSiteCustomBlock["composition_text_align"])} />
            {capabilities.cards ? (
              <SelectField
                label={t("Card layout")}
                value={composition.cardLayout}
                disabled={disabled}
                options={[{ value: "vertical", label: t("Vertical") }, { value: "horizontal", label: t("Horizontal") }]}
                onChange={(value) => onChange("composition_card_layout", value as PublicSiteCustomBlock["composition_card_layout"])}
              />
            ) : null}
            <ElementOrderEditor order={desktopOrder} disabled={disabled} t={t} device="desktop" onChange={(order) => onChange("composition_order", order)} />
          </div>

          <div data-block-composition-device="mobile" className="grid gap-3 border-t border-[#9a742e]/15 pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9a742e]">
              {t("Mobile composition")}
            </p>
            <SelectField
              label={t("Layout")}
              value={block.composition_mobile_layout ?? "auto"}
              disabled={disabled}
              options={[{ value: "auto", label: t("Automatic for phone") }, ...layoutOptions]}
              onChange={(value) => onChange("composition_mobile_layout", value === "auto" ? undefined : value as PublicSiteCustomBlock["composition_mobile_layout"])}
            />
            <SelectField
              label={t("Columns")}
              value={String(composition.mobileColumns)}
              disabled={disabled}
              options={[1, 2].map((value) => ({ value: String(value), label: String(value) }))}
              onChange={(value) => onChange("composition_mobile_columns", Number(value) as PublicSiteCustomBlock["composition_mobile_columns"])}
            />
            <SelectField label={t("Gap")} value={composition.mobileGap} disabled={disabled} options={gapOptions} onChange={(value) => onChange("composition_mobile_gap", value as PublicSiteCustomBlock["composition_mobile_gap"])} />
            <SelectField label={t("Element alignment")} value={composition.mobileAlign} disabled={disabled} options={alignOptions} onChange={(value) => onChange("composition_mobile_align", value as PublicSiteCustomBlock["composition_mobile_align"])} />
            <SelectField label={t("Text alignment")} value={composition.mobileTextAlign} disabled={disabled} options={textAlignOptions} onChange={(value) => onChange("composition_mobile_text_align", value as PublicSiteCustomBlock["composition_mobile_text_align"])} />
            {capabilities.cards ? (
              <SelectField
                label={t("Card layout")}
                value={composition.mobileCardLayout}
                disabled={disabled}
                options={[{ value: "vertical", label: t("Vertical") }, { value: "horizontal", label: t("Horizontal") }]}
                onChange={(value) => onChange("composition_mobile_card_layout", value as PublicSiteCustomBlock["composition_mobile_card_layout"])}
              />
            ) : null}
            <ElementOrderEditor order={mobileOrder} disabled={disabled} t={t} device="mobile" onChange={(order) => onChange("composition_mobile_order", order)} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
