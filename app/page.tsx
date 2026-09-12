import HomePageClient from "./HomePageClient";
import { platformMarketingLocale } from "@/lib/i18n/config";
import { listPublishedGuideArticleSummaries } from "@/lib/guides/repository";

export const dynamic = "force-dynamic";

export default async function Home() {
  const guideArticles = await listPublishedGuideArticleSummaries(platformMarketingLocale);
  return <HomePageClient guideArticles={guideArticles.slice(0, 3)} />;
}
