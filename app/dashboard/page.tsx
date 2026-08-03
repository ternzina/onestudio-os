"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const MAX_OWNED_SITES = 3;

const FALLBACK_PREVIEW = {
  accent: "#d8b36a",
  dark: "#16191f",
  surface: "#f7f3eb",
};

type Profile = {
  name: string | null;
  email: string | null;
  phone: string | null;
};

type WorkspaceManagementRow = {
  business_id: string;
  slug: string;
  name: string;
  status: string;
  role: string;
  is_default: boolean;
  booking_count: number;
  client_count: number;
  payment_count: number;
  request_count: number;
  document_count: number;
  notification_count: number;
  google_calendar_connected: boolean;
  can_archive: boolean;
  can_delete: boolean;
};

type Workspace = WorkspaceManagementRow & {
  site_is_published: boolean;
  site_published_at: string | null;
  site_primary_locale: string;
  preview_title: string;
  preview_tagline: string;
  preview_accent: string;
  preview_dark: string;
  preview_surface: string;
};

type EditorPayload = {
  site?: {
    is_published?: boolean;
    published_at?: string | null;
    primary_locale?: string;
  };
  locales?: Array<{
    locale?: string;
    draft_content?: Record<string, unknown> | null;
    published_content?: Record<string, unknown> | null;
  }>;
};

function workspaceErrorMessage(value: string) {
  if (value.includes("workspace_limit_reached")) {
    return `Можно создать не больше ${MAX_OWNED_SITES} активных сайтов. Удалите пустой демо-сайт или архивируйте рабочий.`;
  }
  if (value.includes("workspace_confirmation_mismatch")) {
    return "Название введено неверно. Удаление отменено.";
  }
  if (value.includes("workspace_has_operational_data")) {
    return "В этом сайте уже есть брони, клиенты или другие рабочие данные. Его можно только архивировать.";
  }
  if (value.includes("workspace_foundation_cannot_be_deleted")) {
    return "Базовое рабочее пространство нельзя удалить навсегда.";
  }
  if (value.includes("cannot_archive_last_workspace")) {
    return "Последний активный сайт нельзя архивировать, но пустой демо-сайт можно удалить.";
  }
  if (value.includes("workspace_owner_required")) {
    return "Это действие доступно только владельцу сайта.";
  }
  if (value.includes("public_site")) {
    return "Сайт пока нельзя опубликовать. Откройте редактор, сохраните основной язык и повторите попытку.";
  }
  return value;
}

function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function safeColor(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value.trim())
    ? value.trim()
    : fallback;
}

function formatPublishedDate(value: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [switchingWorkspace, setSwitchingWorkspace] = useState<string | null>(null);
  const [workspaceAction, setWorkspaceAction] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState("");
  const [workspaceMessage, setWorkspaceMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setWorkspaceError("");

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setLoading(false);
      return;
    }

    const [profileResult, workspaceResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("name,email,phone")
        .eq("id", authData.user.id)
        .maybeSingle(),
      supabase.rpc("list_my_workspace_management"),
    ]);

    const metadataName =
      typeof authData.user.user_metadata?.full_name === "string"
        ? authData.user.user_metadata.full_name
        : typeof authData.user.user_metadata?.name === "string"
          ? authData.user.user_metadata.name
          : null;

    setProfile({
      name: profileResult.data?.name || metadataName,
      email: profileResult.data?.email || authData.user.email || null,
      phone: profileResult.data?.phone || authData.user.phone || null,
    });

    if (workspaceResult.error) {
      setWorkspaceError(workspaceResult.error.message);
      setWorkspaces([]);
      setLoading(false);
      return;
    }

    const workspaceRows = (workspaceResult.data ?? []) as WorkspaceManagementRow[];

    const workspacesWithPublication = await Promise.all(
      workspaceRows.map(async (workspace) => {
        if (workspace.status === "archived") {
          return {
            ...workspace,
            site_is_published: false,
            site_published_at: null,
            site_primary_locale: "ru",
            preview_title: workspace.name,
            preview_tagline: "Ваш сайт сохранён в архиве",
            preview_accent: FALLBACK_PREVIEW.accent,
            preview_dark: FALLBACK_PREVIEW.dark,
            preview_surface: FALLBACK_PREVIEW.surface,
          } satisfies Workspace;
        }

        const { data: editor } = await supabase.rpc("get_public_site_editor", {
          p_business_id: workspace.business_id,
        });

        const payload =
          editor && typeof editor === "object" ? (editor as EditorPayload) : null;
        const primaryLocale = payload?.site?.primary_locale || "ru";
        const primaryRecord = payload?.locales?.find(
          (item) => item.locale === primaryLocale,
        );
        const content =
          primaryRecord?.draft_content || primaryRecord?.published_content || {};

        return {
          ...workspace,
          site_is_published: payload?.site?.is_published === true,
          site_published_at: payload?.site?.published_at ?? null,
          site_primary_locale: primaryLocale,
          preview_title: readString(content.hero_title, workspace.name),
          preview_tagline: readString(
            content.hero_subtitle || content.tagline,
            "Сайт готов к дальнейшей настройке",
          ),
          preview_accent: safeColor(
            content.theme_accent,
            FALLBACK_PREVIEW.accent,
          ),
          preview_dark: safeColor(content.theme_dark, FALLBACK_PREVIEW.dark),
          preview_surface: safeColor(
            content.theme_surface,
            FALLBACK_PREVIEW.surface,
          ),
        } satisfies Workspace;
      }),
    );

    setWorkspaces(workspacesWithPublication);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const activeWorkspaces = useMemo(
    () => workspaces.filter((workspace) => workspace.status !== "archived"),
    [workspaces],
  );
  const archivedWorkspaces = useMemo(
    () => workspaces.filter((workspace) => workspace.status === "archived"),
    [workspaces],
  );
  const activeOwnedCount = useMemo(
    () =>
      workspaces.filter(
        (workspace) => workspace.role === "owner" && workspace.status !== "archived",
      ).length,
    [workspaces],
  );
  const canCreateSite = activeOwnedCount < MAX_OWNED_SITES;
  const featuredWorkspace =
    activeWorkspaces.find((workspace) => workspace.is_default) ||
    activeWorkspaces[0] ||
    null;

  async function openWorkspace(businessId: string, path: string) {
    setSwitchingWorkspace(businessId);
    setWorkspaceError("");
    setWorkspaceMessage("");

    const { data, error } = await supabase.rpc("set_default_business", {
      p_business_id: businessId,
    });

    if (error || data !== true) {
      setWorkspaceError(
        workspaceErrorMessage(error?.message || "Не удалось открыть выбранный сайт."),
      );
      setSwitchingWorkspace(null);
      return;
    }

    router.push(path);
  }

  async function publishWorkspace(workspace: Workspace) {
    setWorkspaceAction(workspace.business_id);
    setWorkspaceError("");
    setWorkspaceMessage("");

    const { error } = await supabase.rpc("publish_public_site", {
      p_business_id: workspace.business_id,
      p_locale: workspace.site_primary_locale,
    });

    if (error) {
      setWorkspaceError(workspaceErrorMessage(error.message));
      setWorkspaceAction(null);
      return;
    }

    setWorkspaceMessage(`Сайт «${workspace.name}» опубликован и доступен посетителям.`);
    setWorkspaceAction(null);
    await loadDashboard();
  }

  async function deleteWorkspace(workspace: Workspace) {
    const confirmation = window.prompt(
      `Чтобы навсегда удалить демо-сайт, введите его название точно:\n\n${workspace.name}`,
      "",
    );
    if (confirmation === null) return;
    if (confirmation !== workspace.name) {
      setWorkspaceError("Название введено неверно. Удаление отменено.");
      return;
    }

    setWorkspaceAction(workspace.business_id);
    setWorkspaceError("");
    setWorkspaceMessage("");

    const { error } = await supabase.rpc("delete_my_empty_workspace", {
      p_business_id: workspace.business_id,
      p_confirmation_name: confirmation,
    });

    if (error) {
      setWorkspaceError(workspaceErrorMessage(error.message));
      setWorkspaceAction(null);
      return;
    }

    setWorkspaceMessage(`Сайт «${workspace.name}» удалён навсегда.`);
    setWorkspaceAction(null);
    await loadDashboard();
  }

  async function archiveWorkspace(workspace: Workspace) {
    if (
      !window.confirm(
        `Архивировать сайт «${workspace.name}»? Публичный сайт закроется, но все данные сохранятся.`,
      )
    ) {
      return;
    }

    setWorkspaceAction(workspace.business_id);
    setWorkspaceError("");
    setWorkspaceMessage("");

    const { error } = await supabase.rpc("archive_my_workspace", {
      p_business_id: workspace.business_id,
    });

    if (error) {
      setWorkspaceError(workspaceErrorMessage(error.message));
      setWorkspaceAction(null);
      return;
    }

    setWorkspaceMessage(`Сайт «${workspace.name}» перенесён в архив.`);
    setWorkspaceAction(null);
    await loadDashboard();
  }

  async function restoreWorkspace(workspace: Workspace) {
    setWorkspaceAction(workspace.business_id);
    setWorkspaceError("");
    setWorkspaceMessage("");

    const { data, error } = await supabase.rpc("restore_my_workspace", {
      p_business_id: workspace.business_id,
    });

    if (error || data !== true) {
      setWorkspaceError(
        workspaceErrorMessage(error?.message || "Не удалось восстановить сайт."),
      );
      setWorkspaceAction(null);
      return;
    }

    setWorkspaceMessage(`Сайт «${workspace.name}» восстановлен.`);
    setWorkspaceAction(null);
    await loadDashboard();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-[#090b0f] px-4 py-6 text-[#f7f5ef] sm:px-6 sm:py-8 lg:px-10">
      <section className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#d8b36a]"
          >
            OneStudio OS
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-white">
                {profile?.name || "Ваш аккаунт"}
              </p>
              <p className="text-xs text-white/45">{profile?.email || ""}</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-sm font-semibold text-[#e8c77f]">
              {(profile?.name || profile?.email || "O").slice(0, 1).toUpperCase()}
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-white/12 px-4 py-2 text-xs font-semibold text-white/75 transition hover:border-white/25 hover:text-white"
            >
              Выйти
            </button>
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <section className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(216,179,106,0.12),transparent_40%),rgba(255,255,255,0.045)] p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d8b36a]">
                    Личный кабинет
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                    {profile?.name
                      ? `Здравствуйте, ${profile.name}.`
                      : "Добро пожаловать в OneStudio OS."}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                    Здесь собраны ваши сайты, публикация и следующие шаги. Без лишних технических дверей.
                  </p>
                </div>

                {canCreateSite ? (
                  <Link
                    href="/demos"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#f7f5ef] px-5 text-sm font-semibold text-[#0b0d12] transition hover:bg-white"
                  >
                    + Новый сайт
                  </Link>
                ) : (
                  <span className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold text-white/40">
                    Лимит: 3 сайта
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/55">
                <StatusPill label={`${activeOwnedCount} из ${MAX_OWNED_SITES} сайтов`} />
                <StatusPill
                  label={
                    featuredWorkspace?.site_is_published
                      ? "Главный сайт опубликован"
                      : "Есть черновик для настройки"
                  }
                  tone={featuredWorkspace?.site_is_published ? "success" : "warning"}
                />
                <StatusPill
                  label={
                    profile?.phone ? "Профиль заполнен" : "Телефон пока не указан"
                  }
                />
              </div>
            </section>

            {workspaceError ? (
              <Notice tone="error">{workspaceError}</Notice>
            ) : null}
            {workspaceMessage ? (
              <Notice tone="success">{workspaceMessage}</Notice>
            ) : null}

            <section className="mt-6 rounded-[34px] border border-white/10 bg-white/[0.035] p-5 sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d8b36a]">
                    Мои сайты
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                    Ваши проекты
                  </h2>
                </div>
                <p className="text-sm text-white/40">
                  Активных: {activeOwnedCount} из {MAX_OWNED_SITES}
                </p>
              </div>

              {!canCreateSite ? (
                <p className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-300/[0.07] px-4 py-3 text-sm text-amber-100/85">
                  Для нового проекта удалите пустой демо-сайт или архивируйте один из рабочих.
                </p>
              ) : null}

              {loading ? (
                <div className="mt-6 grid gap-4">
                  <DashboardSkeleton />
                </div>
              ) : activeWorkspaces.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="mt-6 grid gap-5">
                  {activeWorkspaces.map((workspace) => (
                    <WorkspaceCard
                      key={workspace.business_id}
                      workspace={workspace}
                      busy={
                        switchingWorkspace === workspace.business_id ||
                        workspaceAction === workspace.business_id
                      }
                      onOpen={openWorkspace}
                      onPublish={publishWorkspace}
                      onDelete={deleteWorkspace}
                      onArchive={archiveWorkspace}
                    />
                  ))}
                </div>
              )}

              {archivedWorkspaces.length ? (
                <ArchivedSites
                  workspaces={archivedWorkspaces}
                  busyId={workspaceAction}
                  onRestore={restoreWorkspace}
                  onDelete={deleteWorkspace}
                />
              ) : null}
            </section>
          </div>

          <aside className="grid content-start gap-5">
            <NextSteps
              workspace={featuredWorkspace}
              busy={
                featuredWorkspace
                  ? switchingWorkspace === featuredWorkspace.business_id ||
                    workspaceAction === featuredWorkspace.business_id
                  : false
              }
              onOpen={openWorkspace}
              onPublish={publishWorkspace}
            />

            <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">
                Аккаунт
              </p>
              <div className="mt-4 grid gap-3">
                <AccountRow label="Email" value={profile?.email || "Не указан"} />
                <AccountRow label="Телефон" value={profile?.phone || "Не указан"} />
              </div>
              <p className="mt-4 text-xs leading-5 text-white/35">
                Настройки профиля и собственного домена появятся в следующих слоях кабинета.
              </p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function WorkspaceCard({
  workspace,
  busy,
  onOpen,
  onPublish,
  onDelete,
  onArchive,
}: {
  workspace: Workspace;
  busy: boolean;
  onOpen: (businessId: string, path: string) => Promise<void>;
  onPublish: (workspace: Workspace) => Promise<void>;
  onDelete: (workspace: Workspace) => Promise<void>;
  onArchive: (workspace: Workspace) => Promise<void>;
}) {
  const publicPath = `/site/${workspace.slug}`;
  const publishedDate = formatPublishedDate(workspace.site_published_at);
  const canConfigure = ["owner", "admin", "manager"].includes(workspace.role);

  return (
    <article className="overflow-hidden rounded-[30px] border border-white/10 bg-[#0d1015] shadow-[0_30px_80px_rgba(0,0,0,0.22)]">
      <div className="grid md:grid-cols-[250px_1fr]">
        <SitePreview workspace={workspace} />

        <div className="min-w-0 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-xl font-semibold tracking-[-0.025em]">
                  {workspace.name}
                </h3>
                <PublicationBadge published={workspace.site_is_published} />
                {workspace.is_default ? (
                  <span className="rounded-full bg-[#d8b36a]/10 px-2.5 py-1 text-[11px] font-semibold text-[#e8c77f]">
                    Текущий
                  </span>
                ) : null}
              </div>

              <p className="mt-2 text-sm text-white/48">
                {workspace.site_is_published
                  ? publishedDate
                    ? `Опубликован ${publishedDate}`
                    : "Сайт доступен посетителям"
                  : "Черновик сохранён. Проверьте содержимое и опубликуйте сайт."}
              </p>
            </div>

            <WorkspaceMenu
              workspace={workspace}
              busy={busy}
              onDelete={onDelete}
              onArchive={onArchive}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
              Адрес сайта
            </p>
            {workspace.site_is_published ? (
              <Link
                href={publicPath}
                target="_blank"
                className="mt-1 block truncate text-sm font-medium text-[#e8c77f] hover:text-[#f4d99a]"
              >
                onestudioos.com{publicPath}
              </Link>
            ) : (
              <p className="mt-1 truncate text-sm text-white/55">
                onestudioos.com{publicPath}
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/45">
            <Metric value={workspace.booking_count} label="броней" />
            <Metric value={workspace.client_count} label="клиентов" />
            <Metric
              value={workspace.google_calendar_connected ? "✓" : "—"}
              label="Google Calendar"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {canConfigure ? (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void onOpen(
                    workspace.business_id,
                    `/dashboard/site?business=${workspace.business_id}&from=dashboard`,
                  )
                }
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#f7f5ef] px-5 text-sm font-semibold text-[#0b0d12] transition hover:bg-white disabled:cursor-wait disabled:opacity-50"
              >
                {busy ? "Открываем…" : "Редактировать сайт"}
              </button>
            ) : null}

            {workspace.site_is_published ? (
              <Link
                href={publicPath}
                target="_blank"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/14 px-5 text-sm font-semibold text-white/85 transition hover:border-white/30 hover:text-white"
              >
                Открыть сайт ↗
              </Link>
            ) : canConfigure ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void onPublish(workspace)}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8b36a]/35 bg-[#d8b36a]/[0.06] px-5 text-sm font-semibold text-[#e8c77f] transition hover:border-[#d8b36a]/60 disabled:cursor-wait disabled:opacity-50"
              >
                {busy ? "Публикуем…" : "Опубликовать"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function SitePreview({ workspace }: { workspace: Workspace }) {
  return (
    <div
      className="relative min-h-[230px] overflow-hidden border-b border-white/10 p-5 md:border-b-0 md:border-r"
      style={{
        background: `linear-gradient(150deg, ${workspace.preview_dark}, ${workspace.preview_accent}55)`,
      }}
    >
      <div
        className="absolute -right-12 -top-10 h-36 w-36 rounded-full blur-3xl"
        style={{ backgroundColor: `${workspace.preview_accent}88` }}
      />
      <div
        className="absolute -bottom-20 -left-16 h-44 w-44 rounded-full blur-3xl"
        style={{ backgroundColor: `${workspace.preview_surface}35` }}
      />

      <div className="relative flex h-full min-h-[190px] flex-col rounded-[22px] border border-white/15 bg-black/15 p-4 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-white/35" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
        </div>
        <div className="mt-auto">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Предпросмотр
          </p>
          <h4 className="mt-2 line-clamp-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            {workspace.preview_title}
          </h4>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/65">
            {workspace.preview_tagline}
          </p>
          <span
            className="mt-4 inline-flex rounded-full px-3 py-1.5 text-[10px] font-semibold"
            style={{
              backgroundColor: workspace.preview_surface,
              color: workspace.preview_dark,
            }}
          >
            Узнать больше
          </span>
        </div>
      </div>
    </div>
  );
}

function WorkspaceMenu({
  workspace,
  busy,
  onDelete,
  onArchive,
}: {
  workspace: Workspace;
  busy: boolean;
  onDelete: (workspace: Workspace) => Promise<void>;
  onArchive: (workspace: Workspace) => Promise<void>;
}) {
  if (!workspace.can_delete && !workspace.can_archive) return null;

  return (
    <details className="relative">
      <summary className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-full border border-white/10 text-lg text-white/55 transition hover:border-white/25 hover:text-white marker:content-none">
        <span aria-hidden="true">•••</span>
        <span className="sr-only">Дополнительные действия</span>
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-52 rounded-2xl border border-white/10 bg-[#171a20] p-2 shadow-2xl">
        {workspace.can_delete ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void onDelete(workspace)}
            className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-200 transition hover:bg-red-300/10 disabled:opacity-40"
          >
            Удалить демо-сайт
          </button>
        ) : workspace.can_archive ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void onArchive(workspace)}
            className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-white/75 transition hover:bg-white/[0.06] disabled:opacity-40"
          >
            Перенести в архив
          </button>
        ) : null}
      </div>
    </details>
  );
}

function NextSteps({
  workspace,
  busy,
  onOpen,
  onPublish,
}: {
  workspace: Workspace | null;
  busy: boolean;
  onOpen: (businessId: string, path: string) => Promise<void>;
  onPublish: (workspace: Workspace) => Promise<void>;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b36a]">
        Следующие шаги
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
        Доведите сайт до запуска
      </h2>

      {!workspace ? (
        <div className="mt-5 rounded-2xl border border-dashed border-white/12 p-4">
          <p className="text-sm leading-6 text-white/50">
            Сначала выберите демо и создайте первый сайт.
          </p>
          <Link
            href="/demos"
            className="mt-4 inline-flex text-sm font-semibold text-[#e8c77f]"
          >
            Выбрать демо →
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          <StepRow
            number="01"
            title="Проверьте тексты и дизайн"
            description="Замените демо-контент своими услугами, фотографиями и контактами."
            done={false}
            action={
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void onOpen(
                    workspace.business_id,
                    `/dashboard/site?business=${workspace.business_id}&from=dashboard`,
                  )
                }
                className="text-xs font-semibold text-[#e8c77f] disabled:opacity-40"
              >
                Открыть редактор →
              </button>
            }
          />
          <StepRow
            number="02"
            title="Опубликуйте сайт"
            description={
              workspace.site_is_published
                ? "Сайт уже доступен посетителям."
                : "После публикации появится рабочая ссылка для клиентов."
            }
            done={workspace.site_is_published}
            action={
              workspace.site_is_published ? (
                <Link
                  href={`/site/${workspace.slug}`}
                  target="_blank"
                  className="text-xs font-semibold text-[#e8c77f]"
                >
                  Открыть сайт ↗
                </Link>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onPublish(workspace)}
                  className="text-xs font-semibold text-[#e8c77f] disabled:opacity-40"
                >
                  Опубликовать →
                </button>
              )
            }
          />
          <StepRow
            number="03"
            title="Подключите календарь"
            description={
              workspace.google_calendar_connected
                ? "Google Calendar подключён к рабочему пространству."
                : "Бронирования и отдельный календарь клиента будут следующим этапом."
            }
            done={workspace.google_calendar_connected}
            badge={workspace.google_calendar_connected ? "Готово" : "Следующий этап"}
          />
          <StepRow
            number="04"
            title="Добавьте собственный домен"
            description="После завершения сайта подключим адрес клиента без поддомена OneStudio OS."
            done={false}
            badge="Запланировано"
          />
        </div>
      )}
    </section>
  );
}

function StepRow({
  number,
  title,
  description,
  done,
  action,
  badge,
}: {
  number: string;
  title: string;
  description: string;
  done: boolean;
  action?: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
      <div className="flex items-start gap-3">
        <div
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
            done
              ? "bg-emerald-400/15 text-emerald-200"
              : "bg-white/[0.06] text-white/45"
          }`}
        >
          {done ? "✓" : number}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">{title}</h3>
            {badge ? (
              <span className="rounded-full bg-white/[0.055] px-2 py-1 text-[10px] font-semibold text-white/40">
                {badge}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs leading-5 text-white/42">{description}</p>
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

function ArchivedSites({
  workspaces,
  busyId,
  onRestore,
  onDelete,
}: {
  workspaces: Workspace[];
  busyId: string | null;
  onRestore: (workspace: Workspace) => Promise<void>;
  onDelete: (workspace: Workspace) => Promise<void>;
}) {
  return (
    <details className="mt-8 border-t border-white/8 pt-6">
      <summary className="cursor-pointer list-none text-sm font-semibold text-white/55 marker:content-none">
        Архивные сайты ({workspaces.length}) ↓
      </summary>
      <div className="mt-4 grid gap-3">
        {workspaces.map((workspace) => (
          <div
            key={workspace.business_id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/8 bg-black/15 p-4"
          >
            <div>
              <p className="font-semibold">{workspace.name}</p>
              <p className="mt-1 text-xs text-white/40">
                Публичный сайт закрыт, данные сохранены.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {workspace.role === "owner" ? (
                <button
                  type="button"
                  disabled={busyId === workspace.business_id}
                  onClick={() => void onRestore(workspace)}
                  className="rounded-full border border-white/12 px-4 py-2 text-xs font-semibold disabled:opacity-40"
                >
                  Восстановить
                </button>
              ) : null}
              {workspace.can_delete ? (
                <button
                  type="button"
                  disabled={busyId === workspace.business_id}
                  onClick={() => void onDelete(workspace)}
                  className="rounded-full border border-red-300/20 px-4 py-2 text-xs font-semibold text-red-200 disabled:opacity-40"
                >
                  Удалить
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}

function EmptyState() {
  return (
    <div className="mt-6 rounded-[26px] border border-dashed border-white/14 bg-black/15 p-6 sm:p-8">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#d8b36a]/10 text-xl text-[#e8c77f]">
        +
      </div>
      <h3 className="mt-4 text-xl font-semibold">Создайте первый сайт</h3>
      <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
        Выберите готовое демо, измените стиль и функции, затем сохраните проект в личном кабинете.
      </p>
      <Link
        href="/demos"
        className="mt-5 inline-flex rounded-full bg-[#f7f5ef] px-5 py-2.5 text-sm font-semibold text-[#0b0d12]"
      >
        Посмотреть демо
      </Link>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid animate-pulse overflow-hidden rounded-[30px] border border-white/8 bg-[#0d1015] md:grid-cols-[250px_1fr]">
      <div className="min-h-[230px] bg-white/[0.04]" />
      <div className="p-6">
        <div className="h-6 w-48 rounded-full bg-white/[0.07]" />
        <div className="mt-4 h-4 w-72 max-w-full rounded-full bg-white/[0.05]" />
        <div className="mt-8 h-16 rounded-2xl bg-white/[0.04]" />
        <div className="mt-6 h-11 w-44 rounded-full bg-white/[0.07]" />
      </div>
    </div>
  );
}

function PublicationBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        published
          ? "bg-emerald-400/10 text-emerald-200"
          : "bg-amber-300/10 text-amber-100"
      }`}
    >
      {published ? "Опубликован" : "Черновик"}
    </span>
  );
}

function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "warning";
}) {
  const className =
    tone === "success"
      ? "border-emerald-300/15 bg-emerald-300/[0.07] text-emerald-100/80"
      : tone === "warning"
        ? "border-amber-300/15 bg-amber-300/[0.07] text-amber-100/80"
        : "border-white/8 bg-white/[0.035] text-white/55";

  return <span className={`rounded-full border px-3 py-1.5 ${className}`}>{label}</span>;
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <span className="rounded-full border border-white/8 bg-white/[0.025] px-3 py-1.5">
      <strong className="font-semibold text-white/75">{value}</strong> {label}
    </span>
  );
}

function AccountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/15 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-white/28">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-white/75">{value}</p>
    </div>
  );
}

function Notice({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "error" | "success";
}) {
  const className =
    tone === "error"
      ? "border-red-300/20 bg-red-400/10 text-red-100"
      : "border-emerald-300/20 bg-emerald-400/10 text-emerald-100";

  return (
    <p className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${className}`}>
      {children}
    </p>
  );
}
