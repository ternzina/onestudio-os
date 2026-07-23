"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const activeItems = [
  { href: "/admin", label: "Overview", icon: "⌂" },
  { href: "/admin/media", label: "Media", icon: "◫" },
  { href: "/admin/portfolio", label: "Portfolio", icon: "◇" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
] as const;

const plannedItems = ["Bookings", "Clients", "Payments", "Analytics"];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[290px] overflow-y-auto border-r border-black/8 bg-[#fffdfa] px-5 py-6 shadow-[18px_0_70px_rgba(25,25,25,0.06)] lg:block">
      <div className="flex min-h-full flex-col">
        <Link href="/admin" className="rounded-[26px] border border-black/8 bg-[#17191f] p-5 text-white">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#d8b36a]">Core Foundation</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">OneStudio OS</h2>
          <p className="mt-2 text-xs leading-5 text-white/65">Admin · Media · Content</p>
        </Link>

        <nav className="mt-6 space-y-2">
          {activeItems.map((item) => {
            const active = item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
                  active ? "bg-[#17191f] text-white" : "text-[#66645f] hover:bg-[#eeebe3] hover:text-[#17191f]"
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 rounded-[22px] border border-black/8 bg-[#eeebe3] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">Next core layers</p>
          <div className="mt-3 grid gap-2">
            {plannedItems.map((item) => (
              <div key={item} className="rounded-xl bg-white/70 px-3 py-2 text-sm text-[#79766f]">{item}</div>
            ))}
          </div>
        </div>

        <div className="mt-auto grid gap-2 pt-6">
          <Link href="/" target="_blank" className="rounded-full border border-black/10 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em]">
            Open public site
          </Link>
          <Link href="/dashboard" className="rounded-full border border-black/10 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em]">
            Account area
          </Link>
        </div>
      </div>
    </aside>
  );
}
