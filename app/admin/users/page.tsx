"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import type { BusinessRole } from "@/lib/modules/contracts";
import { supabase } from "@/lib/supabase";

type Workspace = {
  business_id: string;
  name: string;
  role: BusinessRole;
  is_default: boolean;
};

type Member = {
  membership_id: string;
  user_id: string;
  display_name: string;
  email: string;
  role: BusinessRole;
  is_active: boolean;
  is_default: boolean;
  member_since: string;
};

const roles: BusinessRole[] = [
  "owner",
  "admin",
  "manager",
  "staff",
  "viewer",
];

export default function AdminUsersPage() {
  const { t } = useAdminI18n();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<BusinessRole>("staff");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const roleLabels = useMemo<Record<BusinessRole, string>>(
    () => ({
      owner: t("Owner"),
      admin: t("Administrator"),
      manager: t("Manager"),
      staff: t("Staff"),
      viewer: t("Viewer"),
    }),
    [t],
  );

  const canManage =
    workspace?.role === "owner" || workspace?.role === "admin";

  const loadMembers = useCallback(async () => {
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

    setWorkspace(current);
    if (!["owner", "admin"].includes(current.role)) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const { data, error: memberError } = await supabase.rpc(
      "list_business_members",
      { p_business_id: current.business_id },
    );
    if (memberError) {
      setError(memberError.message);
      setMembers([]);
    } else {
      setMembers((data ?? []) as Member[]);
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  async function addMember() {
    if (!workspace || !canManage || !email.trim()) return;
    setSavingId("new");
    setMessage("");
    setError("");

    const { error: addError } = await supabase.rpc(
      "upsert_business_member_by_email",
      {
        p_business_id: workspace.business_id,
        p_email: email.trim(),
        p_role: newRole,
      },
    );

    if (addError) {
      setError(
        addError.message.includes("workspace_user_not_registered")
          ? t("This email must register an account before a role can be assigned.")
          : addError.message,
      );
    } else {
      setEmail("");
      setNewRole("staff");
      setMessage(t("User role added."));
      await loadMembers();
    }
    setSavingId("");
  }

  async function updateMember(
    member: Member,
    changes: Partial<Pick<Member, "role" | "is_active">>,
  ) {
    if (!workspace || !canManage) return;
    const nextRole = changes.role ?? member.role;
    const nextActive = changes.is_active ?? member.is_active;
    setSavingId(member.membership_id);
    setMessage("");
    setError("");

    const { data, error: updateError } = await supabase.rpc(
      "update_business_member_role",
      {
        p_business_id: workspace.business_id,
        p_membership_id: member.membership_id,
        p_role: nextRole,
        p_is_active: nextActive,
      },
    );

    if (updateError || data !== true) {
      setError(
        updateError?.message.includes("workspace_requires_active_owner")
          ? t("The workspace must keep at least one active owner.")
          : updateError?.message || t("The user role could not be updated."),
      );
    } else {
      setMessage(t("User role updated."));
      await loadMembers();
    }
    setSavingId("");
  }

  return (
    <>
      <AdminHeader />
      <main className="min-h-screen px-5 pb-24 pt-36">
        <section className="mx-auto w-full max-w-7xl">
          <div className="rounded-[34px] bg-[#17191f] p-7 text-white shadow-[0_28px_90px_rgba(20,20,20,0.18)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">
              {t("Workspace access")}
            </p>
            <div className="mt-5 grid gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">
                  {t("Users and roles")}
                </h1>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
                  {t("Assign access to registered users and choose what each person can do in this workspace.")}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/[0.07] p-5 text-sm leading-6 text-white/65">
                {t("Only an owner or administrator can change roles. The last active owner is protected.")}
              </div>
            </div>
          </div>

          {(message || error) ? (
            <div
              className={`mt-6 rounded-2xl border px-5 py-4 text-sm ${
                error
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-green-200 bg-green-50 text-green-800"
              }`}
            >
              {error || message}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-8 rounded-[28px] border border-black/8 bg-white p-8 text-sm text-[#6f6c65]">
              {t("Loading users…")}
            </div>
          ) : !workspace ? null : !canManage ? (
            <div className="mt-8 rounded-[28px] border border-amber-200 bg-amber-50 p-7 text-sm text-amber-900">
              {t("Only an owner or administrator can manage workspace users.")}
            </div>
          ) : (
            <>
              <section className="mt-8 rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(20,20,20,0.06)] sm:p-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">
                    {t("Add registered user")}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                    {workspace.name}
                  </h2>
                </div>
                <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_220px_auto]">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    className="min-h-12 rounded-xl border border-black/10 bg-[#faf9f6] px-4 text-sm outline-none focus:border-[#9a742e]"
                  />
                  <select
                    value={newRole}
                    onChange={(event) =>
                      setNewRole(event.target.value as BusinessRole)
                    }
                    className="min-h-12 rounded-xl border border-black/10 bg-[#faf9f6] px-4 text-sm outline-none"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {roleLabels[role]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => void addMember()}
                    disabled={!email.trim() || savingId === "new"}
                    className="min-h-12 rounded-xl bg-[#17191f] px-6 text-xs font-semibold text-white disabled:opacity-40"
                  >
                    {savingId === "new" ? t("Saving…") : t("Add user")}
                  </button>
                </div>
                <p className="mt-3 text-xs leading-5 text-[#77736a]">
                  {t("The person must first create an account with this email.")}
                </p>
              </section>

              <section className="mt-6 overflow-hidden rounded-[28px] border border-black/8 bg-white shadow-[0_18px_55px_rgba(20,20,20,0.06)]">
                <div className="border-b border-black/8 px-6 py-5 sm:px-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">
                    {t("Workspace users")}
                  </p>
                  <p className="mt-2 text-sm text-[#77736a]">
                    {t("{count} users", { count: members.length })}
                  </p>
                </div>
                <div className="divide-y divide-black/8">
                  {members.map((member) => (
                    <article
                      key={member.membership_id}
                      className={`grid gap-5 px-6 py-5 sm:px-8 lg:grid-cols-[1fr_220px_150px] lg:items-center ${
                        member.is_active ? "" : "bg-black/[0.025] opacity-60"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-semibold">
                            {member.display_name}
                          </h3>
                          {member.is_default ? (
                            <span className="rounded-full bg-[#f4ead6] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#725924]">
                              {t("Current")}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 truncate text-sm text-[#77736a]">
                          {member.email}
                        </p>
                      </div>
                      <select
                        value={member.role}
                        disabled={
                          savingId === member.membership_id ||
                          (workspace.role !== "owner" && member.role === "owner")
                        }
                        onChange={(event) =>
                          void updateMember(member, {
                            role: event.target.value as BusinessRole,
                          })
                        }
                        className="min-h-11 rounded-xl border border-black/10 bg-[#faf9f6] px-3 text-sm outline-none disabled:opacity-45"
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {roleLabels[role]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={
                          savingId === member.membership_id ||
                          (workspace.role !== "owner" && member.role === "owner")
                        }
                        onClick={() =>
                          void updateMember(member, {
                            is_active: !member.is_active,
                          })
                        }
                        className={`min-h-11 rounded-xl border px-4 text-xs font-semibold disabled:opacity-40 ${
                          member.is_active
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-green-200 bg-green-50 text-green-800"
                        }`}
                      >
                        {member.is_active ? t("Disable access") : t("Restore access")}
                      </button>
                    </article>
                  ))}
                  {!members.length ? (
                    <p className="px-8 py-10 text-sm text-[#77736a]">
                      {t("No workspace users found.")}
                    </p>
                  ) : null}
                </div>
              </section>
            </>
          )}
        </section>
      </main>
    </>
  );
}
