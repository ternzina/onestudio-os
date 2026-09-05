import {
  publicSiteAdSenseScriptAttributes,
  type PublicSiteAdSenseConfig,
} from "@/lib/public-site/adsense";

export default function PublicSiteAdSense({
  config,
}: {
  config: PublicSiteAdSenseConfig;
}) {
  if (!config.enabled || !config.publisherId) return null;

  return (
    <script {...publicSiteAdSenseScriptAttributes(config.publisherId)} />
  );
}
