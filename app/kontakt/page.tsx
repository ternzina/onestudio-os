import ContactPageClient from "./ContactPageClient";
import { getContactPageData } from "@/lib/public-site-data";

export const revalidate = 60;

export default async function ContactPage() {
  const contacts = await getContactPageData();
  return <ContactPageClient contacts={contacts} />;
}
