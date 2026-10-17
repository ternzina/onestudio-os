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

export default function LeadsGateForm({ aid }: { aid: string }) {
  const reactId = useId().replace(/[^a-z0-9_-]/gi, "");
  const targetId = `lg-form-${reactId}`;
  const initialized = useRef(false);
  const prefill = useRef<ShortFormValues | null>(null);
  const [showLongForm, setShowLongForm] = useState(false);
  const [values, setValues] = useState<ShortFormValues>({ requested_amount: "2000", email: "", last4ssn: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!showLongForm || initialized.current || !/^\d{1,12}$/.test(aid)) return;
    initialized.current = true;
    const target = document.getElementById(targetId);
    if (!target) return;
    target.id = "_lg_form_";
    const providerWindow = window as Window & { _lg_form_init_?: unknown; _lg_track_init_?: unknown };
    providerWindow._lg_form_init_ = { aid, template: "wallet-lines" };
    providerWindow._lg_track_init_ = { aid: Number(aid) };
    let cancelled = false;
    loadScript(FORM_SCRIPT, "exported-leadsgate-form").then(() => {
      const filled = prefill.current;
      if (!filled) return;
      const deadline = Date.now() + 8000;
      const passValues = () => {
        const api = (window as Window & { _lgAPIFormV3_?: ProviderFormApi })._lgAPIFormV3_;
        if (api) api.setValues(filled);
        else if (!cancelled && Date.now() < deadline) window.setTimeout(passValues, 50);
      };
      passValues();
    }).catch(() => {
      if (!cancelled) target.textContent = "The request form is temporarily unavailable. Please try again later.";
    });
    void loadScript(TRACK_SCRIPT, "exported-leadsgate-track").catch(() => {});
    return () => { cancelled = true; };
  }, [aid, showLongForm, targetId]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(values.email) || !/^\d{4}$/.test(values.last4ssn)) {
      setError("Enter a valid email address and the last 4 digits of your SSN to continue.");
      return;
    }
    prefill.current = values;
    setShowLongForm(true);
  };

  if (!showLongForm) {
    return <form className="short-form" onSubmit={submit} noValidate>
      <p>$200 to $5,000 for any reason</p>
      <label>Loan amount<select aria-label="Loan amount" value={values.requested_amount} onChange={(event) => setValues({ ...values, requested_amount: event.target.value })}><option value="500">$200 - $500</option><option value="1000">$500 - $1,000</option><option value="2000">$1,000 - $2,500</option><option value="2500">$2,500 - $5,000</option></select></label>
      <label>Email address<input aria-label="Email address" type="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} /></label>
      <label>Last 4 digits of SSN<input aria-label="Last 4 digits of SSN" inputMode="numeric" maxLength={4} value={values.last4ssn} onChange={(event) => setValues({ ...values, last4ssn: event.target.value.replace(/\D/g, "").slice(0, 4) })} /></label>
      <button type="submit">Get Started</button>
      {error ? <p role="alert">{error}</p> : null}
      <p>Your request continues through our secure participating-provider form. CashPath is not a lender.</p>
    </form>;
  }
  return <div id={targetId} aria-live="polite" />;
}
