import type { Metadata } from "next";
import LoanWorksheet from "../../../components/LoanWorksheet";
import { readSite } from "../../../lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const site = readSite();
  if (site.templateId !== "cashpath") return { title: "Not found", robots: { index: false, follow: false } };
  return {
    title: { absolute: "Personal Loan Comparison Worksheet | CashPath" },
    description: "Compare up to three written personal loan offers. Entries stay in the browser and are not submitted.",
    alternates: { canonical: "/p/loan-comparison-worksheet" },
    robots: site.noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export default function Page() {
  const site = readSite();
  if (site.templateId !== "cashpath") return <main className="generic"><p>This export has no worksheet.</p></main>;
  return <LoanWorksheet />;
}
