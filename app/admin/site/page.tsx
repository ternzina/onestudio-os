"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import ClientPublishDialog from "@/components/dashboard/ClientPublishDialog";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import type {
  PublicSiteContent,
  PublicSiteBlockColors,
  PublicSiteColumnCard,
  PublicSiteCustomBlock,
  PublicSiteCustomBlockKind,
  PublicSiteEditorData,
  PublicSitePage,
  PublicSiteReview,
  PublicSiteSection,
  PublicSiteService,
  PublicSiteProject,
  PublicSiteSocialLink,
  PublicSiteSystemSectionSettings,
  PublicSiteDesignSystem,
} from "@/lib/public-site/types";
import { publicSiteReviews } from "@/lib/public-site/content";
import { colorOverrideStyle, sectionColorStyle } from "@/lib/public-site/colors";
import { publicSiteDesignClass } from "@/lib/public-site/design-system";
import {
  publicSystemSectionClass,
  publicSystemSectionContentClass,
  publicSystemSectionSettings,
  publicSystemSectionStyle,
  publicSystemSectionVisibleOnDevice,
} from "@/lib/public-site/system-sections";
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
  type SiteTemplate,
} from "@/lib/public-site/templates";
import { evaluatePublicationReadiness } from "@/lib/public-site/publication-readiness";
import { SITE_TEMPLATE_REGISTRY } from "@/lib/public-site/template-registry";
import { supabase } from "@/lib/supabase";

type Workspace = {
  business_id: string;
  slug: string;
  name: string;
  is_default: boolean;
  role: string;
};

type CanvasSection = "hero" | PublicSiteSection;
type PreviewDevice = "desktop" | "tablet" | "mobile";
type EditorSnapshot = {
  draft: PublicSiteContent;
  logoUrl: string;
};
type EditorHistoryEntry = EditorSnapshot & {
  group: string | null;
  createdAt: number;
};
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
        | "about_image_url"
        | "membership_image_url"
        | "gift_image_url"
        | "seo_image_url"
        | "favicon_url";
      label: string;
    }
  | {
      kind: "logo";
      label: string;
    }
  | {
      kind: "list";
      key: "service_image_urls" | "team_image_urls" | "membership_image_urls" | "gift_image_urls";
      index: number;
      label: string;
    }
  | {
      kind: "service-card";
      slug: string;
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
    }
  | {
      kind: "section-background";
      section: CanvasSection;
      label: string;
    };

const inputClass =
  "mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a742e]";

const MAX_EDITOR_HISTORY = 80;
const HISTORY_GROUP_WINDOW_MS = 900;

function cloneEditorValue<Value>(value: Value): Value {
  return JSON.parse(JSON.stringify(value)) as Value;
}

function clonePublicSiteContent(content: PublicSiteContent) {
  return cloneEditorValue(content);
}

function contentSignature(content: PublicSiteContent | null) {
  return content ? JSON.stringify(content) : "";
}

function cloneCustomBlockForDuplicate(
  block: PublicSiteCustomBlock,
): PublicSiteCustomBlock {
  const nextId = `${block.id}-copy-${Date.now()}`;
  return {
    ...cloneEditorValue(block),
    id: nextId,
    title: block.title ? `${block.title} · копия` : "Копия блока",
    cards: block.cards?.map((card, index) => ({
      ...card,
      id: `${nextId}-card-${index + 1}`,
    })),
  };
}

const SITE_COLOR_PRESETS = [
  {
    id: "bordeaux",
    name: "Bordeaux",
    accent: "#9d3151",
    dark: "#321722",
    surface: "#fff7f5",
  },
] as const;

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
    ["изображение раздела «О компании»", content.about_image_url],
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
    ...(content.membership_image_urls ?? []),
    ...(content.gift_image_urls ?? []),
  ];
  if (listImages.some(isInvalidImageUrl)) return "изображение в списке";
  if (Object.values(content.service_card_images ?? {}).some(isInvalidImageUrl)) {
    return "изображение карточки услуги";
  }
  for (const [section, settings] of Object.entries(
    content.system_section_settings ?? {},
  ) as Array<[string, PublicSiteSystemSectionSettings]>) {
    if (settings.background_image_url && isInvalidImageUrl(settings.background_image_url)) {
      return `фон системного раздела «${section}»`;
    }
  }

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
  const record =
    editor.locales.find((item) => item.locale === locale) ?? null;
  const draftContent = record?.draft_content ?? record?.published_content ?? null;

  if (!draftContent) return null;

  return {
    ...draftContent,
    theme_accent:
      draftContent.theme_accent ?? record?.published_content?.theme_accent,
    theme_dark:
      draftContent.theme_dark ?? record?.published_content?.theme_dark,
    theme_surface:
      draftContent.theme_surface ?? record?.published_content?.theme_surface,
  };
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
    content_width: "wide",
    padding_top: "normal",
    padding_bottom: "normal",
    section_height: "auto",
    media_height:
      kind === "slider" ||
      kind === "collage" ||
      kind === "video" ||
      kind === "media_text"
        ? "auto"
        : undefined,
    animation: "none",
    animate_on_mobile: true,
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

function SiteEditorHeader() {
  return <AdminHeader />;
}

export default function AdminSitePage() {
  const { t } = useAdminI18n();
  const clientMode = false;
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [editor, setEditor] = useState<PublicSiteEditorData | null>(null);
  const [selectedLocale, setSelectedLocale] = useState("");
  const [draft, setDraft] = useState<PublicSiteContent | null>(null);
  const draftRef = useRef<PublicSiteContent | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [savedLogoUrl, setSavedLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templateSavingKey, setTemplateSavingKey] = useState("");
  const [templateSavedKey, setTemplateSavedKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [publishReviewOpen, setPublishReviewOpen] = useState(false);
  const [publishSucceeded, setPublishSucceeded] = useState(false);
  const [publishWasAlreadyPublished, setPublishWasAlreadyPublished] =
    useState(false);
  const [selectedSection, setSelectedSection] =
    useState<CanvasSection>("hero");
  const [previewDevice, setPreviewDevice] =
    useState<PreviewDevice>("desktop");
  const undoStackRef = useRef<EditorHistoryEntry[]>([]);
  const redoStackRef = useRef<EditorHistoryEntry[]>([]);
  const [undoDepth, setUndoDepth] = useState(0);
  const [redoDepth, setRedoDepth] = useState(0);
  const [savedDraftSignature, setSavedDraftSignature] = useState("");

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const syncHistoryDepth = useCallback(() => {
    setUndoDepth(undoStackRef.current.length);
    setRedoDepth(redoStackRef.current.length);
  }, []);

  const resetEditorHistory = useCallback(() => {
    undoStackRef.current = [];
    redoStackRef.current = [];
    syncHistoryDepth();
  }, [syncHistoryDepth]);

  const pushEditorHistory = useCallback((
    currentDraft: PublicSiteContent,
    currentLogoUrl: string,
    group?: string,
  ) => {
    const now = Date.now();
    const normalizedGroup = group ?? null;
    const last = undoStackRef.current.at(-1);
    const shouldCoalesce = Boolean(
      normalizedGroup &&
      last?.group === normalizedGroup &&
      now - last.createdAt <= HISTORY_GROUP_WINDOW_MS,
    );

    if (shouldCoalesce && last) {
      last.createdAt = now;
    } else {
      undoStackRef.current.push({
        draft: clonePublicSiteContent(currentDraft),
        logoUrl: currentLogoUrl,
        group: normalizedGroup,
        createdAt: now,
      });
      if (undoStackRef.current.length > MAX_EDITOR_HISTORY) {
        undoStackRef.current.shift();
      }
    }
    redoStackRef.current = [];
    syncHistoryDepth();
  }, [syncHistoryDepth]);

  const canConfigure = workspace
    ? ["owner", "admin", "manager"].includes(workspace.role)
    : false;

  const loadEditor = useCallback(async (
    preferredLocale?: string,
    options?: { silent?: boolean },
  ) => {
    const silent = options?.silent === true;
    if (!silent) setLoading(true);
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
      if (!silent) setLoading(false);
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
      if (!silent) setLoading(false);
      return;
    }

    const nextEditor = data as unknown as PublicSiteEditorData;
    const locale =
      preferredLocale &&
      nextEditor.locales.some((item) => item.locale === preferredLocale)
        ? preferredLocale
        : nextEditor.site.primary_locale;

    const loadedDraft = contentFromLocale(nextEditor, locale);
    setWorkspace(current);
    setEditor(nextEditor);
    setSelectedLocale(locale);
    draftRef.current = loadedDraft;
    setDraft(loadedDraft);
    setTemplateSavedKey(loadedDraft?.template_id || "standard");
    const loadedLogoUrl =
      nextEditor.site.logo_draft_url ?? nextEditor.company?.logo_url ?? "";
    setLogoUrl(loadedLogoUrl);
    setSavedLogoUrl(loadedLogoUrl);
    setSavedDraftSignature(contentSignature(loadedDraft));
    resetEditorHistory();
    if (!silent) setLoading(false);
  }, [resetEditorHistory, t]);

  useEffect(() => {
    void loadEditor();
  }, [loadEditor]);

  const selectedRecord = useMemo(
    () =>
      editor?.locales.find((item) => item.locale === selectedLocale) ?? null,
    [editor, selectedLocale],
  );

  const currentDraftSignature = useMemo(
    () => contentSignature(draft),
    [draft],
  );
  const hasUnsavedChanges = Boolean(
    draft &&
    (currentDraftSignature !== savedDraftSignature || logoUrl !== savedLogoUrl),
  );

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [hasUnsavedChanges]);

  const clientPublicationReadiness = useMemo(
    () =>
      evaluatePublicationReadiness({
        businessName: editor?.business.name || workspace?.name || "",
        content: draft
          ? (draft as unknown as Record<string, unknown>)
          : null,
        serviceCount: editor?.services?.length ?? 0,
        portfolioCount: editor?.portfolio?.length ?? 0,
        logoUrl,
      }),
    [draft, editor, logoUrl, workspace],
  );

  function chooseLocale(locale: string) {
    if (!editor || locale === selectedLocale) return;
    if (
      hasUnsavedChanges &&
      !window.confirm(
        "В этом языке есть несохранённые изменения. Переключиться и потерять их?",
      )
    ) return;
    const nextDraft = contentFromLocale(editor, locale);
    setSelectedLocale(locale);
    draftRef.current = nextDraft;
    setDraft(nextDraft);
    setSavedDraftSignature(contentSignature(nextDraft));
    const nextLogo = editor.site.logo_draft_url ?? editor.company?.logo_url ?? "";
    setLogoUrl(nextLogo);
    setSavedLogoUrl(nextLogo);
    resetEditorHistory();
    setMessage("");
    setError("");
    setPublishReviewOpen(false);
    setPublishSucceeded(false);
  }

  function replaceDraft(
    nextDraft: PublicSiteContent,
    historyGroup?: string,
  ) {
    const current = draftRef.current ?? draft;
    if (!current || contentSignature(current) === contentSignature(nextDraft)) {
      return;
    }
    pushEditorHistory(current, logoUrl, historyGroup);
    const clonedDraft = clonePublicSiteContent(nextDraft);
    draftRef.current = clonedDraft;
    setDraft(clonedDraft);
    setMessage("");
  }

  async function selectTemplateKey(templateKey: string) {
    const current = draftRef.current ?? draft;
    if (!current || !workspace || !editor || !canConfigure || saving) return;

    const nextDraft = { ...current, template_id: templateKey };
    const persistedDraft =
      selectedRecord?.draft_content
      ?? selectedRecord?.published_content
      ?? current;
    const contentToSave = { ...persistedDraft, template_id: templateKey };
    const previousSavedTemplateKey = templateSavedKey;

    replaceDraft(nextDraft, "site-template");
    setTemplateSavingKey(templateKey);
    setTemplateSavedKey("");
    setSaving(true);
    setError("");
    setMessage("");

    const { data, error: saveError } = await supabase.rpc(
      "save_public_site_draft",
      {
        p_business_id: workspace.business_id,
        p_locale: selectedLocale,
        p_content: contentToSave,
        p_make_primary: selectedLocale === editor.site.primary_locale,
      },
    );

    if (saveError) {
      draftRef.current = current;
      setDraft(current);
      setTemplateSavedKey(previousSavedTemplateKey);
      setError(saveError.message);
    } else {
      const savedContent = data as PublicSiteContent;
      setEditor((currentEditor) => currentEditor ? {
        ...currentEditor,
        locales: currentEditor.locales.map((locale) =>
          locale.locale === selectedLocale
            ? { ...locale, draft_content: savedContent }
            : locale
        ),
      } : currentEditor);
      setSavedDraftSignature(contentSignature(savedContent));
      setTemplateSavedKey(templateKey);
      const templateName =
        SITE_TEMPLATE_REGISTRY.find((template) => template.key === templateKey)?.name
        ?? templateKey;
      setMessage(`${templateName} сохранён в черновик.`);
    }

    setTemplateSavingKey("");
    setSaving(false);
  }

  function update<Key extends keyof PublicSiteContent>(
    key: Key,
    value: PublicSiteContent[Key],
  ) {
    setDraft((current) => {
      if (!current) return current;
      const next = { ...current, [key]: value };
      if (contentSignature(current) === contentSignature(next)) return current;
      pushEditorHistory(current, logoUrl, `field:${String(key)}`);
      return next;
    });
    setMessage("");
  }

  function updateTeam(items: string, images: string[]) {
    setDraft((current) => {
      if (!current) return current;
      const next = {
        ...current,
        team_items: items,
        team_image_urls: images,
      };
      if (contentSignature(current) === contentSignature(next)) return current;
      pushEditorHistory(current, logoUrl, "team");
      return next;
    });
    setMessage("");
  }

  function updateGift(items: string, images: string[]) {
    setDraft((current) => {
      if (!current) return current;
      const next = {
        ...current,
        gift_items: items,
        gift_image_urls: images,
      };
      if (contentSignature(current) === contentSignature(next)) return current;
      pushEditorHistory(current, logoUrl, "gift");
      return next;
    });
    setMessage("");
  }

  function updateMembership(items: string, images: string[]) {
    setDraft((current) => {
      if (!current) return current;
      const next = {
        ...current,
        membership_items: items,
        membership_image_urls: images,
      };
      if (contentSignature(current) === contentSignature(next)) return current;
      pushEditorHistory(current, logoUrl, "membership");
      return next;
    });
    setMessage("");
  }

  function updateLogo(value: string) {
    if (value === logoUrl) return;
    if (draft) pushEditorHistory(draft, logoUrl, "logo");
    setLogoUrl(value);
    setMessage("");
  }

  function undoEditorChange() {
    if (!draft) return;
    const previous = undoStackRef.current.pop();
    if (!previous) return;
    redoStackRef.current.push({
      draft: clonePublicSiteContent(draft),
      logoUrl,
      group: null,
      createdAt: Date.now(),
    });
    setDraft(clonePublicSiteContent(previous.draft));
    setLogoUrl(previous.logoUrl);
    setMessage("");
    setError("");
    syncHistoryDepth();
  }

  function redoEditorChange() {
    if (!draft) return;
    const next = redoStackRef.current.pop();
    if (!next) return;
    undoStackRef.current.push({
      draft: clonePublicSiteContent(draft),
      logoUrl,
      group: null,
      createdAt: Date.now(),
    });
    setDraft(clonePublicSiteContent(next.draft));
    setLogoUrl(next.logoUrl);
    setMessage("");
    setError("");
    syncHistoryDepth();
  }


  function moveSection(section: PublicSiteSection, direction: -1 | 1) {
    if (!draft) return;
    const order = resolvePublicSiteLayoutOrder(draft);
    const currentIndex = order.indexOf(sectionLayoutId(section));
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= order.length) return;
    [order[currentIndex], order[nextIndex]] = [order[nextIndex], order[currentIndex]];
    replaceDraft({
      ...draft,
      layout_order: order,
      section_order: sectionsFromLayoutOrder(order),
    });
  }

  async function installTemplate(template: SiteTemplate) {
    if (!draft || !workspace || !canConfigure) return;
    if (!window.confirm(
      t("Apply this template? Current page texts and colors will be replaced, and its editable sample services and portfolio will be added."),
    )) return;
    resetEditorHistory();
    setDraft(applySiteTemplate(draft, template));
    setLogoUrl(template.logoUrl ?? "");
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

  async function saveSiteLogoDraft() {
    if (!workspace || !canConfigure) return false;

    const { error: logoError } = await supabase.rpc(
      "save_public_site_logo_draft",
      {
        p_business_id: workspace.business_id,
        p_logo_url: logoUrl.trim(),
      },
    );

    if (logoError) {
      setError(logoError.message);
      setMessage("");
      return false;
    }

    return true;
  }

  async function saveDraft(options?: { publish?: boolean }) {
    const draftToSave = draftRef.current ?? draft;
    if (!workspace || !editor || !draftToSave || !canConfigure) return false;

    if (logoUrl && isInvalidImageUrl(logoUrl)) {
      setError(
        "Нельзя сохранить: в поле «Логотип» вставлена ссылка на видео.",
      );
      setMessage("");
      return false;
    }

    const invalidImage = findInvalidDraftImage(draftToSave);
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
      p_content: draftToSave,
      p_make_primary: selectedLocale === editor.site.primary_locale,
    });

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return false;
    }

    if (!(await saveSiteLogoDraft())) {
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

    await loadEditor(selectedLocale, { silent: true });
    setSaving(false);
    return true;
  }

  function openClientPublicationReview() {
    setPublishWasAlreadyPublished(Boolean(selectedRecord?.published_content));
    setPublishSucceeded(false);
    setPublishReviewOpen(true);
    setError("");
    setMessage("");
  }

  async function confirmClientPublication() {
    const published = await saveDraft({ publish: true });
    if (published) setPublishSucceeded(true);
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
      await loadEditor(locale, { silent: true });
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
    else if (await saveSiteLogoDraft()) {
      await loadEditor(selectedLocale, { silent: true });
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
      await loadEditor(selectedLocale, { silent: true });
      setMessage(t("Site unpublished."));
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen px-4 pb-16 pt-24 text-[#17191f] sm:px-6 lg:px-10">
        <SiteEditorHeader />
        <p className="mx-auto mt-10 max-w-7xl text-sm text-[#716d65]">
          {t("Loading public site…")}
        </p>
      </main>
    );
  }

  if (!workspace || !editor || !draft) {
    return (
      <main className="min-h-screen px-4 pb-16 pt-24 text-[#17191f] sm:px-6 lg:px-10">
        <SiteEditorHeader />
        <div className="mx-auto mt-10 max-w-7xl rounded-[28px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || t("Public site settings could not be loaded.")}
        </div>
      </main>
    );
  }

  const quickStartSteps = [
    {
      id: "brand",
      title: t("Brand and logo"),
      description: t("Add the business name and logo visitors should recognize."),
      complete: Boolean((draft.brand_name || editor.business.name || "").trim() && logoUrl.trim()),
    },
    {
      id: "hero",
      title: t("Main screen"),
      description: t("Replace the demo headline, introduction and main image."),
      complete: Boolean(draft.hero_title.trim() && draft.hero_text.trim()),
    },
    {
      id: "services",
      title: t("Services and prices"),
      description: t("Check the service cards and replace demo prices with real ones."),
      complete: Boolean((editor.services ?? []).length),
    },
    {
      id: "contacts",
      title: t("Contacts"),
      description: t("Add at least one way for clients to contact the business."),
      complete: Boolean(
        [draft.contact_email, draft.contact_phone, draft.contact_address].some(
          (value) => Boolean(value?.trim()),
        ),
      ),
    },
    {
      id: "publish",
      title: t("Publish"),
      description: t("Save the draft, review the site and publish the selected language."),
      complete: editor.site.is_published,
    },
  ];
  const completedQuickStartSteps = quickStartSteps.filter(
    (step) => step.complete,
  ).length;

  function scrollToVisualBuilder() {
    window.requestAnimationFrame(() => {
      document
        .getElementById("site-builder-canvas")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <main
      data-editor-mode={clientMode ? "client" : "admin"}
      className="min-h-screen px-4 pb-16 pt-24 text-[#17191f] sm:px-6 lg:px-10"
      onClickCapture={(event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const link = target.closest("a");
        const href = link?.getAttribute("href");
        if (
          clientMode &&
          href?.startsWith("/admin/") &&
          link?.getAttribute("data-client-nav") !== "true"
        ) {
          event.preventDefault();
          setError("");
          setMessage(
            "Этот рабочий раздел ещё переносится в клиентский кабинет. Редактирование сайта уже полностью доступно здесь.",
          );
          return;
        }
        if (
          link &&
          link.getAttribute("target") !== "_blank" &&
          href &&
          !href.startsWith("#") &&
          hasUnsavedChanges &&
          !window.confirm(
            "Есть несохранённые изменения. Уйти со страницы и потерять их?",
          )
        ) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <SiteEditorHeader />
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#9a742e]">
              {clientMode ? "OneStudio Site Editor" : t("Site Builder 2.0")}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
              {clientMode ? "Редактор сайта" : t("Public site")}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6f6c65]">
              {clientMode
                ? "Меняйте тексты, изображения, цвета и блоки. Сохраняйте черновик и публикуйте сайт, когда всё готово."
                : t("Edit the content, control visible blocks and arrange them in the order visitors should see.")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {editor.site.is_published ? (
              <Link
                href={publicHref(editor, selectedLocale)}
                target="_blank"
                className="rounded-full border border-black/15 bg-white px-5 py-3 text-xs font-bold text-[#17191f] shadow-sm transition hover:bg-[#f4f1ea]"
              >
                {t("Open published site")}
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => void saveDraft()}
              disabled={saving || !canConfigure}
              className="rounded-full border border-black/15 bg-white px-5 py-3 text-xs font-bold text-[#17191f] shadow-sm transition hover:bg-[#f4f1ea] disabled:opacity-55"
            >
              {saving ? t("Saving…") : t("Save draft")}
            </button>
            <button
              type="button"
              onClick={() =>
                clientMode
                  ? openClientPublicationReview()
                  : void saveDraft({ publish: true })
              }
              disabled={saving || !canConfigure}
              className="rounded-full bg-[#17191f] px-5 py-3 text-xs font-semibold text-white disabled:opacity-40"
            >
              {saving
                ? t("Publishing…")
                : clientMode
                  ? selectedRecord?.published_content
                    ? "Проверить обновление"
                    : "Проверить и опубликовать"
                  : t("Publish this language")}
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

        <section className="mt-6 rounded-[28px] border border-[#cfded9] bg-[linear-gradient(135deg,#f7fbfa_0%,#edf5f2_100%)] p-5 shadow-[0_18px_55px_rgba(31,70,65,0.08)] sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#3f8a7c]">
                {t("Quick start")}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em]">
                {t("Prepare the site in five clear steps")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#607470]">
                {t("The full editor is already ready below. This checklist shows what should be replaced before the first publication.")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[150px]">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#47645f]">
                  <span>{t("Progress")}</span>
                  <span>{completedQuickStartSteps}/{quickStartSteps.length}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/80">
                  <div
                    className="h-full rounded-full bg-[#4b9a89] transition-[width]"
                    style={{
                      width: `${(completedQuickStartSteps / quickStartSteps.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={scrollToVisualBuilder}
                className="rounded-full bg-[#17343a] px-5 py-3 text-xs font-semibold text-white"
              >
                {t("Open site editor")} →
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {quickStartSteps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={scrollToVisualBuilder}
                className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
                  step.complete
                    ? "border-emerald-200 bg-white/85"
                    : "border-black/8 bg-white/60"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6c817c]">
                    {t("Step")} {index + 1}
                  </span>
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                      step.complete
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-[#e5eeeb] text-[#57716b]"
                    }`}
                    aria-label={step.complete ? t("Quick start completed") : t("Quick start not completed")}
                  >
                    {step.complete ? "✓" : index + 1}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-[#17343a]">
                  {step.title}
                </p>
                <p className="mt-2 text-xs leading-5 text-[#6d7f7b]">
                  {step.description}
                </p>
              </button>
            ))}
          </div>
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
          logoUrl={logoUrl}
          savedLogoUrl={savedLogoUrl}
          services={editor.services ?? []}
          portfolio={editor.portfolio ?? []}
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
          onTemplateKey={selectTemplateKey}
          templateSavingKey={templateSavingKey}
          templateSavedKey={templateSavedKey}
          onPublish={() =>
            clientMode
              ? openClientPublicationReview()
              : void saveDraft({ publish: true })
          }
          onSave={() => void saveDraft()}
          onSectionChange={setSelectedSection}
          onUpdate={update}
          onReplaceDraft={replaceDraft}
          onLogoChange={updateLogo}
          hasUnsavedChanges={hasUnsavedChanges}
          canUndo={undoDepth > 0}
          canRedo={redoDepth > 0}
          onUndo={undoEditorChange}
          onRedo={redoEditorChange}
          onUpdateTeam={updateTeam}
          onUpdateGift={updateGift}
          onUpdateMembership={updateMembership}
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
                  className="rounded-full border border-[#9a742e]/30 bg-[#f8f0df] px-4 py-2 text-xs font-semibold text-[#4f3a12] disabled:opacity-40"
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
            <div className="overflow-hidden rounded-[30px] border border-black/10 shadow-[0_30px_90px_rgba(30,30,30,0.12)]"
              style={{ backgroundColor: draft.theme_surface ?? "#f3f0e9" }}>
              <div className="border-b border-black/8 px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em]">
                {editor.business.name}
              </div>
              <div className="relative overflow-hidden px-6 py-14">
                <div className="absolute -right-12 top-4 h-48 w-48 rounded-full border opacity-20" style={{ borderColor: draft.theme_accent ?? "#9a742e" }} />
                <p className="relative text-[9px] font-semibold uppercase tracking-[0.22em]" style={{ color: draft.theme_accent ?? "#9a742e" }}>
                  {draft.hero_eyebrow}
                </p>
                <h2 className="relative mt-4 text-4xl font-semibold tracking-[-0.06em]">
                  {draft.hero_title}
                </h2>
                <p className="relative mt-5 text-xs leading-6 text-[#6f6c65]">
                  {draft.hero_text}
                </p>
                <span className="relative mt-6 inline-flex rounded-full px-5 py-3 text-[10px] font-semibold text-white" style={{ backgroundColor: draft.theme_dark ?? "#17191f" }}>
                  {draft.booking_label}
                </span>
              </div>
              {draft.show_services ? (
                <div className="px-6 py-8 text-white" style={{ backgroundColor: draft.theme_dark ?? "#17191f" }}>
                  <p className="text-[9px] uppercase tracking-[0.18em]" style={{ color: draft.theme_accent ?? "#9a742e" }}>
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

      {clientMode && publishReviewOpen ? (
        <ClientPublishDialog
          open
          businessId={editor.business.id}
          businessName={editor.business.name}
          locale={selectedLocale}
          publicPath={publicHref(editor, selectedLocale)}
          alreadyPublished={publishWasAlreadyPublished}
          busy={saving}
          success={publishSucceeded}
          readiness={clientPublicationReadiness}
          error={error || undefined}
          onClose={() => {
            if (saving) return;
            setPublishReviewOpen(false);
            setPublishSucceeded(false);
          }}
          onConfirm={() => void confirmClientPublication()}
          onEdit={() => {
            setPublishReviewOpen(false);
            setPublishSucceeded(false);
            scrollToVisualBuilder();
          }}
        />
      ) : null}
    </main>
  );
}

function VisualBuilder({
  businessId,
  businessSlug,
  businessName,
  logoUrl,
  savedLogoUrl,
  services,
  portfolio,
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
  onTemplateKey,
  templateSavingKey,
  templateSavedKey,
  onPublish,
  onSave,
  onSectionChange,
  onUpdate,
  onReplaceDraft,
  onLogoChange,
  hasUnsavedChanges,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onUpdateTeam,
  onUpdateGift,
  onUpdateMembership,
}: {
  businessId: string;
  businessSlug: string;
  businessName: string;
  logoUrl: string;
  savedLogoUrl: string;
  services: PublicSiteService[];
  portfolio: PublicSiteProject[];
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
  onTemplateKey: (templateKey: string) => Promise<void>;
  templateSavingKey: string;
  templateSavedKey: string;
  onPublish: () => void;
  onSave: () => void;
  onSectionChange: (section: CanvasSection) => void;
  onUpdate: <Key extends keyof PublicSiteContent>(
    key: Key,
    value: PublicSiteContent[Key],
  ) => void;
  onReplaceDraft: (draft: PublicSiteContent, historyGroup?: string) => void;
  onLogoChange: (value: string) => void;
  hasUnsavedChanges: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onUpdateTeam: (items: string, images: string[]) => void;
  onUpdateGift: (items: string, images: string[]) => void;
  onUpdateMembership: (items: string, images: string[]) => void;
}) {
  const visualBuilderPathname = usePathname();
  const clientEditorMode = visualBuilderPathname.startsWith("/dashboard/site");
  const [blocksOpen, setBlocksOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [siteSettingsOpen, setSiteSettingsOpen] = useState(false);
  const [siteDesignOpen, setSiteDesignOpen] = useState(false);
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
  const [draggedBlockId, setDraggedBlockId] = useState("");
  const [dragOverBlockId, setDragOverBlockId] = useState("");
  const [dragScope, setDragScope] = useState<"home" | "page" | null>(null);
  const workspaceCanvasRef = useRef<HTMLDivElement | null>(null);
  const workspaceScrollFrameRef = useRef<number | null>(null);
  const selectionFromCanvasScrollRef = useRef(false);
  const programmaticCanvasScrollUntilRef = useRef(0);
  const mobileHeroTitleClass =
    draft.hero_title_mobile_size === "small"
      ? "text-3xl leading-[1.02]"
      : draft.hero_title_mobile_size === "large"
        ? "text-5xl leading-[0.98]"
        : "text-4xl leading-[1]";
  const previewHeroTitleClass =
    previewDevice === "mobile"
      ? mobileHeroTitleClass
      : "text-6xl leading-[0.98]";

  useEffect(() => {
    setBlocksOpen(true);
    setSettingsOpen(true);
  }, []);

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

  useEffect(() => {
    if (activePage || selectionFromCanvasScrollRef.current) {
      selectionFromCanvasScrollRef.current = false;
      return;
    }
    const canvas = workspaceCanvasRef.current;
    if (!canvas) return;
    const anchor = selectedCustomBlockId
      ? `custom:${selectedCustomBlockId}`
      : selectedSection;
    const target = canvas.querySelector<HTMLElement>(
      `[data-editor-anchor="${anchor}"]`,
    );
    if (!target) return;

    programmaticCanvasScrollUntilRef.current = Date.now() + 700;
    const canvasRect = canvas.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const top =
      canvas.scrollTop +
      (targetRect.top - canvasRect.top) -
      Math.max(24, (canvas.clientHeight - targetRect.height) / 2);
    canvas.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [activePage, selectedCustomBlockId, selectedSection]);

  const syncSelectionFromCanvasScroll = useCallback(() => {
    if (activePage || Date.now() < programmaticCanvasScrollUntilRef.current) return;
    const canvas = workspaceCanvasRef.current;
    if (!canvas) return;
    if (workspaceScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(workspaceScrollFrameRef.current);
    }
    workspaceScrollFrameRef.current = window.requestAnimationFrame(() => {
      const canvasRect = canvas.getBoundingClientRect();
      const focusY = canvasRect.top + Math.min(canvas.clientHeight * 0.42, 360);
      const anchors = canvas.querySelectorAll<HTMLElement>("[data-editor-anchor]");
      let closest: HTMLElement | null = null;
      let distance = Number.POSITIVE_INFINITY;
      anchors.forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (rect.bottom < canvasRect.top || rect.top > canvasRect.bottom) return;
        const itemFocus = Math.max(rect.top, Math.min(focusY, rect.bottom));
        const nextDistance = Math.abs(itemFocus - focusY);
        if (nextDistance < distance) {
          distance = nextDistance;
          closest = item;
        }
      });
      if (!closest) return;
      const anchor = (closest as HTMLElement).dataset.editorAnchor;
      if (!anchor) return;
      selectionFromCanvasScrollRef.current = true;
      if (anchor.startsWith("custom:")) {
        const blockId = anchor.slice("custom:".length);
        if (blockId && blockId !== selectedCustomBlockId) {
          setSelectedCustomBlockId(blockId);
          setSiteDesignOpen(false);
          setSettingsOpen(true);
        } else {
          selectionFromCanvasScrollRef.current = false;
        }
        return;
      }
      const nextSection = anchor as CanvasSection;
      if (selectedCustomBlockId || nextSection !== selectedSection) {
        setSelectedCustomBlockId("");
        onSectionChange(nextSection);
        setSiteDesignOpen(false);
        setSettingsOpen(true);
      } else {
        selectionFromCanvasScrollRef.current = false;
      }
    });
  }, [activePage, onSectionChange, selectedCustomBlockId, selectedSection]);

  useEffect(() => () => {
    if (workspaceScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(workspaceScrollFrameRef.current);
    }
  }, []);

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
  const sectionColorDefaults = (() => {
    const accent = draft.theme_accent ?? "#9d3151";
    const dark = draft.theme_dark ?? "#321722";
    const surface = draft.theme_surface ?? "#fff7f5";
    if (selectedSection === "services" || selectedSection === "reviews") {
      return { background: dark, text: "#ffffff", accent };
    }
    if (selectedSection === "contact") {
      return { background: "#d9d1c0", text: dark, accent };
    }
    return { background: surface, text: dark, accent };
  })();

  const selectedSystemSectionSettings = publicSystemSectionSettings(
    draft,
    selectedSection,
  );

  function updateSystemSectionSettings(
    changes: Partial<PublicSiteSystemSectionSettings>,
  ) {
    onReplaceDraft(
      {
        ...draft,
        system_section_settings: {
          ...(draft.system_section_settings ?? {}),
          [selectedSection]: {
            ...(draft.system_section_settings?.[selectedSection] ?? {}),
            ...changes,
          },
        },
      },
      `system-section:${selectedSection}`,
    );
  }

  function updateSectionColors(colors: PublicSiteBlockColors) {
    const nextBackgroundMode =
      colors.mode === "custom"
        ? "color"
        : selectedSystemSectionSettings.background_mode === "color"
          ? "theme"
          : selectedSystemSectionSettings.background_mode;

    onReplaceDraft(
      {
        ...draft,
        section_colors: {
          ...(draft.section_colors ?? {}),
          [selectedSection]: colors,
        },
        system_section_settings: {
          ...(draft.system_section_settings ?? {}),
          [selectedSection]: {
            ...(draft.system_section_settings?.[selectedSection] ?? {}),
            background_mode: nextBackgroundMode,
          },
        },
      },
      `section-colors:${selectedSection}`,
    );
  }
  const activeTemplate =
    SITE_TEMPLATES.find((template) => template.id === draft.template_id) ?? null;
  const selectedRuntimeTemplate =
    SITE_TEMPLATE_REGISTRY.find(
      (template) => template.key === draft.template_id,
    ) ?? null;
  const selectedPremiumTemplate =
    selectedRuntimeTemplate?.tier === "premium"
      ? selectedRuntimeTemplate
      : null;
  const previewServices: PublicSiteService[] = services.length
    ? services
    : (activeTemplate?.services ?? []).map((service, index) => ({
        id: `template-service-${index}`,
        slug: service.slug,
        kind: "appointment",
        title: service.title,
        description: service.description,
        pricing_model: "fixed",
        price_minor: service.priceMinor,
        currency: "EUR",
        duration_min_minutes: service.durationMinutes,
        duration_max_minutes: service.durationMinutes,
        capacity: 1,
        requires_confirmation: false,
      }));
  const previewPortfolio: PublicSiteProject[] = portfolio.length
    ? portfolio
    : (activeTemplate?.portfolio ?? []).map((project, index) => ({
        id: `template-project-${index}`,
        slug: project.slug,
        title: project.title,
        description: project.description,
        category: draft.portfolio_label || "Portfolio",
        image_url: project.imageUrl,
        image_alt: project.imageAlt,
        width: null,
        height: null,
      }));

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
    if (imageTarget.kind === "logo") {
      onLogoChange(url);
    } else if (imageTarget.kind === "content") {
      onUpdate(imageTarget.key, url);
    } else if (imageTarget.kind === "list") {
      const values = [...(draft[imageTarget.key] ?? [])];
      while (values.length <= imageTarget.index) values.push("");
      values[imageTarget.index] = url;
      onUpdate(imageTarget.key, values);
    } else if (imageTarget.kind === "service-card") {
      onUpdate("service_card_images", {
        ...(draft.service_card_images ?? {}),
        [imageTarget.slug]: url,
      });
    } else if (imageTarget.kind === "page") {
      updatePageById(imageTarget.pageId, imageTarget.key, url);
    } else if (imageTarget.kind === "section-background") {
      onUpdate("system_section_settings", {
        ...(draft.system_section_settings ?? {}),
        [imageTarget.section]: {
          ...(draft.system_section_settings?.[imageTarget.section] ?? {}),
          background_mode: "image",
          background_image_url: url,
        },
      });
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
    setSiteDesignOpen(false);
    setSettingsOpen(true);
    setLibraryOpen(false);
  }

  function chooseSection(section: CanvasSection) {
    setSelectedCustomBlockId("");
    onSectionChange(section);
    setSiteDesignOpen(false);
    setSettingsOpen(true);
  }

  function choosePage(pageId: string) {
    setSelectedPageId(pageId);
    setSelectedPagePart("intro");
    setSelectedCustomBlockId("");
    setSiteDesignOpen(false);
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
      const order = [...layoutOrder, customBlockLayoutId(block.id)];
      onReplaceDraft({
        ...draft,
        custom_blocks: [...(draft.custom_blocks ?? []), block],
        layout_order: order,
        section_order: sectionsFromLayoutOrder(order),
      });
      setSelectedPageId("home");
    }
    setSelectedCustomBlockId(block.id);
    setLibraryOpen(false);
    setSiteDesignOpen(false);
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

  function commitLayoutOrder(order: string[]) {
    onReplaceDraft({
      ...draft,
      layout_order: order,
      section_order: sectionsFromLayoutOrder(order),
    });
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
    commitLayoutOrder(order);
  }

  function reorderItems(items: string[], sourceId: string, targetId: string) {
    const sourceIndex = items.indexOf(sourceId);
    const targetIndex = items.indexOf(targetId);
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
      return items;
    }
    const next = [...items];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    return next;
  }

  function startBlockDrag(blockId: string, scope: "home" | "page") {
    if (!canConfigure || !editingEnabled) return;
    setDraggedBlockId(blockId);
    setDragOverBlockId("");
    setDragScope(scope);
  }

  function finishBlockDrag() {
    setDraggedBlockId("");
    setDragOverBlockId("");
    setDragScope(null);
  }

  function dropBlock(targetId: string, scope: "home" | "page") {
    if (!draggedBlockId || dragScope !== scope) {
      finishBlockDrag();
      return;
    }
    if (scope === "home") {
      const next = reorderItems(layoutOrder, draggedBlockId, targetId);
      if (next !== layoutOrder) commitLayoutOrder(next);
    } else if (activePage) {
      const blockIds = (activePage.blocks ?? []).map((block) => block.id);
      const nextIds = reorderItems(blockIds, draggedBlockId, targetId);
      const blockMap = new Map(
        (activePage.blocks ?? []).map((block) => [block.id, block]),
      );
      updatePage(
        "blocks",
        nextIds.map((id) => blockMap.get(id)).filter(Boolean) as PublicSiteCustomBlock[],
      );
    }
    finishBlockDrag();
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

  function duplicateCustomBlock() {
    if (!selectedCustomBlock) return;
    const duplicate = cloneCustomBlockForDuplicate(selectedCustomBlock);
    if (activePage) {
      const blocks = [...(activePage.blocks ?? [])];
      const index = blocks.findIndex((block) => block.id === selectedCustomBlock.id);
      blocks.splice(index < 0 ? blocks.length : index + 1, 0, duplicate);
      updatePage("blocks", blocks);
    } else {
      const blocks = [...(draft.custom_blocks ?? [])];
      const blockIndex = blocks.findIndex((block) => block.id === selectedCustomBlock.id);
      blocks.splice(blockIndex < 0 ? blocks.length : blockIndex + 1, 0, duplicate);
      const currentLayoutId = customBlockLayoutId(selectedCustomBlock.id);
      const duplicateLayoutId = customBlockLayoutId(duplicate.id);
      const order = [...layoutOrder];
      const layoutIndex = order.indexOf(currentLayoutId);
      order.splice(layoutIndex < 0 ? order.length : layoutIndex + 1, 0, duplicateLayoutId);
      onReplaceDraft({
        ...draft,
        custom_blocks: blocks,
        layout_order: order,
        section_order: sectionsFromLayoutOrder(order),
      });
    }
    setSelectedCustomBlockId(duplicate.id);
    setSelectedPagePart("blocks");
    setSettingsOpen(true);
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
      const order = layoutOrder.filter(
        (item) => item !== customBlockLayoutId(selectedCustomBlock.id),
      );
      onReplaceDraft({
        ...draft,
        custom_blocks: (draft.custom_blocks ?? []).filter(
          (block) => block.id !== selectedCustomBlock.id,
        ),
        layout_order: order,
        section_order: sectionsFromLayoutOrder(order),
      });
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
    <section
      id="site-builder-canvas"
      className="relative mt-8 scroll-mt-24 overflow-hidden rounded-[28px] border border-black/10 bg-[#e9e8e4] text-[#17191f] shadow-[0_26px_90px_rgba(25,27,32,0.12)]"
    >
      {selectedPremiumTemplate ? (
        <div className="border-b border-[#3e263e]/15 bg-[#fef9ef] p-5 sm:p-6">
          <div className="flex flex-col gap-5 rounded-[22px] border border-[#3e263e]/15 bg-white p-5 shadow-[0_18px_55px_rgba(62,38,62,0.08)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#3e263e] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#fef9ef]">
                  Premium
                </span>
                <span className="text-xs font-semibold text-[#3e263e]/60">
                  {templateSavingKey === selectedPremiumTemplate.key
                    ? "Сохраняем выбор в черновик…"
                    : templateSavedKey === selectedPremiumTemplate.key
                      ? "Выбран и сохранён в черновик"
                      : "Выбран в черновике"}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#3e263e]">
                {selectedPremiumTemplate.name} — текущий шаблон черновика
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#3e263e]/65">
                Блоковый редактор ниже относится к Standard template и не является предпросмотром выбранного Premium-шаблона.
                Публикация выполняется только отдельной кнопкой.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href={`/site-preview/${selectedPremiumTemplate.key}/${businessSlug}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-[#3e263e]/15 bg-white px-5 py-3 text-center text-xs font-bold text-[#3e263e] transition hover:bg-[#fef9ef]"
              >
                Предпросмотр ↗
              </Link>
              <button
                type="button"
                onClick={onPublish}
                disabled={!canConfigure || saving}
                className="rounded-xl bg-[#e07e67] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#cf6f5a] disabled:opacity-50"
              >
                Опубликовать
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
                : "border-transparent text-[#4f4b45]"
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
                    ? "border-transparent text-[#746e64] line-through"
                    : "border-transparent text-[#4f4b45]"
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
            className="rounded-xl border border-dashed border-black/20 px-4 py-2 text-xs font-semibold text-[#2f2d29] disabled:opacity-40"
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
                : "border border-black/10 bg-white text-[#26231f]"
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
            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-[#26231f]"
          >
            {t("SEO pages")}
          </button>
          <button
            type="button"
            onClick={() => {
              setSiteDesignOpen(true);
              setSettingsOpen(false);
            }}
            aria-pressed={siteDesignOpen}
            className={`rounded-xl border px-4 py-2 text-xs font-semibold ${siteDesignOpen ? "border-[#9d3151]/30 bg-[#f9edf1] text-[#7f2742]" : "border-black/10 bg-white text-[#26231f]"}`}
          >
            Дизайн сайта
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setBlocksOpen((value) => !value)}
            className={`rounded-xl border px-3 py-2 text-xs font-bold shadow-sm transition ${blocksOpen ? "border-[#9a742e]/45 bg-[#fbf7ee] text-[#4f3a12]" : "border-black/15 bg-white text-[#17191f] hover:bg-[#f4f1ea]"}`}
            aria-expanded={blocksOpen}
            aria-controls="site-editor-blocks-panel"
          >
            {blocksOpen ? "Скрыть меню блоков ←" : "Показать меню блоков →"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!selectedCustomBlock) {
                window.alert("Сначала выберите добавленный блок. Основные разделы сайта не дублируются.");
                return;
              }
              duplicateCustomBlock();
            }}
            disabled={!canConfigure || !editingEnabled}
            className="rounded-xl border border-[#9a742e]/45 bg-[#fbf7ee] px-3 py-2 text-xs font-bold text-[#4f3a12] shadow-sm transition hover:bg-[#f4ead6] disabled:cursor-not-allowed disabled:opacity-55"
            title={selectedCustomBlock ? `Дублировать: ${selectedCustomBlock.title || "блок"}` : "Сначала выберите добавленный блок"}
          >
            ⧉ Дублировать блок
          </button>
          <button
            type="button"
            onClick={() => {
              setSiteDesignOpen(false);
              setSettingsOpen((value) => !value);
            }}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold ${settingsOpen ? "border-[#9a742e]/35 bg-[#fbf7ee] text-[#4f3a12]" : "border-black/10 bg-white text-[#26231f]"}`}
          >
            {settingsOpen ? `${t("Settings")} →` : `← ${t("Settings")}`}
          </button>
          <span
            className={`rounded-full px-3 py-2 text-[10px] font-semibold ${
              hasUnsavedChanges
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {hasUnsavedChanges ? "Не сохранено" : "Сохранено"}
          </span>
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo || saving}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-30"
            title="Отменить последнее изменение"
          >
            ↶ Отменить
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo || saving}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-30"
            title="Вернуть отменённое изменение"
          >
            ↷ Вернуть
          </button>
          <div className="flex rounded-xl bg-[#efeee9] p-1">
            <button
              type="button"
              aria-pressed={previewDevice === "desktop"}
              onClick={() => onDeviceChange("desktop")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${previewDevice === "desktop" ? "bg-white shadow-sm" : "text-[#4f4b45]"}`}
            >
              {t("Computer")}
            </button>
            <button
              type="button"
              aria-pressed={previewDevice === "tablet"}
              onClick={() => onDeviceChange("tablet")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${previewDevice === "tablet" ? "bg-white shadow-sm" : "text-[#4f4b45]"}`}
            >
              Планшет
            </button>
            <button
              type="button"
              aria-pressed={previewDevice === "mobile"}
              onClick={() => onDeviceChange("mobile")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${previewDevice === "mobile" ? "bg-white shadow-sm" : "text-[#4f4b45]"}`}
            >
              {t("Phone")}
            </button>
          </div>
          <button type="button" onClick={onSave} disabled={saving || !canConfigure} className="rounded-xl border border-black/15 bg-white px-4 py-2 text-xs font-bold text-[#17191f] shadow-sm transition hover:bg-[#f4f1ea] disabled:opacity-55">
            {saving ? t("Saving…") : t("Save")}
          </button>
          <button type="button" onClick={onPublish} disabled={saving || !canConfigure} className="rounded-xl bg-[#17191f] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">
            {saving ? t("Publishing…") : t("Publish")}
          </button>
        </div>
      </div>

      <div
        className="relative grid h-[calc(100dvh-170px)] min-h-[560px] max-h-[calc(100dvh-96px)] min-w-0 overflow-hidden"
        style={{
          gridTemplateColumns:
            blocksOpen && (settingsOpen || siteDesignOpen)
              ? "220px minmax(0, 1fr) 360px"
              : blocksOpen
                ? "220px minmax(0, 1fr)"
                : settingsOpen || siteDesignOpen
                  ? "minmax(0, 1fr) 360px"
                  : "minmax(0, 1fr)",
        }}
      >
        {blocksOpen ? (
        <aside id="site-editor-blocks-panel" className="h-full min-w-0 overflow-y-auto overscroll-contain border-r border-black/10 bg-[#f7f6f3] p-4 text-[#17191f] [scrollbar-gutter:stable]">
          <div className="flex items-center justify-between gap-2">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b877e]">
              {t("Page blocks")}
            </p>
            <button
              type="button"
              onClick={() => setBlocksOpen(false)}
              className="rounded-lg border border-black/15 bg-white px-2 py-1.5 text-[10px] font-bold text-[#17191f] shadow-sm transition hover:bg-[#eeece6]"
              aria-label={t("Collapse blocks")}
              title={t("Collapse blocks")}
            >
              Скрыть ←
            </button>
          </div>
          {activePage ? (
            <>
              <div className="mt-3 grid gap-2">
                <BlockButton active={selectedPagePart === "intro"} label={t("Page intro")} visible onClick={() => setSelectedPagePart("intro")} />
                {activePage.type === "portfolio" ? (
                  <BlockButton active={selectedPagePart === "gallery"} label={t("Nail gallery")} visible onClick={() => setSelectedPagePart("gallery")} />
                ) : (
                  (activePage.blocks ?? []).map((block, index, blocks) => (
                    <BlockButton
                      key={block.id}
                      active={selectedCustomBlockId === block.id}
                      label={block.title || t("Custom block")}
                      visible={block.is_visible !== false}
                      draggable={canConfigure && editingEnabled}
                      dragging={draggedBlockId === block.id && dragScope === "page"}
                      dragOver={dragOverBlockId === block.id && dragScope === "page"}
                      onDragStart={() => startBlockDrag(block.id, "page")}
                      onDragOver={() => setDragOverBlockId(block.id)}
                      onDrop={() => dropBlock(block.id, "page")}
                      onDragEnd={finishBlockDrag}
                      onClick={() => {
                        setSelectedPagePart("blocks");
                        setSelectedCustomBlockId(block.id);
                        setSettingsOpen(true);
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
                  className="mt-4 w-full rounded-xl border border-dashed border-[#9a742e]/45 bg-[#fbf7ee] px-3 py-3 text-xs font-semibold text-[#4f3a12] disabled:opacity-40"
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
                {layoutOrder.map((item, index) => {
                  if (item.startsWith("section:")) {
                    const section = item.slice("section:".length) as PublicSiteSection;
                    return (
                      <BlockButton
                        key={item}
                        active={!selectedCustomBlockId && selectedSection === section}
                        label={t(sectionLabelKey[section])}
                        visible={Boolean(draft[sectionVisibilityKey[section]])}
                        draggable={canConfigure && editingEnabled}
                        dragging={draggedBlockId === item && dragScope === "home"}
                        dragOver={dragOverBlockId === item && dragScope === "home"}
                        onDragStart={() => startBlockDrag(item, "home")}
                        onDragOver={() => setDragOverBlockId(item)}
                        onDrop={() => dropBlock(item, "home")}
                        onDragEnd={finishBlockDrag}
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
                      draggable={canConfigure && editingEnabled}
                      dragging={draggedBlockId === item && dragScope === "home"}
                      dragOver={dragOverBlockId === item && dragScope === "home"}
                      onDragStart={() => startBlockDrag(item, "home")}
                      onDragOver={() => setDragOverBlockId(item)}
                      onDrop={() => dropBlock(item, "home")}
                      onDragEnd={finishBlockDrag}
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
                className="mt-4 w-full rounded-xl border border-dashed border-[#9a742e]/45 bg-[#fbf7ee] px-3 py-3 text-xs font-semibold text-[#4f3a12] transition hover:border-[#9a742e] disabled:opacity-40"
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
            className="absolute left-4 top-[76px] z-30 rounded-xl border border-black/20 bg-white px-4 py-3 text-xs font-bold text-[#17191f] shadow-xl transition hover:bg-[#f4f1ea]"
            title={t("Open blocks")}
            aria-controls="site-editor-blocks-panel"
          >
            ☰ Показать меню блоков →
          </button>
        )}

        <div
          ref={workspaceCanvasRef}
          onScroll={syncSelectionFromCanvasScroll}
          className={`h-full min-w-0 overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth bg-[#dcdcd8] transition-[padding] [scrollbar-gutter:stable] ${
            blocksOpen || settingsOpen ? "p-4 sm:p-7" : "p-2 sm:p-3"
          }`}
        >
          <div
            className={publicSiteDesignClass(
              draft,
              `mx-auto w-full overflow-hidden text-[#191b20] shadow-[0_28px_80px_rgba(25,27,32,0.18)] transition-all ${
                previewDevice === "mobile"
                  ? "max-w-[390px] rounded-[28px]"
                  : previewDevice === "tablet"
                    ? "max-w-[820px] rounded-[22px]"
                    : blocksOpen && settingsOpen
                      ? "max-w-[920px] rounded-lg"
                      : blocksOpen || settingsOpen
                        ? "max-w-[1120px] rounded-lg"
                        : "max-w-none rounded-lg"
              }`,
            )}
            style={{ backgroundColor: draft.theme_surface ?? "#f3f0e9" }}
          >
            {activePage?.type === "portfolio" ? (
              <PortfolioPagePreview
                page={activePage}
                draft={draft}
                portfolio={previewPortfolio}
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
              anchorId="hero"
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
              <div className={`relative flex items-center border-b border-black/10 px-6 py-5 ${draft.header_logo_position === "center" ? "justify-center" : "justify-between"}`}>
                {draft.header_logo_position === "center" ? (
                  <span className="absolute left-6 text-sm">☰</span>
                ) : null}
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={draft.brand_name || businessName}
                    className={`${draft.header_logo_size === "small" ? "max-h-8 max-w-[130px]" : draft.header_logo_size === "large" ? "max-h-16 max-w-[240px]" : "max-h-12 max-w-[180px]"} object-contain object-left`}
                  />
                ) : (
                  <span className="-translate-y-0.5 font-serif text-2xl tracking-[0.04em]"
                    style={{ color: draft.theme_dark ?? "#17191f" }}>
                    {draft.brand_name || businessName}
                    <small className="mt-1 block pl-0.5 font-sans text-[6px] font-semibold tracking-[0.4em] opacity-60">NAIL STUDIO</small>
                  </span>
                )}
                {draft.header_logo_position !== "center" ? (
                  <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#4f4b45]">
                    {draft.services_label} · {draft.portfolio_label} · {draft.contact_label}
                  </span>
                ) : null}
              </div>
              {draft.hero_layout === "cover" && draft.hero_image_url ? (
                <div className="relative min-h-[420px] overflow-hidden bg-black text-white">
                  <img
                    src={draft.hero_image_url}
                    alt=""
                    className={`absolute inset-0 h-full w-full ${draft.hero_image_fit === "contain" ? "object-contain" : "object-cover"} ${draft.hero_image_position === "top" ? "object-top" : draft.hero_image_position === "bottom" ? "object-bottom" : "object-center"}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
                  <div className="relative max-w-2xl px-8 py-20 sm:px-12 sm:py-28">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">{draft.hero_eyebrow}</p>
                    <h2 className={`mt-5 break-words font-semibold tracking-[-0.06em] [overflow-wrap:anywhere] ${previewHeroTitleClass}`}>{draft.hero_title}</h2>
                    <p className="mt-6 text-sm leading-7 text-white/75">{draft.hero_text}</p>
                    <div className="mt-7 flex flex-wrap gap-3">
                      <span className="os-site-button inline-flex rounded-full px-6 py-3 text-xs font-semibold text-white" style={{ backgroundColor: draft.theme_accent ?? "#9a742e" }}>{draft.hero_primary_label || draft.booking_label}</span>
                      {draft.show_hero_secondary !== false ? <span className="os-site-button inline-flex rounded-full border border-white/35 px-6 py-3 text-xs font-semibold">{draft.hero_secondary_label || t("More")}</span> : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`relative overflow-hidden ${draft.hero_layout !== "text" && draft.hero_image_url ? "grid lg:grid-cols-[0.9fr_1.1fr]" : ""}`}>
                  <div className={`relative px-8 py-16 sm:px-12 sm:py-24 ${previewDevice === "mobile" ? "order-1" : draft.hero_image_placement === "left" ? "order-2" : "order-1"}`}>
                    <div className="absolute -left-20 top-4 h-64 w-64 rounded-full border border-current/10" />
                    <p className="relative text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: draft.theme_accent ?? "#9a742e" }}>{draft.hero_eyebrow}</p>
                    <h2 className={`relative mt-5 max-w-2xl break-words font-semibold tracking-[-0.06em] [overflow-wrap:anywhere] ${previewHeroTitleClass}`}>{draft.hero_title}</h2>
                    <p className="relative mt-6 max-w-xl text-sm leading-7 text-[#656159]">{draft.hero_text}</p>
                    <div className="relative mt-7 flex flex-wrap gap-3">
                      <span className="os-site-button inline-flex rounded-full px-6 py-3 text-xs font-semibold text-white" style={{ backgroundColor: draft.theme_dark ?? "#17191f" }}>{draft.hero_primary_label || draft.booking_label}</span>
                      {draft.show_hero_secondary !== false ? <span className="os-site-button inline-flex rounded-full border border-black/15 px-6 py-3 text-xs font-semibold">{draft.hero_secondary_label || t("More")}</span> : null}
                    </div>
                  </div>
                  {draft.hero_layout !== "text" && draft.hero_image_url ? (
                    <div className={`relative min-h-80 overflow-hidden lg:min-h-full ${previewDevice === "mobile" ? "order-2" : draft.hero_image_placement === "left" ? "order-1" : "order-2"}`}>
                      <img
                        src={draft.hero_image_url}
                        alt=""
                        className={`absolute inset-0 h-full w-full ${draft.hero_image_fit === "contain" ? "object-contain" : "object-cover"} ${draft.hero_image_position === "top" ? "object-top" : draft.hero_image_position === "bottom" ? "object-bottom" : "object-center"}`}
                      />
                    </div>
                  ) : null}
                </div>
              )}
            </CanvasBlock>
            <div className="flex flex-col">
            {sectionOrder.map((section, index) => {
              const visible = Boolean(draft[sectionVisibilityKey[section]]);
              return (
                <CanvasBlock
                  key={section}
                  anchorId={section}
                  order={layoutOrder.indexOf(sectionLayoutId(section))}
                  active={editingEnabled && !selectedCustomBlockId && selectedSection === section}
                  muted={!visible}
                  onClick={() => editingEnabled && chooseSection(section)}
                >
                  <div
                    className={publicSystemSectionClass(
                      draft,
                      section,
                      section === "services"
                        ? "py-12 text-white sm:py-16"
                        : index % 2
                          ? "bg-white/70 py-12 sm:py-16"
                          : "py-12 sm:py-16",
                      false,
                    )}
                    style={publicSystemSectionStyle(draft, section, {
                      ...(section === "services"
                        ? { backgroundColor: draft.theme_dark ?? "#191b20" }
                        : {}),
                    })}
                  >
                    <div className={publicSystemSectionContentClass(draft, section)}>
                      {!publicSystemSectionVisibleOnDevice(draft, section, previewDevice) ? (
                        <p className="mb-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-[9px] font-semibold text-amber-800">
                          Скрыто на выбранном устройстве
                        </p>
                      ) : null}
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: draft.theme_accent ?? "#9a742e" }}>
                        {(draft[`${section}_label` as keyof PublicSiteContent] as string | undefined) ?? t(sectionLabelKey[section])}
                      </p>
                      <h3 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">
                        {(draft[`${section}_title` as keyof PublicSiteContent] as string | undefined) ?? t(sectionLabelKey[section])}
                      </h3>
                      <CanvasSectionPreview
                        section={section}
                        draft={draft}
                        services={previewServices}
                        portfolio={previewPortfolio}
                      />
                    </div>
                  </div>
                </CanvasBlock>
              );
            })}
            {(draft.custom_blocks ?? []).map((block) => (
              <CanvasBlock
                key={block.id}
                anchorId={`custom:${block.id}`}
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
            <footer
              className="px-8 py-8 text-white sm:px-12"
              style={{ backgroundColor: draft.theme_dark ?? "#191b20" }}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={draft.brand_name || businessName}
                      className="max-h-10 max-w-[170px] object-contain object-left"
                    />
                  ) : (
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                      {draft.brand_name || businessName}
                    </p>
                  )}
                  {draft.footer_note ? (
                    <p className="mt-3 max-w-md whitespace-pre-line text-[9px] leading-5 text-white/55">
                      {draft.footer_note}
                    </p>
                  ) : null}
                </div>
                <div className="text-[9px] leading-5 text-white/65 sm:text-right">
                  {draft.contact_email ? <p>{draft.contact_email}</p> : null}
                  {draft.contact_phone ? <p>{draft.contact_phone}</p> : null}
                  {draft.show_social_icons && draft.social_links?.length ? (
                    <p>Социальные сети · {draft.social_links.length}</p>
                  ) : null}
                </div>
              </div>
              <p className="mt-5 border-t border-white/15 pt-4 text-[8px] text-white/35">
                © {new Date().getFullYear()} {draft.brand_name || businessName} · OneStudio OS
              </p>
            </footer>
            </>
            )}
          </div>
        </div>

        {siteDesignOpen ? (
          <SiteDesignSidebar
            draft={draft}
            disabled={!canConfigure}
            premiumIsolated={Boolean(selectedPremiumTemplate)}
            onUpdate={onUpdate}
            onAdvanced={() => setSiteSettingsOpen(true)}
            onClose={() => {
              setSiteDesignOpen(false);
              setSettingsOpen(true);
            }}
          />
        ) : settingsOpen ? (
        <aside className="relative h-full min-w-0 overflow-y-auto overscroll-contain border-l border-black/10 bg-white p-5 [scrollbar-gutter:stable]">
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
                    <CustomBlockSettings
                      block={selectedCustomBlock}
                      disabled={!canConfigure || !editingEnabled}
                      colorDisabled={!canConfigure}
                      t={t}
                      siteAccent={draft.theme_accent ?? "#9d3151"}
                      siteDark={draft.theme_dark ?? "#321722"}
                      siteSurface={draft.theme_surface ?? "#fff7f5"}
                      onChange={updateCustomBlock}
                      onDuplicate={duplicateCustomBlock}
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
                    <MoveControls
                      disabled={!canConfigure || !editingEnabled}
                      first={(activePage.blocks ?? [])[0]?.id === selectedCustomBlock.id}
                      last={(activePage.blocks ?? []).at(-1)?.id === selectedCustomBlock.id}
                      t={t}
                      onUp={() => movePageBlock(selectedCustomBlock.id, -1)}
                      onDown={() => movePageBlock(selectedCustomBlock.id, 1)}
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
                <CustomBlockSettings
                  block={selectedCustomBlock}
                  disabled={!canConfigure || !editingEnabled}
                  colorDisabled={!canConfigure}
                  t={t}
                  siteAccent={draft.theme_accent ?? "#9d3151"}
                  siteDark={draft.theme_dark ?? "#321722"}
                  siteSurface={draft.theme_surface ?? "#fff7f5"}
                  onChange={updateCustomBlock}
                  onDuplicate={duplicateCustomBlock}
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
              </>
            ) : selectedSection === "hero" ? (
              <>
                <Toggle
                  label={t("Show hero block")}
                  checked={draft.show_hero !== false}
                  disabled={!canConfigure || !editingEnabled}
                  onChange={(value) => onUpdate("show_hero", value)}
                />
                <BlockColorsEditor
                  colors={draft.section_colors?.hero}
                  defaults={sectionColorDefaults}
                  disabled={!canConfigure}
                  t={t}
                  onChange={updateSectionColors}
                />
                <Toggle label={t("Show announcement bar")} checked={draft.show_announcement !== false} disabled={!canConfigure || !editingEnabled} onChange={(value) => onUpdate("show_announcement", value)} />
                <CompactField label={t("Announcement text")} value={draft.announcement_text ?? ""} disabled={!canConfigure || !editingEnabled} onChange={(value) => onUpdate("announcement_text", value)} />
                <div className="mt-2 border-t border-black/8 pt-4 text-xs font-semibold">{t("Header settings")}</div>
                <Toggle label={t("Sticky header")} checked={draft.header_sticky === true} disabled={!canConfigure || !editingEnabled} onChange={(value) => onUpdate("header_sticky", value)} />
                <CompactSelect
                  label={t("Logo size")}
                  value={draft.header_logo_size ?? "medium"}
                  disabled={!canConfigure || !editingEnabled}
                  options={[
                    { value: "small", label: t("Small") },
                    { value: "medium", label: t("Medium") },
                    { value: "large", label: t("Large") },
                  ]}
                  onChange={(value) => onUpdate("header_logo_size", value as "small" | "medium" | "large")}
                />
                <CompactSelect
                  label={t("Logo position")}
                  value={draft.header_logo_position ?? "left"}
                  disabled={!canConfigure || !editingEnabled}
                  options={[
                    { value: "left", label: t("Left") },
                    { value: "center", label: t("Center") },
                  ]}
                  onChange={(value) => onUpdate("header_logo_position", value as "left" | "center")}
                />
                <div className="mt-2 border-t border-black/8 pt-4 text-xs font-semibold">{t("Hero settings")}</div>
                <CompactSelect
                  label={t("Hero layout")}
                  value={draft.hero_layout ?? "split"}
                  disabled={!canConfigure || !editingEnabled}
                  options={[
                    { value: "split", label: t("Image beside text") },
                    { value: "cover", label: t("Image as background") },
                    { value: "text", label: t("Text only") },
                  ]}
                  onChange={(value) => onUpdate("hero_layout", value as "split" | "cover" | "text")}
                />
                <CompactSelect
                  label={t("Image fit")}
                  value={draft.hero_image_fit ?? "cover"}
                  disabled={!canConfigure || !editingEnabled || draft.hero_layout === "text"}
                  options={[
                    { value: "cover", label: t("Fill and crop") },
                    { value: "contain", label: t("Show whole image") },
                  ]}
                  onChange={(value) => onUpdate("hero_image_fit", value as "cover" | "contain")}
                />
                <CompactSelect
                  label={t("Image position")}
                  value={draft.hero_image_placement === "left" ? "left" : "right"}
                  disabled={!canConfigure || !editingEnabled || draft.hero_layout !== "split"}
                  options={[
                    { value: "right", label: t("Right") },
                    { value: "left", label: t("Left") },
                  ]}
                  onChange={(value) => onUpdate("hero_image_placement", value as "left" | "right")}
                />
                <CompactField label={t("Eyebrow")} value={draft.hero_eyebrow} disabled={!canConfigure || !editingEnabled} onChange={(value) => onUpdate("hero_eyebrow", value)} />
                <CompactField label={t("Main title")} value={draft.hero_title} disabled={!canConfigure || !editingEnabled} onChange={(value) => onUpdate("hero_title", value)} multiline />
                <CompactSelect
                  label={t("Hero mobile title size")}
                  value={draft.hero_title_mobile_size ?? "medium"}
                  disabled={!canConfigure || !editingEnabled}
                  options={[
                    { value: "small", label: t("Compact mobile title") },
                    { value: "medium", label: t("Standard mobile title") },
                    { value: "large", label: t("Large mobile title") },
                  ]}
                  onChange={(value) =>
                    onUpdate(
                      "hero_title_mobile_size",
                      value as "small" | "medium" | "large",
                    )
                  }
                />
                <CompactField label={t("Introduction")} value={draft.hero_text} disabled={!canConfigure || !editingEnabled} onChange={(value) => onUpdate("hero_text", value)} multiline />
                <CompactField label={t("Primary button label")} value={draft.hero_primary_label ?? draft.booking_label} disabled={!canConfigure || !editingEnabled} onChange={(value) => onUpdate("hero_primary_label", value)} />
                <CompactField label={t("Primary button link")} value={draft.hero_primary_url ?? ""} disabled={!canConfigure || !editingEnabled} onChange={(value) => onUpdate("hero_primary_url", value)} />
                <Toggle label={t("Show secondary button")} checked={draft.show_hero_secondary !== false} disabled={!canConfigure || !editingEnabled} onChange={(value) => onUpdate("show_hero_secondary", value)} />
                <CompactField label={t("Secondary button label")} value={draft.hero_secondary_label ?? ""} disabled={!canConfigure || !editingEnabled || draft.show_hero_secondary === false} onChange={(value) => onUpdate("hero_secondary_label", value)} />
                <CompactField label={t("Secondary button link")} value={draft.hero_secondary_url ?? ""} disabled={!canConfigure || !editingEnabled || draft.show_hero_secondary === false} onChange={(value) => onUpdate("hero_secondary_url", value)} />
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
                <SystemSectionSettingsEditor
                  settings={selectedSystemSectionSettings}
                  disabled={!canConfigure || !editingEnabled}
                  allowBackground
                  t={t}
                  onChange={updateSystemSectionSettings}
                  onChooseImage={() =>
                    openMediaPicker({
                      kind: "section-background",
                      section: selectedSection,
                      label: `${t(sectionLabelKey[selectedSection])} · ${t("Image as background")}`,
                    })
                  }
                />
                <BlockColorsEditor
                  colors={draft.section_colors?.[selectedSection]}
                  defaults={sectionColorDefaults}
                  disabled={!canConfigure}
                  t={t}
                  onChange={updateSectionColors}
                />
                <CompactField
                  label={t("Heading")}
                  value={(draft[`${selectedSection}_title` as keyof PublicSiteContent] as string | undefined) ?? ""}
                  disabled={!canConfigure || !editingEnabled}
                  onChange={(value) => onUpdate(`${selectedSection}_title` as keyof PublicSiteContent, value)}
                  multiline
                />
                {selectedSection === "about" ? (
                  <>
                    <CompactField
                      label={t("Text")}
                      value={draft.about_text}
                      disabled={!canConfigure || !editingEnabled}
                      onChange={(value) => onUpdate("about_text", value)}
                      multiline
                    />
                    <ImageEditor
                      label={`${t("About")} · ${t("Image")}`}
                      value={draft.about_image_url ?? ""}
                      disabled={!canConfigure || !editingEnabled}
                      t={t}
                      onChange={(value) => onUpdate("about_image_url", value)}
                      onChoose={() =>
                        openMediaPicker({
                          kind: "content",
                          key: "about_image_url",
                          label: `${t("About")} · ${t("Image")}`,
                        })
                      }
                    />
                    <CompactField
                      label={t("Feature cards")}
                      value={draft.about_facts ?? ""}
                      disabled={!canConfigure || !editingEnabled}
                      onChange={(value) => onUpdate("about_facts", value)}
                      multiline
                    />
                    <p className="-mt-2 text-[11px] leading-5 text-[#817c72]">
                      {"5+ · лет опыта / 5+ · years of experience"}
                    </p>
                    <CompactField
                      label={t("Button")}
                      value={draft.about_button_label ?? ""}
                      disabled={!canConfigure || !editingEnabled}
                      onChange={(value) => onUpdate("about_button_label", value)}
                    />
                    <CompactField
                      label={t("Button link")}
                      value={draft.about_button_url ?? ""}
                      disabled={!canConfigure || !editingEnabled}
                      onChange={(value) => onUpdate("about_button_url", value)}
                    />
                  </>
                ) : null}
                {selectedSection === "services" ? (
                  <ServicesSectionEditor
                    services={previewServices}
                    draft={draft}
                    disabled={!canConfigure || !editingEnabled}
                    t={t}
                    onUpdate={onUpdate}
                    onChooseImage={(service) =>
                      openMediaPicker({
                        kind: "service-card",
                        slug: service.slug,
                        label: `${t("Service image")}: ${service.title}`,
                      })
                    }
                  />
                ) : null}
                {selectedSection === "portfolio" ? (
                  <PortfolioSectionEditor
                    projects={previewPortfolio}
                    draft={draft}
                    disabled={!canConfigure || !editingEnabled}
                    t={t}
                    onUpdate={onUpdate}
                  />
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
                  <div className="grid gap-3">
                    <CompactField
                      label="Вводный текст клуба"
                      value={draft.membership_text ?? ""}
                      disabled={!canConfigure || !editingEnabled}
                      multiline
                      onChange={(value) => onUpdate("membership_text", value)}
                    />
                    <MembershipCardsEditor
                      items={draft.membership_items ?? ""}
                      images={
                        draft.membership_image_urls
                        ?? [draft.membership_image_url || glossMembershipImage]
                      }
                      disabled={!canConfigure || !editingEnabled}
                      t={t}
                      onChange={onUpdateMembership}
                      onChooseImage={(index) =>
                        openMediaPicker({
                          kind: "list",
                          key: "membership_image_urls",
                          index,
                          label: `Изображение уровня клуба ${index + 1}`,
                        })
                      }
                    />
                  </div>
                ) : null}
                {selectedSection === "booking" ? (
                  <CompactField label={t("Text")} value={draft.booking_text ?? ""} disabled={!canConfigure || !editingEnabled} onChange={(value) => onUpdate("booking_text", value)} multiline />
                ) : null}
                {selectedSection === "safety" ? (
                  <SafetyCardsEditor
                    items={draft.safety_items ?? ""}
                    disabled={!canConfigure || !editingEnabled}
                    t={t}
                    onChange={(value) => onUpdate("safety_items", value)}
                  />
                ) : null}
                {selectedSection === "gift" ? (
                  <div className="grid gap-3">
                    <CompactField
                      label={t("Text")}
                      value={draft.gift_text ?? ""}
                      disabled={!canConfigure || !editingEnabled}
                      onChange={(value) => onUpdate("gift_text", value)}
                      multiline
                    />
                    <GiftCertificatesEditor
                      items={draft.gift_items ?? ""}
                      images={
                        draft.gift_image_urls
                        ?? [draft.gift_image_url || glossGiftImage]
                      }
                      disabled={!canConfigure || !editingEnabled}
                      t={t}
                      onChange={onUpdateGift}
                      onChooseImage={(index) =>
                        openMediaPicker({
                          kind: "list",
                          key: "gift_image_urls",
                          index,
                          label: `Изображение сертификата ${index + 1}`,
                        })
                      }
                    />
                  </div>
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
                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-[#9d3151]/15 bg-[#fff8fa] px-4 py-3 text-[11px] leading-5 text-[#716d65]">
                      Контакты сохраняются в черновике этой языковой версии. На публичном сайте они изменятся только после публикации.
                    </div>
                    <CompactField
                      label="Email для посетителей"
                      value={draft.contact_email ?? ""}
                      disabled={!canConfigure || !editingEnabled}
                      onChange={(value) => onUpdate("contact_email", value)}
                    />
                    <CompactField
                      label="Телефон для посетителей"
                      value={draft.contact_phone ?? ""}
                      disabled={!canConfigure || !editingEnabled}
                      onChange={(value) => onUpdate("contact_phone", value)}
                    />
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
                    <CompactField
                      label="Подсказка посетителю"
                      value={draft.contact_note ?? ""}
                      disabled={!canConfigure || !editingEnabled}
                      multiline
                      onChange={(value) => onUpdate("contact_note", value)}
                    />
                    <CompactField
                      label="Текст кнопки маршрута"
                      value={draft.contact_route_label ?? ""}
                      disabled={!canConfigure || !editingEnabled}
                      onChange={(value) => onUpdate("contact_route_label", value)}
                    />
                    <CompactField
                      label="Короткий текст в подвале"
                      value={draft.footer_note ?? ""}
                      disabled={!canConfigure || !editingEnabled}
                      multiline
                      onChange={(value) => onUpdate("footer_note", value)}
                    />
                    <p className="text-[11px] leading-5 text-[#716d65]">
                      Карта использует отдельный поисковый адрес. Социальные сети редактируются в «Настройках сайта» и выводятся здесь и в подвале.
                    </p>
                  </div>
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
                      <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${visible ? "bg-emerald-50 text-emerald-700" : "bg-[#f4ead6] text-[#4f3a12]"}`}>
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
                  {previewPortfolio.slice(0, 4).map((project) => (
                    <img key={project.slug} src={project.image_url ?? ""} alt="" className="h-20 w-full rounded-xl object-cover" />
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
            <section className="mt-7">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9d3151]">Шаблон сайта</p>
                  <h3 className="mt-2 text-xl font-semibold">Текущий и Premium runtime</h3>
                </div>
                <p className="text-xs text-[#716d65]">Публикация выполняется отдельно</p>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {SITE_TEMPLATE_REGISTRY.filter((template) => template.key === "standard" || template.tier === "premium").map((template) => {
                  const selected = (draft.template_id || "standard") === template.key;
                  const previewHref = `/site-preview/${template.key}/${businessSlug}`;
                  return (
                    <article key={template.key} className={`rounded-[22px] border bg-white p-5 ${selected ? "border-[#9d3151] ring-2 ring-[#9d3151]/10" : "border-black/8"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{template.name}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#8b877e]">{template.category}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${template.tier === "premium" ? "bg-[#3e263e] text-[#fef9ef]" : "bg-[#efeee9] text-[#4f4b45]"}`}>{template.tier}</span>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-[#716d65]">{template.description}</p>
                      <div className="mt-5 flex gap-2">
                        <button type="button" disabled={selected || !canConfigure || saving} onClick={() => void onTemplateKey(template.key)} className="flex-1 rounded-xl bg-[#17191f] px-4 py-3 text-xs font-semibold text-white disabled:opacity-40">
                          {selected ? "Выбран" : "Выбрать шаблон"}
                        </button>
                        {template.tier === "premium" ? <Link href={previewHref} target="_blank" rel="noreferrer" className="rounded-xl border border-black/15 px-4 py-3 text-xs font-semibold">Предпросмотр ↗</Link> : null}
                      </div>
                      {selected ? (
                        <p className="mt-3 text-xs font-semibold text-emerald-700">
                          {templateSavingKey === template.key
                            ? "Сохраняем в черновик…"
                            : templateSavedKey === template.key
                              ? "Сохранено в черновик"
                              : "Выбрано в черновике"}
                        </p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
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

            <section className="mt-7 grid gap-4 rounded-[24px] border border-[#9d3151]/20 bg-white p-5 sm:p-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9d3151]">Бренд</p>
                <h3 className="mt-2 text-lg font-semibold">Логотип сайта</h3>
                <p className="mt-2 text-sm leading-6 text-[#716d65]">
                  Отдельный логотип для шапки сайта. Это не favicon и не изображение Open Graph.
                </p>
              </div>
              <ImageEditor
                label="Логотип сайта"
                value={logoUrl}
                disabled={!canConfigure}
                t={t}
                onChange={onLogoChange}
                onChoose={() =>
                  openMediaPicker({
                    kind: "logo",
                    label: "Логотип сайта",
                  })
                }
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onLogoChange(savedLogoUrl)}
                  disabled={!canConfigure || logoUrl === savedLogoUrl}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2 text-xs font-semibold disabled:opacity-35"
                >
                  Отменить изменение
                </button>
                <button
                  type="button"
                  onClick={() => onLogoChange(activeTemplate?.logoUrl ?? "")}
                  disabled={!canConfigure || !activeTemplate}
                  className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900 disabled:opacity-35"
                >
                  Вернуть логотип демо
                </button>
                <p className="text-xs leading-5 text-[#716d65]">
                  В опубликованном сайте логотип изменится только после кнопки «Опубликовать».
                </p>
              </div>
            </section>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
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

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">
                    {t("Ready-made palettes")}
                  </p>
                  <div className="mt-3 grid gap-2">
                    {SITE_COLOR_PRESETS.map((preset) => {
                      const selected =
                        draft.theme_accent?.toLowerCase() === preset.accent &&
                        draft.theme_dark?.toLowerCase() === preset.dark &&
                        draft.theme_surface?.toLowerCase() === preset.surface;

                      return (
                        <button
                          key={preset.id}
                          type="button"
                          disabled={!canConfigure}
                          aria-pressed={selected}
                          aria-label={t("Apply Bordeaux palette")}
                          onClick={() => {
                            onUpdate("theme_accent", preset.accent);
                            onUpdate("theme_dark", preset.dark);
                            onUpdate("theme_surface", preset.surface);
                          }}
                          className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition disabled:opacity-40 ${
                            selected
                              ? "border-[#9d3151]/45 bg-[#fff3f6] shadow-sm"
                              : "border-black/10 bg-white hover:border-[#9d3151]/35"
                          }`}
                        >
                          <span>
                            <strong className="block text-sm">{t(preset.name)}</strong>
                            <span className="mt-1 block text-[11px] text-[#716d65]">
                              #9d3151 · #321722 · #fff7f5
                            </span>
                          </span>
                          <span className="flex shrink-0 -space-x-1">
                            {[preset.surface, preset.accent, preset.dark].map(
                              (color) => (
                                <i
                                  key={color}
                                  className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
                                  style={{ backgroundColor: color }}
                                />
                              ),
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

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
                <GlobalDesignSystemEditor
                  design={draft.design_system}
                  disabled={!canConfigure}
                  onChange={(value) => onUpdate("design_system", value)}
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
  portfolio: PublicSiteProject[];
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
      className={publicSiteDesignClass(draft, page.is_visible === false ? "opacity-45 grayscale" : "")}
      style={{
        "--site-accent": draft.theme_accent ?? "#9d3151",
        "--site-dark": draft.theme_dark ?? "#321722",
      } as React.CSSProperties}
    >
      <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
        <span className="text-xs font-semibold uppercase tracking-[0.2em]">
          {draft.brand_name}
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#4f4b45]">
          Главная · {page.nav_label} · {draft.contact_label}
        </span>
        <span className="os-site-button rounded-full bg-[var(--site-dark)] px-4 py-2 text-[9px] font-semibold text-white">
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
        <div
          className={
            draft.portfolio_layout === "grid"
              ? `grid gap-3 ${
                  draft.portfolio_columns === 2
                    ? "sm:grid-cols-2"
                    : draft.portfolio_columns === 4
                      ? "sm:grid-cols-2 lg:grid-cols-4"
                      : "sm:grid-cols-3"
                }`
              : `columns-2 gap-3 ${
                  draft.portfolio_columns === 4
                    ? "lg:columns-4"
                    : draft.portfolio_columns === 2
                      ? "lg:columns-2"
                      : "lg:columns-3"
                }`
          }
        >
          {portfolio.map((project, index) => (
            <article
              key={project.slug}
              className={`os-site-card overflow-hidden rounded-2xl bg-white shadow-sm ${
                draft.portfolio_layout === "grid"
                  ? ""
                  : "mb-3 break-inside-avoid"
              }`}
            >
              <div
                className={
                  draft.portfolio_card_aspect === "square"
                    ? "aspect-square"
                    : draft.portfolio_card_aspect === "landscape"
                      ? "aspect-[4/3]"
                      : draft.portfolio_card_aspect === "portrait"
                        ? "aspect-[4/5]"
                        : index % 4 === 0
                          ? "aspect-[4/5]"
                          : "aspect-[4/3]"
                }
              >
                {project.image_url ? (
                  <img
                    src={project.image_url}
                    alt={project.image_alt}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              {draft.portfolio_show_category !== false ||
              draft.portfolio_show_title !== false ||
              (draft.portfolio_show_description === true &&
                project.description) ? (
                <div className="px-3 py-3">
                  {draft.portfolio_show_category !== false ? (
                    <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--site-accent)]">
                      {project.category}
                    </p>
                  ) : null}
                  {draft.portfolio_show_title !== false ? (
                    <p className="mt-1 text-[10px] font-semibold">
                      {project.title}
                    </p>
                  ) : null}
                  {draft.portfolio_show_description === true &&
                  project.description ? (
                    <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-[#4f4b45]">
                      {project.description}
                    </p>
                  ) : null}
                </div>
              ) : null}
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
            <span className="os-site-button rounded-full bg-white px-5 py-3 text-[10px] font-semibold text-[var(--site-dark)]">
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
      className={publicSiteDesignClass(draft, page.is_visible === false ? "opacity-45 grayscale" : "")}
      style={{
        "--site-accent": draft.theme_accent ?? "#9d3151",
        "--site-dark": draft.theme_dark ?? "#321722",
      } as React.CSSProperties}
    >
      <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
        <span className="font-serif text-xl">{draft.brand_name}</span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#4f4b45]">
          Главная · {page.nav_label} · {draft.contact_label}
        </span>
        <span className="os-site-button rounded-md bg-[var(--site-dark)] px-4 py-2 text-[9px] font-semibold text-white">
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
            <span className="os-site-button rounded-md bg-white px-5 py-3 text-[10px] font-semibold text-[var(--site-dark)]">
              {draft.booking_label}
            </span>
          </div>
        </button>
      ) : null}
    </div>
  );
}

function CustomBlockPreview({ block }: { block: PublicSiteCustomBlock }) {
  const customColors = block.colors?.mode === "custom";
  const dark = !customColors && block.tone === "dark";
  const accent = !customColors && block.tone === "accent";
  const style = customColors
    ? "border-y border-black/8"
    : dark
    ? "bg-[#321722] text-white"
    : accent
      ? "bg-[#9d3151] text-white"
      : "border-y border-black/8 bg-white/70 text-[#321722]";
  const inlineStyle = colorOverrideStyle(block.colors);
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
  const contentWidth = {
    full: "max-w-none",
    wide: "max-w-5xl",
    medium: "max-w-4xl",
    narrow: "max-w-2xl",
  }[block.content_width ?? "wide"];
  const paddingTop = {
    none: "pt-0",
    compact: "pt-6 sm:pt-8",
    normal: "pt-12 sm:pt-14",
    airy: "pt-16 sm:pt-20",
  }[block.padding_top ?? "normal"];
  const paddingBottom = {
    none: "pb-0",
    compact: "pb-6 sm:pb-8",
    normal: "pb-12 sm:pb-14",
    airy: "pb-16 sm:pb-20",
  }[block.padding_bottom ?? "normal"];
  const sectionHeight = {
    auto: "",
    compact: "min-h-[240px]",
    medium: "min-h-[360px]",
    tall: "min-h-[480px]",
    screen: "min-h-[620px]",
  }[block.section_height ?? "auto"];
  const mediaHeightMode = block.media_height ?? "auto";
  const mediaHeight = {
    auto: mediaAspect,
    compact: "h-44 sm:h-56",
    medium: "h-56 sm:h-72",
    tall: "h-72 sm:h-[420px]",
  }[mediaHeightMode];

  if (block.kind === "media_text") {
    const mediaOnRight = block.media_position !== "left";
    return (
      <div
        className={`px-8 sm:px-12 ${paddingTop} ${paddingBottom} ${sectionHeight} ${style}`}
        style={inlineStyle}
      >
        <div className={`mx-auto grid w-full ${contentWidth} gap-7 lg:grid-cols-2 lg:items-center`}>
        <div className={mediaOnRight ? "lg:order-2" : "lg:order-1"}>
          <div className={`mx-auto ${mediaSize} ${mediaFrame} overflow-hidden`}>
            <div
              className={`relative grid place-items-center overflow-hidden bg-black/10 ${
                block.media_frame === "none" ? "" : "rounded-lg"
              } ${mediaHeight}`}
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
      </div>
    );
  }

  return (
    <div className={`px-8 sm:px-12 ${paddingTop} ${paddingBottom} ${sectionHeight} ${style}`} style={inlineStyle}>
      <div className={`mx-auto w-full ${contentWidth}`}>
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
              mediaHeightMode === "auto"
                ? ""
                : `${mediaHeight} [grid-auto-rows:minmax(0,1fr)]`
            } ${block.media_frame === "none" ? "" : "rounded-lg"}`}
          >
            {(block.media_urls ?? []).slice(0, 8).map((image, index) => (
              <div
                key={`${block.id}-collage-preview-${index}`}
                className={`relative overflow-hidden bg-black/10 ${
                  mediaHeightMode === "auto"
                    ? index === 0 && (block.media_urls ?? []).length >= 3
                      ? "row-span-2 min-h-40"
                      : "min-h-20"
                    : index === 0 && (block.media_urls ?? []).length >= 3
                      ? "row-span-2 h-full min-h-0"
                      : "h-full min-h-0"
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
          <div className={`relative overflow-hidden bg-black/10 ${mediaHeight} ${block.media_frame === "none" ? "" : "rounded-lg"}`}>
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
          <div className={`relative grid place-items-center overflow-hidden bg-black/80 text-center text-white ${mediaHeight} ${block.media_frame === "none" ? "" : "rounded-lg"}`}>
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

function SiteDesignSidebar({
  draft,
  disabled,
  premiumIsolated,
  onUpdate,
  onAdvanced,
  onClose,
}: {
  draft: PublicSiteContent;
  disabled: boolean;
  premiumIsolated: boolean;
  onUpdate: <Key extends keyof PublicSiteContent>(
    key: Key,
    value: PublicSiteContent[Key],
  ) => void;
  onAdvanced: () => void;
  onClose: () => void;
}) {
  const designDisabled = disabled || premiumIsolated;

  return (
    <aside className="relative h-full min-w-0 overflow-hidden border-l border-black/10 bg-[#fbfaf7] text-[#17191f]">
      <div className="h-full overflow-y-auto overscroll-contain p-4 sm:p-5 [scrollbar-gutter:stable]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9d3151]">
              Дизайн
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em]">Дизайн сайта</h2>
            <p className="mt-2 text-[11px] leading-5 text-[#716d65]">
              Меняйте стиль здесь и сразу смотрите результат на странице слева.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#716d65]"
          >
            К блоку →
          </button>
        </div>

        {premiumIsolated ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900">
            Этот Premium-шаблон использует собственную дизайн-систему. Глобальные настройки 2.4 не меняют его внешний вид, поэтому BEMBI остаётся изолированным.
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            <details open className="group rounded-2xl border border-black/8 bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold">
                <span>Цвета</span>
                <span className="text-[#9d3151] transition group-open:rotate-45">+</span>
              </summary>
              <div className="mt-4 grid gap-4">
                <div className="flex flex-wrap gap-2">
                  {SITE_COLOR_PRESETS.map((preset) => {
                    const selected =
                      draft.theme_accent?.toLowerCase() === preset.accent &&
                      draft.theme_dark?.toLowerCase() === preset.dark &&
                      draft.theme_surface?.toLowerCase() === preset.surface;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        disabled={designDisabled}
                        onClick={() => {
                          onUpdate("theme_accent", preset.accent);
                          onUpdate("theme_dark", preset.dark);
                          onUpdate("theme_surface", preset.surface);
                        }}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-semibold transition disabled:opacity-40 ${selected ? "border-[#9d3151]/40 bg-[#fff3f6]" : "border-black/10 bg-white"}`}
                      >
                        <span className="flex -space-x-1">
                          {[preset.surface, preset.accent, preset.dark].map((color) => (
                            <i key={color} className="h-5 w-5 rounded-full border-2 border-white" style={{ backgroundColor: color }} />
                          ))}
                        </span>
                        {preset.name}
                      </button>
                    );
                  })}
                </div>
                <ColorEditor label="Основной" value={draft.theme_accent ?? "#9d3151"} disabled={designDisabled} onChange={(value) => onUpdate("theme_accent", value)} />
                <ColorEditor label="Тёмный" value={draft.theme_dark ?? "#321722"} disabled={designDisabled} onChange={(value) => onUpdate("theme_dark", value)} />
                <ColorEditor label="Фон" value={draft.theme_surface ?? "#fff7f5"} disabled={designDisabled} onChange={(value) => onUpdate("theme_surface", value)} />
              </div>
            </details>

            <GlobalDesignSystemEditor
              design={draft.design_system}
              disabled={designDisabled}
              onChange={(value) => onUpdate("design_system", value)}
              compact
            />

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[11px] leading-5 text-emerald-900">
              ● Живой предпросмотр включён. Сохранение и публикация остаются отдельными действиями.
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onAdvanced}
          className="mt-5 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-semibold text-[#4f4b45]"
        >
          Все настройки сайта…
        </button>
      </div>
    </aside>
  );
}

function GlobalDesignSystemEditor({
  design,
  disabled,
  onChange,
  compact = false,
}: {
  design?: PublicSiteDesignSystem;
  disabled: boolean;
  onChange: (value: PublicSiteDesignSystem) => void;
  compact?: boolean;
}) {
  const current = design ?? {};

  const setGroup = (
    group: "typography" | "buttons" | "cards",
    value: Record<string, string>,
  ) => {
    const next: PublicSiteDesignSystem = { ...current };
    if (Object.keys(value).length === 0) {
      delete next[group];
    } else {
      (next as Record<string, unknown>)[group] = value;
    }
    onChange(next);
  };

  const patch = (
    group: "typography" | "buttons" | "cards",
    field: string,
    value: string,
  ) => {
    const nextGroup = { ...(current[group] ?? {}) } as Record<string, string>;
    if (value === "template") delete nextGroup[field];
    else nextGroup[field] = value;
    setGroup(group, nextGroup);
  };

  const buttonRadius = current.buttons?.radius ?? "template";
  const cardPreset = !current.cards
    ? "template"
    : current.cards.shadow === "strong"
      ? "elevated"
      : current.cards.border === "strong" || current.cards.border === "subtle"
        ? "outlined"
        : current.cards.shadow === "none" && current.cards.border === "none"
          ? "flat"
          : "custom";

  const quickButton = (active: boolean) =>
    `rounded-xl border px-3 py-2 text-[11px] font-semibold transition disabled:opacity-40 ${active ? "border-[#9d3151]/40 bg-[#fff3f6] text-[#7f2742]" : "border-black/10 bg-white text-[#4f4b45]"}`;

  return (
    <div className={`grid gap-4 ${compact ? "" : "rounded-2xl border border-[#9d3151]/15 bg-[#fff9fb] p-4"}`}>
      {!compact ? (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8d2d4a]">Global Design System 2.4</p>
          <p className="mt-1 text-[11px] leading-5 text-[#716d65]">«Из шаблона» оставляет исходный характер шаблона.</p>
        </div>
      ) : null}

      <details open className="group rounded-2xl border border-black/8 bg-white p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold">
          <span>Типографика</span>
          <span className="text-[#9d3151] transition group-open:rotate-45">+</span>
        </summary>
        <div className="mt-4 grid gap-3">
          <CompactSelect
            label="Основной шрифт"
            value={current.typography?.body_font ?? "template"}
            disabled={disabled}
            options={[
              { value: "template", label: "Из шаблона" },
              { value: "system", label: "Современный" },
              { value: "humanist", label: "Мягкий" },
              { value: "editorial", label: "Редакционный serif" },
            ]}
            onChange={(value) => patch("typography", "body_font", value)}
          />
          <CompactSelect
            label="Шрифт заголовков"
            value={current.typography?.heading_font ?? "template"}
            disabled={disabled}
            options={[
              { value: "template", label: "Из шаблона" },
              { value: "system", label: "Современный" },
              { value: "humanist", label: "Мягкий" },
              { value: "editorial", label: "Редакционный serif" },
            ]}
            onChange={(value) => patch("typography", "heading_font", value)}
          />
          <details className="rounded-xl bg-[#f7f5f0] p-3">
            <summary className="cursor-pointer text-[11px] font-semibold text-[#716d65]">Дополнительно</summary>
            <div className="mt-3 grid gap-3">
              <CompactSelect
                label="Насыщенность заголовков"
                value={current.typography?.heading_weight ?? "template"}
                disabled={disabled}
                options={[
                  { value: "template", label: "Из шаблона" },
                  { value: "regular", label: "Обычная" },
                  { value: "medium", label: "Средняя" },
                  { value: "semibold", label: "Полужирная" },
                  { value: "bold", label: "Жирная" },
                ]}
                onChange={(value) => patch("typography", "heading_weight", value)}
              />
              <CompactSelect
                label="Интервал в заголовках"
                value={current.typography?.heading_tracking ?? "template"}
                disabled={disabled}
                options={[
                  { value: "template", label: "Из шаблона" },
                  { value: "tight", label: "Плотный" },
                  { value: "normal", label: "Обычный" },
                  { value: "wide", label: "Свободный" },
                ]}
                onChange={(value) => patch("typography", "heading_tracking", value)}
              />
            </div>
          </details>
        </div>
      </details>

      <details open className="group rounded-2xl border border-black/8 bg-white p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold">
          <span>Кнопки</span>
          <span className="text-[#9d3151] transition group-open:rotate-45">+</span>
        </summary>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            ["template", "Из шаблона"],
            ["square", "Строгие"],
            ["soft", "Мягкие"],
            ["pill", "Капсула"],
          ].map(([value, label]) => (
            <button key={value} type="button" disabled={disabled} onClick={() => patch("buttons", "radius", value)} className={quickButton(buttonRadius === value)}>{label}</button>
          ))}
        </div>
        <details className="mt-3 rounded-xl bg-[#f7f5f0] p-3">
          <summary className="cursor-pointer text-[11px] font-semibold text-[#716d65]">Дополнительно</summary>
          <div className="mt-3">
            <CompactSelect
              label="Тень"
              value={current.buttons?.shadow ?? "template"}
              disabled={disabled}
              options={[
                { value: "template", label: "Из шаблона" },
                { value: "none", label: "Без тени" },
                { value: "soft", label: "Мягкая" },
                { value: "strong", label: "Выразительная" },
              ]}
              onChange={(value) => patch("buttons", "shadow", value)}
            />
          </div>
        </details>
      </details>

      <details open className="group rounded-2xl border border-black/8 bg-white p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold">
          <span>Карточки</span>
          <span className="text-[#9d3151] transition group-open:rotate-45">+</span>
        </summary>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" disabled={disabled} onClick={() => setGroup("cards", {})} className={quickButton(cardPreset === "template")}>Из шаблона</button>
          <button type="button" disabled={disabled} onClick={() => setGroup("cards", { radius: "soft", border: "none", shadow: "none" })} className={quickButton(cardPreset === "flat")}>Плоские</button>
          <button type="button" disabled={disabled} onClick={() => setGroup("cards", { radius: "soft", border: "subtle", shadow: "none" })} className={quickButton(cardPreset === "outlined")}>С рамкой</button>
          <button type="button" disabled={disabled} onClick={() => setGroup("cards", { radius: "rounded", border: "none", shadow: "strong" })} className={quickButton(cardPreset === "elevated")}>Объёмные</button>
        </div>
        <details className="mt-3 rounded-xl bg-[#f7f5f0] p-3">
          <summary className="cursor-pointer text-[11px] font-semibold text-[#716d65]">Точная настройка</summary>
          <div className="mt-3 grid gap-3">
            <CompactSelect label="Форма" value={current.cards?.radius ?? "template"} disabled={disabled} options={[
              { value: "template", label: "Из шаблона" },
              { value: "square", label: "Прямые" },
              { value: "soft", label: "Мягкие" },
              { value: "rounded", label: "Крупное скругление" },
            ]} onChange={(value) => patch("cards", "radius", value)} />
            <CompactSelect label="Граница" value={current.cards?.border ?? "template"} disabled={disabled} options={[
              { value: "template", label: "Из шаблона" },
              { value: "none", label: "Без границы" },
              { value: "subtle", label: "Тонкая" },
              { value: "strong", label: "Выразительная" },
            ]} onChange={(value) => patch("cards", "border", value)} />
            <CompactSelect label="Тень" value={current.cards?.shadow ?? "template"} disabled={disabled} options={[
              { value: "template", label: "Из шаблона" },
              { value: "none", label: "Без тени" },
              { value: "soft", label: "Мягкая" },
              { value: "strong", label: "Выразительная" },
            ]} onChange={(value) => patch("cards", "shadow", value)} />
          </div>
        </details>
      </details>

      <button
        type="button"
        disabled={disabled || Object.keys(current).length === 0}
        onClick={() => onChange({})}
        className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-[11px] font-semibold text-[#716d65] disabled:opacity-35"
      >
        Вернуть дизайн шаблона
      </button>
    </div>
  );
}

function ColorEditor({
  label,
  value,
  disabled,
  presets = [],
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  presets?: string[];
  onChange: (value: string) => void;
}) {
  const normalized = /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000";
  const uniquePresets = [...new Set(presets.filter((color) => /^#[0-9a-f]{6}$/i.test(color)))];
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">
      <p>{label}</p>
      <div className="mt-2 grid grid-cols-[54px_1fr] gap-2">
        <input
          aria-label={label}
          type="color"
          value={normalized}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-[54px] cursor-pointer rounded-xl border border-black/10 bg-white p-1 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <input
          aria-label={`${label} HEX`}
          value={value}
          disabled={disabled}
          maxLength={7}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-12 rounded-xl border border-black/10 bg-white px-3 font-mono text-sm uppercase outline-none focus:border-[#9d3151]/50 focus:ring-2 focus:ring-[#9d3151]/10 disabled:opacity-50"
        />
      </div>
      {uniquePresets.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {uniquePresets.map((color) => (
            <button
              key={color}
              type="button"
              disabled={disabled}
              aria-label={`${label}: ${color}`}
              title={color}
              onClick={() => onChange(color)}
              className={`h-7 w-7 rounded-full border-2 shadow-sm transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 ${
                normalized.toLowerCase() === color.toLowerCase()
                  ? "border-[#17191f] ring-2 ring-black/10"
                  : "border-white"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SystemSectionSettingsEditor({
  settings,
  disabled,
  allowBackground,
  t,
  onChange,
  onChooseImage,
}: {
  settings: Required<PublicSiteSystemSectionSettings>;
  disabled: boolean;
  allowBackground: boolean;
  t: ReturnType<typeof useAdminI18n>["t"];
  onChange: (changes: Partial<PublicSiteSystemSectionSettings>) => void;
  onChooseImage: () => void;
}) {
  return (
    <div className="grid gap-4 rounded-2xl border border-[#9d3151]/15 bg-[#fff9fb] p-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8d2d4a]">
          Внешний вид системного раздела
        </p>
        <p className="mt-1 text-[11px] leading-5 text-[#716d65]">
          Эти параметры одинаково работают в предпросмотре и на опубликованном сайте.
        </p>
      </div>

      <CompactSelect
        label="Композиция"
        value={settings.layout}
        disabled={disabled}
        options={[
          { value: "default", label: "Обычная" },
          { value: "panel", label: "Внутри панели" },
        ]}
        onChange={(value) =>
          onChange({ layout: value === "panel" ? "panel" : "default" })
        }
      />
      <CompactSelect
        label="Ширина содержимого"
        value={settings.content_width}
        disabled={disabled}
        options={[
          { value: "full", label: "На всю ширину" },
          { value: "wide", label: "Широкая" },
          { value: "medium", label: "Средняя" },
          { value: "narrow", label: "Узкая" },
        ]}
        onChange={(value) =>
          onChange({
            content_width:
              value === "full" || value === "medium" || value === "narrow"
                ? value
                : "wide",
          })
        }
      />
      <CompactSelect
        label="Выравнивание текста"
        value={settings.text_align}
        disabled={disabled}
        options={[
          { value: "left", label: "Слева" },
          { value: "center", label: "По центру" },
          { value: "right", label: "Справа" },
        ]}
        onChange={(value) =>
          onChange({
            text_align:
              value === "center" || value === "right" ? value : "left",
          })
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <CompactSelect
          label="Отступ сверху"
          value={settings.padding_top}
          disabled={disabled}
          options={[
            { value: "none", label: "Без отступа" },
            { value: "compact", label: "Небольшой" },
            { value: "normal", label: "Обычный" },
            { value: "airy", label: "Большой" },
          ]}
          onChange={(value) =>
            onChange({
              padding_top:
                value === "none" || value === "compact" || value === "airy"
                  ? value
                  : "normal",
            })
          }
        />
        <CompactSelect
          label="Отступ снизу"
          value={settings.padding_bottom}
          disabled={disabled}
          options={[
            { value: "none", label: "Без отступа" },
            { value: "compact", label: "Небольшой" },
            { value: "normal", label: "Обычный" },
            { value: "airy", label: "Большой" },
          ]}
          onChange={(value) =>
            onChange({
              padding_bottom:
                value === "none" || value === "compact" || value === "airy"
                  ? value
                  : "normal",
            })
          }
        />
      </div>
      <CompactSelect
        label="Минимальная высота"
        value={settings.section_height}
        disabled={disabled}
        options={[
          { value: "auto", label: "По содержимому" },
          { value: "compact", label: "Компактная" },
          { value: "medium", label: "Средняя" },
          { value: "tall", label: "Высокая" },
          { value: "screen", label: "На высоту экрана" },
        ]}
        onChange={(value) =>
          onChange({
            section_height:
              value === "compact" ||
              value === "medium" ||
              value === "tall" ||
              value === "screen"
                ? value
                : "auto",
          })
        }
      />

      {allowBackground ? (
        <>
          <CompactSelect
            label="Фон раздела"
            value={settings.background_mode}
            disabled={disabled}
            options={[
              { value: "theme", label: "Из шаблона" },
              { value: "color", label: "Свой цвет" },
              { value: "image", label: "Изображение" },
              { value: "transparent", label: "Прозрачный" },
            ]}
            onChange={(value) =>
              onChange({
                background_mode:
                  value === "color" ||
                  value === "image" ||
                  value === "transparent"
                    ? value
                    : "theme",
              })
            }
          />
          {settings.background_mode === "image" ? (
            <>
              <ImageEditor
                label={t("Image as background")}
                value={settings.background_image_url}
                disabled={disabled}
                t={t}
                onChange={(value) =>
                  onChange({
                    background_mode: "image",
                    background_image_url: value,
                  })
                }
                onChoose={onChooseImage}
              />
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  label="Положение фона"
                  value={settings.background_position}
                  disabled={disabled}
                  options={[
                    { value: "top", label: "Сверху" },
                    { value: "center", label: "По центру" },
                    { value: "bottom", label: "Снизу" },
                  ]}
                  onChange={(value) =>
                    onChange({
                      background_position:
                        value === "top" || value === "bottom" ? value : "center",
                    })
                  }
                />
                <CompactSelect
                  label="Затемнение"
                  value={settings.background_overlay}
                  disabled={disabled}
                  options={[
                    { value: "none", label: "Без затемнения" },
                    { value: "soft", label: "Мягкое" },
                    { value: "strong", label: "Сильное" },
                  ]}
                  onChange={(value) =>
                    onChange({
                      background_overlay:
                        value === "none" || value === "strong" ? value : "soft",
                    })
                  }
                />
              </div>
            </>
          ) : null}
        </>
      ) : null}

      <CompactSelect
        label="Анимация появления"
        value={settings.animation}
        disabled={disabled}
        options={[
          { value: "none", label: "Без анимации" },
          { value: "fade", label: "Мягкое появление" },
          { value: "rise", label: "Появление снизу" },
          { value: "scale", label: "Лёгкое увеличение" },
        ]}
        onChange={(value) =>
          onChange({
            animation:
              value === "fade" || value === "rise" || value === "scale"
                ? value
                : "none",
          })
        }
      />
      <Toggle
        label="Анимация на телефоне"
        checked={settings.animate_on_mobile}
        disabled={disabled || settings.animation === "none"}
        onChange={(value) => onChange({ animate_on_mobile: value })}
      />

      <div className="grid gap-2 border-t border-[#9d3151]/10 pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
          Видимость по устройствам
        </p>
        <Toggle
          label="Скрыть на компьютере"
          checked={settings.hide_on_desktop}
          disabled={disabled}
          onChange={(value) => onChange({ hide_on_desktop: value })}
        />
        <Toggle
          label="Скрыть на планшете"
          checked={settings.hide_on_tablet}
          disabled={disabled}
          onChange={(value) => onChange({ hide_on_tablet: value })}
        />
        <Toggle
          label="Скрыть на телефоне"
          checked={settings.hide_on_mobile}
          disabled={disabled}
          onChange={(value) => onChange({ hide_on_mobile: value })}
        />
      </div>
    </div>
  );
}

function BlockColorsEditor({
  colors,
  defaults,
  disabled,
  t,
  onChange,
}: {
  colors?: PublicSiteBlockColors;
  defaults: { background: string; text: string; accent: string };
  disabled: boolean;
  t: ReturnType<typeof useAdminI18n>["t"];
  onChange: (colors: PublicSiteBlockColors) => void;
}) {
  const custom = colors?.mode === "custom";
  const current = {
    background: colors?.background ?? defaults.background,
    text: colors?.text ?? defaults.text,
    accent: colors?.accent ?? defaults.accent,
  };
  const combinations = [
    {
      id: "light",
      label: t("Light"),
      background: "#ffffff",
      text: defaults.text,
      accent: defaults.accent,
    },
    {
      id: "accent",
      label: t("Accent"),
      background: defaults.accent,
      text: "#ffffff",
      accent: defaults.text,
    },
    {
      id: "dark",
      label: t("Dark"),
      background: defaults.text,
      text: "#ffffff",
      accent: defaults.accent,
    },
  ];

  function chooseCustom(next = current) {
    onChange({
      mode: "custom",
      background: next.background,
      text: next.text,
      accent: next.accent,
    });
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-black/8 bg-[#faf9f6] p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">
          {t("Block colors")}
        </p>
        <span className="flex -space-x-1" aria-label={t("Current block colors")}> 
          {[current.background, current.accent, current.text].map((color, index) => (
            <i
              key={`${color}-${index}`}
              className="h-6 w-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled}
          aria-pressed={!custom}
          onClick={() => onChange({ mode: "theme" })}
          className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
            !custom
              ? "border-[#17191f] bg-[#17191f] text-white"
              : "border-black/10 bg-white text-[#514d47] hover:border-black/25"
          }`}
        >
          {t("Use site palette")}
        </button>
        <button
          type="button"
          disabled={disabled}
          aria-pressed={custom}
          onClick={() => chooseCustom()}
          className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
            custom
              ? "border-[#9d3151] bg-[#9d3151] text-white"
              : "border-black/10 bg-white text-[#514d47] hover:border-[#9d3151]/40"
          }`}
        >
          {t("Choose colors for this block")}
        </button>
      </div>
      {custom ? (
        <>
          <div className="grid gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
              {t("Ready color combinations")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {combinations.map((combination) => (
                <button
                  key={combination.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => chooseCustom(combination)}
                  className="rounded-xl border border-black/10 bg-white p-2 text-left transition hover:-translate-y-0.5 hover:border-black/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="mb-2 flex -space-x-1">
                    {[combination.background, combination.accent, combination.text].map((color, index) => (
                      <i
                        key={`${combination.id}-${color}-${index}`}
                        className="h-5 w-5 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </span>
                  <span className="text-[10px] font-semibold text-[#514d47]">
                    {combination.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <p className="rounded-xl bg-white px-3 py-2 text-[11px] leading-5 text-[#716d65]">
            {t("Click a ready combination, or press a color square to choose your own shade.")}
          </p>
          <ColorEditor
            label={t("Block background")}
            value={current.background}
            disabled={disabled}
            presets={[defaults.background, "#ffffff", "#f7f3ee", defaults.accent, defaults.text]}
            onChange={(value) => onChange({ ...current, mode: "custom", background: value })}
          />
          <ColorEditor
            label={t("Block text")}
            value={current.text}
            disabled={disabled}
            presets={[defaults.text, "#17191f", "#321722", "#ffffff"]}
            onChange={(value) => onChange({ ...current, mode: "custom", text: value })}
          />
          <ColorEditor
            label={t("Block accent")}
            value={current.accent}
            disabled={disabled}
            presets={[defaults.accent, "#9d3151", "#c49a6c", "#2f6d73", "#17191f"]}
            onChange={(value) => onChange({ ...current, mode: "custom", accent: value })}
          />
        </>
      ) : (
        <p className="text-[11px] leading-5 text-[#716d65]">
          {t("This block follows the main site palette.")}
        </p>
      )}
    </div>
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

function serviceCardImage(
  content: PublicSiteContent,
  service: PublicSiteService,
  index: number,
) {
  if (Object.prototype.hasOwnProperty.call(content.service_card_images ?? {}, service.slug)) {
    return content.service_card_images?.[service.slug] ?? "";
  }
  return (
    content.service_image_urls?.[index] ||
    glossServiceImages[index % glossServiceImages.length] ||
    ""
  );
}

function previewServicePrice(service: PublicSiteService) {
  if (service.pricing_model === "free") return "Бесплатно";
  if (service.pricing_model === "quote" || service.price_minor === null) return "По запросу";
  const amount = service.price_minor / 100;
  return `${Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2)} ${service.currency}`;
}

function previewServiceDuration(service: PublicSiteService) {
  const minimum = service.duration_min_minutes;
  const maximum = service.duration_max_minutes;
  if (!minimum) return "";
  if (maximum && maximum !== minimum) return `${minimum}–${maximum} мин`;
  return `${minimum} мин`;
}

function ServicesSectionEditor({
  services,
  draft,
  disabled,
  t,
  onUpdate,
  onChooseImage,
}: {
  services: PublicSiteService[];
  draft: PublicSiteContent;
  disabled: boolean;
  t: ReturnType<typeof useAdminI18n>["t"];
  onUpdate: <Key extends keyof PublicSiteContent>(
    key: Key,
    value: PublicSiteContent[Key],
  ) => void;
  onChooseImage: (service: PublicSiteService) => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-[#9a742e]/20 bg-[#fbf7ee] p-4">
        <p className="text-xs font-semibold text-[#4f3a12]">Данные услуг берутся из единого каталога</p>
        <p className="mt-2 text-xs leading-5 text-[#716d65]">Название, цена, длительность, порядок и доступность редактируются в каталоге. Здесь настраивается только внешний вид карточек на сайте.</p>
        <Link href="/admin/catalog" className="mt-3 inline-flex rounded-full bg-[#17191f] px-4 py-2 text-xs font-semibold text-white">Открыть каталог услуг</Link>
      </div>

      <CompactSelect
        label="Макет услуг"
        value={draft.services_layout ?? "cards"}
        disabled={disabled}
        options={[{ value: "cards", label: "Карточки" }, { value: "list", label: "Компактный список" }]}
        onChange={(value) => onUpdate("services_layout", value === "list" ? "list" : "cards")}
      />
      <CompactSelect
        label="Количество колонок"
        value={String(draft.services_columns ?? 4)}
        disabled={disabled || draft.services_layout === "list"}
        options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]}
        onChange={(value) => onUpdate("services_columns", value === "2" ? 2 : value === "3" ? 3 : 4)}
      />
      <CompactField
        label="Текст кнопки"
        value={draft.services_button_label ?? "Подробнее"}
        disabled={disabled}
        onChange={(value) => onUpdate("services_button_label", value)}
      />
      <Toggle label="Показывать описание" checked={draft.services_show_description !== false} disabled={disabled} onChange={(value) => onUpdate("services_show_description", value)} />
      <Toggle label="Показывать цену" checked={draft.services_show_price !== false} disabled={disabled} onChange={(value) => onUpdate("services_show_price", value)} />
      <Toggle label="Показывать длительность" checked={draft.services_show_duration !== false} disabled={disabled} onChange={(value) => onUpdate("services_show_duration", value)} />

      <div className="grid gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">Изображения карточек</p>
        {services.length ? services.map((service, index) => (
          <article key={service.id} className="grid gap-3 rounded-2xl border border-black/8 bg-[#faf9f6] p-4">
            <div>
              <p className="text-sm font-semibold">{service.title}</p>
              <p className="mt-1 text-[10px] text-[#716d65]">{previewServicePrice(service)} · {previewServiceDuration(service) || "без длительности"}</p>
            </div>
            <ImageEditor
              label="Изображение услуги"
              value={serviceCardImage(draft, service, index)}
              disabled={disabled}
              t={t}
              onChange={(value) => onUpdate("service_card_images", { ...(draft.service_card_images ?? {}), [service.slug]: value })}
              onChoose={() => onChooseImage(service)}
            />
          </article>
        )) : (
          <p className="rounded-2xl border border-dashed border-black/15 px-4 py-5 text-xs leading-6 text-[#716d65]">В каталоге пока нет активных публичных услуг. Создайте услугу, и её карточка появится здесь автоматически.</p>
        )}
      </div>
    </div>
  );
}


function PortfolioSectionEditor({
  projects,
  draft,
  disabled,
  t,
  onUpdate,
}: {
  projects: PublicSiteProject[];
  draft: PublicSiteContent;
  disabled: boolean;
  t: ReturnType<typeof useAdminI18n>["t"];
  onUpdate: <Key extends keyof PublicSiteContent>(
    key: Key,
    value: PublicSiteContent[Key],
  ) => void;
}) {
  const categoryCount = new Set(
    projects.map((project) => project.category).filter(Boolean),
  ).size;

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-[#9a742e]/20 bg-[#fbf7ee] p-4">
        <p className="text-xs font-semibold text-[#4f3a12]">
          {t("Portfolio data comes from the shared Portfolio module.")}
        </p>
        <p className="mt-2 text-xs leading-5 text-[#716d65]">
          {t("Categories and media are edited in Media; projects, order and visibility are edited in Portfolio. Here you configure only the public presentation.")}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Link
            href="/admin/portfolio"
            className="inline-flex rounded-full bg-[#17191f] px-4 py-2 text-xs font-semibold text-white"
          >
            {t("Open portfolio module")}
          </Link>
          <Link
            href="/admin/media"
            className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-[#321722]"
          >
            {t("Open media library")}
          </Link>
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
            {projects.length} {t("projects")} · {categoryCount} {t("categories")}
          </span>
        </div>
      </div>

      <CompactSelect
        label={t("Portfolio layout")}
        value={draft.portfolio_layout ?? "masonry"}
        disabled={disabled}
        options={[
          { value: "grid", label: t("Grid") },
          { value: "masonry", label: t("Masonry") },
        ]}
        onChange={(value) =>
          onUpdate("portfolio_layout", value === "grid" ? "grid" : "masonry")
        }
      />
      <CompactSelect
        label={t("Portfolio columns")}
        value={String(draft.portfolio_columns ?? 3)}
        disabled={disabled}
        options={[
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
        ]}
        onChange={(value) =>
          onUpdate(
            "portfolio_columns",
            value === "2" ? 2 : value === "4" ? 4 : 3,
          )
        }
      />
      <CompactSelect
        label={t("Card proportions")}
        value={draft.portfolio_card_aspect ?? "auto"}
        disabled={disabled}
        options={[
          { value: "auto", label: t("Automatic") },
          { value: "square", label: t("Square") },
          { value: "landscape", label: t("Landscape") },
          { value: "portrait", label: t("Portrait") },
        ]}
        onChange={(value) =>
          onUpdate(
            "portfolio_card_aspect",
            value === "square" ||
              value === "landscape" ||
              value === "portrait"
              ? value
              : "auto",
          )
        }
      />
      <CompactSelect
        label={t("Projects on home page")}
        value={String(draft.portfolio_home_limit ?? 9)}
        disabled={disabled}
        options={[
          { value: "6", label: "6" },
          { value: "9", label: "9" },
          { value: "12", label: "12" },
          { value: "0", label: t("All projects") },
        ]}
        onChange={(value) =>
          onUpdate(
            "portfolio_home_limit",
            value === "0" ? 0 : value === "6" ? 6 : value === "12" ? 12 : 9,
          )
        }
      />

      <Toggle
        label={t("Show category filters")}
        checked={draft.portfolio_show_filters !== false}
        disabled={disabled}
        onChange={(value) => onUpdate("portfolio_show_filters", value)}
      />
      <Toggle
        label={t("Open images in gallery")}
        checked={draft.portfolio_lightbox !== false}
        disabled={disabled}
        onChange={(value) => onUpdate("portfolio_lightbox", value)}
      />
      <Toggle
        label={t("Show project category")}
        checked={draft.portfolio_show_category !== false}
        disabled={disabled}
        onChange={(value) => onUpdate("portfolio_show_category", value)}
      />
      <Toggle
        label={t("Show project title")}
        checked={draft.portfolio_show_title !== false}
        disabled={disabled}
        onChange={(value) => onUpdate("portfolio_show_title", value)}
      />
      <Toggle
        label={t("Show project description")}
        checked={draft.portfolio_show_description === true}
        disabled={disabled}
        onChange={(value) => onUpdate("portfolio_show_description", value)}
      />

      {projects.length ? (
        <div className="grid grid-cols-3 gap-2">
          {projects.slice(0, 6).map((project) => (
            <div
              key={project.id}
              className="aspect-square overflow-hidden rounded-xl bg-[#eadedb]"
              title={project.title}
            >
              {project.image_url ? (
                <img
                  src={project.image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-black/15 px-4 py-5 text-xs leading-6 text-[#716d65]">
          {t("No active portfolio projects yet.")}
        </p>
      )}
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

function MembershipCardsEditor({
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
  const memberships = previewLines(items).map((item, index) => {
    const [
      title = "",
      condition = "",
      description = "",
      buttonLabel = "",
      buttonUrl = "",
    ] = item.split("·").map((part) => part.trim());

    return {
      title,
      condition,
      description,
      buttonLabel,
      buttonUrl,
      image: images[index] ?? "",
    };
  });

  const serialize = (
    nextMemberships: Array<{
      title: string;
      condition: string;
      description: string;
      buttonLabel: string;
      buttonUrl: string;
      image: string;
    }>,
  ) => {
    const nextItems = nextMemberships
      .map(({ title, condition, description, buttonLabel, buttonUrl }) =>
        [
          title.trim(),
          condition.trim(),
          description.replace(/\n+/g, " ").trim(),
          buttonLabel.trim(),
          buttonUrl.trim(),
        ].join(" · "),
      )
      .join("\n");
    const nextImages = nextMemberships.map(({ image }) => image);
    onChange(nextItems, nextImages);
  };

  const updateMembership = (
    index: number,
    changes: Partial<(typeof memberships)[number]>,
  ) => {
    serialize(
      memberships.map((membership, membershipIndex) =>
        membershipIndex === index
          ? { ...membership, ...changes }
          : membership,
      ),
    );
  };

  return (
    <div className="grid gap-3">
      <div className="rounded-2xl border border-[#9d3151]/15 bg-[#fff8fa] px-4 py-3 text-[11px] leading-5 text-[#716d65]">
        Каждый уровень клуба хранится одной карточкой: изображение, название,
        условие участия, описание и кнопка. При перестановке всё перемещается вместе.
      </div>

      {memberships.map((membership, index) => (
        <article
          key={`membership-card-${index}`}
          className="grid gap-3 rounded-2xl border border-black/8 bg-[#faf9f6] p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold">Уровень клуба {index + 1}</p>
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                serialize(
                  memberships.filter(
                    (_, membershipIndex) => membershipIndex !== index,
                  ),
                )
              }
              className="text-[10px] font-semibold text-red-600 disabled:opacity-40"
            >
              {t("Remove")}
            </button>
          </div>

          <ImageEditor
            label="Изображение уровня"
            value={membership.image}
            disabled={disabled}
            t={t}
            onChange={(value) =>
              updateMembership(index, { image: value })
            }
            onChoose={() => onChooseImage(index)}
          />

          <CompactField
            label="Название уровня или преимущества"
            value={membership.title}
            disabled={disabled}
            onChange={(value) =>
              updateMembership(index, { title: value })
            }
          />

          <CompactField
            label="Условие участия"
            value={membership.condition}
            disabled={disabled}
            onChange={(value) =>
              updateMembership(index, { condition: value })
            }
          />

          <CompactField
            label="Описание и преимущества"
            value={membership.description}
            disabled={disabled}
            multiline
            onChange={(value) =>
              updateMembership(index, {
                description: value.replace(/\n+/g, " "),
              })
            }
          />

          <CompactField
            label="Текст кнопки"
            value={membership.buttonLabel}
            disabled={disabled}
            onChange={(value) =>
              updateMembership(index, { buttonLabel: value })
            }
          />

          <CompactField
            label="Ссылка кнопки"
            value={membership.buttonUrl}
            disabled={disabled}
            onChange={(value) =>
              updateMembership(index, { buttonUrl: value })
            }
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              aria-label="Поднять уровень клуба"
              disabled={disabled || index === 0}
              onClick={() => {
                const next = [...memberships];
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
              aria-label="Опустить уровень клуба"
              disabled={disabled || index === memberships.length - 1}
              onClick={() => {
                const next = [...memberships];
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
        disabled={disabled || memberships.length >= 12}
        onClick={() =>
          serialize([
            ...memberships,
            {
              title: "Новый уровень клуба",
              condition: "",
              description: "",
              buttonLabel: "Вступить",
              buttonUrl: "#contact",
              image: "",
            },
          ])
        }
        className="rounded-xl border border-dashed border-[#9d3151]/45 bg-[#fff8fa] px-4 py-3 text-xs font-semibold text-[#8d2d4a] disabled:opacity-40"
      >
        + Добавить уровень клуба
      </button>
    </div>
  );
}

function SafetyCardsEditor({
  items,
  disabled,
  t,
  onChange,
}: {
  items: string;
  disabled: boolean;
  t: ReturnType<typeof useAdminI18n>["t"];
  onChange: (items: string) => void;
}) {
  const cards = previewLines(items).map((item) => {
    const parts = item.split("·").map((part) => part.trim());
    const hasIcon = parts.length >= 3;

    return {
      icon: hasIcon ? parts[0] : "",
      title: hasIcon ? parts[1] : parts[0] ?? "",
      description: (hasIcon ? parts.slice(2) : parts.slice(1)).join(" · "),
    };
  });

  const serialize = (
    nextCards: Array<{
      icon: string;
      title: string;
      description: string;
    }>,
  ) => {
    onChange(
      nextCards
        .map(({ icon, title, description }) =>
          [
            icon.trim(),
            title.trim(),
            description.replace(/\n+/g, " ").trim(),
          ].join(" · "),
        )
        .join("\n"),
    );
  };

  const updateCard = (
    index: number,
    changes: Partial<(typeof cards)[number]>,
  ) => {
    serialize(
      cards.map((card, cardIndex) =>
        cardIndex === index ? { ...card, ...changes } : card,
      ),
    );
  };

  return (
    <div className="grid gap-3">
      <div className="rounded-2xl border border-[#9d3151]/15 bg-[#fff8fa] px-4 py-3 text-[11px] leading-5 text-[#716d65]">
        Каждая гарантия хранится отдельной карточкой: значок, название и
        описание. Карточки можно добавлять, удалять и переставлять.
      </div>

      {cards.map((card, index) => (
        <article
          key={`safety-card-${index}`}
          className="grid gap-3 rounded-2xl border border-black/8 bg-[#faf9f6] p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold">Гарантия {index + 1}</p>
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                serialize(cards.filter((_, cardIndex) => cardIndex !== index))
              }
              className="text-[10px] font-semibold text-red-600 disabled:opacity-40"
            >
              {t("Remove")}
            </button>
          </div>

          <CompactField
            label="Значок или символ"
            value={card.icon}
            disabled={disabled}
            onChange={(value) =>
              updateCard(index, { icon: Array.from(value).slice(0, 3).join("") })
            }
          />

          <CompactField
            label="Название гарантии"
            value={card.title}
            disabled={disabled}
            onChange={(value) => updateCard(index, { title: value })}
          />

          <CompactField
            label="Описание"
            value={card.description}
            disabled={disabled}
            multiline
            onChange={(value) =>
              updateCard(index, {
                description: value.replace(/\n+/g, " "),
              })
            }
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              aria-label="Поднять гарантию"
              disabled={disabled || index === 0}
              onClick={() => {
                const next = [...cards];
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
              aria-label="Опустить гарантию"
              disabled={disabled || index === cards.length - 1}
              onClick={() => {
                const next = [...cards];
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
        disabled={disabled || cards.length >= 12}
        onClick={() =>
          serialize([
            ...cards,
            {
              icon: "✓",
              title: "Новая гарантия",
              description: "",
            },
          ])
        }
        className="rounded-xl border border-dashed border-[#9d3151]/45 bg-[#fff8fa] px-4 py-3 text-xs font-semibold text-[#8d2d4a] disabled:opacity-40"
      >
        + Добавить гарантию
      </button>
    </div>
  );
}

function GiftCertificatesEditor({
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
  const certificates = previewLines(items).map((item, index) => {
    const [
      title = "",
      amount = "",
      description = "",
      buttonLabel = "",
      buttonUrl = "",
    ] = item.split("·").map((part) => part.trim());

    return {
      title,
      amount,
      description,
      buttonLabel,
      buttonUrl,
      image: images[index] ?? "",
    };
  });

  const serialize = (
    nextCertificates: Array<{
      title: string;
      amount: string;
      description: string;
      buttonLabel: string;
      buttonUrl: string;
      image: string;
    }>,
  ) => {
    const nextItems = nextCertificates
      .map(({ title, amount, description, buttonLabel, buttonUrl }) =>
        [
          title.trim(),
          amount.trim(),
          description.replace(/\n+/g, " ").trim(),
          buttonLabel.trim(),
          buttonUrl.trim(),
        ].join(" · "),
      )
      .join("\n");
    const nextImages = nextCertificates.map(({ image }) => image);
    onChange(nextItems, nextImages);
  };

  const updateCertificate = (
    index: number,
    changes: Partial<(typeof certificates)[number]>,
  ) => {
    serialize(
      certificates.map((certificate, certificateIndex) =>
        certificateIndex === index
          ? { ...certificate, ...changes }
          : certificate,
      ),
    );
  };

  return (
    <div className="grid gap-3">
      <div className="rounded-2xl border border-[#9d3151]/15 bg-[#fff8fa] px-4 py-3 text-[11px] leading-5 text-[#716d65]">
        Каждый сертификат хранится одной карточкой: изображение, название,
        номинал, описание и кнопка. При перестановке всё перемещается вместе.
      </div>

      {certificates.map((certificate, index) => (
        <article
          key={`gift-certificate-${index}`}
          className="grid gap-3 rounded-2xl border border-black/8 bg-[#faf9f6] p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold">Сертификат {index + 1}</p>
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                serialize(
                  certificates.filter(
                    (_, certificateIndex) => certificateIndex !== index,
                  ),
                )
              }
              className="text-[10px] font-semibold text-red-600 disabled:opacity-40"
            >
              {t("Remove")}
            </button>
          </div>

          <ImageEditor
            label="Изображение сертификата"
            value={certificate.image}
            disabled={disabled}
            t={t}
            onChange={(value) =>
              updateCertificate(index, { image: value })
            }
            onChoose={() => onChooseImage(index)}
          />

          <CompactField
            label="Название"
            value={certificate.title}
            disabled={disabled}
            onChange={(value) =>
              updateCertificate(index, { title: value })
            }
          />

          <CompactField
            label="Номинал или цена"
            value={certificate.amount}
            disabled={disabled}
            onChange={(value) =>
              updateCertificate(index, { amount: value })
            }
          />

          <CompactField
            label="Описание"
            value={certificate.description}
            disabled={disabled}
            multiline
            onChange={(value) =>
              updateCertificate(index, {
                description: value.replace(/\n+/g, " "),
              })
            }
          />

          <CompactField
            label="Текст кнопки"
            value={certificate.buttonLabel}
            disabled={disabled}
            onChange={(value) =>
              updateCertificate(index, { buttonLabel: value })
            }
          />

          <CompactField
            label="Ссылка кнопки"
            value={certificate.buttonUrl}
            disabled={disabled}
            onChange={(value) =>
              updateCertificate(index, { buttonUrl: value })
            }
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              aria-label="Поднять сертификат"
              disabled={disabled || index === 0}
              onClick={() => {
                const next = [...certificates];
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
              aria-label="Опустить сертификат"
              disabled={disabled || index === certificates.length - 1}
              onClick={() => {
                const next = [...certificates];
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
        disabled={disabled || certificates.length >= 12}
        onClick={() =>
          serialize([
            ...certificates,
            {
              title: "Новый сертификат",
              amount: "",
              description: "",
              buttonLabel: "Выбрать",
              buttonUrl: "#contact",
              image: "",
            },
          ])
        }
        className="rounded-xl border border-dashed border-[#9d3151]/45 bg-[#fff8fa] px-4 py-3 text-xs font-semibold text-[#8d2d4a] disabled:opacity-40"
      >
        + Добавить сертификат
      </button>
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
  colorDisabled,
  t,
  siteAccent,
  siteDark,
  siteSurface,
  onChange,
  onDuplicate,
  onRemove,
  onChooseImage,
  onChooseListImage,
  onChooseCardImage,
}: {
  block: PublicSiteCustomBlock;
  disabled: boolean;
  colorDisabled: boolean;
  t: ReturnType<typeof useAdminI18n>["t"];
  siteAccent: string;
  siteDark: string;
  siteSurface: string;
  onChange: <Key extends keyof PublicSiteCustomBlock>(
    key: Key,
    value: PublicSiteCustomBlock[Key],
  ) => void;
  onDuplicate: () => void;
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
  const colorDefaults = block.tone === "dark"
    ? { background: siteDark, text: "#ffffff", accent: siteAccent }
    : block.tone === "accent"
      ? { background: siteAccent, text: "#ffffff", accent: siteDark }
      : { background: siteSurface, text: siteDark, accent: siteAccent };

  return (
    <>
      <Toggle
        label={t("Show block on site")}
        checked={block.is_visible !== false}
        disabled={disabled}
        onChange={(value) => onChange("is_visible", value)}
      />
      <div className="grid gap-3 rounded-2xl border border-[#9a742e]/20 bg-[#fbf7ee] p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6f531f]">
          Размеры и анимация
        </p>
        <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
          Ширина содержимого
          <select
            value={block.content_width ?? "wide"}
            disabled={disabled}
            onChange={(event) =>
              onChange(
                "content_width",
                event.target.value as NonNullable<PublicSiteCustomBlock["content_width"]>,
              )
            }
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm"
          >
            <option value="full">На всю ширину</option>
            <option value="wide">Широкая</option>
            <option value="medium">Средняя</option>
            <option value="narrow">Узкая</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
            Отступ сверху
            <select
              value={block.padding_top ?? "normal"}
              disabled={disabled}
              onChange={(event) =>
                onChange(
                  "padding_top",
                  event.target.value as NonNullable<PublicSiteCustomBlock["padding_top"]>,
                )
              }
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm"
            >
              <option value="none">Нет</option>
              <option value="compact">Маленький</option>
              <option value="normal">Обычный</option>
              <option value="airy">Большой</option>
            </select>
          </label>
          <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
            Отступ снизу
            <select
              value={block.padding_bottom ?? "normal"}
              disabled={disabled}
              onChange={(event) =>
                onChange(
                  "padding_bottom",
                  event.target.value as NonNullable<PublicSiteCustomBlock["padding_bottom"]>,
                )
              }
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm"
            >
              <option value="none">Нет</option>
              <option value="compact">Маленький</option>
              <option value="normal">Обычный</option>
              <option value="airy">Большой</option>
            </select>
          </label>
        </div>
        <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
          Минимальная высота секции
          <select
            value={block.section_height ?? "auto"}
            disabled={disabled}
            onChange={(event) =>
              onChange(
                "section_height",
                event.target.value as NonNullable<PublicSiteCustomBlock["section_height"]>,
              )
            }
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm"
          >
            <option value="auto">По содержимому</option>
            <option value="compact">Невысокая</option>
            <option value="medium">Средняя</option>
            <option value="tall">Высокая</option>
            <option value="screen">Почти на экран</option>
          </select>
        </label>
        <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
          Анимация появления
          <select
            value={block.animation ?? "none"}
            disabled={disabled}
            onChange={(event) =>
              onChange(
                "animation",
                event.target.value as NonNullable<PublicSiteCustomBlock["animation"]>,
              )
            }
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm"
          >
            <option value="none">Без анимации</option>
            <option value="fade">Мягкое появление</option>
            <option value="rise">Появление снизу</option>
            <option value="scale">Лёгкое увеличение</option>
          </select>
        </label>
        {block.animation && block.animation !== "none" ? (
          <Toggle
            label="Показывать анимацию на телефоне"
            checked={block.animate_on_mobile !== false}
            disabled={disabled}
            onChange={(value) => onChange("animate_on_mobile", value)}
          />
        ) : null}
      </div>
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
                  className="text-[10px] font-semibold text-[#4f3a12] disabled:opacity-30"
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
                  className="text-[10px] font-semibold text-[#4f3a12] disabled:opacity-30"
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
      block.kind === "media_text" ||
      block.kind === "collage" ? (
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
            Высота медиа
            <select
              value={block.media_height ?? "auto"}
              disabled={disabled}
              onChange={(event) =>
                onChange(
                  "media_height",
                  event.target.value as NonNullable<PublicSiteCustomBlock["media_height"]>,
                )
              }
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm"
            >
              <option value="auto">По пропорциям</option>
              <option value="compact">Низкая</option>
              <option value="medium">Средняя</option>
              <option value="tall">Высокая</option>
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
      <BlockColorsEditor
        colors={block.colors}
        defaults={colorDefaults}
        disabled={colorDisabled}
        t={t}
        onChange={(colors) => onChange("colors", colors)}
      />
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
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onDuplicate}
          disabled={disabled}
          className="rounded-xl border border-[#9a742e]/45 bg-[#fbf7ee] px-4 py-3 text-xs font-bold text-[#3f2e0e] shadow-sm transition hover:bg-[#f4ead6] disabled:opacity-50"
        >
          Дублировать
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 disabled:opacity-40"
        >
          {t("Remove block")}
        </button>
      </div>
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
  services: PublicSiteService[];
  portfolio: PublicSiteProject[];
}) {
  if (section === "services" && services.length) {
    const columns = draft.services_columns ?? 3;
    const gridClass = columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3";
    return (
      <div className={`mt-7 grid gap-2 ${draft.services_layout === "list" ? "grid-cols-1" : gridClass}`}>
        {services.slice(0, 8).map((service, index) => {
          const image = serviceCardImage(draft, service, index);
          const price = previewServicePrice(service);
          const duration = previewServiceDuration(service);
          return (
            <article key={service.slug} className={`os-site-card overflow-hidden rounded-2xl border border-white/12 bg-white/5 ${draft.services_layout === "list" ? "grid grid-cols-[120px_1fr]" : ""}`}>
              {image ? (
                <img
                  src={image}
                  alt=""
                  className={`${draft.services_layout === "list" ? "h-full min-h-28" : "aspect-[16/9]"} w-full object-cover`}
                />
              ) : null}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  {draft.services_show_duration !== false ? <span className="text-[9px] uppercase tracking-[0.14em] text-white/45">{duration}</span> : <span />}
                  {draft.services_show_price !== false ? <span className="text-xs font-semibold text-[#f0cad5]">{price}</span> : null}
                </div>
                <h4 className="mt-4 text-sm font-semibold">{service.title}</h4>
                {draft.services_show_description !== false && service.description ? (
                  <p className="mt-2 line-clamp-2 text-[10px] leading-5 text-white/50">{service.description}</p>
                ) : null}
                <span className="mt-4 inline-flex text-[10px] font-semibold text-[#f0cad5]">{draft.services_button_label || "Подробнее"} →</span>
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  if (section === "portfolio" && portfolio.length) {
    const previewLimit = draft.portfolio_home_limit ?? 9;
    const previewProjects =
      previewLimit > 0 ? portfolio.slice(0, previewLimit) : portfolio;
    const previewColumns =
      draft.portfolio_columns === 2
        ? "sm:grid-cols-2"
        : draft.portfolio_columns === 4
          ? "sm:grid-cols-2 lg:grid-cols-4"
          : "sm:grid-cols-3";

    return (
      <div className="mt-7">
        {draft.portfolio_show_filters !== false ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {Array.from(
              new Set(previewProjects.map((project) => project.category)),
            )
              .slice(0, 5)
              .map((category, index) => (
                <span
                  key={category}
                  className={`rounded-full px-3 py-1.5 text-[8px] font-semibold ${
                    index === 0
                      ? "bg-[var(--site-accent)] text-white"
                      : "border border-black/10 bg-white text-black/55"
                  }`}
                >
                  {category}
                </span>
              ))}
          </div>
        ) : null}
        <div
          className={
            draft.portfolio_layout === "masonry"
              ? `columns-2 gap-2 ${
                  draft.portfolio_columns === 4
                    ? "lg:columns-4"
                    : draft.portfolio_columns === 2
                      ? "lg:columns-2"
                      : "lg:columns-3"
                }`
              : `grid grid-cols-2 gap-2 ${previewColumns}`
          }
        >
          {previewProjects.map((project, index) => (
            <article
              key={project.id}
              className={`os-site-card overflow-hidden rounded-xl border border-black/8 bg-white ${
                draft.portfolio_layout === "masonry"
                  ? "mb-2 break-inside-avoid"
                  : ""
              }`}
            >
              <div
                className={
                  draft.portfolio_card_aspect === "square"
                    ? "aspect-square"
                    : draft.portfolio_card_aspect === "landscape"
                      ? "aspect-[4/3]"
                      : draft.portfolio_card_aspect === "portrait"
                        ? "aspect-[4/5]"
                        : index % 4 === 0
                          ? "aspect-[4/5]"
                          : "aspect-[4/3]"
                }
              >
                {project.image_url ? (
                  <img
                    src={project.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              {draft.portfolio_show_category !== false ||
              draft.portfolio_show_title !== false ? (
                <div className="p-2.5 text-[#321722]">
                  {draft.portfolio_show_category !== false ? (
                    <p className="text-[7px] font-semibold uppercase tracking-[0.12em] text-[#9a3152]">
                      {project.category}
                    </p>
                  ) : null}
                  {draft.portfolio_show_title !== false ? (
                    <p className="mt-1 text-[9px] font-semibold">
                      {project.title}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
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
              className="os-site-card overflow-hidden rounded-2xl border border-black/8 bg-white/70"
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
            <span key={label} className="rounded-xl border border-black/10 px-3 py-3 text-[10px] text-[#4f4b45]">
              {label}
            </span>
          ))}
        </div>
        <span className="os-site-button mt-3 flex min-h-10 items-center justify-center rounded-xl bg-[#a60918] text-[10px] font-semibold text-white">
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
          <blockquote key={review.id} className="os-site-card rounded-2xl border border-black/8 bg-white/70 p-4 text-xs leading-6 text-[#2f2d29]">
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
    const membershipItems = previewLines(draft.membership_items);
    const legacyBenefits = previewLines(draft.membership_text);
    const cards = membershipItems.length
      ? membershipItems
      : legacyBenefits.map((benefit) => `${benefit} · · · Вступить · #contact`);
    const membershipImages =
      draft.membership_image_urls
      ?? [draft.membership_image_url || glossMembershipImage];

    return (
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.length ? (
          cards.map((item, index) => {
            const [
              title = "",
              condition = "",
              description = "",
              buttonLabel = "Вступить",
            ] = item.split("·").map((part) => part.trim());
            return (
              <article
                key={`${item}-${index}`}
                className="os-site-card overflow-hidden rounded-2xl border border-black/8 bg-white/70"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#eadde0]">
                  <img
                    src={
                      membershipImages[index]
                      || draft.membership_image_url
                      || glossMembershipImage
                    }
                    alt={title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-semibold">{title}</h4>
                  {condition ? (
                    <p
                      className="mt-2 text-[9px] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: draft.theme_accent ?? "#9d3151" }}
                    >
                      {condition}
                    </p>
                  ) : null}
                  {description ? (
                    <p className="mt-2 text-[10px] leading-5 text-black/50">
                      {description}
                    </p>
                  ) : null}
                  <span className="os-site-button mt-4 inline-flex rounded-full border border-black/10 px-3 py-2 text-[10px] font-semibold">
                    {buttonLabel || "Вступить"}
                  </span>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-black/10 p-6 text-center text-[11px] text-black/40 sm:col-span-2 lg:col-span-3">
            Добавьте первый уровень клуба справа
          </div>
        )}
      </div>
    );
  }

  if (section === "safety") {
    const safetyItems = previewLines(draft.safety_items);

    return (
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {safetyItems.length ? (
          safetyItems.map((item, index) => {
            const parts = item.split("·").map((part) => part.trim());
            const hasIcon = parts.length >= 3;
            const icon = hasIcon ? parts[0] : "";
            const title = hasIcon ? parts[1] : parts[0] ?? "";
            const description = (hasIcon ? parts.slice(2) : parts.slice(1)).join(" · ");

            return (
              <article
                key={`${item}-${index}`}
                className="os-site-card rounded-2xl border border-black/8 bg-white/70 p-4"
              >
                <span
                  className="grid h-10 w-10 place-items-center rounded-full border text-lg"
                  style={{
                    borderColor: `${draft.theme_accent ?? "#9d3151"}40`,
                    color: draft.theme_accent ?? "#9d3151",
                  }}
                >
                  {icon || (index === 0 ? "⌁" : index === 1 ? "◒" : "◇")}
                </span>
                <h4 className="mt-4 text-xs font-semibold">{title}</h4>
                {description ? (
                  <p className="mt-2 text-[10px] leading-5 text-[#4f4b45]">
                    {description}
                  </p>
                ) : null}
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-black/10 p-6 text-center text-[11px] text-black/40 sm:col-span-2 lg:col-span-3">
            Добавьте первую гарантию справа
          </div>
        )}
      </div>
    );
  }

  if (section === "gift") {
    const giftItems = previewLines(draft.gift_items);
    const giftImages = draft.gift_image_urls ?? [draft.gift_image_url || glossGiftImage];

    return (
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {giftItems.length ? (
          giftItems.map((item, index) => {
            const [title = "", amount = "", description = "", buttonLabel = "Выбрать"] =
              item.split("·").map((part) => part.trim());
            return (
              <article
                key={`${item}-${index}`}
                className="os-site-card overflow-hidden rounded-2xl border border-black/8 bg-white/70"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#eadde0]">
                  <img
                    src={giftImages[index] || draft.gift_image_url || glossGiftImage}
                    alt={title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-semibold">{title}</h4>
                  {amount ? (
                    <p
                      className="mt-2 text-lg font-semibold"
                      style={{ color: draft.theme_accent ?? "#9d3151" }}
                    >
                      {amount}
                    </p>
                  ) : null}
                  {description ? (
                    <p className="mt-2 text-[10px] leading-5 text-black/50">
                      {description}
                    </p>
                  ) : null}
                  <span className="os-site-button mt-4 inline-flex rounded-full border border-black/10 px-3 py-2 text-[10px] font-semibold">
                    {buttonLabel || "Выбрать"}
                  </span>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-black/10 p-6 text-center text-[11px] text-black/40 sm:col-span-2 lg:col-span-3">
            Добавьте первый подарочный сертификат справа
          </div>
        )}
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
    const facts = previewLines(draft.about_facts);

    return (
      <div className={`mt-7 grid gap-5 ${draft.about_image_url ? "sm:grid-cols-[0.9fr_1.1fr] sm:items-center" : ""}`}>
        {draft.about_image_url ? (
          <div className="overflow-hidden rounded-2xl bg-black/5">
            <img
              src={draft.about_image_url}
              alt=""
              className="aspect-[4/3] h-full w-full object-cover"
            />
          </div>
        ) : null}
        <div>
          {draft.about_text ? (
            <p className="max-w-2xl whitespace-pre-line text-xs leading-6 text-black/55">
              {draft.about_text}
            </p>
          ) : null}
          {facts.length ? (
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {facts.map((item, index) => {
                const [value = "", ...labelParts] = item
                  .split("·")
                  .map((part) => part.trim());
                return (
                  <article
                    key={`${item}-${index}`}
                    className="os-site-card rounded-xl border border-black/10 bg-white/70 p-3"
                  >
                    <p className="text-base font-semibold">{value}</p>
                    {labelParts.length ? (
                      <p className="mt-1 text-[9px] leading-4 text-[#4f4b45]">
                        {labelParts.join(" · ")}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : null}
          {draft.about_button_label ? (
            <span
              className="mt-5 inline-flex rounded-full px-4 py-2 text-[10px] font-semibold text-white"
              style={{ backgroundColor: draft.theme_dark ?? "#17191f" }}
            >
              {draft.about_button_label}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  if (section === "contact") {
    const previewEmail = draft.contact_email || "email@example.com";
    const previewPhone = draft.contact_phone || "+00 000 000 00 00";
    return (
      <div className="mt-7 grid overflow-hidden rounded-2xl border border-black/10 bg-white sm:grid-cols-[0.85fr_1.15fr]">
        <div className="p-5 text-[10px] leading-6 text-black/50">
          <p>◷ {draft.contact_hours || "Ежедневно: 09:00–21:00"}</p>
          <p>⌖ {draft.contact_address || "Адрес студии"}</p>
          <p>✉ {previewEmail}</p>
          <p>☎ {previewPhone}</p>
          {draft.contact_note ? (
            <p className="mt-3 border-t border-black/8 pt-3 leading-5">
              {draft.contact_note}
            </p>
          ) : null}
          {draft.show_social_icons && draft.social_links?.length ? (
            <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.14em]">
              Социальные сети · {draft.social_links.length}
            </p>
          ) : null}
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

function BlockButton({
  active,
  label,
  visible,
  draggable = false,
  dragging = false,
  dragOver = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onClick,
}: {
  active: boolean;
  label: string;
  visible: boolean;
  draggable?: boolean;
  dragging?: boolean;
  dragOver?: boolean;
  onDragStart?: () => void;
  onDragOver?: () => void;
  onDrop?: () => void;
  onDragEnd?: () => void;
  onClick: () => void;
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", label);
        onDragStart?.();
      }}
      onDragOver={(event) => {
        if (!draggable) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        onDragOver?.();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop?.();
      }}
      onDragEnd={onDragEnd}
      className={`rounded-xl transition ${
        dragging ? "opacity-35" : ""
      } ${dragOver ? "ring-2 ring-[#9a742e]/55 ring-offset-2" : ""}`}
    >
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full min-w-0 items-center gap-3 rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${
          active
            ? "border-[#9a742e]/40 bg-[#f4ead6] text-[#6d531f]"
            : "border-black/8 bg-white hover:border-black/20"
        }`}
      >
        <span
          className={draggable ? "cursor-grab text-black/35 active:cursor-grabbing" : "text-black/15"}
          aria-hidden="true"
          title={draggable ? "Перетащите блок" : undefined}
        >
          ⋮⋮
        </span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            visible ? "bg-emerald-500" : "bg-black/20"
          }`}
        />
      </button>
    </div>
  );
}

function CanvasBlock({
  anchorId,
  active,
  muted,
  order,
  onClick,
  children,
}: {
  anchorId?: string;
  active: boolean;
  muted?: boolean;
  order?: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      data-editor-anchor={anchorId}
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

function CompactSelect({
  label,
  value,
  disabled,
  options,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">
      {label}
      <select
        className="mt-2 w-full rounded-xl border border-black/10 bg-[#faf9f6] px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#9a742e]"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-black/10 bg-white p-5 text-[#17191f] shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5f5a52]">{label}</p>
      <p className="mt-2 break-all text-lg font-bold text-[#17191f]">{value}</p>
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
