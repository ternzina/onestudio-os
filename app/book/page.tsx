import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function PublicBookingEntryPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("businesses")
    .select("slug")
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(2);

  if (data?.length === 1) redirect(`/book/${data[0].slug}`);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f1ea] px-5 py-12 text-[#191b20]">
      <section className="w-full max-w-xl rounded-[36px] border border-black/8 bg-white p-8 text-center shadow-[0_30px_100px_rgba(25,25,25,0.12)] sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a742e]">OneStudio OS</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Booking link required</h1>
        <p className="mt-5 text-sm leading-7 text-[#716d65]">Open the booking link provided by the business. Each workspace has its own stable address.</p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-[#17191f] px-6 py-3.5 text-sm font-semibold text-white">Back to OneStudio OS</Link>
      </section>
    </main>
  );
}
