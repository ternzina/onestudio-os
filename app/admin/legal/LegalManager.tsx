"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { supabase } from "@/lib/supabase";
import { defaultLegalDocuments, legalTypes, renderLegalTemplate, type LegalLocale, type LegalType } from "@/lib/legal/defaults";

type Workspace = { business_id: string; name: string; role: string; is_default: boolean };
type Profile = {
  business_id: string; legal_name: string; display_name: string; entity_type: string; tax_id: string;
  registration_id: string; email: string; phone: string; website_url: string; country_code: string;
  address: string; bank_name: string; iban: string; support_email: string; governing_law: string;
};
type DocumentRow = {
  id: string; business_id: string; document_type: LegalType; locale: LegalLocale; title: string;
  body_template: string; status: "draft" | "published" | "archived"; version: number; published_at: string | null;
};

const initialProfile: Omit<Profile, "business_id"> = {
  legal_name: "ФОП Тернавська Зінаїда Рахілівна",
  display_name: "OneStudio OS",
  entity_type: "sole_proprietor",
  tax_id: "2011300180",
  registration_id: "2011300180",
  email: "hello@onestudioos.com",
  phone: "",
  website_url: "https://onestudioos.com",
  country_code: "UA",
  address: "",
  bank_name: "АТ КБ «ПРИВАТБАНК»",
  iban: "UA663052990000026005016008890",
  support_email: "hello@onestudioos.com",
  governing_law: "Ukraine",
};

export default function LegalManager() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [profile, setProfile] = useState<Omit<Profile, "business_id">>(initialProfile);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [locale, setLocale] = useState<LegalLocale>("uk");
  const [type, setType] = useState<LegalType>("public_offer");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const selected = documents.find((doc) => doc.locale === locale && doc.document_type === type) ?? null;
  const canEdit = workspace ? ["owner", "admin", "manager"].includes(workspace.role) : false;
  const profileMap = useMemo(() => Object.fromEntries(Object.entries(profile).map(([key, value]) => [key, String(value ?? "")])), [profile]);
  const preview = selected ? renderLegalTemplate(selected.body_template, profileMap) : "";

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const { data: workspaces, error: workspaceError } = await supabase.rpc("list_my_businesses");
    if (workspaceError) { setError(workspaceError.message); setLoading(false); return; }
    const current = ((workspaces ?? []) as Workspace[]).find((row) => row.is_default) ?? (workspaces ?? [])[0] ?? null;
    if (!current) { setError("No active workspace."); setLoading(false); return; }
    setWorkspace(current as Workspace);

    const [profileResult, docsResult] = await Promise.all([
      supabase.from("legal_company_profiles").select("*").eq("business_id", (current as Workspace).business_id).maybeSingle(),
      supabase.from("legal_documents").select("id,business_id,document_type,locale,title,body_template,status,version,published_at").eq("business_id", (current as Workspace).business_id).order("locale").order("document_type"),
    ]);
    if (profileResult.error) setError(profileResult.error.message);
    if (docsResult.error) setError(docsResult.error.message);
    if (profileResult.data) {
      const { business_id: _businessId, updated_at: _updatedAt, ...rest } = profileResult.data as Profile & { updated_at?: string };
      setProfile({ ...initialProfile, ...rest });
    }
    setDocuments((docsResult.data ?? []) as DocumentRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function initialize() {
    if (!workspace || !canEdit) return;
    setBusy(true); setError(""); setNotice("");
    const { error: profileError } = await supabase.from("legal_company_profiles").upsert({ business_id: workspace.business_id, ...profile });
    if (profileError) { setError(profileError.message); setBusy(false); return; }
    const rows = (["uk", "en"] as LegalLocale[]).flatMap((docLocale) => legalTypes.map((item) => ({
      business_id: workspace.business_id,
      document_type: item.key,
      locale: docLocale,
      title: defaultLegalDocuments[docLocale][item.key].title,
      body_template: defaultLegalDocuments[docLocale][item.key].body,
      status: "draft",
    })));
    const { error: docsError } = await supabase.from("legal_documents").upsert(rows, { onConflict: "business_id,document_type,locale", ignoreDuplicates: true });
    if (docsError) setError(docsError.message); else setNotice("Legal Engine 1.0 initialized.");
    await load(); setBusy(false);
  }

  async function saveProfile() {
    if (!workspace || !canEdit) return;
    setBusy(true); setError(""); setNotice("");
    const { error: saveError } = await supabase.from("legal_company_profiles").upsert({ business_id: workspace.business_id, ...profile, updated_at: new Date().toISOString() });
    if (saveError) setError(saveError.message); else setNotice("Company profile saved.");
    setBusy(false);
  }

  async function saveDocument() {
    if (!selected || !canEdit) return;
    setBusy(true); setError(""); setNotice("");
    const { error: saveError } = await supabase.from("legal_documents").update({ title: selected.title, body_template: selected.body_template, status: selected.status === "published" ? "draft" : selected.status, updated_at: new Date().toISOString() }).eq("id", selected.id);
    if (saveError) setError(saveError.message); else setNotice("Document saved as draft.");
    await load(); setBusy(false);
  }

  async function publishDocument() {
    if (!selected || !canEdit) return;
    setBusy(true); setError(""); setNotice("");
    const { error: publishError } = await supabase.rpc("publish_legal_document", { p_document_id: selected.id });
    if (publishError) setError(publishError.message); else setNotice("Document published and version snapshot created.");
    await load(); setBusy(false);
  }

  function patchSelected(patch: Partial<DocumentRow>) {
    if (!selected) return;
    setDocuments((rows) => rows.map((row) => row.id === selected.id ? { ...row, ...patch } : row));
  }

  if (loading) return <><AdminHeader /><main className="min-h-screen px-5 pt-36"><div className="mx-auto max-w-7xl rounded-[30px] bg-white p-8">Loading Legal Engine…</div></main></>;

  return (
    <>
      <AdminHeader />
      <main className="min-h-screen px-5 pb-24 pt-36">
        <section className="mx-auto max-w-7xl">
          <div className="rounded-[36px] bg-[#17191f] p-8 text-white sm:p-10">
            <p className="text-xs uppercase tracking-[0.28em] text-[#d8b36a]">LEGAL ENGINE 1.0</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Documents that grow with the business.</h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/65">Company variables, bilingual templates, drafts, publishing and version snapshots in one workspace-safe module.</p>
          </div>

          {(notice || error) && <div className={`mt-6 rounded-2xl border px-5 py-4 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{error || notice}</div>}

          {documents.length === 0 ? (
            <div className="mt-6 rounded-[30px] border border-black/8 bg-white p-8">
              <h2 className="text-2xl font-semibold">Initialize the legal workspace</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f6c65]">Creates the OneStudio OS company profile plus Ukrainian and English drafts for the Public Offer, Privacy, Refund and Cookie policies.</p>
              <button onClick={initialize} disabled={busy || !canEdit} className="mt-6 rounded-full bg-[#17191f] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Creating…" : "Create Legal Engine 1.0"}</button>
            </div>
          ) : (
            <div className="mt-6 grid gap-6">
              <section className="rounded-[30px] border border-black/8 bg-white p-6 sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">Company profile</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">One source of truth</h2></div><button onClick={saveProfile} disabled={busy || !canEdit} className="rounded-full bg-[#17191f] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Save company profile</button></div>
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {([['legal_name','Legal name'],['display_name','Brand'],['tax_id','Tax ID'],['email','Business email'],['support_email','Support email'],['website_url','Website'],['bank_name','Bank'],['iban','IBAN'],['address','Legal / correspondence address']] as const).map(([key,label]) => <label key={key} className="grid gap-2 text-sm font-semibold"><span>{label}</span><input value={profile[key]} onChange={(e)=>setProfile({...profile,[key]:e.target.value})} className="rounded-2xl border border-black/10 bg-[#fffdfa] px-4 py-3 font-normal outline-none focus:border-[#9a742e]" /></label>)}
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
                <aside className="rounded-[30px] border border-black/8 bg-[#eeebe3] p-5">
                  <div className="flex gap-2">{(["uk","en"] as LegalLocale[]).map((item)=><button key={item} onClick={()=>setLocale(item)} className={`rounded-full px-4 py-2 text-xs font-semibold uppercase ${locale===item?"bg-[#17191f] text-white":"bg-white"}`}>{item}</button>)}</div>
                  <div className="mt-5 grid gap-2">{legalTypes.map((item)=>{const doc=documents.find((d)=>d.locale===locale&&d.document_type===item.key);return <button key={item.key} onClick={()=>setType(item.key)} className={`rounded-[18px] p-4 text-left ${type===item.key?"bg-[#17191f] text-white":"bg-white/80"}`}><div className="flex items-center justify-between gap-3"><span className="font-semibold">{locale==="uk"?item.uk:item.en}</span><span className={`rounded-full px-2 py-1 text-[10px] uppercase ${doc?.status==="published"?"bg-emerald-100 text-emerald-800":"bg-amber-100 text-amber-800"}`}>{doc?.status ?? "draft"}</span></div><p className={`mt-2 text-xs ${type===item.key?"text-white/55":"text-[#7a766d]"}`}>v{doc?.version ?? 1}</p></button>})}</div>
                </aside>

                {selected && <div className="grid gap-6">
                  <div className="rounded-[30px] border border-black/8 bg-white p-6 sm:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-[#9a742e]">Editor · {locale.toUpperCase()}</p><h2 className="mt-2 text-2xl font-semibold">{selected.title}</h2></div><div className="flex gap-2"><button onClick={saveDocument} disabled={busy||!canEdit} className="rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold">Save draft</button><button onClick={publishDocument} disabled={busy||!canEdit} className="rounded-full bg-[#17191f] px-4 py-2.5 text-sm font-semibold text-white">Publish</button></div></div>
                    <label className="mt-6 grid gap-2 text-sm font-semibold">Title<input value={selected.title} onChange={(e)=>patchSelected({title:e.target.value})} className="rounded-2xl border border-black/10 px-4 py-3 font-normal" /></label>
                    <label className="mt-4 grid gap-2 text-sm font-semibold">Template<textarea value={selected.body_template} onChange={(e)=>patchSelected({body_template:e.target.value})} className="min-h-[560px] rounded-2xl border border-black/10 px-4 py-4 font-mono text-sm font-normal leading-6" /></label>
                    <p className="mt-3 text-xs text-[#77736a]">Variables: {"{{legal_name}} {{tax_id}} {{email}} {{support_email}} {{website_url}} {{bank_name}} {{iban}} {{address}}"}</p>
                  </div>
                  <div className="rounded-[30px] border border-black/8 bg-[#fffdfa] p-6 sm:p-8 print:border-0 print:p-0">
                    <div className="flex items-center justify-between gap-3 print:hidden"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">Rendered preview</p><div className="flex gap-2"><a target="_blank" href={`/legal/${locale}/${legalTypes.find((item)=>item.key===type)?.slug}`} className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold">Open public page</a><button onClick={()=>window.print()} className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold">Print / Save PDF</button></div></div>
                    <article className="legal-preview mt-6 whitespace-pre-wrap text-[15px] leading-7 text-[#242424]"><h1 className="mb-8 text-3xl font-semibold tracking-[-0.04em]">{selected.title}</h1>{preview}</article>
                  </div>
                </div>}
              </section>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
