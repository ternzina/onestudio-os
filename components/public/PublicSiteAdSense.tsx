"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

type AdSenseRuntimeConfig = {
  enabled: boolean;
  publisherId: string | null;
};

export default function PublicSiteAdSense() {
  const [config, setConfig] = useState<AdSenseRuntimeConfig | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch("/api/public/adsense", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) return;

        const data = (await response.json()) as Partial<AdSenseRuntimeConfig>;
        if (
          data.enabled === true
          && typeof data.publisherId === "string"
          && /^ca-pub-[0-9]{16}$/.test(data.publisherId)
        ) {
          setConfig({
            enabled: true,
            publisherId: data.publisherId,
          });
        }
      } catch {
        // Advertising must never block the public site.
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  if (!config?.enabled || !config.publisherId) return null;

  return (
    <Script
      id="onestudio-adsense-runtime"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.publisherId}`}
    />
  );
}
