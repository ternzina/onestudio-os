"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";

const FORM_SCRIPT = "https://apichannels.com/form/applicationInit.js";
const TRACK_SCRIPT = "https://apichannels.com/form/track.js";

type ShortFormValues = { requested_amount: string; email: string; last4ssn: string };
type ProviderFormApi = { setValues: (values: ShortFormValues) => void };

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

function CashPathShortForm({ onContinue, preview }: { onContinue: (values: ShortFormValues) => void; preview: boolean }) {
  const [values, setValues] = useState<ShortFormValues>({ requested_amount: "2000", email: "", last4ssn: "" });
  const [error, setError] = useState("");
  const update = (key: keyof ShortFormValues, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (preview) return;
    if (!/^\S+@\S+\.\S+$/.test(values.email) || !/^\d{4}$/.test(values.last4ssn)) {
      setError("Enter a valid email address and the last 4 digits of your SSN to continue.");
      return;
    }
    onContinue(values);
  };
  return <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit} noValidate>
    <p className="sm:col-span-2 -mb-1 text-sm font-medium text-black/60">$200 to $5,000 for any reason</p>
    <label className="grid gap-2 text-sm font-semibold text-[#24302d]">Loan amount<select aria-label="Loan amount" value={values.requested_amount} onChange={(event) => update("requested_amount", event.target.value)} disabled={preview} className="rounded-xl border border-black/15 bg-white px-4 py-3 text-base font-normal outline-none ring-[#187c6a] focus:ring-2 disabled:cursor-not-allowed disabled:bg-black/5"><option value="500">$200 - $500</option><option value="1000">$500 - $1,000</option><option value="2000">$1,000 - $2,500</option><option value="2500">$2,500 - $5,000</option></select></label>
    <label className="grid gap-2 text-sm font-semibold text-[#24302d]">Email address<input aria-label="Email address" type="email" placeholder="you@example.com" value={values.email} onChange={(event) => update("email", event.target.value)} disabled={preview} className="rounded-xl border border-black/15 bg-white px-4 py-3 text-base font-normal outline-none ring-[#187c6a] focus:ring-2 disabled:cursor-not-allowed disabled:bg-black/5" /></label>
    <label className="grid gap-2 text-sm font-semibold text-[#24302d]">Last 4 digits of SSN<input aria-label="Last 4 digits of SSN" inputMode="numeric" autoComplete="off" maxLength={4} placeholder="0000" value={values.last4ssn} onChange={(event) => update("last4ssn", event.target.value.replace(/\D/g, "").slice(0, 4))} disabled={preview} className="rounded-xl border border-black/15 bg-white px-4 py-3 text-base font-normal outline-none ring-[#187c6a] focus:ring-2 disabled:cursor-not-allowed disabled:bg-black/5" /></label>
    <div className="flex items-end"><button type="submit" disabled={preview} className="w-full rounded-xl bg-[#187c6a] px-5 py-3 text-base font-bold text-white transition hover:bg-[#126657] disabled:cursor-not-allowed disabled:opacity-70">Get Started</button></div>
    {error ? <p role="alert" className="sm:col-span-2 text-sm text-[#9f2d25]">{error}</p> : null}
    <p className="sm:col-span-2 text-sm leading-6 text-black/60">Your request continues through our secure participating-provider form. CashPath is not a lender.</p>
  </form>;
}

/** Loads the official provider widget only in a public page, never editor preview. */
export default function LeadsGateForm({ aid, template = "wallet-lines", preview = false, compact = false }: { aid: string; template?: "wallet-lines"; preview?: boolean; compact?: boolean }) {
  const reactId = useId().replace(/[^a-z0-9_-]/gi, "");
  const targetId = `lg-form-${reactId}`;
  const initialized = useRef(false);
  const [showLongForm, setShowLongForm] = useState(!compact);
  const prefill = useRef<ShortFormValues | null>(null);

  const isPreview = preview || (typeof window !== "undefined" && (window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/site-preview") || window.location.pathname.startsWith("/demos/")));
  useEffect(() => {
    if (isPreview || !showLongForm || initialized.current || !/^\d{1,12}$/.test(aid)) return;
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
    loadScript(FORM_SCRIPT, "onestudio-leadsgate-form").then(() => {
      const values = prefill.current;
      if (!values) return;
      const deadline = Date.now() + 8000;
      const passValues = () => {
        const api = (window as Window & { _lgAPIFormV3_?: ProviderFormApi })._lgAPIFormV3_;
        if (api) {
          api.setValues(values);
          prefill.current = null;
        } else if (!cancelled && Date.now() < deadline) {
          window.setTimeout(passValues, 50);
        }
      };
      passValues();
    }).catch(() => {
      if (!cancelled) target.textContent = "The request form is temporarily unavailable. Please try again later.";
    });
    void loadScript(TRACK_SCRIPT, "onestudio-leadsgate-track").catch(() => {});
    return () => { cancelled = true; if (target.id === "_lg_form_") target.id = targetId; };
  }, [aid, isPreview, showLongForm, targetId, template]);

  if (isPreview && compact) return <div className="rounded-2xl border border-dashed border-current/25 bg-white/60 p-6"><CashPathShortForm preview onContinue={() => {}} /><p className="mt-4 text-sm">LeadsGate form preview — live requests are disabled in the editor.</p></div>;
  if (isPreview) return <div className="rounded-2xl border border-dashed border-current/25 bg-white/60 p-6 text-sm">LeadsGate form preview — live requests are disabled in the editor.</div>;
  if (compact && !showLongForm) return <CashPathShortForm onContinue={(values) => { prefill.current = values; setShowLongForm(true); }} preview={false} />;
  return <div id={targetId} aria-live="polite" />;
}
