"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { supabase } from "@/lib/supabase";

type Workspace = {
  business_id: string;
  name: string;
  role: string;
  is_default: boolean;
};

type MonetizationSettings = {
  business_id: string;
  ads_txt_content: string;
  ads_txt_enabled: boolean;
  adsense_publisher_id: string;
  updated_at: string | null;
};

type DomainSettings = {
  domain?: string | null;
  status?: string | null;
};

const EMPTY_SETTINGS: MonetizationSettings = {
  business_id: "",
  ads_txt_content: "",
  ads_txt_enabled: false,
  adsense_publisher_id: "",
  updated_at: null,
};

export default function SiteMonetizationPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [settings, setSettings] = useState<MonetizationSettings>(EMPTY_SETTINGS);
  const [domain, setDomain] = useState<DomainSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canEdit = workspace
    ? ["owner", "admin", "manager"].includes(workspace.role)
    : false;

  const adsTxtUrl = useMemo(() => {
    if (!domain?.domain || domain.status !== "active") return "";
    return `https://${domain.domain}/ads.txt`;
  }, [domain]);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data: workspaces, error: workspaceError } =
        await supabase.rpc("list_my_businesses");

      if (!active) return;

      if (workspaceError) {
        setError(workspaceError.message);
        setLoading(false);
        return;
      }

      const rows = (workspaces ?? []) as Workspace[];
      const current = rows.find((row) => row.is_default) ?? rows[0] ?? null;

      if (!current) {
        setError("Нет активного рабочего пространства.");
        setLoading(false);
        return;
      }

      setWorkspace(current);

      const [settingsResponse, domainResponse] = await Promise.all([
        supabase.rpc("get_site_monetization_settings", {
          p_business_id: current.business_id,
        }),
        supabase.rpc("get_public_site_domain_management", {
          p_business_id: current.business_id,
        }),
      ]);

      if (!active) return;

      if (settingsResponse.error) {
        setError(settingsResponse.error.message);
      } else if (settingsResponse.data) {
        setSettings(settingsResponse.data as MonetizationSettings);
      }

      if (!domainResponse.error && domainResponse.data) {
        setDomain(domainResponse.data as DomainSettings);
      }

      setLoading(false);
    }

    void load();
    return () => { active = false; };
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!workspace || !canEdit) return;

    setSaving(true);
    setMessage("");
    setError("");

    const { data, error: saveError } = await supabase.rpc(
      "save_site_monetization_settings",
      {
        p_business_id: workspace.business_id,
        p_ads_txt_content: settings.ads_txt_content,
        p_ads_txt_enabled: settings.ads_txt_enabled,
        p_adsense_publisher_id: settings.adsense_publisher_id,
      },
    );

    if (saveError) {
      const knownMessages: Record<string, string> = {
        ads_txt_content_required: "Чтобы включить ads.txt, добавьте хотя бы одну строку.",
        ads_txt_content_too_large: "Файл ads.txt слишком большой.",
        adsense_publisher_id_invalid: "Publisher ID должен иметь вид ca-pub-1234567890123456.",
        site_monetization_access_denied: "Недостаточно прав для изменения настроек монетизации.",
      };
      setError(knownMessages[saveError.message] || saveError.message);
    } else {
      if (data) setSettings(data as MonetizationSettings);
      setMessage(
        settings.ads_txt_enabled
          ? "ads.txt сохранён и опубликован."
          : "Настройки сохранены. Публикация ads.txt выключена.",
      );
    }

    setSaving(false);
  }

  return (
    <>
      <AdminHeader />
      <main className="min-h-screen px-5 pb-24 pt-36">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-[36px] bg-[#17191f] p-7 text-white sm:p-10">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d8b36a]">SITE MONETIZATION 1.0</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Реклама и монетизация</h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68">
              Добавьте содержимое ads.txt для текущего сайта. OneStudio автоматически отдаст его в корне подключённого домена.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/admin/settings" className="inline-flex min-h-11 items-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold">← Настройки</Link>
            <Link href="/admin/site" className="inline-flex min-h-11 items-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold">Редактор сайта</Link>
          </div>

          {(message || error) && (
            <div className={`mt-6 rounded-2xl border px-5 py-4 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
              {error || message}
            </div>
          )}

          {loading ? (
            <div className="mt-6 rounded-[28px] bg-white p-8 text-sm text-[#6f6c65]">Загрузка настроек…</div>
          ) : (
            <form onSubmit={save} className="mt-6 grid gap-6">
              <section className="rounded-[30px] border border-black/8 bg-white p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">Текущий сайт</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">{workspace?.name}</h2>
                {adsTxtUrl ? (
                  <div className="mt-5 rounded-2xl bg-[#f4f0e8] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#716d65]">Публичный адрес</p>
                    <a href={adsTxtUrl} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm font-semibold underline">{adsTxtUrl}</a>
                  </div>
                ) : (
                  <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                    У сайта пока нет активного собственного домена. Настройки можно сохранить сейчас, а файл появится после подключения домена.
                  </p>
                )}
              </section>

              <section className="rounded-[30px] border border-black/8 bg-white p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">ADS.TXT</p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">Авторизованные продавцы рекламы</h2>
                  </div>
                  <label className="flex items-center gap-3 rounded-full border border-black/10 px-4 py-3 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={settings.ads_txt_enabled}
                      onChange={(event) => setSettings((current) => ({ ...current, ads_txt_enabled: event.target.checked }))}
                      disabled={!canEdit}
                      className="h-4 w-4"
                    />
                    Опубликовать ads.txt
                  </label>
                </div>

                <label className="mt-6 grid gap-2 text-sm font-semibold">
                  <span>Содержимое файла</span>
                  <textarea
                    value={settings.ads_txt_content}
                    onChange={(event) => setSettings((current) => ({ ...current, ads_txt_content: event.target.value }))}
                    disabled={!canEdit}
                    rows={10}
                    spellCheck={false}
                    placeholder="google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0"
                    className="rounded-2xl border border-black/10 bg-[#fffdfa] px-4 py-3 font-mono text-sm font-normal leading-6 outline-none focus:border-[#9a742e] disabled:opacity-60"
                  />
                </label>
                <p className="mt-3 text-xs leading-5 text-[#716d65]">Вставляйте строки без HTML-кода. Можно добавить Google AdSense и другие рекламные сети, по одной записи на строку.</p>
              </section>

              <section className="rounded-[30px] border border-black/8 bg-white p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">ADSENSE</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">Publisher ID</h2>
                <label className="mt-6 grid gap-2 text-sm font-semibold">
                  <span>Идентификатор издателя</span>
                  <input
                    value={settings.adsense_publisher_id}
                    onChange={(event) => setSettings((current) => ({ ...current, adsense_publisher_id: event.target.value }))}
                    disabled={!canEdit}
                    placeholder="ca-pub-1234567890123456"
                    className="rounded-2xl border border-black/10 bg-[#fffdfa] px-4 py-3 font-normal outline-none focus:border-[#9a742e] disabled:opacity-60"
                  />
                </label>
                <p className="mt-3 text-xs leading-5 text-[#716d65]">На этом этапе ID только сохраняется. Подключение рекламного скрипта и блоков будет отдельным безопасным модулем.</p>
              </section>

              <div className="sticky bottom-5 flex justify-end rounded-[24px] border border-black/8 bg-white/95 p-4 shadow-[0_18px_60px_rgba(20,20,20,0.12)] backdrop-blur">
                <button disabled={saving || !canEdit} className="rounded-full bg-[#17191f] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">
                  {saving ? "Сохранение…" : "Сохранить настройки"}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </>
  );
}
