import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PublicBookingContext } from "@/lib/modules/contracts";
import PublicBookingClient from "./PublicBookingClient";

type PublicBookingPageProps = {
  params: Promise<{ businessSlug: string }>;
};

export default async function PublicBookingPage({ params }: PublicBookingPageProps) {
  const { businessSlug } = await params;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("get_public_booking_context", {
    p_business_slug: businessSlug,
  });

  if (error || !data || typeof data !== "object") notFound();

  return <PublicBookingClient initialContext={data as unknown as PublicBookingContext} />;
}
