import { createClient } from "@supabase/supabase-js";
import { hostnameWithoutPort } from "../domains/normalize.ts";
import { getSupabaseConfig } from "../supabase/config.ts";

export type PublicSiteAdSenseConfig = {
  enabled: boolean;
  publisherId: string | null;
};

type AdSenseResolverRecord = {
  enabled?: unknown;
  publisher_id?: unknown;
};

const PUBLISHER_ID_PATTERN = /^ca-pub-[0-9]{16}$/;

export function publicSiteAdSenseConfig(
  record: AdSenseResolverRecord | null | undefined,
): PublicSiteAdSenseConfig {
  const publisherId =
    typeof record?.publisher_id === "string"
    && PUBLISHER_ID_PATTERN.test(record.publisher_id)
      ? record.publisher_id
      : null;

  return {
    enabled: record?.enabled === true && Boolean(publisherId),
    publisherId,
  };
}

export function publicSiteAdSenseScriptSrc(publisherId: string) {
  return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
}

export function publicSiteAdSenseScriptAttributes(publisherId: string) {
  return {
    async: true,
    src: publicSiteAdSenseScriptSrc(publisherId),
    crossOrigin: "anonymous" as const,
  };
}

export async function resolvePublicSiteAdSense(
  hostname: string,
): Promise<PublicSiteAdSenseConfig> {
  const domain = hostnameWithoutPort(hostname.split(",")[0]?.trim() || "");
  if (!domain) return { enabled: false, publisherId: null };

  const { url, key } = getSupabaseConfig();
  const supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.rpc("resolve_public_site_adsense", {
    p_domain: domain,
  });

  return !error && data && typeof data === "object"
    ? publicSiteAdSenseConfig(data as AdSenseResolverRecord)
    : { enabled: false, publisherId: null };
}
