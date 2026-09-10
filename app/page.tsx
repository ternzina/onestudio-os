import HomePageClient from "./HomePageClient";
import { getLatestJournalArticles } from "@/lib/seo/journal-articles";

export default function Home() {
  return <HomePageClient journalArticles={getLatestJournalArticles(3)} />;
}
