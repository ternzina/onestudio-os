import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PublicBookingContext } from "@/lib/modules/contracts";
import { getPublicSite } from "@/lib/public-site/data";
import { publicSitePath } from "@/lib/public-site/metadata";
import PublicBookingClient from "./PublicBookingClient";

type PublicBookingPageProps = {
  params: Promise<{ businessSlug: string }>;
  searchParams: Promise<{
    service?: string | string[];
    date?: string | string[];
  }>;
};

export default async function PublicBookingPage({
  params,
  searchParams,
}: PublicBookingPageProps) {
  const { businessSlug } = await params;
  const query = await searchParams;
  const supabase = await createServerSupabaseClient();
  const [{ data, error }, publicSite] = await Promise.all([
    supabase.rpc("get_public_booking_context", {
      p_business_slug: businessSlug,
    }),
    getPublicSite(businessSlug),
  ]);

  if (error || !data || typeof data !== "object") notFound();

  const service = Array.isArray(query.service) ? query.service[0] : query.service;
  const requestedDate = Array.isArray(query.date) ? query.date[0] : query.date;
  const date =
    requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)
      ? requestedDate
      : undefined;
  const branding = publicSite
    ? {
        brandName:
          publicSite.content.brand_name ||
          publicSite.company.display_name ||
          publicSite.business.name,
        accent: publicSite.content.theme_accent || "#9a742e",
        dark: publicSite.content.theme_dark || "#17191f",
        surface: publicSite.content.theme_surface || "#f4f1ea",
        homeHref: publicSitePath(publicSite.business.slug),
      }
    : null;

  return (
    <PublicBookingClient
      initialContext={data as unknown as PublicBookingContext}
      initialServiceSlug={service}
      initialDate={date}
      branding={branding}
    />
  );
}
