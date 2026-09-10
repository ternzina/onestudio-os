import HomePageClient from "./HomePageClient";
import { getLatestGuideArticles } from "@/lib/seo/guide-articles";

export default function Home() {
  return <HomePageClient guideArticles={getLatestGuideArticles(3)} />;
}
