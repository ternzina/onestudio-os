"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BackToDashboardButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (active) setVisible(Boolean(data.session));
    });

    return () => {
      active = false;
    };
  }, []);

  if (!visible) return null;

  return (
    <Link
      href="/dashboard"
      className="fixed bottom-5 left-5 z-50 inline-flex min-h-12 items-center gap-3 rounded-full border border-white/20 bg-[#191b20]/95 px-5 text-xs font-semibold text-white shadow-[0_18px_55px_rgba(0,0,0,0.28)] backdrop-blur"
    >
      <span aria-hidden="true">←</span>
      Вернуться в личный кабинет
    </Link>
  );
}
