"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import type {
  PublicSiteContent,
  PublicSiteEditorData,
  PublicSiteSection,
} from "@/lib/public-site/types";
import { supabase } from "@/lib/supabase";

type Workspace = {
  business_id: string;
  slug: string;
  name: string;
  is_default: boolean;
  role: string;
};

type CanvasSection = "hero" | PublicSiteSection;
type PreviewDevice = "desktop" | "mobile";

const inputClass =
  "mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a742e]";
const defaultSectionOrder: PublicSiteSection[] = [
  "services",
  "portfolio",
  "about",
  "contact",
];
const sectionVisibilityKey: Record<
  PublicSiteSection,
  "show_services" | "show_portfolio" | "show_about" | "show_contact"
> = {
  services: "show_services",
  portfolio: "show_portfolio",
  about: "show_about",
  contact: "show_contact",
};
const sectionLabelKey = {
  services: "Services",
  portfolio: "Portfolio",
  about: "About",
  contact: "Contact",
} as const;

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
  const [selectedSection, setSelectedSection] =
    useState<CanvasSection>("hero");
  const [previewDevice, setPreviewDevice] =
    useState<PreviewDevice>("desktop");

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

  function moveSection(section: PublicSiteSection, direction: -1 | 1) {
    const order = [...(draft?.section_order ?? defaultSectionOrder)];
    const currentIndex = order.indexOf(section);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= order.length) return;
    [order[currentIndex], order[nextIndex]] = [order[nextIndex], order[currentIndex]];
    update("section_order", order);
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
              {t("Site Builder 1.0")}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
              {t("Public site")}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6f6c65]">
              {t("Edit the content, control visible blocks and arrange them in the order visitors should see.")}
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

        <VisualBuilder
          businessName={editor.business.name}
          canConfigure={canConfigure}
          draft={draft}
          previewDevice={previewDevice}
          selectedSection={selectedSection}
          saving={saving}
          t={t}
          onDeviceChange={setPreviewDevice}
          onMove={moveSection}
          onPublish={() => void saveDraft({ publish: true })}
          onSave={() => void saveDraft()}
          onSectionChange={setSelectedSection}
          onUpdate={update}
        />

        <details className="group mt-6 rounded-[24px] border border-black/8 bg-white/70">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-sm font-semibold">
            <span>{t("Advanced site settings")}</span>
            <span className="text-lg transition group-open:rotate-45" aria-hidden="true">+</span>
          </summary>
        <div className="grid gap-6 border-t border-black/8 p-5 xl:grid-cols-[minmax(0,1fr)_420px] sm:p-7">
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
                <div className="sm:col-span-2 grid gap-2">
                  {(draft.section_order ?? defaultSectionOrder).map((section, index, order) => (
                    <SectionOrderRow
                      key={section}
                      label={t(sectionLabelKey[section])}
                      checked={draft[sectionVisibilityKey[section]]}
                      disabled={!canConfigure}
                      first={index === 0}
                      last={index === order.length - 1}
                      onToggle={(value) => update(sectionVisibilityKey[section], value)}
                      onUp={() => moveSection(section, -1)}
                      onDown={() => moveSection(section, 1)}
                    />
                  ))}
                </div>
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
        </details>
      </div>
    </main>
  );
}

function VisualBuilder({
  businessName,
  canConfigure,
  draft,
  previewDevice,
  selectedSection,
  saving,
  t,
  onDeviceChange,
  onMove,
  onPublish,
  onSave,
  onSectionChange,
  onUpdate,
}: {
  businessName: string;
  canConfigure: boolean;
  draft: PublicSiteContent;
  previewDevice: PreviewDevice;
  selectedSection: CanvasSection;
  saving: boolean;
  t: ReturnType<typeof useAdminI18n>["t"];
  onDeviceChange: (device: PreviewDevice) => void;
  onMove: (section: PublicSiteSection, direction: -1 | 1) => void;
  onPublish: () => void;
  onSave: () => void;
  onSectionChange: (section: CanvasSection) => void;
  onUpdate: <Key extends keyof PublicSiteContent>(
    key: Key,
    value: PublicSiteContent[Key],
  ) => void;
}) {
  const [blocksOpen, setBlocksOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const sectionOrder = draft.section_order ?? defaultSectionOrder;
  const selectedIndex =
    selectedSection === "hero" ? -1 : sectionOrder.indexOf(selectedSection);
  const visibilityKey =
    selectedSection === "hero" ? null : sectionVisibilityKey[selectedSection];

  function addBlock(section: PublicSiteSection) {
    onUpdate(sectionVisibilityKey[section], true);
    onSectionChange(section);
    setSettingsOpen(true);
    setLibraryOpen(false);
  }

  return (
    <section className="relative mt-8 overflow-hidden rounded-[28px] border border-black/10 bg-[#e9e8e4] shadow-[0_26px_90px_rgba(25,27,32,0.12)]">
      <div className="flex flex-col gap-3 border-b border-black/10 bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <span className="mr-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b877e]">
            {t("Page")}
          </span>
          <button type="button" className="rounded-xl border border-black/10 bg-[#f6f5f2] px-4 py-2 text-xs font-semibold">
            {t("Home")}
          </button>
          <button type="button" disabled className="rounded-xl border border-dashed border-black/15 px-4 py-2 text-xs font-semibold text-black/35">
            {t("+ Add page")}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-[#efeee9] p-1">
            <button
              type="button"
              aria-pressed={previewDevice === "desktop"}
              onClick={() => onDeviceChange("desktop")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${previewDevice === "desktop" ? "bg-white shadow-sm" : "text-black/45"}`}
            >
              {t("Computer")}
            </button>
            <button
              type="button"
              aria-pressed={previewDevice === "mobile"}
              onClick={() => onDeviceChange("mobile")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${previewDevice === "mobile" ? "bg-white shadow-sm" : "text-black/45"}`}
            >
              {t("Phone")}
            </button>
          </div>
          <button type="button" onClick={onSave} disabled={saving || !canConfigure} className="rounded-xl border border-black/10 px-4 py-2 text-xs font-semibold disabled:opacity-40">
            {saving ? t("Saving…") : t("Save")}
          </button>
          <button type="button" onClick={onPublish} disabled={saving || !canConfigure} className="rounded-xl bg-[#17191f] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">
            {saving ? t("Publishing…") : t("Publish")}
          </button>
        </div>
      </div>

      <div
        className={`grid min-h-[720px] ${
          blocksOpen && settingsOpen
            ? "lg:grid-cols-[220px_minmax(0,1fr)_300px]"
            : blocksOpen
              ? "lg:grid-cols-[220px_minmax(0,1fr)]"
              : settingsOpen
                ? "lg:grid-cols-[minmax(0,1fr)_300px]"
                : "lg:grid-cols-[minmax(0,1fr)]"
        }`}
      >
        {blocksOpen ? (
        <aside className="border-b border-black/10 bg-[#f7f6f3] p-4 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-2">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b877e]">
              {t("Page blocks")}
            </p>
            <button
              type="button"
              onClick={() => setBlocksOpen(false)}
              className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-[10px] font-semibold text-[#716d65] transition hover:bg-[#eeece6]"
              aria-label={t("Collapse blocks")}
              title={t("Collapse blocks")}
            >
              ← {t("Collapse")}
            </button>
          </div>
          <div className="mt-3 grid gap-2">
            <BlockButton active={selectedSection === "hero"} label={t("Hero")} visible onClick={() => onSectionChange("hero")} />
            {sectionOrder.map((section) => (
              <BlockButton
                key={section}
                active={selectedSection === section}
                label={t(sectionLabelKey[section])}
                visible={draft[sectionVisibilityKey[section]]}
                onClick={() => onSectionChange(section)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            disabled={!canConfigure}
            className="mt-4 w-full rounded-xl border border-dashed border-[#9a742e]/45 bg-[#fbf7ee] px-3 py-3 text-xs font-semibold text-[#725924] transition hover:border-[#9a742e] disabled:opacity-40"
          >
            {t("+ Add block")}
          </button>
          <p className="mt-3 px-2 text-[11px] leading-5 text-[#8b877e]">
            {t("Choose a ready block from the library.")}
          </p>
        </aside>
        ) : (
          <button
            type="button"
            onClick={() => setBlocksOpen(true)}
            className="absolute left-4 top-[76px] z-20 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold shadow-lg transition hover:bg-[#f6f4ef]"
            title={t("Open blocks")}
          >
            {t("Blocks")} →
          </button>
        )}

        <div className="overflow-auto bg-[#dcdcd8] p-4 sm:p-7">
          <div className={`mx-auto overflow-hidden bg-[#f3f0e9] text-[#191b20] shadow-[0_28px_80px_rgba(25,27,32,0.18)] transition-all ${previewDevice === "mobile" ? "max-w-[390px] rounded-[28px]" : "max-w-[920px] rounded-lg"}`}>
            <CanvasBlock active={selectedSection === "hero"} onClick={() => onSectionChange("hero")}>
              <div className="border-b border-black/10 px-6 py-5 text-xs font-semibold uppercase tracking-[0.16em]">{businessName}</div>
              <div className="relative overflow-hidden px-8 py-16 sm:px-12 sm:py-24">
                <div className="absolute -right-16 top-4 h-64 w-64 rounded-full border border-[#9a742e]/20" />
                <p className="relative text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9a742e]">{draft.hero_eyebrow}</p>
                <h2 className="relative mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">{draft.hero_title}</h2>
                <p className="relative mt-6 max-w-xl text-sm leading-7 text-[#656159]">{draft.hero_text}</p>
                <span className="relative mt-7 inline-flex rounded-full bg-[#17191f] px-6 py-3 text-xs font-semibold text-white">{draft.booking_label}</span>
              </div>
            </CanvasBlock>
            {sectionOrder.map((section, index) => {
              const visible = draft[sectionVisibilityKey[section]];
              return (
                <CanvasBlock key={section} active={selectedSection === section} muted={!visible} onClick={() => onSectionChange(section)}>
                  <div className={`${section === "services" ? "bg-[#191b20] text-white" : index % 2 ? "bg-white/70" : "bg-[#f3f0e9]"} px-8 py-12 sm:px-12`}>
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${section === "services" ? "text-[#d8b36a]" : "text-[#9a742e]"}`}>
                      {draft[`${section}_label` as keyof PublicSiteContent] as string}
                    </p>
                    <h3 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">
                      {draft[`${section}_title` as keyof PublicSiteContent] as string}
                    </h3>
                    <div className="mt-7 grid grid-cols-2 gap-3">
                      <span className="h-20 rounded-2xl border border-current/10" />
                      <span className="h-20 rounded-2xl border border-current/10" />
                    </div>
                  </div>
                </CanvasBlock>
              );
            })}
          </div>
        </div>

        {settingsOpen ? (
        <aside className="relative border-t border-black/10 bg-white p-5 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{t("Block settings")}</p>
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="rounded-lg border border-black/10 px-2 py-1.5 text-[10px] font-semibold text-[#716d65] transition hover:bg-[#f6f4ef]"
              aria-label={t("Collapse settings")}
              title={t("Collapse settings")}
            >
              {t("Collapse")} →
            </button>
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">
            {selectedSection === "hero" ? t("Hero") : t(sectionLabelKey[selectedSection])}
          </h2>
          <div className="mt-6 grid gap-5">
            {selectedSection === "hero" ? (
              <>
                <CompactField label={t("Eyebrow")} value={draft.hero_eyebrow} disabled={!canConfigure} onChange={(value) => onUpdate("hero_eyebrow", value)} />
                <CompactField label={t("Main title")} value={draft.hero_title} disabled={!canConfigure} onChange={(value) => onUpdate("hero_title", value)} multiline />
                <CompactField label={t("Introduction")} value={draft.hero_text} disabled={!canConfigure} onChange={(value) => onUpdate("hero_text", value)} multiline />
                <CompactField label={t("Button")} value={draft.booking_label} disabled={!canConfigure} onChange={(value) => onUpdate("booking_label", value)} />
              </>
            ) : (
              <>
                <Toggle label={t("Show block")} checked={draft[visibilityKey!]} disabled={!canConfigure} onChange={(value) => onUpdate(visibilityKey!, value)} />
                <CompactField
                  label={t("Heading")}
                  value={draft[`${selectedSection}_title` as keyof PublicSiteContent] as string}
                  disabled={!canConfigure}
                  onChange={(value) => onUpdate(`${selectedSection}_title` as keyof PublicSiteContent, value)}
                  multiline
                />
                {selectedSection === "about" ? (
                  <CompactField label={t("Text")} value={draft.about_text} disabled={!canConfigure} onChange={(value) => onUpdate("about_text", value)} multiline />
                ) : null}
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" disabled={!canConfigure || selectedIndex <= 0} onClick={() => onMove(selectedSection, -1)} className="rounded-xl border border-black/10 px-3 py-3 text-xs font-semibold disabled:opacity-30">↑ {t("Up")}</button>
                  <button type="button" disabled={!canConfigure || selectedIndex === sectionOrder.length - 1} onClick={() => onMove(selectedSection, 1)} className="rounded-xl border border-black/10 px-3 py-3 text-xs font-semibold disabled:opacity-30">↓ {t("Down")}</button>
                </div>
              </>
            )}
          </div>
          <div className="mt-8 rounded-2xl bg-[#f6f4ef] p-4 text-xs leading-6 text-[#716d65]">
            {t("Select any block in the page preview to edit it here.")}
          </div>
        </aside>
        ) : (
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="absolute right-4 top-[76px] z-20 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold shadow-lg transition hover:bg-[#f6f4ef]"
            title={t("Open settings")}
          >
            ← {t("Settings")}
          </button>
        )}
      </div>

      {libraryOpen ? (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-[#17191f]/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label={t("Block library")}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setLibraryOpen(false);
          }}
        >
          <div className="max-h-[85%] w-full max-w-3xl overflow-auto rounded-[28px] bg-[#f8f7f3] p-5 shadow-[0_35px_120px_rgba(0,0,0,0.35)] sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a742e]">
                  {t("Ready-made blocks")}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                  {t("Block library")}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#716d65]">
                  {t("Add a block and then edit its content in the settings panel.")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLibraryOpen(false)}
                className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold"
                aria-label={t("Close")}
              >
                ×
              </button>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {defaultSectionOrder.map((section) => {
                const visible = draft[sectionVisibilityKey[section]];
                return (
                  <button
                    key={section}
                    type="button"
                    onClick={() => addBlock(section)}
                    className="group rounded-2xl border border-black/8 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[#9a742e]/40 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-lg font-semibold">{t(sectionLabelKey[section])}</span>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${visible ? "bg-emerald-50 text-emerald-700" : "bg-[#f4ead6] text-[#725924]"}`}>
                        {visible ? t("On page") : t("Add")}
                      </span>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-[#716d65]">
                      {t(`${sectionLabelKey[section]} block description`)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function BlockButton({ active, label, visible, onClick }: { active: boolean; label: string; visible: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${active ? "border-[#9a742e]/40 bg-[#f4ead6] text-[#6d531f]" : "border-black/8 bg-white hover:border-black/20"}`}>
      <span className="text-black/25" aria-hidden="true">⋮⋮</span>
      <span className="flex-1">{label}</span>
      <span className={`h-2 w-2 rounded-full ${visible ? "bg-emerald-500" : "bg-black/20"}`} />
    </button>
  );
}

function CanvasBlock({ active, muted, onClick, children }: { active: boolean; muted?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`relative block w-full text-left outline-none transition ${muted ? "opacity-35 grayscale" : ""} ${active ? "ring-2 ring-inset ring-[#b58a36]" : "hover:ring-2 hover:ring-inset hover:ring-black/15"}`}>
      {active ? <span className="absolute right-3 top-3 z-10 rounded-full bg-[#b58a36] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">Edit</span> : null}
      {children}
    </button>
  );
}

function CompactField({ label, value, disabled, multiline, onChange }: { label: string; value: string; disabled: boolean; multiline?: boolean; onChange: (value: string) => void }) {
  const className = "mt-2 w-full rounded-xl border border-black/10 bg-[#faf9f6] px-3 py-3 text-sm leading-6 outline-none focus:border-[#9a742e]";
  return (
    <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">
      {label}
      {multiline ? (
        <textarea rows={value.length > 80 ? 5 : 3} className={className} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className={className} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
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

function SectionOrderRow({
  label,
  checked,
  disabled,
  first,
  last,
  onToggle,
  onUp,
  onDown,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  first: boolean;
  last: boolean;
  onToggle: (value: boolean) => void;
  onUp: () => void;
  onDown: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/8 bg-white px-4 py-3">
      <span className="text-black/30" aria-hidden="true">⋮⋮</span>
      <span className="min-w-0 flex-1 text-sm font-semibold">{label}</span>
      <button
        type="button"
        aria-label={`${label}: move up`}
        disabled={disabled || first}
        onClick={onUp}
        className="grid h-8 w-8 place-items-center rounded-full border border-black/10 disabled:opacity-25"
      >
        ↑
      </button>
      <button
        type="button"
        aria-label={`${label}: move down`}
        disabled={disabled || last}
        onClick={onDown}
        className="grid h-8 w-8 place-items-center rounded-full border border-black/10 disabled:opacity-25"
      >
        ↓
      </button>
      <label className="inline-flex items-center gap-2 text-xs font-semibold">
        <span>{checked ? "On" : "Off"}</span>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onToggle(event.target.checked)}
        />
      </label>
    </div>
  );
}
