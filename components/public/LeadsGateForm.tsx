"use client";

import { useEffect, useId, useRef } from "react";

const FORM_SCRIPT = "https://apichannels.com/form/applicationInit.js";
const TRACK_SCRIPT = "https://apichannels.com/form/track.js";

function loadScript(source: string, id: string) {
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing) return Promise.resolve(existing);
  return new Promise<HTMLScriptElement>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = id;
    script.src = source;
    script.async = true;
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Could not load ${source}`));
    document.head.appendChild(script);
  });
}

/** Loads the official provider widget only in a public page, never editor preview. */
export default function LeadsGateForm({ aid, template = "wallet-lines", preview = false }: { aid: string; template?: "wallet-lines"; preview?: boolean }) {
  const reactId = useId().replace(/[^a-z0-9_-]/gi, "");
  const targetId = `lg-form-${reactId}`;
  const initialized = useRef(false);

  const isPreview = preview || (typeof window !== "undefined" && (window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/site-preview") || window.location.pathname.startsWith("/demos/")));
  useEffect(() => {
    if (isPreview || initialized.current || !/^\d{1,12}$/.test(aid)) return;
    initialized.current = true;
    let cancelled = false;
    const target = document.getElementById(targetId);
    if (!target) return;
    // The provider's documented API uses this global configuration and fixed target id.
    // Keep it scoped to a single mounted public form to prevent duplicate remount injection.
    target.id = "_lg_form_";
    const providerWindow = window as Window & {
      _lg_form_init_?: unknown;
      _lg_track_init_?: unknown;
    };
    providerWindow._lg_form_init_ = { aid, template };
    providerWindow._lg_track_init_ = { aid: Number(aid) };

    // The application renderer is required. Tracking is independent and must
    // never replace a usable provider form when analytics is unavailable.
    loadScript(FORM_SCRIPT, "onestudio-leadsgate-form").catch(() => {
      if (!cancelled) target.textContent = "The request form is temporarily unavailable. Please try again later.";
    });
    void loadScript(TRACK_SCRIPT, "onestudio-leadsgate-track").catch(() => {});
    return () => { cancelled = true; if (target.id === "_lg_form_") target.id = targetId; };
  }, [aid, isPreview, targetId, template]);

  if (isPreview) return <div className="rounded-2xl border border-dashed border-current/25 bg-white/60 p-6 text-sm">LeadsGate form preview — live requests are disabled in the editor.</div>;
  return <div id={targetId} aria-live="polite" />;
}
