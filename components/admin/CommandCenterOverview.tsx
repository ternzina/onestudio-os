"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { AdminMessage, AdminMessageValues } from "@/lib/i18n/admin";

type Props = {
  t: (key: AdminMessage, values?: AdminMessageValues) => string;
};

type Workspace = {
  business_id: string;
  name: string;
  is_default: boolean;
};

type Overview = {
  today_bookings: number;
  unpaid_bookings: number;
  unsent_documents: number;
  needs_review: number;
  enabled_modules: number;
};

const itemDefinitions = [
  {
    title: "Today",
    valueKey: "today_bookings",
    description: "Bookings for today",
    href: "/admin/bookings",
    linkLabel: "Open bookings",
  },
  {
    title: "Payments",
    valueKey: "unpaid_bookings",
    description: "Unpaid orders",
    href: "/admin/payments",
    linkLabel: "Open payments",
  },
  {
    title: "Documents",
    valueKey: "unsent_documents",
    description: "Unsent documents",
    href: "/admin/documents",
    linkLabel: "Open documents",
  },
  {
    title: "Attention",
    valueKey: "needs_review",
    description: "Needs review",
    href: "/admin/notifications",
    linkLabel: "Notifications",
  },
] as const;

export default function CommandCenterOverview({ t }: Props) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      const workspaceResult = await supabase.rpc("list_my_businesses");
      if (!active) return;
      if (workspaceResult.error) {
        setError(workspaceResult.error.message);
        return;
      }

      const rows = (workspaceResult.data ?? []) as Workspace[];
      const current = rows.find((row) => row.is_default) ?? rows[0] ?? null;
      setWorkspace(current);
      if (!current) {
        setError(t("No active business workspace."));
        return;
      }

      const overviewResult = await supabase.rpc("get_admin_core_suite_overview", {
        p_business_id: current.business_id,
      });
      if (!active) return;
      if (overviewResult.error) {
        setError(overviewResult.error.message);
        return;
      }

      const raw = (overviewResult.data ?? {}) as Partial<Overview>;
      setOverview({
        today_bookings: Number(raw.today_bookings ?? 0),
        unpaid_bookings: Number(raw.unpaid_bookings ?? 0),
        unsent_documents: Number(raw.unsent_documents ?? 0),
        needs_review: Number(raw.needs_review ?? 0),
        enabled_modules: Number(raw.enabled_modules ?? 0),
      });
    }

    void load();
    return () => {
      active = false;
    };
  }, [t]);

  return (
    <section className="mt-8 rounded-[32px] border border-black/8 bg-[#eeebe3] p-5 shadow-[0_18px_55px_rgba(20,20,20,0.07)] sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">
            {t("Core Suite 1.0")}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#17191f]">
            {t("Operational overview")}
          </h2>
        </div>
        <div className="max-w-xl text-sm leading-6 text-[#6f6c65] sm:text-right">
          <p>{workspace ? t("Live workspace data: {workspace}", { workspace: workspace.name }) : t("Loading workspace overview…")}</p>
          {overview ? <p>{t("{count} of 10 modules enabled", { count: overview.enabled_modules })}</p> : null}
        </div>
      </div>

      {error ? (
        <p className="mt-5 rounded-2xl border border-red-900/10 bg-red-50 px-4 py-3 text-sm text-red-800">
          {t("Command Center could not be loaded.")} {error}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {itemDefinitions.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-[24px] border border-black/6 bg-white p-5 shadow-[0_14px_40px_rgba(20,20,20,0.06)] transition hover:-translate-y-0.5 hover:border-[#9a742e]/35 hover:shadow-[0_18px_48px_rgba(20,20,20,0.1)] focus:outline-none focus:ring-2 focus:ring-[#9a742e]/35"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a742e]">
              {t(item.description)}
            </p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold tracking-[-0.04em] text-[#17191f]">
                  {overview ? overview[item.valueKey] : "…"}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#17191f]">{t(item.title)}</p>
              </div>
              <span className="text-xs font-semibold text-[#9a742e] transition group-hover:translate-x-0.5">
                {t(item.linkLabel)} →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
