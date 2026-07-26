"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { supabase } from "@/lib/supabase";
import { emptyCompanyProfile, type CompanyProfile } from "@/lib/company/types";

type Workspace = { business_id: string; name: string; role: string; is_default: boolean };
type EditableProfile = Omit<CompanyProfile, "business_id">;

export default function CompanyProfilePage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [profile, setProfile] = useState<EditableProfile>(emptyCompanyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canEdit = workspace ? ["owner", "admin", "manager"].includes(workspace.role) : false;

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: workspaces, error: workspaceError } = await supabase.rpc("list_my_businesses");
      if (!active) return;
      if (workspaceError) { setError(workspaceError.message); setLoading(false); return; }
      const rows = (workspaces ?? []) as Workspace[];
      const current = rows.find((row) => row.is_default) ?? rows[0] ?? null;
      if (!current) { setError("No active workspace."); setLoading(false); return; }
      setWorkspace(current);

      const { data, error: profileError } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("business_id", current.business_id)
        .maybeSingle();
      if (!active) return;
      if (profileError) setError(profileError.message);
      if (data) {
        const { business_id: _businessId, created_at: _createdAt, updated_at: _updatedAt, ...editable } = data as CompanyProfile & { created_at?: string; updated_at?: string };
        setProfile({ ...emptyCompanyProfile, ...editable });
      }
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!workspace || !canEdit) return;
    setSaving(true); setMessage(""); setError("");
    const normalized = {
      ...profile,
      country_code: profile.country_code.trim().toUpperCase(),
      default_currency: profile.default_currency.trim().toUpperCase(),
      email: profile.email.trim(),
      support_email: profile.support_email.trim(),
      website_url: profile.website_url.trim(),
      iban: profile.iban.replace(/\s+/g, "").toUpperCase(),
      swift_bic: profile.swift_bic.replace(/\s+/g, "").toUpperCase(),
    };
    const { error: saveError } = await supabase.from("company_profiles").upsert({ business_id: workspace.business_id, ...normalized });
    if (saveError) setError(saveError.message); else { setProfile(normalized); setMessage("Company Profile saved. Legal pages now use these values."); }
    setSaving(false);
  }

  function patch<K extends keyof EditableProfile>(key: K, value: EditableProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  return (
    <>
      <AdminHeader />
      <main className="min-h-screen px-5 pb-24 pt-36">
        <section className="mx-auto max-w-7xl">
          <div className="rounded-[36px] bg-[#17191f] p-8 text-white sm:p-10">
            <p className="text-xs uppercase tracking-[0.28em] text-[#d8b36a]">COMPANY PROFILE 1.0</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">One identity. Every module.</h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/65">The canonical company record for Legal, Payments, Email, invoices and public business details.</p>
          </div>

          {(message || error) && <div className={`mt-6 rounded-2xl border px-5 py-4 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{error || message}</div>}

          {loading ? <div className="mt-6 rounded-[30px] bg-white p-8">Loading company profile…</div> : (
            <form onSubmit={save} className="mt-6 grid gap-6">
              <Card eyebrow="Identity" title="Company and brand">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Display name" value={profile.display_name} onChange={(v)=>patch("display_name",v)} />
                  <Field label="Legal name" value={profile.legal_name} onChange={(v)=>patch("legal_name",v)} />
                  <Select label="Entity type" value={profile.entity_type} onChange={(v)=>patch("entity_type",v as EditableProfile["entity_type"])} options={[['sole_proprietor','Sole proprietor / ФОП'],['company','Company / ТОВ'],['individual','Individual'],['nonprofit','Nonprofit'],['other','Other']]} />
                  <Field label="Owner / representative" value={profile.owner_name} onChange={(v)=>patch("owner_name",v)} />
                  <Field label="Logo URL" value={profile.logo_url} onChange={(v)=>patch("logo_url",v)} />
                  <Field label="Website" value={profile.website_url} onChange={(v)=>patch("website_url",v)} />
                </div>
              </Card>

              <Card eyebrow="Contacts" title="How customers reach the business">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Business email" type="email" value={profile.email} onChange={(v)=>patch("email",v)} />
                  <Field label="Support email" type="email" value={profile.support_email} onChange={(v)=>patch("support_email",v)} />
                  <Field label="Phone" value={profile.phone} onChange={(v)=>patch("phone",v)} />
                  <Field label="Address" value={profile.address} onChange={(v)=>patch("address",v)} wide />
                </div>
              </Card>

              <Card eyebrow="Registration" title="Tax and legal identifiers">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Tax ID / РНОКПП" value={profile.tax_id} onChange={(v)=>patch("tax_id",v)} />
                  <Field label="Registration ID / ЄДРПОУ" value={profile.registration_id} onChange={(v)=>patch("registration_id",v)} />
                  <Field label="VAT number" value={profile.vat_number} onChange={(v)=>patch("vat_number",v)} />
                </div>
              </Card>

              <Card eyebrow="Banking" title="Payment and invoice details">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Bank" value={profile.bank_name} onChange={(v)=>patch("bank_name",v)} />
                  <Field label="IBAN" value={profile.iban} onChange={(v)=>patch("iban",v)} wide />
                  <Field label="SWIFT / BIC" value={profile.swift_bic} onChange={(v)=>patch("swift_bic",v)} />
                </div>
              </Card>

              <Card eyebrow="Localization" title="Country, currency and time">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Country code" value={profile.country_code} onChange={(v)=>patch("country_code",v)} maxLength={2} />
                  <Field label="Default currency" value={profile.default_currency} onChange={(v)=>patch("default_currency",v)} maxLength={3} />
                  <Field label="Timezone" value={profile.timezone} onChange={(v)=>patch("timezone",v)} />
                </div>
              </Card>

              <div className="sticky bottom-5 flex justify-end rounded-[24px] border border-black/8 bg-white/95 p-4 shadow-[0_18px_60px_rgba(20,20,20,0.12)] backdrop-blur">
                <button disabled={saving || !canEdit} className="rounded-full bg-[#17191f] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save Company Profile"}</button>
              </div>
            </form>
          )}
        </section>
      </main>
    </>
  );
}

function Card({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <section className="rounded-[30px] border border-black/8 bg-white p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">{eyebrow}</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">{title}</h2><div className="mt-6">{children}</div></section>;
}
function Field({ label, value, onChange, type="text", wide=false, maxLength }: { label:string; value:string; onChange:(value:string)=>void; type?:string; wide?:boolean; maxLength?:number }) {
  return <label className={`grid gap-2 text-sm font-semibold ${wide ? "md:col-span-2" : ""}`}><span>{label}</span><input type={type} value={value} maxLength={maxLength} onChange={(e)=>onChange(e.target.value)} className="rounded-2xl border border-black/10 bg-[#fffdfa] px-4 py-3 font-normal outline-none focus:border-[#9a742e]" /></label>;
}
function Select({ label, value, onChange, options }: { label:string; value:string; onChange:(value:string)=>void; options:[string,string][] }) {
  return <label className="grid gap-2 text-sm font-semibold"><span>{label}</span><select value={value} onChange={(e)=>onChange(e.target.value)} className="rounded-2xl border border-black/10 bg-[#fffdfa] px-4 py-3 font-normal outline-none focus:border-[#9a742e]">{options.map(([key,name])=><option key={key} value={key}>{name}</option>)}</select></label>;
}
