"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type DocumentRow = {
  id: string;
  business_id: string;
  client_id: string | null;
  booking_id: string | null;
  document_type: string;
  document_number: string;
  title_snapshot: string;
  content_snapshot: string;
  status: "draft" | "final" | "sent" | "void";
  recipient_email: string | null;
  sent_at: string | null;
  delivery_provider: string | null;
  delivery_id: string | null;
  delivery_error: string | null;
  issued_at: string;
  created_at: string;
};

type Props = {
  businessId: string;
  clientId?: string | null;
  bookingId?: string | null;
  locale: "ru" | "en";
  timezone: string;
  canOperate: boolean;
};

const copy = {
  ru: {
    eyebrow: "Документы",
    empty: "Связанных документов пока нет.",
    loading: "Загрузка документов…",
    view: "Просмотреть",
    hide: "Скрыть",
    print: "Печать / PDF",
    resend: "Отправить повторно",
    sending: "Отправка…",
    create: "Создать документ",
    sent: "Отправлен",
    failed: "Ошибка",
    final: "Готов",
    draft: "Черновик",
    void: "Аннулирован",
    created: "Создан",
    sentAt: "Отправлен",
    recipient: "Получатель",
    reload: "Обновить",
  },
  en: {
    eyebrow: "Documents",
    empty: "No linked documents yet.",
    loading: "Loading documents…",
    view: "View",
    hide: "Hide",
    print: "Print / PDF",
    resend: "Send again",
    sending: "Sending…",
    create: "Create document",
    sent: "Sent",
    failed: "Failed",
    final: "Final",
    draft: "Draft",
    void: "Void",
    created: "Created",
    sentAt: "Sent",
    recipient: "Recipient",
    reload: "Refresh",
  },
} as const;

function formatDateTime(iso: string, timezone: string, locale: "ru" | "en") {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    timeZone: timezone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function printDocument(document: DocumentRow) {
  const popup = window.open("", "_blank");
  if (!popup) return;
  const escape = (value: string) => value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escape(document.title_snapshot)}</title><style>body{font-family:Arial,sans-serif;color:#17191f;margin:48px;line-height:1.65}h1{font-size:28px;margin:0 0 28px}.meta{color:#77736a;font-size:12px;margin-bottom:30px}.body{white-space:pre-wrap;font-size:15px}@media print{body{margin:20mm}}</style></head><body><h1>${escape(document.title_snapshot)}</h1><div class="meta">${escape(document.document_number)}</div><div class="body">${escape(document.content_snapshot)}</div></body></html>`);
  popup.document.close();

  popup.focus();

  popup.addEventListener("load", () => {
    setTimeout(() => {
      popup.print();
    }, 150);
  });
}

export default function InlineDocuments({ businessId, clientId, bookingId, locale, timezone, canOperate }: Props) {
  const text = copy[locale];
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const createHref = useMemo(() => {
    if (bookingId) return `/admin/documents?booking=${bookingId}`;
    if (clientId) return `/admin/documents?client=${clientId}`;
    return "/admin/documents";
  }, [bookingId, clientId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    let query = supabase
      .from("generated_documents")
      .select("id,business_id,client_id,booking_id,document_type,document_number,title_snapshot,content_snapshot,status,recipient_email,sent_at,delivery_provider,delivery_id,delivery_error,issued_at,created_at")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (bookingId) query = query.eq("booking_id", bookingId);
    else if (clientId) query = query.eq("client_id", clientId);

    const { data, error: queryError } = await query.limit(50);
    if (queryError) setError(queryError.message);
    setDocuments((data ?? []) as DocumentRow[]);
    setLoading(false);
  }, [bookingId, businessId, clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  const sendAgain = async (documentId: string) => {
    setSendingId(documentId);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/documents/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; recipient?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error || `HTTP ${response.status}`);
      setNotice(locale === "ru" ? `Письмо отправлено: ${payload.recipient ?? ""}` : `Email sent: ${payload.recipient ?? ""}`);
      await load();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : String(sendError));
    } finally {
      setSendingId(null);
    }
  };

  const statusLabel = (document: DocumentRow) => {
    if (document.delivery_error) return text.failed;
    if (document.sent_at || document.status === "sent") return text.sent;
    if (document.status === "void") return text.void;
    if (document.status === "draft") return text.draft;
    return text.final;
  };

  return (
    <section className="rounded-[24px] border border-black/8 bg-[#fffdfa] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{text.eyebrow}</p>
          <p className="mt-1 text-sm text-[#77736a]">{documents.length}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void load()} className="rounded-full border border-black/10 px-3 py-2 text-xs font-semibold">{text.reload}</button>
          <Link href={createHref} className="rounded-full bg-[#17191f] px-4 py-2 text-xs font-semibold text-white">{text.create}</Link>
        </div>
      </div>

      {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
      {loading && <p className="mt-4 text-sm text-[#77736a]">{text.loading}</p>}
      {!loading && documents.length === 0 && <p className="mt-4 rounded-2xl bg-[#eeebe3] p-4 text-sm text-[#77736a]">{text.empty}</p>}

      <div className="mt-4 grid gap-3">
        {documents.map((document) => {
          const expanded = expandedId === document.id;
          const failed = Boolean(document.delivery_error);
          const sent = Boolean(document.sent_at || document.status === "sent");
          return (
            <article key={document.id} className="rounded-2xl border border-black/8 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9a742e]">{document.document_type}</p>
                  <p className="mt-1 truncate font-semibold">{document.document_number}</p>
                  <p className="mt-1 text-sm text-[#55524c]">{document.title_snapshot}</p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${failed ? "bg-red-50 text-red-700" : sent ? "bg-emerald-50 text-emerald-800" : "bg-[#eeebe3] text-[#5f594f]"}`}>{statusLabel(document)}</span>
              </div>

              <div className="mt-3 grid gap-1 text-xs text-[#77736a]">
                <p>{text.created}: {formatDateTime(document.created_at, timezone, locale)}</p>
                {document.sent_at && <p>{text.sentAt}: {formatDateTime(document.sent_at, timezone, locale)}</p>}
                {document.recipient_email && <p>{text.recipient}: {document.recipient_email}</p>}
                {document.delivery_error && <p className="text-red-700">{document.delivery_error}</p>}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-black/8 pt-3">
                <button type="button" onClick={() => setExpandedId(expanded ? null : document.id)} className="rounded-full border border-black/10 px-3 py-2 text-xs font-semibold">{expanded ? text.hide : text.view}</button>
                <button type="button" onClick={() => printDocument(document)} className="rounded-full border border-black/10 px-3 py-2 text-xs font-semibold">{text.print}</button>
                <button type="button" onClick={() => void sendAgain(document.id)} disabled={!canOperate || sendingId === document.id || document.status === "void"} className="rounded-full border border-black/10 px-3 py-2 text-xs font-semibold disabled:opacity-45">{sendingId === document.id ? text.sending : text.resend}</button>
              </div>

              {expanded && <div className="mt-4 whitespace-pre-wrap rounded-2xl bg-[#f5f1e9] p-4 text-sm leading-7 text-[#332f29]">{document.content_snapshot}</div>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
