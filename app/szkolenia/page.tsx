import LearningPageClient from "./LearningPageClient";
import { getLearningPageData } from "@/lib/public-site-data";

export const revalidate = 60;

export default async function LearningPage() {
  const data = await getLearningPageData();
  return <LearningPageClient {...data} />;
}
