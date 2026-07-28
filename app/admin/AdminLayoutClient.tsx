"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminModulesProvider from "@/components/admin/AdminModulesContext";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isBootstrap = pathname === "/admin/bootstrap";

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
        <AdminSidebar />
        <div className="lg:pl-[290px]">{children}</div>
      </div>
    </AdminModulesProvider>
  );
}
