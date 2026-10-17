"use client";

import { useState } from "react";

type Warning = { code: string; message: string; blocksStatic: boolean };

export default function SiteExportDialog({
  businessId,
  locale,
  defaultOrigin,
  onClose,
}: {
  businessId: string;
  locale: string;
  defaultOrigin: string;
  onClose: () => void;
}) {
  const [origin, setOrigin] = useState(defaultOrigin);
  const [busy, setBusy] = useState<"static" | "next" | null>(null);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<Warning[]>([]);

  async function download(format: "static" | "next") {
    setBusy(format);
    setError("");
    try {
      const response = await fetch("/api/admin/site-export", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ businessId, locale, format, canonicalOrigin: origin }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        setError(payload?.error || "Не удалось собрать архив.");
        return;
      }
      const header = response.headers.get("x-export-warnings");
      setWarnings(header ? JSON.parse(decodeURIComponent(header)) as Warning[] : []);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${format === "static" ? "static-html" : "next-standalone"}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Не удалось скачать архив.");
    } finally {
      setBusy(null);
    }
  }

  return <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-labelledby="site-export-title">
    <div className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-[28px] bg-white p-6 shadow-2xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a742e]">Автономная копия</p>
      <h2 id="site-export-title" className="mt-2 text-2xl font-semibold">Экспорт сайта</h2>
      <p className="mt-3 text-sm leading-6 text-[#5f5a53]">Архив запускается без OneStudio OS, его API, базы и панели администратора. Домен, DNS и продакшен-настройки не изменяются.</p>
      <label className="mt-5 grid gap-2 text-sm font-semibold">Канонический адрес<input value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="https://example.com" className="rounded-xl border border-black/10 px-4 py-3 font-normal" /></label>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" disabled={busy !== null} onClick={() => void download("static")} className="rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold disabled:opacity-40">{busy === "static" ? "Сборка…" : "Static HTML"}</button>
        <button type="button" disabled={busy !== null} onClick={() => void download("next")} className="rounded-xl bg-[#17191f] px-4 py-3 text-sm font-semibold text-white disabled:opacity-40">{busy === "next" ? "Сборка…" : "Next.js Standalone"}</button>
        <button type="button" onClick={onClose} className="rounded-xl px-4 py-3 text-sm font-semibold">Закрыть</button>
      </div>
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      {warnings.length ? <ul className="mt-4 grid gap-2 text-sm leading-6 text-[#5f5a53]">{warnings.map((item) => <li key={`${item.code}-${item.message}`}>{item.blocksStatic ? "Ограничение статического экспорта: " : ""}{item.message}</li>)}</ul> : null}
    </div>
  </div>;
}
