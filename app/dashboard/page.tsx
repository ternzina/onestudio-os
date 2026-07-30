"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = { name: string | null; email: string | null; phone: string | null; role: string | null };
type Workspace = {
  business_id: string;
  slug: string;
  name: string;
  status: string;
  role: string;
  is_default: boolean;
  site_is_published: boolean;
  site_published_at: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [switchingWorkspace, setSwitchingWorkspace] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState("");

  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setLoading(false);
        return;
      }
      const [profileResult, workspaceResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("name,email,phone,role")
          .eq("id", data.user.id)
          .maybeSingle(),
        supabase.rpc("list_my_businesses"),
      ]);
      const metadataName =
        typeof data.user.user_metadata?.full_name === "string"
          ? data.user.user_metadata.full_name
          : typeof data.user.user_metadata?.name === "string"
            ? data.user.user_metadata.name
            : null;
      setProfile({
        name: profileResult.data?.name || metadataName,
        email: profileResult.data?.email || data.user.email || null,
        phone: profileResult.data?.phone || data.user.phone || null,
        role: profileResult.data?.role || null,
      });
      if (!workspaceResult.error) {
        const workspaceRows = (workspaceResult.data ?? []) as Omit<
          Workspace,
          "site_is_published" | "site_published_at"
        >[];
        const workspacesWithPublication = await Promise.all(
          workspaceRows.map(async (workspace) => {
            const { data: editor } = await supabase.rpc(
              "get_public_site_editor",
              { p_business_id: workspace.business_id },
            );
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
      }
      setLoading(false);
    });
  }, []);

  async function openWorkspace(businessId: string, path: string) {
    setSwitchingWorkspace(businessId);
    setWorkspaceError("");
    const { data, error } = await supabase.rpc("set_default_business", {
      p_business_id: businessId,
    });

    if (error || data !== true) {
      setWorkspaceError(error?.message || "Не удалось открыть выбранный сайт.");
      setSwitchingWorkspace(null);
      return;
    }

    router.push(path);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-[#0b0d12] px-5 py-10 text-[#f7f5ef]">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">OneStudio OS</Link>
          <button type="button" onClick={logout} className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold">Sign out</button>
        </div>

        <div className="mt-10 rounded-[36px] border border-white/10 bg-white/[0.06] p-7 sm:p-10">
          <p className="text-xs uppercase tracking-[0.22em] text-[#d8b36a]">Личный кабинет</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            {profile?.name ? `Здравствуйте, ${profile.name}.` : "Ваш аккаунт готов."}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#b9b5ab]">
            Здесь находятся ваши сайты и настройки OneStudio OS.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Detail label="Email" value={profile?.email || (loading ? "Загрузка..." : "Не указан")} />
            <Detail label="Телефон" value={profile?.phone || "Не указан"} />
            <Detail label="Тип аккаунта" value={workspaces.length ? "Владелец пространства" : "Пользователь"} />
          </div>
        </div>

        <div className="mt-6 rounded-[36px] border border-white/10 bg-white/[0.04] p-7 sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#d8b36a]">Мои сайты</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Рабочие пространства</h2>
            </div>
            <Link href="/demos" className="rounded-full bg-[#f7f5ef] px-6 py-3 text-sm font-semibold text-[#0b0d12]">
              Создать новый сайт
            </Link>
          </div>

          {workspaceError ? (
            <p className="mt-5 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {workspaceError}
            </p>
          ) : null}

          {!loading && workspaces.length === 0 ? (
            <div className="mt-7 rounded-[28px] border border-dashed border-white/15 bg-black/15 p-7">
              <h3 className="text-xl font-semibold">У вас пока нет сайта</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b9b5ab]">
                Выберите подходящее демо, измените стиль и функции, а затем сохраните его как своё рабочее пространство.
              </p>
              <Link href="/demos" className="mt-5 inline-flex rounded-full border border-[#d8b36a]/50 px-5 py-2.5 text-sm font-semibold text-[#e8c77f]">
                Посмотреть демо-сайты
              </Link>
            </div>
          ) : (
            <div className="mt-7 grid gap-4">
              {workspaces.map((workspace) => (
                <article key={workspace.business_id} className="rounded-[28px] border border-white/10 bg-black/15 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
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
                        disabled={switchingWorkspace === workspace.business_id}
                        onClick={() => void openWorkspace(
                          workspace.business_id,
                          `/admin/site?business=${workspace.business_id}`,
                        )}
                        className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold disabled:cursor-wait disabled:opacity-60"
                      >
                        {switchingWorkspace === workspace.business_id
                          ? "Открываем…"
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
                        disabled={switchingWorkspace === workspace.business_id}
                        onClick={() => void openWorkspace(workspace.business_id, "/admin")}
                        className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold disabled:cursor-wait disabled:opacity-60"
                      >
                        Управление сайтом
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
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
