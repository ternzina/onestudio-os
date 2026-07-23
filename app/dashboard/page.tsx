"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = { name: string | null; email: string | null; phone: string | null; role: string | null };

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: profileData } = await supabase
        .from("profiles")
        .select("name,email,phone,role")
        .eq("id", data.user.id)
        .maybeSingle();
      setProfile(profileData);
    });
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-[#0b0d12] px-5 py-12 text-[#f7f5ef]">
      <section className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">OneStudio OS</Link>
          <button type="button" onClick={logout} className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold">Sign out</button>
        </div>

        <div className="mt-10 rounded-[36px] border border-white/10 bg-white/[0.06] p-7 sm:p-10">
          <p className="text-xs uppercase tracking-[0.22em] text-[#d8b36a]">Account foundation</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            {profile?.name ? `Hello, ${profile.name}.` : "Your account is ready."}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#b9b5ab]">
            The client area is intentionally neutral. Booking history, galleries and payments will be connected only after their universal data contracts are complete.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Detail label="Email" value={profile?.email || "Loading..."} />
            <Detail label="Phone" value={profile?.phone || "Not provided"} />
            <Detail label="Role" value={profile?.role || "client"} />
          </div>

          {profile?.role === "admin" && (
            <Link href="/admin" className="mt-7 inline-flex rounded-full bg-[#f7f5ef] px-6 py-3 text-sm font-semibold text-[#0b0d12]">
              Open administration
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-[#8f8b82]">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold">{value}</p>
    </div>
  );
}
