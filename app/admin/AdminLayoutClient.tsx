"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminModulesProvider from "@/components/admin/AdminModulesContext";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isBootstrap = pathname === "/admin/bootstrap";
  const isSiteEditor = pathname === "/admin/site";
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!session) {
          router.replace("/login");
          router.refresh();
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, [router]);

  if (isBootstrap) return children;

  return (
    <AdminModulesProvider>
      <div className="min-h-screen bg-[#f3f1eb] text-[#17191f]">
        {(!isSiteEditor || isAdminMenuOpen) && <AdminSidebar />}

        {isSiteEditor && (
          <button
            type="button"
            onClick={() => setIsAdminMenuOpen((open) => !open)}
            className={`fixed top-4 z-50 hidden rounded-full border border-black/10 bg-[#17191f] px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-all lg:block ${
              isAdminMenuOpen ? "left-[306px]" : "left-4"
            }`}
            aria-expanded={isAdminMenuOpen}
          >
            {isAdminMenuOpen ? "Скрыть меню" : "Открыть меню"}
          </button>
        )}

        <div className={!isSiteEditor || isAdminMenuOpen ? "lg:pl-[290px]" : ""}>
          {children}
        </div>
      </div>
    </AdminModulesProvider>
  );
}
