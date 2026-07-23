"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      if (active) setChecking(false);
    });

    return () => { active = false; };
  }, [router]);

  if (checking) {
    return <main className="flex min-h-screen items-center justify-center bg-[#0b0d12] text-white">Checking account...</main>;
  }

  return children;
}
