"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import type {
  PublicSiteContent,
  PublicSiteEditorData,
} from "@/lib/public-site/types";
import { supabase } from "@/lib/supabase";

type Workspace = {
  business_id: string;
  slug: string;
  name: string;
  is_default: boolean;
  role: string;
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a742e]";

function contentFromLocale(
  editor: PublicSiteEditorData,
  locale: string,
) {
  return (
    editor.locales.find((item) => item.locale === locale)?.draft_content ?? null
  );
}

function publicHref(editor: PublicSiteEditorData, locale: string) {
  return locale === editor.site.primary_locale
    ? `/site/${editor.business.slug}`
    : `/site/${editor.business.slug}/${locale}`;
}

export default function AdminSitePage() {
  const { t } = useAdminI18n();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [editor, setEditor] = useState<PublicSiteEditorData | null>(null);
  const [selectedLocale, setSelectedLocale] = useState("");
  const [draft, setDraft] = useState<PublicSiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canConfigure = workspace
    ? ["owner", "admin", "manager"].includes(workspace.role)
    : false;

  const loadEditor = useCallback(async (preferredLocale?: string) => {
    setLoading(true);
    setError("");

    const { data: workspaceData, error: workspaceError } = await supabase.rpc(
      "list_my_businesses",
    );
    const workspaces = (workspaceData ?? []) as Workspace[];
    const current =
      workspaces.find((item) => item.is_default) ?? workspaces[0] ?? null;

    if (workspaceError || !current) {
      setError(workspaceError?.message || t("No active workspace was found."));
      setLoading(false);
      return;
    }

    const { data, error: editorError } = await supabase.rpc(
      "get_public_site_editor",
      { p_business_id: current.business_id },
    );

    if (editorError || !data || typeof data !== "object") {
      setError(editorError?.message || t("Public site settings could not be loaded."));
      setLoading(false);
      return;
    }

    const nextEditor = data as unknown as PublicSiteEditorData;
    const locale =
      preferredLocale &&
      nextEditor.locales.some((item) => item.locale === preferredLocale)
        ? preferredLocale
        : nextEditor.site.primary_locale;

    setWorkspace(current);
    setEditor(nextEditor);
    setSelectedLocale(locale);
    setDraft(contentFromLocale(nextEditor, locale));
    setLoading(false);
  }, [t]);

  useEffect(() => {
    void loadEditor();
  }, [loadEditor]);

  const selectedRecord = useMemo(
    () =>
      editor?.locales.find((item) => item.locale === selectedLocale) ?? null,
    [editor, selectedLocale],
  );

  function chooseLocale(locale: string) {
    if (!editor) return;
    setSelectedLocale(locale);
    setDraft(contentFromLocale(editor, locale));
    setMessage("");
    setError("");
  }

  function update<Key extends keyof PublicSiteContent>(
    key: Key,
    value: PublicSiteContent[Key],
  ) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
    setMessage("");
  }

  async function saveDraft(options?: { publish?: boolean }) {
    if (!workspace || !editor || !draft || !canConfigure) return false;
    setSaving(true);
    setError("");
    setMessage("");

    const { error: saveError } = await supabase.rpc("save_public_site_draft", {
      p_business_id: workspace.business_id,
      p_locale: selectedLocale,
      p_content: draft,
      p_make_primary: selectedLocale === editor.site.primary_locale,
    });

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return false;
    }

    if (options?.publish) {
      const { error: publishError } = await supabase.rpc(
        "publish_public_site",
        {
          p_business_id: workspace.business_id,
          p_locale: selectedLocale,
        },
      );

      if (publishError) {
        setError(publishError.message);
        setSaving(false);
        return false;
      }
      setMessage(t("Site published."));
    } else {
      setMessage(t("Draft saved."));
    }

    await loadEditor(selectedLocale);
    setSaving(false);
    return true;
  }

  async function addLocale() {
    if (!workspace || !editor || !canConfigure) return;
    const rawLocale = window.prompt(t("Language code"), "en");
    if (!rawLocale) return;
    const locale = rawLocale.trim().toLowerCase();
    if (!/^[a-z]{2,3}(-[a-z]{2})?$/.test(locale)) {
      setError(t("Use a language code such as en, uk, pl or de."));
      return;
    }
    if (editor.locales.some((item) => item.locale === locale)) {
      chooseLocale(locale);
      return;
    }

    setSaving(true);
    setError("");
    const { error: saveError } = await supabase.rpc(
      "save_public_site_draft",
      {
        p_business_id: workspace.business_id,
        p_locale: locale,
        p_content: {},
        p_make_primary: false,
      },
    );
    if (saveError) setError(saveError.message);
    else {
      await loadEditor(locale);
      setMessage(t("Language draft added."));
    }
    setSaving(false);
  }

  async function makePrimary() {
    if (!workspace || !draft || !canConfigure) return;
    setSaving(true);
    setError("");
    const { error: saveError } = await supabase.rpc(
      "save_public_site_draft",
      {
        p_business_id: workspace.business_id,
        p_locale: selectedLocale,
        p_content: draft,
        p_make_primary: true,
      },
    );
    if (saveError) setError(saveError.message);
    else {
      await loadEditor(selectedLocale);
      setMessage(t("Primary language changed."));
    }
    setSaving(false);
  }

  async function unpublish() {
    if (!workspace || !canConfigure) return;
    if (!window.confirm(t("Hide the public site from visitors?"))) return;
    setSaving(true);
    setError("");
    const { error: unpublishError } = await supabase.rpc(
      "unpublish_public_site",
      { p_business_id: workspace.business_id },
    );
    if (unpublishError) setError(unpublishError.message);
    else {
      await loadEditor(selectedLocale);
      setMessage(t("Site unpublished."));
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen px-4 pb-16 pt-24 sm:px-6 lg:px-10">
        <AdminHeader />
        <p className="mx-auto mt-10 max-w-7xl text-sm text-[#716d65]">
          {t("Loading public site…")}
        </p>
      </main>
    );
  }

  if (!workspace || !editor || !draft) {
    return (
      <main className="min-h-screen px-4 pb-16 pt-24 sm:px-6 lg:px-10">
        <AdminHeader />
        <div className="mx-auto mt-10 max-w-7xl rounded-[28px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || t("Public site settings could not be loaded.")}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pb-16 pt-24 sm:px-6 lg:px-10">
      <AdminHeader />
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#9a742e]">
              {t("Public Site Foundation 1.0")}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
              {t("Public site")}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6f6c65]">
              {t("Prepare each language as a draft, then publish only the version visitors should see. Services, portfolio and contacts come from the same workspace.")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {editor.site.is_published ? (
              <Link
                href={publicHref(editor, selectedLocale)}
                target="_blank"
                className="rounded-full border border-black/10 bg-white px-5 py-3 text-xs font-semibold"
              >
                {t("Open published site")}
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => void saveDraft()}
              disabled={saving || !canConfigure}
              className="rounded-full border border-black/10 bg-white px-5 py-3 text-xs font-semibold disabled:opacity-40"
            >
              {saving ? t("Saving…") : t("Save draft")}
            </button>
            <button
              type="button"
              onClick={() => void saveDraft({ publish: true })}
              disabled={saving || !canConfigure}
              className="rounded-full bg-[#17191f] px-5 py-3 text-xs font-semibold text-white disabled:opacity-40"
            >
              {saving ? t("Publishing…") : t("Publish this language")}
            </button>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <StatusCard
            label={t("Site status")}
            value={editor.site.is_published ? t("Published") : t("Draft only")}
          />
          <StatusCard
            label={t("Public address")}
            value={`/site/${editor.business.slug}`}
          />
          <StatusCard
            label={t("Published languages")}
            value={String(editor.locales.filter((item) => item.published_content).length)}
          />
        </section>

        {(message || error) ? (
          <div className={`mt-6 rounded-2xl border px-5 py-4 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-800"}`}>
            {error || message}
          </div>
        ) : null}

        {!canConfigure ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            {t("Only an owner, administrator or manager can edit the public site.")}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-[30px] border border-black/8 bg-white/80 p-5 shadow-[0_22px_75px_rgba(30,30,30,0.06)] sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              {editor.locales.map((locale) => (
                <button
                  key={locale.locale}
                  type="button"
                  onClick={() => chooseLocale(locale.locale)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    locale.locale === selectedLocale
                      ? "bg-[#17191f] text-white"
                      : "border border-black/10 bg-white"
                  }`}
                >
                  {locale.locale.toUpperCase()}
                  {locale.locale === editor.site.primary_locale ? " · ★" : ""}
                  {locale.published_content ? " · ✓" : ""}
                </button>
              ))}
              <button
                type="button"
                onClick={() => void addLocale()}
                disabled={saving || !canConfigure}
                className="rounded-full border border-dashed border-black/20 px-4 py-2 text-xs font-semibold disabled:opacity-40"
              >
                {t("+ Language")}
              </button>
              {selectedLocale !== editor.site.primary_locale ? (
                <button
                  type="button"
                  onClick={() => void makePrimary()}
                  disabled={saving || !canConfigure}
                  className="rounded-full border border-[#9a742e]/30 bg-[#f8f0df] px-4 py-2 text-xs font-semibold text-[#725924] disabled:opacity-40"
                >
                  {t("Make primary")}
                </button>
              ) : null}
            </div>

            <div className="mt-8 grid gap-7">
              <EditorGroup title={t("Hero")}>
                <Field label={t("Eyebrow")}>
                  <input className={inputClass} value={draft.hero_eyebrow} disabled={!canConfigure} onChange={(event) => update("hero_eyebrow", event.target.value)} />
                </Field>
                <Field label={t("Main title")} wide>
                  <input className={inputClass} value={draft.hero_title} disabled={!canConfigure} onChange={(event) => update("hero_title", event.target.value)} />
                </Field>
                <Field label={t("Introduction")} wide>
                  <textarea className={inputClass} rows={4} value={draft.hero_text} disabled={!canConfigure} onChange={(event) => update("hero_text", event.target.value)} />
                </Field>
                <Field label={t("Booking button")}>
                  <input className={inputClass} value={draft.booking_label} disabled={!canConfigure} onChange={(event) => update("booking_label", event.target.value)} />
                </Field>
              </EditorGroup>

              <EditorGroup title={t("Sections")}>
                <Toggle label={t("Show services")} checked={draft.show_services} disabled={!canConfigure} onChange={(value) => update("show_services", value)} />
                <Toggle label={t("Show portfolio")} checked={draft.show_portfolio} disabled={!canConfigure} onChange={(value) => update("show_portfolio", value)} />
                <Toggle label={t("Show about")} checked={draft.show_about} disabled={!canConfigure} onChange={(value) => update("show_about", value)} />
                <Toggle label={t("Show contacts")} checked={draft.show_contact} disabled={!canConfigure} onChange={(value) => update("show_contact", value)} />
                <Field label={t("Services heading")}>
                  <input className={inputClass} value={draft.services_title} disabled={!canConfigure} onChange={(event) => update("services_title", event.target.value)} />
                </Field>
                <Field label={t("Portfolio heading")}>
                  <input className={inputClass} value={draft.portfolio_title} disabled={!canConfigure} onChange={(event) => update("portfolio_title", event.target.value)} />
                </Field>
                <Field label={t("About heading")}>
                  <input className={inputClass} value={draft.about_title} disabled={!canConfigure} onChange={(event) => update("about_title", event.target.value)} />
                </Field>
                <Field label={t("Contact heading")}>
                  <input className={inputClass} value={draft.contact_title} disabled={!canConfigure} onChange={(event) => update("contact_title", event.target.value)} />
                </Field>
                <Field label={t("About text")} wide>
                  <textarea className={inputClass} rows={7} value={draft.about_text} disabled={!canConfigure} onChange={(event) => update("about_text", event.target.value)} />
                </Field>
              </EditorGroup>

              <EditorGroup title={t("Navigation labels")}>
                <Field label={t("Services")}>
                  <input className={inputClass} value={draft.services_label} disabled={!canConfigure} onChange={(event) => update("services_label", event.target.value)} />
                </Field>
                <Field label={t("Portfolio")}>
                  <input className={inputClass} value={draft.portfolio_label} disabled={!canConfigure} onChange={(event) => update("portfolio_label", event.target.value)} />
                </Field>
                <Field label={t("About")}>
                  <input className={inputClass} value={draft.about_label} disabled={!canConfigure} onChange={(event) => update("about_label", event.target.value)} />
                </Field>
                <Field label={t("Contact")}>
                  <input className={inputClass} value={draft.contact_label} disabled={!canConfigure} onChange={(event) => update("contact_label", event.target.value)} />
                </Field>
              </EditorGroup>

              <EditorGroup title={t("SEO")}>
                <Field label={t("SEO title")}>
                  <input maxLength={70} className={inputClass} value={draft.seo_title} disabled={!canConfigure} onChange={(event) => update("seo_title", event.target.value)} />
                </Field>
                <Field label={t("SEO description")} wide>
                  <textarea maxLength={170} rows={4} className={inputClass} value={draft.seo_description} disabled={!canConfigure} onChange={(event) => update("seo_description", event.target.value)} />
                </Field>
              </EditorGroup>
            </div>

            {editor.site.is_published ? (
              <div className="mt-8 border-t border-black/8 pt-6">
                <button type="button" disabled={saving || !canConfigure} onClick={() => void unpublish()} className="text-xs font-semibold text-red-600 disabled:opacity-40">
                  {t("Unpublish site")}
                </button>
              </div>
            ) : null}
          </section>

          <aside className="xl:sticky xl:top-28 xl:self-start">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">
              {t("Draft preview")}
            </p>
            <div className="overflow-hidden rounded-[30px] border border-black/10 bg-[#f3f0e9] shadow-[0_30px_90px_rgba(30,30,30,0.12)]">
              <div className="border-b border-black/8 px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em]">
                {editor.business.name}
              </div>
              <div className="relative overflow-hidden px-6 py-14">
                <div className="absolute -right-12 top-4 h-48 w-48 rounded-full border border-[#9a742e]/20" />
                <p className="relative text-[9px] font-semibold uppercase tracking-[0.22em] text-[#9a742e]">
                  {draft.hero_eyebrow}
                </p>
                <h2 className="relative mt-4 text-4xl font-semibold tracking-[-0.06em]">
                  {draft.hero_title}
                </h2>
                <p className="relative mt-5 text-xs leading-6 text-[#6f6c65]">
                  {draft.hero_text}
                </p>
                <span className="relative mt-6 inline-flex rounded-full bg-[#17191f] px-5 py-3 text-[10px] font-semibold text-white">
                  {draft.booking_label}
                </span>
              </div>
              {draft.show_services ? (
                <div className="bg-[#17191f] px-6 py-8 text-white">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-[#d8b36a]">
                    {draft.services_label}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                    {draft.services_title}
                  </h3>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <span className="h-20 rounded-xl border border-white/10" />
                    <span className="h-20 rounded-xl border border-white/10" />
                  </div>
                </div>
              ) : null}
            </div>
            <p className="mt-4 text-xs leading-5 text-[#716d65]">
              {selectedRecord?.published_content
                ? t("Visitors still see the last published version until you publish this draft.")
                : t("This language is not visible to visitors until it is published.")}
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-black/8 bg-white/80 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-[#8b877e]">{label}</p>
      <p className="mt-2 break-all text-lg font-semibold">{value}</p>
    </div>
  );
}

function EditorGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-black/8 bg-[#f8f6f1] p-5">
      <h2 className="text-lg font-semibold tracking-[-0.03em]">{title}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6c65] ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm font-semibold">
      {label}
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
