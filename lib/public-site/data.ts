import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { PublicSiteData } from "./types";

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

export const getPublicSite = cache(
  async (businessSlug: string, locale?: string | null) => {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase.rpc("get_public_site", {
      p_business_slug: businessSlug,
      p_locale: locale || null,
    });

    if (error || !data || typeof data !== "object") return null;
    return data as unknown as PublicSiteData;
  },
);

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
