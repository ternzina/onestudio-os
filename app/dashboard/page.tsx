"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const MAX_OWNED_SITES = 3;

type Profile = {
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
};

type Workspace = {
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
  site_is_published: boolean;
  site_published_at: string | null;
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
  return value;
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
        .select("name,email,phone,role")
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
      role: profileResult.data?.role || null,
    });

    if (workspaceResult.error) {
      setWorkspaceError(workspaceResult.error.message);
      setWorkspaces([]);
      setLoading(false);
      return;
    }

    const workspaceRows = (workspaceResult.data ?? []) as Omit<
      Workspace,
      "site_is_published" | "site_published_at"
    >[];

    const workspacesWithPublication = await Promise.all(
      workspaceRows.map(async (workspace) => {
        if (workspace.status === "archived") {
          return {
            ...workspace,
            site_is_published: false,
            site_published_at: null,
          };
        }

        const { data: editor } = await supabase.rpc("get_public_site_editor", {
          p_business_id: workspace.business_id,
        });
        const site =
          editor && typeof editor === "object" && "site" in editor
            ? (editor.site as {
                is_published?: boolean;
                published_at?: string | null;
              })
            : null;

        return {
          ...workspace,
          site_is_published: site?.is_published === true,
          site_published_at: site?.published_at ?? null,
        };
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
    <main className="min-h-screen bg-[#0b0d12] px-5 py-10 text-[#f7f5ef]">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]"
          >
            OneStudio OS
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold"
          >
            Выйти
          </button>
        </div>

        <div className="mt-10 rounded-[36px] border border-white/10 bg-white/[0.06] p-7 sm:p-10">
          <p className="text-xs uppercase tracking-[0.22em] text-[#d8b36a]">
            Личный кабинет
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            {profile?.name ? `Здравствуйте, ${profile.name}.` : "Ваш аккаунт готов."}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#b9b5ab]">
            Здесь находятся ваши сайты и настройки OneStudio OS.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Detail
              label="Email"
              value={profile?.email || (loading ? "Загрузка..." : "Не указан")}
            />
            <Detail label="Телефон" value={profile?.phone || "Не указан"} />
            <Detail
              label="Сайты"
              value={`${activeOwnedCount} из ${MAX_OWNED_SITES}`}
            />
          </div>
        </div>

        <div className="mt-6 rounded-[36px] border border-white/10 bg-white/[0.04] p-7 sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#d8b36a]">
                Мои сайты
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                Рабочие пространства
              </h2>
              <p className="mt-2 text-sm text-[#8f8b82]">
                Активных сайтов: {activeOwnedCount} из {MAX_OWNED_SITES}
              </p>
            </div>
            {canCreateSite ? (
              <Link
                href="/demos"
                className="rounded-full bg-[#f7f5ef] px-6 py-3 text-sm font-semibold text-[#0b0d12]"
              >
                Создать новый сайт
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/40">
                Достигнут лимит 3 сайта
              </span>
            )}
          </div>

          {!canCreateSite ? (
            <p className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
              Для нового сайта удалите ненужный пустой демо-сайт или архивируйте один из рабочих сайтов.
            </p>
          ) : null}

          {workspaceError ? (
            <p className="mt-5 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {workspaceError}
            </p>
          ) : null}
          {workspaceMessage ? (
            <p className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              {workspaceMessage}
            </p>
          ) : null}

          {!loading && activeWorkspaces.length === 0 ? (
            <div className="mt-7 rounded-[28px] border border-dashed border-white/15 bg-black/15 p-7">
              <h3 className="text-xl font-semibold">У вас пока нет активного сайта</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b9b5ab]">
                Выберите демо, измените стиль и функции, а затем сохраните его как своё рабочее пространство.
              </p>
              {canCreateSite ? (
                <Link
                  href="/demos"
                  className="mt-5 inline-flex rounded-full border border-[#d8b36a]/50 px-5 py-2.5 text-sm font-semibold text-[#e8c77f]"
                >
                  Посмотреть демо-сайты
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="mt-7 grid gap-4">
              {activeWorkspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.business_id}
                  workspace={workspace}
                  busy={
                    switchingWorkspace === workspace.business_id ||
                    workspaceAction === workspace.business_id
                  }
                  onOpen={openWorkspace}
                  onDelete={deleteWorkspace}
                  onArchive={archiveWorkspace}
                />
              ))}
            </div>
          )}

          {archivedWorkspaces.length ? (
            <div className="mt-10 border-t border-white/10 pt-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#8f8b82]">
                    Архив
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">Сохранённые сайты</h3>
                </div>
                <p className="text-sm text-[#8f8b82]">
                  Архивные сайты не занимают место в лимите.
                </p>
              </div>
              <div className="mt-5 grid gap-4">
                {archivedWorkspaces.map((workspace) => (
                  <article
                    key={workspace.business_id}
                    className="rounded-[28px] border border-white/10 bg-black/15 p-6 opacity-90"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-xl font-semibold">{workspace.name}</h4>
                          <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/60">
                            Архив
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-[#8f8b82]">
                          Публичный сайт закрыт, данные сохранены.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {workspace.role === "owner" ? (
                          <button
                            type="button"
                            disabled={workspaceAction === workspace.business_id}
                            onClick={() => void restoreWorkspace(workspace)}
                            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold disabled:cursor-wait disabled:opacity-50"
                          >
                            {workspaceAction === workspace.business_id
                              ? "Выполняем…"
                              : "Восстановить"}
                          </button>
                        ) : null}
                        {workspace.can_delete ? (
                          <button
                            type="button"
                            disabled={workspaceAction === workspace.business_id}
                            onClick={() => void deleteWorkspace(workspace)}
                            className="rounded-full border border-red-300/25 px-5 py-2.5 text-sm font-semibold text-red-100 disabled:cursor-wait disabled:opacity-50"
                          >
                            Удалить навсегда
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex justify-end">
            <Link
              href="/admin/workspace"
              className="text-sm font-semibold text-[#d8b36a] hover:text-[#e8c77f]"
            >
              Расширенное управление сайтами →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function WorkspaceCard({
  workspace,
  busy,
  onOpen,
  onDelete,
  onArchive,
}: {
  workspace: Workspace;
  busy: boolean;
  onOpen: (businessId: string, path: string) => Promise<void>;
  onDelete: (workspace: Workspace) => Promise<void>;
  onArchive: (workspace: Workspace) => Promise<void>;
}) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-black/15 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold">{workspace.name}</h3>
            <span
              className={`rounded-full px-3 py-1 text-xs ${
                workspace.site_is_published
                  ? "bg-emerald-400/10 text-emerald-200"
                  : "bg-amber-300/10 text-amber-100"
              }`}
            >
              {workspace.site_is_published ? "Опубликован" : "Черновик"}
            </span>
            {workspace.is_default ? (
              <span className="rounded-full bg-[#d8b36a]/10 px-3 py-1 text-xs text-[#e8c77f]">
                Текущий
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-[#8f8b82]">
            {workspace.site_is_published
              ? "Сайт доступен посетителям"
              : "Завершите настройку и опубликуйте сайт"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void onOpen(
                workspace.business_id,
                `/admin/site?business=${workspace.business_id}`,
              )
            }
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold disabled:cursor-wait disabled:opacity-50"
          >
            {busy
              ? "Выполняем…"
              : workspace.site_is_published
                ? "Настроить сайт"
                : "Продолжить настройку"}
          </button>
          {workspace.site_is_published ? (
            <Link
              href={`/site/${workspace.slug}`}
              target="_blank"
              className="rounded-full bg-[#f7f5ef] px-5 py-2.5 text-sm font-semibold text-[#0b0d12]"
            >
              Открыть сайт
            </Link>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => void onOpen(workspace.business_id, "/admin")}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold disabled:cursor-wait disabled:opacity-50"
          >
            Управление
          </button>
          {workspace.can_delete ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onDelete(workspace)}
              className="rounded-full border border-red-300/25 px-5 py-2.5 text-sm font-semibold text-red-100 disabled:cursor-wait disabled:opacity-50"
            >
              Удалить
            </button>
          ) : workspace.can_archive ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onArchive(workspace)}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/70 disabled:cursor-wait disabled:opacity-50"
            >
              В архив
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-[#8f8b82]">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold">{value}</p>
    </div>
  );
}
