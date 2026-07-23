"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const checkAccess = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role !== "admin") {
        router.replace("/dashboard");
        return;
      }

      if (active) setIsChecking(false);
    };

    void checkAccess();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f1eb] text-[#17191f]">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a742e]">OneStudio OS</p>
          <p className="mt-3 text-sm text-[#6c6a64]">Checking administrator access...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f1eb] text-[#17191f]">
      <AdminSidebar />
      <div className="lg:pl-[290px]">{children}</div>
    </div>
  );
}
