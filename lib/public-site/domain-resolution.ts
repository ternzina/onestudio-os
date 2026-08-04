import { createClient } from "@supabase/supabase-js";
import {
  hostnameWithoutPort,
  isPlatformHostname,
} from "@/lib/domains/normalize";
import { getSupabaseConfig } from "@/lib/supabase/config";

export type PublicSiteDomainResolution = {
  business_id: string;
  business_slug: string;
  primary_locale: string;
};

type HeaderReader = {
  get(name: string): string | null;
};

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || "";
}

export function requestHostname(headerStore: HeaderReader) {
  return hostnameWithoutPort(
    firstHeaderValue(headerStore.get("x-forwarded-host")) ||
      firstHeaderValue(headerStore.get("host")),
  );
}

export function requestProtocol(headerStore: HeaderReader) {
  const forwarded = firstHeaderValue(headerStore.get("x-forwarded-proto"));
  return forwarded === "http" ? "http" : "https";
}

export function requestOrigin(headerStore: HeaderReader) {
  const hostname = requestHostname(headerStore);
  return hostname
    ? `${requestProtocol(headerStore)}://${hostname}`
    : null;
}

export async function resolvePublicSiteDomain(
  hostname: string,
): Promise<PublicSiteDomainResolution | null> {
  const normalized = hostnameWithoutPort(hostname);
  if (!normalized || isPlatformHostname(normalized)) return null;

  const { url, key } = getSupabaseConfig();
  const supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.rpc("resolve_public_site_domain", {
    p_domain: normalized,
  });

  if (error || !Array.isArray(data) || !data[0]) return null;
  return data[0] as PublicSiteDomainResolution;
}
