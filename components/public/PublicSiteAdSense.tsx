"use client";

import { useEffect } from "react";

type AdSenseRuntimeConfig = {
  enabled: boolean;
  publisherId: string | null;
};

const SCRIPT_ID = "onestudio-adsense-runtime";

export default function PublicSiteAdSense() {
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
          data.enabled !== true ||
          typeof data.publisherId !== "string" ||
          !/^ca-pub-[0-9]{16}$/.test(data.publisherId)
        ) {
          return;
        }

        if (document.getElementById(SCRIPT_ID)) return;

        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.async = true;
        script.crossOrigin = "anonymous";
        script.src =
          `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${data.publisherId}`;

        document.head.appendChild(script);
      } catch {
        // Ошибка рекламы не должна мешать работе публичного сайта.
      }
    }

    void load();

    return () => controller.abort();
  }, []);

  return null;
}
