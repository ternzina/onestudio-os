"use client";

import Link from "next/link";
import type { AdminMessage } from "@/lib/i18n/admin";

type Props = {
  t: (key: AdminMessage) => string;
};

const items = [
  {
    title: "Bookings",
    value: "—",
    description: "Today",
    href: "/admin/bookings",
    linkLabel: "Open bookings",
  },
  {
    title: "Unpaid",
    value: "—",
    description: "Payments",
    href: "/admin/payments",
    linkLabel: "Open payments",
  },
  {
    title: "Document",
    value: "—",
    description: "Today",
    href: "/admin/documents",
    linkLabel: "Document",
  },
  {
    title: "Notifications",
    value: "—",
    description: "Today",
    href: "/admin/notifications",
    linkLabel: "Notifications",
  },
] as const;

export default function CommandCenterOverview({ t }: Props) {
  return (
    <section className="mt-8 rounded-[32px] border border-black/8 bg-[#eeebe3] p-5 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">
            Command Center 3.0
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#17191f]">
            {t("Today")}
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-[#6f6c65]">
          {t("Bookings")}, {t("Unpaid")}, {t("Document")}, {t("Notifications")}.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <article key={item.href} className="rounded-[24px] bg-white p-5 shadow-[0_14px_40px_rgba(20,20,20,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a742e]">
              {t(item.description)}
            </p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold tracking-[-0.04em] text-[#17191f]">{item.value}</p>
                <p className="mt-1 text-sm font-semibold text-[#17191f]">{t(item.title)}</p>
              </div>
              <Link href={item.href} className="text-xs font-semibold text-[#9a742e]">
                {t(item.linkLabel)} →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
