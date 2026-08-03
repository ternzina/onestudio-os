"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
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

    return () => {
      active = false;
    };
  }, [router]);

  if (checking) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#090b0f] px-6 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#d8b36a]" />
          <p className="mt-4 text-sm text-white/50">Открываем личный кабинет…</p>
        </div>
      </main>
    );
  }

  return children;
}
