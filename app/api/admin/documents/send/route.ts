import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SendBody = { documentId?: string };
type AccessRow = { access_state?: string; business_role?: string | null };

type ResendResponse = { id?: string; message?: string; name?: string };

function envText(name: string) {
  return (process.env[name] || "").trim();
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function documentHtml(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f3f0e9;font-family:Arial,sans-serif;color:#17191f"><div style="padding:28px 14px"><div style="max-width:720px;margin:0 auto;background:#fff;border:1px solid #e5e0d6;border-radius:24px;padding:32px"><h1 style="margin:0 0 24px;font-size:28px">${escapeHtml(title)}</h1><div style="white-space:pre-wrap;font-size:16px;line-height:1.7;color:#332f29">${escapeHtml(body)}</div></div></div></body></html>`;
}

async function adminAccess() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401, supabase, role: null };

  const { data, error } = await supabase.rpc("get_admin_access_state");
  const access = !error && Array.isArray(data) ? (data[0] as AccessRow | undefined) : undefined;
  if (access?.access_state !== "ready") {
    return { ok: false as const, status: 403, supabase, role: access?.business_role ?? null };
  }
  return { ok: true as const, status: 200, supabase, role: access.business_role ?? null };
}

export async function POST(request: Request) {
  const access = await adminAccess();
  if (!access.ok || !["owner", "admin", "manager"].includes(access.role || "")) {
    return NextResponse.json({ ok: false, error: "document_send_forbidden" }, { status: access.ok ? 403 : access.status });
  }

  const body = (await request.json().catch(() => ({}))) as SendBody;
  if (!body.documentId) {
    return NextResponse.json({ ok: false, error: "document_id_required" }, { status: 400 });
  }

  const { data: document, error: documentError } = await access.supabase
    .from("generated_documents")
    .select("id,business_id,client_id,document_number,title_snapshot,content_snapshot,status,clients(name,email),company_profiles(display_name,email)")
    .eq("id", body.documentId)
    .maybeSingle();

  if (documentError || !document) {
    return NextResponse.json({ ok: false, error: documentError?.message || "generated_document_not_found" }, { status: 404 });
  }

  const client = Array.isArray(document.clients) ? document.clients[0] : document.clients;
  const company = Array.isArray(document.company_profiles) ? document.company_profiles[0] : document.company_profiles;
  const recipient = client?.email?.trim() || "";
  if (!validEmail(recipient)) {
    return NextResponse.json({ ok: false, error: "client_email_missing" }, { status: 400 });
  }

  const apiKey = envText("RESEND_API_KEY");
  const fromEmail = envText("RESEND_FROM_EMAIL");
  if (!apiKey || !validEmail(fromEmail)) {
    return NextResponse.json({ ok: false, error: "document_email_not_configured" }, { status: 503 });
  }

  const fromName = (company?.display_name || "OneStudio OS").replace(/[\r\n<>]/g, " ").trim().slice(0, 120);
  const replyTo = company?.email?.trim() || "";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [recipient],
        subject: document.title_snapshot,
        text: document.content_snapshot,
        html: documentHtml(document.title_snapshot, document.content_snapshot),
        ...(validEmail(replyTo) ? { reply_to: replyTo } : {}),
        tags: [{ name: "document", value: document.document_number.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 256) }],
      }),
    });

    const raw = await response.text();
    let parsed: ResendResponse = {};
    try { parsed = JSON.parse(raw) as ResendResponse; } catch { parsed = { message: raw }; }

    if (!response.ok) {
      const message = `${parsed.name ? `${parsed.name}: ` : ""}${parsed.message || `Resend HTTP ${response.status}`}`;
      await access.supabase.rpc("record_document_delivery", {
        p_document_id: document.id,
        p_success: false,
        p_recipient_email: recipient,
        p_provider: "resend",
        p_provider_message_id: null,
        p_error_message: message,
      });
      return NextResponse.json({ ok: false, error: message }, { status: 502 });
    }

    await access.supabase.rpc("record_document_delivery", {
      p_document_id: document.id,
      p_success: true,
      p_recipient_email: recipient,
      p_provider: "resend",
      p_provider_message_id: parsed.id || null,
      p_error_message: null,
    });

    return NextResponse.json({ ok: true, recipient, providerMessageId: parsed.id || null });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await access.supabase.rpc("record_document_delivery", {
      p_document_id: document.id,
      p_success: false,
      p_recipient_email: recipient,
      p_provider: "resend",
      p_provider_message_id: null,
      p_error_message: message,
    });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
