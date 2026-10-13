import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CashPathLoanWorksheet from "@/components/public/cashpath/CashPathLoanWorksheet";
import { getPublicSite } from "@/lib/public-site/data";
import { getPublicSiteRequestContext } from "@/lib/public-site/request-context";
import { CASH_PATH_LOAN_WORKSHEET_PATH } from "@/lib/public-site/cashpath-loan-worksheet";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ businessSlug: string }>;
};

const CANONICAL = "https://cashpath.org" + CASH_PATH_LOAN_WORKSHEET_PATH;

async function isCashPathWorkspace(businessSlug: string): Promise<boolean> {
  if (businessSlug !== "cashpath-909c00c9") return false;
  const site = await getPublicSite(businessSlug);
  return site?.content.template_id === "cashpath" &&
    site.content.seo_no_index !== true;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { businessSlug } = await params;
  if (!(await isCashPathWorkspace(businessSlug))) {
    return { title: "Page not found", robots: { index: false, follow: false } };
  }

  const title = "Free Personal Loan Comparison Worksheet | CashPath";
  const description =
    "Compare up to three written personal loan offers for free. Organize APR, net proceeds, fees, payments, and repayment terms, then print or save as PDF.";
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: CANONICAL },
    openGraph: {
      type: "website",
      url: CANONICAL,
      siteName: "CashPath",
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function LoanComparisonWorksheetPage({ params }: PageProps) {
  const { businessSlug } = await params;
  const [allowed, context] = await Promise.all([
    isCashPathWorkspace(businessSlug),
    getPublicSiteRequestContext(),
  ]);
  if (!allowed) notFound();
  return (
    <CashPathLoanWorksheet
      basePath={context.cleanUrls ? "/" : "/site/" + businessSlug}
    />
  );
}
