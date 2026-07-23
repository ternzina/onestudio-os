"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: "🏠" },
  { href: "/admin/bookings", label: "Бронювання", icon: "📅" },
  { href: "/admin/payments", label: "Оплата", icon: "💳" },
  { href: "/admin/analytics", label: "Аналітика", icon: "📊" },
  { href: "/admin/media", label: "Медіатека", icon: "📷" },
  { href: "/admin/portfolio", label: "Портфоліо", icon: "🖼" },
  { href: "/admin/settings", label: "Налаштування", icon: "⚙️" },
];

const soonItems = [{ label: "Клієнти", icon: "👥" }];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[290px] overflow-y-auto border-r border-[#E5D5C8] bg-[#FFFDFB]/90 px-5 py-6 text-[#2B1A12] shadow-[18px_0_70px_rgba(83,54,37,0.08)] backdrop-blur-xl lg:block">
      <div className="flex min-h-full flex-col">
        <Link
          href="/admin"
          className="group rounded-[28px] border border-[#E5D5C8] bg-[#F7F1EA]/70 p-5 transition hover:border-[#A67C52]"
        >
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#A67C52]">Studio OS</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">Sisters Studio</h2>
          <p className="mt-2 text-xs leading-5 text-[#7A6252]">CRM · Media · Booking</p>
        </Link>

        <nav className="mt-6 space-y-2">
          {adminNavItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-[20px] border px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "border-[#2B1A12] bg-[#2B1A12] text-[#F7F1EA] shadow-[0_14px_34px_rgba(43,26,18,0.16)]"
                    : "border-transparent text-[#7A6252] hover:border-[#E5D5C8] hover:bg-[#F7F1EA]/80 hover:text-[#2B1A12]"
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/12 text-base">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 rounded-[24px] border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A67C52]">Скоро</p>
          <div className="mt-3 space-y-2">
            {soonItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-[18px] border border-transparent px-3 py-2 text-sm text-[#9A8170] opacity-70"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-sm">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto rounded-[24px] border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A67C52]">Quick links</p>
          <div className="mt-3 grid gap-2">
            <Link
              href="/"
              target="_blank"
              className="rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
            >
              Відкрити сайт
            </Link>
            <Link
              href="/portfolio"
              target="_blank"
              className="rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
            >
              Перегляд портфоліо
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
