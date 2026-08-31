"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import AdminI18nProvider from "@/components/i18n/AdminI18nProvider";
import MediaLibraryPicker from "@/components/admin/MediaLibraryPicker";
import SiteEditorMediaField from "@/components/admin/SiteEditorMediaField";
import { supabase } from "@/lib/supabase";

type Workspace = { business_id: string; is_default: boolean };

let currentBusinessPromise: Promise<string> | undefined;

function currentBusinessId(): Promise<string> {
  if (!currentBusinessPromise) {
    currentBusinessPromise = (async () => {
      const { data, error } = await supabase.rpc("list_my_businesses");
      const workspaces = (data ?? []) as Workspace[];
      const workspace = workspaces.find((item) => item.is_default) ?? workspaces[0];
      if (error || !workspace) throw new Error(error?.message || "No active workspace was found.");
      return workspace.business_id;
    })().catch((error: unknown) => {
      currentBusinessPromise = undefined;
      throw error;
    });
  }
  return currentBusinessPromise;
}

function isSupportedImageSource(value: string) {
  if (!value) return true;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function compactSourceLabel(value: string) {
  if (!value) return "No image selected";
  try {
    const currentOrigin = typeof window === "undefined" ? "http://localhost" : window.location.origin;
    const currentHostname = typeof window === "undefined" ? "localhost" : window.location.hostname;
    const url = new URL(value, currentOrigin);
    const path = `${url.hostname === currentHostname ? "" : url.hostname}${url.pathname}`;
    return path.length > 52 ? `…${path.slice(-51)}` : path;
  } catch {
    return value.length > 52 ? `…${value.slice(-51)}` : value;
  }
}

export type PuckMediaPickerFieldProps = {
  id: string;
  name: string;
  value?: string;
  onChange(value: string): void;
  readOnly?: boolean;
  label: string;
  defaultValue?: string;
  allowEmpty?: boolean;
  preview?: boolean;
};

export default function PuckMediaPickerField({
  value = "",
  onChange,
  readOnly,
  label,
  defaultValue,
  allowEmpty = false,
  preview = true,
}: PuckMediaPickerFieldProps) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [businessId, setBusinessId] = useState("");
  const [libraryState, setLibraryState] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");
  const [libraryError, setLibraryError] = useState("");
  const [brokenSource, setBrokenSource] = useState("");
  const [dimensions, setDimensions] = useState({ source: "", label: "" });
  const supported = isSupportedImageSource(value);

  const chooseFromLibrary = async () => {
    setLibraryState("loading");
    setLibraryError("");
    try {
      const nextBusinessId = businessId || await currentBusinessId();
      setBusinessId(nextBusinessId);
      setLibraryState("ready");
      setLibraryOpen(true);
    } catch (error) {
      setLibraryState("unavailable");
      setLibraryError(error instanceof Error ? error.message : "Media library is unavailable.");
    }
  };

  const update = (nextValue: string) => {
    if (!nextValue && !allowEmpty) return;
    setBrokenSource("");
    setDimensions({ source: "", label: "" });
    onChange(nextValue);
  };

  const invalidReason = !supported
    ? "Use an HTTPS URL or /local/path"
    : brokenSource === value
      ? "Image unavailable"
      : undefined;

  return <AdminI18nProvider initialLocale="en">
    <div data-puck-media-picker-field data-media-library-state={libraryState}>
      <SiteEditorMediaField
        label={label}
        value={value}
        originalValue={defaultValue}
        disabled={readOnly}
        onChange={update}
        onChoose={() => { void chooseFromLibrary(); }}
        previewInvalidReason={preview ? invalidReason : undefined}
        onPreviewLoad={(width, height) => setDimensions({ source: value, label: `${width} × ${height}` })}
        onPreviewError={() => setBrokenSource(value)}
      />
      <div className="mt-2 flex min-w-0 items-center justify-between gap-3 px-1 text-[10px] text-[#716d65]">
        <span className="truncate" title={value}>{compactSourceLabel(value)}</span>
        {dimensions.source === value ? <span className="shrink-0" data-media-dimensions>{dimensions.label}</span> : null}
      </div>
      {libraryState === "loading" ? <p className="mt-2 px-1 text-[10px] text-[#716d65]">Opening media library…</p> : null}
      {libraryState === "unavailable" ? <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-[10px] leading-4 text-amber-800">Media library unavailable: {libraryError} URL/path editing remains available.</p> : null}
    </div>
    {businessId ? createPortal(<MediaLibraryPicker
      open={libraryOpen}
      businessId={businessId}
      title={`Choose ${label.toLowerCase()}`}
      onSelect={(url) => {
        onChange(url);
        setLibraryOpen(false);
      }}
      onClose={() => setLibraryOpen(false)}
    />, document.body) : null}
  </AdminI18nProvider>;
}
