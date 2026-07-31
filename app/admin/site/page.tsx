"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import type {
  PublicSiteContent,
  PublicSiteColumnCard,
  PublicSiteCustomBlock,
  PublicSiteCustomBlockKind,
  PublicSiteEditorData,
  PublicSitePage,
  PublicSiteReview,
  PublicSiteSection,
  PublicSiteSocialLink,
} from "@/lib/public-site/types";
import { publicSiteReviews } from "@/lib/public-site/content";
import {
  customBlockLayoutId,
  PUBLIC_SITE_SECTION_ORDER,
  resolvePublicSiteLayoutOrder,
  sectionLayoutId,
  sectionsFromLayoutOrder,
} from "@/lib/public-site/layout";
import {
  applySiteTemplate,
  GLOSS_PORTFOLIO_PAGE,
  SITE_TEMPLATES,
  type SiteTemplateProject,
  type SiteTemplateService,
  type SiteTemplate,
} from "@/lib/public-site/templates";
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
type MediaItem = {
  id: string;
  image_url: string;
  alt_text: string | null;
  original_filename: string | null;
  mime_type: string | null;
};
type ImageTarget =
  | {
      kind: "content";
      key:
        | "hero_image_url"
        | "membership_image_url"
        | "gift_image_url"
        | "seo_image_url"
        | "favicon_url";
      label: string;
    }
  | {
      kind: "list";
      key: "service_image_urls" | "team_image_urls";
      index: number;
      label: string;
    }
  | {
      kind: "block";
      blockId: string;
      key: "video_poster_url" | "media_url" | "video_url";
      label: string;
    }
  | {
      kind: "block-list";
      blockId: string;
      key: "media_urls";
      index: number;
      label: string;
    }
  | {
      kind: "block-card";
      blockId: string;
      cardIndex: number;
      key: "media_url" | "video_url" | "video_poster_url";
      label: string;
    }
  | {
      kind: "page";
      pageId: string;
      key: "seo_image_url";
      label: string;
    };

const inputClass =
  "mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a742e]";

function isVideoProviderUrl(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.includes("youtube.com/") ||
    normalized.includes("youtu.be/") ||
    normalized.includes("vimeo.com/")
  );
}

function isDirectVideoUrl(value: string) {
  const normalized = value.trim().toLowerCase().split(/[?#]/)[0];
  return [".mp4", ".webm", ".mov", ".m4v", ".ogv"].some((extension) =>
    normalized.endsWith(extension),
  );
}

function isInvalidImageUrl(value: string) {
  return Boolean(value.trim()) && (isVideoProviderUrl(value) || isDirectVideoUrl(value));
}

function resolveEditorVideoPreview(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const id =
        parsed.searchParams.get("v") ||
        (parts[0] === "shorts" || parts[0] === "live" || parts[0] === "embed"
          ? parts[1]
          : "");
      return id ? { kind: "embed" as const, url: `https://www.youtube-nocookie.com/embed/${id}` } : null;
    }

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? { kind: "embed" as const, url: `https://www.youtube-nocookie.com/embed/${id}` } : null;
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = parsed.pathname.split("/").filter(Boolean).findLast((part) => /^\d+$/.test(part));
      return id ? { kind: "embed" as const, url: `https://player.vimeo.com/video/${id}` } : null;
    }

    if (isDirectVideoUrl(trimmed)) {
      return { kind: "file" as const, url: trimmed };
    }
  } catch {
    return null;
  }

  return null;
}

function findInvalidDraftImage(content: PublicSiteContent) {
  const directImages: Array<[string, string | undefined]> = [
    ["главное изображение", content.hero_image_url],
    ["изображение клуба", content.membership_image_url],
    ["изображение сертификата", content.gift_image_url],
    ["SEO-изображение", content.seo_image_url],
    ["favicon", content.favicon_url],
  ];

  for (const [label, value] of directImages) {
    if (value && isInvalidImageUrl(value)) return label;
  }

  const listImages = [
    ...(content.service_image_urls ?? []),
    ...(content.team_image_urls ?? []),
  ];
  if (listImages.some(isInvalidImageUrl)) return "изображение в списке";

  for (const block of content.custom_blocks ?? []) {
    if (block.media_url && isInvalidImageUrl(block.media_url)) return `изображение блока «${block.title || block.id}»`;
    if (block.video_poster_url && isInvalidImageUrl(block.video_poster_url)) return `обложка видео «${block.title || block.id}»`;
    if ((block.media_urls ?? []).some(isInvalidImageUrl)) return `фотография блока «${block.title || block.id}»`;
    for (const card of block.cards ?? []) {
      if (card.media_url && isInvalidImageUrl(card.media_url)) return `изображение карточки «${card.title || block.title || block.id}»`;
      if (card.video_poster_url && isInvalidImageUrl(card.video_poster_url)) return `обложка видео карточки «${card.title || block.title || block.id}»`;
    }
  }

  return null;
}
const glossMasterImages = [
  "/templates/gloss/gloss-master-anna.webp",
  "/templates/gloss/gloss-master-maria.webp",
  "/templates/gloss/gloss-master-elena.webp",
];
const glossServiceImages = [
  "/templates/gloss/gloss-gallery-4.webp",
  "/templates/gloss/gloss-gallery-1.webp",
  "/templates/gloss/gloss-gallery-3.webp",
  "/templates/gloss/gloss-gallery-8.webp",
];
const glossMembershipImage = "/templates/gloss/gloss-club.webp";
const glossGiftImage = "/templates/gloss/gloss-gift.webp";
const defaultSectionOrder: PublicSiteSection[] = [
  ...PUBLIC_SITE_SECTION_ORDER,
];
const sectionVisibilityKey: Record<
  PublicSiteSection,
  | "show_services"
  | "show_portfolio"
  | "show_booking"
  | "show_team"
  | "show_reviews"
  | "show_membership"
  | "show_gift"
  | "show_faq"
  | "show_safety"
  | "show_about"
  | "show_contact"
> = {
  services: "show_services",
  portfolio: "show_portfolio",
  booking: "show_booking",
  team: "show_team",
  reviews: "show_reviews",
  membership: "show_membership",
  gift: "show_gift",
  faq: "show_faq",
  safety: "show_safety",
  about: "show_about",
  contact: "show_contact",
};
const sectionLabelKey = {
  services: "Services",
  portfolio: "Portfolio",
  booking: "Booking calendar",
  team: "Team",
  reviews: "Reviews",
  membership: "Client club",
  gift: "Gift certificates",
  faq: "FAQ",
  safety: "Safety",
  about: "About",
  contact: "Contact",
} as const;

function defaultColumnCards(blockId: string): PublicSiteColumnCard[] {
  return [1, 2, 3].map((number) => ({
    id: `${blockId}-card-${number}`,
    title: `${number === 1 ? "Первый" : number === 2 ? "Второй" : "Третий"} блок`,
    text: "Добавьте короткое описание",
    media_type: "none",
  }));
}

function blockColumnCards(block: PublicSiteCustomBlock): PublicSiteColumnCard[] {
  if (block.cards?.length) return block.cards;
  const cards = previewLines(block.items).map((item, index) => {
    const [title, ...detail] = item.split("·");
    return {
      id: `${block.id}-card-${index + 1}`,
      title: title.trim(),
      text: detail.join("·").trim(),
      media_type: "none" as const,
    };
  });
  return cards.length ? cards : defaultColumnCards(block.id);
}

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

function createCustomBlock(
  kind: PublicSiteCustomBlockKind,
  id = `block-${Date.now()}`,
): PublicSiteCustomBlock {
  const presets: Record<
    PublicSiteCustomBlockKind,
    Pick<
      PublicSiteCustomBlock,
      "eyebrow" | "title" | "text" | "items" | "button_label"
    >
  > = {
    text: {
      eyebrow: "НОВЫЙ БЛОК",
      title: "Расскажите о важном",
      text: "Добавьте сюда собственный текст. Этот блок можно использовать для истории, условий или любого сообщения.",
      items: "",
      button_label: "",
    },
    features: {
      eyebrow: "ПРЕИМУЩЕСТВА",
      title: "Почему выбирают нас",
      text: "",
      items:
        "Первое преимущество · Короткое пояснение\nВторое преимущество · Короткое пояснение\nТретье преимущество · Короткое пояснение",
      button_label: "",
    },
    cta: {
      eyebrow: "СЛЕДУЮЩИЙ ШАГ",
      title: "Готовы записаться?",
      text: "Добавьте короткое приглашение и ведите посетителя на нужную страницу.",
      items: "",
      button_label: "Перейти",
    },
    slider: {
      eyebrow: "ГАЛЕРЕЯ",
      title: "Слайды с фотографиями",
      text: "Изображения меняются автоматически. Интервал можно настроить от двух секунд.",
      items: "",
      button_label: "",
    },
    collage: {
      eyebrow: "КОЛЛАЖ",
      title: "История в нескольких кадрах",
      text: "Соберите выразительный коллаж из нескольких фотографий.",
      items: "",
      button_label: "",
    },
    video: {
      eyebrow: "ВИДЕО",
      title: "Покажите атмосферу",
      text: "Добавьте ссылку на YouTube, Vimeo или прямую ссылку на видеофайл.",
      items: "",
      button_label: "",
    },
    media_text: {
      eyebrow: "О СТУДИИ",
      title: "Текст и изображение рядом",
      text: "Расскажите о студии, услуге или мастере. Медиа можно расположить слева или справа.",
      items: "",
      button_label: "Подробнее",
    },
    columns: {
      eyebrow: "ВАЖНОЕ",
      title: "Два или три смысловых блока",
      text: "Соберите короткий раздел из нескольких аккуратных карточек.",
      items:
        "Первый блок · Добавьте короткое описание\nВторой блок · Добавьте короткое описание\nТретий блок · Добавьте короткое описание",
      button_label: "",
    },
  };
  const preset = presets[kind];

  return {
    id,
    kind,
    eyebrow: preset.eyebrow,
    title: preset.title,
    text: preset.text,
    items: preset.items,
    button_label: preset.button_label,
    button_url:
      kind === "cta" || kind === "media_text" ? "#booking" : "",
    tone: kind === "cta" ? "accent" : "light",
    is_visible: true,
    media_urls:
      kind === "slider" || kind === "collage"
        ? [
            "/templates/gloss/gloss-gallery-1.webp",
            "/templates/gloss/gloss-gallery-2.webp",
            ...(kind === "collage"
              ? ["/templates/gloss/gloss-gallery-3.webp"]
              : []),
          ]
        : undefined,
    slide_interval_seconds: kind === "slider" ? 4 : undefined,
    video_url: kind === "video" ? "" : undefined,
    video_poster_url: kind === "video" ? "" : undefined,
    media_url:
      kind === "media_text"
        ? "/templates/gloss/gloss-gallery-4.webp"
        : undefined,
    media_alt: kind === "media_text" ? "Интерьер и работа студии" : undefined,
    media_type: kind === "media_text" ? "image" : undefined,
    media_position:
      kind === "media_text" ? "right" : kind === "collage" ? "center" : undefined,
    columns_count: kind === "columns" ? 3 : undefined,
    cards: kind === "columns" ? defaultColumnCards(id) : undefined,
    media_size:
      kind === "slider" ||
      kind === "collage" ||
      kind === "video" ||
      kind === "media_text"
        ? "wide"
        : undefined,
    media_aspect:
      kind === "slider" ||
      kind === "collage" ||
      kind === "video" ||
      kind === "media_text"
        ? "landscape"
        : undefined,
    media_fit:
      kind === "slider" ||
      kind === "collage" ||
      kind === "video" ||
      kind === "media_text"
        ? "cover"
        : undefined,
    media_frame:
      kind === "slider" ||
      kind === "collage" ||
      kind === "video" ||
      kind === "media_text"
        ? "line"
        : undefined,
  };
}

function createCustomPage(existingCount: number): PublicSitePage {
  const number = existingCount + 1;
  const slug = `page-${number}`;
  return {
    id: `custom-${Date.now()}`,
    type: "custom",
    slug,
    nav_label: `Страница ${number}`,
    eyebrow: "GLOSS · PAGE",
    title: "Заголовок новой страницы",
    intro:
      "Добавьте описание страницы и соберите её из произвольных блоков.",
    is_visible: true,
    show_in_navigation: true,
    show_booking_cta: true,
    seo_title: "",
    seo_description: "",
    seo_image_url: "",
    seo_no_index: false,
    blocks: [createCustomBlock("text", `${slug}-block-1`)],
  };
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
    const requestedBusinessId =
      typeof window === "undefined"
        ? null
        : new URLSearchParams(window.location.search).get("business");
    const current =
      (requestedBusinessId
        ? workspaces.find((item) => item.business_id === requestedBusinessId)
        : null)
      ?? workspaces.find((item) => item.is_default)
      ?? workspaces[0]
      ?? null;

    if (workspaceError || !current) {
      setError(workspaceError?.message || t("No active workspace was found."));
      setLoading(false);
      return;
    }

    if (requestedBusinessId && !current.is_default) {
      await supabase.rpc("set_default_business", {
        p_business_id: current.business_id,
      });
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

  function updateTeam(items: string, images: string[]) {
    setDraft((current) =>
      current
        ? {
            ...current,
            team_items: items,
            team_image_urls: images,
          }
        : current,
    );
    setMessage("");
  }

  function moveSection(section: PublicSiteSection, direction: -1 | 1) {
    if (!draft) return;
    const order = resolvePublicSiteLayoutOrder(draft);
    const currentIndex = order.indexOf(sectionLayoutId(section));
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= order.length) return;
    [order[currentIndex], order[nextIndex]] = [order[nextIndex], order[currentIndex]];
    setDraft((current) =>
      current
        ? {
            ...current,
            layout_order: order,
            section_order: sectionsFromLayoutOrder(order),
          }
        : current,
    );
    setMessage("");
  }

  async function installTemplate(template: SiteTemplate) {
    if (!draft || !workspace || !canConfigure) return;
    if (!window.confirm(
      t("Apply this template? Current page texts and colors will be replaced, and its editable sample services and portfolio will be added."),
    )) return;
    setDraft(applySiteTemplate(draft, template));
    setSelectedSection("hero");
    setError("");
    setMessage(t("Adding the complete template…"));
    setSaving(true);

    const { error: seedError } = await supabase.rpc(
      "apply_public_site_template_seed",
      {
        p_business_id: workspace.business_id,
        p_template_id: template.id,
      },
    );

    if (seedError) {
      setError(seedError.message);
      setMessage("");
    } else {
      setMessage(t("Complete template added. Review it, then save or publish."));
    }
    setSaving(false);
  }

  async function saveDraft(options?: { publish?: boolean }) {
    if (!workspace || !editor || !draft || !canConfigure) return false;

    const invalidImage = findInvalidDraftImage(draft);
    if (invalidImage) {
      setError(
        `Нельзя сохранить: в поле «${invalidImage}» вставлена ссылка на видео. Перенесите её в поле «Ссылка на видео».`,
      );
      setMessage("");
      return false;
    }

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
          businessId={workspace.business_id}
          businessSlug={editor.business.slug}
          businessName={editor.business.name}
          locales={editor.locales.map((item) => item.locale)}
          primaryLocale={editor.site.primary_locale}
          selectedLocale={selectedLocale}
          canConfigure={canConfigure}
          draft={draft}
          previewDevice={previewDevice}
          selectedSection={selectedSection}
          saving={saving}
          t={t}
          onDeviceChange={setPreviewDevice}
          onAddLocale={() => void addLocale()}
          onLocaleChange={chooseLocale}
          onTemplate={installTemplate}
          onPublish={() => void saveDraft({ publish: true })}
          onSave={() => void saveDraft()}
          onSectionChange={setSelectedSection}
          onUpdate={update}
          onUpdateTeam={updateTeam}
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
                      checked={Boolean(draft[sectionVisibilityKey[section]])}
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
  businessId,
  businessSlug,
  businessName,
  locales,
  primaryLocale,
  selectedLocale,
  canConfigure,
  draft,
  previewDevice,
  selectedSection,
  saving,
  t,
  onDeviceChange,
  onAddLocale,
  onLocaleChange,
  onTemplate,
  onPublish,
  onSave,
  onSectionChange,
  onUpdate,
  onUpdateTeam,
}: {
  businessId: string;
  businessSlug: string;
  businessName: string;
  locales: string[];
  primaryLocale: string;
  selectedLocale: string;
  canConfigure: boolean;
  draft: PublicSiteContent;
  previewDevice: PreviewDevice;
  selectedSection: CanvasSection;
  saving: boolean;
  t: ReturnType<typeof useAdminI18n>["t"];
  onDeviceChange: (device: PreviewDevice) => void;
  onAddLocale: () => void;
  onLocaleChange: (locale: string) => void;
  onTemplate: (template: SiteTemplate) => void;
  onPublish: () => void;
  onSave: () => void;
  onSectionChange: (section: CanvasSection) => void;
  onUpdate: <Key extends keyof PublicSiteContent>(
    key: Key,
    value: PublicSiteContent[Key],
  ) => void;
  onUpdateTeam: (items: string, images: string[]) => void;
}) {
  const [blocksOpen, setBlocksOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [siteSettingsOpen, setSiteSettingsOpen] = useState(false);
  const [pageLibraryOpen, setPageLibraryOpen] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [mediaQuery, setMediaQuery] = useState("");
  const [imageTarget, setImageTarget] = useState<ImageTarget | null>(null);
  const [selectedPageId, setSelectedPageId] = useState("home");
  const [selectedPagePart, setSelectedPagePart] = useState<
    "intro" | "gallery" | "blocks" | "booking"
  >("intro");
  const [selectedCustomBlockId, setSelectedCustomBlockId] = useState("");
  const [editingEnabled, setEditingEnabled] = useState(true);
  const layoutOrder = resolvePublicSiteLayoutOrder(draft);
  const sectionOrder = sectionsFromLayoutOrder(layoutOrder);
  const pages = draft.pages ?? [];
  const activePage =
    selectedPageId === "home"
      ? null
      : pages.find((page) => page.id === selectedPageId) ?? null;
  const selectedCustomBlock = activePage
    ? (activePage.blocks ?? []).find(
        (block) => block.id === selectedCustomBlockId,
      ) ?? null
    : (draft.custom_blocks ?? []).find(
        (block) => block.id === selectedCustomBlockId,
      ) ?? null;
  const selectedLayoutItem = selectedCustomBlock
    ? customBlockLayoutId(selectedCustomBlock.id)
    : selectedSection === "hero"
      ? null
      : sectionLayoutId(selectedSection);
  const selectedIndex = selectedLayoutItem
    ? layoutOrder.indexOf(selectedLayoutItem)
    : -1;
  const visibilityKey =
    selectedSection === "hero" ? null : sectionVisibilityKey[selectedSection];
  const activeTemplate =
    SITE_TEMPLATES.find((template) => template.id === draft.template_id) ?? null;

  useEffect(() => {
    if (!mediaPickerOpen) return;
    let cancelled = false;

    async function loadMedia() {
      setMediaLoading(true);
      setMediaError("");
      const pickingVideo =
        (imageTarget?.kind === "block" && imageTarget.key === "video_url") ||
        (imageTarget?.kind === "block-card" && imageTarget.key === "video_url");
      let query = supabase
        .from("media_library")
        .select("id,image_url,alt_text,original_filename,mime_type")
        .eq("business_id", businessId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      query = pickingVideo
        ? query.like("mime_type", "video/%")
        : query.or("mime_type.is.null,mime_type.like.image/%");
      const { data, error } = await query.limit(120);

      if (cancelled) return;
      setMediaLoading(false);
      if (error) {
        setMediaItems([]);
        setMediaError(error.message);
        return;
      }
      setMediaItems((data ?? []) as MediaItem[]);
    }

    void loadMedia();
    return () => {
      cancelled = true;
    };
  }, [businessId, imageTarget, mediaPickerOpen]);

  const filteredMedia = useMemo(() => {
    const query = mediaQuery.trim().toLowerCase();
    if (!query) return mediaItems;
    return mediaItems.filter((item) =>
      `${item.alt_text ?? ""} ${item.original_filename ?? ""}`
        .toLowerCase()
        .includes(query),
    );
  }, [mediaItems, mediaQuery]);

  function openMediaPicker(target: ImageTarget) {
    setImageTarget(target);
    setMediaQuery("");
    setMediaPickerOpen(true);
  }

  function selectMedia(url: string) {
    if (!imageTarget) return;
    if (imageTarget.kind === "content") {
      onUpdate(imageTarget.key, url);
    } else if (imageTarget.kind === "list") {
      const values = [...(draft[imageTarget.key] ?? [])];
      while (values.length <= imageTarget.index) values.push("");
      values[imageTarget.index] = url;
      onUpdate(imageTarget.key, values);
    } else if (imageTarget.kind === "page") {
      updatePageById(imageTarget.pageId, imageTarget.key, url);
    } else if (imageTarget.kind === "block") {
      updateCustomBlockById(imageTarget.blockId, imageTarget.key, url);
    } else if (imageTarget.kind === "block-card") {
      const block = findCustomBlock(imageTarget.blockId);
      if (block) {
        const cards = [...blockColumnCards(block)];
        const card = cards[imageTarget.cardIndex];
        if (card) {
          cards[imageTarget.cardIndex] = {
            ...card,
            [imageTarget.key]: url,
          };
          updateCustomBlockById(imageTarget.blockId, "cards", cards);
        }
      }
    } else {
      const block = findCustomBlock(imageTarget.blockId);
      const values = [...(block?.media_urls ?? [])];
      while (values.length <= imageTarget.index) values.push("");
      values[imageTarget.index] = url;
      updateCustomBlockById(imageTarget.blockId, imageTarget.key, values);
    }
    setMediaPickerOpen(false);
    setImageTarget(null);
  }

  function addBlock(section: PublicSiteSection) {
    onUpdate(sectionVisibilityKey[section], true);
    setSelectedCustomBlockId("");
    onSectionChange(section);
    setSettingsOpen(true);
    setLibraryOpen(false);
  }

  function chooseSection(section: CanvasSection) {
    setSelectedCustomBlockId("");
    onSectionChange(section);
  }

  function choosePage(pageId: string) {
    setSelectedPageId(pageId);
    setSelectedPagePart("intro");
    setSelectedCustomBlockId("");
    setSettingsOpen(true);
  }

  function addPortfolioPage() {
    const existing = pages.find((page) => page.type === "portfolio");
    if (existing) {
      choosePage(existing.id);
    } else {
      onUpdate("pages", [{ ...GLOSS_PORTFOLIO_PAGE }, ...pages]);
      choosePage(GLOSS_PORTFOLIO_PAGE.id);
    }
    setPageLibraryOpen(false);
    setEditingEnabled(true);
  }

  function addCustomPage() {
    const page = createCustomPage(
      pages.filter((item) => item.type === "custom").length,
    );
    onUpdate("pages", [...pages, page]);
    choosePage(page.id);
    setPageLibraryOpen(false);
    setEditingEnabled(true);
  }

  function addCustomBlock(
    kind: PublicSiteCustomBlockKind,
    target: "home" | "page",
  ) {
    const block = createCustomBlock(kind);
    if (target === "page" && activePage) {
      updatePage("blocks", [...(activePage.blocks ?? []), block]);
      setSelectedPagePart("blocks");
    } else {
      onUpdate("custom_blocks", [...(draft.custom_blocks ?? []), block]);
      onUpdate("layout_order", [
        ...layoutOrder,
        customBlockLayoutId(block.id),
      ]);
      setSelectedPageId("home");
    }
    setSelectedCustomBlockId(block.id);
    setLibraryOpen(false);
    setSettingsOpen(true);
    setEditingEnabled(true);
  }

  function updateCustomBlock<Key extends keyof PublicSiteCustomBlock>(
    key: Key,
    value: PublicSiteCustomBlock[Key],
  ) {
    if (!selectedCustomBlock) return;
    updateCustomBlockById(selectedCustomBlock.id, key, value);
  }

  function findCustomBlock(blockId: string) {
    for (const page of pages) {
      const block = (page.blocks ?? []).find((item) => item.id === blockId);
      if (block) return block;
    }
    return (draft.custom_blocks ?? []).find((block) => block.id === blockId) ?? null;
  }

  function updateCustomBlockById<Key extends keyof PublicSiteCustomBlock>(
    blockId: string,
    key: Key,
    value: PublicSiteCustomBlock[Key],
  ) {
    const pageWithBlock = pages.find((page) =>
      (page.blocks ?? []).some((block) => block.id === blockId),
    );
    if (pageWithBlock) {
      onUpdate(
        "pages",
        pages.map((page) =>
          page.id === pageWithBlock.id
            ? {
                ...page,
                blocks: (page.blocks ?? []).map((block) =>
                  block.id === blockId ? { ...block, [key]: value } : block,
                ),
              }
            : page,
        ),
      );
      return;
    }
    onUpdate(
      "custom_blocks",
      (draft.custom_blocks ?? []).map((block) =>
        block.id === blockId ? { ...block, [key]: value } : block,
      ),
    );
  }

  function updatePageById<Key extends keyof PublicSitePage>(
    pageId: string,
    key: Key,
    value: PublicSitePage[Key],
  ) {
    onUpdate(
      "pages",
      pages.map((page) =>
        page.id === pageId ? { ...page, [key]: value } : page,
      ),
    );
  }

  function moveLayoutItem(item: string, direction: -1 | 1) {
    const order = [...layoutOrder];
    const currentIndex = order.indexOf(item);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= order.length) return;
    [order[currentIndex], order[nextIndex]] = [
      order[nextIndex],
      order[currentIndex],
    ];
    onUpdate("layout_order", order);
    onUpdate("section_order", sectionsFromLayoutOrder(order));
  }

  function movePageBlock(blockId: string, direction: -1 | 1) {
    if (!activePage) return;
    const blocks = [...(activePage.blocks ?? [])];
    const currentIndex = blocks.findIndex((block) => block.id === blockId);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= blocks.length) return;
    [blocks[currentIndex], blocks[nextIndex]] = [
      blocks[nextIndex],
      blocks[currentIndex],
    ];
    updatePage("blocks", blocks);
  }

  function removeCustomBlock() {
    if (!selectedCustomBlock) return;
    if (activePage) {
      updatePage(
        "blocks",
        (activePage.blocks ?? []).filter(
          (block) => block.id !== selectedCustomBlock.id,
        ),
      );
    } else {
      onUpdate(
        "custom_blocks",
        (draft.custom_blocks ?? []).filter(
          (block) => block.id !== selectedCustomBlock.id,
        ),
      );
      onUpdate(
        "layout_order",
        layoutOrder.filter(
          (item) => item !== customBlockLayoutId(selectedCustomBlock.id),
        ),
      );
    }
    setSelectedCustomBlockId("");
  }

  function updatePage<Key extends keyof PublicSitePage>(
    key: Key,
    value: PublicSitePage[Key],
  ) {
    if (!activePage) return;
    updatePageById(activePage.id, key, value);
  }

  function removeActivePage() {
    if (!activePage) return;
    if (!window.confirm(t("Remove this page?"))) return;
    onUpdate(
      "pages",
      pages.filter((page) => page.id !== activePage.id),
    );
    choosePage("home");
  }

  return (
    <section className="relative mt-8 overflow-hidden rounded-[28px] border border-black/10 bg-[#e9e8e4] shadow-[0_26px_90px_rgba(25,27,32,0.12)]">
      <div className="flex flex-col gap-3 border-b border-black/10 bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <span className="mr-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b877e]">
            {t("Page")}
          </span>
          <button
            type="button"
            onClick={() => choosePage("home")}
            aria-pressed={selectedPageId === "home"}
            className={`rounded-xl border px-4 py-2 text-xs font-semibold ${
              selectedPageId === "home"
                ? "border-black/10 bg-[#f6f5f2]"
                : "border-transparent text-black/45"
            }`}
          >
            {t("Home")}
          </button>
          {pages.map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={() => choosePage(page.id)}
              aria-pressed={selectedPageId === page.id}
              className={`rounded-xl border px-4 py-2 text-xs font-semibold ${
                selectedPageId === page.id
                  ? "border-[#9d3151]/30 bg-[#f9edf1] text-[#7f2742]"
                  : page.is_visible === false
                    ? "border-transparent text-black/25 line-through"
                    : "border-transparent text-black/45"
              }`}
            >
              {page.nav_label}
              {page.is_visible === false ? ` · ${t("Hidden")}` : ""}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPageLibraryOpen(true)}
            disabled={!canConfigure}
            className="rounded-xl border border-dashed border-black/20 px-4 py-2 text-xs font-semibold text-black/60 disabled:opacity-40"
          >
            {t("+ Add page")}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingEnabled((current) => !current);
              setSettingsOpen(true);
            }}
            aria-pressed={editingEnabled}
            className={`rounded-xl px-4 py-2 text-xs font-semibold ${
              editingEnabled
                ? "bg-emerald-100 text-emerald-800"
                : "border border-black/10 bg-white text-black/65"
            }`}
          >
            {editingEnabled ? t("Editing on") : t("Edit")}
          </button>
          <button
            type="button"
            onClick={() => setTemplatesOpen(true)}
            className="rounded-xl bg-[#9d3151] px-4 py-2 text-xs font-semibold text-white shadow-sm"
          >
            {t("Templates")}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!activeTemplate) {
                window.alert("Сначала выберите шаблон.");
                return;
              }
              void onTemplate(activeTemplate);
            }}
            disabled={!canConfigure || saving || !activeTemplate}
            className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900 disabled:opacity-40"
          >
            Вернуть начальное демо
          </button>
          <button
            type="button"
            onClick={() => setSeoOpen(true)}
            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-black/65"
          >
            {t("SEO pages")}
          </button>
          <button
            type="button"
            onClick={() => setSiteSettingsOpen(true)}
            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-black/65"
          >
            {t("Site settings")}
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
          {activePage ? (
            <>
              <div className="mt-3 grid gap-2">
                <BlockButton active={selectedPagePart === "intro"} label={t("Page intro")} visible onClick={() => setSelectedPagePart("intro")} />
                {activePage.type === "portfolio" ? (
                  <BlockButton active={selectedPagePart === "gallery"} label={t("Nail gallery")} visible onClick={() => setSelectedPagePart("gallery")} />
                ) : (
                  (activePage.blocks ?? []).map((block) => (
                    <BlockButton
                      key={block.id}
                      active={selectedCustomBlockId === block.id}
                      label={block.title || t("Custom block")}
                      visible={block.is_visible !== false}
                      onClick={() => {
                        setSelectedPagePart("blocks");
                        setSelectedCustomBlockId(block.id);
                      }}
                    />
                  ))
                )}
                <BlockButton active={selectedPagePart === "booking"} label={t("Booking call to action")} visible={activePage.show_booking_cta} onClick={() => setSelectedPagePart("booking")} />
              </div>
              {activePage.type === "custom" ? (
                <button
                  type="button"
                  onClick={() => setLibraryOpen(true)}
                  disabled={!canConfigure}
                  className="mt-4 w-full rounded-xl border border-dashed border-[#9a742e]/45 bg-[#fbf7ee] px-3 py-3 text-xs font-semibold text-[#725924] disabled:opacity-40"
                >
                  {t("+ Add block")}
                </button>
              ) : null}
              <p className="mt-4 rounded-xl bg-[#f1e7ea] px-3 py-3 text-[11px] leading-5 text-[#7f5060]">
                {t("This is a separate public page with its own address and navigation item.")}
              </p>
            </>
          ) : (
            <>
              <div className="mt-3 grid gap-2">
                <BlockButton active={!selectedCustomBlockId && selectedSection === "hero"} label={t("Hero")} visible={draft.show_hero !== false} onClick={() => chooseSection("hero")} />
                {layoutOrder.map((item) => {
                  if (item.startsWith("section:")) {
                    const section = item.slice("section:".length) as PublicSiteSection;
                    return (
                      <BlockButton
                        key={item}
                        active={!selectedCustomBlockId && selectedSection === section}
                        label={t(sectionLabelKey[section])}
                        visible={Boolean(draft[sectionVisibilityKey[section]])}
                        onClick={() => chooseSection(section)}
                      />
                    );
                  }
                  const blockId = item.slice("custom:".length);
                  const block = (draft.custom_blocks ?? []).find(
                    (candidate) => candidate.id === blockId,
                  );
                  if (!block) return null;
                  return (
                    <BlockButton
                      key={item}
                      active={selectedCustomBlockId === block.id}
                      label={block.title || t("Custom block")}
                      visible={block.is_visible !== false}
                      onClick={() => {
                        setSelectedCustomBlockId(block.id);
                        setSettingsOpen(true);
                      }}
                    />
                  );
                })}
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
            </>
          )}
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
          <div
            className={`mx-auto overflow-hidden text-[#191b20] shadow-[0_28px_80px_rgba(25,27,32,0.18)] transition-all ${previewDevice === "mobile" ? "max-w-[390px] rounded-[28px]" : "max-w-[920px] rounded-lg"}`}
            style={{ backgroundColor: draft.theme_surface ?? "#f3f0e9" }}
          >
            {activePage?.type === "portfolio" ? (
              <PortfolioPagePreview
                page={activePage}
                draft={draft}
                portfolio={activeTemplate?.portfolio ?? []}
                bookingHref={`/book/${businessSlug}`}
                editingEnabled={editingEnabled}
                selectedPart={selectedPagePart === "blocks" ? "intro" : selectedPagePart}
                onPartChange={setSelectedPagePart}
              />
            ) : activePage ? (
              <CustomPagePreview
                page={activePage}
                draft={draft}
                editingEnabled={editingEnabled}
                selectedPart={selectedPagePart}
                selectedBlockId={selectedCustomBlockId}
                onPartChange={setSelectedPagePart}
                onBlockChange={(blockId) => {
                  setSelectedPagePart("blocks");
                  setSelectedCustomBlockId(blockId);
                }}
              />
            ) : (
            <>
            <CanvasBlock
              active={editingEnabled && !selectedCustomBlockId && selectedSection === "hero"}
              muted={draft.show_hero === false}
              onClick={() => editingEnabled && chooseSection("hero")}
            >
              {draft.show_announcement !== false && draft.announcement_text ? (
                <div
                  className="px-4 py-2 text-center text-[9px] font-medium text-white"
                  style={{ backgroundColor: draft.theme_accent ?? "#a60918" }}
                >
                  {draft.announcement_text}
                </div>
              ) : null}
              <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
                <span className="-translate-y-0.5 font-serif text-2xl tracking-[0.04em] text-[#551d1d]">
                  {draft.brand_name || businessName}
                  <small className="mt-1 block pl-0.5 font-sans text-[6px] font-semibold tracking-[0.4em] opacity-60">
                    NAIL STUDIO
                  </small>
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-black/45">
                  {draft.services_label} · {draft.portfolio_label} · {draft.contact_label}
                </span>
              </div>
              <div className={`relative overflow-hidden ${draft.hero_image_url ? "grid lg:grid-cols-[0.9fr_1.1fr]" : ""}`}>
                <div className="relative px-8 py-16 sm:px-12 sm:py-24">
                  <div className="absolute -left-20 top-4 h-64 w-64 rounded-full border border-current/10" />
                  <p className="relative text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: draft.theme_accent ?? "#9a742e" }}>{draft.hero_eyebrow}</p>
                  <h2 className="relative mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">{draft.hero_title}</h2>
                  <p className="relative mt-6 max-w-xl text-sm leading-7 text-[#656159]">{draft.hero_text}</p>
                  <span className="relative mt-7 inline-flex rounded-full px-6 py-3 text-xs font-semibold text-white" style={{ backgroundColor: draft.theme_dark ?? "#17191f" }}>{draft.booking_label}</span>
                </div>
                {draft.hero_image_url ? (
                  <div className="relative min-h-80 overflow-hidden lg:min-h-full">
                    <img
                      src={draft.hero_image_url}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
                  </div>
                ) : null}
              </div>
            </CanvasBlock>
            <div className="flex flex-col">
            {sectionOrder.map((section, index) => {
              const visible = Boolean(draft[sectionVisibilityKey[section]]);
              return (
                <CanvasBlock
                  key={section}
                  order={layoutOrder.indexOf(sectionLayoutId(section))}
                  active={editingEnabled && !selectedCustomBlockId && selectedSection === section}
                  muted={!visible}
                  onClick={() => editingEnabled && chooseSection(section)}
                >
                  <div
                    className={`${section === "services" ? "text-white" : index % 2 ? "bg-white/70" : ""} px-8 py-12 sm:px-12`}
                    style={section === "services" ? { backgroundColor: draft.theme_dark ?? "#191b20" } : undefined}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: section === "services" ? "#f0cad5" : draft.theme_accent ?? "#9a742e" }}>
                      {(draft[`${section}_label` as keyof PublicSiteContent] as string | undefined) ?? t(sectionLabelKey[section])}
                    </p>
                    <h3 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">
                      {(draft[`${section}_title` as keyof PublicSiteContent] as string | undefined) ?? t(sectionLabelKey[section])}
                    </h3>
                    <CanvasSectionPreview
                      section={section}
                      draft={draft}
                      services={activeTemplate?.services ?? []}
                      portfolio={activeTemplate?.portfolio ?? []}
                    />
                  </div>
                </CanvasBlock>
              );
            })}
            {(draft.custom_blocks ?? []).map((block) => (
              <CanvasBlock
                key={block.id}
                order={layoutOrder.indexOf(customBlockLayoutId(block.id))}
                active={editingEnabled && selectedCustomBlockId === block.id}
                muted={block.is_visible === false}
                onClick={() =>
                  editingEnabled && setSelectedCustomBlockId(block.id)
                }
              >
                <CustomBlockPreview block={block} />
              </CanvasBlock>
            ))}
            </div>
            </>
            )}
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
            {activePage
              ? activePage.nav_label
              : selectedCustomBlock
                ? selectedCustomBlock.title
              : selectedSection === "hero"
                ? t("Hero")
                : t(sectionLabelKey[selectedSection])}
          </h2>
          <div className="mt-6 grid gap-5">
            {activePage ? (
              <>
                {selectedPagePart === "intro" ? (
                  <>
                    <CompactField label={t("Navigation label")} value={activePage.nav_label} disabled={!canConfigure || !editingEnabled} onChange={(value) => updatePage("nav_label", value)} />
                    {activePage.type === "custom" ? (
                      <CompactField
                        label={t("Page address")}
                        value={activePage.slug}
                        disabled={!canConfigure || !editingEnabled}
                        onChange={(value) =>
                          updatePage(
                            "slug",
                            value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]+/g, "-")
                              .replace(/^-+|-+$/g, "")
                              .slice(0, 60),
                          )
                        }
                      />
                    ) : null}
                    <CompactField label={t("Eyebrow")} value={activePage.eyebrow} disabled={!canConfigure || !editingEnabled} onChange={(value) => updatePage("eyebrow", value)} />
                    <CompactField label={t("Main title")} value={activePage.title} disabled={!canConfigure || !editingEnabled} onChange={(value) => updatePage("title", value)} multiline />
                    <CompactField label={t("Introduction")} value={activePage.intro} disabled={!canConfigure || !editingEnabled} onChange={(value) => updatePage("intro", value)} multiline />
                    <Toggle
                      label={t("Show page on site")}
                      checked={activePage.is_visible !== false}
                      disabled={!canConfigure || !editingEnabled}
                      onChange={(value) => updatePage("is_visible", value)}
                    />
                    <Toggle label={t("Show in navigation")} checked={activePage.show_in_navigation} disabled={!canConfigure || !editingEnabled} onChange={(value) => updatePage("show_in_navigation", value)} />
                    {activePage.type === "custom" ? (
                      <button
                        type="button"
                        onClick={removeActivePage}
                        disabled={!canConfigure || !editingEnabled}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 disabled:opacity-40"
                      >
                        {t("Remove page")}
                      </button>
                    ) : null}
                  </>
                ) : null}
                {selectedPagePart === "gallery" ? (
                  <div className="grid gap-3">
                    <p className="text-xs leading-6 text-[#716d65]">
                      {t("Portfolio cards use the shared Portfolio module, so changes appear on the home page and this page together.")}
                    </p>
                    <Link href="/admin/portfolio" className="rounded-xl bg-[#321722] px-4 py-3 text-center text-xs font-semibold text-white">
                      {t("Edit portfolio works")}
                    </Link>
                  </div>
                ) : null}
                {selectedPagePart === "blocks" && selectedCustomBlock ? (
                  <>
                    <MoveControls
                      disabled={!canConfigure || !editingEnabled}
                      first={(activePage.blocks ?? [])[0]?.id === selectedCustomBlock.id}
                      last={(activePage.blocks ?? []).at(-1)?.id === selectedCustomBlock.id}
                      t={t}
                      onUp={() => movePageBlock(selectedCustomBlock.id, -1)}
                      onDown={() => movePageBlock(selectedCustomBlock.id, 1)}
                    />
                    <CustomBlockSettings
                      block={selectedCustomBlock}
                      disabled={!canConfigure || !editingEnabled}
                      t={t}
                      onChange={updateCustomBlock}
                      onRemove={removeCustomBlock}
                      onChooseImage={(key, label) =>
                        openMediaPicker({
                          kind: "block",
                          blockId: selectedCustomBlock.id,
                          key,
                          label,
                        })
                      }
                      onChooseListImage={(index, label) =>
                        openMediaPicker({
                          kind: "block-list",
                          blockId: selectedCustomBlock.id,
                          key: "media_urls",
                          index,
                          label,
                        })
                      }
                      onChooseCardImage={(cardIndex, key, label) =>
                        openMediaPicker({
                          kind: "block-card",
                          blockId: selectedCustomBlock.id,
                          cardIndex,
                          key,
                          label,
                        })
                      }
                    />
                  </>
                ) : null}
                {selectedPagePart === "booking" ? (
                  <>
                    <Toggle label={t("Show booking block")} checked={activePage.show_booking_cta} disabled={!canConfigure || !editingEnabled} onChange={(value) => updatePage("show_booking_cta", value)} />
                    <Link href={`/book/${businessSlug}`} target="_blank" className="rounded-xl border border-black/10 px-4 py-3 text-center text-xs font-semibold">
                      {t("Open booking calendar")}
                    </Link>
                    <Link href="/admin/availability" className="rounded-xl bg-[#321722] px-4 py-3 text-center text-xs font-semibold text-white">
                      {t("Configure available time")}
                    </Link>
                  </>
                ) : null}
              </>
            ) : selectedCustomBlock ? (
              <>
                <MoveControls
                  disabled={!canConfigure || !editingEnabled}
                  first={selectedIndex <= 0}
                  last={selectedIndex === layoutOrder.length - 1}
                  t={t}
                  onUp={() =>
                    moveLayoutItem(
                      customBlockLayoutId(selectedCustomBlock.id),
                      -1,
                    )
                  }
                  onDown={() =>
                    moveLayoutItem(
                      customBlockLayoutId(selectedCustomBlock.id),
                      1,
                    )
                  }
                />
                <CustomBlockSettings
                  block={selectedCustomBlock}
                  disabled={!canConfigure || !editingEnabled}
                  t={t}
                  onChange={updateCustomBlock}
                  onRemove={removeCustomBlock}
                  onChooseImage={(key, label) =>
                    openMediaPicker({
                      kind: "block",
                      blockId: selectedCustomBlock.id,
                      key,
                      label,
                    })
                  }
                  onChooseListImage={(index, label) =>
                    openMediaPicker({
                      kind: "block-list",
                      blockId: selectedCustomBlock.id,
                      key: "media_urls",
                      index,
                      label,
                    })
                  }
                  onChooseCardImage={(cardIndex, key, label) =>
                    openMediaPicker({
                      kind: "block-card",
                      blockId: selectedCustomBlock.id,
                      cardIndex,
                      key,
                      label,
                    })
                  }
                />
              </>
            ) : selectedSection === "hero" ? (
              <>
                <Toggle
                  label={t("Show hero block")}
                  checked={draft.show_hero !== false}
                  disabled={!canConfigure || !editingEnabled}
                  onChange={(value) => onUpdate("show_hero", value)}
                />
                <Toggle label={t("Show announcement bar")} checked={draft.show_announcement !== false} disabled={!canConfigure || !editingEnabled} onChange={(value) => onUpdate("show_announcement", value)} />
                <CompactField label={t("Announcement text")} value={draft.announcement_text ?? ""} disabled={!canConfigure || !editingEnabled} onChange={(value) => onUpdate("announcement_text", value)} />
                <CompactField label={t("Eyebrow")} value={draft.hero_eyebrow} disabled={!canConfigure || !editingEnabled} onChange={(value) => onUpdate("hero_eyebrow", value)} />
                <CompactField label={t("Main title")} value={draft.hero_title} disabled={!canConfigure || !editingEnabled} onChange={(value) => onUpdate("hero_title", value)} multiline />
                <CompactField label={t("Introduction")} value={draft.hero_text} disabled={!canConfigure || !editingEnabled} onChange={(value) => onUpdate("hero_text", value)} multiline />
                <CompactField label={t("Button")} value={draft.booking_label} disabled={!canConfigure || !editingEnabled} onChange={(value) => onUpdate("booking_label", value)} />
                <ImageEditor
                  label={t("Hero image")}
                  value={draft.hero_image_url ?? ""}
                  disabled={!canConfigure || !editingEnabled}
                  t={t}
                  onChange={(value) => onUpdate("hero_image_url", value)}
                  onChoose={() =>
                    openMediaPicker({
                      kind: "content",
                      key: "hero_image_url",
                      label: t("Hero image"),
                    })
                  }
                />
              </>
            ) : (
              <>
                <Toggle label={t("Show block")} checked={Boolean(draft[visibilityKey!])} disabled={!canConfigure || !editingEnabled} onChange={(value) => onUpdate(visibilityKey!, value)} />
                <CompactField
                  label={t("Heading")}
                  value={(draft[`${selectedSection}_title` as keyof PublicSiteContent] as string | undefined) ?? ""}
                  disabled={!canConfigure || !editingEnabled}
                  onChange={(value) => onUpdate(`${selectedSection}_title` as keyof PublicSiteContent, value)}
                  multiline
                />
                {selectedSection === "about" ? (
                  <CompactField label={t("Text")} value={draft.about_text} disabled={!canConfigure || !editingEnabled} onChange={(value) => onUpdate("about_text", value)} multiline />
                ) : null}
                {selectedSection === "services" ? (
                  <ImageListEditor
                    label={t("Service images")}
                    values={draft.service_image_urls ?? glossServiceImages}
                    count={4}
                    disabled={!canConfigure || !editingEnabled}
                    t={t}
                    onChange={(index, value) => {
                      const values = [...(draft.service_image_urls ?? glossServiceImages)];
                      while (values.length <= index) values.push("");
                      values[index] = value;
                      onUpdate("service_image_urls", values);
                    }}
                    onChoose={(index) =>
                      openMediaPicker({
                        kind: "list",
                        key: "service_image_urls",
                        index,
                        label: `${t("Service image")} ${index + 1}`,
                      })
                    }
                  />
                ) : null}
                {selectedSection === "portfolio" ? (
                  <Link href="/admin/portfolio" className="rounded-xl bg-[#321722] px-4 py-3 text-center text-xs font-semibold text-white">
                    {t("Edit portfolio images")}
                  </Link>
                ) : null}
                {selectedSection === "team" ? (
                  <TeamEditor
                    items={draft.team_items ?? ""}
                    images={draft.team_image_urls ?? glossMasterImages}
                    disabled={!canConfigure || !editingEnabled}
                    t={t}
                    onChange={onUpdateTeam}
                    onChooseImage={(index) =>
                      openMediaPicker({
                        kind: "list",
                        key: "team_image_urls",
                        index,
                        label: `${t("Team photo")} ${index + 1}`,
                      })
                    }
                  />
                ) : null}
                {selectedSection === "reviews" ? (
                  <ReviewsEditor
                    reviews={publicSiteReviews(draft)}
                    disabled={!canConfigure || !editingEnabled}
                    t={t}
                    onChange={(reviews) => onUpdate("reviews", reviews)}
                  />
                ) : null}
                {selectedSection === "membership" ? (
                  <>
                    <DelimitedItemsEditor
                      label={t("Club benefits")}
                      value={draft.membership_text ?? ""}
                      fields={[t("Benefit")]}
                      defaults={[t("New benefit")]}
                      disabled={!canConfigure || !editingEnabled}
                      t={t}
                      onChange={(value) => onUpdate("membership_text", value)}
                    />
                    <ImageEditor
                      label={t("Club image")}
                      value={draft.membership_image_url ?? glossMembershipImage}
                      disabled={!canConfigure || !editingEnabled}
                      t={t}
                      onChange={(value) => onUpdate("membership_image_url", value)}
                      onChoose={() =>
                        openMediaPicker({
                          kind: "content",
                          key: "membership_image_url",
                          label: t("Club image"),
                        })
                      }
                    />
                  </>
                ) : null}
                {selectedSection === "booking" ? (
                  <CompactField label={t("Text")} value={draft.booking_text ?? ""} disabled={!canConfigure || !editingEnabled} onChange={(value) => onUpdate("booking_text", value)} multiline />
                ) : null}
                {selectedSection === "safety" ? (
                  <DelimitedItemsEditor
                    label={t("Safety items")}
                    value={draft.safety_items ?? ""}
                    delimiter="·"
                    fields={[t("Heading"), t("Description")]}
                    defaults={[t("New advantage"), ""]}
                    disabled={!canConfigure || !editingEnabled}
                    t={t}
                    onChange={(value) => onUpdate("safety_items", value)}
                  />
                ) : null}
                {selectedSection === "gift" ? (
                  <>
                    <CompactField label={t("Text")} value={draft.gift_text ?? ""} disabled={!canConfigure || !editingEnabled} onChange={(value) => onUpdate("gift_text", value)} multiline />
                    <ImageEditor
                      label={t("Gift image")}
                      value={draft.gift_image_url ?? glossGiftImage}
                      disabled={!canConfigure || !editingEnabled}
                      t={t}
                      onChange={(value) => onUpdate("gift_image_url", value)}
                      onChoose={() =>
                        openMediaPicker({
                          kind: "content",
                          key: "gift_image_url",
                          label: t("Gift image"),
                        })
                      }
                    />
                  </>
                ) : null}
                {selectedSection === "faq" ? (
                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-[#9d3151]/15 bg-[#fff8fa] px-4 py-3 text-[11px] leading-5 text-[#716d65]">
                      Каждый вопрос хранится как отдельная карточка. Карточки можно добавлять,
                      удалять и переставлять. В предпросмотре нажмите на вопрос, чтобы увидеть ответ.
                    </div>
                    <DelimitedItemsEditor
                      label={t("Questions and answers")}
                      value={draft.faq_items ?? ""}
                      delimiter="|"
                      fields={[t("Question"), t("Answer")]}
                      defaults={[t("New question"), t("Add an answer")]}
                      disabled={!canConfigure || !editingEnabled}
                      t={t}
                      onChange={(value) => onUpdate("faq_items", value)}
                    />
                  </div>
                ) : null}
                {selectedSection === "contact" ? (
                  <>
                    <CompactField
                      label={t("Opening hours")}
                      value={draft.contact_hours ?? ""}
                      disabled={!canConfigure || !editingEnabled}
                      onChange={(value) => onUpdate("contact_hours", value)}
                    />
                    <CompactField
                      label={t("Address shown on site")}
                      value={draft.contact_address ?? ""}
                      disabled={!canConfigure || !editingEnabled}
                      onChange={(value) => onUpdate("contact_address", value)}
                    />
                    <CompactField
                      label={t("Map search address")}
                      value={draft.map_query ?? ""}
                      disabled={!canConfigure || !editingEnabled}
                      onChange={(value) => onUpdate("map_query", value)}
                    />
                    <p className="text-[11px] leading-5 text-[#716d65]">
                      {t("The map preview updates after saving and publishing.")}
                    </p>
                  </>
                ) : null}
                <MoveControls
                  disabled={!canConfigure || !editingEnabled}
                  first={selectedIndex <= 0}
                  last={selectedIndex === layoutOrder.length - 1}
                  t={t}
                  onUp={() =>
                    moveLayoutItem(sectionLayoutId(selectedSection), -1)
                  }
                  onDown={() =>
                    moveLayoutItem(sectionLayoutId(selectedSection), 1)
                  }
                />
              </>
            )}
          </div>
          <div className="mt-8 rounded-2xl bg-[#f6f4ef] p-4 text-xs leading-6 text-[#716d65]">
            {editingEnabled
              ? t("Select any block in the page preview to edit it here.")
              : t("Turn editing on to change this page.")}
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
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#17191f]/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label={t("Block library")}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setLibraryOpen(false);
          }}
        >
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-auto rounded-[28px] bg-[#f8f7f3] p-5 shadow-[0_35px_120px_rgba(0,0,0,0.35)] sm:p-7">
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
              {activePage?.type !== "custom" ? defaultSectionOrder.map((section) => {
                const visible = Boolean(draft[sectionVisibilityKey[section]]);
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
              }) : null}
              {([
                ["text", "Text block", "A free heading and text section."],
                ["features", "Feature cards", "Three or more editable advantages."],
                ["cta", "Call to action", "Text with a button and link."],
                ["media_text", "Text + image or video", "A split section with media on the left or right."],
                ["columns", "Two or three columns", "A row of two or three editable content cards."],
                ["slider", "Image slider", "Automatic slides with an interval from two seconds."],
                ["collage", "Коллаж", "Несколько фотографий слева, по центру или справа."],
                ["video", "Video block", "YouTube, Vimeo or a direct video file."],
              ] as const).map(([kind, title, description]) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() =>
                    addCustomBlock(
                      kind,
                      activePage?.type === "custom" ? "page" : "home",
                    )
                  }
                  className="group rounded-2xl border border-[#9d3151]/15 bg-[#fff8fa] p-5 text-left transition hover:-translate-y-0.5 hover:border-[#9d3151]/40 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-lg font-semibold">{kind === "collage" ? title : t(title)}</span>
                    <span className="rounded-full bg-[#f5e5ea] px-3 py-1 text-[10px] font-semibold text-[#8d2d4a]">
                      {t("Add")}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[#716d65]">
                    {kind === "collage" ? description : t(description)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      {pageLibraryOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#17191f]/55 p-4 backdrop-blur-[3px]"
          role="dialog"
          aria-modal="true"
          aria-label={t("Page library")}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setPageLibraryOpen(false);
          }}
        >
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-auto rounded-[30px] bg-[#f8f7f3] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.4)] sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9d3151]">{t("Ready-made pages")}</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{t("Add a page")}</h2>
                <p className="mt-3 text-sm leading-6 text-[#716d65]">{t("The page is added to the site navigation and can be edited immediately.")}</p>
              </div>
              <button type="button" onClick={() => setPageLibraryOpen(false)} className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold">×</button>
            </div>
            <button
              type="button"
              onClick={addPortfolioPage}
              className="mt-7 w-full overflow-hidden rounded-[24px] border border-black/8 bg-white text-left transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="grid min-h-44 gap-4 bg-[#321722] p-6 text-white sm:grid-cols-[1fr_0.85fr]">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#efc8d3]">GLOSS · PAGE</p>
                  <h3 className="mt-5 text-4xl font-semibold tracking-[-0.06em]">{t("Portfolio")}</h3>
                  <p className="mt-3 text-xs leading-6 text-white/55">{t("A separate gallery page with many works and a booking button.")}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(activeTemplate?.portfolio ?? []).slice(0, 4).map((project) => (
                    <img key={project.slug} src={project.imageUrl} alt="" className="h-20 w-full rounded-xl object-cover" />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 p-5">
                <span className="text-sm font-semibold">{pages.some((page) => page.type === "portfolio") ? t("Open page") : t("Add portfolio page")}</span>
                <span className="rounded-full bg-[#f5e5ea] px-4 py-2 text-xs font-semibold text-[#8d2d4a]">→</span>
              </div>
            </button>
            <button
              type="button"
              onClick={addCustomPage}
              className="mt-4 w-full overflow-hidden rounded-[24px] border border-black/8 bg-white text-left transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="grid min-h-36 gap-4 bg-[#f3e8e5] p-6 text-[#421f20] sm:grid-cols-[1fr_0.85fr]">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9d3151]">
                    {t("Flexible page")}
                  </p>
                  <h3 className="mt-4 text-3xl font-semibold tracking-[-0.05em]">
                    {t("Custom page")}
                  </h3>
                  <p className="mt-3 text-xs leading-6 text-black/55">
                    {t("Start with a text block, then add features and calls to action.")}
                  </p>
                </div>
                <div className="grid content-center gap-2">
                  <span className="h-8 rounded-lg bg-white/80" />
                  <span className="h-12 rounded-lg bg-white/65" />
                  <span className="h-8 w-2/3 rounded-lg bg-[#9d3151]/25" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 p-5">
                <span className="text-sm font-semibold">
                  {t("Add custom page")}
                </span>
                <span className="rounded-full bg-[#f5e5ea] px-4 py-2 text-xs font-semibold text-[#8d2d4a]">
                  →
                </span>
              </div>
            </button>
          </div>
        </div>
      ) : null}
      {templatesOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#17191f]/55 p-4 backdrop-blur-[3px]"
          role="dialog"
          aria-modal="true"
          aria-label={t("Site templates")}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setTemplatesOpen(false);
          }}
        >
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-4xl overflow-auto rounded-[30px] bg-[#f8f7f3] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.4)] sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9d3151]">{t("Ready-made sites")}</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{t("Choose a starting point")}</h2>
                <p className="mt-3 text-sm text-[#716d65]">{t("The template fills the page with editable blocks, texts and colors.")}</p>
              </div>
              <button type="button" onClick={() => setTemplatesOpen(false)} className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold">×</button>
            </div>
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {SITE_TEMPLATES.map((template) => (
                <article key={template.id} className="overflow-hidden rounded-[24px] border border-black/8 bg-white">
                  <div className="relative h-48 p-6 text-white" style={{ backgroundColor: template.preview.dark }}>
                    <div className="absolute -right-10 -top-8 h-40 w-40 rounded-full border border-white/20" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#f0cad5" }}>{template.category}</p>
                    <p className="mt-8 text-4xl font-semibold tracking-[-0.06em]">{template.name}</p>
                    <div className="mt-5 h-2 w-28 rounded-full" style={{ backgroundColor: template.preview.accent }} />
                  </div>
                  <div className="p-5">
                    <p className="text-sm leading-6 text-[#716d65]">{template.description}</p>
                    <button
                      type="button"
                      onClick={() => {
                        onTemplate(template);
                        setTemplatesOpen(false);
                      }}
                      className="mt-5 w-full rounded-xl px-4 py-3 text-xs font-semibold text-white"
                      style={{ backgroundColor: template.preview.accent }}
                    >
                      {t("Use this template")}
                    </button>
                  </div>
                </article>
              ))}
              <article className="grid min-h-72 place-items-center rounded-[24px] border border-dashed border-black/15 p-8 text-center text-sm text-[#8b877e]">
                <div>
                  <p className="font-semibold text-[#35332f]">{t("More templates are coming")}</p>
                  <p className="mt-2 leading-6">{t("Photo studio, dance school, tattoo studio, events and more.")}</p>
                </div>
              </article>
            </div>
          </div>
        </div>
      ) : null}
      {siteSettingsOpen ? (
        <div
          className="fixed inset-0 z-[105] flex items-center justify-center overflow-y-auto bg-[#17191f]/55 p-4 backdrop-blur-[3px]"
          role="dialog"
          aria-modal="true"
          aria-label={t("Site settings")}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSiteSettingsOpen(false);
          }}
        >
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-5xl overflow-auto rounded-[30px] bg-[#f8f7f3] p-5 shadow-[0_35px_120px_rgba(0,0,0,0.4)] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9d3151]">
                  {t("Website basics")}
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                  {t("Site settings")}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#716d65]">
                  {t("Manage search basics, colors, social links, languages and analytics in one place.")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSiteSettingsOpen(false)}
                className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold"
                aria-label={t("Close")}
              >
                ×
              </button>
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-2">
              <section className="grid content-start gap-4 rounded-[24px] border border-black/8 bg-white p-5 sm:p-6">
                <h3 className="text-lg font-semibold">{t("Search basics")}</h3>
                <CompactField
                  label={t("Page summary")}
                  value={draft.site_summary ?? ""}
                  disabled={!canConfigure}
                  multiline
                  onChange={(value) => onUpdate("site_summary", value.slice(0, 500))}
                />
                <CompactField
                  label={t("Keywords, separated by commas")}
                  value={draft.seo_keywords ?? ""}
                  disabled={!canConfigure}
                  multiline
                  onChange={(value) => onUpdate("seo_keywords", value.slice(0, 500))}
                />
                <ImageEditor
                  label={t("Site icon (favicon)")}
                  value={draft.favicon_url ?? ""}
                  disabled={!canConfigure}
                  t={t}
                  onChange={(value) => onUpdate("favicon_url", value)}
                  onChoose={() =>
                    openMediaPicker({
                      kind: "content",
                      key: "favicon_url",
                      label: t("Site icon (favicon)"),
                    })
                  }
                />
                <ImageEditor
                  label={t("Open Graph image")}
                  value={draft.seo_image_url ?? ""}
                  disabled={!canConfigure}
                  t={t}
                  onChange={(value) => onUpdate("seo_image_url", value)}
                  onChoose={() =>
                    openMediaPicker({
                      kind: "content",
                      key: "seo_image_url",
                      label: t("Open Graph image"),
                    })
                  }
                />
              </section>

              <section className="grid content-start gap-4 rounded-[24px] border border-black/8 bg-white p-5 sm:p-6">
                <h3 className="text-lg font-semibold">{t("Colors and languages")}</h3>
                <ColorEditor
                  label={t("Primary color")}
                  value={draft.theme_accent ?? "#9d3151"}
                  disabled={!canConfigure}
                  onChange={(value) => onUpdate("theme_accent", value)}
                />
                <ColorEditor
                  label={t("Additional color")}
                  value={draft.theme_dark ?? "#321722"}
                  disabled={!canConfigure}
                  onChange={(value) => onUpdate("theme_dark", value)}
                />
                <ColorEditor
                  label={t("Background color")}
                  value={draft.theme_surface ?? "#fff7f5"}
                  disabled={!canConfigure}
                  onChange={(value) => onUpdate("theme_surface", value)}
                />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">
                    {t("Site languages")}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {locales.map((locale) => (
                      <button
                        key={locale}
                        type="button"
                        onClick={() => onLocaleChange(locale)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold ${
                          selectedLocale === locale
                            ? "bg-[#17191f] text-white"
                            : "border border-black/10 bg-white"
                        }`}
                      >
                        {locale.toUpperCase()}
                        {locale === primaryLocale ? " · ★" : ""}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={onAddLocale}
                      disabled={!canConfigure}
                      className="rounded-full border border-dashed border-black/20 px-4 py-2 text-xs font-semibold disabled:opacity-40"
                    >
                      {t("+ Language")}
                    </button>
                  </div>
                </div>
              </section>

              <section className="grid content-start gap-4 rounded-[24px] border border-black/8 bg-white p-5 sm:p-6">
                <h3 className="text-lg font-semibold">{t("Social networks")}</h3>
                <Toggle
                  label={t("Show social network icons")}
                  checked={draft.show_social_icons === true}
                  disabled={!canConfigure}
                  onChange={(value) => onUpdate("show_social_icons", value)}
                />
                <SocialLinksEditor
                  links={draft.social_links ?? []}
                  disabled={!canConfigure}
                  t={t}
                  onChange={(links) => onUpdate("social_links", links)}
                />
              </section>

              <section className="grid content-start gap-4 rounded-[24px] border border-black/8 bg-white p-5 sm:p-6">
                <h3 className="text-lg font-semibold">{t("Analytics integrations")}</h3>
                <CompactField
                  label={t("Google Analytics 4 tag ID")}
                  value={draft.google_analytics_id ?? ""}
                  disabled={!canConfigure}
                  onChange={(value) =>
                    onUpdate("google_analytics_id", value.toUpperCase())
                  }
                />
                <CompactField
                  label={t("Meta Pixel ID")}
                  value={draft.meta_pixel_id ?? ""}
                  disabled={!canConfigure}
                  onChange={(value) =>
                    onUpdate("meta_pixel_id", value.replace(/\D/g, ""))
                  }
                />
                <p className="text-xs leading-6 text-[#716d65]">
                  {t("Analytics scripts load only on this workspace public site after it is published.")}
                </p>
              </section>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setSiteSettingsOpen(false)}
                className="rounded-xl border border-black/10 bg-white px-5 py-3 text-xs font-semibold"
              >
                {t("Close")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSiteSettingsOpen(false);
                  onSave();
                }}
                disabled={saving || !canConfigure}
                className="rounded-xl bg-[#17191f] px-5 py-3 text-xs font-semibold text-white disabled:opacity-40"
              >
                {saving ? t("Saving…") : t("Save settings")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {seoOpen ? (
        <div
          className="fixed inset-0 z-[105] flex items-center justify-center overflow-y-auto bg-[#17191f]/55 p-4 backdrop-blur-[3px]"
          role="dialog"
          aria-modal="true"
          aria-label={t("SEO pages")}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSeoOpen(false);
          }}
        >
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-4xl overflow-auto rounded-[30px] bg-[#f8f7f3] p-5 shadow-[0_35px_120px_rgba(0,0,0,0.4)] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9d3151]">
                  {t("Search and sharing")}
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                  {t("SEO pages")}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#716d65]">
                  {t("Set a separate search title, description and sharing image for every public page.")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSeoOpen(false)}
                className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold"
                aria-label={t("Close")}
              >
                ×
              </button>
            </div>

            <section className="mt-7 rounded-[24px] border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    {t("SEO infrastructure")}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-emerald-950">
                    {t("Ready for published pages")}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] font-semibold">
                  <span className="rounded-full bg-white px-3 py-1.5 text-emerald-800">
                    {t("Custom 404 page")}
                  </span>
                  <Link
                    href="/robots.txt"
                    target="_blank"
                    className="rounded-full bg-white px-3 py-1.5 text-emerald-800"
                  >
                    {t("Robots directives")}
                  </Link>
                  <Link
                    href="/sitemap.xml"
                    target="_blank"
                    className="rounded-full bg-white px-3 py-1.5 text-emerald-800"
                  >
                    {t("Automatic sitemap")}
                  </Link>
                </div>
              </div>
              <p className="mt-3 text-xs leading-6 text-emerald-900/70">
                {t("Hidden and no-index pages are excluded from the sitemap.")}
              </p>
            </section>

            <div className="mt-4 grid gap-4">
              <article className="rounded-[24px] border border-black/8 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d3151]">
                      {t("Home page")}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">{draft.hero_title}</h3>
                  </div>
                  <span className="rounded-full bg-[#f2eee8] px-3 py-1.5 text-[10px] font-semibold">
                    /
                  </span>
                </div>
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <CompactField
                    label={t("SEO title")}
                    value={draft.seo_title}
                    disabled={!canConfigure}
                    onChange={(value) => onUpdate("seo_title", value.slice(0, 70))}
                  />
                  <CompactField
                    label={t("SEO description")}
                    value={draft.seo_description}
                    disabled={!canConfigure}
                    multiline
                    onChange={(value) => onUpdate("seo_description", value.slice(0, 170))}
                  />
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
                  <ImageEditor
                    label={t("SEO sharing image")}
                    value={draft.seo_image_url ?? ""}
                    disabled={!canConfigure}
                    t={t}
                    onChange={(value) => onUpdate("seo_image_url", value)}
                    onChoose={() =>
                      openMediaPicker({
                        kind: "content",
                        key: "seo_image_url",
                        label: t("SEO sharing image"),
                      })
                    }
                  />
                  <Toggle
                    label={t("Hide this page from search engines")}
                    checked={draft.seo_no_index === true}
                    disabled={!canConfigure}
                    onChange={(value) => onUpdate("seo_no_index", value)}
                  />
                </div>
              </article>

              {pages.map((page) => (
                <details
                  key={page.id}
                  className="group rounded-[24px] border border-black/8 bg-white"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 sm:px-6">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d3151]">
                        {page.type === "portfolio" ? t("Portfolio") : t("Custom page")}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">{page.nav_label}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="max-w-44 truncate rounded-full bg-[#f2eee8] px-3 py-1.5 text-[10px] font-semibold">
                        /{page.type === "custom" ? "p/" : ""}{page.slug}
                      </span>
                      <span className="text-lg transition group-open:rotate-45">+</span>
                    </div>
                  </summary>
                  <div className="grid gap-4 border-t border-black/8 p-5 sm:p-6">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <CompactField
                        label={t("SEO title")}
                        value={page.seo_title ?? ""}
                        disabled={!canConfigure}
                        onChange={(value) =>
                          updatePageById(page.id, "seo_title", value.slice(0, 70))
                        }
                      />
                      <CompactField
                        label={t("SEO description")}
                        value={page.seo_description ?? ""}
                        disabled={!canConfigure}
                        multiline
                        onChange={(value) =>
                          updatePageById(
                            page.id,
                            "seo_description",
                            value.slice(0, 170),
                          )
                        }
                      />
                    </div>
                    <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
                      <ImageEditor
                        label={t("SEO sharing image")}
                        value={page.seo_image_url ?? ""}
                        disabled={!canConfigure}
                        t={t}
                        onChange={(value) =>
                          updatePageById(page.id, "seo_image_url", value)
                        }
                        onChoose={() =>
                          openMediaPicker({
                            kind: "page",
                            pageId: page.id,
                            key: "seo_image_url",
                            label: `${t("SEO sharing image")} · ${page.nav_label}`,
                          })
                        }
                      />
                      <Toggle
                        label={t("Hide this page from search engines")}
                        checked={page.seo_no_index === true}
                        disabled={!canConfigure}
                        onChange={(value) =>
                          updatePageById(page.id, "seo_no_index", value)
                        }
                      />
                    </div>
                  </div>
                </details>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setSeoOpen(false)}
                className="rounded-xl border border-black/10 bg-white px-5 py-3 text-xs font-semibold"
              >
                {t("Close")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSeoOpen(false);
                  onSave();
                }}
                disabled={saving || !canConfigure}
                className="rounded-xl bg-[#17191f] px-5 py-3 text-xs font-semibold text-white disabled:opacity-40"
              >
                {saving ? t("Saving…") : t("Save SEO")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {mediaPickerOpen ? (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-[#17191f]/55 p-4 backdrop-blur-[3px]"
          role="dialog"
          aria-modal="true"
          aria-label={imageTarget?.label || t("Media library")}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setMediaPickerOpen(false);
              setImageTarget(null);
            }
          }}
        >
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-5xl overflow-auto rounded-[30px] bg-[#f8f7f3] p-5 shadow-[0_35px_120px_rgba(0,0,0,0.4)] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9d3151]">
                  {t("Media library")}
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                  {imageTarget?.label || t("Choose image")}
                </h2>
                <p className="mt-3 text-sm text-[#716d65]">
                  {imageTarget?.kind === "block" &&
                  imageTarget.key === "video_url"
                    ? t("Choose an existing video. Upload permissions remain controlled by the media library.")
                    : t("Choose an existing image. Upload permissions remain controlled by the media library.")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMediaPickerOpen(false);
                  setImageTarget(null);
                }}
                className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold"
                aria-label={t("Close")}
              >
                ×
              </button>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                value={mediaQuery}
                onChange={(event) => setMediaQuery(event.target.value)}
                placeholder={t("Search images")}
                className="min-h-11 flex-1 rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-[#9d3151]"
              />
              <Link
                href="/admin/media"
                target="_blank"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-5 text-xs font-semibold"
              >
                {t("Open media library")}
              </Link>
            </div>
            {mediaLoading ? (
              <p className="mt-8 text-sm text-[#716d65]">{t("Loading media…")}</p>
            ) : mediaError ? (
              <p className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                {t("Images could not be loaded for this account.")} {mediaError}
              </p>
            ) : filteredMedia.length ? (
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {filteredMedia.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectMedia(item.image_url)}
                    className="group overflow-hidden rounded-2xl border border-black/8 bg-white text-left transition hover:border-[#9d3151]/45 hover:shadow-lg"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-[#eee9e4]">
                      {item.mime_type?.startsWith("video/") ? (
                        <video
                          src={item.image_url}
                          muted
                          playsInline
                          preload="metadata"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]"
                        />
                      ) : (
                        <img
                          src={item.image_url}
                          alt={item.alt_text ?? ""}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]"
                        />
                      )}
                    </div>
                    <p className="truncate px-3 py-3 text-[11px] font-semibold">
                      {item.alt_text || item.original_filename || t("Image")}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-[#716d65]">
                {t("No suitable images were found.")}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PortfolioPagePreview({
  page,
  draft,
  portfolio,
  bookingHref,
  editingEnabled,
  selectedPart,
  onPartChange,
}: {
  page: PublicSitePage;
  draft: PublicSiteContent;
  portfolio: SiteTemplateProject[];
  bookingHref: string;
  editingEnabled: boolean;
  selectedPart: "intro" | "gallery" | "booking";
  onPartChange: (part: "intro" | "gallery" | "booking") => void;
}) {
  const editableClass = (part: typeof selectedPart) =>
    editingEnabled && selectedPart === part
      ? "ring-2 ring-inset ring-[#b58a36]"
      : editingEnabled
        ? "hover:ring-2 hover:ring-inset hover:ring-black/15"
        : "";

  return (
    <div
      className={page.is_visible === false ? "opacity-45 grayscale" : ""}
      style={{
        "--site-accent": draft.theme_accent ?? "#9d3151",
        "--site-dark": draft.theme_dark ?? "#321722",
      } as React.CSSProperties}
    >
      <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
        <span className="text-xs font-semibold uppercase tracking-[0.2em]">
          {draft.brand_name}
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-black/45">
          Главная · {page.nav_label} · {draft.contact_label}
        </span>
        <span className="rounded-full bg-[var(--site-dark)] px-4 py-2 text-[9px] font-semibold text-white">
          {draft.booking_label}
        </span>
      </div>

      <button
        type="button"
        onClick={() => editingEnabled && onPartChange("intro")}
        className={`relative block w-full overflow-hidden px-8 py-14 text-left sm:px-12 sm:py-20 ${editableClass("intro")}`}
      >
        {editingEnabled && selectedPart === "intro" ? (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-[#b58a36] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
            Редактировать
          </span>
        ) : null}
        <div className="absolute -right-24 top-6 h-72 w-72 rounded-full border border-[var(--site-accent)]/20" />
        <p className="relative text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--site-accent)]">
          {page.eyebrow}
        </p>
        <div className="relative mt-5 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <h2 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">
            {page.title}
          </h2>
          <p className="text-xs leading-6 text-black/55">{page.intro}</p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => editingEnabled && onPartChange("gallery")}
        className={`relative block w-full px-5 pb-12 text-left sm:px-8 ${editableClass("gallery")}`}
      >
        {editingEnabled && selectedPart === "gallery" ? (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-[#b58a36] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
            Редактировать
          </span>
        ) : null}
        <div className="columns-2 gap-3 sm:columns-3">
          {portfolio.map((project, index) => (
            <article
              key={project.slug}
              className="mb-3 break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              <div className={index % 4 === 0 ? "aspect-[4/5]" : "aspect-[4/3]"}>
                <img
                  src={project.imageUrl}
                  alt={project.imageAlt}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="px-3 py-3 text-[10px] font-semibold">
                {project.title}
              </p>
            </article>
          ))}
        </div>
      </button>

      {page.show_booking_cta ? (
        <button
          type="button"
          onClick={() => editingEnabled && onPartChange("booking")}
          className={`relative block w-full bg-[var(--site-dark)] px-8 py-12 text-left text-white sm:px-12 ${editableClass("booking")}`}
        >
          {editingEnabled && selectedPart === "booking" ? (
            <span className="absolute right-3 top-3 z-10 rounded-full bg-[#b58a36] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
              Редактировать
            </span>
          ) : null}
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#efc8d3]">
            ОНЛАЙН-ЗАПИСЬ
          </p>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <h3 className="max-w-xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              Выберите дизайн и свободное время
            </h3>
            <span className="rounded-full bg-white px-5 py-3 text-[10px] font-semibold text-[var(--site-dark)]">
              {draft.booking_label} · {bookingHref}
            </span>
          </div>
        </button>
      ) : null}
    </div>
  );
}

function CustomPagePreview({
  page,
  draft,
  editingEnabled,
  selectedPart,
  selectedBlockId,
  onPartChange,
  onBlockChange,
}: {
  page: PublicSitePage;
  draft: PublicSiteContent;
  editingEnabled: boolean;
  selectedPart: "intro" | "gallery" | "blocks" | "booking";
  selectedBlockId: string;
  onPartChange: (part: "intro" | "gallery" | "blocks" | "booking") => void;
  onBlockChange: (blockId: string) => void;
}) {
  const selected = (part: "intro" | "booking") =>
    editingEnabled && selectedPart === part
      ? "ring-2 ring-inset ring-[#b58a36]"
      : editingEnabled
        ? "hover:ring-2 hover:ring-inset hover:ring-black/15"
        : "";

  return (
    <div
      className={page.is_visible === false ? "opacity-45 grayscale" : ""}
      style={{
        "--site-accent": draft.theme_accent ?? "#9d3151",
        "--site-dark": draft.theme_dark ?? "#321722",
      } as React.CSSProperties}
    >
      <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
        <span className="font-serif text-xl">{draft.brand_name}</span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-black/45">
          Главная · {page.nav_label} · {draft.contact_label}
        </span>
        <span className="rounded-md bg-[var(--site-dark)] px-4 py-2 text-[9px] font-semibold text-white">
          {draft.booking_label}
        </span>
      </div>

      <button
        type="button"
        onClick={() => editingEnabled && onPartChange("intro")}
        className={`relative block w-full px-8 py-16 text-left sm:px-12 ${selected("intro")}`}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--site-accent)]">
          {page.eyebrow}
        </p>
        <h2 className="mt-5 max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">
          {page.title}
        </h2>
        <p className="mt-6 max-w-xl text-xs leading-6 text-black/55">
          {page.intro}
        </p>
      </button>

      {(page.blocks ?? []).map((block) => (
        <button
          key={block.id}
          type="button"
          onClick={() => editingEnabled && onBlockChange(block.id)}
          className={`relative block w-full text-left ${
            block.is_visible === false
              ? "opacity-35 grayscale"
              : ""
          } ${
            editingEnabled && selectedBlockId === block.id
              ? "ring-2 ring-inset ring-[#b58a36]"
              : editingEnabled
                ? "hover:ring-2 hover:ring-inset hover:ring-black/15"
                : ""
          }`}
        >
          <CustomBlockPreview block={block} />
        </button>
      ))}

      {page.show_booking_cta ? (
        <button
          type="button"
          onClick={() => editingEnabled && onPartChange("booking")}
          className={`block w-full bg-[var(--site-dark)] px-8 py-12 text-left text-white sm:px-12 ${selected("booking")}`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
            Онлайн-запись
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <h3 className="font-serif text-3xl">Выберите удобное время</h3>
            <span className="rounded-md bg-white px-5 py-3 text-[10px] font-semibold text-[var(--site-dark)]">
              {draft.booking_label}
            </span>
          </div>
        </button>
      ) : null}
    </div>
  );
}

function CustomBlockPreview({ block }: { block: PublicSiteCustomBlock }) {
  const dark = block.tone === "dark";
  const accent = block.tone === "accent";
  const style = dark
    ? "bg-[#321722] text-white"
    : accent
      ? "bg-[#9d3151] text-white"
      : "border-y border-black/8 bg-white/70 text-[#321722]";
  const mediaSize = {
    full: "w-full",
    wide: "w-full max-w-4xl",
    medium: "w-full max-w-2xl",
    compact: "w-full max-w-md",
  }[block.media_size ?? "wide"];
  const mediaAspect = {
    landscape: "aspect-video",
    classic: "aspect-[4/3]",
    square: "aspect-square",
    portrait: "aspect-[4/5]",
  }[block.media_aspect ?? "landscape"];
  const mediaFrame = {
    none: "",
    line: "rounded-xl border border-current/15 p-1",
    card: "rounded-2xl bg-white/10 p-2 shadow-lg",
  }[block.media_frame ?? "line"];
  const mediaFit =
    block.media_fit === "contain" ? "object-contain" : "object-cover";

  if (block.kind === "media_text") {
    const mediaOnRight = block.media_position !== "left";
    return (
      <div
        className={`grid gap-7 px-8 py-12 sm:px-12 lg:grid-cols-2 lg:items-center ${style}`}
      >
        <div className={mediaOnRight ? "lg:order-2" : "lg:order-1"}>
          <div className={`mx-auto ${mediaSize} ${mediaFrame} overflow-hidden`}>
            <div
              className={`relative grid place-items-center overflow-hidden bg-black/10 ${
                block.media_frame === "none" ? "" : "rounded-lg"
              } ${mediaAspect}`}
            >
              {block.media_type === "calendar" ? (
                <div className="h-full w-full bg-white p-3 text-[#321722]">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#9d3151]">
                    Календарь записи
                  </p>
                  <div className="mt-3 grid grid-cols-7 gap-1">
                    {Array.from({ length: 21 }, (_, index) => (
                      <span
                        key={index}
                        className={`grid aspect-square place-items-center rounded text-[8px] ${
                          index === 10 ? "bg-[#9d3151] text-white" : "bg-[#fff2f5]"
                        }`}
                      >
                        {index + 1}
                      </span>
                    ))}
                  </div>
                  <span className="mt-3 flex min-h-8 items-center justify-center rounded bg-[#9d3151] text-[8px] font-semibold text-white">
                    Показать свободное время
                  </span>
                </div>
              ) : block.media_type === "video" ? (
                <>
                  {block.video_poster_url ? (
                    <img
                      src={block.video_poster_url}
                      alt=""
                      className={`h-full w-full ${mediaFit} opacity-70`}
                    />
                  ) : null}
                  <span className="absolute text-4xl text-white">▶</span>
                </>
              ) : block.media_url ? (
                <img
                  src={block.media_url}
                  alt=""
                  className={`h-full w-full ${mediaFit}`}
                />
              ) : (
                <span className="text-xs opacity-45">Фото или видео</span>
              )}
            </div>
          </div>
        </div>
        <div className={mediaOnRight ? "lg:order-1" : "lg:order-2"}>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] opacity-60">
            {block.eyebrow}
          </p>
          <h3 className="mt-4 font-serif text-3xl">{block.title}</h3>
          <p className="mt-4 whitespace-pre-line text-xs leading-6 opacity-65">
            {block.text}
          </p>
          {block.button_label ? (
            <span className="mt-6 inline-flex rounded-md bg-white px-4 py-2 text-[10px] font-semibold text-[#321722]">
              {block.button_label}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={`px-8 py-12 sm:px-12 ${style}`}>
      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] opacity-60">
        {block.eyebrow}
      </p>
      <h3 className="mt-4 font-serif text-3xl">{block.title}</h3>
      {block.kind === "features" || block.kind === "columns" ? (
        <div
          className={`mt-6 grid gap-2 ${
            block.kind === "columns" && block.columns_count === 2
              ? "sm:grid-cols-2"
              : "sm:grid-cols-3"
          }`}
        >
          {(block.kind === "columns"
            ? blockColumnCards(block)
                .slice(0, block.columns_count ?? 3)
                .map((card) => ({
                  key: card.id,
                  title: card.title,
                  text: card.text,
                  image:
                    card.media_type === "image"
                      ? card.media_url
                      : card.video_poster_url,
                  video: card.media_type === "video",
                }))
            : previewLines(block.items).map((item) => ({
                key: item,
                title: item,
                text: "",
                image: "",
                video: false,
              }))
          ).map((card) => (
            <span
              key={card.key}
              className="overflow-hidden rounded-xl border border-current/15 text-[10px] leading-5"
            >
              {card.image ? (
                <span className="relative block aspect-[4/3] overflow-hidden bg-black/10">
                  <img src={card.image} alt="" className="h-full w-full object-cover" />
                  {card.video ? (
                    <span className="absolute inset-0 grid place-items-center text-2xl text-white">
                      ▶
                    </span>
                  ) : null}
                </span>
              ) : null}
              <span className="block p-3">
                <strong className="block">{card.title}</strong>
                {card.text ? (
                  <span className="mt-1 block opacity-60">{card.text}</span>
                ) : null}
              </span>
            </span>
          ))}
        </div>
      ) : block.kind !== "slider" && block.kind !== "video" ? (
        <p className="mt-4 max-w-2xl whitespace-pre-line text-xs leading-6 opacity-65">
          {block.text}
        </p>
      ) : block.text ? (
        <p className="mt-4 max-w-2xl whitespace-pre-line text-xs leading-6 opacity-65">
          {block.text}
        </p>
      ) : null}
      {block.kind === "collage" ? (
        <div
          className={`mt-6 ${
            block.media_position === "left"
              ? "mr-auto"
              : block.media_position === "right"
                ? "ml-auto"
                : "mx-auto"
          } ${mediaSize} ${mediaFrame}`}
        >
          <div
            className={`grid grid-cols-2 gap-2 overflow-hidden ${
              block.media_frame === "none" ? "" : "rounded-lg"
            }`}
          >
            {(block.media_urls ?? []).slice(0, 8).map((image, index) => (
              <div
                key={`${block.id}-collage-preview-${index}`}
                className={`relative overflow-hidden bg-black/10 ${
                  index === 0 && (block.media_urls ?? []).length >= 3
                    ? "row-span-2 min-h-40"
                    : "min-h-20"
                }`}
              >
                {image ? (
                  <img
                    src={image}
                    alt=""
                    className={`absolute inset-0 h-full w-full ${mediaFit}`}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {block.kind === "slider" ? (
        <div className={`mx-auto mt-6 ${mediaSize} ${mediaFrame}`}>
          <div className={`relative overflow-hidden bg-black/10 ${mediaAspect} ${block.media_frame === "none" ? "" : "rounded-lg"}`}>
            {(block.media_urls ?? [])[0] ? (
              <img
                src={(block.media_urls ?? [])[0]}
                alt=""
                className={`h-full w-full ${mediaFit}`}
              />
            ) : null}
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {(block.media_urls ?? []).map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full bg-white ${
                    index === 0 ? "w-5" : "w-1.5 opacity-60"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="mt-2 text-[10px] opacity-55">
            {block.slide_interval_seconds ?? 4} сек.
          </p>
        </div>
      ) : null}
      {block.kind === "video" ? (
        <div className={`mx-auto mt-6 ${mediaSize} ${mediaFrame}`}>
          <div className={`relative grid place-items-center overflow-hidden bg-black/80 text-center text-white ${mediaAspect} ${block.media_frame === "none" ? "" : "rounded-lg"}`}>
            {block.video_poster_url ? (
              <img
                src={block.video_poster_url}
                alt=""
                className={`h-full w-full ${mediaFit} opacity-70`}
              />
            ) : null}
            <span className="absolute text-4xl">▶</span>
          </div>
        </div>
      ) : null}
      {block.kind === "cta" && block.button_label ? (
        <span className="mt-6 inline-flex rounded-md bg-white px-4 py-2 text-[10px] font-semibold text-[#321722]">
          {block.button_label}
        </span>
      ) : null}
    </div>
  );
}

function VideoUrlEditor({
  value,
  disabled,
  onChange,
  onChoose,
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onChoose: () => void;
}) {
  const preview = resolveEditorVideoPreview(value);
  const invalid = Boolean(value.trim()) && !preview;

  return (
    <div className="grid gap-3 rounded-2xl border border-black/8 bg-[#faf9f6] p-3">
      <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
        Ссылка на видео
        <input
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          aria-invalid={invalid}
          className={`mt-2 min-h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none ${
            invalid
              ? "border-red-400 focus:border-red-500"
              : "border-black/10 focus:border-[#9d3151]"
          }`}
        />
      </label>

      {preview ? (
        <div className="overflow-hidden rounded-xl border border-black/10 bg-black">
          <div className="aspect-video">
            {preview.kind === "embed" ? (
              <iframe
                src={preview.url}
                title="Предпросмотр видео"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            ) : (
              <video
                src={preview.url}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full"
              />
            )}
          </div>
        </div>
      ) : invalid ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] leading-5 text-red-700">
          Ссылка не распознана. Поддерживаются YouTube, Vimeo и прямые ссылки на MP4, WebM или MOV.
        </p>
      ) : (
        <p className="text-[11px] leading-5 text-[#716d65]">
          После вставки ссылки здесь сразу появится предпросмотр.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onChoose}
          className="rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-semibold disabled:opacity-40"
        >
          Выбрать видео из медиа
        </button>
        <button
          type="button"
          disabled={disabled || !value}
          onClick={() => onChange("")}
          className="rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-semibold disabled:opacity-35"
        >
          Очистить
        </button>
      </div>
    </div>
  );
}

function ImageEditor({
  label,
  value,
  disabled,
  t,
  onChange,
  onChoose,
}: {
  label: string;
  value: string;
  disabled: boolean;
  t: ReturnType<typeof useAdminI18n>["t"];
  onChange: (value: string) => void;
  onChoose: () => void;
}) {
  return (
    <div className="rounded-2xl border border-black/8 bg-[#faf9f6] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">
        {label}
      </p>
      <div className="mt-3 grid grid-cols-[76px_1fr] gap-3">
        <div className="aspect-square overflow-hidden rounded-xl bg-[#eee9e4]">
          {value && !isInvalidImageUrl(value) ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : isInvalidImageUrl(value) ? (
            <span className="grid h-full place-items-center px-2 text-center text-[10px] font-semibold leading-4 text-red-600">
              Это ссылка на видео
            </span>
          ) : (
            <span className="grid h-full place-items-center text-xl text-black/20">＋</span>
          )}
        </div>
        <div className="min-w-0">
          <input
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/images/photo.webp"
            aria-invalid={isInvalidImageUrl(value)}
            className={`min-h-10 w-full rounded-xl border bg-white px-3 text-xs outline-none ${
              isInvalidImageUrl(value)
                ? "border-red-400 focus:border-red-500"
                : "border-black/10 focus:border-[#9d3151]"
            }`}
          />
          {isInvalidImageUrl(value) ? (
            <p className="mt-2 text-[11px] leading-5 text-red-600">
              YouTube, Vimeo и видеофайлы нужно вставлять в поле «Ссылка на видео».
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onChoose}
              disabled={disabled}
              className="rounded-lg bg-[#321722] px-3 py-2 text-[10px] font-semibold text-white disabled:opacity-40"
            >
              {t("Choose from media")}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={disabled || !value}
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[10px] font-semibold disabled:opacity-35"
            >
              {t("Clear")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DelimitedItemsEditor({
  label,
  value,
  delimiter,
  fields,
  defaults,
  disabled,
  t,
  onChange,
}: {
  label: string;
  value: string;
  delimiter?: string;
  fields: string[];
  defaults: string[];
  disabled: boolean;
  t: ReturnType<typeof useAdminI18n>["t"];
  onChange: (value: string) => void;
}) {
  const items = previewLines(value);
  const parse = (item: string) => {
    if (!delimiter || fields.length === 1) return [item];
    const [first, ...rest] = item.split(delimiter);
    return [first.trim(), rest.join(delimiter).trim()];
  };
  const serialize = (parts: string[]) =>
    delimiter && fields.length > 1
      ? `${parts[0] ?? ""} ${delimiter} ${parts[1] ?? ""}`.trim()
      : (parts[0] ?? "").trim();
  const commit = (next: string[]) => onChange(next.join("\n"));

  return (
    <div className="grid gap-3 rounded-2xl border border-black/8 bg-[#faf9f6] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">
        {label}
      </p>
      {items.map((item, index) => {
        const parts = parse(item);
        return (
          <div
            key={`${label}-${index}`}
            className="grid gap-2 rounded-xl border border-black/8 bg-white p-3"
          >
            {fields.map((field, fieldIndex) => (
              <label
                key={field}
                className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#716d65]"
              >
                {field}
                {fieldIndex === 0 || fields.length === 1 ? (
                  <input
                    value={parts[fieldIndex] ?? ""}
                    disabled={disabled}
                    onChange={(event) => {
                      const nextParts = [...parts];
                      nextParts[fieldIndex] = event.target.value;
                      const next = [...items];
                      next[index] = serialize(nextParts);
                      commit(next);
                    }}
                    className="mt-1.5 min-h-10 w-full rounded-lg border border-black/10 bg-[#faf9f6] px-3 text-sm outline-none"
                  />
                ) : (
                  <textarea
                    rows={2}
                    value={parts[fieldIndex] ?? ""}
                    disabled={disabled}
                    onChange={(event) => {
                      const nextParts = [...parts];
                      nextParts[fieldIndex] = event.target.value.replace(/\n+/g, " ");
                      const next = [...items];
                      next[index] = serialize(nextParts);
                      commit(next);
                    }}
                    className="mt-1.5 w-full rounded-lg border border-black/10 bg-[#faf9f6] px-3 py-2 text-sm outline-none"
                  />
                )}
              </label>
            ))}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                aria-label={`${label}: ${t("Up")}`}
                disabled={disabled || index === 0}
                onClick={() => {
                  const next = [...items];
                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                  commit(next);
                }}
                className="grid h-8 w-8 place-items-center rounded-full border border-black/10 disabled:opacity-25"
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`${label}: ${t("Down")}`}
                disabled={disabled || index === items.length - 1}
                onClick={() => {
                  const next = [...items];
                  [next[index + 1], next[index]] = [next[index], next[index + 1]];
                  commit(next);
                }}
                className="grid h-8 w-8 place-items-center rounded-full border border-black/10 disabled:opacity-25"
              >
                ↓
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  commit(items.filter((_, itemIndex) => itemIndex !== index))
                }
                className="rounded-full border border-red-200 px-3 text-[10px] font-semibold text-red-600 disabled:opacity-30"
              >
                {t("Remove")}
              </button>
            </div>
          </div>
        );
      })}
      <button
        type="button"
        disabled={disabled || items.length >= 20}
        onClick={() => commit([...items, serialize(defaults)])}
        className="rounded-xl border border-dashed border-[#9d3151]/45 bg-[#fff8fa] px-4 py-3 text-xs font-semibold text-[#8d2d4a] disabled:opacity-40"
      >
        {t("+ Add another")}
      </button>
    </div>
  );
}

function ColorEditor({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const normalized = /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000";
  return (
    <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">
      {label}
      <span className="mt-2 grid grid-cols-[48px_1fr] gap-2">
        <input
          type="color"
          value={normalized}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-12 cursor-pointer rounded-xl border border-black/10 bg-white p-1 disabled:cursor-not-allowed"
        />
        <input
          value={value}
          disabled={disabled}
          maxLength={7}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-11 rounded-xl border border-black/10 bg-[#faf9f6] px-3 font-mono text-sm uppercase outline-none"
        />
      </span>
    </label>
  );
}

function SocialLinksEditor({
  links,
  disabled,
  t,
  onChange,
}: {
  links: PublicSiteSocialLink[];
  disabled: boolean;
  t: ReturnType<typeof useAdminI18n>["t"];
  onChange: (links: PublicSiteSocialLink[]) => void;
}) {
  function updateLink(
    id: string,
    key: "platform" | "url",
    value: string,
  ) {
    onChange(
      links.map((link) =>
        link.id === id ? { ...link, [key]: value } : link,
      ),
    );
  }

  return (
    <div className="grid gap-3">
      {links.map((link, index) => (
        <div
          key={link.id}
          className="grid gap-2 rounded-xl border border-black/8 bg-[#faf9f6] p-3"
        >
          <label className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
            {t("Network")}
            <input
              value={link.platform}
              disabled={disabled}
              placeholder="Instagram"
              onChange={(event) =>
                updateLink(link.id, "platform", event.target.value)
              }
              className="mt-1.5 min-h-10 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none"
            />
          </label>
          <label className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
            {t("Link")}
            <input
              type="url"
              value={link.url}
              disabled={disabled}
              placeholder="https://"
              onChange={(event) =>
                updateLink(link.id, "url", event.target.value)
              }
              className="mt-1.5 min-h-10 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={disabled || index === 0}
              onClick={() => {
                const next = [...links];
                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                onChange(next);
              }}
              className="grid h-8 w-8 place-items-center rounded-full border border-black/10 disabled:opacity-25"
            >
              ↑
            </button>
            <button
              type="button"
              disabled={disabled || index === links.length - 1}
              onClick={() => {
                const next = [...links];
                [next[index + 1], next[index]] = [next[index], next[index + 1]];
                onChange(next);
              }}
              className="grid h-8 w-8 place-items-center rounded-full border border-black/10 disabled:opacity-25"
            >
              ↓
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange(links.filter((item) => item.id !== link.id))
              }
              className="rounded-full border border-red-200 px-3 text-[10px] font-semibold text-red-600 disabled:opacity-30"
            >
              {t("Remove")}
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        disabled={disabled || links.length >= 12}
        onClick={() =>
          onChange([
            ...links,
            {
              id: `social-${Date.now()}`,
              platform: "Instagram",
              url: "",
            },
          ])
        }
        className="rounded-xl border border-dashed border-[#9d3151]/45 bg-[#fff8fa] px-4 py-3 text-xs font-semibold text-[#8d2d4a] disabled:opacity-40"
      >
        {t("+ Add social network")}
      </button>
    </div>
  );
}

function ImageListEditor({
  label,
  values,
  count,
  disabled,
  t,
  onChange,
  onChoose,
}: {
  label: string;
  values: string[];
  count: number;
  disabled: boolean;
  t: ReturnType<typeof useAdminI18n>["t"];
  onChange: (index: number, value: string) => void;
  onChoose: (index: number) => void;
}) {
  return (
    <div className="grid gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">
        {label}
      </p>
      {Array.from({ length: count }, (_, index) => (
        <ImageEditor
          key={index}
          label={`${label} ${index + 1}`}
          value={values[index] ?? ""}
          disabled={disabled}
          t={t}
          onChange={(value) => onChange(index, value)}
          onChoose={() => onChoose(index)}
        />
      ))}
    </div>
  );
}

function TeamEditor({
  items,
  images,
  disabled,
  t,
  onChange,
  onChooseImage,
}: {
  items: string;
  images: string[];
  disabled: boolean;
  t: ReturnType<typeof useAdminI18n>["t"];
  onChange: (items: string, images: string[]) => void;
  onChooseImage: (index: number) => void;
}) {
  const members = previewLines(items).map((item, index) => {
    const [name = "", role = "", ...descriptionParts] = item
      .split("·")
      .map((part) => part.trim());

    return {
      name,
      role,
      description: descriptionParts.join(" · "),
      image: images[index] ?? "",
    };
  });

  const serialize = (
    nextMembers: Array<{
      name: string;
      role: string;
      description: string;
      image: string;
    }>,
  ) => {
    const nextItems = nextMembers
      .map(({ name, role, description }) =>
        [name.trim(), role.trim(), description.trim()].join(" · "),
      )
      .join("\n");
    const nextImages = nextMembers.map(({ image }) => image);
    onChange(nextItems, nextImages);
  };

  const updateMember = (
    index: number,
    changes: Partial<(typeof members)[number]>,
  ) => {
    const next = members.map((member, memberIndex) =>
      memberIndex === index ? { ...member, ...changes } : member,
    );
    serialize(next);
  };

  return (
    <div className="grid gap-3">
      <div className="rounded-2xl border border-[#9d3151]/15 bg-[#fff8fa] px-4 py-3 text-[11px] leading-5 text-[#716d65]">
        Фото, имя, роль и описание теперь собраны в одной карточке сотрудника.
        При перестановке карточки фотография переезжает вместе с текстом.
      </div>

      {members.map((member, index) => (
        <article
          key={`team-member-${index}`}
          className="grid gap-3 rounded-2xl border border-black/8 bg-[#faf9f6] p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold">
              Сотрудник {index + 1}
            </p>
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                serialize(
                  members.filter((_, memberIndex) => memberIndex !== index),
                )
              }
              className="text-[10px] font-semibold text-red-600 disabled:opacity-40"
            >
              {t("Remove")}
            </button>
          </div>

          <ImageEditor
            label={t("Team photo")}
            value={member.image}
            disabled={disabled}
            t={t}
            onChange={(value) => updateMember(index, { image: value })}
            onChoose={() => onChooseImage(index)}
          />

          <CompactField
            label={t("Name")}
            value={member.name}
            disabled={disabled}
            onChange={(value) => updateMember(index, { name: value })}
          />

          <CompactField
            label="Роль"
            value={member.role}
            disabled={disabled}
            onChange={(value) => updateMember(index, { role: value })}
          />

          <CompactField
            label={t("Description")}
            value={member.description}
            disabled={disabled}
            multiline
            onChange={(value) =>
              updateMember(index, {
                description: value.replace(/\n+/g, " "),
              })
            }
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              aria-label={`Сотрудник: ${t("Up")}`}
              disabled={disabled || index === 0}
              onClick={() => {
                const next = [...members];
                [next[index - 1], next[index]] = [
                  next[index],
                  next[index - 1],
                ];
                serialize(next);
              }}
              className="grid h-8 w-8 place-items-center rounded-full border border-black/10 disabled:opacity-25"
            >
              ↑
            </button>
            <button
              type="button"
              aria-label={`Сотрудник: ${t("Down")}`}
              disabled={disabled || index === members.length - 1}
              onClick={() => {
                const next = [...members];
                [next[index + 1], next[index]] = [
                  next[index],
                  next[index + 1],
                ];
                serialize(next);
              }}
              className="grid h-8 w-8 place-items-center rounded-full border border-black/10 disabled:opacity-25"
            >
              ↓
            </button>
          </div>
        </article>
      ))}

      <button
        type="button"
        disabled={disabled || members.length >= 12}
        onClick={() =>
          serialize([
            ...members,
            {
              name: t("New team member"),
              role: "",
              description: "",
              image: "",
            },
          ])
        }
        className="rounded-xl border border-dashed border-[#9d3151]/45 bg-[#fff8fa] px-4 py-3 text-xs font-semibold text-[#8d2d4a] disabled:opacity-40"
      >
        {t("+ Add another")}
      </button>
    </div>
  );
}

function ReviewsEditor({
  reviews,
  disabled,
  t,
  onChange,
}: {
  reviews: PublicSiteReview[];
  disabled: boolean;
  t: ReturnType<typeof useAdminI18n>["t"];
  onChange: (reviews: PublicSiteReview[]) => void;
}) {
  const updateReview = <Key extends keyof PublicSiteReview>(
    id: string,
    key: Key,
    value: PublicSiteReview[Key],
  ) => {
    onChange(
      reviews.map((review) =>
        review.id === id ? { ...review, [key]: value } : review,
      ),
    );
  };

  return (
    <div className="grid gap-3">
      <p className="text-xs leading-6 text-[#716d65]">
        {t("Add real client reviews with an author, rating and optional source link.")}
      </p>
      {reviews.map((review, index) => (
        <article
          key={review.id}
          className="grid gap-3 rounded-2xl border border-black/8 bg-[#faf9f6] p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold">
              {t("Review")} {index + 1}
            </p>
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange(reviews.filter((item) => item.id !== review.id))
              }
              className="text-[10px] font-semibold text-red-600 disabled:opacity-40"
            >
              {t("Remove")}
            </button>
          </div>
          <CompactField
            label={t("Client name")}
            value={review.author}
            disabled={disabled}
            onChange={(value) => updateReview(review.id, "author", value)}
          />
          <CompactField
            label={t("Review text")}
            value={review.text}
            disabled={disabled}
            multiline
            onChange={(value) => updateReview(review.id, "text", value)}
          />
          <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">
            {t("Rating")}
            <select
              value={review.rating}
              disabled={disabled}
              onChange={(event) =>
                updateReview(review.id, "rating", Number(event.target.value))
              }
              className="mt-2 min-h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none"
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {"★".repeat(rating)} ({rating})
                </option>
              ))}
            </select>
          </label>
          <CompactField
            label={t("Source")}
            value={review.source ?? ""}
            disabled={disabled}
            onChange={(value) => updateReview(review.id, "source", value)}
          />
          <CompactField
            label={t("Source link")}
            value={review.source_url ?? ""}
            disabled={disabled}
            onChange={(value) => updateReview(review.id, "source_url", value)}
          />
        </article>
      ))}
      <button
        type="button"
        disabled={disabled || reviews.length >= 12}
        onClick={() =>
          onChange([
            ...reviews,
            {
              id: `review-${Date.now()}`,
              author: "",
              text: "",
              rating: 5,
              source: "",
              source_url: "",
            },
          ])
        }
        className="rounded-xl border border-dashed border-[#9d3151]/45 bg-[#fff8fa] px-4 py-3 text-xs font-semibold text-[#8d2d4a] disabled:opacity-40"
      >
        {t("+ Add review")}
      </button>
    </div>
  );
}

function ColumnCardsEditor({
  block,
  disabled,
  t,
  onChange,
  onChooseImage,
}: {
  block: PublicSiteCustomBlock;
  disabled: boolean;
  t: ReturnType<typeof useAdminI18n>["t"];
  onChange: (cards: PublicSiteColumnCard[]) => void;
  onChooseImage: (
    cardIndex: number,
    key: "media_url" | "video_url" | "video_poster_url",
    label: string,
  ) => void;
}) {
  const count = block.columns_count ?? 3;
  const cards = [...blockColumnCards(block)];
  while (cards.length < 3) {
    cards.push(defaultColumnCards(block.id)[cards.length]);
  }
  const updateCard = (
    index: number,
    changes: Partial<PublicSiteColumnCard>,
  ) => {
    const next = [...cards];
    next[index] = { ...next[index], ...changes };
    onChange(next);
  };

  return (
    <div className="grid gap-3 rounded-2xl border border-black/8 bg-[#faf9f6] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">
        {t("Column cards")}
      </p>
      {cards.slice(0, count).map((card, index) => (
        <section
          key={card.id}
          className="grid gap-3 rounded-xl border border-black/8 bg-white p-3"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9d3151]">
            {t("Content card")} {index + 1}
          </p>
          <CompactField
            label={t("Heading")}
            value={card.title}
            disabled={disabled}
            onChange={(value) => updateCard(index, { title: value })}
          />
          <CompactField
            label={t("Description")}
            value={card.text}
            disabled={disabled}
            onChange={(value) => updateCard(index, { text: value })}
            multiline
          />
          <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
            {t("Card content")}
            <select
              value={card.media_type}
              disabled={disabled}
              onChange={(event) =>
                updateCard(index, {
                  media_type: event.target.value as PublicSiteColumnCard["media_type"],
                })
              }
              className="mt-2 w-full rounded-xl border border-black/10 bg-[#faf9f6] px-3 py-3 text-sm"
            >
              <option value="none">{t("Text only")}</option>
              <option value="image">{t("Image and text")}</option>
              <option value="video">{t("Video and text")}</option>
            </select>
          </label>
          {card.media_type === "image" ? (
            <>
              <ImageEditor
                label={t("Card image")}
                value={card.media_url ?? ""}
                disabled={disabled}
                t={t}
                onChange={(value) => updateCard(index, { media_url: value })}
                onChoose={() =>
                  onChooseImage(index, "media_url", `${t("Card image")} ${index + 1}`)
                }
              />
              <CompactField
                label={t("Alternative text")}
                value={card.media_alt ?? ""}
                disabled={disabled}
                onChange={(value) =>
                  updateCard(index, { media_alt: value.slice(0, 180) })
                }
              />
            </>
          ) : null}
          {card.media_type === "video" ? (
            <>
              <CompactField
                label={t("Video link")}
                value={card.video_url ?? ""}
                disabled={disabled}
                onChange={(value) => updateCard(index, { video_url: value })}
              />
              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  onChooseImage(index, "video_url", `${t("Card video")} ${index + 1}`)
                }
                className="rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-semibold disabled:opacity-40"
              >
                {t("Choose video from media")}
              </button>
              <ImageEditor
                label={t("Video cover")}
                value={card.video_poster_url ?? ""}
                disabled={disabled}
                t={t}
                onChange={(value) =>
                  updateCard(index, { video_poster_url: value })
                }
                onChoose={() =>
                  onChooseImage(
                    index,
                    "video_poster_url",
                    `${t("Video cover")} ${index + 1}`,
                  )
                }
              />
            </>
          ) : null}
        </section>
      ))}
    </div>
  );
}

function CustomBlockSettings({
  block,
  disabled,
  t,
  onChange,
  onRemove,
  onChooseImage,
  onChooseListImage,
  onChooseCardImage,
}: {
  block: PublicSiteCustomBlock;
  disabled: boolean;
  t: ReturnType<typeof useAdminI18n>["t"];
  onChange: <Key extends keyof PublicSiteCustomBlock>(
    key: Key,
    value: PublicSiteCustomBlock[Key],
  ) => void;
  onRemove: () => void;
  onChooseImage: (
    key: "video_poster_url" | "media_url" | "video_url",
    label: string,
  ) => void;
  onChooseListImage: (index: number, label: string) => void;
  onChooseCardImage: (
    cardIndex: number,
    key: "media_url" | "video_url" | "video_poster_url",
    label: string,
  ) => void;
}) {
  const sliderImages = block.media_urls ?? [];
  const collageImages = block.media_urls ?? [];

  return (
    <>
      <Toggle
        label={t("Show block on site")}
        checked={block.is_visible !== false}
        disabled={disabled}
        onChange={(value) => onChange("is_visible", value)}
      />
      <CompactField label={t("Eyebrow")} value={block.eyebrow} disabled={disabled} onChange={(value) => onChange("eyebrow", value)} />
      <CompactField label={t("Heading")} value={block.title} disabled={disabled} onChange={(value) => onChange("title", value)} multiline />
      {block.kind === "features" ? (
        <DelimitedItemsEditor
          label={t("Feature cards")}
          value={block.items}
          delimiter="·"
          fields={[t("Heading"), t("Description")]}
          defaults={[t("New advantage"), ""]}
          disabled={disabled}
          t={t}
          onChange={(value) => onChange("items", value)}
        />
      ) : block.kind === "columns" ? (
        <ColumnCardsEditor
          block={block}
          disabled={disabled}
          t={t}
          onChange={(cards) => onChange("cards", cards)}
          onChooseImage={onChooseCardImage}
        />
      ) : (
        <CompactField label={t("Text")} value={block.text} disabled={disabled} onChange={(value) => onChange("text", value)} multiline />
      )}
      {block.kind === "columns" ? (
        <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">
          {t("Number of columns")}
          <select
            value={block.columns_count ?? 3}
            disabled={disabled}
            onChange={(event) =>
              onChange(
                "columns_count",
                Number(event.target.value) === 2 ? 2 : 3,
              )
            }
            className="mt-2 w-full rounded-xl border border-black/10 bg-[#faf9f6] px-3 py-3 text-sm outline-none"
          >
            <option value={2}>{t("Two columns")}</option>
            <option value={3}>{t("Three columns")}</option>
          </select>
        </label>
      ) : null}
      {block.kind === "cta" || block.kind === "media_text" ? (
        <>
          <CompactField label={t("Button")} value={block.button_label} disabled={disabled} onChange={(value) => onChange("button_label", value)} />
          <CompactField label={t("Button link")} value={block.button_url} disabled={disabled} onChange={(value) => onChange("button_url", value)} />
        </>
      ) : null}
      {block.kind === "media_text" ? (
        <div className="grid gap-3 rounded-2xl border border-black/8 bg-[#faf9f6] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">
            {t("Media beside text")}
          </p>
          <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
            {t("Media type")}
            <select
              value={block.media_type ?? "image"}
              disabled={disabled}
              onChange={(event) =>
                onChange(
                  "media_type",
                  event.target.value === "video"
                    ? "video"
                    : event.target.value === "calendar"
                      ? "calendar"
                      : "image",
                )
              }
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm"
            >
              <option value="image">{t("Image")}</option>
              <option value="video">{t("Video")}</option>
              <option value="calendar">{t("Booking calendar")}</option>
            </select>
          </label>
          <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
            {t("Media position")}
            <select
              value={block.media_position ?? "right"}
              disabled={disabled}
              onChange={(event) =>
                onChange(
                  "media_position",
                  event.target.value === "left" ? "left" : "right",
                )
              }
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm"
            >
              <option value="left">{t("Left")}</option>
              <option value="right">{t("Right")}</option>
            </select>
          </label>
          {block.media_type === "calendar" ? (
            <p className="rounded-xl border border-[#9d3151]/20 bg-[#fff8fa] px-4 py-3 text-xs leading-6 text-[#77515d]">
              {t("The live booking calendar will appear beside the text and use real services and availability.")}
            </p>
          ) : block.media_type === "video" ? (
            <>
              <VideoUrlEditor
                value={block.video_url ?? ""}
                disabled={disabled}
                onChange={(value) => onChange("video_url", value)}
                onChoose={() =>
                  onChooseImage("video_url", t("Video from media"))
                }
              />
              <ImageEditor
                label={t("Video cover")}
                value={block.video_poster_url ?? ""}
                disabled={disabled}
                t={t}
                onChange={(value) => onChange("video_poster_url", value)}
                onChoose={() =>
                  onChooseImage("video_poster_url", t("Video cover"))
                }
              />
            </>
          ) : (
            <>
              <ImageEditor
                label={t("Image beside text")}
                value={block.media_url ?? ""}
                disabled={disabled}
                t={t}
                onChange={(value) => onChange("media_url", value)}
                onChoose={() =>
                  onChooseImage("media_url", t("Image beside text"))
                }
              />
              <CompactField
                label={t("Alternative text")}
                value={block.media_alt ?? ""}
                disabled={disabled}
                onChange={(value) => onChange("media_alt", value.slice(0, 180))}
              />
            </>
          )}
        </div>
      ) : null}
      {block.kind === "slider" ? (
        <div className="grid gap-3">
          <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">
            {t("Slide interval, seconds")}
            <input
              type="number"
              min={2}
              max={30}
              step={1}
              value={block.slide_interval_seconds ?? 4}
              disabled={disabled}
              onChange={(event) =>
                onChange(
                  "slide_interval_seconds",
                  Math.min(30, Math.max(2, Number(event.target.value) || 2)),
                )
              }
              className="mt-2 min-h-11 w-full rounded-xl border border-black/10 bg-[#faf9f6] px-3 text-sm outline-none"
            />
          </label>
          {sliderImages.map((image, index) => (
            <div key={`${block.id}-slide-${index}`} className="grid gap-2">
              <ImageEditor
                label={`${t("Slide")} ${index + 1}`}
                value={image}
                disabled={disabled}
                t={t}
                onChange={(value) => {
                  const values = [...sliderImages];
                  values[index] = value;
                  onChange("media_urls", values);
                }}
                onChoose={() =>
                  onChooseListImage(index, `${t("Slide")} ${index + 1}`)
                }
              />
              <button
                type="button"
                disabled={disabled || sliderImages.length <= 2}
                onClick={() =>
                  onChange(
                    "media_urls",
                    sliderImages.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                className="justify-self-end text-[10px] font-semibold text-red-600 disabled:opacity-35"
              >
                {t("Remove slide")}
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={disabled || sliderImages.length >= 12}
            onClick={() => onChange("media_urls", [...sliderImages, ""])}
            className="rounded-xl border border-dashed border-[#9d3151]/45 bg-[#fff8fa] px-4 py-3 text-xs font-semibold text-[#8d2d4a] disabled:opacity-40"
          >
            {t("+ Add slide")}
          </button>
        </div>
      ) : null}
      {block.kind === "collage" ? (
        <div className="grid gap-3 rounded-2xl border border-black/8 bg-[#faf9f6] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">
            Коллаж
          </p>
          <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
            Расположение
            <select
              value={block.media_position ?? "center"}
              disabled={disabled}
              onChange={(event) =>
                onChange(
                  "media_position",
                  event.target.value === "left"
                    ? "left"
                    : event.target.value === "right"
                      ? "right"
                      : "center",
                )
              }
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm"
            >
              <option value="left">Слева</option>
              <option value="center">По центру</option>
              <option value="right">Справа</option>
            </select>
          </label>
          {collageImages.slice(0, 8).map((image, index) => (
            <div key={`${block.id}-collage-${index}`} className="grid gap-2">
              <ImageEditor
                label={`Фото ${index + 1}`}
                value={image}
                disabled={disabled}
                t={t}
                onChange={(value) => {
                  const values = [...collageImages];
                  values[index] = value;
                  onChange("media_urls", values);
                }}
                onChoose={() =>
                  onChooseListImage(index, `Фото коллажа ${index + 1}`)
                }
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  disabled={disabled || index === 0}
                  onClick={() => {
                    const values = [...collageImages];
                    [values[index - 1], values[index]] = [
                      values[index],
                      values[index - 1],
                    ];
                    onChange("media_urls", values);
                  }}
                  className="text-[10px] font-semibold text-[#725924] disabled:opacity-30"
                >
                  Выше
                </button>
                <button
                  type="button"
                  disabled={disabled || index >= collageImages.length - 1}
                  onClick={() => {
                    const values = [...collageImages];
                    [values[index], values[index + 1]] = [
                      values[index + 1],
                      values[index],
                    ];
                    onChange("media_urls", values);
                  }}
                  className="text-[10px] font-semibold text-[#725924] disabled:opacity-30"
                >
                  Ниже
                </button>
                <button
                  type="button"
                  disabled={disabled || collageImages.length <= 2}
                  onClick={() =>
                    onChange(
                      "media_urls",
                      collageImages.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  className="text-[10px] font-semibold text-red-600 disabled:opacity-35"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            disabled={disabled || collageImages.length >= 8}
            onClick={() =>
              onChange("media_urls", [...collageImages, ""])
            }
            className="rounded-xl border border-dashed border-[#9d3151]/30 bg-white px-4 py-3 text-xs font-semibold text-[#8d2d4a] disabled:opacity-40"
          >
            + Добавить фотографию
          </button>
          <p className="text-[11px] leading-5 text-[#716d65]">
            Можно добавить от 2 до 8 фотографий. Первый кадр становится главным.
          </p>
        </div>
      ) : null}
      {block.kind === "video" ? (
        <>
          <VideoUrlEditor
            value={block.video_url ?? ""}
            disabled={disabled}
            onChange={(value) => onChange("video_url", value)}
            onChoose={() =>
              onChooseImage("video_url", t("Video from media"))
            }
          />
          <ImageEditor
            label={t("Video cover")}
            value={block.video_poster_url ?? ""}
            disabled={disabled}
            t={t}
            onChange={(value) => onChange("video_poster_url", value)}
            onChoose={() =>
              onChooseImage("video_poster_url", t("Video cover"))
            }
          />
        </>
      ) : null}
      {block.kind === "slider" ||
      block.kind === "video" ||
      block.kind === "media_text" ? (
        <div className="grid gap-3 rounded-2xl border border-black/8 bg-[#faf9f6] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">
            {t("Media display")}
          </p>
          <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
            {t("Size")}
            <select
              value={block.media_size ?? "wide"}
              disabled={disabled}
              onChange={(event) =>
                onChange(
                  "media_size",
                  event.target.value as NonNullable<
                    PublicSiteCustomBlock["media_size"]
                  >,
                )
              }
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm"
            >
              <option value="full">{t("Full width")}</option>
              <option value="wide">{t("Large")}</option>
              <option value="medium">{t("Medium")}</option>
              <option value="compact">{t("Small")}</option>
            </select>
          </label>
          <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
            {t("Proportions")}
            <select
              value={block.media_aspect ?? "landscape"}
              disabled={disabled}
              onChange={(event) =>
                onChange(
                  "media_aspect",
                  event.target.value as NonNullable<
                    PublicSiteCustomBlock["media_aspect"]
                  >,
                )
              }
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm"
            >
              <option value="landscape">16:9</option>
              <option value="classic">4:3</option>
              <option value="square">1:1</option>
              <option value="portrait">4:5</option>
            </select>
          </label>
          <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
            {t("Image fit")}
            <select
              value={block.media_fit ?? "cover"}
              disabled={disabled}
              onChange={(event) =>
                onChange(
                  "media_fit",
                  event.target.value as NonNullable<
                    PublicSiteCustomBlock["media_fit"]
                  >,
                )
              }
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm"
            >
              <option value="cover">{t("Fill and crop")}</option>
              <option value="contain">{t("Show whole image")}</option>
            </select>
          </label>
          <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
            {t("Frame")}
            <select
              value={block.media_frame ?? "line"}
              disabled={disabled}
              onChange={(event) =>
                onChange(
                  "media_frame",
                  event.target.value as NonNullable<
                    PublicSiteCustomBlock["media_frame"]
                  >,
                )
              }
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm"
            >
              <option value="none">{t("No frame")}</option>
              <option value="line">{t("Thin frame")}</option>
              <option value="card">{t("Card with shadow")}</option>
            </select>
          </label>
        </div>
      ) : null}
      <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">
        {t("Block style")}
        <select
          value={block.tone}
          disabled={disabled}
          onChange={(event) =>
            onChange(
              "tone",
              event.target.value as PublicSiteCustomBlock["tone"],
            )
          }
          className="mt-2 w-full rounded-xl border border-black/10 bg-[#faf9f6] px-3 py-3 text-sm outline-none"
        >
          <option value="light">{t("Light")}</option>
          <option value="accent">{t("Accent")}</option>
          <option value="dark">{t("Dark")}</option>
        </select>
      </label>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 disabled:opacity-40"
      >
        {t("Remove block")}
      </button>
    </>
  );
}

function previewLines(value?: string) {
  return (value ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function CanvasSectionPreview({
  section,
  draft,
  services,
  portfolio,
}: {
  section: PublicSiteSection;
  draft: PublicSiteContent;
  services: SiteTemplateService[];
  portfolio: SiteTemplateProject[];
}) {
  if (section === "services" && services.length) {
    const serviceImages = draft.service_image_urls ?? glossServiceImages;
    return (
      <div className="mt-7 grid gap-2 sm:grid-cols-3">
        {services.slice(0, 3).map((service, index) => (
          <article key={service.slug} className="overflow-hidden rounded-2xl border border-white/12 bg-white/5">
            {serviceImages[index] ? (
              <img
                src={serviceImages[index]}
                alt=""
                className="aspect-[16/8] w-full object-cover"
              />
            ) : null}
            <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[9px] uppercase tracking-[0.14em] text-white/45">
                {service.durationMinutes} min
              </span>
              <span className="text-xs font-semibold text-[#f0cad5]">
                {(service.priceMinor / 100).toFixed(0)}
              </span>
            </div>
            <h4 className="mt-5 text-sm font-semibold">{service.title}</h4>
            <p className="mt-2 line-clamp-2 text-[10px] leading-5 text-white/50">
              {service.description}
            </p>
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (section === "portfolio" && portfolio.length) {
    return (
      <div className="mt-7 grid gap-3 lg:grid-cols-[1.45fr_0.7fr]">
        <div className="grid grid-cols-5 gap-1.5">
          {portfolio.slice(0, 10).map((project) => (
            <div key={project.slug} className="aspect-[4/5] overflow-hidden rounded-lg bg-[#eadde0]">
              <img src={project.imageUrl} alt={project.imageAlt} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-black/8 bg-white p-3">
          <p className="font-serif text-lg text-[#321722]">
            {draft.popular_title || "Чаще выбирают"}
          </p>
          <div className="mt-2 grid gap-2">
            {services.slice(0, 3).map((service, index) => (
              <div key={service.slug} className="grid grid-cols-[42px_1fr] overflow-hidden rounded-lg border border-black/8">
                <img src={portfolio[index]?.imageUrl} alt="" className="h-11 w-11 object-cover" />
                <span className="self-center px-2 text-[9px] font-semibold text-[#321722]">
                  {service.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (section === "team") {
    const members = previewLines(draft.team_items);
    const teamImages = draft.team_image_urls ?? glossMasterImages;
    return (
      <div className="mt-7 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member, index) => {
          const [name = "", role = "", ...descriptionParts] = member
            .split("·")
            .map((item) => item.trim());
          const description = descriptionParts.join(" · ");
          return (
            <article
              key={`${member}-${index}`}
              className="overflow-hidden rounded-2xl border border-black/8 bg-white/70"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#eadde0]">
                <img
                  src={teamImages[index] || glossMasterImages[index % glossMasterImages.length]}
                  alt={name}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="p-4">
                <h4 className="text-sm font-semibold">{name}</h4>
                {role ? (
                  <p
                    className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: draft.theme_accent ?? "#9d3151" }}
                  >
                    {role}
                  </p>
                ) : null}
                {description ? (
                  <p className="mt-2 text-[10px] leading-5 text-black/50">
                    {description}
                  </p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  if (section === "booking") {
    return (
      <div className="mt-7 rounded-2xl border border-black/8 bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {["Выберите услугу", "Любой мастер", "Выберите дату", "Любое время"].map((label) => (
            <span key={label} className="rounded-xl border border-black/10 px-3 py-3 text-[10px] text-black/45">
              {label}
            </span>
          ))}
        </div>
        <span className="mt-3 flex min-h-10 items-center justify-center rounded-xl bg-[#a60918] text-[10px] font-semibold text-white">
          Показать свободное время
        </span>
      </div>
    );
  }

  if (section === "reviews") {
    const reviews = publicSiteReviews(draft);
    return (
      <div className="mt-7 grid gap-2 sm:grid-cols-2">
        {reviews.map((review) => (
          <blockquote key={review.id} className="rounded-2xl border border-black/8 bg-white/70 p-4 text-xs leading-6 text-black/60">
            <span className="block text-[#9d3151]">
              {"★".repeat(review.rating)}
            </span>
            <span className="mt-2 block">{review.text}</span>
            <footer className="mt-3 font-semibold text-black/75">
              {review.author}
              {review.source ? ` · ${review.source}` : ""}
            </footer>
          </blockquote>
        ))}
      </div>
    );
  }

  if (section === "membership") {
    return (
      <div className="relative mt-7 min-h-44 overflow-hidden rounded-2xl p-5 text-white">
        <img
          src={draft.membership_image_url || glossMembershipImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#650a11] via-[#650a11]/80 to-transparent" />
        <div className="grid gap-2 sm:grid-cols-3">
          {previewLines(draft.membership_text).map((benefit) => (
            <p key={benefit} className="relative rounded-xl border border-white/15 bg-black/10 px-3 py-3 text-[10px] leading-5">
              ✓ {benefit}
            </p>
          ))}
        </div>
      </div>
    );
  }

  if (section === "safety") {
    return (
      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        {previewLines(draft.safety_items).slice(0, 3).map((item, index) => {
          const [title, ...detail] = item.split("·");
          return (
            <article key={item} className="rounded-2xl border border-black/8 bg-white/70 p-4">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-[#9d3151]/25 text-lg text-[#9d3151]">
                {index === 0 ? "⌁" : index === 1 ? "◒" : "◇"}
              </span>
              <h4 className="mt-4 text-xs font-semibold">{title.trim()}</h4>
              <p className="mt-2 text-[10px] leading-5 text-black/45">
                {detail.join("·").trim()}
              </p>
            </article>
          );
        })}
      </div>
    );
  }

  if (section === "gift") {
    return (
      <div className="mt-7 grid gap-3 rounded-2xl border border-black/8 bg-white/65 p-5 sm:grid-cols-[0.75fr_1.25fr]">
        <div className="relative min-h-24 overflow-hidden rounded-xl">
          <img
            src={draft.gift_image_url || glossGiftImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/15" />
        </div>
        <p className="self-center whitespace-pre-line text-xs leading-6 text-black/55">
          {draft.gift_text}
        </p>
      </div>
    );
  }

  if (section === "faq") {
    const faqItems = previewLines(draft.faq_items);

    return (
      <div className="mt-7 divide-y divide-black/10 border-y border-black/10">
        {faqItems.length ? (
          faqItems.map((item, index) => {
            const [question, ...answer] = item.split("|");
            const answerText = answer.join("|").trim();

            return (
              <details
                key={`${item}-${index}`}
                className="group py-3"
                open={index === 0}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-xs font-semibold">
                  <span>{question.trim()}</span>
                  <span
                    className="transition group-open:rotate-45"
                    style={{ color: draft.theme_accent ?? "#9d3151" }}
                  >
                    +
                  </span>
                </summary>
                {answerText ? (
                  <p className="mt-3 pr-8 text-[11px] leading-5 text-black/55">
                    {answerText}
                  </p>
                ) : (
                  <p className="mt-3 pr-8 text-[11px] italic leading-5 text-black/35">
                    Добавьте ответ справа
                  </p>
                )}
              </details>
            );
          })
        ) : (
          <div className="py-6 text-center text-[11px] text-black/40">
            Добавьте первый вопрос справа
          </div>
        )}
      </div>
    );
  }

  if (section === "about") {
    return (
      <p className="mt-7 max-w-2xl text-xs leading-6 text-black/55">
        {draft.about_text}
      </p>
    );
  }

  if (section === "contact") {
    return (
      <div className="mt-7 grid overflow-hidden rounded-2xl border border-black/10 bg-white sm:grid-cols-[0.85fr_1.15fr]">
        <div className="p-5 text-[10px] leading-6 text-black/50">
          <p>◷ {draft.contact_hours || "Ежедневно: 09:00–21:00"}</p>
          <p>⌖ {draft.contact_address || "Адрес студии"}</p>
          <p>✉ Email · ☎ Телефон</p>
        </div>
        <div className="relative min-h-28 bg-[#eee7df]">
          <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(#c9c1b7_1px,transparent_1px),linear-gradient(90deg,#c9c1b7_1px,transparent_1px)] [background-size:22px_22px]" />
          <span className="absolute left-1/2 top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#a60918] text-white">
            ●
          </span>
          <span className="absolute inset-x-3 bottom-2 truncate text-center text-[8px] text-black/40">
            {draft.map_query || draft.contact_address || "Адрес для карты"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-7 grid grid-cols-2 gap-3">
      <span className="h-20 rounded-2xl border border-current/10" />
      <span className="h-20 rounded-2xl border border-current/10" />
    </div>
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

function CanvasBlock({
  active,
  muted,
  order,
  onClick,
  children,
}: {
  active: boolean;
  muted?: boolean;
  order?: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={order === undefined ? undefined : { order }}
      className={`relative block w-full text-left outline-none transition ${muted ? "opacity-35 grayscale" : ""} ${active ? "ring-2 ring-inset ring-[#b58a36]" : "hover:ring-2 hover:ring-inset hover:ring-black/15"}`}
    >
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

function MoveControls({
  disabled,
  first,
  last,
  t,
  onUp,
  onDown,
}: {
  disabled: boolean;
  first: boolean;
  last: boolean;
  t: ReturnType<typeof useAdminI18n>["t"];
  onUp: () => void;
  onDown: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        disabled={disabled || first}
        onClick={onUp}
        className="rounded-xl border border-black/10 px-3 py-3 text-xs font-semibold disabled:opacity-30"
      >
        ↑ {t("Up")}
      </button>
      <button
        type="button"
        disabled={disabled || last}
        onClick={onDown}
        className="rounded-xl border border-black/10 px-3 py-3 text-xs font-semibold disabled:opacity-30"
      >
        ↓ {t("Down")}
      </button>
    </div>
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
