import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { PublicSiteData } from "./types";

export type PublicSiteSeoPath = {
  business_slug: string;
  locale: string;
  is_primary: boolean;
  updated_at: string;
  custom_domain: string | null;
  seo_no_index: boolean;
};

function createPublicSupabaseClient() {
  const { url, key } = getSupabaseConfig();

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

async function fetchPublicSite(
  businessSlug: string,
  locale?: string | null,
) {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.rpc("get_public_site", {
    p_business_slug: businessSlug,
    p_locale: locale || null,
  });

  if (error || !data || typeof data !== "object") return null;
  return data as unknown as PublicSiteData;
}

export const getPublicSite = cache(fetchPublicSite);

// A sitemap is a dynamic published-content index. It must not retain a stale
// React request-cache entry after a site's locale content changes.
export const getFreshPublicSite = fetchPublicSite;

export async function listPublicSitePaths() {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.rpc("list_public_site_paths");

  if (error) return [];
  return (data ?? []) as Array<{
    business_slug: string;
    locale: string;
    is_primary: boolean;
    updated_at: string;
  }>;
}

export async function listPublicSiteSeoPaths(
  businessSlug?: string | null,
): Promise<PublicSiteSeoPath[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.rpc(
    "list_public_site_seo_paths",
    {
      p_business_slug: businessSlug || null,
    },
  );

  if (error) return [];
  return (data ?? []) as PublicSiteSeoPath[];
}
