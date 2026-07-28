"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type RequestRow = {
  id: string; status: string; client_name: string; client_email: string;
  client_phone: string | null; business_type: string | null; subject: string | null; message: string;
  internal_notes: string | null; created_at: string;
};

const statuses = [
  ["new", "Новая"], ["in_progress", "В работе"], ["answered", "Отвечено"], ["closed", "Закрыта"],
] as const;

export default function AdminRequestsPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [selected, setSelected] = useState<RequestRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await getSupabaseBrowserClient().rpc("get_admin_public_requests");
    const next = (data ?? []) as RequestRow[];
    setRows(next);
    setSelected((current) => next.find((item) => item.id === current?.id) ?? next[0] ?? null);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function save() {
    if (!selected) return;
    const { error } = await getSupabaseBrowserClient().rpc("update_admin_public_request", {
      p_request_id: selected.id,
      p_status: selected.status,
      p_internal_notes: selected.internal_notes,
    });
    setNotice(error ? "Не удалось сохранить изменения." : "Заявка обновлена.");
    if (!error) void load();
  }

  return (
    <>
      <AdminHeader />
      <main className="min-h-screen px-5 pb-24 pt-36">
        <section className="mx-auto max-w-7xl">
          <div className="rounded-[36px] bg-[#17191f] p-8 text-white sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">Public Requests 1.0</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">Заявки без календаря</h1>
            <p className="mt-5 max-w-3xl leading-7 text-white/65">Клиент описывает задачу и оставляет контакты — без даты, времени, длительности и резервирования ресурсов.</p>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-[28px] border border-black/8 bg-white p-4">
              <div className="mb-3 flex items-center justify-between px-2"><h2 className="font-semibold">Все заявки</h2><span className="text-sm text-black/45">{rows.length}</span></div>
              {loading ? <p className="p-3 text-sm text-black/45">Загрузка…</p> : rows.length === 0 ? <p className="p-3 text-sm text-black/45">Заявок пока нет.</p> : rows.map((row) => (
                <button key={row.id} onClick={() => setSelected(row)} className={`mb-2 w-full rounded-2xl p-4 text-left ${selected?.id === row.id ? "bg-[#17191f] text-white" : "bg-[#f4f1ea]"}`}>
                  <div className="flex justify-between gap-3"><strong>{row.client_name}</strong><span className="text-xs opacity-60">{new Date(row.created_at).toLocaleDateString("ru-RU")}</span></div>
                  <p className="mt-1 truncate text-sm opacity-65">{row.subject || row.business_type || row.client_email}</p>
                </button>
              ))}
            </div>
            <div className="rounded-[28px] border border-black/8 bg-white p-6 sm:p-8">
              {!selected ? <p className="text-black/45">Выберите заявку.</p> : (
                <div className="grid gap-5">
                  <div><h2 className="text-2xl font-semibold">{selected.client_name}</h2><a className="text-sm text-[#80601f] underline" href={`mailto:${selected.client_email}`}>{selected.client_email}</a>{selected.client_phone && <p className="mt-1 text-sm">{selected.client_phone}</p>}</div>
                  {selected.subject && <div><p className="text-xs uppercase tracking-wider text-black/40">Тема заявки</p><p className="mt-1 font-semibold">{selected.subject}</p></div>}
                  {selected.business_type && <div><p className="text-xs uppercase tracking-wider text-black/40">Тип бизнеса</p><p className="mt-1">{selected.business_type}</p></div>}
                  <div><p className="text-xs uppercase tracking-wider text-black/40">Сообщение</p><p className="mt-2 whitespace-pre-wrap leading-7">{selected.message}</p></div>
                  <label className="grid gap-2 text-sm font-semibold">Статус<select value={selected.status} onChange={(e) => setSelected({...selected, status: e.target.value})} className="rounded-2xl border border-black/12 px-4 py-3 font-normal">{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                  <label className="grid gap-2 text-sm font-semibold">Внутренние заметки<textarea rows={4} value={selected.internal_notes ?? ""} onChange={(e) => setSelected({...selected, internal_notes: e.target.value})} className="rounded-2xl border border-black/12 px-4 py-3 font-normal" /></label>
                  {notice && <p className="text-sm text-[#80601f]">{notice}</p>}
                  <button onClick={save} className="rounded-full bg-[#17191f] px-6 py-3 font-semibold text-white">Сохранить</button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
