"use client";

import { createUsePuck } from "@puckeditor/core";
import type { ChangeEvent, ReactElement } from "react";
import { SettingSearchBoundary } from "./settings-search-context";

const usePuck = createUsePuck();
const INHERIT_VALUE = "__inherit";

export type ResponsiveDevice = "desktop" | "tablet" | "mobile";
export type ResponsiveLayoutValue = string | {
  desktop: string;
  tablet?: string;
  mobile?: string;
};

export type ResponsiveSelectField = {
  type: "custom";
  label: string;
  responsiveOptions: Array<{ label: string; value: string }>;
  render: ({ id, value, onChange, readOnly }: {
    id: string;
    value: ResponsiveLayoutValue | undefined;
    onChange: (value: ResponsiveLayoutValue) => void;
    readOnly?: boolean;
  }) => ReactElement;
};

export function viewportDevice(width: number | "100%"): ResponsiveDevice {
  if (width === "100%" || width >= 1024) return "desktop";
  if (width >= 600) return "tablet";
  return "mobile";
}

export function normalizeResponsiveValue(
  value: ResponsiveLayoutValue | undefined,
  fallback = "source",
) {
  if (typeof value === "string") return { desktop: value };
  return value ? { ...value } : { desktop: fallback };
}

export function resolveResponsiveValue(
  value: ResponsiveLayoutValue | undefined,
  device: ResponsiveDevice,
  fallback = "source",
) {
  const normalized = normalizeResponsiveValue(value, fallback);
  if (device === "desktop") return normalized.desktop;
  if (device === "tablet") return normalized.tablet ?? normalized.desktop;
  return normalized.mobile ?? normalized.tablet ?? normalized.desktop;
}

function ResponsiveSelectControl({
  id,
  value,
  onChange,
  readOnly,
  label,
  options,
}: {
  id: string;
  value: ResponsiveLayoutValue | undefined;
  onChange: (value: ResponsiveLayoutValue) => void;
  readOnly?: boolean;
  label: string;
  options: Array<{ label: string; value: string }>;
}) {
  const width = usePuck((state) => state.appState.ui.viewports.current.width);
  const device = viewportDevice(width);
  const normalized = normalizeResponsiveValue(value);
  const explicit = normalized[device];
  const inherited = device === "mobile"
    ? normalized.tablet ?? normalized.desktop
    : normalized.desktop;
  const selectedValue = device === "desktop" ? normalized.desktop : explicit ?? INHERIT_VALUE;
  const deviceLabel = device[0].toUpperCase() + device.slice(1);

  const change = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = { ...normalized };
    if (device !== "desktop" && event.target.value === INHERIT_VALUE) delete next[device];
    else next[device] = event.target.value;
    onChange(next);
  };

  return <div style={{ display: "grid", gap: 6 }}>
    <label htmlFor={id}>{label}</label>
    <small data-responsive-device={device}>
      Editing {deviceLabel}{device !== "desktop" && explicit === undefined ? ` · inherits ${inherited}` : " · override"}
    </small>
    <select id={id} value={selectedValue} disabled={readOnly} onChange={change}>
      {device !== "desktop" ? <option value={INHERIT_VALUE}>Inherit ({inherited})</option> : null}
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
    {device !== "desktop" && explicit !== undefined ? <button type="button" disabled={readOnly} onClick={() => {
      const next = { ...normalized };
      delete next[device];
      onChange(next);
    }}>Reset {device} to inherited</button> : null}
  </div>;
}

export function responsiveSelectField(
  label: string,
  options: Array<{ label: string; value: string }>,
): ResponsiveSelectField {
  return {
    type: "custom",
    label,
    responsiveOptions: options,
    render: (props) => <SettingSearchBoundary label={label}><ResponsiveSelectControl {...props} label={label} options={options} /></SettingSearchBoundary>,
  };
}
