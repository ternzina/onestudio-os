import type { Metadata } from "next";
import GuidesHub from "../../../components/GuidesHub";
import { readSite } from "../../../lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const site = readSite();
  if (site.templateId !== "cashpath") return { title: "Not found", robots: { index: false, follow: false } };
  return {
    title: { absolute: "Personal Loan Guides & Financial Education | CashPath" },
    description: "Educational personal loan guides from CashPath.",
    alternates: { canonical: "/p/guides" },
    robots: site.noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export default function Page() {
  const site = readSite();
  if (site.templateId !== "cashpath") return <main className="generic"><p>This export has no guide library.</p></main>;
  return <GuidesHub />;
}
