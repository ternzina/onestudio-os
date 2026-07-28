import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import PublicRequestClient from "./PublicRequestClient";

type Props = {
  params: Promise<{ businessSlug: string }>;
  searchParams: Promise<{ subject?: string | string[] }>;
};

export default async function PublicRequestPage({ params, searchParams }: Props) {
  const { businessSlug } = await params;
  const rawSubject = (await searchParams).subject;
  const initialSubject = (Array.isArray(rawSubject) ? rawSubject[0] : rawSubject)
    ?.trim()
    .slice(0, 160) ?? "";
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("get_public_request_context", {
    p_business_slug: businessSlug,
  });

  if (error || !data || typeof data !== "object") notFound();
  return (
    <PublicRequestClient
      context={data as { business: { slug: string; name: string; default_locale: string } }}
      initialSubject={initialSubject}
    />
  );
}
