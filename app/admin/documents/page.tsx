"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { supabase } from "@/lib/supabase";
import { renderDocumentTemplate } from "@/lib/documents/render";
import type { DocumentTemplate, GeneratedDocument } from "@/lib/documents/types";

type Workspace = { business_id: string; name: string; role: string; is_default: boolean };
type Client = { id: string; name: string; email: string | null; phone: string | null };
type Booking = { id: string; reference: string; client_id: string; service_id: string; starts_at: string; timezone: string; total_minor: number; currency: string };
type Service = { id: string; title: string };
type Profile = { display_name:string; legal_name:string; tax_id:string; email:string; website_url:string; bank_name:string; iban:string; address:string };
type DocumentEvent = { id: string; document_id: string; event_type: "created" | "sent" | "send_failed" | "voided"; recipient_email: string | null; provider: string | null; provider_message_id: string | null; error_message: string | null; created_at: string };
type TemplateContent = { title_template: string; body_template: string };
const documentTypeLabels: Record<string, string> = {
  contract: "Contract",
  invoice: "Invoice",
  act: "Service act",
  commercial_offer: "Commercial offer",
  privacy_consent: "Privacy consent",
  other: "Other",
};
const templateVariables = [
  "document.number", "document.date",
  "company.display_name", "company.legal_name", "company.tax_id", "company.email", "company.website", "company.bank_name", "company.iban", "company.address",
  "client.name", "client.email", "client.phone",
  "booking.reference", "booking.date", "booking.total", "booking.currency",
  "service.title",
];

export default function DocumentsPage() {
  const searchParams = useSearchParams();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [savedTemplateContent, setSavedTemplateContent] = useState<Record<string, TemplateContent>>({});
  const [generated, setGenerated] = useState<GeneratedDocument[]>([]);
  const [documentEvents, setDocumentEvents] = useState<DocumentEvent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [profile, setProfile] = useState<Profile>({display_name:"",legal_name:"",tax_id:"",email:"",website_url:"",bank_name:"",iban:"",address:""});
  const [templateId, setTemplateId] = useState("");
  const [clientId, setClientId] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [documentStatus, setDocumentStatus] = useState<"draft" | "final">("final");
  const [requestedClientId, setRequestedClientId] = useState("");
  const [requestedBookingId, setRequestedBookingId] = useState("");
  const [busy, setBusy] = useState(false);
  const [sendingId, setSendingId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const canEdit = workspace ? ["owner","admin","manager"].includes(workspace.role) : false;
  const selectedTemplate = templates.find((item)=>item.id===templateId) ?? templates[0];
  const selectedBooking = bookings.find((item)=>item.id===bookingId);
  const selectedClient = clients.find((item)=>item.id===(clientId || selectedBooking?.client_id));
  const selectedService = services.find((item)=>item.id===selectedBooking?.service_id);
  const visibleBookings = clientId ? bookings.filter((item)=>item.client_id===clientId) : bookings;
  const contextClient = clients.find((item)=>item.id===requestedClientId) ?? null;
  const contextBooking = bookings.find((item)=>item.id===requestedBookingId) ?? null;
  const visibleGenerated = requestedBookingId
    ? generated.filter((item)=>item.booking_id===requestedBookingId)
    : requestedClientId
      ? generated.filter((item)=>item.client_id===requestedClientId)
      : generated;
  const activeTemplateTypes = new Set(templates.filter((item)=>item.status==="active").map((item)=>item.document_type)).size;
  const savedSelectedTemplate = selectedTemplate ? savedTemplateContent[selectedTemplate.id] : undefined;
  const templateIsDirty = Boolean(selectedTemplate && savedSelectedTemplate && (
    selectedTemplate.title_template !== savedSelectedTemplate.title_template ||
    selectedTemplate.body_template !== savedSelectedTemplate.body_template
  ));
  const eventsByDocument = useMemo(() => {
    return documentEvents.reduce<Record<string, DocumentEvent[]>>((acc, event) => {
      acc[event.document_id] = [...(acc[event.document_id] ?? []), event];
      return acc;
    }, {});
  }, [documentEvents]);

  useEffect(()=>{ void load(); },[]);
  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      const hasUnsavedChanges = templates.some((template) => {
        const saved = savedTemplateContent[template.id];
        return saved && (template.title_template !== saved.title_template || template.body_template !== saved.body_template);
      });
      if (!hasUnsavedChanges) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [templates, savedTemplateContent]);

  async function load() {
    setError("");
    const { data: workspaces, error: workspaceError } = await supabase.rpc("list_my_businesses");
    if (workspaceError) { setError(workspaceError.message); return; }
    const rows = (workspaces ?? []) as Workspace[];
    const current = rows.find((row)=>row.is_default) ?? rows[0];
    if (!current) { setError("No active workspace."); return; }
    setWorkspace(current);
    const [templateResult, generatedResult, eventResult, clientResult, bookingResult, serviceResult, profileResult] = await Promise.all([
      supabase.from("document_templates").select("*").eq("business_id",current.business_id).order("document_type"),
      supabase.from("generated_documents").select("id,business_id,client_id,booking_id,document_type,document_number,title_snapshot,content_snapshot,status,recipient_email,sent_at,delivery_provider,delivery_id,delivery_error,issued_at,created_at").eq("business_id",current.business_id).order("created_at",{ascending:false}).limit(30),
      supabase.from("document_events").select("id,document_id,event_type,recipient_email,provider,provider_message_id,error_message,created_at").eq("business_id",current.business_id).order("created_at",{ascending:false}).limit(120),
      supabase.from("clients").select("id,name,email,phone").eq("business_id",current.business_id).is("archived_at",null).order("name"),
      supabase.from("bookings").select("id,reference,client_id,service_id,starts_at,timezone,total_minor,currency").eq("business_id",current.business_id).order("starts_at",{ascending:false}).limit(100),
      supabase.from("services").select("id,title").eq("business_id",current.business_id),
      supabase.from("company_profiles").select("display_name,legal_name,tax_id,email,website_url,bank_name,iban,address").eq("business_id",current.business_id).maybeSingle(),
    ]);
    const firstError = [templateResult.error,generatedResult.error,eventResult.error,clientResult.error,bookingResult.error,serviceResult.error,profileResult.error].find(Boolean);
    if (firstError) { setError(firstError.message); return; }
    const loadedTemplates=(templateResult.data ?? []) as DocumentTemplate[];
    setTemplates(loadedTemplates);
    setSavedTemplateContent(Object.fromEntries(loadedTemplates.map((template) => [template.id, {
      title_template: template.title_template,
      body_template: template.body_template,
    }])));
    setGenerated((generatedResult.data ?? []) as GeneratedDocument[]);
    setDocumentEvents((eventResult.data ?? []) as DocumentEvent[]);
    setClients((clientResult.data ?? []) as Client[]); setBookings((bookingResult.data ?? []) as Booking[]); setServices((serviceResult.data ?? []) as Service[]);
    if (profileResult.data) setProfile(profileResult.data as Profile);
    if (loadedTemplates[0]) setTemplateId((value)=>value || loadedTemplates[0].id);

  }

  useEffect(() => {
    const requestedBooking = searchParams.get("booking");
    const requestedClient = searchParams.get("client");

    if (requestedBooking && bookings.some((item) => item.id === requestedBooking)) {
      setBookingId(requestedBooking);
      setClientId("");
      setRequestedClientId("");
      setRequestedBookingId(requestedBooking);
      return;
    }

    if (requestedClient && clients.some((item) => item.id === requestedClient)) {
      setClientId(requestedClient);
      setBookingId("");
      setRequestedClientId(requestedClient);
      setRequestedBookingId("");
      return;
    }

    setRequestedClientId("");
    setRequestedBookingId("");
    setClientId("");
    setBookingId("");
  }, [searchParams, bookings, clients]);

  async function initializeTemplates() {
    if (!workspace) return; setBusy(true); setError(""); setNotice("");
    const { error: seedError } = await supabase.rpc("seed_document_templates",{p_business_id:workspace.business_id});
    if (seedError) setError(seedError.message); else { setNotice("Default document templates created."); await load(); }
    setBusy(false);
  }

  async function saveTemplate() {
    if (!selectedTemplate || !canEdit) return; setBusy(true); setError(""); setNotice("");
    const { error: saveError } = await supabase.from("document_templates").update({title_template:selectedTemplate.title_template,body_template:selectedTemplate.body_template}).eq("id",selectedTemplate.id);
    if (saveError) setError(saveError.message); else {
      setSavedTemplateContent((current) => ({
        ...current,
        [selectedTemplate.id]: {
          title_template: selectedTemplate.title_template,
          body_template: selectedTemplate.body_template,
        },
      }));
      setNotice("Template saved. New documents will use this text.");
    }
    setBusy(false);
  }

  async function generateDocument() {
    if (!selectedTemplate) return;
    if (templateIsDirty) { setError("Save the template before generating a document."); return; }
    setBusy(true); setError(""); setNotice("");
    const { error: generationError } = await supabase.rpc("create_generated_document",{
      p_template_id:selectedTemplate.id,
      p_client_id:clientId || null,
      p_booking_id:bookingId || null,
      p_status:documentStatus,
    });
    if (generationError) setError(generationError.message); else { setNotice(`${documentStatus === "draft" ? "Draft" : "Final"} document generated as an immutable snapshot.`); await load(); }
    setBusy(false);
  }

  async function sendDocument(documentId: string) {
    setSendingId(documentId); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/documents/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; recipient?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "document_send_failed");
      setNotice(`Document sent to ${result.recipient}.`);
      await load();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : String(sendError));
    } finally {
      setSendingId("");
    }
  }

  function patchTemplate(patch: Partial<DocumentTemplate>) {
    if (!selectedTemplate) return;
    setTemplates((current)=>current.map((item)=>item.id===selectedTemplate.id?{...item,...patch}:item));
  }

  function resetTemplate() {
    if (!selectedTemplate || !savedSelectedTemplate) return;
    patchTemplate(savedSelectedTemplate);
    setNotice("Unsaved changes discarded.");
    setError("");
  }

  function insertTemplateVariable(variable: string) {
    if (!selectedTemplate || !canEdit) return;
    const token = `{{${variable}}}`;
    const spacer = selectedTemplate.body_template.endsWith("\n") || selectedTemplate.body_template.length === 0 ? "" : " ";
    patchTemplate({body_template: `${selectedTemplate.body_template}${spacer}${token}`});
  }

  const preview = useMemo(()=>{
    if (!selectedTemplate) return "";
    const vars:Record<string,string|number>={
      "document.number":"PREVIEW-001","document.date":new Intl.DateTimeFormat("uk-UA").format(new Date()),
      "company.display_name":profile.display_name,"company.legal_name":profile.legal_name,"company.tax_id":profile.tax_id,"company.email":profile.email,"company.website":profile.website_url,"company.bank_name":profile.bank_name,"company.iban":profile.iban,"company.address":profile.address,
      "client.name":selectedClient?.name ?? "","client.email":selectedClient?.email ?? "","client.phone":selectedClient?.phone ?? "",
      "booking.reference":selectedBooking?.reference ?? "","booking.date":selectedBooking?new Intl.DateTimeFormat("uk-UA",{dateStyle:"medium",timeStyle:"short"}).format(new Date(selectedBooking.starts_at)):"",
      "booking.total":selectedBooking?(selectedBooking.total_minor/100).toFixed(2):"","booking.currency":selectedBooking?.currency ?? "","service.title":selectedService?.title ?? "",
    };
    return renderDocumentTemplate(selectedTemplate.body_template,vars);
  },[selectedTemplate,selectedClient,selectedBooking,selectedService,profile]);

  return <><AdminHeader/><main className="min-h-screen px-5 pb-24 pt-36"><section className="mx-auto max-w-7xl">
    <div className="rounded-[36px] bg-[#17191f] p-8 text-white sm:p-10"><p className="text-xs uppercase tracking-[0.28em] text-[#d8b36a]">DOCUMENT TEMPLATES 1.0</p><h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Templates become records.</h1><p className="mt-5 max-w-3xl text-sm leading-7 text-white/65">Generate contracts, invoices, service acts, commercial offers and consents from Company Profile, CRM clients and real bookings. Open this screen from a client or booking and the source record is selected automatically.</p></div>
    {(notice||error)&&<div className={`mt-6 rounded-2xl border px-5 py-4 text-sm ${error?"border-red-200 bg-red-50 text-red-800":"border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{error||notice}</div>}
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <Link href="/admin/legal" className="rounded-[26px] border border-black/8 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(20,20,20,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">Legal Engine</p>
        <h2 className="mt-2 text-xl font-semibold">Public legal pages</h2>
        <p className="mt-2 text-sm leading-6 text-[#6f6c65]">Offer, privacy, refund and cookies with publishable versions.</p>
      </Link>
      <Link href="/admin/settings/company" className="rounded-[26px] border border-black/8 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(20,20,20,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">Company Profile</p>
        <h2 className="mt-2 text-xl font-semibold">Legal source data</h2>
        <p className="mt-2 text-sm leading-6 text-[#6f6c65]">Business name, tax ID, email, bank details and address.</p>
      </Link>
      <div className="rounded-[26px] border border-black/8 bg-[#fff8e8] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">Template library</p>
        <h2 className="mt-2 text-xl font-semibold">{activeTemplateTypes}/5 active types</h2>
        <p className="mt-2 text-sm leading-6 text-[#6f6c65]">{templates.length} templates · {generated.length} generated · {generated.filter((item)=>item.sent_at || item.status==="sent").length} sent</p>
      </div>
    </div>
    {(contextClient||contextBooking)&&<div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#d8b36a]/35 bg-[#fff8e8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a742e]">{contextBooking?"Booking context":"Client context"}</p><p className="mt-1 font-semibold text-[#332f29]">{contextBooking?.reference ?? contextClient?.name}</p><p className="mt-1 text-xs text-[#77736a]">{visibleGenerated.length} linked documents</p></div><div className="flex flex-wrap gap-2">{contextClient&&<Link href={`/admin/clients?client=${contextClient.id}`} className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold">Open client</Link>}{contextBooking&&<Link href={`/admin/bookings?booking=${contextBooking.id}`} className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold">Open booking</Link>}<Link href="/admin/documents" className="rounded-full bg-[#17191f] px-4 py-2 text-xs font-semibold text-white">Show all documents</Link></div></div>}
    {templates.length===0?<div className="mt-6 rounded-[30px] bg-white p-8"><h2 className="text-2xl font-semibold">Initialize document templates</h2><button onClick={initializeTemplates} disabled={busy||!canEdit} className="mt-5 rounded-full bg-[#17191f] px-5 py-3 text-sm font-semibold text-white">Create default templates</button></div>:
    <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="grid gap-6 content-start">
        <section className="rounded-[30px] border border-black/8 bg-white p-6"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">Source data</p><div className="mt-4 grid gap-4">
          <Select label="Template" value={selectedTemplate?.id??""} onChange={setTemplateId} options={templates.map((item)=>[item.id,`${documentTypeLabels[item.document_type] ?? item.document_type} · ${item.locale.toUpperCase()} · v${item.version} · ${item.status}`])}/>
          <Select label={`Booking (optional) · ${visibleBookings.length}`} value={bookingId} onChange={(value)=>{setBookingId(value);if(value)setClientId("");}} options={[["","No booking"],...visibleBookings.map((item)=>{
            const client=clients.find((candidate)=>candidate.id===item.client_id);
            const service=services.find((candidate)=>candidate.id===item.service_id);
            const date=new Intl.DateTimeFormat("uk-UA",{dateStyle:"medium",timeStyle:"short"}).format(new Date(item.starts_at));
            return [item.id,`${item.reference} · ${date} · ${client?.name ?? "Client"} · ${service?.title ?? "Service"}`];
          })]}/>
          <Select label={`Client (optional) · ${clients.length}`} value={clientId} onChange={(value)=>{setClientId(value);setBookingId("");}} disabled={Boolean(bookingId)} options={[["","No client"],...clients.map((item)=>[item.id,`${item.name}${item.email?` · ${item.email}`:""}`])]}/>
          <Select label="Document status" value={documentStatus} onChange={(value)=>setDocumentStatus(value==="draft"?"draft":"final")} options={[["final","Final snapshot"],["draft","Draft snapshot"]]}/>
          {clients.length===0&&<p className="rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">No clients exist in this workspace yet. <Link className="font-semibold underline" href="/admin/clients">Create a client in CRM</Link>, then return here.</p>}
          {clients.length>0&&bookings.length===0&&<p className="rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">No bookings exist in this workspace yet. You can generate a client-only document or <Link className="font-semibold underline" href="/admin/bookings">create a booking</Link>.</p>}
          {clientId&&visibleBookings.length===0&&<p className="rounded-2xl bg-[#eeebe3] px-4 py-3 text-xs leading-5 text-[#5f594f]">The selected client has no bookings. The document will use client and company data only.</p>}
          {templateIsDirty&&<p className="rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">This template has unsaved changes. Save it before generating a document so the snapshot uses the text shown in the preview.</p>}
          <button onClick={generateDocument} disabled={busy||!canEdit||templateIsDirty} className="rounded-full bg-[#17191f] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy?"Working…":documentStatus==="draft"?"Generate draft document":"Generate final document"}</button>
        </div></section>
        <section className="rounded-[30px] border border-black/8 bg-[#eeebe3] p-6"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">Generated documents</p><div className="mt-4 grid gap-3">{visibleGenerated.length===0?<p className="text-sm text-[#77736a]">No documents yet.</p>:visibleGenerated.map((item)=>{const linkedClient=clients.find((client)=>client.id===item.client_id);const linkedBooking=bookings.find((booking)=>booking.id===item.booking_id);const timeline=eventsByDocument[item.id] ?? [];return <div key={item.id} className="rounded-2xl bg-white p-4"><div className="flex justify-between gap-3"><strong>{item.document_number}</strong><span className="rounded-full bg-[#f4ead2] px-2.5 py-1 text-xs font-semibold uppercase text-[#8b7446]">{item.status}</span></div><p className="mt-1 text-sm text-[#77736a]">{item.title_snapshot}</p><div className="mt-3 flex flex-wrap gap-2 text-xs text-[#77736a]">{linkedClient&&<span className="rounded-full bg-[#f7f3eb] px-3 py-1">{linkedClient.name}</span>}{linkedBooking&&<span className="rounded-full bg-[#f7f3eb] px-3 py-1">{linkedBooking.reference}</span>}<span className="rounded-full bg-[#f7f3eb] px-3 py-1">{new Intl.DateTimeFormat("uk-UA").format(new Date(item.created_at))}</span></div>{item.recipient_email&&<p className="mt-2 text-xs text-[#77736a]">{item.status==="sent"?"Sent to":"Recipient"}: {item.recipient_email}</p>}{item.delivery_error&&<p className="mt-2 text-xs text-red-700">{item.delivery_error}</p>}{timeline.length>0&&<div className="mt-3 rounded-2xl bg-[#fbf8f1] px-4 py-3"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a742e]">Timeline</p><div className="mt-2 grid gap-2">{timeline.slice(0,4).map((event)=><div key={event.id} className="text-xs leading-5 text-[#6f6c65]"><span className="font-semibold text-[#332f29]">{eventLabel(event.event_type)}</span><span> · {new Intl.DateTimeFormat("uk-UA",{dateStyle:"medium",timeStyle:"short"}).format(new Date(event.created_at))}</span>{event.recipient_email&&<span> · {event.recipient_email}</span>}{event.provider&&<span> · {event.provider}</span>}{event.error_message&&<p className="mt-1 text-red-700">{event.error_message}</p>}</div>)}</div></div>}<div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>openPrint(item)} className="rounded-full border border-black/10 px-3 py-2 text-xs font-semibold">Print / PDF</button><button onClick={()=>sendDocument(item.id)} disabled={sendingId===item.id||!item.client_id||item.status==="void"} className="rounded-full bg-[#17191f] px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">{sendingId===item.id?"Sending…":item.status==="sent"?"Send again":"Send email"}</button></div></div>})}</div></section>
      </div>
      {selectedTemplate&&<div className="grid gap-6">
        <section className="rounded-[30px] border border-black/8 bg-white p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">Template editor 1.0</p><h2 className="mt-2 text-2xl font-semibold">{documentTypeLabels[selectedTemplate.document_type] ?? selectedTemplate.document_type}</h2><div className="mt-2 flex flex-wrap items-center gap-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b7446]">{selectedTemplate.locale.toUpperCase()} · v{selectedTemplate.version} · {selectedTemplate.status}</p><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${templateIsDirty?"bg-amber-100 text-amber-900":"bg-emerald-100 text-emerald-800"}`}>{templateIsDirty?"Unsaved changes":"Saved"}</span></div></div><div className="flex items-start gap-2"><button onClick={resetTemplate} disabled={busy||!canEdit||!templateIsDirty} className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold disabled:opacity-40">Discard</button><button onClick={saveTemplate} disabled={busy||!canEdit||!templateIsDirty} className="rounded-full bg-[#17191f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">{busy?"Saving…":"Save template"}</button></div></div>
          <label className="mt-5 grid gap-2 text-sm font-semibold">Title<input value={selectedTemplate.title_template} disabled={!canEdit} onChange={(e)=>patchTemplate({title_template:e.target.value})} className="rounded-2xl border border-black/10 px-4 py-3 font-normal disabled:bg-black/5"/></label>
          <label className="mt-4 grid gap-2 text-sm font-semibold">Body<textarea value={selectedTemplate.body_template} disabled={!canEdit} onChange={(e)=>patchTemplate({body_template:e.target.value})} className="min-h-[420px] rounded-2xl border border-black/10 px-4 py-4 font-mono text-sm font-normal leading-6 disabled:bg-black/5"/></label>
          <div className="mt-4 rounded-2xl bg-[#f7f3eb] p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b7446]">Insert variable</p><div className="mt-3 flex flex-wrap gap-2">{templateVariables.map((variable)=><button key={variable} type="button" onClick={()=>insertTemplateVariable(variable)} disabled={!canEdit} className="rounded-full border border-black/10 bg-white px-3 py-1.5 font-mono text-[11px] text-[#5f594f] disabled:opacity-40">{`{{${variable}}}`}</button>)}</div><p className="mt-3 text-xs leading-5 text-[#77736a]">Clicking a variable adds it to the end of the template body. You can then move it to the required place.</p></div>
        </section>
        <section className="rounded-[30px] border border-black/8 bg-[#fffdfa] p-6"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">Live preview</p><button onClick={()=>openPreviewPrint(selectedTemplate.title_template, preview)} className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold">Print / PDF</button></div><article className="mt-6 whitespace-pre-wrap text-[15px] leading-7">{preview}</article></section>
      </div>}
    </div>}
  </section></main></>;
}

function Select({label,value,onChange,options,disabled=false}:{label:string;value:string;onChange:(value:string)=>void;options:string[][];disabled?:boolean}){return <label className="grid gap-2 text-sm font-semibold"><span>{label}</span><select disabled={disabled} value={value} onChange={(e)=>onChange(e.target.value)} className="rounded-2xl border border-black/10 bg-[#fffdfa] px-4 py-3 font-normal disabled:opacity-50">{options.map(([key,name])=><option key={key} value={key}>{name}</option>)}</select></label>}
function eventLabel(type: DocumentEvent["event_type"]){return ({created:"Created",sent:"Sent",send_failed:"Send failed",voided:"Voided"} as Record<DocumentEvent["event_type"], string>)[type]}
function openPreviewPrint(title:string, content:string){openPrintableDocument(title, "Preview", content)}
function openPrint(item:GeneratedDocument){openPrintableDocument(item.title_snapshot, item.document_number, item.content_snapshot)}
function openPrintableDocument(title:string, meta:string, content:string){
  const html=`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;max-width:820px;margin:40px auto;line-height:1.65;color:#222}.meta{margin:0 0 28px;color:#77736a;font-size:12px}.body{white-space:pre-wrap;font-size:15px}h1{font-size:28px;margin:0 0 10px}@media print{body{margin:20mm;max-width:none}}</style></head><body><h1>${escapeHtml(title)}</h1><div class="meta">${escapeHtml(meta)}</div><div class="body">${escapeHtml(content || "Document content is empty.")}</div><script>window.addEventListener("load",function(){setTimeout(function(){window.focus();window.print();},300);});<\/script></body></html>`;
  openPrintableHtml(html);
}
function openPrintableHtml(html:string){
  const blob=new Blob([html],{type:"text/html;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const win=window.open(url,"_blank");
  if(!win)URL.revokeObjectURL(url);
  setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function escapeHtml(value:string){return value.replace(/[&<>'"]/g,(char)=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]??char))}
