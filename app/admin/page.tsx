"use client";

import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";

const readyModules = [
  {
    title: "Media library",
    label: "Cloud assets",
    description: "Upload, organize and remove images or video stored in Cloudflare R2.",
    href: "/admin/media",
    icon: "◫",
  },
  {
    title: "Portfolio",
    label: "Published work",
    description: "Manage portfolio categories, selected media and display order.",
    href: "/admin/portfolio",
    icon: "◇",
  },
  {
    title: "Foundation settings",
    label: "Business identity",
    description: "Edit the neutral global, contact and booking settings defined in the clean database.",
    href: "/admin/settings",
    icon: "⚙",
  },
  {
    title: "Module map",
    label: "System architecture",
    description: "See which modules are enabled, contract-ready or still planned.",
    href: "/admin/modules",
    icon: "⌘",
  },
];

const nextModules = ["Catalog admin UI", "Booking UI", "Payments", "Notifications", "Analytics"];

export default function AdminPage() {
  const router = useRouter();

  return (
    <>
      <AdminHeader />
      <main className="min-h-screen px-5 pb-24 pt-36">
        <section className="mx-auto w-full max-w-7xl">
          <div className="rounded-[38px] bg-[#17191f] p-7 text-white shadow-[0_28px_90px_rgba(20,20,20,0.2)] sm:p-10">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d8b36a]">Core Modules 1.0</p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">A clean control center.</h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
                  This branch adds one universal contract for businesses, services, resources, clients and bookings. Interfaces can now be built without splitting appointments and rentals into separate systems.
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/[0.07] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#d8b36a]">Current rule</p>
                <p className="mt-3 text-2xl font-semibold">No client-specific defaults.</p>
                <p className="mt-3 text-sm leading-6 text-white/65">Each future edition must receive its identity and content through configuration.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {readyModules.map((module) => (
              <button key={module.href} type="button" onClick={() => router.push(module.href)} className="rounded-[28px] border border-black/8 bg-white p-6 text-left shadow-[0_18px_55px_rgba(20,20,20,0.07)] transition hover:-translate-y-1">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#17191f] text-xl text-white">{module.icon}</span>
                <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{module.label}</span>
                <span className="mt-2 block text-2xl font-semibold tracking-[-0.04em]">{module.title}</span>
                <span className="mt-3 block text-sm leading-6 text-[#6f6c65]">{module.description}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-[30px] border border-black/8 bg-[#eeebe3] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">Planned foundation layers</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {nextModules.map((module, index) => (
                <div key={module} className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs text-[#9a742e]">0{index + 1}</p>
                  <p className="mt-2 text-sm font-semibold">{module}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
