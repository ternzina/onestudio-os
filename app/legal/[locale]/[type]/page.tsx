import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { legalTypes } from "@/lib/legal/defaults";

export const dynamic = "force-dynamic";

export default async function LegalPublicPage({ params }: { params: Promise<{ locale: string; type: string }> }) {
  const { locale, type } = await params;
  if (!["uk","en"].includes(locale)) notFound();
  const legalType = legalTypes.find((item) => item.slug === type);
  if (!legalType) notFound();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) notFound();
  const client = createClient(url, key, { auth: { persistSession: false } });
  const businessId = "00000000-0000-4000-8000-000000000001";
  const { data, error } = await client.rpc("get_public_legal_page", {
    p_business_id: businessId,
    p_document_type: legalType.key,
    p_locale: locale,
  });
  if (error || !data?.[0]) notFound();
  const doc = data[0] as { title: string; body: string; published_at: string | null };
  const body = doc.body;
  return <main className="min-h-screen bg-[#f5f1e8] px-5 py-12 text-[#1c1c1c]"><article className="mx-auto max-w-4xl rounded-[34px] bg-white p-7 shadow-[0_20px_70px_rgba(20,20,20,.08)] sm:p-12"><div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-black/8 pb-6"><Link href="/" className="font-semibold tracking-[-0.03em]">OneStudio OS</Link><div className="flex gap-2"><Link href={`/legal/uk/${type}`} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${locale==="uk"?"bg-black text-white":"bg-[#eeebe3]"}`}>UA</Link><Link href={`/legal/en/${type}`} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${locale==="en"?"bg-black text-white":"bg-[#eeebe3]"}`}>EN</Link></div></div><h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">{doc.title}</h1><p className="mt-3 text-xs uppercase tracking-[0.15em] text-[#8a7a5a]">Published {doc.published_at ? new Date(doc.published_at).toLocaleDateString(locale==="uk"?"uk-UA":"en-GB") : ""}</p><div className="mt-10 whitespace-pre-wrap text-[15px] leading-7">{body}</div></article></main>;
}
