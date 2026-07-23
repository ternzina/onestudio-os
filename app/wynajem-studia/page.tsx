import RentalPageClient from "./RentalPageClient";
import { getRentalPageData } from "@/lib/public-site-data";

export default async function WynajemStudiaPage() {
  const initialData = await getRentalPageData();

  return <RentalPageClient {...initialData} />;
}
