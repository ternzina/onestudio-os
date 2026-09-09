import type { ReactNode } from "react";
import PublicSiteAnalyticsTracker from "@/components/public/PublicSiteAnalyticsTracker";

export default async function PublicSiteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{
    businessSlug: string;
  }>;
}) {
  const { businessSlug } = await params;

  return (
    <>
      <PublicSiteAnalyticsTracker
        businessSlug={businessSlug}
      />
      {children}
    </>
  );
}
